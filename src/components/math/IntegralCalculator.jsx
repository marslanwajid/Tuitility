import React, { useState, useEffect } from 'react';
import { IntegralCalculator, formatMathJax, formatStepForDisplay } from '../../assets/js/math/integral-calculator.js';
import {
  ToolHero,
  ToolLayout,
  ToolSidebar,
  ContentSection,
  FAQSection,
  TableOfContents,
  FeedbackForm,
  MathFormula,
  KaTeXRenderer
} from '../tool';
// import '../../assets/css/math/integral-calculator.css';

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

  // KaTeX rendering for examples
  useEffect(() => {
    if (window.katex) {
      const elements = document.querySelectorAll('.math-formula, .content-formula');
      elements.forEach(element => {
        if (element.textContent && !element.querySelector('.katex')) {
          try {
            window.katex.render(element.textContent, element);
          } catch (e) {
            console.error('KaTeX rendering error:', e);
          }
        }
      });
    }
  }, []);

  // KaTeX rendering for results
  useEffect(() => {
    if (window.katex && result) {
      const elements = document.querySelectorAll('.result-formula');
      elements.forEach(element => {
        if (element.textContent && !element.querySelector('.katex')) {
          try {
            window.katex.render(element.textContent, element);
          } catch (e) {
            console.error('KaTeX rendering error:', e);
          }
        }
      });
    }
  }, [result]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateIntegral();
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

  const relatedTools = [
    { name: 'Derivative Calculator', path: '/math/calculators/derivative-calculator', icon: 'fas fa-calculator' },
    { name: 'Fraction Calculator', path: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'LCD Calculator', path: '/math/calculators/lcd-calculator', icon: 'fas fa-calculator' },
    { name: 'Comparing Fractions', path: '/math/calculators/comparing-fractions-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Comparing Decimals', path: '/math/calculators/comparing-decimals-calculator', icon: 'fas fa-sort-numeric-up' },
    { name: 'Fraction to Percent', path: '/math/calculators/fraction-to-percent-calculator', icon: 'fas fa-percentage' },
    { name: 'Improper to Mixed', path: '/math/calculators/improper-fraction-to-mixed-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percent to Fraction', path: '/math/calculators/percent-to-fraction-calculator', icon: 'fas fa-percentage' },
    { name: 'SSE Calculator', path: '/math/calculators/sse-calculator', icon: 'fas fa-chart-line' }
  ];

  const categories = [
    {
      name: 'Calculus',
      tools: [
        { name: 'Derivative Calculator', path: '/math/calculators/derivative-calculator' },
        { name: 'Integral Calculator', path: '/math/calculators/integral-calculator' }
      ]
    },
    {
      name: 'Fractions',
      tools: [
        { name: 'Fraction Calculator', path: '/math/calculators/fraction-calculator' },
        { name: 'LCD Calculator', path: '/math/calculators/lcd-calculator' },
        { name: 'Comparing Fractions', path: '/math/calculators/comparing-fractions-calculator' },
        { name: 'Fraction to Percent', path: '/math/calculators/fraction-to-percent-calculator' },
        { name: 'Improper to Mixed', path: '/math/calculators/improper-fraction-to-mixed-calculator' },
        { name: 'Percent to Fraction', path: '/math/calculators/percent-to-fraction-calculator' }
      ]
    },
    {
      name: 'Decimals',
      tools: [
        { name: 'Comparing Decimals', path: '/math/calculators/comparing-decimals-calculator' }
      ]
    },
    {
      name: 'Statistics',
      tools: [
        { name: 'SSE Calculator', path: '/math/calculators/sse-calculator' }
      ]
    }
  ];

  // Content sections for the Integral Calculator
  const contentSections = [
    {
      id: "what-is-integration",
      title: "What is Integration?",
      intro: [
        "Integration is the reverse process of differentiation. It finds the antiderivative of a function, which represents the area under a curve or the accumulation of a quantity over time."
      ],
      list: [
        "Antiderivative: A function whose derivative is the original function",
        "Definite Integral: Calculates the area under a curve between two points",
        "Indefinite Integral: Finds the general antiderivative (includes +C)",
        "Fundamental Theorem of Calculus: Links differentiation and integration"
      ]
    },
    {
      id: "types-of-integrals",
      title: "Types of Integrals",
      intro: [
        "There are two main types of integrals: definite and indefinite."
      ],
      list: [
        "Indefinite Integrals: Represent the general antiderivative of a function, include a constant of integration (+C), example: ∫x² dx = x³/3 + C, used to find the most general solution",
        "Definite Integrals: Calculate the area under a curve between two points, result in a specific numerical value, example: ∫₀¹ x² dx = 1/3, used in applications like area, volume, and work calculations"
      ]
    },
    {
      id: "integration-rules",
      title: "Integration Rules",
      intro: [
        "Several fundamental rules make integration easier and more systematic."
      ],
      list: [
        "Power Rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (for n ≠ -1)",
        "Constant Rule: ∫k dx = kx + C",
        "Constant Multiple: ∫k·f(x) dx = k·∫f(x) dx",
        "Sum Rule: ∫[f(x) + g(x)] dx = ∫f(x) dx + ∫g(x) dx",
        "Trigonometric: ∫sin(x) dx = -cos(x) + C, ∫cos(x) dx = sin(x) + C",
        "Exponential: ∫eˣ dx = eˣ + C",
        "Logarithmic: ∫1/x dx = ln|x| + C",
        "Inverse Trig: ∫1/(1+x²) dx = arctan(x) + C"
      ]
    },
    {
      id: "common-integrals",
      title: "Common Integrals",
      intro: [
        "Here are some commonly used integrals that appear frequently in calculus."
      ],
      content: (
        <div>
          <div className="formula-section">
            <h3>Polynomial Functions</h3>
            <div className="math-formula">∫x dx = x²/2 + C</div>
            <div className="math-formula">∫x² dx = x³/3 + C</div>
            <div className="math-formula">∫x³ dx = x⁴/4 + C</div>
            <p>General: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ -1)</p>
          </div>

          <div className="formula-section">
            <h3>Trigonometric Functions</h3>
            <div className="math-formula">∫sin(x) dx = -cos(x) + C</div>
            <div className="math-formula">∫cos(x) dx = sin(x) + C</div>
            <div className="math-formula">∫tan(x) dx = -ln|cos(x)| + C</div>
            <div className="math-formula">∫sec(x) dx = ln|sec(x) + tan(x)| + C</div>
          </div>

          <div className="formula-section">
            <h3>Exponential and Logarithmic</h3>
            <div className="math-formula">∫eˣ dx = eˣ + C</div>
            <div className="math-formula">∫1/x dx = ln|x| + C</div>
            <div className="math-formula">∫ln(x) dx = x·ln(x) - x + C</div>
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use",
      intro: [
        "Follow these steps to calculate integrals using our calculator."
      ],
      steps: [
        "Enter the function you want to integrate in the input field",
        "Select the variable of integration (x, y, or t)",
        "Choose between indefinite or definite integral",
        "For definite integrals, enter the lower and upper limits",
        "Check \"Show step-by-step solution\" to see detailed steps",
        "Click \"Calculate Integral\" to get your result"
      ]
    },
    {
      id: "examples",
      title: "Examples",
      intro: [
        "Here are some examples to help you understand how to use the calculator."
      ],
      examples: [
        {
          title: "Example 1: Indefinite Integral",
          description: "Function: x²",
          solution: [
            { label: "Integral", content: "∫x² dx = x³/3 + C" },
            { label: "Explanation", content: "Using the power rule, we increase the exponent by 1 and divide by the new exponent." }
          ]
        },
        {
          title: "Example 2: Definite Integral",
          description: "Function: x², Limits: 0 to 1",
          solution: [
            { label: "Integral", content: "∫₀¹ x² dx = [x³/3]₀¹ = 1/3 - 0 = 1/3" },
            { label: "Explanation", content: "We find the antiderivative, then evaluate at the upper and lower limits." }
          ]
        },
        {
          title: "Example 3: Trigonometric Function",
          description: "Function: sin(x)",
          solution: [
            { label: "Integral", content: "∫sin(x) dx = -cos(x) + C" },
            { label: "Explanation", content: "The integral of sine is negative cosine." }
          ]
        }
      ]
    },
    {
      id: "applications",
      title: "Applications",
      intro: [
        "Integration has numerous applications across various fields of science and engineering."
      ],
      content: (
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
      )
    }
  ];

  return (
    <div className="tool-page">
      <ToolHero
        title="Integral Calculator"
        description="Calculate definite and indefinite integrals with step-by-step solutions. Supports polynomials, trigonometric functions, exponentials, and more."
       
        
      />

      <div className="container">
        <div className="tool-main">
          <ToolLayout
            sidebarProps={{
              relatedTools,
              categories
            }}
          >
            {/* Calculator Section */}
            <section className="calculator-section">
              <h2 className="section-title">
                <i className="fas fa-calculator"></i>
                Integral Calculator
              </h2>

              <form className="calculator-form" onSubmit={handleSubmit}>
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

                <div className="calculator-actions">
                  <button type="submit" className="btn-calculate">
                    <i className="fas fa-calculator"></i>
                    Calculate Integral
                  </button>
                  <button type="button" className="btn-reset" onClick={handleReset}>
                    <i className="fas fa-redo"></i>
                    Reset
                  </button>
                </div>
              </form>

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
            </section>

            {/* Results Section */}
            {error && (
              <section className={`result-section error show`}>
                <div className="result-content">
                  <i className="fas fa-exclamation-triangle"></i>
                  {error}
                </div>
              </section>
            )}

            {result && (
              <section className="result-section show">
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
              </section>
            )}

            {/* Table of Contents & Feedback */}
            <div className="toc-feedback-section">
              <div className="toc-feedback-container">
                <TableOfContents
                  title="Table of Contents"
                  icon="fas fa-list"
                  links={[
                    { text: 'What is Integration?', href: '#what-is-integration' },
                    { text: 'Types of Integrals', href: '#types-of-integrals' },
                    { text: 'Integration Rules', href: '#integration-rules' },
                    { text: 'Common Integrals', href: '#common-integrals' },
                    { text: 'How to Use', href: '#how-to-use' },
                    { text: 'Examples', href: '#examples' },
                    { text: 'Applications', href: '#applications' },
                    { text: 'FAQ', href: '#faq' }
                  ]}
                />
                <FeedbackForm
                  title="Feedback"
                  icon="fas fa-comment"
                />
              </div>
            </div>

            {/* Content Sections */}
            <ContentSection sections={contentSections} />

            <FAQSection
              title="Frequently Asked Questions"
              id="faq"
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
            />
          </ToolLayout>
        </div>
      </div>
    </div>
  );
};

export default IntegralCalculatorComponent;
