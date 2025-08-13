import React from 'react';
import { Link } from 'react-router-dom';

const ToolSidebar = ({ 
  relatedTools = [],
  className = "" 
}) => {
  // Standardized categories for all tools
  const categories = [
    { name: "Math Calculators", icon: "fas fa-calculator", link: "/math" },
    { name: "Finance Calculators", icon: "fas fa-dollar-sign", link: "/finance" },
    { name: "Science Calculators", icon: "fas fa-atom", link: "/science" },
    { name: "Health Calculators", icon: "fas fa-heartbeat", link: "/health" },
    { name: "Utility Tools", icon: "fas fa-tools", link: "/utility-tools" },
    { name: "Knowledge Calculators", icon: "fas fa-brain", link: "/knowledge" }
  ];

  return (
    <aside className={`tool-sidebar ${className}`}>
      {/* Categories Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-th-large"></i>
          Categories
        </h3>
        <nav className="category-links">
          {categories.map((category) => (
            <Link key={category.name} to={category.link} className="category-link">
              <i className={category.icon}></i>
              <span>{category.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Related Tools Section */}
      {relatedTools.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">
            <i className="fas fa-link"></i>
            Related Tools
          </h3>
          <nav className="related-tools">
            {relatedTools.map((tool) => (
              <Link key={tool.name} to={tool.link} className="related-tool">
                <i className={tool.icon}></i>
                <span>{tool.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
};

export default ToolSidebar; 