// Tracking.jsx (Government Theme)
import React, { useState } from 'react';
import './Tracking.css';

const Tracking = () => {
    // Government tracking data
    const [truckInfo] = useState({
        vehicleNo: 'DL-01-GC-7890',
        driverNo: 'D-889',
        driverName: 'Rajesh Kumar',
        expectedArrival: '10:45 AM',
        status: 'On Route (500m away)',
        location: 'Sector 15, Noida',
        capacity: '85%',
        schedule: 'Daily (8 AM - 5 PM)'
    });

    const [dustbins] = useState([
        { id: 'DB-001', location: 'Sector 15 Park', status: 'Full', lastCollected: 'Yesterday, 4 PM' },
        { id: 'DB-002', location: 'Market Road', status: 'Medium', lastCollected: 'Today, 8 AM' },
        { id: 'DB-003', location: 'Residential Block A', status: 'Empty', lastCollected: 'Today, 9 AM' },
        { id: 'DB-004', location: 'School Zone', status: 'Full', lastCollected: 'Yesterday, 5 PM' }
    ]);

    const handleRequestPickup = () => {
        alert("Special garbage pickup request submitted! A service request ID will be sent to your registered mobile.");
    };

    const handleFileComplaint = () => {
        alert("Redirecting to complaint registration form...");
    };

    return (
        <main className="government-tracking-page">
            {/* Page Header with Government Banner */}
            <div className="page-header-banner">
                <div className="container">
                    <h1>
                        <span className="header-icon">🚚</span>
                        स्वच्छता वाहन ट्रैकिंग
                        <span className="sub-header">Clean Vehicle Tracking System</span>
                    </h1>
                    <div className="header-badge">
                        <span className="badge-icon">📍</span>
                        Live GPS Tracking
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Alert Bar */}
                <div className="alert-info-bar">
                    <span className="alert-icon">ℹ️</span>
                    <span className="alert-text">
                        Real-time tracking data provided by Ministry of Urban Development. Updates every 30 seconds.
                    </span>
                    <span className="refresh-time">Last Updated: Just Now</span>
                </div>

                <div className="tracking-main-content">
                    {/* Left Column - Map and Tracking */}
                    <div className="tracking-left-column">
                        {/* Live Map Section */}
                        <section className="government-card map-section">
                            <div className="card-header">
                                <h3><span className="card-icon">🗺️</span> Live Tracking Map</h3>
                                <div className="live-badge">
                                    <span className="live-dot"></span>
                                    LIVE
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="live-map-container">
                                    <div className="map-visualization">
                                        <div className="map-grid">
                                            {/* Simplified Map Visualization */}
                                            <div className="map-route"></div>
                                            <div className="map-truck">
                                                <span className="truck-icon">🚚</span>
                                                <div className="truck-label">Truck #{truckInfo.vehicleNo}</div>
                                            </div>
                                            <div className="map-dustbins">
                                                {dustbins.map((bin, index) => (
                                                    <div 
                                                        key={bin.id} 
                                                        className={`dustbin-marker ${bin.status.toLowerCase()}`}
                                                        style={{
                                                            left: `${20 + (index * 20)}%`,
                                                            top: `${30 + (index * 10)}%`
                                                        }}
                                                    >
                                                        <span className="bin-icon">🗑️</span>
                                                        <div className="bin-tooltip">{bin.id}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="map-legend">
                                                <div className="legend-item">
                                                    <span className="legend-color full"></span>
                                                    <span>Full Dustbin</span>
                                                </div>
                                                <div className="legend-item">
                                                    <span className="legend-color medium"></span>
                                                    <span>Medium</span>
                                                </div>
                                                <div className="legend-item">
                                                    <span className="legend-color empty"></span>
                                                    <span>Empty</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="map-controls">
                                    <button className="btn btn-secondary">
                                        <span className="control-icon">➕</span> Zoom In
                                    </button>
                                    <button className="btn btn-secondary">
                                        <span className="control-icon">➖</span> Zoom Out
                                    </button>
                                    <button className="btn btn-primary">
                                        <span className="control-icon">🔄</span> Refresh Map
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Fleet Overview */}
                        <section className="government-card fleet-section">
                            <h3><span className="card-icon">🚛</span> Fleet Overview</h3>
                            <div className="fleet-stats">
                                <div className="stat-card">
                                    <div className="stat-number">12</div>
                                    <div className="stat-label">Active Vehicles</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">8</div>
                                    <div className="stat-label">On Route</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">156</div>
                                    <div className="stat-label">Dustbins</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">94%</div>
                                    <div className="stat-label">On Time</div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Information and Actions */}
                    <div className="tracking-right-column">
                        {/* Current Truck Details */}
                        <section className="government-card truck-details-card">
                            <div className="card-header">
                                <h3><span className="card-icon">🚚</span> Current Vehicle Details</h3>
                                <div className="vehicle-status active">ACTIVE</div>
                            </div>
                            <div className="card-body">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Vehicle Number</span>
                                        <span className="info-value govt-number">{truckInfo.vehicleNo}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Driver Details</span>
                                        <span className="info-value">{truckInfo.driverName} (ID: {truckInfo.driverNo})</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Current Location</span>
                                        <span className="info-value">{truckInfo.location}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Expected Arrival</span>
                                        <span className="info-value arrival-time">{truckInfo.expectedArrival}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Current Status</span>
                                        <span className="info-value status-badge on-route">{truckInfo.status}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Capacity</span>
                                        <span className="info-value">{truckInfo.capacity} filled</span>
                                    </div>
                                </div>
                                <div className="schedule-info">
                                    <h4><span className="schedule-icon">📅</span> Schedule Information</h4>
                                    <p>Collection Schedule: {truckInfo.schedule}</p>
                                    <p>Next Maintenance: 15th Dec 2024</p>
                                </div>
                            </div>
                        </section>

                        {/* Dustbin Status */}
                        <section className="government-card dustbin-card">
                            <h3><span className="card-icon">🗑️</span> Dustbin Status (Zone 15)</h3>
                            <div className="dustbin-table">
                                <div className="table-header">
                                    <div className="col col-1">Dustbin ID</div>
                                    <div className="col col-2">Location</div>
                                    <div className="col col-3">Status</div>
                                    <div className="col col-4">Last Collected</div>
                                </div>
                                <div className="table-body">
                                    {dustbins.map((bin) => (
                                        <div key={bin.id} className="table-row">
                                            <div className="col col-1 bin-id">{bin.id}</div>
                                            <div className="col col-2 bin-location">{bin.location}</div>
                                            <div className="col col-3">
                                                <span className={`status-indicator ${bin.status.toLowerCase()}`}>
                                                    {bin.status}
                                                </span>
                                            </div>
                                            <div className="col col-4 last-collected">{bin.lastCollected}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card-footer">
                                <a href="#" className="view-all-link">View All Zone Dustbins →</a>
                            </div>
                        </section>

                        {/* Action Cards */}
                        <div className="action-cards-grid">
                            <div className="government-card action-card pickup-card">
                                <div className="action-icon">📋</div>
                                <h4>Special Pickup Request</h4>
                                <p>Request immediate garbage collection for special circumstances</p>
                                <button className="btn btn-emergency" onClick={handleRequestPickup}>
                                    Request Pickup
                                </button>
                            </div>

                            <div className="government-card action-card complaint-card">
                                <div className="action-icon">⚠️</div>
                                <h4>Register Complaint</h4>
                                <p>Report issues with garbage collection or vehicles</p>
                                <button className="btn btn-secondary" onClick={handleFileComplaint}>
                                    File Complaint
                                </button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="government-card quick-links-card">
                            <h4><span className="card-icon">🔗</span> Quick Links</h4>
                            <div className="quick-links">
                                <a href="#schedule" className="quick-link">Collection Schedule</a>
                                <a href="#zones" className="quick-link">Zone Information</a>
                                <a href="#complaints" className="quick-link">Track Complaints</a>
                                <a href="#downloads" className="quick-link">Download Reports</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Tracking;