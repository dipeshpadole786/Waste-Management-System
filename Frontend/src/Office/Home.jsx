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
        totalComplaints: 0
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all data on component mount
    useEffect(() => {
        fetchDashboardData();

        // Set up polling for real-time updates
        const interval = setInterval(() => {
            refreshData();
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);


    const navigate = useNavigate();
    const handleDe = async () => {
        try {
            const res = await API.get("/c_data");

            // navigate with data
            navigate("/show-complaints", { state: res.data });

        } catch (error) {
            console.error(error);
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

                // Set metrics
                setMetrics({
                    totalUsers: stats.totalUsers || 0,
                    totalComplaints: stats.totalComplaints || 0
                });

                // Process recent activities from complaints
                const activities = [];

                // Add recent complaints
                recent.complaints?.forEach(complaint => {
                    activities.push({
                        id: complaint._id,
                        user: complaint.user?.fullName || 'Unknown User',
                        action: `Filed: ${complaint.complaintType}`,
                        time: formatTimeAgo(complaint.createdAt),
                        icon: '📋',
                        type: 'complaint'
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
            // Quick refresh of stats
            const statsResponse = await API.get('/monitor/stats');
            if (statsResponse.data.success) {
                const { stats, recent } = statsResponse.data;

                setMetrics(prev => ({
                    ...prev,
                    totalUsers: stats.totalUsers || prev.totalUsers,
                    totalComplaints: stats.totalComplaints || prev.totalComplaints
                }));

                // Update recent activities
                if (recent?.complaints?.length > 0) {
                    const newActivities = recent.complaints.map(complaint => ({
                        id: complaint._id,
                        user: complaint.user?.fullName || 'Unknown User',
                        action: `Filed: ${complaint.complaintType}`,
                        time: formatTimeAgo(complaint.createdAt),
                        icon: '📋',
                        type: 'complaint'
                    }));

                    // Add to existing activities and keep only latest 10
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

            if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            return 'Just now';
        } catch (err) {
            return 'Recently';
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
                {/* Metrics Grid - Only 2 cards */}
                <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
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
                        <button onClick={handleDe}>Detailed Info</button>

                    </div>
                </div>

                {/* Recent Activities Section - Full width */}
                <div className="main-content-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="content-section">
                        <div className="section-header">
                            <h2>Recent Activities</h2>
                            <button
                                className="refresh-btn"
                                onClick={handleRefreshData}
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : '🔄 Refresh'}
                            </button>
                        </div>
                        <div className="activity-list">
                            {recentActivities.length > 0 ? (
                                recentActivities.slice(0, 10).map(activity => (
                                    <div className="activity-item" key={activity.id}>
                                        <div className="activity-icon">{activity.icon}</div>
                                        <div className="activity-details">
                                            <div className="activity-user">{activity.user}</div>
                                            <div className="activity-action">{activity.action}</div>
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
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="monitor-footer">
                <div className="footer-info">
                    <span>Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Total Users: {metrics.totalUsers} | Total Complaints: {metrics.totalComplaints}</span>
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