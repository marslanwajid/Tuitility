import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import 'katex/dist/katex.min.css';
import '../../assets/css/science/dbm-milliwatts-calculator.css';

const DBmMilliwattsCalculator = () => {
  const [formData, setFormData] = useState({
    conversionType: 'dbm-to-milliwatts',
    inputValue: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator
  useEffect(() => {
    const initializeCalculator = async () => {
      try {
        const { DBmMilliwattsCalculatorJS } = await import('../../assets/js/science/dbm-milliwatts-calculator.js');
        const calc = new DBmMilliwattsCalculatorJS();
        setCalculator(calc);
      } catch (error) {
        console.error('Error initializing DBm Milliwatts calculator:', error);
      }
    };

    initializeCalculator();
  }, []);

  // Initialize KaTeX for mathematical formulas
  useEffect(() => {
    const renderKaTeX = async () => {
      try {
        const katex = await import('katex');
        const mathElements = document.querySelectorAll('.math-formula');
        mathElements.forEach(element => {
          if (element && !element.hasAttribute('data-katex-rendered')) {
            try {
              katex.render(element.textContent, element, {
                throwOnError: false,
                displayMode: false
              });
              element.setAttribute('data-katex-rendered', 'true');
            } catch (error) {
              console.warn('KaTeX rendering error:', error);
            }
          }
        });
      } catch (error) {
        console.warn('KaTeX import error:', error);
      }
    };

    // Small delay to ensure DOM is updated
    setTimeout(() => {
      renderKaTeX();
    }, 100);
  }, [result]);

  // Tool data
  const toolData = {
    name: 'DBm to Milliwatts Calculator',
    description: 'Convert between dBm and milliwatts for precise power measurements in telecommunications and electronics.',
    icon: 'fas fa-bolt',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'DBm to Milliwatts Calculator']
  };

  // Categories for sidebar
  const categories = [
    { name: 'Science', icon: 'fas fa-flask', link: '/science' },
    { name: 'Math', icon: 'fas fa-calculator', link: '/math' },
    { name: 'Finance', icon: 'fas fa-dollar-sign', link: '/finance' }
  ];

  // Related tools
  const relatedTools = [
    { name: 'DBm Watts Calculator', icon: 'fas fa-bolt', link: '/science/calculators/dbm-watts-calculator' },
    { name: 'Work Power Calculator', icon: 'fas fa-cogs', link: '/science/calculators/work-power-calculator' },
    { name: 'Gravity Calculator', icon: 'fas fa-globe', link: '/science/calculators/gravity-calculator' },
    { name: 'Wave Speed Calculator', icon: 'fas fa-wave-square', link: '/science/calculators/wave-speed-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-dbm', title: 'What is dBm?' },
    { id: 'what-are-milliwatts', title: 'What are Milliwatts?' },
    { id: 'formulas', title: 'Mathematical Formulas' },
    { id: 'applications', title: 'Applications' },
    { id: 'examples', title: 'Examples' },
    { id: 'faq', title: 'FAQ' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!calculator) return;

    try {
      const calculationResult = calculator.performCalculation(formData);
      setResult(calculationResult);
      setError('');
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      conversionType: 'dbm-to-milliwatts',
      inputValue: ''
    });
    setResult(null);
    setError('');
  };

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection
        title="DBm to Milliwatts Calculator"
        onCalculate={handleSubmit}
      >
        <form className="dbm-milliwatts-calculator-form" onSubmit={handleSubmit}>
          <div className="dbm-milliwatts-input-group">
            <label htmlFor="conversionType" className="dbm-milliwatts-label">
              Conversion Type
            </label>
            <select
              id="conversionType"
              name="conversionType"
              value={formData.conversionType}
              onChange={handleInputChange}
              className="dbm-milliwatts-select-field"
            >
              <option value="dbm-to-milliwatts">dBm to Milliwatts</option>
              <option value="milliwatts-to-dbm">Milliwatts to dBm</option>
            </select>
          </div>

          <div className="dbm-milliwatts-input-group">
            <label htmlFor="inputValue" className="dbm-milliwatts-label">
              {formData.conversionType === 'dbm-to-milliwatts' ? 'Power (dBm)' : 'Power (mW)'}
            </label>
            <input
              type="number"
              id="inputValue"
              name="inputValue"
              value={formData.inputValue}
              onChange={handleInputChange}
              className="dbm-milliwatts-input-field"
              placeholder={formData.conversionType === 'dbm-to-milliwatts' ? 'Enter dBm value' : 'Enter milliwatts value'}
              step="any"
              required
            />
          </div>

          <div className="dbm-milliwatts-actions">
            <button type="button" onClick={handleReset} className="dbm-milliwatts-btn-reset">
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="dbm-milliwatts-error">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="dbm-milliwatts-result">
            <div className="dbm-milliwatts-result-header">
              <h4>Result</h4>
              <p className="dbm-milliwatts-result-value">{result.formattedResult}</p>
            </div>
            
            {result.calculationSteps && (
              <div className="dbm-milliwatts-calculation-steps">
                <h4>Calculation Steps</h4>
                <div className="dbm-milliwatts-steps-content">
                  {result.calculationSteps.map((step, index) => (
                    <div key={index} className="dbm-milliwatts-step">
                      <h5>{step.title}</h5>
                      {step.content && (
                        <div 
                          className="dbm-milliwatts-step-content"
                          dangerouslySetInnerHTML={{ __html: step.content }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CalculatorSection>

      <ContentSection id="introduction" title="Introduction">
        <p>
          The DBm to Milliwatts Calculator is an essential tool for converting between dBm (decibels relative to milliwatts) 
          and milliwatts in telecommunications, electronics, and RF engineering. This calculator provides precise conversions 
          for power measurements in signal processing and communication systems.
        </p>
        <p>
          Whether you're working with RF amplifiers, antenna systems, or signal analysis, this calculator provides 
          accurate conversions with detailed step-by-step calculations to help you understand the conversion process.
        </p>
      </ContentSection>

      <ContentSection id="what-is-dbm" title="What is dBm?">
        <p>
          dBm (decibels relative to milliwatts) is a unit of power measurement commonly used in telecommunications 
          and electronics. It expresses power levels relative to 1 milliwatt (mW) on a logarithmic scale.
        </p>
        <p>
          Key characteristics of dBm:
        </p>
        <ul>
          <li>dBm is a logarithmic unit, making it easier to work with large power ranges</li>
          <li>0 dBm = 1 mW (1 milliwatt)</li>
          <li>Positive dBm values indicate power greater than 1 mW</li>
          <li>Negative dBm values indicate power less than 1 mW</li>
          <li>Commonly used in RF, microwave, and optical communications</li>
          <li>Allows easy addition and subtraction of power gains and losses</li>
        </ul>
      </ContentSection>

      <ContentSection id="what-are-milliwatts" title="What are Milliwatts?">
        <p>
          Milliwatts (mW) are a unit of power equal to one-thousandth of a watt. They are commonly used in electronics 
          and telecommunications for measuring small power levels, especially in RF and microwave applications.
        </p>
        <p>
          Key characteristics of milliwatts:
        </p>
        <ul>
          <li>1 mW = 0.001 W (one-thousandth of a watt)</li>
          <li>Commonly used for measuring RF power levels</li>
          <li>Standard reference point for dBm calculations</li>
          <li>Used in antenna power measurements</li>
          <li>Important in wireless communication systems</li>
          <li>Used in optical power measurements</li>
        </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Mathematical Formulas">
        <h4>dBm to Milliwatts Conversion</h4>
        <div className="math-formula">
          {`P(mW) = 10^{(\\frac{P(dBm)}{10})}`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>P(mW)</strong> = power in milliwatts</li>
          <li><strong>P(dBm)</strong> = power in dBm</li>
        </ul>
        
        <h4>Milliwatts to dBm Conversion</h4>
        <div className="math-formula">
          {`P(dBm) = 10 \\times \\log_{10}(P(mW))`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>P(dBm)</strong> = power in dBm</li>
          <li><strong>P(mW)</strong> = power in milliwatts</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-broadcast-tower"></i> Telecommunications</h4>
            <p>RF power measurements, antenna gain calculations, and signal strength analysis in cellular networks</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-satellite"></i> Satellite Communications</h4>
            <p>Transponder power calculations, link budget analysis, and ground station power measurements</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-wifi"></i> Wireless Networks</h4>
            <p>WiFi signal strength measurements, access point power settings, and network optimization</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-microchip"></i> Electronics Testing</h4>
            <p>RF amplifier testing, oscillator power measurements, and circuit analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-radar"></i> Radar Systems</h4>
            <p>Transmit power calculations, receiver sensitivity analysis, and radar equation applications</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-lightbulb"></i> Optical Communications</h4>
            <p>Laser power measurements, fiber optic link budgets, and optical amplifier analysis</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <h4>Example 1: dBm to Milliwatts</h4>
        <p>Convert 20 dBm to milliwatts:</p>
        <div className="math-formula">
          {`P(mW) = 10^{(\\frac{20}{10})} = 10^2 = 100 \\text{ mW}`}
        </div>
        
        <h4>Example 2: Milliwatts to dBm</h4>
        <p>Convert 50 mW to dBm:</p>
        <div className="math-formula">
          {`P(dBm) = 10 \\times \\log_{10}(50) = 10 \\times 1.699 = 16.99 \\text{ dBm}`}
        </div>
        
        <h4>Example 3: Negative dBm</h4>
        <p>Convert -10 dBm to milliwatts:</p>
        <div className="math-formula">
          {`P(mW) = 10^{(\\frac{-10}{10})} = 10^{-1} = 0.1 \\text{ mW}`}
        </div>
      </ContentSection>

      <FAQSection
        faqs={[
          {
            question: "What is the difference between dBm and milliwatts?",
            answer: "dBm is a logarithmic unit expressing power relative to 1 milliwatt, while milliwatts are a linear unit of power. dBm makes it easier to work with large power ranges and allows simple addition/subtraction of gains and losses."
          },
          {
            question: "Why is 0 dBm equal to 1 mW?",
            answer: "0 dBm is defined as the reference point of 1 milliwatt. This provides a convenient reference for power measurements in telecommunications and electronics."
          },
          {
            question: "How do I convert negative dBm values?",
            answer: "Negative dBm values represent power levels less than 1 mW. The conversion formula works the same way: P(mW) = 10^(dBm/10). For example, -10 dBm = 0.1 mW."
          },
          {
            question: "What are common dBm values in practice?",
            answer: "Common values include: 0 dBm (1 mW), 10 dBm (10 mW), 20 dBm (100 mW), 30 dBm (1 W), -10 dBm (0.1 mW), -20 dBm (0.01 mW)."
          },
          {
            question: "Can I use this calculator for optical power measurements?",
            answer: "Yes, dBm is commonly used in optical communications. The same conversion formulas apply to optical power measurements in fiber optic systems."
          }
        ]}
      />

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName="DBm to Milliwatts Calculator" />
      </div>
    </ToolPageLayout>
  );
};

export default DBmMilliwattsCalculator;
