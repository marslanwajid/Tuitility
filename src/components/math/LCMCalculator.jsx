import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import lcmCalculatorLogic from '../../assets/js/math/lcm-calculator.js';
import '../../assets/css/math/lcm-calculator.css';

const LCMCalculator = () => {
  const [formData, setFormData] = useState(lcmCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'LCM Calculator',
    description: 'Calculate the Least Common Multiple of two or more numbers using multiple methods with step-by-step solutions and detailed explanations.',
    icon: 'fas fa-sort-numeric-up',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'LCM Calculator']
  };

  // Categories for sidebar
  const categories = [
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Utility', url: '/utility', icon: 'fas fa-wrench' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  // Related tools for sidebar
  const relatedTools = [
    { name: 'LCD Calculator', url: '/math/calculators/lcd-calculator', icon: 'fas fa-sort-numeric-down' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Comparing Decimals', url: '/math/calculators/comparing-decimals-calculator', icon: 'fas fa-sort-numeric-up' },
    { name: 'Fraction to Percent', url: '/math/calculators/fraction-to-percent-calculator', icon: 'fas fa-percentage' },
    { name: 'Improper to Mixed', url: '/math/calculators/improper-fraction-to-mixed-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-lcm', title: 'What is LCM?' },
    { id: 'calculation-methods', title: 'Calculation Methods' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'examples', title: 'Examples' },
    { id: 'formulas', title: 'Key Formulas' },
    { id: 'significance', title: 'Significance' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

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

  const calculateLCM = () => {
    const calculationResult = lcmCalculatorLogic.calculate(formData);
    
    if (calculationResult.error) {
      setError(calculationResult.error);
      setResult(null);
    } else {
      setResult(calculationResult);
      setError('');
    }
  };

  const handleReset = () => {
    setFormData(lcmCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Basic LCM formula
          const formula1 = document.getElementById('lcm-formula-1');
          if (formula1) {
            katex.render('\\text{LCM}(a, b) = \\frac{|a \\times b|}{\\text{GCD}(a, b)}', formula1);
          }
          
          const formula2 = document.getElementById('lcm-formula-2');
          if (formula2) {
            katex.render('\\text{LCM}(a, b, c) = \\text{LCM}(\\text{LCM}(a, b), c)', formula2);
          }
          
          const formula3 = document.getElementById('lcm-formula-3');
          if (formula3) {
            katex.render('\\text{LCM}(a, b) \\times \\text{GCD}(a, b) = |a \\times b|', formula3);
          }
          
          const formula4 = document.getElementById('lcm-formula-4');
          if (formula4) {
            katex.render('\\text{LCM} = \\prod_{p \\text{ prime}} p^{\\max(e_p(a), e_p(b))}', formula4);
          }
          
          // Example formulas
          const example1Gcd = document.getElementById('example1-gcd');
          if (example1Gcd) {
            katex.render('\\text{GCD}(12, 18) = 6', example1Gcd);
          }
          
          const example1Formula = document.getElementById('example1-formula');
          if (example1Formula) {
            katex.render('\\text{LCM} = \\frac{12 \\times 18}{6}', example1Formula);
          }
          
          const example1Result = document.getElementById('example1-result');
          if (example1Result) {
            katex.render('\\text{LCM} = \\frac{216}{6} = 36', example1Result);
          }
          
          const example2Factors = document.getElementById('example2-factors');
          if (example2Factors) {
            katex.render('8 = 2^3, 12 = 2^2 \\times 3, 20 = 2^2 \\times 5', example2Factors);
          }
          
          const example2Powers = document.getElementById('example2-powers');
          if (example2Powers) {
            katex.render('2^3, 3^1, 5^1', example2Powers);
          }
          
          const example2Result = document.getElementById('example2-result');
          if (example2Result) {
            katex.render('2^3 \\times 3 \\times 5 = 8 \\times 3 \\times 5 = 120', example2Result);
          }
          
          const example3Multiples1 = document.getElementById('example3-multiples1');
          if (example3Multiples1) {
            katex.render('6, 12, 18, 24, 30, \\ldots', example3Multiples1);
          }
          
          const example3Multiples2 = document.getElementById('example3-multiples2');
          if (example3Multiples2) {
            katex.render('8, 16, 24, 32, 40, \\ldots', example3Multiples2);
          }
        } catch (error) {
          console.log('KaTeX rendering error:', error);
        }
      }
    };

    // Wait for KaTeX to be ready and DOM to be fully rendered
    const checkKaTeX = () => {
      if (window.katex) {
        // Add a small delay to ensure DOM elements are ready
        setTimeout(renderFormulas, 100);
      } else {
        setTimeout(checkKaTeX, 100);
      }
    };

    const timer = setTimeout(checkKaTeX, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="LCM Calculator"
        onCalculate={calculateLCM}
        calculateButtonText="Calculate LCM"
        error={error}
        result={null}
      >
        <div className="calculator-form">
              <div className="form-row">
                <div className="form-group">
              <label htmlFor="numbers" className="input-label">Numbers (comma-separated)</label>
                  <input
                    type="text"
                    id="numbers"
                className="input-field"
                    value={formData.numbers}
                    onChange={(e) => handleInputChange('numbers', e.target.value)}
                    placeholder="Enter numbers (e.g., 12, 18, 24)"
                  />
              <small className="input-help">
                Enter two or more positive integers separated by commas
              </small>
                </div>
                <div className="form-group">
              <label htmlFor="method" className="input-label">Calculation Method</label>
                  <select
                    id="method"
                className="input-field"
                    value={formData.method}
                    onChange={(e) => handleSelectChange('method', e.target.value)}
                  >
                    {lcmCalculatorLogic.getMethods().map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
              <small className="input-help">
                Choose your preferred calculation method
              </small>
                </div>
              </div>

          <div className="calculator-actions">
                <button type="button" className="btn-reset" onClick={handleReset}>
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              </div>
              </div>

        {/* Custom Results Section */}
            {result && (
          <div className="result-section lcm-calculator-result">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  LCM Result
                </h3>
            <div className="result-content">
              <div className="result-main">
                <div className="result-item">
                  <strong>Least Common Multiple:</strong>
                      <span className="result-value">{result.result}</span>
                    </div>
                  </div>
                  
              <div className="result-steps">
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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Least Common Multiple (LCM) is the smallest positive integer that is divisible by each of the given numbers without leaving a remainder.
        </p>
        <p>
          Our LCM Calculator provides multiple calculation methods with step-by-step solutions, helping you understand the process and choose the most efficient approach for your specific problem.
        </p>
      </ContentSection>

      <ContentSection id="what-is-lcm" title="What is LCM?">
        <p>
          The Least Common Multiple (LCM) of two or more numbers is the smallest number that is a multiple of each of the given numbers.
        </p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span>LCM is always greater than or equal to the largest number in the set</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>LCM is used to find common denominators for fractions</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>LCM helps solve problems involving periodic events</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>LCM is essential in algebra and number theory</span>
          </li>
        </ul>
        <div className="formula-section">
          <h3>Mathematical Definition</h3>
          <div className="math-formula" id="lcm-formula-1"></div>
          <div className="math-formula" id="lcm-formula-2"></div>
        </div>
      </ContentSection>

      <ContentSection id="calculation-methods" title="Calculation Methods">
        <p>
          Our calculator provides multiple methods to find the LCM, each with its own advantages:
        </p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Direct Method:</strong> Using the LCM formula with GCD</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Listing Multiples:</strong> Finding common multiples by listing</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Prime Factorization:</strong> Using prime factor decomposition</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>GCF Method:</strong> Using the relationship between LCM and GCF</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Cake/Ladder Method:</strong> Visual division approach</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Division Method:</strong> Systematic division by primes</span>
          </li>
        </ul>
        <div className="formula-section">
          <h3>Key Relationships</h3>
          <div className="math-formula" id="lcm-formula-3"></div>
          <div className="math-formula" id="lcm-formula-4"></div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use LCM Calculator">
        <p>Using the LCM calculator is straightforward:</p>
        <ul className="usage-steps">
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Enter Numbers:</strong> Input two or more numbers separated by commas (e.g., 12, 18, 24)</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Select Method:</strong> Choose your preferred calculation method from the dropdown</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Calculate:</strong> Click "Calculate LCM" to see the result and detailed step-by-step solution</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Reset:</strong> Use Reset to clear all inputs and start over</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Review Steps:</strong> Review the solution steps to understand the chosen method</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Direct Method</h3>
          <p><strong>Problem:</strong> Find LCM of 12 and 18</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Find GCD: <div className="content-formula" id="example1-gcd"></div></p>
            <p><strong>Step 2:</strong> Use formula: <div className="content-formula" id="example1-formula"></div></p>
            <p><strong>Step 3:</strong> Calculate: <div className="content-formula" id="example1-result"></div></p>
            <p><strong>Result:</strong> LCM(12, 18) = 36</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Prime Factorization</h3>
          <p><strong>Problem:</strong> Find LCM of 8, 12, and 20</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Prime factors: <div className="content-formula" id="example2-factors"></div></p>
            <p><strong>Step 2:</strong> Highest powers: <div className="content-formula" id="example2-powers"></div></p>
            <p><strong>Step 3:</strong> LCM: <div className="content-formula" id="example2-result"></div></p>
            <p><strong>Result:</strong> LCM(8, 12, 20) = 120</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Listing Multiples</h3>
          <p><strong>Problem:</strong> Find LCM of 6 and 8</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Multiples of 6: <div className="content-formula" id="example3-multiples1"></div></p>
            <p><strong>Step 2:</strong> Multiples of 8: <div className="content-formula" id="example3-multiples2"></div></p>
            <p><strong>Step 3:</strong> First common multiple: 24</p>
            <p><strong>Result:</strong> LCM(6, 8) = 24</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="formulas" title="Key LCM Formulas">
        <p>The fundamental formulas for LCM calculations:</p>
        <ul>
          <li><strong>Basic formula:</strong> LCM(a, b) = |a × b| / GCD(a, b)</li>
          <li><strong>Multiple numbers:</strong> LCM(a, b, c) = LCM(LCM(a, b), c)</li>
          <li><strong>Prime factorization:</strong> LCM = product of highest powers</li>
          <li><strong>Relationship with GCD:</strong> LCM(a, b) × GCD(a, b) = |a × b|</li>
        </ul>
        <div className="formula-section">
          <h3>Mathematical Formulas</h3>
          <div className="math-formula" id="lcm-formula-1">LCM(a, b) = |a × b| / GCD(a, b)</div>
          <div className="math-formula" id="lcm-formula-2">LCM(a, b, c) = LCM(LCM(a, b), c)</div>
          <div className="math-formula" id="lcm-formula-3">LCM(a, b) × GCD(a, b) = |a × b|</div>
        
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding LCM is crucial in mathematics for several reasons:</p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span>Essential for finding common denominators in fractions</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Used in solving systems of linear equations</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Important for periodic event calculations</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Critical in computer science and algorithms</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span>Used in engineering and scientific calculations</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-divide"></i>Fraction Arithmetic</h4>
            <p>Finding common denominators for adding and subtracting fractions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-clock"></i>Scheduling Problems</h4>
            <p>Determining when events will coincide or repeat</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-code"></i>Computer Science</h4>
            <p>Algorithm optimization and data structure design</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i>Engineering</h4>
            <p>Precise calculations in various engineering fields</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i>Scientific Research</h4>
            <p>Data analysis and experimental design</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-lightbulb"></i>Everyday Problem Solving</h4>
            <p>Practical applications in daily life situations</p>
          </div>
    </div>
      </ContentSection>

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
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default LCMCalculator;
