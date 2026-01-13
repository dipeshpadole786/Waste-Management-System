import React, { useEffect, useState } from "react";
import API from "../API/api_req";
// import "./WorkerDashboard.css";

const WorkerDashboard = () => {
    const [assignedComplaints, setAssignedComplaints] = useState([]);
    const [workerStats, setWorkerStats] = useState({
        pendingComplaints: 0
    });

    // 🔹 FETCH WORKER COMPLAINTS
    const fetchWorkerComplaints = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (!loggedInUser || loggedInUser.role !== "worker") return;

            const res = await API.get("/worker/complaints", {
                params: { workerId: loggedInUser._id }
            });

            const complaints = res.data.complaints.map((c, index) => ({
                id: index + 1,
                _id: c._id,
                complaintId: c.complaintId,
                complaintType: c.complaintType,
                address: c.address,
                status: c.status, // pending | in-progress | completed
                description: c.description,
                reportedAt: new Date(c.createdAt).toLocaleString()
            }));

            setAssignedComplaints(complaints);

            setWorkerStats({
                pendingComplaints: complaints.filter(
                    c => c.status === "pending"
                ).length
            });

        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
    };

    // 🔹 UPDATE COMPLAINT STATUS
    const handleUpdateComplaintStatus = async (complaintMongoId, status) => {
        try {
            await API.put(`/worker/complaints/${complaintMongoId}/status`, {
                status
            });

            fetchWorkerComplaints(); // 🔄 refresh list
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    useEffect(() => {
        fetchWorkerComplaints();
    }, []);

    return (
        <div className="worker-dashboard">
            <h2>👷 Worker Dashboard</h2>

            {/* 🔢 STATS */}
            <div className="worker-stats">
                <div className="stat-card">
                    <h3>{workerStats.pendingComplaints}</h3>
                    <p>Pending Complaints</p>
                </div>
            </div>

            {/* 📋 COMPLAINT LIST */}
            <div className="complaint-list">
                {assignedComplaints.length === 0 ? (
                    <p>No complaints assigned yet.</p>
                ) : (
                    assignedComplaints.map(complaint => (
                        <div key={complaint._id} className="complaint-card">
                            <div className="complaint-header">
                                <h4>{complaint.complaintType}</h4>
                                <span className={`status-badge ${complaint.status}`}>
                                    {complaint.status}
                                </span>
                            </div>

                            <p><strong>ID:</strong> {complaint.complaintId}</p>
                            <p><strong>Address:</strong> {complaint.address}</p>
                            <p><strong>Description:</strong> {complaint.description}</p>
                            <p><strong>Reported:</strong> {complaint.reportedAt}</p>

                            {/* 🎯 ACTION BUTTONS */}
                            <div className="action-buttons">
                                {complaint.status === "pending" && (
                                    <button
                                        className="btn start"
                                        onClick={() =>
                                            handleUpdateComplaintStatus(
                                                complaint._id,
                                                "in-progress"
                                            )
                                        }
                                    >
                                        ▶️ Start Work
                                    </button>
                                )}

                                {complaint.status === "in-progress" && (
                                    <button
                                        className="btn complete"
                                        onClick={() =>
                                            handleUpdateComplaintStatus(
                                                complaint._id,
                                                "completed"
                                            )
                                        }
                                    >
                                        ✅ Mark Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkerDashboard;
