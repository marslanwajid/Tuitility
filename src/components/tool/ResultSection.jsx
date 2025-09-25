import React from 'react';

const ResultSection = ({ result }) => {
  if (!result) return null;

  const renderResultValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="result-content">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="result-item">
              <div className="result-label">{key}</div>
              <div className="result-value">{val}</div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="result-content">
        <div className="result-item">
          <div className="result-value">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="result-section">
      <div className="result-header">
        <i className="fas fa-check-circle"></i>
        <h3 className="result-title">Result</h3>
      </div>
      {renderResultValue(result)}
    </div>
  );
};

export default ResultSection;

