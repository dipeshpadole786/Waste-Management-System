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
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

    useEffect(() => {
        setStats({
            total: complaints.length,
            pending: complaints.filter(c => c.status === "pending").length,
            inProgress: complaints.filter(c => c.status === "in-progress").length,
            completed: complaints.filter(c => c.status === "completed").length,
        });
    }, [complaints]);

    useEffect(() => { fetchWorkers(); }, []);

    const fetchWorkers = async () => {
        try {
            const res = await API.get("/workers");
            setWorkers(res.data || []);
        } catch {
            setWorkers([
                { _id: "1", fullName: "Rajesh Kumar", mobileNumber: "9876543210", area: "Zone A", status: "available" },
                { _id: "2", fullName: "Suresh Patel", mobileNumber: "9876543211", area: "Zone B", status: "available" },
                { _id: "3", fullName: "Amit Sharma", mobileNumber: "9876543212", area: "Zone C", status: "busy" },
                { _id: "4", fullName: "Vikram Singh", mobileNumber: "9876543213", area: "Zone D", status: "available" },
                { _id: "5", fullName: "Anil Gupta", mobileNumber: "9876543214", area: "Zone A", status: "available" },
            ]);
        }
    };

    const isAssigned = c => c.assignedWorker || c.status !== "pending";

    const getWorkerNameById = workerId => {
        if (!workerId) return null;
        if (typeof workerId === 'object' && workerId.fullName) return workerId.fullName;
        const w = workers.find(w => w._id === workerId || w._id?.toString() === workerId?.toString());
        return w ? w.fullName : null;
    };

    const handleStatusChange = async (complaintId, status) => {
        try {
            await API.put(`/complaints/${complaintId}/status`, { status });
            setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, status } : c));
        } catch (err) { alert(`Failed to update status: ${err.response?.data?.message || err.message}`); }
    };

    const handlePriorityChange = async (complaintId, priority) => {
        try {
            await API.put(`/complaints/${complaintId}/priority`, { priority });
            setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, priority } : c));
        } catch (err) { alert(`Failed to update priority: ${err.response?.data?.message || err.message}`); }
    };

    const assignToWorker = async (workerId, workerName) => {
        if (!selectedComplaint) return;
        try {
            setLoading(true);
            const { data } = await API.put(`/complaints/${selectedComplaint._id}/assign`, {
                workerId, status: "in-progress", assignedAt: new Date().toISOString()
            });
            setComplaints(prev => prev.map(c =>
                c._id === selectedComplaint._id
                    ? { ...c, assignedWorker: { _id: workerId, fullName: workerName }, status: "in-progress", assignedAt: data.complaint?.assignedAt || new Date().toISOString() }
                    : c
            ));
            setShowAssignModal(false);
            setSelectedComplaint(null);
            alert(`✅ Complaint assigned to ${workerName}`);
        } catch (err) { alert(`Failed to assign: ${err.response?.data?.message || err.message}`); }
        finally { setLoading(false); }
    };

    const handleQuickAction = (complaintId, action) => {
        const c = complaints.find(c => c._id === complaintId);
        switch (action) {
            case 'call':
                const phone = c?.mobile || c?.user?.mobileNumber;
                if (phone) window.open(`tel:${phone}`);
                break;
            case 'location':
                if (c?.address) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`, '_blank');
                break;
            case 'notes':
                const note = prompt('Add internal notes:');
                if (note) console.log(`Note for ${complaintId}:`, note);
                break;
            case 'escalate':
                if (window.confirm('Escalate to higher authorities?')) {
                    handlePriorityChange(complaintId, 'high');
                    alert('Escalated to High Priority!');
                }
                break;
        }
        setShowActionMenu(prev => ({ ...prev, [complaintId]: false }));
    };

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

    if (!complaints || complaints.length === 0) return (
        <div className="sc-empty">
            <div className="sc-empty-icon">📭</div>
            <h3>No complaints found</h3>
            <p>There are currently no complaints to display.</p>
            <button className="sc-btn sc-btn--primary" onClick={() => navigate(-1)}>← Back</button>
        </div>
    );

    return (
        <div className="sc-page">

            {/* Header */}
            <div className="sc-header">
                <div>
                    <div className="sc-eyebrow">Admin Dashboard</div>
                    <h1 className="sc-title">Complaints Management</h1>
                </div>
                <div className="sc-header-actions">
                    <button className="sc-btn sc-btn--ghost" onClick={() => navigate(-1)}>← Back</button>
                    <button className="sc-btn sc-btn--outline" onClick={() => window.location.reload()}>🔄 Refresh</button>
                </div>
            </div>

            {/* Stats */}
            <div className="sc-stats">
                {[
                    { val: stats.total, lbl: "Total", cls: "" },
                    { val: stats.pending, lbl: "Pending", cls: "sc-stat--pending" },
                    { val: stats.inProgress, lbl: "In Progress", cls: "sc-stat--progress" },
                    { val: stats.completed, lbl: "Completed", cls: "sc-stat--done" },
                ].map(s => (
                    <div key={s.lbl} className={`sc-stat ${s.cls}`}>
                        <div className="sc-stat-val">{s.val}</div>
                        <div className="sc-stat-lbl">{s.lbl}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="sc-filters">
                <div className="sc-search-wrap">
                    <span className="sc-search-icon">🔍</span>
                    <input
                        type="text"
                        className="sc-search"
                        placeholder="Search complaints…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sc-filter-selects">
                    <select className="sc-select" value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select className="sc-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div className="sc-results-count">{filteredComplaints.length} of {complaints.length} complaints</div>
            </div>

            {/* Complaints List */}
            <div className="sc-list">
                {filteredComplaints.length === 0 ? (
                    <div className="sc-no-results">
                        <p>No complaints match your filters.</p>
                        <button className="sc-btn sc-btn--primary" onClick={() => { setFilter('all'); setSearchTerm(''); setSelectedPriority('all'); }}>
                            Clear Filters
                        </button>
                    </div>
                ) : filteredComplaints.map(c => {
                    const assignedWorkerName = getWorkerNameById(c.assignedWorker);
                    const isExpanded = expandedId === c._id;

                    return (
                        <div key={c._id} className={`sc-card ${isExpanded ? 'sc-card--expanded' : ''}`}>

                            {/* Card Header */}
                            <div className="sc-card-head" onClick={() => setExpandedId(isExpanded ? null : c._id)}>
                                <div className="sc-card-head-left">
                                    <h3 className="sc-card-type">{c.complaintType}</h3>
                                    <div className="sc-badges">
                                        <span className={`sc-status-pill sc-status--${(c.status || 'pending').replace('-', '')}`}>
                                            {c.status === 'pending' ? '⏳' : c.status === 'in-progress' ? '🔄' : '✅'} {c.status || 'Pending'}
                                        </span>
                                        {c.priority && (
                                            <span className={`sc-priority-pill sc-priority--${c.priority}`}>
                                                {c.priority === 'high' ? '🔥' : c.priority === 'medium' ? '📋' : '📄'} {c.priority}
                                            </span>
                                        )}
                                        <span className="sc-id-tag">{c.complaintId}</span>
                                        {assignedWorkerName && <span className="sc-worker-tag">👤 {assignedWorkerName}</span>}
                                    </div>
                                </div>
                                <span className="sc-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                            </div>

                            {/* Basic Info */}
                            <div className="sc-basic-info">
                                <div className="sc-info-row">
                                    <span className="sc-info-label">Description</span>
                                    <span className="sc-info-val">{c.description?.substring(0, 120)}{c.description?.length > 120 ? '…' : ''}</span>
                                </div>
                                <div className="sc-info-row">
                                    <span className="sc-info-label">Address</span>
                                    <span className="sc-info-val">{c.address}</span>
                                </div>
                                <div className="sc-info-row">
                                    <span className="sc-info-label">Reported by</span>
                                    <span className="sc-info-val">{c.user?.fullName || c.name} · {c.mobile}</span>
                                </div>
                                <div className="sc-info-row">
                                    <span className="sc-info-label">Filed</span>
                                    <span className="sc-info-val">{new Date(c.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Expanded */}
                            {isExpanded && (
                                <div className="sc-expanded">
                                    <div className="sc-detail-section">
                                        <h4>Full Description</h4>
                                        <p>{c.description}</p>
                                    </div>

                                    <div className="sc-detail-section">
                                        <h4>User Information</h4>
                                        <div className="sc-detail-grid">
                                            <div><span className="sc-dl">Name</span><span className="sc-dv">{c.user?.fullName || c.name}</span></div>
                                            <div><span className="sc-dl">Mobile</span><span className="sc-dv">{c.mobile || c.user?.mobileNumber}</span></div>
                                            <div><span className="sc-dl">Email</span><span className="sc-dv">{c.user?.email || 'N/A'}</span></div>
                                            <div><span className="sc-dl">Location</span><span className="sc-dv">{c.user?.district || 'N/A'}, {c.user?.state || 'N/A'}</span></div>
                                        </div>
                                    </div>

                                    {isAssigned(c) && (
                                        <div className="sc-detail-section">
                                            <h4>Assignment</h4>
                                            <div className="sc-detail-grid">
                                                <div><span className="sc-dl">Worker</span><span className="sc-dv">{assignedWorkerName || 'Assigned'}</span></div>
                                                <div><span className="sc-dl">Assigned</span><span className="sc-dv">{c.assignedAt ? new Date(c.assignedAt).toLocaleString() : 'N/A'}</span></div>
                                                <div><span className="sc-dl">Status</span><span className="sc-dv">{c.status}</span></div>
                                                <div><span className="sc-dl">Updated</span><span className="sc-dv">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 'N/A'}</span></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="sc-action-section">
                                        {/* Quick Actions */}
                                        <div className="sc-action-menu-wrap">
                                            <button className="sc-btn sc-btn--menu" onClick={e => { e.stopPropagation(); setShowActionMenu(prev => ({ ...prev, [c._id]: !prev[c._id] })); }}>
                                                ⋮ Quick Actions
                                            </button>
                                            {showActionMenu[c._id] && (
                                                <div className="sc-action-dropdown">
                                                    {[
                                                        { action: 'call', label: '📞 Call User' },
                                                        { action: 'location', label: '📍 View Location' },
                                                        { action: 'notes', label: '📝 Add Notes' },
                                                        { action: 'escalate', label: '⬆️ Escalate' },
                                                    ].map(a => (
                                                        <button key={a.action} onClick={() => handleQuickAction(c._id, a.action)}>{a.label}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Buttons */}
                                        <div className="sc-btn-group">
                                            {[
                                                { val: 'pending', label: '⏳ Pending' },
                                                { val: 'in-progress', label: '🔄 In Progress' },
                                                { val: 'completed', label: '✅ Completed' },
                                            ].map(s => (
                                                <button key={s.val} className={`sc-toggle-btn ${c.status === s.val ? `active sc-toggle--${s.val.replace('-', '')}` : ''}`} onClick={() => handleStatusChange(c._id, s.val)}>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Priority Buttons */}
                                        <div className="sc-btn-group">
                                            <span className="sc-group-label">Priority:</span>
                                            {[
                                                { val: 'high', label: '🔥 High' },
                                                { val: 'medium', label: '📋 Medium' },
                                                { val: 'low', label: '📄 Low' },
                                            ].map(p => (
                                                <button key={p.val} className={`sc-toggle-btn ${c.priority === p.val ? `active sc-toggle--${p.val}` : ''}`} onClick={() => handlePriorityChange(c._id, p.val)}>
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>

                                        <button className="sc-btn sc-btn--assign" onClick={() => { setSelectedComplaint(c); setShowAssignModal(true); }}>
                                            👤 {isAssigned(c) ? 'Reassign Worker' : 'Assign Worker'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Assign Modal */}
            {showAssignModal && selectedComplaint && (
                <div className="sc-modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="sc-modal" onClick={e => e.stopPropagation()}>
                        <div className="sc-modal-head">
                            <h3>Assign Complaint</h3>
                            <button className="sc-modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
                        </div>
                        <div className="sc-modal-body">
                            <div className="sc-complaint-info">
                                <h4>{selectedComplaint.complaintType}</h4>
                                <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
                                <p><strong>Address:</strong> {selectedComplaint.address}</p>
                            </div>
                            <h4 className="sc-workers-title">Available Workers</h4>
                            <div className="sc-workers-list">
                                {workers.length === 0 ? <p>Loading workers…</p> : workers.map(w => (
                                    <div key={w._id} className={`sc-worker-item sc-worker--${w.status}`} onClick={() => assignToWorker(w._id, w.fullName)}>
                                        <div className="sc-worker-avatar">{w.fullName?.charAt(0)}</div>
                                        <div className="sc-worker-info">
                                            <div className="sc-worker-name">{w.fullName}</div>
                                            <div className="sc-worker-meta">{w.mobileNumber} · 📍 {w.area}</div>
                                        </div>
                                        <div className={`sc-worker-status ${w.status === 'available' ? 'sc-worker-status--avail' : 'sc-worker-status--busy'}`}>
                                            {w.status === 'available' ? '🟢 Available' : '🔴 Busy'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sc-modal-foot">
                            <button className="sc-btn sc-btn--outline" onClick={() => setShowAssignModal(false)} disabled={loading}>Cancel</button>
                            <button className="sc-btn sc-btn--primary" disabled={loading} onClick={() => {
                                const avail = workers.find(w => w.status === 'available');
                                if (avail) assignToWorker(avail._id, avail.fullName);
                                else alert('No available workers!');
                            }}>
                                {loading ? 'Assigning…' : '⚡ Auto Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="sc-footer">
                Showing {filteredComplaints.length} of {complaints.length} complaints{filter !== 'all' ? ` · Filtered: ${filter}` : ''}
            </footer>
        </div>
    );
};

export default ShowComplaints;