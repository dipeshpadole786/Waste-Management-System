import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
import API from '../API/api_req';

const mockUserDatabase = {
    '123456789012': { fullName: 'RAJESH KUMAR SHARMA', aadhaarNumber: '123456789012', mobileNumber: '9876543210', email: 'rajesh.sharma@example.com', address: 'House No. 123, Sector 15, Noida, Uttar Pradesh', pincode: '201301', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', dob: '15-08-1985', gender: 'Male', photo: '👨' },
    '987654321098': { fullName: 'PRIYA SINGH', aadhaarNumber: '987654321098', mobileNumber: '8765432109', email: 'priya.singh@example.com', address: 'Flat No. 45, GK Enclave, Delhi', pincode: '110048', district: 'South Delhi', state: 'Delhi', dob: '22-03-1992', gender: 'Female', photo: '👩' }
};

const AadhaarLoginLarge = () => {
    const [step, setStep] = useState(1);
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [userCaptcha, setUserCaptcha] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < 6; i++) text += chars.charAt(Math.floor(Math.random() * chars.length));
        setCaptcha(text);
        setUserCaptcha('');
        drawCaptcha(text);
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#EEF2F8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = '#B0BEC5';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
        ctx.font = 'bold 36px Georgia, serif';
        ctx.fillStyle = '#0C1B33';
        for (let i = 0; i < text.length; i++) {
            const x = 22 + i * 38;
            const y = 52 + Math.random() * 10;
            const rot = (Math.random() - 0.5) * 0.25;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    };

    useEffect(() => { generateCaptcha(); }, []);

    useEffect(() => {
        let timer;
        if (otpTimer > 0) timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpTimer]);

    const formatAadhaar = (num) => num.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

    const handleAadhaarSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!/^\d{12}$/.test(aadhaarNumber)) { setError('Please enter a valid 12-digit Aadhaar number'); return; }
        if (userCaptcha !== captcha) { setError('CAPTCHA verification failed. Please try again.'); generateCaptcha(); return; }
        try {
            const res = await API.post("/aadhar", { aadharnumber: aadhaarNumber });
            if (res.data === 0) { setError('Aadhaar number not found'); return; }
        } catch { setError('Server error'); return; }
        setLoading(true);
        setTimeout(() => {
            const generatedOTP = generateOTP();
            alert(`🔐 SECURE LOGIN - OTP VERIFICATION\n\n📱 Aadhaar: ${aadhaarNumber}\n🔢 OTP: ${generatedOTP}\n⏰ Valid for 2 minutes`);
            sessionStorage.setItem('aadhaar_otp', generatedOTP);
            sessionStorage.setItem('aadhaar_number', aadhaarNumber);
            setOtpTimer(120);
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) { setError('Please enter 6-digit OTP'); return; }
        const storedOtp = sessionStorage.getItem('aadhaar_otp');
        const storedAadhaar = sessionStorage.getItem('aadhaar_number');
        if (!storedOtp || storedAadhaar !== aadhaarNumber) { setError('OTP session expired. Please try again.'); return; }
        if (otp !== storedOtp) { setError('Invalid OTP. Please try again.'); return; }
        const res = await API.get("/userget", { params: { aadharnumber: aadhaarNumber } });
        setUserData(res.data);
        setStep(3);
        sessionStorage.removeItem('aadhaar_otp');
        sessionStorage.removeItem('aadhaar_number');
    };

    const handleResendOtp = () => {
        if (otpTimer > 0) { setError(`Please wait ${otpTimer}s before requesting new OTP`); return; }
        const generatedOTP = generateOTP();
        alert(`🔄 NEW OTP\n\nAadhaar: ${aadhaarNumber}\nOTP: ${generatedOTP}`);
        sessionStorage.setItem('aadhaar_otp', generatedOTP);
        setOtpTimer(120);
        setError('');
        setOtp('');
    };

    const handleLogin = () => {
        if (!userData) return;
        const expiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("loggedInUser", JSON.stringify({
            _id: userData._id, fullName: userData.fullName, aadhaarNumber: userData.aadhaarNumber,
            email: userData.email, mobileNumber: userData.mobileNumber, role: userData.role || "user", expiry: expiryTime
        }));
        alert(`✅ Welcome ${userData.fullName}`);
        window.location.href = userData.role === "monitor" ? "/newhome" : "/";
    };

    const handleGoBack = () => {
        if (step === 2) { setStep(1); setOtpTimer(0); }
        else if (step === 3) setStep(2);
        setError('');
    };

    return (
        <div className="lg-page">

            {/* Left Info Panel */}
            <div className="lg-info-panel">
                <div className="lg-emblem-wrap">
                    <div className="lg-chakra-ring">
                        <span className="lg-chakra">☸</span>
                    </div>
                    <div className="lg-emblem-text">
                        <h1>भारत सरकार</h1>
                        <h2>Government of India</h2>
                    </div>
                </div>

                <div className="lg-info-message">
                    <h3>🔐 Secure Aadhaar Authentication</h3>
                    <p>Your Aadhaar authentication is 100% secure and protected under the Aadhaar Act, 2016.</p>
                    <div className="lg-features">
                        {[
                            { icon: "✅", title: "Secure Login", desc: "Two-factor authentication with OTP" },
                            { icon: "🛡️", title: "Data Protection", desc: "Your data is encrypted and secure" },
                            { icon: "⚡", title: "Quick Access", desc: "Instant authentication in 3 steps" },
                        ].map(f => (
                            <div className="lg-feature" key={f.title}>
                                <div className="lg-feature-icon">{f.icon}</div>
                                <div>
                                    <div className="lg-feature-title">{f.title}</div>
                                    <div className="lg-feature-desc">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg-helpline">
                    <div className="lg-helpline-head">📞 Need Help?</div>
                    {[{ label: "UIDAI Helpline", num: "1947" }, { label: "Toll Free", num: "1800-300-1947" }].map(h => (
                        <div className="lg-helpline-row" key={h.label}>
                            <span className="lg-helpline-label">{h.label}</span>
                            <span className="lg-helpline-num">{h.num}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg-form-panel">

                {/* Step Indicators */}
                <div className="lg-steps">
                    {[{ n: 1, label: "Enter Aadhaar" }, { n: 2, label: "Verify OTP" }, { n: 3, label: "Access Portal" }].map((s, i, arr) => (
                        <React.Fragment key={s.n}>
                            <div className={`lg-step ${step >= s.n ? 'active' : ''} ${step === s.n ? 'current' : ''}`}>
                                <div className="lg-step-num">{step > s.n ? '✓' : s.n}</div>
                                <div className="lg-step-label">{s.label}</div>
                            </div>
                            {i < arr.length - 1 && <div className={`lg-step-connector ${step > s.n ? 'active' : ''}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form Container */}
                <div className="lg-form-box">

                    {/* Step 1 */}
                    {step === 1 && (
                        <>
                            <div className="lg-form-head">
                                <h2>🆔 Aadhaar Authentication</h2>
                                <p>Enter your 12-digit Aadhaar number for secure login</p>
                            </div>

                            <form onSubmit={handleAadhaarSubmit} className="lg-form">
                                <div className="lg-field">
                                    <label className="lg-label">AADHAAR NUMBER</label>
                                    <input
                                        type="text"
                                        value={aadhaarNumber}
                                        onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 12-digit Aadhaar number"
                                        maxLength="12"
                                        required
                                        className="lg-input"
                                    />
                                    <div className="lg-field-hint">ℹ️ Enter without spaces (e.g. 123456789012)</div>
                                </div>

                                <div className="lg-field">
                                    <label className="lg-label">SECURITY VERIFICATION</label>
                                    <div className="lg-captcha-row">
                                        <canvas ref={canvasRef} width="260" height="70" className="lg-captcha-canvas" />
                                        <button type="button" className="lg-captcha-refresh" onClick={generateCaptcha}>🔄 Refresh</button>
                                    </div>
                                    <input
                                        type="text"
                                        value={userCaptcha}
                                        onChange={e => setUserCaptcha(e.target.value)}
                                        placeholder="Type the text shown above"
                                        required
                                        className="lg-input"
                                    />
                                </div>

                                <div className="lg-checkbox-row">
                                    <label className="lg-checkbox-label">
                                        <input type="checkbox" required className="lg-checkbox" />
                                        <span className="lg-checkmark"></span>
                                        <span className="lg-checkbox-text">
                                            I agree to share my Aadhaar details for authentication as per Aadhaar Act, 2016
                                        </span>
                                    </label>
                                </div>

                                {error && <div className="lg-error">{error}</div>}

                                <button type="submit" className="lg-btn-primary" disabled={loading}>
                                    {loading ? <><span className="lg-btn-spinner"></span> VERIFYING…</> : 'VERIFY & SEND OTP →'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <>
                            <div className="lg-form-head">
                                <button className="lg-back-btn" onClick={handleGoBack}>← BACK</button>
                                <h2>🔢 OTP Verification</h2>
                                <p>Enter the OTP sent to your registered mobile number</p>
                            </div>

                            <div className="lg-aadhaar-display">
                                <span className="lg-ad-label">AADHAAR NUMBER</span>
                                <span className="lg-ad-val">{formatAadhaar(aadhaarNumber)}</span>
                            </div>

                            <form onSubmit={handleOtpSubmit} className="lg-form">
                                <div className="lg-field">
                                    <label className="lg-label">ENTER OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        required
                                        className="lg-input lg-input--otp"
                                    />
                                    <div className={`lg-timer ${otpTimer <= 30 ? 'lg-timer--warn' : ''}`}>
                                        ⏰ OTP valid for:{' '}
                                        <strong>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong>
                                    </div>
                                </div>

                                {error && <div className="lg-error">{error}</div>}

                                <div className="lg-btn-row">
                                    <button type="button" className="lg-btn-secondary" onClick={handleResendOtp} disabled={otpTimer > 0}>
                                        RESEND OTP
                                    </button>
                                    <button type="submit" className="lg-btn-primary">VERIFY OTP →</button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* Step 3 */}
                    {step === 3 && userData && (
                        <>
                            <div className="lg-form-head">
                                <button className="lg-back-btn" onClick={handleGoBack}>← BACK</button>
                                <h2>✅ Verification Successful</h2>
                                <p>Your identity has been verified successfully</p>
                            </div>

                            <div className="lg-success-banner">
                                <div className="lg-success-icon">✅</div>
                                <div>
                                    <div className="lg-success-title">AADHAAR VERIFIED</div>
                                    <div className="lg-success-sub">Welcome back to the Government Portal</div>
                                </div>
                            </div>

                            <div className="lg-user-card">
                                <div className="lg-user-photo">{userData.photo}</div>
                                <div>
                                    <div className="lg-user-name">{userData.fullName}</div>
                                    <div className="lg-user-aadhaar">🆔 {formatAadhaar(userData.aadhaarNumber)}</div>
                                </div>
                            </div>

                            <div className="lg-user-grid">
                                {[
                                    { label: "Mobile Number", val: userData.mobileNumber },
                                    { label: "Email Address", val: userData.email },
                                    { label: "Date of Birth", val: userData.dob },
                                    { label: "Gender", val: userData.gender },
                                ].map(d => (
                                    <div key={d.label} className="lg-user-detail">
                                        <div className="lg-ud-label">{d.label}</div>
                                        <div className="lg-ud-val">{d.val}</div>
                                    </div>
                                ))}
                            </div>

                            <button className="lg-btn-success" onClick={handleLogin}>
                                🚀 CONTINUE TO PORTAL
                            </button>

                            <div className="lg-security-notice">
                                ⚠️ Demo system only. In production, authentication is done through UIDAI's secure service.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AadhaarLoginLarge;