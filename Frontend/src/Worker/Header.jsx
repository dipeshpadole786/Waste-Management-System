import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import API from '../API/api_req';

const Headerw = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const workerId = storedUser?._id;

  const [worker, setWorker] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (!workerId) { setLoading(false); return; }
      try {
        const res = await API.get(`/workers/${workerId}`);
        setWorker(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load worker details');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerDetails();
  }, [workerId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.hw-profile-wrap')) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!storedUser || storedUser.role !== 'worker') return null;

  return (
    <header className="hw-header">
      <div className="hw-tricolor" />
      <div className="hw-inner">

        {/* Brand */}
        <div className="hw-brand">
          <div className="hw-emblem">♻️</div>
          <div className="hw-brand-text">
            <span className="hw-title">Smart Waste Management</span>
            <span className="hw-subtitle">Worker Portal · Government of India</span>
          </div>
          <span className="hw-role-pill">Worker</span>
        </div>

        {/* Right side */}
        <div className="hw-right">
          {loading ? (
            <span className="hw-chip hw-chip--muted">Loading…</span>
          ) : error ? (
            <span className="hw-chip hw-chip--error">{error}</span>
          ) : (
            <div className="hw-profile-wrap">
              <button
                className="hw-profile-btn"
                onClick={() => setShowProfileMenu(p => !p)}
              >
                <div className="hw-avatar">{worker?.fullName?.charAt(0).toUpperCase() || 'W'}</div>
                <span className="hw-name">{worker?.fullName || 'Worker'}</span>
                <span className="hw-chevron">{showProfileMenu ? '▲' : '▼'}</span>
              </button>

              {showProfileMenu && (
                <div className="hw-dropdown">
                  <div className="hw-dropdown-head">
                    <div className="hw-dropdown-avatar">{worker?.fullName?.charAt(0).toUpperCase() || 'W'}</div>
                    <div>
                      <div className="hw-dropdown-name">{worker.fullName}</div>
                      <div className="hw-dropdown-email">{worker.email}</div>
                    </div>
                  </div>
                  <div className="hw-dropdown-sep" />
                  <button
                    className="hw-dropdown-item"
                    onClick={() => { setShowProfileMenu(false); navigate('/worker-profile', { state: { worker } }); }}
                  >
                    👤 View Profile
                  </button>
                  <button
                    className="hw-dropdown-item hw-dropdown-item--logout"
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Headerw;