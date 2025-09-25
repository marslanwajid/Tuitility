import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import "../assets/css/header.css"

const Header = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  const closeMenu = () => {
    setIsMenuActive(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.navbar')) {
        setIsMenuActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img src="/images/logo.png" alt="Tuitility" />
           
          </Link>
        </div>
        
        {/* Desktop search container */}
        <div className="search-container desktop">
          <div className="search-wrapper">
            {/* <i className="fas fa-search search-icon"></i> */}
            <input type="text" id="searchInputDesktop" name="q" placeholder="Search calculators..." className="search-input" />
            <button type="button" className="search-btn" aria-label="Search">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div id="searchResultsDesktop" className="search-results"></div>
        </div>
        
        <ul className={`nav-menu ${isMenuActive ? 'active' : ''}`}>
          {/* Mobile search container */}
          <div className="search-container mobile">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input type="text" id="searchInputMobile" name="q" placeholder="Search calculators..." className="search-input" />
              <button type="button" className="search-btn" aria-label="Search">
                <i className="fas fa-search"></i>
              </button>
            </div>
            <div id="searchResultsMobile" className="search-results"></div>
          </div>
          
          <li><Link to="/" onClick={closeMenu}> Home</Link></li>
          <li className="nav-category">
            <Link to="/math" onClick={closeMenu}>
              <i className="fas fa-calculator"></i>
              <span>Math</span>
            </Link>
          </li>
          <li className="nav-category">
            <Link to="/finance" onClick={closeMenu}>
              <i className="fas fa-dollar-sign"></i>
              <span>Finance</span>
            </Link>
          </li>
          <li className="nav-category">
            <Link to="/science" onClick={closeMenu}>
              <i className="fas fa-cog"></i>
              <span>Science</span>
            </Link>
          </li>
          <li className="nav-category">
            <Link to="/health" onClick={closeMenu}>
              <i className="fas fa-heartbeat"></i>
              <span>Health</span>
            </Link>
          </li>
          <li className="nav-category">
            <Link to="/utility-tools" onClick={closeMenu}>
              <i className="fas fa-tools"></i>
              <span>Utility</span>
            </Link>
          </li>
          <li className="nav-category">
            <Link to="/knowledge" onClick={closeMenu}>
              <i className="fas fa-brain"></i>
              <span>Knowledge</span>
            </Link>
          </li>
          
        </ul>
        
        <div className={`hamburger ${isMenuActive ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>
    </header>
  )
}

export default Header