import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import { IntegralCalculator, formatMathJax, formatStepForDisplay } from '../../assets/js/math/integral-calculator.js';
import '../../assets/css/math/integral-calculator.css';

const IntegralCalculatorComponent = () => {
  const [functionInput, setFunctionInput] = useState('');
  const [variable, setVariable] = useState('x');
  const [integralType, setIntegralType] = useState('indefinite');
  const [lowerLimit, setLowerLimit] = useState('');
  const [upperLimit, setUpperLimit] = useState('');
  const [showSteps, setShowSteps] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculator = new IntegralCalculator();

  // Tool data
  const toolData = {
    name: 'Integral Calculator',
    description: 'Calculate definite and indefinite integrals with step-by-step solutions. Supports polynomials, trigonometric functions, exponentials, and more.',
    icon: 'fas fa-calculator',
    category: 'Math',
    breadcrumb: ['Math', 'Calculators', 'Integral Calculator']
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
    { name: 'Derivative Calculator', url: '/math/calculators/derivative-calculator', icon: 'fas fa-calculator' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'LCD Calculator', url: '/math/calculators/lcd-calculator', icon: 'fas fa-calculator' },
    { name: 'Comparing Fractions', url: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Comparing Decimals', url: '/math/calculators/comparing-decimals-calculator', icon: 'fas fa-sort-numeric-up' },
    { name: 'Fraction to Percent', url: '/math/calculators/fraction-to-percent-calculator', icon: 'fas fa-percentage' },
    { name: 'Improper to Mixed', url: '/math/calculators/improper-fraction-to-mixed-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percent to Fraction', url: '/math/calculators/percent-to-fraction-calculator', icon: 'fas fa-percentage' },
    { name: 'SSE Calculator', url: '/math/calculators/sse-calculator', icon: 'fas fa-chart-line' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'what-is-integration', title: 'What is Integration?' },
    { id: 'types-of-integrals', title: 'Types of Integrals' },
    { id: 'integration-rules', title: 'Integration Rules' },
    { id: 'common-integrals', title: 'Common Integrals' },
    { id: 'how-to-use', title: 'How to Use' },
    { id: 'examples', title: 'Examples' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // KaTeX rendering for examples
  useEffect(() => {
    const renderFormulas = () => {
    if (window.katex) {
        try {
          // Common integrals formulas
          katex.render('\\int x \\, dx = \\frac{x^2}{2} + C', 
            document.getElementById('common-integral-1'));
          katex.render('\\int x^2 \\, dx = \\frac{x^3}{3} + C', 
            document.getElementById('common-integral-2'));
          katex.render('\\int x^3 \\, dx = \\frac{x^4}{4} + C', 
            document.getElementById('common-integral-3'));
          katex.render('\\int \\sin(x) \\, dx = -\\cos(x) + C', 
            document.getElementById('common-integral-4'));
          katex.render('\\int \\cos(x) \\, dx = \\sin(x) + C', 
            document.getElementById('common-integral-5'));
          katex.render('\\int e^x \\, dx = e^x + C', 
            document.getElementById('common-integral-6'));
          katex.render('\\int \\frac{1}{x} \\, dx = \\ln|x| + C', 
            document.getElementById('common-integral-7'));
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

  // KaTeX rendering for results
  useEffect(() => {
    if (window.katex && result) {
      try {
        // Render original function
        katex.render(formatMathJax(functionInput), 
          document.getElementById('original-function'));
        
        // Render antiderivative
        katex.render(formatMathJax(result.antiderivative), 
          document.getElementById('integral-result'));
      } catch (error) {
        console.log('KaTeX result rendering error:', error);
      }
    }
  }, [result, functionInput]);

  const handleInputChange = (e) => {
    setFunctionInput(e.target.value);
    setError('');
  };

  const validateInputs = () => {
    if (!functionInput.trim()) {
      setError('Please enter a function to integrate.');
      return false;
    }

    if (integralType === 'definite') {
      if (!lowerLimit || !upperLimit) {
        setError('Please enter both lower and upper limits for definite integral.');
        return false;
      }
      const lower = parseFloat(lowerLimit);
      const upper = parseFloat(upperLimit);
      if (isNaN(lower) || isNaN(upper)) {
        setError('Please enter valid numeric limits.');
        return false;
      }
    }

    return true;
  };

  const calculateIntegral = () => {
    if (!validateInputs()) return;

    try {
      const lower = integralType === 'definite' ? parseFloat(lowerLimit) : null;
      const upper = integralType === 'definite' ? parseFloat(upperLimit) : null;

      const result = calculator.calculate(functionInput, variable, integralType, lower, upper);
      setResult(result);
      setError('');
    } catch (err) {
      setError('Error calculating integral. Please check your input.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFunctionInput('');
    setVariable('x');
    setIntegralType('indefinite');
    setLowerLimit('');
    setUpperLimit('');
    setShowSteps(true);
    setResult(null);
    setError('');
  };

  const setFunction = (func) => {
    setFunctionInput(func);
  };

  const toggleLimits = () => {
    if (integralType === 'definite') {
      setLowerLimit('');
      setUpperLimit('');
    }
  };

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Integral Calculator"
        onCalculate={calculateIntegral}
        calculateButtonText="Calculate Integral"
        error={error}
        result={null}
      >
        <div className="calculator-form">
                <div className="input-group">
                  <label htmlFor="function-input" className="input-label">
                    Function to Integrate:
                  </label>
                  <input
                    type="text"
                    id="function-input"
                    className="input-field"
                    value={functionInput}
                    onChange={handleInputChange}
                    placeholder="e.g., x^2, sin(x), e^x, 1/x"
                  />
                  <small className="input-help">
                    Examples: x, x^2, sin(x), cos(x), e^x, 1/x, x^2 + 3x + 2
                  </small>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="variable-select" className="input-label">
                      Variable:
                    </label>
                    <select
                      id="variable-select"
                      className="input-field"
                      value={variable}
                      onChange={(e) => setVariable(e.target.value)}
                    >
                      <option value="x">x</option>
                      <option value="y">y</option>
                      <option value="t">t</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="integral-type" className="input-label">
                      Integral Type:
                    </label>
                    <select
                      id="integral-type"
                      className="input-field"
                      value={integralType}
                      onChange={(e) => {
                        setIntegralType(e.target.value);
                        toggleLimits();
                      }}
                    >
                      <option value="indefinite">Indefinite Integral</option>
                      <option value="definite">Definite Integral</option>
                    </select>
                  </div>
                </div>

                {integralType === 'definite' && (
                  <div className="input-row" id="limits-group">
                    <div className="input-group">
                      <label htmlFor="lower-limit" className="input-label">
                        Lower Limit:
                      </label>
                      <input
                        type="number"
                        id="lower-limit"
                        className="input-field"
                        value={lowerLimit}
                        onChange={(e) => setLowerLimit(e.target.value)}
                        placeholder="e.g., 0"
                        step="any"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="upper-limit" className="input-label">
                        Upper Limit:
                      </label>
                      <input
                        type="number"
                        id="upper-limit"
                        className="input-field"
                        value={upperLimit}
                        onChange={(e) => setUpperLimit(e.target.value)}
                        placeholder="e.g., 1"
                        step="any"
                      />
                    </div>
                  </div>
                )}

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      id="show-steps"
                      checked={showSteps}
                      onChange={(e) => setShowSteps(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Show step-by-step solution
                  </label>
                </div>

          {/* Reset Button Only */}
                <div className="calculator-actions">
                  <button type="button" className="btn-reset" onClick={handleReset}>
                    <i className="fas fa-redo"></i>
                    Reset
                  </button>
                </div>
        </div>

              {/* Quick Function Buttons */}
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button onClick={() => setFunction('x')} className="btn-reset" style={{ fontSize: '0.875rem' }}>x</button>
                <button onClick={() => setFunction('x^2')} className="btn-reset" style={{ fontSize: '0.875rem' }}>x²</button>
                <button onClick={() => setFunction('x^3')} className="btn-reset" style={{ fontSize: '0.875rem' }}>x³</button>
                <button onClick={() => setFunction('sin(x)')} className="btn-reset" style={{ fontSize: '0.875rem' }}>sin(x)</button>
                <button onClick={() => setFunction('cos(x)')} className="btn-reset" style={{ fontSize: '0.875rem' }}>cos(x)</button>
                <button onClick={() => setFunction('e^x')} className="btn-reset" style={{ fontSize: '0.875rem' }}>e^x</button>
                <button onClick={() => setFunction('1/x')} className="btn-reset" style={{ fontSize: '0.875rem' }}>1/x</button>
                <button onClick={() => setFunction('x^2 + 3x + 2')} className="btn-reset" style={{ fontSize: '0.875rem' }}>x²+3x+2</button>
              </div>

        {/* Results */}
            {result && (
          <div className="result-section integral-calculator-result">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Integration Result
                </h3>
                <div className="result-content">
                  <div className="result-main">
                    <div className="result-item">
                      <strong>Original Function:</strong>
                      <div className="result-formula" id="original-function">
                        {formatMathJax(functionInput)}
                      </div>
                    </div>

                    <div className="result-item">
                      <strong>Integral Type:</strong>
                      <span>{integralType === 'definite' ? 'Definite Integral' : 'Indefinite Integral'}</span>
                    </div>

                    <div className="result-item">
                      <strong>Antiderivative:</strong>
                      <div className="result-formula" id="integral-result">
                        {formatMathJax(result.antiderivative)}
                      </div>
                    </div>

                    {result.numerical !== null && (
                      <div className="result-item">
                        <strong>Numerical Answer:</strong>
                        <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2em' }}>
                          {typeof result.numerical === 'number' ? result.numerical.toFixed(8) : result.numerical}
                        </span>
                      </div>
                    )}

                    {result.sampleValue !== null && integralType === 'indefinite' && (
                      <div className="result-item">
                        <strong>Sample Value:</strong>
                        <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.1em' }}>
                          F(1) = {result.sampleValue.toFixed(6)}
                        </span>
                      </div>
                    )}

                    {integralType === 'indefinite' && (
                      <div className="result-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontStyle: 'italic' }}>
                        <i className="fas fa-info-circle"></i>
                        <span>Note: C represents the constant of integration</span>
                      </div>
                    )}
                  </div>

                  {/* Steps Section */}
                  {showSteps && result.steps && result.steps.length > 0 && (
                    <div className="result-steps">
                      <h4>
                        <i className="fas fa-list-ol"></i>
                        Step-by-Step Solution
                      </h4>
                      <div className="steps-content">
                        {result.steps.map((step, index) => (
                          <div key={index} className="step" dangerouslySetInnerHTML={{ __html: formatStepForDisplay(step) }} />
                        ))}
                      </div>

                      {result.rules && result.rules.length > 0 && (
                        <div className="rules-applied">
                          <strong>Integration Rules Applied:</strong>
                          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            {result.rules.map((rule, index) => (
                              <li key={index} dangerouslySetInnerHTML={{ __html: formatStepForDisplay(rule) }} />
                            ))}
                          </ul>
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
      <ContentSection id="what-is-integration" title="What is Integration?">
        <p>
          Integration is the reverse process of differentiation. It finds the antiderivative of a function, 
          which represents the area under a curve or the accumulation of a quantity over time.
        </p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Antiderivative:</strong> A function whose derivative is the original function</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Definite Integral:</strong> Calculates the area under a curve between two points</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Indefinite Integral:</strong> Finds the general antiderivative (includes +C)</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Fundamental Theorem of Calculus:</strong> Links differentiation and integration</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="types-of-integrals" title="Types of Integrals">
        <p>
          There are two main types of integrals: definite and indefinite.
        </p>
        <ul>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Indefinite Integrals:</strong> Represent the general antiderivative of a function, include a constant of integration (+C), example: ∫x² dx = x³/3 + C, used to find the most general solution</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Definite Integrals:</strong> Calculate the area under a curve between two points, result in a specific numerical value, example: ∫₀¹ x² dx = 1/3, used in applications like area, volume, and work calculations</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="integration-rules" title="Integration Rules">
        <p>
          Several fundamental rules make integration easier and more systematic.
        </p>
        <ul>
          <li><strong>Power Rule:</strong> ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (for n ≠ -1)</li>
          <li><strong>Constant Rule:</strong> ∫k dx = kx + C</li>
          <li><strong>Constant Multiple:</strong> ∫k·f(x) dx = k·∫f(x) dx</li>
          <li><strong>Sum Rule:</strong> ∫[f(x) + g(x)] dx = ∫f(x) dx + ∫g(x) dx</li>
          <li><strong>Trigonometric:</strong> ∫sin(x) dx = -cos(x) + C, ∫cos(x) dx = sin(x) + C</li>
          <li><strong>Exponential:</strong> ∫eˣ dx = eˣ + C</li>
          <li><strong>Logarithmic:</strong> ∫1/x dx = ln|x| + C</li>
          <li><strong>Inverse Trig:</strong> ∫1/(1+x²) dx = arctan(x) + C</li>
        </ul>
      </ContentSection>

      <ContentSection id="common-integrals" title="Common Integrals">
        <p>
          Here are some commonly used integrals that appear frequently in calculus.
        </p>
        
        <div className="formula-section">
          <h3>Polynomial Functions</h3>
          <div className="math-formula" id="common-integral-1">∫x dx = x²/2 + C</div>
          <div className="math-formula" id="common-integral-2">∫x² dx = x³/3 + C</div>
          <div className="math-formula" id="common-integral-3">∫x³ dx = x⁴/4 + C</div>
          <p>General: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)</p>
        </div>

        <div className="formula-section">
          <h3>Trigonometric Functions</h3>
          <div className="math-formula" id="common-integral-4">∫sin(x) dx = -cos(x) + C</div>
          <div className="math-formula" id="common-integral-5">∫cos(x) dx = sin(x) + C</div>
          <div className="math-formula">∫tan(x) dx = -ln|cos(x)| + C</div>
          <div className="math-formula">∫sec(x) dx = ln|sec(x) + tan(x)| + C</div>
        </div>

        <div className="formula-section">
          <h3>Exponential and Logarithmic</h3>
          <div className="math-formula" id="common-integral-6">∫eˣ dx = eˣ + C</div>
          <div className="math-formula" id="common-integral-7">∫1/x dx = ln|x| + C</div>
          <div className="math-formula">∫ln(x) dx = x·ln(x) - x + C</div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use">
        <p>Follow these steps to calculate integrals using our calculator.</p>
        <ul className="usage-steps">
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Enter the function:</strong> Input the function you want to integrate in the input field</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Select variable:</strong> Choose the variable of integration (x, y, or t)</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Choose type:</strong> Select between indefinite or definite integral</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Enter limits:</strong> For definite integrals, enter the lower and upper limits</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Show steps:</strong> Check "Show step-by-step solution" to see detailed steps</span>
          </li>
          <li>
            <i className="fas fa-check"></i>
            <span><strong>Calculate:</strong> Click "Calculate Integral" to get your result</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <p>Here are some examples to help you understand how to use the calculator.</p>
        
        <div className="example-section">
          <h3>Example 1: Indefinite Integral</h3>
          <p><strong>Function:</strong> x²</p>
          <div className="example-solution">
            <p><strong>Integral:</strong> ∫x² dx = x³/3 + C</p>
            <p><strong>Explanation:</strong> Using the power rule, we increase the exponent by 1 and divide by the new exponent.</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Definite Integral</h3>
          <p><strong>Function:</strong> x², <strong>Limits:</strong> 0 to 1</p>
          <div className="example-solution">
            <p><strong>Integral:</strong> ∫₀¹ x² dx = [x³/3]₀¹ = 1/3 - 0 = 1/3</p>
            <p><strong>Explanation:</strong> We find the antiderivative, then evaluate at the upper and lower limits.</p>
              </div>
            </div>

        <div className="example-section">
          <h3>Example 3: Trigonometric Function</h3>
          <p><strong>Function:</strong> sin(x)</p>
          <div className="example-solution">
            <p><strong>Integral:</strong> ∫sin(x) dx = -cos(x) + C</p>
            <p><strong>Explanation:</strong> The integral of sine is negative cosine.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <p>
          Integration has numerous applications across various fields of science and engineering.
        </p>
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-chart-area"></i>Area Under Curves</h4>
            <p>Calculate the area between a function and the x-axis, or between two curves.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-cube"></i>Volume Calculations</h4>
            <p>Find volumes of solids of revolution and complex 3D shapes.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-tachometer-alt"></i>Physics Applications</h4>
            <p>Calculate work, displacement, velocity, and acceleration from force and motion data.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i>Economics</h4>
            <p>Determine consumer surplus, producer surplus, and total revenue from demand/supply curves.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i>Chemistry</h4>
            <p>Calculate reaction rates, concentration changes, and equilibrium constants.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-dna"></i>Biology</h4>
            <p>Model population growth, enzyme kinetics, and biological processes over time.</p>
          </div>
        </div>
      </ContentSection>

            <FAQSection
              faqs={[
                {
                  question: "What is the difference between definite and indefinite integrals?",
                  answer: "An indefinite integral finds the general antiderivative (includes +C), while a definite integral calculates the area under a curve between two specific points, resulting in a numerical value."
                },
                {
                  question: "Why do indefinite integrals include +C?",
                  answer: "The +C represents the constant of integration. Since the derivative of any constant is zero, there are infinitely many antiderivatives that differ only by a constant."
                },
                {
                  question: "Can I integrate any function?",
                  answer: "Not all functions have elementary antiderivatives. Some functions like e^(x²) and sin(x)/x require special techniques or numerical methods."
                },
                {
                  question: "What are the most important integration rules?",
                  answer: "The power rule, constant multiple rule, sum rule, and the rules for trigonometric, exponential, and logarithmic functions are the most fundamental."
                },
                {
                  question: "How do I know if my answer is correct?",
                  answer: "You can verify by taking the derivative of your result. If you get back the original function, your integration is correct."
                },
                {
                  question: "What is the Fundamental Theorem of Calculus?",
                  answer: "It states that differentiation and integration are inverse operations. The definite integral of a function can be found by evaluating its antiderivative at the limits."
                }
              ]}
        title="Frequently Asked Questions"
            />
    </ToolPageLayout>
  );
};

export default IntegralCalculatorComponent;
