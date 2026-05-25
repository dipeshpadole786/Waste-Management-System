import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch


MODEL_ID = os.getenv("MODEL_ID", "watersplash/waste-classification")
TOP_K = int(os.getenv("TOP_K", "5"))
HISTORY_MAX = int(os.getenv("HISTORY_MAX", "50"))


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_open_image(file_bytes: bytes) -> Image.Image:
    # PIL may keep file handles; use bytes buffer only.
    from io import BytesIO

    img = Image.open(BytesIO(file_bytes))
    # Ensure RGB for most vision models.
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    if img.mode == "RGBA":
        img = img.convert("RGB")
    return img


def _label_to_disposal(label: str) -> Optional[bool]:
    """
    Best-effort mapping:
    - True => recyclable
    - False => organic
    - None => unknown
    """
    l = (label or "").strip().lower()
    if not l:
        return None

    organic_keywords = {"organic", "food", "compost", "biodegradable", "garden", "wet", "kitchen"}
    recyclable_keywords = {"recycle", "recyclable", "plastic", "paper", "metal", "glass", "cardboard", "can", "tin"}

    if any(k in l for k in organic_keywords):
        return False
    if any(k in l for k in recyclable_keywords):
        return True
    return None


def _topk_from_logits(
    logits: torch.Tensor,
    id2label: Dict[int, str],
    top_k: int,
) -> List[Dict[str, Any]]:
    probs = torch.softmax(logits, dim=-1)[0]
    k = max(1, min(int(top_k), probs.shape[-1]))
    values, indices = torch.topk(probs, k)
    out: List[Dict[str, Any]] = []
    for score, idx in zip(values.tolist(), indices.tolist()):
        label = id2label.get(int(idx), str(idx))
        out.append({"label": label, "score": float(score)})
    return out


class ModelState:
    def __init__(self) -> None:
        self.processor: Optional[AutoImageProcessor] = None
        self.model: Optional[AutoModelForImageClassification] = None
        self.device: str = "cpu"
        self.loaded_model_id: Optional[str] = None

    def load(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor = AutoImageProcessor.from_pretrained(MODEL_ID)
        self.model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
        self.model.to(self.device)
        self.model.eval()
        self.loaded_model_id = MODEL_ID

    def ready(self) -> bool:
        return self.processor is not None and self.model is not None and self.loaded_model_id == MODEL_ID


state = ModelState()

app = FastAPI(title="Waste Classifier API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"^http://(localhost|127\\.0\\.0\\.1):\\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_history: List[Dict[str, Any]] = []


@app.on_event("startup")
def _startup() -> None:
    # Lazy-load on first request would reduce startup time, but frontend does a health check.
    # Load once on startup for predictable UX.
    try:
        state.load()
    except Exception:
        # Keep service up; /api/health will expose error.
        pass


@app.get("/api/health")
def health() -> JSONResponse:
    if state.ready():
        return JSONResponse({"status": "healthy", "model": state.loaded_model_id, "device": state.device})
    return JSONResponse({"status": "unhealthy", "model": MODEL_ID, "device": state.device})


@app.get("/api/test")
def test() -> JSONResponse:
    return JSONResponse({"ok": True, "timestamp": _utc_iso()})


@app.get("/api/list-models")
def list_models() -> JSONResponse:
    return JSONResponse(
        {
            "models": [
                {
                    "id": MODEL_ID,
                    "task": "image-classification",
                    "loaded": state.ready(),
                    "device": state.device,
                }
            ]
        }
    )


def _predict_bytes(image_bytes: bytes) -> Tuple[Dict[str, Any], int]:
    if not state.ready():
        state.load()
    assert state.processor is not None
    assert state.model is not None

    image = _safe_open_image(image_bytes)
    inputs = state.processor(images=image, return_tensors="pt")
    inputs = {k: v.to(state.device) for k, v in inputs.items()}

    start = time.time()
    with torch.no_grad():
        outputs = state.model(**inputs)
    elapsed_ms = int((time.time() - start) * 1000)

    logits = outputs.logits
    topk = _topk_from_logits(logits, state.model.config.id2label, TOP_K)
    best = topk[0]

    label = str(best["label"])
    score = float(best["score"])
    is_recyclable = _label_to_disposal(label)

    payload = {
        "success": True,
        "model": state.loaded_model_id,
        "prediction": label,
        "confidence": int(round(score * 100)),
        "probability": score,
        "isRecyclable": is_recyclable,
        "topK": topk,
        "timestamp": _utc_iso(),
        "latencyMs": elapsed_ms,
    }
    return payload, elapsed_ms


async def _handle_predict(image: UploadFile) -> JSONResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        return JSONResponse({"success": False, "error": "Please upload an image file."}, status_code=400)

    data = await image.read()
    if not data:
        return JSONResponse({"success": False, "error": "Empty file."}, status_code=400)

    try:
        payload, _ = _predict_bytes(data)
        item = {
            "id": int(time.time() * 1000),
            "createdAt": payload.get("timestamp"),
            "outputUrl": None,
            "cleanlinessScore": payload.get("confidence"),
            "status": "OK",
            "statusColor": "green",
            "counts": {},
            "raw": payload,
        }
        _history.insert(0, item)
        del _history[HISTORY_MAX:]
        return JSONResponse(payload)
    except Exception as e:
        return JSONResponse({"success": False, "error": f"Prediction failed: {str(e)}"}, status_code=500)


@app.post("/api/detect")
async def detect(image: UploadFile = File(...)) -> JSONResponse:
    # Compatibility with frontend expecting /api/detect
    return await _handle_predict(image)


@app.post("/api/predict")
async def predict(image: UploadFile = File(...)) -> JSONResponse:
    # Backwards compatibility
    return await _handle_predict(image)


@app.get("/api/history")
def history(limit: int = 20) -> JSONResponse:
    limit = max(1, min(int(limit), 100))
    return JSONResponse({"items": _history[:limit]})


@app.post("/api/batch-predict")
async def batch_predict(images: List[UploadFile] = File(...)) -> JSONResponse:
    if not images:
        return JSONResponse({"success": False, "error": "No images provided."}, status_code=400)

    results: List[Dict[str, Any]] = []
    for f in images:
        if not f.content_type or not f.content_type.startswith("image/"):
            results.append({"success": False, "filename": f.filename, "error": "Not an image"})
            continue
        data = await f.read()
        if not data:
            results.append({"success": False, "filename": f.filename, "error": "Empty file"})
            continue
        try:
            payload, _ = _predict_bytes(data)
            payload["filename"] = f.filename
            results.append(payload)
        except Exception as e:
            results.append({"success": False, "filename": f.filename, "error": str(e)})

    return JSONResponse({"success": True, "count": len(results), "results": results, "timestamp": _utc_iso()})
