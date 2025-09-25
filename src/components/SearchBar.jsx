import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/css/search-bar.css'

const SearchBar = ({ allTools, onSearchChange, searchQuery, isSearching }) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setIsFocused(false), 200)
  }

  const filteredSearchResults = allTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8) // Limit to 8 results for better UX

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
    return colors[index % colors.length]
  }

  return (
    <div className="tools-search-container">
      <div className="tools-search-wrapper">
        <div className="tools-search-input-container">
          <i className="fas fa-search tools-search-icon"></i>
          <input
            type="text"
            placeholder="Search for calculators, tools, or categories..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="tools-search-input"
          />
          {searchQuery && (
            <button
              className="tools-clear-search"
              onClick={() => onSearchChange('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {isFocused && searchQuery && (
          <div className="tools-search-results">
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
    </div>
  )
}

export default SearchBar 