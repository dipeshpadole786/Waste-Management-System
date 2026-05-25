# WasteBot Integration Setup Guide

## 🚀 Quick Start

WasteBot is a Python-based RAG (Retrieval Augmented Generation) chatbot that provides waste management guidance. This guide explains how to set it up and integrate it with your Frontend.

## Architecture

```
Frontend (React/Vite)
    ↓
Backend (Node.js/Express) on port 3000
    ↓ [Proxy: /wastebot/chat, /wastebot/health]
    ↓
WasteBot API Server on port 8001
    ↓
RAG Pipeline (LangChain + Groq LLM)
```

## Prerequisites

1. **Python 3.9+** installed on your system
2. **Groq API Key** (free tier available at https://console.groq.com/keys)
3. **Node.js 18+** for the Backend

## Step 1: Install WasteBot Dependencies

```bash
cd WasteBot
pip install -r requirements.txt
```

## Step 2: Configure Environment

1. Create a `.env` file in the `WasteBot/` directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `WasteBot/.env` and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key
   WASTEBOT_PORT=8001
   WASTEBOT_WARMUP=1
   ```

   Get your free Groq API key: https://console.groq.com/keys

## Step 3: Prepare Data

The WasteBot uses documents in `WasteBot/data/` for its RAG pipeline:
- Place waste management PDFs or text files in `WasteBot/data/`
- Existing: `waste_management.txt` contains sample waste management guidelines

## Step 4: Start Services

### Terminal 1: Start the Backend (Node.js)
```bash
cd Backend
npm install  # if not done
npm start    # starts on port 3000
```

### Terminal 2: Start WasteBot Server (Python)
```bash
cd WasteBot
python main.py --server --warmup
```

The `--warmup` flag pre-loads the RAG pipeline at startup (recommended).

Expected output:
```
INFO wastebot.api: Listening on 127.0.0.1:8001
INFO wastebot.api: Initialising pipeline...
```

### Terminal 3: Start the Frontend (React/Vite)
```bash
cd Frontend
npm install  # if not done
npm run dev  # starts on port 5173
```

## Step 5: Test the Integration

1. Open your browser to `http://localhost:5173`
2. Find the WasteBot widget (bottom-right corner)
3. Click to open and test with a question like:
   - "How do I segregate waste at home?"
   - "What is e-waste and how to dispose it?"
   - "What's the best way to compost?"

## API Endpoints

### Backend Proxy Routes (used by Frontend)

- **Health Check**
  ```
  GET /wastebot/health
  Response: { "status": "ok" }
  ```

- **Chat Query**
  ```
  POST /wastebot/chat
  Body: { "question": "Your waste question here" }
  Response: {
    "answer": "...",
    "sources": [
      { "source": "waste_management.txt", "snippet": "..." }
    ]
  }
  ```

### WasteBot Server Routes (internal, used by Backend)

- Health: `GET http://127.0.0.1:8001/health`
- Chat: `POST http://127.0.0.1:8001/chat`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | - | **Required**. Your Groq API key |
| `GROQ_MODEL` | mixtral-8x7b-32768 | LLM model to use |
| `WASTEBOT_PORT` | 8001 | Port for WasteBot API server |
| `WASTEBOT_HOST` | 127.0.0.1 | Host for WasteBot API server |
| `WASTEBOT_DATA_DIR` | data | Directory with RAG documents |
| `WASTEBOT_WARMUP` | 0 | Set to 1 to pre-load pipeline on startup |
| `WASTEBOT_REBUILD` | 0 | Set to 1 to rebuild vector store |
| `WASTEBOT_CORS_ORIGINS` | * | Comma-separated CORS origins |

## Troubleshooting

### "WasteBot service unavailable"
1. Ensure WasteBot server is running on port 8001
2. Check the WasteBot terminal for errors
3. Verify `GROQ_API_KEY` is set correctly

### "Question is required"
- The Frontend sent an empty message to WasteBot
- Try a non-empty question

### ImportError: No module named 'langchain'
1. Activate the Python environment
2. Run: `pip install -r requirements.txt`

### GROQ API Errors
1. Check your API key: https://console.groq.com/keys
2. Verify rate limits (free tier has limits)
3. Ensure internet connectivity

### Vector Store Not Found
- First run takes time to build the vector store
- Use `WASTEBOT_WARMUP=1` to pre-build on startup
- Check `WasteBot/data/` for source documents

## Project Structure

```
WasteBot/
├── main.py              # Entry point (CLI or server)
├── api_server.py        # FastAPI server
├── pipeline.py          # RAG pipeline initialization
├── rag_chain.py         # Chat/RAG query logic
├── embeddings.py        # Embedding functions
├── vectorstore.py       # Vector store management
├── splitter.py          # Document splitting
├── loader.py            # Document loading
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
├── data/                # Source documents for RAG
│   └── waste_management.txt
└── vector_store/        # Built vector store (auto-created)
    └── waste_faiss/
```

## Production Deployment

For production, consider:

1. **Use a separate WasteBot server** (don't run on 127.0.0.1)
2. **Set environment variables via system** (not .env files)
3. **Use HTTPS** with proper SSL certificates
4. **Configure CORS** appropriately in `WASTEBOT_CORS_ORIGINS`
5. **Monitor logs** in `WasteBot/logs/`
6. **Rate limiting** on the Backend proxy routes

## Next Steps

- Customize `WasteBot/data/` with your own waste management documents
- Adjust RAG pipeline parameters in `pipeline.py`
- Add authentication if needed
- Monitor conversation logs for improvements

## Support

For issues:
1. Check the error message in the terminal
2. Review logs in `WasteBot/logs/`
3. Ensure all services are running on correct ports
4. Verify API keys and network connectivity

---

**Happy waste management! ♻️**
