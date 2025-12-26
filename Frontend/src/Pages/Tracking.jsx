// Tracking.jsx (Professional Government Style)
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Tracking.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    //   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    //   iconUrl: require('leaflet/dist/images/marker-icon.png'),
    //   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),

});

const Tracking = () => {
    const [userLocation, setUserLocation] = useState({ lat: 28.5355, lng: 77.3910 });
    const [locationError, setLocationError] = useState(null);
    const [busStands, setBusStands] = useState([]);
    const [dustbins, setDustbins] = useState([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);

    // Simple icons for government style
    const createSimpleIcon = (color) => {
        return L.divIcon({
            html: `<div style="
        width: 20px;
        height: 20px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>`,
            className: 'simple-marker',
            iconSize: [20, 20],
        });
    };

    const userIcon = createSimpleIcon('#2196F3'); // Blue for user
    const busIcon = createSimpleIcon('#4CAF50'); // Green for bus stands
    const dustbinIcon = createSimpleIcon('#FF9800'); // Orange for dustbins
    const truckIcon = createSimpleIcon('#F44336'); // Red for truck

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    generateLocations(latitude, longitude);
                    setLoading(false);
                },
                () => {
                    generateLocations(userLocation.lat, userLocation.lng);
                    setLoading(false);
                }
            );
        } else {
            generateLocations(userLocation.lat, userLocation.lng);
            setLoading(false);
        }
    }, []);

    const generateLocations = (lat, lng) => {
        // Generate bus stands (local stops)
        const generatedBusStands = [
            { id: 1, name: 'Sector 15 Bus Stop', lat: lat + 0.001, lng: lng + 0.001 },
            { id: 2, name: 'Market Road Stop', lat: lat + 0.002, lng: lng - 0.001 },
            { id: 3, name: 'Residential Area Stop', lat: lat - 0.001, lng: lng + 0.002 },
            { id: 4, name: 'School Zone Stop', lat: lat - 0.002, lng: lng - 0.002 },
        ];

        // Generate dustbins at bus stops
        const generatedDustbins = generatedBusStands.map(stand => ({
            id: stand.id,
            busStandId: stand.id,
            name: `Dustbin at ${stand.name}`,
            lat: stand.lat + 0.0002,
            lng: stand.lng + 0.0002,
            status: ['Empty', 'Medium', 'Full'][Math.floor(Math.random() * 3)],
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));

        setBusStands(generatedBusStands);
        setDustbins(generatedDustbins);
    };

    const truckInfo = {
        vehicleNo: 'DL-01-GC-7890',
        driverName: 'Rajesh Kumar',
        status: 'On Route',
        capacity: '85%',
        schedule: 'Daily (8 AM - 5 PM)'
    };

    return (
        <div className="government-tracking">
            {/* Government Header */}
            {/* <div className="govt-header-section">
        <div className="container">
          <div className="govt-header-content">
            <div className="govt-logo-section">
              <div className="govt-emblem">☸</div>
              <div className="govt-title">
                <h1>Clean Vehicle Tracking</h1>
                <p className="govt-subtitle">Ministry of Urban Development</p>
              </div>
            </div>
            <div className="govt-info-badge">
              <span className="info-icon">📍</span>
              Live Tracking System
            </div>
          </div>
        </div>
      </div> */}

            <div className="container">
                {/* Alert Bar */}
                <div className="govt-alert-bar">
                    <div className="alert-content">
                        <span className="alert-text">
                            Real-time vehicle and dustbin tracking system. Updates every 30 seconds.
                        </span>
                        <span className="alert-time">Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div className="tracking-content">
                    {/* Map Section */}
                    <div className="map-section">
                        <div className="govt-section-header">
                            <h3>Live Tracking Map</h3>
                            <div className="section-badge">ACTIVE</div>
                        </div>

                        <div className="map-container">
                            {loading ? (
                                <div className="map-loading">
                                    <div className="loading-indicator"></div>
                                    <p>Loading map...</p>
                                </div>
                            ) : (
                                <MapContainer
                                    center={[userLocation.lat, userLocation.lng]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    ref={mapRef}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                                        <Popup>
                                            <strong>Your Location</strong><br />
                                            {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                                        </Popup>
                                    </Marker>

                                    {busStands.map(stand => (
                                        <Marker key={stand.id} position={[stand.lat, stand.lng]} icon={busIcon}>
                                            <Popup>
                                                <strong>{stand.name}</strong><br />
                                                Local Bus Stop
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {dustbins.map(dustbin => (
                                        <Marker key={dustbin.id} position={[dustbin.lat, dustbin.lng]} icon={dustbinIcon}>
                                            <Popup>
                                                <strong>{dustbin.name}</strong><br />
                                                Status: {dustbin.status}<br />
                                                Updated: {dustbin.lastUpdated}
                                            </Popup>
                                        </Marker>
                                    ))}

                                    <Marker position={[userLocation.lat + 0.003, userLocation.lng + 0.002]} icon={truckIcon}>
                                        <Popup>
                                            <strong>Garbage Truck #{truckInfo.vehicleNo}</strong><br />
                                            Status: {truckInfo.status}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            )}
                        </div>

                        <div className="map-controls">
                            <button className="govt-btn" onClick={() => mapRef.current && mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16)}>
                                Locate Me
                            </button>
                            <button className="govt-btn" onClick={() => mapRef.current && mapRef.current.zoomIn()}>
                                Zoom In
                            </button>
                            <button className="govt-btn" onClick={() => mapRef.current && mapRef.current.zoomOut()}>
                                Zoom Out
                            </button>
                        </div>
                    </div>

                    {/* Information Panels */}
                    <div className="info-panels">
                        {/* Truck Details */}
                        <div className="govt-info-panel">
                            <div className="panel-header">
                                <h4>Vehicle Details</h4>
                                <span className="status-indicator active"></span>
                            </div>
                            <div className="panel-body">
                                <div className="info-row">
                                    <span className="info-label">Vehicle No:</span>
                                    <span className="info-value">{truckInfo.vehicleNo}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Driver:</span>
                                    <span className="info-value">{truckInfo.driverName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Status:</span>
                                    <span className="info-value status-active">{truckInfo.status}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Capacity:</span>
                                    <span className="info-value">{truckInfo.capacity}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Schedule:</span>
                                    <span className="info-value">{truckInfo.schedule}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bus Stands List */}
                        <div className="govt-info-panel">
                            <div className="panel-header">
                                <h4>Nearby Bus Stands</h4>
                                <span className="count-badge">{busStands.length}</span>
                            </div>
                            <div className="panel-body">
                                <div className="list-container">
                                    {busStands.map(stand => {
                                        const standDustbins = dustbins.filter(db => db.busStandId === stand.id);
                                        return (
                                            <div key={stand.id} className="list-item">
                                                <div className="item-content">
                                                    <span className="item-icon">🚏</span>
                                                    <div className="item-details">
                                                        <span className="item-title">{stand.name}</span>
                                                        <span className="item-subtitle">Local Bus Stop</span>
                                                    </div>
                                                </div>
                                                <div className="item-meta">
                                                    <span className="meta-info">
                                                        {standDustbins.length} dustbin(s)
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Dustbin Status */}
                        <div className="govt-info-panel">
                            <div className="panel-header">
                                <h4>Dustbin Status</h4>
                            </div>
                            <div className="panel-body">
                                <table className="govt-table">
                                    <thead>
                                        <tr>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dustbins.map(dustbin => (
                                            <tr key={dustbin.id}>
                                                <td>{dustbin.name}</td>
                                                <td>
                                                    <span className={`status-dot status-${dustbin.status.toLowerCase()}`}></span>
                                                    {dustbin.status}
                                                </td>
                                                <td>{dustbin.lastUpdated}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="govt-action-panel">
                            <button className="govt-btn primary-btn">
                                Request Pickup
                            </button>
                            <button className="govt-btn secondary-btn">
                                File Complaint
                            </button>
                            <button className="govt-btn">
                                View Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tracking;