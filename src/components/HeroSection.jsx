import React from 'react'
import { Link } from 'react-router-dom'
import Calculator from './Calculator'
import '../assets/css/hero-section.css'

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Ultimate <span className="highlight">Calculator</span> & <span className="highlight">Utility</span> Hub
          </h1>
          <p className="hero-description">
            Discover a comprehensive collection of free online calculators and tools for math, finance, science, health, and more. 
            Everything you need, all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/math/math-calculators" className="hero-btn primary">
              <i className="fas fa-calculator"></i>
              Explore Calculators
            </Link>
            <Link to="/utility-tools" className="hero-btn secondary">
              <i className="fas fa-tools"></i>
              Browse Tools
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Free Tools</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <Calculator />
        </div>
      </div>
    </section>
  )
}

export default HeroSection 