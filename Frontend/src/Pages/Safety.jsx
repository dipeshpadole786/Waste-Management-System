import React, { useState } from 'react';
import './SafetyGuidelines.css';
import { Shield, AlertTriangle, Users, Phone, FileText, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const SafetyGuidelines = () => {
    const [activeCategory, setActiveCategory] = useState('general');

    const guidelinesData = {
        general: {
            title: "General Safety Guidelines",
            icon: <Shield size={18} />,
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
                        "Municipal collection: 7 AM – 10 AM & 6 PM – 9 PM",
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
            icon: <AlertTriangle size={18} />,
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
            icon: <Users size={18} />,
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
        { id: 4, name: "Police Control Room", number: "100", type: "Emergency" },
    ];

    const safetyTips = [
        "Never burn plastic or electronic waste in open",
        "Keep children away from waste collection areas",
        "Report overflowing bins immediately via SWMS app",
        "Wash hands thoroughly after handling waste bins",
        "Do not compact waste with bare hands",
    ];

    return (
        <div className="sg-page">
            <div className="sg-container">

                {/* Page Header */}
                <div className="sg-page-header">
                    <div>
                        <div className="sg-eyebrow">Government Advisories</div>
                        <h1 className="sg-page-title">Safety Guidelines</h1>
                        <p className="sg-page-sub">Official guidelines for safe waste management under Solid Waste Management Rules, 2016.</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="sg-tabs">
                    {Object.entries(guidelinesData).map(([key, val]) => (
                        <button
                            key={key}
                            className={`sg-tab ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(key)}
                        >
                            <span className="sg-tab-icon">{val.icon}</span>
                            {val.title}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="sg-grid">

                    {/* Main Content */}
                    <div className="sg-main">
                        <div className="sg-card">
                            <div className="sg-card-head">
                                <span className="sg-card-head-icon">{guidelinesData[activeCategory].icon}</span>
                                <h3>{guidelinesData[activeCategory].title}</h3>
                            </div>
                            <div className="sg-guidelines-list">
                                {guidelinesData[activeCategory].guidelines.map(item => (
                                    <div key={item.id} className="sg-guideline-item">
                                        <div className="sg-guideline-num">{item.id}</div>
                                        <div className="sg-guideline-body">
                                            <h4 className="sg-guideline-title">{item.title}</h4>
                                            <p className="sg-guideline-desc">{item.description}</p>
                                            <ul className="sg-points">
                                                {item.points.map((point, i) => (
                                                    <li key={i} className="sg-point">
                                                        <CheckCircle size={14} className="sg-check" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Safety Tips */}
                        <div className="sg-tips-card">
                            <div className="sg-tips-head">
                                <AlertCircle size={16} />
                                Quick Safety Tips
                            </div>
                            <div className="sg-tips-grid">
                                {safetyTips.map((tip, i) => (
                                    <div key={i} className="sg-tip">
                                        <div className="sg-tip-num">{i + 1}</div>
                                        <p className="sg-tip-text">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="sg-sidebar">

                        {/* Emergency Contacts */}
                        <div className="sg-card">
                            <div className="sg-card-head">
                                <Phone size={16} />
                                <h3>Emergency Contacts</h3>
                            </div>
                            <div className="sg-contacts">
                                {emergencyContacts.map(c => (
                                    <div key={c.id} className="sg-contact-row">
                                        <div>
                                            <div className="sg-contact-name">{c.name}</div>
                                            <div className="sg-contact-type">{c.type}</div>
                                        </div>
                                        <a href={`tel:${c.number}`} className="sg-contact-num">{c.number}</a>
                                    </div>
                                ))}
                            </div>
                            <div className="sg-card-foot">
                                <button className="sg-dl-btn">
                                    <FileText size={14} />
                                    Download Safety Handbook
                                </button>
                            </div>
                        </div>

                        {/* Report Safety Issue */}
                        <div className="sg-report-card">
                            <div className="sg-report-icon"><AlertTriangle size={22} /></div>
                            <h4 className="sg-report-title">Report Safety Issue</h4>
                            <p className="sg-report-desc">Found unsafe waste handling or hazardous materials?</p>
                            <a href="/filecom" className="sg-report-btn">
                                Report Now <ChevronRight size={16} />
                            </a>
                        </div>

                        {/* Statistics */}
                        <div className="sg-card">
                            <div className="sg-card-head">
                                <h3>Safety Statistics</h3>
                            </div>
                            <div className="sg-stats">
                                {[
                                    { label: "Safe Zones", val: 92, color: "#1A6B3A" },
                                    { label: "Compliance Rate", val: 87, color: "#E07B2A" },
                                ].map(s => (
                                    <div key={s.label} className="sg-stat-item">
                                        <div className="sg-stat-row">
                                            <span className="sg-stat-label">{s.label}</span>
                                            <span className="sg-stat-val" style={{ color: s.color }}>{s.val}%</span>
                                        </div>
                                        <div className="sg-stat-track">
                                            <div
                                                className="sg-stat-fill"
                                                style={{ width: `${s.val}%`, background: s.color }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                <p className="sg-update-time">Updated: Today, 10:30 AM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notice */}
                <div className="sg-notice">
                    <div className="sg-notice-icon"><Shield size={18} /></div>
                    <div>
                        <h4 className="sg-notice-title">Important Notice</h4>
                        <p className="sg-notice-text">
                            These guidelines are issued by the Municipal Corporation under the Solid Waste Management Rules, 2016.
                            Violations may attract penalties as per local regulations. For latest updates, visit the official government portal.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SafetyGuidelines;