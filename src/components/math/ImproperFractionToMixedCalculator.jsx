import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/math/improper-fraction-to-mixed-calculator.css';

const ImproperFractionToMixedCalculator = () => {
  const [fraction, setFraction] = useState({ numerator: '11', denominator: '4' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Improper Fraction to Mixed Number Calculator',
    description: 'Convert improper fractions to mixed numbers with step-by-step solutions. Perfect for students learning fraction conversions and anyone working with mathematical calculations.',
    icon: 'fas fa-layer-group',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Improper Fraction to Mixed Number Calculator']
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
    { name: 'Fraction to Percent', url: '/math/calculators/fraction-to-percent-calculator', icon: 'fas fa-percentage' },
    { name: 'Decimal to Fraction', url: '/math/calculators/decimal-to-fraction-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-function' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-conversion', title: 'What is Improper to Mixed Conversion?' },
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
    // Validate input - only allow positive numbers
    const validatedValue = value.replace(/[^0-9]/g, '');
    
    setFraction(prev => ({
      ...prev,
      [field]: validatedValue
    }));
  };

  const calculateMixedNumber = () => {
    try {
      const numerator = parseInt(fraction.numerator);
      const denominator = parseInt(fraction.denominator);

      // Validate inputs
      if (isNaN(numerator) || isNaN(denominator)) {
        throw new Error('Please enter valid numbers');
      }

      if (denominator === 0) {
        throw new Error('Denominator cannot be zero');
      }

      if (numerator <= 0) {
        throw new Error('Numerator must be positive');
      }

      if (denominator <= 0) {
        throw new Error('Denominator must be positive');
      }

      if (numerator < denominator) {
        throw new Error('Enter an improper fraction (numerator ≥ denominator)');
      }

      // Calculate mixed number
      const quotient = Math.floor(numerator / denominator);
      const remainder = numerator % denominator;

      // Generate step-by-step solution
      const steps = generateSteps(numerator, denominator, quotient, remainder);

      setResult({
        numerator,
        denominator,
        quotient,
        remainder,
        steps,
        isWholeNumber: remainder === 0
      });
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const generateSteps = (numerator, denominator, quotient, remainder) => {
    const steps = [];

    steps.push(`Step 1: Given improper fraction: \\frac{${numerator}}{${denominator}}`);
    steps.push(`Step 2: Divide numerator by denominator: ${numerator} ÷ ${denominator} = ${quotient} remainder ${remainder}`);
    steps.push(`Step 3: This means: ${numerator} = ${denominator} × ${quotient} + ${remainder}`);
    steps.push(`Step 4: Form the mixed number:`);
    steps.push(`   • Quotient (${quotient}) becomes the whole number part`);
    steps.push(`   • Remainder (${remainder}) becomes the new numerator`);
    steps.push(`   • Original denominator (${denominator}) stays the same`);

    if (remainder === 0) {
      steps.push(`Step 5: Final Result: Since the remainder is 0, the result is just the whole number: ${quotient}`);
    } else {
      steps.push(`Step 5: Final Result: \\frac{${numerator}}{${denominator}} = ${quotient}\\frac{${remainder}}{${denominator}}`);
      steps.push(`This reads as: "${quotient} and ${remainder}/${denominator}"`);
    }

    return steps;
  };

  const handleReset = () => {
    setFraction({ numerator: '11', denominator: '4' });
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('\\text{Improper Fraction to Mixed Number: } \\frac{a}{b} = q\\frac{r}{b}', 
            document.getElementById('formula-example'));
          
          // Example 1 formulas
          katex.render('\\frac{11}{4} = 2\\frac{3}{4}', 
            document.getElementById('example1-formula'));
          
          // Example 2 formulas
          katex.render('\\frac{8}{3} = 2\\frac{2}{3}', 
            document.getElementById('example2-formula'));
          
          // Example 3 formulas
          katex.render('\\frac{15}{5} = 3', 
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

  // Render result formulas when result changes
  useEffect(() => {
    if (result && window.katex) {
      try {
        // Render input fraction
        katex.render(`\\frac{${result.numerator}}{${result.denominator}}`, 
          document.getElementById('input-fraction-formula'));
        
        // Render mixed number
        if (result.isWholeNumber) {
          katex.render(`${result.quotient}`, 
            document.getElementById('mixed-number-formula'));
        } else {
          katex.render(`${result.quotient}\\frac{${result.remainder}}{${result.denominator}}`, 
            document.getElementById('mixed-number-formula'));
        }

        // Render step formulas
        result.steps.forEach((step, index) => {
          if (step.includes('\\frac') || step.includes('\\text') || step.includes('\\times')) {
            const stepElement = document.getElementById(`step-formula-${index}`);
            if (stepElement) {
              katex.render(step, stepElement);
            }
          }
        });
      } catch (error) {
        console.log('KaTeX result rendering error:', error);
      }
    }
  }, [result]);

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Improper Fraction to Mixed Number Calculator"
        onCalculate={calculateMixedNumber}
        calculateButtonText="Convert to Mixed Number"
        error={error}
        result={null}
      >
        <div className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="numerator" className="input-label">
                        Numerator:
                      </label>
                      <input
                        type="text"
                        id="numerator"
                        name="numerator"
                        className="input-field"
                        value={fraction.numerator}
                        onChange={(e) => handleInputChange('numerator', e.target.value)}
                        placeholder="e.g., 11"
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
                        value={fraction.denominator}
                        onChange={(e) => handleInputChange('denominator', e.target.value)}
                        placeholder="e.g., 4"
                      />
                    </div>

                    <small className="input-help">
                      Enter an improper fraction (numerator ≥ denominator). Both values must be positive integers.
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
          <div className="result-section improper-fraction-to-mixed-result">
                      <h3 className="result-title">Conversion Result</h3>
                      <div className="result-content">
                                                 <div className="result-main">
                           <div className="result-item">
                             <strong>Input Fraction:</strong>
                             <div className="result-formula" id="input-fraction-formula"></div>
                           </div>
                           <div className="result-item">
                             <strong>Mixed Number:</strong>
                             <div className="result-formula" id="mixed-number-formula"></div>
                           </div>
                           {!result.isWholeNumber && (
                             <div className="result-item">
                               <strong>Read as:</strong>
                               <span>"{result.quotient} and {result.remainder}/{result.denominator}"</span>
                             </div>
                           )}
                         </div>
                        
                                                 <div className="result-steps">
                           <h4>Calculation Steps:</h4>
                           <div className="steps-container">
                             {result.steps.map((step, index) => (
                               <div key={index} className="step">
                                 {step.includes('\\frac') || step.includes('\\text') || step.includes('\\times') ? (
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
                        Converting improper fractions to mixed numbers is a fundamental mathematical skill that helps us 
                        understand and work with fractions in a more intuitive format. An improper fraction has a numerator 
                        that is greater than or equal to its denominator, and converting it to a mixed number makes it 
                        easier to visualize and work with.
                      </p>
                      <p>
                        Our Improper Fraction to Mixed Number Calculator simplifies this conversion process by providing 
                        step-by-step solutions. This tool helps students understand the conversion process and professionals 
                        quickly convert improper fractions to mixed numbers for their calculations.
                      </p>
      </ContentSection>

      <ContentSection id="what-is-conversion" title="What is Improper to Mixed Number Conversion?">
                      <p>
                        Improper to mixed number conversion is the process of transforming an improper fraction into its 
                        equivalent mixed number representation. This involves dividing the numerator by the denominator 
                        to find the whole number part and the remainder becomes the new numerator.
                      </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Purpose:</strong> Express improper fractions as mixed numbers for easier understanding and visualization</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Method:</strong> Divide numerator by denominator to get quotient and remainder</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Result:</strong> Mixed number with whole number part and proper fraction part</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Applications:</strong> Essential for mathematics, engineering, and everyday calculations</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
                    <div className="formula-section">
                      <h3>Basic Conversion Formula</h3>
                      <div className="math-formula" id="formula-example"></div>
                      <p>Where q is the quotient and r is the remainder when a is divided by b.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Conversion Steps</h3>
                      <ul>
                        <li><strong>Step 1:</strong> Divide the numerator by the denominator</li>
                        <li><strong>Step 2:</strong> The quotient becomes the whole number part</li>
                        <li><strong>Step 3:</strong> The remainder becomes the new numerator</li>
                        <li><strong>Step 4:</strong> The original denominator stays the same</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Examples</h3>
                      <p>
                        Improper fraction: 11/4 = 2 3/4<br/>
                        Improper fraction: 8/3 = 2 2/3<br/>
                        Improper fraction: 15/5 = 3 (whole number)
                      </p>
                    </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Improper Fraction to Mixed Number Calculator">
                      <p>Using the calculator is straightforward:</p>
                    <ul className="usage-steps">
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Numerator:</strong> Input the numerator of your improper fraction.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Enter Denominator:</strong> Input the denominator of your improper fraction.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Calculate:</strong> Click the "Convert to Mixed Number" button to get the result.</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>View Results:</strong> The calculator will show the mixed number and step-by-step solution.</span>
                      </li>
                    </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
                    <div className="example-section">
                      <h3>Example 1: Basic Conversion</h3>
                      <p>Convert: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 11 by 4</p>
                        <p><strong>Step 2:</strong> 11 ÷ 4 = 2 remainder 3</p>
                        <p><strong>Step 3:</strong> Quotient (2) becomes whole number part</p>
                        <p><strong>Step 4:</strong> Remainder (3) becomes new numerator</p>
                        <p><strong>Result:</strong> 11/4 = 2 3/4</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Another Conversion</h3>
                      <p>Convert: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 8 by 3</p>
                        <p><strong>Step 2:</strong> 8 ÷ 3 = 2 remainder 2</p>
                        <p><strong>Step 3:</strong> Quotient (2) becomes whole number part</p>
                        <p><strong>Step 4:</strong> Remainder (2) becomes new numerator</p>
                        <p><strong>Result:</strong> 8/3 = 2 2/3</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Whole Number Result</h3>
                      <p>Convert: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Step 1:</strong> Divide 15 by 5</p>
                        <p><strong>Step 2:</strong> 15 ÷ 5 = 3 remainder 0</p>
                        <p><strong>Step 3:</strong> Since remainder is 0, result is just the whole number</p>
                        <p><strong>Result:</strong> 15/5 = 3</p>
                      </div>
                    </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
                    <p>
                      Understanding improper fraction to mixed number conversion is crucial in mathematics for several reasons:
                    </p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Essential for understanding fraction concepts and mathematical operations</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Foundation for advanced mathematics, algebra, and calculus</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span>Used in engineering calculations and scientific measurements</span>
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
                    <p>Our Improper Fraction to Mixed Number Calculator provides:</p>
                    <ul>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Input Validation:</strong> Ensures valid positive integers and proper improper fractions</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Accurate Results:</strong> Provides both mixed number and whole number results</span>
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
                        <span><strong>User-friendly Interface:</strong> Simple and intuitive design</span>
                      </li>
                      <li>
                        <i className="fas fa-check"></i>
                        <span><strong>Mathematical Notation:</strong> Proper fraction display with LaTeX rendering</span>
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
                        <h4><i className="fas fa-calculator"></i> Engineering</h4>
                        <p>Technical calculations and engineering applications</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Science</h4>
                        <p>Laboratory measurements and scientific calculations</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Finance</h4>
                        <p>Financial calculations and percentage conversions</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-cogs"></i> Manufacturing</h4>
                        <p>Production calculations and measurement conversions</p>
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
                          question: "What is an improper fraction?",
                          answer: "An improper fraction is a fraction where the numerator is greater than or equal to the denominator (e.g., 11/4, 8/3, 15/5)."
                        },
                        {
                          question: "What is a mixed number?",
                          answer: "A mixed number is a combination of a whole number and a proper fraction (e.g., 2 3/4, 1 1/2)."
                        },
                        {
                          question: "When do I get a whole number result?",
                          answer: "You get a whole number result when the numerator is exactly divisible by the denominator (e.g., 15/5 = 3)."
                        },
                        {
                          question: "Can I convert proper fractions?",
                          answer: "No, this calculator is designed for improper fractions only. For proper fractions, the result would be 0 with the original fraction as the remainder."
                        },
                        {
                          question: "What if I enter a proper fraction?",
                          answer: "The calculator will show an error message asking you to enter an improper fraction (numerator ≥ denominator)."
                        },
                        {
                          question: "How accurate are the conversions?",
                          answer: "The calculator provides 100% accurate conversions using standard mathematical division and remainder operations."
                        }
                      ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default ImproperFractionToMixedCalculator;
