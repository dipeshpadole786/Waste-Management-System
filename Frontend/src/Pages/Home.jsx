// Home.jsx (The Middle Portion)

// ... (Imports and CameraReporter/NotificationFeed components remain the same) ...

// --- Main Exported Home Component ---
import Header from "../Componets/Header";
import Footer from "../Componets/Footer";
import CameraReporter from "../Componets/Camera";
import NotificationFeed from "../Componets/Notification";
// Home.jsx
import "./Home.css";

import { Top } from "../Componets/top";
export function Home() {
    return (
        <div className="app-layout government-portal">
            {/* <Header /> */}

            {/* Government Top Banner */}


            {/* Alert Bar */}
            {/* <div className="alert-bar">
                <div className="container">
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-text">
                        <strong>Emergency:</strong> Dial 112 for Police, 108 for Ambulance, 101 for Fire
                    </span>
                    <span className="alert-badge">24x7 HELPLINE</span>
                </div>
            </div> */}


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
                                    <button className="btn btn-emergency">Report Now</button>
                                </div>
                            </div>
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
                                    <button className="btn btn-secondary">Track</button>
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

                    {/* Main Action Section */}
                    <div className="main-action-section">
                        <div className="action-grid">
                            {/* Left Column - Camera Reporter */}
                            <div className="action-column">
                                <div className="government-card">
                                    <div className="card-header">
                                        <h3><span className="card-header-icon">📷</span> Camera Incident Report</h3>
                                        <div className="official-tag">
                                            <span className="tricolor-dot"></span>
                                            Official Portal
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <CameraReporter />
                                    </div>
                                    <div className="card-footer">
                                        <div className="security-note">
                                            <span className="lock-icon">🔒</span>
                                            <span>Secured by Government of India</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Contacts */}
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

                            {/* Right Column - Notifications */}
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

                                {/* Government Schemes */}
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

                    {/* Statistics Section */}
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

                    {/* Citizen Corner */}
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

// ...