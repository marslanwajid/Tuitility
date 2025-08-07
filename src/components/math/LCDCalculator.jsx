import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import lcdCalculatorLogic from '../../assets/js/math/lcd-calculator.js';
import '../../assets/css/math/lcd-calculator.css';

const LCDCalculator = () => {
  const [formData, setFormData] = useState(lcdCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (lcdCalculatorLogic.validateInput(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const calculate = () => {
    const calculationResult = lcdCalculatorLogic.calculate(formData);
    
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
    setFormData(lcdCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Content sections for the LCD Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "The Least Common Denominator (LCD) is the smallest number that can be used as a common denominator for a set of fractions.",
        "Our LCD Calculator helps you find the least common denominator and convert fractions to equivalent forms with the same denominator, making it easier to add, subtract, or compare fractions."
      ]
    },
    {
      id: "what-is-lcd",
      title: "What is LCD?",
      intro: [
        "The Least Common Denominator (LCD) is the smallest number that is a multiple of all the denominators in a set of fractions."
      ],
      list: [
        "LCD is the least common multiple (LCM) of all denominators",
        "It's used to find common denominators for fraction operations",
        "Essential for adding and subtracting fractions with different denominators",
        "Used in comparing fractions with different denominators",
        "Important in algebra and fraction arithmetic"
      ]
    },
    {
      id: "calculation-process",
      title: "How LCD Calculation Works",
      list: [
        "Identify all denominators from the given fractions",
        "Find the least common multiple (LCM) of all denominators",
        "Convert each fraction to an equivalent fraction with the LCD",
        "Multiply numerator and denominator by the same factor"
      ],
      content: (
        <div>
          <p>The LCD calculation process follows these mathematical principles:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="LCD = LCM(denominator_1, denominator_2, \ldots, denominator_n)" variant="content" />
            <MathFormula formula="Equivalent Fraction = \frac{numerator \times multiplier}{denominator \times multiplier}" variant="content" />
            <MathFormula formula="Multiplier = \frac{LCD}{original\_denominator}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use LCD Calculator",
      steps: [
        "Enter two or more fractions separated by commas (e.g., 1/4, 1/6, 1/8)",
        "You can enter fractions, mixed numbers, or whole numbers",
        "Click Calculate to see the LCD and equivalent fractions",
        "Review the step-by-step solution to understand the process",
        "Use Reset to clear all inputs and start over"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Simple Fractions",
          description: "Find LCD of 1/4, 1/6, and 1/8",
          solution: [
            { label: "Step 1", content: "Denominators: 4, 6, 8" },
            { label: "Step 2", content: "Find LCM(4, 6, 8) = 24" },
            { label: "Step 3", content: "LCD = 24" },
            { label: "Step 4", content: "Convert fractions: 1/4 = 6/24, 1/6 = 4/24, 1/8 = 3/24" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCD of 1/4, 1/6, and 1/8</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Denominators: <MathFormula formula="4, 6, 8" variant="content" /></li>
                  <li>Find LCM: <MathFormula formula="LCM(4, 6, 8) = 24" variant="content" /></li>
                  <li>LCD: <MathFormula formula="24" variant="result" /></li>
                  <li>Convert fractions:</li>
                  <ul>
                    <li><MathFormula formula="\frac{1}{4} = \frac{1 \times 6}{4 \times 6} = \frac{6}{24}" variant="content" /></li>
                    <li><MathFormula formula="\frac{1}{6} = \frac{1 \times 4}{6 \times 4} = \frac{4}{24}" variant="content" /></li>
                    <li><MathFormula formula="\frac{1}{8} = \frac{1 \times 3}{8 \times 3} = \frac{3}{24}" variant="content" /></li>
                  </ul>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Mixed Numbers",
          description: "Find LCD of 2 1/3, 1 1/4, and 3/5",
          solution: [
            { label: "Step 1", content: "Convert to improper fractions: 7/3, 5/4, 3/5" },
            { label: "Step 2", content: "Denominators: 3, 4, 5" },
            { label: "Step 3", content: "Find LCM(3, 4, 5) = 60" },
            { label: "Step 4", content: "LCD = 60" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCD of 2 1/3, 1 1/4, and 3/5</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Convert to improper fractions:</li>
                  <ul>
                    <li><MathFormula formula="2 \frac{1}{3} = \frac{7}{3}" variant="content" /></li>
                    <li><MathFormula formula="1 \frac{1}{4} = \frac{5}{4}" variant="content" /></li>
                    <li><MathFormula formula="\frac{3}{5}" variant="content" /></li>
                  </ul>
                  <li>Denominators: <MathFormula formula="3, 4, 5" variant="content" /></li>
                  <li>Find LCM: <MathFormula formula="LCM(3, 4, 5) = 60" variant="content" /></li>
                  <li>LCD: <MathFormula formula="60" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Adding Fractions",
          description: "Add 1/6 + 1/8 using LCD",
          solution: [
            { label: "Step 1", content: "Find LCD of 1/6 and 1/8" },
            { label: "Step 2", content: "LCD = LCM(6, 8) = 24" },
            { label: "Step 3", content: "Convert fractions: 1/6 = 4/24, 1/8 = 3/24" },
            { label: "Step 4", content: "Add: 4/24 + 3/24 = 7/24" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Add 1/6 + 1/8 using LCD</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Find LCD: <MathFormula formula="LCM(6, 8) = 24" variant="content" /></li>
                  <li>Convert fractions:</li>
                  <ul>
                    <li><MathFormula formula="\frac{1}{6} = \frac{4}{24}" variant="content" /></li>
                    <li><MathFormula formula="\frac{1}{8} = \frac{3}{24}" variant="content" /></li>
                  </ul>
                  <li>Add: <MathFormula formula="\frac{4}{24} + \frac{3}{24} = \frac{7}{24}" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "formulas",
      title: "Key LCD Formulas",
      list: [
        "LCD = LCM(denominator₁, denominator₂, ..., denominatorₙ)",
        "Equivalent fraction = (numerator × multiplier) / (denominator × multiplier)",
        "Multiplier = LCD / original_denominator",
        "For adding fractions: a/b + c/d = (a×LCD/b + c×LCD/d) / LCD",
        "For subtracting fractions: a/b - c/d = (a×LCD/b - c×LCD/d) / LCD"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for fraction arithmetic operations",
        "Used in adding and subtracting fractions with different denominators",
        "Important for comparing fractions with different denominators",
        "Critical for solving fraction equations and inequalities",
        "Used in algebra, calculus, and real-world applications"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Fraction arithmetic and algebra",
        "Recipe scaling and cooking measurements",
        "Construction and engineering calculations",
        "Financial calculations and ratios",
        "Scientific measurements and conversions",
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
              question: "What is the difference between LCD and LCM?",
              answer: "LCD (Least Common Denominator) is specifically used for fractions and is the LCM of the denominators. LCM (Least Common Multiple) is a more general concept that can be applied to any set of numbers. For fractions, LCD = LCM of denominators."
            },
            {
              question: "Can I use LCD for more than two fractions?",
              answer: "Yes, LCD can be calculated for any number of fractions. The LCD is the least common multiple of all the denominators in the set of fractions."
            },
            {
              question: "How do I add fractions with different denominators?",
              answer: "To add fractions with different denominators: 1) Find the LCD of all denominators, 2) Convert each fraction to an equivalent fraction with the LCD as denominator, 3) Add the numerators and keep the LCD as denominator."
            },
            {
              question: "What if one of my inputs is a whole number?",
              answer: "Whole numbers can be treated as fractions with denominator 1. For example, 5 becomes 5/1, and the LCD calculation proceeds normally."
            },
            {
              question: "How do I handle mixed numbers?",
              answer: "Mixed numbers should be converted to improper fractions first. For example, 2 1/3 becomes 7/3, then proceed with the LCD calculation."
            }
          ]}
        />
      )
    }
  ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-is-lcd", title: "What is LCD?" },
    { id: "calculation-process", title: "Calculation Process" },
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
        title="LCD Calculator"
        icon="fas fa-sort-numeric-down"
        description="Find the Least Common Denominator (LCD) of fractions and convert them to equivalent forms with step-by-step solutions and detailed explanations."
        features={[
          "LCD calculation for multiple fractions",
          "Equivalent fraction conversion",
          "Step-by-step solutions",
          "Handles mixed numbers and whole numbers"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="lcd-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-sort-numeric-down"></i>
              LCD Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numbers">Fractions</label>
                  <input
                    type="text"
                    id="numbers"
                    value={formData.numbers}
                    onChange={(e) => handleInputChange('numbers', e.target.value)}
                    placeholder="Enter fractions (e.g., 1/4, 1/6, 1/8)"
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
                  LCD Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="lcd-value">
                      {result.result}
                    </div>
                  </div>
                  
                  <div className="equivalent-fractions-table">
                    <h4>
                      <i className="fas fa-table"></i>
                      Equivalent Fractions
                    </h4>
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th>Original</th>
                          <th>Equivalent Fraction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.equivalentFractions.map((ef, index) => (
                          <tr key={index}>
                            <td>
                              <MathFormula 
                                formula={lcdCalculatorLogic.formatOriginalInputForDisplay(ef.original)} 
                                variant="content" 
                              />
                            </td>
                            <td>
                              <MathFormula 
                                formula={`\\frac{${ef.result.numerator}}{${ef.result.denominator}}`} 
                                variant="content" 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>
                      <i className="fas fa-list-ol"></i>
                      Step-by-Step Solution
                    </h4>
                    <div className="steps-container">
                      {result.steps.map((step, index) => (
                        <div key={index} className="step">
                          {step.includes('\\[') ? (
                            <MathFormula formula={step.replace(/^\\\[(.*)\\\]$/, '$1')} variant="display" />
                          ) : step.includes('\\frac') ? (
                            <MathFormula formula={step} variant="content" />
                          ) : (
                            <span>{step}</span>
                          )}
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

export default LCDCalculator;
