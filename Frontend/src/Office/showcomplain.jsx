import { useLocation } from "react-router-dom";
import { useState } from "react";
import "./ShowComplaints.css"; // Import the CSS file

const ShowComplaints = () => {
    const { state: complaints } = useLocation();
    const [expandedId, setExpandedId] = useState(null);

    if (!complaints || complaints.length === 0) {
        return (
            <div className="no-complaints-container">
                <h3>No complaint data found</h3>
                <p>There are currently no complaints to display.</p>
            </div>
        );
    }

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="complaints-container">
            <header className="complaints-header">
                <h1 className="department-title">Public Grievance Portal</h1>
                <h2 className="page-title">All Registered Complaints</h2>
                <div className="summary-info">
                    <span className="total-complaints">Total: {complaints.length} complaint(s)</span>
                </div>
            </header>

            <main className="complaints-list">
                {complaints.map((c) => (
                    <article
                        key={c._id}
                        className={`complaint-card ${expandedId === c._id ? 'expanded' : ''}`}
                    >
                        {/* BASIC INFO */}
                        <div className="complaint-header">
                            <div className="complaint-title-section">
                                <h3 className="complaint-type">
                                    <span className="type-icon">📄</span>
                                    {c.complaintType}
                                </h3>
                                <div className="complaint-id-badge">
                                    ID: {c.complaintId}
                                </div>
                            </div>
                            <button
                                className="toggle-details-btn"
                                onClick={() => toggleExpand(c._id)}
                                aria-expanded={expandedId === c._id}
                            >
                                {expandedId === c._id ? (
                                    <>
                                        <span className="btn-icon">▲</span>
                                        Hide Details
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">▼</span>
                                        Show More Details
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="complaint-summary">
                            <div className="status-container">
                                <span className="status-label">Status:</span>
                                <span className="status-badge status-pending">Pending</span>
                            </div>
                            <div className="date-info">
                                <span className="date-label">Submitted:</span>
                                <time className="date-value">
                                    {new Date(c.createdAt).toLocaleString()}
                                </time>
                            </div>
                        </div>

                        {/* EXPANDED DETAILS */}
                        {expandedId === c._id && (
                            <div className="complaint-details">
                                <div className="section-divider">
                                    <span className="divider-text">Complaint Details</span>
                                </div>

                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Description:</span>
                                        <p className="detail-value description-text">{c.description}</p>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Complaint Address:</span>
                                        <p className="detail-value">{c.address}</p>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Reported By:</span>
                                        <p className="detail-value">{c.name}</p>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Mobile:</span>
                                        <p className="detail-value contact-info">{c.mobile}</p>
                                    </div>
                                </div>

                                <div className="section-divider">
                                    <span className="divider-text">User Information</span>
                                </div>

                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Full Name:</span>
                                        <p className="detail-value">{c.user?.fullName || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Mobile Number:</span>
                                        <p className="detail-value contact-info">{c.user?.mobileNumber || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email:</span>
                                        <p className="detail-value contact-info">{c.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Location:</span>
                                        <p className="detail-value">
                                            {c.user?.district || 'N/A'}, {c.user?.state || 'N/A'} - {c.user?.pincode || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Complete Address:</span>
                                        <p className="detail-value">{c.user?.address || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button className="action-btn btn-assign">
                                        Assign to Department
                                    </button>
                                    <button className="action-btn btn-resolve">
                                        Mark as Resolved
                                    </button>
                                    <button className="action-btn btn-notes">
                                        Add Internal Notes
                                    </button>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </main>

            <footer className="complaints-footer">
                <p className="footer-note">
                    <strong>Note:</strong> This portal is for official use only. All complaints are logged and monitored.
                </p>
                <p className="footer-contact">
                    For queries, contact: grievance@government.gov.in | Helpline: 1800-XXX-XXXX
                </p>
            </footer>
        </div>
    );
};

export default ShowComplaints;