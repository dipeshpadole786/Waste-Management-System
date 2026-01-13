import React, { useState } from 'react';
import './Header.css';

const Headerw = ({ workerName, workerId }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Dustbin DB003 is 95% full', time: '30 mins ago', read: false },
    { id: 2, message: 'New complaint assigned', time: '1 hour ago', read: false },
    { id: 3, message: 'Shift starts in 15 minutes', time: '2 hours ago', read: true },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  return (
    <header className="worker-header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo">♻️</div>
          <div className="logo-text">
            <h1>Smart Waste Management</h1>
            <p>Government of India</p>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="current-shift">
          <span className="shift-indicator active"></span>
          <span>On Duty | Shift: 08:00 - 16:00</span>
        </div>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="notification-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button 
                  className="mark-all-read"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              </div>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {notification.time}
                    </div>
                    {!notification.read && (
                      <div className="unread-dot"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-container">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {workerName?.charAt(0) || 'W'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{workerName || 'Worker Name'}</span>
              <span className="profile-role">Field Worker</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-details">
                <div className="profile-avatar large">{workerName?.charAt(0) || 'W'}</div>
                <div className="profile-text">
                  <h4>{workerName || 'Worker Name'}</h4>
                  <p>ID: {workerId || 'W001'}</p>
                  <p>Field Worker - Waste Management</p>
                </div>
              </div>
              
              <div className="dropdown-menu">
                <a href="/worker/profile" className="dropdown-item">
                  <span className="menu-icon">👤</span>
                  My Profile
                </a>
                <a href="/worker/schedule" className="dropdown-item">
                  <span className="menu-icon">📅</span>
                  Schedule
                </a>
                <a href="/worker/performance" className="dropdown-item">
                  <span className="menu-icon">📊</span>
                  Performance
                </a>
                <a href="/worker/settings" className="dropdown-item">
                  <span className="menu-icon">⚙️</span>
                  Settings
                </a>
                <div className="dropdown-divider"></div>
                <a href="/logout" className="dropdown-item logout">
                  <span className="menu-icon">🚪</span>
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Button */}
        <button className="emergency-btn">
          <span className="emergency-icon">🚨</span>
          Emergency
        </button>
      </div>
    </header>
  );
};

export default Headerw;