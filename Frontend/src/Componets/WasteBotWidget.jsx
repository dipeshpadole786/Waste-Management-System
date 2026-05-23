import { useEffect, useMemo, useRef, useState } from "react";
import API from "../API/api_req";
import "./WasteBotWidget.css";

const initialMessages = [
  {
    role: "bot",
    text:
      "Hi, I’m WasteBot.\nAsk me about segregation, recycling, composting, e-waste disposal, or missed pickups.",
  },
];

export default function WasteBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("unknown"); // unknown | online | offline

  const [pos, setPos] = useState(null); // {x,y} in px (top-left)
  const [hasDragged, setHasDragged] = useState(false);

  const containerRef = useRef(null);
  const bodyRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0, moved: false });

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  const clampToViewport = (x, y) => {
    const el = containerRef.current;
    const margin = 12;
    if (!el) return { x, y };
    const rect = el.getBoundingClientRect();
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
    return { x: Math.min(Math.max(margin, x), maxX), y: Math.min(Math.max(margin, y), maxY) };
  };

  const snapToBottomRight = () => {
    const el = containerRef.current;
    const margin = 18;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = window.innerWidth - rect.width - margin;
    const y = window.innerHeight - rect.height - margin;
    setPos(clampToViewport(x, y));
  };

  useEffect(() => {
    const onResize = () => {
      setPos((p) => (p ? clampToViewport(p.x, p.y) : p));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // On first mount and whenever open/close changes, keep it in bottom-right unless user dragged it.
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      if (!pos || !hasDragged) snapToBottomRight();
      else setPos((p) => (p ? clampToViewport(p.x, p.y) : p));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/wastebot/health");
        if (!cancelled) setStatus(res?.data?.status === "ok" ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const onPointerDown = (e) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos?.x ?? 0,
      originY: pos?.y ?? 0,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true;
    setPos(clampToViewport(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  const onPointerUp = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (dragRef.current.moved) setHasDragged(true);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const send = async () => {
    const question = input.trim();
    if (!question || busy) return;

    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: question }]);

    try {
      const res = await API.post("/wastebot/chat", { question });
      const answer = res?.data?.answer || "Sorry, I couldn’t generate an answer.";
      const sources = Array.isArray(res?.data?.sources) ? res.data.sources : [];
      setMessages((m) => [...m, { role: "bot", text: answer, sources }]);
    } catch (e) {
      const backendMsg = e?.response?.data?.error || e?.response?.data?.detail;
      const msg =
        backendMsg ||
        (e?.code === "ERR_NETWORK" ? "Backend is not reachable on port 3000." : e?.message) ||
        "WasteBot is not available. Start the WasteBot server and try again.";

      setStatus("offline");
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text:
            `Error: ${msg}\n\n` +
            "To fix:\n" +
            "1) Start Backend (port 3000)\n" +
            "2) Start WasteBot API: `cd WasteBot` then `python main.py --server --warmup`\n" +
            "3) Ensure `GROQ_API_KEY` is set in `WasteBot/.env`",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div
        ref={containerRef}
        className="wb-container"
        style={pos ? { left: `${pos.x}px`, top: `${pos.y}px` } : undefined}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          className="wb-fab-btn"
          type="button"
          onPointerDown={onPointerDown}
          onClick={(e) => {
            if (dragRef.current.moved) {
              e.preventDefault();
              return;
            }
            setOpen(true);
          }}
        >
          <span className="wb-fab-badge" aria-hidden="true" />
          WasteBot
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="wb-container"
      style={pos ? { left: `${pos.x}px`, top: `${pos.y}px` } : undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="dialog"
      aria-label="WasteBot"
    >
      <div className="wb-panel">
        <div className="wb-panel-header" onPointerDown={onPointerDown}>
          <div className="wb-title">
            <div>
              WasteBot
              <small>
                Waste help assistant {status === "online" ? "• Online" : status === "offline" ? "• Offline" : ""}
              </small>
            </div>
          </div>
          <button
            className="wb-close"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setOpen(false)}
            type="button"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="wb-body" ref={bodyRef}>
          {messages.map((m, idx) => (
            <div key={idx} className={`wb-msg ${m.role === "user" ? "wb-msg--user" : "wb-msg--bot"}`}>
              {m.text}
              {m.role === "bot" && Array.isArray(m.sources) && m.sources.length > 0 && (
                <div className="wb-sources">
                  Sources:
                  <ul>
                    {m.sources.slice(0, 3).map((s, i) => (
                      <li key={i}>
                        <strong>{s.source}</strong>: {s.snippet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="wb-footer">
          <form
            className="wb-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              className="wb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a waste-management question..."
              disabled={busy}
            />
            <button className="wb-send" type="submit" disabled={!canSend}>
              {busy ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
