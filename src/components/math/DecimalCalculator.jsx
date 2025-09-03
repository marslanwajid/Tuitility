import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import decimalCalculatorLogic from '../../assets/js/math/decimal-calculator.js';
import '../../assets/css/math/decimal-calculator.css';

const DecimalCalculator = () => {
  const [formData, setFormData] = useState(decimalCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Decimal Calculator',
    description: 'Perform precise arithmetic operations on decimal numbers with step-by-step solutions and customizable rounding options',
    icon: 'fas fa-calculator',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Decimal Calculator']
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
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-calculator' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-fraction' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percent' },
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-function' },
    { name: 'Integral Calculator', url: '/math/calculators/integral-calculator', icon: 'fas fa-integral' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-are-decimals', title: 'What are Decimal Numbers?' },
    { id: 'operations', title: 'Supported Operations' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'examples', title: 'Examples' },
    { id: 'rounding', title: 'Rounding Options' },
    { id: 'significance', title: 'Significance' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleInputChange = (field, value) => {
    if (decimalCalculatorLogic.validateInput(value)) {
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
    const calculationResult = decimalCalculatorLogic.calculate(formData);
    
    if (calculationResult.error) {
      setError(calculationResult.error);
      setResult(null);
    } else {
      setResult(calculationResult.result);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
  };

  const handleReset = () => {
    setFormData(decimalCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Addition formula
          katex.render('a + b', document.getElementById('addition-formula'));
          
          // Subtraction formula
          katex.render('a - b', document.getElementById('subtraction-formula'));
          
          // Multiplication formula
          katex.render('a \\times b', document.getElementById('multiplication-formula'));
          
          // Division formula
          katex.render('\\frac{a}{b}', document.getElementById('division-formula'));

          // Exponentiation formula
          katex.render('a^b', document.getElementById('exponentiation-formula'));

          // Root formula
          katex.render('\\sqrt[b]{a}', document.getElementById('root-formula'));

          // Logarithm formula
          katex.render('\\log_b(a)', document.getElementById('logarithm-formula'));

          // Example 1 formulas
          katex.render('12.5 + 4.2 = 16.7', document.getElementById('example1-formula'));
          katex.render('16.7', document.getElementById('example1-result'));

          // Example 2 formulas
          katex.render('\\frac{22.5}{7} = 3.214285714...', document.getElementById('example2-formula'));
          katex.render('3.214285714... \\approx 3.21', document.getElementById('example2-step2'));
          katex.render('3.21', document.getElementById('example2-result'));

          // Example 3 formulas
          katex.render('2.5^3 = 2.5 \\times 2.5 \\times 2.5', document.getElementById('example3-formula'));
          katex.render('2.5^3 = 15.625', document.getElementById('example3-result'));
        } catch (error) {
          console.log('KaTeX rendering error:', error);
        }
      }
    };

    // Wait for KaTeX to be ready
    const checkKaTeX = () => {
      if (window.katex) {
        renderFormulas();
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
        title="Decimal Calculator"
        onCalculate={calculate}
        calculateButtonText="Calculate"
        error={error}
        result={null}
      >
        <form onSubmit={handleSubmit} className="calculator-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="num1">First Number</label>
                  <input
                    type="text"
                    id="num1"
                    value={formData.num1}
                    onChange={(e) => handleInputChange('num1', e.target.value)}
                    placeholder="Enter first number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="num2">Second Number</label>
                  <input
                    type="text"
                    id="num2"
                    value={formData.num2}
                    onChange={(e) => handleInputChange('num2', e.target.value)}
                    placeholder="Enter second number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="operation">Operation</label>
                  <select
                    id="operation"
                    value={formData.operation}
                    onChange={(e) => handleSelectChange('operation', e.target.value)}
                  >
                    <option value="+">Addition (+)</option>
                    <option value="-">Subtraction (-)</option>
                    <option value="*">Multiplication (×)</option>
                    <option value="/">Division (÷)</option>
                    <option value="^">Exponentiation (^)</option>
                    <option value="root">Root (√)</option>
                    <option value="log">Logarithm (log)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="rounding">Rounding</label>
                  <select
                    id="rounding"
                    value={formData.rounding}
                    onChange={(e) => handleSelectChange('rounding', e.target.value)}
                  >
                    <option value="none">None (Exact)</option>
                    <option value="0.1">0.1 (1 decimal)</option>
                    <option value="0.01">0.01 (2 decimals)</option>
                    <option value="0.001">0.001 (3 decimals)</option>
                    <option value="0.0001">0.0001 (4 decimals)</option>
                    <option value="1">1 (Whole number)</option>
                    <option value="10">10 (Nearest 10)</option>
                    <option value="100">100 (Nearest 100)</option>
                  </select>
                </div>
              </div>
            </form>

            {result && (
          <div className="result-section">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Result:</span>
                      <span className="result-value">{result.decimal}</span>
                    </div>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>Solution Steps</h4>
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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          Decimal numbers are a fundamental part of mathematics and everyday calculations. 
          They represent numbers with fractional parts using a decimal point system.
        </p>
        <p>
          Our Decimal Calculator provides precise arithmetic operations on decimal numbers 
          with step-by-step solutions and customizable rounding options.
        </p>
      </ContentSection>

      <ContentSection id="what-are-decimals" title="What are Decimal Numbers?">
        <p>
          Decimal numbers are a way to represent numbers that are not whole numbers, 
          using a decimal point to separate the whole part from the fractional part.
        </p>
        <ul>
          <li>Decimal numbers use base-10 number system</li>
          <li>Each position after the decimal point represents a power of 1/10</li>
          <li>Examples: 3.14, 2.5, 0.001, 10.75</li>
          <li>Decimals can represent fractions and irrational numbers</li>
        </ul>
      </ContentSection>

      <ContentSection id="operations" title="Supported Operations">
        <p>Our calculator supports the following mathematical operations:</p>
        <div className="operations-grid">
          <div className="operation-item">
            <h4><i className="fas fa-plus"></i> Addition</h4>
            <div className="math-formula" id="addition-formula"></div>
            <p>Add two decimal numbers</p>
          </div>
          
          <div className="operation-item">
            <h4><i className="fas fa-minus"></i> Subtraction</h4>
            <div className="math-formula" id="subtraction-formula"></div>
            <p>Subtract second number from first</p>
          </div>
          
          <div className="operation-item">
            <h4><i className="fas fa-times"></i> Multiplication</h4>
            <div className="math-formula" id="multiplication-formula"></div>
            <p>Multiply two decimal numbers</p>
          </div>
          
          <div className="operation-item">
            <h4><i className="fas fa-divide"></i> Division</h4>
            <div className="math-formula" id="division-formula"></div>
            <p>Divide first number by second</p>
          </div>
          
          <div className="operation-item">
            <h4><i className="fas fa-superscript"></i> Exponentiation</h4>
            <div className="math-formula" id="exponentiation-formula"></div>
            <p>Raise first number to the power of second</p>
          </div>
          
          <div className="operation-item">
            <h4><i className="fas fa-square-root-alt"></i> Root</h4>
            <div className="math-formula" id="root-formula"></div>
            <p>Calculate nth root of a number</p>
          </div>
          
          <div className="operation-item">
            <h4><i className="fas fa-function"></i> Logarithm</h4>
            <div className="math-formula" id="logarithm-formula"></div>
            <p>Calculate logarithm with custom base</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Decimal Calculator">
        <p>Using the calculator is straightforward:</p>
        <ul>
          <li><strong>Enter First Number:</strong> Input your first decimal number in the first input field</li>
          <li><strong>Enter Second Number:</strong> Input your second decimal number in the second input field</li>
          <li><strong>Select Operation:</strong> Choose the operation you want to perform from the dropdown</li>
          <li><strong>Choose Rounding:</strong> Select rounding precision if needed (or select 'none' for exact results)</li>
          <li><strong>Calculate:</strong> Click Calculate to see the result and step-by-step solution</li>
          <li><strong>Reset:</strong> Use Reset to clear all inputs and start over</li>
        </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h4><strong>Example 1: Decimal Addition</strong></h4>
          <p><strong>Problem:</strong> Calculate <div className="content-formula" id="example1-formula"></div></p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Add the numbers: 12.5 + 4.2 = 16.7</p>
            <p><strong>Result:</strong> <div className="content-formula" id="example1-result"></div></p>
            <p><strong>Note:</strong> No rounding needed for this simple addition</p>
          </div>
        </div>

        <div className="example-section">
          <h4><strong>Example 2: Decimal Division with Rounding</strong></h4>
          <p><strong>Problem:</strong> Calculate <div className="content-formula" id="example2-formula"></div> with rounding to 0.01</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Divide: 22.5 ÷ 7 = 3.214285714...</p>
            <p><strong>Step 2:</strong> <div className="content-formula" id="example2-step2"></div></p>
            <p><strong>Final Result:</strong> <div className="content-formula" id="example2-result"></div></p>
          </div>
        </div>

        <div className="example-section">
          <h4><strong>Example 3: Exponentiation</strong></h4>
          <p><strong>Problem:</strong> Calculate <div className="content-formula" id="example3-formula"></div></p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Calculate: 2.5^3 = 2.5 × 2.5 × 2.5</p>
            <p><strong>Result:</strong> <div className="content-formula" id="example3-result"></div></p>
            <p><strong>Note:</strong> This is equivalent to 2.5 × 2.5 × 2.5 = 15.625</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="rounding" title="Rounding Options">
        <p>Our calculator provides several rounding options to meet your precision needs:</p>
        <ul>
          <li><strong>None:</strong> Display exact result without rounding</li>
          <li><strong>0.1:</strong> Round to one decimal place</li>
          <li><strong>0.01:</strong> Round to two decimal places</li>
          <li><strong>0.001:</strong> Round to three decimal places</li>
          <li><strong>0.0001:</strong> Round to four decimal places</li>
          <li><strong>1:</strong> Round to nearest whole number</li>
          <li><strong>10:</strong> Round to nearest ten</li>
          <li><strong>100:</strong> Round to nearest hundred</li>
        </ul>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding decimal calculations is crucial in mathematics for several reasons:</p>
        <ul>
          <li>Essential for financial calculations and accounting</li>
          <li>Used in scientific measurements and research</li>
          <li>Important for engineering and construction</li>
          <li>Critical for statistical analysis and data science</li>
          <li>Used in everyday calculations like shopping and cooking</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Finance</h4>
            <p>Financial calculations and accounting</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Science</h4>
            <p>Scientific research and measurements</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> Engineering</h4>
            <p>Engineering and construction projects</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-bar"></i> Statistics</h4>
            <p>Statistical analysis and data science</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Everyday</h4>
            <p>Everyday calculations and budgeting</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Academic</h4>
            <p>Academic studies and homework</p>
          </div>
    </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between decimal and fraction?",
            answer: "Decimals use a decimal point system (like 3.14) while fractions use a ratio format (like 3/14). Decimals are often easier to work with in calculations and are the standard in most modern applications."
          },
          {
            question: "How accurate are the calculations?",
            answer: "The calculator provides high precision results. You can choose to round to specific decimal places or get exact results. The step-by-step solutions show the exact calculation process."
          },
          {
            question: "Can I use negative decimal numbers?",
            answer: "Yes, you can use negative decimal numbers for all operations. Simply add a minus sign before the number (e.g., -3.14)."
          },
          {
            question: "What happens if I divide by zero?",
            answer: "Division by zero is undefined in mathematics. The calculator will show an error message if you attempt to divide by zero."
          },
          {
            question: "How does rounding work?",
            answer: "Rounding follows standard mathematical rules. For example, rounding to 0.01 means the result will have at most 2 decimal places. The calculator shows both the exact result and the rounded result in the steps."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default DecimalCalculator; 