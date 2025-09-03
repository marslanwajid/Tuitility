import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import decimalToFractionCalculatorLogic from '../../assets/js/math/decimal-to-fraction-calculator.js';
import '../../assets/css/math/decimal-to-fraction-calculator.css';

const DecimalToFractionCalculator = () => {
  const [formData, setFormData] = useState(decimalToFractionCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Decimal to Fraction Calculator',
    description: 'Convert any decimal number to its equivalent fraction form with step-by-step solutions, showing original, simplified, and mixed number representations',
    icon: 'fas fa-exchange-alt',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Decimal to Fraction Calculator']
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
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percent' },
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-function' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-are-decimals', title: 'What are Decimals?' },
    { id: 'conversion-process', title: 'How Decimal to Fraction Conversion Works' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'examples', title: 'Examples' },
    { id: 'formulas', title: 'Key Conversion Formulas' },
    { id: 'significance', title: 'Significance' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

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

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Example formulas
          katex.render('0.75 = \\frac{75}{100} = \\frac{3}{4}', document.getElementById('example1-formula'));
          katex.render('0.125 = \\frac{125}{1000} = \\frac{1}{8}', document.getElementById('example2-formula'));
          katex.render('1.5 = \\frac{15}{10} = \\frac{3}{2} = 1\\frac{1}{2}', document.getElementById('example3-formula'));
          
          // Key formulas
          katex.render('0.abc = \\frac{abc}{10^n}', document.getElementById('formula1'));
          katex.render('\\text{where } n = \\text{number of decimal places}', document.getElementById('formula2'));
          katex.render('\\text{GCD}(a, b) = \\text{GCD}(b, a \\bmod b)', document.getElementById('formula3'));
          katex.render('\\text{Mixed number} = \\text{Whole part} + \\frac{\\text{Remainder}}{\\text{Denominator}}', document.getElementById('formula4'));
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
        title="Decimal to Fraction Calculator"
        onCalculate={calculate}
        calculateButtonText="Convert"
        error={error}
        result={null}
      >
        <form onSubmit={handleSubmit} className="calculator-form">
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
            </form>

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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          Converting decimals to fractions is a fundamental mathematical skill that helps us understand 
          the relationship between decimal and fractional representations of numbers.
        </p>
        <p>
          Our Decimal to Fraction Calculator provides instant conversion with step-by-step solutions, 
          showing you exactly how to convert any decimal number to its equivalent fraction form.
        </p>
      </ContentSection>

      <ContentSection id="what-are-decimals" title="What are Decimals?">
        <p>
          Decimals are a way to represent fractions using a base-10 number system, where numbers are 
          written with a decimal point to separate the whole number part from the fractional part.
        </p>
        <ul>
          <li>Decimals use place values based on powers of 10</li>
          <li>Each position after the decimal point represents a fraction with denominator 10^n</li>
          <li>Examples: 0.5 = 5/10 = 1/2, 0.25 = 25/100 = 1/4</li>
          <li>Decimals can be terminating (finite) or repeating (infinite)</li>
        </ul>
      </ContentSection>

      <ContentSection id="conversion-process" title="How Decimal to Fraction Conversion Works">
        <p>The conversion process follows these mathematical principles:</p>
        <div className="math-formula" id="example1-formula"></div>
        <div className="math-formula" id="example2-formula"></div>
        <div className="math-formula" id="example3-formula"></div>
        
        <ol>
          <li>Count the number of decimal places in the decimal number</li>
          <li>Multiply both numerator and denominator by 10^n (where n is the number of decimal places)</li>
          <li>Simplify the resulting fraction by finding the greatest common divisor (GCD)</li>
          <li>Express the final result in proper, improper, or mixed number form</li>
        </ol>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Decimal to Fraction Calculator">
        <p>Using the calculator is straightforward:</p>
        <ul>
          <li><strong>Enter Decimal Number:</strong> Input a decimal number in the input field (e.g., 0.75, 1.25, -0.5)</li>
          <li><strong>Convert:</strong> Click Convert to see the conversion result</li>
          <li><strong>Review Steps:</strong> Examine the step-by-step solution to understand the process</li>
          <li><strong>Reset:</strong> Use Reset to clear the input and start over</li>
          <li><strong>Multiple Forms:</strong> The calculator shows original, simplified, and mixed number forms</li>
        </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h4><strong>Example 1: Simple Decimal</strong></h4>
          <p><strong>Problem:</strong> Convert 0.75 to fraction</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Count decimal places: 2</p>
            <p><strong>Step 2:</strong> Multiply by 10²: 0.75 × 100 = 75</p>
            <p><strong>Step 3:</strong> Initial fraction: 75/100</p>
            <p><strong>Step 4:</strong> Find GCD(75, 100) = 25</p>
            <p><strong>Step 5:</strong> Simplify: 75÷25 / 100÷25 = 3/4</p>
            <p><strong>Result:</strong> 0.75 = 3/4</p>
          </div>
        </div>

        <div className="example-section">
          <h4><strong>Example 2: Mixed Number</strong></h4>
          <p><strong>Problem:</strong> Convert 1.25 to fraction</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Count decimal places: 2</p>
            <p><strong>Step 2:</strong> Multiply by 10²: 1.25 × 100 = 125</p>
            <p><strong>Step 3:</strong> Initial fraction: 125/100</p>
            <p><strong>Step 4:</strong> Find GCD(125, 100) = 25</p>
            <p><strong>Step 5:</strong> Simplify: 125÷25 / 100÷25 = 5/4</p>
            <p><strong>Step 6:</strong> Convert to mixed: 5/4 = 1¼</p>
            <p><strong>Result:</strong> 1.25 = 1¼</p>
          </div>
        </div>

        <div className="example-section">
          <h4><strong>Example 3: Negative Decimal</strong></h4>
          <p><strong>Problem:</strong> Convert -0.5 to fraction</p>
          <div className="example-solution">
            <p><strong>Step 1:</strong> Handle negative sign: -0.5</p>
            <p><strong>Step 2:</strong> Count decimal places: 1</p>
            <p><strong>Step 3:</strong> Multiply by 10¹: 0.5 × 10 = 5</p>
            <p><strong>Step 4:</strong> Initial fraction: 5/10</p>
            <p><strong>Step 5:</strong> Find GCD(5, 10) = 5</p>
            <p><strong>Step 6:</strong> Simplify: 5÷5 / 10÷5 = 1/2</p>
            <p><strong>Result:</strong> -0.5 = -1/2</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="formulas" title="Key Conversion Formulas">
        <p>The mathematical formulas used in decimal to fraction conversion:</p>
        <div className="math-formula" id="formula1"></div>
        <div className="math-formula" id="formula2"></div>
        <div className="math-formula" id="formula3"></div>
        <div className="math-formula" id="formula4"></div>
        
        <ul>
          <li><strong>Decimal to fraction:</strong> Multiply by 10^n and simplify</li>
          <li><strong>GCD calculation:</strong> Euclidean algorithm</li>
          <li><strong>Mixed number conversion:</strong> Divide numerator by denominator</li>
          <li><strong>Negative numbers:</strong> Apply sign to final result</li>
        </ul>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding decimal to fraction conversion is crucial in mathematics for several reasons:</p>
        <ul>
          <li>Essential for understanding mathematical relationships</li>
          <li>Used in engineering and scientific calculations</li>
          <li>Important for financial and statistical analysis</li>
          <li>Critical for computer programming and algorithms</li>
          <li>Used in everyday measurements and conversions</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> Engineering</h4>
            <p>Engineering calculations and measurements</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Finance</h4>
            <p>Financial calculations and interest rates</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-bar"></i> Statistics</h4>
            <p>Statistical analysis and probability</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-code"></i> Programming</h4>
            <p>Computer programming and algorithms</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Science</h4>
            <p>Scientific research and data analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-ruler"></i> Everyday</h4>
            <p>Everyday measurements and conversions</p>
          </div>
    </div>
      </ContentSection>

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
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default DecimalToFractionCalculator;
