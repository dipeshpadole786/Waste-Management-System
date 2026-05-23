import React, { useEffect, useState } from "react";
import { apiUrl, getHistory } from "../lib/api";
import StatusBadge from "./StatusBadge";

export default function HistoryList({ onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(20);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-xl2 border border-slate-100 bg-white shadow-soft">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <div className="text-sm font-black text-slate-900">Recent Monitoring</div>
          <div className="text-xs font-semibold text-slate-500">Last 20 runs</div>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-sm font-semibold text-slate-500">Loading history...</div>
      ) : error ? (
        <div className="p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="p-4 text-sm font-semibold text-slate-500">No monitoring runs yet.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelect?.(it)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3"
            >
              <img
                className="h-12 w-16 rounded-lg object-cover border border-slate-100"
                src={apiUrl(it.outputUrl)}
                alt={`Run ${it.id}`}
                loading="lazy"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-slate-900">Run #{it.id}</div>
                  <StatusBadge status={it.status} statusColor={it.statusColor} />
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  Score: <span className="font-black text-slate-700">{it.cleanlinessScore}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

