import React, { useEffect, useRef } from 'react';

const MathFormula = ({ 
  formula, 
  className = "",
  variant = "content", // "content", "result", "display"
  displayMode = true 
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (window.katex && elementRef.current && formula) {
      try {
        window.katex.render(formula, elementRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#cc0000'
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        // Fallback to plain text if KaTeX fails
        elementRef.current.textContent = formula;
      }
    }
  }, [formula, displayMode]);

  // Determine CSS class based on variant
  const getVariantClass = () => {
    switch (variant) {
      case 'result':
        return 'result-formula';
      case 'display':
        return 'math-formula';
      case 'content':
      default:
        return 'content-formula';
    }
  };

  return (
    <div 
      ref={elementRef} 
      className={`${getVariantClass()} ${className}`}
    />
  );
};

export default MathFormula; 