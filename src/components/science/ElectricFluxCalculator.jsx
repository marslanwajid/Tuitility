import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import ElectricFluxCalculatorJS from '../../assets/js/science/electric-flux-calculator.js'
import '../../assets/css/science/electric-flux-calculator.css'
import 'katex/dist/katex.min.css'

const ElectricFluxCalculator = () => {
  const [formData, setFormData] = useState({
    electricField: '',
    angle: '',
    area: '',
    charge: '',
    chargeUnit: 'Nanocoulomb',
    permittivity: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const electricFluxCalc = new ElectricFluxCalculatorJS();
      setCalculator(electricFluxCalc);
    } catch (error) {
      console.error('Error initializing electric flux calculator:', error);
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
    name: 'Electric Flux Calculator',
    description: 'Calculate electric flux through surfaces using electric field and area, or Gauss\'s Law with charge. Essential for electromagnetism and electrical engineering.',
    icon: 'fas fa-lightning',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'Electric Flux Calculator']
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
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' },
    { name: 'DBm Watts Calculator', url: '/science/calculators/dbm-watts-calculator', icon: 'fas fa-bolt' },
    { name: 'DBm to Milliwatts Calculator', url: '/science/calculators/dbm-milliwatts-calculator', icon: 'fas fa-broadcast-tower' },
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' },
    { name: 'Gravity Calculator', url: '/science/calculators/gravity-calculator', icon: 'fas fa-globe' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-electric-flux', title: 'What is Electric Flux?' },
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
        formData.electricField,
        formData.angle,
        formData.area,
        formData.charge,
        formData.permittivity
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

  const calculateElectricFlux = () => {
    if (!validateInputs()) return;

    try {
      const { electricField, angle, area, charge, chargeUnit, permittivity } = formData;

      // Use calculation from JS file
      const result = calculator.calculateElectricFlux(
        parseFloat(electricField),
        parseFloat(angle),
        parseFloat(area),
        parseFloat(charge),
        chargeUnit,
        parseFloat(permittivity)
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
      electricField: '',
      angle: '',
      area: '',
      charge: '',
      chargeUnit: 'Nanocoulomb',
      permittivity: ''
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
        title="Electric Flux Calculator"
        onCalculate={calculateElectricFlux}
        calculateButtonText="Calculate Electric Flux"
        error={error}
        result={null}
      >
        <div className="electric-flux-calculator-form">
          <div className="electric-flux-input-row">
            <div className="electric-flux-input-group">
              <label htmlFor="electric-flux-field" className="electric-flux-input-label">
                Electric Field (V/m):
              </label>
              <input
                type="number"
                id="electric-flux-field"
                className="electric-flux-input-field"
                value={formData.electricField}
                onChange={(e) => handleInputChange('electricField', e.target.value)}
                placeholder="e.g., 10"
                min="0"
                step="0.1"
              />
              <small className="electric-flux-input-help">
                Electric field strength in Volts per meter
              </small>
            </div>

            <div className="electric-flux-input-group">
              <label htmlFor="electric-flux-angle" className="electric-flux-input-label">
                Angle (degrees):
              </label>
              <input
                type="number"
                id="electric-flux-angle"
                className="electric-flux-input-field"
                value={formData.angle}
                onChange={(e) => handleInputChange('angle', e.target.value)}
                placeholder="e.g., 5"
                min="0"
                max="180"
                step="0.1"
              />
              <small className="electric-flux-input-help">
                Angle between field and surface normal
              </small>
            </div>
          </div>

          <div className="electric-flux-input-row">
            <div className="electric-flux-input-group">
              <label htmlFor="electric-flux-area" className="electric-flux-input-label">
                Surface Area (m²):
              </label>
              <input
                type="number"
                id="electric-flux-area"
                className="electric-flux-input-field"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="e.g., 15"
                min="0"
                step="0.1"
              />
              <small className="electric-flux-input-help">
                Area of the surface in square meters
              </small>
            </div>

            <div className="electric-flux-input-group">
              <label htmlFor="electric-flux-charge" className="electric-flux-input-label">
                Charge:
              </label>
              <input
                type="number"
                id="electric-flux-charge"
                className="electric-flux-input-field"
                value={formData.charge}
                onChange={(e) => handleInputChange('charge', e.target.value)}
                placeholder="e.g., 4.36"
                step="0.001"
              />
              <small className="electric-flux-input-help">
                Electric charge for Gauss's Law calculation
              </small>
            </div>
          </div>

          <div className="electric-flux-input-row">
            <div className="electric-flux-input-group">
              <label htmlFor="electric-flux-charge-unit" className="electric-flux-input-label">
                Charge Unit:
              </label>
              <select
                id="electric-flux-charge-unit"
                className="electric-flux-select-field"
                value={formData.chargeUnit}
                onChange={(e) => handleInputChange('chargeUnit', e.target.value)}
              >
                <option value="Coulomb">Coulomb (C)</option>
                <option value="Millicoulomb">Millicoulomb (mC)</option>
                <option value="Microcoulomb">Microcoulomb (μC)</option>
                <option value="Nanocoulomb">Nanocoulomb (nC)</option>
                <option value="Picocoulomb">Picocoulomb (pC)</option>
                <option value="Elementary charge">Elementary charge (e)</option>
                <option value="Ampère hours">Ampère hours (Ah)</option>
                <option value="Milliampere hours">Milliampere hours (mAh)</option>
              </select>
            </div>

            <div className="electric-flux-input-group">
              <label htmlFor="electric-flux-permittivity" className="electric-flux-input-label">
                Permittivity (×10⁻¹² F/m):
              </label>
              <input
                type="number"
                id="electric-flux-permittivity"
                className="electric-flux-input-field"
                value={formData.permittivity}
                onChange={(e) => handleInputChange('permittivity', e.target.value)}
                placeholder="e.g., 8.854"
                min="0"
                step="0.001"
              />
              <small className="electric-flux-input-help">
                Permittivity of the medium (default: vacuum)
              </small>
            </div>
          </div>

          <div className="electric-flux-calculator-actions">
            <button type="button" className="electric-flux-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="electric-flux-calculator-result">
            <h3 className="electric-flux-result-title">Electric Flux Calculation Results</h3>
            <div className="electric-flux-result-content">
              <div className="electric-flux-result-main">
                <div className="electric-flux-result-item">
                  <strong>Flux (E·A·cos(θ)):</strong>
                  <span className="electric-flux-result-value electric-flux-result-final">
                    {formatNumber(result.fluxEA, 4)} V·m
                  </span>
                </div>
                <div className="electric-flux-result-item">
                  <strong>Flux (Gauss's Law):</strong>
                  <span className="electric-flux-result-value">
                    {result.fluxCharge.toExponential(4)} V·m
                  </span>
                </div>
                <div className="electric-flux-result-item">
                  <strong>Electric Field:</strong>
                  <span className="electric-flux-result-value">
                    {formatNumber(result.electricField, 1)} V/m
                  </span>
                </div>
                <div className="electric-flux-result-item">
                  <strong>Surface Area:</strong>
                  <span className="electric-flux-result-value">
                    {formatNumber(result.area, 1)} m²
                  </span>
                </div>
              </div>

              <div className="electric-flux-result-breakdown">
                <h4>Calculation Process</h4>
                <div className="electric-flux-breakdown-details">
                  {result.calculationSteps.map((step, index) => (
                    <div key={index} className="electric-flux-breakdown-item">
                      <span>{step.title}:</span>
                      <span dangerouslySetInnerHTML={{ __html: step.content }}></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="electric-flux-result-summary">
                <h4>Electric Flux Analysis</h4>
                <div className="electric-flux-summary-details">
                  <div className="electric-flux-summary-item">
                    <span>Flux Type:</span>
                    <span>{result.fluxType}</span>
                  </div>
                  <div className="electric-flux-summary-item">
                    <span>Field Strength:</span>
                    <span>{result.fieldStrength}</span>
                  </div>
                  <div className="electric-flux-summary-item">
                    <span>Surface Orientation:</span>
                    <span>{result.surfaceOrientation}</span>
                  </div>
                  <div className="electric-flux-summary-item">
                    <span>Typical Application:</span>
                    <span>{result.typicalApplication}</span>
                  </div>
                </div>
              </div>

              <div className="electric-flux-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Electric flux is measured in V·m (Volt-meters). Positive flux indicates field lines leaving the surface, while negative flux indicates field lines entering the surface.</span>
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
          The Electric Flux Calculator is an essential tool for physics students, electrical engineers, 
          and anyone working with electromagnetism. It calculates electric flux through surfaces using 
          two fundamental methods: the electric field-area method and Gauss's Law.
        </p>
        <p>
          This calculator is perfect for understanding electromagnetic field behavior, analyzing 
          electric field distributions, solving problems in electrostatics, and applying Gauss's Law 
          in various electrical engineering applications.
        </p>
      </ContentSection>

      <ContentSection id="what-is-electric-flux" title="What is Electric Flux?">
        <p>
          Electric flux is a measure of the number of electric field lines passing through a given surface. 
          It's a fundamental concept in electromagnetism that describes how much electric field penetrates 
          through a surface area. Electric flux is crucial for understanding Gauss's Law and electromagnetic 
          field behavior.
        </p>
        <ul>
          <li>
            <span><strong>Definition:</strong> The electric flux through a surface is the integral of the electric field over that surface</span>
          </li>
          <li>
            <span><strong>Unit:</strong> Volt-meters (V·m) or N·m²/C</span>
          </li>
          <li>
            <span><strong>Formula:</strong> Φ = E·A·cos(θ) for uniform fields</span>
          </li>
          <li>
            <span><strong>Gauss's Law:</strong> Φ = Q/ε₀ for closed surfaces</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Electric Flux Calculator">
        <p>Using the electric flux calculator requires basic electromagnetic parameters:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Electric Field:</strong> Input the electric field strength in V/m.</span>
          </li>
          <li>
            <span><strong>Enter Angle:</strong> Input the angle between the field and surface normal in degrees.</span>
          </li>
          <li>
            <span><strong>Enter Surface Area:</strong> Input the area of the surface in m².</span>
          </li>
          <li>
            <span><strong>Enter Charge:</strong> Input the electric charge for Gauss's Law calculation.</span>
          </li>
          <li>
            <span><strong>Select Charge Unit:</strong> Choose the appropriate unit for the charge.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Electric Flux" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> The calculator provides two methods: E·A·cos(θ) for field calculations 
          and Gauss's Law (Q/ε₀) for charge-based calculations. Both methods should give consistent results.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Calculations">
        <div className="formula-section">
          <h3>Electric Flux Formula</h3>
          <div className="math-formula">
            {'\\Phi_E = E \\cdot A \\cdot \\cos(\\theta)'}
          </div>
          <p>Where Φₑ = electric flux, E = electric field, A = surface area, θ = angle between field and normal.</p>
        </div>

        <div className="formula-section">
          <h3>Gauss's Law</h3>
          <div className="math-formula">
            {'\\Phi_E = \\frac{Q}{\\varepsilon_0}'}
          </div>
          <p>Where Φₑ = electric flux, Q = enclosed charge, ε₀ = vacuum permittivity.</p>
        </div>

        <div className="formula-section">
          <h3>General Electric Flux</h3>
          <div className="math-formula">
            {'\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A}'}
          </div>
          <p>This is the general integral form for calculating electric flux through any surface.</p>
        </div>

        <div className="formula-section">
          <h3>Vacuum Permittivity</h3>
          <div className="math-formula">
            {'\\varepsilon_0 = 8.85418782 \\times 10^{-12} \\text{ F/m}'}
          </div>
          <p>This is the fundamental constant for vacuum permittivity used in Gauss's Law.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Uniform Electric Field</h3>
          <div className="example-solution">
            <p><strong>Electric Field:</strong> 10 V/m</p>
            <p><strong>Surface Area:</strong> 15 m²</p>
            <p><strong>Angle:</strong> 5°</p>
            <p><strong>Calculation:</strong> Φ = 10 × 15 × cos(5°) = 150 × 0.9962 = 149.43 V·m</p>
            <p><strong>Result:</strong> 149.43 V·m</p>
            <p><strong>Application:</strong> Electric field through a flat surface</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Gauss's Law Application</h3>
          <div className="example-solution">
            <p><strong>Charge:</strong> 4.36 nC</p>
            <p><strong>Permittivity:</strong> 8.854 × 10⁻¹² F/m</p>
            <p><strong>Calculation:</strong> Φ = (4.36 × 10⁻⁹) / (8.854 × 10⁻¹²) = 492.4 V·m</p>
            <p><strong>Result:</strong> 492.4 V·m</p>
            <p><strong>Application:</strong> Flux through a closed surface enclosing a point charge</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Perpendicular Field</h3>
          <div className="example-solution">
            <p><strong>Electric Field:</strong> 20 V/m</p>
            <p><strong>Surface Area:</strong> 5 m²</p>
            <p><strong>Angle:</strong> 0° (perpendicular)</p>
            <p><strong>Calculation:</strong> Φ = 20 × 5 × cos(0°) = 100 × 1 = 100 V·m</p>
            <p><strong>Result:</strong> 100 V·m</p>
            <p><strong>Application:</strong> Maximum flux when field is perpendicular to surface</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-microchip"></i> Circuit Design</h4>
            <p>Analyze electric field distributions in electronic circuits</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-atom"></i> Electromagnetism</h4>
            <p>Study electric field behavior and flux through surfaces</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-bolt"></i> Power Systems</h4>
            <p>Calculate electric flux in power transmission systems</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Physics Education</h4>
            <p>Learn about Gauss's Law and electric field concepts</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Research</h4>
            <p>Analyze electromagnetic phenomena in scientific research</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> Engineering</h4>
            <p>Design electromagnetic devices and systems</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding electric flux calculations is crucial for electromagnetism and electrical engineering:</p>
        <ul>
          <li>
            <span>Essential for understanding Gauss's Law and its applications</span>
          </li>
          <li>
            <span>Critical for analyzing electric field distributions</span>
          </li>
          <li>
            <span>Important for circuit design and electromagnetic device development</span>
          </li>
          <li>
            <span>Necessary for solving problems in electrostatics and electromagnetism</span>
          </li>
          <li>
            <span>Fundamental for understanding electromagnetic field behavior</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Electric Flux Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Dual Calculation Methods:</strong> E·A·cos(θ) and Gauss's Law (Q/ε₀)</span>
          </li>
          <li>
            <span><strong>Multiple Charge Units:</strong> Support for various charge units from Coulombs to elementary charges</span>
          </li>
          <li>
            <span><strong>Step-by-Step Process:</strong> Detailed calculation steps with formulas</span>
          </li>
          <li>
            <span><strong>Flux Analysis:</strong> Categorizes flux type and field strength</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
          <li>
            <span><strong>Educational Content:</strong> Explains electric flux concepts and applications</span>
          </li>
        </ul>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between electric flux and electric field?",
            answer: "Electric field is a vector quantity that describes the force per unit charge at a point, while electric flux is a scalar quantity that measures the number of field lines passing through a surface. Flux depends on both the field strength and the surface area and orientation."
          },
          {
            question: "Why do we use two different methods to calculate electric flux?",
            answer: "The E·A·cos(θ) method is used when you know the electric field and surface properties, while Gauss's Law (Q/ε₀) is used when you know the enclosed charge. Both methods should give the same result for the same physical situation."
          },
          {
            question: "What does a negative electric flux mean?",
            answer: "Negative electric flux indicates that more field lines are entering the surface than leaving it, or that the angle between the field and surface normal is greater than 90°. This often occurs with negative charges or when the surface normal points opposite to the field direction."
          },
          {
            question: "How does the angle affect electric flux?",
            answer: "The angle between the electric field and surface normal affects flux through the cosine function. Maximum flux occurs at 0° (field perpendicular to surface), zero flux at 90° (field parallel to surface), and negative flux at angles greater than 90°."
          },
          {
            question: "What is the significance of Gauss's Law?",
            answer: "Gauss's Law relates the electric flux through a closed surface to the charge enclosed within that surface. It's one of Maxwell's equations and is fundamental for understanding electric fields, especially for highly symmetric charge distributions."
          },
          {
            question: "Can electric flux be zero?",
            answer: "Yes, electric flux can be zero in several cases: when the electric field is zero, when the surface area is zero, when the field is parallel to the surface (90° angle), or when equal amounts of flux enter and leave a closed surface (net zero flux)."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default ElectricFluxCalculator
