import React from 'react';
import ResultSection from './ResultSection';

const CalculatorSection = ({ 
  title, 
  subtitle, 
  icon = "fas fa-calculator",
  children, 
  result, 
  error,
  onCalculate,
  calculateButtonText = "Calculate"
}) => {
  return (
    <section className="calculator-section">
      <div className="calculator-header">
        <h2 className="calculator-title">
          <i className={icon}></i>
          {title}
        </h2>
        {subtitle && (
          <p className="calculator-subtitle">{subtitle}</p>
        )}
      </div>
      
      <div className="calculator-container">
        {children}
        
        {error && (
          <div className="form-error" style={{ textAlign: 'center', padding: '1rem' }}>
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}
        
        {onCalculate && (
          <div className="calculator-actions">
            <button 
              type="button" 
              className="btn-calculate"
              onClick={onCalculate}
            >
              <i className="fas fa-calculator"></i>
              {calculateButtonText}
            </button>
          </div>
        )}
        
        {result && <ResultSection result={result} />}
      </div>
    </section>
  );
};

export default CalculatorSection;
