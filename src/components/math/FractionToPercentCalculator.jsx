import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import fractionToPercentCalculatorLogic from '../../assets/js/math/fraction-to-percent-calculator.js';
import '../../assets/css/math/fraction-to-percent-calculator.css';

const FractionToPercentCalculator = () => {
  const [activeTab, setActiveTab] = useState('simple');
  const [simpleFormData, setSimpleFormData] = useState(fractionToPercentCalculatorLogic.resetFormData('simple'));
  const [mixedFormData, setMixedFormData] = useState(fractionToPercentCalculatorLogic.resetFormData('mixed'));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTabChange = (tabType) => {
    setActiveTab(tabType);
    setResult(null);
    setError('');
  };

  const handleInputChange = (field, value, type = 'simple') => {
    if (fractionToPercentCalculatorLogic.validateInput(value)) {
      if (type === 'simple') {
        setSimpleFormData(prev => ({
          ...prev,
          [field]: value
        }));
      } else {
        setMixedFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  };

  const calculate = () => {
    const currentFormData = activeTab === 'simple' ? simpleFormData : mixedFormData;
    const calculationResult = fractionToPercentCalculatorLogic.calculate(currentFormData, activeTab);
    
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
    if (activeTab === 'simple') {
      setSimpleFormData(fractionToPercentCalculatorLogic.resetFormData('simple'));
    } else {
      setMixedFormData(fractionToPercentCalculatorLogic.resetFormData('mixed'));
    }
    setResult(null);
    setError('');
  };

  // Content sections for the Fraction to Percent Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Converting fractions to percentages is a fundamental mathematical skill that helps us understand fractions in terms of parts per hundred.",
        "Our Fraction to Percent Calculator provides instant conversions with step-by-step solutions, showing you exactly how to convert any fraction or mixed number to its percentage equivalent."
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
      id: "conversion-process",
      title: "How Fraction to Percent Conversion Works",
      list: [
        "Convert mixed numbers to improper fractions (if applicable)",
        "Divide the numerator by the denominator to get the decimal",
        "Multiply the decimal by 100 to get the percentage",
        "Round the result to the desired number of decimal places"
      ],
      content: (
        <div>
          <p>The conversion process follows these mathematical principles:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="\text{Decimal} = \frac{\text{Numerator}}{\text{Denominator}}" variant="content" />
            <MathFormula formula="\text{Percentage} = \text{Decimal} \times 100" variant="content" />
            <MathFormula formula="\text{For mixed numbers: } \text{Improper Fraction} = \text{Whole} + \frac{\text{Numerator}}{\text{Denominator}}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Fraction to Percent Calculator",
      steps: [
        "Choose between Simple Fraction or Mixed Number tab",
        "Enter the numerator and denominator values",
        "For mixed numbers, also enter the whole number part",
        "Click Calculate to see the conversion results",
        "Review the step-by-step solution to understand the conversion process",
        "Use Reset to clear all inputs and start over"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Simple Fraction",
          description: "Convert 3/4 to percentage",
          solution: [
            { label: "Step 1", content: "Start with fraction: 3/4" },
            { label: "Step 2", content: "Divide: 3 ÷ 4 = 0.75" },
            { label: "Step 3", content: "Multiply by 100: 0.75 × 100 = 75%" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert 3/4 to percentage</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Start with fraction: <MathFormula formula="\frac{3}{4}" variant="content" /></li>
                  <li>Divide: <MathFormula formula="3 \div 4 = 0.75" variant="content" /></li>
                  <li>Multiply by 100: <MathFormula formula="0.75 \times 100 = 75\%" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Mixed Number",
          description: "Convert 1 2/3 to percentage",
          solution: [
            { label: "Step 1", content: "Start with mixed number: 1 2/3" },
            { label: "Step 2", content: "Convert to improper fraction: (1 × 3) + 2 = 5/3" },
            { label: "Step 3", content: "Divide: 5 ÷ 3 = 1.6667" },
            { label: "Step 4", content: "Multiply by 100: 1.6667 × 100 = 166.67%" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Convert 1 2/3 to percentage</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Start with mixed number: <MathFormula formula="1 \frac{2}{3}" variant="content" /></li>
                  <li>Convert to improper fraction: <MathFormula formula="(1 \times 3) + 2 = \frac{5}{3}" variant="content" /></li>
                  <li>Divide: <MathFormula formula="5 \div 3 = 1.6667" variant="content" /></li>
                  <li>Multiply by 100: <MathFormula formula="1.6667 \times 100 = 166.67\%" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Common Fractions",
          description: "Convert common fractions to percentages",
          solution: [
            { label: "1/2", content: "1 ÷ 2 = 0.5, 0.5 × 100 = 50%" },
            { label: "1/4", content: "1 ÷ 4 = 0.25, 0.25 × 100 = 25%" },
            { label: "3/5", content: "3 ÷ 5 = 0.6, 0.6 × 100 = 60%" }
          ],
          content: (
            <div>
              <p><strong>Common Fraction Conversions:</strong></p>
              <div className="solution-steps">
                <h4>Quick Reference:</h4>
                <ul>
                  <li><MathFormula formula="\frac{1}{2} = 50\%" variant="content" /></li>
                  <li><MathFormula formula="\frac{1}{4} = 25\%" variant="content" /></li>
                  <li><MathFormula formula="\frac{3}{5} = 60\%" variant="content" /></li>
                  <li><MathFormula formula="\frac{2}{3} = 66.67\%" variant="content" /></li>
                  <li><MathFormula formula="\frac{4}{5} = 80\%" variant="content" /></li>
                </ul>
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
        "Decimal = Numerator ÷ Denominator",
        "Percentage = Decimal × 100",
        "For mixed numbers: Improper Fraction = (Whole × Denominator) + Numerator",
        "Percentage = (Improper Fraction ÷ Denominator) × 100",
        "Common conversions: 1/2 = 50%, 1/4 = 25%, 3/4 = 75%"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for understanding fractions in everyday contexts",
        "Used in financial calculations and interest rates",
        "Important for statistical analysis and data interpretation",
        "Critical for solving real-world problems involving proportions",
        "Used in academic mathematics and standardized tests",
        "Helps develop number sense and mathematical intuition"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Financial calculations and interest rates",
        "Statistical analysis and data interpretation",
        "Academic mathematics and standardized tests",
        "Everyday shopping and discounts",
        "Recipe scaling and cooking measurements",
        "Construction and measurement tasks",
        "Sports statistics and performance metrics",
        "Business analytics and reporting"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
        <FAQSection 
          faqs={[
            {
              question: "How do I convert a mixed number to a percentage?",
              answer: "First convert the mixed number to an improper fraction by multiplying the whole number by the denominator and adding the numerator. Then divide the numerator by the denominator to get the decimal, and multiply by 100 to get the percentage."
            },
            {
              question: "What's the difference between a fraction and a percentage?",
              answer: "A fraction represents parts of a whole (e.g., 3/4 means 3 parts out of 4), while a percentage represents parts per hundred (e.g., 75% means 75 parts out of 100). Percentages are often easier to understand in everyday contexts."
            },
            {
              question: "Can I convert any fraction to a percentage?",
              answer: "Yes, any fraction can be converted to a percentage. The result may be a whole number (like 50%), a decimal (like 66.67%), or even greater than 100% for improper fractions (like 150% for 3/2)."
            },
            {
              question: "Why do some fractions result in repeating decimals?",
              answer: "Fractions with denominators that have prime factors other than 2 and 5 result in repeating decimals. For example, 1/3 = 0.3333... and 2/7 = 0.285714285714... These are perfectly valid and can still be converted to percentages."
            },
            {
              question: "How accurate are the percentage conversions?",
              answer: "The calculator provides results accurate to 4 decimal places and removes trailing zeros for cleaner display. For most practical purposes, this level of precision is sufficient."
            },
            {
              question: "What are some common fraction to percentage conversions I should know?",
              answer: "Common conversions include: 1/2 = 50%, 1/4 = 25%, 3/4 = 75%, 1/3 = 33.33%, 2/3 = 66.67%, 1/5 = 20%, 2/5 = 40%, 3/5 = 60%, 4/5 = 80%, and 1/10 = 10%."
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
        title="Fraction to Percent Calculator"
        icon="fas fa-percentage"
        description="Convert fractions and mixed numbers to percentages with step-by-step solutions and detailed explanations to understand the conversion process."
        features={[
          "Simple fraction and mixed number conversion",
          "Step-by-step solutions",
          "Real-time calculation",
          "Comprehensive examples"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="fraction-to-percent-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-percentage"></i>
              Fraction to Percent Calculator
            </h2>
            
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'simple' ? 'active' : ''}`}
                onClick={() => handleTabChange('simple')}
              >
                <i className="fas fa-fraction"></i>
                Simple Fraction
              </button>
              <button 
                className={`tab-button ${activeTab === 'mixed' ? 'active' : ''}`}
                onClick={() => handleTabChange('mixed')}
              >
                <i className="fas fa-layer-group"></i>
                Mixed Number
              </button>
            </div>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              {/* Simple Fraction Tab */}
              <div className={`tab-content ${activeTab === 'simple' ? 'active' : ''}`}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="numerator">Numerator</label>
                    <input
                      type="text"
                      id="numerator"
                      name="numerator"
                      value={simpleFormData.numerator}
                      onChange={(e) => handleInputChange('numerator', e.target.value, 'simple')}
                      placeholder="Enter numerator"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="denominator">Denominator</label>
                    <input
                      type="text"
                      id="denominator"
                      name="denominator"
                      value={simpleFormData.denominator}
                      onChange={(e) => handleInputChange('denominator', e.target.value, 'simple')}
                      placeholder="Enter denominator"
                      className="input-field bottom"
                    />
                  </div>
                </div>
                
                <div className="fraction-display">
                  <span>{simpleFormData.numerator}</span>
                  <div className="fraction-line"></div>
                  <span>{simpleFormData.denominator}</span>
                </div>
              </div>

              {/* Mixed Number Tab */}
              <div className={`tab-content ${activeTab === 'mixed' ? 'active' : ''}`}>
                <div className="form-row mixed">
                  <div className="form-group">
                    <label htmlFor="whole">Whole Number</label>
                    <input
                      type="text"
                      id="whole"
                      name="whole"
                      value={mixedFormData.whole}
                      onChange={(e) => handleInputChange('whole', e.target.value, 'mixed')}
                      placeholder="Enter whole number"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mixed-numerator">Numerator</label>
                    <input
                      type="text"
                      id="mixed-numerator"
                      name="numerator"
                      value={mixedFormData.numerator}
                      onChange={(e) => handleInputChange('numerator', e.target.value, 'mixed')}
                      placeholder="Enter numerator"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mixed-denominator">Denominator</label>
                    <input
                      type="text"
                      id="mixed-denominator"
                      name="denominator"
                      value={mixedFormData.denominator}
                      onChange={(e) => handleInputChange('denominator', e.target.value, 'mixed')}
                      placeholder="Enter denominator"
                      className="input-field bottom"
                    />
                  </div>
                </div>
                
                <div className="fraction-display">
                  <span>{mixedFormData.whole}</span>
                  <span>{mixedFormData.numerator}</span>
                  <div className="fraction-line"></div>
                  <span>{mixedFormData.denominator}</span>
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
              <div className="result-section" style={{ display: 'block' }}>
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Conversion Results
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Input:</span>
                      <span className="result-value">{result.inputDisplay}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Decimal:</span>
                      <span className="result-value">{result.decimal}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Percentage:</span>
                      <span className="result-value">{result.percentage}%</span>
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
                      <span>{result.inputDisplay} = {result.percentage}%</span>
                    </div>
                    
                    <table className="conversion-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Input</td>
                          <td>{result.inputDisplay}</td>
                        </tr>
                        <tr>
                          <td>Decimal</td>
                          <td>{result.decimal}</td>
                        </tr>
                        <tr>
                          <td>Percentage</td>
                          <td>{result.percentage}%</td>
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

export default FractionToPercentCalculator;
