import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/percent-to-fraction-calculator.css';

const PercentToFractionCalculator = () => {
  const [percentage, setPercentage] = useState('25')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Tool data
  const toolData = {
    name: 'Percent to Fraction Calculator',
    description: 'Convert percentages to simplified fractions with step-by-step solutions. Perfect for students learning percentage conversions and anyone working with mathematical calculations.',
    icon: 'fas fa-percentage',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Percent to Fraction Calculator']
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
    { name: 'Fraction to Percent', url: '/math/calculators/fraction-to-percent-calculator', icon: 'fas fa-percentage' },
    { name: 'Decimal to Fraction', url: '/math/calculators/decimal-to-fraction-calculator', icon: 'fas fa-arrows-alt-h' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Comparing Decimals', url: '/math/calculators/comparing-decimals-calculator', icon: 'fas fa-sort-numeric-up' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-conversion', title: 'What is Percent to Fraction Conversion?' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

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
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Percent to Fraction Calculator"
        onCalculate={calculateFraction}
        calculateButtonText="Convert to Fraction"
        error={error}
        result={null}
      >
        <div className="calculator-form">
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
                      <button type="button" className="btn-reset" onClick={handleReset}>
                        <i className="fas fa-redo"></i>
                        Reset
                      </button>
                      </div>
                    </div>

        {/* Custom Results Section */}
                  {result && (
          <div className="result-section percent-to-fraction-calculator-result">
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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
                  </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
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
      </ContentSection>

      <ContentSection id="what-is-conversion" title="What is Percent to Fraction Conversion?">
                      <p>
                        Percent to fraction conversion is the process of transforming a percentage into its 
                        equivalent fraction representation. This involves converting the percentage to a decimal 
                        first, then expressing it as a fraction, and finally simplifying the fraction.
                      </p>
                    <ul>
                      <li>
                        <span><strong>Purpose:</strong> Express percentages as fractions for easier mathematical operations</span>
                      </li>
                      <li>
                        <span><strong>Method:</strong> Convert percentage to decimal, then to fraction, then simplify</span>
                      </li>
                      <li>
                        <span><strong>Result:</strong> Simplified fraction in lowest terms</span>
                      </li>
                      <li>
                        <span><strong>Applications:</strong> Essential for mathematics, finance, and everyday calculations</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <p>Our calculator supports the following conversion process:</p>
                      <ul>
                        <li><strong>Step 1:</strong> Convert percentage to decimal (divide by 100)</li>
                        <li><strong>Step 2:</strong> Convert decimal to fraction</li>
                        <li><strong>Step 3:</strong> Find the Greatest Common Divisor (GCD)</li>
                        <li><strong>Step 4:</strong> Simplify the fraction by dividing numerator and denominator by GCD</li>
                      </ul>
        <div className="formula-section">
          <h3>Basic Conversion Formula</h3>
          <div className="math-formula" id="formula-example">p% = p/100</div>
          <p>Where p is the percentage value.</p>
                    </div>
                    <div className="formula-section">
                      <h3>Examples</h3>
                      <p>
                        Percentage: 25% = 1/4<br/>
                        Percentage: 75% = 3/4<br/>
                        Percentage: 50% = 1/2
                      </p>
                    </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Percent to Fraction Calculator">
                      <p>Using the calculator is straightforward:</p>
                    <ul className="usage-steps">
                      <li>
                        <span><strong>Enter Percentage:</strong> Input the percentage value you want to convert.</span>
                      </li>
                      <li>
                        <span><strong>Calculate:</strong> Click the "Convert to Fraction" button to get the result.</span>
                      </li>
                      <li>
                        <span><strong>View Results:</strong> The calculator will show the decimal form, simplified fraction, and step-by-step solution.</span>
                      </li>
                      <li>
                        <span><strong>Understand GCD:</strong> Learn about the Greatest Common Divisor used in simplification.</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
                    <div className="example-section">
                      <h3>Example 1: Basic Conversion</h3>
          <p><strong>Problem:</strong> Convert 25% to a fraction</p>
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
          <p><strong>Problem:</strong> Convert 75% to a fraction</p>
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
          <p><strong>Problem:</strong> Convert 50% to a fraction</p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to decimal: 50% = 50 ÷ 100 = 0.5</p>
                        <p><strong>Step 2:</strong> Convert to fraction: 0.5 = 50/100</p>
                        <p><strong>Step 3:</strong> Find GCD: GCD(50, 100) = 50</p>
                        <p><strong>Step 4:</strong> Simplify: 50/100 = (50÷50)/(100÷50) = 1/2</p>
                        <p><strong>Result:</strong> 50% = 1/2</p>
                      </div>
                    </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding percent to fraction conversion is crucial in mathematics for several reasons:</p>
                    <ul>
                      <li>
                        <span>Essential for understanding percentage concepts and mathematical operations</span>
                      </li>
                      <li>
                        <span>Foundation for advanced mathematics, algebra, and calculus</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in financial calculations and statistical analysis</span>
                      </li>
                      <li>
                        <span>Important for standardized tests and academic success</span>
                      </li>
                      <li>
                        <span>Helps develop critical thinking and mathematical reasoning skills</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
                    <p>Our Percent to Fraction Calculator provides:</p>
                    <ul>
                      <li>
                        <span><strong>Input Validation:</strong> Ensures valid percentage values including decimals and negative numbers</span>
                      </li>
                      <li>
                        <span><strong>Accurate Results:</strong> Provides both decimal and simplified fraction results</span>
                      </li>
                      <li>
                        <span><strong>Step-by-step Solutions:</strong> Detailed explanation of the conversion process</span>
                      </li>
                      <li>
                        <span><strong>GCD Explanation:</strong> Clear explanation of the Greatest Common Divisor used</span>
                      </li>
                      <li>
                        <span><strong>Error Handling:</strong> Clear error messages for invalid inputs</span>
                      </li>
                      <li>
                        <span><strong>Mathematical Notation:</strong> Proper fraction display with LaTeX rendering</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
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
      </ContentSection>

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
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
}

export default PercentToFractionCalculator
