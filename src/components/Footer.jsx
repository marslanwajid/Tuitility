import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { toolCategories } from '../data/toolCategories'
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
            <a
              href="https://json-prompt-generator.vercel.app"
              className="footer-partner-tool"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="footer-partner-tool-media">
                <img src="/images/logo-prompt-genetaor.png" alt="JSON Prompt Generator" loading="lazy" />
              </div>
              <div className="footer-partner-tool-content">
                <span className="footer-partner-tool-eyebrow">Other AI Tool Site</span>
                <strong>JSON Prompt Generator</strong>
                <span>Generate JSON prompts for AI image generators with structured AI-focused workflows.</span>
              </div>
            </a>
          </div>

          {/* Quick Links Grid */}
          <div className="footer-links-grid">
            <div className="footer-links-section">
              <h3>Categories</h3>
              <div className="links-grid">
                {toolCategories.map((category) => (
                  <Link to={category.url} className="footer-link" key={category.url}>
                    <i className={category.icon}></i>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="footer-links-section">
              <h3>Popular Tools</h3>
              <div className="links-list">
                <Link to="/math/calculators/percentage-calculator">Percentage Calculator</Link>
                <Link to="/finance/calculators/mortgage-calculator">Mortgage Calculator</Link>
                <Link to="/health/calculators/bmi-calculator">BMI Calculator</Link>
                <Link to="/math/calculators/fraction-calculator">Fraction Calculator</Link>
                <Link to="/utility-tools/password-generator">Password Generator</Link>
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
                <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
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
