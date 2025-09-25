import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import DBmWattsCalculatorJS from '../../assets/js/science/dbm-watts-calculator.js'
import '../../assets/css/science/dbm-watts-calculator.css'
import 'katex/dist/katex.min.css'

const DBmWattsCalculator = () => {
  const [formData, setFormData] = useState({
    conversionType: 'dbm-to-watts',
    inputValue: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const dbmWattsCalc = new DBmWattsCalculatorJS();
      setCalculator(dbmWattsCalc);
    } catch (error) {
      console.error('Error initializing DBm Watts calculator:', error);
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

    // Small delay to ensure DOM is updated
    setTimeout(() => {
      renderKaTeX();
    }, 100);
  }, [result]);

  // Tool data
  const toolData = {
    name: 'DBm Watts Calculator',
    description: 'Convert between dBm and Watts for power measurements in telecommunications and electronics.',
    icon: 'fas fa-bolt',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'DBm Watts Calculator']
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
    { name: 'Gravity Calculator', url: '/science/calculators/gravity-calculator', icon: 'fas fa-globe' },
    { name: 'Work Power Calculator', url: '/science/calculators/work-power-calculator', icon: 'fas fa-cogs' },
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' },
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' },
    { name: 'Electric Flux Calculator', url: '/science/calculators/electric-flux-calculator', icon: 'fas fa-lightning' },
    { name: 'Atomic Mass Calculator', url: '/science/calculators/average-atomic-mass-calculator', icon: 'fas fa-atom' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'what-is-dbm', title: 'What is dBm?', level: 1 },
    { id: 'what-is-watts', title: 'What are Watts?', level: 1 },
    { id: 'how-to-use', title: 'How to Use This Calculator', level: 1 },
    { id: 'formulas', title: 'Mathematical Formulas', level: 1 },
    { id: 'examples', title: 'Real-World Examples', level: 1 },
    { id: 'applications', title: 'Applications', level: 1 },
    { id: 'faq', title: 'Frequently Asked Questions', level: 1 }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (calculator) {
      try {
        const result = calculator.performCalculation(formData);
        setResult(result);
        setError('');
      } catch (error) {
        setError(error.message);
        setResult(null);
      }
    }
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      conversionType: 'dbm-to-watts',
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
        title="DBm Watts Calculator"
        description="Convert between dBm and Watts for power measurements"
        onCalculate={handleSubmit}
        error={error}
      >
        <div className="dbm-watts-calculator-form">
          <div className="dbm-watts-input-group">
            <label htmlFor="conversion-type">Conversion Type</label>
            <select
              id="conversion-type"
              name="conversionType"
              value={formData.conversionType}
              onChange={handleInputChange}
              className="dbm-watts-select-field"
            >
              <option value="dbm-to-watts">dBm to Watts</option>
              <option value="watts-to-dbm">Watts to dBm</option>
            </select>
          </div>

          <div className="dbm-watts-input-group">
            <label htmlFor="input-value">
              {formData.conversionType === 'dbm-to-watts' ? 'Power (dBm)' : 'Power (Watts)'}
            </label>
            <input
              type="number"
              id="input-value"
              name="inputValue"
              value={formData.inputValue}
              onChange={handleInputChange}
              className="dbm-watts-input-field"
              placeholder={`Enter ${formData.conversionType === 'dbm-to-watts' ? 'dBm' : 'Watts'} value`}
              step="any"
              required
            />
          </div>

          <div className="dbm-watts-calculator-actions">
            <button type="button" className="dbm-watts-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="dbm-watts-calculator-result">
            <h3>Conversion Result</h3>
            <div className="dbm-watts-result-main">
              <div className="dbm-watts-result-item">
                <h4>Result</h4>
                <p className="dbm-watts-result-value">{result.formattedResult}</p>
              </div>
            </div>
            
            {result.calculationSteps && (
              <div className="dbm-watts-calculation-steps">
                <h4>Calculation Steps</h4>
                <div className="dbm-watts-steps-content">
                  {result.calculationSteps.map((step, index) => (
                    <div key={index} className="dbm-watts-step">
                      <h5>{step.title}</h5>
                      {step.content && (
                        <div 
                          className="dbm-watts-step-content"
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
          The DBm Watts Calculator is an essential tool for converting between dBm (decibels relative to milliwatts) 
          and Watts in telecommunications, electronics, and RF engineering. This calculator is crucial for 
          understanding power levels in signal processing and communication systems.
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

      <ContentSection id="what-is-watts" title="What are Watts?">
        <p>
          Watts (W) are the standard SI unit of power, representing the rate of energy transfer or conversion. 
          In electrical systems, watts measure the rate at which electrical energy is consumed or produced.
        </p>
        <p>
          Key characteristics of Watts:
        </p>
        <ul>
          <li>Watts are a linear unit of power measurement</li>
          <li>1 Watt = 1 Joule per second</li>
          <li>Commonly used in electrical engineering and power systems</li>
          <li>Directly related to voltage and current: P = V × I</li>
          <li>Used for measuring power consumption, generation, and transmission</li>
          <li>Base unit for larger units like kilowatts (kW) and megawatts (MW)</li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use This Calculator">
        <p>Follow these steps to convert between dBm and Watts:</p>
        <ol>
          <li><strong>Select Conversion Type:</strong> Choose either "dBm to Watts" or "Watts to dBm"</li>
          <li><strong>Enter Value:</strong> Input the power value you want to convert</li>
          <li><strong>Click Calculate:</strong> View the conversion result and detailed calculation steps</li>
        </ol>
        <p>
          <strong>Note:</strong> The calculator provides step-by-step calculations to help you understand 
          the conversion process and verify your results.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Mathematical Formulas">
        <h4>dBm to Watts Conversion</h4>
        <div className="math-formula">
          {`P(W) = 10^{(\\frac{P(dBm)}{10})} \\times 0.001`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>P(W)</strong> = power in Watts</li>
          <li><strong>P(dBm)</strong> = power in dBm</li>
          <li><strong>0.001</strong> = conversion factor from milliwatts to watts</li>
        </ul>
        
        <h4>Watts to dBm Conversion</h4>
        <div className="math-formula">
          {`P(dBm) = 10 \\times \\log_{10}(P(W) \\times 1000)`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>P(dBm)</strong> = power in dBm</li>
          <li><strong>P(W)</strong> = power in Watts</li>
          <li><strong>1000</strong> = conversion factor from watts to milliwatts</li>
        </ul>
        
        <h4>Alternative dBm Formula</h4>
        <div className="math-formula">
          {`P(dBm) = 10 \\times \\log_{10}(\\frac{P(W)}{0.001})`}
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Real-World Examples">
        <h4>Common dBm Values</h4>
        <ul>
          <li>0 dBm = 1 mW = 0.001 W</li>
          <li>10 dBm = 10 mW = 0.01 W</li>
          <li>20 dBm = 100 mW = 0.1 W</li>
          <li>30 dBm = 1000 mW = 1 W</li>
          <li>-10 dBm = 0.1 mW = 0.0001 W</li>
          <li>-20 dBm = 0.01 mW = 0.00001 W</li>
        </ul>
        
        <h4>RF Power Levels</h4>
        <ul>
          <li>Cell phone transmitter: 20-30 dBm (0.1-1 W)</li>
          <li>WiFi router: 15-20 dBm (0.03-0.1 W)</li>
          <li>Bluetooth device: 0-10 dBm (0.001-0.01 W)</li>
          <li>RF amplifier output: 30-50 dBm (1-100 W)</li>
        </ul>
        
        <h4>Signal Loss Examples</h4>
        <ul>
          <li>Coaxial cable loss: -3 to -10 dB per 100m</li>
          <li>Antenna gain: +3 to +20 dB</li>
          <li>Free space path loss: -20 to -100 dB</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-broadcast-tower"></i> Telecommunications</h4>
            <p>RF power measurement, signal strength analysis, and network optimization</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-wifi"></i> Wireless Communications</h4>
            <p>WiFi, Bluetooth, and cellular signal power calculations and optimization</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-satellite"></i> Satellite Communications</h4>
            <p>Uplink and downlink power calculations, link budget analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-microchip"></i> Electronics</h4>
            <p>Amplifier design, power supply calculations, and circuit analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>RF engineering courses, telecommunications training, and laboratory work</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> Engineering</h4>
            <p>System design, performance analysis, and compliance testing</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection
        faqs={[
          {
            question: "What's the difference between dBm and dB?",
            answer: "dBm is an absolute power measurement relative to 1 milliwatt, while dB is a relative measurement expressing the ratio between two power levels. dBm has a fixed reference point (1 mW), while dB is unitless."
          },
          {
            question: "Why use dBm instead of Watts?",
            answer: "dBm uses a logarithmic scale, making it easier to work with the wide range of power levels in RF systems. It also allows simple addition and subtraction for power gains and losses, and provides better resolution for small power values."
          },
          {
            question: "What does negative dBm mean?",
            answer: "Negative dBm values indicate power levels less than 1 milliwatt. For example, -10 dBm = 0.1 mW, -20 dBm = 0.01 mW. This is common for received signal levels in communication systems."
          },
          {
            question: "How do I convert dBm to voltage?",
            answer: "To convert dBm to voltage, you need to know the impedance (usually 50Ω for RF systems). The formula is: V = √(P × R), where P is power in watts and R is impedance in ohms."
          },
          {
            question: "What are typical dBm ranges for different applications?",
            answer: "Cell phones: 20-30 dBm, WiFi: 15-20 dBm, Bluetooth: 0-10 dBm, RF amplifiers: 30-50 dBm, received signals: -30 to -100 dBm. These ranges vary based on specific applications and regulations."
          },
          {
            question: "Can I use this calculator for optical power measurements?",
            answer: "Yes, dBm is commonly used in optical communications. However, be aware that optical power measurements often use different reference points and may require additional considerations for wavelength and detector characteristics."
          }
        ]}
      />

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName="DBm Watts Calculator" />
      </div>
    </ToolPageLayout>
  );
};

export default DBmWattsCalculator;
