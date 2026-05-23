import React, { useEffect, useMemo, useState } from "react";
import api from "../API/model_api";
import "./WasteClassifier.css";

const WasteClassifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    checkApiHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkApiHealth = async () => {
    const result = await api.checkHealth();
    if (result.success && result.data?.status === "healthy") setApiStatus("connected");
    else setApiStatus("disconnected");
  };

  const processFile = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (PNG, JPG, JPEG, GIF, BMP, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setPrediction(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
    else setError("Please drop an image file (PNG, JPG, JPEG, GIF, BMP, WEBP)");
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setDragOver(false);
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }
    if (apiStatus !== "connected") {
      setError("Backend API is not connected. Please make sure the wasteClassifier server is running.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.predictImage(selectedFile);
      if (result.success && result.data?.success) setPrediction(result.data);
      else setError(result.error || result.data?.error || "Prediction failed");
    } catch (err) {
      setError("Failed to connect to server. Please check if the backend is running.");
      // eslint-disable-next-line no-console
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const disposal = useMemo(() => {
    if (!prediction) return { label: null, icon: "❓", className: "" };
    if (prediction.isRecyclable === true) return { label: "Recyclable", icon: "♻️", className: "recyclable" };
    if (prediction.isRecyclable === false) return { label: "Organic", icon: "🌱", className: "organic" };
    return { label: "Unknown", icon: "❓", className: "" };
  }, [prediction]);

  return (
    <div className="waste-classifier-container">
      <div className="header">
        <h1>♻️ Waste Classification System</h1>


      </div>

      <div className="main-content">
        <div className="upload-section">
          <h2>📸 Upload Image</h2>

          {!selectedFile ? (
            <div
              className={`drop-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("waste-file-input")?.click()}
            >
              <input
                id="waste-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <div className="upload-icon">📁</div>
              <p className="upload-text">Drag & drop your image here</p>
              <p className="upload-subtext">or click to browse</p>
              <div className="file-info">
                <span>Supported: PNG, JPG, JPEG, GIF, BMP, WEBP</span>
                <span>Max size: 10MB</span>
              </div>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button className="remove-btn" onClick={handleReset} type="button">
                  ×
                </button>
              </div>

              <div className="file-details">
                <h3>Selected File</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedFile.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Size:</span>
                    <span className="value">{formatBytes(selectedFile.size)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className="value">{selectedFile.type}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={handlePredict}
                    disabled={loading || apiStatus !== "connected"}
                    className={`predict-btn ${loading ? "loading" : ""}`}
                    type="button"
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Analyzing...
                      </>
                    ) : (
                      "🔍 Classify Waste"
                    )}
                  </button>
                  <button onClick={handleReset} className="secondary-btn" type="button">
                    Choose Different Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message">⚠️ {error}</div>}
        </div>

        <div className="results-section">
          <h2>📊 Results</h2>

          {!prediction ? (
            <div className="file-details">
              <h3>No prediction yet</h3>
              <p>Upload an image and click “Classify Waste” to see results.</p>
            </div>
          ) : (
            <div className={`prediction-card ${disposal.className}`}>
              <div className="prediction-header">
                <div className="prediction-type">
                  <div className="type-icon">{disposal.icon}</div>
                  <div className="type-info">
                    <h3>{prediction.prediction}</h3>
                    <p className="type-description">
                      {disposal.label === "Recyclable"
                        ? "This item is likely recyclable."
                        : disposal.label === "Organic"
                          ? "This item is likely organic/compostable."
                          : "Disposal type could not be determined from the label."}
                    </p>
                  </div>
                </div>
                <div className="confidence-score">
                  <div className="score-value">{prediction.confidence}%</div>
                  <div className="score-label">Confidence</div>
                </div>
              </div>

              <div className="prediction-details">
                <div className="details-grid">
                  <div className="detail-box">
                    <span className="detail-label">Prediction</span>
                    <span className="detail-value">{prediction.prediction}</span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Disposal Type</span>
                    <span className="detail-value">{disposal.label}</span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Probability</span>
                    <span className="detail-value">{prediction.probability}</span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{formatTime(prediction.timestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="recommendation">
                <h4>💡 Recommendation</h4>
                <p>
                  {prediction.isRecyclable === true
                    ? "Place this item in the recycling bin. Make sure it is clean and dry before recycling."
                    : prediction.isRecyclable === false
                      ? "This organic material should be composted or placed in the organic waste bin."
                      : "Please follow your local municipal guidelines for disposal of this item."}
                </p>
              </div>

              <div className="action-buttons">
                <button onClick={handleReset} className="primary-btn" type="button">
                  🆕 Classify Another Image
                </button>
                <button onClick={() => window.print()} className="secondary-btn" type="button">
                  🖨️ Print Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

     

      <div className="footer">
        <p>Powered by Transformers & React • Waste Classification System</p>
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
          <a href="/help">Help</a>
        </div>
      </div>
    </div>
  );
};

export default WasteClassifier;

