from __future__ import annotations

import os
from pathlib import Path


YOLO_ROOT = Path(__file__).resolve().parents[2]  # .../yolo

MODELS_DIR = YOLO_ROOT / "models"
UPLOADS_DIR = YOLO_ROOT / "uploads"
OUTPUTS_DIR = YOLO_ROOT / "outputs"

DB_PATH = os.getenv("DB_PATH", str(YOLO_ROOT / "backend" / "waste_monitoring.sqlite3"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Default to the standard Ultralytics model name; Ultralytics will download it on first use.
# You can also point to a local path like "models/best.pt".
YOLO_WEIGHTS = os.getenv("YOLO_WEIGHTS", "yolov8n.pt")

API_HOST = os.getenv("HOST", "127.0.0.1")
API_PORT = int(os.getenv("PORT", "8002"))

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
