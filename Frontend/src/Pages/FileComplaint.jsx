// FileComplaint.jsx
import React, { useState } from 'react';
import './FileComplaint.css';

const FileComplaint = () => {
    const [formData, setFormData] = useState({
        complaintType: '',
        subject: '',
        description: '',
        location: '',
        priority: 'Medium',
        evidence: null,
        anonymous: false,
        contactName: '',
        contactNumber: '',
        contactEmail: '',
        consent: false
    });

    const [submitted, setSubmitted] = useState(false);
    const [complaintId, setComplaintId] = useState('');

    const complaintTypes = [
        'Garbage Not Collected',
        'Overflowing Dustbins',
        'Vehicle Misbehavior',
        'Route Deviation',
        'Delay in Service',
        'Staff Behavior',
        'Unauthorized Dumping',
        'Other'
    ];

    const priorities = [
        { value: 'Low', label: 'Low', color: '#4CAF50' },
        { value: 'Medium', label: 'Medium', color: '#FF9800' },
        { value: 'High', label: 'High', color: '#F44336' },
        { value: 'Emergency', label: 'Emergency', color: '#D32F2F' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const generateComplaintId = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `GR/COM/${year}${month}/${random}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Generate complaint ID
        const newComplaintId = generateComplaintId();
        setComplaintId(newComplaintId);

        // In real application, send data to backend here
        console.log('Complaint Data:', formData);
        console.log('Complaint ID:', newComplaintId);

        // Show success message
        setSubmitted(true);

        // Reset form after delay
        setTimeout(() => {
            setFormData({
                complaintType: '',
                subject: '',
                description: '',
                location: '',
                priority: 'Medium',
                evidence: null,
                anonymous: false,
                contactName: '',
                contactNumber: '',
                contactEmail: '',
                consent: false
            });
        }, 3000);
    };

    const handleReset = () => {
        setFormData({
            complaintType: '',
            subject: '',
            description: '',
            location: '',
            priority: 'Medium',
            evidence: null,
            anonymous: false,
            contactName: '',
            contactNumber: '',
            contactEmail: '',
            consent: false
        });
        setSubmitted(false);
    };

    return (
        <main className="file-complaint-page">
            {/* Page Header */}

            <br />
            <br />

            <div className="container">
                {/* Progress Steps */}
                <div className="complaint-progress">
                    <div className="progress-steps">
                        <div className="step active">
                            <div className="step-number">1</div>
                            <div className="step-label">Complaint Details</div>
                        </div>
                        <div className="step-divider"></div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-label">Contact Information</div>
                        </div>
                        <div className="step-divider"></div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-label">Review & Submit</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="complaint-main-content">
                    {/* Left Column - Form */}
                    <div className="complaint-form-column">
                        <div className="government-card complaint-form-card">
                            <div className="card-header">
                                <h3><span className="card-icon">📝</span> Register Your Complaint</h3>
                                <div className="form-info">
                                    <span className="info-icon">ℹ️</span>
                                    All fields marked with * are mandatory
                                </div>
                            </div>

                            {submitted ? (
                                <div className="success-message">
                                    <div className="success-icon">✅</div>
                                    <h3>Complaint Registered Successfully!</h3>
                                    <div className="complaint-id-display">
                                        <span className="id-label">Complaint ID:</span>
                                        <span className="id-value">{complaintId}</span>
                                    </div>
                                    <p>Your complaint has been registered with our system.</p>
                                    <div className="next-steps">
                                        <h4>Next Steps:</h4>
                                        <ul>
                                            <li>Save your Complaint ID for future reference</li>
                                            <li>You will receive SMS confirmation on registered mobile</li>
                                            <li>Track your complaint status in "Track Complaints" section</li>
                                            <li>Expected resolution time: 3-5 working days</li>
                                        </ul>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleReset}
                                    >
                                        Register Another Complaint
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="complaint-form">
                                    {/* Complaint Type */}
                                    <div className="form-section">
                                        <h4><span className="section-icon">📋</span> Complaint Category</h4>
                                        <div className="form-group">
                                            <label htmlFor="complaintType">Type of Complaint *</label>
                                            <select
                                                id="complaintType"
                                                name="complaintType"
                                                value={formData.complaintType}
                                                onChange={handleChange}
                                                required
                                                className="govt-select"
                                            >
                                                <option value="">Select Complaint Type</option>
                                                {complaintTypes.map((type, index) => (
                                                    <option key={index} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Basic Information */}
                                    <div className="form-section">
                                        <h4><span className="section-icon">📄</span> Complaint Details</h4>
                                        <div className="form-group">
                                            <label htmlFor="subject">Subject *</label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="Brief summary of your complaint"
                                                required
                                                className="govt-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="description">Detailed Description *</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Please provide detailed description including date, time, and specific details"
                                                required
                                                rows="5"
                                                className="govt-textarea"
                                            />
                                            <div className="char-count">
                                                {formData.description.length}/500 characters
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="location">Location *</label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Address/Landmark/Area where incident occurred"
                                                required
                                                className="govt-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Priority & Evidence */}
                                    <div className="form-section">
                                        <h4><span className="section-icon">⚡</span> Priority & Evidence</h4>
                                        <div className="priority-section">
                                            <label>Priority Level *</label>
                                            <div className="priority-options">
                                                {priorities.map((priority) => (
                                                    <div
                                                        key={priority.value}
                                                        className={`priority-option ${formData.priority === priority.value ? 'selected' : ''}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                                                        style={{ borderColor: priority.color }}
                                                    >
                                                        <div
                                                            className="priority-dot"
                                                            style={{ backgroundColor: priority.color }}
                                                        ></div>
                                                        {priority.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="evidence">Upload Evidence (Optional)</label>
                                            <div className="file-upload-area">
                                                <input
                                                    type="file"
                                                    id="evidence"
                                                    name="evidence"
                                                    onChange={handleChange}
                                                    accept="image/*,.pdf,.doc,.docx"
                                                    className="file-input"
                                                />
                                                <div className="upload-placeholder">
                                                    <span className="upload-icon">📎</span>
                                                    <div className="upload-text">
                                                        <p>Click to upload evidence (Photos, Documents)</p>
                                                        <p className="file-types">Supported: JPG, PNG, PDF, DOC (Max 5MB)</p>
                                                    </div>
                                                </div>
                                                {formData.evidence && (
                                                    <div className="file-preview">
                                                        <span className="file-icon">📄</span>
                                                        <span className="file-name">{formData.evidence.name}</span>
                                                        <span className="file-size">
                                                            {(formData.evidence.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="form-section">
                                        <h4><span className="section-icon">👤</span> Contact Information</h4>
                                        <div className="anonymous-option">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="anonymous"
                                                    checked={formData.anonymous}
                                                    onChange={handleChange}
                                                    className="govt-checkbox"
                                                />
                                                <span className="checkmark"></span>
                                                File complaint anonymously
                                            </label>
                                        </div>

                                        {!formData.anonymous && (
                                            <div className="contact-fields">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="contactName">Full Name *</label>
                                                        <input
                                                            type="text"
                                                            id="contactName"
                                                            name="contactName"
                                                            value={formData.contactName}
                                                            onChange={handleChange}
                                                            required
                                                            className="govt-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="contactNumber">Mobile Number *</label>
                                                        <input
                                                            type="tel"
                                                            id="contactNumber"
                                                            name="contactNumber"
                                                            value={formData.contactNumber}
                                                            onChange={handleChange}
                                                            required
                                                            pattern="[0-9]{10}"
                                                            className="govt-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contactEmail">Email Address</label>
                                                    <input
                                                        type="email"
                                                        id="contactEmail"
                                                        name="contactEmail"
                                                        value={formData.contactEmail}
                                                        onChange={handleChange}
                                                        className="govt-input"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Consent & Submit */}
                                    <div className="form-section">
                                        <div className="consent-section">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="consent"
                                                    checked={formData.consent}
                                                    onChange={handleChange}
                                                    required
                                                    className="govt-checkbox"
                                                />
                                                <span className="checkmark"></span>
                                                <span className="consent-text">
                                                    I hereby declare that the information provided is true and correct to the best of my knowledge.
                                                    I understand that filing false complaints is punishable under law.
                                                </span>
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleReset}
                                            >
                                                Reset Form
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={!formData.consent}
                                            >
                                                <span className="submit-icon">📤</span>
                                                Submit Complaint
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Information */}
                    <div className="complaint-info-column">
                        {/* Important Information */}
                        <div className="government-card info-card">
                            <h4><span className="card-icon">ℹ️</span> Important Information</h4>
                            <div className="info-list">
                                <div className="info-item">
                                    <span className="info-icon">⏰</span>
                                    <div className="info-content">
                                        <h5>Processing Time</h5>
                                        <p>Complaints are typically addressed within 3-5 working days</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon">📞</span>
                                    <div className="info-content">
                                        <h5>Helpline</h5>
                                        <p>Call 1800-XXX-XXXX for urgent complaints requiring immediate attention</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon">🔒</span>
                                    <div className="info-content">
                                        <h5>Confidentiality</h5>
                                        <p>Your personal information is protected under the Privacy Policy</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon">⚖️</span>
                                    <div className="info-content">
                                        <h5>Legal Information</h5>
                                        <p>False complaints may attract legal action under Section 182 IPC</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Complaint Categories */}
                        <div className="government-card categories-card">
                            <h4><span className="card-icon">📊</span> Common Complaint Categories</h4>
                            <div className="categories-list">
                                {complaintTypes.map((type, index) => (
                                    <div key={index} className="category-item">
                                        <span className="category-icon">
                                            {index % 3 === 0 ? '🗑️' : index % 3 === 1 ? '🚚' : '⚠️'}
                                        </span>
                                        <span className="category-text">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tracking Information */}
                        <div className="government-card tracking-card">
                            <h4><span className="card-icon">📈</span> Track Your Complaint</h4>
                            <p>After submission, you can track your complaint using:</p>
                            <div className="tracking-methods">
                                <div className="method">
                                    <span className="method-icon">📱</span>
                                    <span>SMS on registered mobile</span>
                                </div>
                                <div className="method">
                                    <span className="method-icon">💻</span>
                                    <span>Online tracking portal</span>
                                </div>
                                <div className="method">
                                    <span className="method-icon">📞</span>
                                    <span>Helpline number</span>
                                </div>
                            </div>
                            <a href="#track" className="track-link">
                                Go to Complaint Tracking →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default FileComplaint;