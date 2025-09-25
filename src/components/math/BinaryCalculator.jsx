import React, { useState } from 'react';
import { ToolHero, ToolLayout, ContentSection, TableOfContents, FeedbackForm, FAQSection, MathFormula } from '../tool';
import { getRelatedTools } from '../../utils/toolHelpers';
import binaryCalculatorLogic from '../../assets/js/math/binary-calculator.js';
// import '../../assets/css/math/binary-calculator.css';

const BinaryCalculator = () => {
  const [formData, setFormData] = useState(binaryCalculatorLogic.resetFormData());
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    const typeField = field === 'firstNumber' ? 'firstNumberType' : 'secondNumberType';
    if (binaryCalculatorLogic.validateInput(value, formData[typeField])) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTypeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOperatorChange = (value) => {
    setFormData(prev => ({
      ...prev,
      operator: value
    }));
  };

  const calculate = () => {
    const calculationResult = binaryCalculatorLogic.calculate(formData);
    
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
    setFormData(binaryCalculatorLogic.resetFormData());
    setResult(null);
    setError('');
  };

  // Content sections for the Binary Calculator
  const contentSections = [
    {
      id: "introduction",
      title: "Introduction",
      intro: [
        "Binary numbers are the foundation of computer science and digital electronics. They use only two digits: 0 and 1, representing the base-2 number system.",
        "Our Binary Calculator allows you to perform arithmetic and logical operations on numbers in different number systems including binary, decimal, hexadecimal, and octal."
      ]
    },
    {
      id: "what-is-binary",
      title: "What is Binary?",
      intro: [
        "Binary is a number system that uses only two digits: 0 and 1. Each position represents a power of 2, making it the fundamental language of computers."
      ],
      list: [
        "Binary uses base-2 number system",
        "Each digit is called a bit (binary digit)",
        "8 bits make a byte",
        "Computers process all data as binary"
      ]
    },
    {
      id: "operations",
      title: "Supported Operations",
      list: [
        "Addition (+): Add two numbers",
        "Subtraction (-): Subtract second number from first",
        "Multiplication (×): Multiply two numbers",
        "Division (÷): Divide first number by second (integer division)",
        "AND: Bitwise AND operation",
        "OR: Bitwise OR operation",
        "XOR: Bitwise XOR operation",
        "NOT: Bitwise NOT operation (complement)"
      ],
             content: (
         <div>
           <p>Our calculator supports the following binary operations:</p>
           <div style={{ marginTop: '1rem' }}>
             <MathFormula formula="(1101)_2 = 1 \times 2^3 + 1 \times 2^2 + 0 \times 2^1 + 1 \times 2^0 = 13" variant="content" />
             <MathFormula formula="13 = 1101_2" variant="content" />
             <MathFormula formula="1101_2 + 1010_2 = 10111_2" variant="content" />
             <MathFormula formula="1101_2 - 1010_2 = 11_2" variant="content" />
             <MathFormula formula="1101_2 \times 1010_2 = 10000010_2" variant="content" />
             <MathFormula formula="1101_2 \land 1010_2 = 1000_2" variant="content" />
             <MathFormula formula="1101_2 \lor 1010_2 = 1111_2" variant="content" />
             <MathFormula formula="1101_2 \oplus 1010_2 = 0111_2" variant="content" />
           </div>
         </div>
       )
    },
    {
      id: "how-to-use",
      title: "How to Use Binary Calculator",
      steps: [
        "Select the number system for your first number (Binary, Decimal, Hexadecimal, or Octal)",
        "Enter your first number in the selected format",
        "Choose the operation you want to perform",
        "If the operation requires two numbers, enter the second number and its number system",
        "Click Calculate to see the result in all number systems",
        "Review the step-by-step solution for understanding"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      examples: [
        {
          title: "Example 1: Binary Addition",
          description: "Calculate: 101010 + 11011",
          solution: [
            { label: "Step 1", content: "Convert to decimal: 101010₂ = 42₁₀, 11011₂ = 27₁₀" },
            { label: "Step 2", content: "Add: 42 + 27 = 69" },
            { label: "Step 3", content: "Convert back: 69₁₀ = 1000101₂" },
            { label: "Result", content: "101010 + 11011 = 1000101₂ = 69₁₀" }
          ],
                     content: (
             <div>
               <p><strong>Problem:</strong> Calculate <MathFormula formula="101010_2 + 11011_2" variant="content" /></p>
               <div className="solution-steps">
                 <h4>Solution:</h4>
                 <ol>
                   <li>Convert to decimal: <MathFormula formula="101010_2 = 42_{10}" variant="content" /> and <MathFormula formula="11011_2 = 27_{10}" variant="content" /></li>
                   <li>Add in decimal: <MathFormula formula="42 + 27 = 69" variant="content" /></li>
                   <li>Convert back to binary: <MathFormula formula="69_{10} = 1000101_2" variant="content" /></li>
                   <li>Result: <MathFormula formula="101010_2 + 11011_2 = 1000101_2 = 69_{10}" variant="result" /></li>
                 </ol>
               </div>
             </div>
           )
        },
        {
          title: "Example 2: Logical AND",
          description: "Calculate: A5 AND 3F (hexadecimal)",
          solution: [
            { label: "Step 1", content: "Convert to decimal: A5₁₆ = 165₁₀, 3F₁₆ = 63₁₀" },
            { label: "Step 2", content: "Convert to binary: 165₁₀ = 10100101₂, 63₁₀ = 00111111₂" },
            { label: "Step 3", content: "AND operation: 10100101 AND 00111111 = 00100101₂" },
            { label: "Result", content: "A5 AND 3F = 25₁₆ = 37₁₀" }
          ],
                     content: (
             <div>
               <p><strong>Problem:</strong> Calculate <MathFormula formula="A5_{16} \land 3F_{16}" variant="content" /> (bitwise AND)</p>
               <div className="solution-steps">
                 <h4>Solution:</h4>
                 <ol>
                   <li>Convert to decimal: <MathFormula formula="A5_{16} = 165_{10}" variant="content" /> and <MathFormula formula="3F_{16} = 63_{10}" variant="content" /></li>
                   <li>Convert to binary: <MathFormula formula="165_{10} = 10100101_2" variant="content" /> and <MathFormula formula="63_{10} = 00111111_2" variant="content" /></li>
                   <li>AND operation: <MathFormula formula="10100101_2 \land 00111111_2 = 00100101_2" variant="content" /></li>
                   <li>Convert back: <MathFormula formula="00100101_2 = 25_{16} = 37_{10}" variant="content" /></li>
                   <li>Result: <MathFormula formula="A5_{16} \land 3F_{16} = 25_{16} = 37_{10}" variant="result" /></li>
                 </ol>
               </div>
             </div>
           )
        }
      ]
    },
    {
      id: "significance",
      title: "Significance",
      list: [
        "Essential for computer programming and digital electronics",
        "Used in cryptography and data encoding",
        "Fundamental for understanding computer architecture",
        "Important in network protocols and data transmission",
        "Used in image processing and multimedia applications"
      ]
    },
         {
       id: "applications",
       title: "Applications",
       list: [
         "Computer programming and software development",
         "Digital circuit design and electronics",
         "Network protocols and data communication",
         "Cryptography and security systems",
         "Image and video processing",
         "Embedded systems and microcontrollers"
       ]
     },
     {
       id: "faqs",
       title: "Frequently Asked Questions",
       content: (
         <FAQSection 
           faqs={[
             {
               question: "What is the difference between binary and decimal numbers?",
               answer: "Binary numbers use only two digits (0 and 1) and represent values in base-2, while decimal numbers use ten digits (0-9) and represent values in base-10. Binary is the fundamental language of computers."
             },
             {
               question: "How do I convert a decimal number to binary?",
               answer: "To convert decimal to binary, repeatedly divide the number by 2 and record the remainders in reverse order. For example, 13 in decimal is 1101 in binary (13 ÷ 2 = 6 remainder 1, 6 ÷ 2 = 3 remainder 0, 3 ÷ 2 = 1 remainder 1, 1 ÷ 2 = 0 remainder 1)."
             },
             {
               question: "What are bitwise operations?",
               answer: "Bitwise operations perform calculations on individual bits of binary numbers. Common operations include AND, OR, XOR, and NOT. These are fundamental in computer programming and digital electronics."
             },
             {
               question: "Why do computers use binary?",
               answer: "Computers use binary because electronic circuits can easily represent two states (on/off, high/low voltage). Binary is also mathematically efficient for digital logic operations and error detection."
             },
             {
               question: "What is hexadecimal and why is it used?",
               answer: "Hexadecimal is a base-16 number system using digits 0-9 and letters A-F. It's commonly used in programming because it's more compact than binary (4 binary digits = 1 hexadecimal digit) and easier to read."
             }
           ]}
         />
       )
     }
   ];

  // Table of Contents sections
  const tocSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-is-binary", title: "What is Binary?" },
    { id: "operations", title: "Supported Operations" },
    { id: "how-to-use", title: "How to Use" },
    { id: "examples", title: "Examples" },
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
        title="Binary Calculator"
        icon="fas fa-calculator"
        description="Perform arithmetic and logical operations on binary, decimal, hexadecimal, and octal numbers with step-by-step solutions."
        features={[
          "Multiple number systems",
          "Arithmetic operations",
          "Logical operations",
          "Step-by-step solutions"
        ]}
      />
      
      <ToolLayout sidebarProps={sidebarProps}>
        {/* Calculator Section */}
        <section className="calculator-section">
          <div className="calculator-container">
            <h2 className="calculator-title">
              <i className="fas fa-calculator"></i>
              Binary Calculator
            </h2>
            
            <form className="calculator-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstNumber">First Number</label>
                  <input
                    type="text"
                    id="firstNumber"
                    value={formData.firstNumber}
                    onChange={(e) => handleInputChange('firstNumber', e.target.value)}
                    placeholder="Enter first number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="firstNumberType">Number System</label>
                  <select
                    id="firstNumberType"
                    value={formData.firstNumberType}
                    onChange={(e) => handleTypeChange('firstNumberType', e.target.value)}
                  >
                    <option value="binary">Binary</option>
                    <option value="decimal">Decimal</option>
                    <option value="hexadecimal">Hexadecimal</option>
                    <option value="octal">Octal</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="operator">Operation</label>
                  <select
                    id="operator"
                    value={formData.operator}
                    onChange={(e) => handleOperatorChange(e.target.value)}
                  >
                    <option value="+">Addition (+)</option>
                    <option value="-">Subtraction (-)</option>
                    <option value="*">Multiplication (×)</option>
                    <option value="/">Division (÷)</option>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="XOR">XOR</option>
                    <option value="NOT">NOT</option>
                  </select>
                </div>
              </div>

              {formData.operator !== 'NOT' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="secondNumber">Second Number</label>
                    <input
                      type="text"
                      id="secondNumber"
                      value={formData.secondNumber}
                      onChange={(e) => handleInputChange('secondNumber', e.target.value)}
                      placeholder="Enter second number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="secondNumberType">Number System</label>
                    <select
                      id="secondNumberType"
                      value={formData.secondNumberType}
                      onChange={(e) => handleTypeChange('secondNumberType', e.target.value)}
                    >
                      <option value="binary">Binary</option>
                      <option value="decimal">Decimal</option>
                      <option value="hexadecimal">Hexadecimal</option>
                      <option value="octal">Octal</option>
                    </select>
                  </div>
                </div>
              )}

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
                <h3 className="result-title">Result</h3>
                <div className="result-display">
                  <div className="results-container">
                    <div className="result-row">
                      <span className="result-label">Binary:</span>
                      <span className="result-value">{result.binary}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Decimal:</span>
                      <span className="result-value">{result.decimal}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Hexadecimal:</span>
                      <span className="result-value">{result.hexadecimal}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Octal:</span>
                      <span className="result-value">{result.octal}</span>
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

export default BinaryCalculator; 