import React, { useEffect, useState } from "react";
import API from "../API/api_req";
import "./TrackStatus.css";

const TrackStatus = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const aadhaar = loggedInUser?.aadhaarNumber;

    const [userData, setUserData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const statusStages = [
        { stage: 1, name: "Submitted", icon: "📝" },
        { stage: 2, name: "Under Review", icon: "👁️" },
        { stage: 3, name: "In Progress", icon: "⚙️" },
        { stage: 4, name: "Resolved", icon: "✅" },
    ];

    const getStatusColor = (status) => {
        if (!status) return '#94A3B8';
        const s = status.toLowerCase();
        if (s.includes('resolved')) return '#1A6B3A';
        if (s.includes('progress')) return '#0C1B33';
        if (s.includes('review')) return '#E07B2A';
        return '#94A3B8';
    };

    const getStatusIcon = (status) => {
        if (!status) return '📄';
        const s = status.toLowerCase();
        if (s.includes('resolved')) return '✅';
        if (s.includes('progress')) return '⚙️';
        if (s.includes('review')) return '👁️';
        return '📝';
    };

    const getProgressPercentage = (status) => {
        if (!status) return 25;
        const s = status.toLowerCase();
        if (s.includes('resolved')) return 100;
        if (s.includes('progress')) return 75;
        if (s.includes('review')) return 50;
        return 25;
    };

    useEffect(() => {
        if (!aadhaar) { setError("Please login to track complaints"); setLoading(false); return; }
        const fetchUserComplaints = async () => {
            try {
                const response = await API.get(`/getUserComplaints/${aadhaar}`);
                setUserData(response.data.user);
                setComplaints(response.data.complaints || []);
                setError(null);
            } catch (err) {
                setError("Failed to load complaints. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserComplaints();
    }, [aadhaar]);

    if (loading) return (
        <div className="ts-page">
            <div className="ts-container">
                <div className="ts-state-box">
                    <div className="ts-spinner"></div>
                    <h3>Loading your complaints…</h3>
                    <p>Please wait while we fetch your details</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="ts-page">
            <div className="ts-container">
                <div className="ts-state-box">
                    <div className="ts-state-icon">⚠️</div>
                    <h3>{error}</h3>
                    <a href="/login" className="ts-btn ts-btn-primary">Login Now</a>
                </div>
            </div>
        </div>
    );

    if (!userData) return (
        <div className="ts-page">
            <div className="ts-container">
                <div className="ts-state-box">
                    <div className="ts-state-icon">📭</div>
                    <h3>No User Found</h3>
                    <p>Login with your Aadhaar to access complaint tracking</p>
                    <a href="/login" className="ts-btn ts-btn-primary">Go to Login</a>
                </div>
            </div>
        </div>
    );

    return (
        <div className="ts-page">
            <div className="ts-container">

                {/* Page Header */}
                <div className="ts-page-header">
                    <div>
                        <div className="ts-eyebrow">शिकायत स्थिति ट्रैकिंग</div>
                        <h1 className="ts-page-title">Complaint Status Tracking</h1>
                    </div>
                    <div className="ts-live-pill">
                        <span className="ts-live-dot"></span> Live Tracking
                    </div>
                </div>

                {/* User Info */}
                <div className="ts-card ts-user-card">
                    <div className="ts-card-head">
                        <div className="ts-card-head-left">
                            <div className="ts-card-icon">👤</div>
                            <span>Citizen Information</span>
                        </div>
                        <div className="ts-verified-badge">✅ Verified Citizen</div>
                    </div>
                    <div className="ts-card-body">
                        <div className="ts-info-grid">
                            {[
                                { label: "Full Name", val: userData.fullName },
                                { label: "Aadhaar Number", val: userData.aadhaarNumber, mono: true },
                                { label: "Mobile Number", val: userData.mobileNumber },
                                { label: "Email Address", val: userData.email },
                            ].map(item => (
                                <div className="ts-info-item" key={item.label}>
                                    <div className="ts-info-label">{item.label}</div>
                                    <div className={`ts-info-val ${item.mono ? 'mono' : ''}`}>{item.val}</div>
                                </div>
                            ))}
                            <div className="ts-info-item ts-full-width">
                                <div className="ts-info-label">Registered Address</div>
                                <div className="ts-info-val">{userData.address}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="ts-stats-bar">
                    {[
                        { val: complaints.length, lbl: "Total Complaints" },
                        { val: complaints.filter(c => c.status?.toLowerCase().includes('resolved')).length, lbl: "Resolved" },
                        { val: complaints.filter(c => c.status && !c.status.toLowerCase().includes('resolved') && (c.status.toLowerCase().includes('progress') || c.status.toLowerCase().includes('review'))).length, lbl: "In Progress" },
                        { val: "24–48 hrs", lbl: "Avg. Resolution" },
                    ].map((s, i, arr) => (
                        <React.Fragment key={s.lbl}>
                            <div className="ts-stat">
                                <div className="ts-stat-val">{s.val}</div>
                                <div className="ts-stat-lbl">{s.lbl}</div>
                            </div>
                            {i < arr.length - 1 && <div className="ts-stat-divider"></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Complaints Section */}
                <div className="ts-section-head">
                    <h3 className="ts-section-title">📋 Your Complaint History</h3>
                    <a href="/file-complaint" className="ts-btn ts-btn-primary">
                        ➕ File New Complaint
                    </a>
                </div>

                {complaints.length === 0 ? (
                    <div className="ts-empty-card">
                        <div className="ts-state-icon">📭</div>
                        <h4>No Complaints Filed</h4>
                        <p>You haven't filed any complaints yet.</p>
                        <a href="/file-complaint" className="ts-btn ts-btn-primary">File Your First Complaint</a>
                    </div>
                ) : (
                    <div className="ts-complaints-grid">
                        {complaints.map(complaint => (
                            <div key={complaint._id} className="ts-card ts-complaint-card">
                                <div className="ts-complaint-head">
                                    <div className="ts-complaint-id">
                                        🆔 {complaint.complaintId || `COMP-${complaint._id?.slice(-8) || 'N/A'}`}
                                    </div>
                                    <div
                                        className="ts-status-pill"
                                        style={{ background: getStatusColor(complaint.status) }}
                                    >
                                        {getStatusIcon(complaint.status)} {complaint.status || 'Submitted'}
                                    </div>
                                </div>

                                <div className="ts-card-body">
                                    <h4 className="ts-complaint-type">{complaint.complaintType}</h4>
                                    <p className="ts-complaint-desc">{complaint.description}</p>

                                    <div className="ts-complaint-meta-grid">
                                        <div className="ts-meta-item">
                                            <span className="ts-meta-label">Location</span>
                                            <span className="ts-meta-val">{complaint.address}</span>
                                        </div>
                                        <div className="ts-meta-item">
                                            <span className="ts-meta-label">Priority</span>
                                            <span className={`ts-priority-tag ${(complaint.priority || 'medium').toLowerCase()}`}>
                                                {complaint.priority || 'Medium'}
                                            </span>
                                        </div>
                                        <div className="ts-meta-item">
                                            <span className="ts-meta-label">Filed On</span>
                                            <span className="ts-meta-val">
                                                {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {complaint.assignedTo && (
                                            <div className="ts-meta-item">
                                                <span className="ts-meta-label">Assigned To</span>
                                                <span className="ts-meta-val">{complaint.assignedTo}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Steps */}
                                    <div className="ts-progress-wrap">
                                        <div className="ts-progress-steps">
                                            {statusStages.map((stage, i) => {
                                                const pct = getProgressPercentage(complaint.status);
                                                const stageThreshold = (stage.stage / 4) * 100;
                                                const isActive = pct >= stageThreshold;
                                                return (
                                                    <div key={stage.stage} className={`ts-step ${isActive ? 'active' : ''}`}>
                                                        <div className="ts-step-icon">{stage.icon}</div>
                                                        <div className="ts-step-name">{stage.name}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="ts-progress-track">
                                            <div
                                                className="ts-progress-fill"
                                                style={{ width: `${getProgressPercentage(complaint.status)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {complaint.status?.toLowerCase().includes('resolved') && (
                                        <div className="ts-resolved-box">
                                            <span className="ts-resolved-pill">✅ Resolved</span>
                                            {complaint.resolution && (
                                                <p className="ts-resolution-text">
                                                    <strong>Resolution:</strong> {complaint.resolution}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="ts-complaint-foot">
                                    <div className="ts-foot-meta">
                                        <span>🆔 {complaint.complaintId || complaint._id?.slice(-8)}</span>
                                        <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="ts-foot-actions">
                                        <button className="ts-btn ts-btn-outline">👁️ View Details</button>
                                        <button className="ts-btn ts-btn-secondary">📞 Support</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Card */}
                <div className="ts-help-card">
                    <div className="ts-help-head">❓ Need Help With Your Complaint?</div>
                    <div className="ts-help-grid">
                        {[
                            { icon: "📞", title: "Call Support", desc: "Dial 1800-XXX-XXXX for assistance" },
                            { icon: "💬", title: "Live Chat", desc: "Chat with our team 24/7" },
                            { icon: "📧", title: "Email Support", desc: "complaints@wastemanagement.gov.in" },
                        ].map(h => (
                            <div className="ts-help-item" key={h.title}>
                                <div className="ts-help-icon">{h.icon}</div>
                                <div>
                                    <div className="ts-help-title">{h.title}</div>
                                    <div className="ts-help-desc">{h.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrackStatus;