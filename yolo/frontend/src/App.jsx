import React, { useEffect, useMemo, useState } from "react";
import { apiUrl, detectImage, health } from "./lib/api";
import MetricsCard from "./components/MetricsCard";
import StatusBadge from "./components/StatusBadge";
import HistoryList from "./components/HistoryList";

function statusRing(color) {
  if (color === "green") return "ring-green-200";
  if (color === "yellow") return "ring-yellow-200";
  return "ring-red-200";
}

export default function App() {
  const [apiHealth, setApiHealth] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = !!file && !loading;

  useEffect(() => {
    (async () => {
      try {
        const h = await health();
        setApiHealth(h);
      } catch {
        setApiHealth({ status: "unreachable" });
      }
    })();
  }, []);

  const onPick = (f) => {
    setError(null);
    setResult(null);
    setFile(f);
    if (!f) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const runDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await detectImage(file);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!result) return null;
    const c = result.counts || {};
    return [
      { title: "Total Waste", value: result.totalWasteCount ?? 0, sub: "waste + piles + litter" },
      { title: "Humans", value: result.humanCount ?? c.humans ?? 0 },
      { title: "Dustbins", value: c.dustbins ?? 0 },
      { title: "Vehicles", value: c.vehicles ?? 0 },
    ];
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-white font-black tracking-tight text-lg">Smart Waste Monitoring</div>
            <div className="text-white/70 text-xs font-semibold">Admin & Municipal Monitoring Dashboard</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white ring-1 ring-white/15">
              API:{" "}
              <span className="ml-1 font-black">
                {apiHealth?.status ? apiHealth.status : "checking"}
              </span>
            </div>
            <a
              className="rounded-full bg-saffron-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-saffron-500"
              href="#upload"
            >
              New Scan
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section id="upload" className="lg:col-span-2 space-y-6">
          <div className="rounded-xl2 bg-white shadow-soft border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-900">Area Image Scan</div>
                <div className="text-xs font-semibold text-slate-500">
                  Upload CCTV/drone/street camera snapshot for detection
                </div>
              </div>
              {result ? <StatusBadge status={result.status} statusColor={result.statusColor} /> : null}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Upload image
                </label>
                <input
                  className="block w-full rounded-lg border-slate-200 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-extrabold file:text-white hover:file:bg-slate-800"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPick(e.target.files?.[0] || null)}
                />

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={runDetect}
                  className="w-full rounded-lg bg-saffron-600 px-4 py-3 text-sm font-black text-white hover:bg-saffron-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Running detection..." : "Run YOLOv8 Detection"}
                </button>

                {error ? <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div> : null}

                <div className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                  Detected classes: <span className="font-black">waste, garbage piles, litter, humans, dustbins, vehicles</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Preview</div>
                <div className="aspect-video rounded-xl2 border border-slate-200 bg-slate-50 overflow-hidden grid place-items-center">
                  {previewUrl ? (
                    <img className="h-full w-full object-contain" src={previewUrl} alt="Preview" />
                  ) : (
                    <div className="text-sm font-semibold text-slate-500">No image selected</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics?.map((m) => (
                  <MetricsCard key={m.title} title={m.title} value={m.value} sub={m.sub} />
                ))}
              </div>

              <div className="rounded-xl2 bg-white shadow-soft border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">Annotated Output</div>
                    <div className="text-xs font-semibold text-slate-500">Bounding boxes + confidence scores</div>
                  </div>
                  <div className={`rounded-full px-3 py-2 text-xs font-extrabold ring-1 ${statusRing(result.statusColor)} bg-white`}>
                    Cleanliness Score: <span className="ml-1 font-black">{result.cleanlinessScore}%</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="aspect-video rounded-xl2 border border-slate-200 bg-slate-50 overflow-hidden">
                    <img className="h-full w-full object-contain" src={apiUrl(result.outputUrl)} alt="Annotated output" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl2 bg-white shadow-soft border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="text-sm font-black text-slate-900">Detection Results</div>
                  <div className="text-xs font-semibold text-slate-500">Per-object labels and confidence</div>
                </div>
                <div className="p-5 overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="py-2 pr-4">Label</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Confidence</th>
                        <th className="py-2 pr-4">Box</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(result.detections || []).map((d, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-4 font-extrabold text-slate-900">{d.label}</td>
                          <td className="py-2 pr-4 font-semibold text-slate-700">{d.category}</td>
                          <td className="py-2 pr-4 font-black text-slate-900">{Math.round(d.confidence * 100)}%</td>
                          <td className="py-2 pr-4 font-mono text-xs text-slate-600">
                            {d.box.x1},{d.box.y1} → {d.box.x2},{d.box.y2}
                          </td>
                        </tr>
                      ))}
                      {(result.detections || []).length === 0 ? (
                        <tr>
                          <td className="py-3 text-sm font-semibold text-slate-500" colSpan={4}>
                            No objects detected.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <HistoryList
            onSelect={(it) => {
              setResult({
                ...it,
                outputUrl: it.outputUrl,
                detections: [],
                totalWasteCount:
                  (it.counts?.waste || 0) + (it.counts?.garbage_piles || 0) + (it.counts?.litter || 0),
                humanCount: it.counts?.humans || 0,
              });
            }}
          />

          <div className="rounded-xl2 bg-white shadow-soft border border-slate-100 p-4">
            <div className="text-sm font-black text-slate-900">Future-Ready Modules</div>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600 list-disc pl-5">
              <li>Live CCTV monitoring (RTSP/WebRTC ingestion)</li>
              <li>Zone-based heatmaps and cleanliness trends</li>
              <li>Municipal alerts and escalation workflow</li>
              <li>Smart city analytics & reporting exports</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs font-semibold text-slate-500">
          Admin-only system • Uploads and annotated outputs are stored server-side for monitoring history.
        </div>
      </footer>
    </div>
  );
}
