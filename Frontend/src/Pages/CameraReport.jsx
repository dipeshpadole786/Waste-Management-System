import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FileComplaint.css";

const SESSION_KEY = "cameraComplaint:capture";

const stopStream = (stream) => {
  try {
    stream?.getTracks?.().forEach((t) => t.stop());
  } catch {
    // ignore
  }
};

const CameraReport = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [fallbackPicked, setFallbackPicked] = useState(false);

  const hasMedia = useMemo(() => !!(navigator?.mediaDevices?.getUserMedia), []);

  useEffect(() => {
    return () => stopStream(stream);
  }, [stream]);

  const openCamera = async () => {
    setPermissionError(null);
    setLoading(true);
    try {
      if (!hasMedia) {
        setPermissionError("Camera is not supported on this device/browser.");
        return;
      }

      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e) {
      setPermissionError(
        e?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : e?.name === "NotFoundError"
            ? "No camera device found. Try uploading a photo instead."
            : e?.name === "NotReadableError"
              ? "Camera is already in use by another app. Close it and try again."
          : `Unable to open camera: ${e?.message || "unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const retake = async () => {
    setCapturedDataUrl(null);
    sessionStorage.removeItem(SESSION_KEY);
    await openCamera();
  };

  const capture = () => {
    setPermissionError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedDataUrl(dataUrl);
    sessionStorage.setItem(SESSION_KEY, dataUrl);

    stopStream(stream);
    setStream(null);

    // Required flow: auto-navigate after capture
    navigate("/cameracomplaint", { state: { capturedImage: dataUrl } });
  };

  const onFallbackPick = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setPermissionError("Please select a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPermissionError("Image too large (max 10MB).");
      return;
    }
    setFallbackPicked(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setCapturedDataUrl(dataUrl);
      sessionStorage.setItem(SESSION_KEY, dataUrl);
      navigate("/cameracomplaint", { state: { capturedImage: dataUrl } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="fc-page">
      <div className="fc-container">
        <div className="fc-page-header">
          <div>
            <div className="fc-eyebrow">Citizen Services</div>
            <h1 className="fc-page-title">Camera Incident Report</h1>
            <p className="fc-page-sub">
              Capture a photo using your device camera, then submit a complaint with details.
            </p>
          </div>
          <div className="fc-id-chip">📷 Camera</div>
        </div>

        <div className="fc-grid">
          <div className="fc-form-col">
            <div className="fc-card">
              <div className="fc-card-head">
                <span>📸</span>
                <h3>Capture Photo</h3>
              </div>
              <div className="fc-card-body">
                {!hasMedia ? (
                  <div className="fc-disclaimer">
                    ⚠️ Camera is not supported in this browser. Use the normal complaint flow instead.
                  </div>
                ) : (
                  <>
                    {permissionError ? (
                      <div className="fc-disclaimer" style={{ color: "#8b1e14" }}>
                        {permissionError}
                      </div>
                    ) : null}

                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ borderRadius: 12, overflow: "hidden", background: "#0A1628" }}>
                        {!capturedDataUrl ? (
                          <video
                            ref={videoRef}
                            playsInline
                            muted
                            style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <img
                            src={capturedDataUrl}
                            alt="Captured"
                            style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }}
                          />
                        )}
                      </div>

                      <canvas ref={canvasRef} style={{ display: "none" }} />

                      <div className="fc-form-footer" style={{ marginTop: 0 }}>
                        {!stream && !capturedDataUrl ? (
                          <button
                            type="button"
                            className="fc-submit-btn"
                            onClick={openCamera}
                            disabled={loading}
                          >
                            {loading ? "Opening camera..." : "Open Camera"}
                          </button>
                        ) : null}

                        {stream ? (
                          <button type="button" className="fc-submit-btn" onClick={capture}>
                            Capture Photo
                          </button>
                        ) : null}

                        {capturedDataUrl ? (
                          <button type="button" className="fc-submit-btn" onClick={retake}>
                            Retake Photo
                          </button>
                        ) : null}
                      </div>

                      {/* Fallback: allow picking/capturing via native file input (works on many mobile browsers) */}
                      {!stream && !capturedDataUrl ? (
                        <div className="fc-disclaimer" style={{ margin: 0 }}>
                          If camera doesn’t open, use “Upload/Take Photo” below.
                          <div style={{ marginTop: 10 }}>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => onFallbackPick(e.target.files?.[0] || null)}
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="fc-info-col">
            <div className="fc-card">
              <div className="fc-card-head">
                <span>ℹ️</span>
                <h3>Instructions</h3>
              </div>
              <div className="fc-card-body">
                <ul className="fc-tips">
                  {[
                    "Allow camera permission when prompted.",
                    "Keep the area well-lit and keep the camera steady.",
                    "Capture the waste area clearly (include surroundings).",
                    "After capture, you will be redirected to the complaint form automatically.",
                  ].map((tip, i) => (
                    <li key={i} className="fc-tip">
                      <span className="fc-tip-num">{i + 1}</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="fc-helpline-card">
              <div className="fc-helpline-icon">🛡️</div>
              <div>
                <div className="fc-helpline-title">Privacy</div>
                <div className="fc-helpline-sub">Photos are used only for complaint review.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CameraReport;
