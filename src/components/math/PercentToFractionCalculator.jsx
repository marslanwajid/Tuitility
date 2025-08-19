import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
// import '../../assets/css/math/percent-to-fraction-calculator.css'

const PercentToFractionCalculator = () => {
  const [percentage, setPercentage] = useState('25')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Handle input changes
  const handleInputChange = (value) => {
    // Validate input - allow numbers, decimals, and negative signs
    const validatedValue = value.replace(/[^\d.-]/g, '')
    
    // Ensure only one decimal point
    const decimalCount = (validatedValue.match(/\./g) || []).length
    if (decimalCount > 1) {
      return
    }
    
    setPercentage(validatedValue)
  }

  // Function to find GCD
  const gcd = (a, b) => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  // Function to simplify fractions
  const simplifyFraction = (numerator, denominator) => {
    const divisor = gcd(numerator, denominator)
    return {
      numerator: numerator / divisor,
      denominator: denominator / divisor,
      gcd: divisor
    }
  }

  // Function to format number
  const formatNumber = (number) => {
    if (number.toString().includes('.')) {
      const decimalPlaces = number.toString().split('.')[1].length
      if (decimalPlaces > 4) {
        return number.toFixed(4)
      }
    }
    return number
  }

  const calculateFraction = () => {
    try {
      const percentageInput = parseFloat(percentage)

      // Validate inputs
      if (isNaN(percentageInput)) {
        throw new Error('Please enter a valid percentage')
      }

      // Convert percentage to decimal
      const decimal = percentageInput / 100
      
      // Convert to fraction
      const decimalStr = decimal.toString()
      const decimalPlaces = (decimalStr.includes('.')) 
        ? decimalStr.split('.')[1].length 
        : 0
      
      const denominator = Math.pow(10, decimalPlaces)
      const numerator = decimal * denominator
      
      // Simplify the fraction
      const initialNumerator = Math.round(numerator)
      const initialDenominator = denominator
      const simplifiedFraction = simplifyFraction(initialNumerator, initialDenominator)

      // Generate step-by-step solution
      const steps = generateSteps(percentageInput, decimal, initialNumerator, initialDenominator, simplifiedFraction)

      setResult({
        percentage: percentageInput,
        decimal,
        initialNumerator,
        initialDenominator,
        simplifiedFraction,
        steps
      })
      setError('')
    } catch (error) {
      setError(error.message)
      setResult(null)
    }
  }

  const generateSteps = (percentageInput, decimal, initialNumerator, initialDenominator, simplifiedFraction) => {
    const steps = []

    steps.push(`Step 1: Convert to decimal = ${percentageInput}% = ${percentageInput} ÷ 100 = ${formatNumber(decimal)}`)
    steps.push(`Step 2: Convert to fraction = ${formatNumber(decimal)} = \\frac{${initialNumerator}}{${initialDenominator}}`)
    steps.push(`Step 3: Find GCD = GCD(${initialNumerator}, ${initialDenominator}) = ${simplifiedFraction.gcd}`)
    
    if (simplifiedFraction.gcd === 1) {
      steps.push(`Step 4: Simplify fraction = \\frac{${initialNumerator}}{${initialDenominator}} (already simplified, GCD = 1)`)
    } else {
      steps.push(`Step 4: Simplify fraction = \\frac{${initialNumerator}}{${initialDenominator}} = \\frac{${initialNumerator} ÷ ${simplifiedFraction.gcd}}{${initialDenominator} ÷ ${simplifiedFraction.gcd}} = \\frac{${simplifiedFraction.numerator}}{${simplifiedFraction.denominator}}`)
    }
    
    steps.push(`Final Result = \\frac{${simplifiedFraction.numerator}}{${simplifiedFraction.denominator}}`)

    return steps
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    calculateFraction()
  }

  const handleReset = () => {
    setPercentage('25')
    setResult(null)
    setError('')
  }

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('\\text{Percent to Fraction: } p\\% = \\frac{p}{100}', 
            document.getElementById('formula-example'))
          
          // Example 1 formulas
          katex.render('25\\% = \\frac{25}{100} = \\frac{1}{4}', 
            document.getElementById('example1-formula'))
          
          // Example 2 formulas
          katex.render('75\\% = \\frac{75}{100} = \\frac{3}{4}', 
            document.getElementById('example2-formula'))
          
          // Example 3 formulas
          katex.render('50\\% = \\frac{50}{100} = \\frac{1}{2}', 
            document.getElementById('example3-formula'))
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

  // Render result formulas when result changes
  useEffect(() => {
    if (result && window.katex) {
      try {
        // Render input percentage
        katex.render(`\\text{Input: }${result.percentage}\\%`, 
          document.getElementById('input-percentage-formula'))
        
        // Render decimal result
        katex.render(`${result.percentage}\\% = ${result.percentage} ÷ 100 = ${formatNumber(result.decimal)}`, 
          document.getElementById('decimal-formula'))
        
        // Render fraction result
        katex.render(`\\frac{${result.simplifiedFraction.numerator}}{${result.simplifiedFraction.denominator}}`, 
          document.getElementById('fraction-formula'))

        // Render step formulas
        result.steps.forEach((step, index) => {
          if (step.includes('\\frac') || step.includes('\\text') || step.includes('GCD')) {
            const stepElement = document.getElementById(`step-formula-${index}`)
            if (stepElement) {
              katex.render(step, stepElement)
            }
          }
        })
      } catch (error) {
        console.log('KaTeX result rendering error:', error)
      }
    }
  }, [result])

  return (
    <div className="tool-page">
      {/* Hero Section */}
      <section className="tool-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <i className="fas fa-percentage"></i>
              Percent to Fraction Calculator
            </h1>
            <p className="hero-description">
              Convert percentages to simplified fractions with step-by-step solutions. 
              Perfect for students learning percentage conversions and anyone working with mathematical calculations.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Percentage conversion
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Simplified fractions
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
                  <Link to="/math/calculators/fraction-to-percent-calculator" className="tool-link">
                    <i className="fas fa-percentage"></i>
                    <span>Fraction to Percent</span>
                  </Link>
                  <Link to="/math/calculators/percent-to-fraction-calculator" className="tool-link active">
                    <i className="fas fa-percentage"></i>
                    <span>Percent to Fraction</span>
                  </Link>
                  <Link to="/math/calculators/improper-fraction-to-mixed-calculator" className="tool-link">
                    <i className="fas fa-layer-group"></i>
                    <span>Improper to Mixed</span>
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
                  <Link to="/math/calculators/comparing-decimals-calculator" className="tool-link">
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
                    <i className="fas fa-percentage"></i>
                    Percent to Fraction Calculator
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="percentage" className="input-label">
                        Percentage:
                      </label>
                      <input
                        type="text"
                        id="percentage"
                        name="percentage"
                        className="input-field"
                        value={percentage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="e.g., 25"
                      />
                    </div>

                    <small className="input-help">
                      Enter a percentage value (e.g., 25, 75.5, -10). The calculator will convert it to a simplified fraction.
                    </small>

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-percentage"></i>
                        Convert to Fraction
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
                      <h3 className="result-title">Conversion Result</h3>
                      <div className="result-content">
                        <div className="result-main">
                          <div className="result-item">
                            <strong>Input Percentage:</strong>
                            <div className="result-formula" id="input-percentage-formula"></div>
                          </div>
                          <div className="result-item">
                            <strong>Decimal Form:</strong>
                            <div className="result-formula" id="decimal-formula"></div>
                          </div>
                          <div className="result-item">
                            <strong>Simplified Fraction:</strong>
                            <div className="result-formula" id="fraction-formula"></div>
                          </div>
                        </div>
                        
                        <div className="result-steps">
                          <h4>Calculation Steps:</h4>
                          <div className="steps-container">
                            {result.steps.map((step, index) => (
                              <div key={index} className="step">
                                {step.includes('\\frac') || step.includes('\\text') || step.includes('GCD') ? (
                                  <div className="step-formula" id={`step-formula-${index}`}></div>
                                ) : step.startsWith('Step') ? (
                                  <strong>{step}</strong>
                                ) : (
                                  <p>{step}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GCD Explanation */}
                        <div className="gcd-explanation">
                          {result.simplifiedFraction.gcd === 1 ? (
                            <p className="gcd-note">
                              <strong>Note:</strong> GCD (Greatest Common Divisor) = 1<br/>
                              This means the fraction is already in its simplest form as {result.initialNumerator} and {result.initialDenominator} 
                              have no common factors other than 1.
                            </p>
                          ) : (
                            <p className="gcd-note">
                              <strong>Note:</strong> GCD (Greatest Common Divisor) = {result.simplifiedFraction.gcd}<br/>
                              This is the largest number that divides both {result.initialNumerator} and {result.initialDenominator} evenly.<br/>
                              • {result.initialNumerator} ÷ {result.simplifiedFraction.gcd} = {result.simplifiedFraction.numerator}<br/>
                              • {result.initialDenominator} ÷ {result.simplifiedFraction.gcd} = {result.simplifiedFraction.denominator}
                            </p>
                          )}
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
                      <a href="#what-is-conversion" className="toc-link">What is Percent to Fraction Conversion?</a>
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
                        Converting percentages to fractions is a fundamental mathematical skill that helps us 
                        understand and work with percentages in a more precise format. A percentage represents 
                        a part per hundred, and converting it to a fraction makes it easier to perform mathematical 
                        operations and comparisons.
                      </p>
                      <p>
                        Our Percent to Fraction Calculator simplifies this conversion process by providing 
                        step-by-step solutions. This tool helps students understand the conversion process and professionals 
                        quickly convert percentages to fractions for their calculations.
                      </p>
                    </div>
                  </div>

                  {/* What is Conversion */}
                  <div id="what-is-conversion" className="content-block">
                    <h2 className="content-title">What is Percent to Fraction Conversion?</h2>
                    <div className="content-intro">
                      <p>
                        Percent to fraction conversion is the process of transforming a percentage into its 
                        equivalent fraction representation. This involves converting the percentage to a decimal 
                        first, then expressing it as a fraction, and finally simplifying the fraction.
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Express percentages as fractions for easier mathematical operations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Convert percentage to decimal, then to fraction, then simplify</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> Simplified fraction in lowest terms</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for mathematics, finance, and everyday calculations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
                    <div className="formula-section">
                      <h3>Basic Conversion Formula</h3>
                      <div className="math-formula" id="formula-example"></div>
                      <p>Where p is the percentage value.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Conversion Steps</h3>
                      <ul>
                        <li><strong>Step 1:</strong> Convert percentage to decimal (divide by 100)</li>
                        <li><strong>Step 2:</strong> Convert decimal to fraction</li>
                        <li><strong>Step 3:</strong> Find the Greatest Common Divisor (GCD)</li>
                        <li><strong>Step 4:</strong> Simplify the fraction by dividing numerator and denominator by GCD</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Examples</h3>
                      <p>
                        Percentage: 25% = 1/4<br/>
                        Percentage: 75% = 3/4<br/>
                        Percentage: 50% = 1/2
                      </p>
                    </div>
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use Percent to Fraction Calculator</h2>
                    <div className="content-intro">
                      <p>Using the calculator is straightforward:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Percentage:</strong> Input the percentage value you want to convert.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Convert to Fraction" button to get the result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the decimal form, simplified fraction, and step-by-step solution.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Understand GCD:</strong> Learn about the Greatest Common Divisor used in simplification.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Examples */}
                  <div id="examples" className="content-block">
                    <h2 className="content-title">Examples</h2>
                    
                    <div className="example-section">
                      <h3>Example 1: Basic Conversion</h3>
                      <p>Convert: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to decimal: 25% = 25 ÷ 100 = 0.25</p>
                        <p><strong>Step 2:</strong> Convert to fraction: 0.25 = 25/100</p>
                        <p><strong>Step 3:</strong> Find GCD: GCD(25, 100) = 25</p>
                        <p><strong>Step 4:</strong> Simplify: 25/100 = (25÷25)/(100÷25) = 1/4</p>
                        <p><strong>Result:</strong> 25% = 1/4</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Another Conversion</h3>
                      <p>Convert: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to decimal: 75% = 75 ÷ 100 = 0.75</p>
                        <p><strong>Step 2:</strong> Convert to fraction: 0.75 = 75/100</p>
                        <p><strong>Step 3:</strong> Find GCD: GCD(75, 100) = 25</p>
                        <p><strong>Step 4:</strong> Simplify: 75/100 = (75÷25)/(100÷25) = 3/4</p>
                        <p><strong>Result:</strong> 75% = 3/4</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Simple Conversion</h3>
                      <p>Convert: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to decimal: 50% = 50 ÷ 100 = 0.5</p>
                        <p><strong>Step 2:</strong> Convert to fraction: 0.5 = 50/100</p>
                        <p><strong>Step 3:</strong> Find GCD: GCD(50, 100) = 50</p>
                        <p><strong>Step 4:</strong> Simplify: 50/100 = (50÷50)/(100÷50) = 1/2</p>
                        <p><strong>Result:</strong> 50% = 1/2</p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Understanding percent to fraction conversion is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for understanding percentage concepts and mathematical operations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for advanced mathematics, algebra, and calculus</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in financial calculations and statistical analysis</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Important for standardized tests and academic success</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Helps develop critical thinking and mathematical reasoning skills</span>
                      </li>
                    </ul>
                  </div>

                  {/* Functionality */}
                  <div id="functionality" className="content-block">
                    <h2 className="content-title">Functionality</h2>
                    <p>Our Percent to Fraction Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Input Validation:</strong> Ensures valid percentage values including decimals and negative numbers</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Accurate Results:</strong> Provides both decimal and simplified fraction results</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Step-by-step Solutions:</strong> Detailed explanation of the conversion process</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>GCD Explanation:</strong> Clear explanation of the Greatest Common Divisor used</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Error Handling:</strong> Clear error messages for invalid inputs</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Mathematical Notation:</strong> Proper fraction display with LaTeX rendering</span>
                      </li>
                    </ul>
                  </div>

                  {/* Applications */}
                  <div id="applications" className="content-block">
                    <h2 className="content-title">Applications</h2>
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching percentage concepts and mathematical conversions in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Financial calculations, interest rates, and percentage conversions</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Statistics</h4>
                        <p>Statistical analysis and data interpretation</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-cogs"></i> Manufacturing</h4>
                        <p>Production calculations and quality control measurements</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-home"></i> Construction</h4>
                        <p>Building measurements and material calculations</p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
                    <FAQSection 
                      faqs={[
                        {
                          question: "What is a percentage?",
                          answer: "A percentage is a number or ratio expressed as a fraction of 100. It is often denoted using the percent sign, %."
                        },
                        {
                          question: "How do I convert a percentage to a fraction?",
                          answer: "To convert a percentage to a fraction: 1) Divide the percentage by 100 to get a decimal, 2) Convert the decimal to a fraction, 3) Simplify the fraction using the Greatest Common Divisor (GCD)."
                        },
                        {
                          question: "What is GCD and why is it important?",
                          answer: "GCD (Greatest Common Divisor) is the largest number that divides both the numerator and denominator evenly. It's used to simplify fractions to their lowest terms."
                        },
                        {
                          question: "Can I convert negative percentages?",
                          answer: "Yes, the calculator handles negative percentages. The result will be a negative fraction."
                        },
                        {
                          question: "What if the percentage has decimals?",
                          answer: "The calculator can handle decimal percentages (e.g., 25.5%). It will convert them to fractions with appropriate precision."
                        },
                        {
                          question: "How accurate are the conversions?",
                          answer: "The calculator provides 100% accurate conversions using standard mathematical operations and proper fraction simplification."
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

export default PercentToFractionCalculator
