import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/bmi-calculator.css'
import BMICalculatorLogic from '../../assets/js/health/bmi-calculator.js'

const BMICalculator = () => {
  const [formData, setFormData] = useState({
    // Basic Calculator
    height: '',
    heightInches: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    // Advanced Calculator
    age: '',
    gender: 'male',
    activityLevel: 'sedentary',
    bodyFat: '',
    waist: '',
    waistUnit: 'cm',
    hip: '',
    hipUnit: 'cm',
    neck: '',
    neckUnit: 'cm',
    bodyFrame: 'medium',
    ethnicity: 'caucasian',
    exerciseType: 'none'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Tool data
  const toolData = {
    name: 'BMI Calculator',
    description: 'Calculate your Body Mass Index (BMI) and get comprehensive health insights including weight category, healthy weight range, and advanced body composition analysis.',
    icon: 'fas fa-weight',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'BMI Calculator']
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
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Water Intake Calculator', url: '/health/calculators/water-intake-calculator', icon: 'fas fa-tint' },
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-bmi', title: 'What is BMI?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateInputs = (isAdvanced = false) => {
    const { height, weight, age, waist, hip, neck } = formData;
    
    if (!height || parseFloat(height) <= 0) {
      setError('Please enter a valid height.');
      return false;
    }

    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight.');
      return false;
    }

    if (isAdvanced) {
      if (!age || parseInt(age) <= 0 || parseInt(age) > 120) {
        setError('Please enter a valid age between 1 and 120.');
        return false;
      }

      if (!waist || parseFloat(waist) <= 0) {
        setError('Please enter a valid waist measurement.');
        return false;
      }

      if (!hip || parseFloat(hip) <= 0) {
        setError('Please enter a valid hip measurement.');
        return false;
      }

      if (!neck || parseFloat(neck) <= 0) {
        setError('Please enter a valid neck measurement.');
        return false;
      }
    }

    return true;
  };

  const calculateBMI = (isAdvanced = false) => {
    if (!validateInputs(isAdvanced)) return;

    try {
      const calculator = new BMICalculatorLogic();
      const result = calculator.calculate(formData, isAdvanced);
      setResult(result);
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = (isAdvanced = false) => {
    if (isAdvanced) {
      setFormData(prev => ({
        ...prev,
        age: '',
        gender: 'male',
        activityLevel: 'sedentary',
        bodyFat: '',
        waist: '',
        waistUnit: 'cm',
        hip: '',
        hipUnit: 'cm',
        neck: '',
        neckUnit: 'cm',
        bodyFrame: 'medium',
        ethnicity: 'caucasian',
        exerciseType: 'none'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        height: '',
        heightInches: '',
        weight: ''
      }));
    }
    setResult(null);
    setError('');
  };

  // Format weight
  const formatWeight = (weight) => {
    return `${weight.toFixed(1)} kg`;
  };

  // Format BMI
  const formatBMI = (bmi) => {
    return bmi.toFixed(1);
  };

  // KaTeX rendering effect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.katex) {
      // Render all math formulas
      const mathElements = document.querySelectorAll('.math-formula');
      mathElements.forEach(element => {
        if (element && !element.dataset.rendered) {
          try {
            window.katex.render(element.textContent, element, {
              throwOnError: false,
              displayMode: true
            });
            element.dataset.rendered = 'true';
          } catch (error) {
            console.error('KaTeX rendering error:', error);
          }
        }
      });
    }
  }, [result]); // Re-render when results change

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="BMI Calculator"
        onCalculate={() => calculateBMI(activeTab === 'advanced')}
        calculateButtonText={activeTab === 'advanced' ? "Calculate Advanced BMI" : "Calculate BMI"}
        error={error}
        result={null}
      >
        {/* Tab Navigation */}
        <div className="bmi-tab-navigation">
          <button 
            className={`bmi-tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <i className="fas fa-calculator"></i>
            Basic Calculator
          </button>
          <button 
            className={`bmi-tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <i className="fas fa-chart-line"></i>
            Advanced Calculator
          </button>
        </div>

        {/* Basic Calculator */}
        {activeTab === 'basic' && (
          <div className="bmi-calculator-form" id="bmi-basic-calculator">
            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-height-unit" className="bmi-input-label">
                  Height Unit:
                </label>
                <select
                  id="bmi-height-unit"
                  className="bmi-select-field"
                  value={formData.heightUnit}
                  onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft">Feet & Inches</option>
                </select>
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-weight-unit" className="bmi-input-label">
                  Weight Unit:
                </label>
                <select
                  id="bmi-weight-unit"
                  className="bmi-select-field"
                  value={formData.weightUnit}
                  onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>

            <div className="bmi-input-row">
              {formData.heightUnit === 'cm' ? (
                <div className="bmi-input-group">
                  <label htmlFor="bmi-height-cm" className="bmi-input-label">
                    Height (cm):
                  </label>
                  <input
                    type="number"
                    id="bmi-height-cm"
                    className="bmi-input-field"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 175"
                    min="50"
                    max="300"
                    step="0.1"
                  />
                  <small className="bmi-input-help">
                    Enter your height in centimeters
                  </small>
                </div>
              ) : (
                <>
                  <div className="bmi-input-group">
                    <label htmlFor="bmi-height-ft" className="bmi-input-label">
                      Height (feet):
                    </label>
                    <input
                      type="number"
                      id="bmi-height-ft"
                      className="bmi-input-field"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="e.g., 5"
                      min="1"
                      max="10"
                      step="1"
                    />
                  </div>
                  <div className="bmi-input-group">
                    <label htmlFor="bmi-height-in" className="bmi-input-label">
                      Height (inches):
                    </label>
                    <input
                      type="number"
                      id="bmi-height-in"
                      className="bmi-input-field"
                      value={formData.heightInches}
                      onChange={(e) => handleInputChange('heightInches', e.target.value)}
                      placeholder="e.g., 9"
                      min="0"
                      max="11"
                      step="0.1"
                    />
                  </div>
                </>
              )}

              <div className="bmi-input-group">
                <label htmlFor="bmi-weight" className="bmi-input-label">
                  Weight ({formData.weightUnit}):
                </label>
                <input
                  type="number"
                  id="bmi-weight"
                  className="bmi-input-field"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder={formData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                  min="20"
                  max="500"
                  step="0.1"
                />
                <small className="bmi-input-help">
                  Enter your weight in {formData.weightUnit}
                </small>
              </div>
            </div>

            <div className="bmi-calculator-actions">
              <button type="button" className="bmi-btn-reset" onClick={() => handleReset(false)}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Advanced Calculator */}
        {activeTab === 'advanced' && (
          <div className="bmi-calculator-form" id="bmi-advanced-calculator">
            {/* Basic Info */}
            <div className="bmi-section-title">Basic Information</div>
            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-height-unit-adv" className="bmi-input-label">
                  Height Unit:
                </label>
                <select
                  id="bmi-height-unit-adv"
                  className="bmi-select-field"
                  value={formData.heightUnit}
                  onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft">Feet & Inches</option>
                </select>
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-weight-unit-adv" className="bmi-input-label">
                  Weight Unit:
                </label>
                <select
                  id="bmi-weight-unit-adv"
                  className="bmi-select-field"
                  value={formData.weightUnit}
                  onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>

            <div className="bmi-input-row">
              {formData.heightUnit === 'cm' ? (
                <div className="bmi-input-group">
                  <label htmlFor="bmi-height-cm-adv" className="bmi-input-label">
                    Height (cm):
                  </label>
                  <input
                    type="number"
                    id="bmi-height-cm-adv"
                    className="bmi-input-field"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 175"
                    min="50"
                    max="300"
                    step="0.1"
                  />
                </div>
              ) : (
                <>
                  <div className="bmi-input-group">
                    <label htmlFor="bmi-height-ft-adv" className="bmi-input-label">
                      Height (feet):
                    </label>
                    <input
                      type="number"
                      id="bmi-height-ft-adv"
                      className="bmi-input-field"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="e.g., 5"
                      min="1"
                      max="10"
                      step="1"
                    />
                  </div>
                  <div className="bmi-input-group">
                    <label htmlFor="bmi-height-in-adv" className="bmi-input-label">
                      Height (inches):
                    </label>
                    <input
                      type="number"
                      id="bmi-height-in-adv"
                      className="bmi-input-field"
                      value={formData.heightInches}
                      onChange={(e) => handleInputChange('heightInches', e.target.value)}
                      placeholder="e.g., 9"
                      min="0"
                      max="11"
                      step="0.1"
                    />
                  </div>
                </>
              )}

              <div className="bmi-input-group">
                <label htmlFor="bmi-weight-adv" className="bmi-input-label">
                  Weight ({formData.weightUnit}):
                </label>
                <input
                  type="number"
                  id="bmi-weight-adv"
                  className="bmi-input-field"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder={formData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                  min="20"
                  max="500"
                  step="0.1"
                />
              </div>
            </div>

            {/* Personal Info */}
            <div className="bmi-section-title">Personal Information</div>
            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-age" className="bmi-input-label">
                  Age (years):
                </label>
                <input
                  type="number"
                  id="bmi-age"
                  className="bmi-input-field"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="120"
                  step="1"
                />
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-gender" className="bmi-input-label">
                  Gender:
                </label>
                <select
                  id="bmi-gender"
                  className="bmi-select-field"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-activity-level" className="bmi-input-label">
                  Activity Level:
                </label>
                <select
                  id="bmi-activity-level"
                  className="bmi-select-field"
                  value={formData.activityLevel}
                  onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="very">Very Active</option>
                  <option value="extra">Extra Active</option>
                </select>
              </div>
            </div>

            {/* Body Measurements */}
            <div className="bmi-section-title">Body Measurements</div>
            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-body-fat" className="bmi-input-label">
                  Body Fat % (optional):
                </label>
                <input
                  type="number"
                  id="bmi-body-fat"
                  className="bmi-input-field"
                  value={formData.bodyFat}
                  onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                  placeholder="e.g., 15"
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-waist" className="bmi-input-label">
                  Waist ({formData.waistUnit}):
                </label>
                <input
                  type="number"
                  id="bmi-waist"
                  className="bmi-input-field"
                  value={formData.waist}
                  onChange={(e) => handleInputChange('waist', e.target.value)}
                  placeholder="e.g., 80"
                  min="30"
                  max="200"
                  step="0.1"
                />
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-waist-unit" className="bmi-input-label">
                  Waist Unit:
                </label>
                <select
                  id="bmi-waist-unit"
                  className="bmi-select-field"
                  value={formData.waistUnit}
                  onChange={(e) => handleInputChange('waistUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>
            </div>

            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-hip" className="bmi-input-label">
                  Hip ({formData.hipUnit}):
                </label>
                <input
                  type="number"
                  id="bmi-hip"
                  className="bmi-input-field"
                  value={formData.hip}
                  onChange={(e) => handleInputChange('hip', e.target.value)}
                  placeholder="e.g., 95"
                  min="30"
                  max="200"
                  step="0.1"
                />
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-hip-unit" className="bmi-input-label">
                  Hip Unit:
                </label>
                <select
                  id="bmi-hip-unit"
                  className="bmi-select-field"
                  value={formData.hipUnit}
                  onChange={(e) => handleInputChange('hipUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-neck" className="bmi-input-label">
                  Neck ({formData.neckUnit}):
                </label>
                <input
                  type="number"
                  id="bmi-neck"
                  className="bmi-input-field"
                  value={formData.neck}
                  onChange={(e) => handleInputChange('neck', e.target.value)}
                  placeholder="e.g., 35"
                  min="20"
                  max="80"
                  step="0.1"
                />
              </div>
            </div>

            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-neck-unit" className="bmi-input-label">
                  Neck Unit:
                </label>
                <select
                  id="bmi-neck-unit"
                  className="bmi-select-field"
                  value={formData.neckUnit}
                  onChange={(e) => handleInputChange('neckUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-body-frame" className="bmi-input-label">
                  Body Frame:
                </label>
                <select
                  id="bmi-body-frame"
                  className="bmi-select-field"
                  value={formData.bodyFrame}
                  onChange={(e) => handleInputChange('bodyFrame', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="bmi-input-group">
                <label htmlFor="bmi-ethnicity" className="bmi-input-label">
                  Ethnicity:
                </label>
                <select
                  id="bmi-ethnicity"
                  className="bmi-select-field"
                  value={formData.ethnicity}
                  onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                >
                  <option value="caucasian">Caucasian</option>
                  <option value="asian">Asian</option>
                  <option value="african">African</option>
                  <option value="hispanic">Hispanic</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="bmi-input-row">
              <div className="bmi-input-group">
                <label htmlFor="bmi-exercise-type" className="bmi-input-label">
                  Exercise Type:
                </label>
                <select
                  id="bmi-exercise-type"
                  className="bmi-select-field"
                  value={formData.exerciseType}
                  onChange={(e) => handleInputChange('exerciseType', e.target.value)}
                >
                  <option value="none">No Exercise</option>
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength Training</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="bmi-calculator-actions">
              <button type="button" className="bmi-btn-reset" onClick={() => handleReset(true)}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Custom Results Section */}
        {result && (
          <div className="bmi-calculator-result">
            <h3 className="bmi-result-title">BMI Calculation Results</h3>
            <div className="bmi-result-content">
              <div className="bmi-result-main">
                <div className="bmi-result-item">
                  <strong>BMI Value:</strong>
                  <span className="bmi-result-value bmi-result-final">
                    {formatBMI(result.bmi)}
                  </span>
                </div>
                <div className="bmi-result-item">
                  <strong>Weight Category:</strong>
                  <span className="bmi-result-value">
                    {result.category}
                  </span>
                </div>
                <div className="bmi-result-item">
                  <strong>Healthy Weight Range:</strong>
                  <span className="bmi-result-value">
                    {formatWeight(result.healthyRange.min)} - {formatWeight(result.healthyRange.max)}
                  </span>
                </div>
                {result.advanced && (
                  <>
                    <div className="bmi-result-item">
                      <strong>Body Fat %:</strong>
                      <span className="bmi-result-value">
                        {result.bodyFat ? `${result.bodyFat.toFixed(1)}%` : 'Not provided'}
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>Lean Mass:</strong>
                      <span className="bmi-result-value">
                        {result.leanMass ? formatWeight(result.leanMass) : 'Not calculated'}
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>Waist-to-Hip Ratio:</strong>
                      <span className="bmi-result-value">
                        {result.whr ? result.whr.toFixed(2) : 'Not calculated'}
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>Health Risk:</strong>
                      <span className="bmi-result-value">
                        {result.healthRisk}
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>Visceral Fat Risk:</strong>
                      <span className="bmi-result-value">
                        {result.visceralFatRisk}
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>Body Type:</strong>
                      <span className="bmi-result-value">
                        {result.bodyType}
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>BMR (Basal Metabolic Rate):</strong>
                      <span className="bmi-result-value">
                        {result.bmr ? Math.round(result.bmr) : 'Not calculated'} calories/day
                      </span>
                    </div>
                    <div className="bmi-result-item">
                      <strong>Daily Calorie Needs:</strong>
                      <span className="bmi-result-value">
                        {result.dailyCalories ? Math.round(result.dailyCalories) : 'Not calculated'} calories/day
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Health Insights */}
              <div className="bmi-result-insights">
                <h4 className="bmi-insights-title">Health Insights</h4>
                <div className="bmi-insights-content">
                  <p><strong>BMI Interpretation:</strong> {result.interpretation}</p>
                  {result.recommendations && (
                    <div className="bmi-recommendations">
                      <h5>Recommendations:</h5>
                      <ul>
                        {result.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CalculatorSection>

      {/* TOC and Feedback Section */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The BMI Calculator is a comprehensive health assessment tool that calculates your Body Mass Index 
          and provides detailed insights into your body composition, health risks, and wellness recommendations. 
          Whether you're tracking your fitness journey or assessing your overall health, this calculator offers 
          both basic and advanced analysis options.
        </p>
        <p>
          Our calculator goes beyond simple BMI calculation to provide waist-to-hip ratio analysis, body fat 
          percentage insights, metabolic rate calculations, and personalized health recommendations based on 
          your unique body composition and lifestyle factors.
        </p>
      </ContentSection>

      <ContentSection id="what-is-bmi" title="What is BMI?">
        <p>
          Body Mass Index (BMI) is a measure of body fat based on height and weight that applies to adult 
          men and women. It's calculated by dividing your weight in kilograms by the square of your height in meters.
        </p>
        <ul>
          <li>
            <span><strong>Underweight:</strong> BMI less than 18.5</span>
          </li>
          <li>
            <span><strong>Normal weight:</strong> BMI 18.5 to 24.9</span>
          </li>
          <li>
            <span><strong>Overweight:</strong> BMI 25 to 29.9</span>
          </li>
          <li>
            <span><strong>Obese:</strong> BMI 30 or greater</span>
          </li>
        </ul>
        <p>
          <strong>Important Note:</strong> BMI is a screening tool and doesn't directly measure body fat. 
          It may not be accurate for athletes, older adults, or people with high muscle mass.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use BMI Calculator">
        <p>Our BMI calculator offers two modes for comprehensive health assessment:</p>
        
        <h3>Basic Calculator</h3>
        <ul className="usage-steps">
          <li>
            <span><strong>Select Units:</strong> Choose between metric (cm/kg) or imperial (ft/in, lb) units</span>
          </li>
          <li>
            <span><strong>Enter Height:</strong> Input your height in the selected unit system</span>
          </li>
          <li>
            <span><strong>Enter Weight:</strong> Input your current weight</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate BMI" to get your results</span>
          </li>
        </ul>

        <h3>Advanced Calculator</h3>
        <ul className="usage-steps">
          <li>
            <span><strong>Basic Information:</strong> Enter height, weight, age, gender, and activity level</span>
          </li>
          <li>
            <span><strong>Body Measurements:</strong> Add waist, hip, and neck measurements (optional body fat %)</span>
          </li>
          <li>
            <span><strong>Additional Factors:</strong> Select body frame, ethnicity, and exercise type</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Advanced BMI" for comprehensive analysis</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>BMI Formula</h3>
          <div className="math-formula">
            {'\\text{BMI} = \\frac{\\text{Weight (kg)}}{\\text{Height (m)}^2}'}
          </div>
          <p>For imperial units: BMI = (Weight in pounds × 703) ÷ (Height in inches)²</p>
        </div>

        <div className="formula-section">
          <h3>Waist-to-Hip Ratio (WHR)</h3>
          <div className="math-formula">
            {'\\text{WHR} = \\frac{\\text{Waist Circumference}}{\\text{Hip Circumference}}'}
          </div>
          <p>Healthy WHR: Men &lt; 0.90, Women &lt; 0.85</p>
        </div>

        <div className="formula-section">
          <h3>Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation</h3>
          <div className="math-formula">
            {'\\text{BMR} = 10 \\times \\text{Weight} + 6.25 \\times \\text{Height} - 5 \\times \\text{Age} + \\text{Gender Factor}'}
          </div>
          <p>Gender Factor: +5 for men, -161 for women</p>
        </div>

        <div className="formula-section">
          <h3>Daily Calorie Needs</h3>
          <div className="math-formula">
            {'\\text{Daily Calories} = \\text{BMR} \\times \\text{Activity Multiplier}'}
          </div>
          <p>Activity Multipliers: Sedentary (1.2), Light (1.375), Moderate (1.55), Very Active (1.725), Extra Active (1.9)</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Basic BMI Calculation</h3>
          <div className="example-solution">
            <p><strong>Height:</strong> 175 cm (1.75 m)</p>
            <p><strong>Weight:</strong> 70 kg</p>
            <p><strong>BMI:</strong> 70 ÷ (1.75)² = 22.9</p>
            <p><strong>Category:</strong> Normal weight</p>
            <p><strong>Healthy Range:</strong> 56.7 - 76.3 kg</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Advanced Analysis</h3>
          <div className="example-solution">
            <p><strong>Height:</strong> 5'9" (175 cm)</p>
            <p><strong>Weight:</strong> 80 kg</p>
            <p><strong>Age:</strong> 30 years</p>
            <p><strong>Gender:</strong> Male</p>
            <p><strong>Waist:</strong> 90 cm, Hip: 100 cm</p>
            <p><strong>BMI:</strong> 26.1 (Overweight)</p>
            <p><strong>WHR:</strong> 0.90 (Normal)</p>
            <p><strong>BMR:</strong> 1,785 calories/day</p>
            <p><strong>Daily Needs:</strong> 2,142 calories (Light Activity)</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your BMI and body composition is crucial for maintaining optimal health:</p>
        <ul>
          <li>
            <span>Helps identify potential health risks associated with weight</span>
          </li>
          <li>
            <span>Provides baseline for setting realistic health and fitness goals</span>
          </li>
          <li>
            <span>Assists in monitoring progress during weight management programs</span>
          </li>
          <li>
            <span>Helps healthcare providers assess overall health status</span>
          </li>
          <li>
            <span>Provides insights into body fat distribution and health risks</span>
          </li>
          <li>
            <span>Essential for personalized nutrition and exercise planning</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our BMI Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Basic BMI Calculation:</strong> Simple height and weight analysis</span>
          </li>
          <li>
            <span><strong>Advanced Body Composition:</strong> WHR, body fat, and metabolic analysis</span>
          </li>
          <li>
            <span><strong>Health Risk Assessment:</strong> Comprehensive risk evaluation</span>
          </li>
          <li>
            <span><strong>Metabolic Calculations:</strong> BMR and daily calorie needs</span>
          </li>
          <li>
            <span><strong>Personalized Recommendations:</strong> Tailored health and fitness advice</span>
          </li>
          <li>
            <span><strong>Multiple Unit Systems:</strong> Metric and imperial unit support</span>
          </li>
          <li>
            <span><strong>Comprehensive Analysis:</strong> Body type, visceral fat risk, and health insights</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Health Assessment</h4>
            <p>Evaluate overall health status and identify potential risk factors</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Fitness Planning</h4>
            <p>Set realistic fitness goals and track progress over time</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-apple-alt"></i> Nutrition Planning</h4>
            <p>Calculate daily calorie needs for weight management</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Weight Management</h4>
            <p>Monitor weight changes and maintain healthy body composition</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-user-md"></i> Medical Consultation</h4>
            <p>Provide data for healthcare provider discussions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-running"></i> Athletic Training</h4>
            <p>Optimize body composition for sports performance</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "Is BMI accurate for everyone?",
            answer: "BMI is a useful screening tool but may not be accurate for athletes with high muscle mass, older adults, or people with certain medical conditions. It's best used as a starting point for health assessment."
          },
          {
            question: "What's the difference between basic and advanced BMI calculation?",
            answer: "Basic calculation provides BMI, weight category, and healthy weight range. Advanced calculation adds body composition analysis, health risk assessment, metabolic calculations, and personalized recommendations."
          },
          {
            question: "How often should I check my BMI?",
            answer: "For most people, checking BMI monthly is sufficient. If you're actively trying to change your weight, weekly measurements can help track progress, but remember that weight can fluctuate daily."
          },
          {
            question: "What does waist-to-hip ratio tell me?",
            answer: "WHR indicates body fat distribution. Higher ratios (more fat around the waist) are associated with increased health risks, even in people with normal BMI."
          },
          {
            question: "How accurate are the calorie calculations?",
            answer: "The BMR and calorie calculations use the Mifflin-St Jeor equation, which is considered one of the most accurate formulas. However, individual metabolism can vary, so use these as starting points."
          },
          {
            question: "Should I be concerned if my BMI is in the overweight range?",
            answer: "BMI is just one indicator of health. Consider other factors like body composition, fitness level, and overall health. Consult with a healthcare provider for personalized advice."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default BMICalculator
