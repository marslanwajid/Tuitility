import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ToolHero, 
  ToolSidebar, 
  ToolLayout, 
  TableOfContents, 
  FeedbackForm, 
  ContentSection, 
  FAQSection,
  MathFormula 
} from '../tool'
import { getRelatedTools } from '../../utils/toolHelpers'
import '../../assets/css/math/fraction-to-percent-calculator.css'

const FractionToPercentCalculator = () => {
  const [activeTab, setActiveTab] = useState('simple-fraction')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Calculator state
  const [simpleFraction, setSimpleFraction] = useState({
    numerator: 3,
    denominator: 4
  })

  const [mixedNumber, setMixedNumber] = useState({
    whole: 1,
    numerator: 2,
    denominator: 3
  })

  // Utility functions
  const formatDecimal = (number) => {
    if (!isFinite(number)) {
      return 'Undefined'
    }
    
    let str = number.toFixed(4)
    str = str.replace(/\.?0+$/, "")
    return str
  }

  const calculateResult = () => {
    console.log('calculateResult function called')
    try {
      let numerator, denominator, whole = 0
      let steps = []
      let inputDisplay = ''

      if (activeTab === 'simple-fraction') {
        console.log('Processing simple fraction')
        numerator = simpleFraction.numerator
        denominator = simpleFraction.denominator
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          throw new Error('Please enter valid numbers. Denominator cannot be zero.')
        }

        inputDisplay = `${numerator}/${denominator}`
        steps.push(`Start with fraction: ${numerator}/${denominator}`)
        
      } else if (activeTab === 'mixed-number') {
        console.log('Processing mixed number')
        whole = mixedNumber.whole || 0
        numerator = mixedNumber.numerator
        denominator = mixedNumber.denominator
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          throw new Error('Please enter valid numbers. Denominator cannot be zero.')
        }

        inputDisplay = `${whole} ${numerator}/${denominator}`
        steps.push(`Start with mixed number: ${whole} ${numerator}/${denominator}`)
        
        // Convert to improper fraction
        const improperNumerator = (whole * denominator) + numerator
        steps.push(`Convert to improper fraction: (${whole} × ${denominator}) + ${numerator} = ${improperNumerator}/${denominator}`)
        
        numerator = improperNumerator
      }

      // Calculate decimal
      const decimal = numerator / denominator
      steps.push(`Divide: ${numerator} ÷ ${denominator} = ${formatDecimal(decimal)}`)
      
      // Calculate percentage
      const percentage = decimal * 100
      steps.push(`Multiply by 100: ${formatDecimal(decimal)} × 100 = ${formatDecimal(percentage)}%`)

      const resultData = {
        inputDisplay: inputDisplay,
        percentage: formatDecimal(percentage),
        decimal: formatDecimal(decimal),
        steps: steps
      }
      
      console.log('Setting result:', resultData)
      setResult(resultData)
      setError('')
    } catch (error) {
      console.log('Error in calculation:', error.message)
      setError(error.message)
      setResult(null)
    }
  }

  const handleSimpleFractionChange = (field, value) => {
    const newValue = parseInt(value) || 0
    setSimpleFraction(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const handleMixedNumberChange = (field, value) => {
    const newValue = parseInt(value) || 0
    setMixedNumber(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setResult(null)
    setError('')
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    console.log('Calculate button clicked')
    console.log('Active tab:', activeTab)
    console.log('Simple fraction state:', simpleFraction)
    console.log('Mixed number state:', mixedNumber)
    calculateResult()
  }

  const handleReset = () => {
    setSimpleFraction({
      numerator: 3,
      denominator: 4
    })
    setMixedNumber({
      whole: 1,
      numerator: 2,
      denominator: 3
    })
    setResult(null)
    setError('')
  }

  // Monitor result state changes
  useEffect(() => {
    console.log('Result state changed:', result)
  }, [result])

  // Monitor error state changes
  useEffect(() => {
    console.log('Error state changed:', error)
  }, [error])

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Basic conversion formula
          katex.render('\\text{Percentage} = \\frac{\\text{Numerator}}{\\text{Denominator}} \\times 100', 
            document.getElementById('conversion-formula'));
          
          // Example 1 formulas
          katex.render('\\frac{3}{4} \\times 100', 
            document.getElementById('example1-formula'));
          katex.render('0.75 \\times 100 = 75\\%', 
            document.getElementById('example1-result'));

          // Example 2 formulas
          katex.render('1\\frac{2}{3} = \\frac{5}{3}', 
            document.getElementById('example2-step1'));
          katex.render('\\frac{5}{3} \\times 100', 
            document.getElementById('example2-formula'));
          katex.render('1.6667 \\times 100 = 166.67\\%', 
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
            // Handle mixed numbers like "1 2/3"
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
            const latexFormula = fractionToLatex(result.inputDisplay);
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

  // Content sections for the tool
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Converting fractions to percentages is a fundamental mathematical skill used in various fields including education, finance, statistics, and everyday calculations. Our Fraction to Percent Calculator simplifies this process, providing accurate conversions with detailed step-by-step explanations.",
        "Whether you're working with simple fractions like 3/4 or mixed numbers like 1 2/3, this calculator will help you convert them to percentages quickly and accurately."
      ]
    },
    {
      id: "what-is-fraction-to-percent",
      title: "What is Fraction to Percent Conversion?",
      intro: [
        "Fraction to percent conversion is the process of expressing a fraction as a percentage. A percentage represents a part of 100, making it easier to understand and compare values."
      ],
      list: [
        "Simple Fractions: Basic fractions like 3/4, 1/2, or 5/8",
        "Mixed Numbers: Combinations of whole numbers and fractions like 1 2/3 or 2 1/4",
        "Improper Fractions: Fractions where the numerator is larger than the denominator",
        "Decimal Equivalents: The decimal representation of the fraction"
      ]
    },
    {
      id: "formulas",
      title: "Formulas & Methods",
      intro: [
        "The conversion from fraction to percentage follows a simple mathematical process:"
      ],
      content: (
        <div className="formula-section">
          <h3>Basic Conversion Formula</h3>
          <div className="math-formula" id="conversion-formula"></div>
          <p>To convert a fraction to a percentage, divide the numerator by the denominator and multiply by 100.</p>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use Fraction to Percent Calculator",
      steps: [
        "Select the appropriate tab: Simple Fraction or Mixed Number",
        "Enter the numerator and denominator values",
        "For mixed numbers, also enter the whole number part",
        "Click Calculate to see the result and step-by-step solution",
        "The calculator will show the percentage, decimal equivalent, and detailed steps"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Simple Fraction",
          description: "Convert 3/4 to a percentage",
          solution: [
            { label: "Step 1", content: "Divide numerator by denominator: 3 ÷ 4 = 0.75" },
            { label: "Step 2", content: "Multiply by 100: 0.75 × 100 = 75%" },
            { label: "Result", content: "3/4 = 75%" }
          ]
        },
        {
          title: "Example 2: Mixed Number",
          description: "Convert 1 2/3 to a percentage",
          solution: [
            { label: "Step 1", content: "Convert to improper fraction: 1 2/3 = 5/3" },
            { label: "Step 2", content: "Divide: 5 ÷ 3 = 1.6667" },
            { label: "Step 3", content: "Multiply by 100: 1.6667 × 100 = 166.67%" },
            { label: "Result", content: "1 2/3 = 166.67%" }
          ]
        }
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Educational applications in mathematics and statistics",
        "Financial calculations including interest rates and discounts",
        "Data analysis and reporting in business and research",
        "Everyday calculations like sales tax and tips",
        "Scientific measurements and laboratory work",
        "Sports statistics and performance metrics"
      ]
    },
    {
      id: "functionality",
      title: "Functionality",
      list: [
        "Simple fraction conversion with step-by-step solutions",
        "Mixed number support for complex calculations",
        "Automatic decimal and percentage display",
        "Input validation and error handling",
        "Responsive design for all devices",
        "Detailed calculation steps for learning purposes"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      content: (
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Teaching fraction concepts and percentage calculations in schools</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Finance</h4>
            <p>Calculating interest rates, discounts, and financial ratios</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Science</h4>
            <p>Laboratory measurements and experimental data analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-bar"></i> Statistics</h4>
            <p>Data analysis and statistical reporting</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-shopping-cart"></i> Retail</h4>
            <p>Sales calculations, discounts, and tax computations</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-trophy"></i> Sports</h4>
            <p>Performance statistics and success rate calculations</p>
          </div>
        </div>
      )
    }
  ]

  // FAQ data
  const faqs = [
    {
      question: "What is the difference between a fraction and a percentage?",
      answer: "A fraction represents a part of a whole using two numbers (numerator/denominator), while a percentage represents the same value as parts per hundred (out of 100)."
    },
    {
      question: "How do I convert a mixed number to a percentage?",
      answer: "First convert the mixed number to an improper fraction, then divide the numerator by the denominator and multiply by 100."
    },
    {
      question: "Can percentages be greater than 100%?",
      answer: "Yes, when the numerator is larger than the denominator, the percentage will be greater than 100%. For example, 3/2 = 150%."
    },
    {
      question: "What if the denominator is zero?",
      answer: "Division by zero is undefined in mathematics. The calculator will show an error message if you attempt to use a denominator of zero."
    },
    {
      question: "How accurate are the decimal results?",
      answer: "The calculator displays results to 4 decimal places and automatically removes trailing zeros for cleaner display."
    }
  ]

  return (
    <div className="tool-page">
      {/* Hero Section */}
      <ToolHero
        title="Fraction to Percent Calculator"
        icon="fas fa-percentage"
        description="Convert fractions to percentages with step-by-step solutions. Perfect for students, teachers, and anyone working with fractions and percentages."
        features={[
          "Simple fraction conversion",
          "Mixed number support", 
          "Step-by-step solutions",
          "Decimal equivalents"
        ]}
      />

      <ToolLayout
        sidebarProps={{
          relatedTools: getRelatedTools('math')
        }}
      >
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="calculator-container">
            <h2 className="section-title">
              <i className="fas fa-calculator"></i>
              Fraction to Percent Calculator
            </h2>
            
            <div className="calculator-tabs">
              <button 
                className={`tab-button ${activeTab === 'simple-fraction' ? 'active' : ''}`}
                onClick={() => handleTabChange('simple-fraction')}
              >
                Simple Fraction
              </button>
              <button 
                className={`tab-button ${activeTab === 'mixed-number' ? 'active' : ''}`}
                onClick={() => handleTabChange('mixed-number')}
              >
                Mixed Number
              </button>
            </div>

            <form onSubmit={handleCalculate} className="calculator-form">
              {activeTab === 'simple-fraction' && (
                <div className="input-group">
                  <label>Enter Fraction:</label>
                  <div className="fraction-inputs">
                    <input
                      type="number"
                      className="input-field"
                      value={simpleFraction.numerator}
                      onChange={(e) => handleSimpleFractionChange('numerator', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <div className="fraction-line"></div>
                    <input
                      type="number"
                      className="input-field"
                      value={simpleFraction.denominator}
                      onChange={(e) => handleSimpleFractionChange('denominator', e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'mixed-number' && (
                <div className="input-group">
                  <label>Enter Mixed Number:</label>
                  <div className="mixed-number-inputs">
                    <input
                      type="number"
                      className="whole-number"
                      value={mixedNumber.whole}
                      onChange={(e) => handleMixedNumberChange('whole', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <span>+</span>
                    <input
                      type="number"
                      className="input-field"
                      value={mixedNumber.numerator}
                      onChange={(e) => handleMixedNumberChange('numerator', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <div className="fraction-line"></div>
                    <input
                      type="number"
                      className="input-field"
                      value={mixedNumber.denominator}
                      onChange={(e) => handleMixedNumberChange('denominator', e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div className="calculator-buttons">
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
              <div className="result-section" style={{ display: 'block' }}>
                <div className="result-header">
                  <h3 className="result-title">Error</h3>
                  <p className="result-subtitle">Please check your inputs</p>
                </div>
                <div className="result-values">
                  <div className="result-item">
                    <div className="result-label">Error Message</div>
                    <div className="result-value" style={{ color: '#e74c3c' }}>{error}</div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="result-section" style={{ display: 'block' }}>
                <div className="result-header">
                  <h3 className="result-title">Result</h3>
                  <p className="result-subtitle">Your fraction converted to percentage</p>
                </div>
                <div className="result-values">
                  <div className="result-item">
                    <div className="result-label">Input</div>
                    <div className="result-value">{result.inputDisplay}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">Percentage</div>
                    <div className="result-value">{result.percentage}%</div>
                  </div>
                  <div className="result-item">
                    <div className="result-label">Decimal</div>
                    <div className="result-value">{result.decimal}</div>
                  </div>
                </div>
                
                <div className="steps-container">
                  <div className="steps-title">
                    <i className="fas fa-list-ol"></i>
                    Calculation Steps
                  </div>
                  <div className="steps-list">
                    {result.steps.map((step, index) => (
                      <div key={index} className="step">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Table of Contents & Feedback */}
        <section className="toc-feedback-section">
          <div className="toc-feedback-container">
            <TableOfContents 
              sections={[
                { id: "introduction", title: "Introduction" },
                { id: "what-is-fraction-to-percent", title: "What is Fraction to Percent?" },
                { id: "formulas", title: "Formulas & Methods" },
                { id: "how-to-use", title: "How to Use Calculator" },
                { id: "examples", title: "Examples" },
                { id: "significance", title: "Significance" },
                { id: "functionality", title: "Functionality" },
                { id: "applications", title: "Applications" },
                { id: "faqs", title: "FAQs" }
              ]}
            />
            <FeedbackForm />
          </div>
        </section>

        {/* Content Section */}
        <ContentSection sections={contentSections} />

        {/* FAQs */}
        <section className="content-section">
          <div className="content-container">
            <div id="faqs" className="content-block">
              <h2 className="content-title">Frequently Asked Questions</h2>
              <FAQSection faqs={faqs} />
            </div>
          </div>
        </section>
      </ToolLayout>
    </div>
  )
}

export default FractionToPercentCalculator
