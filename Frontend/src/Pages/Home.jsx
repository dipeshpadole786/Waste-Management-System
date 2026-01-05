// Home.jsx
import "./Home.css";
import { useState } from "react"; // Add this import
import { Top } from "../Componets/top";
import CameraReporter from "../Componets/Camera";
import NotificationFeed from "../Componets/Notification";

export function Home() {
    // Add state to control camera visibility
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState("emergency"); // Default mode

    // Function to handle emergency report click
    const handleEmergencyReport = () => {
        setCameraMode("emergency");
        setShowCamera(true);
        // Scroll to camera section for better UX
        document.querySelector(".camera-reporter-section")?.scrollIntoView({
            behavior: "smooth"
        });
    };

    return (
        <div className="app-layout government-portal">
            <main className="main-content">
                <div className="container">
                    {/* Quick Services Section */}
                    <section className="quick-services-section">
                        <div className="section-header">
                            <h3><span className="section-icon">⚡</span> Quick Citizen Services</h3>
                            <div className="section-tag">सेवाएं</div>
                        </div>

                        <div className="services-grid">
                            <div className="service-card">
                                <div className="service-icon emergency">🚨</div>
                                <div className="service-content">
                                    <h4>Emergency Reporting</h4>
                                    <p>Immediate police assistance</p>
                                    {/* Add onClick handler */}
                                    <button
                                        className="btn btn-emergency"
                                        onClick={handleEmergencyReport}
                                    >
                                        Report Now
                                    </button>
                                </div>
                            </div>

                            {/* Other service cards remain the same */}
                            <a href="/filecom">
                                <div className="service-card">
                                    <div className="service-icon complaint">📋</div>
                                    <div className="service-content">
                                        <h4>File Complaint</h4>
                                        <p>Online FIR & complaints</p>
                                        <button className="btn btn-primary">File Complaint</button>
                                    </div>
                                </div>
                            </a>

                            <div className="service-card">
                                <div className="service-icon status">📊</div>
                                <div className="service-content">
                                    <h4>Track Status</h4>
                                    <p>Check complaint status</p>
                                    <a href="/track">
                                        <button className="btn btn-secondary">Track</button>
                                    </a>
                                </div>
                            </div>

                            <div className="service-card">
                                <div className="service-icon guidelines">📚</div>
                                <div className="service-content">
                                    <h4>Safety Guidelines</h4>
                                    <p>Government advisories</p>
                                    <button className="btn btn-outline">View</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Main Action Section - Add a class for scrolling */}
                    <div className="main-action-section camera-reporter-section">
                        <div className="action-grid">
                            {/* Left Column - Camera Reporter */}
                            <div className="action-column">
                                <div className="government-card">
                                    <div className="card-header">
                                        <h3>
                                            <span className="card-header-icon">📷</span>
                                            {showCamera ? "Camera Incident Report - Emergency Mode" : "Camera Incident Report"}
                                        </h3>
                                        <div className="official-tag">
                                            <span className="tricolor-dot"></span>
                                            Official Portal
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {/* Conditionally render CameraReporter or show prompt */}
                                        {showCamera ? (
                                            <div className="camera-active-container">
                                                <div className="emergency-alert-banner">
                                                    ⚠️ <strong>EMERGENCY MODE ACTIVE</strong> - Your report will be prioritized
                                                </div>
                                                <CameraReporter mode={cameraMode} />
                                                <div className="camera-controls">
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => setShowCamera(false)}
                                                    >
                                                        Close Camera
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            // Optional: Add logic to switch to regular mode
                                                            setCameraMode("regular");
                                                        }}
                                                    >
                                                        Switch to Regular Mode
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="camera-prompt">
                                                <div className="prompt-icon">📷</div>
                                                <h4>Camera Reporting System</h4>
                                                <p>Click "Report Now" in Emergency Services or use the camera below for regular reporting</p>
                                                <div className="prompt-hint">
                                                    <small>For emergency reporting, use the "Report Now" button above</small>
                                                </div>
                                                <CameraReporter mode="regular" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer">
                                        <div className="security-note">
                                            <span className="lock-icon">🔒</span>
                                            <span>Secured by Government of India</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Contacts (remains the same) */}
                                <div className="government-card contacts-card">
                                    <h4><span className="card-icon">📞</span> Important Contacts</h4>
                                    <div className="contacts-list">
                                        <div className="contact-item">
                                            <span className="contact-label">Women Helpline</span>
                                            <span className="contact-number">181</span>
                                        </div>
                                        <div className="contact-item">
                                            <span className="contact-label">Child Helpline</span>
                                            <span className="contact-number">1098</span>
                                        </div>
                                        <div className="contact-item">
                                            <span className="contact-label">Police Control</span>
                                            <span className="contact-number">100</span>
                                        </div>
                                        <div className="contact-item">
                                            <span className="contact-label">Disaster Management</span>
                                            <span className="contact-number">1078</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Notifications (remains the same) */}
                            <div className="notification-column">
                                <div className="government-card">
                                    <div className="card-header">
                                        <h3><span className="card-header-icon">📢</span> Government Notifications</h3>
                                        <div className="notification-badge">LATEST</div>
                                    </div>
                                    <div className="card-body">
                                        <NotificationFeed />
                                    </div>
                                    <div className="card-footer">
                                        <a href="#" className="view-all-link">
                                            View All Notifications →
                                        </a>
                                    </div>
                                </div>

                                <div className="government-card schemes-card">
                                    <h4><span className="card-icon">🏛️</span> Government Schemes</h4>
                                    <ul className="schemes-list">
                                        <li>
                                            <span className="scheme-icon">🛡️</span>
                                            <span className="scheme-name">Nirbhaya Fund</span>
                                        </li>
                                        <li>
                                            <span className="scheme-icon">👮</span>
                                            <span className="scheme-name">Safe City Project</span>
                                        </li>
                                        <li>
                                            <span className="scheme-icon">👨‍👩‍👧‍👦</span>
                                            <span className="scheme-name">Community Policing</span>
                                        </li>
                                        <li>
                                            <span className="scheme-icon">🎓</span>
                                            <span className="scheme-name">Women Safety Awareness</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Section (remains the same) */}
                    <div className="statistics-section">
                        <div className="stats-container">
                            <div className="stat-item">
                                <div className="stat-value">5,000+</div>
                                <div className="stat-label">CCTV Cameras</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-value">98.5%</div>
                                <div className="stat-label">Response Rate</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-value">24/7</div>
                                <div className="stat-label">Monitoring</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-value">1.2M+</div>
                                <div className="stat-label">Citizens Served</div>
                            </div>
                        </div>
                    </div>

                    {/* Citizen Corner (remains the same) */}
                    <div className="citizen-corner">
                        <h3><span className="section-icon">👥</span> Citizen's Corner</h3>
                        <div className="citizen-links">
                            <a href="#" className="citizen-link">Download Forms</a>
                            <a href="#" className="citizen-link">FAQs</a>
                            <a href="#" className="citizen-link">Grievance Redressal</a>
                            <a href="#" className="citizen-link">Feedback</a>
                            <a href="#" className="citizen-link">RTI</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}