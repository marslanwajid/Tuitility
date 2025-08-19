import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
// import '../../assets/css/math/comparing-fractions-calculator.css'

const ComparingFractionsCalculator = () => {
  const [firstValue, setFirstValue] = useState('')
  const [secondValue, setSecondValue] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Utility function to parse various input formats
  const parseValue = (value) => {
    try {
      value = value.trim()
      if (!value) {
        throw new Error('Empty value provided')
      }

      if (value.includes('%')) {
        const percentValue = parseFloat(value.replace('%', ''))
        if (isNaN(percentValue)) {
          throw new Error('Invalid percentage format')
        }
        return percentValue / 100
      } else if (value.includes('/')) {
        const parts = value.split(' ')
        let whole = 0, num = 0, den = 1
        
        if (parts.length === 2) {
          // Mixed number (e.g., "2 3/5")
          whole = parseInt(parts[0])
          if (isNaN(whole)) {
            throw new Error('Invalid whole number in mixed fraction')
          }
          
          const fraction = parts[1].split('/')
          if (fraction.length !== 2) {
            throw new Error('Invalid fraction format in mixed number')
          }
          
          num = parseInt(fraction[0])
          den = parseInt(fraction[1])
          
          if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error('Invalid numerator or denominator in mixed fraction')
          }
          
          return whole + (num / den)
        } else {
          // Simple fraction (e.g., "3/4")
          const fraction = parts[0].split('/')
          if (fraction.length !== 2) {
            throw new Error('Invalid fraction format')
          }
          
          num = parseInt(fraction[0])
          den = parseInt(fraction[1])
          
          if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error('Invalid numerator or denominator')
          }
          
          return num / den
        }
      } else {
        // Decimal number
        const decimal = parseFloat(value)
        if (isNaN(decimal)) {
          throw new Error('Invalid decimal number')
        }
        return decimal
      }
    } catch (error) {
      throw new Error(`Error parsing "${value}": ${error.message}`)
    }
  }

  // Format value for LaTeX display
  const formatValueForLatex = (value) => {
    if (value.includes('%')) {
      const percentValue = parseFloat(value.replace('%', ''))
      return `${percentValue}\\%`
    } else if (value.includes('/')) {
      const parts = value.split(' ')
      if (parts.length === 2) {
        // Mixed number
        const whole = parts[0]
        const fraction = parts[1]
        return `${whole}\\;\\frac{${fraction.split('/')[0]}}{${fraction.split('/')[1]}}`
      } else {
        // Simple fraction
        const [num, den] = value.split('/')
        return `\\frac{${num}}{${den}}`
      }
    } else {
      return value
    }
  }

  const calculateComparison = () => {
    try {
      if (!firstValue.trim() || !secondValue.trim()) {
        throw new Error('Please enter both values to compare')
      }

      const firstDecimal = parseValue(firstValue)
      const secondDecimal = parseValue(secondValue)

      let comparison = ''
      let comparisonSymbol = ''
      let comparisonLatex = ''
      
      if (Math.abs(firstDecimal - secondDecimal) < 0.0000001) {
        // Handle floating point precision issues
        comparison = `${firstValue} = ${secondValue}`
        comparisonSymbol = '='
        comparisonLatex = `${formatValueForLatex(firstValue)} = ${formatValueForLatex(secondValue)}`
      } else if (firstDecimal > secondDecimal) {
        comparison = `${firstValue} > ${secondValue}`
        comparisonSymbol = '>'
        comparisonLatex = `${formatValueForLatex(firstValue)} > ${formatValueForLatex(secondValue)}`
      } else {
        comparison = `${firstValue} < ${secondValue}`
        comparisonSymbol = '<'
        comparisonLatex = `${formatValueForLatex(firstValue)} < ${formatValueForLatex(secondValue)}`
      }

      // Generate solution steps
      let steps = []
      steps.push(`Step 1: Convert both values to decimal form`)
      steps.push(`First value: ${formatValueForLatex(firstValue)} = ${firstDecimal.toFixed(6)}`)
      steps.push(`Second value: ${formatValueForLatex(secondValue)} = ${secondDecimal.toFixed(6)}`)
      steps.push(`Step 2: Compare the decimal values`)
      steps.push(`${firstDecimal.toFixed(6)} ${comparisonSymbol} ${secondDecimal.toFixed(6)}`)
      steps.push(`Final Result: ${comparisonLatex}`)

      setResult({
        comparison: comparison,
        comparisonLatex: comparisonLatex,
        firstDecimal: firstDecimal,
        secondDecimal: secondDecimal,
        comparisonSymbol: comparisonSymbol,
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
    setFirstValue('')
    setSecondValue('')
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
          katex.render('\\frac{3}{4} \\text{ vs } \\frac{2}{3}', 
            document.getElementById('example1-formula'))
          katex.render('0.75 > 0.666667', 
            document.getElementById('example1-result'))
          katex.render('\\frac{3}{4} > \\frac{2}{3}', 
            document.getElementById('example1-comparison'))

          // Example 2 formulas
          katex.render('1\\;\\frac{1}{2} \\text{ vs } 1.25', 
            document.getElementById('example2-formula'))
          katex.render('1.5 > 1.25', 
            document.getElementById('example2-result'))
          katex.render('1\\;\\frac{1}{2} > 1.25', 
            document.getElementById('example2-comparison'))

          // Example 3 formulas
          katex.render('75\\% \\text{ vs } \\frac{3}{4}', 
            document.getElementById('example3-formula'))
          katex.render('0.75 = 0.75', 
            document.getElementById('example3-result'))
          katex.render('75\\% = \\frac{3}{4}', 
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
            if (step.includes('\\frac') || step.includes('\\%') || step.includes('\\;')) {
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
              <i className="fas fa-balance-scale"></i>
              Comparing Fractions Calculator
            </h1>
            <p className="hero-description">
              Compare fractions, decimals, percentages, and mixed numbers with step-by-step solutions. 
              Perfect for students learning number comparison and teachers explaining mathematical concepts.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Multiple number formats
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
                  <Link to="/math/calculators/comparing-fractions-calculator" className="tool-link active">
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
                    <i className="fas fa-balance-scale"></i>
                    Comparing Fractions Calculator
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="first-value" className="input-label">
                        First Value:
                      </label>
                      <input
                        type="text"
                        id="first-value"
                        className="input-field"
                        value={firstValue}
                        onChange={(e) => setFirstValue(e.target.value)}
                        placeholder="e.g., 3/4, 1.5, 75%"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="second-value" className="input-label">
                        Second Value:
                      </label>
                      <input
                        type="text"
                        id="second-value"
                        className="input-field"
                        value={secondValue}
                        onChange={(e) => setSecondValue(e.target.value)}
                        placeholder="e.g., 2/3, 1.25, 80%"
                      />
                    </div>

                    <small className="input-help">
                      Supported formats: Fractions (3/4), Mixed numbers (1 1/2), Decimals (1.5), Percentages (75%)
                    </small>

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-balance-scale"></i>
                        Compare Values
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
                        </div>
                        
                        <div className="result-steps">
                          <h4>Solution Steps:</h4>
                          <div className="steps-container">
                            {result.steps.map((step, index) => (
                              <div key={index} className="step">
                                {step.includes('\\frac') || step.includes('\\%') || step.includes('\\;') ? (
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
                      <a href="#what-is-comparison" className="toc-link">What is Number Comparison?</a>
                      <a href="#formulas" className="toc-link">Formulas & Methods</a>
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
                        Number comparison is a fundamental mathematical skill that helps us understand 
                        relationships between different numerical representations. Whether you're working 
                        with fractions, decimals, percentages, or mixed numbers, being able to compare 
                        them accurately is essential for problem-solving and decision-making.
                      </p>
                      <p>
                        Our Comparing Fractions Calculator simplifies this process by automatically 
                        converting different number formats to a common representation (decimal) and 
                        providing clear step-by-step solutions. This tool is perfect for students 
                        learning number comparison and anyone working with mathematical calculations.
                      </p>
                    </div>
                  </div>

                  {/* What is Number Comparison */}
                  <div id="what-is-comparison" className="content-block">
                    <h2 className="content-title">What is Number Comparison?</h2>
                    <div className="content-intro">
                      <p>
                        Number comparison is the process of determining which of two or more numbers 
                        is greater, smaller, or equal. This involves converting different number formats 
                        to a common representation for accurate comparison.
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Determine the relative size of different numbers</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Convert to common format (usually decimal) for comparison</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> Clear indication of which number is greater, smaller, or equal</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for mathematical operations, problem-solving, and real-world applications</span>
                      </li>
                    </ul>
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
                    <div className="formula-section">
                      <h3>Comparison Method</h3>
                      <div className="math-formula" id="comparison-formula"></div>
                      <p>Convert both numbers to decimal form and compare the values.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Conversion Rules</h3>
                      <ul>
                        <li><strong>Fractions:</strong> Divide numerator by denominator</li>
                        <li><strong>Mixed Numbers:</strong> Convert to improper fraction, then to decimal</li>
                        <li><strong>Percentages:</strong> Divide by 100</li>
                        <li><strong>Decimals:</strong> Already in comparable format</li>
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
                    <h2 className="content-title">How to Use Comparing Fractions Calculator</h2>
                    <div className="content-intro">
                      <p>Using the calculator is straightforward:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter First Value:</strong> Input your first number in any supported format.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Second Value:</strong> Input your second number in any supported format.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Compare Values" button to get the comparison result.</span>
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
                      <h3>Example 1: Comparing Fractions</h3>
                      <p>Compare: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to decimals</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example1-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example1-comparison"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Mixed Number vs Decimal</h3>
                      <p>Compare: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert mixed number to decimal</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example2-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example2-comparison"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Percentage vs Fraction</h3>
                      <p>Compare: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert both to decimals</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example3-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example3-comparison"></div></p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Understanding number comparison is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for ordering numbers and understanding numerical relationships</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for solving inequalities and mathematical problems</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in real-world applications like measurements, finance, and statistics</span>
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
                    <p>Our Comparing Fractions Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Multiple Input Formats:</strong> Supports fractions, mixed numbers, decimals, and percentages</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Automatic Conversion:</strong> Converts all inputs to decimal form for accurate comparison</span>
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
                        <p>Teaching number comparison and mathematical concepts in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Comparing interest rates, returns, and financial ratios</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-ruler"></i> Construction</h4>
                        <p>Comparing measurements and material quantities</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-utensils"></i> Cooking</h4>
                        <p>Comparing recipe proportions and ingredient ratios</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Engineering</h4>
                        <p>Precise calculations and measurements in various fields</p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
                    <FAQSection 
                      faqs={[
                        {
                          question: "What number formats are supported?",
                          answer: "The calculator supports fractions (3/4), mixed numbers (1 1/2), decimals (1.5), and percentages (75%)."
                        },
                        {
                          question: "How accurate are the comparisons?",
                          answer: "The calculator provides highly accurate comparisons by converting all numbers to decimal form with sufficient precision."
                        },
                        {
                          question: "Can I compare more than two numbers?",
                          answer: "Currently, the calculator compares two numbers at a time. For multiple comparisons, you can use it multiple times."
                        },
                        {
                          question: "What if I enter invalid numbers?",
                          answer: "The calculator will show an error message explaining what went wrong and provide examples of supported formats."
                        },
                        {
                          question: "How does the calculator handle equal numbers?",
                          answer: "When two numbers are equal (within floating-point precision), the calculator shows them as equal using the = symbol."
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

export default ComparingFractionsCalculator
