import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import CapacitanceCalculatorJS from '../../assets/js/science/capacitance-calculator.js'
import '../../assets/css/science/capacitance-calculator.css'
import 'katex/dist/katex.min.css'

const CapacitanceCalculator = () => {
  const [formData, setFormData] = useState({
    energy: '',
    voltage: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const capacitanceCalc = new CapacitanceCalculatorJS();
      setCalculator(capacitanceCalc);
    } catch (error) {
      console.error('Error initializing capacitance calculator:', error);
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
    name: 'Capacitance Calculator',
    description: 'Calculate electrical capacitance from energy and voltage. Essential for circuit design, energy storage analysis, and electrical engineering calculations.',
    icon: 'fas fa-microchip',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'Capacitance Calculator']
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
    { name: 'DBm to Milliwatts Calculator', url: '/science/calculators/dbm-milliwatts-calculator', icon: 'fas fa-broadcast-tower' },
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' },
    { name: 'Gravity Calculator', url: '/science/calculators/gravity-calculator', icon: 'fas fa-globe' },
    { name: 'Work Power Calculator', url: '/science/calculators/work-power-calculator', icon: 'fas fa-cogs' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-capacitance', title: 'What is Capacitance?' },
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
        formData.energy,
        formData.voltage
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

  const calculateCapacitance = () => {
    if (!validateInputs()) return;

    try {
      const { energy, voltage } = formData;

      // Use calculation from JS file
      const result = calculator.calculateCapacitance(
        parseFloat(energy),
        parseFloat(voltage)
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
      energy: '',
      voltage: ''
    });
    setResult(null);
    setError('');
  };

  // Format numbers using the JS utility function
  const formatNumber = (value, decimals = 6) => {
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
        title="Capacitance Calculator"
        onCalculate={calculateCapacitance}
        calculateButtonText="Calculate Capacitance"
        error={error}
        result={null}
      >
        <div className="capacitance-calculator-form">
          <div className="capacitance-input-row">
            <div className="capacitance-input-group">
              <label htmlFor="capacitance-energy" className="capacitance-input-label">
                Energy (J):
              </label>
              <input
                type="number"
                id="capacitance-energy"
                className="capacitance-input-field"
                value={formData.energy}
                onChange={(e) => handleInputChange('energy', e.target.value)}
                placeholder="e.g., 0.5"
                min="0"
                step="0.001"
              />
              <small className="capacitance-input-help">
                Energy stored in the capacitor in Joules
              </small>
            </div>

            <div className="capacitance-input-group">
              <label htmlFor="capacitance-voltage" className="capacitance-input-label">
                Voltage (V):
              </label>
              <input
                type="number"
                id="capacitance-voltage"
                className="capacitance-input-field"
                value={formData.voltage}
                onChange={(e) => handleInputChange('voltage', e.target.value)}
                placeholder="e.g., 12"
                min="0"
                step="0.1"
              />
              <small className="capacitance-input-help">
                Voltage across the capacitor in Volts
              </small>
            </div>
          </div>

          <div className="capacitance-calculator-actions">
            <button type="button" className="capacitance-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="capacitance-calculator-result">
            <h3 className="capacitance-result-title">Capacitance Calculation Results</h3>
            <div className="capacitance-result-content">
              <div className="capacitance-result-main">
                <div className="capacitance-result-item">
                  <strong>Capacitance:</strong>
                  <span className="capacitance-result-value capacitance-result-final">
                    {formatNumber(result.capacitance, 6)} F
                  </span>
                </div>
                <div className="capacitance-result-item">
                  <strong>Energy:</strong>
                  <span className="capacitance-result-value">
                    {formatNumber(result.energy, 3)} J
                  </span>
                </div>
                <div className="capacitance-result-item">
                  <strong>Voltage:</strong>
                  <span className="capacitance-result-value">
                    {formatNumber(result.voltage, 1)} V
                  </span>
                </div>
              </div>

              <div className="capacitance-result-breakdown">
                <h4>Calculation Process</h4>
                <div className="capacitance-breakdown-details">
                  {result.calculationSteps.map((step, index) => (
                    <div key={index} className="capacitance-breakdown-item">
                      <span>{step.title}:</span>
                      <span dangerouslySetInnerHTML={{ __html: step.content }}></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="capacitance-result-summary">
                <h4>Capacitor Analysis</h4>
                <div className="capacitance-summary-details">
                  <div className="capacitance-summary-item">
                    <span>Capacitor Type:</span>
                    <span>{result.capacitorType}</span>
                  </div>
                  <div className="capacitance-summary-item">
                    <span>Typical Use:</span>
                    <span>{result.typicalUse}</span>
                  </div>
                  <div className="capacitance-summary-item">
                    <span>Energy Density:</span>
                    <span>{result.energyDensity}</span>
                  </div>
                  <div className="capacitance-summary-item">
                    <span>Capacitance Range:</span>
                    <span>{result.capacitanceRange}</span>
                  </div>
                </div>
              </div>

              <div className="capacitance-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Capacitance is measured in Farads (F). Most practical capacitors are measured in microfarads (μF), nanofarads (nF), or picofarads (pF).</span>
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
          The Capacitance Calculator is an essential tool for electrical engineers, circuit designers, 
          and students working with electronic circuits. It calculates electrical capacitance from energy 
          and voltage values, providing precise measurements for circuit analysis and design.
        </p>
        <p>
          This calculator is perfect for analyzing energy storage in capacitors, designing power supply 
          circuits, understanding RC circuits, and calculating the capacitance needed for specific 
          energy storage requirements.
        </p>
      </ContentSection>

      <ContentSection id="what-is-capacitance" title="What is Capacitance?">
        <p>
          Capacitance is the ability of a system to store electrical charge. It's measured in Farads (F) 
          and represents the ratio of electric charge to electric potential difference. Capacitors are 
          fundamental components in electronic circuits used for energy storage, filtering, and timing.
        </p>
        <ul>
          <li>
            <span><strong>Definition:</strong> The ability to store electrical energy in an electric field</span>
          </li>
          <li>
            <span><strong>Unit:</strong> Farad (F), named after Michael Faraday</span>
          </li>
          <li>
            <span><strong>Formula:</strong> C = Q/V, where Q is charge and V is voltage</span>
          </li>
          <li>
            <span><strong>Energy Storage:</strong> E = ½CV², where E is energy stored</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Capacitance Calculator">
        <p>Using the capacitance calculator is straightforward and requires basic electrical parameters:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Energy:</strong> Input the energy stored in the capacitor in Joules (J).</span>
          </li>
          <li>
            <span><strong>Enter Voltage:</strong> Input the voltage across the capacitor in Volts (V).</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Capacitance" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Make sure your energy and voltage values are in the correct units. 
          The calculator will automatically compute the capacitance and provide additional analysis.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Calculations">
        <div className="formula-section">
          <h3>Capacitance from Energy and Voltage</h3>
          <div className="math-formula">
            {'C = \\frac{2E}{V^2}'}
          </div>
          <p>Where C = capacitance in Farads, E = energy in Joules, V = voltage in Volts.</p>
        </div>

        <div className="formula-section">
          <h3>Energy Stored in Capacitor</h3>
          <div className="math-formula">
            {'E = \\frac{1}{2}CV^2'}
          </div>
          <p>This formula shows the relationship between energy, capacitance, and voltage.</p>
        </div>

        <div className="formula-section">
          <h3>Charge on Capacitor</h3>
          <div className="math-formula">
            {'Q = CV'}
          </div>
          <p>Where Q = charge in Coulombs, C = capacitance in Farads, V = voltage in Volts.</p>
        </div>

        <div className="formula-section">
          <h3>Capacitor Energy Density</h3>
          <div className="math-formula">
            {'u = \\frac{1}{2}\\epsilon_0 E^2'}
          </div>
          <p>Where u = energy density, ε₀ = permittivity of free space, E = electric field strength.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Small Electronic Circuit</h3>
          <div className="example-solution">
            <p><strong>Energy:</strong> 0.5 J</p>
            <p><strong>Voltage:</strong> 12 V</p>
            <p><strong>Calculation:</strong> C = (2 × 0.5) / 12² = 1 / 144 = 0.00694 F</p>
            <p><strong>Result:</strong> 6.94 mF (millifarads)</p>
            <p><strong>Application:</strong> Power supply filtering capacitor</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: High Energy Storage</h3>
          <div className="example-solution">
            <p><strong>Energy:</strong> 100 J</p>
            <p><strong>Voltage:</strong> 50 V</p>
            <p><strong>Calculation:</strong> C = (2 × 100) / 50² = 200 / 2500 = 0.08 F</p>
            <p><strong>Result:</strong> 80 mF (millifarads)</p>
            <p><strong>Application:</strong> Energy storage system</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Low Power Circuit</h3>
          <div className="example-solution">
            <p><strong>Energy:</strong> 0.001 J</p>
            <p><strong>Voltage:</strong> 3.3 V</p>
            <p><strong>Calculation:</strong> C = (2 × 0.001) / 3.3² = 0.002 / 10.89 = 0.000184 F</p>
            <p><strong>Result:</strong> 184 μF (microfarads)</p>
            <p><strong>Application:</strong> Microcontroller power supply</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-microchip"></i> Circuit Design</h4>
            <p>Design and analyze electronic circuits with proper capacitance values</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-battery-full"></i> Power Supplies</h4>
            <p>Calculate filtering capacitors for power supply circuits</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-clock"></i> Timing Circuits</h4>
            <p>Design RC timing circuits and oscillators</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-bolt"></i> Energy Storage</h4>
            <p>Calculate capacitance for energy storage applications</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-filter"></i> Signal Filtering</h4>
            <p>Design low-pass, high-pass, and band-pass filters</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Learn about capacitance and electrical energy storage</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding capacitance calculations is crucial for electrical engineering:</p>
        <ul>
          <li>
            <span>Essential for circuit design and analysis</span>
          </li>
          <li>
            <span>Critical for power supply and filtering applications</span>
          </li>
          <li>
            <span>Important for energy storage system design</span>
          </li>
          <li>
            <span>Necessary for understanding RC circuits and timing</span>
          </li>
          <li>
            <span>Fundamental for electronic device development</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Capacitance Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Precise Calculations:</strong> Accurate capacitance calculations from energy and voltage</span>
          </li>
          <li>
            <span><strong>Step-by-Step Process:</strong> Detailed calculation steps with formulas</span>
          </li>
          <li>
            <span><strong>Capacitor Analysis:</strong> Categorizes capacitor types and typical uses</span>
          </li>
          <li>
            <span><strong>Energy Density Analysis:</strong> Provides energy density information</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
          <li>
            <span><strong>Educational Content:</strong> Explains capacitance concepts and applications</span>
          </li>
        </ul>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between capacitance and capacity?",
            answer: "Capacitance is the electrical property measured in Farads, while capacity typically refers to the amount of charge a capacitor can store. Capacitance is the ratio of charge to voltage (C = Q/V)."
          },
          {
            question: "Why do we use the formula C = 2E/V²?",
            answer: "This formula is derived from the energy stored in a capacitor (E = ½CV²). Rearranging this equation gives us C = 2E/V², which allows us to calculate capacitance when we know the energy and voltage."
          },
          {
            question: "What are typical capacitance values for different applications?",
            answer: "Electrolytic capacitors: 1μF to 10,000μF, Ceramic capacitors: 1pF to 100μF, Film capacitors: 1nF to 100μF, Supercapacitors: 0.1F to 5000F."
          },
          {
            question: "How does voltage affect capacitance?",
            answer: "For most capacitors, capacitance is relatively constant with voltage. However, some capacitors (like electrolytic) may have slight variations in capacitance with applied voltage."
          },
          {
            question: "What happens if I exceed the voltage rating of a capacitor?",
            answer: "Exceeding the voltage rating can cause the capacitor to fail, potentially leading to explosion, leakage, or permanent damage. Always use capacitors within their rated voltage limits."
          },
          {
            question: "How do I choose the right capacitor for my circuit?",
            answer: "Consider the required capacitance value, voltage rating, tolerance, temperature coefficient, and application (filtering, timing, energy storage). The voltage rating should be at least 1.5 times your maximum operating voltage."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default CapacitanceCalculator
