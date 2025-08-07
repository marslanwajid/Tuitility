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
    if (decimalToFractionCalculatorLogic.validateInput(value)) {
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
        "Converting decimals to fractions is a fundamental mathematical skill that helps us understand the relationship between different number representations.",
        "Our Decimal to Fraction Calculator provides instant conversions with step-by-step solutions, showing you exactly how to convert any decimal number to its equivalent fraction form."
      ]
    },
    {
      id: "what-are-decimals",
      title: "What are Decimals?",
      intro: [
        "Decimals are a way to represent numbers that are not whole numbers, using a decimal point to separate the whole part from the fractional part."
      ],
      list: [
        "Decimals represent parts of a whole using powers of 10",
        "Common examples: 0.5 = 5/10 = 1/2, 0.25 = 25/100 = 1/4",
        "Decimals can be terminating (finite) or repeating (infinite)",
        "They provide a convenient way to represent fractions with denominators that are powers of 10"
      ]
    },
    {
      id: "conversion-process",
      title: "How Decimal to Fraction Conversion Works",
      list: [
        "Count the number of decimal places",
        "Multiply by 10 raised to the power of decimal places",
        "Simplify the resulting fraction using GCD",
        "Convert to mixed number if applicable"
      ],
      content: (
        <div>
          <p>The conversion process follows these mathematical principles:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="Decimal = \frac{Numerator}{Denominator}" variant="content" />
            <MathFormula formula="Denominator = 10^{decimal\_places}" variant="content" />
            <MathFormula formula="Numerator = Decimal \times Denominator" variant="content" />
            <MathFormula formula="Simplified = \frac{Numerator \div GCD}{Denominator \div GCD}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Decimal to Fraction Calculator",
      steps: [
        "Enter a decimal number in the input field (e.g., 0.75, -2.5, 3.125)",
        "Click Calculate to see the conversion results",
        "Review the three different fraction representations: Original, Simplified, and Mixed Number",
        "Follow the step-by-step solution to understand the conversion process",
        "Use Reset to clear the input and start over"
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
                  <li>Find GCD: <MathFormula formula="GCD(75, 100) = 25" variant="content" /></li>
                  <li>Simplify: <MathFormula formula="\frac{75 \div 25}{100 \div 25} = \frac{3}{4}" variant="content" /></li>
                  <li>Result: <MathFormula formula="0.75 = \frac{3}{4}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Negative Decimal",
          description: "Convert -2.5 to fraction",
          solution: [
            { label: "Step 1", content: "Handle negative: -2.5" },
            { label: "Step 2", content: "Count decimal places: 1" },
            { label: "Step 3", content: "Multiply by 10¹: 2.5 × 10 = 25" },
            { label: "Step 4", content: "Initial fraction: 25/10" },
            { label: "Step 5", content: "Find GCD(25, 10) = 5" },
            { label: "Step 6", content: "Simplify: 25÷5 / 10÷5 = 5/2" },
            { label: "Step 7", content: "Convert to mixed: 2 1/2" },
            { label: "Result", content: "-2.5 = -2 1/2" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert -2.5 to fraction</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Handle negative: <MathFormula formula="-2.5" variant="content" /></li>
                  <li>Count decimal places: <MathFormula formula="1" variant="content" /></li>
                  <li>Multiply by 10¹: <MathFormula formula="2.5 \times 10 = 25" variant="content" /></li>
                  <li>Initial fraction: <MathFormula formula="\frac{25}{10}" variant="content" /></li>
                  <li>Find GCD: <MathFormula formula="GCD(25, 10) = 5" variant="content" /></li>
                  <li>Simplify: <MathFormula formula="\frac{25 \div 5}{10 \div 5} = \frac{5}{2}" variant="content" /></li>
                  <li>Convert to mixed: <MathFormula formula="2 \frac{1}{2}" variant="content" /></li>
                  <li>Result: <MathFormula formula="-2.5 = -2 \frac{1}{2}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Complex Decimal",
          description: "Convert 3.125 to fraction",
          solution: [
            { label: "Step 1", content: "Count decimal places: 3" },
            { label: "Step 2", content: "Multiply by 10³: 3.125 × 1000 = 3125" },
            { label: "Step 3", content: "Initial fraction: 3125/1000" },
            { label: "Step 4", content: "Find GCD(3125, 1000) = 125" },
            { label: "Step 5", content: "Simplify: 3125÷125 / 1000÷125 = 25/8" },
            { label: "Step 6", content: "Convert to mixed: 3 1/8" },
            { label: "Result", content: "3.125 = 3 1/8" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert 3.125 to fraction</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Count decimal places: <MathFormula formula="3" variant="content" /></li>
                  <li>Multiply by 10³: <MathFormula formula="3.125 \times 1000 = 3125" variant="content" /></li>
                  <li>Initial fraction: <MathFormula formula="\frac{3125}{1000}" variant="content" /></li>
                  <li>Find GCD: <MathFormula formula="GCD(3125, 1000) = 125" variant="content" /></li>
                  <li>Simplify: <MathFormula formula="\frac{3125 \div 125}{1000 \div 125} = \frac{25}{8}" variant="content" /></li>
                  <li>Convert to mixed: <MathFormula formula="3 \frac{1}{8}" variant="content" /></li>
                  <li>Result: <MathFormula formula="3.125 = 3 \frac{1}{8}" variant="result" /></li>
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
        "Decimal to fraction: Decimal = Numerator/Denominator",
        "Denominator calculation: Denominator = 10^decimal_places",
        "Numerator calculation: Numerator = Decimal × Denominator",
        "Simplification: Simplified = (Numerator ÷ GCD) / (Denominator ÷ GCD)",
        "Mixed number: Whole + (Remainder/Denominator)"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for understanding mathematical relationships",
        "Used in engineering and scientific calculations",
        "Important for precise measurements and ratios",
        "Critical for financial calculations and percentages",
        "Used in everyday situations like cooking and construction"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Engineering and technical calculations",
        "Scientific measurements and ratios",
        "Financial calculations and interest rates",
        "Cooking and recipe measurements",
        "Construction and architectural plans",
        "Academic mathematics and statistics"
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
              answer: "A decimal is a number written using a decimal point (e.g., 0.5), while a fraction is written as a ratio of two integers (e.g., 1/2). Both represent the same value but in different forms."
            },
            {
              question: "How do I convert repeating decimals to fractions?",
              answer: "Repeating decimals require algebraic methods. For example, to convert 0.333... to fraction, let x = 0.333..., then 10x = 3.333..., subtract to get 9x = 3, so x = 3/9 = 1/3."
            },
            {
              question: "Can all decimals be converted to fractions?",
              answer: "Yes, all terminating decimals can be converted to fractions. Repeating decimals can also be converted using algebraic methods. However, irrational numbers (like π) cannot be expressed as exact fractions."
            },
            {
              question: "What is the purpose of simplifying fractions?",
              answer: "Simplifying fractions makes them easier to work with and understand. It reduces the numbers to their smallest possible form while maintaining the same value, making calculations and comparisons simpler."
            },
            {
              question: "How do I handle negative decimals?",
              answer: "Negative decimals are handled by applying the negative sign to the final fraction. The conversion process remains the same, but the result will be negative."
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
          "Three fraction representations",
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
                    placeholder="Enter decimal (e.g., 0.75, -2.5, 3.125)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-calculate">
                  <i className="fas fa-calculator"></i>
                  Calculate
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
              <div className="result-section" style={{ display: 'block' }}>
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Conversion Results
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Original Fraction</span>
                      <span className="result-value">{result.result.original}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Simplified Fraction</span>
                      <span className="result-value">{result.result.simplified}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Mixed Number</span>
                      <span className="result-value">{result.result.mixed}</span>
                    </div>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>
                      <i className="fas fa-list-ol"></i>
                      Step-by-Step Solution
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
