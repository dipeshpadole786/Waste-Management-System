# Waste Classifier (Image) Service

This folder contains a small Python API that serves the Hugging Face model `watersplash/waste-classification` for image-based waste classification.

## What it provides

- `GET /api/health` -> health status
- `POST /api/predict` -> classify a single image (`multipart/form-data` with field `image`)
- `POST /api/batch-predict` -> classify multiple images (`multipart/form-data` with repeated field `images`)
- `GET /api/list-models` -> model metadata
- `GET /api/test` -> basic connectivity check

The frontend is wired to call `http://localhost:5000/api` by default, or `VITE_WASTE_CLASSIFIER_API_BASE_URL` if set (see `Frontend/.env.example`).

## Setup (Windows / PowerShell)

```powershell
cd .\wasteClassifier
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 5000
```

## Notes

- The first run downloads the model from Hugging Face and can take time.
- You can change the model via env var:
  - `MODEL_ID=watersplash/waste-classification`
  - `TOP_K=5`
