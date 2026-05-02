import React, { useState, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import HeaderSearch from './HeaderSearch'
import { toolCategories } from '../data/toolCategories'
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
          {toolCategories.map((category) => (
            <li className="nav-category" key={category.url}>
              <Link to={category.url} onClick={closeMenu}>
                <i className={category.icon}></i>
                <span>{category.name}</span>
              </Link>
            </li>
          ))}
          
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
