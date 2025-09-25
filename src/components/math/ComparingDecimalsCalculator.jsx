import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import ToolHero from '../tool/ToolHero';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import MathFormula from '../tool/MathFormula';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/comparing-decimals-calculator.css';

const ComparingDecimalsCalculator = () => {
  const [firstDecimal, setFirstDecimal] = useState('');
  const [secondDecimal, setSecondDecimal] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Comparing Decimals Calculator',
    description: 'Compare decimal numbers with step-by-step solutions and explanations',
    icon: 'fas fa-balance-scale',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Comparing Decimals Calculator']
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
    { id: 'features', title: 'Features' },
    { id: 'formulas', title: 'Formulas and Methods' },
    { id: 'explanation', title: 'Explanation' },
    { id: 'examples', title: 'Examples' },
    { id: 'units', title: 'Decimal Place Values' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Validate decimal input
  const validateDecimalInput = (value) => {
    const pattern = /^-?\d*\.?\d*$/;
    return pattern.test(value);
  };

  const handleFirstDecimalChange = (e) => {
    const value = e.target.value;
    if (validateDecimalInput(value)) {
      setFirstDecimal(value);
    }
  };

  const handleSecondDecimalChange = (e) => {
    const value = e.target.value;
    if (validateDecimalInput(value)) {
      setSecondDecimal(value);
    }
  };

  const calculateComparison = () => {
    try {
      if (!firstDecimal.trim()) {
        throw new Error('Please enter the first decimal number');
      }

      if (!secondDecimal.trim()) {
        throw new Error('Please enter the second decimal number');
      }

      const firstNum = parseFloat(firstDecimal);
      const secondNum = parseFloat(secondDecimal);

      if (isNaN(firstNum)) {
        throw new Error('Please enter a valid first decimal number');
      }

      if (isNaN(secondNum)) {
        throw new Error('Please enter a valid second decimal number');
      }

      let comparison = '';
      let symbol = '';
      let explanation = '';
      let comparisonLatex = '';

      if (firstNum > secondNum) {
        comparison = `${firstNum} > ${secondNum}`;
        symbol = '>';
        explanation = `${firstNum} is greater than ${secondNum}`;
        comparisonLatex = `${firstNum} > ${secondNum}`;
      } else if (firstNum < secondNum) {
        comparison = `${firstNum} < ${secondNum}`;
        symbol = '<';
        explanation = `${firstNum} is less than ${secondNum}`;
        comparisonLatex = `${firstNum} < ${secondNum}`;
      } else {
        comparison = `${firstNum} = ${secondNum}`;
        symbol = '=';
        explanation = `${firstNum} is equal to ${secondNum}`;
        comparisonLatex = `${firstNum} = ${secondNum}`;
      }

      // Generate solution steps
      let steps = [];
      steps.push(`Step 1: Identify the decimal numbers`);
      steps.push(`First decimal: ${firstNum}`);
      steps.push(`Second decimal: ${secondNum}`);
      
      steps.push(`Step 2: Compare the numbers`);
      
      if (firstNum !== secondNum) {
        const diff = Math.abs(firstNum - secondNum);
        steps.push(`Difference: |${firstNum} - ${secondNum}| = ${diff}`);
        
        if (firstNum > secondNum) {
          steps.push(`Since ${firstNum} > ${secondNum}, the first number is larger`);
        } else {
          steps.push(`Since ${firstNum} < ${secondNum}, the second number is larger`);
        }
      } else {
        steps.push(`Both numbers are exactly equal: ${firstNum} = ${secondNum}`);
      }

      steps.push(`Step 3: Final result`);
      steps.push(`${explanation}`);

      setResult({
        comparison: comparison,
        comparisonLatex: comparisonLatex,
        firstNum: firstNum,
        secondNum: secondNum,
        symbol: symbol,
        explanation: explanation,
        difference: Math.abs(firstNum - secondNum),
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
    setFirstDecimal('');
    setSecondDecimal('');
    setResult(null);
    setError('');
  };

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection title="Comparing Decimals Calculator">
                <div className="calculator-container">
                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
              <label htmlFor="firstDecimal">First Decimal Number</label>
                      <input
                        type="text"
                id="firstDecimal"
                        value={firstDecimal}
                        onChange={handleFirstDecimalChange}
                placeholder="Enter first decimal (e.g., 3.14)"
                className="calculator-input"
                      />
                    </div>

                    <div className="input-group">
              <label htmlFor="secondDecimal">Second Decimal Number</label>
                      <input
                        type="text"
                id="secondDecimal"
                        value={secondDecimal}
                        onChange={handleSecondDecimalChange}
                placeholder="Enter second decimal (e.g., 3.14159)"
                className="calculator-input"
                      />
                    </div>

            <div className="button-group">
              <button type="submit" className="calculate-btn">
                <i className="fas fa-balance-scale"></i>
                        Compare Decimals
                      </button>
              <button type="button" onClick={handleReset} className="reset-btn">
                        <i className="fas fa-redo"></i>
                        Reset
                      </button>
                    </div>
                  </form>

                  {error && (
            <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i>
              {error}
                    </div>
                  )}

                  {result && (
            <div className="result-section">
              <h3 className="result-title">
                <i className="fas fa-chart-line"></i>
                Comparison Result
              </h3>
              
                      <div className="result-content">
                <div className="comparison-display">
                  <div className="comparison-numbers">
                    <span className="number">{result.firstNum}</span>
                    <span className="symbol">{result.symbol}</span>
                    <span className="number">{result.secondNum}</span>
                          </div>
                  <div className="comparison-explanation">
                    {result.explanation}
                          </div>
                          </div>

                {result.difference > 0 && (
                  <div className="difference-info">
                    <strong>Difference:</strong> {result.difference}
                  </div>
                )}

                <div className="solution-steps">
                  <h4>Solution Steps:</h4>
                  <ol>
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          A <a href="comparing-decimals-calculator">comparing decimals calculator</a> is a specialized tool that allows users to compare two decimal numbers and determine their relationship (greater than, less than, or equal to). This calculator provides step-by-step solutions and explanations for decimal comparisons, making it an essential tool for students, teachers, and anyone working with decimal mathematics.
        </p>
        <p>
          Whether you need to compare simple decimals like 3.14 vs 3.14159, or complex decimal numbers with many decimal places, this calculator can handle it all with precision and clarity. It's particularly useful for mathematical education, financial calculations, and scientific computations where decimal precision is crucial.
        </p>
      </ContentSection>

      <ContentSection id="features" title="Features of the Comparing Decimals Calculator">
        <h4><strong>Core Features:</strong></h4>
        <ul>
          <li><strong>Decimal Comparison:</strong> Compare any two decimal numbers with precision</li>
          <li><strong>Step-by-Step Solutions:</strong> Detailed explanations of the comparison process</li>
          <li><strong>Visual Results:</strong> Clear display of comparison symbols and relationships</li>
          <li><strong>Difference Calculation:</strong> Shows the absolute difference between numbers</li>
        </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas and Methods for Decimal Comparison">
        <p>This section provides the mathematical methods and formulas used in decimal comparison.</p>
        
        <h4><strong>Comparison Methods</strong></h4>
        <p><strong>Direct Comparison:</strong></p>
        <MathFormula formula="a \text{ vs } b" />
        <p>where <MathFormula formula="a" inline={true} /> and <MathFormula formula="b" inline={true} /> are decimal numbers.</p>

        <h4><strong>Comparison Rules:</strong></h4>
        <ul>
          <li><strong>Greater Than:</strong> <MathFormula formula="a > b" inline={true} /> when <MathFormula formula="a" inline={true} /> is larger than <MathFormula formula="b" inline={true} /></li>
          <li><strong>Less Than:</strong> <MathFormula formula="a < b" inline={true} /> when <MathFormula formula="a" inline={true} /> is smaller than <MathFormula formula="b" inline={true} /></li>
          <li><strong>Equal To:</strong> <MathFormula formula="a = b" inline={true} /> when both numbers are exactly the same</li>
        </ul>

        <h4><strong>Difference Calculation:</strong></h4>
        <p><strong>Absolute Difference:</strong></p>
        <MathFormula formula="|a - b|" />
        <p>This gives the positive difference between the two numbers, regardless of which is larger.</p>
      </ContentSection>

      <ContentSection id="explanation" title="Explanation of Decimal Comparison">
        <h4><strong>How Decimal Comparison Works</strong></h4>
        <p>When comparing decimal numbers, we follow these steps:</p>
        <ol>
          <li><strong>Align Decimal Places:</strong> Ensure both numbers have the same number of decimal places by adding trailing zeros if necessary.</li>
          <li><strong>Compare Digit by Digit:</strong> Starting from the leftmost digit, compare corresponding digits in each decimal place.</li>
          <li><strong>Determine Relationship:</strong> The first difference found determines which number is larger or smaller.</li>
        </ol>

        <h4><strong>Example Comparison Process</strong></h4>
        <p>Comparing 3.14 vs 3.14159:</p>
        <ol>
          <li>Align: 3.14000 vs 3.14159</li>
          <li>Compare whole numbers: 3 = 3 (continue)</li>
          <li>Compare tenths: 1 = 1 (continue)</li>
          <li>Compare hundredths: 4 = 4 (continue)</li>
          <li>Compare thousandths: 0 &lt; 1 (first difference found)</li>
          <li>Result: 3.14 &lt; 3.14159</li>
        </ol>
      </ContentSection>

      <ContentSection id="examples" title="Examples of Decimal Comparisons">
        <h4><strong>Example 1: Simple Comparison</strong></h4>
        <p>Compare 2.5 and 2.7:</p>
        <MathFormula formula="2.5 \text{ vs } 2.7" />
        <p>Since 2.5 &lt; 2.7, the first number is smaller.</p>

        <h4><strong>Example 2: Equal Numbers</strong></h4>
        <p>Compare 3.14159 and 3.14159:</p>
        <MathFormula formula="3.14159 = 3.14159" />
        <p>Both numbers are exactly equal.</p>

        <h4><strong>Example 3: Negative Numbers</strong></h4>
        <p>Compare -1.5 and 1.5:</p>
        <MathFormula formula="-1.5 < 1.5" />
        <p>Negative numbers are always less than positive numbers.</p>
      </ContentSection>

      <ContentSection id="units" title="Decimal Place Values">
        <div className="table-responsive">
                            <table className="styled-table">
                              <thead>
                                <tr>
                <th>Place</th>
                                  <th>Value</th>
                <th>Example</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                <td>Ones</td>
                <td>1</td>
                <td>3 in 3.14</td>
                                </tr>
                                <tr>
                <td>Tenths</td>
                <td>0.1</td>
                <td>1 in 3.14</td>
                                </tr>
                                <tr>
                <td>Hundredths</td>
                <td>0.01</td>
                <td>4 in 3.14</td>
                                </tr>
                                <tr>
                <td>Thousandths</td>
                <td>0.001</td>
                <td>1 in 3.141</td>
                                </tr>
                              </tbody>
                            </table>
                        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance of Decimal Comparison">
        <p>Decimal comparison is fundamental in mathematics and has applications across various fields. It allows us to:</p>
        <ul>
          <li><strong>Order Numbers:</strong> Arrange decimal numbers in ascending or descending order</li>
          <li><strong>Make Decisions:</strong> Compare measurements, prices, or quantities</li>
          <li><strong>Validate Results:</strong> Check if calculations are reasonable</li>
          <li><strong>Solve Problems:</strong> Use in equations and inequalities</li>
                    </ul>
        <p>Understanding decimal comparison is essential for advanced mathematical concepts and real-world applications.</p>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality of the Comparing Decimals Calculator">
        <p>The comparing decimals calculator provides several key functions:</p>
        <ul>
          <li><strong>Accurate Comparisons:</strong> Handles decimal numbers with any number of decimal places</li>
          <li><strong>Step-by-Step Solutions:</strong> Shows the complete comparison process</li>
          <li><strong>Visual Results:</strong> Displays results with clear mathematical symbols</li>
          <li><strong>Error Handling:</strong> Validates input and provides helpful error messages</li>
                      </ul>
        <p>This makes it an invaluable tool for learning and understanding decimal mathematics.</p>
      </ContentSection>

      <ContentSection id="applications" title="Applications of the Comparing Decimals Calculator">
        <ul>
          <li><strong>Education:</strong> Teaching decimal concepts and comparison methods</li>
          <li><strong>Finance:</strong> Comparing prices, interest rates, and financial calculations</li>
          <li><strong>Science:</strong> Comparing measurements, experimental results, and data analysis</li>
          <li><strong>Engineering:</strong> Comparing specifications, tolerances, and design parameters</li>
          <li><strong>Statistics:</strong> Comparing data points, averages, and statistical measures</li>
                    </ul>
      </ContentSection>

                    <FAQSection 
                      faqs={[
                        {
            question: "What is a comparing decimals calculator used for?",
            answer: "A comparing decimals calculator is used to determine the relationship between two decimal numbers (greater than, less than, or equal to) and provides step-by-step explanations."
          },
          {
            question: "How accurate is the decimal comparison?",
            answer: "The calculator provides precise comparisons using JavaScript's floating-point arithmetic, which is suitable for most practical applications."
          },
          {
            question: "Can I compare negative decimal numbers?",
            answer: "Yes, the calculator can handle both positive and negative decimal numbers, following standard mathematical comparison rules."
          },
          {
            question: "What if the numbers have different numbers of decimal places?",
            answer: "The calculator automatically handles numbers with different decimal places by treating missing places as zeros for comparison purposes."
          },
          {
            question: "Why is decimal comparison important?",
            answer: "Decimal comparison is essential for ordering numbers, making decisions based on measurements, and solving mathematical problems involving decimal quantities."
          }
        ]}
        title="Frequently Asked Questions (FAQs)"
      />
    </ToolPageLayout>
  );
};

export default ComparingDecimalsCalculator; 
