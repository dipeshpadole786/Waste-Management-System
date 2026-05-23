from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np
from ultralytics import YOLO

from .config import MODELS_DIR, YOLO_WEIGHTS


def _normalize_label(label: str) -> str:
    return (label or "").strip().lower().replace("-", " ").replace("_", " ")


def _map_category(label: str) -> str:
    """
    Maps YOLO labels into your dashboard categories
    """

    l = _normalize_label(label)

    if not l:
        return "other"

    # Humans
    if l in {"person", "human", "people", "man", "woman"}:
        return "humans"

    # Dustbins
    if "bin" in l or "trash can" in l or "dustbin" in l:
        return "dustbins"

    # Vehicles
    if l in {"car", "truck", "bus", "bike", "motorbike", "scooter"}:
        return "vehicles"

    # Waste related
    if l in {"bottle", "cup", "banana", "apple"}:
        return "waste"

    return "other"


@dataclass
class DetectionSummary:
    counts: Dict[str, int]
    detections: List[dict]


class YoloService:
    def __init__(self) -> None:
        self._model = None
        self._model_path = None

    @property
    def model_path(self) -> str:
        return str(self._model_path) if self._model_path else ""

    def load(self) -> None:
        """
        Loads YOLO model.

        - If `YOLO_WEIGHTS` is a local path (or exists under `yolo/models/`), it loads that.
        - Otherwise it loads by name (e.g. "yolov8n.pt"), which Ultralytics downloads on first use.
        """
        weights = (YOLO_WEIGHTS or "yolov8n.pt").strip()
        local_candidate = Path(weights)

        if not local_candidate.is_absolute() and (MODELS_DIR / local_candidate).exists():
            local_candidate = (MODELS_DIR / local_candidate).resolve()

        if local_candidate.is_absolute() and local_candidate.exists():
            self._model = YOLO(str(local_candidate))
            self._model_path = str(local_candidate)
            return

        # Treat as a model name; Ultralytics will resolve/download.
        self._model = YOLO(weights)
        self._model_path = weights

    def _ensure_loaded(self) -> None:
        if self._model is None:
            self.load()

    def detect_and_annotate(
        self,
        image_bgr: np.ndarray
    ) -> Tuple[np.ndarray, DetectionSummary]:

        self._ensure_loaded()

        assert self._model is not None

        results = self._model.predict(
            source=image_bgr,
            verbose=False
        )

        if not results:
            return image_bgr, DetectionSummary(
                counts={},
                detections=[]
            )

        r0 = results[0]

        names = getattr(r0, "names", {}) or {}

        counts = {
            "waste": 0,
            "humans": 0,
            "dustbins": 0,
            "vehicles": 0,
            "other": 0,
        }

        detections: List[dict] = []

        annotated = image_bgr.copy()

        boxes = getattr(r0, "boxes", None)

        if boxes is None:
            return annotated, DetectionSummary(
                counts=counts,
                detections=detections
            )

        for b in boxes:

            cls_id = int(b.cls.item())
            conf = float(b.conf.item())

            xyxy = b.xyxy[0].cpu().numpy().astype(int)

            x1, y1, x2, y2 = map(int, xyxy.tolist())

            label = str(names.get(cls_id, cls_id))

            category = _map_category(label)

            counts[category] += 1

            detections.append(
                {
                    "label": label,
                    "category": category,
                    "confidence": round(conf, 4),
                    "box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                    },
                }
            )

            # Box Colors
            color = (255, 255, 255)

            if category == "waste":
                color = (0, 0, 255)  # Red

            elif category == "humans":
                color = (0, 165, 255)  # Orange

            elif category in {"dustbins", "vehicles"}:
                color = (0, 255, 0)  # Green

            # Draw Rectangle
            cv2.rectangle(
                annotated,
                (x1, y1),
                (x2, y2),
                color,
                2
            )

            # Label Text
            text = f"{label} {conf*100:.1f}%"

            (tw, th), baseline = cv2.getTextSize(
                text,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                2
            )

            cv2.rectangle(
                annotated,
                (x1, max(0, y1 - th - baseline - 6)),
                (x1 + tw + 6, y1),
                color,
                -1
            )

            cv2.putText(
                annotated,
                text,
                (x1 + 3, y1 - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

        return annotated, DetectionSummary(
            counts=counts,
            detections=detections
        )


# Global service instance
service = YoloService()
