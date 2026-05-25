# Waste Management System - Complete Startup Guide

This guide will help you run the entire Waste Management System with WasteBot integration.

## Prerequisites

- **Node.js 18+** - Download from https://nodejs.org/
- **Python 3.9+** - Download from https://www.python.org/
- **MongoDB** - Running locally (default: mongodb://localhost:27017)
- **Groq API Key** - Get free key from https://console.groq.com/keys

## System Architecture

```
┌─────────────────┐
│   Frontend      │ (React/Vite) - Port 5173
│   + WasteBot    │ (Draggable Widget)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │ (Node.js/Express) - Port 3000
│  + WasteBot     │ (Proxy routes)
│    Proxy        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WasteBot API   │ (Python/FastAPI) - Port 8001
│  Server         │ (RAG Chatbot)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Groq LLM       │ (API-based)
│  + RAG Docs     │
└─────────────────┘
```

## Step-by-Step Startup (Recommended: Use 5 Terminals)

### Terminal 1: MongoDB
```bash
# Start MongoDB (if not running as a service)
mongod
```
Expected: `waiting for connections on port 27017`

---

### Terminal 2: Backend Server
```bash
cd Backend
npm install
npm start
```
Expected: `Server is running on port 3000`

---

### Terminal 3: WasteBot Server
```bash
cd WasteBot

# First time setup
pip install -r requirements.txt
cp .env.example .env

# Edit .env and add your Groq API key
# GROQ_API_KEY=your_key_here

# Start the server
python main.py --server --warmup
```
Expected: `Application startup complete`

---

### Terminal 4: Frontend Dev Server
```bash
cd Frontend
npm install
npm run dev
```
Expected: `VITE v5.x.x ready in xxx ms`
Visit: `http://localhost:5173`

---

### Terminal 5: (Optional) Additional Tools
```bash
# For viewing MongoDB data:
mongosh

# For API testing:
# Use Postman or similar to test endpoints
```

---

## First Run Checklist

- [ ] MongoDB running on port 27017
- [ ] Backend running on port 3000 with message "Server is running on port 3000"
- [ ] WasteBot running on port 8001 with message "Application startup complete"
- [ ] Frontend running on port 5173 with Vite ready message
- [ ] Frontend opens in browser without errors
- [ ] `.env` file created in WasteBot with valid `GROQ_API_KEY`

## Quick Test: WasteBot Chat

1. Open http://localhost:5173 in browser
2. Look for **WasteBot** button in bottom-right corner
3. Click to open the chat widget
4. Try typing: "How do I segregate waste?"
5. Should see a response about waste segregation

## Common Issues & Solutions

### "Backend is not reachable on port 3000"
```bash
# Check if port 3000 is in use
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Kill the process or use a different port
```

### "WasteBot is not available"
1. Check if WasteBot server is running (port 8001)
2. Check if `GROQ_API_KEY` is set in `.env`
3. Verify internet connection (Groq API is cloud-based)

### "ECONNREFUSED: 127.0.0.1:27017" (MongoDB)
```bash
# Install MongoDB locally or connect to remote instance
# Verify in Backend/.env or hardcoded in app.js
```

### "ImportError: No module named 'langchain'"
```bash
cd WasteBot
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### .env file not loading in WasteBot
```bash
# Ensure file is named exactly: .env (not .env.txt or .env.example)
# And is in the WasteBot/ directory
```

## Environment Files

### Backend/.env (Optional)
```
PORT=3000
GROQ_API_KEY=your_key # if using additional features
CORS_ORIGINS=http://localhost:5173
```

### WasteBot/.env (Required)
```
GROQ_API_KEY=your_actual_groq_api_key
WASTEBOT_PORT=8001
WASTEBOT_WARMUP=1
WASTEBOT_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend/.env (Optional)
```
VITE_API_BASE_URL=http://localhost:3000
```

## Testing the APIs Manually

### Test Health Check
```bash
# Backend proxy
curl http://localhost:3000/wastebot/health

# Response:
# {"status":"ok"}
```

### Test Chat API
```bash
# Backend proxy
curl -X POST http://localhost:3000/wastebot/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I compost?"}'

# Response:
# {"answer":"...","sources":[...]}
```

## Stopping Services

Press `Ctrl+C` in each terminal to stop the services gracefully.

Order of stopping (recommended):
1. Frontend (least critical)
2. WasteBot (RAG pipeline cleanup)
3. Backend (routes cleanup)
4. MongoDB (data integrity)

## Performance Tips

- **WasteBot warmup**: Takes 30-60s on first run. Subsequent runs are cached.
- **Cold start**: First chat query may take 10-15s (LLM cold start)
- **Groq rate limits**: Free tier has usage limits. Monitor your usage at https://console.groq.com/

## Next Steps

1. **Add your documents**: Place PDFs/text files in `WasteBot/data/` for better RAG results
2. **Customize UI**: Modify WasteBotWidget styling in `Frontend/src/Componets/WasteBotWidget.css`
3. **Add logging**: Enable detailed logging in `WasteBot/main.py`
4. **Deploy**: See production deployment guide in `WASTEBOT_SETUP.md`

## Support Resources

- **WasteBot Details**: See `WASTEBOT_SETUP.md`
- **Frontend Issues**: Check `Frontend/README.md`
- **Backend Issues**: Check `Backend/` directory
- **Groq Docs**: https://console.groq.com/docs/
- **LangChain Docs**: https://python.langchain.com/

---

## Quick Commands Reference

```bash
# All-in-one test (from root directory)
# Terminal 1
mongod

# Terminal 2
cd Backend && npm install && npm start

# Terminal 3
cd WasteBot && pip install -r requirements.txt && python main.py --server --warmup

# Terminal 4
cd Frontend && npm install && npm run dev

# Browser
# Open http://localhost:5173 and test WasteBot widget
```

---

**You're all set! Enjoy the Waste Management System with AI-powered WasteBot! ♻️**
