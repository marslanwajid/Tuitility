import React from 'react'
import { Link } from 'react-router-dom'
import { allTools } from '../data/allTools'
import { featuredToolPaths } from '../data/siteConfig'
import '../assets/css/tools-showcase.css'

const ToolsShowcase = () => {
  const featuredTools = featuredToolPaths
    .map((path) => allTools.find((tool) => tool.url === path))
    .filter(Boolean)

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
    return colors[index % colors.length]
  }

  return (
    <section className="tools-showcase">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Tools</h2>
          <p className="section-description">
            Discover our most popular and essential calculators and tools
          </p>
        </div>

        <div className="tools-grid">
          {featuredTools.map((tool, index) => (
            <Link
              key={index}
              to={tool.url}
              className="tool-card"
              style={{ '--tool-color': getToolColor(index) }}
            >
              <div className="tool-icon">
                <i className={tool.icon}></i>
              </div>
              <div
                className="tool-content"
                style={{ boxShadow: 'none !important' }}
              >
                <h4 className="tool-title">{tool.name}</h4>
                <p className="tool-description">{tool.desc}</p>
                <div className="tool-category">
                  <span className="tool-category-badge">{tool.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/math" className="cta-button">
            <i className="fas fa-arrow-right"></i>
            Explore All Tools
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ToolsShowcase 
