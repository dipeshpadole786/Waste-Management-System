import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./FileSuccess.css";   // CSS File

const FileSuccess = () => {
    const { state } = useLocation();

    if (!state) return <h2>No Data Received</h2>;

    const { complaint } = state;

    return (
        <main className="gov-success-page">
            <div className="gov-container">

                <div className="gov-card">
                    <h2 className="gov-title">✔ Complaint Submitted Successfully</h2>
                    <p className="gov-subtitle">Thank you for reporting. Your complaint has been recorded.</p>

                    <div className="gov-details-box">
                        <p><strong>Complaint ID:</strong> {complaint.complaintId}</p>
                        <p><strong>Type:</strong> {complaint.complaintType}</p>
                        <p><strong>Description:</strong> {complaint.description}</p>
                        <p><strong>Address:</strong> {complaint.address}</p>
                        <p><strong>Name:</strong> {complaint.name}</p>
                        <p><strong>Mobile:</strong> {complaint.mobile}</p>
                    </div>

                    <div className="gov-actions">
                        <Link to="/" className="gov-btn">🏠 Go to Home</Link>
                        <Link to="/tracking" className="gov-btn">📄 Track Complaint</Link>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default FileSuccess;
