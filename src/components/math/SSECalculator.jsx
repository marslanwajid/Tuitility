import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQSection } from '../tool'
import '../../assets/css/math/sse-calculator.css'

const SSECalculator = () => {
  const [actualData, setActualData] = useState('2, 4, 6, 8')
  const [predictedData, setPredictedData] = useState('1.5, 3.5, 5.5, 7.5')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'actual') {
      setActualData(value)
    } else {
      setPredictedData(value)
    }
  }

  // Parse numbers from text input
  const parseNumbers = (text) => {
    if (!text) return []
    
    return text
      .split(/[,\s\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n) && isFinite(n))
  }

  // Validate inputs
  const validateInputs = (actual, predicted) => {
    if (actual.length === 0) {
      throw new Error('Please enter actual data points.')
    }
    
    if (predicted.length === 0) {
      throw new Error('Please enter predicted values.')
    }
    
    if (actual.length !== predicted.length) {
      throw new Error(`Mismatch in data count: ${actual.length} actual vs ${predicted.length} predicted values.`)
    }
    
    return true
  }

  // Calculate SSE
  const calculateSSE = (actual, predicted) => {
    let sse = 0
    const calculations = []
    
    for (let i = 0; i < actual.length; i++) {
      const a = actual[i]
      const p = predicted[i]
      const error = a - p
      const squaredError = error * error
      sse += squaredError
      
      calculations.push({
        actual: a,
        predicted: p,
        error: error,
        squaredError: squaredError
      })
    }
    
    return {
      sse: sse,
      calculations: calculations,
      count: actual.length
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    try {
      // Parse numbers
      const actualNumbers = parseNumbers(actualData)
      const predictedNumbers = parseNumbers(predictedData)
      
      // Validate inputs
      validateInputs(actualNumbers, predictedNumbers)
      
      // Calculate SSE
      const sseResult = calculateSSE(actualNumbers, predictedNumbers)
      
      setResult(sseResult)
      setError('')
    } catch (error) {
      setError(error.message)
      setResult(null)
    }
  }

  const handleReset = () => {
    setActualData('2, 4, 6, 8')
    setPredictedData('1.5, 3.5, 5.5, 7.5')
    setResult(null)
    setError('')
  }

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('SSE = \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2', 
            document.getElementById('formula-example'))
          
          // Example 1 formulas
          katex.render('SSE = (2-1.5)^2 + (4-3.5)^2 + (6-5.5)^2 + (8-7.5)^2 = 1.0', 
            document.getElementById('example1-formula'))
          
          // Example 2 formulas
          katex.render('SSE = (1-2)^2 + (3-4)^2 + (5-6)^2 = 3.0', 
            document.getElementById('example2-formula'))
          
          // Example 3 formulas
          katex.render('SSE = (10-9)^2 + (20-19)^2 + (30-31)^2 = 3.0', 
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
        // Render SSE formula
        katex.render(`SSE = \\sum_{i=1}^{${result.count}} (y_i - \\hat{y}_i)^2 = ${result.sse.toFixed(4)}`, 
          document.getElementById('sse-formula'))
        
        // Render calculation formula
        const calculationFormula = result.calculations.map(c => 
          `(${c.actual} - ${c.predicted})^2`
        ).join(' + ')
        katex.render(calculationFormula, 
          document.getElementById('calculation-formula'))
        
        // Render result formula
        const resultFormula = result.calculations.map(c => 
          c.squaredError.toFixed(4)
        ).join(' + ')
        katex.render(`${resultFormula} = ${result.sse.toFixed(4)}`, 
          document.getElementById('result-formula'))
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
              <i className="fas fa-chart-line"></i>
              Sum of Squared Errors (SSE) Calculator
            </h1>
            <p className="hero-description">
              Calculate the Sum of Squared Errors with step-by-step solutions. 
              Perfect for statistical analysis, machine learning evaluation, and data science projects.
            </p>
            <div className="hero-features">
              <span className="feature">
                <i className="fas fa-check"></i>
                Statistical analysis
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Step-by-step solutions
              </span>
              <span className="feature">
                <i className="fas fa-check"></i>
                Error calculation
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
                  <Link to="/math/calculators/percent-to-fraction-calculator" className="tool-link">
                    <i className="fas fa-percentage"></i>
                    <span>Percent to Fraction</span>
                  </Link>
                  <Link to="/math/calculators/improper-fraction-to-mixed-calculator" className="tool-link">
                    <i className="fas fa-layer-group"></i>
                    <span>Improper to Mixed</span>
                  </Link>
                  <Link to="/math/calculators/sse-calculator" className="tool-link active">
                    <i className="fas fa-chart-line"></i>
                    <span>SSE Calculator</span>
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
                    <i className="fas fa-chart-line"></i>
                    Sum of Squared Errors (SSE) Calculator
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="actual-data" className="input-label">
                        Actual Data Points:
                      </label>
                      <textarea
                        id="actual-data"
                        name="actual-data"
                        className="input-field"
                        value={actualData}
                        onChange={(e) => handleInputChange('actual', e.target.value)}
                        placeholder="e.g., 2, 4, 6, 8"
                        rows="3"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="predicted-data" className="input-label">
                        Predicted Values:
                      </label>
                      <textarea
                        id="predicted-data"
                        name="predicted-data"
                        className="input-field"
                        value={predictedData}
                        onChange={(e) => handleInputChange('predicted', e.target.value)}
                        placeholder="e.g., 1.5, 3.5, 5.5, 7.5"
                        rows="3"
                      />
                    </div>

                    <small className="input-help">
                      Enter comma-separated or space-separated numbers. Both lists must have the same number of values.
                    </small>

                    <div className="calculator-actions">
                      <button type="submit" className="btn-calculate">
                        <i className="fas fa-chart-line"></i>
                        Calculate SSE
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
                      <h3 className="result-title">SSE Calculation Result</h3>
                      <div className="result-content">
                        <div className="result-main">
                          <div className="result-item">
                            <strong>SSE Formula:</strong>
                            <div className="result-formula" id="sse-formula"></div>
                          </div>
                          <div className="result-item">
                            <strong>Calculation:</strong>
                            <div className="result-formula" id="calculation-formula"></div>
                          </div>
                          <div className="result-item">
                            <strong>Result:</strong>
                            <div className="result-formula" id="result-formula"></div>
                          </div>
                        </div>
                        
                        <div className="result-steps">
                          <h4>Step-by-Step Calculation:</h4>
                          <div className="steps-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>Data Point</th>
                                  <th>Actual (y)</th>
                                  <th>Predicted (ŷ)</th>
                                  <th>Error (y - ŷ)</th>
                                  <th>Squared Error (y - ŷ)²</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.calculations.map((calc, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{calc.actual}</td>
                                    <td>{calc.predicted}</td>
                                    <td>{calc.error.toFixed(4)}</td>
                                    <td>{calc.squaredError.toFixed(4)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="4"><strong>Total SSE</strong></td>
                                  <td><strong>{result.sse.toFixed(4)}</strong></td>
                                </tr>
                              </tfoot>
                            </table>
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
                      <a href="#what-is-sse" className="toc-link">What is SSE?</a>
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
                        The Sum of Squared Errors (SSE) is a fundamental statistical measure used to evaluate 
                        the accuracy of predictions or models. It quantifies the total squared difference between 
                        actual observed values and predicted values, providing a comprehensive measure of prediction error.
                      </p>
                      <p>
                        Our SSE Calculator simplifies this calculation process by providing step-by-step solutions. 
                        This tool helps students understand statistical concepts and professionals evaluate model 
                        performance in data science and machine learning projects.
                      </p>
                    </div>
                  </div>

                  {/* What is SSE */}
                  <div id="what-is-sse" className="content-block">
                    <h2 className="content-title">What is Sum of Squared Errors (SSE)?</h2>
                    <div className="content-intro">
                      <p>
                        SSE is a statistical measure that calculates the sum of the squared differences between 
                        actual observed values and predicted values. It's widely used in regression analysis, 
                        machine learning, and statistical modeling to assess prediction accuracy.
                      </p>
                    </div>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Measure the total prediction error in a model</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Square each error and sum all squared errors</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> A single value representing total squared error</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for model evaluation and comparison</span>
                      </li>
                    </ul>
                  </div>

                  {/* Formulas */}
                  <div id="formulas" className="content-block">
                    <h2 className="content-title">Formulas & Methods</h2>
                    
                    <div className="formula-section">
                      <h3>SSE Formula</h3>
                      <div className="math-formula" id="formula-example"></div>
                      <p>Where y_i is the actual value and ŷ_i is the predicted value for the i-th observation.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Calculation Steps</h3>
                      <ul>
                        <li><strong>Step 1:</strong> Calculate the error for each data point (Actual - Predicted)</li>
                        <li><strong>Step 2:</strong> Square each error to eliminate negative values</li>
                        <li><strong>Step 3:</strong> Sum all squared errors to get the total SSE</li>
                        <li><strong>Step 4:</strong> Interpret the result (lower values indicate better predictions)</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Examples</h3>
                      <p>
                        Simple case: SSE = 1.0 (good predictions)<br/>
                        Moderate case: SSE = 3.0 (moderate predictions)<br/>
                        Complex case: SSE = 10.0 (poor predictions)
                      </p>
                    </div>
                  </div>

                  {/* How to Use */}
                  <div id="how-to-use" className="content-block">
                    <h2 className="content-title">How to Use SSE Calculator</h2>
                    <div className="content-intro">
                      <p>Using the calculator is straightforward:</p>
                    </div>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Actual Data:</strong> Input the actual observed values as comma or space-separated numbers.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Predicted Values:</strong> Input the corresponding predicted values in the same format.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Calculate SSE" button to get the result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the SSE value and detailed step-by-step calculations.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Examples */}
                  <div id="examples" className="content-block">
                    <h2 className="content-title">Examples</h2>
                    
                    <div className="example-section">
                      <h3>Example 1: Good Predictions</h3>
                      <p>Calculate SSE: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Actual:</strong> [2, 4, 6, 8]</p>
                        <p><strong>Predicted:</strong> [1.5, 3.5, 5.5, 7.5]</p>
                        <p><strong>Errors:</strong> [0.5, 0.5, 0.5, 0.5]</p>
                        <p><strong>Squared Errors:</strong> [0.25, 0.25, 0.25, 0.25]</p>
                        <p><strong>SSE:</strong> 0.25 + 0.25 + 0.25 + 0.25 = 1.0</p>
                        <p><strong>Interpretation:</strong> Very good predictions (low SSE)</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Moderate Predictions</h3>
                      <p>Calculate SSE: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Actual:</strong> [1, 3, 5]</p>
                        <p><strong>Predicted:</strong> [2, 4, 6]</p>
                        <p><strong>Errors:</strong> [-1, -1, -1]</p>
                        <p><strong>Squared Errors:</strong> [1, 1, 1]</p>
                        <p><strong>SSE:</strong> 1 + 1 + 1 = 3.0</p>
                        <p><strong>Interpretation:</strong> Moderate predictions (medium SSE)</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Poor Predictions</h3>
                      <p>Calculate SSE: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Actual:</strong> [10, 20, 30]</p>
                        <p><strong>Predicted:</strong> [9, 19, 31]</p>
                        <p><strong>Errors:</strong> [1, 1, -1]</p>
                        <p><strong>Squared Errors:</strong> [1, 1, 1]</p>
                        <p><strong>SSE:</strong> 1 + 1 + 1 = 3.0</p>
                        <p><strong>Interpretation:</strong> Poor predictions (high SSE relative to data scale)</p>
                      </div>
                    </div>
                  </div>

                  {/* Significance */}
                  <div id="significance" className="content-block">
                    <h2 className="content-title">Significance</h2>
                    <p>
                      Understanding SSE is crucial in statistics and data science for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for evaluating model performance and accuracy</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for advanced statistical analysis and machine learning</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in regression analysis and predictive modeling</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Important for comparing different models and algorithms</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Helps develop critical thinking in data analysis</span>
                      </li>
                    </ul>
                  </div>

                  {/* Functionality */}
                  <div id="functionality" className="content-block">
                    <h2 className="content-title">Functionality</h2>
                    <p>Our SSE Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Input Validation:</strong> Ensures valid numerical inputs and matching data counts</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Accurate Results:</strong> Provides precise SSE calculations with proper error handling</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Step-by-step Solutions:</strong> Detailed breakdown of each calculation step</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Visual Table:</strong> Clear tabular display of all calculations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Error Handling:</strong> Clear error messages for invalid inputs</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Mathematical Notation:</strong> Proper formula display with LaTeX rendering</span>
                      </li>
                    </ul>
                  </div>

                  {/* Applications */}
                  <div id="applications" className="content-block">
                    <h2 className="content-title">Applications</h2>
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching statistical concepts and regression analysis in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Data Science</h4>
                        <p>Model evaluation and performance assessment in data science projects</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-robot"></i> Machine Learning</h4>
                        <p>Evaluating and comparing different machine learning algorithms</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-bar"></i> Statistics</h4>
                        <p>Statistical analysis and regression modeling</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Research</h4>
                        <p>Academic research and scientific studies</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-industry"></i> Business</h4>
                        <p>Business analytics and predictive modeling</p>
                      </div>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div id="faqs" className="content-block">
                    <h2 className="content-title">Frequently Asked Questions</h2>
                    <FAQSection 
                      faqs={[
                        {
                          question: "What is SSE?",
                          answer: "SSE (Sum of Squared Errors) is a statistical measure that calculates the sum of squared differences between actual observed values and predicted values."
                        },
                        {
                          question: "How do I interpret SSE values?",
                          answer: "Lower SSE values indicate better predictions. The interpretation depends on the scale of your data - compare SSE to the magnitude of your actual values."
                        },
                        {
                          question: "What's the difference between SSE and MSE?",
                          answer: "SSE is the sum of squared errors, while MSE (Mean Squared Error) is SSE divided by the number of observations. MSE is often preferred for comparing models with different sample sizes."
                        },
                        {
                          question: "Can SSE be negative?",
                          answer: "No, SSE cannot be negative because we square each error, which eliminates negative values."
                        },
                        {
                          question: "What if my data has different scales?",
                          answer: "SSE is sensitive to data scale. For data with different scales, consider using normalized metrics like R-squared or standardized residuals."
                        },
                        {
                          question: "How accurate are the calculations?",
                          answer: "The calculator provides 100% accurate SSE calculations using standard statistical formulas and proper numerical precision."
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

export default SSECalculator
