import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserProgress.css";
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

    const data = (state || []).filter(item => item.user && item.article);

    const totalUsers = new Set(data.map(item => item.user?._id)).size;
    const avgProgress = data.length > 0
        ? (data.reduce((sum, item) => sum + (item.progressPercent || 0), 0) / data.length).toFixed(1)
        : 0;
    const completed = data.filter(item => item.progressPercent === 100).length;

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

    if (data.length === 0) return (
        <div className="up-empty">
            <div className="up-empty-icon">📊</div>
            <h3>No User Progress Found</h3>
            <p>There are currently no user progress records to display.</p>
            <button className="up-btn up-btn--primary" onClick={() => navigate(-1)}>← Back to Dashboard</button>
        </div>
    );

    const filtered = data.filter(item =>
        item.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        item.user?.mobileNumber?.includes(search) ||
        item.article?.title?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusClass = (status) => {
        const s = status?.toLowerCase();
        if (s === 'completed') return 'up-status--completed';
        if (s === 'in-progress' || s === 'in_progress') return 'up-status--progress';
        return 'up-status--pending';
    };

    const getUserInitial = (name) => name?.charAt(0)?.toUpperCase() || 'U';

    const handleSendMessage = (user, article) => {
        setSelectedUser({ ...user, articleTitle: article?.title, articleId: article?._id });
        const defaultMessages = {
            congratulations: `Congratulations ${user.fullName}! 🎉\nYou have successfully completed "${article?.title}". Keep up the great work!`,
            encouragement: `Great progress ${user.fullName}! 👏\nYou're doing well with "${article?.title}". Keep learning!`,
            reminder: `Reminder ${user.fullName} 📚\nYou've started "${article?.title}". Don't forget to complete it!`,
            certificate: `Certificate Ready ${user.fullName}! 🏆\nYour certificate for "${article?.title}" is now available.`
        };
        setMessage(defaultMessages[messageType]);
        setShowMessageModal(true);
    };

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
            alert("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="up-page">

            {/* Header */}
            <div className="up-header">
                <div className="up-header-left">
                    <div className="up-eyebrow">Admin Dashboard</div>
                    <h1 className="up-title">User Progress</h1>
                    {recentCompletions.length > 0 && (
                        <button className="up-notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
                            🎉 {recentCompletions.length} New Completions
                            <span className="up-notif-dot"></span>
                        </button>
                    )}
                </div>
                <button className="up-btn up-btn--ghost" onClick={() => navigate(-1)}>← Back</button>
            </div>

            {/* Notifications Panel */}
            {showNotifications && recentCompletions.length > 0 && (
                <div className="up-notif-panel">
                    <div className="up-notif-panel-head">
                        <h4>🎯 Recent Completions (Last 7 days)</h4>
                        <button className="up-close-btn" onClick={() => setShowNotifications(false)}>✕</button>
                    </div>
                    <div className="up-notif-list">
                        {recentCompletions.slice(0, 5).map((item, i) => (
                            <div key={i} className="up-notif-item">
                                <div className="up-notif-avatar">{getUserInitial(item.user.fullName)}</div>
                                <div className="up-notif-info">
                                    <div className="up-notif-name">
                                        <strong>{item.user.fullName}</strong>
                                        <span className="up-notif-date">{new Date(item.completedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="up-notif-article">Completed: "{item.article.title}"</div>
                                </div>
                                <button className="up-btn up-btn--sm" onClick={() => handleSendMessage(item.user, item.article)}>
                                    💬 Message
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="up-notif-foot">
                        <button className="up-btn up-btn--primary" onClick={() => alert("Message all feature coming soon!")}>
                            📢 Message All Recent Completers
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="up-stats">
                {[
                    { val: totalUsers, lbl: "Total Users", icon: "👥", color: "#6366f1" },
                    { val: `${avgProgress}%`, lbl: "Avg Progress", icon: "📊", color: "#1A6B3A" },
                    { val: completed, lbl: "Completed", icon: "✅", color: "#0C1B33" },
                    { val: filtered.length, lbl: "Records Found", icon: "🔍", color: "#E07B2A" },
                ].map(s => (
                    <div className="up-stat" key={s.lbl}>
                        <div className="up-stat-icon" style={{ background: s.color }}>{s.icon}</div>
                        <div>
                            <div className="up-stat-val">{s.val}</div>
                            <div className="up-stat-lbl">{s.lbl}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="up-search-wrap">
                <span className="up-search-icon">🔍</span>
                <input
                    type="text"
                    className="up-search"
                    placeholder="Search by name, mobile, or article title…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && <button className="up-search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>

            {/* Table */}
            <div className="up-table-card">
                <div className="up-table-head">
                    <h3>User Progress Details</h3>
                    <div className="up-table-count">
                        Showing <strong>{filtered.length}</strong> of {data.length} records
                        {completed > 0 && <span className="up-completed-tag">• {completed} completed</span>}
                    </div>
                </div>
                <div className="up-table-wrap">
                    <table className="up-table">
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
                                <tr key={item._id} className={item.progressPercent === 100 ? 'up-row--completed' : ''}>
                                    <td>
                                        <div className="up-user-cell">
                                            <div className="up-user-avatar">{getUserInitial(item.user.fullName)}</div>
                                            <div>
                                                <div className="up-user-name">
                                                    {item.user.fullName}
                                                    {item.progressPercent === 100 && <span className="up-grad-badge">🎓</span>}
                                                </div>
                                                <div className="up-user-mobile">{item.user.mobileNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="up-article-title">{item.article.title}</div>
                                        <span className="up-cat-tag">{item.article.category || 'General'}</span>
                                    </td>
                                    <td>
                                        <span className={`up-status ${getStatusClass(item.status)}`}>
                                            {item.status?.replace('_', ' ') || 'Pending'}
                                        </span>
                                        {item.completedAt && item.progressPercent === 100 && (
                                            <div className="up-comp-date">{new Date(item.completedAt).toLocaleDateString()}</div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="up-progress-wrap">
                                            <div className="up-progress-track">
                                                <div
                                                    className="up-progress-fill"
                                                    style={{ width: `${item.progressPercent || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="up-progress-pct">{item.progressPercent || 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="up-actions">
                                            <button className="up-btn up-btn--outline" onClick={() => console.log('details:', item._id)}>
                                                Details
                                            </button>
                                            {item.progressPercent === 100 && (
                                                <button className="up-btn up-btn--sm" onClick={() => handleSendMessage(item.user, item.article)}>
                                                    💬
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="up-table-foot">
                    <div className="up-foot-info">
                        Last updated: {new Date().toLocaleString()}
                        {recentCompletions.length > 0 && <span className="up-recent-tag">• {recentCompletions.length} new this week</span>}
                    </div>
                    <div className="up-pagination">
                        {['← Prev', '1', '2', '3', 'Next →'].map((p, i) => (
                            <button key={p} className={`up-page-btn ${p === '1' ? 'active' : ''}`} disabled={p === '← Prev'}>{p}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && selectedUser && (
                <div className="up-modal-overlay" onClick={() => setShowMessageModal(false)}>
                    <div className="up-modal" onClick={e => e.stopPropagation()}>
                        <div className="up-modal-head">
                            <h3>Send Message</h3>
                            <button className="up-close-btn" onClick={() => setShowMessageModal(false)}>✕</button>
                        </div>
                        <div className="up-modal-body">
                            <div className="up-recipient">
                                <div className="up-recipient-avatar">{getUserInitial(selectedUser.fullName)}</div>
                                <div>
                                    <div className="up-recipient-name">{selectedUser.fullName}</div>
                                    <div className="up-recipient-article">Article: <strong>{selectedUser.articleTitle}</strong></div>
                                </div>
                            </div>

                            <div className="up-msg-types">
                                <div className="up-msg-types-label">Message Type</div>
                                <div className="up-msg-type-row">
                                    {[
                                        { id: 'congratulations', label: '🎉 Congrats' },
                                        { id: 'encouragement', label: '👏 Encourage' },
                                        { id: 'certificate', label: '🏆 Certificate' },
                                        { id: 'reminder', label: '📚 Reminder' },
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            className={`up-type-btn ${messageType === t.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setMessageType(t.id);
                                                const msgs = {
                                                    congratulations: `Congratulations ${selectedUser.fullName}! 🎉\nYou completed "${selectedUser.articleTitle}". Keep it up!`,
                                                    encouragement: `Great going ${selectedUser.fullName}! 👏\nKeep making progress on "${selectedUser.articleTitle}".`,
                                                    certificate: `Certificate Ready ${selectedUser.fullName}! 🏆\nYour certificate for "${selectedUser.articleTitle}" is available.`,
                                                    reminder: `Reminder ${selectedUser.fullName} 📚\nDon't forget to complete "${selectedUser.articleTitle}".`,
                                                };
                                                setMessage(msgs[t.id]);
                                            }}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="up-msg-editor">
                                <label className="up-msg-label">Your Message</label>
                                <textarea
                                    className="up-msg-textarea"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={5}
                                    placeholder="Type your message…"
                                />
                            </div>

                            <div className="up-msg-preview">
                                <div className="up-preview-label">Preview</div>
                                <div className="up-preview-box">
                                    <div className="up-preview-from">From: <strong>Admin · Safe City Portal</strong></div>
                                    <div className="up-preview-msg">{message}</div>
                                </div>
                            </div>
                        </div>
                        <div className="up-modal-foot">
                            <button className="up-btn up-btn--outline" onClick={() => setShowMessageModal(false)}>Cancel</button>
                            <button className="up-btn up-btn--primary" onClick={submitMessage}>📤 Send Message</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProgress;