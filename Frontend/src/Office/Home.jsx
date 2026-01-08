import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./Home2.css"

// Create axios instance
const API = axios.create({
    baseURL: "http://localhost:3000"
});

const Homef = () => {
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        inProgressComplaints: 0
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [complaintsByStatus, setComplaintsByStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'progress'
    const [articleCount, setArticleCount] = useState(0);

    const navigate = useNavigate();

    // Fetch all data on component mount
    const pp = async () => {
        const res = await API.get(`/articles`);
        setArticleCount(res.data.length);
    }

    useEffect(() => {
        pp();

        fetchDashboardData();

        const interval = setInterval(() => {
            refreshData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleDetailedComplaints = async () => {
        try {
            const res = await API.get("/c_data");
            navigate("/show-complaints", { state: res.data });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUserProgress = async () => {
        try {
            const res = await API.get("/users/progress");

            if (!res.data?.data || res.data.data.length === 0) {
                alert("No user progress data found");
                return;
            }

            console.log("FULL BACKEND RESPONSE ↓↓↓");
            console.log(JSON.stringify(res.data, null, 2));

            navigate("/user-progress", {
                state: res.data.data
            });
        } catch (error) {
            console.error("Error fetching user progress:", error);
            alert("Could not load user progress data");
        }
    };



    const handleTriningData = async (status) => {
        try {
            const res = await API.get(`/articles`);
            navigate("/editArtical", {
                state: {
                    data: res.data,
                    status: status
                }

            });
        } catch (error) {
            console.error(`Error fetching ${status} complaints:`, error);
            alert(`Could not load ${status} complaints`);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch dashboard statistics
            const statsResponse = await API.get('/monitor/stats');
            console.log('Stats data:', statsResponse.data);

            if (statsResponse.data.success) {
                const { stats, recent } = statsResponse.data;

                // Set metrics with status breakdown
                setMetrics({
                    totalUsers: stats.totalUsers || 0,
                    totalComplaints: stats.totalComplaints || 0,
                    pendingComplaints: stats.pendingComplaints || 0,
                    resolvedComplaints: stats.resolvedComplaints || 0,
                    inProgressComplaints: stats.inProgressComplaints || 0
                });

                // Process recent activities
                const activities = [];

                // Add recent complaints with status
                recent.complaints?.forEach(complaint => {
                    activities.push({
                        id: complaint._id,
                        user: complaint.user?.fullName || 'Unknown User',
                        action: `Filed: ${complaint.complaintType}`,
                        time: formatTimeAgo(complaint.createdAt),
                        icon: '📋',
                        type: 'complaint',
                        status: complaint.status || 'pending',
                        statusColor: getStatusColor(complaint.status)
                    });
                });

                // Add recent user registrations
                recent.users?.forEach(user => {
                    activities.push({
                        id: user._id,
                        user: user.fullName || 'New User',
                        action: 'Registered',
                        time: formatTimeAgo(user.createdAt),
                        icon: '👤',
                        type: 'registration'
                    });
                });

                // Sort activities by time (newest first)
                activities.sort((a, b) => new Date(b.time) - new Date(a.time));
                setRecentActivities(activities);

                // Group complaints by status
                if (recent.complaints) {
                    const groupedByStatus = recent.complaints.reduce((acc, complaint) => {
                        const status = complaint.status || 'pending';
                        if (!acc[status]) {
                            acc[status] = [];
                        }
                        acc[status].push({
                            id: complaint._id,
                            title: complaint.complaintType,
                            user: complaint.user?.fullName || 'Anonymous',
                            time: formatTimeAgo(complaint.createdAt),
                            description: complaint.description?.substring(0, 50) + '...' || 'No description'
                        });
                        return acc;
                    }, {});

                    setComplaintsByStatus([
                        {
                            status: 'pending',
                            title: 'Pending Complaints',
                            count: stats.pendingComplaints || 0,
                            icon: '⏳',
                            color: '#f59e0b',
                            items: groupedByStatus.pending || []
                        },
                        {
                            status: 'in-progress',
                            title: 'In Progress',
                            count: stats.inProgressComplaints || 0,
                            icon: '🔄',
                            color: '#3b82f6',
                            items: groupedByStatus['in-progress'] || []
                        },
                        {
                            status: 'resolved',
                            title: 'Resolved',
                            count: stats.resolvedComplaints || 0,
                            icon: '✅',
                            color: '#10b981',
                            items: groupedByStatus.resolved || []
                        }
                    ]);
                }

            } else {
                throw new Error('Failed to fetch stats');
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        try {
            const statsResponse = await API.get('/monitor/stats');
            if (statsResponse.data.success) {
                const { stats, recent } = statsResponse.data;

                setMetrics(prev => ({
                    ...prev,
                    totalUsers: stats.totalUsers || prev.totalUsers,
                    totalComplaints: stats.totalComplaints || prev.totalComplaints,
                    pendingComplaints: stats.pendingComplaints || prev.pendingComplaints,
                    resolvedComplaints: stats.resolvedComplaints || prev.resolvedComplaints,
                    inProgressComplaints: stats.inProgressComplaints || prev.inProgressComplaints
                }));

                // Update recent activities
                if (recent?.complaints?.length > 0) {
                    const newActivities = recent.complaints.map(complaint => ({
                        id: complaint._id,
                        user: complaint.user?.fullName || 'Unknown User',
                        action: `Filed: ${complaint.complaintType}`,
                        time: formatTimeAgo(complaint.createdAt),
                        icon: '📋',
                        type: 'complaint',
                        status: complaint.status || 'pending',
                        statusColor: getStatusColor(complaint.status)
                    }));

                    setRecentActivities(prev => {
                        const combined = [...newActivities, ...prev];
                        return combined.slice(0, 10);
                    });
                }
            }
        } catch (err) {
            console.log('Background refresh failed:', err);
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Just now';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffDays > 0) return `${diffDays}d ago`;
            if (diffHours > 0) return `${diffHours}h ago`;
            if (diffMins > 0) return `${diffMins}m ago`;
            return 'Just now';
        } catch (err) {
            return 'Recently';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'in-progress': return '#3b82f6';
            case 'resolved': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'in-progress': return '🔄';
            case 'resolved': return '✅';
            default: return '📋';
        }
    };

    const handleRefreshData = async () => {
        setLoading(true);
        try {
            await fetchDashboardData();
        } catch (err) {
            console.error('Error refreshing data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-screen">
                <div className="error-icon">⚠️</div>
                <h3>Error Loading Dashboard</h3>
                <p>{error}</p>
                <button
                    className="retry-btn"
                    onClick={fetchDashboardData}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="monitor-home">
            {/* Main Content */}
            <main className="monitor-content">
                {/* Metrics Grid - Extended with status breakdown */}
                <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {/* Total Users Card */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <div className="metric-icon" style={{ backgroundColor: '#4f46e515' }}>
                                <span style={{ color: '#4f46e5' }}>👥</span>
                            </div>
                        </div>
                        <div className="metric-value">
                            {metrics.totalUsers.toLocaleString()}
                        </div>
                        <div className="metric-title">Total Users</div>
                        <button
                            className="detail-btn"
                            onClick={handleUserProgress}
                        >
                            View Progress →
                        </button>
                    </div>

                    {/* Total Complaints Card */}
                    <div className="metric-card">
                        <div className="metric-header">
                            <div className="metric-icon" style={{ backgroundColor: '#f59e0b15' }}>
                                <span style={{ color: '#f59e0b' }}>📋</span>
                            </div>
                        </div>
                        <div className="metric-value">
                            {metrics.totalComplaints.toLocaleString()}
                        </div>
                        <div className="metric-title">Total Complaints</div>
                        <button
                            className="detail-btn"
                            onClick={handleDetailedComplaints}
                        >
                            Detailed Info →
                        </button>
                    </div>

                    {/* Pending Complaints */}
                    {/* <div className="metric-card" onClick={() => handleComplaintStatus('pending')} style={{ cursor: 'pointer' }}>
                        <div className="metric-header">
                            <div className="metric-icon" style={{ backgroundColor: '#f59e0b15' }}>
                                <span style={{ color: '#f59e0b' }}>⏳</span>
                            </div>
                        </div>
                        <div className="metric-value">
                            {metrics.pendingComplaints.toLocaleString()}
                        </div>
                        <div className="metric-title">Pending</div>
                        <div className="metric-subtitle">Click to view</div>
                    </div> */}

                    {/* In Progress Complaints */}
                    {/* <div className="metric-card" onClick={() => handleComplaintStatus('in-progress')} style={{ cursor: 'pointer' }}>
                        <div className="metric-header">
                            <div className="metric-icon" style={{ backgroundColor: '#3b82f615' }}>
                                <span style={{ color: '#3b82f6' }}>🔄</span>
                            </div>
                        </div>
                        <div className="metric-value">
                            {metrics.inProgressComplaints.toLocaleString()}
                        </div>
                        <div className="metric-title">In Progress</div>
                        <div className="metric-subtitle">Click to view</div>
                    </div> */}

                    {/* Resolved Complaints */}
                    {/* <div className="metric-card" onClick={() => handleComplaintStatus('resolved')} style={{ cursor: 'pointer' }}>
                        <div className="metric-header">
                            <div className="metric-icon" style={{ backgroundColor: '#10b98115' }}>
                                <span style={{ color: '#10b981' }}>✅</span>
                            </div>
                        </div>
                        <div className="metric-value">
                            {metrics.resolvedComplaints.toLocaleString()}
                        </div>
                        <div className="metric-title">Resolved</div>
                        <div className="metric-subtitle">Click to view</div>
                    </div> */}
                    <div className="metric-card" onClick={() => handleTriningData('resolved')} style={{ cursor: 'pointer' }}>
                        <div className="metric-header">
                            <div className="metric-icon" style={{ backgroundColor: '#10b98115' }}>
                                <span style={{ color: '#10b981' }}>✅</span>
                            </div>
                        </div>
                        <div className="metric-value">
                            {articleCount}
                        </div>

                        <div className="metric-title">Edit Artical</div>
                        <div className="metric-subtitle">Click to start</div>
                    </div>
                </div>

                {/* Tabs for Activities/Progress */}
                <div className="tab-container">
                    <div className="tab-header">
                        <button
                            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activities')}
                        >
                            Recent Activities
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                            onClick={() => setActiveTab('progress')}
                        >
                            Complaint Status Progress
                        </button>
                        <button
                            className="refresh-btn"
                            onClick={handleRefreshData}
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : '🔄 Refresh'}
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'activities' ? (
                            <div className="activity-list">
                                {recentActivities.length > 0 ? (
                                    recentActivities.slice(0, 10).map(activity => (
                                        <div className="activity-item" key={activity.id}>
                                            <div className="activity-icon">{activity.icon}</div>
                                            <div className="activity-details">
                                                <div className="activity-user">{activity.user}</div>
                                                <div className="activity-action">
                                                    {activity.action}
                                                    {activity.status && (
                                                        <span
                                                            className="status-badge"
                                                            style={{
                                                                backgroundColor: activity.statusColor + '15',
                                                                color: activity.statusColor,
                                                                marginLeft: '10px'
                                                            }}
                                                        >
                                                            {getStatusIcon(activity.status)} {activity.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="activity-time">{activity.time}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-activities">
                                        <p>No recent activities found</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="progress-grid">
                                {complaintsByStatus.map(statusGroup => (
                                    <div className="status-card" key={statusGroup.status}>
                                        <div className="status-header" style={{ borderBottomColor: statusGroup.color }}>
                                            <div className="status-title">
                                                <span className="status-icon" style={{ color: statusGroup.color }}>
                                                    {statusGroup.icon}
                                                </span>
                                                {statusGroup.title}
                                            </div>
                                            <div className="status-count" style={{ color: statusGroup.color }}>
                                                {statusGroup.count}
                                            </div>
                                        </div>
                                        <div className="status-items">
                                            {statusGroup.items.length > 0 ? (
                                                statusGroup.items.slice(0, 5).map(item => (
                                                    <div className="status-item" key={item.id}>
                                                        <div className="status-item-title">{item.title}</div>
                                                        <div className="status-item-user">{item.user}</div>
                                                        <div className="status-item-desc">{item.description}</div>
                                                        <div className="status-item-time">{item.time}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-items">No complaints in this status</div>
                                            )}
                                            {statusGroup.items.length > 5 && (
                                                <button
                                                    className="view-more-btn"
                                                    onClick={() => handleComplaintStatus(statusGroup.status)}
                                                >
                                                    View All ({statusGroup.count}) →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="monitor-footer">
                <div className="footer-info">
                    <span>Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Users: {metrics.totalUsers} | Complaints: {metrics.totalComplaints} | Pending: {metrics.pendingComplaints} | In Progress: {metrics.inProgressComplaints} | Resolved: {metrics.resolvedComplaints}</span>
                </div>
                <div className="footer-actions">
                    <button
                        className="footer-btn"
                        onClick={handleRefreshData}
                        disabled={loading}
                    >
                        <span>🔄</span>
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Homef;