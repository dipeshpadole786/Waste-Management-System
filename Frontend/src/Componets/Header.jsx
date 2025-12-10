// Header.jsx (Government Theme)
import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [profileMenu, setProfileMenu] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileMenu = () => {
        setProfileMenu(!profileMenu);
    };

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenu && !event.target.closest('.user-profile')) {
                setProfileMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [profileMenu]);

    // Check login status
    useEffect(() => {
        const storedUser = localStorage.getItem("loggedInUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            const currentTime = new Date().getTime();

            // 7-Day expiry check
            if (!userObj.expiry || currentTime < userObj.expiry) {
                setLoggedInUser(userObj);
            } else {
                localStorage.removeItem("loggedInUser");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        setLoggedInUser(null);
        setProfileMenu(false);
        window.location.href = "/";
    };

    const handleLogin = () => {
        window.location.href = "/login";
    };

    return (
        <header className="government-header">
            <div className="government-main-header">
                <div className="container">

                    {/* LEFT SIDE */}
                    <div className="header-left">
                        <div className="national-emblem-small">
                            <div className="chakra-small">☸</div>
                        </div>
                        <div className="government-logo">
                            <h1>सुरक्षित नगर</h1>
                            <h2>Safe City Portal</h2>
                            <p className="department-name">Ministry of Home Affairs</p>
                        </div>
                    </div>

                    {/* HAMBURGER */}
                    <button
                        className="hamburger-menu"
                        onClick={toggleMenu}
                        aria-label="Toggle navigation menu"
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>

                    {/* NAV LINKS */}
                    <nav className={`government-nav ${isMenuOpen ? "open" : ""}`}>
                        <ul>
                            <li>
                                <a href="/" onClick={toggleMenu}>
                                    🏠 Home
                                </a>
                            </li>
                            <li>
                                <a href="/tracking" onClick={toggleMenu}>
                                    🚚 Vehicles Tracking
                                </a>
                            </li>
                            <li>
                                <a href="/training" onClick={toggleMenu}>
                                    🎓 Training & Awareness
                                </a>
                            </li>
                            <li>
                                <a href="#notifications" onClick={toggleMenu}>
                                    📢 Notifications <span className="notification-badge">5</span>
                                </a>
                            </li>
                            <li>
                                <a href="#citizen" onClick={toggleMenu}>
                                    👥 Citizen Services
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* RIGHT SIDE */}
                    <div className="header-right">
                        <div className="emergency-quick">
                            <span className="emergency-icon">🚨</span>
                            <span className="emergency-number">112</span>
                        </div>

                        {/* USER SECTION */}
                        <div className="user-section">
                            {loggedInUser ? (
                                <div className="user-profile">
                                    <button
                                        className="profile-button"
                                        onClick={toggleProfileMenu}
                                    >
                                        <span className="user-icon">👤</span>
                                        <span className="user-name">{loggedInUser.username || "User"}</span>
                                        <span className="dropdown-arrow">▼</span>
                                    </button>

                                    {/* PROFILE DROPDOWN MENU */}
                                    {profileMenu && (
                                        <div className="profile-dropdown">
                                            <a href="/profile" onClick={() => setProfileMenu(false)}>
                                                <span className="dropdown-icon">👤</span>
                                                Profile
                                            </a>
                                            <a href="/login" onClick={() => setProfileMenu(false)}>
                                                <span className="dropdown-icon">🔄</span>
                                                Switch Account
                                            </a>
                                            <button onClick={handleLogout}>
                                                <span className="dropdown-icon">🚪</span>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* LOGIN BUTTON */
                                <button className="login-button" onClick={handleLogin}>
                                    <span className="login-icon">👤</span>
                                    Login / Register
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;