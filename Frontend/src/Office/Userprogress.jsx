import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserProgress.css"; // Import the CSS file

const UserProgress = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    // Filter out broken records
    const data = (state || []).filter(item => item.user && item.article);

    // Calculate statistics
    const totalUsers = new Set(data.map(item => item.user?._id)).size;
    const avgProgress = data.length > 0 
        ? (data.reduce((sum, item) => sum + (item.progressPercent || 0), 0) / data.length).toFixed(1)
        : 0;
    const completed = data.filter(item => item.progressPercent === 100).length;

    if (data.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No User Progress Found</h3>
                <p>There are currently no user progress records to display.</p>
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    // Filter by search
    const filtered = data.filter(item =>
        item.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        item.user?.mobileNumber?.includes(search) ||
        item.article?.title?.toLowerCase().includes(search.toLowerCase())
    );

    // Get status class
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'in-progress': return 'status-in-progress';
            case 'in_progress': return 'status-in-progress';
            case 'pending': return 'status-pending';
            default: return 'status-pending';
        }
    };

    // Get user initial for avatar
    const getUserInitial = (name) => {
        return name?.charAt(0)?.toUpperCase() || 'U';
    };

    return (
        <div className="user-progress-container">
            {/* Header */}
            <div className="user-progress-header">
                <h2>User Progress Dashboard</h2>
                <div className="header-actions">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        👥
                    </div>
                    <div className="stat-content">
                        <h3>{totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        📊
                    </div>
                    <div className="stat-content">
                        <h3>{avgProgress}%</h3>
                        <p>Average Progress</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                        ✅
                    </div>
                    <div className="stat-content">
                        <h3>{completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        🔄
                    </div>
                    <div className="stat-content">
                        <h3>{filtered.length}</h3>
                        <p>Records Found</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, mobile, or article..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table Container */}
            <div className="table-container">
                <div className="table-header">
                    <h3>User Progress Details</h3>
                    <div className="table-count">
                        Showing {filtered.length} of {data.length} records
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="user-progress-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Article</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item._id}>
                                    {/* User Column */}
                                    <td>
                                        <div className="user-name-cell">
                                            <div className="user-avatar">
                                                {getUserInitial(item.user.fullName)}
                                            </div>
                                            <div className="user-info">
                                                <div className="user-name">{item.user.fullName}</div>
                                                <div className="user-mobile">{item.user.mobileNumber}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Article Column */}
                                    <td className="article-cell">
                                        <div className="article-title">{item.article.title}</div>
                                        <span className="article-category">
                                            {item.article.category || 'General'}
                                        </span>
                                    </td>

                                    {/* Status Column */}
                                    <td className={`status-cell ${getStatusClass(item.status)}`}>
                                        {item.status?.replace('_', ' ') || 'Pending'}
                                    </td>

                                    {/* Progress Column */}
                                    <td className="progress-cell">
                                        <div className="progress-container">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ width: `${item.progressPercent || 0}%` }}
                                                />
                                            </div>
                                            <span className="progress-text">
                                                {item.progressPercent || 0}%
                                            </span>
                                        </div>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="action-cell">
                                        <button 
                                            className="details-button"
                                            onClick={() => {
                                                // Add your details view logic here
                                                console.log('View details for:', item._id);
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="table-footer">
                    <div className="table-info">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                    <div className="pagination">
                        <button className="pagination-button" disabled>
                            ← Previous
                        </button>
                        <button className="pagination-button active">1</button>
                        <button className="pagination-button">2</button>
                        <button className="pagination-button">3</button>
                        <button className="pagination-button">
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProgress;