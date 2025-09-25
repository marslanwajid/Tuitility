import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import WorkPowerCalculatorJS from '../../assets/js/science/work-power-calculator.js'
import '../../assets/css/science/work-power-calculator.css'
import 'katex/dist/katex.min.css'

const WorkPowerCalculator = () => {
  const [formData, setFormData] = useState({
    force: '',
    distance: '',
    angle: '',
    time: '',
    forceUnit: 'N',
    distanceUnit: 'm',
    angleUnit: 'deg',
    timeUnit: 's'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const workPowerCalc = new WorkPowerCalculatorJS();
      setCalculator(workPowerCalc);
    } catch (error) {
      console.error('Error initializing work power calculator:', error);
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
    name: 'Work Power Calculator',
    description: 'Calculate work and power using force, distance, angle, and time. Essential for physics students and engineers.',
    icon: 'fas fa-cogs',
    category: 'Science',
    breadcrumb: ['Science', 'Calculators', 'Work Power Calculator']
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
    { name: 'Wave Speed Calculator', url: '/science/calculators/wave-speed-calculator', icon: 'fas fa-wave-square' },
    { name: 'DBm Watts Calculator', url: '/science/calculators/dbm-watts-calculator', icon: 'fas fa-bolt' },
    { name: 'Capacitance Calculator', url: '/science/calculators/capacitance-calculator', icon: 'fas fa-microchip' },
    { name: 'Electric Flux Calculator', url: '/science/calculators/electric-flux-calculator', icon: 'fas fa-lightning' },
    { name: 'Atomic Mass Calculator', url: '/science/calculators/average-atomic-mass-calculator', icon: 'fas fa-atom' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'what-is-work', title: 'What is Work?', level: 1 },
    { id: 'what-is-power', title: 'What is Power?', level: 1 },
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
        const result = calculator.calculateWorkAndPower(formData);
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
      force: '',
      distance: '',
      angle: '',
      time: '',
      forceUnit: 'N',
      distanceUnit: 'm',
      angleUnit: 'deg',
      timeUnit: 's'
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
        title="Work Power Calculator"
        description="Calculate work and power using force, distance, angle, and time"
        onCalculate={handleSubmit}
        error={error}
      >
        <div className="work-power-calculator-form">
          <div className="work-power-input-group">
            <label htmlFor="force">Force</label>
            <div className="work-power-input-with-unit">
              <input
                type="number"
                id="force"
                name="force"
                value={formData.force}
                onChange={handleInputChange}
                className="work-power-input-field"
                placeholder="Enter force"
                step="any"
                required
              />
              <select
                id="force-unit"
                name="forceUnit"
                value={formData.forceUnit}
                onChange={handleInputChange}
                className="work-power-select-field"
              >
                <option value="N">N (Newtons)</option>
                <option value="kN">kN (Kilonewtons)</option>
                <option value="lbf">lbf (Pounds-force)</option>
              </select>
            </div>
          </div>

          <div className="work-power-input-group">
            <label htmlFor="distance">Distance</label>
            <div className="work-power-input-with-unit">
              <input
                type="number"
                id="distance"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                className="work-power-input-field"
                placeholder="Enter distance"
                step="any"
                required
              />
              <select
                id="distance-unit"
                name="distanceUnit"
                value={formData.distanceUnit}
                onChange={handleInputChange}
                className="work-power-select-field"
              >
                <option value="m">m (Meters)</option>
                <option value="km">km (Kilometers)</option>
                <option value="cm">cm (Centimeters)</option>
                <option value="ft">ft (Feet)</option>
              </select>
            </div>
          </div>

          <div className="work-power-input-group">
            <label htmlFor="angle">Angle</label>
            <div className="work-power-input-with-unit">
              <input
                type="number"
                id="angle"
                name="angle"
                value={formData.angle}
                onChange={handleInputChange}
                className="work-power-input-field"
                placeholder="Enter angle"
                step="any"
                required
              />
              <select
                id="angle-unit"
                name="angleUnit"
                value={formData.angleUnit}
                onChange={handleInputChange}
                className="work-power-select-field"
              >
                <option value="deg">° (Degrees)</option>
                <option value="rad">rad (Radians)</option>
              </select>
            </div>
          </div>

          <div className="work-power-input-group">
            <label htmlFor="time">Time</label>
            <div className="work-power-input-with-unit">
              <input
                type="number"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="work-power-input-field"
                placeholder="Enter time"
                step="any"
                required
              />
              <select
                id="time-unit"
                name="timeUnit"
                value={formData.timeUnit}
                onChange={handleInputChange}
                className="work-power-select-field"
              >
                <option value="s">s (Seconds)</option>
                <option value="min">min (Minutes)</option>
                <option value="h">h (Hours)</option>
              </select>
            </div>
          </div>

          <div className="work-power-calculator-actions">
            <button type="button" className="work-power-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {result && (
          <div className="work-power-calculator-result">
            <h3>Work and Power Results</h3>
            <div className="work-power-result-grid">
              <div className="work-power-result-item">
                <h4>Work</h4>
                <p className="work-power-result-value">{result.work}</p>
              </div>
              <div className="work-power-result-item">
                <h4>Power</h4>
                <p className="work-power-result-value">{result.power}</p>
              </div>
            </div>
            
            <div className="work-power-detailed-results">
              <h4>Detailed Values</h4>
              <div className="work-power-detail-grid">
                <div className="work-power-detail-item">
                  <span>Force (N):</span>
                  <span>{result.forceInNewtons}</span>
                </div>
                <div className="work-power-detail-item">
                  <span>Distance (m):</span>
                  <span>{result.distanceInMeters}</span>
                </div>
                <div className="work-power-detail-item">
                  <span>Angle:</span>
                  <span>{result.angleDisplay}</span>
                </div>
                <div className="work-power-detail-item">
                  <span>Time (s):</span>
                  <span>{result.timeInSeconds}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CalculatorSection>

      <ContentSection id="introduction" title="Introduction">
        <p>
          The Work Power Calculator is a fundamental physics tool for calculating work and power 
          based on force, distance, angle, and time. This calculator is essential for physics 
          students, engineers, and anyone working with mechanical systems.
        </p>
        <p>
          Understanding work and power is crucial for analyzing energy transfer, mechanical 
          efficiency, and system performance in various applications from simple machines to 
          complex engineering systems.
        </p>
      </ContentSection>

      <ContentSection id="what-is-work" title="What is Work?">
        <p>
          Work in physics is defined as the transfer of energy that occurs when a force is 
          applied to an object and the object moves in the direction of the force. Work is 
          only done when there is both a force and displacement.
        </p>
        <p>
          Key characteristics of work:
        </p>
        <ul>
          <li>Work is a scalar quantity (has magnitude but no direction)</li>
          <li>Work is measured in Joules (J) in the SI system</li>
          <li>Work depends on the angle between force and displacement</li>
          <li>No work is done if there's no displacement or if force is perpendicular to displacement</li>
          <li>Work can be positive (energy added) or negative (energy removed)</li>
        </ul>
      </ContentSection>

      <ContentSection id="what-is-power" title="What is Power?">
        <p>
          Power is the rate at which work is done or energy is transferred. It measures how 
          quickly work is performed or energy is converted from one form to another.
        </p>
        <p>
          Key characteristics of power:
        </p>
        <ul>
          <li>Power is measured in Watts (W) in the SI system</li>
          <li>Power = Work ÷ Time</li>
          <li>Higher power means work is done faster</li>
          <li>Power is important for understanding efficiency and performance</li>
          <li>Power can be calculated for both mechanical and electrical systems</li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use This Calculator">
        <p>Follow these steps to calculate work and power:</p>
        <ol>
          <li><strong>Enter Force:</strong> Input the magnitude of the force applied and select appropriate units</li>
          <li><strong>Enter Distance:</strong> Input the distance over which the force is applied</li>
          <li><strong>Enter Angle:</strong> Input the angle between the force and displacement vectors</li>
          <li><strong>Enter Time:</strong> Input the time taken to perform the work</li>
          <li><strong>Click Calculate:</strong> View the work and power results</li>
        </ol>
        <p>
          <strong>Note:</strong> The angle is measured between the force vector and the displacement 
          vector. Use 0° for forces in the same direction as displacement, and 90° for perpendicular forces.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Mathematical Formulas">
        <h4>Work Formula</h4>
        <div className="math-formula">
          {`W = F \\cdot d \\cdot \\cos(\\theta)`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>W</strong> = work (J)</li>
          <li><strong>F</strong> = force (N)</li>
          <li><strong>d</strong> = distance (m)</li>
          <li><strong>θ</strong> = angle between force and displacement</li>
        </ul>
        
        <h4>Power Formula</h4>
        <div className="math-formula">
          {`P = \\frac{W}{t}`}
        </div>
        <p>Where:</p>
        <ul>
          <li><strong>P</strong> = power (W)</li>
          <li><strong>W</strong> = work (J)</li>
          <li><strong>t</strong> = time (s)</li>
        </ul>
        
        <h4>Alternative Power Formula</h4>
        <div className="math-formula">
          {`P = F \\cdot v \\cdot \\cos(\\theta)`}
        </div>
        <p>Where v is velocity (m/s)</p>
      </ContentSection>

      <ContentSection id="examples" title="Real-World Examples">
        <h4>Lifting a Box</h4>
        <ul>
          <li>Force: 50 N (upward)</li>
          <li>Distance: 2 m (upward)</li>
          <li>Angle: 0° (force and displacement in same direction)</li>
          <li>Time: 5 seconds</li>
          <li>Work: 100 J, Power: 20 W</li>
        </ul>
        
        <h4>Pushing a Cart</h4>
        <ul>
          <li>Force: 30 N (horizontal)</li>
          <li>Distance: 10 m (horizontal)</li>
          <li>Angle: 0° (force and displacement in same direction)</li>
          <li>Time: 8 seconds</li>
          <li>Work: 300 J, Power: 37.5 W</li>
        </ul>
        
        <h4>Pulling at an Angle</h4>
        <ul>
          <li>Force: 40 N (at 30° angle)</li>
          <li>Distance: 5 m (horizontal)</li>
          <li>Angle: 30° (between force and displacement)</li>
          <li>Time: 3 seconds</li>
          <li>Work: 173.2 J, Power: 57.7 W</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-cogs"></i> Mechanical Engineering</h4>
            <p>Machine design, efficiency analysis, and mechanical system optimization</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-car"></i> Automotive</h4>
            <p>Engine performance, fuel efficiency, and vehicle dynamics calculations</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Physics teaching, laboratory experiments, and scientific demonstrations</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-industry"></i> Manufacturing</h4>
            <p>Production line efficiency, equipment sizing, and energy consumption analysis</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Sports Science</h4>
            <p>Athletic performance analysis, training optimization, and biomechanics</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-bolt"></i> Energy Systems</h4>
            <p>Power generation, energy conversion, and renewable energy analysis</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection
        faqs={[
          {
            question: "What's the difference between work and power?",
            answer: "Work is the amount of energy transferred when a force moves an object, measured in Joules. Power is the rate at which work is done, measured in Watts (Joules per second)."
          },
          {
            question: "Can work be negative?",
            answer: "Yes, work can be negative when the force opposes the direction of motion. This represents energy being removed from the system, such as friction slowing down an object."
          },
          {
            question: "What happens when the angle is 90 degrees?",
            answer: "When the angle between force and displacement is 90°, cos(90°) = 0, so no work is done. The force is perpendicular to the motion and doesn't contribute to work."
          },
          {
            question: "How does time affect power?",
            answer: "Power is inversely related to time for the same amount of work. If you do the same work in less time, you have more power. If you take longer, you have less power."
          },
          {
            question: "What units are used for work and power?",
            answer: "Work is measured in Joules (J) in the SI system. Power is measured in Watts (W), where 1 W = 1 J/s. Other common units include horsepower (hp) for power."
          },
          {
            question: "Why is the angle important in work calculations?",
            answer: "The angle determines how much of the force contributes to work. Only the component of force in the direction of motion does work, which is why we use cos(θ) in the formula."
          }
        ]}
      />

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName="Work Power Calculator" />
      </div>
    </ToolPageLayout>
  );
};

export default WorkPowerCalculator;
