import React from 'react';
import { Link } from 'react-router-dom';

const ToolSidebar = ({ 
  categories = [],
  className = "" 
}) => {
  const defaultCategories = [
    { path: "/math", icon: "fas fa-calculator", name: "Math" },
    { path: "/finance", icon: "fas fa-dollar-sign", name: "Finance" },
    { path: "/science", icon: "fas fa-atom", name: "Science" },
    { path: "/health", icon: "fas fa-heartbeat", name: "Health" },
    { path: "/utility-tools", icon: "fas fa-tools", name: "Utility" },
    { path: "/knowledge", icon: "fas fa-brain", name: "Knowledge" }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <aside className={`tool-sidebar ${className}`}>
      {/* Categories Box */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-th"></i>
          Categories
        </h3>
        <div className="category-links">
          {displayCategories.map((category, index) => (
            <Link key={index} to={category.path} className="category-link">
              <i className={category.icon}></i>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Related Tools Box */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-link"></i>
          Related Tools
        </h3>
        <div className="related-tools">
          <Link to="/math/percentage-calculator" className="related-tool">
            <i className="fas fa-percentage"></i>
            <span>Percentage Calculator</span>
          </Link>
          <Link to="/math/decimal-calculator" className="related-tool">
            <i className="fas fa-hashtag"></i>
            <span>Decimal Calculator</span>
          </Link>
          <Link to="/math/ratio-calculator" className="related-tool">
            <i className="fas fa-balance-scale"></i>
            <span>Ratio Calculator</span>
          </Link>
          <Link to="/math/percentage-to-fraction" className="related-tool">
            <i className="fas fa-exchange-alt"></i>
            <span>Percentage to Fraction</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Box */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-bolt"></i>
          Quick Actions
        </h3>
        <div className="quick-actions">
          <button className="quick-action">
            <i className="fas fa-copy"></i>
            <span>Copy Result</span>
          </button>
          <button className="quick-action">
            <i className="fas fa-share"></i>
            <span>Share Tool</span>
          </button>
          <button className="quick-action">
            <i className="fas fa-bookmark"></i>
            <span>Bookmark</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ToolSidebar; 