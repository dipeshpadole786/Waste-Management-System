# Backend (FastAPI + YOLOv8)

## Run

```powershell
cd .\yolo\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Default model is `yolov8n.pt` (Ultralytics downloads on first use).
# To use custom weights, put them in `yolo/models/` and set `YOLO_WEIGHTS=models/best.pt`.
$env:YOLO_WEIGHTS="yolov8n.pt"
$env:ADMIN_API_KEY="change-me"   # optional but recommended
python -m uvicorn app.main:app --reload
```

## API

- `GET /api/health`
- `POST /api/detect` (form-data `image`)
- `GET /api/history?limit=20`
- `GET /files/uploads/...`
- `GET /files/outputs/...`

## Notes

- The model is lazy-loaded on first inference/health check.
- Label mapping into required categories is best-effort in `app/yolo_infer.py`.
- Cleanliness scoring is a heuristic in `app/scoring.py`—tune it for your city.
