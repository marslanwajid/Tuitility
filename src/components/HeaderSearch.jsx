import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { allTools } from '../data/allTools';
import '../assets/css/search-bar.css';

const HeaderSearch = ({ idPrefix, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const location = useLocation();
  const searchRef = useRef(null);

  // Close search when location changes (user navigated)
  useEffect(() => {
    setSearchQuery('');
    setIsFocused(false);
  }, [location.pathname]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSearchResults = searchQuery
    ? allTools
        .filter(
          (tool) =>
             tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
             tool.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16'];
    return colors[index % colors.length];
  };

  return (
    <div className={`search-container ${isMobile ? 'mobile' : 'desktop'}`} ref={searchRef}>
      <div className="search-wrapper" style={isFocused ? { borderColor: '#1a1a1a', boxShadow: '0 0 0 3px rgba(26, 26, 26, 0.08)' } : {}}>
        {!isMobile && <i className="fas fa-search search-icon" style={{ left: '1rem', position: 'absolute', color: '#9ca3af', zIndex: 2 }}></i>}
        {isMobile && <i className="fas fa-search search-icon" style={{ left: '0.8rem', position: 'absolute', color: '#9ca3af', zIndex: 2 }}></i>}
        <input
          type="text"
          id={`${idPrefix}Input`}
          placeholder="Search calculators..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear Search"
            style={{ zIndex: 2 }}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        {!searchQuery && (
          <button type="button" className="search-btn" aria-label="Search" style={{ zIndex: 2 }}>
            <i className="fas fa-search"></i>
          </button>
        )}
      </div>

      {isFocused && searchQuery && (
        <div className="tools-search-results" style={{ display: 'block', top: '100%', marginTop: '8px' }}>
          {filteredSearchResults.length > 0 ? (
            <>
              <div className="tools-search-results-header">
                <span className="tools-results-count">
                  {filteredSearchResults.length} result{filteredSearchResults.length !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="tools-search-results-list">
                {filteredSearchResults.map((tool, index) => (
                  <Link
                    key={index}
                    to={tool.url}
                    className="tools-search-result-item"
                    style={{ '--tool-color': getToolColor(index) }}
                    onClick={() => {
                      setSearchQuery('');
                      setIsFocused(false);
                    }}
                  >
                    <div className="tools-result-icon">
                      <i className={tool.icon}></i>
                    </div>
                    <div className="tools-result-content">
                      <h4 className="tools-result-title">{tool.name}</h4>
                      <p className="tools-result-description">{tool.desc}</p>
                      <span className="tools-result-category">{tool.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {filteredSearchResults.length === 8 && (
                <div className="tools-search-more">
                  <span>Type more to see additional results...</span>
                </div>
              )}
            </>
          ) : (
            <div className="tools-no-results">
              <i className="fas fa-search"></i>
              <p>No tools found for "{searchQuery}"</p>
              <span>Try searching with different keywords</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
