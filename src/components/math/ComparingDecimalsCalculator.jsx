import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
// import '../../assets/css/math/comparing-decimals-calculator.css'

const ComparingDecimalsCalculator = () => {
  const [firstDecimal, setFirstDecimal] = useState('')
  const [secondDecimal, setSecondDecimal] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Validate decimal input
  const validateDecimalInput = (value) => {
    const pattern = /^-?\d*\.?\d*$/
    return pattern.test(value)
  }

  const handleFirstDecimalChange = (e) => {
    const value = e.target.value
    if (validateDecimalInput(value)) {
      setFirstDecimal(value)
    }
  }

  const handleSecondDecimalChange = (e) => {
    const value = e.target.value
    if (validateDecimalInput(value)) {
      setSecondDecimal(value)
    }
  }

  const calculateComparison = () => {
    try {
      if (!firstDecimal.trim()) {
        throw new Error('Please enter the first decimal number')
      }

      if (!secondDecimal.trim()) {
        throw new Error('Please enter the second decimal number')
      }

      const firstNum = parseFloat(firstDecimal)
      const secondNum = parseFloat(secondDecimal)

      if (isNaN(firstNum)) {
        throw new Error('Please enter a valid first decimal number')
      }

      if (isNaN(secondNum)) {
        throw new Error('Please enter a valid second decimal number')
      }

      let comparison = ''
      let symbol = ''
      let explanation = ''
      let comparisonLatex = ''

      if (firstNum > secondNum) {
        comparison = `${firstNum} > ${secondNum}`
        symbol = '>'
        explanation = `${firstNum} is greater than ${secondNum}`
        comparisonLatex = `${firstNum} > ${secondNum}`
      } else if (firstNum < secondNum) {
        comparison = `${firstNum} < ${secondNum}`
        symbol = '<'
        explanation = `${firstNum} is less than ${secondNum}`
        comparisonLatex = `${firstNum} < ${secondNum}`
      } else {
        comparison = `${firstNum} = ${secondNum}`
        symbol = '='
        explanation = `${firstNum} is equal to ${secondNum}`
        comparisonLatex = `${firstNum} = ${secondNum}`
      }

      // Generate solution steps
      let steps = []
      steps.push(`Step 1: Identify the decimal numbers`)
      steps.push(`First decimal: ${firstNum}`)
      steps.push(`Second decimal: ${secondNum}`)
      
      steps.push(`Step 2: Compare the numbers`)
      
      if (firstNum !== secondNum) {
        const diff = Math.abs(firstNum - secondNum)
        steps.push(`Difference: |${firstNum} - ${secondNum}| = ${diff}`)
        
        if (firstNum > secondNum) {
          steps.push(`Since ${firstNum} > ${secondNum}, the first number is larger`)
        } else {
          steps.push(`Since ${firstNum} < ${secondNum}, the second number is larger`)
        }
      } else {
        steps.push(`Both numbers are exactly equal: ${firstNum} = ${secondNum}`)
      }

      steps.push(`Step 3: Final result`)
      steps.push(`${explanation}`)

      setResult({
        comparison: comparison,
        comparisonLatex: comparisonLatex,
        firstNum: firstNum,
        secondNum: secondNum,
        symbol: symbol,
        explanation: explanation,
        difference: Math.abs(firstNum - secondNum),
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
    calculateComparison()
  }

  const handleReset = () => {
    setFirstDecimal('')
    setSecondDecimal('')
    setResult(null)
    setError('')
  }

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Comparison formula
          katex.render('\\text{Compare: } a \\text{ vs } b', 
            document.getElementById('comparison-formula'))
          
          // Example 1 formulas
          katex.render('3.14 \\text{ vs } 3.14159', 
            document.getElementById('example1-formula'))
          katex.render('3.14 < 3.14159', 
            document.getElementById('example1-result'))
          katex.render('3.14 < 3.14159', 
            document.getElementById('example1-comparison'))

          // Example 2 formulas
          katex.render('2.5 \\text{ vs } 2.5', 
            document.getElementById('example2-formula'))
          katex.render('2.5 = 2.5', 
            document.getElementById('example2-result'))
          katex.render('2.5 = 2.5', 
            document.getElementById('example2-comparison'))

          // Example 3 formulas
          katex.render('-1.5 \\text{ vs } 1.5', 
            document.getElementById('example3-formula'))
          katex.render('-1.5 < 1.5', 
            document.getElementById('example3-result'))
          katex.render('-1.5 < 1.5', 
            document.getElementById('example3-comparison'))
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
          // Render comparison result
          const comparisonElement = document.getElementById('comparison-result')
          if (comparisonElement) {
            katex.render(result.comparisonLatex, comparisonElement)
          }

          // Render solution steps formulas
          result.steps.forEach((step, index) => {
            if (step.includes('>') || step.includes('<') || step.includes('=')) {
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
              <i className="fas fa-sort-numeric-up"></i>
              Comparing Decimals Calculator
            </h1>
            <p className="hero-description">
              Compare decimal numbers with precision and get detailed step-by-step solutions. 
              Perfect for students learning decimal comparison and anyone working with precise numerical calculations.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Precise decimal comparison
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Visual comparison results
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
                  <Link to="/math/calculators/lcd-calculator" className="tool-link">
                    <i className="fas fa-sort-numeric-down"></i>
                    <span>LCD Calculator</span>
                  </Link>
                  <Link to="/math/calculators/comparing-fractions-calculator" className="tool-link">
                    <i className="fas fa-balance-scale"></i>
                    <span>Compare Fractions</span>
                  </Link>
                  <Link to="/math/calculators/comparing-decimals-calculator" className="tool-link active">
                    <i className="fas fa-sort-numeric-up"></i>
                    <span>Compare Decimals</span>
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
                    <i className="fas fa-sort-numeric-up"></i>
                    Comparing Decimals Calculator
                  </h2>

                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="first-decimal" className="input-label">
                        First Decimal:
                      </label>
                      <input
                        type="text"
                        id="first-decimal"
                        className="input-field"
                        value={firstDecimal}
                        onChange={handleFirstDecimalChange}
                        placeholder="e.g., 3.14, -1.5, 2.5"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="second-decimal" className="input-label">
                        Second Decimal:
                      </label>
                      <input
                        type="text"
                        id="second-decimal"
                        className="input-field"
                        value={secondDecimal}
                        onChange={handleSecondDecimalChange}
                        placeholder="e.g., 3.14159, 1.5, 2.5"
                      />
                    </div>

                    <small className="input-help">
                      Enter valid decimal numbers (positive, negative, or zero)
                    </small>

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-sort-numeric-up"></i>
                        Compare Decimals
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
                      <h3 className="result-title">Comparison Result</h3>
                      <div className="result-content">
                        <div className="result-main">
                          <div className="result-item">
                            <strong>Comparison:</strong>
                            <div className="result-formula" id="comparison-result"></div>
                          </div>
                          <div className="result-item">
                            <strong>Explanation:</strong>
                            <span>{result.explanation}</span>
                          </div>
                          </div>

                          <div className="result-table">
                          <h4>Comparison Details:</h4>
                            <table className="styled-table">
                              <thead>
                                <tr>
                                  <th>Property</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>First Decimal</td>
                                <td>{result.firstNum}</td>
                                </tr>
                                <tr>
                                  <td>Second Decimal</td>
                                <td>{result.secondNum}</td>
                                </tr>
                                <tr>
                                  <td>Comparison</td>
                                  <td>{result.comparison}</td>
                                </tr>
                                <tr>
                                  <td>Difference</td>
                                  <td>{result.difference}</td>
                                </tr>
                              </tbody>
                            </table>
                        </div>
                        
                        <div className="result-steps">
                          <h4>Solution Steps:</h4>
                          <div className="steps-container">
                            {result.steps.map((step, index) => (
                              <div key={index} className="step">
                                {step.includes('>') || step.includes('<') || step.includes('=') ? (
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
                      <a href="#what-is-decimal-comparison" className="toc-link">What is Decimal Comparison?</a>
                      <a href="#methods" className="toc-link">Comparison Methods</a>
                      <a href="#how-to-use" className="toc-link">How to Use Calculator</a>
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
                        Decimal comparison is a fundamental mathematical skill that involves determining 
                        the relative size of decimal numbers. Whether you're working with measurements, 
                        financial calculations, or scientific data, being able to compare decimals accurately 
                        is essential for making informed decisions.
                      </p>
                      <p>
                        Our Comparing Decimals Calculator provides precise comparison results with detailed 
                        step-by-step solutions. This tool helps students understand decimal relationships 
                        and professionals ensure accurate numerical comparisons in their work.
                      </p>
                    </div>
                  </div>

                  {/* What is Decimal Comparison */}
                  <div id="what-is-decimal-comparison" className="content-block">
                    <h2 className="content-title">What is Decimal Comparison?</h2>
                    <div className="content-intro">
                      <p>
                        Decimal comparison is the process of determining which of two or more decimal numbers 
                        is greater, smaller, or equal. This involves understanding place values and the 
                        significance of each digit in the decimal representation.
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Determine the relative size of decimal numbers</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Compare digits from left to right, considering place values</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> Clear indication of which decimal is greater, smaller, or equal</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for precise calculations, measurements, and data analysis</span>
                      </li>
                    </ul>
                  </div>

                  {/* Methods */}
                  <div id="methods" className="content-block">
                    <h2 className="content-title">Comparison Methods</h2>
                    
                    <div className="formula-section">
                      <h3>Step-by-Step Comparison</h3>
                      <div className="math-formula" id="comparison-formula"></div>
                      <p>Compare digits from left to right, considering place values.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Comparison Rules</h3>
                      <ul>
                        <li><strong>Whole Numbers:</strong> Compare the integer parts first</li>
                        <li><strong>Decimal Places:</strong> Compare corresponding decimal places</li>
                        <li><strong>Trailing Zeros:</strong> Add zeros to align decimal places if needed</li>
                        <li><strong>Negative Numbers:</strong> Remember that negative numbers are smaller than positive ones</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Comparison Symbols</h3>
                      <p>
                        Use standard mathematical symbols: &gt; (greater than), &lt; (less than), = (equal to)
                      </p>
                    </div>
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use Comparing Decimals Calculator</h2>
                    <div className="content-intro">
                      <p>Using the calculator is straightforward:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter First Decimal:</strong> Input your first decimal number.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Second Decimal:</strong> Input your second decimal number.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Compare Decimals" button to get the comparison result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the comparison with step-by-step solutions.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Examples */}
                  <div id="examples" className="content-block">
                    <h2 className="content-title">Examples</h2>
                    
                    <div className="example-section">
                      <h3>Example 1: Comparing Different Decimals</h3>
                      <p>Compare: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Compare whole number parts (both are 3)</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example1-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example1-comparison"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Equal Decimals</h3>
                      <p>Compare: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Compare whole number parts (both are 2)</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example2-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example2-comparison"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Negative vs Positive</h3>
                      <p>Compare: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> One is negative, one is positive</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example3-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example3-comparison"></div></p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Understanding decimal comparison is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for precise measurements and calculations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for understanding number lines and ordering</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in financial calculations, scientific measurements, and data analysis</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Helps develop critical thinking and analytical skills</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Important for standardized tests and academic success</span>
                      </li>
                    </ul>
                  </div>

                  {/* Functionality */}
                  <div id="functionality" className="content-block">
                    <h2 className="content-title">Functionality</h2>
                    <p>Our Comparing Decimals Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Precise Comparison:</strong> Accurate comparison of decimal numbers with any number of decimal places</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Input Validation:</strong> Validates decimal input and prevents invalid entries</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Clear Results:</strong> Shows the comparison with proper mathematical notation</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Step-by-step Solutions:</strong> Detailed explanation of the comparison process</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Error Handling:</strong> Provides helpful error messages for invalid inputs</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Comparison Table:</strong> Displays detailed comparison information in a structured format</span>
                      </li>
                    </ul>
                  </div>

                  {/* Applications */}
                  <div id="applications" className="content-block">
                    <h2 className="content-title">Applications</h2>
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching decimal concepts and mathematical comparison skills</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Comparing interest rates, prices, and financial calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-ruler"></i> Engineering</h4>
                        <p>Precise measurements and technical calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific data analysis</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-shopping-cart"></i> Commerce</h4>
                        <p>Price comparisons and inventory management</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Statistics</h4>
                        <p>Data analysis and statistical comparisons</p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
                    <FAQSection 
                      faqs={[
                        {
                          question: "What decimal formats are supported?",
                          answer: "The calculator supports positive decimals, negative decimals, and zero. Examples: 3.14, -1.5, 0.001, 2.0"
                        },
                        {
                          question: "How accurate are the comparisons?",
                          answer: "The calculator provides highly accurate comparisons using JavaScript's parseFloat function, which handles floating-point precision appropriately."
                        },
                        {
                          question: "Can I compare more than two decimals?",
                          answer: "Currently, the calculator compares two decimal numbers at a time. For multiple comparisons, you can use it multiple times."
                        },
                        {
                          question: "What if I enter invalid decimals?",
                          answer: "The calculator will show an error message explaining what went wrong and provide examples of supported formats."
                        },
                        {
                          question: "How does the calculator handle equal decimals?",
                          answer: "When two decimals are exactly equal, the calculator shows them as equal using the = symbol."
                        },
                        {
                          question: "Can I compare decimals with different numbers of decimal places?",
                          answer: "Yes, the calculator can compare decimals with any number of decimal places. It handles the comparison correctly regardless of the number of decimal places."
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

export default ComparingDecimalsCalculator 
