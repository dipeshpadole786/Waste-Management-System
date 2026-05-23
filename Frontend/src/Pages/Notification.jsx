import React, { useEffect, useState } from "react";
import API from "../API/api_req";
import "./Notification.css";

const Notification = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const userId = loggedInUser?._id;

    // 🔔 Fetch notifications
    const fetchMessages = async () => {
        try {
            const res = await API.get(`/ma/${userId}`);
            setMessages(res.data.data || []);
        } catch (err) {
            console.error("Notification fetch error:", err);
            setError("Unable to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchMessages();
        } else {
            setError("Please login to view notifications");
            setLoading(false);
        }
    }, [userId]);

    // ✅ Mark message as read
    const markAsRead = async (messageId) => {
        try {
            await API.put(`/messages/read/${messageId}`);
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === messageId ? { ...msg, isRead: true } : msg
                )
            );
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    // ⏳ Loading
    if (loading) {
        return (
            <div className="notification-loading">
                ⏳ Loading notifications...
            </div>
        );
    }

    // ❌ Error
    if (error) {
        return (
            <div className="notification-error">
                ⚠️ {error}
            </div>
        );
    }

    return (
        <div className="notification-wrapper">
            {/* HEADER */}
            <div className="notification-header">
                <h2>🔔 Notifications</h2>
                <span className="notification-count">
                    {messages.filter(m => !m.isRead).length}
                </span>
            </div>

            {/* EMPTY STATE */}
            {messages.length === 0 ? (
                <div className="notification-empty">
                    <span className="empty-icon">📭</span>
                    <h3>No notifications yet</h3>
                    <p>You’ll see admin messages here.</p>
                </div>
            ) : (
                <div className="notification-list">
                    {messages.map(msg => (
                        <div
                            key={msg._id}
                            className={`notification-card ${msg.isRead ? "" : "unread"}`}
                            onClick={() => markAsRead(msg._id)}
                        >
                            {/* ICON */}
                            <div className="notification-icon">
                                {msg.messageType === "congratulations" && "🎉"}
                                {msg.messageType === "encouragement" && "💪"}
                                {msg.messageType === "certificate" && "📜"}
                                {msg.messageType === "reminder" && "⏰"}
                            </div>

                            {/* CONTENT */}
                            <div className="notification-content">
                                <h4 className="notification-title">
                                    {msg.title}
                                </h4>

                                <p className="notification-body">
                                    {msg.body}
                                </p>

                                <span className="notification-date">
                                    {new Date(msg.createdAt).toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* UNREAD DOT */}
                            {!msg.isRead && (
                                <span className="unread-dot"></span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notification;
