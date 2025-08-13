import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
import '../../assets/css/math/improper-fraction-to-mixed-calculator.css'

const ImproperFractionToMixedCalculator = () => {
  const [fraction, setFraction] = useState({ numerator: '11', denominator: '4' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Handle input changes
  const handleInputChange = (field, value) => {
    // Validate input - only allow positive numbers
    const validatedValue = value.replace(/[^0-9]/g, '')
    
    setFraction(prev => ({
      ...prev,
      [field]: validatedValue
    }))
  }

  const calculateMixedNumber = () => {
    try {
      const numerator = parseInt(fraction.numerator)
      const denominator = parseInt(fraction.denominator)

      // Validate inputs
      if (isNaN(numerator) || isNaN(denominator)) {
        throw new Error('Please enter valid numbers')
      }

      if (denominator === 0) {
        throw new Error('Denominator cannot be zero')
      }

      if (numerator <= 0) {
        throw new Error('Numerator must be positive')
      }

      if (denominator <= 0) {
        throw new Error('Denominator must be positive')
      }

      if (numerator < denominator) {
        throw new Error('Enter an improper fraction (numerator ≥ denominator)')
      }

      // Calculate mixed number
      const quotient = Math.floor(numerator / denominator)
      const remainder = numerator % denominator

      // Generate step-by-step solution
      const steps = generateSteps(numerator, denominator, quotient, remainder)

      setResult({
        numerator,
        denominator,
        quotient,
        remainder,
        steps,
        isWholeNumber: remainder === 0
      })
      setError('')
    } catch (error) {
      setError(error.message)
      setResult(null)
    }
  }

  const generateSteps = (numerator, denominator, quotient, remainder) => {
    const steps = []

    steps.push(`Step 1: Given improper fraction: \\frac{${numerator}}{${denominator}}`)
    steps.push(`Step 2: Divide numerator by denominator: ${numerator} ÷ ${denominator} = ${quotient} remainder ${remainder}`)
    steps.push(`Step 3: This means: ${numerator} = ${denominator} × ${quotient} + ${remainder}`)
    steps.push(`Step 4: Form the mixed number:`)
    steps.push(`   • Quotient (${quotient}) becomes the whole number part`)
    steps.push(`   • Remainder (${remainder}) becomes the new numerator`)
    steps.push(`   • Original denominator (${denominator}) stays the same`)

    if (remainder === 0) {
      steps.push(`Step 5: Final Result: Since the remainder is 0, the result is just the whole number: ${quotient}`)
    } else {
      steps.push(`Step 5: Final Result: \\frac{${numerator}}{${denominator}} = ${quotient}\\frac{${remainder}}{${denominator}}`)
      steps.push(`This reads as: "${quotient} and ${remainder}/${denominator}"`)
    }

    return steps
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    calculateMixedNumber()
  }

  const handleReset = () => {
    setFraction({ numerator: '11', denominator: '4' })
    setResult(null)
    setError('')
  }

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('\\text{Improper Fraction to Mixed Number: } \\frac{a}{b} = q\\frac{r}{b}', 
            document.getElementById('formula-example'))
          
          // Example 1 formulas
          katex.render('\\frac{11}{4} = 2\\frac{3}{4}', 
            document.getElementById('example1-formula'))
          
          // Example 2 formulas
          katex.render('\\frac{8}{3} = 2\\frac{2}{3}', 
            document.getElementById('example2-formula'))
          
          // Example 3 formulas
          katex.render('\\frac{15}{5} = 3', 
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
        // Render input fraction
        katex.render(`\\frac{${result.numerator}}{${result.denominator}}`, 
          document.getElementById('input-fraction-formula'))
        
        // Render mixed number
        if (result.isWholeNumber) {
          katex.render(`${result.quotient}`, 
            document.getElementById('mixed-number-formula'))
        } else {
          katex.render(`${result.quotient}\\frac{${result.remainder}}{${result.denominator}}`, 
            document.getElementById('mixed-number-formula'))
        }

        // Render step formulas
        result.steps.forEach((step, index) => {
          if (step.includes('\\frac') || step.includes('\\text') || step.includes('\\times')) {
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
              <i className="fas fa-layer-group"></i>
              Improper Fraction to Mixed Number Calculator
            </h1>
            <p className="hero-description">
              Convert improper fractions to mixed numbers with step-by-step solutions. 
              Perfect for students learning fraction conversions and anyone working with mathematical calculations.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Improper fraction conversion
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Mixed number results
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
                  <Link to="/math/calculators/improper-fraction-to-mixed-calculator" className="tool-link active">
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
                    <i className="fas fa-layer-group"></i>
                    Improper Fraction to Mixed Number Calculator
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="numerator" className="input-label">
                        Numerator:
                      </label>
                      <input
                        type="text"
                        id="numerator"
                        name="numerator"
                        className="input-field"
                        value={fraction.numerator}
                        onChange={(e) => handleInputChange('numerator', e.target.value)}
                        placeholder="e.g., 11"
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
                        value={fraction.denominator}
                        onChange={(e) => handleInputChange('denominator', e.target.value)}
                        placeholder="e.g., 4"
                      />
                    </div>

                    <small className="input-help">
                      Enter an improper fraction (numerator ≥ denominator). Both values must be positive integers.
                    </small>

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-layer-group"></i>
                        Convert to Mixed Number
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
                             <strong>Input Fraction:</strong>
                             <div className="result-formula" id="input-fraction-formula"></div>
                           </div>
                           <div className="result-item">
                             <strong>Mixed Number:</strong>
                             <div className="result-formula" id="mixed-number-formula"></div>
                           </div>
                           {!result.isWholeNumber && (
                             <div className="result-item">
                               <strong>Read as:</strong>
                               <span>"{result.quotient} and {result.remainder}/{result.denominator}"</span>
                             </div>
                           )}
                         </div>
                        
                                                 <div className="result-steps">
                           <h4>Calculation Steps:</h4>
                           <div className="steps-container">
                             {result.steps.map((step, index) => (
                               <div key={index} className="step">
                                 {step.includes('\\frac') || step.includes('\\text') || step.includes('\\times') ? (
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
                      <a href="#what-is-conversion" className="toc-link">What is Improper to Mixed Conversion?</a>
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
                        Converting improper fractions to mixed numbers is a fundamental mathematical skill that helps us 
                        understand and work with fractions in a more intuitive format. An improper fraction has a numerator 
                        that is greater than or equal to its denominator, and converting it to a mixed number makes it 
                        easier to visualize and work with.
                      </p>
                      <p>
                        Our Improper Fraction to Mixed Number Calculator simplifies this conversion process by providing 
                        step-by-step solutions. This tool helps students understand the conversion process and professionals 
                        quickly convert improper fractions to mixed numbers for their calculations.
                      </p>
                    </div>
                  </div>

                  {/* What is Conversion */}
                  <div id="what-is-conversion" className="content-block">
                    <h2 className="content-title">What is Improper to Mixed Number Conversion?</h2>
                    <div className="content-intro">
                      <p>
                        Improper to mixed number conversion is the process of transforming an improper fraction into its 
                        equivalent mixed number representation. This involves dividing the numerator by the denominator 
                        to find the whole number part and the remainder becomes the new numerator.
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Express improper fractions as mixed numbers for easier understanding and visualization</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Divide numerator by denominator to get quotient and remainder</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> Mixed number with whole number part and proper fraction part</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for mathematics, engineering, and everyday calculations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
                    <div className="formula-section">
                      <h3>Basic Conversion Formula</h3>
                      <div className="math-formula" id="formula-example"></div>
                      <p>Where q is the quotient and r is the remainder when a is divided by b.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Conversion Steps</h3>
                      <ul>
                        <li><strong>Step 1:</strong> Divide the numerator by the denominator</li>
                        <li><strong>Step 2:</strong> The quotient becomes the whole number part</li>
                        <li><strong>Step 3:</strong> The remainder becomes the new numerator</li>
                        <li><strong>Step 4:</strong> The original denominator stays the same</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Examples</h3>
                      <p>
                        Improper fraction: 11/4 = 2 3/4<br/>
                        Improper fraction: 8/3 = 2 2/3<br/>
                        Improper fraction: 15/5 = 3 (whole number)
                      </p>
                    </div>
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use Improper Fraction to Mixed Number Calculator</h2>
                    <div className="content-intro">
                      <p>Using the calculator is straightforward:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Numerator:</strong> Input the numerator of your improper fraction.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Denominator:</strong> Input the denominator of your improper fraction.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Convert to Mixed Number" button to get the result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the mixed number and step-by-step solution.</span>
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
                        <p><strong>Step 1:</strong> Divide 11 by 4</p>
                        <p><strong>Step 2:</strong> 11 ÷ 4 = 2 remainder 3</p>
                        <p><strong>Step 3:</strong> Quotient (2) becomes whole number part</p>
                        <p><strong>Step 4:</strong> Remainder (3) becomes new numerator</p>
                        <p><strong>Result:</strong> 11/4 = 2 3/4</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Another Conversion</h3>
                      <p>Convert: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 8 by 3</p>
                        <p><strong>Step 2:</strong> 8 ÷ 3 = 2 remainder 2</p>
                        <p><strong>Step 3:</strong> Quotient (2) becomes whole number part</p>
                        <p><strong>Step 4:</strong> Remainder (2) becomes new numerator</p>
                        <p><strong>Result:</strong> 8/3 = 2 2/3</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Whole Number Result</h3>
                      <p>Convert: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 15 by 5</p>
                        <p><strong>Step 2:</strong> 15 ÷ 5 = 3 remainder 0</p>
                        <p><strong>Step 3:</strong> Since remainder is 0, result is just the whole number</p>
                        <p><strong>Result:</strong> 15/5 = 3</p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Understanding improper fraction to mixed number conversion is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for understanding fraction concepts and mathematical operations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for advanced mathematics, algebra, and calculus</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in engineering calculations and scientific measurements</span>
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
                    <p>Our Improper Fraction to Mixed Number Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Input Validation:</strong> Ensures valid positive integers and proper improper fractions</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Accurate Results:</strong> Provides both mixed number and whole number results</span>
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
                        <span><strong>User-friendly Interface:</strong> Simple and intuitive design</span>
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
                        <p>Teaching fraction concepts and mathematical conversions in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-calculator"></i> Engineering</h4>
                        <p>Technical calculations and engineering applications</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Financial calculations and percentage conversions</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-cogs"></i> Manufacturing</h4>
                        <p>Production calculations and measurement conversions</p>
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
                          question: "What is an improper fraction?",
                          answer: "An improper fraction is a fraction where the numerator is greater than or equal to the denominator (e.g., 11/4, 8/3, 15/5)."
                        },
                        {
                          question: "What is a mixed number?",
                          answer: "A mixed number is a combination of a whole number and a proper fraction (e.g., 2 3/4, 1 1/2)."
                        },
                        {
                          question: "When do I get a whole number result?",
                          answer: "You get a whole number result when the numerator is exactly divisible by the denominator (e.g., 15/5 = 3)."
                        },
                        {
                          question: "Can I convert proper fractions?",
                          answer: "No, this calculator is designed for improper fractions only. For proper fractions, the result would be 0 with the original fraction as the remainder."
                        },
                        {
                          question: "What if I enter a proper fraction?",
                          answer: "The calculator will show an error message asking you to enter an improper fraction (numerator ≥ denominator)."
                        },
                        {
                          question: "How accurate are the conversions?",
                          answer: "The calculator provides 100% accurate conversions using standard mathematical division and remainder operations."
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

export default ImproperFractionToMixedCalculator
