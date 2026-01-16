import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/bri-calculator.css'
import Seo from '../Seo'

// BRI Calculator Logic Class (embedded)
class BRICalculatorLogic {
  constructor() {
    this.riskCategories = {
      veryLow: { min: 0, max: 1, label: 'Very Low', color: '#4caf50' },
      low: { min: 1, max: 2, label: 'Low', color: '#8bc34a' },
      moderate: { min: 2, max: 3, label: 'Moderate', color: '#ffc107' },
      high: { min: 3, max: 4, label: 'High', color: '#ff9800' },
      veryHigh: { min: 4, max: Infinity, label: 'Very High', color: '#f44336' }
    };
    this.bodyShapeThresholds = {
      male: { pear: 0.85, avocado: 0.95 },
      female: { pear: 0.75, avocado: 0.85 }
    };
  }

  calculate(formData) {
    const gender = formData.gender;
    const age = parseInt(formData.age);
    const heightCm = this.getHeightInCm(formData);
    const weightKg = this.getWeightInKg(formData);
    const waistCm = this.getWaistInCm(formData);
    const hipCm = this.getHipInCm(formData);

    const bri = this.calculateBRI(heightCm, waistCm);
    const bmi = this.calculateBMI(weightKg, heightCm);
    const whtr = this.calculateWHTR(waistCm, heightCm);
    const whr = this.calculateWHR(waistCm, hipCm);

    const bodyShape = this.determineBodyShape(gender, whr);
    const healthRisk = this.determineHealthRisk(bri, bmi, whtr, whr, gender, age);
    const riskCategory = this.getRiskCategory(bri);
    const recommendations = this.generateRecommendations(bri, bmi, whtr, whr, healthRisk, age, gender);

    return {
      userInfo: { gender, age, height: this.formatHeight(formData), weight: this.formatWeight(formData), waist: this.formatWaist(formData), hip: this.formatHip(formData) },
      primaryMetrics: { bri: Math.round(bri * 100) / 100, bmi: Math.round(bmi * 10) / 10, whtr: Math.round(whtr * 100) / 100, whr: Math.round(whr * 100) / 100 },
      bodyShape, healthRisk, riskCategory, recommendations
    };
  }

  calculateBRI(heightCm, waistCm) {
    const heightM = heightCm / 100;
    const waistM = waistCm / 100;
    const ratio = waistM / (2 * Math.PI * heightM);
    const eccentricity = Math.sqrt(1 - Math.pow(ratio, 2));
    const bri = 364.2 - (365.5 * eccentricity);
    return Math.max(0, bri);
  }

  calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  calculateWHTR(waistCm, heightCm) {
    return waistCm / heightCm;
  }

  calculateWHR(waistCm, hipCm) {
    return waistCm / hipCm;
  }

  determineBodyShape(gender, whr) {
    const thresholds = this.bodyShapeThresholds[gender];
    let shape, description, characteristics;

    if (whr < thresholds.pear) {
      shape = 'Pear'; description = 'Lower body fat distribution';
      characteristics = 'Fat storage primarily in hips, thighs, and buttocks. Generally lower cardiovascular risk.';
    } else if (whr < thresholds.avocado) {
      shape = 'Avocado'; description = 'Balanced fat distribution';
      characteristics = 'Even distribution of body fat. Moderate cardiovascular risk.';
    } else {
      shape = 'Apple'; description = 'Upper body fat distribution';
      characteristics = 'Fat storage primarily in abdomen and waist. Higher cardiovascular risk.';
    }

    return { shape, description, characteristics, whr: Math.round(whr * 100) / 100 };
  }

  determineHealthRisk(bri, bmi, whtr, whr, gender, age) {
    let risk = this.getRiskCategory(bri).label;
    let level = this.getRiskLevel(bri);
    let factors = [];

    if (whtr > 0.6) { factors.push('High waist-to-height ratio'); if (risk === 'Low') risk = 'Moderate'; }
    if (bmi >= 30) { factors.push('Obesity (BMI ≥ 30)'); if (risk === 'Low') risk = 'Moderate'; }
    if (age >= 50) factors.push('Age-related risk factors');

    return { risk, level, factors, score: this.calculateRiskScore(bri, bmi, whtr, whr, age) };
  }

  getRiskCategory(bri) {
    for (const [key, category] of Object.entries(this.riskCategories)) {
      if (bri >= category.min && bri < category.max) {
        return { key, ...category, range: `${category.min}-${category.max === Infinity ? '∞' : category.max}` };
      }
    }
    return this.riskCategories.veryHigh;
  }

  getRiskLevel(bri) {
    if (bri < 1) return 'Excellent health profile';
    if (bri < 2) return 'Good health profile';
    if (bri < 3) return 'Increased health risk';
    if (bri < 4) return 'High health risk';
    return 'Very high health risk';
  }

  calculateRiskScore(bri, bmi, whtr, whr, age) {
    let score = Math.min(bri * 10, 40);
    if (bmi >= 30) score += 25; else if (bmi >= 25) score += 15;
    if (whtr > 0.6) score += 20; else if (whtr > 0.5) score += 10;
    if (age >= 65) score += 10; else if (age >= 50) score += 5;
    if (whr > 0.9) score += 5;
    return Math.min(Math.round(score), 100);
  }

  generateRecommendations(bri, bmi, whtr, whr, healthRisk, age, gender) {
    const recommendations = [];
    
    if (bri < 1) {
      recommendations.push({ category: 'Maintenance', title: '🌟 Excellent Body Composition', items: ['Maintain your current healthy lifestyle', 'Continue regular physical activity (150+ min/week)', 'Keep following a balanced, nutrient-rich diet'] });
    } else if (bri < 2) {
      recommendations.push({ category: 'Optimization', title: '✅ Good Body Composition', items: ['Aim for 150-300 minutes of moderate exercise weekly', 'Include both cardio and strength training', 'Focus on whole foods, lean proteins, fruits, and vegetables'] });
    } else if (bri < 3) {
      recommendations.push({ category: 'Improvement', title: '⚠️ Moderate Health Risk', items: ['Consult with a healthcare provider about your body composition', 'Target waist reduction through diet and exercise', 'Increase physical activity to 300+ minutes per week'] });
    } else {
      recommendations.push({ category: 'Action Required', title: '🚨 High Health Risk - Take Action', items: ['Schedule an appointment with your healthcare provider immediately', 'Request screening for diabetes and cardiovascular disease', 'Work with a healthcare team (doctor, nutritionist, trainer)'] });
    }

    if (bmi >= 30) recommendations.push({ category: 'Weight Management', title: '📊 BMI Consideration', items: ['Your BMI indicates obesity - consider comprehensive weight management', 'Focus on sustainable lifestyle changes rather than quick fixes'] });
    if (age >= 50) recommendations.push({ category: 'Age-Specific', title: '🎂 Age-Related Considerations', items: ['Focus on maintaining muscle mass through strength training', 'Ensure adequate calcium and vitamin D intake for bone health'] });

    recommendations.push({ category: 'General Health', title: '💡 General Recommendations', items: ['Stay hydrated throughout the day', 'Get adequate sleep (7-9 hours per night)', 'Manage stress through relaxation techniques'] });
    
    return recommendations;
  }

  getHeightInCm(formData) {
    if (formData.heightUnit === 'cm') return parseFloat(formData.height) || 0;
    const feet = parseFloat(formData.heightFeet) || 0;
    const inches = parseFloat(formData.heightInches) || 0;
    return (feet * 30.48) + (inches * 2.54);
  }

  getWeightInKg(formData) {
    const weight = parseFloat(formData.weight) || 0;
    return formData.weightUnit === 'kg' ? weight : weight * 0.453592;
  }

  getWaistInCm(formData) {
    const waist = parseFloat(formData.waist) || 0;
    return formData.waistUnit === 'cm' ? waist : waist * 2.54;
  }

  getHipInCm(formData) {
    const hip = parseFloat(formData.hip) || 0;
    return formData.hipUnit === 'cm' ? hip : hip * 2.54;
  }

  formatHeight(formData) {
    return formData.heightUnit === 'cm' ? `${formData.height} cm` : `${formData.heightFeet}'${formData.heightInches}"`;
  }

  formatWeight(formData) { return `${formData.weight} ${formData.weightUnit}`; }
  formatWaist(formData) { return `${formData.waist} ${formData.waistUnit}`; }
  formatHip(formData) { return `${formData.hip} ${formData.hipUnit}`; }

  validateInputs(formData) {
    const errors = [];
    if (!formData.gender) errors.push('Please select your gender.');
    
    const age = parseInt(formData.age);
    if (!age || age < 18 || age > 120) errors.push('Age must be between 18 and 120 years.');
    
    if (formData.heightUnit === 'cm') {
      const height = parseFloat(formData.height);
      if (!height || height < 100 || height > 250) errors.push('Height must be between 100 and 250 cm.');
    } else {
      const feet = parseFloat(formData.heightFeet);
      const inches = parseFloat(formData.heightInches);
      if (!feet || feet < 3 || feet > 8) errors.push('Height must be between 3 and 8 feet.');
      if (inches === undefined || inches < 0 || inches > 11) errors.push('Inches must be between 0 and 11.');
    }
    
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) errors.push('Please enter a valid weight.');
    
    const waist = parseFloat(formData.waist);
    if (!waist || waist <= 0) errors.push('Please enter a valid waist circumference.');
    
    const hip = parseFloat(formData.hip);
    if (!hip || hip <= 0) errors.push('Please enter a valid hip circumference.');
    
    return { isValid: errors.length === 0, errors };
  }
}

const BRICalculator = () => {
  const [formData, setFormData] = useState({
    gender: '', age: '', height: '', heightFeet: '', heightInches: '', heightUnit: 'cm',
    weight: '', weightUnit: 'kg', waist: '', waistUnit: 'cm', hip: '', hipUnit: 'cm'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const toolData = {
    name: 'BRI Calculator',
    description: 'Calculate your Body Roundness Index (BRI) with comprehensive body composition analysis, health risk assessment, and personalized recommendations based on advanced body shape metrics.',
    icon: 'fas fa-circle-notch',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'BRI Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, body roundness index, health risk assessment, body composition`;
  const canonicalUrl = `https://tuitility.vercel.app/health/calculators/bri-calculator`;

  const categories = [
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Utility', url: '/utility', icon: 'fas fa-wrench' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  const relatedTools = [
    { name: 'BMI Calculator', url: '/health/calculators/bmi-calculator', icon: 'fas fa-weight' },
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user-circle' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'DRI Calculator', url: '/health/calculators/dri-calculator', icon: 'fas fa-utensils' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-bri', title: 'What is BRI?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'calculation-method', title: 'Calculation Method' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateInputs = () => {
    const calculator = new BRICalculatorLogic();
    const validation = calculator.validateInputs(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return false;
    }
    return true;
  };

  const calculateBRI = () => {
    if (!validateInputs()) return;

    try {
      const calculator = new BRICalculatorLogic();
      const result = calculator.calculate(formData);
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
      gender: '', age: '', height: '', heightFeet: '', heightInches: '', heightUnit: 'cm',
      weight: '', weightUnit: 'kg', waist: '', waistUnit: 'cm', hip: '', hipUnit: 'cm'
    });
    setResult(null);
    setError('');
  };

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
          title="BRI Calculator"
          onCalculate={calculateBRI}
          calculateButtonText="Calculate BRI"
          error={error}
          result={null}
        >
          <div className="bri-calculator-form">
            <div className="bri-section-title">Body Measurements</div>
            
            <div className="bri-input-row">
              <div className="bri-input-group">
                <label htmlFor="bri-gender" className="bri-input-label">Gender:</label>
                <select id="bri-gender" className="bri-select-field" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="bri-input-group">
                <label htmlFor="bri-age" className="bri-input-label">Age (years):</label>
                <input type="number" id="bri-age" className="bri-input-field" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="e.g., 30" min="18" max="120" />
              </div>
            </div>

            <div className="bri-input-row">
              <div className="bri-input-group">
                <label htmlFor="bri-height-unit" className="bri-input-label">Height Unit:</label>
                <select id="bri-height-unit" className="bri-select-field" value={formData.heightUnit} onChange={(e) => handleInputChange('heightUnit', e.target.value)}>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft">Feet & Inches</option>
                </select>
              </div>

              {formData.heightUnit === 'cm' ? (
                <div className="bri-input-group">
                  <label htmlFor="bri-height" className="bri-input-label">Height (cm):</label>
                  <input type="number" id="bri-height" className="bri-input-field" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} placeholder="e.g., 175" min="100" max="250" />
                </div>
              ) : (
                <>
                  <div className="bri-input-group">
                    <label htmlFor="bri-height-feet" className="bri-input-label">Height (feet):</label>
                    <input type="number" id="bri-height-feet" className="bri-input-field" value={formData.heightFeet} onChange={(e) => handleInputChange('heightFeet', e.target.value)} placeholder="e.g., 5" min="3" max="8" />
                  </div>
                  <div className="bri-input-group">
                    <label htmlFor="bri-height-inches" className="bri-input-label">Height (inches):</label>
                    <input type="number" id="bri-height-inches" className="bri-input-field" value={formData.heightInches} onChange={(e) => handleInputChange('heightInches', e.target.value)} placeholder="e.g., 9" min="0" max="11" />
                  </div>
                </>
              )}
            </div>

            <div className="bri-input-row">
              <div className="bri-input-group">
                <label htmlFor="bri-weight-unit" className="bri-input-label">Weight Unit:</label>
                <select id="bri-weight-unit" className="bri-select-field" value={formData.weightUnit} onChange={(e) => handleInputChange('weightUnit', e.target.value)}>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>

              <div className="bri-input-group">
                <label htmlFor="bri-weight" className="bri-input-label">Weight:</label>
                <input type="number" id="bri-weight" className="bri-input-field" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} placeholder="e.g., 70" min="30" step="0.1" />
              </div>
            </div>

            <div className="bri-input-row">
              <div className="bri-input-group">
                <label htmlFor="bri-waist-unit" className="bri-input-label">Waist Unit:</label>
                <select id="bri-waist-unit" className="bri-select-field" value={formData.waistUnit} onChange={(e) => handleInputChange('waistUnit', e.target.value)}>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div className="bri-input-group">
                <label htmlFor="bri-waist" className="bri-input-label">Waist Circumference:</label>
                <input type="number" id="bri-waist" className="bri-input-field" value={formData.waist} onChange={(e) => handleInputChange('waist', e.target.value)} placeholder="e.g., 80" min="40" step="0.1" />
              </div>

              <div className="bri-input-group">
                <label htmlFor="bri-hip-unit" className="bri-input-label">Hip Unit:</label>
                <select id="bri-hip-unit" className="bri-select-field" value={formData.hipUnit} onChange={(e) => handleInputChange('hipUnit', e.target.value)}>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>
            </div>

            <div className="bri-input-row">
              <div className="bri-input-group">
                <label htmlFor="bri-hip" className="bri-input-label">Hip Circumference:</label>
                <input type="number" id="bri-hip" className="bri-input-field" value={formData.hip} onChange={(e) => handleInputChange('hip', e.target.value)} placeholder="e.g., 100" min="40" step="0.1" />
              </div>
            </div>

            <div className="bri-calculator-actions">
              <button type="button" className="bri-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bri-calculator-result">
              <h3 className="bri-result-title">Your Body Roundness Index (BRI) Results</h3>
              <div className="bri-result-content">
                
                {/* Primary Metrics */}
                <div className="bri-result-section">
                  <h4 className="bri-result-section-title">Primary Metrics</h4>
                  <div className="bri-result-item">
                    <strong>Body Roundness Index (BRI):</strong>
                    <span className="bri-result-value bri-result-final">{result.primaryMetrics.bri}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Body Mass Index (BMI):</strong>
                    <span className="bri-result-value">{result.primaryMetrics.bmi}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Waist-to-Height Ratio:</strong>
                    <span className="bri-result-value">{result.primaryMetrics.whtr}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Waist-to-Hip Ratio:</strong>
                    <span className="bri-result-value">{result.primaryMetrics.whr}</span>
                  </div>
                </div>

                {/* Body Shape & Health Risk */}
                <div className="bri-result-section">
                  <h4 className="bri-result-section-title">Body Composition Analysis</h4>
                  <div className="bri-result-item">
                    <strong>Body Shape:</strong>
                    <span className="bri-result-value">{result.bodyShape.shape}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Shape Description:</strong>
                    <span className="bri-result-value">{result.bodyShape.description}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Health Risk Level:</strong>
                    <span className="bri-result-value">{result.healthRisk.risk}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Risk Assessment:</strong>
                    <span className="bri-result-value">{result.healthRisk.level}</span>
                  </div>
                  <div className="bri-result-item">
                    <strong>Risk Score:</strong>
                    <span className="bri-result-value">{result.healthRisk.score}/100</span>
                  </div>
                </div>

                {/* Risk Factors */}
                {result.healthRisk.factors.length > 0 && (
                  <div className="bri-result-section">
                    <h4 className="bri-result-section-title">Risk Factors</h4>
                    <div className="bri-risk-factors">
                      {result.healthRisk.factors.map((factor, index) => (
                        <div key={index} className="bri-risk-factor-item">
                          <i className="fas fa-exclamation-triangle"></i>
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="bri-result-section">
                    <h4 className="bri-result-section-title">Personalized Recommendations</h4>
                    <div className="bri-recommendations">
                      {result.recommendations.map((rec, index) => (
                        <div key={index} className="bri-recommendation-category">
                          <h5 className="bri-recommendation-title">{rec.title}</h5>
                          <div className="bri-recommendation-items">
                            {rec.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bri-recommendation-item">
                                <i className="fas fa-check-circle"></i>
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
            The Body Roundness Index (BRI) Calculator is an advanced tool that provides a more comprehensive 
            assessment of body composition compared to traditional BMI. BRI considers body shape and fat 
            distribution patterns to give you a better understanding of your health risks.
          </p>
          <p>
            Our calculator analyzes your body measurements to determine your BRI, body shape category, and 
            provides personalized health recommendations based on scientific research and medical guidelines.
          </p>
        </ContentSection>

        <ContentSection id="what-is-bri" title="What is BRI?">
          <p>
            Body Roundness Index (BRI) is a mathematical formula that estimates body fat distribution and 
            body shape based on height and waist circumference. Unlike BMI, which only considers height 
            and weight, BRI provides insights into how fat is distributed around your body.
          </p>
          <ul>
            <li><strong>BRI Formula:</strong> 364.2 - 365.5 × √(1 - (waist/(2π×height))²)</li>
            <li><strong>Range:</strong> Typically 0-15, with lower values indicating less health risk</li>
            <li><strong>Advantage:</strong> Better predictor of cardiovascular risk than BMI alone</li>
            <li><strong>Application:</strong> Useful for assessing abdominal obesity and metabolic health</li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Calculator">
          <p>Follow these steps to calculate your BRI:</p>
          
          <h3>Step 1: Personal Information</h3>
          <ul className="usage-steps">
            <li><strong>Gender & Age:</strong> Select your gender and enter your age</li>
            <li><strong>Height:</strong> Enter your height in centimeters or feet/inches</li>
            <li><strong>Weight:</strong> Enter your current weight in kg or pounds</li>
          </ul>

          <h3>Step 2: Body Measurements</h3>
          <ul className="usage-steps">
            <li><strong>Waist Circumference:</strong> Measure at the narrowest part of your waist</li>
            <li><strong>Hip Circumference:</strong> Measure at the widest part of your hips</li>
            <li><strong>Measurement Tips:</strong> Use a flexible measuring tape, measure over light clothing</li>
          </ul>

          <h3>Step 3: Calculate and Review</h3>
          <ul className="usage-steps">
            <li><strong>Calculate:</strong> Click "Calculate BRI" to get your results</li>
            <li><strong>Review:</strong> Check all metrics, body shape, and health recommendations</li>
          </ul>
        </ContentSection>

        <ContentSection id="calculation-method" title="Calculation Method">
          <p>
            The BRI calculation uses advanced mathematical formulas to assess body composition:
          </p>
          
          <div className="calculation-method-section">
            <h3>BRI Formula Breakdown</h3>
            <ul>
              <li><strong>Step 1:</strong> Calculate waist-to-height ratio</li>
              <li><strong>Step 2:</strong> Apply geometric transformation using ellipse eccentricity</li>
              <li><strong>Step 3:</strong> Convert to BRI scale (0-15 range)</li>
              <li><strong>Step 4:</strong> Interpret results based on risk categories</li>
            </ul>
          </div>

          <div className="calculation-method-section">
            <h3>Additional Metrics</h3>
            <ul>
              <li><strong>BMI:</strong> Weight (kg) ÷ Height (m)²</li>
              <li><strong>WHtR:</strong> Waist circumference ÷ Height</li>
              <li><strong>WHR:</strong> Waist circumference ÷ Hip circumference</li>
              <li><strong>Risk Score:</strong> Composite score based on all metrics</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Low Risk Profile</h3>
            <div className="example-solution">
              <p><strong>Profile:</strong> 30-year-old female, 165cm, 60kg, 75cm waist, 95cm hips</p>
              <p><strong>BRI:</strong> ~1.2 (Low risk)</p>
              <p><strong>Body Shape:</strong> Pear (healthy fat distribution)</p>
              <p><strong>Recommendation:</strong> Maintain current lifestyle</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Moderate Risk Profile</h3>
            <div className="example-solution">
              <p><strong>Profile:</strong> 45-year-old male, 175cm, 85kg, 95cm waist, 100cm hips</p>
              <p><strong>BRI:</strong> ~2.8 (Moderate risk)</p>
              <p><strong>Body Shape:</strong> Apple (increased cardiovascular risk)</p>
              <p><strong>Recommendation:</strong> Focus on waist reduction and lifestyle changes</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding your BRI is important for:</p>
          <ul>
            <li>Better assessment of cardiovascular disease risk</li>
            <li>Early detection of metabolic syndrome</li>
            <li>Monitoring body composition changes over time</li>
            <li>Personalized health and fitness planning</li>
            <li>Understanding the impact of fat distribution on health</li>
            <li>Complementing other health assessments</li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our BRI Calculator provides comprehensive functionality:</p>
          <ul>
            <li><strong>Advanced BRI Calculation:</strong> Using the complete mathematical formula</li>
            <li><strong>Multiple Body Metrics:</strong> BRI, BMI, WHtR, WHR calculations</li>
            <li><strong>Body Shape Analysis:</strong> Apple, pear, or avocado body type classification</li>
            <li><strong>Risk Assessment:</strong> Comprehensive health risk evaluation</li>
            <li><strong>Personalized Recommendations:</strong> Tailored advice based on your results</li>
            <li><strong>Multiple Units:</strong> Support for metric and imperial measurements</li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-heartbeat"></i> Health Assessment</h4>
              <p>Evaluate cardiovascular and metabolic health risks</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Progress Tracking</h4>
              <p>Monitor body composition changes over time</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-dumbbell"></i> Fitness Planning</h4>
              <p>Design targeted exercise programs</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-user-md"></i> Medical Screening</h4>
              <p>Support healthcare professional assessments</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-apple-alt"></i> Nutrition Planning</h4>
              <p>Develop personalized dietary strategies</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-shield-alt"></i> Prevention</h4>
              <p>Early detection of health risk factors</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "How accurate is the BRI calculator?",
              answer: "BRI is based on validated mathematical formulas and provides a good estimate of body fat distribution. However, it's a screening tool and should complement, not replace, professional medical assessment."
            },
            {
              question: "What's the difference between BRI and BMI?",
              answer: "BMI only considers height and weight, while BRI incorporates waist circumference to assess body shape and fat distribution. BRI is often a better predictor of health risks related to abdominal obesity."
            },
            {
              question: "What is a good BRI score?",
              answer: "Generally, BRI values under 1 indicate very low risk, 1-2 is low risk, 2-3 is moderate risk, 3-4 is high risk, and above 4 is very high risk. However, interpretation should consider individual factors."
            },
            {
              question: "How often should I calculate my BRI?",
              answer: "For general health monitoring, calculating BRI every 3-6 months is sufficient. If you're actively trying to change your body composition, monthly calculations can help track progress."
            },
            {
              question: "Can BRI be used for children?",
              answer: "This calculator is designed for adults (18+). Children and adolescents have different body composition patterns and require specialized pediatric assessment tools."
            },
            {
              question: "What should I do if I have a high BRI?",
              answer: "If your BRI indicates moderate to high risk, consult with a healthcare provider. Focus on sustainable lifestyle changes including regular exercise, healthy diet, and stress management."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default BRICalculator