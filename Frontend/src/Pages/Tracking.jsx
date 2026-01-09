import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../API/api_req";
import "./Tracking.css";

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom dustbin icons
const createDustbinIcon = (status, isHighlighted = false) => {
    let iconColor, iconSize, borderColor;

    switch (status.toLowerCase()) {
        case "full":
            iconColor = "#dc2626";
            break;
        case "medium":
            iconColor = "#f59e0b";
            break;
        case "empty":
            iconColor = "#10b981";
            break;
        default:
            iconColor = "#6b7280";
    }

    // Adjust size and border if highlighted
    if (isHighlighted) {
        iconSize = "32px";
        borderColor = "#ffffff";
    } else {
        iconSize = "24px";
        borderColor = "white";
    }

    return new L.DivIcon({
        html: `
            <div class="dustbin-icon ${isHighlighted ? 'highlighted' : ''}" 
                 style="background-color: ${iconColor}; 
                        width: ${iconSize}; 
                        height: ${iconSize};
                        border-color: ${borderColor};">
                ${isHighlighted ? '🗑️' : ''}
            </div>
            ${isHighlighted ? '<div class="highlight-pulse"></div>' : ''}
        `,
        iconSize: isHighlighted ? [32, 32] : [24, 24],
        iconAnchor: isHighlighted ? [16, 16] : [12, 12],
        popupAnchor: [0, -12],
        className: `dustbin-marker ${isHighlighted ? 'highlighted-marker' : ''}`
    });
};

// Custom user icon
const createUserIcon = () => {
    return new L.DivIcon({
        html: `
            <div class="user-location-icon">
                <div class="user-pulse"></div>
                <div class="user-dot"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
        className: "user-marker"
    });
};

const Tracking = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [dustbins, setDustbins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [highlightedDustbin, setHighlightedDustbin] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("all"); // "all", "full", "medium", "empty"
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [searchRadius, setSearchRadius] = useState(1000); // meters
    const [nearbyDustbins, setNearbyDustbins] = useState([]);

    const mapRef = useRef(null);
    const markersRef = useRef({});

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

    // Initialize user location
    useEffect(() => {
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

                            await fetchDustbins();
                            findNearbyDustbins(location);
                        },
                        async (error) => {
                            console.warn("Geolocation error:", error);
                            const fallbackLocation = { lat: 21.0932, lng: 78.9816 };
                            setUserLocation(fallbackLocation);

                            const address = await getAddressFromCoordinates(fallbackLocation.lat, fallbackLocation.lng);
                            setUserAddress(address);

                            await fetchDustbins();
                            findNearbyDustbins(fallbackLocation);
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

                    await fetchDustbins();
                    findNearbyDustbins(fallbackLocation);
                }
            } catch (error) {
                console.error("Error initializing map:", error);
                setError("Failed to initialize map. Please try again.");
                setLoading(false);
            }
        };

        initializeMap();
    }, []);

    // Fetch dustbins from backend
    const fetchDustbins = async () => {
        try {
            setLoading(true);
            const res = await API.get("/dustbins");

            const formatted = res.data
                .filter(
                    (bin) =>
                        bin.location?.lat !== undefined &&
                        bin.location?.lng !== undefined &&
                        !isNaN(bin.location.lat) &&
                        !isNaN(bin.location.lng)
                )
                .map((bin, index) => {
                    const level = parseInt(bin.level) || 0;
                    let status = "Empty";
                    if (level >= 80) status = "Full";
                    else if (level >= 40) status = "Medium";

                    return {
                        uniqueKey: `${bin.dustbin_id || index}-${Date.now()}`,
                        id: bin.dustbin_id || `Dustbin-${index + 1}`,
                        address: bin.location.address || "No address provided",
                        lat: parseFloat(bin.location.lat),
                        lng: parseFloat(bin.location.lng),
                        level: level,
                        status: status,
                        lastUpdated: bin.last_updated || new Date().toISOString()
                    };
                });
            setDustbins(formatted);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dustbins", error);
            setError("Failed to load dustbin data. Please try again.");
            setLoading(false);
        }
    };

    // Find dustbins near user location
    const findNearbyDustbins = useCallback((location) => {
        if (!location || dustbins.length === 0) return;

        const R = 6371e3; // Earth's radius in meters
        const nearby = [];

        dustbins.forEach(bin => {
            const φ1 = location.lat * Math.PI / 180;
            const φ2 = bin.lat * Math.PI / 180;
            const Δφ = (bin.lat - location.lat) * Math.PI / 180;
            const Δλ = (bin.lng - location.lng) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (distance <= searchRadius) {
                nearby.push({ ...bin, distance: Math.round(distance) });
            }
        });

        // Sort by distance
        nearby.sort((a, b) => a.distance - b.distance);
        setNearbyDustbins(nearby);

        // Auto-highlight the nearest dustbin
        if (nearby.length > 0) {
            setHighlightedDustbin(nearby[0].uniqueKey);
        }
    }, [dustbins, searchRadius]);

    // Handle dustbin click
    const handleDustbinClick = (dustbinKey) => {
        setHighlightedDustbin(dustbinKey);

        // Fly to the clicked dustbin
        const dustbin = dustbins.find(d => d.uniqueKey === dustbinKey);
        if (dustbin && mapRef.current) {
            mapRef.current.flyTo([dustbin.lat, dustbin.lng], 18, {
                duration: 1
            });
        }
    };

    // Filter dustbins by status
    const filteredDustbins = dustbins.filter(dustbin => {
        if (selectedStatus === "all") return true;
        return dustbin.status.toLowerCase() === selectedStatus.toLowerCase();
    });

    // Refresh data
    const handleRefresh = async () => {
        await fetchDustbins();
        if (userLocation) {
            findNearbyDustbins(userLocation);
        }
    };

    // Locate user
    const locateUser = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
                duration: 1.5
            });
        }
    };

    // Handle status filter change
    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        setHighlightedDustbin(null);
    };

    // Calculate statistics
    const getStatistics = () => {
        const total = dustbins.length;
        const full = dustbins.filter(d => d.status === "Full").length;
        const medium = dustbins.filter(d => d.status === "Medium").length;
        const empty = dustbins.filter(d => d.status === "Empty").length;

        return { total, full, medium, empty };
    };

    const stats = getStatistics();

    if (loading && !userLocation) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <h3>Loading map and dustbin data...</h3>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Error Loading Map</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchDustbins}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="tracking-container">
            {/* Control Panel */}
            <div className="control-panel">
                <div className="panel-header">
                    <h3>🗑️ Dustbin Tracker</h3>
                    <button className="refresh-btn" onClick={handleRefresh}>
                        🔄 Refresh
                    </button>
                </div>

                {/* User Location */}
                <div className="user-location-info">
                    <div className="info-label">📍 Your Location</div>
                    <div className="info-value">{userAddress || "Location not specified"}</div>
                    <button className="locate-btn" onClick={locateUser}>
                        📍 Locate Me
                    </button>
                </div>

                {/* Statistics */}
                <div className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Dustbins</div>
                        </div>
                        <div className="stat-card full">
                            <div className="stat-value">{stats.full}</div>
                            <div className="stat-label">Full</div>
                        </div>
                        <div className="stat-card medium">
                            <div className="stat-value">{stats.medium}</div>
                            <div className="stat-label">Medium</div>
                        </div>
                        <div className="stat-card empty">
                            <div className="stat-value">{stats.empty}</div>
                            <div className="stat-label">Empty</div>
                        </div>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="filter-section">
                    <div className="filter-label">Filter by Status:</div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${selectedStatus === "all" ? "active" : ""}`}
                            onClick={() => handleStatusFilter("all")}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn empty ${selectedStatus === "empty" ? "active" : ""}`}
                            onClick={() => handleStatusFilter("empty")}
                        >
                            Empty
                        </button>
                        <button
                            className={`filter-btn medium ${selectedStatus === "medium" ? "active" : ""}`}
                            onClick={() => handleStatusFilter("medium")}
                        >
                            Medium
                        </button>
                        <button
                            className={`filter-btn full ${selectedStatus === "full" ? "active" : ""}`}
                            onClick={() => handleStatusFilter("full")}
                        >
                            Full
                        </button>
                    </div>
                </div>

                {/* Nearby Dustbins */}
                <div className="nearby-section">
                    <div className="section-header">
                        <span>📍 Nearby Dustbins ({nearbyDustbins.length})</span>
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
                    <div className="nearby-list">
                        {nearbyDustbins.length > 0 ? (
                            nearbyDustbins.slice(0, 5).map(dustbin => (
                                <div
                                    key={dustbin.uniqueKey}
                                    className={`nearby-item ${highlightedDustbin === dustbin.uniqueKey ? "highlighted" : ""}`}
                                    onClick={() => handleDustbinClick(dustbin.uniqueKey)}
                                >
                                    <div className="nearby-item-header">
                                        <span className="dustbin-name">🗑️ {dustbin.id}</span>
                                        <span className={`status-badge ${dustbin.status.toLowerCase()}`}>
                                            {dustbin.status}
                                        </span>
                                    </div>
                                    <div className="nearby-item-details">
                                        <span className="distance">{dustbin.distance}m away</span>
                                        <span className="level">Level: {dustbin.level}%</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-nearby">No dustbins found within {searchRadius}m</div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="legend-section">
                    <div className="legend-label">Legend:</div>
                    <div className="legend-items">
                        <div className="legend-item">
                            <div className="legend-icon empty"></div>
                            <span>Empty (&lt;40%)</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-icon medium"></div>
                            <span>Medium (40-79%)</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-icon full"></div>
                            <span>Full (≥80%)</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-icon highlighted"></div>
                            <span>Selected</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <span>Updating dustbin data...</span>
                </div>
            )}

            {/* Map Container */}
            <div className="map-container">
                <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={15}
                    ref={mapRef}
                    scrollWheelZoom={true}
                    zoomControl={true}
                    className="leaflet-map"
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
                    {userLocation && (
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
                    )}

                    {/* User Marker */}
                    {userLocation && (
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={createUserIcon()}
                        >
                            <Popup className="custom-popup">
                                <div className="popup-content">
                                    <h4>📍 Your Location</h4>
                                    <p>{userAddress || "Location not specified"}</p>
                                    <p className="coordinates">
                                        {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Dustbin Markers */}
                    {filteredDustbins.map((bin) => {
                        const isHighlighted = highlightedDustbin === bin.uniqueKey;
                        return (
                            <Marker
                                key={bin.uniqueKey}
                                position={[bin.lat, bin.lng]}
                                icon={createDustbinIcon(bin.status, isHighlighted)}
                                eventHandlers={{
                                    click: () => handleDustbinClick(bin.uniqueKey),
                                }}
                                ref={(ref) => {
                                    if (ref) markersRef.current[bin.uniqueKey] = ref;
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="popup-content">
                                        <div className={`popup-header ${bin.status.toLowerCase()}`}>
                                            <h4>🗑️ Dustbin #{bin.id}</h4>
                                            <span className="popup-status">{bin.status}</span>
                                        </div>
                                        <p><strong>Address:</strong> {bin.address}</p>
                                        <p><strong>Fill Level:</strong> {bin.level}%</p>
                                        <p className="coordinates">
                                            <strong>Coordinates:</strong> {bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}
                                        </p>
                                        {bin.lastUpdated && (
                                            <p className="last-updated">
                                                <strong>Last updated:</strong> {new Date(bin.lastUpdated).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default Tracking;