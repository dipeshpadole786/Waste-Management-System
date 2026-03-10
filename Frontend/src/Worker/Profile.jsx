import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.css';
import { Building, User, Mail, Phone, MapPin, Navigation, Briefcase, Calendar, CheckCircle } from 'lucide-react';

const GovInfoItem = ({ label, value, icon, status }) => (
    <div className="wpr-info-item">
        <div className="wpr-info-label">
            <span className="wpr-info-icon">{icon}</span>
            {label}
        </div>
        <div className={`wpr-info-val ${status ? 'wpr-status-' + status : ''}`}>
            {value || '—'}
        </div>
    </div>
);

const WorkerProfile = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const worker = state?.worker;

    if (!worker) return (
        <div className="wpr-page">
            <div className="wpr-error">
                <div className="wpr-error-icon">⚠️</div>
                <h2>Worker Data Not Available</h2>
                <p>Please return and select a worker to view their profile.</p>
                <button className="wpr-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
            </div>
        </div>
    );

    const sections = [
        {
            title: 'Personal Information',
            icon: <User size={14} />,
            fields: [
                { label: 'Full Name', value: worker.fullName, icon: <User size={14} /> },
                { label: 'Email Address', value: worker.email, icon: <Mail size={14} /> },
                { label: 'Mobile Number', value: worker.mobileNumber, icon: <Phone size={14} /> },
            ]
        },
        {
            title: 'Location Details',
            icon: <MapPin size={14} />,
            fields: [
                { label: 'Address', value: worker.address, icon: <Building size={14} /> },
                { label: 'District', value: worker.district, icon: <Navigation size={14} /> },
                { label: 'State', value: worker.state, icon: <MapPin size={14} /> },
            ]
        },
        {
            title: 'Employment Details',
            icon: <Briefcase size={14} />,
            fields: [
                { label: 'Designation', value: worker.role, icon: <Briefcase size={14} /> },
                { label: 'Date of Registration', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), icon: <Calendar size={14} /> },
                { label: 'Employment Status', value: 'Active', icon: <CheckCircle size={14} />, status: 'active' },
            ]
        },
    ];

    return (
        <div className="wpr-page">
            <div className="wpr-container">

                <button className="wpr-back-btn" onClick={() => navigate(-1)}>← Back</button>

                {/* Hero card */}
                <div className="wpr-hero">
                    <div className="wpr-hero-glow" />

                    <div className="wpr-hero-body">
                        <div className="wpr-avatar">
                            <User size={32} color="#fff" />
                        </div>

                        <div className="wpr-hero-info">
                            <h2 className="wpr-name">{worker.fullName}</h2>
                            <div className="wpr-hero-meta">
                                <span className="wpr-emp-id">EMP ID: {worker._id?.slice(-8) || 'N/A'}</span>
                                <span className="wpr-role-tag">{worker.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* PM IMAGE RIGHT SIDE */}
                    <div className="wpr-pm-box">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfab0XSrJ7TZk4q63Rob2pLKNlP432i9vw6lDFXwmIqA9z_acZ_ibj10qBbWVB4Uj1XIckFpAS_W4mzVHD6YPN0-id03rQ3D8XBecE0w&s=10"
                            alt="Narendra Modi"
                            className="wpr-pm-img"
                        />
                    </div>

                    <div className="wpr-hero-stats">
                        <div className="wpr-hs"><span className="wpr-hs-lbl">Status</span><span className="wpr-hs-val wpr-hs-val--green">● Active</span></div>
                        <div className="wpr-hs"><span className="wpr-hs-lbl">Department</span><span className="wpr-hs-val">Municipal</span></div>
                        <div className="wpr-hs"><span className="wpr-hs-lbl">Zone</span><span className="wpr-hs-val">{worker.district || 'N/A'}</span></div>
                    </div>
                </div>

                {/* Sections */}
                <div className="wpr-sections">
                    {sections.map(s => (
                        <div key={s.title} className="wpr-section">
                            <div className="wpr-section-head">
                                <span className="wpr-section-icon">{s.icon}</span>
                                <h3>{s.title}</h3>
                            </div>
                            <div className="wpr-grid">
                                {s.fields.map(f => <GovInfoItem key={f.label} {...f} />)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Note */}
                <div className="wpr-note">
                    <span>📋</span>
                    <p><strong>Note:</strong> This profile is for official use only. Any changes must be reported to the administration department.</p>
                </div>

            </div>
        </div>
    );
};

export default WorkerProfile;