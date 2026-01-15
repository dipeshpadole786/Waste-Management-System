import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import API from '../API/api_req';

const Headerw = () => {
  const navigate = useNavigate();

  // 🔐 Get logged-in user
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const workerId = storedUser?._id;

  const [worker, setWorker] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔔 Fetch worker details
  useEffect(() => {
    const fetchWorkerDetails = async () => {
      if (!workerId) {
        setLoading(false);
        return;
      }

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

  // 🔒 Only for worker
  if (!storedUser || storedUser.role !== 'worker') return null;

  // ⏳ Loading
  if (loading) {
    return (
      <header className="worker-header">
        <h2>Smart Waste Management</h2>
        <span>Loading...</span>
      </header>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <header className="worker-header">
        <h2>Smart Waste Management</h2>
        <span>{error}</span>
      </header>
    );
  }

  return (
    <header className="worker-header">
      {/* LEFT */}
      <div className="header-left">
        <h2>Smart Waste Management</h2>
      </div>

      {/* RIGHT */}
      <div className="header-right">
        <div className="profile-container">
          <button
            className="profile-btn"
            onClick={() => setShowProfileMenu(prev => !prev)}
          >
            <div className="profile-avatar">
              {worker?.fullName?.charAt(0) || 'W'}
            </div>
            <span className="profile-name">
              {worker?.fullName || 'Worker'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <p><strong>{worker.fullName}</strong></p>
              <p>{worker.email}</p>
              <hr />

              {/* 👤 PROFILE OPTION */}
              <button
                className="dropdown-btn"
                onClick={() =>
                  navigate('/worker-profile', { state: { worker } })
                }
              >
                Profile
              </button>

              {/* 🚪 LOGOUT */}
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Headerw;
