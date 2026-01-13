import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Home2.css';

// Create axios instance
const API = axios.create({
    baseURL: "http://localhost:3000"
});

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom icons for different bin levels
const createBinIcon = (level, isHighlighted = false) => {
    const color = getBinColor(level);

    return L.divIcon({
        className: `custom-bin-icon ${isHighlighted ? 'highlighted' : ''}`,
        html: `<div class="dustbin-icon ${isHighlighted ? 'highlighted' : ''}" 
                 style="background-color: ${color}; 
                        width: ${isHighlighted ? '32px' : '25px'}; 
                        height: ${isHighlighted ? '32px' : '25px'};
                        border-color: ${isHighlighted ? '#ffffff' : 'white'};">
                ${isHighlighted ? '🗑️' : ''}
               </div>
               ${isHighlighted ? '<div class="highlight-pulse"></div>' : ''}
               <div class="level-text">${level}%</div>`,
        iconSize: isHighlighted ? [32, 32] : [25, 25],
        iconAnchor: isHighlighted ? [16, 16] : [12, 12],
        popupAnchor: [0, -12],
    });
};

// Custom location icon
const createLocationIcon = () => {
    return L.divIcon({
        html: `
            <div class="admin-location-icon">
                <div class="admin-pulse"></div>
                <div class="admin-dot"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
        className: "admin-marker"
    });
};

const getBinColor = (level) => {
    if (level >= 80) return '#ef4444'; // Red - Critical
    if (level >= 60) return '#f97316'; // Orange - High
    if (level >= 40) return '#eab308'; // Yellow - Medium
    return '#22c55e'; // Green - Low
};

const getBinStatus = (level) => {
    if (level >= 80) return 'Critical';
    if (level >= 60) return 'High';
    if (level >= 40) return 'Medium';
    return 'Low';
};

const Homeh = () => {
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        inProgressComplaints: 0,
        totalDustbins: 0,
        criticalBins: 0
    });

    const [dustbins, setDustbins] = useState([]);
    const [selectedBin, setSelectedBin] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [complaintsByStatus, setComplaintsByStatus] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'complaints', 'dustbins'
    const [searchRadius, setSearchRadius] = useState(2000);
    const [nearbyDustbins, setNearbyDustbins] = useState([]);
    const [highlightedDustbin, setHighlightedDustbin] = useState(null);
    const [articleCount, setArticleCount] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState('all'); // Filter for complaints

    const mapRef = useRef(null);
    const navigate = useNavigate();


    // Fetch all data on component mount
    useEffect(() => {
        fetchArticles();
        initializeMap();
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchDashboardData();
            fetchDustbins();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Update nearby dustbins when location or dustbins change
    useEffect(() => {
        if (userLocation && dustbins.length > 0) {
            findNearbyDustbins(userLocation);
        }
    }, [userLocation, dustbins, searchRadius]);

    const handsendtoworker = async()=>{
        
    }
    // Function to get address from coordinates
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || "Address not found";
        } catch (error) {
            console.error("Error fetching address:", error);
            return "Address not available";
        }
    };

    const initializeMap = async () => {
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const location = { lat, lng };
                        setUserLocation(location);

                        const address = await getAddressFromCoordinates(lat, lng);
                        setUserAddress(address);
                    },
                    async (error) => {
                        console.warn("Geolocation error:", error);
                        const fallbackLocation = { lat: 21.0932, lng: 78.9816 };
                        setUserLocation(fallbackLocation);

                        const address = await getAddressFromCoordinates(fallbackLocation.lat, fallbackLocation.lng);
                        setUserAddress(address);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                const fallbackLocation = { lat: 21.0932, lng: 78.9816 };
                setUserLocation(fallbackLocation);

                const address = await getAddressFromCoordinates(fallbackLocation.lat, fallbackLocation.lng);
                setUserAddress(address);
            }
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    };

    // Fetch articles count
    const fetchArticles = async () => {
        try {
            const res = await API.get(`/articles`);
            setArticleCount(res.data.length);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    };

    // Fetch dashboard data
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
                setMetrics(prev => ({
                    ...prev,
                    totalUsers: stats.totalUsers || 0,
                    totalComplaints: stats.totalComplaints || 0,
                    pendingComplaints: stats.pendingComplaints || 0,
                    resolvedComplaints: stats.resolvedComplaints || 0,
                    inProgressComplaints: stats.inProgressComplaints || 0
                }));

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

            // Fetch dustbins
            await fetchDustbins();

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch dustbins from API
    const fetchDustbins = async () => {
        try {
            const res = await API.get("/dustbins");

            const formatted = res.data
                .filter(
                    (bin) =>
                        bin.coordinates?.lat !== undefined &&
                        bin.coordinates?.lng !== undefined &&
                        !isNaN(bin.coordinates.lat) &&
                        !isNaN(bin.coordinates.lng)
                )
                .map((bin, index) => {
                    const level = Number(bin.level) || 0;

                    return {
                        uniqueKey: `${bin.dustbin_id}-${index}`,
                        id: bin.dustbin_id,
                        dustbin_id: bin.dustbin_id,
                        coordinates: {
                            lat: Number(bin.coordinates.lat),
                            lng: Number(bin.coordinates.lng)
                        },
                        level,
                        status: getBinStatus(level),
                        address: bin.address || "Address not specified",
                        capacity: bin.capacity || '500L',
                        type: bin.type || 'Public Bin',
                        lastCollection: bin.lastCollection || 'Not specified',
                        lastUpdated: bin.updatedAt || bin.createdAt,
                        updatedAt: new Date(bin.updatedAt || bin.createdAt).toLocaleString()
                    };
                });

            setDustbins(formatted);

            // Update metrics
            const criticalBins = formatted.filter(bin => bin.level >= 80).length;

            setMetrics(prev => ({
                ...prev,
                totalDustbins: formatted.length,
                criticalBins: criticalBins
            }));

        } catch (error) {
            console.error("Error fetching dustbins", error);
        }
    };

    // Find nearby dustbins
    const findNearbyDustbins = (location) => {
        if (!location || dustbins.length === 0) return;

        const R = 6371e3; // Earth's radius in meters
        const nearby = [];

        dustbins.forEach(bin => {
            const φ1 = location.lat * Math.PI / 180;
            const φ2 = bin.coordinates.lat * Math.PI / 180;
            const Δφ = (bin.coordinates.lat - location.lat) * Math.PI / 180;
            const Δλ = (bin.coordinates.lng - location.lng) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (distance <= searchRadius) {
                nearby.push({
                    ...bin,
                    distance: Math.round(distance),
                    coordinates: bin.coordinates
                });
            }
        });

        // Sort by distance
        nearby.sort((a, b) => a.distance - b.distance);
        setNearbyDustbins(nearby);

        // Auto-highlight the nearest critical dustbin
        const criticalNearby = nearby.filter(b => b.level >= 80);
        if (criticalNearby.length > 0) {
            setHighlightedDustbin(criticalNearby[0].uniqueKey);
        } else if (nearby.length > 0) {
            setHighlightedDustbin(nearby[0].uniqueKey);
        }
    };

    // Handle dustbin click
    const handleDustbinClick = (dustbin) => {
        setSelectedBin(dustbin);
        setHighlightedDustbin(dustbin.uniqueKey);

        // Fly to the clicked dustbin
        if (dustbin.coordinates && mapRef.current) {
            mapRef.current.flyTo([dustbin.coordinates.lat, dustbin.coordinates.lng], 18, {
                duration: 1
            });
        }
    };

    // Handle mark as collected (for admin to simulate worker action)
    const handleMarkAsCollected = async (dustbinId) => {
        try {
            // API call to mark dustbin as collected
            // await API.put(`/dustbins/${dustbinId}/collect`);

            // Update local state
            setDustbins(prev => prev.map(bin =>
                bin.dustbin_id === dustbinId ? {
                    ...bin,
                    level: 0,
                    lastCollection: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    updatedAt: 'Just now',
                    status: 'Low'
                } : bin
            ));

            alert(`✅ Dustbin ${dustbinId} marked as collected!`);
        } catch (error) {
            console.error("Error marking dustbin as collected:", error);
            alert("Failed to update dustbin status. Please try again.");
        }
    };

    // Navigation handlers
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

    // Helper functions
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

    // Locate user on map
    const locateUser = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
                duration: 1.5
            });
        }
    };

    const handleComplaintStatus = (status) => {
        alert(`Viewing ${status} complaints - Implement filter logic here`);
        // You can navigate to complaints page with filter
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading admin dashboard...</p>
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
        <div className="admin-home">
            {/* Dashboard Stats - Top Row */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{metrics.totalUsers}</h3>
                        <p>Total Users</p>
                        <button
                            className="detail-btn"
                            onClick={handleUserProgress}
                        >
                            View Progress →
                        </button>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <h3>{metrics.totalComplaints}</h3>
                        <p>Total Complaints</p>
                        <button
                            className="detail-btn"
                            onClick={handleDetailedComplaints}
                        >
                            Detailed Info →
                        </button>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🗑️</div>
                    <div className="stat-info">
                        <h3>{metrics.totalDustbins}</h3>
                        <p>Total Bins</p>
                        <div className="sub-stats">
                            <span className="critical-count">⚠️ {metrics.criticalBins} Critical</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <h3>{articleCount}</h3>
                        <p>Training Articles</p>
                        <button
                            className="detail-btn"
                            onClick={() => handleTriningData('edit')}
                        >
                            Edit Articles →
                        </button>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{Math.round((metrics.resolvedComplaints / Math.max(metrics.totalComplaints, 1)) * 100)}%</h3>
                        <p>Resolution Rate</p>
                        <div className="sub-stats">
                            <span>⏳ {metrics.pendingComplaints} Pending</span>
                            <span>✅ {metrics.resolvedComplaints} Resolved</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                {/* Left Column - Map Section */}
                <div className="map-section">
                    <div className="section-header">
                        <h2>📍 Dustbin Monitoring ({dustbins.length} bins)</h2>
                        <div className="map-controls">
                            <button
                                className="refresh-btn"
                                onClick={() => {
                                    fetchDustbins();
                                    handleRefreshData();
                                }}
                                disabled={loading}
                            >
                                🔄 {loading ? 'Loading...' : 'Refresh'}
                            </button>
                            <button
                                className="locate-btn"
                                onClick={locateUser}
                            >
                                📍 Locate
                            </button>
                            <select
                                className="radius-select"
                                value={searchRadius}
                                onChange={(e) => setSearchRadius(Number(e.target.value))}
                            >
                                <option value={500}>500m</option>
                                <option value={1000}>1km</option>
                                <option value={2000}>2km</option>
                                <option value={5000}>5km</option>
                            </select>
                        </div>
                    </div>

                    <div className="map-container">
                        {userLocation ? (
                            <MapContainer
                                center={[userLocation.lat, userLocation.lng]}
                                zoom={15}
                                ref={mapRef}
                                scrollWheelZoom={true}
                                zoomControl={true}
                                style={{ height: '450px', width: '100%' }}
                            >
                                <LayersControl position="topright">
                                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                    </LayersControl.BaseLayer>
                                    <LayersControl.BaseLayer name="Satellite">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.google.com/maps">Google Satellite</a>'
                                            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                                        />
                                    </LayersControl.BaseLayer>
                                </LayersControl>

                                {/* User Location Circle */}
                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={searchRadius}
                                    pathOptions={{
                                        fillColor: '#3b82f6',
                                        color: '#3b82f6',
                                        fillOpacity: 0.1,
                                        weight: 2
                                    }}
                                />

                                {/* Admin Location Marker */}
                                <Marker
                                    position={[userLocation.lat, userLocation.lng]}
                                    icon={createLocationIcon()}
                                >
                                    <Popup>
                                        <div className="admin-popup">
                                            <h4>📍 Admin Location</h4>
                                            <p>{userAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Dustbin Markers */}
                                {dustbins.map((bin) => {
                                    const isHighlighted = highlightedDustbin === bin.uniqueKey;
                                    return (
                                        <Marker
                                            key={bin.uniqueKey}
                                            position={[bin.coordinates.lat, bin.coordinates.lng]}
                                            icon={createBinIcon(bin.level, isHighlighted)}
                                            eventHandlers={{
                                                click: () => handleDustbinClick(bin),
                                            }}
                                        >
                                            <Popup>
                                                <div className="bin-popup">
                                                    <h4>🗑️ {bin.dustbin_id}</h4>
                                                    <div className="bin-details">
                                                        <p><strong>Status:</strong>
                                                            <span className={`status-badge ${bin.status.toLowerCase()}`}>
                                                                {bin.status}
                                                            </span>
                                                        </p>
                                                        <p><strong>Level:</strong> {bin.level}%</p>
                                                        <p><strong>Address:</strong> {bin.address}</p>
                                                        <p><strong>Type:</strong> {bin.type}</p>
                                                        <p><strong>Last Updated:</strong> {bin.updatedAt}</p>
                                                    </div>
                                                    <div className="popup-actions">
                                                        <button
                                                            className="popup-btn admin-collect"
                                                            onClick={() => handleMarkAsCollected(bin.dustbin_id)}
                                                        >
                                                            📝 Update Status
                                                        </button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        ) : (
                            <div className="map-placeholder">
                                <p>Loading map...</p>
                            </div>
                        )}
                    </div>

                    {/* Nearby Dustbins & Legend */}
                    <div className="map-info-section">
                        <div className="nearby-section">
                            <h4>📍 Nearby Dustbins ({nearbyDustbins.length})</h4>
                            <div className="nearby-list">
                                {nearbyDustbins.length > 0 ? (
                                    nearbyDustbins.slice(0, 5).map(bin => (
                                        <div
                                            key={bin.uniqueKey}
                                            className={`nearby-item ${highlightedDustbin === bin.uniqueKey ? 'highlighted' : ''}`}
                                            onClick={() => handleDustbinClick(bin)}
                                        >
                                            <div className="nearby-item-header">
                                                <span className="dustbin-name">🗑️ {bin.dustbin_id}</span>
                                                <span className={`status-badge ${bin.status.toLowerCase()}`}>
                                                    {bin.status}
                                                </span>
                                            </div>
                                            <div className="nearby-item-details">
                                                <span className="distance">{bin.distance}m away</span>
                                                <span className="level">Level: {bin.level}%</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-nearby">
                                        No dustbins found within {searchRadius}m
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="map-legend">
                            <h4>📊 Fill Level Legend</h4>
                            <div className="legend-items">
                                <div className="legend-item">
                                    <span className="legend-color critical"></span>
                                    <span>Critical (80-100%)</span>
                                    <span className="legend-count">
                                        {dustbins.filter(b => b.level >= 80).length}
                                    </span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color high"></span>
                                    <span>High (60-80%)</span>
                                    <span className="legend-count">
                                        {dustbins.filter(b => b.level >= 60 && b.level < 80).length}
                                    </span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color medium"></span>
                                    <span>Medium (40-60%)</span>
                                    <span className="legend-count">
                                        {dustbins.filter(b => b.level >= 40 && b.level < 60).length}
                                    </span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color low"></span>
                                    <span>Low (0-40%)</span>
                                    <span className="legend-count">
                                        {dustbins.filter(b => b.level < 40).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Tabs & Activities */}
                <div className="right-column">
                    {/* Tabs Navigation */}
                    <div className="tabs-navigation">
                        <button
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                            onClick={() => setActiveTab('complaints')}
                        >
                            📋 Complaints
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activities')}
                        >
                            📝 Activities
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'overview' && (
                            <div className="complaints-overview">
                                <h3>Complaints Overview</h3>
                                <div className="complaints-grid">
                                    {complaintsByStatus.map(statusGroup => (
                                        <div className="status-overview-card" key={statusGroup.status}>
                                            <div className="status-header">
                                                <span className="status-icon" style={{ color: statusGroup.color }}>
                                                    {statusGroup.icon}
                                                </span>
                                                <h4>{statusGroup.title}</h4>
                                                <span className="status-count">{statusGroup.count}</span>
                                            </div>
                                            <div className="status-list">
                                                {statusGroup.items.length > 0 ? (
                                                    statusGroup.items.slice(0, 3).map(item => (
                                                        <div className="status-item" key={item.id}>
                                                            <div className="item-title">{item.title}</div>
                                                            <div className="item-user">{item.user}</div>
                                                            <div className="item-time">{item.time}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-items">No complaints</div>
                                                )}
                                            </div>
                                            {statusGroup.items.length > 0 && (
                                                <button
                                                    className="view-all-btn"
                                                    onClick={() => handleComplaintStatus(statusGroup.status)}
                                                >
                                                    View All →
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'complaints' && (
                            <div className="complaints-management">
                                <div className="complaints-header">
                                    <h3>Complaints Management</h3>
                                    <div className="complaint-filters">
                                        <button
                                            className={`filter-btn ${selectedStatus === 'all' ? 'active' : ''}`}
                                            onClick={() => setSelectedStatus('all')}
                                        >
                                            All ({metrics.totalComplaints})
                                        </button>
                                        <button
                                            className={`filter-btn ${selectedStatus === 'pending' ? 'active' : ''}`}
                                            onClick={() => setSelectedStatus('pending')}
                                        >
                                            Pending ({metrics.pendingComplaints})
                                        </button>
                                        <button
                                            className={`filter-btn ${selectedStatus === 'in-progress' ? 'active' : ''}`}
                                            onClick={() => setSelectedStatus('in-progress')}
                                        >
                                            In Progress ({metrics.inProgressComplaints})
                                        </button>
                                        <button
                                            className={`filter-btn ${selectedStatus === 'resolved' ? 'active' : ''}`}
                                            onClick={() => setSelectedStatus('resolved')}
                                        >
                                            Resolved ({metrics.resolvedComplaints})
                                        </button>
                                    </div>
                                </div>
                                <div className="quick-actions">
                                    <button
                                        className="action-btn manage-complaints"
                                        onClick={handleDetailedComplaints}
                                    >
                                        📋 Manage All Complaints
                                    </button>
                                    <button
                                        className="action-btn assign-workers"
                                        onClick={() => alert('Assign workers to complaints')}
                                    >
                                        👥 Assign Workers
                                    </button>
                                    <button
                                        className="action-btn generate-report"
                                        onClick={() => alert('Generate complaints report')}
                                    >
                                        📊 Generate Report
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activities' && (
                            <div className="activity-feed">
                                <div className="activity-header">
                                    <h3>Recent Activities</h3>
                                    <button className="refresh-btn" onClick={handleRefreshData}>
                                        🔄 Refresh
                                    </button>
                                </div>
                                <div className="activity-list">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.slice(0, 8).map(activity => (
                                            <div className="activity-item" key={activity.id}>
                                                <div className="activity-icon">{activity.icon}</div>
                                                <div className="activity-content">
                                                    <div className="activity-user">{activity.user}</div>
                                                    <div className="activity-action">
                                                        {activity.action}
                                                        {activity.status && (
                                                            <span
                                                                className="activity-status"
                                                                style={{ color: activity.statusColor }}
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
                            </div>
                        )}
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="quick-actions-panel">
                        <h3>⚡ Quick Actions</h3>
                        <div className="action-grid">
                            <button className="action-btn user-mgmt" onClick={handleUserProgress}>
                                <span className="action-icon">👥</span>
                                <span>User Management</span>
                            </button>
                            <button className="action-btn complaint-mgmt" onClick={handleDetailedComplaints}>
                                <span className="action-icon">📋</span>
                                <span>Complaints</span>
                            </button>
                            <button className="action-btn article-mgmt" onClick={() => handleTriningData('edit')}>
                                <span className="action-icon">📚</span>
                                <span>Articles</span>
                            </button>
                            <button className="action-btn bin-mgmt" onClick={() => alert('Manage dustbins')}>
                                <span className="action-icon">🗑️</span>
                                <span>Dustbins</span>
                            </button>
                            <button className="action-btn reports" onClick={() => alert('Generate reports')}>
                                <span className="action-icon">📊</span>
                                <span>Reports</span>
                            </button>
                            <button className="action-btn settings" onClick={() => alert('System settings')}>
                                <span className="action-icon">⚙️</span>
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Bin Details Panel */}
            {selectedBin && (
                <div className="selected-bin-panel">
                    <div className="panel-header">
                        <h3>🗑️ {selectedBin.dustbin_id} Details</h3>
                        <button className="close-btn" onClick={() => setSelectedBin(null)}>✕</button>
                    </div>
                    <div className="panel-content">
                        <div className="detail-item">
                            <strong>Address:</strong> {selectedBin.address}
                        </div>
                        <div className="detail-item">
                            <strong>Status:</strong>
                            <span className={`status-badge ${selectedBin.status.toLowerCase()}`}>
                                {selectedBin.status} ({selectedBin.level}%)
                            </span>
                        </div>
                        <div className="detail-item">
                            <strong>Fill Level:</strong>
                            <div className="level-meter">
                                <div
                                    className="level-fill"
                                    style={{
                                        width: `${selectedBin.level}%`,
                                        backgroundColor: getBinColor(selectedBin.level)
                                    }}
                                ></div>
                                <span className="level-text">{selectedBin.level}%</span>
                            </div>
                        </div>
                        <div className="detail-item">
                            <strong>Type:</strong> {selectedBin.type}
                        </div>
                        <div className="detail-item">
                            <strong>Last Updated:</strong> {selectedBin.updatedAt}
                        </div>
                        <div className="panel-actions">
                            <button
                                className="panel-btn admin-update"
                                onClick={() => handleMarkAsCollected(selectedBin.dustbin_id)}
                            >
                                📝 Update Status
                            </button>
                            <button
                                className="panel-btn assign-worker"
                                onClick={() => alert(`Assign worker to dustbin ${selectedBin.dustbin_id}`)}
                            >
                                👤 Assign Worker
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Status Bar */}
            <footer className="admin-footer">
                <div className="footer-info">
                    <span>Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Users: {metrics.totalUsers} | Complaints: {metrics.totalComplaints} | Bins: {metrics.totalDustbins}</span>
                    <span>System Status: <span className="status-online">● Online</span></span>
                </div>
                <button className="footer-refresh" onClick={handleRefreshData} disabled={loading}>
                    {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
            </footer>
        </div>
    );
};

export default Homeh;