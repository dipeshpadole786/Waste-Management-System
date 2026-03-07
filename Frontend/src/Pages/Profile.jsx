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
            } finally {
                setLoading(false);
            }
        };
        if (aadhaarNumber) fetchProfile();
        else { setError("Please log in to view your profile."); setLoading(false); }
    }, [aadhaarNumber]);

    if (loading) return (
        <div className="pf-state">
            <div className="pf-spinner"></div>
            <p>Loading profile information…</p>
        </div>
    );

    if (error) return (
        <div className="pf-state pf-state--error">
            <div className="pf-state-icon">⚠️</div>
            <h3>Unable to Load Profile</h3>
            <p>{error}</p>
            <button className="pf-btn pf-btn--primary" onClick={() => window.location.reload()}>Try Again</button>
        </div>
    );

    if (!user) return (
        <div className="pf-state">
            <div className="pf-state-icon">📭</div>
            <p>No profile data found.</p>
        </div>
    );

    const totalComplaints = user.complaints?.length || 0;
    const resolved = user.complaints?.filter(c => c.status === 'resolved').length || 0;
    const pending = user.complaints?.filter(c => c.status === 'pending').length || 0;

    return (
        <div className="pf-wrap">
            <div className="pf-layout">

                {/* Sidebar */}
                <aside className="pf-sidebar">
                    {/* User Card */}
                    <div className="pf-user-card">
                        <div className="pf-avatar">
                            {user.photo
                                ? <img src={user.photo} alt={user.fullName} />
                                : <div className="pf-avatar-initial">{user.fullName.charAt(0).toUpperCase()}</div>
                            }
                        </div>
                        <div className="pf-user-name">{user.fullName}</div>
                        <div className="pf-user-sub">Registered Citizen</div>
                        <div className="pf-aadhaar-chip">
                            🆔 {user.aadhaarNumber}
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="pf-nav">
                        <div className="pf-nav-label">Dashboard</div>
                        {[
                            { id: "profile", icon: "👤", label: "Profile Details" },
                            { id: "complaints", icon: "📋", label: "My Complaints", badge: totalComplaints },
                            { id: "documents", icon: "📄", label: "Documents" },
                            { id: "settings", icon: "⚙️", label: "Settings" },
                        ].map(item => (
                            <button
                                key={item.id}
                                className={`pf-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <span className="pf-nav-icon">{item.icon}</span>
                                <span className="pf-nav-label-text">{item.label}</span>
                                {item.badge > 0 && <span className="pf-nav-badge">{item.badge}</span>}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main */}
                <main className="pf-main">

                    {activeTab === "profile" && (
                        <div className="pf-section">
                            <div className="pf-section-head">
                                <div>
                                    <div className="pf-eyebrow">Citizen Profile</div>
                                    <h2 className="pf-section-title">Personal Information</h2>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="pf-stats-row">
                                {[
                                    { icon: "📋", val: totalComplaints, lbl: "Total Complaints" },
                                    { icon: "✅", val: resolved, lbl: "Resolved" },
                                    { icon: "⏳", val: pending, lbl: "Pending" },
                                ].map(s => (
                                    <div className="pf-stat" key={s.lbl}>
                                        <div className="pf-stat-icon">{s.icon}</div>
                                        <div className="pf-stat-val">{s.val}</div>
                                        <div className="pf-stat-lbl">{s.lbl}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Info card */}
                            <div className="pf-card">
                                <div className="pf-card-head">
                                    <h3>Contact & Identity</h3>
                                </div>
                                <div className="pf-card-body">
                                    <div className="pf-info-grid">
                                        {[
                                            { label: "Mobile Number", val: user.mobileNumber },
                                            { label: "Email Address", val: user.email },
                                            { label: "Gender", val: user.gender },
                                            { label: "Date of Birth", val: user.dob },
                                        ].map(item => (
                                            <div className="pf-info-item" key={item.label}>
                                                <div className="pf-info-label">{item.label}</div>
                                                <div className="pf-info-val">{item.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Address card */}
                            <div className="pf-card">
                                <div className="pf-card-head">
                                    <h3>Residential Address</h3>
                                </div>
                                <div className="pf-card-body">
                                    <p className="pf-address">{user.address}</p>
                                    <div className="pf-location-tag">
                                        📍 {user.district}, {user.state} — {user.pincode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "complaints" && (
                        <div className="pf-section">
                            <div className="pf-section-head">
                                <div>
                                    <div className="pf-eyebrow">Complaint History</div>
                                    <h2 className="pf-section-title">My Complaints</h2>
                                </div>
                                <a href="/filecom" className="pf-btn pf-btn--primary">➕ File New Complaint</a>
                            </div>

                            {!user.complaints?.length ? (
                                <div className="pf-empty">
                                    <div className="pf-empty-icon">📝</div>
                                    <h3>No Complaints Filed</h3>
                                    <p>You haven't filed any complaints yet.</p>
                                    <a href="/filecom" className="pf-btn pf-btn--primary">File Your First Complaint</a>
                                </div>
                            ) : (
                                <div className="pf-complaints">
                                    {user.complaints.map(complaint => (
                                        <div key={complaint._id} className="pf-complaint-card">
                                            <div className="pf-complaint-head">
                                                <div className="pf-complaint-id">
                                                    🆔 {complaint.complaintId}
                                                </div>
                                                <span className={`pf-status-badge pf-status-badge--${(complaint.status || 'pending').toLowerCase()}`}>
                                                    {complaint.status || 'Pending'}
                                                </span>
                                            </div>
                                            <h4 className="pf-complaint-type">{complaint.complaintType}</h4>
                                            <p className="pf-complaint-desc">{complaint.description}</p>
                                            <div className="pf-complaint-meta">
                                                <span><span className="pf-meta-icon">📍</span> {complaint.address}</span>
                                                <span><span className="pf-meta-icon">📱</span> {complaint.mobile}</span>
                                            </div>
                                            <div className="pf-complaint-foot">
                                                <span className="pf-complaint-date">
                                                    Filed: {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                                <button className="pf-btn pf-btn--ghost">View Details →</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTab === "documents" || activeTab === "settings") && (
                        <div className="pf-section">
                            <div className="pf-empty">
                                <div className="pf-empty-icon">{activeTab === "documents" ? "📄" : "⚙️"}</div>
                                <h3>{activeTab === "documents" ? "Documents" : "Settings"}</h3>
                                <p>This section is coming soon.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <footer className="pf-footer">
                <p>© {new Date().getFullYear()} Government Citizen Portal. All rights reserved.</p>
                <div className="pf-footer-links">
                    <a href="/help">Help</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/contact">Contact</a>
                </div>
            </footer>
        </div>
    );
};

export default Profile;