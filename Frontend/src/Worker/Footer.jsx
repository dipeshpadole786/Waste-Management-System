import React from 'react';
import './Footer.css';

const Footerw = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fw-footer">
      <div className="fw-tricolor" />

      <div className="fw-main">

        {/* Col 1 — Brand */}
        <div className="fw-col fw-col--brand">
          <div className="fw-logo">
            <span className="fw-logo-icon">♻️</span>
            <div>
              <div className="fw-logo-title">Smart Waste Management</div>
              <div className="fw-logo-sub">Clean India Initiative</div>
            </div>
          </div>
          <p className="fw-desc">
            A Government of India initiative to revolutionize waste management
            through technology and community participation.
          </p>
          <div className="fw-badges">
            <span className="fw-badge">🇮🇳 Digital India</span>
            <span className="fw-badge">🏛️ Govt. of India</span>
          </div>
        </div>

        {/* Col 2 — Quick Links */}
        <div className="fw-col">
          <h4 className="fw-col-title">Quick Links</h4>
          <ul className="fw-links">
            <li><a href="/worker/dashboard">Dashboard</a></li>
            <li><a href="/worker/complaints">My Complaints</a></li>
            <li><a href="/worker/route">Collection Route</a></li>
            <li><a href="/worker/reports">Daily Reports</a></li>
            <li><a href="/worker/schedule">Work Schedule</a></li>
          </ul>
        </div>

        {/* Col 3 — Resources */}
        <div className="fw-col">
          <h4 className="fw-col-title">Resources</h4>
          <ul className="fw-links">
            <li><a href="/worker/manual">Worker Manual</a></li>
            <li><a href="/safety-guidelines">Safety Guidelines</a></li>
            <li><a href="/training-materials">Training Materials</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact-support">Contact Support</a></li>
          </ul>
        </div>

        {/* Col 4 — Contact */}
        <div className="fw-col">
          <h4 className="fw-col-title">Contact</h4>
          <ul className="fw-contact-list">
            <li>
              <span className="fw-contact-icon">📞</span>
              <span>24×7 Helpline: <strong>1800-XXX-XXXX</strong></span>
            </li>
            <li>
              <span className="fw-contact-icon">📧</span>
              <span>support@wastemgmt.gov.in</span>
            </li>
            <li>
              <span className="fw-contact-icon">🏢</span>
              <span>Ministry of Housing &amp; Urban Affairs</span>
            </li>
          </ul>

          <div className="fw-emergency">
            <div className="fw-emergency-title">🚨 Emergency</div>
            <div className="fw-emergency-row"><span>Supervisor</span><a href="tel:+919876543210">+91-98765 43210</a></div>
            <div className="fw-emergency-row"><span>Control Room</span><a href="tel:100">100</a></div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fw-bottom">
        <div className="fw-bottom-inner">
          <div className="fw-copy">
            © {currentYear} Smart Waste Management System · Government of India · All rights reserved.
          </div>

          <div className="fw-stats">
            {[
              { val: '1,247', lbl: 'Bins Managed' },
              { val: '84%', lbl: 'Efficiency' },
              { val: '24/7', lbl: 'Monitoring' },
            ].map(s => (
              <div key={s.lbl} className="fw-stat">
                <span className="fw-stat-val">{s.val}</span>
                <span className="fw-stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>

          <div className="fw-legal">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="/accessibility">Accessibility</a>
            <a href="/sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footerw;