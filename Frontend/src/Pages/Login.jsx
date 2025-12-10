// AadhaarLoginLarge.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Login.css';

// Mock user database
const mockUserDatabase = {
    '123456789012': {
        fullName: 'RAJESH KUMAR SHARMA',
        aadhaarNumber: '123456789012',
        mobileNumber: '9876543210',
        email: 'rajesh.sharma@example.com',
        address: 'House No. 123, Sector 15, Noida, Uttar Pradesh',
        pincode: '201301',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        dob: '15-08-1985',
        gender: 'Male',
        photo: '👨'
    },
    '987654321098': {
        fullName: 'PRIYA SINGH',
        aadhaarNumber: '987654321098',
        mobileNumber: '8765432109',
        email: 'priya.singh@example.com',
        address: 'Flat No. 45, GK Enclave, Delhi',
        pincode: '110048',
        district: 'South Delhi',
        state: 'Delhi',
        dob: '22-03-1992',
        gender: 'Female',
        photo: '👩'
    }
};

const AadhaarLoginLarge = () => {
    const [step, setStep] = useState(1);
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [userCaptcha, setUserCaptcha] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const canvasRef = useRef(null);

    // Generate CAPTCHA
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captchaText = '';
        for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(captchaText);
        setUserCaptcha('');
        drawCaptcha(captchaText);
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = '#999';
            ctx.stroke();
        }

        // Draw text with distortion
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#000080';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const x = 30 + i * 35;
            const y = 50 + Math.random() * 15;
            const rotation = (Math.random() - 0.5) * 0.2;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    // OTP Timer
    useEffect(() => {
        let timer;
        if (otpTimer > 0) {
            timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpTimer]);

    // Validate Aadhaar Number
    const validateAadhaar = (number) => {
        const aadhaarRegex = /^\d{12}$/;
        return aadhaarRegex.test(number);
    };

    // Generate OTP
    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Handle Aadhaar Submission
    const handleAadhaarSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate Aadhaar number
        if (!validateAadhaar(aadhaarNumber)) {
            setError('Please enter a valid 12-digit Aadhaar number');
            return;
        }

        // Validate CAPTCHA
        if (userCaptcha !== captcha) {
            setError('CAPTCHA verification failed. Please try again.');
            generateCaptcha();
            return;
        }

        // Check if user exists
        if (!mockUserDatabase[aadhaarNumber]) {
            setError('Aadhaar number not found in our system.');
            return;
        }

        // Start loading
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Generate OTP
            const generatedOTP = generateOTP();

            // Show OTP in alert for demo
            alert(`🔐 SECURE LOGIN - OTP VERIFICATION\n\n📱 Aadhaar Number: ${aadhaarNumber}\n🔢 Your OTP: ${generatedOTP}\n⏰ Valid for: 2 minutes\n\n💡 Note: In production, OTP is sent to registered mobile number.`);

            // Store OTP
            sessionStorage.setItem('aadhaar_otp', generatedOTP);
            sessionStorage.setItem('aadhaar_number', aadhaarNumber);

            // Set timer for 2 minutes
            setOtpTimer(120);
            setOtpSent(true);
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    // Handle OTP Verification
    const handleOtpSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter 6-digit OTP');
            return;
        }

        // Get stored OTP
        const storedOtp = sessionStorage.getItem('aadhaar_otp');
        const storedAadhaar = sessionStorage.getItem('aadhaar_number');

        if (!storedOtp || storedAadhaar !== aadhaarNumber) {
            setError('OTP session expired. Please try again.');
            return;
        }

        if (otp !== storedOtp) {
            setError('Invalid OTP. Please try again.');
            return;
        }

        // OTP verified successfully
        setOtpVerified(true);

        // Get user data
        const user = mockUserDatabase[aadhaarNumber];
        setUserData(user);

        // Move to user details step
        setStep(3);

        // Clear session storage
        sessionStorage.removeItem('aadhaar_otp');
        sessionStorage.removeItem('aadhaar_number');
    };

    // Resend OTP
    const handleResendOtp = () => {
        if (otpTimer > 0) {
            setError(`Please wait ${otpTimer} seconds before requesting new OTP`);
            return;
        }

        const generatedOTP = generateOTP();
        alert(`🔄 NEW OTP GENERATED\n\n📱 Aadhaar Number: ${aadhaarNumber}\n🔢 Your New OTP: ${generatedOTP}\n⏰ Valid for: 2 minutes`);

        // Store new OTP
        sessionStorage.setItem('aadhaar_otp', generatedOTP);
        setOtpTimer(120);
        setError('');
        setOtp('');
    };

    // Refresh CAPTCHA
    const handleRefreshCaptcha = () => {
        generateCaptcha();
    };

    // Format Aadhaar number
    const formatAadhaar = (num) => {
        return num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    };

    // Handle Login
    const handleLogin = () => {
        alert(`✅ WELCOME ${userData.fullName}!\n\nYou have successfully logged in using Aadhaar authentication.`);
        window.location.href = '/dashboard';
    };

    // Handle Go Back
    const handleGoBack = () => {
        if (step === 2) {
            setStep(1);
            setOtpSent(false);
            setOtpTimer(0);
        } else if (step === 3) {
            setStep(2);
        }
        setError('');
    };

    return (
        <div className="aadhaar-login-large-page">
            {/* Left Side - Government Information */}
            <div className="login-info-panel">
                <div className="government-emblem-large">
                    <div className="ashoka-chakra-large">☸</div>
                    <div className="emblem-text">
                        <h1>भारत सरकार</h1>
                        <h2>Government of India</h2>
                    </div>
                </div>

                <div className="government-message">
                    <h3><span className="message-icon">🔐</span> Secure Aadhaar Authentication</h3>
                    <p className="large-text">
                        Your Aadhaar authentication is 100% secure and protected under the Aadhaar Act, 2016
                    </p>

                    <div className="features-list">
                        <div className="feature-item">
                            <span className="feature-icon">✅</span>
                            <div className="feature-content">
                                <h4>Secure Login</h4>
                                <p>Two-factor authentication with OTP</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🛡️</span>
                            <div className="feature-content">
                                <h4>Data Protection</h4>
                                <p>Your data is encrypted and secure</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <div className="feature-content">
                                <h4>Quick Access</h4>
                                <p>Instant authentication in 3 steps</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="helpline-section">
                    <h4><span className="helpline-icon">📞</span> Need Help?</h4>
                    <div className="helpline-number">
                        <span className="number-label">UIDAI Helpline:</span>
                        <span className="number-value">1947</span>
                    </div>
                    <div className="helpline-number">
                        <span className="number-label">Toll Free:</span>
                        <span className="number-value">1800-300-1947</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-panel">
                {/* Step Indicators */}
                <div className="step-indicators-large">
                    <div className={`step-indicator-large ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number-large">1</div>
                        <div className="step-label-large">Enter Aadhaar</div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-indicator-large ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number-large">2</div>
                        <div className="step-label-large">Verify OTP</div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-indicator-large ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number-large">3</div>
                        <div className="step-label-large">Access Portal</div>
                    </div>
                </div>

                {/* Login Form Container */}
                <div className="login-form-container-large">
                    {/* Step 1: Aadhaar Input */}
                    {step === 1 && (
                        <div className="step-1-container-large">
                            <div className="step-header-large">
                                <h2><span className="header-icon-large">🆔</span> Aadhaar Authentication</h2>
                                <p className="step-description-large">
                                    Enter your 12-digit Aadhaar number for secure login
                                </p>
                            </div>

                            <form onSubmit={handleAadhaarSubmit} className="aadhaar-form-large">
                                <div className="form-group-large">
                                    <label htmlFor="aadhaarNumber" className="form-label-large">
                                        AADHAAR NUMBER
                                    </label>
                                    <input
                                        type="text"
                                        id="aadhaarNumber"
                                        value={aadhaarNumber}
                                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 12-digit Aadhaar number"
                                        maxLength="12"
                                        required
                                        className="govt-input-large"
                                    />
                                    <div className="input-help-large">
                                        <span className="help-icon-large">ℹ️</span>
                                        Enter without spaces (Example: 123456789012)
                                    </div>
                                </div>

                                {/* CAPTCHA Section */}
                                <div className="captcha-section-large">
                                    <label className="captcha-label-large">SECURITY VERIFICATION</label>
                                    <div className="captcha-container-large">
                                        <canvas
                                            ref={canvasRef}
                                            width="300"
                                            height="80"
                                            className="captcha-canvas-large"
                                        />
                                        <button
                                            type="button"
                                            className="refresh-captcha-large"
                                            onClick={handleRefreshCaptcha}
                                            title="Refresh CAPTCHA"
                                        >
                                            🔄 Refresh
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={userCaptcha}
                                        onChange={(e) => setUserCaptcha(e.target.value)}
                                        placeholder="Type the text you see above"
                                        required
                                        className="captcha-input-large"
                                    />
                                </div>

                                {/* Terms and Conditions */}
                                <div className="terms-section-large">
                                    <label className="checkbox-label-large">
                                        <input type="checkbox" required className="large-checkbox" />
                                        <span className="checkmark-large"></span>
                                        <span className="terms-text-large">
                                            I agree to share my Aadhaar details for authentication as per Aadhaar Act, 2016
                                        </span>
                                    </label>
                                </div>

                                {error && <div className="error-message-large">{error}</div>}

                                <div className="form-actions-large">
                                    <button
                                        type="submit"
                                        className="btn-primary-large"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loading-spinner-large"></span>
                                                VERIFYING...
                                            </>
                                        ) : (
                                            'VERIFY & SEND OTP →'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <div className="step-2-container-large">
                            <div className="step-header-large">
                                <button
                                    className="back-button-large"
                                    onClick={handleGoBack}
                                >
                                    ← BACK
                                </button>
                                <h2><span className="header-icon-large">🔢</span> OTP Verification</h2>
                                <p className="step-description-large">
                                    Enter the OTP sent to your registered mobile number
                                </p>
                            </div>

                            <div className="aadhaar-display-large">
                                <span className="display-label-large">AADHAAR NUMBER:</span>
                                <span className="display-value-large">{formatAadhaar(aadhaarNumber)}</span>
                            </div>

                            <form onSubmit={handleOtpSubmit} className="otp-form-large">
                                <div className="form-group-large">
                                    <label htmlFor="otp" className="form-label-large">
                                        ENTER OTP
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        required
                                        className="otp-input-large"
                                    />
                                    <div className="otp-timer-large">
                                        <span className="timer-icon-large">⏰</span>
                                        OTP VALID FOR:
                                        <span className="timer-value-large">
                                            {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>

                                <div className="otp-help-large">
                                    <span className="help-icon-large">💡</span>
                                    OTP has been sent to mobile number ending with
                                    <strong> {mockUserDatabase[aadhaarNumber]?.mobileNumber?.slice(-4)}</strong>
                                </div>

                                {error && <div className="error-message-large">{error}</div>}

                                <div className="form-actions-large">
                                    <button
                                        type="button"
                                        className="btn-secondary-large"
                                        onClick={handleResendOtp}
                                        disabled={otpTimer > 0}
                                    >
                                        RESEND OTP
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary-large"
                                    >
                                        VERIFY OTP →
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: User Details */}
                    {step === 3 && userData && (
                        <div className="step-3-container-large">
                            <div className="step-header-large">
                                <button
                                    className="back-button-large"
                                    onClick={handleGoBack}
                                >
                                    ← BACK
                                </button>
                                <h2><span className="header-icon-large">✅</span> Verification Successful</h2>
                                <p className="step-description-large">
                                    Your identity has been verified successfully
                                </p>
                            </div>

                            <div className="verification-success-large">
                                <div className="success-icon-large">✅</div>
                                <h3 className="success-title-large">AADHAAR VERIFIED</h3>
                                <p className="success-text-large">
                                    Welcome back to the Government Portal
                                </p>
                            </div>

                            <div className="user-profile-large">
                                <div className="profile-header-large">
                                    <div className="profile-photo-large">{userData.photo}</div>
                                    <div className="profile-info-large">
                                        <h3 className="user-name-large">{userData.fullName}</h3>
                                        <p className="aadhaar-verified-large">
                                            <span className="verified-icon-large">🆔</span>
                                            Aadhaar: {formatAadhaar(userData.aadhaarNumber)}
                                        </p>
                                    </div>
                                </div>

                                <div className="user-details-grid-large">
                                    <div className="detail-item-large">
                                        <span className="detail-label-large">Mobile Number</span>
                                        <span className="detail-value-large">{userData.mobileNumber}</span>
                                    </div>
                                    <div className="detail-item-large">
                                        <span className="detail-label-large">Email Address</span>
                                        <span className="detail-value-large">{userData.email}</span>
                                    </div>
                                    <div className="detail-item-large">
                                        <span className="detail-label-large">Date of Birth</span>
                                        <span className="detail-value-large">{userData.dob}</span>
                                    </div>
                                    <div className="detail-item-large">
                                        <span className="detail-label-large">Gender</span>
                                        <span className="detail-value-large">{userData.gender}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions-large">
                                <button
                                    className="btn-success-large"
                                    onClick={handleLogin}
                                >
                                    🚀 CONTINUE TO PORTAL
                                </button>
                            </div>

                            <div className="security-notice-large">
                                <span className="notice-icon-large">⚠️</span>
                                <p className="notice-text-large">
                                    This is a demo system. In production, Aadhaar authentication is done through UIDAI's secure authentication service.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AadhaarLoginLarge;