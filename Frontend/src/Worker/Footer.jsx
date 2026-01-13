import React from 'react';
import './Footer.css';

const Footerw = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="worker-footer">
      <div className="footer-main">
        <div className="footer-section">
          <div className="footer-logo">
            <div className="footer-logo-icon">♻️</div>
            <div className="footer-logo-text">
              <h3>Smart Waste Management</h3>
              <p>Clean India Initiative</p>
            </div>
          </div>
          <p className="footer-description">
            A Government of India initiative to revolutionize waste management through technology and community participation.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/worker/dashboard">Dashboard</a></li>
            <li><a href="/worker/complaints">My Complaints</a></li>
            <li><a href="/worker/route">Collection Route</a></li>
            <li><a href="/worker/reports">Daily Reports</a></li>
            <li><a href="/worker/schedule">Work Schedule</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul className="footer-links">
            <li><a href="/worker/manual">Worker Manual</a></li>
            <li><a href="/safety-guidelines">Safety Guidelines</a></li>
            <li><a href="/training-materials">Training Materials</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact-support">Contact Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>24x7 Helpline: 1800-XXX-XXXX</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>support@wastemgmt.gov.in</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🏢</span>
              <span>Ministry of Housing and Urban Affairs</span>
            </div>
          </div>
          
          <div className="emergency-contact">
            <h5>Emergency Contacts</h5>
            <p>Supervisor: +91-9876543210</p>
            <p>Control Room: 100</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            © {currentYear} Smart Waste Management System. Government of India. All rights reserved.
          </div>
          
          <div className="footer-stats">
            <div className="stat">
              <span className="stat-number">1,247</span>
              <span className="stat-label">Bins Managed</span>
            </div>
            <div className="stat">
              <span className="stat-number">84%</span>
              <span className="stat-label">Efficiency</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Monitoring</span>
            </div>
          </div>
          
          <div className="footer-legal">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/accessibility">Accessibility</a>
            <a href="/sitemap">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footerw;