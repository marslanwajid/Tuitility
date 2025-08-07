import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import lcmCalculatorLogic from '../../assets/js/math/lcm-calculator.js';
import '../../assets/css/math/lcm-calculator.css';

const LCMCalculator = () => {
  const [formData, setFormData] = useState(lcmCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (lcmCalculatorLogic.validateInput(value) || value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculate = () => {
    const calculationResult = lcmCalculatorLogic.calculate(formData);
    
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
    setFormData(lcmCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Content sections for the LCM Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "The Least Common Multiple (LCM) is the smallest positive integer that is divisible by each of the given numbers without leaving a remainder.",
        "Our LCM Calculator provides multiple calculation methods with step-by-step solutions, helping you understand the process and choose the most efficient approach for your specific problem."
      ]
    },
    {
      id: "what-is-lcm",
      title: "What is LCM?",
      intro: [
        "The Least Common Multiple (LCM) of two or more numbers is the smallest number that is a multiple of each of the given numbers."
      ],
      list: [
        "LCM is always greater than or equal to the largest number in the set",
        "LCM is used to find common denominators for fractions",
        "LCM helps solve problems involving periodic events",
        "LCM is essential in algebra and number theory"
      ],
      content: (
        <div>
          <p>Mathematical definition:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="\text{LCM}(a, b) = \frac{|a \times b|}{\text{GCD}(a, b)}" variant="content" />
            <MathFormula formula="\text{LCM}(a, b, c) = \text{LCM}(\text{LCM}(a, b), c)" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "calculation-methods",
      title: "Calculation Methods",
      list: [
        "Direct Method: Using the LCM formula with GCD",
        "Listing Multiples: Finding common multiples by listing",
        "Prime Factorization: Using prime factor decomposition",
        "GCF Method: Using the relationship between LCM and GCF",
        "Cake/Ladder Method: Visual division approach",
        "Division Method: Systematic division by primes"
      ],
      content: (
        <div>
          <p>Each method has its advantages:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="\text{LCM}(a, b) = \frac{a \times b}{\text{GCD}(a, b)}" variant="content" />
            <MathFormula formula="\text{LCM} = \text{Product of highest powers of all prime factors}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use LCM Calculator",
      steps: [
        "Enter two or more numbers separated by commas (e.g., 12, 18, 24)",
        "Select your preferred calculation method from the dropdown",
        "Click Calculate to see the result and detailed step-by-step solution",
        "Use Reset to clear all inputs and start over",
        "Review the solution steps to understand the chosen method"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Direct Method",
          description: "Find LCM of 12 and 18",
          solution: [
            { label: "Step 1", content: "Find GCD(12, 18) = 6" },
            { label: "Step 2", content: "Use formula: LCM = (12 × 18) ÷ 6" },
            { label: "Step 3", content: "LCM = 216 ÷ 6 = 36" },
            { label: "Result", content: "LCM(12, 18) = 36" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCM of 12 and 18</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Find GCD: <MathFormula formula="\text{GCD}(12, 18) = 6" variant="content" /></li>
                  <li>Use formula: <MathFormula formula="\text{LCM} = \frac{12 \times 18}{6}" variant="content" /></li>
                  <li>Calculate: <MathFormula formula="\text{LCM} = \frac{216}{6} = 36" variant="content" /></li>
                  <li>Result: <MathFormula formula="\text{LCM}(12, 18) = 36" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Prime Factorization",
          description: "Find LCM of 8, 12, and 20",
          solution: [
            { label: "Step 1", content: "Prime factors: 8 = 2³, 12 = 2² × 3, 20 = 2² × 5" },
            { label: "Step 2", content: "Highest powers: 2³, 3¹, 5¹" },
            { label: "Step 3", content: "LCM = 2³ × 3 × 5 = 8 × 3 × 5 = 120" },
            { label: "Result", content: "LCM(8, 12, 20) = 120" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCM of 8, 12, and 20</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Prime factors: <MathFormula formula="8 = 2^3, 12 = 2^2 \times 3, 20 = 2^2 \times 5" variant="content" /></li>
                  <li>Highest powers: <MathFormula formula="2^3, 3^1, 5^1" variant="content" /></li>
                  <li>LCM: <MathFormula formula="2^3 \times 3 \times 5 = 8 \times 3 \times 5 = 120" variant="content" /></li>
                  <li>Result: <MathFormula formula="\text{LCM}(8, 12, 20) = 120" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Listing Multiples",
          description: "Find LCM of 6 and 8",
          solution: [
            { label: "Step 1", content: "Multiples of 6: 6, 12, 18, 24, 30, ..." },
            { label: "Step 2", content: "Multiples of 8: 8, 16, 24, 32, 40, ..." },
            { label: "Step 3", content: "First common multiple: 24" },
            { label: "Result", content: "LCM(6, 8) = 24" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCM of 6 and 8</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Multiples of 6: <MathFormula formula="6, 12, 18, 24, 30, \ldots" variant="content" /></li>
                  <li>Multiples of 8: <MathFormula formula="8, 16, 24, 32, 40, \ldots" variant="content" /></li>
                  <li>First common multiple: <MathFormula formula="24" variant="content" /></li>
                  <li>Result: <MathFormula formula="\text{LCM}(6, 8) = 24" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "formulas",
      title: "Key LCM Formulas",
      list: [
        "Basic formula: LCM(a, b) = |a × b| / GCD(a, b)",
        "Multiple numbers: LCM(a, b, c) = LCM(LCM(a, b), c)",
        "Prime factorization: LCM = product of highest powers",
        "Relationship with GCD: LCM(a, b) × GCD(a, b) = |a × b|"
      ],
      content: (
        <div>
          <p>The fundamental formulas for LCM calculations:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="\text{LCM}(a, b) = \frac{|a \times b|}{\text{GCD}(a, b)}" variant="content" />
            <MathFormula formula="\text{LCM}(a, b, c) = \text{LCM}(\text{LCM}(a, b), c)" variant="content" />
            <MathFormula formula="\text{LCM}(a, b) \times \text{GCD}(a, b) = |a \times b|" variant="content" />
            <MathFormula formula="\text{LCM} = \prod_{p \text{ prime}} p^{\max(e_p(a), e_p(b))}" variant="content" />
          </div>
        </div>
      )
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for finding common denominators in fractions",
        "Used in solving systems of linear equations",
        "Important for periodic event calculations",
        "Critical in computer science and algorithms",
        "Used in engineering and scientific calculations"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Fraction arithmetic and algebra",
        "Scheduling and timing problems",
        "Computer science algorithms",
        "Engineering calculations",
        "Scientific research and data analysis",
        "Everyday problem solving"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
        <FAQSection 
          faqs={[
            {
              question: "What is the difference between LCM and GCD?",
              answer: "LCM (Least Common Multiple) is the smallest number that is a multiple of all given numbers, while GCD (Greatest Common Divisor) is the largest number that divides all given numbers without remainder. They are related by the formula: LCM(a, b) × GCD(a, b) = |a × b|."
            },
            {
              question: "Can LCM be smaller than the largest number?",
              answer: "No, the LCM is always greater than or equal to the largest number in the set. This is because the LCM must be divisible by the largest number, so it must be at least as large as that number."
            },
            {
              question: "Which method is the most efficient for finding LCM?",
              answer: "The efficiency depends on the numbers involved. For small numbers, the direct method using GCD is usually fastest. For larger numbers, prime factorization can be more efficient. The listing method is least efficient for large numbers."
            },
            {
              question: "How do I find LCM of more than two numbers?",
              answer: "For multiple numbers, you can use the formula: LCM(a, b, c) = LCM(LCM(a, b), c). This means finding the LCM of the first two numbers, then finding the LCM of that result with the third number, and so on."
            },
            {
              question: "What is the relationship between LCM and fractions?",
              answer: "LCM is used to find the least common denominator when adding or subtracting fractions. The LCM of the denominators becomes the common denominator, allowing you to combine the fractions."
            }
          ]}
        />
      )
    }
  ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-is-lcm", title: "What is LCM?" },
    { id: "calculation-methods", title: "Calculation Methods" },
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
        title="LCM Calculator"
        icon="fas fa-sort-numeric-up"
        description="Calculate the Least Common Multiple of two or more numbers using multiple methods with step-by-step solutions and detailed explanations."
        features={[
          "Multiple calculation methods",
          "Step-by-step solutions",
          "Handles multiple numbers",
          "Visual table methods"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="lcm-calculator">
            <h2 className="calculator-title">
              <i className="fas fa-sort-numeric-up"></i>
              LCM Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numbers">Numbers (comma-separated)</label>
                  <input
                    type="text"
                    id="numbers"
                    value={formData.numbers}
                    onChange={(e) => handleInputChange('numbers', e.target.value)}
                    placeholder="Enter numbers (e.g., 12, 18, 24)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="method">Calculation Method</label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => handleSelectChange('method', e.target.value)}
                  >
                    {lcmCalculatorLogic.getMethods().map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-calculate">
                  <i className="fas fa-calculator"></i>
                  Calculate LCM
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
                  LCM Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">LCM:</span>
                      <span className="result-value">{result.result}</span>
                    </div>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>
                      <i className="fas fa-list-ol"></i>
                      Solution Steps
                    </h4>
                    <div className="steps-container">
                      {result.steps.map((step, index) => (
                        <div key={index} className="step">
                          {step}
                        </div>
                      ))}
                    </div>
                    
                    {result.tableSteps && result.tableSteps.length > 0 && (
                      <div className="table-container">
                        <h5>Calculation Table:</h5>
                        <div className="calculation-table">
                          {result.tableSteps.map((row, rowIndex) => (
                            <div key={rowIndex} className="table-row">
                              {row.map((cell, cellIndex) => (
                                <div key={cellIndex} className="table-cell">
                                  {cell}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

export default LCMCalculator;
