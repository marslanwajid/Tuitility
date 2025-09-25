import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import DBmMilliwattsCalculatorJS from '../../assets/js/science/dbm-milliwatts-calculator.js'
import '../../assets/css/science/dbm-milliwatts-calculator.css'
import 'katex/dist/katex.min.css'

const DBmMilliwattsCalculator = () => {
  const [formData, setFormData] = useState({
    dbm: '',
    milliwatts: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const dbmMilliwattsCalc = new DBmMilliwattsCalculatorJS();
      setCalculator(dbmMilliwattsCalc);
    } catch (error) {
      console.error('Error initializing DBm to Milliwatts calculator:', error);
    }
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

    // Add a small delay to ensure DOM is updated
    setTimeout(() => {
      renderKaTeX();
    }, 100);
  }, [result]);

  // Tool data
  const toolData = {
    name: 'DBm to Milliwatts Calculator',
    description: 'Convert between dBm (decibel-milliwatts) and milliwatts with precise calculations. Essential for RF engineering, telecommunications, and signal analysis.',
    icon: 'fas fa-broadcast-tower',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'DBm to Milliwatts Calculator']
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
    { name: 'DBm Watts Calculator', url: '/science/calculators/dbm-watts-calculator', icon: 'fas fa-bolt' },
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' },
    { name: 'Gravity Calculator', url: '/science/calculators/gravity-calculator', icon: 'fas fa-globe' },
    { name: 'Work Power Calculator', url: '/science/calculators/work-power-calculator', icon: 'fas fa-cogs' },
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-dbm', title: 'What is DBm?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Formulas & Calculations' },
    { id: 'examples', title: 'Examples' },
    { id: 'applications', title: 'Applications' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateInputs = () => {
    if (!calculator) return false;
    
    try {
      const errors = calculator.validateInputs(
        formData.dbm,
        formData.milliwatts
      );
      
      if (errors.length > 0) {
        setError(errors[0]);
        return false;
      }
      return true;
    } catch (error) {
      setError('Validation error occurred. Please check your inputs.');
      return false;
    }
  };

  const calculateDBmToMilliwatts = () => {
    if (!validateInputs()) return;

    try {
      const { dbm, milliwatts } = formData;

      // Use calculation from JS file
      const result = calculator.calculateDBmToMilliwatts(
        parseFloat(dbm),
        parseFloat(milliwatts)
      );

      setResult(result);
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      dbm: '',
      milliwatts: ''
    });
    setResult(null);
    setError('');
  };

  // Format numbers using the JS utility function
  const formatNumber = (value, decimals = 4) => {
    if (calculator && calculator.formatNumber) {
      return calculator.formatNumber(value, decimals);
    }
    // Fallback formatting
    return parseFloat(value).toFixed(decimals);
  };

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="DBm to Milliwatts Calculator"
        onCalculate={calculateDBmToMilliwatts}
        calculateButtonText="Calculate Conversion"
        error={error}
        result={null}
      >
        <div className="dbm-milliwatts-calculator-form">
          <div className="dbm-milliwatts-input-row">
            <div className="dbm-milliwatts-input-group">
              <label htmlFor="dbm-milliwatts-dbm" className="dbm-milliwatts-input-label">
                DBm (decibel-milliwatts):
              </label>
              <input
                type="number"
                id="dbm-milliwatts-dbm"
                className="dbm-milliwatts-input-field"
                value={formData.dbm}
                onChange={(e) => handleInputChange('dbm', e.target.value)}
                placeholder="e.g., 20"
                step="0.1"
              />
              <small className="dbm-milliwatts-input-help">
                Power level in dBm
              </small>
            </div>

            <div className="dbm-milliwatts-input-group">
              <label htmlFor="dbm-milliwatts-milliwatts" className="dbm-milliwatts-input-label">
                Milliwatts (mW):
              </label>
              <input
                type="number"
                id="dbm-milliwatts-milliwatts"
                className="dbm-milliwatts-input-field"
                value={formData.milliwatts}
                onChange={(e) => handleInputChange('milliwatts', e.target.value)}
                placeholder="e.g., 100"
                min="0"
                step="0.0001"
              />
              <small className="dbm-milliwatts-input-help">
                Power level in milliwatts
              </small>
            </div>
          </div>

          <div className="dbm-milliwatts-calculator-actions">
            <button type="button" className="dbm-milliwatts-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="dbm-milliwatts-calculator-result">
            <h3 className="dbm-milliwatts-result-title">DBm to Milliwatts Conversion Results</h3>
            <div className="dbm-milliwatts-result-content">
              <div className="dbm-milliwatts-result-main">
                <div className="dbm-milliwatts-result-item">
                  <strong>DBm Value:</strong>
                  <span className="dbm-milliwatts-result-value">
                    {formatNumber(result.dbm, 2)} dBm
                  </span>
                </div>
                <div className="dbm-milliwatts-result-item">
                  <strong>Milliwatts Value:</strong>
                  <span className="dbm-milliwatts-result-value dbm-milliwatts-result-final">
                    {formatNumber(result.milliwatts, 4)} mW
                  </span>
                </div>
                <div className="dbm-milliwatts-result-item">
                  <strong>Watts Value:</strong>
                  <span className="dbm-milliwatts-result-value">
                    {formatNumber(result.watts, 6)} W
                  </span>
                </div>
              </div>

              <div className="dbm-milliwatts-result-breakdown">
                <h4>Calculation Process</h4>
                <div className="dbm-milliwatts-breakdown-details">
                  {result.calculationSteps.map((step, index) => (
                    <div key={index} className="dbm-milliwatts-breakdown-item">
                      <span>{step.title}:</span>
                      <span dangerouslySetInnerHTML={{ __html: step.content }}></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dbm-milliwatts-result-summary">
                <h4>Power Level Analysis</h4>
                <div className="dbm-milliwatts-summary-details">
                  <div className="dbm-milliwatts-summary-item">
                    <span>Power Level:</span>
                    <span>{result.powerLevel}</span>
                  </div>
                  <div className="dbm-milliwatts-summary-item">
                    <span>Typical Use:</span>
                    <span>{result.typicalUse}</span>
                  </div>
                  <div className="dbm-milliwatts-summary-item">
                    <span>Signal Strength:</span>
                    <span>{result.signalStrength}</span>
                  </div>
                </div>
              </div>

              <div className="dbm-milliwatts-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: dBm is a logarithmic scale where 0 dBm = 1 mW. Positive dBm values represent power greater than 1 mW, while negative values represent power less than 1 mW.</span>
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
          The DBm to Milliwatts Calculator is an essential tool for RF engineers, telecommunications professionals, 
          and anyone working with signal power measurements. It converts between dBm (decibel-milliwatts) and 
          milliwatts, providing precise calculations for power level analysis.
        </p>
        <p>
          This calculator is perfect for antenna design, signal analysis, wireless communication systems, 
          and understanding power relationships in electronic circuits and RF systems.
        </p>
      </ContentSection>

      <ContentSection id="what-is-dbm" title="What is DBm?">
        <p>
          DBm (decibel-milliwatts) is a unit of power measurement that expresses power levels relative to 1 milliwatt. 
          It's commonly used in RF engineering, telecommunications, and signal processing because it provides a 
          logarithmic scale that makes it easier to work with very large or very small power values.
        </p>
        <ul>
          <li>
            <span><strong>Definition:</strong> Power level in decibels relative to 1 milliwatt</span>
          </li>
          <li>
            <span><strong>Reference:</strong> 0 dBm = 1 mW (1 milliwatt)</span>
          </li>
          <li>
            <span><strong>Scale:</strong> Logarithmic scale for easier power level comparison</span>
          </li>
          <li>
            <span><strong>Applications:</strong> RF engineering, telecommunications, signal analysis</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use DBm to Milliwatts Calculator">
        <p>Using the DBm to Milliwatts calculator is straightforward and requires basic power level information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter DBm Value:</strong> Input the power level in dBm (can be positive or negative).</span>
          </li>
          <li>
            <span><strong>Enter Milliwatts Value:</strong> Input the power level in milliwatts (must be positive).</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Conversion" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> You can enter either dBm or milliwatts value, and the calculator will compute 
          the corresponding value. Both fields are provided for convenience and verification.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Calculations">
        <div className="formula-section">
          <h3>DBm to Milliwatts Conversion</h3>
          <div className="math-formula">
            {'P(mW) = 10^{(\\text{dBm} / 10)}'}
          </div>
          <p>Where P(mW) = power in milliwatts, dBm = power in decibel-milliwatts.</p>
        </div>

        <div className="formula-section">
          <h3>Milliwatts to DBm Conversion</h3>
          <div className="math-formula">
            {'\\text{dBm} = 10 \\times \\log_{10}(P(mW))'}
          </div>
          <p>Where dBm = power in decibel-milliwatts, P(mW) = power in milliwatts.</p>
        </div>

        <div className="formula-section">
          <h3>Watts Conversion</h3>
          <div className="math-formula">
            {'P(W) = P(mW) / 1000'}
          </div>
          <p>Where P(W) = power in watts, P(mW) = power in milliwatts.</p>
        </div>

        <div className="formula-section">
          <h3>Power Level Reference</h3>
          <div className="math-formula">
            {'0 \\text{ dBm} = 1 \\text{ mW} = 0.001 \\text{ W}'}
          </div>
          <p>This is the reference point for all dBm calculations.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Common RF Power Levels</h3>
          <div className="example-solution">
            <p><strong>Input:</strong> 20 dBm</p>
            <p><strong>Calculation:</strong> P(mW) = 10^(20/10) = 10^2 = 100 mW</p>
            <p><strong>Result:</strong> 20 dBm = 100 mW = 0.1 W</p>
            <p><strong>Application:</strong> Typical WiFi router output power</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Low Power Signal</h3>
          <div className="example-solution">
            <p><strong>Input:</strong> -30 dBm</p>
            <p><strong>Calculation:</strong> P(mW) = 10^(-30/10) = 10^(-3) = 0.001 mW</p>
            <p><strong>Result:</strong> -30 dBm = 0.001 mW = 1 μW</p>
            <p><strong>Application:</strong> Received signal strength in wireless systems</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: High Power Transmission</h3>
          <div className="example-solution">
            <p><strong>Input:</strong> 50 dBm</p>
            <p><strong>Calculation:</strong> P(mW) = 10^(50/10) = 10^5 = 100,000 mW</p>
            <p><strong>Result:</strong> 50 dBm = 100,000 mW = 100 W</p>
            <p><strong>Application:</strong> High-power RF transmitter</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-wifi"></i> Wireless Communication</h4>
            <p>Calculate power levels for WiFi, Bluetooth, and cellular networks</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-satellite"></i> RF Engineering</h4>
            <p>Design and analyze RF circuits, antennas, and transmission systems</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-broadcast-tower"></i> Broadcasting</h4>
            <p>Calculate transmitter power and signal coverage for radio and TV</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-microchip"></i> Electronics Testing</h4>
            <p>Measure and analyze power consumption in electronic devices</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-radar"></i> Radar Systems</h4>
            <p>Calculate radar transmitter power and received signal strength</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-mobile-alt"></i> Mobile Networks</h4>
            <p>Analyze cell tower power levels and signal propagation</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding DBm to milliwatts conversion is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Essential for RF system design and analysis</span>
          </li>
          <li>
            <span>Critical for understanding signal strength and power levels</span>
          </li>
          <li>
            <span>Important for antenna design and optimization</span>
          </li>
          <li>
            <span>Necessary for regulatory compliance in wireless systems</span>
          </li>
          <li>
            <span>Fundamental for troubleshooting RF communication issues</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our DBm to Milliwatts Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Bidirectional Conversion:</strong> Convert between dBm and milliwatts in both directions</span>
          </li>
          <li>
            <span><strong>Step-by-Step Calculations:</strong> Detailed calculation process with formulas</span>
          </li>
          <li>
            <span><strong>Power Level Analysis:</strong> Categorizes power levels and typical applications</span>
          </li>
          <li>
            <span><strong>Multiple Units:</strong> Results in dBm, milliwatts, and watts</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
          <li>
            <span><strong>Educational Content:</strong> Explains the significance of different power levels</span>
          </li>
        </ul>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between dBm and milliwatts?",
            answer: "dBm is a logarithmic unit expressing power relative to 1 milliwatt, while milliwatts is a linear unit of power. dBm makes it easier to work with very large or very small power values."
          },
          {
            question: "Why is 0 dBm equal to 1 mW?",
            answer: "0 dBm is defined as the reference point where the power level equals 1 milliwatt. This provides a convenient reference for logarithmic power measurements."
          },
          {
            question: "What are typical dBm values for different applications?",
            answer: "WiFi routers: 15-20 dBm, Cell phones: -50 to -100 dBm (received), FM radio: 50-100 dBm (transmitted), Bluetooth: 0-10 dBm."
          },
          {
            question: "How do I convert negative dBm values?",
            answer: "Negative dBm values represent power levels less than 1 mW. Use the same formula: P(mW) = 10^(dBm/10). For example, -10 dBm = 0.1 mW."
          },
          {
            question: "What's the relationship between dBm and watts?",
            answer: "To convert dBm to watts: first convert to milliwatts using P(mW) = 10^(dBm/10), then divide by 1000 to get watts."
          },
          {
            question: "Why use dBm instead of watts for RF measurements?",
            answer: "dBm provides a logarithmic scale that makes it easier to compare very different power levels and simplifies calculations in RF systems where power can vary over many orders of magnitude."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default DBmMilliwattsCalculator
