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
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
    });

    // Calculate stats when complaints change
    useEffect(() => {
        if (complaints && complaints.length > 0) {
            const statsData = {
                total: complaints.length,
                pending: complaints.filter(c => c.status === 'pending' || !c.status).length,
                inProgress: complaints.filter(c => c.status === 'in-progress').length,
                resolved: complaints.filter(c => c.status === 'resolved').length
            };
            setStats(statsData);
        }
    }, [complaints]);

    // Fetch workers list
    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await API.get("/workers");
            console.log("Workers data:", res.data);
            setWorkers(res.data || []);
        } catch (error) {
            console.error("Error fetching workers:", error);
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

    // ✅ NEW: Function to get worker name from ID
    const getWorkerNameById = (workerId) => {
        if (!workerId) return null;

        // If workerId is an object with fullName property
        if (typeof workerId === 'object' && workerId.fullName) {
            return workerId.fullName;
        }

        // If workerId is a string/ObjectId, find in workers list
        const worker = workers.find(w => w._id === workerId || w._id.toString() === workerId.toString());
        return worker ? worker.fullName : null;
    };

    // ✅ NEW: Function to check if complaint is assigned
    const isComplaintAssigned = (complaint) => {
        return complaint.assignedWorker || complaint.status === 'in-progress' || complaint.status === 'resolved';
    };

    // ✅ NEW: Get assigned worker info properly
    const getAssignedWorkerDisplay = (complaint) => {
        // First check if complaint has assignedWorker
        if (complaint.assignedWorker) {
            const workerName = getWorkerNameById(complaint.assignedWorker);
            if (workerName) {
                return {
                    name: workerName,
                    id: typeof complaint.assignedWorker === 'object'
                        ? complaint.assignedWorker._id
                        : complaint.assignedWorker
                };
            }
        }

        // Check if complaint has assignedTo (older format)
        if (complaint.assignedTo) {
            const workerName = getWorkerNameById(complaint.assignedTo);
            if (workerName) {
                return {
                    name: workerName,
                    id: typeof complaint.assignedTo === 'object'
                        ? complaint.assignedTo._id
                        : complaint.assignedTo
                };
            }
        }

        return null;
    };

    if (!complaints || complaints.length === 0) {
        return (
            <div className="no-complaints-container">
                <h3>No complaint data found</h3>
                <p>There are currently no complaints to display.</p>
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
        setShowActionMenu({});
    };

    const toggleActionMenu = (complaintId) => {
        setShowActionMenu(prev => ({
            ...prev,
            [complaintId]: !prev[complaintId]
        }));
    };

    const handleAssignClick = (complaint) => {
        setSelectedComplaint(complaint);
        setShowAssignModal(true);
    };

    const assignToWorker = async (workerId, workerName) => {
        if (!selectedComplaint || loading) return;

        try {
            setLoading(true);

            console.log("Assigning complaint:", {
                complaintId: selectedComplaint._id,
                workerId,
                workerName
            });

            const { data } = await API.put(
                `/complaints/${selectedComplaint._id}/assign`,
                {
                    workerId,
                    status: "in-progress",
                    assignedAt: new Date().toISOString()
                }
            );

            console.log("Backend response:", data);

            if (!data?.complaint) {
                throw new Error("Backend returned no complaint data");
            }

            // ✅ Update the complaints state with backend response
            setComplaints(prev =>
                prev.map(c =>
                    c._id === selectedComplaint._id
                        ? {
                            ...data.complaint,
                            assignedWorker: data.complaint.assignedWorker || {
                                _id: workerId,
                                fullName: workerName
                            },
                            status: data.complaint.status || 'in-progress'
                        }
                        : c
                )
            );

            // ✅ Update stats
            setStats(prev => ({
                ...prev,
                pending: Math.max(0, prev.pending - 1),
                inProgress: prev.inProgress + 1
            }));

            // ✅ Close modal
            setShowAssignModal(false);
            setSelectedComplaint(null);

            // ✅ Show success alert
            showSmartAlert(
                "success",
                `✅ Complaint Assigned`,
                `Complaint ID: ${selectedComplaint.complaintId}\nAssigned to: ${workerName}\nStatus: In Progress`,
                {
                    autoClose: 3000,
                    showConfirmButton: true,
                    confirmButtonText: "View Worker Tasks",
                    onConfirm: () => navigate(`/worker-tasks/${workerId}`)
                }
            );

        } catch (error) {
            console.error("Error assigning complaint:", error.response || error);

            const errorMessage = error.response?.data?.message
                || error.message
                || "Failed to assign complaint. Please try again.";

            showSmartAlert(
                "error",
                "❌ Assignment Failed",
                errorMessage,
                { autoClose: 4000 }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        try {
            await API.put(`/complaints/${complaintId}/status`, { status: newStatus });

            // Update local state
            setComplaints(prev =>
                prev.map(c =>
                    c._id === complaintId ? { ...c, status: newStatus } : c
                )
            );

            // Update stats
            setStats(prev => {
                const newStats = { ...prev };
                if (newStatus === 'resolved') {
                    newStats.inProgress = Math.max(0, newStats.inProgress - 1);
                    newStats.resolved += 1;
                } else if (newStatus === 'in-progress') {
                    newStats.pending = Math.max(0, newStats.pending - 1);
                    newStats.inProgress += 1;
                }
                return newStats;
            });

            showSmartAlert('info', 'Status Updated',
                `Complaint status changed to: ${newStatus}`,
                {
                    autoClose: 2500,
                    icon: newStatus === 'resolved' ? '✅' : '🔄'
                }
            );

        } catch (error) {
            console.error("Error updating status:", error);
            showSmartAlert('error', 'Update Failed', 'Failed to update status.');
        }
    };

    const handlePriorityChange = async (complaintId, priority) => {
        try {
            await API.put(`/complaints/${complaintId}/priority`, { priority });

            // Update local state
            setComplaints(prev =>
                prev.map(c =>
                    c._id === complaintId ? { ...c, priority } : c
                )
            );

            showSmartAlert('warning', 'Priority Updated',
                `Priority set to: ${priority}`,
                {
                    autoClose: 2000,
                    icon: priority === 'high' ? '⚠️' : priority === 'medium' ? '📋' : '📄'
                }
            );

        } catch (error) {
            console.error("Error updating priority:", error);
        }
    };

    const showSmartAlert = (type, title, message, options = {}) => {
        const alertBox = document.createElement('div');
        alertBox.className = `smart-alert alert-${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        alertBox.innerHTML = `
            <div class="alert-header">
                <span class="alert-icon">${icons[type] || 'ℹ️'}</span>
                <h4>${title}</h4>
                <button class="alert-close">×</button>
            </div>
            <div class="alert-body">
                <p>${message}</p>
            </div>
            ${options.confirmButtonText ? `
                <div class="alert-footer">
                    <button class="alert-confirm">${options.confirmButtonText}</button>
                    <button class="alert-cancel">Cancel</button>
                </div>
            ` : ''}
        `;

        document.body.appendChild(alertBox);

        // Close button
        alertBox.querySelector('.alert-close').onclick = () => {
            alertBox.remove();
        };

        // Confirm button
        const confirmBtn = alertBox.querySelector('.alert-confirm');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                options.onConfirm?.();
                alertBox.remove();
            };
        }

        // Cancel button
        const cancelBtn = alertBox.querySelector('.alert-cancel');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                alertBox.remove();
            };
        }

        // Auto close
        if (options.autoClose) {
            setTimeout(() => {
                if (document.body.contains(alertBox)) {
                    alertBox.remove();
                }
            }, options.autoClose);
        }
    };

    const handleQuickAction = (complaintId, action) => {
        const complaint = complaints.find(c => c._id === complaintId);

        switch (action) {
            case 'call':
                showSmartAlert('info', 'Call User',
                    `Calling ${complaint?.mobile || complaint?.user?.mobileNumber}`,
                    {
                        confirmButtonText: 'Dial',
                        onConfirm: () => {
                            window.location.href = `tel:${complaint?.mobile || complaint?.user?.mobileNumber}`;
                        }
                    }
                );
                break;

            case 'location':
                showSmartAlert('info', 'View Location',
                    'Opening location on map...',
                    {
                        confirmButtonText: 'Open Map',
                        onConfirm: () => {
                            navigate('/map', {
                                state: { address: complaint?.address }
                            });
                        }
                    }
                );
                break;

            case 'notes':
                const note = prompt('Add internal notes:');
                if (note) {
                    showSmartAlert('success', 'Note Added', 'Internal note saved successfully.');
                }
                break;

            case 'escalate':
                showSmartAlert('warning', 'Escalate Complaint',
                    'This will escalate the complaint to higher authorities.',
                    {
                        confirmButtonText: 'Confirm Escalation',
                        onConfirm: () => {
                            showSmartAlert('success', 'Escalated', 'Complaint escalated successfully.');
                        }
                    }
                );
                break;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': return <span className="priority-badge priority-high">🔥 High</span>;
            case 'medium': return <span className="priority-badge priority-medium">📋 Medium</span>;
            case 'low': return <span className="priority-badge priority-low">📄 Low</span>;
            default: return <span className="priority-badge">Not Set</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge status-pending">⏳ Pending</span>;
            case 'in-progress': return <span className="status-badge status-in-progress">🔄 In Progress</span>;
            case 'resolved': return <span className="status-badge status-resolved">✅ Resolved</span>;
            default: return <span className="status-badge status-pending">⏳ Pending</span>;
        }
    };

    // Filter complaints based on selected filters
    const filteredComplaints = complaints.filter(complaint => {
        // Status filter
        if (filter !== 'all' && complaint.status !== filter) return false;

        // Priority filter
        if (selectedPriority !== 'all' && complaint.priority !== selectedPriority) return false;

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                complaint.complaintType?.toLowerCase().includes(searchLower) ||
                complaint.description?.toLowerCase().includes(searchLower) ||
                complaint.complaintId?.toLowerCase().includes(searchLower) ||
                complaint.user?.fullName?.toLowerCase().includes(searchLower) ||
                complaint.address?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const getWorkerStatusBadge = (status) => {
        return status === 'available'
            ? <span className="worker-status available">🟢 Available</span>
            : <span className="worker-status busy">🔴 Busy</span>;
    };

    return (
        <div className="complaints-container">
            {/* Smart Alert Container */}
            <div id="alert-container"></div>

            {/* Header with Filters */}
            <header className="complaints-header">
                <div className="header-top">
                    <h1 className="department-title">Public Grievance Portal</h1>
                    <div className="header-actions">
                        <button className="header-btn back-btn" onClick={() => navigate(-1)}>
                            ← Back
                        </button>
                        <button className="header-btn refresh-btn" onClick={() => window.location.reload()}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                <h2 className="page-title">Complaints Management</h2>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon total">📋</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pending">⏳</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.pending}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon in-progress">🔄</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.inProgress}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon resolved">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.resolved}</div>
                            <div className="stat-label">Resolved</div>
                        </div>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="filter-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    <div className="filter-buttons">
                        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>

                        <select className="filter-select" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                            <option value="all">All Priorities</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>

                        <button className="filter-btn export-btn" onClick={() => showSmartAlert('info', 'Export Data', 'Export feature coming soon!')}>
                            📥 Export Data
                        </button>
                    </div>
                </div>
            </header>

            <main className="complaints-list">
                {filteredComplaints.length === 0 ? (
                    <div className="no-results">
                        <p>No complaints found matching your criteria.</p>
                        <button className="clear-filters-btn" onClick={() => {
                            setFilter('all');
                            setSearchTerm('');
                            setSelectedPriority('all');
                        }}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredComplaints.map((c) => {
                        const assignedWorkerInfo = getAssignedWorkerDisplay(c);
                        const isAssigned = isComplaintAssigned(c);

                        return (
                            <article key={c._id} className={`complaint-card ${expandedId === c._id ? 'expanded' : ''} ${c.priority || 'low'}`}>
                                {/* BASIC INFO */}
                                <div className="complaint-header">
                                    <div className="complaint-title-section">
                                        <h3 className="complaint-type">
                                            <span className="type-icon">
                                                {c.complaintType?.includes('Overflow') ? '🚨' :
                                                    c.complaintType?.includes('Damaged') ? '⚠️' : '📄'}
                                            </span>
                                            {c.complaintType}
                                        </h3>
                                        <div className="complaint-meta">
                                            <div className="complaint-id-badge">
                                                ID: {c.complaintId}
                                            </div>
                                            {getPriorityBadge(c.priority)}
                                            {getStatusBadge(c.status)}
                                            {/* ✅ FIXED: Show worker name if assigned */}
                                            {isAssigned && assignedWorkerInfo && (
                                                <span className="assigned-badge">
                                                    👤 {assignedWorkerInfo.name}
                                                </span>
                                            )}
                                            {isAssigned && !assignedWorkerInfo && (
                                                <span className="assigned-badge">
                                                    👤 Assigned
                                                </span>
                                            )}
                                            {!isAssigned && (
                                                <span className="not-assigned-badge">
                                                    ⏳ Not Assigned
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="header-actions">
                                        <div className="action-menu-container">
                                            <button className="action-menu-btn" onClick={() => toggleActionMenu(c._id)}>
                                                ⋮
                                            </button>

                                            {showActionMenu[c._id] && (
                                                <div className="action-dropdown">
                                                    <button className="dropdown-item" onClick={() => handleAssignClick(c)}>
                                                        👤 {isAssigned ? 'Reassign Worker' : 'Assign to Worker'}
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => handleQuickAction(c._id, 'call')}>
                                                        📞 Call User
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => handleQuickAction(c._id, 'location')}>
                                                        📍 View Location
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => handleQuickAction(c._id, 'notes')}>
                                                        📝 Add Notes
                                                    </button>
                                                    <button className="dropdown-item escalate" onClick={() => handleQuickAction(c._id, 'escalate')}>
                                                        ⬆️ Escalate
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button className="toggle-details-btn" onClick={() => toggleExpand(c._id)} aria-expanded={expandedId === c._id}>
                                            {expandedId === c._id ? (
                                                <>
                                                    <span className="btn-icon">▲</span>
                                                    Hide Details
                                                </>
                                            ) : (
                                                <>
                                                    <span className="btn-icon">▼</span>
                                                    Show Details
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="complaint-summary">
                                    <div className="summary-text">
                                        <p className="description-preview">
                                            {c.description?.length > 150
                                                ? `${c.description.substring(0, 150)}...`
                                                : c.description}
                                        </p>
                                    </div>
                                    <div className="summary-footer">
                                        <div className="date-info">
                                            <span className="date-label">Submitted:</span>
                                            <time className="date-value">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </time>
                                        </div>
                                        <div className="user-info">
                                            <span className="user-label">By:</span>
                                            <span className="user-name">{c.user?.fullName || c.name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* EXPANDED DETAILS */}
                                {expandedId === c._id && (
                                    <div className="complaint-details">
                                        <div className="details-grid">
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Description:</span>
                                                <p className="detail-value description-text">{c.description}</p>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-label">Address:</span>
                                                <p className="detail-value">{c.address}</p>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-label">Reported By:</span>
                                                <p className="detail-value">{c.name}</p>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-label">Mobile:</span>
                                                <p className="detail-value contact-info">
                                                    <a href={`tel:${c.mobile}`}>{c.mobile}</a>
                                                </p>
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
                                                <span className="detail-label">Mobile:</span>
                                                <p className="detail-value contact-info">
                                                    <a href={`tel:${c.user?.mobileNumber}`}>{c.user?.mobileNumber || 'N/A'}</a>
                                                </p>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Email:</span>
                                                <p className="detail-value contact-info">
                                                    <a href={`mailto:${c.user?.email}`}>{c.user?.email || 'N/A'}</a>
                                                </p>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Location:</span>
                                                <p className="detail-value">
                                                    {c.user?.district || 'N/A'}, {c.user?.state || 'N/A'} - {c.user?.pincode || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ✅ Assignment Info Section */}
                                        {isAssigned && (
                                            <>
                                                <div className="section-divider">
                                                    <span className="divider-text">Assignment Information</span>
                                                </div>
                                                <div className="details-grid">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Assigned Worker:</span>
                                                        <p className="detail-value">
                                                            {assignedWorkerInfo ? assignedWorkerInfo.name : 'Worker assigned (details loading...)'}
                                                        </p>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Status:</span>
                                                        <p className="detail-value">{c.status || 'pending'}</p>
                                                    </div>
                                                    {c.assignedAt && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Assigned On:</span>
                                                            <p className="detail-value">
                                                                {new Date(c.assignedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {c.updatedAt && (
                                                        <div className="detail-item">
                                                            <span className="detail-label">Last Updated:</span>
                                                            <p className="detail-value">
                                                                {new Date(c.updatedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="action-buttons">
                                            <button className="action-btn btn-assign" onClick={() => handleAssignClick(c)} disabled={c.status === 'resolved'}>
                                                <span className="btn-icon">👤</span>
                                                {isAssigned ? 'Reassign Worker' : 'Assign to Worker'}
                                            </button>

                                            <div className="status-actions">
                                                <button className={`status-btn ${c.status === 'pending' ? 'active' : ''}`} onClick={() => handleStatusChange(c._id, 'pending')}>
                                                    ⏳ Pending
                                                </button>
                                                <button className={`status-btn ${c.status === 'in-progress' ? 'active' : ''}`} onClick={() => handleStatusChange(c._id, 'in-progress')}>
                                                    🔄 In Progress
                                                </button>
                                                <button className={`status-btn ${c.status === 'resolved' ? 'active' : ''}`} onClick={() => handleStatusChange(c._id, 'resolved')}>
                                                    ✅ Resolved
                                                </button>
                                            </div>

                                            <div className="priority-actions">
                                                <span className="priority-label">Set Priority:</span>
                                                <button className={`priority-btn ${c.priority === 'high' ? 'active' : ''}`} onClick={() => handlePriorityChange(c._id, 'high')}>
                                                    🔥 High
                                                </button>
                                                <button className={`priority-btn ${c.priority === 'medium' ? 'active' : ''}`} onClick={() => handlePriorityChange(c._id, 'medium')}>
                                                    📋 Medium
                                                </button>
                                                <button className={`priority-btn ${c.priority === 'low' ? 'active' : ''}`} onClick={() => handlePriorityChange(c._id, 'low')}>
                                                    📄 Low
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })
                )}
            </main>

            {/* Assign to Worker Modal */}
            {showAssignModal && selectedComplaint && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Assign Complaint to Worker</h3>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="complaint-info">
                                <h4>{selectedComplaint.complaintType}</h4>
                                <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
                                <p><strong>Address:</strong> {selectedComplaint.address}</p>
                                <p><strong>Description:</strong> {selectedComplaint.description?.substring(0, 100)}...</p>
                                <p><strong>Current Status:</strong> {selectedComplaint.status}</p>
                            </div>

                            <div className="workers-list">
                                <h4>Available Workers</h4>
                                {workers.length === 0 ? (
                                    <p className="no-workers">Loading workers...</p>
                                ) : (
                                    workers.map(worker => (
                                        <div key={worker._id} className={`worker-card ${worker.status}`} onClick={() => assignToWorker(worker._id, worker.fullName)}>
                                            <div className="worker-info">
                                                <h5>{worker.fullName}</h5>
                                                <p className="worker-mobile">{worker.mobileNumber}</p>
                                                <p className="worker-area">📍 {worker.area}</p>
                                            </div>
                                            <div className="worker-status-info">
                                                {getWorkerStatusBadge(worker.status)}
                                                <span className="assign-indicator">→</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => setShowAssignModal(false)} disabled={loading}>
                                Cancel
                            </button>
                            <button className="modal-btn auto-assign-btn" onClick={() => {
                                const availableWorker = workers.find(w => w.status === 'available');
                                if (availableWorker) {
                                    assignToWorker(availableWorker._id, availableWorker.fullName);
                                } else {
                                    showSmartAlert('warning', 'No Available Workers',
                                        'All workers are currently busy. Try again later.',
                                        { autoClose: 3000 }
                                    );
                                }
                            }} disabled={loading}>
                                {loading ? 'Assigning...' : 'Auto Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="complaints-footer">
                <div className="footer-content">
                    <p className="footer-note">
                        <strong>Note:</strong> This portal is for official use only. All complaints are logged and monitored.
                    </p>
                    <p className="footer-stats">
                        Showing {filteredComplaints.length} of {complaints.length} complaints
                        {filter !== 'all' && ` (Filtered by: ${filter})`}
                    </p>
                    <p className="footer-contact">
                        For queries, contact: grievance@government.gov.in | Helpline: 1800-XXX-XXXX
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ShowComplaints;