import React from 'react';
import { Link } from 'react-router-dom';

const ToolSidebar = ({ categories, relatedTools, currentTool }) => {
  return (
    <aside className="tool-sidebar">
      {/* Categories Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-th-large"></i>
          Categories
        </h3>
        <ul className="sidebar-list">
          {categories.map((category, index) => (
            <li key={index} className="sidebar-item">
              <Link to={category.url} className="sidebar-link">
                <i className={category.icon}></i>
                <span>{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Related Tools Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-tools"></i>
          Related Tools
        </h3>
        <ul className="sidebar-list">
          {relatedTools.map((tool, index) => (
            <li key={index} className="sidebar-item">
              <Link 
                to={tool.url} 
                className={`sidebar-link ${tool.name === currentTool ? 'active' : ''}`}
              >
                <i className={tool.icon}></i>
                <span>{tool.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default ToolSidebar;

