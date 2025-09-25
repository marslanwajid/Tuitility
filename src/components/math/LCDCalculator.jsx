import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/lcd-calculator.css';

const LCDCalculator = () => {
  const [input, setInput] = useState('1/4, 1/6, 1/8');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'LCD Calculator',
    description: 'Find the Least Common Denominator (LCD) of multiple fractions and convert them to equivalent fractions. Perfect for students learning fraction operations and teachers explaining mathematical concepts.',
    icon: 'fas fa-sort-numeric-down',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'LCD Calculator']
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
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'LCM Calculator', url: '/math/calculators/lcm-calculator', icon: 'fas fa-sort-numeric-up' },
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
    { id: 'what-is-lcd', title: 'What is LCD?' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'how-to-use', title: 'How to Use LCD Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Utility functions
  const findGCD = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  const findLCM = (a, b) => {
    return Math.abs(a * b) / findGCD(a, b);
  };

  const findLCMOfArray = (arr) => {
    let lcm = arr[0];
    for (let i = 1; i < arr.length; i++) {
      lcm = findLCM(lcm, arr[i]);
    }
    return lcm;
  };

  const parseFraction = (str) => {
    try {
      str = str.trim();
      let whole = 0, num = 0, den = 1;

      if (str.includes(' ')) {
        // Mixed number
        let parts = str.split(' ');
        whole = parseInt(parts[0]);
        let fraction = parts[1].split('/');
        num = parseInt(fraction[0]);
        den = parseInt(fraction[1]);
        num = whole * den + num;
      } else if (str.includes('/')) {
        // Fraction
        let parts = str.split('/');
        num = parseInt(parts[0]);
        den = parseInt(parts[1]);
      } else {
        // Whole number
        num = parseInt(str);
        den = 1;
      }

      // Validate the result
      if (isNaN(num) || isNaN(den) || den === 0) {
        throw new Error('Invalid fraction');
      }

      return { numerator: num, denominator: den };
    } catch (error) {
      throw new Error(`Invalid input: "${str}"`);
    }
  };

  const formatFraction = (fraction) => {
    if (fraction.denominator === 1) {
      return fraction.numerator;
    }
    return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
  };

  const formatOriginalInput = (fraction) => {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString();
    }
    const whole = Math.floor(fraction.numerator / fraction.denominator);
    const remainder = fraction.numerator % fraction.denominator;
    if (whole > 0 && remainder > 0) {
      return `${whole}\\;\\frac{${remainder}}{${fraction.denominator}}`;
    }
    return `\\frac{${fraction.numerator}}{${fraction.denominator}}`;
  };

  const calculateLCD = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter some numbers or fractions');
      }

      const inputArray = input.split(',');
      if (inputArray.length < 2) {
        throw new Error('Please enter at least 2 numbers or fractions separated by commas');
      }

      const fractions = inputArray.map(str => parseFraction(str.trim()));
      
      // Get all denominators
      const denominators = fractions.map(f => f.denominator);
      
      // Calculate LCD
      const lcd = findLCMOfArray(denominators);
      
      // Calculate equivalent fractions
      const equivalentFractions = fractions.map(f => {
        const multiplier = lcd / f.denominator;
        return {
          original: f,
          multiplier: multiplier,
          result: {
            numerator: f.numerator * multiplier,
            denominator: lcd
          }
        };
      });

      // Generate solution steps
      let steps = [];
      steps.push(`Step 1: Rewrite the input values as fractions:`);
      steps.push(`${fractions.map(f => formatFraction(f)).join(',\\;')}`);
      
      steps.push(`Step 2: Find the least common multiple of the denominators:`);
      steps.push(`Denominators: ${denominators.join(', ')}`);
      steps.push(`\\text{LCD} = \\text{LCM}(${denominators.join(', ')}) = ${lcd}`);
      
      steps.push(`Step 3: Convert each fraction to have the LCD as denominator:`);
      
      equivalentFractions.forEach(ef => {
        const originalStr = formatOriginalInput(ef.original);
        steps.push(`${originalStr} = ${formatFraction(ef.original)} \\times \\frac{${ef.multiplier}}{${ef.multiplier}} = \\frac{${ef.result.numerator}}{${ef.result.denominator}}`);
      });

      setResult({
        lcd: lcd,
        equivalentFractions: equivalentFractions,
        steps: steps
      });
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const handleReset = () => {
    setInput('1/4, 1/6, 1/8');
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // LCD formula
          katex.render('\\text{LCD} = \\text{LCM}(\\text{denominators})', 
            document.getElementById('lcd-formula'));
          
          // Example 1 formulas
          katex.render('\\frac{1}{4}, \\frac{1}{6}, \\frac{1}{8}', 
            document.getElementById('example1-formula'));
          katex.render('\\text{LCM}(4, 6, 8) = 24', 
            document.getElementById('example1-lcm'));
          katex.render('\\frac{1}{4} = \\frac{6}{24}, \\frac{1}{6} = \\frac{4}{24}, \\frac{1}{8} = \\frac{3}{24}', 
            document.getElementById('example1-result'));

          // Example 2 formulas
          katex.render('\\frac{2}{3}, \\frac{3}{4}, \\frac{5}{6}', 
            document.getElementById('example2-formula'));
          katex.render('\\text{LCM}(3, 4, 6) = 12', 
            document.getElementById('example2-lcm'));
          katex.render('\\frac{2}{3} = \\frac{8}{12}, \\frac{3}{4} = \\frac{9}{12}, \\frac{5}{6} = \\frac{10}{12}', 
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
          // Render LCD result
          const lcdElement = document.getElementById('lcd-result');
          if (lcdElement) {
            katex.render(`\\text{LCD} = ${result.lcd}`, lcdElement);
          }

          // Render equivalent fractions table formulas
          result.equivalentFractions.forEach((ef, index) => {
            const originalElement = document.getElementById(`original-${index}`);
            const equivalentElement = document.getElementById(`equivalent-${index}`);
            
            if (originalElement) {
              const originalStr = formatOriginalInput(ef.original);
              katex.render(originalStr, originalElement);
            }
            
            if (equivalentElement) {
              katex.render(`\\frac{${ef.result.numerator}}{${ef.result.denominator}}`, equivalentElement);
            }
          });

          // Render solution steps formulas
          result.steps.forEach((step, index) => {
            if (step.includes('\\frac') || step.includes('\\text') || step.includes('\\times')) {
              const stepElement = document.getElementById(`step-${index}`);
              if (stepElement) {
                katex.render(step, stepElement);
              }
            }
          });
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
        title="LCD Calculator"
        onCalculate={calculateLCD}
        calculateButtonText="Calculate LCD"
        error={error}
        result={null}
      >
        <div className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="numbers" className="input-label">
                        Enter fractions or numbers (separated by commas):
                      </label>
                      <input
                        type="text"
                        id="numbers"
                        className="input-field"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., 1/4, 1/6, 1/8"
                      />
                      <small className="input-help">
                        You can enter fractions (1/2), mixed numbers (1 1/2), or whole numbers (5)
                      </small>
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
          <div className="result-section lcd-calculator-result">
                      <h3 className="result-title">Result</h3>
                      <div className="result-content">
                        <div className="result-main">
                          <div className="result-item">
                            <strong>Least Common Denominator:</strong>
                            <div className="result-formula" id="lcd-result"></div>
                          </div>
                        </div>
                        
                        <div className="result-equivalent">
                          <h4>Equivalent Fractions:</h4>
                          <div className="equivalent-table">
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
                                      <div className="math-formula" id={`original-${index}`}></div>
                                    </td>
                                    <td>
                                      <div className="math-formula" id={`equivalent-${index}`}></div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <div className="result-steps">
                          <h4>Solution Steps:</h4>
                          <div className="steps-container">
                            {result.steps.map((step, index) => (
                              <div key={index} className="step">
                                {step.includes('\\frac') || step.includes('\\text') || step.includes('\\times') ? (
                                  <div className="math-formula" id={`step-${index}`}></div>
                                ) : step.startsWith('Step') ? (
                                  <strong>{step}</strong>
                                ) : (
                                  <p>{step}</p>
                                )}
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
                        The Least Common Denominator (LCD) is a fundamental concept in mathematics that helps us 
                        work with fractions more effectively. It's the smallest number that can be used as a 
                        common denominator for a set of fractions, making addition, subtraction, and comparison 
                        of fractions much easier.
                      </p>
                      <p>
                        Our LCD Calculator simplifies this process by automatically finding the LCD of multiple 
                        fractions and converting them to equivalent fractions with the same denominator. This tool 
                        is essential for students learning fraction operations and anyone working with mathematical 
                        calculations involving fractions.
                      </p>
      </ContentSection>

      <ContentSection id="what-is-lcd" title="What is LCD (Least Common Denominator)?">
                      <p>
                        The Least Common Denominator (LCD) is the smallest positive integer that is a multiple 
                        of all the denominators in a given set of fractions. It's essentially the Least Common 
                        Multiple (LCM) of the denominators.
                      </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>LCD Definition:</strong> The smallest number that can be used as a common denominator for all fractions in a set.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Relationship to LCM:</strong> LCD is the same as the LCM of the denominators.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Allows fractions to be added, subtracted, or compared easily.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Mathematical Foundation:</strong> Essential for fraction arithmetic and algebra.</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
                    <div className="formula-section">
                      <h3>LCD Formula</h3>
                      <div className="math-formula" id="lcd-formula"></div>
                      <p>The LCD is calculated by finding the LCM of all denominators in the given fractions.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Finding LCM</h3>
                      <p>
                        To find the LCM of two numbers, we use the formula: LCM(a,b) = |a × b| / GCD(a,b)
                      </p>
                    </div>

                    <div className="formula-section">
                      <h3>Converting to Equivalent Fractions</h3>
                      <p>
                        Once we have the LCD, we convert each fraction by multiplying both numerator and 
                        denominator by the appropriate factor to make the denominator equal to the LCD.
                      </p>
                    </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use LCD Calculator">
                      <p>Using the LCD calculator is straightforward:</p>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Fractions:</strong> Input your fractions or numbers separated by commas in the text field.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Supported Formats:</strong> You can enter simple fractions (1/2), mixed numbers (1 1/2), or whole numbers (5).</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Calculate LCD" button to find the least common denominator.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the LCD and equivalent fractions with step-by-step solutions.</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
                    <div className="example-section">
                      <h3>Example 1: Simple Fractions</h3>
                      <p>Find the LCD of: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Find LCM of denominators (4, 6, 8)</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example1-lcm"></div></p>
                        <p><strong>Step 3:</strong> Convert to equivalent fractions: <div className="content-formula" id="example1-result"></div></p>
                        <p><strong>Result:</strong> LCD = 24</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Mixed Numbers</h3>
                      <p>Find the LCD of: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Find LCM of denominators (3, 4, 6)</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example2-lcm"></div></p>
                        <p><strong>Step 3:</strong> Convert to equivalent fractions: <div className="content-formula" id="example2-result"></div></p>
                        <p><strong>Result:</strong> LCD = 12</p>
                      </div>
                    </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
                    <p>
                      Understanding LCD is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Enables addition and subtraction of fractions with different denominators</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Facilitates comparison of fractions</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for solving equations involving fractions</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for more advanced mathematical concepts</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in real-world applications like cooking, construction, and finance</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
                    <p>Our LCD Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Multiple Input Formats:</strong> Supports fractions, mixed numbers, and whole numbers</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Automatic LCD Calculation:</strong> Finds the least common denominator instantly</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Equivalent Fractions:</strong> Shows all fractions converted to the LCD</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Step-by-step Solutions:</strong> Detailed explanation of the calculation process</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Error Handling:</strong> Validates inputs and provides helpful error messages</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Mathematical Notation:</strong> Uses proper mathematical symbols and formulas</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching fraction operations and mathematical concepts in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-utensils"></i> Cooking</h4>
                        <p>Scaling recipes and adjusting ingredient proportions</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-ruler"></i> Construction</h4>
                        <p>Calculating measurements and material quantities</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Calculating interest rates and financial ratios</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Engineering</h4>
                        <p>Precise calculations in various engineering fields</p>
                      </div>
                    </div>
      </ContentSection>

                    <FAQSection 
                      faqs={[
                        {
                          question: "What is the difference between LCD and LCM?",
                          answer: "LCD (Least Common Denominator) is specifically used for fractions and is the LCM of the denominators. LCM (Least Common Multiple) is a more general concept for any set of numbers."
                        },
                        {
                          question: "Why do we need LCD?",
                          answer: "LCD is needed to add, subtract, or compare fractions with different denominators. It allows us to convert fractions to equivalent forms with the same denominator."
                        },
                        {
                          question: "Can I use this calculator for more than 3 fractions?",
                          answer: "Yes, you can enter any number of fractions separated by commas. The calculator will find the LCD for all of them."
                        },
                        {
                          question: "What if I enter invalid fractions?",
                          answer: "The calculator will show an error message explaining what went wrong. Make sure to use proper fraction notation (e.g., 1/2, 1 1/2 for mixed numbers)."
                        },
                        {
                          question: "How accurate are the results?",
                          answer: "The calculator provides exact mathematical results. All calculations are performed using precise mathematical algorithms."
                        }
                      ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default LCDCalculator;
