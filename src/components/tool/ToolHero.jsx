import React from 'react';
import { Link } from 'react-router-dom';

const ToolHero = ({ toolData }) => {
  const { name, description, icon, category, breadcrumb } = toolData;

  return (
    <section className="tool-hero">
      <div className="tool-hero-content">
        {/* Breadcrumb */}
        <nav className="tool-breadcrumb">
          <Link to="/">Home</Link>
          <span className="tool-breadcrumb-separator">/</span>
          <Link to={`/${category.toLowerCase()}`}>{breadcrumb[0]}</Link>
          <span className="tool-breadcrumb-separator">/</span>
          <span>{breadcrumb[1]}</span>
          <span className="tool-breadcrumb-separator">/</span>
          <span>{breadcrumb[2]}</span>
        </nav>
        
        {/* Hero Icon */}
        <div className="tool-hero-icon">
          <i className={icon}></i>
        </div>
        
        {/* Hero Title */}
        <h1 className="tool-hero-title">{name}</h1>
        
        {/* Hero Description */}
        <p className="tool-hero-description">{description}</p>
      </div>
    </section>
  );
};

export default ToolHero;

