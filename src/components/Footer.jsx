import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import "../assets/css/footer.css"

const Footer = () => {
  return (
    <footer>
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Company Info Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/images/logo.png" alt="Tuitility" loading="lazy" />
            </div>
            <p className="footer-description">
              Your ultimate destination for free online calculators and tools. 
              Accurate, fast, and reliable calculations for all your needs.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Tools</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="footer-links-grid">
            <div className="footer-links-section">
              <h3>Categories</h3>
              <div className="links-grid">
                <Link to="/math" className="footer-link">
                  <i className="fas fa-calculator"></i>
                  <span>Math</span>
                </Link>
                <Link to="/finance" className="footer-link">
                  <i className="fas fa-dollar-sign"></i>
                  <span>Finance</span>
                </Link>
                <Link to="/science" className="footer-link">
                  <i className="fas fa-atom"></i>
                  <span>Science</span>
                </Link>
                <Link to="/health" className="footer-link">
                  <i className="fas fa-heartbeat"></i>
                  <span>Health</span>
                </Link>
                <Link to="/utility-tools" className="footer-link">
                  <i className="fas fa-tools"></i>
                  <span>Utility</span>
                </Link>
                <Link to="/knowledge" className="footer-link">
                  <i className="fas fa-brain"></i>
                  <span>Knowledge</span>
                </Link>
              </div>
            </div>

            <div className="footer-links-section">
              <h3>Popular Tools</h3>
              <div className="links-list">
                <Link to="/math/calculators/percentage-calculator">Percentage Calculator</Link>
                <Link to="/finance/calculators/mortgage-calculator">Mortgage Calculator</Link>
                <Link to="/health/calculators/bmi-calculator">BMI Calculator</Link>
                <Link to="/math/calculators/fraction-calculator">Fraction Calculator</Link>
                <Link to="/utility-tools/converter-tools/password-generator">Password Generator</Link>
                <Link to="/knowledge/calculators/age-calculator">Age Calculator</Link>
              </div>
            </div>

            <div className="footer-links-section">
              <h3>Support</h3>
              <div className="links-list">
                <Link to="/">Home</Link>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </div>
              <div className="contact-info">
                <h4>Get in Touch</h4>
                <a href="mailto:wajidmarslan@gmail.com" className="contact-link">
                  <i className="fas fa-envelope"></i>
                  wajidmarslan@gmail.com
                </a>
                <p className="availability">
                  <i className="fas fa-clock"></i>
                  24/7 Online Tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-copyright">
            <p>&copy; 2026 Tuitility. All rights reserved.</p>
          </div>
          <div className="footer-credits">
            <span>Developed by <a href="https://www.linkedin.com/in/arslan-wajid/" target="_blank" rel="noopener noreferrer">Arslan Wajid</a></span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)
