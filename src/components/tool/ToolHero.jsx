import React from 'react';

const ToolHero = ({ 
  title, 
  icon, 
  description, 
  features = [],
  className = "" 
}) => {
  return (
    <section className={`tool-hero ${className}`}>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            <i className={icon}></i>
            {title}
          </h1>
          <p className="hero-description">
            {description}
          </p>
          {features.length > 0 && (
            <div className="hero-features">
              {features.map((feature, index) => (
                <span key={index} className="feature">
                  <i className="fas fa-check"></i>
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ToolHero; 