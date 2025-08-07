import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import comparingFractionsCalculatorLogic from '../../assets/js/math/comparing-fractions-calculator.js';
import '../../assets/css/math/comparing-fractions-calculator.css';

const ComparingFractionsCalculator = () => {
  const [formData, setFormData] = useState(comparingFractionsCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (comparingFractionsCalculatorLogic.validateInput(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculate = () => {
    const calculationResult = comparingFractionsCalculatorLogic.calculate(formData);
    
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
    setFormData(comparingFractionsCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Content sections for the Comparing Fractions Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Comparing fractions, decimals, and mixed numbers is a fundamental mathematical skill that helps us understand the relative magnitude of different numerical representations.",
        "Our Comparing Fractions Calculator provides instant comparisons with step-by-step solutions, showing you exactly how to determine which value is larger, smaller, or if they are equal."
      ]
    },
    {
      id: "what-are-fractions",
      title: "What are Fractions?",
      intro: [
        "Fractions represent parts of a whole, using a numerator (top number) and denominator (bottom number) to show how many parts we have out of the total."
      ],
      list: [
        "Fractions represent parts of a whole using division",
        "The numerator (top) shows how many parts we have",
        "The denominator (bottom) shows the total number of equal parts",
        "Common examples: 1/2 = one half, 3/4 = three quarters, 2/3 = two thirds",
        "Fractions can be proper (numerator < denominator), improper (numerator ≥ denominator), or mixed numbers"
      ]
    },
    {
      id: "comparison-process",
      title: "How Fraction Comparison Works",
      list: [
        "Convert all values to decimal form for accurate comparison",
        "Handle different input formats (fractions, mixed numbers, decimals, percentages)",
        "Compare the decimal values using standard comparison operators",
        "Account for floating-point precision to avoid false inequalities"
      ],
      content: (
        <div>
          <p>The comparison process follows these mathematical principles:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="a > b \text{ if } a - b > 0" variant="content" />
            <MathFormula formula="a < b \text{ if } a - b < 0" variant="content" />
            <MathFormula formula="a = b \text{ if } |a - b| < \epsilon" variant="content" />
            <MathFormula formula="\text{where } \epsilon = 0.0000001 \text{ (precision tolerance)}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "supported-formats",
      title: "Supported Input Formats",
      list: [
        "Simple fractions: 3/4, 5/8, 2/3",
        "Mixed numbers: 2 3/5, 1 1/4, 3 2/7",
        "Decimal numbers: 0.75, 1.25, 2.5",
        "Percentages: 75%, 125%, 50%",
        "Whole numbers: 5, 10, 0"
      ],
      content: (
        <div className="supported-formats">
          <h5>Format Examples:</h5>
          <ul>
            <li><strong>Fractions:</strong> 3/4, 5/8, 2/3</li>
            <li><strong>Mixed Numbers:</strong> 2 3/5, 1 1/4, 3 2/7</li>
            <li><strong>Decimals:</strong> 0.75, 1.25, 2.5</li>
            <li><strong>Percentages:</strong> 75%, 125%, 50%</li>
            <li><strong>Whole Numbers:</strong> 5, 10, 0</li>
          </ul>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Comparing Fractions Calculator",
      steps: [
        "Enter two values in any supported format (fractions, mixed numbers, decimals, percentages)",
        "You can mix different formats (e.g., compare 3/4 with 0.75)",
        "Click Compare to see the comparison results",
        "Review the step-by-step solution to understand the conversion and comparison process",
        "Use Reset to clear all inputs and start over"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Fraction vs Decimal",
          description: "Compare 3/4 and 0.75",
          solution: [
            { label: "Step 1", content: "Convert 3/4 to decimal: 3 ÷ 4 = 0.75" },
            { label: "Step 2", content: "Compare: 0.75 = 0.75" },
            { label: "Step 3", content: "Result: 3/4 = 0.75" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Compare 3/4 and 0.75</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Convert 3/4 to decimal: <MathFormula formula="3 \div 4 = 0.75" variant="content" /></li>
                  <li>Compare: <MathFormula formula="0.75 = 0.75" variant="content" /></li>
                  <li>Result: <MathFormula formula="3/4 = 0.75" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Mixed Number vs Fraction",
          description: "Compare 2 1/2 and 5/2",
          solution: [
            { label: "Step 1", content: "Convert 2 1/2 to decimal: 2 + (1 ÷ 2) = 2.5" },
            { label: "Step 2", content: "Convert 5/2 to decimal: 5 ÷ 2 = 2.5" },
            { label: "Step 3", content: "Compare: 2.5 = 2.5" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Compare 2 1/2 and 5/2</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Convert 2 1/2 to decimal: <MathFormula formula="2 + (1 \div 2) = 2.5" variant="content" /></li>
                  <li>Convert 5/2 to decimal: <MathFormula formula="5 \div 2 = 2.5" variant="content" /></li>
                  <li>Result: <MathFormula formula="2 \frac{1}{2} = \frac{5}{2}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Percentage vs Fraction",
          description: "Compare 75% and 3/4",
          solution: [
            { label: "Step 1", content: "Convert 75% to decimal: 75 ÷ 100 = 0.75" },
            { label: "Step 2", content: "Convert 3/4 to decimal: 3 ÷ 4 = 0.75" },
            { label: "Step 3", content: "Compare: 0.75 = 0.75" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Compare 75% and 3/4</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Convert 75% to decimal: <MathFormula formula="75 \div 100 = 0.75" variant="content" /></li>
                  <li>Convert 3/4 to decimal: <MathFormula formula="3 \div 4 = 0.75" variant="content" /></li>
                  <li>Result: <MathFormula formula="75\% = \frac{3}{4}" variant="result" /></li>
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
        "a = b if |a - b| < ε (a equals b, accounting for precision)",
        "For fractions: convert to decimal first, then compare",
        "For mixed numbers: convert to improper fraction, then to decimal",
        "For percentages: divide by 100 to get decimal equivalent"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for understanding numerical relationships across different formats",
        "Used in financial calculations and comparisons",
        "Important for scientific measurements and data analysis",
        "Critical for solving real-world problems involving quantities",
        "Used in statistics, engineering, and everyday calculations",
        "Helps develop number sense and mathematical intuition"
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
        "Academic mathematics and problem solving",
        "Recipe scaling and cooking measurements",
        "Construction and measurement tasks"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
        <FAQSection 
          faqs={[
            {
              question: "How does the calculator handle different input formats?",
              answer: "The calculator automatically detects the input format and converts all values to decimal form for accurate comparison. It supports fractions (3/4), mixed numbers (2 1/2), decimals (0.75), and percentages (75%)."
            },
            {
              question: "Why do some equal values show as equal even with different representations?",
              answer: "The calculator uses a precision tolerance (ε = 0.0000001) to account for floating-point arithmetic limitations. This ensures that values like 1/3 and 0.333333 are correctly identified as equal despite decimal representation differences."
            },
            {
              question: "Can I compare negative numbers?",
              answer: "Yes, the calculator supports negative numbers in all formats. For example, you can compare -3/4 with -0.75, or -50% with -1/2. The comparison follows standard mathematical rules for negative numbers."
            },
            {
              question: "What's the difference between comparing fractions and comparing decimals?",
              answer: "Mathematically, there's no difference - both are comparing numerical values. The calculator converts fractions to decimals for comparison, but the result is the same regardless of the original format. This approach ensures accuracy and handles all input types uniformly."
            },
            {
              question: "How accurate are the decimal conversions?",
              answer: "The calculator uses JavaScript's built-in floating-point arithmetic, which is accurate to about 15-17 significant digits. For most practical purposes, this provides sufficient precision. The calculator also uses a small tolerance to handle floating-point precision issues."
            },
            {
              question: "Can I compare more than two values at once?",
              answer: "Currently, the calculator compares two values at a time. To compare multiple values, you can use the calculator multiple times or compare them in pairs. This approach ensures clear, step-by-step solutions for each comparison."
            }
          ]}
        />
      )
    }
  ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-are-fractions", title: "What are Fractions?" },
    { id: "comparison-process", title: "Comparison Process" },
    { id: "supported-formats", title: "Supported Formats" },
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
        title="Comparing Fractions Calculator"
        icon="fas fa-balance-scale"
        description="Compare fractions, mixed numbers, decimals, and percentages with step-by-step solutions and detailed explanations to understand which value is larger, smaller, or if they are equal."
        features={[
          "Multi-format comparison (fractions, decimals, percentages)",
          "Step-by-step solutions",
          "Handles mixed numbers and negative values",
          "Precision-aware comparisons"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="comparing-fractions-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-balance-scale"></i>
              Comparing Fractions Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first-value">First Value</label>
                  <input
                    type="text"
                    id="first-value"
                    value={formData.firstValue}
                    onChange={(e) => handleInputChange('firstValue', e.target.value)}
                    placeholder="Enter first value (e.g., 3/4, 0.75, 75%)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="second-value">Second Value</label>
                  <input
                    type="text"
                    id="second-value"
                    value={formData.secondValue}
                    onChange={(e) => handleInputChange('secondValue', e.target.value)}
                    placeholder="Enter second value (e.g., 2/3, 0.67, 67%)"
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
                      <span className="result-label">First Value (Decimal):</span>
                      <span className="result-value">{result.firstDecimal.toFixed(6)}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Second Value (Decimal):</span>
                      <span className="result-value">{result.secondDecimal.toFixed(6)}</span>
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
                      <span>{result.result.firstValue} {result.comparisonSymbol} {result.result.secondValue}</span>
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
                          <td>First Value</td>
                          <td>{result.result.firstValue}</td>
                        </tr>
                        <tr>
                          <td>Second Value</td>
                          <td>{result.result.secondValue}</td>
                        </tr>
                        <tr>
                          <td>First (Decimal)</td>
                          <td>{result.firstDecimal.toFixed(6)}</td>
                        </tr>
                        <tr>
                          <td>Second (Decimal)</td>
                          <td>{result.secondDecimal.toFixed(6)}</td>
                        </tr>
                        <tr>
                          <td>Comparison</td>
                          <td>{result.comparison}</td>
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

export default ComparingFractionsCalculator;
