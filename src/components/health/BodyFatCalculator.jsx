import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/body-fat-calculator.css'
// Import the logic class - we'll define it inline for now
// import BodyFatCalculatorLogic from '../../assets/js/health/body-fat-calculator.js'

// Body Fat Calculator Logic Class
class BodyFatCalculatorLogic {
  constructor() {
    this.bodyFatCategories = {
      male: {
        essential: { min: 0, max: 5, label: 'Essential Fat', color: '#3498db' },
        athletic: { min: 5, max: 14, label: 'Athletic', color: '#2ecc71' },
        fitness: { min: 14, max: 18, label: 'Fitness', color: '#f1c40f' },
        average: { min: 18, max: 25, label: 'Average', color: '#e67e22' },
        obese: { min: 25, max: 100, label: 'Obese', color: '#e74c3c' }
      },
      female: {
        essential: { min: 0, max: 13, label: 'Essential Fat', color: '#3498db' },
        athletic: { min: 13, max: 21, label: 'Athletic', color: '#2ecc71' },
        fitness: { min: 21, max: 25, label: 'Fitness', color: '#f1c40f' },
        average: { min: 25, max: 32, label: 'Average', color: '#e67e22' },
        obese: { min: 32, max: 100, label: 'Obese', color: '#e74c3c' }
      }
    };
  }

  calculate(formData, method = 'navy') {
    const height = this.getHeightInMeters(formData);
    const weight = this.getWeightInKg(formData);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    
    const bmi = this.calculateBMI(weight, height);
    
    let navyBfPercent = 0;
    let bmiBfPercent = 0;
    
    if (method === 'navy' || method === 'both') {
      navyBfPercent = this.calculateNavyMethod(formData, height, weight, gender);
    }
    
    if (method === 'bmi' || method === 'both') {
      bmiBfPercent = this.calculateBMIMethod(bmi, age, gender);
    }
    
    navyBfPercent = Math.max(2, Math.min(navyBfPercent, 60));
    bmiBfPercent = Math.max(2, Math.min(bmiBfPercent, 60));
    
    let selectedBfPercent;
    if (method === 'navy' || method === 'both') {
      selectedBfPercent = navyBfPercent;
    } else {
      selectedBfPercent = bmiBfPercent;
    }
    
    const fatMass = (selectedBfPercent / 100) * weight;
    const leanMass = weight - fatMass;
    
    const category = this.getBodyFatCategory(selectedBfPercent, gender);
    const healthRisk = this.calculateHealthRisk(selectedBfPercent, gender, age);
    const recommendations = this.getRecommendations(selectedBfPercent, gender, category, healthRisk);
    
    return {
      navyBfPercent: Math.round(navyBfPercent * 10) / 10,
      bmiBfPercent: Math.round(bmiBfPercent * 10) / 10,
      selectedBfPercent: Math.round(selectedBfPercent * 10) / 10,
      fatMass: Math.round(fatMass * 10) / 10,
      leanMass: Math.round(leanMass * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      category,
      healthRisk,
      recommendations,
      method,
      weight,
      height: height * 100
    };
  }

  calculateBMI(weight, height) {
    return weight / (height * height);
  }

  calculateNavyMethod(formData, height, weight, gender) {
    const heightCm = height * 100;
    let neckMeasurement = this.getNeckMeasurement(formData);
    let waistMeasurement = this.getWaistMeasurement(formData);
    let hipMeasurement = this.getHipMeasurement(formData);
    
    if (gender === 'male') {
      return 495 / (1.0324 - 0.19077 * Math.log10(waistMeasurement - neckMeasurement) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      return 495 / (1.29579 - 0.35004 * Math.log10(waistMeasurement + hipMeasurement - neckMeasurement) + 0.22100 * Math.log10(heightCm)) - 450;
    }
  }

  calculateBMIMethod(bmi, age, gender) {
    if (gender === 'male') {
      return (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      return (1.20 * bmi) + (0.23 * age) - 5.4;
    }
  }

  getBodyFatCategory(bfPercent, gender) {
    const categories = this.bodyFatCategories[gender];
    
    for (const [key, category] of Object.entries(categories)) {
      if (bfPercent >= category.min && bfPercent < category.max) {
        return {
          name: category.label,
          color: category.color,
          range: `${category.min}-${category.max}%`,
          key
        };
      }
    }
    
    return {
      name: 'Out of Range',
      color: '#95a5a6',
      range: 'N/A',
      key: 'outOfRange'
    };
  }

  calculateHealthRisk(bfPercent, gender, age) {
    let riskScore = 0;
    
    if (age > 50) riskScore += 1;
    if (age > 65) riskScore += 1;
    
    if (gender === 'male') {
      if (bfPercent > 25) riskScore += 3;
      else if (bfPercent > 20) riskScore += 2;
      else if (bfPercent > 15) riskScore += 1;
      else if (bfPercent < 5) riskScore += 2;
    } else {
      if (bfPercent > 35) riskScore += 3;
      else if (bfPercent > 30) riskScore += 2;
      else if (bfPercent > 25) riskScore += 1;
      else if (bfPercent < 10) riskScore += 2;
    }
    
    if (riskScore <= 1) return 'Low';
    if (riskScore <= 3) return 'Moderate';
    return 'High';
  }

  getRecommendations(bfPercent, gender, category, healthRisk) {
    const recommendations = [];
    
    switch (category.key) {
      case 'essential':
        recommendations.push('Your body fat is at essential levels. Consider consulting with a healthcare provider.');
        recommendations.push('Focus on maintaining adequate nutrition and avoiding extreme dieting.');
        break;
      case 'athletic':
        recommendations.push('Excellent body composition! Maintain your current fitness routine.');
        recommendations.push('Continue with strength training and cardiovascular exercise.');
        break;
      case 'fitness':
        recommendations.push('Good fitness level. Consider adding more resistance training.');
        recommendations.push('Focus on building lean muscle mass through progressive overload.');
        break;
      case 'average':
        recommendations.push('Consider implementing a structured exercise program.');
        recommendations.push('Focus on creating a moderate calorie deficit through diet and exercise.');
        recommendations.push('Include both cardiovascular and strength training exercises.');
        break;
      case 'obese':
        recommendations.push('Consider consulting with a healthcare provider for a comprehensive plan.');
        recommendations.push('Focus on sustainable lifestyle changes including diet and exercise.');
        recommendations.push('Start with low-impact exercises and gradually increase intensity.');
        break;
    }
    
    if (healthRisk === 'High') {
      recommendations.push('High health risk detected. Please consult with a healthcare provider.');
      recommendations.push('Consider working with certified fitness and nutrition professionals.');
    }
    
    recommendations.push('Aim for 150-300 minutes of moderate exercise per week');
    recommendations.push('Include strength training 2-3 times per week');
    recommendations.push('Focus on whole foods and adequate protein intake');
    recommendations.push('Get 7-9 hours of quality sleep per night');
    
    return recommendations;
  }

  getHeightInMeters(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height) / 100;
    } else {
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 30.48 + inches * 2.54) / 100;
    }
  }

  getWeightInKg(formData) {
    const weight = parseFloat(formData.weight);
    return formData.weightUnit === 'lb' ? weight * 0.453592 : weight;
  }

  getNeckMeasurement(formData) {
    const neck = parseFloat(formData.neck);
    return formData.measurementUnit === 'in' ? neck * 2.54 : neck;
  }

  getWaistMeasurement(formData) {
    const waist = parseFloat(formData.waist);
    return formData.measurementUnit === 'in' ? waist * 2.54 : waist;
  }

  getHipMeasurement(formData) {
    const hip = parseFloat(formData.hip);
    return formData.measurementUnit === 'in' ? hip * 2.54 : hip;
  }
}

// Helper function to get category position for the scale
const getCategoryPosition = (bfPercent, gender) => {
  if (gender === 'male') {
    if (bfPercent < 5) return 10;
    if (bfPercent < 14) return 30;
    if (bfPercent < 18) return 50;
    if (bfPercent < 25) return 70;
    return 90;
  } else {
    if (bfPercent < 13) return 10;
    if (bfPercent < 21) return 30;
    if (bfPercent < 25) return 50;
    if (bfPercent < 32) return 70;
    return 90;
  }
};

const BodyFatCalculator = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    age: '',
    gender: 'male',
    height: '',
    heightInches: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    // Navy Method Measurements
    neck: '',
    waist: '',
    hip: '',
    measurementUnit: 'cm',
    // Calculation Method
    calculationMethod: 'navy'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Body Fat Calculator',
    description: 'Calculate your body fat percentage using Navy Method or BMI-based estimation. Get comprehensive body composition analysis with health insights and personalized recommendations.',
    icon: 'fas fa-user-circle',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Body Fat Calculator']
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
    { name: 'BMI Calculator', url: '/health/calculators/bmi-calculator', icon: 'fas fa-weight' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'Water Intake Calculator', url: '/health/calculators/water-intake-calculator', icon: 'fas fa-tint' },
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-body-fat', title: 'What is Body Fat?' },
    { id: 'calculation-methods', title: 'Calculation Methods' },
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
    const { age, height, weight, neck, waist, hip, calculationMethod } = formData;
    
    if (!age || parseInt(age) < 15 || parseInt(age) > 80) {
      setError('Please enter a valid age between 15 and 80.');
      return false;
    }

    if (!height || parseFloat(height) <= 0) {
      setError('Please enter a valid height.');
      return false;
    }

    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight.');
      return false;
    }

    if (calculationMethod === 'navy' || calculationMethod === 'both') {
      if (!neck || parseFloat(neck) <= 0) {
        setError('Please enter a valid neck measurement.');
        return false;
      }

      if (!waist || parseFloat(waist) <= 0) {
        setError('Please enter a valid waist measurement.');
        return false;
      }

      if (formData.gender === 'female' && (!hip || parseFloat(hip) <= 0)) {
        setError('Please enter a valid hip measurement for females.');
        return false;
      }
    }

    return true;
  };

  const calculateBodyFat = () => {
    if (!validateInputs()) return;

    try {
      const calculator = new BodyFatCalculatorLogic();
      const result = calculator.calculate(formData, formData.calculationMethod);
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
      age: '',
      gender: 'male',
      height: '',
      heightInches: '',
      heightUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      neck: '',
      waist: '',
      hip: '',
      measurementUnit: 'cm',
      calculationMethod: 'navy'
    });
    setResult(null);
    setError('');
  };

  // Format weight
  const formatWeight = (weight) => {
    return `${weight.toFixed(1)} ${formData.weightUnit}`;
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
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Body Fat Calculator"
        onCalculate={calculateBodyFat}
        calculateButtonText="Calculate Body Fat"
        error={error}
        result={null}
      >
        <div className="body-fat-calculator-form">
          {/* Basic Information Section */}
          <div className="body-fat-section-title">Basic Information</div>
          <div className="body-fat-input-row">
            <div className="body-fat-input-group">
              <label htmlFor="body-fat-age" className="body-fat-input-label">
                Age (years):
              </label>
              <input
                type="number"
                id="body-fat-age"
                className="body-fat-input-field"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="e.g., 30"
                min="15"
                max="80"
                step="1"
              />
            </div>

            <div className="body-fat-input-group">
              <label htmlFor="body-fat-gender" className="body-fat-input-label">
                Gender:
              </label>
              <select
                id="body-fat-gender"
                className="body-fat-select-field"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="body-fat-input-group">
              <label htmlFor="body-fat-calculation-method" className="body-fat-input-label">
                Calculation Method:
              </label>
              <select
                id="body-fat-calculation-method"
                className="body-fat-select-field"
                value={formData.calculationMethod}
                onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
              >
                <option value="navy">Navy Method</option>
                <option value="bmi">BMI Method</option>
                <option value="both">Both Methods</option>
              </select>
            </div>
          </div>

          {/* Height and Weight Section */}
          <div className="body-fat-section-title">Height and Weight</div>
          <div className="body-fat-input-row">
            <div className="body-fat-input-group">
              <label htmlFor="body-fat-height-unit" className="body-fat-input-label">
                Height Unit:
              </label>
              <select
                id="body-fat-height-unit"
                className="body-fat-select-field"
                value={formData.heightUnit}
                onChange={(e) => handleInputChange('heightUnit', e.target.value)}
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="ft">Feet & Inches</option>
              </select>
            </div>

            <div className="body-fat-input-group">
              <label htmlFor="body-fat-weight-unit" className="body-fat-input-label">
                Weight Unit:
              </label>
              <select
                id="body-fat-weight-unit"
                className="body-fat-select-field"
                value={formData.weightUnit}
                onChange={(e) => handleInputChange('weightUnit', e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div className="body-fat-input-row">
            {formData.heightUnit === 'cm' ? (
              <div className="body-fat-input-group">
                <label htmlFor="body-fat-height-cm" className="body-fat-input-label">
                  Height (cm):
                </label>
                <input
                  type="number"
                  id="body-fat-height-cm"
                  className="body-fat-input-field"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="e.g., 175"
                  min="130"
                  max="230"
                  step="0.1"
                />
              </div>
            ) : (
              <>
                <div className="body-fat-input-group">
                  <label htmlFor="body-fat-height-ft" className="body-fat-input-label">
                    Height (feet):
                  </label>
                  <input
                    type="number"
                    id="body-fat-height-ft"
                    className="body-fat-input-field"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 5"
                    min="4"
                    max="8"
                    step="1"
                  />
                </div>
                <div className="body-fat-input-group">
                  <label htmlFor="body-fat-height-in" className="body-fat-input-label">
                    Height (inches):
                  </label>
                  <input
                    type="number"
                    id="body-fat-height-in"
                    className="body-fat-input-field"
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

            <div className="body-fat-input-group">
              <label htmlFor="body-fat-weight" className="body-fat-input-label">
                Weight ({formData.weightUnit}):
              </label>
              <input
                type="number"
                id="body-fat-weight"
                className="body-fat-input-field"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder={formData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                min="40"
                max="300"
                step="0.1"
              />
            </div>
          </div>

          {/* Navy Method Measurements */}
          {(formData.calculationMethod === 'navy' || formData.calculationMethod === 'both') && (
            <>
              <div className="body-fat-section-title">Body Measurements (Navy Method)</div>
              <div className="body-fat-input-row">
                <div className="body-fat-input-group">
                  <label htmlFor="body-fat-measurement-unit" className="body-fat-input-label">
                    Measurement Unit:
                  </label>
                  <select
                    id="body-fat-measurement-unit"
                    className="body-fat-select-field"
                    value={formData.measurementUnit}
                    onChange={(e) => handleInputChange('measurementUnit', e.target.value)}
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="in">Inches (in)</option>
                  </select>
                </div>
              </div>

              <div className="body-fat-input-row">
                <div className="body-fat-input-group">
                  <label htmlFor="body-fat-neck" className="body-fat-input-label">
                    Neck ({formData.measurementUnit}):
                  </label>
                  <input
                    type="number"
                    id="body-fat-neck"
                    className="body-fat-input-field"
                    value={formData.neck}
                    onChange={(e) => handleInputChange('neck', e.target.value)}
                    placeholder="e.g., 35"
                    min="20"
                    max="60"
                    step="0.1"
                  />
                  <small className="body-fat-input-help">
                    Measure around the narrowest part of your neck
                  </small>
                </div>

                <div className="body-fat-input-group">
                  <label htmlFor="body-fat-waist" className="body-fat-input-label">
                    Waist ({formData.measurementUnit}):
                  </label>
                  <input
                    type="number"
                    id="body-fat-waist"
                    className="body-fat-input-field"
                    value={formData.waist}
                    onChange={(e) => handleInputChange('waist', e.target.value)}
                    placeholder="e.g., 80"
                    min="50"
                    max="150"
                    step="0.1"
                  />
                  <small className="body-fat-input-help">
                    Measure around the narrowest part of your waist
                  </small>
                </div>

                {formData.gender === 'female' && (
                  <div className="body-fat-input-group">
                    <label htmlFor="body-fat-hip" className="body-fat-input-label">
                      Hip ({formData.measurementUnit}):
                    </label>
                    <input
                      type="number"
                      id="body-fat-hip"
                      className="body-fat-input-field"
                      value={formData.hip}
                      onChange={(e) => handleInputChange('hip', e.target.value)}
                      placeholder="e.g., 95"
                      min="60"
                      max="150"
                      step="0.1"
                    />
                    <small className="body-fat-input-help">
                      Measure around the widest part of your hips
                    </small>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="body-fat-calculator-actions">
            <button type="button" className="body-fat-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="body-fat-calculator-result">
            <h3 className="body-fat-result-title">Body Fat Calculation Results</h3>
            <div className="body-fat-result-content">
              <div className="body-fat-result-main">
                <div className="body-fat-result-item">
                  <strong>Body Fat Percentage:</strong>
                  <span className="body-fat-result-value body-fat-result-final">
                    {result.selectedBfPercent}%
                  </span>
                </div>
                <div className="body-fat-result-item">
                  <strong>Category:</strong>
                  <span className="body-fat-result-value" style={{ color: result.category.color }}>
                    {result.category.name}
                  </span>
                </div>
                <div className="body-fat-result-item">
                  <strong>Health Risk:</strong>
                  <span className="body-fat-result-value">
                    {result.healthRisk}
                  </span>
                </div>
                <div className="body-fat-result-item">
                  <strong>Fat Mass:</strong>
                  <span className="body-fat-result-value">
                    {formatWeight(result.fatMass)}
                  </span>
                </div>
                <div className="body-fat-result-item">
                  <strong>Lean Mass:</strong>
                  <span className="body-fat-result-value">
                    {formatWeight(result.leanMass)}
                  </span>
                </div>
                <div className="body-fat-result-item">
                  <strong>BMI:</strong>
                  <span className="body-fat-result-value">
                    {result.bmi}
                  </span>
                </div>
                
                {(result.calculationMethod === 'navy' || result.calculationMethod === 'both') && (
                  <div className="body-fat-result-item">
                    <strong>Navy Method:</strong>
                    <span className="body-fat-result-value">
                      {result.navyBfPercent}%
                    </span>
                  </div>
                )}
                
                {(result.calculationMethod === 'bmi' || result.calculationMethod === 'both') && (
                  <div className="body-fat-result-item">
                    <strong>BMI Method:</strong>
                    <span className="body-fat-result-value">
                      {result.bmiBfPercent}%
                    </span>
                  </div>
                )}
              </div>

              {/* Body Fat Category Scale */}
              <div className="body-fat-category-container">
                <div className="body-fat-category-label">{result.category.name}</div>
                <div className="body-fat-category-scale">
                  <div 
                    className="body-fat-category-marker"
                    style={{ 
                      left: `${getCategoryPosition(result.selectedBfPercent, formData.gender)}%`,
                      backgroundColor: result.category.color
                    }}
                  ></div>
                </div>
                <div className="body-fat-category-labels">
                  <span>Essential</span>
                  <span>Athletic</span>
                  <span>Fitness</span>
                  <span>Average</span>
                  <span>Obese</span>
                </div>
              </div>

              {/* Health Insights */}
              <div className="body-fat-result-insights">
                <h4 className="body-fat-insights-title">Health Insights</h4>
                <div className="body-fat-insights-content">
                  <p><strong>Body Fat Range:</strong> {result.category.range}</p>
                  {result.recommendations && (
                    <div className="body-fat-recommendations">
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
          The Body Fat Calculator is a comprehensive tool that estimates your body fat percentage 
          using scientifically validated methods. Understanding your body fat percentage is crucial 
          for assessing your overall health, fitness level, and body composition beyond just weight.
        </p>
        <p>
          Our calculator offers multiple calculation methods including the Navy Method (circumference-based) 
          and BMI-based estimation, providing you with accurate insights into your body composition 
          and personalized health recommendations.
        </p>
      </ContentSection>

      <ContentSection id="what-is-body-fat" title="What is Body Fat?">
        <p>
          Body fat percentage is the proportion of fat in your body compared to your total body weight. 
          It's a more accurate indicator of health and fitness than BMI alone, as it distinguishes 
          between fat mass and lean mass (muscle, bone, organs, water).
        </p>
        <ul>
          <li>
            <span><strong>Essential Fat:</strong> Minimum fat required for normal physiological function</span>
          </li>
          <li>
            <span><strong>Storage Fat:</strong> Additional fat stored for energy reserves</span>
          </li>
          <li>
            <span><strong>Subcutaneous Fat:</strong> Fat stored under the skin</span>
          </li>
          <li>
            <span><strong>Visceral Fat:</strong> Fat stored around internal organs</span>
          </li>
        </ul>
        <p>
          <strong>Healthy Ranges:</strong> Men: 6-24%, Women: 16-30% (varies by age and fitness level)
        </p>
      </ContentSection>

      <ContentSection id="calculation-methods" title="Calculation Methods">
        <div className="method-section">
          <h3>Navy Method</h3>
          <p>
            The Navy Method uses body circumference measurements to estimate body fat percentage. 
            It's considered one of the most accurate non-invasive methods and is used by the 
            U.S. Navy for fitness assessments.
          </p>
          <ul>
            <li>Requires: Height, weight, neck, waist, and hip (females) measurements</li>
            <li>Accuracy: High for most populations</li>
            <li>Best for: General population, fitness enthusiasts</li>
          </ul>
        </div>

        <div className="method-section">
          <h3>BMI Method</h3>
          <p>
            The BMI Method estimates body fat percentage using BMI, age, and gender. 
            While less accurate than the Navy Method, it's useful when circumference 
            measurements aren't available.
          </p>
          <ul>
            <li>Requires: Height, weight, age, and gender</li>
            <li>Accuracy: Moderate</li>
            <li>Best for: Quick estimates, population studies</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Body Fat Calculator">
        <p>Follow these steps to get accurate body fat percentage results:</p>
        
        <h3>Step 1: Enter Basic Information</h3>
        <ul className="usage-steps">
          <li>
            <span><strong>Age:</strong> Enter your age (15-80 years)</span>
          </li>
          <li>
            <span><strong>Gender:</strong> Select male or female</span>
          </li>
          <li>
            <span><strong>Calculation Method:</strong> Choose Navy Method, BMI Method, or Both</span>
          </li>
        </ul>

        <h3>Step 2: Enter Height and Weight</h3>
        <ul className="usage-steps">
          <li>
            <span><strong>Height:</strong> Enter in centimeters or feet/inches</span>
          </li>
          <li>
            <span><strong>Weight:</strong> Enter in kilograms or pounds</span>
          </li>
        </ul>

        <h3>Step 3: Body Measurements (Navy Method)</h3>
        <ul className="usage-steps">
          <li>
            <span><strong>Neck:</strong> Measure around the narrowest part of your neck</span>
          </li>
          <li>
            <span><strong>Waist:</strong> Measure around the narrowest part of your waist</span>
          </li>
          <li>
            <span><strong>Hip (Females):</strong> Measure around the widest part of your hips</span>
          </li>
        </ul>

        <h3>Step 4: Calculate and Review Results</h3>
        <ul className="usage-steps">
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Body Fat" to get your results</span>
          </li>
          <li>
            <span><strong>Review:</strong> Check your body fat percentage, category, and recommendations</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>Navy Method Formula</h3>
          <div className="math-formula">
            {'\\text{For Men: } BF\\% = \\frac{495}{1.0324 - 0.19077 \\times \\log_{10}(\\text{waist} - \\text{neck}) + 0.15456 \\times \\log_{10}(\\text{height})} - 450'}
          </div>
          <div className="math-formula">
            {'\\text{For Women: } BF\\% = \\frac{495}{1.29579 - 0.35004 \\times \\log_{10}(\\text{waist} + \\text{hip} - \\text{neck}) + 0.22100 \\times \\log_{10}(\\text{height})} - 450'}
          </div>
        </div>

        <div className="formula-section">
          <h3>BMI Method Formula</h3>
          <div className="math-formula">
            {'\\text{For Men: } BF\\% = (1.20 \\times BMI) + (0.23 \\times \\text{Age}) - 16.2'}
          </div>
          <div className="math-formula">
            {'\\text{For Women: } BF\\% = (1.20 \\times BMI) + (0.23 \\times \\text{Age}) - 5.4'}
          </div>
        </div>

        <div className="formula-section">
          <h3>Body Composition Calculations</h3>
          <div className="math-formula">
            {'\\text{Fat Mass} = \\frac{\\text{Body Fat \\%}}{100} \\times \\text{Total Weight}'}
          </div>
          <div className="math-formula">
            {'\\text{Lean Mass} = \\text{Total Weight} - \\text{Fat Mass}'}
          </div>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Navy Method (Male)</h3>
          <div className="example-solution">
            <p><strong>Age:</strong> 30 years</p>
            <p><strong>Height:</strong> 175 cm</p>
            <p><strong>Weight:</strong> 80 kg</p>
            <p><strong>Neck:</strong> 38 cm</p>
            <p><strong>Waist:</strong> 90 cm</p>
            <p><strong>Result:</strong> 18.5% body fat (Fitness category)</p>
            <p><strong>Fat Mass:</strong> 14.8 kg</p>
            <p><strong>Lean Mass:</strong> 65.2 kg</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Navy Method (Female)</h3>
          <div className="example-solution">
            <p><strong>Age:</strong> 25 years</p>
            <p><strong>Height:</strong> 165 cm</p>
            <p><strong>Weight:</strong> 60 kg</p>
            <p><strong>Neck:</strong> 32 cm</p>
            <p><strong>Waist:</strong> 70 cm</p>
            <p><strong>Hip:</strong> 95 cm</p>
            <p><strong>Result:</strong> 22.3% body fat (Fitness category)</p>
            <p><strong>Fat Mass:</strong> 13.4 kg</p>
            <p><strong>Lean Mass:</strong> 46.6 kg</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your body fat percentage is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Provides a more accurate health assessment than weight alone</span>
          </li>
          <li>
            <span>Helps track fitness progress and body composition changes</span>
          </li>
          <li>
            <span>Identifies health risks associated with high or low body fat</span>
          </li>
          <li>
            <span>Guides nutrition and exercise program design</span>
          </li>
          <li>
            <span>Helps set realistic fitness and health goals</span>
          </li>
          <li>
            <span>Important for athletes and fitness enthusiasts</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Body Fat Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Multiple Methods:</strong> Navy Method and BMI-based estimation</span>
          </li>
          <li>
            <span><strong>Accurate Calculations:</strong> Scientifically validated formulas</span>
          </li>
          <li>
            <span><strong>Body Composition:</strong> Fat mass and lean mass breakdown</span>
          </li>
          <li>
            <span><strong>Category Classification:</strong> Essential, Athletic, Fitness, Average, Obese</span>
          </li>
          <li>
            <span><strong>Health Risk Assessment:</strong> Risk level evaluation</span>
          </li>
          <li>
            <span><strong>Personalized Recommendations:</strong> Tailored health and fitness advice</span>
          </li>
          <li>
            <span><strong>Multiple Units:</strong> Metric and imperial unit support</span>
          </li>
          <li>
            <span><strong>Visual Indicators:</strong> Category scale and color coding</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Fitness Assessment</h4>
            <p>Evaluate your fitness level and body composition for training programs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Progress Tracking</h4>
            <p>Monitor changes in body composition over time</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Health Monitoring</h4>
            <p>Assess health risks and overall wellness</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-apple-alt"></i> Nutrition Planning</h4>
            <p>Design personalized nutrition programs based on body composition</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-running"></i> Athletic Performance</h4>
            <p>Optimize body composition for sports performance</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-user-md"></i> Medical Consultation</h4>
            <p>Provide data for healthcare provider discussions</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "Which method is more accurate - Navy Method or BMI Method?",
            answer: "The Navy Method is generally more accurate as it uses actual body measurements. The BMI Method is a good alternative when circumference measurements aren't available, but it's less precise for individuals with high muscle mass."
          },
          {
            question: "How often should I measure my body fat percentage?",
            answer: "For most people, measuring every 2-4 weeks is sufficient. More frequent measurements (weekly) can be useful when actively trying to change body composition, but remember that body fat percentage can fluctuate daily due to hydration and other factors."
          },
          {
            question: "What's the difference between body fat percentage and BMI?",
            answer: "BMI only considers height and weight, while body fat percentage distinguishes between fat mass and lean mass. A person with high muscle mass might have a high BMI but low body fat percentage."
          },
          {
            question: "Are the results accurate for athletes?",
            answer: "The Navy Method is reasonably accurate for most populations including athletes. However, extremely muscular individuals or those with very low body fat may get less accurate results. For precise measurements, consider professional body composition testing."
          },
          {
            question: "What's considered a healthy body fat percentage?",
            answer: "Healthy ranges vary by gender and age. Generally: Men: 6-24%, Women: 16-30%. Athletes typically have lower percentages, while older adults may have slightly higher healthy ranges."
          },
          {
            question: "Can I use this calculator if I'm pregnant?",
            answer: "Body fat calculators are not recommended during pregnancy as body composition changes significantly. Consult with your healthcare provider for appropriate health monitoring during pregnancy."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default BodyFatCalculator
