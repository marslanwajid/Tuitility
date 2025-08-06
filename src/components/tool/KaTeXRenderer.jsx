import React, { useEffect, useRef } from 'react';

const KaTeXRenderer = ({ 
  math, 
  displayMode = false, 
  className = "",
  throwOnError = false,
  errorColor = '#cc0000',
  macros = {},
  minRuleThickness = 0.05,
  colorIsTextColor = false,
  maxSize = Infinity,
  maxExpand = 1000,
  strict = 'warn'
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (window.katex && elementRef.current && math) {
      try {
        window.katex.render(math, elementRef.current, {
          displayMode,
          throwOnError,
          errorColor,
          macros,
          minRuleThickness,
          colorIsTextColor,
          maxSize,
          maxExpand,
          strict
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        // Fallback to plain text if KaTeX fails
        elementRef.current.textContent = math;
      }
    }
  }, [math, displayMode, throwOnError, errorColor, macros, minRuleThickness, colorIsTextColor, maxSize, maxExpand, strict]);

  return (
    <span 
      ref={elementRef} 
      className={className}
      style={{ 
        display: displayMode ? 'block' : 'inline',
        textAlign: displayMode ? 'center' : 'left',
        margin: displayMode ? '1em 0' : '0'
      }}
    />
  );
};

export default KaTeXRenderer; 