import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../API/api_req";
import "./ShowComplaints.css";

const ShowComplaints = () => {
    const { state: initialComplaints } = useLocation();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState(initialComplaints || []);
    const [expandedId, setExpandedId] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState({});
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPriority, setSelectedPriority] = useState("all");

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });

    /* ===================== STATS ===================== */
    useEffect(() => {
        setStats({
            total: complaints.length,
            pending: complaints.filter(c => c.status === "pending").length,
            inProgress: complaints.filter(c => c.status === "in-progress").length,
            completed: complaints.filter(c => c.status === "completed").length
        });
    }, [complaints]);

    /* ===================== WORKERS ===================== */
    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await API.get("/workers");
            setWorkers(res.data || []);
        } catch (err) {
            console.error("Worker fetch failed", err);
            // Fallback mock data
            const mockWorkers = [
                { _id: "1", fullName: "Rajesh Kumar", mobileNumber: "9876543210", area: "Zone A", status: "available" },
                { _id: "2", fullName: "Suresh Patel", mobileNumber: "9876543211", area: "Zone B", status: "available" },
                { _id: "3", fullName: "Amit Sharma", mobileNumber: "9876543212", area: "Zone C", status: "busy" },
                { _id: "4", fullName: "Vikram Singh", mobileNumber: "9876543213", area: "Zone D", status: "available" },
                { _id: "5", fullName: "Anil Gupta", mobileNumber: "9876543214", area: "Zone A", status: "available" },
            ];
            setWorkers(mockWorkers);
        }
    };

    /* ===================== HELPERS ===================== */
    const isAssigned = c => c.assignedWorker || c.status !== "pending";

    const getStatusBadge = status => {
        if (status === "pending") return <span className="status-badge pending">⏳ Pending</span>;
        if (status === "in-progress") return <span className="status-badge in-progress">🔄 In Progress</span>;
        if (status === "completed") return <span className="status-badge completed">✅ Completed</span>;
        return null;
    };

    const getPriorityBadge = priority => {
        if (priority === "high") return <span className="priority high">🔥 High</span>;
        if (priority === "medium") return <span className="priority medium">📋 Medium</span>;
        if (priority === "low") return <span className="priority low">📄 Low</span>;
        return <span className="priority">Not Set</span>;
    };

    const toggleExpand = id => {
        setExpandedId(expandedId === id ? null : id);
    };

    const toggleActionMenu = complaintId => {
        setShowActionMenu(prev => ({
            ...prev,
            [complaintId]: !prev[complaintId]
        }));
    };

    const getWorkerNameById = workerId => {
        if (!workerId) return null;

        if (typeof workerId === 'object' && workerId.fullName) {
            return workerId.fullName;
        }

        const worker = workers.find(w => w._id === workerId || w._id?.toString() === workerId?.toString());
        return worker ? worker.fullName : null;
    };

    /* ===================== STATUS UPDATE ===================== */
    const handleStatusChange = async (complaintId, status) => {
        try {
            await API.put(`/complaints/${complaintId}/status`, { status });

            setComplaints(prev =>
                prev.map(c =>
                    c._id === complaintId ? { ...c, status } : c
                )
            );
        } catch (err) {
            console.error("Status update failed", err);
            alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
        }
    };

    /* ===================== PRIORITY UPDATE ===================== */
    const handlePriorityChange = async (complaintId, priority) => {
        try {
            await API.put(`/complaints/${complaintId}/priority`, { priority });

            setComplaints(prev =>
                prev.map(c =>
                    c._id === complaintId ? { ...c, priority } : c
                )
            );
        } catch (err) {
            console.error("Priority update failed", err);
            alert(`Failed to update priority: ${err.response?.data?.message || err.message}`);
        }
    };

    /* ===================== ASSIGN WORKER ===================== */
    const handleAssignClick = complaint => {
        setSelectedComplaint(complaint);
        setShowAssignModal(true);
    };

    const assignToWorker = async (workerId, workerName) => {
        if (!selectedComplaint) return;

        try {
            setLoading(true);

            const { data } = await API.put(
                `/complaints/${selectedComplaint._id}/assign`,
                {
                    workerId,
                    status: "in-progress",
                    assignedAt: new Date().toISOString()
                }
            );

            setComplaints(prev =>
                prev.map(c =>
                    c._id === selectedComplaint._id
                        ? {
                            ...c,
                            assignedWorker: {
                                _id: workerId,
                                fullName: workerName
                            },
                            status: "in-progress",
                            assignedAt: data.complaint?.assignedAt || new Date().toISOString()
                        }
                        : c
                )
            );

            setShowAssignModal(false);
            setSelectedComplaint(null);
            alert(`✅ Complaint assigned to ${workerName}`);
        } catch (err) {
            console.error("Assign failed", err);
            alert(`Failed to assign: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== FILTER ===================== */
    const filteredComplaints = complaints.filter(c => {
        if (filter !== "all" && c.status !== filter) return false;
        if (selectedPriority !== "all" && c.priority !== selectedPriority) return false;

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                c.complaintType?.toLowerCase().includes(s) ||
                c.complaintId?.toLowerCase().includes(s) ||
                c.description?.toLowerCase().includes(s) ||
                c.address?.toLowerCase().includes(s) ||
                c.user?.fullName?.toLowerCase().includes(s) ||
                c.mobile?.toLowerCase().includes(s)
            );
        }
        return true;
    });

    /* ===================== QUICK ACTIONS ===================== */
    const handleQuickAction = (complaintId, action) => {
        const complaint = complaints.find(c => c._id === complaintId);

        switch (action) {
            case 'call':
                if (complaint?.mobile || complaint?.user?.mobileNumber) {
                    const phone = complaint.mobile || complaint.user.mobileNumber;
                    window.open(`tel:${phone}`);
                }
                break;
            case 'location':
                if (complaint?.address) {
                    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(complaint.address)}`;
                    window.open(mapUrl, '_blank');
                }
                break;
            case 'notes':
                const note = prompt('Add internal notes:');
                if (note) {
                    console.log(`Note added to complaint ${complaintId}:`, note);
                }
                break;
            case 'escalate':
                if (confirm('Escalate this complaint to higher authorities?')) {
                    handlePriorityChange(complaintId, 'high');
                    alert('Complaint escalated to High Priority!');
                }
                break;
        }
    };

    /* ===================== RENDER ===================== */
    if (!complaints || complaints.length === 0) {
        return (
            <div className="no-complaints">
                <h3>No complaints found</h3>
                <p>There are currently no complaints to display.</p>
                <button onClick={() => navigate(-1)}>← Back</button>
            </div>
        );
    }

    /* ===================== UI ===================== */
    return (
        <div className="complaints-container">

            {/* HEADER */}
            <header className="header">
                <div className="header-top">
                    <h1>Complaints Management</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate(-1)}>← Back</button>
                        <button onClick={() => window.location.reload()}>🔄 Refresh</button>
                    </div>
                </div>

                {/* STATS */}
                <div className="stats">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.completed}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="filters">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </header>

            {/* COMPLAINTS LIST */}
            <main className="complaints-list">
                {filteredComplaints.length === 0 ? (
                    <div className="no-results">
                        <p>No complaints found matching your criteria.</p>
                        <button onClick={() => {
                            setFilter('all');
                            setSearchTerm('');
                            setSelectedPriority('all');
                        }}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredComplaints.map(c => {
                        const isAssignedFlag = isAssigned(c);
                        const assignedWorkerName = getWorkerNameById(c.assignedWorker);
                        const isExpanded = expandedId === c._id;

                        return (
                            <div key={c._id} className={`complaint-card ${isExpanded ? 'expanded' : ''}`}>

                                {/* CARD HEADER */}
                                <div className="card-header" onClick={() => toggleExpand(c._id)}>
                                    <div className="header-left">
                                        <h3>{c.complaintType}</h3>
                                        <div className="badges">
                                            {getStatusBadge(c.status)}
                                            {getPriorityBadge(c.priority)}
                                            <span className="complaint-id">ID: {c.complaintId}</span>
                                            {isAssignedFlag && assignedWorkerName && (
                                                <span className="worker-badge">👤 {assignedWorkerName}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="header-right">
                                        <span className="expand-icon">
                                            {isExpanded ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>

                                {/* BASIC INFO */}
                                <div className="basic-info">
                                    <p><strong>Description:</strong> {c.description?.substring(0, 100)}{c.description?.length > 100 ? '...' : ''}</p>
                                    <p><strong>Address:</strong> {c.address}</p>
                                    <p><strong>Reported by:</strong> {c.user?.fullName || c.name} ({c.mobile})</p>
                                    <p><strong>Date:</strong> {new Date(c.createdAt).toLocaleString()}</p>
                                </div>

                                {/* EXPANDED DETAILS */}
                                {isExpanded && (
                                    <div className="expanded-details">
                                        {/* FULL DESCRIPTION */}
                                        <div className="detail-section">
                                            <h4>Full Description</h4>
                                            <p>{c.description}</p>
                                        </div>

                                        {/* USER INFO */}
                                        <div className="detail-section">
                                            <h4>User Information</h4>
                                            <div className="detail-grid">
                                                <div>
                                                    <strong>Full Name:</strong> {c.user?.fullName || c.name}
                                                </div>
                                                <div>
                                                    <strong>Mobile:</strong> {c.mobile || c.user?.mobileNumber}
                                                </div>
                                                <div>
                                                    <strong>Email:</strong> {c.user?.email || 'N/A'}
                                                </div>
                                                <div>
                                                    <strong>Location:</strong> {c.user?.district || 'N/A'}, {c.user?.state || 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ASSIGNMENT INFO */}
                                        {isAssignedFlag && (
                                            <div className="detail-section">
                                                <h4>Assignment Information</h4>
                                                <div className="detail-grid">
                                                    <div>
                                                        <strong>Assigned Worker:</strong> {assignedWorkerName || 'Worker assigned'}
                                                    </div>
                                                    <div>
                                                        <strong>Assigned Date:</strong> {c.assignedAt ? new Date(c.assignedAt).toLocaleString() : 'N/A'}
                                                    </div>
                                                    <div>
                                                        <strong>Status:</strong> {c.status}
                                                    </div>
                                                    <div>
                                                        <strong>Last Updated:</strong> {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ACTIONS */}
                                        <div className="action-section">
                                            {/* QUICK ACTIONS MENU */}
                                            <div className="action-menu-container">
                                                <button
                                                    className="menu-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleActionMenu(c._id);
                                                    }}
                                                >
                                                    ⋮ Quick Actions
                                                </button>

                                                {showActionMenu[c._id] && (
                                                    <div className="action-dropdown">
                                                        <button onClick={() => handleQuickAction(c._id, 'call')}>
                                                            📞 Call User
                                                        </button>
                                                        <button onClick={() => handleQuickAction(c._id, 'location')}>
                                                            📍 View Location
                                                        </button>
                                                        <button onClick={() => handleQuickAction(c._id, 'notes')}>
                                                            📝 Add Notes
                                                        </button>
                                                        <button onClick={() => handleQuickAction(c._id, 'escalate')}>
                                                            ⬆️ Escalate
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* STATUS ACTIONS */}
                                            <div className="status-actions">
                                                <button
                                                    className={`status-btn ${c.status === 'pending' ? 'active' : ''}`}
                                                    onClick={() => handleStatusChange(c._id, 'pending')}
                                                >
                                                    ⏳ Pending
                                                </button>
                                                <button
                                                    className={`status-btn ${c.status === 'in-progress' ? 'active' : ''}`}
                                                    onClick={() => handleStatusChange(c._id, 'in-progress')}
                                                >
                                                    🔄 In Progress
                                                </button>
                                                <button
                                                    className={`status-btn ${c.status === 'completed' ? 'active' : ''}`}
                                                    onClick={() => handleStatusChange(c._id, 'completed')}
                                                >
                                                    ✅ Completed
                                                </button>
                                            </div>

                                            {/* PRIORITY ACTIONS */}
                                            <div className="priority-actions">
                                                <span>Set Priority:</span>
                                                <button
                                                    className={`priority-btn ${c.priority === 'high' ? 'active' : ''}`}
                                                    onClick={() => handlePriorityChange(c._id, 'high')}
                                                >
                                                    🔥 High
                                                </button>
                                                <button
                                                    className={`priority-btn ${c.priority === 'medium' ? 'active' : ''}`}
                                                    onClick={() => handlePriorityChange(c._id, 'medium')}
                                                >
                                                    📋 Medium
                                                </button>
                                                <button
                                                    className={`priority-btn ${c.priority === 'low' ? 'active' : ''}`}
                                                    onClick={() => handlePriorityChange(c._id, 'low')}
                                                >
                                                    📄 Low
                                                </button>
                                            </div>

                                            {/* ASSIGN BUTTON */}
                                            <button
                                                className="assign-btn"
                                                onClick={() => handleAssignClick(c)}
                                            >
                                                👤 {isAssignedFlag ? 'Reassign Worker' : 'Assign Worker'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </main>

            {/* ASSIGN MODAL */}
            {showAssignModal && selectedComplaint && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Assign Complaint to Worker</h3>
                            <button onClick={() => setShowAssignModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="complaint-info">
                                <h4>{selectedComplaint.complaintType}</h4>
                                <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
                                <p><strong>Address:</strong> {selectedComplaint.address}</p>
                            </div>

                            <div className="workers-list">
                                <h4>Available Workers</h4>
                                {workers.length === 0 ? (
                                    <p>Loading workers...</p>
                                ) : (
                                    workers.map(w => (
                                        <div
                                            key={w._id}
                                            className={`worker-item ${w.status}`}
                                            onClick={() => assignToWorker(w._id, w.fullName)}
                                        >
                                            <div className="worker-info">
                                                <h5>{w.fullName}</h5>
                                                <p>{w.mobileNumber}</p>
                                                <p>📍 {w.area}</p>
                                            </div>
                                            <div className="worker-status">
                                                {w.status === 'available' ? '🟢 Available' : '🔴 Busy'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setShowAssignModal(false)} disabled={loading}>
                                Cancel
                            </button>
                            <button onClick={() => {
                                const availableWorker = workers.find(w => w.status === 'available');
                                if (availableWorker) {
                                    assignToWorker(availableWorker._id, availableWorker.fullName);
                                } else {
                                    alert('No available workers found!');
                                }
                            }} disabled={loading}>
                                {loading ? 'Assigning...' : 'Auto Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="footer">
                <p>
                    Showing {filteredComplaints.length} of {complaints.length} complaints
                    {filter !== 'all' && ` (Filtered by: ${filter})`}
                </p>
            </footer>
        </div>
    );
};

export default ShowComplaints;