import React, { useEffect, useMemo, useState } from "react";
import "./FileComplaint.css";
import API from "../API/api_req";
import { useLocation, useNavigate } from "react-router-dom";

const SESSION_KEY = "cameraComplaint:capture";

const CameraComplaint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const aadhaar = loggedInUser?.aadhaarNumber;

  const initialImage = location.state?.capturedImage || sessionStorage.getItem(SESSION_KEY) || null;

  const [capturedImage, setCapturedImage] = useState(initialImage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    complaintType: "",
    description: "",
    address: "",
    name: "",
    mobile: "",
  });

  const complaintTypes = [
    "Garbage Not Collected",
    "Overflowing Dustbins",
    "Vehicle Misbehavior",
    "Route Deviation",
    "Delay in Service",
    "Staff Behavior",
    "Unauthorized Dumping",
    "Other",
  ];

  useEffect(() => {
    if (capturedImage) sessionStorage.setItem(SESSION_KEY, capturedImage);
  }, [capturedImage]);

  useEffect(() => {
    if (!capturedImage) {
      // If user lands here without capture, send them to camera page.
      navigate("/camera-report");
    }
  }, [capturedImage, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateComplaintId = () => `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const [complaintId] = useState(generateComplaintId());

  const validateImage = () => {
    if (!capturedImage) return "No captured image found.";
    // Basic size check (approx). DataURL size is (chars) * 3/4 bytes.
    const approxBytes = Math.floor((capturedImage.length * 3) / 4);
    if (approxBytes > 10 * 1024 * 1024) return "Captured image is too large (max 10MB).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const imgErr = validateImage();
    if (imgErr) {
      setError(imgErr);
      return;
    }

    setSubmitting(true);
    try {
      // IMPORTANT: Keep backend request format same as `FileComplaint.jsx`
      // Backend currently accepts JSON fields only (no image field).
      const payload = {
        complaintId,
        aadhaar,
        complaintType: formData.complaintType,
        description: formData.description,
        address: formData.address,
        name: formData.name,
        mobile: formData.mobile,
      };

      const res = await API.post("/filecomplaint", payload);
      navigate("/file_succes", { state: res.data });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error submitting:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewFields = useMemo(
    () => [
      { label: "Complaint ID", val: complaintId },
      { label: "Type", val: formData.complaintType },
      { label: "Description", val: formData.description },
      { label: "Address", val: formData.address },
      { label: "Name", val: formData.name },
      { label: "Mobile", val: formData.mobile },
    ],
    [complaintId, formData]
  );

  const filledFields = previewFields.filter((f) => f.val && f.label !== "Complaint ID").length;
  const totalFields = previewFields.length - 1;
  const progressPct = Math.round((filledFields / totalFields) * 100);

  const onRetake = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCapturedImage(null);
    navigate("/camera-report");
  };

  return (
    <main className="fc-page">
      <div className="fc-container">
        <div className="fc-page-header">
          <div>
            <div className="fc-eyebrow">Citizen Services</div>
            <h1 className="fc-page-title">Camera Complaint</h1>
            <p className="fc-page-sub">
              Your captured photo is attached below. Fill the form and submit your complaint.
            </p>
          </div>
          <div className="fc-id-chip">📸 {complaintId}</div>
        </div>

        <div className="fc-grid">
          <div className="fc-form-col">
            <div className="fc-card">
              <div className="fc-card-head">
                <span>🧾</span>
                <h3>Complaint Details</h3>
              </div>
              <div className="fc-card-body">
                <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                  <div className="fc-disclaimer" style={{ margin: 0 }}>
                    Photo captured successfully. You can retake it if needed.
                  </div>
                  <div style={{ borderRadius: 12, overflow: "hidden", background: "#0A1628" }}>
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Captured complaint"
                        style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                      />
                    ) : null}
                  </div>
                  <button type="button" className="fc-submit-btn" onClick={onRetake}>
                    Retake Image
                  </button>
                </div>

                {error ? (
                  <div className="fc-disclaimer" style={{ color: "#8b1e14" }}>
                    ⚠️ {error}
                  </div>
                ) : null}

                <form className="fc-form" onSubmit={handleSubmit}>
                  <div className="fc-field">
                    <label className="fc-label" htmlFor="complaintType">
                      COMPLAINT TYPE <span className="fc-required">*</span>
                    </label>
                    <div className="fc-select-wrap">
                      <select
                        id="complaintType"
                        name="complaintType"
                        value={formData.complaintType}
                        onChange={handleChange}
                        className="fc-select"
                        required
                      >
                        <option value="">Select complaint category…</option>
                        {complaintTypes.map((t, i) => (
                          <option key={i} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="fc-select-arrow">▾</span>
                    </div>
                  </div>

                  <div className="fc-field">
                    <label className="fc-label" htmlFor="description">
                      DESCRIPTION <span className="fc-required">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => {
                        const { value } = e.target;
                        // Backend schema: maxlength 300
                        if (value.length <= 300) handleChange(e);
                      }}
                      placeholder="Describe the issue in detail…"
                      className="fc-textarea"
                      rows="4"
                      required
                    />
                    <div className="fc-field-hint">{formData.description.length}/300 characters</div>
                  </div>

                  <div className="fc-field">
                    <label className="fc-label" htmlFor="address">
                      LOCATION / ADDRESS <span className="fc-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter complete address…"
                      className="fc-input"
                      required
                    />
                  </div>

                  <div className="fc-row">
                    <div className="fc-field">
                      <label className="fc-label" htmlFor="name">
                        FULL NAME <span className="fc-required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="fc-input"
                        required
                      />
                    </div>
                    <div className="fc-field">
                      <label className="fc-label" htmlFor="mobile">
                        MOBILE NUMBER <span className="fc-required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10-digit number"
                        className="fc-input"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>

                  <div className="fc-form-footer">
                    <div className="fc-disclaimer">
                      🔒 Your data is encrypted and protected. By submitting, you confirm this complaint is accurate.
                    </div>
                    <button type="submit" className="fc-submit-btn" disabled={submitting}>
                      {submitting ? "Submitting..." : "📤 Submit Complaint"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="fc-info-col">
            <div className="fc-card fc-progress-card">
              <div className="fc-progress-head">
                <span className="fc-progress-label">Form Completion</span>
                <span className="fc-progress-pct">{progressPct}%</span>
              </div>
              <div className="fc-progress-track">
                <div className="fc-progress-fill" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>

            <div className="fc-card">
              <div className="fc-card-head">
                <span>👁️</span>
                <h3>Complaint Preview</h3>
              </div>
              <div className="fc-card-body fc-preview-body">
                {previewFields.map((f) => (
                  <div className="fc-preview-row" key={f.label}>
                    <span className="fc-preview-label">{f.label}</span>
                    <span className={`fc-preview-val ${!f.val ? "fc-preview-empty" : ""}`}>
                      {f.val || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fc-card">
              <div className="fc-card-head">
                <span>💡</span>
                <h3>Filing Tips</h3>
              </div>
              <div className="fc-card-body">
                <ul className="fc-tips">
                  {[
                    "Include landmarks and nearby references in the location field.",
                    "Keep the description short and clear (max 300 characters).",
                    "Describe when the issue started and if it is recurring.",
                    "Make sure your mobile number is reachable for follow-up.",
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
              <div className="fc-helpline-icon">📞</div>
              <div>
                <div className="fc-helpline-title">Need Help?</div>
                <div className="fc-helpline-num">1800-XXX-XXXX</div>
                <div className="fc-helpline-sub">Available 24/7 · Toll Free</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CameraComplaint;
