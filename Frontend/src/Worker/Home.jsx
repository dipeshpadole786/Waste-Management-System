import React, { useEffect, useState } from "react";
import API from "../API/api_req";
import "./Home.css";

const STATUS_META = {
    pending: { label: '⏳ Pending', cls: 'pending' },
    'in-progress': { label: '🔄 In Progress', cls: 'inprogress' },
    completed: { label: '✅ Completed', cls: 'completed' },
};

const WorkerDashboard = () => {
    const [assignedComplaints, setAssignedComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchWorkerComplaints = async () => {
        setLoading(true);
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

    const updateStatus = async (complaintId, status) => {
        try {
            await API.put(`/worker/complaints/${complaintId}/status`, { status });
            fetchWorkerComplaints();
        } catch (error) {
            console.error("Error updating complaint status:", error);
        }
    };

    useEffect(() => { fetchWorkerComplaints(); }, []);

    const counts = {
        all: assignedComplaints.length,
        pending: assignedComplaints.filter(c => c.status === 'pending').length,
        'in-progress': assignedComplaints.filter(c => c.status === 'in-progress').length,
        completed: assignedComplaints.filter(c => c.status === 'completed').length,
    };

    const filtered = filter === 'all'
        ? assignedComplaints
        : assignedComplaints.filter(c => c.status === filter);

    if (loading) return (
        <div className="wd-loading">
            <div className="wd-spinner" />
            <p>Loading complaints…</p>
        </div>
    );

    return (
        <div className="wd-page">

            {/* Page header */}
            <div className="wd-header">
                <div>
                    <div className="wd-eyebrow">Worker Portal</div>
                    <h1 className="wd-title">My Assigned Complaints</h1>
                </div>
                <button className="wd-refresh-btn" onClick={fetchWorkerComplaints}>🔄 Refresh</button>
            </div>

            {/* Stats row */}
            <div className="wd-stats">
                {[
                    { val: counts.all, lbl: 'Total Assigned', mod: '' },
                    { val: counts.pending, lbl: 'Pending', mod: '--amber' },
                    { val: counts['in-progress'], lbl: 'In Progress', mod: '--blue' },
                    { val: counts.completed, lbl: 'Completed', mod: '--green' },
                ].map(s => (
                    <div key={s.lbl} className={`wd-stat ${s.mod}`}>
                        <div className="wd-stat-val">{s.val}</div>
                        <div className="wd-stat-lbl">{s.lbl}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="wd-filters">
                {[
                    { id: 'all', label: `All (${counts.all})` },
                    { id: 'pending', label: `Pending (${counts.pending})` },
                    { id: 'in-progress', label: `In Progress (${counts['in-progress']})` },
                    { id: 'completed', label: `Completed (${counts.completed})` },
                ].map(f => (
                    <button
                        key={f.id}
                        className={`wd-filter-btn ${filter === f.id ? 'active' : ''}`}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Complaints */}
            {filtered.length === 0 ? (
                <div className="wd-empty">
                    <div className="wd-empty-icon">👷</div>
                    <h3>{assignedComplaints.length === 0 ? 'No complaints assigned yet.' : 'No complaints match this filter.'}</h3>
                    <p>Check back later or select a different filter.</p>
                </div>
            ) : (
                <div className="wd-list">
                    {filtered.map(complaint => {
                        const sm = STATUS_META[complaint.status] || STATUS_META.pending;
                        return (
                            <div key={complaint._id} className={`wd-card wd-card--${sm.cls}`}>

                                {/* Card head */}
                                <div className="wd-card-head">
                                    <div>
                                        <h4 className="wd-card-type">{complaint.complaintType}</h4>
                                        <span className="wd-card-id">ID: {complaint.complaintId}</span>
                                    </div>
                                    <span className={`wd-status-pill wd-status-pill--${sm.cls}`}>{sm.label}</span>
                                </div>

                                {/* Card body */}
                                <div className="wd-card-body">
                                    <div className="wd-info-grid">
                                        <div className="wd-info-item">
                                            <span className="wd-info-label">Reporter</span>
                                            <span className="wd-info-val">{complaint.name}</span>
                                        </div>
                                        <div className="wd-info-item">
                                            <span className="wd-info-label">Mobile</span>
                                            <span className="wd-info-val">
                                                <a href={`tel:${complaint.mobile}`} className="wd-phone">{complaint.mobile}</a>
                                            </span>
                                        </div>
                                        <div className="wd-info-item wd-info-item--full">
                                            <span className="wd-info-label">📍 Address</span>
                                            <span className="wd-info-val">{complaint.address}</span>
                                        </div>
                                        <div className="wd-info-item wd-info-item--full">
                                            <span className="wd-info-label">Description</span>
                                            <span className="wd-info-val wd-info-val--desc">{complaint.description}</span>
                                        </div>
                                    </div>
                                    <div className="wd-filed">
                                        Filed: {new Date(complaint.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div className="wd-card-foot">
                                    {complaint.status === 'pending' && (
                                        <button className="wd-btn wd-btn--start" onClick={() => updateStatus(complaint._id, 'in-progress')}>
                                            ▶ Start Work
                                        </button>
                                    )}
                                    {complaint.status === 'in-progress' && (
                                        <button className="wd-btn wd-btn--complete" onClick={() => updateStatus(complaint._id, 'completed')}>
                                            ✅ Mark Completed
                                        </button>
                                    )}
                                    {complaint.status === 'completed' && (
                                        <span className="wd-done-text">✔ Work Completed</span>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(complaint.address)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="wd-map-link"
                                    >
                                        📍 View on Map
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WorkerDashboard;
