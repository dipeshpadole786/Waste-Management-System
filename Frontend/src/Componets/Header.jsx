import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [profileMenu, setProfileMenu] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenu && !event.target.closest('.user-profile')) {
                setProfileMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [profileMenu]);

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedInUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            const currentTime = new Date().getTime();
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

    return (
        <header className="gov-header">
            <div className="gov-header-inner">

                {/* LOGO */}
                <a href="/" className="gov-logo">
                    <div className="gov-emblem">☸</div>
                    <div className="gov-logo-text">
                        <h1>सुरक्षित नगर</h1>
                        <p>Ministry of Home Affairs</p>
                    </div>
                </a>

                {/* NAV */}
                <nav className={`gov-nav ${isMenuOpen ? "open" : ""}`}>
                    <a href="/" onClick={toggleMenu}>Home</a>
                    <a href="/tracking" onClick={toggleMenu}>Dustbin Tracking</a>
                    <a href="/training" onClick={toggleMenu}>Training & Awareness</a>
                    <a href="/notifications" onClick={toggleMenu}>
                        Notifications
                        <span className="nav-badge">5</span>
                    </a>
                    <a href="#citizen" onClick={toggleMenu}>Citizen Services</a>
                </nav>

                {/* RIGHT */}
                <div className="gov-header-right">
                    <div className="emergency-chip">
                        <span className="ec-dot"></span>
                        <div>
                            <div className="ec-num">112</div>
                            <div className="ec-label">Emergency</div>
                        </div>
                    </div>

                    <div className="user-section">
                        {loggedInUser ? (
                            <div className="user-profile">
                                <button
                                    className="profile-button"
                                    onClick={() => setProfileMenu(!profileMenu)}
                                >
                                    <div className="profile-avatar">
                                        {(loggedInUser.username || "U")[0].toUpperCase()}
                                    </div>
                                    <span className="user-name">{loggedInUser.username || "User"}</span>
                                    <span className={`dropdown-arrow ${profileMenu ? "open" : ""}`}>▼</span>
                                </button>
                                {profileMenu && (
                                    <div className="profile-dropdown">
                                        <a href="/profile" onClick={() => setProfileMenu(false)}>
                                            <span>👤</span> Profile
                                        </a>
                                        <a href="/login" onClick={() => setProfileMenu(false)}>
                                            <span>🔄</span> Switch Account
                                        </a>
                                        <button onClick={handleLogout}>
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="login-button"
                                onClick={() => window.location.href = "/login"}
                            >
                                👤 Login / Register
                            </button>
                        )}
                    </div>
                </div>

                {/* HAMBURGER */}
                <button
                    className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </div>
        </header>
    );
};

export default Header;