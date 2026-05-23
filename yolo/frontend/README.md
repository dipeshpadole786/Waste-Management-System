# Frontend (React + Tailwind Admin Dashboard)

## Run

```powershell
cd .\yolo\frontend
npm install
npm run dev
```

Optional env:

Create `yolo/frontend/.env`:

```bash
VITE_ADMIN_API_BASE_URL=http://127.0.0.1:8000
VITE_ADMIN_API_KEY=change-me
```

## What it shows

- Upload image for detection
- Annotated output image (bounding boxes)
- Cleanliness score + status color indicator
- Waste analytics and recent monitoring history
