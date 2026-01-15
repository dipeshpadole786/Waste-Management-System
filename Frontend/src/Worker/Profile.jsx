import React from 'react';
import { useLocation } from 'react-router-dom';
import './Profile.css';
import { Building, User, Mail, Phone, MapPin, Navigation, Briefcase, Calendar, CheckCircle } from 'lucide-react';

const WorkerProfile = () => {
    const { state } = useLocation();
    const worker = state?.worker;

    if (!worker) {
        return (
            <div className="worker-profile">
                <div className="gov-error-container">
                    <div className="gov-error-icon">⚠️</div>
                    <h2>Worker Data Not Available</h2>
                    <p>Please return and select a worker to view their profile.</p>
                </div>
            </div>
        );
    }

    return (
         

        <div className="worker-profile">
            <br />
            <br />
            {/* Government Header Banner */}
            {/* <div className="gov-header-banner">
                <div className="gov-logo-container">
                    <Building className="gov-logo-icon" />
                    <span className="gov-department">Municipal Corporation</span>
                </div>
                <h1 className="gov-page-title">Worker Profile</h1>
            </div> */}

            <div className="gov-profile-container">
                {/* Profile Header */}
                <div className="gov-profile-header">
                    <div className="gov-avatar-container">
                        <div className="gov-avatar">
                            <User className="gov-avatar-icon" />
                        </div>
                    </div>
                    <div className="gov-profile-info">
                        <h2>{worker.fullName}</h2>
                        <div className="gov-profile-meta">
                            <span className="gov-employee-id">EMP ID: {worker._id?.slice(-8) || 'N/A'}</span>
                            <span className="gov-role-tag">{worker.role}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Sections */}
                <div className="gov-sections-container">
                    {/* Personal Information */}
                    <div className="gov-section">
                        <div className="gov-section-header">
                            <h3>
                                <User className="gov-section-icon" />
                                Personal Information
                            </h3>
                        </div>
                        <div className="gov-data-grid">
                            <GovInfoItem
                                label="Full Name"
                                value={worker.fullName}
                                icon={<User size={16} />}
                            />
                            <GovInfoItem
                                label="Email Address"
                                value={worker.email}
                                icon={<Mail size={16} />}
                            />
                            <GovInfoItem
                                label="Mobile Number"
                                value={worker.mobileNumber}
                                icon={<Phone size={16} />}
                            />
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="gov-section">
                        <div className="gov-section-header">
                            <h3>
                                <MapPin className="gov-section-icon" />
                                Location Details
                            </h3>
                        </div>
                        <div className="gov-data-grid">
                            <GovInfoItem
                                label="Address"
                                value={worker.address}
                                icon={<Building size={16} />}
                            />
                            <GovInfoItem
                                label="District"
                                value={worker.district}
                                icon={<Navigation size={16} />}
                            />
                            <GovInfoItem
                                label="State"
                                value={worker.state}
                                icon={<MapPin size={16} />}
                            />
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div className="gov-section">
                        <div className="gov-section-header">
                            <h3>
                                <Briefcase className="gov-section-icon" />
                                Employment Details
                            </h3>
                        </div>
                        <div className="gov-data-grid">
                            <GovInfoItem
                                label="Designation"
                                value={worker.role}
                                icon={<Briefcase size={16} />}
                            />
                            <GovInfoItem
                                label="Date of Registration"
                                value={new Date().toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                                icon={<Calendar size={16} />}
                            />
                            <GovInfoItem
                                label="Employment Status"
                                value="Active"
                                icon={<CheckCircle size={16} />}
                                status="active"
                            />
                        </div>
                    </div>
                </div>

                {/* Government Footer Note */}
                <div className="gov-footer-note">
                    <p>
                        <strong>Note:</strong> This profile information is for official use only.
                        Any changes to personal details must be reported to the administration department.
                    </p>
                </div>
            </div>
        </div>
    );
};

const GovInfoItem = ({ label, value, icon, status }) => (
    <div className="gov-info-item">
        <div className="gov-info-label">
            <div className="gov-info-icon">{icon}</div>
            <span>{label}:</span>
        </div>
        <div className={`gov-info-value ${status ? 'gov-status-' + status : ''}`}>
            {value}
        </div>
    </div>
);

export default WorkerProfile;