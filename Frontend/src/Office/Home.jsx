import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Home2.css';

const API = axios.create({ baseURL: "http://localhost:3000" });

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const getBinColor = (level) => {
    if (level >= 80) return '#ef4444';
    if (level >= 60) return '#f97316';
    if (level >= 40) return '#eab308';
    return '#22c55e';
};

const getBinStatus = (level) => {
    if (level >= 80) return 'Critical';
    if (level >= 60) return 'High';
    if (level >= 40) return 'Medium';
    return 'Low';
};

const createBinIcon = (level, isHighlighted = false) => {
    const color = getBinColor(level);
    return L.divIcon({
        className: `h2-bin-icon ${isHighlighted ? 'highlighted' : ''}`,
        html: `<div class="h2-bin-dot ${isHighlighted ? 'h2-bin-dot--hl' : ''}" style="background:${color};width:${isHighlighted ? '32px' : '24px'};height:${isHighlighted ? '32px' : '24px'};">
                 ${isHighlighted ? '🗑️' : ''}
               </div>
               ${isHighlighted ? '<div class="h2-bin-pulse"></div>' : ''}
               <div class="h2-bin-level">${level}%</div>`,
        iconSize: isHighlighted ? [32, 32] : [24, 24],
        iconAnchor: isHighlighted ? [16, 16] : [12, 12],
        popupAnchor: [0, -14],
    });
};

const createLocationIcon = () => L.divIcon({
    html: `<div class="h2-loc-icon"><div class="h2-loc-pulse"></div><div class="h2-loc-dot"></div></div>`,
    iconSize: [40, 40], iconAnchor: [20, 20], popupAnchor: [0, -20], className: "h2-loc-marker"
});

const Homeh = () => {
    const [metrics, setMetrics] = useState({ totalUsers: 0, totalComplaints: 0, pendingComplaints: 0, resolvedComplaints: 0, inProgressComplaints: 0, totalDustbins: 0, criticalBins: 0 });
    const [dustbins, setDustbins] = useState([]);
    const [selectedBin, setSelectedBin] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [complaintsByStatus, setComplaintsByStatus] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchRadius, setSearchRadius] = useState(2000);
    const [nearbyDustbins, setNearbyDustbins] = useState([]);
    const [highlightedDustbin, setHighlightedDustbin] = useState(null);
    const [articleCount, setArticleCount] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const mapRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
        initializeMap();
        fetchDashboardData();
        const interval = setInterval(() => { fetchDashboardData(); fetchDustbins(); }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (userLocation && dustbins.length > 0) findNearbyDustbins(userLocation);
    }, [userLocation, dustbins, searchRadius]);

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            return data.display_name || "Address not found";
        } catch { return "Address not available"; }
    };

    const initializeMap = async () => {
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setUserLocation(loc);
                        setUserAddress(await getAddressFromCoordinates(loc.lat, loc.lng));
                    },
                    async () => {
                        const fallback = { lat: 21.0932, lng: 78.9816 };
                        setUserLocation(fallback);
                        setUserAddress(await getAddressFromCoordinates(fallback.lat, fallback.lng));
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                const fallback = { lat: 21.0932, lng: 78.9816 };
                setUserLocation(fallback);
                setUserAddress(await getAddressFromCoordinates(fallback.lat, fallback.lng));
            }
        } catch (e) { console.error(e); }
    };

    const fetchArticles = async () => {
        try { const res = await API.get('/articles'); setArticleCount(res.data.length); }
        catch (e) { console.error(e); }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true); setError(null);
            const statsRes = await API.get('/monitor/stats');
            if (statsRes.data.success) {
                const { stats, recent } = statsRes.data;
                setMetrics(prev => ({ ...prev, totalUsers: stats.totalUsers || 0, totalComplaints: stats.totalComplaints || 0, pendingComplaints: stats.pendingComplaints || 0, resolvedComplaints: stats.resolvedComplaints || 0, inProgressComplaints: stats.inProgressComplaints || 0 }));
                const activities = [];
                recent.complaints?.forEach(c => activities.push({ id: c._id, user: c.user?.fullName || 'Unknown', action: `Filed: ${c.complaintType}`, time: formatTimeAgo(c.createdAt), icon: '📋', type: 'complaint', status: c.status || 'pending', statusColor: getStatusColor(c.status) }));
                recent.users?.forEach(u => activities.push({ id: u._id, user: u.fullName || 'New User', action: 'Registered', time: formatTimeAgo(u.createdAt), icon: '👤', type: 'registration' }));
                setRecentActivities(activities);
                if (recent.complaints) {
                    const grouped = recent.complaints.reduce((acc, c) => {
                        const s = c.status || 'pending';
                        if (!acc[s]) acc[s] = [];
                        acc[s].push({ id: c._id, title: c.complaintType, user: c.user?.fullName || 'Anonymous', time: formatTimeAgo(c.createdAt), description: (c.description?.substring(0, 50) || '') + '...' });
                        return acc;
                    }, {});
                    setComplaintsByStatus([
                        { status: 'pending', title: 'Pending', count: stats.pendingComplaints || 0, icon: '⏳', color: '#d97706', items: grouped.pending || [] },
                        { status: 'in-progress', title: 'In Progress', count: stats.inProgressComplaints || 0, icon: '🔄', color: '#1d4ed8', items: grouped['in-progress'] || [] },
                        { status: 'resolved', title: 'Resolved', count: stats.resolvedComplaints || 0, icon: '✅', color: '#1a6b3a', items: grouped.resolved || [] },
                    ]);
                }
            } else throw new Error('Failed to fetch stats');
            await fetchDustbins();
        } catch (err) { console.error(err); setError('Failed to load dashboard data. Please try again.'); }
        finally { setLoading(false); }
    };

    const fetchDustbins = async () => {
        try {
            const res = await API.get("/dustbins");
            const formatted = res.data.filter(b => b.coordinates?.lat !== undefined && b.coordinates?.lng !== undefined && !isNaN(b.coordinates.lat) && !isNaN(b.coordinates.lng))
                .map((bin, index) => {
                    const level = Number(bin.level) || 0;
                    return { uniqueKey: `${bin.dustbin_id}-${index}`, id: bin.dustbin_id, dustbin_id: bin.dustbin_id, coordinates: { lat: Number(bin.coordinates.lat), lng: Number(bin.coordinates.lng) }, level, status: getBinStatus(level), address: bin.address || "Address not specified", capacity: bin.capacity || '500L', type: bin.type || 'Public Bin', lastCollection: bin.lastCollection || 'Not specified', lastUpdated: bin.updatedAt || bin.createdAt, updatedAt: new Date(bin.updatedAt || bin.createdAt).toLocaleString() };
                });
            setDustbins(formatted);
            setMetrics(prev => ({ ...prev, totalDustbins: formatted.length, criticalBins: formatted.filter(b => b.level >= 80).length }));
        } catch (e) { console.error(e); }
    };

    const findNearbyDustbins = (location) => {
        if (!location || dustbins.length === 0) return;
        const R = 6371e3;
        const nearby = dustbins.filter(bin => {
            const φ1 = location.lat * Math.PI / 180, φ2 = bin.coordinates.lat * Math.PI / 180;
            const Δφ = (bin.coordinates.lat - location.lat) * Math.PI / 180, Δλ = (bin.coordinates.lng - location.lng) * Math.PI / 180;
            const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            bin._distance = Math.round(dist);
            return dist <= searchRadius;
        }).map(b => ({ ...b, distance: b._distance })).sort((a, b) => a.distance - b.distance);
        setNearbyDustbins(nearby);
        const critical = nearby.find(b => b.level >= 80);
        setHighlightedDustbin(critical ? critical.uniqueKey : nearby[0]?.uniqueKey || null);
    };

    const handleDustbinClick = (dustbin) => {
        setSelectedBin(dustbin);
        setHighlightedDustbin(dustbin.uniqueKey);
        if (dustbin.coordinates && mapRef.current) mapRef.current.flyTo([dustbin.coordinates.lat, dustbin.coordinates.lng], 18, { duration: 1 });
    };

    const handleMarkAsCollected = async (dustbinId) => {
        setDustbins(prev => prev.map(bin => bin.dustbin_id === dustbinId ? { ...bin, level: 0, lastCollection: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), updatedAt: 'Just now', status: 'Low' } : bin));
        alert(`✅ Dustbin ${dustbinId} marked as collected!`);
    };

    const handleDetailedComplaints = async () => {
        try { const res = await API.get("/c_data"); navigate("/show-complaints", { state: res.data }); }
        catch (e) { console.error(e); }
    };

    const handleUserProgress = async () => {
        try {
            const res = await API.get("/users/progress");
            if (!res.data?.data?.length) { alert("No user progress data found"); return; }
            navigate("/user-progress", { state: res.data.data });
        } catch (e) { console.error(e); alert("Could not load user progress data"); }
    };

    const handleTriningData = async (status) => {
        try { const res = await API.get('/articles'); navigate("/editArtical", { state: { data: res.data, status } }); }
        catch (e) { console.error(e); alert(`Could not load ${status} complaints`); }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Just now';
        try {
            const diff = new Date() - new Date(dateString);
            const mins = Math.floor(diff / 60000), hrs = Math.floor(mins / 60), days = Math.floor(hrs / 24);
            if (days > 0) return `${days}d ago`;
            if (hrs > 0) return `${hrs}h ago`;
            if (mins > 0) return `${mins}m ago`;
            return 'Just now';
        } catch { return 'Recently'; }
    };

    const getStatusColor = (s) => ({ pending: '#d97706', 'in-progress': '#1d4ed8', resolved: '#1a6b3a' }[s] || '#6b7280');
    const getStatusIcon = (s) => ({ pending: '⏳', 'in-progress': '🔄', resolved: '✅' }[s] || '📋');
    const locateUser = () => { if (mapRef.current && userLocation) mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 }); };

    if (loading) return (
        <div className="h2-state">
            <div className="h2-spinner"></div>
            <p>Loading admin dashboard…</p>
        </div>
    );

    if (error) return (
        <div className="h2-state h2-state--error">
            <div className="h2-state-icon">⚠️</div>
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button className="h2-btn h2-btn--primary" onClick={fetchDashboardData}>Retry</button>
        </div>
    );

    const resolutionRate = Math.round((metrics.resolvedComplaints / Math.max(metrics.totalComplaints, 1)) * 100);

    return (
        <div className="h2-page">

            {/* ── TOP STATS ROW ── */}
            <div className="h2-stats">
                {[
                    { icon: '👥', val: metrics.totalUsers, label: 'Total Users', action: () => handleUserProgress(), actionLabel: 'View Progress →' },
                    { icon: '📋', val: metrics.totalComplaints, label: 'Total Complaints', action: () => handleDetailedComplaints(), actionLabel: 'Detailed Info →' },
                    { icon: '🗑️', val: metrics.totalDustbins, label: 'Total Bins', sub: `⚠️ ${metrics.criticalBins} Critical` },
                    { icon: '📚', val: articleCount, label: 'Training Articles', action: () => handleTriningData('edit'), actionLabel: 'Edit Articles →' },
                    { icon: '📊', val: `${resolutionRate}%`, label: 'Resolution Rate', sub: `⏳ ${metrics.pendingComplaints} pending · ✅ ${metrics.resolvedComplaints} resolved` },
                ].map(s => (
                    <div className="h2-stat" key={s.label}>
                        <div className="h2-stat-icon">{s.icon}</div>
                        <div className="h2-stat-body">
                            <div className="h2-stat-val">{s.val}</div>
                            <div className="h2-stat-label">{s.label}</div>
                            {s.sub && <div className="h2-stat-sub">{s.sub}</div>}
                            {s.action && <button className="h2-stat-link" onClick={s.action}>{s.actionLabel}</button>}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="h2-grid">

                {/* LEFT: MAP */}
                <div className="h2-map-col">
                    <div className="h2-card">
                        <div className="h2-card-head">
                            <h2 className="h2-card-title">📍 Dustbin Monitoring <span className="h2-count-pill">{dustbins.length} bins</span></h2>
                            <div className="h2-map-controls">
                                <button className="h2-btn h2-btn--sm" onClick={() => { fetchDustbins(); fetchDashboardData(); }} disabled={loading}>🔄 Refresh</button>
                                <button className="h2-btn h2-btn--sm h2-btn--saffron" onClick={locateUser}>📍 Locate</button>
                                <select className="h2-select" value={searchRadius} onChange={e => setSearchRadius(Number(e.target.value))}>
                                    <option value={500}>500m</option>
                                    <option value={1000}>1km</option>
                                    <option value={2000}>2km</option>
                                    <option value={5000}>5km</option>
                                </select>
                            </div>
                        </div>

                        <div className="h2-map-wrap">
                            {userLocation ? (
                                <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={15} ref={mapRef} scrollWheelZoom style={{ height: '420px', width: '100%' }}>
                                    <LayersControl position="topright">
                                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                                            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        </LayersControl.BaseLayer>
                                        <LayersControl.BaseLayer name="Satellite">
                                            <TileLayer attribution='&copy; Google Satellite' url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                                        </LayersControl.BaseLayer>
                                    </LayersControl>
                                    <Circle center={[userLocation.lat, userLocation.lng]} radius={searchRadius} pathOptions={{ fillColor: '#0C1B33', color: '#0C1B33', fillOpacity: 0.07, weight: 1.5 }} />
                                    <Marker position={[userLocation.lat, userLocation.lng]} icon={createLocationIcon()}>
                                        <Popup><div className="h2-popup-head">📍 Admin Location</div><p className="h2-popup-sub">{userAddress}</p></Popup>
                                    </Marker>
                                    {dustbins.map(bin => (
                                        <Marker key={bin.uniqueKey} position={[bin.coordinates.lat, bin.coordinates.lng]} icon={createBinIcon(bin.level, highlightedDustbin === bin.uniqueKey)} eventHandlers={{ click: () => handleDustbinClick(bin) }}>
                                            <Popup>
                                                <div className="h2-bin-popup">
                                                    <div className="h2-popup-head">🗑️ {bin.dustbin_id}</div>
                                                    <div className="h2-popup-row"><span>Status</span><span className={`h2-sl h2-sl--${bin.status.toLowerCase()}`}>{bin.status} ({bin.level}%)</span></div>
                                                    <div className="h2-popup-row"><span>Address</span><span>{bin.address}</span></div>
                                                    <div className="h2-popup-row"><span>Updated</span><span>{bin.updatedAt}</span></div>
                                                    <button className="h2-popup-btn" onClick={() => handleMarkAsCollected(bin.dustbin_id)}>📝 Update Status</button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            ) : (
                                <div className="h2-map-placeholder"><div className="h2-spinner"></div><p>Loading map…</p></div>
                            )}
                        </div>

                        {/* Below map */}
                        <div className="h2-map-footer">
                            <div className="h2-nearby">
                                <div className="h2-nearby-head">📍 Nearby <span className="h2-nearby-count">{nearbyDustbins.length}</span></div>
                                <div className="h2-nearby-list">
                                    {nearbyDustbins.length > 0 ? nearbyDustbins.slice(0, 5).map(bin => (
                                        <div key={bin.uniqueKey} className={`h2-nearby-item ${highlightedDustbin === bin.uniqueKey ? 'h2-nearby-item--hl' : ''}`} onClick={() => handleDustbinClick(bin)}>
                                            <span>🗑️ {bin.dustbin_id}</span>
                                            <span className={`h2-sl h2-sl--${bin.status.toLowerCase()}`}>{bin.status}</span>
                                            <span className="h2-dist">{bin.distance}m</span>
                                        </div>
                                    )) : <div className="h2-nearby-empty">No bins within {searchRadius}m</div>}
                                </div>
                            </div>
                            <div className="h2-legend">
                                <div className="h2-legend-head">Fill Level</div>
                                {[
                                    { cls: 'critical', label: 'Critical (≥80%)', count: dustbins.filter(b => b.level >= 80).length },
                                    { cls: 'high', label: 'High (60–80%)', count: dustbins.filter(b => b.level >= 60 && b.level < 80).length },
                                    { cls: 'medium', label: 'Medium (40–60%)', count: dustbins.filter(b => b.level >= 40 && b.level < 60).length },
                                    { cls: 'low', label: 'Low (<40%)', count: dustbins.filter(b => b.level < 40).length },
                                ].map(l => (
                                    <div key={l.cls} className="h2-legend-item">
                                        <span className={`h2-legend-dot h2-legend-dot--${l.cls}`}></span>
                                        <span className="h2-legend-label">{l.label}</span>
                                        <span className="h2-legend-count">{l.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: TABS + QUICK ACTIONS */}
                <div className="h2-right-col">

                    {/* Tabs */}
                    <div className="h2-tabs">
                        {[{ id: 'overview', icon: '📊', label: 'Overview' }, { id: 'complaints', icon: '📋', label: 'Complaints' }, { id: 'activities', icon: '📝', label: 'Activities' }].map(t => (
                            <button key={t.id} className={`h2-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="h2-tab-content">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="h2-overview">
                                <h3 className="h2-tab-title">Complaints Overview</h3>
                                <div className="h2-overview-grid">
                                    {complaintsByStatus.map(sg => (
                                        <div className="h2-overview-card" key={sg.status}>
                                            <div className="h2-oc-head">
                                                <span style={{ color: sg.color }}>{sg.icon}</span>
                                                <h4>{sg.title}</h4>
                                                <span className="h2-oc-count">{sg.count}</span>
                                            </div>
                                            <div className="h2-oc-list">
                                                {sg.items.length > 0 ? sg.items.slice(0, 3).map(item => (
                                                    <div className="h2-oc-item" key={item.id}>
                                                        <div className="h2-oc-item-title">{item.title}</div>
                                                        <div className="h2-oc-item-meta">{item.user} · {item.time}</div>
                                                    </div>
                                                )) : <div className="h2-oc-empty">No complaints</div>}
                                            </div>
                                            {sg.items.length > 0 && <button className="h2-view-all-btn" onClick={() => alert(`View all ${sg.status}`)}>View All →</button>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Complaints Tab */}
                        {activeTab === 'complaints' && (
                            <div className="h2-cmp-tab">
                                <h3 className="h2-tab-title">Complaints Management</h3>
                                <div className="h2-cmp-filters">
                                    {[
                                        { id: 'all', label: `All (${metrics.totalComplaints})` },
                                        { id: 'pending', label: `Pending (${metrics.pendingComplaints})` },
                                        { id: 'in-progress', label: `In Progress (${metrics.inProgressComplaints})` },
                                        { id: 'resolved', label: `Resolved (${metrics.resolvedComplaints})` },
                                    ].map(f => (
                                        <button key={f.id} className={`h2-filter-btn ${selectedStatus === f.id ? 'active' : ''}`} onClick={() => setSelectedStatus(f.id)}>{f.label}</button>
                                    ))}
                                </div>
                                <div className="h2-quick-actions">
                                    <button className="h2-action-btn" onClick={handleDetailedComplaints}>📋 Manage All</button>
                                    <button className="h2-action-btn" onClick={() => alert('Assign workers')}>👥 Assign Workers</button>
                                    <button className="h2-action-btn" onClick={() => alert('Generate report')}>📊 Reports</button>
                                </div>
                            </div>
                        )}

                        {/* Activities Tab */}
                        {activeTab === 'activities' && (
                            <div className="h2-activity">
                                <div className="h2-activity-head">
                                    <h3 className="h2-tab-title">Recent Activities</h3>
                                    <button className="h2-btn h2-btn--sm" onClick={fetchDashboardData}>🔄 Refresh</button>
                                </div>
                                <div className="h2-activity-list">
                                    {recentActivities.length > 0 ? recentActivities.slice(0, 8).map(a => (
                                        <div className="h2-activity-item" key={a.id}>
                                            <div className="h2-activity-icon">{a.icon}</div>
                                            <div className="h2-activity-body">
                                                <div className="h2-activity-user">{a.user}</div>
                                                <div className="h2-activity-action">
                                                    {a.action}
                                                    {a.status && <span className="h2-activity-status" style={{ color: a.statusColor }}> {getStatusIcon(a.status)} {a.status}</span>}
                                                </div>
                                            </div>
                                            <div className="h2-activity-time">{a.time}</div>
                                        </div>
                                    )) : <div className="h2-activity-empty">No recent activities</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="h2-qa-panel">
                        <h3 className="h2-qa-title">⚡ Quick Actions</h3>
                        <div className="h2-qa-grid">
                            {[
                                { icon: '👥', label: 'Users', action: handleUserProgress },
                                { icon: '📋', label: 'Complaints', action: handleDetailedComplaints },
                                { icon: '📚', label: 'Articles', action: () => handleTriningData('edit') },
                                { icon: '🗑️', label: 'Dustbins', action: () => alert('Manage dustbins') },
                                { icon: '📊', label: 'Reports', action: () => alert('Generate reports') },
                                { icon: '⚙️', label: 'Settings', action: () => alert('System settings') },
                            ].map(a => (
                                <button key={a.label} className="h2-qa-btn" onClick={a.action}>
                                    <span className="h2-qa-icon">{a.icon}</span>
                                    <span>{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Bin Panel */}
            {selectedBin && (
                <div className="h2-bin-panel">
                    <div className="h2-bin-panel-head">
                        <h3>🗑️ {selectedBin.dustbin_id} Details</h3>
                        <button className="h2-panel-close" onClick={() => setSelectedBin(null)}>✕</button>
                    </div>
                    <div className="h2-bin-panel-body">
                        <div className="h2-bin-detail-grid">
                            <div><span className="h2-bdl">Address</span><span className="h2-bdv">{selectedBin.address}</span></div>
                            <div><span className="h2-bdl">Type</span><span className="h2-bdv">{selectedBin.type}</span></div>
                            <div><span className="h2-bdl">Status</span><span className={`h2-sl h2-sl--${selectedBin.status.toLowerCase()}`}>{selectedBin.status}</span></div>
                            <div><span className="h2-bdl">Updated</span><span className="h2-bdv">{selectedBin.updatedAt}</span></div>
                        </div>
                        <div className="h2-fill-meter-wrap">
                            <span className="h2-bdl">Fill Level</span>
                            <div className="h2-fill-meter">
                                <div className="h2-fill-fill" style={{ width: `${selectedBin.level}%`, background: getBinColor(selectedBin.level) }}></div>
                            </div>
                            <span className="h2-fill-pct">{selectedBin.level}%</span>
                        </div>
                        <div className="h2-bin-panel-actions">
                            <button className="h2-btn h2-btn--primary" onClick={() => handleMarkAsCollected(selectedBin.dustbin_id)}>📝 Update Status</button>
                            <button className="h2-btn h2-btn--saffron-solid" onClick={() => alert(`Assign worker to ${selectedBin.dustbin_id}`)}>👤 Assign Worker</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="h2-footer">
                <div className="h2-footer-info">
                    <span>Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Users: {metrics.totalUsers} · Complaints: {metrics.totalComplaints} · Bins: {metrics.totalDustbins}</span>
                    <span>System: <span className="h2-online">● Online</span></span>
                </div>
                <button className="h2-btn h2-btn--sm" onClick={fetchDashboardData} disabled={loading}>{loading ? '🔄 Refreshing…' : '🔄 Refresh'}</button>
            </footer>

        </div>
    );
};

export default Homeh;
