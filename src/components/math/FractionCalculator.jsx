import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/fraction-calculator.css';

const FractionCalculator = () => {
  const [activeTab, setActiveTab] = useState('2-fractions');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Fraction Calculator',
    description: 'Add, subtract, multiply, and divide fractions with step-by-step solutions. Perfect for students, teachers, and anyone working with fractions.',
    icon: 'fas fa-divide',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Fraction Calculator']
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
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percent' },
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-function' },
    { name: 'Decimal to Fraction', url: '/math/calculators/decimal-to-fraction-calculator', icon: 'fas fa-exchange-alt' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-fraction', title: 'What is a Fraction Calculator?' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'how-to-use', title: 'How to Use Fraction Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Calculator state
  const [fractions, setFractions] = useState({
    '2-fractions': [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 }
    ],
    '3-fractions': [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 8 }
    ],
    '4-fractions': [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 8 },
      { numerator: 1, denominator: 16 }
    ]
  });

  const [operators, setOperators] = useState({
    '2-fractions': ['+'],
    '3-fractions': ['+', '+'],
    '4-fractions': ['+', '+', '+']
  });

  // Utility functions
  const getGCD = (a, b) => {
    let num1 = Math.abs(a);
    let num2 = Math.abs(b);
    while (num2 !== 0) {
      let temp = num2;
      num2 = num1 % num2;
      num1 = temp;
    }
    return num1;
  };

  const simplifyFraction = (numerator, denominator) => {
    if (denominator === 0) {
      throw new Error('Division by zero');
    }
    
    const gcd = getGCD(numerator, denominator);
    const simplifiedNum = numerator / gcd;
    const simplifiedDen = denominator / gcd;
    
    if (simplifiedDen < 0) {
      return { numerator: -simplifiedNum, denominator: -simplifiedDen };
    }
    
    return { numerator: simplifiedNum, denominator: simplifiedDen };
  };

  const fractionToString = (fraction) => {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString();
    }
    return `${fraction.numerator}/${fraction.denominator}`;
  };

  const fractionToMixedNumber = (fraction) => {
    const absNumerator = Math.abs(fraction.numerator);
    const whole = Math.floor(absNumerator / fraction.denominator);
    const numerator = absNumerator % fraction.denominator;
    const sign = fraction.numerator < 0 ? '-' : '';
    
    if (whole === 0) {
      return fractionToString(fraction);
    } else if (numerator === 0) {
      return `${sign}${whole}`;
    } else {
      return `${sign}${whole} ${numerator}/${fraction.denominator}`;
    }
  };

  // Arithmetic operations
  const addFractions = (f1, f2) => {
    const numerator = f1.numerator * f2.denominator + f2.numerator * f1.denominator;
    const denominator = f1.denominator * f2.denominator;
    return simplifyFraction(numerator, denominator);
  };

  const subtractFractions = (f1, f2) => {
    const numerator = f1.numerator * f2.denominator - f2.numerator * f1.denominator;
    const denominator = f1.denominator * f2.denominator;
    return simplifyFraction(numerator, denominator);
  };

  const multiplyFractions = (f1, f2) => {
    const numerator = f1.numerator * f2.numerator;
    const denominator = f1.denominator * f2.denominator;
    return simplifyFraction(numerator, denominator);
  };

  const divideFractions = (f1, f2) => {
    if (f2.numerator === 0) {
      throw new Error('Division by zero');
    }
    const numerator = f1.numerator * f2.denominator;
    const denominator = f1.denominator * f2.numerator;
    return simplifyFraction(numerator, denominator);
  };

  const calculateResult = () => {
    try {
      const currentFractions = fractions[activeTab];
      const currentOperators = operators[activeTab];
      
      if (!currentFractions || currentFractions.length === 0) {
        throw new Error('No fractions provided');
      }

      let result = currentFractions[0];
      let steps = [`Start with: ${fractionToString(result)}`];
      
      for (let i = 0; i < currentOperators.length && i < currentFractions.length - 1; i++) {
        const nextFraction = currentFractions[i + 1];
        const operator = currentOperators[i];
        
        steps.push(`\n${fractionToString(result)} ${operator} ${fractionToString(nextFraction)}`);
        
        switch (operator) {
          case '+':
            result = addFractions(result, nextFraction);
            break;
          case '-':
            result = subtractFractions(result, nextFraction);
            break;
          case '*':
            result = multiplyFractions(result, nextFraction);
            break;
          case '/':
            result = divideFractions(result, nextFraction);
            break;
          default:
            throw new Error(`Unknown operator: ${operator}`);
        }
        
        steps.push(`= ${fractionToString(result)}`);
      }
      
      const decimal = formatDecimal(result.numerator / result.denominator);
      const mixedNumber = fractionToMixedNumber(result);
      
      steps.push(`\nDecimal: ${decimal}`);
      if (mixedNumber !== fractionToString(result)) {
        steps.push(`Mixed number: ${mixedNumber}`);
      }
      
      setResult({
        fraction: fractionToString(result),
        decimal: decimal,
        mixedNumber: mixedNumber,
        steps: steps
      });
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const formatDecimal = (number) => {
    if (!isFinite(number)) {
      return 'Undefined';
    }
    
    let str = number.toFixed(6);
    str = str.replace(/\.?0+$/, "");
    return str;
  };

  const handleFractionChange = (index, field, value) => {
    const newFractions = { ...fractions };
    newFractions[activeTab][index][field] = parseInt(value) || 0;
    setFractions(newFractions);
  };

  const handleOperatorChange = (index, operator) => {
    const newOperators = { ...operators };
    newOperators[activeTab][index] = operator;
    setOperators(newOperators);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setResult(null);
    setError('');
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    calculateResult();
  };

  const handleReset = () => {
    setFractions({
      '2-fractions': [
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 }
      ],
      '3-fractions': [
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 8 }
      ],
      '4-fractions': [
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 8 },
        { numerator: 1, denominator: 16 }
      ]
    });
    setOperators({
      '2-fractions': ['+'],
      '3-fractions': ['+', '+'],
      '4-fractions': ['+', '+', '+']
    });
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Addition formula
          katex.render('\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}', 
            document.getElementById('addition-formula'));
          
          // Subtraction formula
          katex.render('\\frac{a}{b} - \\frac{c}{d} = \\frac{ad - bc}{bd}', 
            document.getElementById('subtraction-formula'));
          
          // Multiplication formula
          katex.render('\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}', 
            document.getElementById('multiplication-formula'));
          
          // Division formula
          katex.render('\\frac{a}{b} \\div \\frac{c}{d} = \\frac{ad}{bc}', 
            document.getElementById('division-formula'));

          // Example 1 formulas
          katex.render('\\frac{1}{2} + \\frac{1}{4}', 
            document.getElementById('example1-formula'));
          katex.render('\\frac{1}{2} = \\frac{2}{4}, \\frac{1}{4} = \\frac{1}{4}', 
            document.getElementById('example1-step2'));
          katex.render('\\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}', 
            document.getElementById('example1-step3'));
          katex.render('\\frac{3}{4} = 0.75', 
            document.getElementById('example1-result'));

          // Example 2 formulas
          katex.render('\\frac{2}{3} \\times \\frac{3}{4}', 
            document.getElementById('example2-formula'));
          katex.render('\\frac{6}{12} = \\frac{1}{2}', 
            document.getElementById('example2-step3'));
          katex.render('\\frac{1}{2} = 0.5', 
            document.getElementById('example2-result'));
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

  // Render KaTeX formulas when results change
  useEffect(() => {
    const renderResultFormulas = () => {
      if (window.katex && result) {
        try {
          // Convert fraction string to LaTeX format
          const fractionToLatex = (fractionStr) => {
            // Handle mixed numbers like "1 3/4"
            if (fractionStr.includes(' ')) {
              const parts = fractionStr.split(' ');
              const whole = parts[0];
              const fraction = parts[1];
              const [num, den] = fraction.split('/');
              return `${whole}\\frac{${num}}{${den}}`;
            }
            // Handle simple fractions like "3/4"
            else if (fractionStr.includes('/')) {
              const [num, den] = fractionStr.split('/');
              return `\\frac{${num}}{${den}}`;
            }
            // Handle whole numbers
            else {
              return fractionStr;
            }
          };

          // Render result formula
          const resultElement = document.getElementById('result-formula');
          if (resultElement) {
            const latexFormula = fractionToLatex(result.fraction);
            katex.render(latexFormula, resultElement);
          }
        } catch (error) {
          console.log('KaTeX result rendering error:', error);
        }
      }
    };

    const timer = setTimeout(renderResultFormulas, 100);
    return () => clearTimeout(timer);
  }, [result]);

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Fraction Calculator"
        onCalculate={calculateResult}
        calculateButtonText="Calculate"
        error={error}
        result={null}
      >
                  <div className="calculator-tabs">
                    <button 
                      className={`tab-button ${activeTab === '2-fractions' ? 'active' : ''}`}
                      onClick={() => handleTabChange('2-fractions')}
                    >
                      2 Fractions
                    </button>
                    <button 
                      className={`tab-button ${activeTab === '3-fractions' ? 'active' : ''}`}
                      onClick={() => handleTabChange('3-fractions')}
                    >
                      3 Fractions
                    </button>
                    <button 
                      className={`tab-button ${activeTab === '4-fractions' ? 'active' : ''}`}
                      onClick={() => handleTabChange('4-fractions')}
                    >
                      4 Fractions
                    </button>
                  </div>

                  <form onSubmit={handleCalculate} className="calculator-form">
                    <div className="fractions-container">
                      {fractions[activeTab].map((fraction, index) => (
                        <div key={index} className="fraction-group">
                          <div className="fraction-input">
                            <input
                              type="number"
                              className="input-field top"
                              value={fraction.numerator}
                              onChange={(e) => handleFractionChange(index, 'numerator', e.target.value)}
                              placeholder="0"
                              min="0"
                            />
                            <div className="fraction-line"></div>
                            <input
                              type="number"
                              className="input-field bottom"
                              value={fraction.denominator}
                              onChange={(e) => handleFractionChange(index, 'denominator', e.target.value)}
                              placeholder="1"
                              min="1"
                            />
                          </div>
                          
                          {index < fractions[activeTab].length - 1 && (
                            <select
                              className="operator-select"
                              value={operators[activeTab][index]}
                              onChange={(e) => handleOperatorChange(index, e.target.value)}
                            >
                              <option value="+">+</option>
                              <option value="-">-</option>
                              <option value="*">×</option>
                              <option value="/">÷</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>

          {/* Calculate and Reset Buttons */}
                    <div className="calculator-actions">
                    
                    
                      <button type="button" className="btn-reset" onClick={handleReset}>
                        Reset
                      </button>
                    </div>
                  </form>

                  {result && (
          <div className="result-section fraction-calculator-result">
                      <h3 className="result-title">Result</h3>
                      <div className="result-content">
                        <div className="result-main">
                          <div className="result-item">
                            <strong>Fraction:</strong>
                            <div className="result-formula" id="result-formula"></div>
                          </div>
                          <div className="result-item">
                            <strong>Decimal:</strong> {result.decimal}
                          </div>
                          {result.mixedNumber !== result.fraction && (
                            <div className="result-item">
                              <strong>Mixed Number:</strong> {result.mixedNumber}
                            </div>
                          )}
                        </div>
                        
                        <div className="result-steps">
                          <h4>Calculation Steps:</h4>
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
                        Fractions are fundamental mathematical concepts that represent parts of a whole. 
                        They are used extensively in mathematics, science, engineering, and everyday life. 
                        Our Fraction Calculator is designed to simplify complex fraction operations, 
                        providing accurate results with detailed step-by-step solutions.
                      </p>
                      <p>
                        Whether you're a student learning fractions, a teacher explaining concepts, 
                        or a professional working with measurements, this calculator helps you perform 
                        addition, subtraction, multiplication, and division of fractions efficiently.
                      </p>
      </ContentSection>

      <ContentSection id="what-is-fraction" title="What is a Fraction Calculator?">
                      <p>
                        A fraction calculator is a tool that performs fraction calculations quickly and accurately. 
                        These calculators allow you to input fractions in various forms, including simple fractions, 
                        mixed fractions (whole number + fraction), and improper fractions. Different types of fraction 
                        calculators are available, each with specialized functionality:
                      </p>
        <ul>
          <li><strong>Fraction Calculator:</strong> Designed for basic operations between two fractions.</li>
          <li><strong>3 Fraction Calculator:</strong> Simplifies operations involving three fractions at once.</li>
          <li><strong>4 Fraction Calculator:</strong> Manages calculations with four fractions, ideal for more detailed comparisons.</li>
          <li><strong>Mixed Number Fraction Calculator:</strong> This tool is ideal for calculations that involve both whole numbers and fractions, often converting mixed numbers into improper fractions to make calculations easier.</li>
                    </ul>
                      <p>
                        Each calculator type is user-friendly and provides instant solutions, making it easier to approach and solve various fraction problems.
                      </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
                    <div className="formula-section">
                      <h3>Addition</h3>
                      <div className="math-formula" id="addition-formula"></div>
                      <p>To add fractions, we find a common denominator and add the numerators.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Subtraction</h3>
                      <div className="math-formula" id="subtraction-formula"></div>
                      <p>To subtract fractions, we find a common denominator and subtract the numerators.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Multiplication</h3>
                      <div className="math-formula" id="multiplication-formula"></div>
                      <p>To multiply fractions, we multiply the numerators and denominators directly.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Division</h3>
                      <div className="math-formula" id="division-formula"></div>
                      <p>To divide fractions, we multiply by the reciprocal of the second fraction.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Simplification</h3>
                      <p>
                        After any operation, we simplify the result by finding the Greatest Common Divisor (GCD) 
                        and dividing both numerator and denominator by it.
                      </p>
                    </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use a Fraction Calculator">
                      <p>Using a fraction calculator is very simple:</p>
        <ul>
          <li><strong>Select Operation:</strong> Choose the type of operation you wish to perform—addition, subtraction, multiplication, or division.</li>
          <li><strong>Enter Fractions:</strong> Input each fraction's numerator and denominator as required by the calculator.</li>
          <li><strong>Calculate:</strong> Press the calculate button, and the calculator will display the result.</li>
          <li><strong>Simplification:</strong> Many fraction calculators automatically reduce fractions to their simplest form. This helps you avoid unnecessary steps and ensures the fraction is fully simplified.</li>
                    </ul>
                    <p>
                      Each type of fraction calculator has similar steps, with specialized calculators allowing you to enter three or four fractions for more complex calculations.
                    </p>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
                    <div className="example-section">
                      <h3>Example 1: Adding Fractions</h3>
                      <p>Calculate:</p>
                      <div className="content-formula" id="example1-formula"></div>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Find common denominator (LCD = 4)</p>
                        <p><strong>Step 2:</strong> Convert fractions:</p>
                        <div className="content-formula" id="example1-step2"></div>
                        <p><strong>Step 3:</strong> Add numerators:</p>
                        <div className="content-formula" id="example1-step3"></div>
                        <p><strong>Result:</strong></p>
                        <div className="content-formula" id="example1-result"></div>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Multiplying Fractions</h3>
                      <p>Calculate:</p>
                      <div className="content-formula" id="example2-formula"></div>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Multiply numerators: 2 × 3 = 6</p>
                        <p><strong>Step 2:</strong> Multiply denominators: 3 × 4 = 12</p>
                        <p><strong>Step 3:</strong> Simplify:</p>
                        <div className="content-formula" id="example2-step3"></div>
                        <p><strong>Result:</strong></p>
                        <div className="content-formula" id="example2-result"></div>
                      </div>
                    </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Fractions are essential in mathematics and have numerous applications in real life:</p>
        <ul>
          <li>They represent parts of wholes in measurements and quantities</li>
          <li>They are fundamental in algebra and calculus</li>
          <li>They are used in probability and statistics</li>
          <li>They help in understanding ratios and proportions</li>
          <li>They are crucial in engineering and scientific calculations</li>
                    </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
                    <p>Our Fraction Calculator provides:</p>
                    <ul>
          <li><strong>Multiple Operations:</strong> Addition, subtraction, multiplication, and division</li>
          <li><strong>Step-by-step Solutions:</strong> Detailed calculation process</li>
          <li><strong>Multiple Formats:</strong> Fraction, decimal, and mixed number results</li>
          <li><strong>Simplification:</strong> Automatic reduction to lowest terms</li>
          <li><strong>Error Handling:</strong> Validation for invalid inputs</li>
          <li><strong>Multiple Fractions:</strong> Support for 2, 3, or 4 fractions</li>
                    </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching and learning fraction concepts in schools and universities</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Engineering</h4>
                        <p>Precise calculations in mechanical and electrical engineering</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific research</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Interest calculations and financial ratios</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-ruler"></i> Construction</h4>
                        <p>Measurement and scaling in building projects</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-utensils"></i> Cooking</h4>
                        <p>Recipe scaling and ingredient measurements</p>
                      </div>
                    </div>
      </ContentSection>

                    <FAQSection 
                      faqs={[
                        {
                          question: "What is the difference between a fraction and a decimal?",
                          answer: "A fraction represents a part of a whole using two numbers (numerator/denominator), while a decimal represents the same value using a decimal point system."
                        },
                        {
                          question: "How do I simplify a fraction?",
                          answer: "To simplify a fraction, find the Greatest Common Divisor (GCD) of the numerator and denominator, then divide both by this number."
                        },
                        {
                          question: "What is a mixed number?",
                          answer: "A mixed number combines a whole number with a fraction, such as 2 1/3, representing 2 + 1/3."
                        },
                        {
                          question: "Can I use negative numbers in fractions?",
                          answer: "Yes, you can use negative numbers. The negative sign can be applied to either the numerator or denominator, or the entire fraction."
                        },
                        {
                          question: "What happens if I divide by zero?",
                          answer: "Division by zero is undefined in mathematics. The calculator will show an error message if you attempt to divide by zero."
                        }
                      ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default FractionCalculator; 