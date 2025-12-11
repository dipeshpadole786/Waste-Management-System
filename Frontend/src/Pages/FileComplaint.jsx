import React, { useState } from "react";
import "./FileComplaint.css";
import API from "../API/api_req";
import { useNavigate } from "react-router-dom";

const FileComplaint = () => {
    const navigate = useNavigate();

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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const generateComplaintId = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        return `CMP-${random}`;
    };

    const [complaintId] = useState(generateComplaintId());

    // ----------------------------------------
    // SUBMIT FUNCTION
    // ----------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/filecomplaint", {
                complaintId,
                ...formData
            });

            // Navigate with backend data
            navigate("/file_succes", { state: res.data });

        } catch (error) {
            console.error("Error submitting:", error);
            alert("Something went wrong. Try again.");
        }
    };

    return (
        <main className="file-complaint-page">
            <div className="container">
                <div className="complaint-main-content">

                    {/* LEFT SIDE FORM */}
                    <div className="complaint-form-column">
                        <div className="government-card complaint-form-card">
                            <div className="card-header">
                                <h3><span className="card-icon">📝</span> File a Complaint</h3>
                            </div>

                            <form className="complaint-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="complaintType">Complaint Type *</label>
                                    <select
                                        id="complaintType"
                                        name="complaintType"
                                        value={formData.complaintType}
                                        onChange={handleChange}
                                        className="govt-select"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {complaintTypes.map((t, i) => (
                                            <option key={i} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Short Description *</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the issue..."
                                        className="govt-textarea"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">Address *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="govt-input"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="govt-input"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="mobile">Mobile *</label>
                                        <input
                                            type="tel"
                                            id="mobile"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            className="govt-input"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        <span className="submit-icon">📤</span> Submit Complaint
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT SIDE PREVIEW */}
                    <div className="complaint-info-column">
                        <div className="government-card info-card">
                            <h4><span className="card-icon">👁️</span> Complaint Preview</h4>

                            <div className="preview-box">
                                <p><strong>Complaint ID:</strong> {complaintId}</p>
                                <p><strong>Type:</strong> {formData.complaintType || "—"}</p>
                                <p><strong>Description:</strong> {formData.description || "—"}</p>
                                <p><strong>Address:</strong> {formData.address || "—"}</p>
                                <p><strong>Name:</strong> {formData.name || "—"}</p>
                                <p><strong>Mobile:</strong> {formData.mobile || "—"}</p>
                            </div>
                        </div>

                        <div className="government-card info-card">
                            <h4><span className="card-icon">💡</span> Tips</h4>
                            <ul className="tips-list">
                                <li>Write a clear description.</li>
                                <li>Add exact location.</li>
                                <li>Choose correct category.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default FileComplaint;
