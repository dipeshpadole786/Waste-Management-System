// Header.jsx (Government Theme)
import React, { useState } from 'react';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="government-header">
            {/* Top Government Strip */}
            {/* <div className="government-top-strip">
                <div className="container">
                    <div className="government-info">
                        <span className="govt-info-item">
                            <span className="info-icon">🏛️</span>
                            Government of India Initiative
                        </span>
                        <span className="govt-info-item">
                            <span className="info-icon">🌐</span>
                            A Digital India Program
                        </span>
                        <span className="govt-info-item">
                            <span className="info-icon">🔒</span>
                            Secure & Verified
                        </span>
                    </div>
                    <div className="language-selector">
                        <select className="language-dropdown">
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="ta">தமிழ்</option>
                            <option value="te">తెలుగు</option>
                        </select>
                    </div>
                </div>
            </div> */}

            {/* Main Header */}
            <div className="government-main-header">
                <div className="container">
                    {/* Left Section - Logo and Title */}
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

                    {/* Hamburger Menu for Mobile */}
                    <button
                        className="hamburger-menu"
                        onClick={toggleMenu}
                        aria-label="Toggle navigation menu"
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>

                    {/* Main Navigation */}
                    <nav className={`government-nav ${isMenuOpen ? 'open' : ''}`}>
                        <ul>
                            <li>
                                <a href="/" onClick={toggleMenu}>
                                    <span className="nav-icon">🏠</span>
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/tracking" onClick={toggleMenu}>
                                    <span className="nav-icon">🚚</span>
                                    Vehicles Tracking
                                </a>
                            </li>
                            <li>
                                <a href="/training" onClick={toggleMenu}>
                                    <span className="nav-icon">🎓</span>
                                    Training & Awareness
                                </a>
                            </li>
                            <li>
                                <a href="#notifications" onClick={toggleMenu}>
                                    <span className="nav-icon">📢</span>
                                    Notifications
                                    <span className="notification-badge">5</span>
                                </a>
                            </li>
                            <li>
                                <a href="#citizen" onClick={toggleMenu}>
                                    <span className="nav-icon">👥</span>
                                    Citizen Services
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Right Section - User Area */}
                    <div className="header-right">
                        <div className="emergency-quick">
                            <span className="emergency-icon">🚨</span>
                            <div className="emergency-info">
                                <span className="emergency-label">Emergency</span>
                                <span className="emergency-number">112</span>
                            </div>
                        </div>
                        <a href="/login">
                            <div className="user-profile">
                                <button className="login-button">
                                    <span className="user-icon">👤</span>
                                    <span className="login-text">Login / Register</span>
                                </button>
                            </div></a>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;