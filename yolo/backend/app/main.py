from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path
import logging

import cv2
import numpy as np
from fastapi import Depends, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import ALLOWED_ORIGINS, OUTPUTS_DIR, UPLOADS_DIR
from .auth import require_admin
from .db import engine, get_db
from .models import Base, MonitoringRun
from .scoring import compute_cleanliness_score
from .schemas import DetectResponse, HistoryResponse
from .yolo_infer import service as yolo_service


Base.metadata.create_all(bind=engine)

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("waste-monitoring")

app = FastAPI(title="Smart Waste Monitoring API", version="1.0.0")

@app.on_event("startup")
def _startup_log() -> None:
    logger.info("Smart Waste Monitoring API starting up")
    logger.info("Uploads dir: %s", UPLOADS_DIR)
    logger.info("Outputs dir: %s", OUTPUTS_DIR)
    try:
        yolo_service._ensure_loaded()
        logger.info("YOLO model ready: %s", yolo_service.model_path)
    except Exception as e:
        logger.warning("YOLO model not ready at startup: %s", str(e))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^http://(localhost|127\\.0\\.0\\.1):\\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose static files for viewing images in the dashboard
app.mount("/files/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/files/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")


def _status_color(status: str) -> str:
    if status == "Clean":
        return "green"
    if status == "Moderate":
        return "yellow"
    return "red"


@app.get("/api/health")
def health() -> JSONResponse:
    try:
        loaded = False
        model_path = ""
        try:
            yolo_service._ensure_loaded()  # best-effort warmup
            loaded = True
            model_path = yolo_service.model_path
        except Exception:
            loaded = False
            model_path = yolo_service.model_path
        return JSONResponse({"status": "healthy", "modelLoaded": loaded, "modelPath": model_path})
    except Exception as e:
        return JSONResponse({"status": "unhealthy", "error": str(e)}, status_code=500)


@app.post("/api/detect", response_model=DetectResponse)
async def detect(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: None = Depends(require_admin),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        return JSONResponse({"success": False, "error": "Please upload an image."}, status_code=400)

    raw = await image.read()
    if not raw:
        return JSONResponse({"success": False, "error": "Empty file."}, status_code=400)

    npbuf = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(npbuf, cv2.IMREAD_COLOR)
    if img is None:
        return JSONResponse({"success": False, "error": "Could not decode image."}, status_code=400)

    run_id = uuid.uuid4().hex
    upload_name = f"{run_id}_{image.filename or 'upload'}.jpg"
    output_name = f"{run_id}_annotated.jpg"

    upload_path = (UPLOADS_DIR / upload_name).resolve()
    output_path = (OUTPUTS_DIR / output_name).resolve()

    # Persist upload as JPEG for consistency
    cv2.imwrite(str(upload_path), img)
    logger.info("Saved upload: %s", upload_path)

    try:
        annotated, summary = yolo_service.detect_and_annotate(img)
        cv2.imwrite(str(output_path), annotated)
        logger.info("Saved output: %s", output_path)
    except FileNotFoundError as e:
        return JSONResponse(
            {
                "success": False,
                "error": str(e),
                "hint": "Set YOLO_WEIGHTS (e.g. yolov8n.pt or models/best.pt) and restart the backend.",
            },
            status_code=400,
        )
    except Exception as e:
        logger.exception("Detection failed")
        return JSONResponse({"success": False, "error": f"Detection failed: {str(e)}"}, status_code=500)

    counts = summary.counts or {}
    waste_count = int(counts.get("waste", 0))
    garbage_pile_count = int(counts.get("garbage_piles", 0))
    litter_count = int(counts.get("litter", 0))
    human_count = int(counts.get("humans", 0))
    dustbin_count = int(counts.get("dustbins", 0))
    vehicle_count = int(counts.get("vehicles", 0))

    cleanliness = compute_cleanliness_score(
        waste_count=waste_count,
        garbage_pile_count=garbage_pile_count,
        litter_count=litter_count,
        human_count=human_count,
        vehicle_count=vehicle_count,
        dustbin_count=dustbin_count,
    )

    total_waste = waste_count + garbage_pile_count + litter_count

    row = MonitoringRun(
        upload_filename=upload_name,
        upload_path=str(upload_path),
        output_filename=output_name,
        output_path=str(output_path),
        model_path=yolo_service.model_path or "",
        counts=counts,
        cleanliness_score=cleanliness.score,
        status=cleanliness.status,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return DetectResponse(
        id=row.id,
        createdAt=row.created_at,
        uploadUrl=f"/files/uploads/{upload_name}",
        outputUrl=f"/files/outputs/{output_name}",
        counts=counts,
        totalWasteCount=total_waste,
        humanCount=human_count,
        cleanlinessScore=cleanliness.score,
        status=cleanliness.status,
        statusColor=_status_color(cleanliness.status),
        detections=summary.detections,
    )


@app.get("/api/history", response_model=HistoryResponse)
def history(
    limit: int = 20,
    db: Session = Depends(get_db),
    _admin: None = Depends(require_admin),
):
    limit = max(1, min(int(limit), 100))
    rows = db.query(MonitoringRun).order_by(MonitoringRun.id.desc()).limit(limit).all()
    items = []
    for r in rows:
        items.append(
            {
                "id": r.id,
                "createdAt": r.created_at,
                "outputUrl": f"/files/outputs/{r.output_filename}",
                "cleanlinessScore": r.cleanliness_score,
                "status": r.status,
                "statusColor": _status_color(r.status),
                "counts": r.counts,
            }
        )
    return {"items": items}
