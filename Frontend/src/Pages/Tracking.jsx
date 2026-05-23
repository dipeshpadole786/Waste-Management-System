import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../API/api_req";
import "./Tracking.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createDustbinIcon = (status, isHighlighted = false) => {
    let color;
    switch (status.toLowerCase()) {
        case "full": color = "#C0392B"; break;
        case "medium": color = "#E07B2A"; break;
        case "empty": color = "#1A6B3A"; break;
        default: color = "#8A9BB0";
    }
    const size = isHighlighted ? "32px" : "24px";
    return new L.DivIcon({
        html: `
            <div class="trk-bin-icon ${isHighlighted ? 'trk-bin-icon--hl' : ''}"
                 style="background:${color};width:${size};height:${size};">
                ${isHighlighted ? '🗑️' : ''}
            </div>
            ${isHighlighted ? '<div class="trk-bin-pulse"></div>' : ''}
        `,
        iconSize: isHighlighted ? [32, 32] : [24, 24],
        iconAnchor: isHighlighted ? [16, 16] : [12, 12],
        popupAnchor: [0, -12],
        className: `trk-bin-marker ${isHighlighted ? 'trk-bin-marker--hl' : ''}`
    });
};

const createUserIcon = () => new L.DivIcon({
    html: `
        <div class="trk-user-icon">
            <div class="trk-user-pulse"></div>
            <div class="trk-user-dot"></div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: "trk-user-marker"
});

const Tracking = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [dustbins, setDustbins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [highlightedDustbin, setHighlightedDustbin] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchRadius, setSearchRadius] = useState(1000);
    const [nearbyDustbins, setNearbyDustbins] = useState([]);

    const mapRef = useRef(null);
    const markersRef = useRef({});

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            return data.display_name || "Address not found";
        } catch { return "Address not available"; }
    };

    useEffect(() => {
        const initializeMap = async () => {
            const fallback = { lat: 21.0932, lng: 78.9816 };
            const handleLocation = async (loc) => {
                setUserLocation(loc);
                const addr = await getAddressFromCoordinates(loc.lat, loc.lng);
                setUserAddress(addr);
                await fetchDustbins();
                findNearbyDustbins(loc);
            };
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    pos => handleLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => handleLocation(fallback),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                await handleLocation(fallback);
            }
        };
        initializeMap().catch(() => { setError("Failed to initialize map."); setLoading(false); });
    }, []);

    const fetchDustbins = async () => {
        try {
            setLoading(true);
            const res = await API.get("/dustbins");
            const formatted = res.data
                .filter(b => b.coordinates?.lat !== undefined && !isNaN(b.coordinates.lat))
                .map((bin, i) => {
                    const level = Number(bin.level) || 0;
                    const status = level >= 80 ? "Full" : level >= 40 ? "Medium" : "Empty";
                    return {
                        uniqueKey: `${bin.dustbin_id}-${i}`,
                        id: bin.dustbin_id,
                        lat: Number(bin.coordinates.lat),
                        lng: Number(bin.coordinates.lng),
                        level, status,
                        lastUpdated: bin.updatedAt || bin.createdAt
                    };
                });
            setDustbins(formatted);
            setLoading(false);
        } catch {
            setError("Failed to load dustbin data.");
            setLoading(false);
        }
    };

    const findNearbyDustbins = useCallback((location) => {
        if (!location || dustbins.length === 0) return;
        const R = 6371e3;
        const nearby = dustbins.map(bin => {
            const φ1 = location.lat * Math.PI / 180, φ2 = bin.lat * Math.PI / 180;
            const Δφ = (bin.lat - location.lat) * Math.PI / 180;
            const Δλ = (bin.lng - location.lng) * Math.PI / 180;
            const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
            const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return { ...bin, distance: Math.round(d) };
        }).filter(b => b.distance <= searchRadius).sort((a, b) => a.distance - b.distance);
        setNearbyDustbins(nearby);
        if (nearby.length > 0) setHighlightedDustbin(nearby[0].uniqueKey);
    }, [dustbins, searchRadius]);

    const handleDustbinClick = (key) => {
        setHighlightedDustbin(key);
        const bin = dustbins.find(d => d.uniqueKey === key);
        if (bin && mapRef.current) mapRef.current.flyTo([bin.lat, bin.lng], 18, { duration: 1 });
    };

    const filteredDustbins = dustbins.filter(b =>
        selectedStatus === "all" || b.status.toLowerCase() === selectedStatus.toLowerCase()
    );

    const handleRefresh = async () => {
        await fetchDustbins();
        if (userLocation) findNearbyDustbins(userLocation);
    };

    const locateUser = () => {
        if (mapRef.current && userLocation)
            mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
    };

    const stats = {
        total: dustbins.length,
        full: dustbins.filter(d => d.status === "Full").length,
        medium: dustbins.filter(d => d.status === "Medium").length,
        empty: dustbins.filter(d => d.status === "Empty").length,
    };

    if (loading && !userLocation) return (
        <div className="trk-loading">
            <div className="trk-spinner"></div>
            <h3>Loading map and dustbin data…</h3>
        </div>
    );

    if (error) return (
        <div className="trk-error">
            <div className="trk-error-icon">⚠️</div>
            <h3>Error Loading Map</h3>
            <p>{error}</p>
            <button className="trk-btn trk-btn-primary" onClick={fetchDustbins}>Retry</button>
        </div>
    );

    return (
        <div className="trk-wrap">

            {/* Control Panel */}
            <div className="trk-panel">
                <div className="trk-panel-head">
                    <h3>🗑️ Dustbin Tracker</h3>
                    <button className="trk-btn trk-btn-ghost" onClick={handleRefresh}>🔄 Refresh</button>
                </div>

                {/* Location */}
                <div className="trk-section">
                    <div className="trk-section-label">📍 Your Location</div>
                    <div className="trk-location-val">{userAddress || "Location not specified"}</div>
                    <button className="trk-btn trk-btn-outline trk-mt8" onClick={locateUser}>
                        📍 Locate Me
                    </button>
                </div>

                {/* Stats */}
                <div className="trk-section">
                    <div className="trk-section-label">Statistics</div>
                    <div className="trk-stats-grid">
                        <div className="trk-stat">
                            <div className="trk-stat-val">{stats.total}</div>
                            <div className="trk-stat-lbl">Total</div>
                        </div>
                        <div className="trk-stat trk-stat--full">
                            <div className="trk-stat-val">{stats.full}</div>
                            <div className="trk-stat-lbl">Full</div>
                        </div>
                        <div className="trk-stat trk-stat--medium">
                            <div className="trk-stat-val">{stats.medium}</div>
                            <div className="trk-stat-lbl">Medium</div>
                        </div>
                        <div className="trk-stat trk-stat--empty">
                            <div className="trk-stat-val">{stats.empty}</div>
                            <div className="trk-stat-lbl">Empty</div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="trk-section">
                    <div className="trk-section-label">Filter by Status</div>
                    <div className="trk-filter-row">
                        {["all", "empty", "medium", "full"].map(s => (
                            <button
                                key={s}
                                className={`trk-filter-btn trk-filter-btn--${s} ${selectedStatus === s ? 'active' : ''}`}
                                onClick={() => { setSelectedStatus(s); setHighlightedDustbin(null); }}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nearby */}
                <div className="trk-section">
                    <div className="trk-nearby-head">
                        <div className="trk-section-label">📍 Nearby ({nearbyDustbins.length})</div>
                        <select
                            className="trk-radius-select"
                            value={searchRadius}
                            onChange={e => setSearchRadius(Number(e.target.value))}
                        >
                            <option value={500}>500m</option>
                            <option value={1000}>1km</option>
                            <option value={2000}>2km</option>
                            <option value={5000}>5km</option>
                        </select>
                    </div>
                    <div className="trk-nearby-list">
                        {nearbyDustbins.length > 0 ? nearbyDustbins.slice(0, 5).map(bin => (
                            <div
                                key={bin.uniqueKey}
                                className={`trk-nearby-item ${highlightedDustbin === bin.uniqueKey ? 'active' : ''}`}
                                onClick={() => handleDustbinClick(bin.uniqueKey)}
                            >
                                <div className="trk-nearby-row">
                                    <span className="trk-nearby-name">🗑️ {bin.id}</span>
                                    <span className={`trk-status-tag trk-status-tag--${bin.status.toLowerCase()}`}>
                                        {bin.status}
                                    </span>
                                </div>
                                <div className="trk-nearby-meta">
                                    <span>{bin.distance}m away</span>
                                    <span>Level: {bin.level}%</span>
                                </div>
                            </div>
                        )) : (
                            <div className="trk-no-nearby">No dustbins within {searchRadius}m</div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="trk-section">
                    <div className="trk-section-label">Legend</div>
                    <div className="trk-legend">
                        {[
                            { cls: "empty", label: "Empty (<40%)" },
                            { cls: "medium", label: "Medium (40–79%)" },
                            { cls: "full", label: "Full (≥80%)" },
                        ].map(l => (
                            <div className="trk-legend-item" key={l.cls}>
                                <div className={`trk-legend-dot trk-legend-dot--${l.cls}`}></div>
                                <span>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="trk-loading-overlay">
                    <div className="trk-spinner"></div>
                    <span>Updating data…</span>
                </div>
            )}

            {/* Map */}
            <div className="trk-map-wrap">
                <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={15}
                    ref={mapRef}
                    scrollWheelZoom={true}
                    className="trk-leaflet-map"
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite">
                            <TileLayer
                                attribution='&copy; Google Maps'
                                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    {userLocation && (
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={searchRadius}
                            pathOptions={{ fillColor: '#0C1B33', color: '#0C1B33', fillOpacity: 0.06, weight: 1.5 }}
                        />
                    )}

                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
                            <Popup className="trk-popup">
                                <div className="trk-popup-content">
                                    <h4>📍 Your Location</h4>
                                    <p>{userAddress || "Location not specified"}</p>
                                    <p className="trk-coords">{userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {filteredDustbins.map(bin => (
                        <Marker
                            key={bin.uniqueKey}
                            position={[bin.lat, bin.lng]}
                            icon={createDustbinIcon(bin.status, highlightedDustbin === bin.uniqueKey)}
                            eventHandlers={{ click: () => handleDustbinClick(bin.uniqueKey) }}
                            ref={ref => { if (ref) markersRef.current[bin.uniqueKey] = ref; }}
                        >
                            <Popup className="trk-popup">
                                <div className="trk-popup-content">
                                    <div className={`trk-popup-head trk-popup-head--${bin.status.toLowerCase()}`}>
                                        <h4>🗑️ Dustbin #{bin.id}</h4>
                                        <span>{bin.status}</span>
                                    </div>
                                    <p><strong>Fill Level:</strong> {bin.level}%</p>
                                    <p className="trk-coords">{bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}</p>
                                    {bin.lastUpdated && (
                                        <p><strong>Updated:</strong> {new Date(bin.lastUpdated).toLocaleString()}</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default Tracking;