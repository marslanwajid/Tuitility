import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
// import '../../assets/css/math/lcd-calculator.css'

const LCDCalculator = () => {
  const [input, setInput] = useState('1/4, 1/6, 1/8')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Utility functions
  const findGCD = (a, b) => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) {
      let t = b
      b = a % b
      a = t
    }
    return a
  }

  const findLCM = (a, b) => {
    return Math.abs(a * b) / findGCD(a, b)
  }

  const findLCMOfArray = (arr) => {
    let lcm = arr[0]
    for (let i = 1; i < arr.length; i++) {
      lcm = findLCM(lcm, arr[i])
    }
    return lcm
  }

  const parseFraction = (str) => {
    try {
      str = str.trim()
      let whole = 0, num = 0, den = 1

      if (str.includes(' ')) {
        // Mixed number
        let parts = str.split(' ')
        whole = parseInt(parts[0])
        let fraction = parts[1].split('/')
        num = parseInt(fraction[0])
        den = parseInt(fraction[1])
        num = whole * den + num
      } else if (str.includes('/')) {
        // Fraction
        let parts = str.split('/')
        num = parseInt(parts[0])
        den = parseInt(parts[1])
      } else {
        // Whole number
        num = parseInt(str)
        den = 1
      }

      // Validate the result
      if (isNaN(num) || isNaN(den) || den === 0) {
        throw new Error('Invalid fraction')
      }

      return { numerator: num, denominator: den }
    } catch (error) {
      throw new Error(`Invalid input: "${str}"`)
    }
  }

  const formatFraction = (fraction) => {
    if (fraction.denominator === 1) {
      return fraction.numerator
    }
    return `\\frac{${fraction.numerator}}{${fraction.denominator}}`
  }

  const formatOriginalInput = (fraction) => {
    if (fraction.denominator === 1) {
      return fraction.numerator.toString()
    }
    const whole = Math.floor(fraction.numerator / fraction.denominator)
    const remainder = fraction.numerator % fraction.denominator
    if (whole > 0 && remainder > 0) {
      return `${whole}\\;\\frac{${remainder}}{${fraction.denominator}}`
    }
    return `\\frac{${fraction.numerator}}{${fraction.denominator}}`
  }

  const calculateLCD = () => {
    try {
      if (!input.trim()) {
        throw new Error('Please enter some numbers or fractions')
      }

      const inputArray = input.split(',')
      if (inputArray.length < 2) {
        throw new Error('Please enter at least 2 numbers or fractions separated by commas')
      }

      const fractions = inputArray.map(str => parseFraction(str.trim()))
      
      // Get all denominators
      const denominators = fractions.map(f => f.denominator)
      
      // Calculate LCD
      const lcd = findLCMOfArray(denominators)
      
      // Calculate equivalent fractions
      const equivalentFractions = fractions.map(f => {
        const multiplier = lcd / f.denominator
        return {
          original: f,
          multiplier: multiplier,
          result: {
            numerator: f.numerator * multiplier,
            denominator: lcd
          }
        }
      })

      // Generate solution steps
      let steps = []
      steps.push(`Step 1: Rewrite the input values as fractions:`)
      steps.push(`${fractions.map(f => formatFraction(f)).join(',\\;')}`)
      
      steps.push(`Step 2: Find the least common multiple of the denominators:`)
      steps.push(`Denominators: ${denominators.join(', ')}`)
      steps.push(`\\text{LCD} = \\text{LCM}(${denominators.join(', ')}) = ${lcd}`)
      
      steps.push(`Step 3: Convert each fraction to have the LCD as denominator:`)
      
      equivalentFractions.forEach(ef => {
        const originalStr = formatOriginalInput(ef.original)
        steps.push(`${originalStr} = ${formatFraction(ef.original)} \\times \\frac{${ef.multiplier}}{${ef.multiplier}} = \\frac{${ef.result.numerator}}{${ef.result.denominator}}`)
      })

      setResult({
        lcd: lcd,
        equivalentFractions: equivalentFractions,
        steps: steps
      })
      setError('')
    } catch (error) {
      setError(error.message)
      setResult(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    calculateLCD()
  }

  const handleReset = () => {
    setInput('1/4, 1/6, 1/8')
    setResult(null)
    setError('')
  }

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // LCD formula
          katex.render('\\text{LCD} = \\text{LCM}(\\text{denominators})', 
            document.getElementById('lcd-formula'))
          
          // Example 1 formulas
          katex.render('\\frac{1}{4}, \\frac{1}{6}, \\frac{1}{8}', 
            document.getElementById('example1-formula'))
          katex.render('\\text{LCM}(4, 6, 8) = 24', 
            document.getElementById('example1-lcm'))
          katex.render('\\frac{1}{4} = \\frac{6}{24}, \\frac{1}{6} = \\frac{4}{24}, \\frac{1}{8} = \\frac{3}{24}', 
            document.getElementById('example1-result'))

          // Example 2 formulas
          katex.render('\\frac{2}{3}, \\frac{3}{4}, \\frac{5}{6}', 
            document.getElementById('example2-formula'))
          katex.render('\\text{LCM}(3, 4, 6) = 12', 
            document.getElementById('example2-lcm'))
          katex.render('\\frac{2}{3} = \\frac{8}{12}, \\frac{3}{4} = \\frac{9}{12}, \\frac{5}{6} = \\frac{10}{12}', 
            document.getElementById('example2-result'))
        } catch (error) {
          console.log('KaTeX rendering error:', error)
        }
      }
    }

    // Wait for KaTeX to be ready
    const checkKaTeX = () => {
      if (window.katex) {
        renderFormulas()
      } else {
        setTimeout(checkKaTeX, 100)
      }
    }

    const timer = setTimeout(checkKaTeX, 500)
    return () => clearTimeout(timer)
  }, [])

  // Render KaTeX formulas when results change
  useEffect(() => {
    const renderResultFormulas = () => {
      if (window.katex && result) {
        try {
          // Render LCD result
          const lcdElement = document.getElementById('lcd-result')
          if (lcdElement) {
            katex.render(`\\text{LCD} = ${result.lcd}`, lcdElement)
          }

          // Render equivalent fractions table formulas
          result.equivalentFractions.forEach((ef, index) => {
            const originalElement = document.getElementById(`original-${index}`)
            const equivalentElement = document.getElementById(`equivalent-${index}`)
            
            if (originalElement) {
              const originalStr = formatOriginalInput(ef.original)
              katex.render(originalStr, originalElement)
            }
            
            if (equivalentElement) {
              katex.render(`\\frac{${ef.result.numerator}}{${ef.result.denominator}}`, equivalentElement)
            }
          })

          // Render solution steps formulas
          result.steps.forEach((step, index) => {
            if (step.includes('\\frac') || step.includes('\\text') || step.includes('\\times')) {
              const stepElement = document.getElementById(`step-${index}`)
              if (stepElement) {
                katex.render(step, stepElement)
              }
            }
          })
        } catch (error) {
          console.log('KaTeX result rendering error:', error)
        }
      }
    }

    const timer = setTimeout(renderResultFormulas, 100)
    return () => clearTimeout(timer)
  }, [result])

  return (
    <div className="tool-page">
      {/* Hero Section */}
      <section className="tool-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <i className="fas fa-sort-numeric-down"></i>
              LCD Calculator
            </h1>
            <p className="hero-description">
              Find the Least Common Denominator (LCD) of multiple fractions and convert them to equivalent fractions. 
              Perfect for students learning fraction operations and teachers explaining mathematical concepts.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Multiple fractions support
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Equivalent fractions display
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
                  <Link to="/math/calculators/fraction-calculator" className="tool-link">
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
                  <Link to="/math/calculators/lcd-calculator" className="tool-link active">
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
                    LCD Calculator
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="calculator-form">
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
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-calculator"></i>
                        Calculate LCD
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
                    <div className="result-section show">
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
                      <a href="#what-is-lcd" className="toc-link">What is LCD?</a>
                      <a href="#formulas" className="toc-link">Formulas & Methods</a>
                      <a href="#how-to-use" className="toc-link">How to Use LCD Calculator</a>
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
                    </div>
                  </div>

                  {/* What is LCD */}
                  <div id="what-is-lcd" className="content-block">
                    <h2 className="content-title">What is LCD (Least Common Denominator)?</h2>
                    <div className="content-intro">
                      <p>
                        The Least Common Denominator (LCD) is the smallest positive integer that is a multiple 
                        of all the denominators in a given set of fractions. It's essentially the Least Common 
                        Multiple (LCM) of the denominators.
                      </p>
                    </div>
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
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
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
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use LCD Calculator</h2>
                    <div className="content-intro">
                      <p>Using the LCD calculator is straightforward:</p>
                    </div>
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
                  </div>

                  {/* Examples */}
                  <div id="examples" className="content-block">
                    <h2 className="content-title">Examples</h2>
                    
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
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
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
                  </div>

                  {/* Functionality */}
                  <div id="functionality" className="content-block">
                    <h2 className="content-title">Functionality</h2>
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
                  </div>

                  {/* Applications */}
                  <div id="applications" className="content-block">
                    <h2 className="content-title">Applications</h2>
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
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
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

export default LCDCalculator
