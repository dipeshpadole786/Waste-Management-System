import React, { useEffect, useMemo, useState } from "react";
import "./WasteMonitoringDashboard.css";
import { apiUrl, detectImage, getHistory, health } from "./yolo_api";

const StatusBadge = ({ status, statusColor }) => {
  const cls =
    statusColor === "green"
      ? "wm-badge wm-badge-green"
      : statusColor === "yellow"
        ? "wm-badge wm-badge-yellow"
        : "wm-badge wm-badge-red";

  return (
    <span className={cls}>
      <span className="wm-badge-dot" />
      {status}
    </span>
  );
};

const MetricsCard = ({ title, value, sub }) => (
  <div className="wm-metric">
    <div className="wm-metric-title">{title}</div>
    <div className="wm-metric-value">{value}</div>
    {sub ? <div className="wm-metric-sub">{sub}</div> : null}
  </div>
);

const HistoryList = ({ onSelect }) => {
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
    <div className="wm-card">
      <div className="wm-card-head wm-row">
        <div>
          <div className="wm-card-title">Recent Monitoring</div>
          <div className="wm-card-sub">Last 20 runs</div>
        </div>
        <button type="button" className="wm-btn wm-btn-dark" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="wm-card-body wm-muted">Loading history...</div>
      ) : error ? (
        <div className="wm-card-body wm-error">{error}</div>
      ) : items.length === 0 ? (
        <div className="wm-card-body wm-muted">No monitoring runs yet.</div>
      ) : (
        <div className="wm-list">
          {items.map((it) => (
            <button key={it.id} type="button" className="wm-list-item" onClick={() => onSelect?.(it)}>
              <img className="wm-thumb" src={apiUrl(it.outputUrl)} alt={`Run ${it.id}`} loading="lazy" />
              <div className="wm-list-meta">
                <div className="wm-row wm-row-between">
                  <div className="wm-strong">Run #{it.id}</div>
                  <StatusBadge status={it.status} statusColor={it.statusColor} />
                </div>
                <div className="wm-muted-sm">
                  Score: <span className="wm-strong">{it.cleanlinessScore}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const WasteMonitoringDashboard = () => {
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
    setPreviewUrl(URL.createObjectURL(f));
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
    <div className="wm-page">
      <div className="wm-hero">
        <div className="wm-hero-left">
          <div className="wm-hero-title">Smart Waste Monitoring</div>
          <div className="wm-hero-sub">Admin & Municipal Monitoring Dashboard</div>
        </div>
        <div className="wm-hero-right">
          <div className="wm-pill">
            API: <span className="wm-pill-strong">{apiHealth?.status || "checking"}</span>
          </div>
          <a className="wm-btn wm-btn-saffron" href="#wm-upload">
            New Scan
          </a>
        </div>
      </div>

      <div className="wm-grid">
        <section id="wm-upload" className="wm-col wm-col-2">
          <div className="wm-card">
            <div className="wm-card-head wm-row wm-row-between">
              <div>
                <div className="wm-card-title">Area Image Scan</div>
                <div className="wm-card-sub">Upload CCTV/drone/street camera snapshot for detection</div>
              </div>
              {result ? <StatusBadge status={result.status} statusColor={result.statusColor} /> : null}
            </div>

            <div className="wm-card-body wm-two">
              <div>
                <label className="wm-label">Upload image</label>
                <input className="wm-file" type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0] || null)} />

                <button type="button" className="wm-btn wm-btn-saffron wm-full" disabled={!canSubmit} onClick={runDetect}>
                  {loading ? "Running detection..." : "Run YOLOv8 Detection"}
                </button>

                {error ? <div className="wm-alert">{error}</div> : null}

                <div className="wm-note">
                  Detected classes: <b>waste, garbage piles, litter, humans, dustbins, vehicles</b>
                </div>
              </div>

              <div>
                <div className="wm-label">Preview</div>
                <div className="wm-preview">
                  {previewUrl ? <img className="wm-preview-img" src={previewUrl} alt="Preview" /> : <div className="wm-muted">No image selected</div>}
                </div>
              </div>
            </div>
          </div>

          {result ? (
            <>
              <div className="wm-metrics">
                {metrics?.map((m) => (
                  <MetricsCard key={m.title} title={m.title} value={m.value} sub={m.sub} />
                ))}
              </div>

              <div className="wm-card">
                <div className="wm-card-head wm-row wm-row-between">
                  <div>
                    <div className="wm-card-title">Annotated Output</div>
                    <div className="wm-card-sub">Bounding boxes + confidence scores</div>
                  </div>
                  <div className="wm-pill wm-pill-light">
                    Cleanliness Score: <span className="wm-pill-strong">{result.cleanlinessScore}%</span>
                  </div>
                </div>
                <div className="wm-card-body">
                  <div className="wm-output">
                    <img className="wm-output-img" src={apiUrl(result.outputUrl)} alt="Annotated output" />
                  </div>
                </div>
              </div>

              <div className="wm-card">
                <div className="wm-card-head">
                  <div className="wm-card-title">Detection Results</div>
                  <div className="wm-card-sub">Per-object labels and confidence</div>
                </div>
                <div className="wm-card-body wm-scroll">
                  <table className="wm-table">
                    <thead>
                      <tr>
                        <th>Label</th>
                        <th>Category</th>
                        <th>Confidence</th>
                        <th>Box</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result.detections || []).map((d, idx) => (
                        <tr key={idx}>
                          <td className="wm-strong">{d.label}</td>
                          <td>{d.category}</td>
                          <td className="wm-strong">{Math.round(d.confidence * 100)}%</td>
                          <td className="wm-mono">
                            {d.box.x1},{d.box.y1} → {d.box.x2},{d.box.y2}
                          </td>
                        </tr>
                      ))}
                      {(result.detections || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="wm-muted">
                            No objects detected.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </section>

        <aside className="wm-col">
          <HistoryList
            onSelect={(it) => {
              setResult({
                ...it,
                outputUrl: it.outputUrl,
                detections: [],
                totalWasteCount: (it.counts?.waste || 0) + (it.counts?.garbage_piles || 0) + (it.counts?.litter || 0),
                humanCount: it.counts?.humans || 0,
              });
            }}
          />

          <div className="wm-card">
            <div className="wm-card-head">
              <div className="wm-card-title">Future-Ready Modules</div>
              <div className="wm-card-sub">Planned extensions</div>
            </div>
            <div className="wm-card-body">
              <ul className="wm-ul">
                <li>Live CCTV monitoring (RTSP/WebRTC ingestion)</li>
                <li>Zone-based heatmaps and cleanliness trends</li>
                <li>Municipal alerts and escalation workflow</li>
                <li>Smart city analytics & reporting exports</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <div className="wm-footer">Admin-only system • Uploads and annotated outputs are stored server-side for monitoring history.</div>
    </div>
  );
};

export default WasteMonitoringDashboard;

