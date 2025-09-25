import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/comparing-fractions-calculator.css';

const ComparingFractionsCalculator = () => {
  const [firstValue, setFirstValue] = useState('');
  const [secondValue, setSecondValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Comparing Fractions Calculator',
    description: 'Compare fractions, decimals, percentages, and mixed numbers with step-by-step solutions',
    icon: 'fas fa-balance-scale',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Comparing Fractions Calculator']
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
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-calculator' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-fraction' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-hashtag' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percent' },
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-function' },
    { name: 'Integral Calculator', url: '/math/calculators/integral-calculator', icon: 'fas fa-integral' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-comparison', title: 'What is Number Comparison?' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Utility function to parse various input formats
  const parseValue = (value) => {
    try {
      value = value.trim();
      if (!value) {
        throw new Error('Empty value provided');
      }

      if (value.includes('%')) {
        const percentValue = parseFloat(value.replace('%', ''));
        if (isNaN(percentValue)) {
          throw new Error('Invalid percentage format');
        }
        return percentValue / 100;
      } else if (value.includes('/')) {
        const parts = value.split(' ');
        let whole = 0, num = 0, den = 1;
        
        if (parts.length === 2) {
          // Mixed number (e.g., "2 3/5")
          whole = parseInt(parts[0]);
          if (isNaN(whole)) {
            throw new Error('Invalid whole number in mixed fraction');
          }
          
          const fraction = parts[1].split('/');
          if (fraction.length !== 2) {
            throw new Error('Invalid fraction format in mixed number');
          }
          
          num = parseInt(fraction[0]);
          den = parseInt(fraction[1]);
          
          if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error('Invalid numerator or denominator in mixed fraction');
          }
          
          return whole + (num / den);
        } else {
          // Simple fraction (e.g., "3/4")
          const fraction = parts[0].split('/');
          if (fraction.length !== 2) {
            throw new Error('Invalid fraction format');
          }
          
          num = parseInt(fraction[0]);
          den = parseInt(fraction[1]);
          
          if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error('Invalid numerator or denominator');
          }
          
          return num / den;
        }
      } else {
        // Decimal number
        const decimal = parseFloat(value);
        if (isNaN(decimal)) {
          throw new Error('Invalid decimal number');
        }
        return decimal;
      }
    } catch (error) {
      throw new Error(`Error parsing "${value}": ${error.message}`);
    }
  };

  // Format value for LaTeX display
  const formatValueForLatex = (value) => {
    if (value.includes('%')) {
      const percentValue = parseFloat(value.replace('%', ''));
      return `${percentValue}\\%`;
    } else if (value.includes('/')) {
      const parts = value.split(' ');
      if (parts.length === 2) {
        // Mixed number
        const whole = parts[0];
        const fraction = parts[1];
        return `${whole}\\;\\frac{${fraction.split('/')[0]}}{${fraction.split('/')[1]}}`;
      } else {
        // Simple fraction
        const [num, den] = value.split('/');
        return `\\frac{${num}}{${den}}`;
      }
    } else {
      return value;
    }
  };

  const calculateComparison = () => {
    try {
      if (!firstValue.trim() || !secondValue.trim()) {
        throw new Error('Please enter both values to compare');
      }

      const firstDecimal = parseValue(firstValue);
      const secondDecimal = parseValue(secondValue);

      let comparison = '';
      let comparisonSymbol = '';
      let comparisonLatex = '';
      
      if (Math.abs(firstDecimal - secondDecimal) < 0.0000001) {
        // Handle floating point precision issues
        comparison = `${firstValue} = ${secondValue}`;
        comparisonSymbol = '=';
        comparisonLatex = `${formatValueForLatex(firstValue)} = ${formatValueForLatex(secondValue)}`;
      } else if (firstDecimal > secondDecimal) {
        comparison = `${firstValue} > ${secondValue}`;
        comparisonSymbol = '>';
        comparisonLatex = `${formatValueForLatex(firstValue)} > ${formatValueForLatex(secondValue)}`;
      } else {
        comparison = `${firstValue} < ${secondValue}`;
        comparisonSymbol = '<';
        comparisonLatex = `${formatValueForLatex(firstValue)} < ${formatValueForLatex(secondValue)}`;
      }

      // Generate solution steps
      let steps = [];
      steps.push(`Step 1: Convert both values to decimal form`);
      steps.push(`First value: ${formatValueForLatex(firstValue)} = ${firstDecimal.toFixed(6)}`);
      steps.push(`Second value: ${formatValueForLatex(secondValue)} = ${secondDecimal.toFixed(6)}`);
      steps.push(`Step 2: Compare the decimal values`);
      steps.push(`${firstDecimal.toFixed(6)} ${comparisonSymbol} ${secondDecimal.toFixed(6)}`);
      steps.push(`Final Result: ${comparisonLatex}`);

      setResult({
        comparison: comparison,
        comparisonLatex: comparisonLatex,
        firstDecimal: firstDecimal,
        secondDecimal: secondDecimal,
        comparisonSymbol: comparisonSymbol,
        steps: steps
      });
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateComparison();
  };

  const handleReset = () => {
    setFirstValue('');
    setSecondValue('');
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Comparison formula
          katex.render('\\text{Compare: } a \\text{ vs } b', 
            document.getElementById('comparison-formula'));
          
          // Example 1 formulas
          katex.render('\\frac{3}{4} \\text{ vs } \\frac{2}{3}', 
            document.getElementById('example1-formula'));
          katex.render('0.75 > 0.666667', 
            document.getElementById('example1-result'));
          katex.render('\\frac{3}{4} > \\frac{2}{3}', 
            document.getElementById('example1-comparison'));

          // Example 2 formulas
          katex.render('1\\;\\frac{1}{2} \\text{ vs } 1.25', 
            document.getElementById('example2-formula'));
          katex.render('1.5 > 1.25', 
            document.getElementById('example2-result'));
          katex.render('1\\;\\frac{1}{2} > 1.25', 
            document.getElementById('example2-comparison'));

          // Example 3 formulas
          katex.render('75\\% \\text{ vs } \\frac{3}{4}', 
            document.getElementById('example3-formula'));
          katex.render('0.75 = 0.75', 
            document.getElementById('example3-result'));
          katex.render('75\\% = \\frac{3}{4}', 
            document.getElementById('example3-comparison'));
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
          // Render comparison result
          const comparisonElement = document.getElementById('comparison-result');
          if (comparisonElement) {
            katex.render(result.comparisonLatex, comparisonElement);
          }

          // Render solution steps formulas
          result.steps.forEach((step, index) => {
            if (step.includes('\\frac') || step.includes('\\%') || step.includes('\\;')) {
              const stepElement = document.getElementById(`step-${index}`);
              if (stepElement) {
                katex.render(step, stepElement);
              }
            }
          });
        } catch (error) {
          console.log('KaTeX result rendering error:', error);
        }
      }
    };

    const timer = setTimeout(renderResultFormulas, 100);
    return () => clearTimeout(timer);
  }, [result]);

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Comparing Fractions Calculator"
        onCalculate={calculateComparison}
        calculateButtonText="Compare Values"
        error={error}
        result={result}
      >
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
                  </form>

                  {result && (
          <div className="result-section">
            <h3 className="result-title">
              <i className="fas fa-balance-scale"></i>
              Comparison Result
            </h3>
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
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
                  </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
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
      </ContentSection>

      <ContentSection id="what-is-comparison" title="What is Number Comparison?">
                      <p>
                        Number comparison is the process of determining which of two or more numbers 
                        is greater, smaller, or equal. This involves converting different number formats 
                        to a common representation for accurate comparison.
                      </p>
        <ul>
          <li><strong>Purpose:</strong> Determine the relative size of different numbers</li>
          <li><strong>Method:</strong> Convert to common format (usually decimal) for comparison</li>
          <li><strong>Result:</strong> Clear indication of which number is greater, smaller, or equal</li>
          <li><strong>Applications:</strong> Essential for mathematical operations, problem-solving, and real-world applications</li>
                    </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
                    <div className="formula-section">
          <h4><strong>Comparison Method</strong></h4>
                      <div className="math-formula" id="comparison-formula"></div>
                      <p>Convert both numbers to decimal form and compare the values.</p>
                    </div>

                    <div className="formula-section">
          <h4><strong>Conversion Rules</strong></h4>
                      <ul>
                        <li><strong>Fractions:</strong> Divide numerator by denominator</li>
                        <li><strong>Mixed Numbers:</strong> Convert to improper fraction, then to decimal</li>
                        <li><strong>Percentages:</strong> Divide by 100</li>
                        <li><strong>Decimals:</strong> Already in comparable format</li>
                      </ul>
                    </div>

                    <div className="formula-section">
          <h4><strong>Comparison Symbols</strong></h4>
                      <p>
                        Use standard mathematical symbols: &gt; (greater than), &lt; (less than), = (equal to)
                      </p>
                    </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Comparing Fractions Calculator">
                      <p>Using the calculator is straightforward:</p>
        <ul>
          <li><strong>Enter First Value:</strong> Input your first number in any supported format.</li>
          <li><strong>Enter Second Value:</strong> Input your second number in any supported format.</li>
          <li><strong>Calculate:</strong> Click the "Compare Values" button to get the comparison result.</li>
          <li><strong>View Results:</strong> The calculator will show the comparison with step-by-step solutions.</li>
                    </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
                    <div className="example-section">
          <h4><strong>Example 1: Comparing Fractions</strong></h4>
                      <p>Compare: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert to decimals</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example1-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example1-comparison"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
          <h4><strong>Example 2: Mixed Number vs Decimal</strong></h4>
                      <p>Compare: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert mixed number to decimal</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example2-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example2-comparison"></div></p>
                      </div>
                    </div>

                    <div className="example-section">
          <h4><strong>Example 3: Percentage vs Fraction</strong></h4>
                      <p>Compare: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Convert both to decimals</p>
                        <p><strong>Step 2:</strong> <div className="content-formula" id="example3-result"></div></p>
                        <p><strong>Result:</strong> <div className="content-formula" id="example3-comparison"></div></p>
                      </div>
                    </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
                    <p>
                      Understanding number comparison is crucial in mathematics for several reasons:
                    </p>
                    <ul>
          <li>Essential for ordering numbers and understanding numerical relationships</li>
          <li>Foundation for solving inequalities and mathematical problems</li>
          <li>Used in real-world applications like measurements, finance, and statistics</li>
          <li>Helps develop critical thinking and analytical skills</li>
          <li>Important for standardized tests and academic success</li>
                    </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
                    <p>Our Comparing Fractions Calculator provides:</p>
                    <ul>
          <li><strong>Multiple Input Formats:</strong> Supports fractions, mixed numbers, decimals, and percentages</li>
          <li><strong>Automatic Conversion:</strong> Converts all inputs to decimal form for accurate comparison</li>
          <li><strong>Clear Results:</strong> Shows the comparison with proper mathematical notation</li>
          <li><strong>Step-by-step Solutions:</strong> Detailed explanation of the comparison process</li>
          <li><strong>Error Handling:</strong> Validates inputs and provides helpful error messages</li>
          <li><strong>Mathematical Notation:</strong> Uses proper mathematical symbols and formulas</li>
                    </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
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
      </ContentSection>

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
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default ComparingFractionsCalculator;
