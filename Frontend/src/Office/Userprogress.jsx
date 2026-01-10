import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserProgress.css"; // Import the CSS file
import API from "../API/api_req";

const UserProgress = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("congratulations");
    const [recentCompletions, setRecentCompletions] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Filter out broken records
    const data = (state || []).filter(item => item.user && item.article);

    // Calculate statistics
    const totalUsers = new Set(data.map(item => item.user?._id)).size;
    const avgProgress = data.length > 0
        ? (data.reduce((sum, item) => sum + (item.progressPercent || 0), 0) / data.length).toFixed(1)
        : 0;
    const completed = data.filter(item => item.progressPercent === 100).length;

    // Find recently completed articles (within last 7 days)
    useEffect(() => {
        const recent = data.filter(item => {
            if (item.progressPercent === 100 && item.completedAt) {
                const completionDate = new Date(item.completedAt);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return completionDate > sevenDaysAgo;
            }
            return false;
        });
        setRecentCompletions(recent);
    }, [data]);

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

    // Handle send message
    const handleSendMessage = (user, article) => {
        setSelectedUser({
            ...user,
            articleTitle: article?.title,
            articleId: article?._id
        });

        // Default message based on type
        const defaultMessages = {
            congratulations: `Congratulations ${user.fullName}! 🎉\nYou have successfully completed the article "${article?.title}". Keep up the great work!`,
            encouragement: `Great progress ${user.fullName}! 👏\nYou're doing well with "${article?.title}". Keep learning and growing!`,
            reminder: `Reminder ${user.fullName} 📚\nYou've started "${article?.title}". Don't forget to complete it to earn your certificate!`,
            certificate: `Certificate Ready ${user.fullName}! 🏆\nYour certificate for "${article?.title}" is now available for download.`
        };

        setMessage(defaultMessages[messageType]);
        setShowMessageModal(true);
    };

    // Submit message
    const submitMessage = async () => {
        try {
            await API.post("/messages/send", {
                receiver: selectedUser._id,
                title: messageType.toUpperCase(),
                body: message,
                messageType,
                relatedArticle: selectedUser.articleId
            });

            alert(`Message sent to ${selectedUser.fullName} 🎉`);

            setShowMessageModal(false);
            setMessage("");
            setMessageType("congratulations");
            setSelectedUser(null);

        } catch (error) {
            console.error(error);
            alert("Failed to send message. Please try again.");
        }
    };


    return (
        <div className="user-progress-container">
            {/* Header */}
            <div className="user-progress-header">
                <div className="header-left">
                    <h2>User Progress Dashboard</h2>
                    {recentCompletions.length > 0 && (
                        <button
                            className="notification-badge"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            🎉 {recentCompletions.length} New Completions
                            <span className="notification-indicator">🔴</span>
                        </button>
                    )}
                </div>
                <div className="header-actions">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>
            </div>

            {/* Recent Completions Dropdown */}
            {showNotifications && recentCompletions.length > 0 && (
                <div className="recent-completions-panel">
                    <div className="panel-header">
                        <h4>🎯 Recent Article Completions</h4>
                        <span className="close-panel" onClick={() => setShowNotifications(false)}>×</span>
                    </div>
                    <div className="completions-list">
                        {recentCompletions.slice(0, 5).map((item, index) => (
                            <div key={index} className="completion-item">
                                <div className="completion-avatar">
                                    {getUserInitial(item.user.fullName)}
                                </div>
                                <div className="completion-info">
                                    <div className="completion-user">
                                        <strong>{item.user.fullName}</strong>
                                        <span className="completion-time">
                                            {new Date(item.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="completion-article">
                                        Completed: "{item.article.title}"
                                    </div>
                                </div>
                                <button
                                    className="message-quick-btn"
                                    onClick={() => handleSendMessage(item.user, item.article)}
                                >
                                    💬 Message
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="panel-footer">
                        <button
                            className="message-all-btn"
                            onClick={() => {
                                // Handle sending message to all recent completions
                                alert("Message all feature coming soon!");
                            }}
                        >
                            📢 Message All Recent Completers
                        </button>
                    </div>
                </div>
            )}

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
                        {completed > 0 && (
                            <span className="completed-count">
                                • {completed} completed articles
                            </span>
                        )}
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
                                <tr key={item._id} className={item.progressPercent === 100 ? "row-completed" : ""}>
                                    {/* User Column */}
                                    <td>
                                        <div className="user-name-cell">
                                            <div className="user-avatar">
                                                {getUserInitial(item.user.fullName)}
                                            </div>
                                            <div className="user-info">
                                                <div className="user-name">
                                                    {item.user.fullName}
                                                    {item.progressPercent === 100 && (
                                                        <span className="completion-badge">🎓 Completed</span>
                                                    )}
                                                </div>
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
                                        {item.completedAt && item.progressPercent === 100 && (
                                            <div className="completion-date">
                                                {new Date(item.completedAt).toLocaleDateString()}
                                            </div>
                                        )}
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
                                        <div className="action-buttons">
                                            <button
                                                className="details-button"
                                                onClick={() => {
                                                    // Add your details view logic here
                                                    console.log('View details for:', item._id);
                                                }}
                                            >
                                                View Details
                                            </button>

                                            {item.progressPercent === 100 && (
                                                <button
                                                    className="message-button"
                                                    onClick={() => handleSendMessage(item.user, item.article)}
                                                    title="Send congratulatory message"
                                                >
                                                    💬 Message
                                                </button>
                                            )}
                                        </div>
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
                        {recentCompletions.length > 0 && (
                            <span className="recent-info">
                                • {recentCompletions.length} new completions today
                            </span>
                        )}
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

            {/* Message Modal */}
            {showMessageModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="message-modal">
                        <div className="modal-header">
                            <h3>Send Message to User</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowMessageModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="recipient-info">
                                <div className="recipient-avatar">
                                    {getUserInitial(selectedUser.fullName)}
                                </div>
                                <div className="recipient-details">
                                    <h4>{selectedUser.fullName}</h4>
                                    <p>Article Completed: <strong>{selectedUser.articleTitle}</strong></p>
                                </div>
                            </div>

                            <div className="message-type-selector">
                                <label>Message Type:</label>
                                <div className="type-buttons">
                                    <button
                                        className={`type-btn ${messageType === 'congratulations' ? 'active' : ''}`}
                                        onClick={() => setMessageType('congratulations')}
                                    >
                                        🎉 Congratulations
                                    </button>
                                    <button
                                        className={`type-btn ${messageType === 'encouragement' ? 'active' : ''}`}
                                        onClick={() => setMessageType('encouragement')}
                                    >
                                        👏 Encouragement
                                    </button>
                                    <button
                                        className={`type-btn ${messageType === 'certificate' ? 'active' : ''}`}
                                        onClick={() => setMessageType('certificate')}
                                    >
                                        🏆 Certificate
                                    </button>
                                    <button
                                        className={`type-btn ${messageType === 'reminder' ? 'active' : ''}`}
                                        onClick={() => setMessageType('reminder')}
                                    >
                                        📚 Reminder
                                    </button>
                                </div>
                            </div>

                            <div className="message-editor">
                                <label>Your Message:</label>
                                <textarea
                                    className="message-textarea"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows="6"
                                />
                            </div>

                            <div className="message-preview">
                                <h5>Preview:</h5>
                                <div className="preview-content">
                                    <div className="preview-header">
                                        From: <strong>Admin (Safe City Portal)</strong>
                                    </div>
                                    <div className="preview-message">{message}</div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="modal-btn secondary"
                                onClick={() => setShowMessageModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={submitMessage}
                            >
                                📤 Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProgress;