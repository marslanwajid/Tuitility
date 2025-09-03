import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/fraction-to-percent-calculator.css';

const FractionToPercentCalculator = () => {
  const [activeTab, setActiveTab] = useState('tab-1');
  const [simpleFraction, setSimpleFraction] = useState({ numerator: '3', denominator: '4' });
  const [mixedNumber, setMixedNumber] = useState({ whole: '1', numerator: '2', denominator: '3' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Fraction to Percent Calculator',
    description: 'Convert fractions and mixed numbers to percentages with step-by-step solutions. Perfect for students learning fraction conversions and anyone working with mathematical calculations.',
    icon: 'fas fa-percentage',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Fraction to Percent Calculator']
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
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percent' },
    { name: 'Decimal to Fraction', url: '/math/calculators/decimal-to-fraction-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-function' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-conversion', title: 'What is Fraction to Percent Conversion?' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Handle tab switching
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setResult(null);
    setError('');
  };

  // Handle simple fraction input changes
  const handleSimpleFractionChange = (field, value) => {
    // Validate input - only allow positive numbers
    const validatedValue = value.replace(/[^0-9.]/g, '');
    
    // Special handling for denominator (cannot be 0)
    if (field === 'denominator' && validatedValue === '0') {
      return;
    }
    
    setSimpleFraction(prev => ({
      ...prev,
      [field]: validatedValue
    }));
  };

  // Handle mixed number input changes
  const handleMixedNumberChange = (field, value) => {
    // Validate input - only allow positive numbers
    const validatedValue = value.replace(/[^0-9.]/g, '');
    
    // Special handling for denominator (cannot be 0)
    if (field === 'denominator' && validatedValue === '0') {
      return;
    }
    
    setMixedNumber(prev => ({
      ...prev,
      [field]: validatedValue
    }));
  };

  const calculateFractionToPercent = () => {
    try {
      let numerator, denominator, whole = 0;
      let steps = [];
      let inputDisplay = '';

      if (activeTab === 'tab-1') {
        // Simple fraction
        numerator = parseFloat(simpleFraction.numerator);
        denominator = parseFloat(simpleFraction.denominator);
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          throw new Error('Please enter valid numbers. Denominator cannot be zero.');
        }

        inputDisplay = `${numerator}/${denominator}`;
        steps.push(`Step 1: Start with fraction: ${numerator}/${denominator}`);
        
      } else if (activeTab === 'tab-2') {
        // Mixed number
        whole = parseFloat(mixedNumber.whole) || 0;
        numerator = parseFloat(mixedNumber.numerator);
        denominator = parseFloat(mixedNumber.denominator);
        
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          throw new Error('Please enter valid numbers. Denominator cannot be zero.');
        }

        inputDisplay = `${whole} ${numerator}/${denominator}`;
        steps.push(`Step 1: Start with mixed number: ${whole} ${numerator}/${denominator}`);
        
        // Convert to improper fraction
        const improperNumerator = (whole * denominator) + numerator;
        steps.push(`Step 2: Convert to improper fraction: (${whole} × ${denominator}) + ${numerator} = ${improperNumerator}/${denominator}`);
        
        numerator = improperNumerator;
      }

      // Calculate decimal
      const decimal = numerator / denominator;
      steps.push(`Step ${activeTab === 'tab-1' ? '2' : '3'}: Divide: ${numerator} ÷ ${denominator} = ${formatDecimal(decimal)}`);
      
      // Calculate percentage
      const percentage = decimal * 100;
      steps.push(`Step ${activeTab === 'tab-1' ? '3' : '4'}: Multiply by 100: ${formatDecimal(decimal)} × 100 = ${formatDecimal(percentage)}%`);

      setResult({
        inputDisplay: inputDisplay,
        percentage: formatDecimal(percentage),
        decimal: formatDecimal(decimal),
        steps: steps
      });
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const formatDecimal = (number) => {
    if (!isFinite(number)) {
      return 'Undefined';
    }
    
    // Round to 4 decimal places and remove trailing zeros
    let str = number.toFixed(4);
    str = str.replace(/\.?0+$/, "");
    return str;
  };



  const handleReset = () => {
    setSimpleFraction({ numerator: '3', denominator: '4' });
    setMixedNumber({ whole: '1', numerator: '2', denominator: '3' });
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('\\text{Fraction to Percent: } \\frac{a}{b} \\times 100 = \\%', 
            document.getElementById('formula-example'));
          
          // Example 1 formulas
          katex.render('\\frac{3}{4} = 0.75 \\times 100 = 75\\%', 
            document.getElementById('example1-formula'));
          
          // Example 2 formulas
          katex.render('1\\;\\frac{2}{3} = \\frac{5}{3} = 1.6667 \\times 100 = 166.67\\%', 
            document.getElementById('example2-formula'));
          
          // Example 3 formulas
          katex.render('\\frac{1}{2} = 0.5 \\times 100 = 50\\%', 
            document.getElementById('example3-formula'));
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

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Fraction to Percent Calculator"
        onCalculate={calculateFractionToPercent}
        calculateButtonText="Convert to Percent"
        error={error}
        result={null}
      >
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
                  
        <div className="calculator-form">
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

          {/* Reset Button Only */}
                    <div className="calculator-actions">
                      <button type="button" className="btn-reset" onClick={handleReset}>
                        <i className="fas fa-redo"></i>
                        Reset
                      </button>
                    </div>
        </div>

                  {/* Results */}
                  {result && (
          <div className="result-section fraction-to-percent-result">
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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
                  </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
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
      </ContentSection>

      <ContentSection id="what-is-conversion" title="What is Fraction to Percent Conversion?">
                      <p>
                        Fraction to percent conversion is the process of transforming a fraction or mixed number 
                        into its equivalent percentage representation. This involves converting the fraction to 
                        a decimal first, then multiplying by 100 to get the percentage.
                      </p>
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
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
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
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Fraction to Percent Calculator">
                      <p>Using the calculator is straightforward:</p>
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
      </ContentSection>

      <ContentSection id="examples" title="Examples">
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
      </ContentSection>

      <ContentSection id="significance" title="Significance">
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
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
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
      </ContentSection>

      <ContentSection id="applications" title="Applications">
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
      </ContentSection>

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
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default FractionToPercentCalculator;
