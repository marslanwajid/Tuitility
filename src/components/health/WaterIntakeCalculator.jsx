import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/water-intake-calculator.css'
import Seo from '../Seo'

const WaterIntakeCalculator = () => {
  const [formData, setFormData] = useState({
    // Basic Calculator
    weight: '',
    weightUnit: 'kg',
    activityLevel: 'light',
    climate: 'moderate',
    
    // Advanced Calculator
    gender: 'male',
    age: '',
    weightAdv: '',
    weightUnitAdv: 'kg',
    heightUnit: 'cm',
    heightCm: '',
    heightFt: '',
    heightIn: '',
    activityLevelAdv: 'light',
    climateAdv: 'moderate',
    caffeine: 'low',
    alcohol: 'none',
    pregnancy: 'no',
    healthConditions: 'none'
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Water Intake Calculator',
    description: 'Calculate your optimal daily water intake based on weight, activity level, climate, and health factors. Get personalized hydration recommendations and daily distribution schedules.',
    icon: 'fas fa-tint',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Water Intake Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, daily water intake, hydration calculator, how much water to drink`;
  const canonicalUrl = `https://tuitility.vercel.app/health/calculators/water-intake-calculator`;

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
    { name: 'BMI Calculator', url: '/health/calculators/bmi-calculator', icon: 'fas fa-weight' },
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user' },
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-water-intake', title: 'What is Water Intake?' },
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

  const validateInputs = () => {
    if (activeTab === 'basic') {
      const { weight } = formData;
      
      if (!weight || parseFloat(weight) <= 0) {
        setError('Please enter a valid weight greater than 0.');
        return false;
      }
    } else {
      const { age, weightAdv, heightCm, heightFt, heightIn, heightUnit } = formData;
      
      if (!age || parseInt(age) <= 0 || parseInt(age) > 120) {
        setError('Please enter a valid age between 1 and 120 years.');
        return false;
      }

      if (!weightAdv || parseFloat(weightAdv) <= 0) {
        setError('Please enter a valid weight greater than 0.');
        return false;
      }

      if (heightUnit === 'cm') {
        if (!heightCm || parseFloat(heightCm) <= 0) {
          setError('Please enter a valid height in centimeters.');
          return false;
        }
      } else {
        if (!heightFt || parseFloat(heightFt) <= 0 || !heightIn || parseFloat(heightIn) < 0) {
          setError('Please enter a valid height in feet and inches.');
          return false;
        }
      }
    }

    return true;
  };

  const calculateWaterIntake = () => {
    if (!validateInputs()) return;

    try {
      let waterIntake;
      
      if (activeTab === 'basic') {
        waterIntake = calculateBasicWaterIntake();
      } else {
        waterIntake = calculateAdvancedWaterIntake();
      }

      if (typeof waterIntake === 'string') {
        setResult({
          waterIntake: waterIntake,
          waterCups: waterIntake,
          waterOunces: waterIntake,
          isSpecialCase: true
        });
      } else {
        const cups = Math.round(waterIntake * 4.227);
        const ounces = Math.round(waterIntake * 33.814);
        
        setResult({
          waterIntake: Math.round(waterIntake * 100) / 100,
          waterCups: cups,
          waterOunces: ounces,
          isSpecialCase: false,
          morningCups: Math.round(cups * 0.35),
          afternoonCups: Math.round(cups * 0.40),
          eveningCups: Math.round(cups * 0.25)
        });
      }
      
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const calculateBasicWaterIntake = () => {
    const { weight, weightUnit, activityLevel, climate } = formData;
    
    // Convert weight to kg if in pounds
    const weightInKg = weightUnit === 'lb' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    
    // Base calculation: 30-35ml per kg of body weight
    let waterIntake = weightInKg * 0.033; // Liters per day
    
    // Adjust for activity level
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      very: 1.3,
      extra: 1.4
    };
    
    waterIntake *= activityMultipliers[activityLevel] || 1.0;
    
    // Adjust for climate
    const climateMultipliers = {
      moderate: 1.0,
      hot: 1.2,
      humid: 1.3,
      cold: 0.95
    };
    
    waterIntake *= climateMultipliers[climate] || 1.0;
    
    return waterIntake;
  };

  const calculateAdvancedWaterIntake = () => {
    const { 
      gender, age, weightAdv, weightUnitAdv, heightUnit, heightCm, heightFt, heightIn,
      activityLevelAdv, climateAdv, caffeine, alcohol, pregnancy, healthConditions 
    } = formData;
    
    // Convert weight to kg if in pounds
    const weightInKg = weightUnitAdv === 'lb' ? parseFloat(weightAdv) * 0.453592 : parseFloat(weightAdv);
    
    // Calculate height in cm
    let height;
    if (heightUnit === 'cm') {
      height = parseFloat(heightCm);
    } else {
      height = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn) * 2.54);
    }
    
    // Base calculation using more factors
    let waterIntake = (weightInKg * 0.033) + (height * 0.0005) - (parseInt(age) * 0.005) + 1.5;
    
    // Gender adjustment
    if (gender === 'female') {
      waterIntake *= 0.95;
    }
    
    // Activity level adjustment
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      very: 1.3,
      extra: 1.4
    };
    
    waterIntake *= activityMultipliers[activityLevelAdv] || 1.0;
    
    // Climate adjustment
    const climateMultipliers = {
      moderate: 1.0,
      hot: 1.2,
      humid: 1.3,
      cold: 0.95
    };
    
    waterIntake *= climateMultipliers[climateAdv] || 1.0;
    
    // Caffeine adjustment
    const caffeineAdjustments = {
      none: 0,
      low: 0.2,
      moderate: 0.4,
      high: 0.6
    };
    
    waterIntake += caffeineAdjustments[caffeine] || 0;
    
    // Alcohol adjustment
    const alcoholAdjustments = {
      none: 0,
      light: 0.3,
      moderate: 0.6,
      heavy: 1.0
    };
    
    waterIntake += alcoholAdjustments[alcohol] || 0;
    
    // Pregnancy and breastfeeding adjustment
    if (gender === 'female') {
      const pregnancyAdjustments = {
        no: 0,
        first: 0.3,
        second: 0.5,
        third: 0.7,
        breastfeeding: 1.0
      };
      
      waterIntake += pregnancyAdjustments[pregnancy] || 0;
    }
    
    // Health conditions adjustment
    if (healthConditions === 'kidney') {
      return 'Consult your doctor';
    } else if (healthConditions === 'heart') {
      waterIntake *= 0.9;
    } else if (healthConditions === 'diabetes') {
      waterIntake *= 1.1;
    }
    
    return waterIntake;
  };

  const handleReset = () => {
    setFormData({
      weight: '',
      weightUnit: 'kg',
      activityLevel: 'light',
      climate: 'moderate',
      gender: 'male',
      age: '',
      weightAdv: '',
      weightUnitAdv: 'kg',
      heightUnit: 'cm',
      heightCm: '',
      heightFt: '',
      heightIn: '',
      activityLevelAdv: 'light',
      climateAdv: 'moderate',
      caffeine: 'low',
      alcohol: 'none',
      pregnancy: 'no',
      healthConditions: 'none'
    });
    setResult(null);
    setError('');
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
  }, [result]);

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
      />
      <ToolPageLayout 
        toolData={toolData} 
        tableOfContents={tableOfContents}
        categories={categories}
        relatedTools={relatedTools}
      >
        <CalculatorSection 
          title="Water Intake Calculator"
          onCalculate={calculateWaterIntake}
          calculateButtonText="Calculate Water Intake"
          error={error}
          result={null}
        >
          <div className="water-intake-calculator-form">
            {/* Tab Navigation */}
            <div className="water-intake-tab-navigation">
              <button 
                className={`water-intake-tab ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                <i className="fas fa-calculator"></i>
                Basic Calculator
              </button>
              <button 
                className={`water-intake-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setActiveTab('advanced')}
              >
                <i className="fas fa-cogs"></i>
                Advanced Calculator
              </button>
            </div>

            {/* Basic Calculator */}
            {activeTab === 'basic' && (
              <div className="water-intake-basic-calculator">
                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-weight" className="water-intake-input-label">
                      Weight:
                    </label>
                    <div className="water-intake-weight-container">
                      <input
                        type="number"
                        id="water-intake-weight"
                        className="water-intake-input-field"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="e.g., 70"
                        min="0"
                        step="0.1"
                      />
                      <select
                        id="water-intake-weight-unit"
                        className="water-intake-select-field"
                        value={formData.weightUnit}
                        onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                    <small className="water-intake-input-help">
                      Your current body weight
                    </small>
                  </div>

                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-activity-level" className="water-intake-input-label">
                      Activity Level:
                    </label>
                    <select
                      id="water-intake-activity-level"
                      className="water-intake-input-field"
                      value={formData.activityLevel}
                      onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                    >
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="light">Light (light exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                      <option value="very">Very Active (hard exercise 6-7 days/week)</option>
                      <option value="extra">Extra Active (very hard exercise, physical job)</option>
                    </select>
                  </div>
                </div>

                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-climate" className="water-intake-input-label">
                      Climate:
                    </label>
                    <select
                      id="water-intake-climate"
                      className="water-intake-input-field"
                      value={formData.climate}
                      onChange={(e) => handleInputChange('climate', e.target.value)}
                    >
                      <option value="moderate">Moderate Temperature</option>
                      <option value="hot">Hot/Dry Climate</option>
                      <option value="humid">Hot/Humid Climate</option>
                      <option value="cold">Cold Climate</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Calculator */}
            {activeTab === 'advanced' && (
              <div className="water-intake-advanced-calculator">
                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-gender" className="water-intake-input-label">
                      Gender:
                    </label>
                    <select
                      id="water-intake-gender"
                      className="water-intake-input-field"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-age" className="water-intake-input-label">
                      Age (years):
                    </label>
                    <input
                      type="number"
                      id="water-intake-age"
                      className="water-intake-input-field"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="e.g., 30"
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-weight-adv" className="water-intake-input-label">
                      Weight:
                    </label>
                    <div className="water-intake-weight-container">
                      <input
                        type="number"
                        id="water-intake-weight-adv"
                        className="water-intake-input-field"
                        value={formData.weightAdv}
                        onChange={(e) => handleInputChange('weightAdv', e.target.value)}
                        placeholder="e.g., 70"
                        min="0"
                        step="0.1"
                      />
                      <select
                        id="water-intake-weight-unit-adv"
                        className="water-intake-select-field"
                        value={formData.weightUnitAdv}
                        onChange={(e) => handleInputChange('weightUnitAdv', e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                  </div>

                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-height-unit" className="water-intake-input-label">
                      Height Unit:
                    </label>
                    <select
                      id="water-intake-height-unit"
                      className="water-intake-input-field"
                      value={formData.heightUnit}
                      onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="ft">Feet & Inches (ft/in)</option>
                    </select>
                  </div>
                </div>

                <div className="water-intake-input-row">
                  {formData.heightUnit === 'cm' ? (
                    <div className="water-intake-input-group">
                      <label htmlFor="water-intake-height-cm" className="water-intake-input-label">
                        Height (cm):
                      </label>
                      <input
                        type="number"
                        id="water-intake-height-cm"
                        className="water-intake-input-field"
                        value={formData.heightCm}
                        onChange={(e) => handleInputChange('heightCm', e.target.value)}
                        placeholder="e.g., 175"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="water-intake-input-group">
                        <label htmlFor="water-intake-height-ft" className="water-intake-input-label">
                          Height (ft):
                        </label>
                        <input
                          type="number"
                          id="water-intake-height-ft"
                          className="water-intake-input-field"
                          value={formData.heightFt}
                          onChange={(e) => handleInputChange('heightFt', e.target.value)}
                          placeholder="e.g., 5"
                          min="0"
                          max="8"
                        />
                      </div>
                      <div className="water-intake-input-group">
                        <label htmlFor="water-intake-height-in" className="water-intake-input-label">
                          Height (in):
                        </label>
                        <input
                          type="number"
                          id="water-intake-height-in"
                          className="water-intake-input-field"
                          value={formData.heightIn}
                          onChange={(e) => handleInputChange('heightIn', e.target.value)}
                          placeholder="e.g., 9"
                          min="0"
                          max="11"
                          step="0.1"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-activity-level-adv" className="water-intake-input-label">
                      Activity Level:
                    </label>
                    <select
                      id="water-intake-activity-level-adv"
                      className="water-intake-input-field"
                      value={formData.activityLevelAdv}
                      onChange={(e) => handleInputChange('activityLevelAdv', e.target.value)}
                    >
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="light">Light (light exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                      <option value="very">Very Active (hard exercise 6-7 days/week)</option>
                      <option value="extra">Extra Active (very hard exercise, physical job)</option>
                    </select>
                  </div>

                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-climate-adv" className="water-intake-input-label">
                      Climate:
                    </label>
                    <select
                      id="water-intake-climate-adv"
                      className="water-intake-input-field"
                      value={formData.climateAdv}
                      onChange={(e) => handleInputChange('climateAdv', e.target.value)}
                    >
                      <option value="moderate">Moderate Temperature</option>
                      <option value="hot">Hot/Dry Climate</option>
                      <option value="humid">Hot/Humid Climate</option>
                      <option value="cold">Cold Climate</option>
                    </select>
                  </div>
                </div>

                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-caffeine" className="water-intake-input-label">
                      Caffeine Intake:
                    </label>
                    <select
                      id="water-intake-caffeine"
                      className="water-intake-input-field"
                      value={formData.caffeine}
                      onChange={(e) => handleInputChange('caffeine', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="low">Low (1-2 cups/day)</option>
                      <option value="moderate">Moderate (3-4 cups/day)</option>
                      <option value="high">High (5+ cups/day)</option>
                    </select>
                  </div>

                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-alcohol" className="water-intake-input-label">
                      Alcohol Intake:
                    </label>
                    <select
                      id="water-intake-alcohol"
                      className="water-intake-input-field"
                      value={formData.alcohol}
                      onChange={(e) => handleInputChange('alcohol', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="light">Light (1-2 drinks/week)</option>
                      <option value="moderate">Moderate (3-7 drinks/week)</option>
                      <option value="heavy">Heavy (8+ drinks/week)</option>
                    </select>
                  </div>
                </div>

                <div className="water-intake-input-row">
                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-pregnancy" className="water-intake-input-label">
                      Pregnancy/Breastfeeding:
                    </label>
                    <select
                      id="water-intake-pregnancy"
                      className="water-intake-input-field"
                      value={formData.pregnancy}
                      onChange={(e) => handleInputChange('pregnancy', e.target.value)}
                      disabled={formData.gender === 'male'}
                    >
                      <option value="no">No</option>
                      <option value="first">First Trimester</option>
                      <option value="second">Second Trimester</option>
                      <option value="third">Third Trimester</option>
                      <option value="breastfeeding">Breastfeeding</option>
                    </select>
                  </div>

                  <div className="water-intake-input-group">
                    <label htmlFor="water-intake-health-conditions" className="water-intake-input-label">
                      Health Conditions:
                    </label>
                    <select
                      id="water-intake-health-conditions"
                      className="water-intake-input-field"
                      value={formData.healthConditions}
                      onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="kidney">Kidney Issues</option>
                      <option value="heart">Heart Conditions</option>
                      <option value="diabetes">Diabetes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="water-intake-calculator-actions">
              <button type="button" className="water-intake-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="water-intake-calculator-result">
              <h3 className="water-intake-result-title">Water Intake Recommendations</h3>
              <div className="water-intake-result-content">
                {result.isSpecialCase ? (
                  <div className="water-intake-special-case">
                    <div className="water-intake-result-item">
                      <strong>Recommendation:</strong>
                      <span className="water-intake-result-value water-intake-result-final">
                        {result.waterIntake}
                      </span>
                    </div>
                    <div className="water-intake-special-note">
                      <p>For kidney issues, please consult with a healthcare professional for personalized water intake recommendations.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="water-intake-result-main">
                      <div className="water-intake-result-item">
                        <strong>Daily Water Intake:</strong>
                        <span className="water-intake-result-value water-intake-result-final">
                          {result.waterIntake} liters
                        </span>
                      </div>
                      <div className="water-intake-result-item">
                        <strong>In Cups:</strong>
                        <span className="water-intake-result-value">
                          {result.waterCups} cups
                        </span>
                      </div>
                      <div className="water-intake-result-item">
                        <strong>In Ounces:</strong>
                        <span className="water-intake-result-value">
                          {result.waterOunces} oz
                        </span>
                      </div>
                    </div>

                    {/* Hydration Schedule */}
                    <div className="water-intake-hydration-schedule">
                      <h4 className="water-intake-schedule-title">Daily Hydration Schedule</h4>
                      <div className="water-intake-schedule-grid">
                        <div className="water-intake-schedule-item">
                          <div className="water-intake-schedule-time">Morning (6 AM - 12 PM)</div>
                          <div className="water-intake-schedule-amount">{result.morningCups} cups</div>
                          <div className="water-intake-progress-bar">
                            <div className="water-intake-progress" style={{width: '35%'}}></div>
                          </div>
                        </div>
                        <div className="water-intake-schedule-item">
                          <div className="water-intake-schedule-time">Afternoon (12 PM - 6 PM)</div>
                          <div className="water-intake-schedule-amount">{result.afternoonCups} cups</div>
                          <div className="water-intake-progress-bar">
                            <div className="water-intake-progress" style={{width: '40%'}}></div>
                          </div>
                        </div>
                        <div className="water-intake-schedule-item">
                          <div className="water-intake-schedule-time">Evening (6 PM - 12 AM)</div>
                          <div className="water-intake-schedule-amount">{result.eveningCups} cups</div>
                          <div className="water-intake-progress-bar">
                            <div className="water-intake-progress" style={{width: '25%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hydration Tips */}
                    <div className="water-intake-hydration-tips">
                      <h4 className="water-intake-tips-title">Hydration Tips</h4>
                      <ul className="water-intake-tips-list">
                        <li>Start your day with a glass of water to kickstart hydration.</li>
                        <li>Keep a reusable water bottle with you throughout the day.</li>
                        <li>Set reminders on your phone to drink water regularly.</li>
                        <li>Add natural flavors like lemon, cucumber, or berries to make water more appealing.</li>
                        <li>Drink a glass of water before each meal to help with digestion.</li>
                        <li>Consume water-rich foods like fruits and vegetables to supplement your hydration.</li>
                      </ul>
                    </div>
                  </>
                )}
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
            The Water Intake Calculator is an essential health tool that helps you determine your optimal daily water consumption 
            based on various personal factors. Proper hydration is crucial for maintaining bodily functions, supporting metabolism, 
            and promoting overall health and well-being.
          </p>
          <p>
            Whether you're an athlete, office worker, or someone with specific health considerations, understanding your individual 
            water needs helps you stay properly hydrated and avoid both dehydration and overhydration.
          </p>
        </ContentSection>

        <ContentSection id="what-is-water-intake" title="What is Water Intake?">
          <p>
            Water intake refers to the amount of water your body needs daily to function optimally. Water is essential for:
          </p>
          <ul>
            <li>
              <span><strong>Temperature Regulation:</strong> Helps maintain body temperature through sweating and respiration</span>
            </li>
            <li>
              <span><strong>Nutrient Transport:</strong> Carries nutrients and oxygen to cells throughout the body</span>
            </li>
            <li>
              <span><strong>Waste Removal:</strong> Helps kidneys filter waste and toxins from the blood</span>
            </li>
            <li>
              <span><strong>Joint Lubrication:</strong> Keeps joints and tissues properly lubricated</span>
            </li>
            <li>
              <span><strong>Digestive Health:</strong> Aids in digestion and prevents constipation</span>
            </li>
            <li>
              <span><strong>Cognitive Function:</strong> Maintains brain function and mental clarity</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Water Intake Calculator">
          <p>Our calculator offers two modes to suit different needs:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Basic Calculator:</strong> Enter your weight, activity level, and climate for a quick estimate</span>
            </li>
            <li>
              <span><strong>Advanced Calculator:</strong> Include age, height, gender, and health factors for personalized recommendations</span>
            </li>
            <li>
              <span><strong>Input Your Data:</strong> Fill in all required fields with accurate information</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Water Intake" to get your personalized recommendations</span>
            </li>
            <li>
              <span><strong>Follow Schedule:</strong> Use the daily hydration schedule to distribute your water intake throughout the day</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> The calculator provides recommendations in liters, cups, and ounces. Choose the unit that works best for your daily routine.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Formulas & Methods">
          <div className="formula-section">
            <h3>Basic Water Intake Formula</h3>
            <div className="math-formula">
              {'\\text{Water Intake (L)} = \\text{Weight (kg)} \\times 0.033 \\times \\text{Activity Factor} \\times \\text{Climate Factor}'}
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>0.033</strong> = Base water requirement (33ml per kg of body weight)</li>
              <li><strong>Activity Factor</strong> = 1.0 to 1.4 based on physical activity level</li>
              <li><strong>Climate Factor</strong> = 0.95 to 1.3 based on environmental conditions</li>
            </ul>
          </div>

          <div className="formula-section">
            <h3>Advanced Water Intake Formula</h3>
            <div className="math-formula">
              {'\\text{Water Intake (L)} = (\\text{Weight} \\times 0.033) + (\\text{Height} \\times 0.0005) - (\\text{Age} \\times 0.005) + 1.5'}
            </div>
            <p>Additional adjustments for:</p>
            <ul>
              <li><strong>Gender:</strong> Females typically need 5% less water than males</li>
              <li><strong>Caffeine/Alcohol:</strong> Add 0.2-1.0L to compensate for diuretic effects</li>
              <li><strong>Pregnancy:</strong> Add 0.3-1.0L based on trimester or breastfeeding status</li>
              <li><strong>Health Conditions:</strong> Adjust based on medical recommendations</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Basic Calculator - Active Adult</h3>
            <div className="example-solution">
              <p><strong>Weight:</strong> 70 kg</p>
              <p><strong>Activity Level:</strong> Moderate (3-5 days/week exercise)</p>
              <p><strong>Climate:</strong> Moderate temperature</p>
              <p><strong>Calculation:</strong> 70 × 0.033 × 1.2 × 1.0 = 2.77 liters</p>
              <p><strong>Daily Recommendation:</strong> 2.8 liters (12 cups, 94 oz)</p>
              <p><strong>Schedule:</strong> Morning: 4 cups, Afternoon: 5 cups, Evening: 3 cups</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Advanced Calculator - Pregnant Woman</h3>
            <div className="example-solution">
              <p><strong>Gender:</strong> Female, Age: 28, Weight: 65 kg, Height: 165 cm</p>
              <p><strong>Activity Level:</strong> Light, Climate: Hot, Pregnancy: Second trimester</p>
              <p><strong>Base Calculation:</strong> (65 × 0.033) + (165 × 0.0005) - (28 × 0.005) + 1.5 = 3.2L</p>
              <p><strong>Adjustments:</strong> Female (-5%), Light activity (+10%), Hot climate (+20%), Pregnancy (+0.5L)</p>
              <p><strong>Final Recommendation:</strong> 3.8 liters (16 cups, 128 oz)</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Proper water intake is fundamental to health and performance:</p>
          <ul>
            <li>
              <span>Prevents dehydration, which can cause fatigue, headaches, and impaired cognitive function</span>
            </li>
            <li>
              <span>Supports cardiovascular health by maintaining blood volume and circulation</span>
            </li>
            <li>
              <span>Enhances physical performance and exercise capacity</span>
            </li>
            <li>
              <span>Promotes healthy skin by maintaining moisture and elasticity</span>
            </li>
            <li>
              <span>Supports kidney function and reduces risk of kidney stones</span>
            </li>
            <li>
              <span>Helps maintain healthy weight by promoting satiety and supporting metabolism</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Water Intake Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Dual Calculator Modes:</strong> Basic and advanced calculations for different user needs</span>
            </li>
            <li>
              <span><strong>Personalized Factors:</strong> Weight, age, height, gender, activity level, and climate</span>
            </li>
            <li>
              <span><strong>Health Considerations:</strong> Pregnancy, breastfeeding, and medical conditions</span>
            </li>
            <li>
              <span><strong>Lifestyle Factors:</strong> Caffeine and alcohol consumption adjustments</span>
            </li>
            <li>
              <span><strong>Multiple Units:</strong> Results in liters, cups, and ounces</span>
            </li>
            <li>
              <span><strong>Daily Schedule:</strong> Optimal distribution throughout the day</span>
            </li>
            <li>
              <span><strong>Hydration Tips:</strong> Personalized recommendations for better hydration habits</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-dumbbell"></i> Athletic Performance</h4>
              <p>Optimize hydration for training, competition, and recovery</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-baby"></i> Pregnancy & Breastfeeding</h4>
              <p>Meet increased fluid needs during pregnancy and lactation</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-thermometer-half"></i> Climate Adaptation</h4>
              <p>Adjust intake for hot, humid, or cold environmental conditions</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-heartbeat"></i> Health Management</h4>
              <p>Support specific health conditions with appropriate hydration</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-briefcase"></i> Workplace Wellness</h4>
              <p>Maintain hydration during long work hours and meetings</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Educational Tool</h4>
              <p>Learn about hydration science and develop healthy habits</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "How much water should I drink per day?",
              answer: "The general recommendation is 8 glasses (64 oz) per day, but individual needs vary based on weight, activity level, climate, and health factors. Our calculator provides personalized recommendations."
            },
            {
              question: "Can I drink too much water?",
              answer: "Yes, overhydration (water intoxication) can occur, though it's rare. It typically happens when drinking excessive amounts in a short time. Stick to your calculated daily intake spread throughout the day."
            },
            {
              question: "Do other beverages count toward my daily water intake?",
              answer: "Yes, but water is best. Coffee, tea, and other beverages contribute to hydration, but water should be your primary source. Caffeinated and alcoholic beverages may have diuretic effects."
            },
            {
              question: "How do I know if I'm properly hydrated?",
              answer: "Signs of good hydration include pale yellow urine, normal energy levels, and absence of thirst. Dark urine, fatigue, and dry mouth may indicate dehydration."
            },
            {
              question: "Should I drink water before, during, or after exercise?",
              answer: "All three! Drink water before exercise to start hydrated, during exercise to maintain hydration, and after to replace lost fluids. The amount depends on exercise intensity and duration."
            },
            {
              question: "Does the calculator account for food water content?",
              answer: "The calculator provides total fluid needs. About 20% of daily water intake comes from food, so you can adjust your liquid intake accordingly if you eat water-rich foods."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default WaterIntakeCalculator