// TrackStatus.jsx
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

    // Status stages for progress tracking
    const statusStages = [
        { stage: 1, name: "Submitted", icon: "📝" },
        { stage: 2, name: "Under Review", icon: "👁️" },
        { stage: 3, name: "In Progress", icon: "⚙️" },
        { stage: 4, name: "Resolved", icon: "✅" }
    ];

    // Get color based on status
    const getStatusColor = (status) => {
        if (!status) return '#757575';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('resolved')) return '#4CAF50';
        if (statusLower.includes('progress')) return '#2196F3';
        if (statusLower.includes('review')) return '#FF9800';
        return '#9E9E9E';
    };

    // Get icon based on status
    const getStatusIcon = (status) => {
        if (!status) return '📄';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('resolved')) return '✅';
        if (statusLower.includes('progress')) return '⚙️';
        if (statusLower.includes('review')) return '👁️';
        return '📝';
    };

    // Calculate progress percentage based on status
    const getProgressPercentage = (status) => {
        if (!status) return 25;
        const statusLower = status.toLowerCase();
        if (statusLower.includes('resolved')) return 100;
        if (statusLower.includes('progress')) return 75;
        if (statusLower.includes('review')) return 50;
        return 25;
    };

    useEffect(() => {
        if (!aadhaar) {
            setError("Please login to track complaints");
            setLoading(false);
            return;
        }

        const fetchUserComplaints = async () => {
            try {
                const response = await API.get(`/getUserComplaints/${aadhaar}`);
                setUserData(response.data.user);
                setComplaints(response.data.complaints || []);
                setError(null);
            } catch (error) {
                console.error("Error fetching complaints:", error);
                setError("Failed to load complaints. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserComplaints();
    }, [aadhaar]);

    // Loading State
    if (loading) {
        return (
            <div className="track-status-page">
                <div className="container">
                    <div className="page-header-banner">
                        <div className="container">
                            <h1>
                                <span className="header-icon">📊</span>
                                शिकायत स्थिति ट्रैकिंग
                                <span className="sub-header">Complaint Status Tracking</span>
                            </h1>
                        </div>
                    </div>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <h3>Loading your complaints...</h3>
                        <p>Please wait while we fetch your complaint details</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="track-status-page">
                <div className="container">
                    <div className="page-header-banner">
                        <div className="container">
                            <h1>
                                <span className="header-icon">📊</span>
                                शिकायत स्थिति ट्रैकिंग
                                <span className="sub-header">Complaint Status Tracking</span>
                            </h1>
                        </div>
                    </div>
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h3>{error}</h3>
                        <a href="/login" className="btn btn-primary">Login Now</a>
                    </div>
                </div>
            </div>
        );
    }

    // No User Data State
    if (!userData) {
        return (
            <div className="track-status-page">
                <div className="container">
                    <div className="page-header-banner">
                        <div className="container">
                            <h1>
                                <span className="header-icon">📊</span>
                                शिकायत स्थिति ट्रैकिंग
                                <span className="sub-header">Complaint Status Tracking</span>
                            </h1>
                        </div>
                    </div>
                    <div className="no-data-container">
                        <div className="no-data-icon">📭</div>
                        <h3>No User Found</h3>
                        <p>Please login with your Aadhaar to access complaint tracking</p>
                        <a href="/login" className="btn btn-primary">Go to Login</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="track-status-page">
            <div className="container">
                {/* Header Banner */}
                {/* <div className="page-header-banner">
                    <div className="container">
                        <h1>
                            <span className="header-icon">📊</span>
                            शिकायत स्थिति ट्रैकिंग
                            <span className="sub-header">Complaint Status Tracking</span>
                        </h1>
                        <div className="header-badge">
                            <span className="badge-icon">🔍</span>
                            Live Tracking
                        </div>
                    </div>
                </div> */}

                <br />
                <br />

                {/* User Info Card */}
                <div className="government-card user-info-card">
                    <div className="card-header">
                        <h3><span className="card-icon">👤</span> Citizen Information</h3>
                        <div className="verified-badge">
                            <span className="verified-icon">✅</span>
                            Verified Citizen
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="user-info-grid">
                            <div className="info-item">
                                <span className="info-label">Full Name</span>
                                <span className="info-value">{userData.fullName}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Aadhaar Number</span>
                                <span className="info-value govt-number">{userData.aadhaarNumber}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Mobile Number</span>
                                <span className="info-value">{userData.mobileNumber}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email Address</span>
                                <span className="info-value">{userData.email}</span>
                            </div>
                            <div className="info-item full-width">
                                <span className="info-label">Registered Address</span>
                                <span className="info-value">{userData.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Banner */}
                <div className="stats-banner">
                    <div className="stat-item">
                        <div className="stat-number">{complaints.length}</div>
                        <div className="stat-label">Total Complaints</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-number">
                            {complaints.filter(c => c.status && c.status.toLowerCase().includes('resolved')).length}
                        </div>
                        <div className="stat-label">Resolved</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-number">
                            {complaints.filter(c => c.status &&
                                !c.status.toLowerCase().includes('resolved') &&
                                (c.status.toLowerCase().includes('progress') || c.status.toLowerCase().includes('review'))
                            ).length}
                        </div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-number">24-48 hrs</div>
                        <div className="stat-label">Avg. Resolution</div>
                    </div>
                </div>

                {/* Complaints Section */}
                <div className="complaints-section">
                    <div className="section-header">
                        <h3><span className="section-icon">📋</span> Your Complaint History</h3>
                        <div className="section-actions">
                            <a href="/file-complaint" className="btn btn-primary">
                                <span className="btn-icon">➕</span> File New Complaint
                            </a>
                        </div>
                    </div>

                    {complaints.length === 0 ? (
                        <div className="no-complaints-card">
                            <div className="no-complaints-icon">📭</div>
                            <h4>No Complaints Filed</h4>
                            <p>You haven't filed any complaints yet.</p>
                            <a href="/file-complaint" className="btn btn-primary">
                                File Your First Complaint
                            </a>
                        </div>
                    ) : (
                        <div className="complaints-grid">
                            {complaints.map((complaint) => (
                                <div key={complaint._id} className="government-card complaint-card">
                                    <div className="complaint-header">
                                        <div className="complaint-id">
                                            <span className="id-icon">🆔</span>
                                            {complaint.complaintId || `COMP-${complaint._id?.slice(-8) || 'N/A'}`}
                                        </div>
                                        <div
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(complaint.status) }}
                                        >
                                            <span className="status-icon">{getStatusIcon(complaint.status)}</span>
                                            {complaint.status || 'Submitted'}
                                        </div>
                                    </div>

                                    <div className="complaint-body">
                                        <h4 className="complaint-title">{complaint.complaintType}</h4>
                                        <p className="complaint-description">{complaint.description}</p>

                                        <div className="complaint-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Location</span>
                                                <span className="detail-value">{complaint.address}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Priority</span>
                                                <span className={`priority-badge ${(complaint.priority || 'medium').toLowerCase()}`}>
                                                    {complaint.priority || 'Medium'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Filed On</span>
                                                <span className="detail-value">
                                                    {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            {complaint.assignedTo && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Assigned To</span>
                                                    <span className="detail-value">{complaint.assignedTo}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Progress Bar */}
                                        <div className="status-progress">
                                            <div className="progress-steps">
                                                {statusStages.map((stage) => (
                                                    <div key={stage.stage} className="progress-step">
                                                        <div className="step-icon">{stage.icon}</div>
                                                        <div className="step-label">{stage.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${getProgressPercentage(complaint.status)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Resolution Info */}
                                        {complaint.status && complaint.status.toLowerCase().includes('resolved') && (
                                            <div className="resolution-info">
                                                <div className="resolved-badge">
                                                    <span className="resolved-icon">✅</span>
                                                    Resolved
                                                </div>
                                                {complaint.resolution && (
                                                    <p className="resolution-text">
                                                        <strong>Resolution:</strong> {complaint.resolution}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="complaint-footer">
                                        <div className="complaint-meta">
                                            <span className="meta-item">
                                                <span className="meta-icon">🆔</span>
                                                Complaint ID: {complaint.complaintId || complaint._id?.slice(-8)}
                                            </span>
                                            <span className="meta-item">
                                                <span className="meta-icon">📅</span>
                                                Filed: {new Date(complaint.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="complaint-actions">
                                            <button className="btn btn-outline">
                                                <span className="btn-icon">👁️</span>
                                                View Details
                                            </button>
                                            <button className="btn btn-secondary">
                                                <span className="btn-icon">📞</span>
                                                Contact Support
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="help-card">
                    <h4><span className="help-icon">❓</span> Need Help With Your Complaint?</h4>
                    <div className="help-options">
                        <div className="help-option">
                            <span className="option-icon">📞</span>
                            <div className="option-content">
                                <h5>Call Support</h5>
                                <p>Dial 1800-XXX-XXXX for complaint assistance</p>
                            </div>
                        </div>
                        <div className="help-option">
                            <span className="option-icon">💬</span>
                            <div className="option-content">
                                <h5>Live Chat</h5>
                                <p>Chat with our support team 24/7</p>
                            </div>
                        </div>
                        <div className="help-option">
                            <span className="option-icon">📧</span>
                            <div className="option-content">
                                <h5>Email Support</h5>
                                <p>complaints@wastemanagement.gov.in</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackStatus;