# WasteBot Integration (Backend + Frontend + WasteBot)

This project has three parts:
- `Backend` (Node/Express, default port `3000`)
- `Frontend` (Vite/React, default port `5173`)
- `WasteBot` (Python RAG assistant, served as an HTTP API on port `8001`)

The integration is done via the backend as a proxy so existing Frontend/Backend functionality stays unchanged:
- Frontend calls `POST http://localhost:3000/wastebot/chat`
- Backend forwards the request to WasteBot at `http://127.0.0.1:8001/chat`

## 1) Start Backend

```bash
cd Backend
npm install
node app.js
```

## 2) Start WasteBot API

Set `GROQ_API_KEY` in `WasteBot/.env`, then:

```bash
cd WasteBot
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api_server.py --port 8001 --warmup
```

## 3) Start Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Config

- Backend env var: `WASTEBOT_URL` (default `http://127.0.0.1:8001`)
  - Example: `set WASTEBOT_URL=http://127.0.0.1:9000`

