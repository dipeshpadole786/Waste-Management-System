// SafetyGuidelines.jsx
import React, { useState } from 'react';
import './SafetyGuidelines.css';
import {
    Shield,
    AlertTriangle,
    Trash2,
    Users,
    Phone,
    FileText,
    ChevronRight,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const SafetyGuidelines = () => {
    const [activeCategory, setActiveCategory] = useState('general');

    const guidelinesData = {
        general: {
            title: "General Safety Guidelines",
            icon: <Shield className="icon" size={24} />,
            guidelines: [
                {
                    id: 1,
                    title: "Proper Waste Segregation",
                    description: "Always separate dry, wet, hazardous, and e-waste as per municipal guidelines.",
                    points: [
                        "Use colored bins: Green for wet waste, Blue for dry waste",
                        "Keep hazardous waste (batteries, chemicals) separate",
                        "Never mix medical waste with regular household waste"
                    ]
                },
                {
                    id: 2,
                    title: "Safe Waste Disposal Timing",
                    description: "Dispose waste only during designated collection hours.",
                    points: [
                        "Municipal collection: 7 AM - 10 AM & 6 PM - 9 PM",
                        "Avoid leaving waste overnight on streets",
                        "Keep bins covered to prevent animal scavenging"
                    ]
                },
                {
                    id: 3,
                    title: "Personal Protective Equipment",
                    description: "Use appropriate safety gear while handling waste.",
                    points: [
                        "Wear gloves and masks when handling waste",
                        "Use closed footwear while near waste bins",
                        "Sanitize hands after waste disposal"
                    ]
                }
            ]
        },
        hazardous: {
            title: "Hazardous Waste Handling",
            icon: <AlertTriangle className="icon" size={24} />,
            guidelines: [
                {
                    id: 1,
                    title: "Battery Disposal",
                    description: "Never dispose batteries in regular waste bins.",
                    points: [
                        "Use designated battery collection points",
                        "Tape battery terminals before disposal",
                        "Lithium batteries require special handling"
                    ]
                },
                {
                    id: 2,
                    title: "Chemical & Medical Waste",
                    description: "Special procedures for dangerous materials.",
                    points: [
                        "Contact municipal helpline for chemical waste pickup",
                        "Medical waste must be in yellow marked bags",
                        "Never incinerate hazardous waste at home"
                    ]
                }
            ]
        },
        covid: {
            title: "COVID-19 Safety Protocols",
            icon: <Users className="icon" size={24} />,
            guidelines: [
                {
                    id: 1,
                    title: "Household Medical Waste",
                    description: "Safe disposal of pandemic-related waste.",
                    points: [
                        "Double-layer masks and gloves before disposal",
                        "Sanitize waste bins regularly",
                        "Separate COVID-19 related waste in yellow bags"
                    ]
                }
            ]
        }
    };

    const emergencyContacts = [
        { id: 1, name: "Municipal Control Room", number: "155304", type: "24x7 Helpline" },
        { id: 2, name: "Hazardous Waste Pickup", number: "1800-123-456", type: "Toll Free" },
        { id: 3, name: "Medical Emergency", number: "108", type: "Emergency" },
        { id: 4, name: "Police Control Room", number: "100", type: "Emergency" }
    ];

    const safetyTips = [
        "Never burn plastic or electronic waste in open",
        "Keep children away from waste collection areas",
        "Report overflowing bins immediately via SWMS app",
        "Wash hands thoroughly after handling waste bins",
        "Do not compact waste with bare hands"
    ];

    return (
        <div className="safety-guidelines">
            {/* Header */}
            {/* <div className="safety-header">
                <div className="header-container">
                    <div className="header-top">
                        <div className="header-title">
                            <h1 className="main-title">SWMS Monitor</h1>
                            <p className="subtitle">Smart Waste Management System</p>
                        </div>
                        <div className="header-icon">
                            <Shield size={32} />
                        </div>
                    </div>
                    <h2 className="page-title">Safety Guidelines</h2>
                    <p className="page-subtitle">Government Advisories for Safe Waste Management</p>
                </div>
            </div> */}

            <div className="container">
                {/* Category Tabs */}
                <div className="category-tabs">
                    {Object.keys(guidelinesData).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`category-tab ${activeCategory === category ? 'category-tab-active' : 'category-tab-inactive'
                                }`}
                        >
                            {guidelinesData[category].icon}
                            {guidelinesData[category].title}
                        </button>
                    ))}
                </div>

                <div className="layout-grid">
                    {/* Main Content */}
                    <div className="main-content">
                        <div className="card guidelines-card">
                            <div className="card-header">
                                {guidelinesData[activeCategory].icon}
                                <h3 className="card-title">
                                    {guidelinesData[activeCategory].title}
                                </h3>
                            </div>

                            <div className="guidelines-list">
                                {guidelinesData[activeCategory].guidelines.map((item) => (
                                    <div key={item.id} className="guideline-item">
                                        <h4 className="guideline-title">{item.title}</h4>
                                        <p className="guideline-description">{item.description}</p>
                                        <ul className="guideline-points">
                                            {item.points.map((point, index) => (
                                                <li key={index} className="guideline-point">
                                                    <CheckCircle size={18} className="check-icon" />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Safety Tips */}
                        <div className="safety-tips-card">
                            <h3 className="tips-title">
                                <AlertCircle className="tips-icon" />
                                Quick Safety Tips
                            </h3>
                            <div className="tips-grid">
                                {safetyTips.map((tip, index) => (
                                    <div key={index} className="tip-card">
                                        <div className="tip-number">
                                            {index + 1}
                                        </div>
                                        <p className="tip-text">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar">
                        {/* Emergency Contacts */}
                        <div className="card emergency-card">
                            <h3 className="card-title">
                                <Phone className="emergency-icon" />
                                Emergency Contacts
                            </h3>
                            <div className="contacts-list">
                                {emergencyContacts.map((contact) => (
                                    <div key={contact.id} className="contact-item">
                                        <div className="contact-info">
                                            <h4 className="contact-name">{contact.name}</h4>
                                            <p className="contact-type">{contact.type}</p>
                                        </div>
                                        <a
                                            href={`tel:${contact.number}`}
                                            className="contact-number"
                                        >
                                            {contact.number}
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <button className="download-btn">
                                <FileText size={18} />
                                Download Safety Handbook
                            </button>
                        </div>

                        {/* Report Safety Issue */}
                        <div className="report-card">
                            <div className="report-icon-container">
                                <AlertTriangle className="report-icon" />
                            </div>
                            <h3 className="report-title">Report Safety Issue</h3>
                            <p className="report-description">
                                Found unsafe waste handling or hazardous materials?
                            </p>
                            <button className="report-btn">
                                <a href="/filecom">  Report Now</a>
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Statistics */}
                        <div className="card stats-card">
                            <h3 className="card-title">Safety Statistics</h3>
                            <div className="stats-list">
                                <div className="stat-item">
                                    <div className="stat-header">
                                        <span className="stat-label">Safe Zones</span>
                                        <span className="stat-value">92%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill safe-progress"></div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-header">
                                        <span className="stat-label">Compliance Rate</span>
                                        <span className="stat-value">87%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill compliance-progress"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="update-time">
                                Updated: Today, 10:30 AM
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="notice-card">
                    <div className="notice-header">
                        <div className="notice-icon-container">
                            <Shield className="notice-icon" size={20} />
                        </div>
                        <div>
                            <h4 className="notice-title">Important Notice</h4>
                            <p className="notice-text">
                                These guidelines are issued by the Municipal Corporation under the Solid Waste Management Rules, 2016.
                                Violations may attract penalties as per local regulations. For latest updates, visit the official government portal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyGuidelines;