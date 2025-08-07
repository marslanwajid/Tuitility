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
    if (lcmCalculatorLogic.validateInput(value)) {
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
        "The Least Common Multiple (LCM) is the smallest positive integer that is divisible by two or more given numbers without leaving a remainder.",
        "Our LCM Calculator provides multiple calculation methods with step-by-step solutions, helping you understand how to find the LCM of any set of numbers."
      ]
    },
    {
      id: "what-is-lcm",
      title: "What is LCM?",
      intro: [
        "The Least Common Multiple (LCM) of two or more numbers is the smallest number that is a multiple of each of the given numbers."
      ],
      list: [
        "LCM is the smallest common multiple of given numbers",
        "It's used to find common denominators in fractions",
        "Essential for solving problems involving periodic events",
        "Used in scheduling, timing, and synchronization problems",
        "Important in algebra and number theory"
      ]
    },
    {
      id: "calculation-methods",
      title: "Calculation Methods",
      list: [
        "Direct Method: Using LCM formula with GCD",
        "Listing Multiples: Finding common multiples",
        "Prime Factorization: Using prime factors",
        "GCF Method: Using greatest common factor",
        "Cake/Ladder Method: Visual factorization",
        "Division Method: Systematic division approach"
      ],
      content: (
        <div>
          <p>Our calculator supports multiple methods for finding LCM:</p>
          <div style={{ marginTop: '1rem' }}>
            <MathFormula formula="LCM(a,b) = \frac{|a \times b|}{GCD(a,b)}" variant="content" />
            <MathFormula formula="LCM(a,b,c) = LCM(LCM(a,b), c)" variant="content" />
            <MathFormula formula="LCM = \text{Product of highest powers of all prime factors}" variant="content" />
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
        "Review the solution to understand the calculation process",
        "Use Reset to clear all inputs and start over"
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
                  <li>Find GCD: <MathFormula formula="GCD(12, 18) = 6" variant="content" /></li>
                  <li>Use formula: <MathFormula formula="LCM = \frac{12 \times 18}{6}" variant="content" /></li>
                  <li>Calculate: <MathFormula formula="LCM = \frac{216}{6} = 36" variant="content" /></li>
                  <li>Result: <MathFormula formula="LCM(12, 18) = 36" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 2: Prime Factorization",
          description: "Find LCM of 12, 18, and 24 using prime factorization",
          solution: [
            { label: "Step 1", content: "Prime factors of 12 = 2² × 3" },
            { label: "Step 2", content: "Prime factors of 18 = 2 × 3²" },
            { label: "Step 3", content: "Prime factors of 24 = 2³ × 3" },
            { label: "Step 4", content: "Highest powers: 2³ × 3² = 8 × 9 = 72" },
            { label: "Result", content: "LCM(12, 18, 24) = 72" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCM of 12, 18, and 24 using prime factorization</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Prime factors of 12: <MathFormula formula="12 = 2^2 \times 3" variant="content" /></li>
                  <li>Prime factors of 18: <MathFormula formula="18 = 2 \times 3^2" variant="content" /></li>
                  <li>Prime factors of 24: <MathFormula formula="24 = 2^3 \times 3" variant="content" /></li>
                  <li>Highest powers: <MathFormula formula="2^3 \times 3^2 = 8 \times 9 = 72" variant="content" /></li>
                  <li>Result: <MathFormula formula="LCM(12, 18, 24) = 72" variant="result" /></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: "Example 3: Listing Multiples",
          description: "Find LCM of 8 and 12 by listing multiples",
          solution: [
            { label: "Step 1", content: "Multiples of 8: 8, 16, 24, 32, 40, ..." },
            { label: "Step 2", content: "Multiples of 12: 12, 24, 36, 48, ..." },
            { label: "Step 3", content: "First common multiple: 24" },
            { label: "Result", content: "LCM(8, 12) = 24" }
          ],
          content: (
            <div>
              <p><strong>Problem:</strong> Find LCM of 8 and 12 by listing multiples</p>
              <div className="solution-steps">
                <h4>Solution:</h4>
                <ol>
                  <li>Multiples of 8: <MathFormula formula="8, 16, 24, 32, 40, \ldots" variant="content" /></li>
                  <li>Multiples of 12: <MathFormula formula="12, 24, 36, 48, \ldots" variant="content" /></li>
                  <li>First common multiple: <MathFormula formula="24" variant="content" /></li>
                  <li>Result: <MathFormula formula="LCM(8, 12) = 24" variant="result" /></li>
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
        "Basic formula: LCM(a,b) = |a × b| / GCD(a,b)",
        "Multiple numbers: LCM(a,b,c) = LCM(LCM(a,b), c)",
        "Prime factorization: LCM = Product of highest powers",
        "Relationship with GCD: LCM(a,b) × GCD(a,b) = |a × b|",
        "For coprime numbers: LCM(a,b) = a × b"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for finding common denominators in fractions",
        "Used in scheduling and timing problems",
        "Important in algebra and number theory",
        "Critical for solving periodic event problems",
        "Used in engineering and scientific calculations"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Fraction arithmetic and common denominators",
        "Scheduling problems and time synchronization",
        "Periodic event calculations",
        "Algebraic problem solving",
        "Engineering and technical calculations",
        "Computer science and algorithm design"
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
              answer: "LCM (Least Common Multiple) is the smallest number that is a multiple of given numbers, while GCD (Greatest Common Divisor) is the largest number that divides given numbers without remainder. They are related by the formula: LCM(a,b) × GCD(a,b) = |a × b|."
            },
            {
              question: "Can LCM be calculated for more than two numbers?",
              answer: "Yes, LCM can be calculated for any number of integers. For multiple numbers, you can use the formula: LCM(a,b,c) = LCM(LCM(a,b), c), or use prime factorization to find the product of the highest powers of all prime factors."
            },
            {
              question: "What is the relationship between LCM and fractions?",
              answer: "LCM is used to find the least common denominator (LCD) when adding or subtracting fractions with different denominators. The LCD is the LCM of the denominators, which allows you to convert fractions to equivalent forms with the same denominator."
            },
            {
              question: "How do I find LCM using prime factorization?",
              answer: "To find LCM using prime factorization: 1) Find the prime factors of each number, 2) Take the highest power of each prime factor that appears in any of the numbers, 3) Multiply these highest powers together to get the LCM."
            },
            {
              question: "What is the LCM of coprime numbers?",
              answer: "For coprime numbers (numbers with GCD = 1), the LCM is simply the product of the numbers. For example, if GCD(a,b) = 1, then LCM(a,b) = a × b."
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
        description="Calculate the Least Common Multiple (LCM) of two or more numbers using multiple methods with step-by-step solutions and detailed explanations."
        features={[
          "Multiple calculation methods",
          "Step-by-step solutions",
          "Handles any number of inputs",
          "Prime factorization support"
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
                  <label htmlFor="numbers">Numbers</label>
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
                    {lcmCalculatorLogic.calculationMethods.map(method => (
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
                  LCM Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="lcm-value">
                      {result.result}
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

export default LCMCalculator;
