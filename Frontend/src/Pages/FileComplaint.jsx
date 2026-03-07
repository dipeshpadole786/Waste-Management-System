import React, { useState } from "react";
import "./FileComplaint.css";
import API from "../API/api_req";
import { useNavigate } from "react-router-dom";

const FileComplaint = () => {
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const aadhaar = loggedInUser?.aadhaarNumber;

    const [formData, setFormData] = useState({
        complaintType: "",
        description: "",
        address: "",
        name: "",
        mobile: ""
    });

    const complaintTypes = [
        "Garbage Not Collected",
        "Overflowing Dustbins",
        "Unauthorized Dumping",
        "Vehicle Misbehavior",
        "Staff Misbehavior",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateComplaintId = () => `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const [complaintId] = useState(generateComplaintId());

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/filecomplaint", { complaintId, aadhaar, ...formData });
            navigate("/file_succes", { state: res.data });
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Something went wrong. Try again.");
        }
    };

    const previewFields = [
        { label: "Complaint ID", val: complaintId },
        { label: "Type", val: formData.complaintType },
        { label: "Description", val: formData.description },
        { label: "Address", val: formData.address },
        { label: "Name", val: formData.name },
        { label: "Mobile", val: formData.mobile },
    ];

    const filledFields = previewFields.filter(f => f.val && f.label !== "Complaint ID").length;
    const totalFields = previewFields.length - 1;
    const progressPct = Math.round((filledFields / totalFields) * 100);

    return (
        <main className="fc-page">
            <div className="fc-container">

                {/* Page Header */}
                <div className="fc-page-header">
                    <div>
                        <div className="fc-eyebrow">Citizen Services</div>
                        <h1 className="fc-page-title">File a Complaint</h1>
                        <p className="fc-page-sub">Submit your waste management complaint and we'll address it within 24–48 hours.</p>
                    </div>
                    <div className="fc-id-chip">
                        🆔 {complaintId}
                    </div>
                </div>

                <div className="fc-grid">

                    {/* LEFT: FORM */}
                    <div className="fc-form-col">
                        <div className="fc-card">
                            <div className="fc-card-head">
                                <span>📝</span>
                                <h3>Complaint Details</h3>
                            </div>
                            <div className="fc-card-body">
                                <form className="fc-form" onSubmit={handleSubmit}>

                                    {/* Complaint Type */}
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
                                                    <option key={i} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            <span className="fc-select-arrow">▾</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="fc-field">
                                        <label className="fc-label" htmlFor="description">
                                            DESCRIPTION <span className="fc-required">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the issue in detail…"
                                            className="fc-textarea"
                                            rows="4"
                                            required
                                        />
                                        <div className="fc-field-hint">{formData.description.length}/500 characters</div>
                                    </div>

                                    {/* Address */}
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

                                    {/* Name + Mobile */}
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
                                        <button type="submit" className="fc-submit-btn">
                                            📤 Submit Complaint
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PREVIEW + TIPS */}
                    <div className="fc-info-col">

                        {/* Progress */}
                        <div className="fc-card fc-progress-card">
                            <div className="fc-progress-head">
                                <span className="fc-progress-label">Form Completion</span>
                                <span className="fc-progress-pct">{progressPct}%</span>
                            </div>
                            <div className="fc-progress-track">
                                <div className="fc-progress-fill" style={{ width: `${progressPct}%` }}></div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="fc-card">
                            <div className="fc-card-head">
                                <span>👁️</span>
                                <h3>Complaint Preview</h3>
                            </div>
                            <div className="fc-card-body fc-preview-body">
                                {previewFields.map(f => (
                                    <div className="fc-preview-row" key={f.label}>
                                        <span className="fc-preview-label">{f.label}</span>
                                        <span className={`fc-preview-val ${!f.val ? 'fc-preview-empty' : ''}`}>
                                            {f.val || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="fc-card">
                            <div className="fc-card-head">
                                <span>💡</span>
                                <h3>Filing Tips</h3>
                            </div>
                            <div className="fc-card-body">
                                <ul className="fc-tips">
                                    {[
                                        "Be specific about the location — include landmarks.",
                                        "Describe the issue clearly and concisely.",
                                        "Select the correct complaint category.",
                                        "Provide an active mobile number for follow-up.",
                                    ].map((tip, i) => (
                                        <li key={i} className="fc-tip">
                                            <span className="fc-tip-num">{i + 1}</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Helpline */}
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

export default FileComplaint;