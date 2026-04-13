import React, { useState, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import HeaderSearch from './HeaderSearch'
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
            <img src="/images/logo.png" alt="Tuitility" loading="lazy" />
           
          </Link>
        </div>
        
        {/* Desktop search container */}
        <HeaderSearch idPrefix="desktopSearch" isMobile={false} />
        
        <ul className={`nav-menu ${isMenuActive ? 'active' : ''}`}>
          {/* Mobile search container */}
          <HeaderSearch idPrefix="mobileSearch" isMobile={true} />
          
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

export default memo(Header)