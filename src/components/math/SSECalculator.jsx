import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/math/sse-calculator.css'

const SSECalculator = () => {
  const [actualData, setActualData] = useState('2, 4, 6, 8')
  const [predictedData, setPredictedData] = useState('1.5, 3.5, 5.5, 7.5')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Tool data
  const toolData = {
    name: 'Sum of Squared Errors (SSE) Calculator',
    description: 'Calculate the Sum of Squared Errors with step-by-step solutions. Perfect for statistical analysis, machine learning evaluation, and data science projects.',
    icon: 'fas fa-chart-line',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'SSE Calculator']
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
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'LCM Calculator', url: '/math/calculators/lcm-calculator', icon: 'fas fa-sort-numeric-up' },
    { name: 'LCD Calculator', url: '/math/calculators/lcd-calculator', icon: 'fas fa-sort-numeric-down' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Comparing Decimals', url: '/math/calculators/comparing-decimals-calculator', icon: 'fas fa-sort-numeric-up' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-sse', title: 'What is SSE?' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

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

  const calculateSSEResult = () => {
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
          document.getElementById('sse-calculation-formula'))
        
        // Render result formula
        const resultFormula = result.calculations.map(c => 
          c.squaredError.toFixed(4)
        ).join(' + ')
        katex.render(`${resultFormula} = ${result.sse.toFixed(4)}`, 
          document.getElementById('sse-result-formula'))
      } catch (error) {
        console.log('KaTeX result rendering error:', error)
      }
    }
  }, [result])

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Sum of Squared Errors (SSE) Calculator"
        onCalculate={calculateSSEResult}
        calculateButtonText="Calculate SSE"
        error={error}
        result={null}
      >
        <div className="sse-calculator-form">
          <div className="sse-input-group">
            <label htmlFor="sse-actual-data" className="sse-input-label">
              Actual Data Points:
            </label>
            <textarea
              id="sse-actual-data"
              name="sse-actual-data"
              className="sse-input-field"
              value={actualData}
              onChange={(e) => handleInputChange('actual', e.target.value)}
              placeholder="e.g., 2, 4, 6, 8"
              rows="3"
            />
          </div>

          <div className="sse-input-group">
            <label htmlFor="sse-predicted-data" className="sse-input-label">
              Predicted Values:
            </label>
            <textarea
              id="sse-predicted-data"
              name="sse-predicted-data"
              className="sse-input-field"
              value={predictedData}
              onChange={(e) => handleInputChange('predicted', e.target.value)}
              placeholder="e.g., 1.5, 3.5, 5.5, 7.5"
              rows="3"
            />
          </div>

          <small className="sse-input-help">
            Enter comma-separated or space-separated numbers. Both lists must have the same number of values.
          </small>

          <div className="sse-calculator-actions">
            <button type="button" className="sse-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="sse-calculator-result">
            <h3 className="sse-result-title">SSE Calculation Result</h3>
            <div className="sse-result-content">
              <div className="sse-result-main">
                <div className="sse-result-item">
                  <strong>SSE Formula:</strong>
                  <div className="sse-result-formula" id="sse-formula"></div>
                </div>
                <div className="sse-result-item">
                  <strong>Calculation:</strong>
                  <div className="sse-result-formula" id="sse-calculation-formula"></div>
                </div>
                <div className="sse-result-item">
                  <strong>Result:</strong>
                  <div className="sse-result-formula" id="sse-result-formula"></div>
                </div>
              </div>
              
              <div className="sse-result-steps">
                <h4>Step-by-Step Calculation:</h4>
                <div className="sse-steps-table">
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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
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
      </ContentSection>

      <ContentSection id="what-is-sse" title="What is Sum of Squared Errors (SSE)?">
        <p>
          SSE is a statistical measure that calculates the sum of the squared differences between 
          actual observed values and predicted values. It's widely used in regression analysis, 
          machine learning, and statistical modeling to assess prediction accuracy.
        </p>
        <ul>
          <li>
            <span><strong>Purpose:</strong> Measure the total prediction error in a model</span>
          </li>
          <li>
            <span><strong>Method:</strong> Square each error and sum all squared errors</span>
          </li>
          <li>
            <span><strong>Result:</strong> A single value representing total squared error</span>
          </li>
          <li>
            <span><strong>Applications:</strong> Essential for model evaluation and comparison</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>SSE Formula</h3>
          <div className="math-formula" id="formula-example">SSE = Σ(yi - ŷi)²</div>
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
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use SSE Calculator">
        <p>Using the calculator is straightforward:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Actual Data:</strong> Input the actual observed values as comma or space-separated numbers.</span>
          </li>
          <li>
            <span><strong>Enter Predicted Values:</strong> Input the corresponding predicted values in the same format.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click the "Calculate SSE" button to get the result.</span>
          </li>
          <li>
            <span><strong>View Results:</strong> The calculator will show the SSE value and detailed step-by-step calculations.</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Good Predictions</h3>
          <p>Calculate SSE: <div className="content-formula" id="example1-formula">SSE = (2-1.5)² + (4-3.5)² + (6-5.5)² + (8-7.5)² = 1.0</div></p>
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
          <p>Calculate SSE: <div className="content-formula" id="example2-formula">SSE = (1-2)² + (3-4)² + (5-6)² = 3.0</div></p>
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
          <p>Calculate SSE: <div className="content-formula" id="example3-formula">SSE = (10-9)² + (20-19)² + (30-31)² = 3.0</div></p>
          <div className="example-solution">
            <p><strong>Actual:</strong> [10, 20, 30]</p>
            <p><strong>Predicted:</strong> [9, 19, 31]</p>
            <p><strong>Errors:</strong> [1, 1, -1]</p>
            <p><strong>Squared Errors:</strong> [1, 1, 1]</p>
            <p><strong>SSE:</strong> 1 + 1 + 1 = 3.0</p>
            <p><strong>Interpretation:</strong> Poor predictions (high SSE relative to data scale)</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding SSE is crucial in statistics and data science for several reasons:</p>
        <ul>
          <li>
            <span>Essential for evaluating model performance and accuracy</span>
          </li>
          <li>
            <span>Foundation for advanced statistical analysis and machine learning</span>
          </li>
          <li>
            <span>Used in regression analysis and predictive modeling</span>
          </li>
          <li>
            <span>Important for comparing different models and algorithms</span>
          </li>
          <li>
            <span>Helps develop critical thinking in data analysis</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our SSE Calculator provides:</p>
        <ul>
          <li>
            <span><strong>Input Validation:</strong> Ensures valid numerical inputs and matching data counts</span>
          </li>
          <li>
            <span><strong>Accurate Results:</strong> Provides precise SSE calculations with proper error handling</span>
          </li>
          <li>
            <span><strong>Step-by-step Solutions:</strong> Detailed breakdown of each calculation step</span>
          </li>
          <li>
            <span><strong>Visual Table:</strong> Clear tabular display of all calculations</span>
          </li>
          <li>
            <span><strong>Error Handling:</strong> Clear error messages for invalid inputs</span>
          </li>
          <li>
            <span><strong>Mathematical Notation:</strong> Proper formula display with LaTeX rendering</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
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
      </ContentSection>

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
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default SSECalculator
