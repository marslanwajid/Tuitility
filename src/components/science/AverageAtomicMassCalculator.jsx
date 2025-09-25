import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import AverageAtomicMassCalculatorJS from '../../assets/js/science/average-atomic-mass-calculator.js'
import '../../assets/css/science/average-atomic-mass-calculator.css'
import 'katex/dist/katex.min.css'

const AverageAtomicMassCalculator = () => {
  const [formData, setFormData] = useState({
    isotopeCount: 2,
    isotopes: [
      { mass: '', abundance: '', abundanceUnit: 'percent' },
      { mass: '', abundance: '', abundanceUnit: 'percent' }
    ]
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const atomicMassCalc = new AverageAtomicMassCalculatorJS();
      setCalculator(atomicMassCalc);
    } catch (error) {
      console.error('Error initializing average atomic mass calculator:', error);
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
    name: 'Average Atomic Mass Calculator',
    description: 'Calculate the average atomic mass of an element from its isotopes. Essential for chemistry calculations, isotopic analysis, and understanding atomic structure.',
    icon: 'fas fa-atom',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'Average Atomic Mass Calculator']
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
    { name: 'Electric Flux Calculator', url: '/science/calculators/electric-flux-calculator', icon: 'fas fa-lightning' },
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' },
    { name: 'DBm Watts Calculator', url: '/science/calculators/dbm-watts-calculator', icon: 'fas fa-bolt' },
    { name: 'DBm to Milliwatts Calculator', url: '/science/calculators/dbm-milliwatts-calculator', icon: 'fas fa-broadcast-tower' },
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-atomic-mass', title: 'What is Average Atomic Mass?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Formulas & Calculations' },
    { id: 'examples', title: 'Examples' },
    { id: 'applications', title: 'Applications' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleIsotopeCountChange = (count) => {
    const newIsotopes = [];
    for (let i = 0; i < count; i++) {
      newIsotopes.push({
        mass: formData.isotopes[i]?.mass || '',
        abundance: formData.isotopes[i]?.abundance || '',
        abundanceUnit: formData.isotopes[i]?.abundanceUnit || 'percent'
      });
    }
    setFormData(prev => ({
      ...prev,
      isotopeCount: count,
      isotopes: newIsotopes
    }));
    setError('');
  };

  const handleIsotopeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      isotopes: prev.isotopes.map((isotope, i) => 
        i === index ? { ...isotope, [field]: value } : isotope
      )
    }));
    setError('');
  };

  const validateInputs = () => {
    if (!calculator) return false;
    
    try {
      const errors = calculator.validateInputs(formData.isotopes);
      
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

  const calculateAverageAtomicMass = () => {
    if (!validateInputs()) return;

    try {
      // Use calculation from JS file
      const result = calculator.calculateAverageAtomicMass(formData.isotopes);

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
      isotopeCount: 2,
      isotopes: [
        { mass: '', abundance: '', abundanceUnit: 'percent' },
        { mass: '', abundance: '', abundanceUnit: 'percent' }
      ]
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
        title="Average Atomic Mass Calculator"
        onCalculate={calculateAverageAtomicMass}
        calculateButtonText="Calculate Average Atomic Mass"
        error={error}
        result={null}
      >
        <div className="atomic-mass-calculator-form">
          <div className="atomic-mass-input-group">
            <label htmlFor="atomic-mass-isotope-count" className="atomic-mass-input-label">
              Number of Isotopes:
            </label>
            <select
              id="atomic-mass-isotope-count"
              className="atomic-mass-select-field"
              value={formData.isotopeCount}
              onChange={(e) => handleIsotopeCountChange(parseInt(e.target.value))}
            >
              <option value={2}>2 Isotopes</option>
              <option value={3}>3 Isotopes</option>
              <option value={4}>4 Isotopes</option>
              <option value={5}>5 Isotopes</option>
              <option value={6}>6 Isotopes</option>
            </select>
            <small className="atomic-mass-input-help">
              Select the number of isotopes for the element
            </small>
          </div>

          <div className="atomic-mass-isotope-inputs">
            {formData.isotopes.map((isotope, index) => (
              <div key={index} className="atomic-mass-isotope-group">
                <h4 className="atomic-mass-isotope-title">Isotope {index + 1}</h4>
                <div className="atomic-mass-input-row">
                  <div className="atomic-mass-input-group">
                    <label htmlFor={`atomic-mass-mass-${index}`} className="atomic-mass-input-label">
                      Mass (u):
                    </label>
                    <input
                      type="number"
                      id={`atomic-mass-mass-${index}`}
                      className="atomic-mass-input-field"
                      value={isotope.mass}
                      onChange={(e) => handleIsotopeChange(index, 'mass', e.target.value)}
                      placeholder="e.g., 35.453"
                      min="0"
                      step="0.0001"
                    />
                    <small className="atomic-mass-input-help">
                      Atomic mass in unified atomic mass units (u)
                    </small>
                  </div>

                  <div className="atomic-mass-input-group">
                    <label htmlFor={`atomic-mass-abundance-${index}`} className="atomic-mass-input-label">
                      Abundance:
                    </label>
                    <input
                      type="number"
                      id={`atomic-mass-abundance-${index}`}
                      className="atomic-mass-input-field"
                      value={isotope.abundance}
                      onChange={(e) => handleIsotopeChange(index, 'abundance', e.target.value)}
                      placeholder="e.g., 75.77"
                      min="0"
                      step="any"
                    />
                    <small className="atomic-mass-input-help">
                      Natural abundance of this isotope
                    </small>
                  </div>

                  <div className="atomic-mass-input-group">
                    <label htmlFor={`atomic-mass-abundance-unit-${index}`} className="atomic-mass-input-label">
                      Unit:
                    </label>
                    <select
                      id={`atomic-mass-abundance-unit-${index}`}
                      className="atomic-mass-select-field"
                      value={isotope.abundanceUnit}
                      onChange={(e) => handleIsotopeChange(index, 'abundanceUnit', e.target.value)}
                    >
                      <option value="percent">%</option>
                      <option value="decimal">Decimal</option>
                    </select>
                    <small className="atomic-mass-input-help">
                      Unit for abundance value
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="atomic-mass-calculator-actions">
            <button type="button" className="atomic-mass-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="atomic-mass-calculator-result">
            <h3 className="atomic-mass-result-title">Average Atomic Mass Calculation Results</h3>
            <div className="atomic-mass-result-content">
              <div className="atomic-mass-result-main">
                <div className="atomic-mass-result-item">
                  <strong>Average Atomic Mass:</strong>
                  <span className="atomic-mass-result-value atomic-mass-result-final">
                    {formatNumber(result.averageAtomicMass, 4)} amu
                  </span>
                </div>
                <div className="atomic-mass-result-item">
                  <strong>Number of Isotopes:</strong>
                  <span className="atomic-mass-result-value">
                    {result.isotopeCount}
                  </span>
                </div>
                <div className="atomic-mass-result-item">
                  <strong>Total Abundance:</strong>
                  <span className="atomic-mass-result-value">
                    {formatNumber(result.totalAbundance, 2)}%
                  </span>
                </div>
              </div>

              <div className="atomic-mass-result-breakdown">
                <h4>Calculation Process</h4>
                <div className="atomic-mass-breakdown-details">
                  {result.calculationSteps.map((step, index) => (
                    <div key={index} className="atomic-mass-breakdown-item">
                      <span>{step.title}:</span>
                      <span dangerouslySetInnerHTML={{ __html: step.content }}></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="atomic-mass-result-summary">
                <h4>Isotope Analysis</h4>
                <div className="atomic-mass-summary-details">
                  <div className="atomic-mass-summary-item">
                    <span>Most Abundant Isotope:</span>
                    <span>{result.mostAbundantIsotope}</span>
                  </div>
                  <div className="atomic-mass-summary-item">
                    <span>Mass Range:</span>
                    <span>{result.massRange}</span>
                  </div>
                  <div className="atomic-mass-summary-item">
                    <span>Abundance Distribution:</span>
                    <span>{result.abundanceDistribution}</span>
                  </div>
                  <div className="atomic-mass-summary-item">
                    <span>Element Classification:</span>
                    <span>{result.elementClassification}</span>
                  </div>
                </div>
              </div>

              <div className="atomic-mass-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: The average atomic mass is calculated as the weighted average of all naturally occurring isotopes, where the weights are the relative abundances.</span>
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
          The Average Atomic Mass Calculator is an essential tool for chemistry students, researchers, 
          and professionals working with isotopic analysis. It calculates the weighted average atomic 
          mass of an element based on the masses and natural abundances of its isotopes.
        </p>
        <p>
          This calculator is perfect for understanding atomic structure, performing isotopic calculations, 
          analyzing mass spectrometry data, and solving chemistry problems involving atomic masses.
        </p>
      </ContentSection>

      <ContentSection id="what-is-atomic-mass" title="What is Average Atomic Mass?">
        <p>
          Average atomic mass is the weighted average of the atomic masses of all naturally occurring 
          isotopes of an element. It takes into account both the mass of each isotope and its relative 
          abundance in nature. This value is what appears on the periodic table.
        </p>
        <ul>
          <li>
            <span><strong>Definition:</strong> The weighted average of atomic masses of all isotopes</span>
          </li>
          <li>
            <span><strong>Unit:</strong> Unified atomic mass units (u) or atomic mass units (amu)</span>
          </li>
          <li>
            <span><strong>Formula:</strong> Average Mass = Σ(mass × abundance) / 100</span>
          </li>
          <li>
            <span><strong>Significance:</strong> Represents the mass of an "average" atom of the element</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Average Atomic Mass Calculator">
        <p>Using the average atomic mass calculator requires isotopic data:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Select Isotope Count:</strong> Choose the number of isotopes (2-6).</span>
          </li>
          <li>
            <span><strong>Enter Mass Values:</strong> Input the atomic mass of each isotope in unified atomic mass units (u).</span>
          </li>
          <li>
            <span><strong>Enter Abundance Values:</strong> Input the natural abundance of each isotope.</span>
          </li>
          <li>
            <span><strong>Select Abundance Unit:</strong> Choose between percentage (%) or decimal format.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Average Atomic Mass" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Make sure the total abundance adds up to 100% (or 1.0 in decimal form) 
          for accurate results. The calculator will show you the total abundance for verification.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Calculations">
        <div className="formula-section">
          <h3>Average Atomic Mass Formula</h3>
          <div className="math-formula">
            {'\\text{Average Mass} = \\frac{\\sum_{i=1}^{n} (m_i \\times f_i)}{100}'}
          </div>
          <p>Where mᵢ = mass of isotope i, fᵢ = abundance of isotope i (%), n = number of isotopes.</p>
        </div>

        <div className="formula-section">
          <h3>Weighted Mass Calculation</h3>
          <div className="math-formula">
            {'\\text{Weighted Mass}_i = m_i \\times f_i'}
          </div>
          <p>This calculates the contribution of each isotope to the average mass.</p>
        </div>

        <div className="formula-section">
          <h3>Abundance Verification</h3>
          <div className="math-formula">
            {'\\sum_{i=1}^{n} f_i = 100\\%'}
          </div>
          <p>The sum of all isotope abundances should equal 100% for natural elements.</p>
        </div>

        <div className="formula-section">
          <h3>Mass Defect</h3>
          <div className="math-formula">
            {'\\text{Mass Defect} = \\text{Theoretical Mass} - \\text{Actual Mass}'}
          </div>
          <p>Mass defect accounts for the binding energy in atomic nuclei.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Chlorine (Cl)</h3>
          <div className="example-solution">
            <p><strong>Isotope 1:</strong> ³⁵Cl, Mass = 34.969 u, Abundance = 75.77%</p>
            <p><strong>Isotope 2:</strong> ³⁷Cl, Mass = 36.966 u, Abundance = 24.23%</p>
            <p><strong>Calculation:</strong> (34.969 × 75.77) + (36.966 × 24.23) = 2649.0 + 895.7 = 3544.7</p>
            <p><strong>Average Mass:</strong> 3544.7 / 100 = 35.447 u</p>
            <p><strong>Result:</strong> 35.45 amu (matches periodic table)</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Carbon (C)</h3>
          <div className="example-solution">
            <p><strong>Isotope 1:</strong> ¹²C, Mass = 12.000 u, Abundance = 98.89%</p>
            <p><strong>Isotope 2:</strong> ¹³C, Mass = 13.003 u, Abundance = 1.11%</p>
            <p><strong>Calculation:</strong> (12.000 × 98.89) + (13.003 × 1.11) = 1186.68 + 14.43 = 1201.11</p>
            <p><strong>Average Mass:</strong> 1201.11 / 100 = 12.011 u</p>
            <p><strong>Result:</strong> 12.01 amu (matches periodic table)</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Copper (Cu)</h3>
          <div className="example-solution">
            <p><strong>Isotope 1:</strong> ⁶³Cu, Mass = 62.930 u, Abundance = 69.15%</p>
            <p><strong>Isotope 2:</strong> ⁶⁵Cu, Mass = 64.928 u, Abundance = 30.85%</p>
            <p><strong>Calculation:</strong> (62.930 × 69.15) + (64.928 × 30.85) = 4351.6 + 2003.0 = 6354.6</p>
            <p><strong>Average Mass:</strong> 6354.6 / 100 = 63.546 u</p>
            <p><strong>Result:</strong> 63.55 amu (matches periodic table)</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Chemistry Education</h4>
            <p>Learn about isotopes and atomic structure in chemistry classes</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-microscope"></i> Mass Spectrometry</h4>
            <p>Analyze isotopic composition from mass spectrometry data</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-atom"></i> Nuclear Chemistry</h4>
            <p>Study nuclear reactions and isotopic effects</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Research</h4>
            <p>Calculate theoretical atomic masses for research applications</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Problem Solving</h4>
            <p>Solve chemistry problems involving atomic masses</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Data Analysis</h4>
            <p>Analyze isotopic data from various analytical techniques</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding average atomic mass calculations is crucial for chemistry and physics:</p>
        <ul>
          <li>
            <span>Essential for understanding atomic structure and isotopes</span>
          </li>
          <li>
            <span>Critical for mass spectrometry and analytical chemistry</span>
          </li>
          <li>
            <span>Important for nuclear chemistry and radioactive decay studies</span>
          </li>
          <li>
            <span>Necessary for solving stoichiometry problems in chemistry</span>
          </li>
          <li>
            <span>Fundamental for understanding the periodic table</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Average Atomic Mass Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Multiple Isotopes:</strong> Support for 2-6 isotopes per element</span>
          </li>
          <li>
            <span><strong>Flexible Units:</strong> Support for both percentage and decimal abundance formats</span>
          </li>
          <li>
            <span><strong>Step-by-Step Process:</strong> Detailed calculation steps with formulas</span>
          </li>
          <li>
            <span><strong>Isotope Analysis:</strong> Identifies most abundant isotope and mass range</span>
          </li>
          <li>
            <span><strong>Abundance Verification:</strong> Checks that abundances sum to 100%</span>
          </li>
          <li>
            <span><strong>Educational Content:</strong> Explains atomic mass concepts and applications</span>
          </li>
        </ul>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between atomic mass and atomic weight?",
            answer: "Atomic mass refers to the mass of a specific isotope, while atomic weight (or average atomic mass) is the weighted average of all naturally occurring isotopes of an element. The terms are often used interchangeably, but atomic weight is more precise."
          },
          {
            question: "Why do abundances need to sum to 100%?",
            answer: "Natural abundances represent the percentage of each isotope found in nature. Since these are percentages of the total, they must sum to 100%. If they don't, it indicates either missing isotopes or incorrect data."
          },
          {
            question: "What are unified atomic mass units (u)?",
            answer: "Unified atomic mass units (u) are the standard units for atomic mass, defined as 1/12th the mass of a carbon-12 atom. 1 u = 1.66054 × 10⁻²⁷ kg. This unit is also called atomic mass unit (amu)."
          },
          {
            question: "How accurate are average atomic mass calculations?",
            answer: "The accuracy depends on the precision of the input data. Modern mass spectrometry can determine isotopic masses to 6-8 decimal places, and abundances to 3-4 decimal places, resulting in very accurate average atomic masses."
          },
          {
            question: "Can I use this calculator for radioactive isotopes?",
            answer: "Yes, but remember that radioactive isotopes have half-lives and may not be present in significant amounts in natural samples. The calculator works for any isotopic data, but natural abundances typically refer to stable isotopes."
          },
          {
            question: "What if my abundances don't sum to exactly 100%?",
            answer: "Small deviations (within 0.1%) are acceptable due to measurement uncertainties. Larger deviations may indicate missing isotopes or data errors. The calculator will show the total abundance for verification."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default AverageAtomicMassCalculator
