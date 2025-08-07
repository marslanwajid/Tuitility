import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import decimalToFractionCalculatorLogic from '../../assets/js/math/decimal-to-fraction-calculator.js';
import '../../assets/css/math/decimal-to-fraction-calculator.css';

const DecimalToFractionCalculator = () => {
  const [formData, setFormData] = useState(decimalToFractionCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (decimalToFractionCalculatorLogic.validateInput(value) || value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculate = () => {
    const calculationResult = decimalToFractionCalculatorLogic.calculate(formData);
    
    if (calculationResult.error) {
      setError(calculationResult.error);
      setResult(null);
    } else {
      setResult(calculationResult);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
  };

  const handleReset = () => {
    setFormData(decimalToFractionCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Content sections for the Decimal to Fraction Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Converting decimals to fractions is a fundamental mathematical skill that helps us understand the relationship between decimal and fractional representations of numbers.",
        "Our Decimal to Fraction Calculator provides instant conversion with step-by-step solutions, showing you exactly how to convert any decimal number to its equivalent fraction form."
      ]
    },
    {
      id: "what-are-decimals",
      title: "What are Decimals?",
      intro: [
        "Decimals are a way to represent fractions using a base-10 number system, where numbers are written with a decimal point to separate the whole number part from the fractional part."
      ],
      list: [
        "Decimals use place values based on powers of 10",
        "Each position after the decimal point represents a fraction with denominator 10^n",
        "Examples: 0.5 = 5/10 = 1/2, 0.25 = 25/100 = 1/4",
        "Decimals can be terminating (finite) or repeating (infinite)"
      ]
    },
    {
      id: "conversion-process",
      title: "How Decimal to Fraction Conversion Works",
      steps: [
        "Count the number of decimal places in the decimal number",
        "Multiply both numerator and denominator by 10^n (where n is the number of decimal places)",
        "Simplify the resulting fraction by finding the greatest common divisor (GCD)",
        "Express the final result in proper, improper, or mixed number form"
      ],
      content: (
        <div>
          <p>The conversion process follows these mathematical principles:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="0.75 = \frac{75}{100} = \frac{3}{4}" variant="content" />
            <MathFormula formula="0.125 = \frac{125}{1000} = \frac{1}{8}" variant="content" />
            <MathFormula formula="1.5 = \frac{15}{10} = \frac{3}{2} = 1\frac{1}{2}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Decimal to Fraction Calculator",
      steps: [
        "Enter a decimal number in the input field (e.g., 0.75, 1.25, -0.5)",
        "Click Calculate to see the conversion result",
        "Review the step-by-step solution to understand the process",
        "Use Reset to clear the input and start over",
        "The calculator shows original, simplified, and mixed number forms"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Simple Decimal",
          description: "Convert 0.75 to fraction",
          solution: [
            { label: "Step 1", content: "Count decimal places: 2" },
            { label: "Step 2", content: "Multiply by 10²: 0.75 × 100 = 75" },
            { label: "Step 3", content: "Initial fraction: 75/100" },
            { label: "Step 4", content: "Find GCD(75, 100) = 25" },
            { label: "Step 5", content: "Simplify: 75÷25 / 100÷25 = 3/4" },
            { label: "Result", content: "0.75 = 3/4" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert 0.75 to fraction</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Count decimal places: <MathFormula formula="2" variant="content" /></li>
                  <li>Multiply by 10²: <MathFormula formula="0.75 \times 100 = 75" variant="content" /></li>
                  <li>Initial fraction: <MathFormula formula="\frac{75}{100}" variant="content" /></li>
                  <li>Find GCD: <MathFormula formula="\text{GCD}(75, 100) = 25" variant="content" /></li>
                  <li>Simplify: <MathFormula formula="\frac{75 \div 25}{100 \div 25} = \frac{3}{4}" variant="content" /></li>
                  <li>Result: <MathFormula formula="0.75 = \frac{3}{4}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Mixed Number",
          description: "Convert 1.25 to fraction",
          solution: [
            { label: "Step 1", content: "Count decimal places: 2" },
            { label: "Step 2", content: "Multiply by 10²: 1.25 × 100 = 125" },
            { label: "Step 3", content: "Initial fraction: 125/100" },
            { label: "Step 4", content: "Find GCD(125, 100) = 25" },
            { label: "Step 5", content: "Simplify: 125÷25 / 100÷25 = 5/4" },
            { label: "Step 6", content: "Convert to mixed: 5/4 = 1¼" },
            { label: "Result", content: "1.25 = 1¼" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert 1.25 to fraction</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Count decimal places: <MathFormula formula="2" variant="content" /></li>
                  <li>Multiply by 10²: <MathFormula formula="1.25 \times 100 = 125" variant="content" /></li>
                  <li>Initial fraction: <MathFormula formula="\frac{125}{100}" variant="content" /></li>
                  <li>Find GCD: <MathFormula formula="\text{GCD}(125, 100) = 25" variant="content" /></li>
                  <li>Simplify: <MathFormula formula="\frac{125 \div 25}{100 \div 25} = \frac{5}{4}" variant="content" /></li>
                  <li>Convert to mixed: <MathFormula formula="\frac{5}{4} = 1\frac{1}{4}" variant="content" /></li>
                  <li>Result: <MathFormula formula="1.25 = 1\frac{1}{4}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Negative Decimal",
          description: "Convert -0.5 to fraction",
          solution: [
            { label: "Step 1", content: "Handle negative sign: -0.5" },
            { label: "Step 2", content: "Count decimal places: 1" },
            { label: "Step 3", content: "Multiply by 10¹: 0.5 × 10 = 5" },
            { label: "Step 4", content: "Initial fraction: 5/10" },
            { label: "Step 5", content: "Find GCD(5, 10) = 5" },
            { label: "Step 6", content: "Simplify: 5÷5 / 10÷5 = 1/2" },
            { label: "Result", content: "-0.5 = -1/2" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert -0.5 to fraction</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Handle negative sign: <MathFormula formula="-0.5" variant="content" /></li>
                  <li>Count decimal places: <MathFormula formula="1" variant="content" /></li>
                  <li>Multiply by 10¹: <MathFormula formula="0.5 \times 10 = 5" variant="content" /></li>
                  <li>Initial fraction: <MathFormula formula="\frac{5}{10}" variant="content" /></li>
                  <li>Find GCD: <MathFormula formula="\text{GCD}(5, 10) = 5" variant="content" /></li>
                  <li>Simplify: <MathFormula formula="\frac{5 \div 5}{10 \div 5} = \frac{1}{2}" variant="content" /></li>
                  <li>Result: <MathFormula formula="-0.5 = -\frac{1}{2}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "formulas",
      title: "Key Conversion Formulas",
      list: [
        "Decimal to fraction: Multiply by 10^n and simplify",
        "GCD calculation: Euclidean algorithm",
        "Mixed number conversion: Divide numerator by denominator",
        "Negative numbers: Apply sign to final result"
      ],
      content: (
        <div>
          <p>The mathematical formulas used in decimal to fraction conversion:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="0.abc = \frac{abc}{10^n}" variant="content" />
            <MathFormula formula="\text{where } n = \text{number of decimal places}" variant="content" />
            <MathFormula formula="\text{GCD}(a, b) = \text{GCD}(b, a \bmod b)" variant="content" />
            <MathFormula formula="\text{Mixed number} = \text{Whole part} + \frac{\text{Remainder}}{\text{Denominator}}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for understanding mathematical relationships",
        "Used in engineering and scientific calculations",
        "Important for financial and statistical analysis",
        "Critical for computer programming and algorithms",
        "Used in everyday measurements and conversions"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Engineering calculations and measurements",
        "Financial calculations and interest rates",
        "Statistical analysis and probability",
        "Computer programming and algorithms",
        "Scientific research and data analysis",
        "Everyday measurements and conversions"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
        <FAQSection 
          faqs={[
            {
              question: "What is the difference between a decimal and a fraction?",
              answer: "A decimal is a number written in base-10 notation with a decimal point (e.g., 0.75), while a fraction represents a part of a whole using a numerator and denominator (e.g., 3/4). Both can represent the same value but in different forms."
            },
            {
              question: "How do I convert repeating decimals to fractions?",
              answer: "Repeating decimals require a different approach using algebra. For example, to convert 0.333... to a fraction, let x = 0.333..., then 10x = 3.333..., subtract to get 9x = 3, so x = 3/9 = 1/3."
            },
            {
              question: "Can all decimals be converted to fractions?",
              answer: "Yes, all terminating decimals can be converted to fractions. Repeating decimals can also be converted using algebraic methods. However, irrational numbers (like π) cannot be expressed as exact fractions."
            },
            {
              question: "What is the greatest common divisor (GCD)?",
              answer: "The GCD of two numbers is the largest positive integer that divides both numbers without leaving a remainder. It's used to simplify fractions by dividing both numerator and denominator by the GCD."
            },
            {
              question: "How do I handle negative decimals?",
              answer: "For negative decimals, first convert the absolute value to a fraction, then apply the negative sign to the final result. The conversion process remains the same for the magnitude."
            }
          ]}
        />
      )
    }
  ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-are-decimals", title: "What are Decimals?" },
    { id: "conversion-process", title: "Conversion Process" },
    { id: "how-to-use", title: "How to Use" },
    { id: "examples", title: "Examples" },
    { id: "formulas", title: "Key Formulas" },
    { id: "significance", title: "Significance" },
    { id: "applications", title: "Applications" },
    { id: "faqs", title: "FAQs" }
  ];

  // Sidebar props - Math-specific related tools
  const sidebarProps = {
    relatedTools: getRelatedTools('math')
  };

  return (
    <div className="tool-page">
      <ToolHero 
        title="Decimal to Fraction Calculator"
        icon="fas fa-exchange-alt"
        description="Convert any decimal number to its equivalent fraction form with step-by-step solutions, showing original, simplified, and mixed number representations."
        features={[
          "Instant decimal to fraction conversion",
          "Step-by-step solutions",
          "Multiple fraction forms",
          "Handles negative numbers"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="decimal-to-fraction-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-exchange-alt"></i>
              Decimal to Fraction Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="decimal-input">Decimal Number</label>
                  <input
                    type="text"
                    id="decimal-input"
                    value={formData.decimalInput}
                    onChange={(e) => handleInputChange('decimalInput', e.target.value)}
                    placeholder="Enter decimal (e.g., 0.75, 1.25, -0.5)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-calculate">
                  <i className="fas fa-calculator"></i>
                  Convert
                </button>
                <button type="button" className="btn-reset" onClick={handleReset}>
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="result-section">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Conversion Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Decimal:</span>
                      <span className="result-value">{result.result.decimal}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Original Fraction:</span>
                      <span className="result-value">{result.formattedFraction.original}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Simplified Fraction:</span>
                      <span className="result-value">{result.formattedFraction.simplified}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Mixed Number:</span>
                      <span className="result-value">{result.formattedFraction.mixed}</span>
                    </div>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>
                      <i className="fas fa-list-ol"></i>
                      Conversion Steps
                    </h4>
                    <div className="steps-container">
                      {result.steps.map((step, index) => (
                        <div key={index} className="step">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Table of Contents & Feedback */}
        <section className="toc-feedback-section">
          <div className="toc-feedback-container">
            <TableOfContents sections={tocSections} />
            <FeedbackForm onSubmit={(data) => console.log('Feedback submitted:', data)} />
          </div>
        </section>

        {/* Content Section */}
        <ContentSection sections={contentSections} />
      </ToolLayout>
    </div>
  );
};

export default DecimalToFractionCalculator;
