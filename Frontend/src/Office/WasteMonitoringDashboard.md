# Waste Monitoring Dashboard (Monitor Only)

Route: `/waste-monitoring`

This page calls the FastAPI YOLO backend from `yolo/backend`.

## Env vars (Frontend)

Set in `Frontend/.env` (see `Frontend/.env.example`):

- `VITE_YOLO_API_BASE_URL` (default: `http://127.0.0.1:8000`)
- `VITE_YOLO_ADMIN_API_KEY` (optional; must match backend `ADMIN_API_KEY`)

## Backend

Run from `yolo/backend`:

```powershell
uvicorn app.main:app --reload
```

