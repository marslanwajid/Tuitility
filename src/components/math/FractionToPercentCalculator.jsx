import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
// import '../../assets/css/math/fraction-to-percent-calculator.css'

const FractionToPercentCalculator = () => {
  const [activeTab, setActiveTab] = useState('tab-1')
  const [simpleFraction, setSimpleFraction] = useState({ numerator: '3', denominator: '4' })
  const [mixedNumber, setMixedNumber] = useState({ whole: '1', numerator: '2', denominator: '3' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Handle tab switching
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setResult(null)
    setError('')
  }

  // Handle simple fraction input changes
  const handleSimpleFractionChange = (field, value) => {
    // Validate input - only allow positive numbers
    const validatedValue = value.replace(/[^0-9.]/g, '')
    
    // Special handling for denominator (cannot be 0)
    if (field === 'denominator' && validatedValue === '0') {
      return
    }
    
    setSimpleFraction(prev => ({
      ...prev,
      [field]: validatedValue
    }))
  }

  // Handle mixed number input changes
  const handleMixedNumberChange = (field, value) => {
    // Validate input - only allow positive numbers
    const validatedValue = value.replace(/[^0-9.]/g, '')
    
    // Special handling for denominator (cannot be 0)
    if (field === 'denominator' && validatedValue === '0') {
      return
    }
    
    setMixedNumber(prev => ({
      ...prev,
      [field]: validatedValue
    }))
  }

  const calculateFractionToPercent = () => {
    try {
      let numerator, denominator, whole = 0
      let steps = []
      let inputDisplay = ''

      if (activeTab === 'tab-1') {
        // Simple fraction
        numerator = parseFloat(simpleFraction.numerator)
        denominator = parseFloat(simpleFraction.denominator)
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          throw new Error('Please enter valid numbers. Denominator cannot be zero.')
        }

        inputDisplay = `${numerator}/${denominator}`
        steps.push(`Step 1: Start with fraction: ${numerator}/${denominator}`)
        
      } else if (activeTab === 'tab-2') {
        // Mixed number
        whole = parseFloat(mixedNumber.whole) || 0
        numerator = parseFloat(mixedNumber.numerator)
        denominator = parseFloat(mixedNumber.denominator)
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          throw new Error('Please enter valid numbers. Denominator cannot be zero.')
        }

        inputDisplay = `${whole} ${numerator}/${denominator}`
        steps.push(`Step 1: Start with mixed number: ${whole} ${numerator}/${denominator}`)
        
        // Convert to improper fraction
        const improperNumerator = (whole * denominator) + numerator
        steps.push(`Step 2: Convert to improper fraction: (${whole} × ${denominator}) + ${numerator} = ${improperNumerator}/${denominator}`)
        
        numerator = improperNumerator
      }

      // Calculate decimal
      const decimal = numerator / denominator
      steps.push(`Step ${activeTab === 'tab-1' ? '2' : '3'}: Divide: ${numerator} ÷ ${denominator} = ${formatDecimal(decimal)}`)
      
      // Calculate percentage
      const percentage = decimal * 100
      steps.push(`Step ${activeTab === 'tab-1' ? '3' : '4'}: Multiply by 100: ${formatDecimal(decimal)} × 100 = ${formatDecimal(percentage)}%`)

      setResult({
        inputDisplay: inputDisplay,
        percentage: formatDecimal(percentage),
        decimal: formatDecimal(decimal),
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
    
    // Round to 4 decimal places and remove trailing zeros
    let str = number.toFixed(4)
    str = str.replace(/\.?0+$/, "")
    return str
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    calculateFractionToPercent()
  }

  const handleReset = () => {
    setSimpleFraction({ numerator: '3', denominator: '4' })
    setMixedNumber({ whole: '1', numerator: '2', denominator: '3' })
    setResult(null)
    setError('')
  }

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('\\text{Fraction to Percent: } \\frac{a}{b} \\times 100 = \\%', 
            document.getElementById('formula-example'))
          
          // Example 1 formulas
          katex.render('\\frac{3}{4} = 0.75 \\times 100 = 75\\%', 
            document.getElementById('example1-formula'))
          
          // Example 2 formulas
          katex.render('1\\;\\frac{2}{3} = \\frac{5}{3} = 1.6667 \\times 100 = 166.67\\%', 
            document.getElementById('example2-formula'))
          
          // Example 3 formulas
          katex.render('\\frac{1}{2} = 0.5 \\times 100 = 50\\%', 
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

  return (
    <div className="tool-page">
      {/* Hero Section */}
      <section className="tool-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <i className="fas fa-percentage"></i>
              Fraction to Percent Calculator
            </h1>
            <p className="hero-description">
              Convert fractions and mixed numbers to percentages with step-by-step solutions. 
              Perfect for students learning fraction conversions and anyone working with mathematical calculations.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Simple fractions & mixed numbers
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Decimal and percentage results
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
                  <Link to="/math/calculators/fraction-to-percent-calculator" className="tool-link active">
                    <i className="fas fa-percentage"></i>
                    <span>Fraction to Percent</span>
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
                    Fraction to Percent Calculator
                  </h2>
                  
                  {/* Tab Navigation */}
                  <div className="tab-navigation">
                    <button 
                      className={`tab-button ${activeTab === 'tab-1' ? 'active' : ''}`}
                      onClick={() => handleTabChange('tab-1')}
                    >
                      <i className="fas fa-divide"></i>
                      Simple Fraction
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'tab-2' ? 'active' : ''}`}
                      onClick={() => handleTabChange('tab-2')}
                    >
                      <i className="fas fa-layer-group"></i>
                      Mixed Number
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="calculator-form">
                    {/* Tab 1: Simple Fraction */}
                    <div className={`tab-content ${activeTab === 'tab-1' ? 'active' : ''}`} id="tab-1">
                      <div className="input-group">
                        <label htmlFor="numerator" className="input-label">
                          Numerator:
                        </label>
                        <input
                          type="text"
                          id="numerator"
                          name="numerator"
                          className="input-field"
                          value={simpleFraction.numerator}
                          onChange={(e) => handleSimpleFractionChange('numerator', e.target.value)}
                          placeholder="e.g., 3"
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="denominator" className="input-label">
                          Denominator:
                        </label>
                        <input
                          type="text"
                          id="denominator"
                          name="denominator"
                          className="input-field bottom"
                          value={simpleFraction.denominator}
                          onChange={(e) => handleSimpleFractionChange('denominator', e.target.value)}
                          placeholder="e.g., 4"
                        />
                      </div>
                    </div>

                    {/* Tab 2: Mixed Number */}
                    <div className={`tab-content ${activeTab === 'tab-2' ? 'active' : ''}`} id="tab-2">
                      <div className="input-group">
                        <label htmlFor="whole" className="input-label">
                          Whole Number:
                        </label>
                        <input
                          type="text"
                          id="whole"
                          name="whole"
                          className="input-field"
                          value={mixedNumber.whole}
                          onChange={(e) => handleMixedNumberChange('whole', e.target.value)}
                          placeholder="e.g., 1"
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="mixed-numerator" className="input-label">
                          Numerator:
                        </label>
                        <input
                          type="text"
                          id="mixed-numerator"
                          name="numerator"
                          className="input-field"
                          value={mixedNumber.numerator}
                          onChange={(e) => handleMixedNumberChange('numerator', e.target.value)}
                          placeholder="e.g., 2"
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="mixed-denominator" className="input-label">
                          Denominator:
                        </label>
                        <input
                          type="text"
                          id="mixed-denominator"
                          name="denominator"
                          className="input-field bottom"
                          value={mixedNumber.denominator}
                          onChange={(e) => handleMixedNumberChange('denominator', e.target.value)}
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>

                    <small className="input-help">
                      Enter positive numbers only. Denominator cannot be zero.
                    </small>

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-percentage"></i>
                        Convert to Percent
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
                            <strong>Input:</strong>
                            <span>{result.inputDisplay}</span>
                          </div>
                          <div className="result-item">
                            <strong>Percentage:</strong>
                            <span className="result-percentage">{result.percentage}%</span>
                          </div>
                          <div className="result-item">
                            <strong>Decimal:</strong>
                            <span className="result-decimal">{result.decimal}</span>
                          </div>
                        </div>
                        
                        <div className="result-steps">
                          <h4>Calculation Steps:</h4>
                          <div className="steps-container">
                            {result.steps.map((step, index) => (
                              <div key={index} className="step">
                                <p>{step}</p>
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
                      <a href="#what-is-conversion" className="toc-link">What is Fraction to Percent Conversion?</a>
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
                        Converting fractions to percentages is a fundamental mathematical skill that helps us 
                        understand proportions and ratios in a more familiar format. Whether you're working with 
                        simple fractions or mixed numbers, being able to convert them to percentages is essential 
                        for various applications in mathematics, science, and everyday life.
                      </p>
                      <p>
                        Our Fraction to Percent Calculator simplifies this conversion process by providing 
                        step-by-step solutions. This tool helps students understand the conversion process 
                        and professionals quickly convert fractions to percentages for their calculations.
                      </p>
                    </div>
                  </div>

                  {/* What is Conversion */}
                  <div id="what-is-conversion" className="content-block">
                    <h2 className="content-title">What is Fraction to Percent Conversion?</h2>
                    <div className="content-intro">
                      <p>
                        Fraction to percent conversion is the process of transforming a fraction or mixed number 
                        into its equivalent percentage representation. This involves converting the fraction to 
                        a decimal first, then multiplying by 100 to get the percentage.
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Express fractions as percentages for easier understanding and comparison</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Convert fraction to decimal, then multiply by 100</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> Percentage value that represents the same proportion as the original fraction</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for statistics, finance, science, and everyday calculations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
                    <div className="formula-section">
                      <h3>Basic Conversion Formula</h3>
                      <div className="math-formula" id="formula-example"></div>
                      <p>Convert fraction to decimal, then multiply by 100 to get percentage.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Conversion Steps</h3>
                      <ul>
                        <li><strong>Step 1:</strong> Convert fraction to decimal (divide numerator by denominator)</li>
                        <li><strong>Step 2:</strong> Multiply decimal by 100 to get percentage</li>
                        <li><strong>For Mixed Numbers:</strong> Convert to improper fraction first, then follow the same steps</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Examples</h3>
                      <p>
                        Simple fraction: 3/4 = 0.75 × 100 = 75%<br/>
                        Mixed number: 1 2/3 = 5/3 = 1.6667 × 100 = 166.67%
                      </p>
                    </div>
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use Fraction to Percent Calculator</h2>
                    <div className="content-intro">
                      <p>Using the calculator is straightforward:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Choose Input Type:</strong> Select between Simple Fraction or Mixed Number tab.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Values:</strong> Input the numerator and denominator (and whole number for mixed numbers).</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Convert to Percent" button to get the result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the percentage, decimal, and step-by-step solution.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Examples */}
                  <div id="examples" className="content-block">
                    <h2 className="content-title">Examples</h2>
                    
                    <div className="example-section">
                      <h3>Example 1: Simple Fraction</h3>
                      <p>Convert: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 3 by 4</p>
                        <p><strong>Step 2:</strong> 3 ÷ 4 = 0.75</p>
                        <p><strong>Step 3:</strong> 0.75 × 100 = 75%</p>
                        <p><strong>Result:</strong> 3/4 = 75%</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Mixed Number</h3>
                      <p>Convert: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to improper fraction: 1 2/3 = 5/3</p>
                        <p><strong>Step 2:</strong> Divide 5 by 3</p>
                        <p><strong>Step 3:</strong> 5 ÷ 3 = 1.6667</p>
                        <p><strong>Step 4:</strong> 1.6667 × 100 = 166.67%</p>
                        <p><strong>Result:</strong> 1 2/3 = 166.67%</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Simple Fraction</h3>
                      <p>Convert: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 1 by 2</p>
                        <p><strong>Step 2:</strong> 1 ÷ 2 = 0.5</p>
                        <p><strong>Step 3:</strong> 0.5 × 100 = 50%</p>
                        <p><strong>Result:</strong> 1/2 = 50%</p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Understanding fraction to percent conversion is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for understanding proportions and ratios in percentage format</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for statistics, probability, and data analysis</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in financial calculations, interest rates, and discounts</span>
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
                    <p>Our Fraction to Percent Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Two Input Types:</strong> Simple fractions and mixed numbers</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Input Validation:</strong> Ensures valid positive numbers and prevents zero denominators</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Accurate Results:</strong> Provides both percentage and decimal representations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Step-by-step Solutions:</strong> Detailed explanation of the conversion process</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Error Handling:</strong> Clear error messages for invalid inputs</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Tab Interface:</strong> Easy switching between simple fractions and mixed numbers</span>
                      </li>
                    </ul>
                  </div>

                  {/* Applications */}
                  <div id="applications" className="content-block">
                    <h2 className="content-title">Applications</h2>
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching fraction concepts and mathematical conversions in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Calculating interest rates, discounts, and financial percentages</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-bar"></i> Statistics</h4>
                        <p>Data analysis and statistical calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-shopping-cart"></i> Commerce</h4>
                        <p>Price calculations, discounts, and sales percentages</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Engineering</h4>
                        <p>Technical calculations and engineering applications</p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
                    <FAQSection 
                      faqs={[
                        {
                          question: "What types of fractions can I convert?",
                          answer: "You can convert both simple fractions (like 3/4) and mixed numbers (like 1 2/3) to percentages."
                        },
                        {
                          question: "How accurate are the conversions?",
                          answer: "The calculator provides highly accurate conversions with up to 4 decimal places of precision."
                        },
                        {
                          question: "Can I convert negative fractions?",
                          answer: "Currently, the calculator supports positive fractions only. For negative fractions, you can convert the absolute value and add the negative sign to the result."
                        },
                        {
                          question: "What if I enter a zero denominator?",
                          answer: "The calculator prevents you from entering zero as a denominator since division by zero is undefined."
                        },
                        {
                          question: "How does the calculator handle repeating decimals?",
                          answer: "The calculator rounds repeating decimals to 4 decimal places for practical use while maintaining accuracy."
                        },
                        {
                          question: "Can I convert percentages back to fractions?",
                          answer: "Yes, you can convert percentages back to fractions by dividing by 100 and simplifying the resulting decimal to a fraction."
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

export default FractionToPercentCalculator
