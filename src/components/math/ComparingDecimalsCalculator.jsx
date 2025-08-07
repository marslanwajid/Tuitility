import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import comparingDecimalsCalculatorLogic from '../../assets/js/math/comparing-decimals-calculator.js';
import '../../assets/css/math/comparing-decimals-calculator.css';

const ComparingDecimalsCalculator = () => {
  const [formData, setFormData] = useState(comparingDecimalsCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (comparingDecimalsCalculatorLogic.validateInput(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculate = () => {
    const calculationResult = comparingDecimalsCalculatorLogic.calculate(formData);
    
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
    setFormData(comparingDecimalsCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Content sections for the Comparing Decimals Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Comparing decimal numbers is a fundamental mathematical skill that helps us understand the relative magnitude of different values.",
        "Our Comparing Decimals Calculator provides instant comparisons with step-by-step solutions, showing you exactly how to determine which decimal is larger, smaller, or if they are equal."
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
        "Each position after the decimal point represents a different power of 10",
        "Common examples: 0.5 = 5/10, 0.25 = 25/100, 3.14 = 3 + 14/100",
        "Decimals can be positive, negative, or zero",
        "They provide a precise way to represent fractional values"
      ]
    },
    {
      id: "comparison-process",
      title: "How Decimal Comparison Works",
      list: [
        "Compare the whole number parts first",
        "If whole parts are equal, compare decimal places from left to right",
        "Add trailing zeros if needed to align decimal places",
        "Use place value to determine which number is larger"
      ],
      content: (
        <div>
          <p>The comparison process follows these mathematical principles:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="a > b \text{ if } a - b > 0" variant="content" />
            <MathFormula formula="a < b \text{ if } a - b < 0" variant="content" />
            <MathFormula formula="a = b \text{ if } a - b = 0" variant="content" />
            <MathFormula formula="|a - b| = \text{ absolute difference}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Comparing Decimals Calculator",
      steps: [
        "Enter two decimal numbers in the input fields (e.g., 3.14, 2.71)",
        "You can enter positive, negative, or zero values",
        "Click Calculate to see the comparison results",
        "Review the step-by-step solution to understand the comparison process",
        "Use Reset to clear all inputs and start over"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Basic Comparison",
          description: "Compare 3.14 and 2.71",
          solution: [
            { label: "Step 1", content: "Compare whole numbers: 3 vs 2" },
            { label: "Step 2", content: "Since 3 > 2, 3.14 > 2.71" },
            { label: "Step 3", content: "Result: 3.14 is greater than 2.71" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Compare 3.14 and 2.71</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Compare whole numbers: <MathFormula formula="3" variant="content" /> vs <MathFormula formula="2" variant="content" /></li>
                  <li>Since <MathFormula formula="3 > 2" variant="content" />, <MathFormula formula="3.14 > 2.71" variant="content" /></li>
                  <li>Result: <MathFormula formula="3.14 > 2.71" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Same Whole Number",
          description: "Compare 2.5 and 2.75",
          solution: [
            { label: "Step 1", content: "Whole numbers are equal: 2 = 2" },
            { label: "Step 2", content: "Compare tenths: 0.5 vs 0.7" },
            { label: "Step 3", content: "Since 0.5 < 0.7, 2.5 < 2.75" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Compare 2.5 and 2.75</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Whole numbers are equal: <MathFormula formula="2 = 2" variant="content" /></li>
                  <li>Compare tenths: <MathFormula formula="0.5" variant="content" /> vs <MathFormula formula="0.7" variant="content" /></li>
                  <li>Since <MathFormula formula="0.5 < 0.7" variant="content" />, <MathFormula formula="2.5 < 2.75" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Equal Numbers",
          description: "Compare 1.5 and 1.50",
          solution: [
            { label: "Step 1", content: "Whole numbers are equal: 1 = 1" },
            { label: "Step 2", content: "Tenths are equal: 0.5 = 0.5" },
            { label: "Step 3", content: "Hundredths are equal: 0.00 = 0.00" },
            { label: "Step 4", content: "Result: 1.5 = 1.50" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Compare 1.5 and 1.50</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Whole numbers are equal: <MathFormula formula="1 = 1" variant="content" /></li>
                  <li>Tenths are equal: <MathFormula formula="0.5 = 0.5" variant="content" /></li>
                  <li>Hundredths are equal: <MathFormula formula="0.00 = 0.00" variant="content" /></li>
                  <li>Result: <MathFormula formula="1.5 = 1.50" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "formulas",
      title: "Key Comparison Formulas",
      list: [
        "a > b if a - b > 0 (a is greater than b)",
        "a < b if a - b < 0 (a is less than b)",
        "a = b if a - b = 0 (a equals b)",
        "|a - b| = absolute difference between a and b",
        "For decimals: compare place values from left to right"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for understanding numerical relationships",
        "Used in financial calculations and comparisons",
        "Important for scientific measurements and data analysis",
        "Critical for solving real-world problems involving quantities",
        "Used in statistics, engineering, and everyday calculations"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Financial calculations and price comparisons",
        "Scientific measurements and data analysis",
        "Statistical analysis and probability",
        "Engineering calculations and precision measurements",
        "Everyday shopping and budgeting",
        "Academic mathematics and problem solving"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
        <FAQSection 
          faqs={[
            {
              question: "How do I compare decimals with different numbers of decimal places?",
              answer: "When comparing decimals with different numbers of decimal places, you can add trailing zeros to make them have the same number of decimal places. For example, 2.5 becomes 2.50 when comparing with 2.75. Then compare place by place from left to right."
            },
            {
              question: "What's the difference between 2.5 and 2.50?",
              answer: "Mathematically, 2.5 and 2.50 are equal. The trailing zero in 2.50 doesn't change the value, but it can be useful for precision in certain contexts like currency or measurements where you want to show exact decimal places."
            },
            {
              question: "How do I compare negative decimals?",
              answer: "When comparing negative decimals, remember that larger negative numbers are actually smaller in value. For example, -2.5 is greater than -3.1 because -2.5 is closer to zero. The same comparison rules apply, but the interpretation is reversed for negative numbers."
            },
            {
              question: "What's the difference between comparing and ordering decimals?",
              answer: "Comparing decimals involves determining the relationship between two numbers (greater than, less than, or equal). Ordering decimals involves arranging multiple numbers from smallest to largest or largest to smallest. Comparison is the foundation for ordering."
            },
            {
              question: "How do I compare decimals to fractions?",
              answer: "To compare decimals to fractions, convert the fraction to a decimal first by dividing the numerator by the denominator. Then use the same comparison rules. For example, to compare 0.75 and 3/4, convert 3/4 to 0.75, then compare: 0.75 = 0.75."
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
    { id: "comparison-process", title: "Comparison Process" },
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
        title="Comparing Decimals Calculator"
        icon="fas fa-balance-scale"
        description="Compare two decimal numbers with step-by-step solutions and detailed explanations to understand which number is larger, smaller, or if they are equal."
        features={[
          "Instant decimal comparison",
          "Step-by-step solutions",
          "Handles positive and negative decimals",
          "Detailed mathematical explanations"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="comparing-decimals-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-balance-scale"></i>
              Comparing Decimals Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first-decimal">First Decimal</label>
                  <input
                    type="text"
                    id="first-decimal"
                    value={formData.firstDecimal}
                    onChange={(e) => handleInputChange('firstDecimal', e.target.value)}
                    placeholder="Enter first decimal (e.g., 3.14)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="second-decimal">Second Decimal</label>
                  <input
                    type="text"
                    id="second-decimal"
                    value={formData.secondDecimal}
                    onChange={(e) => handleInputChange('secondDecimal', e.target.value)}
                    placeholder="Enter second decimal (e.g., 2.71)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-calculate">
                  <i className="fas fa-calculator"></i>
                  Compare
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
                  Comparison Results
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Comparison Result:</span>
                      <span className="result-value">{result.comparison}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Explanation:</span>
                      <span className="result-value">{result.explanation}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Difference:</span>
                      <span className="result-value">{result.difference}</span>
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
                    
                    <div className="formula-display">
                      <span>{result.result.firstDecimal} {result.symbol} {result.result.secondDecimal}</span>
                    </div>
                    
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>First Decimal</td>
                          <td>{result.result.firstDecimal}</td>
                        </tr>
                        <tr>
                          <td>Second Decimal</td>
                          <td>{result.result.secondDecimal}</td>
                        </tr>
                        <tr>
                          <td>Comparison</td>
                          <td>{result.comparison}</td>
                        </tr>
                        <tr>
                          <td>Difference</td>
                          <td>{result.difference}</td>
                        </tr>
                      </tbody>
                    </table>
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

export default ComparingDecimalsCalculator;
