import "../Pages/Home.css"

const NotificationFeed = () => {
    // Placeholder data simulating announcements from the municipality
    const notifications = [
        { id: 1, title: '📢 New Recycling Scheme Launched!', detail: 'Mandatory segregation of plastics starts next week.' },
        { id: 2, title: '⚠️ Truck Pickup Delayed', detail: 'Route 3 is running 2 hours behind schedule today.' },
    ];

    return (
        <div className="home-card notification-feed">
            <h2>Important Notices & Schemes</h2>
            <div className="notification-list">
                {notifications.map(notif => (
                    <div key={notif.id} className="notification-item">
                        <h4 className="notif-title">{notif.title}</h4>
                        <p className="notif-detail">{notif.detail}</p>
                    </div>
                ))}
            </div>
            <a href="#notifications" className="view-all-link">View All Notifications →</a>
        </div>
    );
};

export default NotificationFeed;