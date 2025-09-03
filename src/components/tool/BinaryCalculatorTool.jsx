import React, { useState } from 'react';
import ToolPageLayout from './ToolPageLayout';
import CalculatorSection from './CalculatorSection';
import ContentSection from './ContentSection';
import MathFormula from './MathFormula';
import FAQSection from './FAQSection';
import TableOfContents from './TableOfContents';
import FeedbackForm from './FeedbackForm';

const BinaryCalculatorTool = () => {
  // Calculator state
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
  const [firstNumberType, setFirstNumberType] = useState('binary');
  const [secondNumberType, setSecondNumberType] = useState('binary');
  const [operator, setOperator] = useState('add');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data configuration
  const toolData = {
    name: 'Binary Calculator',
    description: 'Perform arithmetic operations and conversions between binary, decimal, hexadecimal, and octal number systems with precision and ease.',
    icon: 'fas fa-calculator',
    category: 'Math',
    breadcrumb: {
      categoryName: 'Math Calculators',
      categoryUrl: '/math'
    }
  };

  // Table of Contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'features-of-the-binary-calculator', title: 'Features' },
    { id: 'formulas-for-binary-operations', title: 'Formulas' },
    { id: 'explanation-of-formulas', title: 'Explanation' },
    { id: 'examples-of-calculations', title: 'Examples' },
    { id: 'units-used-in-binary-calculations', title: 'Units' },
    { id: 'significance-of-binary-calculations', title: 'Significance' },
    { id: 'functionality-of-the-binary-calculator', title: 'Functionality' },
    { id: 'applications-of-the-binary-calculator', title: 'Applications' },
    { id: 'frequently-asked-questions-faqs', title: 'FAQs' }
  ];

  // Categories for sidebar
  const categories = [
    { name: 'Math Calculators', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance Calculators', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Science Calculators', url: '/science', icon: 'fas fa-atom' },
    { name: 'Health Calculators', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Utility Tools', url: '/utility-tools', icon: 'fas fa-tools' },
    { name: 'Knowledge Calculators', url: '/knowledge', icon: 'fas fa-brain' }
  ];

  // Related tools
  const relatedTools = [
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'LCM Calculator', url: '/math/calculators/lcm-calculator', icon: 'fas fa-sort-numeric-up' }
  ];

  // FAQ data
  const faqs = [
    {
      question: "What is a binary calculator used for?",
      answer: "A binary calculator is used to perform arithmetic and logical operations with binary numbers and convert between different number systems."
    },
    {
      question: "Can this calculator convert between binary and hexadecimal?",
      answer: "Yes, it can easily convert between binary, hexadecimal, decimal, and octal."
    },
    {
      question: "What are bitwise operations?",
      answer: "Bitwise operations involve manipulating individual bits and include AND, OR, NOT, and XOR functions."
    },
    {
      question: "How do I use the calculator for binary addition?",
      answer: "Input the two binary numbers and select the 'Addition' operation. The calculator will handle the addition and display the result."
    },
    {
      question: "Why is binary important in computing?",
      answer: "Binary is the foundation of digital systems, allowing computers to process data using two simple states, which simplifies the design and functionality of hardware and software."
    }
  ];

  // Calculator logic
  const validateInput = (value, type) => {
    const patterns = {
      binary: /^[01]*$/,
      decimal: /^[0-9]*$/,
      hexadecimal: /^[0-9A-Fa-f]*$/,
      octal: /^[0-7]*$/
    };
    return patterns[type].test(value);
  };

  const convertToDecimal = (value, type) => {
    switch (type) {
      case 'binary': return parseInt(value, 2);
      case 'decimal': return parseInt(value, 10);
      case 'hexadecimal': return parseInt(value, 16);
      case 'octal': return parseInt(value, 8);
      default: return 0;
    }
  };

  const convertFromDecimal = (value, type) => {
    switch (type) {
      case 'binary': return value.toString(2);
      case 'decimal': return value.toString(10);
      case 'hexadecimal': return value.toString(16).toUpperCase();
      case 'octal': return value.toString(8);
      default: return '0';
    }
  };

  const handleCalculate = () => {
    setError('');
    
    if (!firstNumber || !secondNumber) {
      setError('Please enter both numbers');
      return;
    }

    if (!validateInput(firstNumber, firstNumberType)) {
      setError(`Invalid ${firstNumberType} number format`);
      return;
    }

    if (!validateInput(secondNumber, secondNumberType)) {
      setError(`Invalid ${secondNumberType} number format`);
      return;
    }

    try {
      const num1 = convertToDecimal(firstNumber, firstNumberType);
      const num2 = convertToDecimal(secondNumber, secondNumberType);
      let resultValue = 0;

      switch (operator) {
        case 'add': resultValue = num1 + num2; break;
        case 'subtract': resultValue = num1 - num2; break;
        case 'multiply': resultValue = num1 * num2; break;
        case 'divide': 
          if (num2 === 0) {
            setError('Division by zero is not allowed');
            return;
          }
          resultValue = Math.floor(num1 / num2);
          break;
        default: resultValue = 0;
      }

      setResult({
        'Binary': convertFromDecimal(resultValue, 'binary'),
        'Decimal': convertFromDecimal(resultValue, 'decimal'),
        'Hexadecimal': convertFromDecimal(resultValue, 'hexadecimal'),
        'Octal': convertFromDecimal(resultValue, 'octal')
      });
    } catch (err) {
      setError('Calculation error occurred');
    }
  };

  return (
    <ToolPageLayout
      toolData={toolData}
      tableOfContents={tableOfContents}
      relatedTools={relatedTools}
      categories={categories}
    >
      {/* Calculator Section */}
      <CalculatorSection
        title="Binary Calculator"
        subtitle="Perform calculations and conversions between number systems"
        icon="fas fa-calculator"
        result={result}
        error={error}
        onCalculate={handleCalculate}
        calculateButtonText="Calculate & Convert"
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Number</label>
            <input
              type="text"
              className="form-input"
              value={firstNumber}
              onChange={(e) => setFirstNumber(e.target.value)}
              placeholder="Enter first number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Number Type</label>
            <select
              className="form-select"
              value={firstNumberType}
              onChange={(e) => setFirstNumberType(e.target.value)}
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
            <label className="form-label">Operation</label>
            <select
              className="form-select"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="add">Addition (+)</option>
              <option value="subtract">Subtraction (-)</option>
              <option value="multiply">Multiplication (×)</option>
              <option value="divide">Division (÷)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Second Number</label>
            <input
              type="text"
              className="form-input"
              value={secondNumber}
              onChange={(e) => setSecondNumber(e.target.value)}
              placeholder="Enter second number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Number Type</label>
            <select
              className="form-select"
              value={secondNumberType}
              onChange={(e) => setSecondNumberType(e.target.value)}
            >
              <option value="binary">Binary</option>
              <option value="decimal">Decimal</option>
              <option value="hexadecimal">Hexadecimal</option>
              <option value="octal">Octal</option>
            </select>
          </div>
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
          A <a href="/math/calculators/binary-calculator">binary calculator</a> is a specialized tool that allows users to perform operations with numbers in various numeral systems, such as binary, decimal, hexadecimal, and octal. It facilitates conversion between these systems and supports basic arithmetic operations (addition, subtraction, multiplication, and division), as well as bitwise operations (AND, OR, NOT, XOR). For a decimal system, a dedicated <a href="/math/calculators/decimal-calculator">Decimal Calculator</a> can also be useful for more focused calculations.
        </p>
        <p>
          Whether you need a binary to decimal calculator, binary addition calculator, decimal to binary calculator, adding binary numbers calculator, binary to hexadecimal, hexadecimal to binary, binary to octal, or octal to binary converter, this binary calculator can do it all in a user-friendly way.
        </p>
      </ContentSection>

      <ContentSection id="features-of-the-binary-calculator" title="Features of the Binary Calculator">
        <h4><strong>Conversions:</strong></h4>
        <ul>
          <li><strong>Binary to Decimal and Decimal to Binary</strong></li>
          <li><strong>Binary to Hexadecimal and Hexadecimal to Binary</strong></li>
          <li><strong>Binary to Octal and Octal to Binary</strong></li>
        </ul>
      </ContentSection>

      <ContentSection id="formulas-for-binary-operations" title="Formulas for Binary Operations">
        <p>This section provides the formulas used in the binary calculator for different operations between binary, decimal, hexadecimal, and octal.</p>
        
        <h4><strong>Conversion Formulas</strong></h4>
        <MathFormula formula="\text{Decimal} = \sum_{i=0}^{n} b_i \times 2^i" />
        <p>where <MathFormula formula="b_i" inline /> is each bit in the binary number.</p>
        
        <ul>
          <li><strong>Decimal to Binary:</strong> Continuously divide the decimal number by 2 and record the remainders.</li>
          <li><strong>Binary to Hexadecimal:</strong> Group binary digits into sets of four (from right to left), then convert each set to its hexadecimal equivalent.</li>
          <li><strong>Hexadecimal to Binary:</strong> Convert each hexadecimal digit into its 4-bit binary equivalent.</li>
          <li><strong>Binary to Octal:</strong> Group binary digits into sets of three (from right to left), then convert each set to its octal equivalent.</li>
          <li><strong>Octal to Binary:</strong> Convert each octal digit into its 3-bit binary equivalent.</li>
        </ul>

        <h4><strong>Basic Arithmetic Operations:</strong></h4>
        <p><strong>Binary Addition:</strong></p>
        <MathFormula formula="A + B" />
        <p>Follow the binary addition rules, where <MathFormula formula="1 + 1 = 10" inline /> (carry 1).</p>

        <p><strong>Binary Subtraction:</strong></p>
        <MathFormula formula="A - B" />
        <p>Use binary borrowing, similar to decimal subtraction.</p>

        <p><strong>Binary Multiplication:</strong></p>
        <p>Multiply each bit by the opposite binary number and sum the partial products.</p>

        <p><strong>Binary Division:</strong></p>
        <p>Divide the binary numbers, similar to long division in decimal.</p>
        
        <h4><strong>Bitwise Operations:</strong></h4>
        <ul>
          <li><strong>AND:</strong> Each bit is compared; if both bits are 1, the result is 1; otherwise, it's 0.</li>
          <li><strong>OR:</strong> If either bit is 1, the result is 1.</li>
          <li><strong>NOT:</strong> Inverts all bits (0 becomes 1, and 1 becomes 0).</li>
          <li><strong>XOR:</strong> If the bits differ, the result is 1; otherwise, it's 0.</li>
        </ul>
      </ContentSection>

      <ContentSection id="explanation-of-formulas" title="Explanation of Formulas">
        <h4><strong>Binary to Decimal Conversion</strong></h4>
        <p>In this operation, each binary digit (bit) is multiplied by powers of 2, depending on its position in the number. For example, the binary number 1101 is calculated as:</p>
        <MathFormula formula="1 \times 2^3 + 1 \times 2^2 + 0 \times 2^1 + 1 \times 2^0 = 8 + 4 + 0 + 1 = 13" />

        <h4><strong>Binary Addition</strong></h4>
        <p>When adding two binary numbers, you add each column of bits from right to left. If the sum of two bits is 2 (binary 10), you carry 1 to the next column.</p>
        <p>Example:</p>
        <MathFormula formula="101 + 110 = 1011" />

        <h4><strong>Binary Multiplication</strong></h4>
        <p>Binary multiplication follows similar steps to decimal multiplication. Each digit in the first binary number multiplies the entire second binary number, and then the results are added.</p>
        <p>Example:</p>
        <MathFormula formula="101 \times 11 = 1111" />
      </ContentSection>

      <ContentSection id="examples-of-calculations" title="Examples of Calculations">
        <h4><strong>Binary to Hexadecimal Conversion</strong></h4>
        <p>Convert the binary number 110101 to hexadecimal:</p>
        <ul>
          <li>Pad binary to 00110101.</li>
          <li>Group as 0011 and 0101.</li>
          <li>Convert: 0011 is 3, 0101 is 5, so the result is 35.</li>
        </ul>
      </ContentSection>

      <ContentSection id="units-used-in-binary-calculations" title="Units Used in Binary Calculations">
        <ContentSection.Table
          headers={['Unit', 'Meaning']}
          rows={[
            ['Bit', 'Smallest unit, a single binary digit (0 or 1)'],
            ['Nibble', '4 bits'],
            ['Byte', '8 bits'],
            ['Kilobyte', '1024 bytes']
          ]}
        />
      </ContentSection>

      <ContentSection id="significance-of-binary-calculations" title="Significance of Binary Calculations">
        <p>Binary calculations are fundamental in computing and digital electronics. They allow machines to process complex information using only two states, 0 and 1, simplifying data storage and transmission. The binary system is essential for developing applications across various fields, including cryptography, data processing, and digital communications.</p>
      </ContentSection>

      <ContentSection id="functionality-of-the-binary-calculator" title="Functionality of the Binary Calculator">
        <p>The binary calculator's functions include:</p>
        <ul>
          <li><strong>Accurate Conversions:</strong> Converting seamlessly between binary, decimal, hexadecimal, and octal.</li>
          <li><strong>Precision in Calculations:</strong> Handling large binary numbers with arithmetic operations.</li>
          <li><strong>Bitwise Operations:</strong> Providing efficient computation for logical operations, used in digital circuits and cryptography.</li>
        </ul>
        <p>This versatility makes it an essential tool for students, engineers, and computer scientists.</p>
      </ContentSection>

      <ContentSection id="applications-of-the-binary-calculator" title="Applications of the Binary Calculator">
        <ul>
          <li><strong>Computer Science:</strong> Used in algorithms, machine-level programming, and data encoding.</li>
          <li><strong>Electrical Engineering:</strong> For digital circuit design and logic gate calculations.</li>
          <li><strong>Mathematics Education:</strong> Aiding in learning and understanding different number systems.</li>
          <li><strong>Data Communication:</strong> For encoding and decoding information transmitted digitally.</li>
        </ul>
      </ContentSection>

      <FAQSection faqs={faqs} />
    </ToolPageLayout>
  );
};

export default BinaryCalculatorTool;
