import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const MathFormula = ({ formula, inline = false, className = "" }) => {
  if (inline) {
    return (
      <span className={`math-formula-inline ${className}`}>
        <InlineMath math={formula} />
      </span>
    );
  }

  return (
    <div className={`formula ${className}`}>
      <BlockMath math={formula} />
    </div>
  );
};

export default MathFormula;

