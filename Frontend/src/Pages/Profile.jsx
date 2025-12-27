import React, { useEffect, useState } from "react";
import API from "../API/api_req";
import "./Profile.css";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("profile");

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const aadhaarNumber = loggedInUser?.aadhaarNumber;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get(`/user/profile/${aadhaarNumber}`);
                setUser(res.data);
            } catch (err) {
                setError("Unable to fetch profile details. Please try again later.");
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (aadhaarNumber) {
            fetchProfile();
        } else {
            setError("Please log in to view your profile.");
            setLoading(false);
        }
    }, [aadhaarNumber]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading profile information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">Unable to Load Profile</h3>
                <p className="error-message">{error}</p>
                <button
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="no-data-container">
                <p>No profile data found.</p>
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            {/* <div className="govt-header">
                <div className="govt-logo">
                    <span className="emblem">🕉️</span>
                    <h1>Government Citizen Portal</h1>
                </div>
                <div className="user-badge">
                    <span className="user-icon">👤</span>
                    <span className="user-name">{user.fullName}</span>
                </div>
            </div> */}

            <div className="profile-content">
                <div className="navigation-sidebar">
                    <div className="nav-header">
                        <h3>Citizen Dashboard</h3>
                    </div>
                    <nav className="nav-menu">
                        <button
                            className={`nav-btn ${activeTab === "profile" ? "active" : ""}`}
                            onClick={() => setActiveTab("profile")}
                        >
                            <span className="nav-icon">👤</span>
                            Profile Details
                        </button>
                        <button
                            className={`nav-btn ${activeTab === "complaints" ? "active" : ""}`}
                            onClick={() => setActiveTab("complaints")}
                        >
                            <span className="nav-icon">📋</span>
                            My Complaints
                            {user.complaints?.length > 0 && (
                                <span className="badge">{user.complaints.length}</span>
                            )}
                        </button>
                        <button className="nav-btn">
                            <span className="nav-icon">📄</span>
                            Documents
                        </button>
                        <button className="nav-btn">
                            <span className="nav-icon">⚙️</span>
                            Settings
                        </button>
                    </nav>
                </div>

                <main className="main-content">
                    {activeTab === "profile" ? (
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>Citizen Profile</h2>
                                <div className="aadhaar-badge">
                                    <span className="aadhaar-label">Aadhaar:</span>
                                    <span className="aadhaar-number">{user.aadhaarNumber}</span>
                                </div>
                            </div>

                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.fullName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-title">
                                        <h3>{user.fullName}</h3>
                                        <p className="profile-subtitle">Registered Citizen</p>
                                    </div>
                                </div>

                                <div className="profile-details">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Mobile Number</label>
                                            <p>{user.mobileNumber}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email Address</label>
                                            <p>{user.email}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Gender</label>
                                            <p className="gender-badge">{user.gender}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Date of Birth</label>
                                            <p>{user.dob}</p>
                                        </div>
                                    </div>

                                    <div className="address-section">
                                        <h4>Residential Address</h4>
                                        <p className="address-text">{user.address}</p>
                                        <div className="location-details">
                                            <span className="location-tag">
                                                📍 {user.district}, {user.state} - {user.pincode}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-stats">
                                    <div className="stat-card">
                                        <div className="stat-icon">📋</div>
                                        <div className="stat-info">
                                            <div className="stat-value">{user.complaints?.length || 0}</div>
                                            <div className="stat-label">Total Complaints</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">✅</div>
                                        <div className="stat-info">
                                            <div className="stat-value">
                                                {user.complaints?.filter(c => c.status === 'resolved').length || 0}
                                            </div>
                                            <div className="stat-label">Resolved</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">⏳</div>
                                        <div className="stat-info">
                                            <div className="stat-value">
                                                {user.complaints?.filter(c => c.status === 'pending').length || 0}
                                            </div>
                                            <div className="stat-label">Pending</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="complaints-section">
                            <div className="section-header">
                                <h2>My Complaints</h2>
                                <button className="new-complaint-btn">
                                    + File New Complaint
                                </button>
                            </div>

                            {user.complaints?.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h3>No Complaints Filed</h3>
                                    <p>You haven't filed any complaints yet.</p>
                                    <button className="cta-btn">File Your First Complaint</button>
                                </div>
                            ) : (
                                <div className="complaints-list">
                                    {user.complaints.map((complaint) => (
                                        <div key={complaint._id} className="complaint-card">
                                            <div className="complaint-header">
                                                <div className="complaint-meta">
                                                    <span className="complaint-id">
                                                        Complaint ID: {complaint.complaintId}
                                                    </span>
                                                    <span className={`status-badge ${complaint.status || 'pending'}`}>
                                                        {complaint.status || 'Pending'}
                                                    </span>
                                                </div>
                                                <h4 className="complaint-type">{complaint.complaintType}</h4>
                                            </div>

                                            <p className="complaint-description">{complaint.description}</p>

                                            <div className="complaint-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        <span className="detail-icon">📍</span> Address
                                                    </span>
                                                    <span className="detail-value">{complaint.address}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">
                                                        <span className="detail-icon">📱</span> Contact
                                                    </span>
                                                    <span className="detail-value">{complaint.mobile}</span>
                                                </div>
                                            </div>

                                            <div className="complaint-footer">
                                                <span className="complaint-date">
                                                    Filed on: {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <button className="view-details-btn">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <footer className="govt-footer">
                <p>© {new Date().getFullYear()} Government Citizen Portal. All rights reserved.</p>
                <p className="footer-links">
                    <a href="/help">Help</a> |
                    <a href="/terms">Terms of Service</a> |
                    <a href="/privacy">Privacy Policy</a> |
                    <a href="/contact">Contact</a>
                </p>
            </footer>
        </div>
    );
};

export default Profile;