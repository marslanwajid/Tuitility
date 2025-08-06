import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
import '../../assets/css/math/fraction-calculator.css'

const FractionCalculator = () => {
  const [activeTab, setActiveTab] = useState('2-fractions')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

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
  })

  const [operators, setOperators] = useState({
    '2-fractions': ['+'],
    '3-fractions': ['+', '+'],
    '4-fractions': ['+', '+', '+']
  })

  // Utility functions
  const getGCD = (a, b) => {
    let num1 = Math.abs(a)
    let num2 = Math.abs(b)
    while (num2 !== 0) {
      let temp = num2
      num2 = num1 % num2
      num1 = temp
    }
    return num1
  }

  const simplifyFraction = (numerator, denominator) => {
    if (denominator === 0) {
      throw new Error('Division by zero')
    }
    
    const gcd = getGCD(numerator, denominator)
    const simplifiedNum = numerator / gcd
    const simplifiedDen = denominator / gcd
    
    if (simplifiedDen < 0) {
      return { numerator: -simplifiedNum, denominator: -simplifiedDen }
    }
    
    return { numerator: simplifiedNum, denominator: simplifiedDen }
  }

  const fractionToString = (fraction) => {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString()
    }
    return `${fraction.numerator}/${fraction.denominator}`
  }

  const fractionToMixedNumber = (fraction) => {
    const absNumerator = Math.abs(fraction.numerator)
    const whole = Math.floor(absNumerator / fraction.denominator)
    const numerator = absNumerator % fraction.denominator
    const sign = fraction.numerator < 0 ? '-' : ''
    
    if (whole === 0) {
      return fractionToString(fraction)
    } else if (numerator === 0) {
      return `${sign}${whole}`
    } else {
      return `${sign}${whole} ${numerator}/${fraction.denominator}`
    }
  }

  // Arithmetic operations
  const addFractions = (f1, f2) => {
    const numerator = f1.numerator * f2.denominator + f2.numerator * f1.denominator
    const denominator = f1.denominator * f2.denominator
    return simplifyFraction(numerator, denominator)
  }

  const subtractFractions = (f1, f2) => {
    const numerator = f1.numerator * f2.denominator - f2.numerator * f1.denominator
    const denominator = f1.denominator * f2.denominator
    return simplifyFraction(numerator, denominator)
  }

  const multiplyFractions = (f1, f2) => {
    const numerator = f1.numerator * f2.numerator
    const denominator = f1.denominator * f2.denominator
    return simplifyFraction(numerator, denominator)
  }

  const divideFractions = (f1, f2) => {
    if (f2.numerator === 0) {
      throw new Error('Division by zero')
    }
    const numerator = f1.numerator * f2.denominator
    const denominator = f1.denominator * f2.numerator
    return simplifyFraction(numerator, denominator)
  }

  const calculateResult = () => {
    try {
      const currentFractions = fractions[activeTab]
      const currentOperators = operators[activeTab]
      
      if (!currentFractions || currentFractions.length === 0) {
        throw new Error('No fractions provided')
      }

      let result = currentFractions[0]
      let steps = [`Start with: ${fractionToString(result)}`]
      
      for (let i = 0; i < currentOperators.length && i < currentFractions.length - 1; i++) {
        const nextFraction = currentFractions[i + 1]
        const operator = currentOperators[i]
        
        steps.push(`\n${fractionToString(result)} ${operator} ${fractionToString(nextFraction)}`)
        
        switch (operator) {
          case '+':
            result = addFractions(result, nextFraction)
            break
          case '-':
            result = subtractFractions(result, nextFraction)
            break
          case '*':
            result = multiplyFractions(result, nextFraction)
            break
          case '/':
            result = divideFractions(result, nextFraction)
            break
          default:
            throw new Error(`Unknown operator: ${operator}`)
        }
        
        steps.push(`= ${fractionToString(result)}`)
      }
      
      const decimal = formatDecimal(result.numerator / result.denominator)
      const mixedNumber = fractionToMixedNumber(result)
      
      steps.push(`\nDecimal: ${decimal}`)
      if (mixedNumber !== fractionToString(result)) {
        steps.push(`Mixed number: ${mixedNumber}`)
      }
      
      setResult({
        fraction: fractionToString(result),
        decimal: decimal,
        mixedNumber: mixedNumber,
        steps: steps
      })
      setError('')
    } catch (error) {
      setError(error.message)
      setResult(null)
    }
  }

  const formatDecimal = (number) => {
    if (!isFinite(number)) {
      return 'Undefined'
    }
    
    let str = number.toFixed(6)
    str = str.replace(/\.?0+$/, "")
    return str
  }

  const handleFractionChange = (index, field, value) => {
    const newFractions = { ...fractions }
    newFractions[activeTab][index][field] = parseInt(value) || 0
    setFractions(newFractions)
  }

  const handleOperatorChange = (index, operator) => {
    const newOperators = { ...operators }
    newOperators[activeTab][index] = operator
    setOperators(newOperators)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setResult(null)
    setError('')
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    calculateResult()
  }

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
    })
    setOperators({
      '2-fractions': ['+'],
      '3-fractions': ['+', '+'],
      '4-fractions': ['+', '+', '+']
    })
    setResult(null)
    setError('')
  }



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
    <div className="tool-page">
      {/* Hero Section */}
      <section className="tool-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <i className="fas fa-divide"></i>
              Fraction Calculator
            </h1>
            <p className="hero-description">
              Add, subtract, multiply, and divide fractions with step-by-step solutions. 
              Perfect for students, teachers, and anyone working with fractions.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Multiple operations
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Decimal & mixed number results
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="tool-main">
        <div className="container">
          <div className="tool-layout">
            {/* Sidebar */}
            <aside className="tool-sidebar">
              {/* Categories Box */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">
                  <i className="fas fa-th"></i>
                  Categories
                </h3>
                <div className="category-links">
                  <Link to="/math" className="category-link">
                    <i className="fas fa-calculator"></i>
                    <span>Math</span>
                  </Link>
                  <Link to="/finance" className="category-link">
                    <i className="fas fa-dollar-sign"></i>
                    <span>Finance</span>
                  </Link>
                  <Link to="/science" className="category-link">
                    <i className="fas fa-atom"></i>
                    <span>Science</span>
                  </Link>
                  <Link to="/health" className="category-link">
                    <i className="fas fa-heartbeat"></i>
                    <span>Health</span>
                  </Link>
                  <Link to="/utility-tools" className="category-link">
                    <i className="fas fa-tools"></i>
                    <span>Utility</span>
                  </Link>
                  <Link to="/knowledge" className="category-link">
                    <i className="fas fa-brain"></i>
                    <span>Knowledge</span>
                  </Link>
                </div>
              </div>

              {/* Math Tools */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">
                  <i className="fas fa-calculator"></i>
                  Math Tools
                </h3>
                <div className="tool-links">
                  <Link to="/math/calculators/fraction-calculator" className="tool-link active">
                    <i className="fas fa-divide"></i>
                    <span>Fraction Calculator</span>
                  </Link>
                  <Link to="/math/calculators/percentage-calculator" className="tool-link">
                    <i className="fas fa-percentage"></i>
                    <span>Percentage Calculator</span>
                  </Link>
                  <Link to="/math/calculators/decimal-to-fraction-calculator" className="tool-link">
                    <i className="fas fa-arrows-alt-h"></i>
                    <span>Decimal to Fraction</span>
                  </Link>
                  <Link to="/math/calculators/lcm-calculator" className="tool-link">
                    <i className="fas fa-sort-numeric-up"></i>
                    <span>LCM Calculator</span>
                  </Link>
                  <Link to="/math/calculators/binary-calculator" className="tool-link">
                    <i className="fas fa-1"></i>
                    <span>Binary Calculator</span>
                  </Link>
                  <Link to="/math/calculators/lcd-calculator" className="tool-link">
                    <i className="fas fa-sort-numeric-down"></i>
                    <span>LCD Calculator</span>
                  </Link>
                  <Link to="/math/calculators/comparing-fractions-calculator" className="tool-link">
                    <i className="fas fa-balance-scale"></i>
                    <span>Compare Fractions</span>
                  </Link>
                  <Link to="/math/calculators/decimal-calculator" className="tool-link">
                    <i className="fas fa-calculator"></i>
                    <span>Decimal Calculator</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="tool-content">
              {/* Calculator Section */}
              <section className="calculator-section">
                <div className="calculator-container">
                  <h2 className="section-title">
                    <i className="fas fa-calculator"></i>
                    Fraction Calculator
                  </h2>
                  
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

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-equals"></i>
                        Calculate
                      </button>
                      <button type="button" className="btn-reset" onClick={handleReset}>
                        <i className="fas fa-redo"></i>
                        Reset
                      </button>
                    </div>
                  </form>

                  {/* Results */}
                  {error && (
                    <div className="result-section error">
                      <div className="result-content">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="result-section">
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
                </div>
              </section>

              {/* Table of Contents & Feedback */}
              <section className="toc-feedback-section">
                <div className="toc-feedback-container">
                  {/* Table of Contents */}
                  <div className="toc-section">
                    <h3 className="toc-title">
                      <i className="fas fa-list"></i>
                      Table of Contents
                    </h3>
                    <nav className="toc-nav">
                      <a href="#introduction" className="toc-link">Introduction</a>
                      <a href="#what-is-fraction" className="toc-link">What is a Fraction?</a>
                      <a href="#formulas" className="toc-link">Formulas & Methods</a>
                      <a href="#how-to-use" className="toc-link">How to Use Fraction Calculator</a>
                      <a href="#examples" className="toc-link">Examples</a>
                      <a href="#significance" className="toc-link">Significance</a>
                      <a href="#functionality" className="toc-link">Functionality</a>
                      <a href="#applications" className="toc-link">Applications</a>
                      <a href="#faqs" className="toc-link">FAQs</a>
                    </nav>
                  </div>

                  {/* Feedback Form */}
                  <div className="feedback-section">
                    <h3 className="feedback-title">
                      <i className="fas fa-comment"></i>
                      Feedback
                    </h3>
                    <form className="feedback-form">
                      <div className="form-group">
                        <label htmlFor="feedback-name">Name</label>
                        <input type="text" id="feedback-name" placeholder="Your name" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="feedback-email">Email</label>
                        <input type="email" id="feedback-email" placeholder="Your email" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="feedback-message">Message</label>
                        <textarea id="feedback-message" rows="4" placeholder="Your feedback or suggestions..."></textarea>
                      </div>
                      <button type="submit" className="btn-submit">
                        <i className="fas fa-paper-plane"></i>
                        Send Feedback
                      </button>
                    </form>
                  </div>
                </div>
              </section>

              {/* Content Section */}
              <section className="content-section">
                <div className="content-container">
                  {/* Introduction */}
                  <div id="introduction" className="content-block">
                    <h2 className="content-title">Introduction</h2>
                    <div className="content-intro">
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
                    </div>
                  </div>

                  {/* What is a Fraction Calculator */}
                  <div id="what-is-fraction" className="content-block">
                    <h2 className="content-title">What is a Fraction Calculator?</h2>
                    <div className="content-intro">
                      <p>
                        A fraction calculator is a tool that performs fraction calculations quickly and accurately. 
                        These calculators allow you to input fractions in various forms, including simple fractions, 
                        mixed fractions (whole number + fraction), and improper fractions. Different types of fraction 
                        calculators are available, each with specialized functionality:
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Fraction Calculator:</strong> Designed for basic operations between two fractions.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>3 Fraction Calculator:</strong> Simplifies operations involving three fractions at once.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>4 Fraction Calculator:</strong> Manages calculations with four fractions, ideal for more detailed comparisons.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Mixed Number Fraction Calculator:</strong> This tool is ideal for calculations that involve both whole numbers and fractions, often converting mixed numbers into improper fractions to make calculations easier.</span>
                      </li>
                    </ul>
                    <div className="content-intro">
                      <p>
                        Each calculator type is user-friendly and provides instant solutions, making it easier to approach and solve various fraction problems.
                      </p>
                    </div>
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
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
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use a Fraction Calculator</h2>
                    <div className="content-intro">
                      <p>Using a fraction calculator is very simple:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Select Operation:</strong> Choose the type of operation you wish to perform—addition, subtraction, multiplication, or division.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Fractions:</strong> Input each fraction's numerator and denominator as required by the calculator.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Press the calculate button, and the calculator will display the result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Simplification:</strong> Many fraction calculators automatically reduce fractions to their simplest form. This helps you avoid unnecessary steps and ensures the fraction is fully simplified.</span>
                      </li>
                    </ul>
                    <p>
                      Each type of fraction calculator has similar steps, with specialized calculators allowing you to enter three or four fractions for more complex calculations.
                    </p>
                  </div>

                  {/* Examples */}
                  <div id="examples" className="content-block">
                    <h2 className="content-title">Examples</h2>
                    
                    <div className="example-section">
                      <h3>Example 1: Adding Fractions</h3>
                      <p>Calculate: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Find common denominator (LCD = 4)</p>
                        <p><strong>Step 2:</strong> Convert fractions: <div className="content-formula" id="example1-step2"></div></p>
                        <p><strong>Step 3:</strong> Add numerators: <div className="content-formula" id="example1-step3"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example1-result"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Multiplying Fractions</h3>
                      <p>Calculate: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Multiply numerators: 2 × 3 = 6</p>
                        <p><strong>Step 2:</strong> Multiply denominators: 3 × 4 = 12</p>
                        <p><strong>Step 3:</strong> Simplify: <div className="content-formula" id="example2-step3"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example2-result"></div></p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Fractions are essential in mathematics and have numerous applications in real life:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>They represent parts of wholes in measurements and quantities</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>They are fundamental in algebra and calculus</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>They are used in probability and statistics</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>They help in understanding ratios and proportions</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>They are crucial in engineering and scientific calculations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Functionality */}
                  <div id="functionality" className="content-block">
                    <h2 className="content-title">Functionality</h2>
                    <p>Our Fraction Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Multiple Operations:</strong> Addition, subtraction, multiplication, and division</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Step-by-step Solutions:</strong> Detailed calculation process</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Multiple Formats:</strong> Fraction, decimal, and mixed number results</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Simplification:</strong> Automatic reduction to lowest terms</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Error Handling:</strong> Validation for invalid inputs</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Multiple Fractions:</strong> Support for 2, 3, or 4 fractions</span>
                      </li>
                    </ul>
                  </div>

                  {/* Applications */}
                  <div id="applications" className="content-block">
                    <h2 className="content-title">Applications</h2>
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
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
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
                    />
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FractionCalculator 