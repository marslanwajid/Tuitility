import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/css/category-page.css'

const CategoryPage = ({ 
  title, 
  description, 
  tools, 
  categories, 
  searchPlaceholder = "Search calculators...",
  baseUrl = ""
}) => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleFilterClick = (categoryId) => {
    setActiveFilter(categoryId)
    setSearchQuery('')
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    if (query) {
      setActiveFilter('all')
    }
  }

  const filteredTools = searchQuery
    ? tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeFilter === 'all'
    ? tools
    : tools.filter(tool => tool.category === activeFilter)

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
    return colors[index % colors.length]
  }

  return (
    <div className="category-page">
      <div className="container">
        {/* Hero Section */}
        <div className="category-hero">
          <h1 className="category-hero-title">{title}</h1>
          <p className="category-hero-description">
            {description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="category-search-container">
          <div className="category-search-wrapper">
            <div className="category-search-input-container">
              <i className="fas fa-search category-search-icon"></i>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="category-search-input"
              />
              {searchQuery && (
                <button
                  className="category-clear-search"
                  onClick={() => handleSearchChange('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {!searchQuery && (
          <div className="category-filter-section">
            <div className="category-filter-tabs">
                             {categories.map((category, index) => (
                 <button
                   key={category.id}
                   className={`category-filter-tab ${activeFilter === category.id ? 'active' : ''}`}
                   onClick={() => handleFilterClick(category.id)}
                   style={{ '--tab-index': index }}
                 >
                   <i className={category.icon}></i>
                   <span>{category.name}</span>
                 </button>
               ))}
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <div className="category-tools-section">
          <div className="category-tools-header">
            <h2 className="category-tools-title">
              {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : activeFilter === 'all' 
                  ? `All ${title}` 
                  : `${activeFilter} Tools`
              }
            </h2>
            <p className="category-tools-count">
              {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
            </p>
          </div>

                     <div className="category-tools-grid">
             {filteredTools.map((tool, index) => (
               <Link
                 key={index}
                 to={baseUrl + tool.url}
                 className="category-tool-card"
                 style={{ 
                   '--tool-color': getToolColor(index),
                   '--card-index': index 
                 }}
               >
                <div className="category-tool-icon">
                  <i className={tool.icon}></i>
                </div>
                <div className="category-tool-content">
                  <h3 className="category-tool-title">{tool.name}</h3>
                  <p className="category-tool-description">{tool.desc}</p>
                  <span className="category-tool-category-badge">{tool.category}</span>
                </div>
              </Link>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="category-no-results">
              <i className="fas fa-search"></i>
              <h3>No tools found</h3>
              <p>Try searching with different keywords or browse all categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage 