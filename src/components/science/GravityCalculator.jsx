import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import GravityCalculatorJS from '../../assets/js/science/gravity-calculator.js'
import '../../assets/css/science/gravity-calculator.css'
import 'katex/dist/katex.min.css'

const GravityCalculator = () => {
  const [formData, setFormData] = useState({
    mass1: '',
    mass2: '',
    distance: '',
    gravitationalConstant: '6.67430'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const gravityCalc = new GravityCalculatorJS();
      setCalculator(gravityCalc);
    } catch (error) {
      console.error('Error initializing gravity calculator:', error);
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
    name: 'Gravity Calculator',
    description: 'Calculate gravitational force and acceleration between two masses using Newton\'s law of universal gravitation. Perfect for physics students and professionals.',
    icon: 'fas fa-globe',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'Gravity Calculator']
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
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' },
    { name: 'Work Power Calculator', url: '/science/calculators/work-power-calculator', icon: 'fas fa-cogs' },
    { name: 'DBm Watts Calculator', url: '/science/calculators/dbm-watts-calculator', icon: 'fas fa-bolt' },
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' },
    { name: 'Electric Flux Calculator', url: '/science/calculators/electric-flux-calculator', icon: 'fas fa-lightning' },
    { name: 'Atomic Mass Calculator', url: '/science/calculators/average-atomic-mass-calculator', icon: 'fas fa-atom' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'what-is-gravity', title: 'What is Gravity?', level: 1 },
    { id: 'newtons-law', title: 'Newton\'s Law of Universal Gravitation', level: 1 },
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
        const result = calculator.calculateGravity(formData);
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
      mass1: '',
      mass2: '',
      distance: '',
      gravitationalConstant: '6.67430'
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
        title="Gravity Calculator"
        description="Calculate gravitational force and acceleration between two masses"
        onCalculate={handleSubmit}
        error={error}
      >
        <div className="gravity-calculator-form">
          <div className="gravity-input-group">
            <label htmlFor="mass1">Mass 1</label>
            <div className="gravity-input-with-unit">
              <input
                type="number"
                id="mass1"
                name="mass1"
                value={formData.mass1}
                onChange={handleInputChange}
                className="gravity-input-field"
                placeholder="Enter mass 1"
                step="any"
                required
              />
              <select
                id="mass1-unit"
                name="mass1Unit"
                className="gravity-select-field"
                defaultValue="kg"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
                <option value="lb">lb</option>
                <option value="earth">Earth masses</option>
                <option value="sun">Sun masses</option>
              </select>
            </div>
          </div>

          <div className="gravity-input-group">
            <label htmlFor="mass2">Mass 2</label>
            <div className="gravity-input-with-unit">
              <input
                type="number"
                id="mass2"
                name="mass2"
                value={formData.mass2}
                onChange={handleInputChange}
                className="gravity-input-field"
                placeholder="Enter mass 2"
                step="any"
                required
              />
              <select
                id="mass2-unit"
                name="mass2Unit"
                className="gravity-select-field"
                defaultValue="kg"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
                <option value="lb">lb</option>
                <option value="earth">Earth masses</option>
                <option value="sun">Sun masses</option>
              </select>
            </div>
          </div>

          <div className="gravity-input-group">
            <label htmlFor="distance">Distance</label>
            <div className="gravity-input-with-unit">
              <input
                type="number"
                id="distance"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                className="gravity-input-field"
                placeholder="Enter distance"
                step="any"
                required
              />
              <select
                id="distance-unit"
                name="distanceUnit"
                className="gravity-select-field"
                defaultValue="m"
              >
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="mi">miles</option>
                <option value="au">AU</option>
                <option value="ly">light years</option>
              </select>
            </div>
          </div>

          <div className="gravity-input-group">
            <label htmlFor="gravitational-constant">Gravitational Constant (×10⁻¹¹)</label>
            <input
              type="number"
              id="gravitational-constant"
              name="gravitationalConstant"
              value={formData.gravitationalConstant}
              onChange={handleInputChange}
              className="gravity-input-field"
              placeholder="6.67430"
              step="any"
              required
            />
          </div>

          <div className="gravity-input-group">
            <label htmlFor="examples">Common Examples</label>
            <select
              id="examples"
              className="gravity-select-field"
              onChange={(e) => {
                if (calculator && e.target.value) {
                  const exampleData = calculator.getExample(e.target.value);
                  if (exampleData) {
                    setFormData(prev => ({
                      ...prev,
                      ...exampleData
                    }));
                  }
                }
              }}
            >
              <option value="">Select an example...</option>
              <option value="earth-moon">Earth and Moon</option>
              <option value="earth-sun">Earth and Sun</option>
              <option value="sun-jupiter">Sun and Jupiter</option>
              <option value="lab">Laboratory Objects (1kg each at 1m)</option>
              <option value="binary-stars">Binary Star System</option>
            </select>
          </div>

          <div className="gravity-calculator-actions">
            <button type="button" className="gravity-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="gravity-calculator-result">
            <h3>Gravitational Force Results</h3>
            <div className="gravity-result-grid">
              <div className="gravity-result-item">
                <h4>Gravitational Force</h4>
                <p className="gravity-result-value">{result.force}</p>
              </div>
              <div className="gravity-result-item">
                <h4>Acceleration (Mass 1)</h4>
                <p className="gravity-result-value">{result.acceleration1}</p>
              </div>
              <div className="gravity-result-item">
                <h4>Acceleration (Mass 2)</h4>
                <p className="gravity-result-value">{result.acceleration2}</p>
              </div>
            </div>
            
            <div className="gravity-detailed-results">
              <h4>Detailed Values</h4>
              <div className="gravity-detail-grid">
                <div className="gravity-detail-item">
                  <span>Mass 1 (kg):</span>
                  <span>{result.mass1InKg}</span>
                </div>
                <div className="gravity-detail-item">
                  <span>Mass 2 (kg):</span>
                  <span>{result.mass2InKg}</span>
                </div>
                <div className="gravity-detail-item">
                  <span>Distance (m):</span>
                  <span>{result.distanceInMeters}</span>
                </div>
                <div className="gravity-detail-item">
                  <span>Gravitational Constant:</span>
                  <span>{result.gConstant}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CalculatorSection>

      <ContentSection id="introduction" title="Introduction">
        <p>
          The Gravity Calculator is a powerful tool for calculating gravitational forces and accelerations 
          between two masses using Newton's law of universal gravitation. This calculator is essential for 
          physics students, astronomers, and engineers working with gravitational phenomena.
        </p>
        <p>
          Whether you're studying planetary motion, designing space missions, or exploring the fundamental 
          forces of nature, this calculator provides accurate results with support for various units and 
          real-world examples.
        </p>
      </ContentSection>

      <ContentSection id="what-is-gravity" title="What is Gravity?">
        <p>
          Gravity is one of the four fundamental forces of nature and is responsible for the attraction 
          between masses. It's the force that keeps planets in orbit around stars, moons around planets, 
          and objects falling to Earth.
        </p>
        <p>
          Key characteristics of gravity:
        </p>
        <ul>
          <li>Always attractive (never repulsive)</li>
          <li>Acts over infinite distances (though strength decreases with distance)</li>
          <li>Proportional to the product of the masses involved</li>
          <li>Inversely proportional to the square of the distance between masses</li>
          <li>Weakest of the four fundamental forces</li>
        </ul>
      </ContentSection>

      <ContentSection id="newtons-law" title="Newton's Law of Universal Gravitation">
        <p>
          Newton's law of universal gravitation states that every particle attracts every other particle 
          in the universe with a force that is directly proportional to the product of their masses and 
          inversely proportional to the square of the distance between their centers.
        </p>
        <div className="math-formula">
          {`F = G \\frac{m_1 m_2}{r^2}`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>F</strong> = gravitational force (N)</li>
          <li><strong>G</strong> = gravitational constant (6.67430 × 10⁻¹¹ m³/kg⋅s²)</li>
          <li><strong>m₁</strong> = mass of first object (kg)</li>
          <li><strong>m₂</strong> = mass of second object (kg)</li>
          <li><strong>r</strong> = distance between centers (m)</li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use This Calculator">
        <p>Follow these steps to calculate gravitational forces:</p>
        <ol>
          <li><strong>Enter Mass 1:</strong> Input the mass of the first object and select appropriate units</li>
          <li><strong>Enter Mass 2:</strong> Input the mass of the second object and select appropriate units</li>
          <li><strong>Enter Distance:</strong> Input the distance between the centers of the objects</li>
          <li><strong>Set Gravitational Constant:</strong> Use the default value (6.67430) or enter a custom value</li>
          <li><strong>Click Calculate:</strong> View the gravitational force and accelerations</li>
        </ol>
        <p>
          <strong>Tip:</strong> Use the "Common Examples" dropdown to quickly load real-world scenarios 
          like Earth-Moon or Sun-Jupiter gravitational interactions.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Mathematical Formulas">
        <h4>Gravitational Force</h4>
        <div className="math-formula">
          {`F = G \\frac{m_1 m_2}{r^2}`}
        </div>
        
        <h4>Gravitational Acceleration</h4>
        <p>For object 1 due to object 2:</p>
        <div className="math-formula">
          {`a_1 = \\frac{F}{m_1} = G \\frac{m_2}{r^2}`}
        </div>
        
        <p>For object 2 due to object 1:</p>
        <div className="math-formula">
          {`a_2 = \\frac{F}{m_2} = G \\frac{m_1}{r^2}`}
        </div>
        
        <h4>Gravitational Potential Energy</h4>
        <div className="math-formula">
          {`U = -G \\frac{m_1 m_2}{r}`}
        </div>
        
        <h4>Escape Velocity</h4>
        <div className="math-formula">
          {`v_{\\text{escape}} = \\sqrt{\\frac{2GM}{r}}`}
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Real-World Examples">
        <h4>Earth and Moon</h4>
        <ul>
          <li>Mass 1 (Earth): 5.972 × 10²⁴ kg</li>
          <li>Mass 2 (Moon): 7.342 × 10²² kg</li>
          <li>Distance: 384,400 km</li>
          <li>Gravitational Force: ~1.98 × 10²⁰ N</li>
        </ul>
        
        <h4>Earth and Sun</h4>
        <ul>
          <li>Mass 1 (Sun): 1.989 × 10³⁰ kg</li>
          <li>Mass 2 (Earth): 5.972 × 10²⁴ kg</li>
          <li>Distance: 1 AU (149.6 million km)</li>
          <li>Gravitational Force: ~3.54 × 10²² N</li>
        </ul>
        
        <h4>Laboratory Objects</h4>
        <ul>
          <li>Two 1 kg masses at 1 meter apart</li>
          <li>Gravitational Force: ~6.67 × 10⁻¹¹ N</li>
          <li>This demonstrates why gravity is weak at small scales</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-rocket"></i> Space Exploration</h4>
            <p>Satellite orbital calculations, spacecraft trajectory planning, and gravity assist maneuvers</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-star"></i> Astronomy</h4>
            <p>Planetary motion, binary star systems, and galaxy formation dynamics</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Physics teaching, gravitational concepts, and scientific research</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> Engineering</h4>
            <p>Geodetic measurements, precision timing systems, and navigation</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-flask"></i> Research</h4>
            <p>Gravitational wave detection, black hole physics, and cosmology</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-satellite"></i> Technology</h4>
            <p>GPS systems, space station positioning, and satellite communications</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection
        faqs={[
          {
            question: "What is the gravitational constant?",
            answer: "The gravitational constant (G) is a fundamental physical constant that appears in Newton's law of universal gravitation. Its value is approximately 6.67430 × 10⁻¹¹ m³/kg⋅s²."
          },
          {
            question: "Why is gravity so weak compared to other forces?",
            answer: "Gravity is the weakest of the four fundamental forces. This is why we don't notice gravitational attraction between everyday objects, but it becomes significant for massive objects like planets and stars."
          },
          {
            question: "Does gravity work in space?",
            answer: "Yes, gravity works everywhere in space. In fact, gravity is what keeps planets in orbit around the Sun and satellites in orbit around Earth. The sensation of 'weightlessness' in space is due to free-fall, not the absence of gravity."
          },
          {
            question: "How does distance affect gravitational force?",
            answer: "Gravitational force decreases with the square of the distance. If you double the distance between two objects, the gravitational force becomes one-fourth as strong. If you triple the distance, the force becomes one-ninth as strong."
          },
          {
            question: "Can gravity be shielded or blocked?",
            answer: "Unlike electromagnetic forces, gravity cannot be shielded or blocked. All matter and energy contribute to the gravitational field, and there's no known way to create a 'gravity shield'."
          },
          {
            question: "What's the difference between mass and weight?",
            answer: "Mass is the amount of matter in an object (measured in kg), while weight is the gravitational force acting on that mass (measured in N). Weight depends on the local gravitational field strength, while mass is constant."
          }
        ]}
      />

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName="Gravity Calculator" />
      </div>
    </ToolPageLayout>
  );
};

export default GravityCalculator;

