import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import { computeDerivative, evaluateAtPoint, formatStepForDisplay } from '../../assets/js/math/derivative-calculator.js';
import '../../assets/css/math/derivative-calculator.css';

const DerivativeCalculator = () => {
  const [functionInput, setFunctionInput] = useState('x^3 + 2*x^2 + x + 1');
  const [variable, setVariable] = useState('x');
  const [order, setOrder] = useState(1);
  const [xValue, setXValue] = useState('2');
  const [showSteps, setShowSteps] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Derivative Calculator',
    description: 'Calculate derivatives with step-by-step solutions. Perfect for calculus students, mathematicians, and anyone learning differentiation.',
    icon: 'fas fa-function',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Derivative Calculator']
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
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percent' },
    { name: 'Integral Calculator', url: '/math/calculators/integral-calculator', icon: 'fas fa-integral' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-derivative', title: 'What is a Derivative?' },
    { id: 'rules', title: 'Derivative Rules' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    switch (field) {
      case 'function':
        setFunctionInput(value);
        break;
      case 'variable':
        setVariable(value);
        break;
      case 'order':
        setOrder(parseInt(value));
        break;
      case 'xValue':
        setXValue(value);
        break;
      case 'showSteps':
        setShowSteps(value);
        break;
      default:
        break;
    }
  };

  // Validate inputs
  const validateInputs = () => {
    if (!functionInput.trim()) {
      throw new Error('Please enter a function.');
    }
    
    if (order < 1 || order > 5) {
      throw new Error('Derivative order must be between 1 and 5.');
    }
    
    if (xValue && isNaN(parseFloat(xValue))) {
      throw new Error('X value must be a valid number.');
    }
    
    return true;
  };

  // Calculate derivative
  const calculateDerivative = () => {
    try {
      // Validate inputs
      validateInputs();
      
      // Calculate derivative
      const derivativeResult = computeDerivative(functionInput, variable, order);
      
      // Calculate numerical result if x value provided
      let numericalResult = null;
      if (xValue && xValue.trim() !== '') {
        try {
          numericalResult = evaluateAtPoint(derivativeResult.derivative, variable, parseFloat(xValue));
        } catch (e) {
          console.error('Error evaluating numerical result:', e);
        }
      }
      
      setResult({
        originalFunction: functionInput,
        derivative: derivativeResult.derivative,
        order: order,
        numericalResult: numericalResult,
        xValue: xValue,
        steps: derivativeResult.steps || [],
        rules: derivativeResult.rules || []
      });
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateDerivative();
  };

  const handleReset = () => {
    setFunctionInput('x^3 + 2*x^2 + x + 1');
    setVariable('x');
    setOrder(1);
    setXValue('2');
    setShowSteps(true);
    setResult(null);
    setError('');
  };

  // Initialize KaTeX when component mounts
  useEffect(() => {
    const renderFormulas = () => {
      if (window.katex) {
        try {
          // Formula examples
          katex.render('\\frac{d}{dx}[f(x)] = f\'(x)', 
            document.getElementById('formula-example'));
          
          // Example 1 formulas
          katex.render('\\frac{d}{dx}[x^3 + 2x^2 + x + 1] = 3x^2 + 4x + 1', 
            document.getElementById('example1-formula'));
          
          // Example 2 formulas
          katex.render('\\frac{d}{dx}[\\sin(x) + \\cos(x)] = \\cos(x) - \\sin(x)', 
            document.getElementById('example2-formula'));
          
          // Example 3 formulas
          katex.render('\\frac{d}{dx}[x\\sin(x)] = \\sin(x) + x\\cos(x)', 
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
        // Render derivative formula
        katex.render(`\\frac{d^{${result.order}}}{d${result.variable}^{${result.order}}}[${result.originalFunction}] = ${result.derivative}`, 
          document.getElementById('derivative-formula'));
        
        // Render numerical result if available
        if (result.numericalResult !== null) {
          katex.render(`f^{${'\''.repeat(result.order)}}(${result.xValue}) = ${result.numericalResult.toFixed(6)}`, 
            document.getElementById('numerical-formula'));
        }
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
        title="Derivative Calculator"
        onCalculate={calculateDerivative}
        calculateButtonText="Calculate Derivative"
        error={error}
        result={null}
      >
                  <form onSubmit={handleSubmit} className="calculator-form">
                    <div className="input-group">
                      <label htmlFor="function-input" className="input-label">
                        Function f(x):
                      </label>
                      <input
                        type="text"
                        id="function-input"
                        name="function-input"
                        className="input-field"
                        value={functionInput}
                        onChange={(e) => handleInputChange('function', e.target.value)}
                        placeholder="e.g., x^3 + 2*x^2 + x + 1"
                      />
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="variable-select" className="input-label">
                          Variable:
                        </label>
                        <select
                          id="variable-select"
                          name="variable-select"
                          className="input-field"
                          value={variable}
                          onChange={(e) => handleInputChange('variable', e.target.value)}
                        >
                          <option value="x">x</option>
                          <option value="y">y</option>
                          <option value="z">z</option>
                          <option value="t">t</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label htmlFor="order-select" className="input-label">
                          Derivative Order:
                        </label>
                        <select
                          id="order-select"
                          name="order-select"
                          className="input-field"
                          value={order}
                          onChange={(e) => handleInputChange('order', e.target.value)}
                        >
                          <option value={1}>1st</option>
                          <option value={2}>2nd</option>
                          <option value={3}>3rd</option>
                          <option value={4}>4th</option>
                          <option value={5}>5th</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="x-value-input" className="input-label">
                        Evaluate at x = (optional):
                      </label>
                      <input
                        type="text"
                        id="x-value-input"
                        name="x-value-input"
                        className="input-field"
                        value={xValue}
                        onChange={(e) => handleInputChange('xValue', e.target.value)}
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div className="input-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          id="show-steps"
                          name="show-steps"
                          checked={showSteps}
                          onChange={(e) => handleInputChange('showSteps', e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Show step-by-step solution
                      </label>
                    </div>

                    <small className="input-help">
                      Enter mathematical expressions using standard notation. Examples: x^2, sin(x), ln(x), e^x
                    </small>
                  </form>

                  {result && (
          <div className="result-section">
                      <h3 className="result-title">Derivative Calculation Result</h3>
                      <div className="result-content">
                        <div className="result-main">
                          <div className="result-item">
                            <strong>Original Function:</strong>
                            <div className="result-formula" id="original-function">
                              f({variable}) = {result.originalFunction}
                            </div>
                          </div>
                          <div className="result-item">
                            <strong>Derivative:</strong>
                            <div className="result-formula" id="derivative-formula"></div>
                          </div>
                          {result.numericalResult !== null && (
                            <div className="result-item">
                              <strong>Numerical Result:</strong>
                              <div className="result-formula" id="numerical-formula"></div>
                            </div>
                          )}
                        </div>
                        
                                                 {showSteps && result.steps.length > 0 && (
                           <div className="result-steps">
                             <h4>Step-by-Step Solution:</h4>
                             <div className="steps-content">
                               {result.steps.map((step, index) => (
                                 <div key={index} className="step" dangerouslySetInnerHTML={{ __html: formatStepForDisplay(step) }} />
                               ))}
                             </div>
                             {result.rules.length > 0 && (
                               <div className="rules-applied">
                                 <strong>Rules Applied:</strong> {result.rules.join(', ')}
                               </div>
                             )}
                           </div>
                         )}
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
                        The derivative is a fundamental concept in calculus that measures how a function changes 
                        as its input changes. It represents the instantaneous rate of change or the slope of 
                        the tangent line at any point on a function's graph.
                      </p>
                      <p>
                        Our Derivative Calculator simplifies the process of finding derivatives by providing 
                        step-by-step solutions. This tool helps students understand calculus concepts and 
                        professionals perform mathematical analysis with ease.
                      </p>
      </ContentSection>

      <ContentSection id="what-is-derivative" title="What is a Derivative?">
                      <p>
                        A derivative measures how a function changes as its input changes. It's the foundation 
                        of differential calculus and has applications in physics, engineering, economics, and more.
                      </p>
        <ul>
          <li><strong>Definition:</strong> The limit of the difference quotient as h approaches zero</li>
          <li><strong>Geometric Meaning:</strong> Slope of the tangent line at a point</li>
          <li><strong>Physical Meaning:</strong> Instantaneous rate of change</li>
          <li><strong>Applications:</strong> Optimization, motion analysis, growth rates</li>
                    </ul>
      </ContentSection>

      <ContentSection id="rules" title="Derivative Rules">
                    <div className="formula-section">
                      <h3>Basic Rules</h3>
                      <div className="math-formula" id="formula-example"></div>
                      <p>Where f(x) is the original function and f'(x) is its derivative.</p>
                    </div>

                    <div className="formula-section">
                      <h3>Common Rules</h3>
                      <ul>
                        <li><strong>Power Rule:</strong> d/dx[x^n] = n·x^(n-1)</li>
                        <li><strong>Constant Rule:</strong> d/dx[c] = 0</li>
                        <li><strong>Sum Rule:</strong> d/dx[f + g] = f' + g'</li>
                        <li><strong>Product Rule:</strong> d/dx[f·g] = f'·g + f·g'</li>
                        <li><strong>Chain Rule:</strong> d/dx[f(g(x))] = f'(g(x))·g'(x)</li>
                      </ul>
                    </div>

                    <div className="formula-section">
                      <h3>Trigonometric Functions</h3>
                      <ul>
                        <li>d/dx[sin(x)] = cos(x)</li>
                        <li>d/dx[cos(x)] = -sin(x)</li>
                        <li>d/dx[tan(x)] = sec²(x)</li>
                        <li>d/dx[ln(x)] = 1/x</li>
                        <li>d/dx[e^x] = e^x</li>
                      </ul>
                    </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Derivative Calculator">
                      <p>Using the calculator is straightforward:</p>
        <ul>
          <li><strong>Enter Function:</strong> Input the mathematical function using standard notation.</li>
          <li><strong>Select Variable:</strong> Choose the variable with respect to which you want to differentiate.</li>
          <li><strong>Choose Order:</strong> Select the derivative order (1st, 2nd, 3rd, etc.).</li>
          <li><strong>Optional Evaluation:</strong> Enter a value to evaluate the derivative at that point.</li>
          <li><strong>Calculate:</strong> Click "Calculate Derivative" to get the result with step-by-step solution.</li>
                    </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
                    <div className="example-section">
                      <h3>Example 1: Polynomial Function</h3>
                      <p>Calculate derivative: <div className="content-formula" id="example1-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Function:</strong> f(x) = x³ + 2x² + x + 1</p>
                        <p><strong>Derivative:</strong> f'(x) = 3x² + 4x + 1</p>
                        <p><strong>Steps:</strong> Apply power rule to each term</p>
                        <p><strong>Evaluation at x = 2:</strong> f'(2) = 3(4) + 4(2) + 1 = 21</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 2: Trigonometric Function</h3>
                      <p>Calculate derivative: <div className="content-formula" id="example2-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Function:</strong> f(x) = sin(x) + cos(x)</p>
                        <p><strong>Derivative:</strong> f'(x) = cos(x) - sin(x)</p>
                        <p><strong>Steps:</strong> Apply trigonometric derivative rules</p>
                        <p><strong>Evaluation at x = π/4:</strong> f'(π/4) = cos(π/4) - sin(π/4) = 0</p>
                      </div>
                    </div>

                    <div className="example-section">
                      <h3>Example 3: Product Rule</h3>
                      <p>Calculate derivative: <div className="content-formula" id="example3-formula"></div></p>
                      <div className="example-solution">
                        <p><strong>Function:</strong> f(x) = x·sin(x)</p>
                        <p><strong>Derivative:</strong> f'(x) = sin(x) + x·cos(x)</p>
                        <p><strong>Steps:</strong> Apply product rule: (fg)' = f'g + fg'</p>
                        <p><strong>Evaluation at x = 1:</strong> f'(1) = sin(1) + cos(1) ≈ 1.381</p>
                      </div>
                    </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding derivatives is crucial in mathematics and science for several reasons:</p>
        <ul>
          <li>Essential for understanding calculus and advanced mathematics</li>
          <li>Foundation for optimization and finding maximum/minimum values</li>
          <li>Used in physics for velocity, acceleration, and motion analysis</li>
          <li>Important in economics for marginal analysis and optimization</li>
          <li>Helps develop critical thinking and problem-solving skills</li>
                    </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
                    <p>Our Derivative Calculator provides:</p>
                    <ul>
          <li><strong>Input Validation:</strong> Ensures valid mathematical expressions</li>
          <li><strong>Accurate Results:</strong> Provides precise derivative calculations</li>
          <li><strong>Step-by-step Solutions:</strong> Detailed breakdown of each calculation step</li>
          <li><strong>Multiple Rules:</strong> Handles power rule, product rule, chain rule, etc.</li>
          <li><strong>Numerical Evaluation:</strong> Calculates derivative values at specific points</li>
          <li><strong>Mathematical Notation:</strong> Proper formula display with LaTeX rendering</li>
                    </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
                    <div className="applications-grid">
                      <div className="application-item">
                        <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                        <p>Teaching calculus concepts and mathematical analysis in schools</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-rocket"></i> Physics</h4>
                        <p>Calculating velocity, acceleration, and motion analysis</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-cogs"></i> Engineering</h4>
                        <p>Optimization problems and system analysis</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-chart-line"></i> Economics</h4>
                        <p>Marginal analysis and optimization in business</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-flask"></i> Research</h4>
                        <p>Scientific research and mathematical modeling</p>
                      </div>
                      <div className="application-item">
                        <h4><i className="fas fa-industry"></i> Industry</h4>
                        <p>Process optimization and quality control</p>
                      </div>
                    </div>
      </ContentSection>

                    <FAQSection 
                      faqs={[
                        {
                          question: "What is a derivative?",
                          answer: "A derivative measures how a function changes as its input changes. It represents the instantaneous rate of change or the slope of the tangent line at any point."
                        },
                        {
                          question: "How do I interpret derivative values?",
                          answer: "Positive derivative means the function is increasing, negative means decreasing, and zero means the function has a critical point (maximum, minimum, or inflection point)."
                        },
                        {
                          question: "What's the difference between first and second derivatives?",
                          answer: "The first derivative gives the rate of change, while the second derivative gives the rate of change of the rate of change (acceleration or concavity)."
                        },
                        {
                          question: "Can I calculate derivatives of any function?",
                          answer: "The calculator handles most common functions including polynomials, trigonometric, exponential, and logarithmic functions using standard derivative rules."
                        },
                        {
                          question: "What if my function is complex?",
                          answer: "For complex functions, the calculator applies multiple rules (product rule, chain rule, etc.) to find the derivative step by step."
                        },
                        {
                          question: "How accurate are the calculations?",
                          answer: "The calculator provides 100% accurate derivative calculations using standard mathematical rules and proper symbolic manipulation."
                        }
                      ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
};

export default DerivativeCalculator;
