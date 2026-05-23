// Footer.jsx (Government Theme)
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="government-footer">
      {/* Main Footer Content */}
      <div className="footer-main-content">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: About */}
            <div className="footer-column">
              <div className="footer-logo">
                <div className="footer-chakra">☸</div>
                <div className="footer-title">
                  <h3>सुरक्षित नगर</h3>
                  <p>Safe City Initiative</p>
                </div>
              </div>
              <p className="footer-description">
                A Government of India initiative under the Ministry of Home Affairs
                to enhance citizen safety through technology and community participation.
              </p>
              <div className="certification">
                <span className="cert-badge">🔒</span>
                <span className="cert-text">ISO 27001 Certified</span>
              </div>
            </div>

            {/* Column 2: Important Links */}
            <div className="footer-column">
              <h4><span className="footer-icon">📋</span> Important Links</h4>
              <ul className="footer-links-list">
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#sitemap">Sitemap</a></li>
                <li><a href="#accessibility">Accessibility</a></li>
                <li><a href="#disclaimer">Disclaimer</a></li>
              </ul>
            </div>

            {/* Column 3: Quick Services */}
            <div className="footer-column">
              <h4><span className="footer-icon">⚡</span> Quick Services</h4>
              <ul className="footer-services-list">
                <li><a href="#file-complaint">File Complaint</a></li>
                <li><a href="#track-status">Track Status</a></li>
                <li><a href="#download-forms">Download Forms</a></li>
                <li><a href="#grievance">Grievance Redressal</a></li>
                <li><a href="#feedback">Public Feedback</a></li>
                <li><a href="#rti">RTI</a></li>
              </ul>
            </div>

            {/* Column 4: Contact & Social */}
            <div className="footer-column">
              <h4><span className="footer-icon">📞</span> Contact Information</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <div className="contact-label">Email</div>
                    <a href="mailto:helpdesk@safecity.gov.in" className="contact-value">
                      helpdesk@safecity.gov.in
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div>
                    <div className="contact-label">Helpline</div>
                    <div className="contact-value">1800-XXX-XXXX</div>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🏢</span>
                  <div>
                    <div className="contact-label">Address</div>
                    <div className="contact-value">
                      Ministry of Home Affairs<br />
                      North Block, New Delhi - 110001
                    </div>
                  </div>
                </div>
              </div>

              <div className="social-section">
                <h5><span className="footer-icon">🌐</span> Follow Us</h5>
                {/* <div className="social-links">
                  <a href="#" className="social-link" aria-label="Twitter">
                    <span className="social-icon">🐦</span>
                    <span className="social-text">Twitter</span>
                  </a>
                  <a href="#" className="social-link" aria-label="Facebook">
                    <span className="social-icon">📘</span>
                    <span className="social-text">Facebook</span>
                  </a>
                  <a href="#" className="social-link" aria-label="YouTube">
                    <span className="social-icon">📺</span>
                    <span className="social-text">YouTube</span>
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      {/* <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              © 2025 Ministry of Home Affairs, Government of India. All Rights Reserved.
            </div>
            <div className="footer-flags">
              <div className="tricolor-strip-footer">
                <div className="color-strip saffron-strip"></div>
                <div className="color-strip white-strip">
                  <div className="chakra-footer">☸</div>
                </div>
                <div className="color-strip green-strip"></div>
              </div>
              <div className="government-links">
                <a href="#digital-india">Digital India</a>
                <a href="#make-in-india">Make in India</a>
                <a href="#india-gov">India.gov.in</a>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Emergency Footer Bar (Fixed at bottom on mobile) */}
      {/* <div className="emergency-footer-bar">
                <div className="container">
                    <div className="emergency-content">
                        <span className="emergency-alert">🚨</span>
                        <span className="emergency-text">
                            <strong>Emergency:</strong> Dial 112 for Police | 108 for Ambulance | 101 for Fire
                        </span>
                        <button className="emergency-button">EMERGENCY CALL</button>
                    </div>
                </div>
            </div> */}
    </footer>
  );
};

export default Footer;