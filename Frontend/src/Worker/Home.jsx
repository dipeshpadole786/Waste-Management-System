import React, { useEffect, useState } from "react";
import API from "../API/api_req";
import "./Home.css";

const WorkerDashboard = () => {
    const [assignedComplaints, setAssignedComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Fetch complaints assigned to logged-in worker
    const fetchWorkerComplaints = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

            if (!loggedInUser || loggedInUser.role !== "worker") {
                console.error("Worker not logged in");
                return;
            }

            const res = await API.get("/worker/complaints", {
                params: { workerId: loggedInUser._id }
            });

            setAssignedComplaints(res.data.complaints);
        } catch (error) {
            console.error("Error fetching worker complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Update complaint status
    const updateStatus = async (complaintId, status) => {
        try {
            await API.put(`/worker/complaints/${complaintId}/status`, {
                status
            });

            // refresh after update
            fetchWorkerComplaints();
        } catch (error) {
            console.error("Error updating complaint status:", error);
        }
    };

    useEffect(() => {
        fetchWorkerComplaints();
    }, []);

    if (loading) {
        return <p style={{ textAlign: "center" }}>Loading complaints...</p>;
    }

    return (
        <div className="worker-dashboard">
            <h2>👷 Worker Dashboard</h2>

            {assignedComplaints.length === 0 ? (
                <p>No complaints assigned yet.</p>
            ) : (
                assignedComplaints.map((complaint) => (
                    <div className="complaint-card" key={complaint._id}>
                        <div className="complaint-header">
                            <h4>{complaint.complaintType}</h4>
                            <span className={`status ${complaint.status}`}>
                                {complaint.status}
                            </span>
                        </div>

                        <p><strong>Complaint ID:</strong> {complaint.complaintId}</p>
                        <p><strong>Name:</strong> {complaint.name}</p>
                        <p><strong>Mobile:</strong> {complaint.mobile}</p>
                        <p><strong>Address:</strong> {complaint.address}</p>
                        <p><strong>Description:</strong> {complaint.description}</p>
                        <p>
                            <strong>Reported At:</strong>{" "}
                            {new Date(complaint.createdAt).toLocaleString()}
                        </p>

                        {/* 🔘 ACTION BUTTONS */}
                        <div className="actions">
                            {complaint.status === "pending" && (
                                <button
                                    className="btn start"
                                    onClick={() =>
                                        updateStatus(complaint._id, "in-progress")
                                    }
                                >
                                    ▶ Start Work
                                </button>
                            )}

                            {complaint.status === "in-progress" && (
                                <button
                                    className="btn complete"
                                    onClick={() =>
                                        updateStatus(complaint._id, "completed")
                                    }
                                >
                                    ✅ Mark Completed
                                </button>
                            )}

                            {complaint.status === "completed" && (
                                <p className="completed-text">
                                    ✔ Work Completed
                                </p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default WorkerDashboard;
