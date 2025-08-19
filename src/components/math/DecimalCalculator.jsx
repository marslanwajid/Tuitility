import React, { useState, useEffect } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import decimalCalculatorLogic from '../../assets/js/math/decimal-calculator.js';
// import '../../assets/css/math/decimal-calculator.css';

const DecimalCalculator = () => {
  const [formData, setFormData] = useState(decimalCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    if (decimalCalculatorLogic.validateInput(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculate = () => {
    const calculationResult = decimalCalculatorLogic.calculate(formData);
    
    if (calculationResult.error) {
      setError(calculationResult.error);
      setResult(null);
    } else {
      setResult(calculationResult.result);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
  };

  const handleReset = () => {
    setFormData(decimalCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Render KaTeX formulas when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Addition formula
          katex.render('a + b', document.getElementById('addition-formula'));
          
          // Subtraction formula
          katex.render('a - b', document.getElementById('subtraction-formula'));
          
          // Multiplication formula
          katex.render('a \\times b', document.getElementById('multiplication-formula'));
          
          // Division formula
          katex.render('\\frac{a}{b}', document.getElementById('division-formula'));

          // Exponentiation formula
          katex.render('a^b', document.getElementById('exponentiation-formula'));

          // Root formula
          katex.render('\\sqrt[b]{a}', document.getElementById('root-formula'));

          // Logarithm formula
          katex.render('\\log_b(a)', document.getElementById('logarithm-formula'));

          // Example 1 formulas
          katex.render('12.5 + 4.2 = 16.7', document.getElementById('example1-formula'));
          katex.render('16.7', document.getElementById('example1-result'));

          // Example 2 formulas
          katex.render('\\frac{22.5}{7} = 3.214285714...', document.getElementById('example2-formula'));
          katex.render('3.214285714... \\approx 3.21', document.getElementById('example2-step2'));
          katex.render('3.21', document.getElementById('example2-result'));

          // Example 3 formulas
          katex.render('2.5^3 = 2.5 \\times 2.5 \\times 2.5', document.getElementById('example3-formula'));
          katex.render('2.5^3 = 15.625', document.getElementById('example3-result'));
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

  // Content sections for the Decimal Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Decimal numbers are a fundamental part of mathematics and everyday calculations. They represent numbers with fractional parts using a decimal point system.",
        "Our Decimal Calculator provides precise arithmetic operations on decimal numbers with step-by-step solutions and customizable rounding options."
      ]
    },
    {
      id: "what-are-decimals",
      title: "What are Decimal Numbers?",
      intro: [
        "Decimal numbers are a way to represent numbers that are not whole numbers, using a decimal point to separate the whole part from the fractional part."
      ],
      list: [
        "Decimal numbers use base-10 number system",
        "Each position after the decimal point represents a power of 1/10",
        "Examples: 3.14, 2.5, 0.001, 10.75",
        "Decimals can represent fractions and irrational numbers"
      ]
    },
    {
      id: "operations",
      title: "Supported Operations",
             list: [
         "Addition (+): Add two decimal numbers",
         "Subtraction (-): Subtract second number from first",
         "Multiplication (×): Multiply two decimal numbers",
         "Division (÷): Divide first number by second",
         "Exponentiation (^): Raise first number to the power of second",
         "Root (√): Calculate nth root of a number",
         "Logarithm (log): Calculate logarithm with custom base"
       ],
       content: (
         <div>
           <p>Our calculator supports the following mathematical operations:</p>
           <div style={{ marginTop: '1rem' }}>
             <MathFormula formula="a + b" variant="content" />
             <MathFormula formula="a - b" variant="content" />
             <MathFormula formula="a \times b" variant="content" />
             <MathFormula formula="\frac{a}{b}" variant="content" />
             <MathFormula formula="a^b" variant="content" />
             <MathFormula formula="\sqrt[b]{a}" variant="content" />
             <MathFormula formula="\log_b(a)" variant="content" />
           </div>
         </div>
       )
    },
    {
      id: "how-to-use",
      title: "How to Use Decimal Calculator",
      steps: [
        "Enter your first decimal number in the first input field",
        "Enter your second decimal number in the second input field",
        "Select the operation you want to perform from the dropdown",
        "Choose rounding precision if needed (or select 'none' for exact results)",
        "Click Calculate to see the result and step-by-step solution",
        "Use Reset to clear all inputs and start over"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
                 {
           title: "Example 1: Decimal Addition",
           description: "Calculate: 12.5 + 4.2",
           solution: [
             { label: "Step 1", content: "Add: 12.5 + 4.2" },
             { label: "Step 2", content: "Result = 16.7" },
             { label: "Note", content: "No rounding needed for this simple addition" }
           ],
           content: (
             <div>
               <p><strong>Problem:</strong> Calculate <MathFormula formula="12.5 + 4.2" variant="content" displayMode={false} /></p>
               <div className="solution-steps">
                 <h4>Solution:</h4>
                 <ol>
                   <li>Add the numbers: <MathFormula formula="12.5 + 4.2 = 16.7" variant="content" /></li>
                   <li>Result: <MathFormula formula="16.7" variant="result" /></li>
                 </ol>
               </div>
             </div>
           )
         },
                 {
           title: "Example 2: Decimal Division with Rounding",
           description: "Calculate: 22.5 ÷ 7 with rounding to 0.01",
           solution: [
             { label: "Step 1", content: "Divide: 22.5 ÷ 7" },
             { label: "Step 2", content: "Result = 3.214285714..." },
             { label: "Step 3", content: "Rounded to 0.01: 3.21" }
           ],
           content: (
             <div>
               <p><strong>Problem:</strong> Calculate <MathFormula formula="\frac{22.5}{7}" variant="content" /> with rounding to 0.01</p>
               <div className="solution-steps">
                 <h4>Solution:</h4>
                 <ol>
                   <li>Divide: <MathFormula formula="\frac{22.5}{7} = 3.214285714..." variant="content" /></li>
                   <li>Round to 0.01: <MathFormula formula="3.214285714... \approx 3.21" variant="content" /></li>
                   <li>Final result: <MathFormula formula="3.21" variant="result" /></li>
                 </ol>
               </div>
             </div>
           )
         },
                 {
           title: "Example 3: Exponentiation",
           description: "Calculate: 2.5^3",
           solution: [
             { label: "Step 1", content: "Calculate: 2.5^3" },
             { label: "Step 2", content: "Result = 15.625" },
             { label: "Note", content: "This is 2.5 × 2.5 × 2.5" }
           ],
           content: (
             <div>
               <p><strong>Problem:</strong> Calculate <MathFormula formula="2.5^3" variant="content" /></p>
               <div className="solution-steps">
                 <h4>Solution:</h4>
                 <ol>
                   <li>Calculate: <MathFormula formula="2.5^3 = 2.5 \times 2.5 \times 2.5" variant="content" /></li>
                   <li>Result: <MathFormula formula="2.5^3 = 15.625" variant="result" /></li>
                   <li>Note: This is equivalent to <MathFormula formula="2.5 \times 2.5 \times 2.5 = 15.625" variant="content" /></li>
                 </ol>
               </div>
             </div>
           )
         }
      ]
    },
    {
      id: "rounding",
      title: "Rounding Options",
      list: [
        "None: Display exact result without rounding",
        "0.1: Round to one decimal place",
        "0.01: Round to two decimal places",
        "0.001: Round to three decimal places",
        "0.0001: Round to four decimal places",
        "1: Round to nearest whole number",
        "10: Round to nearest ten",
        "100: Round to nearest hundred"
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for financial calculations and accounting",
        "Used in scientific measurements and research",
        "Important for engineering and construction",
        "Critical for statistical analysis and data science",
        "Used in everyday calculations like shopping and cooking"
      ]
    },
    {
      id: "applications",
      title: "Applications",
      list: [
        "Financial calculations and accounting",
        "Scientific research and measurements",
        "Engineering and construction projects",
        "Statistical analysis and data science",
        "Everyday calculations and budgeting",
        "Academic studies and homework"
      ]
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      content: (
        <FAQSection 
          faqs={[
            {
              question: "What is the difference between decimal and fraction?",
              answer: "Decimals use a decimal point system (like 3.14) while fractions use a ratio format (like 3/14). Decimals are often easier to work with in calculations and are the standard in most modern applications."
            },
            {
              question: "How accurate are the calculations?",
              answer: "The calculator provides high precision results. You can choose to round to specific decimal places or get exact results. The step-by-step solutions show the exact calculation process."
            },
            {
              question: "Can I use negative decimal numbers?",
              answer: "Yes, you can use negative decimal numbers for all operations. Simply add a minus sign before the number (e.g., -3.14)."
            },
            {
              question: "What happens if I divide by zero?",
              answer: "Division by zero is undefined in mathematics. The calculator will show an error message if you attempt to divide by zero."
            },
            {
              question: "How does rounding work?",
              answer: "Rounding follows standard mathematical rules. For example, rounding to 0.01 means the result will have at most 2 decimal places. The calculator shows both the exact result and the rounded result in the steps."
            }
          ]}
        />
      )
    }
  ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-are-decimals", title: "What are Decimal Numbers?" },
    { id: "operations", title: "Supported Operations" },
    { id: "how-to-use", title: "How to Use" },
    { id: "examples", title: "Examples" },
    { id: "rounding", title: "Rounding Options" },
    { id: "significance", title: "Significance" },
    { id: "applications", title: "Applications" },
    { id: "faqs", title: "FAQs" }
  ];

  // Sidebar props - Math-specific related tools
  const sidebarProps = {
    relatedTools: getRelatedTools('math')
  };

  return (
    <div className="tool-page">
      <ToolHero 
        title="Decimal Calculator"
        icon="fas fa-calculator"
        description="Perform precise arithmetic operations on decimal numbers with step-by-step solutions and customizable rounding options."
        features={[
          "Multiple operations",
          "Step-by-step solutions",
          "Customizable rounding",
          "High precision calculations"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="calculator-container">
            <h2 className="calculator-title">
              <i className="fas fa-calculator"></i>
              Decimal Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="num1">First Number</label>
                  <input
                    type="text"
                    id="num1"
                    value={formData.num1}
                    onChange={(e) => handleInputChange('num1', e.target.value)}
                    placeholder="Enter first number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="num2">Second Number</label>
                  <input
                    type="text"
                    id="num2"
                    value={formData.num2}
                    onChange={(e) => handleInputChange('num2', e.target.value)}
                    placeholder="Enter second number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="operation">Operation</label>
                  <select
                    id="operation"
                    value={formData.operation}
                    onChange={(e) => handleSelectChange('operation', e.target.value)}
                  >
                    <option value="+">Addition (+)</option>
                    <option value="-">Subtraction (-)</option>
                    <option value="*">Multiplication (×)</option>
                    <option value="/">Division (÷)</option>
                    <option value="^">Exponentiation (^)</option>
                    <option value="root">Root (√)</option>
                    <option value="log">Logarithm (log)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="rounding">Rounding</label>
                  <select
                    id="rounding"
                    value={formData.rounding}
                    onChange={(e) => handleSelectChange('rounding', e.target.value)}
                  >
                    <option value="none">None (Exact)</option>
                    <option value="0.1">0.1 (1 decimal)</option>
                    <option value="0.01">0.01 (2 decimals)</option>
                    <option value="0.001">0.001 (3 decimals)</option>
                    <option value="0.0001">0.0001 (4 decimals)</option>
                    <option value="1">1 (Whole number)</option>
                    <option value="10">10 (Nearest 10)</option>
                    <option value="100">100 (Nearest 100)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
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

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="result-section show">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Result
                </h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Result:</span>
                      <span className="result-value">{result.decimal}</span>
                    </div>
                  </div>
                  
                  <div className="solution-steps">
                    <h4>Solution Steps</h4>
                    <div className="steps-container">
                      {result.steps.map((step, index) => (
                        <div key={index} className="step">
                          {step}
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
            <TableOfContents sections={tocSections} />
            <FeedbackForm onSubmit={(data) => console.log('Feedback submitted:', data)} />
          </div>
        </section>

        {/* Content Section */}
        <ContentSection sections={contentSections} />
      </ToolLayout>
    </div>
  );
};

export default DecimalCalculator; 