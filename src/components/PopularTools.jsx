import React from 'react'
import { Link } from 'react-router-dom'
import { allTools } from '../data/allTools'
import { popularToolOverrides } from '../data/siteConfig'
import '../assets/css/popular-tools.css'

const PopularTools = () => {
  const popularTools = Object.entries(popularToolOverrides)
    .map(([path, meta]) => {
      const tool = allTools.find((entry) => entry.url === path)
      return tool ? { ...tool, ...meta } : null
    })
    .filter(Boolean)

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
    return colors[index % colors.length]
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star star"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt star"></i>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fas fa-star star empty"></i>)
    }

    return stars
  }

  return (
    <section className="popular-tools">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Tools</h2>
          <p className="section-description">
            Our most used and highly rated calculators and tools
          </p>
        </div>

        <div className="tools-grid">
          {popularTools.map((tool, index) => (
            <Link
              key={index}
              to={tool.url}
              className="tool-card"
              style={{ '--tool-color': getToolColor(index) }}
            >
              <div className="tool-icon">
                <i className={tool.icon}></i>
              </div>
              <div className="tool-content">
                <h4 className="tool-title">{tool.name}</h4>
                <p className="tool-description">{tool.desc}</p>

                <div className="tool-rating">
                  <div className="stars">
                    {renderStars(tool.rating)}
                  </div>
                  <span className="rating-text">{tool.rating}</span>
                </div>

                <div className="tool-stats">
                  <span className="usage-count">{tool.usage} users</span>
                  <span className="popular-badge">
                    <i className="fas fa-fire"></i>
                    Popular
                  </span>
                </div>

                <div className="tool-category">
                  <span className="tool-category-badge">{tool.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularTools 
