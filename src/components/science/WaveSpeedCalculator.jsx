import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import WaveSpeedCalculatorJS from '../../assets/js/science/wave-speed-calculator.js'
import '../../assets/css/science/wave-speed-calculator.css'
import 'katex/dist/katex.min.css'

const WaveSpeedCalculator = () => {
  const [formData, setFormData] = useState({
    frequency: '',
    wavelength: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const waveSpeedCalc = new WaveSpeedCalculatorJS();
      setCalculator(waveSpeedCalc);
    } catch (error) {
      console.error('Error initializing wave speed calculator:', error);
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

    renderKaTeX();
  }, [result]);

  // Tool data
  const toolData = {
    name: 'Wave Speed Calculator',
    description: 'Calculate wave speed, frequency, and wavelength using the fundamental wave equation. Perfect for physics students and professionals.',
    icon: 'fas fa-wave-square',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'Wave Speed Calculator']
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
    { name: 'DBm Watts Calculator', url: '/science/calculators/dbm-watts-calculator', icon: 'fas fa-bolt' },
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' },
    { name: 'Electric Flux Calculator', url: '/science/calculators/electric-flux-calculator', icon: 'fas fa-lightning' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-wave-speed', title: 'What is Wave Speed?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Wave Speed Formulas & Calculations' },
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
        formData.frequency,
        formData.wavelength
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

  const calculateWaveSpeed = () => {
    if (!validateInputs()) return;

    try {
      const { frequency, wavelength } = formData;

      // Use calculation from JS file
      const result = calculator.calculateWaveSpeed(
        parseFloat(frequency),
        parseFloat(wavelength)
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
      frequency: '',
      wavelength: ''
    });
    setResult(null);
    setError('');
  };

  // Format numbers using the JS utility function
  const formatNumber = (value, decimals = 2) => {
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
        title="Wave Speed Calculator"
        onCalculate={calculateWaveSpeed}
        calculateButtonText="Calculate Wave Speed"
        error={error}
        result={null}
      >
        <div className="wave-speed-calculator-form">
          <div className="wave-speed-input-row">
            <div className="wave-speed-input-group">
              <label htmlFor="wave-speed-frequency" className="wave-speed-input-label">
                Frequency (Hz):
              </label>
              <input
                type="number"
                id="wave-speed-frequency"
                className="wave-speed-input-field"
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                placeholder="e.g., 440"
                min="0"
                step="0.1"
              />
              <small className="wave-speed-input-help">
                Number of wave cycles per second
              </small>
            </div>

            <div className="wave-speed-input-group">
              <label htmlFor="wave-speed-wavelength" className="wave-speed-input-label">
                Wavelength (m):
              </label>
              <input
                type="number"
                id="wave-speed-wavelength"
                className="wave-speed-input-field"
                value={formData.wavelength}
                onChange={(e) => handleInputChange('wavelength', e.target.value)}
                placeholder="e.g., 0.75"
                min="0"
                step="0.01"
              />
              <small className="wave-speed-input-help">
                Distance between consecutive wave peaks
              </small>
            </div>
          </div>

          <div className="wave-speed-calculator-actions">
            <button type="button" className="wave-speed-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="wave-speed-calculator-result">
            <h3 className="wave-speed-result-title">Wave Speed Calculation Results</h3>
            <div className="wave-speed-result-content">
              <div className="wave-speed-result-main">
                <div className="wave-speed-result-item">
                  <strong>Wave Speed:</strong>
                  <span className="wave-speed-result-value">
                    {formatNumber(result.waveSpeed)} m/s
                  </span>
                </div>
                <div className="wave-speed-result-item">
                  <strong>Frequency:</strong>
                  <span className="wave-speed-result-value">
                    {formatNumber(result.frequency)} Hz
                  </span>
                </div>
                <div className="wave-speed-result-item">
                  <strong>Wavelength:</strong>
                  <span className="wave-speed-result-value">
                    {formatNumber(result.wavelength)} m
                  </span>
                </div>
              </div>

              <div className="wave-speed-result-breakdown">
                <h4>Calculation Process</h4>
                <div className="wave-speed-breakdown-details">
                  <div className="wave-speed-breakdown-item">
                    <span>Formula Used:</span>
                    <span>v = f × λ</span>
                  </div>
                  <div className="wave-speed-breakdown-item">
                    <span>Where:</span>
                    <span>v = wave speed, f = frequency, λ = wavelength</span>
                  </div>
                  <div className="wave-speed-breakdown-item">
                    <span>Calculation:</span>
                    <span>{formatNumber(result.frequency)} Hz × {formatNumber(result.wavelength)} m = {formatNumber(result.waveSpeed)} m/s</span>
                  </div>
                </div>
              </div>

              <div className="wave-speed-result-summary">
                <h4>Wave Properties</h4>
                <div className="wave-speed-summary-details">
                  <div className="wave-speed-summary-item">
                    <span>Wave Type:</span>
                    <span>{result.waveType}</span>
                  </div>
                  <div className="wave-speed-summary-item">
                    <span>Medium:</span>
                    <span>{result.medium}</span>
                  </div>
                  <div className="wave-speed-summary-item">
                    <span>Period:</span>
                    <span>{formatNumber(result.period, 4)} s</span>
                  </div>
                  <div className="wave-speed-summary-item">
                    <span>Angular Frequency:</span>
                    <span>{formatNumber(result.angularFrequency, 2)} rad/s</span>
                  </div>
                </div>
              </div>

              <div className="wave-speed-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Wave speed depends on the medium through which the wave travels. Sound waves travel faster in denser materials!</span>
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
          The Wave Speed Calculator is an essential tool for physics students and professionals working with 
          wave phenomena. It calculates wave speed using the fundamental wave equation, helping you understand 
          the relationship between frequency, wavelength, and wave velocity.
        </p>
        <p>
          This calculator is perfect for studying sound waves, electromagnetic waves, water waves, and other 
          wave phenomena in physics, engineering, and scientific research.
        </p>
      </ContentSection>

      <ContentSection id="what-is-wave-speed" title="What is Wave Speed?">
        <p>
          Wave speed (v) is the speed at which a wave propagates through a medium. It's one of the fundamental 
          properties of waves and is related to the frequency and wavelength through the wave equation.
        </p>
        <ul>
          <li>
            <span><strong>Definition:</strong> The distance a wave travels per unit time</span>
          </li>
          <li>
            <span><strong>Units:</strong> Typically measured in meters per second (m/s)</span>
          </li>
          <li>
            <span><strong>Dependence:</strong> Varies with the medium and wave type</span>
          </li>
          <li>
            <span><strong>Relationship:</strong> Connected to frequency and wavelength by v = f × λ</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Wave Speed Calculator">
        <p>Using the wave speed calculator is straightforward and requires basic wave parameters:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Frequency:</strong> Input the frequency of the wave in Hertz (Hz).</span>
          </li>
          <li>
            <span><strong>Enter Wavelength:</strong> Input the wavelength of the wave in meters (m).</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Wave Speed" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Make sure your frequency and wavelength values are in the correct units. 
          The calculator will automatically compute the wave speed and related wave properties.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Wave Speed Formulas & Calculations">
        <div className="formula-section">
          <h3>Fundamental Wave Equation</h3>
          <div className="math-formula">
            v = f × λ
          </div>
          <p>Where v = wave speed, f = frequency, λ = wavelength.</p>
        </div>

        <div className="formula-section">
          <h3>Wave Period</h3>
          <div className="math-formula">
            T = 1/f
          </div>
          <p>Where T = period, f = frequency.</p>
        </div>

        <div className="formula-section">
          <h3>Angular Frequency</h3>
          <div className="math-formula">
            ω = 2πf
          </div>
          <p>Where ω = angular frequency, f = frequency.</p>
        </div>

        <div className="formula-section">
          <h3>Wave Number</h3>
          <div className="math-formula">
            k = 2π/λ
          </div>
          <p>Where k = wave number, λ = wavelength.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Sound Wave</h3>
          <div className="example-solution">
            <p><strong>Frequency:</strong> 440 Hz (A4 note)</p>
            <p><strong>Wavelength:</strong> 0.78 m (in air at 20°C)</p>
            <p><strong>Wave Speed:</strong> 343.2 m/s</p>
            <p><strong>Calculation:</strong> 440 Hz × 0.78 m = 343.2 m/s</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Radio Wave</h3>
          <div className="example-solution">
            <p><strong>Frequency:</strong> 100 MHz</p>
            <p><strong>Wavelength:</strong> 3 m</p>
            <p><strong>Wave Speed:</strong> 3 × 10⁸ m/s (speed of light)</p>
            <p><strong>Calculation:</strong> 100 × 10⁶ Hz × 3 m = 3 × 10⁸ m/s</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Water Wave</h3>
          <div className="example-solution">
            <p><strong>Frequency:</strong> 0.5 Hz</p>
            <p><strong>Wavelength:</strong> 2 m</p>
            <p><strong>Wave Speed:</strong> 1 m/s</p>
            <p><strong>Calculation:</strong> 0.5 Hz × 2 m = 1 m/s</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-music"></i> Acoustics</h4>
            <p>Calculate sound wave properties for audio engineering and music production</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-satellite"></i> Telecommunications</h4>
            <p>Design and analyze radio, microwave, and optical communication systems</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-water"></i> Oceanography</h4>
            <p>Study ocean waves, tsunamis, and underwater acoustics</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-atom"></i> Quantum Physics</h4>
            <p>Analyze wave-particle duality and quantum wave functions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-eye"></i> Optics</h4>
            <p>Calculate light wave properties for lens design and optical systems</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Medical Imaging</h4>
            <p>Analyze ultrasound waves for medical diagnostics and imaging</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding wave speed calculations is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Essential for understanding wave behavior in different media</span>
          </li>
          <li>
            <span>Critical for designing communication systems and antennas</span>
          </li>
          <li>
            <span>Important for acoustic engineering and sound system design</span>
          </li>
          <li>
            <span>Fundamental for studying wave phenomena in physics</span>
          </li>
          <li>
            <span>Necessary for analyzing wave interference and resonance</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Wave Speed Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Wave Speed Calculation:</strong> Calculates wave speed from frequency and wavelength</span>
          </li>
          <li>
            <span><strong>Wave Properties:</strong> Computes period, angular frequency, and wave number</span>
          </li>
          <li>
            <span><strong>Step-by-Step Process:</strong> Shows the calculation process and formula used</span>
          </li>
          <li>
            <span><strong>Wave Classification:</strong> Identifies wave type based on frequency range</span>
          </li>
          <li>
            <span><strong>Medium Analysis:</strong> Determines the likely medium based on wave speed</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What's the difference between wave speed and wave velocity?",
            answer: "Wave speed is the magnitude of the wave velocity vector. Wave velocity includes both speed and direction, while wave speed is just the magnitude (always positive)."
          },
          {
            question: "How does wave speed change in different media?",
            answer: "Wave speed depends on the properties of the medium. Sound waves travel faster in denser materials, while light waves slow down in denser optical media."
          },
          {
            question: "Can wave speed be greater than the speed of light?",
            answer: "In most cases, no. However, phase velocity can exceed the speed of light in certain media, but this doesn't violate relativity as no information is transmitted faster than light."
          },
          {
            question: "What units should I use for frequency and wavelength?",
            answer: "Use Hertz (Hz) for frequency and meters (m) for wavelength. The calculator will automatically compute wave speed in m/s."
          },
          {
            question: "How do I calculate wave speed if I only know the period?",
            answer: "First convert period to frequency using f = 1/T, then use the wave equation v = f × λ. You'll still need the wavelength."
          },
          {
            question: "What's the relationship between wave speed and energy?",
            answer: "Wave speed is related to the medium's properties, while wave energy is related to amplitude and frequency. Higher frequency waves carry more energy but don't necessarily travel faster."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default WaveSpeedCalculator
