# Smart Waste Monitoring (Admin Dashboard)

Admin-only waste monitoring dashboard that runs YOLOv8 inference on uploaded area images (CCTV/drone/street camera), draws bounding boxes, computes cleanliness metrics, saves annotated outputs, and keeps monitoring history.

This module is self-contained under `yolo/`:

- `backend/` FastAPI + Ultralytics YOLOv8 + OpenCV + SQLite
- `frontend/` React + Tailwind admin UI
- `models/` put your custom YOLOv8 weights here (e.g. `best.pt`)
- `uploads/` raw uploaded images (auto-created)
- `outputs/` annotated images (auto-created)

## Backend setup (FastAPI)

```powershell
cd .\yolo\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# By default, backend loads `yolov8n.pt` (Ultralytics downloads on first use).
# To use your custom model, put it in `yolo/models/` and set:
#   $env:YOLO_WEIGHTS="models/best.pt"
$env:YOLO_WEIGHTS="yolov8n.pt"
$env:ADMIN_API_KEY="change-me"   # optional but recommended (admin-only guard)
python -m uvicorn app.main:app --reload
```

Backend will expose:

- `POST /api/detect` (multipart form field `image`)
- `GET /api/history?limit=20`
- `GET /api/health`
- static files: `GET /files/uploads/...` and `GET /files/outputs/...`

### Example API usage (curl)

```bash
curl -X POST "http://127.0.0.1:8002/api/detect" ^
  -H "accept: application/json" ^
  -F "image=@area.jpg"
```

## Frontend setup (React + Tailwind)

```powershell
cd .\yolo\frontend
npm install
npm run dev
```

Create `yolo/frontend/.env` (optional):

```bash
VITE_ADMIN_API_BASE_URL=http://127.0.0.1:8000
VITE_ADMIN_API_KEY=change-me
```

Open the dashboard and upload an image to run detection.

## Common “not running” issue (CORS)

The YOLO admin frontend runs on port `5174` by default (`yolo/frontend/vite.config.js`), so the backend must allow CORS from `http://localhost:5174`.
This is already configured in `yolo/backend/app/config.py`.

## React integration (fetch)

The dashboard uses:

- `yolo/frontend/src/lib/api.js` -> `detectImage(file)` -> `POST /api/detect`
- `yolo/frontend/src/lib/api.js` -> `getHistory()` -> `GET /api/history`

## YOLOv8 classes

Your custom model should be trained to detect these classes (names can vary; mapping is based on label text):

- waste
- garbage pile(s)
- litter
- humans / person
- dustbins / trash can
- vehicles / car / bike / truck

## Cleanliness metrics (heuristic)

The backend computes:

- `totalWasteCount` = waste + garbage_pile + litter (best-effort label mapping)
- `humanCount`
- `cleanlinessScore` (0–100)
- `status`: `Clean` / `Moderate` / `Dirty`

Tune scoring thresholds in `yolo/backend/app/scoring.py`.

## If `yolov8n.pt` can’t download

If your machine has restricted internet access, download `yolov8n.pt` on a machine with internet and copy it into `yolo/models/`, then set:

```powershell
$env:YOLO_WEIGHTS="models/yolov8n.pt"
```

## Future-ready architecture

Code is structured to support future additions:

- live CCTV ingestion (RTSP/WebRTC) as a background worker
- heatmap tiles from detections over time
- municipal alerts based on thresholds and geo areas
- dashboards & analytics (time series, per-zone stats)
