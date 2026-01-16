import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/diabetes-risk-calculator.css'
import Seo from '../Seo'

// Diabetes Risk Calculator Logic Class
class DiabetesRiskCalculatorLogic {
  constructor() {
    this.riskCategories = {
      low: { min: 0, max: 6, label: 'Low', color: '#2ecc71', percentage: '1 in 100' },
      slightlyElevated: { min: 7, max: 11, label: 'Slightly Elevated', color: '#f1c40f', percentage: '1 in 25' },
      moderate: { min: 12, max: 14, label: 'Moderate', color: '#e67e22', percentage: '1 in 6' },
      high: { min: 15, max: 20, label: 'High', color: '#e74c3c', percentage: '1 in 3' },
      veryHigh: { min: 21, max: 26, label: 'Very High', color: '#8b5cf6', percentage: '1 in 2' }
    };
    this.bmiCategories = {
      normal: { min: 0, max: 25, label: 'Normal', color: '#2ecc71' },
      overweight: { min: 25, max: 30, label: 'Overweight', color: '#f1c40f' },
      obese: { min: 30, max: 100, label: 'Obese', color: '#e74c3c' }
    };
  }

  calculate(formData) {
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const height = this.getHeightInCm(formData);
    const weight = parseFloat(formData.weight);
    const waist = parseInt(formData.waist);
    const physicalActivity = parseInt(formData.physicalActivity);
    const diet = parseInt(formData.diet);
    const medication = parseInt(formData.medication);
    const bloodGlucose = parseInt(formData.bloodGlucose);
    const familyDiabetes = parseInt(formData.familyDiabetes);

    const bmi = this.calculateBMI(height, weight);
    const bmiScore = this.getBMIScore(bmi);
    const bmiCategory = this.getBMICategory(bmi);
    const ageScore = this.getAgeScore(age);
    const waistScore = this.getWaistScore(waist, gender);
    const totalScore = ageScore + bmiScore + waistScore + physicalActivity + diet + medication + bloodGlucose + familyDiabetes;
    const riskLevel = this.getRiskLevel(totalScore);
    const recommendations = this.generateRecommendations(totalScore, riskLevel, bmi, bmiCategory);
    const riskBreakdown = this.getRiskBreakdown(ageScore, bmiScore, waistScore, physicalActivity, diet, medication, bloodGlucose, familyDiabetes);

    return {
      totalScore,
      riskLevel,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      riskBreakdown,
      recommendations,
      height,
      weight
    };
  }

  calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  getBMIScore(bmiValue) {
    if (bmiValue < 25) return 0;
    if (bmiValue >= 25 && bmiValue <= 30) return 1;
    return 3;
  }

  getBMICategory(bmi) {
    for (const [key, category] of Object.entries(this.bmiCategories)) {
      if (bmi >= category.min && bmi < category.max) {
        return { name: category.label, color: category.color, key };
      }
    }
    return { name: 'Out of Range', color: '#95a5a6', key: 'outOfRange' };
  }

  getAgeScore(age) {
    if (age < 45) return 0;
    if (age >= 45 && age <= 54) return 2;
    if (age >= 55 && age <= 64) return 3;
    return 4;
  }

  getWaistScore(waist, gender) {
    // The waist value is already the score from the select option (0, 3, or 4)
    return parseInt(waist) || 0;
  }

  getRiskLevel(totalScore) {
    for (const [key, category] of Object.entries(this.riskCategories)) {
      if (totalScore >= category.min && totalScore <= category.max) {
        return { name: category.label, color: category.color, percentage: category.percentage, key };
      }
    }
    return { name: 'Very High', color: '#8b5cf6', percentage: '1 in 2', key: 'veryHigh' };
  }

  getRiskBreakdown(ageScore, bmiScore, waistScore, physicalActivity, diet, medication, bloodGlucose, familyDiabetes) {
    return [
      { name: 'Age', score: ageScore, maxScore: 4 },
      { name: 'BMI', score: bmiScore, maxScore: 3 },
      { name: 'Waist Circumference', score: waistScore, maxScore: 4 },
      { name: 'Physical Activity', score: physicalActivity, maxScore: 2 },
      { name: 'Diet', score: diet, maxScore: 2 },
      { name: 'Medication', score: medication, maxScore: 2 },
      { name: 'Blood Glucose', score: bloodGlucose, maxScore: 5 },
      { name: 'Family History', score: familyDiabetes, maxScore: 5 }
    ];
  }

  generateRecommendations(score, riskLevel, bmiValue, bmiCategory) {
    const recommendations = [];

    recommendations.push({
      type: 'general',
      title: `Your diabetes risk level is ${riskLevel.name}`,
      content: `Your calculated BMI is ${bmiValue.toFixed(1)} kg/m² (${bmiCategory.name}).`
    });

    if (score < 7) {
      recommendations.push({
        type: 'low-risk',
        title: 'Your current risk of developing type 2 diabetes is low.',
        subtitle: 'To maintain your low risk:',
        items: [
          'Continue your healthy lifestyle habits',
          'Maintain a healthy weight',
          'Stay physically active with at least 30 minutes of activity daily',
          'Keep eating a balanced diet rich in fruits and vegetables'
        ],
        note: 'Consider rechecking your risk every 5 years, or sooner if your health status changes.'
      });
    } else if (score >= 7 && score <= 11) {
      recommendations.push({
        type: 'slightly-elevated',
        title: 'Your risk of developing type 2 diabetes is slightly elevated.',
        subtitle: 'Consider these steps:',
        items: [
          'Aim to lose 5-7% of your body weight if overweight',
          'Increase physical activity to at least 150 minutes per week',
          'Reduce intake of processed foods and sugary beverages',
          'Increase consumption of whole grains, lean proteins, and vegetables'
        ],
        note: 'Consider discussing your risk with a healthcare provider during your next visit.'
      });
    } else if (score >= 12 && score <= 14) {
      recommendations.push({
        type: 'moderate',
        title: 'Your risk of developing type 2 diabetes is moderate.',
        subtitle: 'Take action with these steps:',
        items: [
          'Schedule a check-up with your healthcare provider to discuss your diabetes risk',
          'Ask about getting your blood glucose levels tested',
          'Work on achieving a healthier weight through diet and exercise',
          'Aim for 30 minutes of moderate exercise most days of the week',
          'Consider consulting with a dietitian for personalized nutrition advice'
        ],
        note: 'Regular monitoring of your health is recommended.'
      });
    } else if (score >= 15) {
      recommendations.push({
        type: 'high-risk',
        title: `Your risk of developing type 2 diabetes is ${riskLevel.name.toLowerCase()}.`,
        subtitle: 'Take these important steps:',
        items: [
          'Make an appointment with your healthcare provider soon to discuss your diabetes risk',
          'Request blood glucose testing to check for prediabetes or diabetes',
          'Consider participating in a diabetes prevention program',
          'Make significant lifestyle changes including diet improvements and increased physical activity',
          'Monitor other health conditions like blood pressure and cholesterol',
          'If recommended by your doctor, consider medication options to help prevent diabetes'
        ],
        note: 'Taking action now can significantly reduce your risk of developing type 2 diabetes.'
      });
    }

    if (bmiValue >= 25) {
      recommendations.push({
        type: 'bmi-recommendation',
        title: 'BMI Recommendation:',
        content: `Your BMI is ${bmiValue.toFixed(1)}, which is ${bmiValue >= 30 ? 'in the obese range' : 'overweight'}.`,
        note: 'Weight loss of 5-10% can significantly reduce your diabetes risk and improve overall health.'
      });
    }

    return recommendations;
  }

  getHeightInCm(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height);
    } else {
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 30.48) + (inches * 2.54);
    }
  }

  validateInputs(formData) {
    const errors = [];
    const age = parseInt(formData.age);
    if (!age || age < 18 || age > 120) {
      errors.push('Please enter a valid age between 18 and 120.');
    }
    const height = this.getHeightInCm(formData);
    if (!height || height < 100 || height > 250) {
      errors.push('Please enter a valid height between 100-250 cm or 3-8 feet.');
    }
    const weight = parseFloat(formData.weight);
    if (!weight || weight < 30 || weight > 300) {
      errors.push('Please enter a valid weight between 30-300 kg or 66-660 lbs.');
    }
    const waist = parseInt(formData.waist);
    if (waist === undefined || waist === null || waist < 0 || waist > 4) {
      errors.push('Please select a valid waist circumference range.');
    }
    return { isValid: errors.length === 0, errors };
  }
}

const DiabetesRiskCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '',
    heightInches: '',
    heightUnit: 'cm',
    weight: '',
    waist: '',
    physicalActivity: '0',
    diet: '0',
    medication: '0',
    bloodGlucose: '0',
    familyDiabetes: '0'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const toolData = {
    name: 'Diabetes Risk Calculator',
    description: 'Assess your risk of developing type 2 diabetes using a comprehensive risk assessment tool. Get personalized recommendations and health insights based on your lifestyle and health factors.',
    icon: 'fas fa-chart-pie',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Diabetes Risk Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, type 2 diabetes risk, health assessment, risk score`;
  const canonicalUrl = `https://tuitility.vercel.app/health/calculators/diabetes-risk-calculator`;

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
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-diabetes-risk', title: 'What is Diabetes Risk?' },
    { id: 'risk-factors', title: 'Risk Factors' },
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
    const calculator = new DiabetesRiskCalculatorLogic();
    const validation = calculator.validateInputs(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return false;
    }
    return true;
  };

  const calculateDiabetesRisk = () => {
    if (!validateInputs()) return;

    try {
      const calculator = new DiabetesRiskCalculatorLogic();
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
      age: '',
      gender: 'male',
      height: '',
      heightInches: '',
      heightUnit: 'cm',
      weight: '',
      waist: '',
      physicalActivity: '0',
      diet: '0',
      medication: '0',
      bloodGlucose: '0',
      familyDiabetes: '0'
    });
    setResult(null);
    setError('');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.katex) {
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
          title="Diabetes Risk Calculator"
          onCalculate={calculateDiabetesRisk}
          calculateButtonText="Calculate Diabetes Risk"
          error={error}
          result={null}
        >
          <div className="diabetes-risk-calculator-form">
            <div className="diabetes-risk-section-title">Personal Information</div>
            <div className="diabetes-risk-input-row">
              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-age" className="diabetes-risk-input-label">
                  Age (years):
                </label>
                <input
                  type="number"
                  id="diabetes-risk-age"
                  className="diabetes-risk-input-field"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g., 45"
                  min="18"
                  max="120"
                  step="1"
                />
              </div>

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-gender" className="diabetes-risk-input-label">
                  Gender:
                </label>
                <select
                  id="diabetes-risk-gender"
                  className="diabetes-risk-select-field"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-height-unit" className="diabetes-risk-input-label">
                  Height Unit:
                </label>
                <select
                  id="diabetes-risk-height-unit"
                  className="diabetes-risk-select-field"
                  value={formData.heightUnit}
                  onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft">Feet & Inches</option>
                </select>
              </div>
            </div>

            <div className="diabetes-risk-input-row">
              {formData.heightUnit === 'cm' ? (
                <div className="diabetes-risk-input-group">
                  <label htmlFor="diabetes-risk-height-cm" className="diabetes-risk-input-label">
                    Height (cm):
                  </label>
                  <input
                    type="number"
                    id="diabetes-risk-height-cm"
                    className="diabetes-risk-input-field"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 175"
                    min="100"
                    max="250"
                    step="0.1"
                  />
                </div>
              ) : (
                <>
                  <div className="diabetes-risk-input-group">
                    <label htmlFor="diabetes-risk-height-ft" className="diabetes-risk-input-label">
                      Height (feet):
                    </label>
                    <input
                      type="number"
                      id="diabetes-risk-height-ft"
                      className="diabetes-risk-input-field"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="e.g., 5"
                      min="3"
                      max="8"
                      step="1"
                    />
                  </div>
                  <div className="diabetes-risk-input-group">
                    <label htmlFor="diabetes-risk-height-in" className="diabetes-risk-input-label">
                      Height (inches):
                    </label>
                    <input
                      type="number"
                      id="diabetes-risk-height-in"
                      className="diabetes-risk-input-field"
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

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-weight" className="diabetes-risk-input-label">
                  Weight (kg):
                </label>
                <input
                  type="number"
                  id="diabetes-risk-weight"
                  className="diabetes-risk-input-field"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="e.g., 70"
                  min="30"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div className="diabetes-risk-section-title">Health Factors</div>
            <div className="diabetes-risk-input-row">
              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-waist" className="diabetes-risk-input-label">
                  Waist Circumference:
                </label>
                <select
                  id="diabetes-risk-waist"
                  className="diabetes-risk-select-field"
                  value={formData.waist}
                  onChange={(e) => handleInputChange('waist', e.target.value)}
                >
                  {formData.gender === 'male' ? (
                    <>
                      <option value="0">≤ 94 cm (≤ 37 inches)</option>
                      <option value="3">94-102 cm (37-40 inches)</option>
                      <option value="4">{'> '}102 cm ({'> '}40 inches)</option>
                    </>
                  ) : (
                    <>
                      <option value="0">≤ 80 cm (≤ 31 inches)</option>
                      <option value="3">80-88 cm (31-35 inches)</option>
                      <option value="4">{'> '}88 cm ({'> '}35 inches)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-physical-activity" className="diabetes-risk-input-label">
                  Physical Activity:
                </label>
                <select
                  id="diabetes-risk-physical-activity"
                  className="diabetes-risk-select-field"
                  value={formData.physicalActivity}
                  onChange={(e) => handleInputChange('physicalActivity', e.target.value)}
                >
                  <option value="0">Regular exercise (≥3 times/week)</option>
                  <option value="2">Little or no exercise</option>
                </select>
              </div>

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-diet" className="diabetes-risk-input-label">
                  Diet:
                </label>
                <select
                  id="diabetes-risk-diet"
                  className="diabetes-risk-select-field"
                  value={formData.diet}
                  onChange={(e) => handleInputChange('diet', e.target.value)}
                >
                  <option value="0">Healthy diet (fruits, vegetables, whole grains)</option>
                  <option value="2">Poor diet (processed foods, high sugar)</option>
                </select>
              </div>
            </div>

            <div className="diabetes-risk-input-row">
              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-medication" className="diabetes-risk-input-label">
                  Blood Pressure Medication:
                </label>
                <select
                  id="diabetes-risk-medication"
                  className="diabetes-risk-select-field"
                  value={formData.medication}
                  onChange={(e) => handleInputChange('medication', e.target.value)}
                >
                  <option value="0">No medication</option>
                  <option value="2">Taking medication</option>
                </select>
              </div>

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-blood-glucose" className="diabetes-risk-input-label">
                  Blood Glucose Level:
                </label>
                <select
                  id="diabetes-risk-blood-glucose"
                  className="diabetes-risk-select-field"
                  value={formData.bloodGlucose}
                  onChange={(e) => handleInputChange('bloodGlucose', e.target.value)}
                >
                  <option value="0">Normal ({'< '}100 mg/dL)</option>
                  <option value="5">High (≥ 100 mg/dL)</option>
                </select>
              </div>

              <div className="diabetes-risk-input-group">
                <label htmlFor="diabetes-risk-family-diabetes" className="diabetes-risk-input-label">
                  Family History:
                </label>
                <select
                  id="diabetes-risk-family-diabetes"
                  className="diabetes-risk-select-field"
                  value={formData.familyDiabetes}
                  onChange={(e) => handleInputChange('familyDiabetes', e.target.value)}
                >
                  <option value="0">No family history</option>
                  <option value="5">Family history of diabetes</option>
                </select>
              </div>
            </div>

            <div className="diabetes-risk-calculator-actions">
              <button type="button" className="diabetes-risk-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="diabetes-risk-calculator-result">
              <h3 className="diabetes-risk-result-title">Diabetes Risk Assessment Results</h3>
              <div className="diabetes-risk-result-content">
                <div className="diabetes-risk-result-main">
                  <div className="diabetes-risk-result-item">
                    <strong>Risk Score:</strong>
                    <span className="diabetes-risk-result-value diabetes-risk-result-final">
                      {result.totalScore} points
                    </span>
                  </div>
                  <div className="diabetes-risk-result-item">
                    <strong>Risk Level:</strong>
                    <span className="diabetes-risk-result-value" style={{ color: result.riskLevel.color }}>
                      {result.riskLevel.name}
                    </span>
                  </div>
                  <div className="diabetes-risk-result-item">
                    <strong>Risk Percentage:</strong>
                    <span className="diabetes-risk-result-value">
                      {result.riskLevel.percentage}
                    </span>
                  </div>
                  <div className="diabetes-risk-result-item">
                    <strong>BMI:</strong>
                    <span className="diabetes-risk-result-value">
                      {result.bmi} kg/m²
                    </span>
                  </div>
                  <div className="diabetes-risk-result-item">
                    <strong>BMI Category:</strong>
                    <span className="diabetes-risk-result-value" style={{ color: result.bmiCategory.color }}>
                      {result.bmiCategory.name}
                    </span>
                  </div>
                </div>

                {/* Risk Breakdown */}
                <div className="diabetes-risk-breakdown">
                  <h4 className="diabetes-risk-breakdown-title">Risk Factor Breakdown</h4>
                  <div className="diabetes-risk-breakdown-grid">
                    {result.riskBreakdown.map((factor, index) => (
                      <div key={index} className="diabetes-risk-breakdown-item">
                        <div className="diabetes-risk-breakdown-label">{factor.name}</div>
                        <div className="diabetes-risk-breakdown-score">
                          {factor.score} / {factor.maxScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="diabetes-risk-recommendations">
                  <h4 className="diabetes-risk-recommendations-title">Personalized Recommendations</h4>
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="diabetes-risk-recommendation-section">
                      <h5 className="diabetes-risk-recommendation-title">{rec.title}</h5>
                      {rec.content && <p className="diabetes-risk-recommendation-content">{rec.content}</p>}
                      {rec.subtitle && <p className="diabetes-risk-recommendation-subtitle">{rec.subtitle}</p>}
                      {rec.items && (
                        <ul className="diabetes-risk-recommendation-list">
                          {rec.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {rec.note && <p className="diabetes-risk-recommendation-note">{rec.note}</p>}
                    </div>
                  ))}
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
            The Diabetes Risk Calculator is a comprehensive assessment tool that evaluates your risk 
            of developing type 2 diabetes based on multiple health and lifestyle factors. This tool 
            helps you understand your current risk level and provides personalized recommendations 
            for reducing your diabetes risk.
          </p>
          <p>
            Our calculator uses scientifically validated risk factors including age, BMI, waist 
            circumference, physical activity, diet, medication use, blood glucose levels, and 
            family history to provide an accurate risk assessment.
          </p>
        </ContentSection>

        <ContentSection id="what-is-diabetes-risk" title="What is Diabetes Risk?">
          <p>
            Diabetes risk refers to the likelihood of developing type 2 diabetes based on various 
            modifiable and non-modifiable factors. Understanding your risk level is crucial for 
            taking preventive measures and making lifestyle changes to reduce your chances of 
            developing diabetes.
          </p>
          <ul>
            <li><strong>Low Risk:</strong> 1 in 100 chance of developing diabetes</li>
            <li><strong>Slightly Elevated:</strong> 1 in 25 chance of developing diabetes</li>
            <li><strong>Moderate Risk:</strong> 1 in 6 chance of developing diabetes</li>
            <li><strong>High Risk:</strong> 1 in 3 chance of developing diabetes</li>
            <li><strong>Very High Risk:</strong> 1 in 2 chance of developing diabetes</li>
          </ul>
          <p>
            <strong>Important:</strong> This calculator is for educational purposes only and should 
            not replace professional medical advice. Always consult with your healthcare provider 
            for proper diabetes screening and management.
          </p>
        </ContentSection>

        <ContentSection id="risk-factors" title="Risk Factors">
          <div className="risk-factors-grid">
            <div className="risk-factor-item">
              <h4><i className="fas fa-birthday-cake"></i> Age</h4>
              <p>Risk increases with age, especially after 45 years</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-weight"></i> BMI</h4>
              <p>Higher BMI increases diabetes risk</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-ruler"></i> Waist Circumference</h4>
              <p>Larger waist size indicates higher risk</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-running"></i> Physical Activity</h4>
              <p>Regular exercise reduces diabetes risk</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-apple-alt"></i> Diet</h4>
              <p>Healthy eating habits lower risk</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-pills"></i> Blood Pressure Medication</h4>
              <p>Medication use may indicate higher risk</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-tint"></i> Blood Glucose</h4>
              <p>Elevated glucose levels increase risk</p>
            </div>
            <div className="risk-factor-item">
              <h4><i className="fas fa-users"></i> Family History</h4>
              <p>Family history of diabetes increases risk</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Calculator">
          <p>Follow these steps to get your diabetes risk assessment:</p>
          
          <h3>Step 1: Enter Personal Information</h3>
          <ul className="usage-steps">
            <li><strong>Age:</strong> Enter your current age (18-120 years)</li>
            <li><strong>Gender:</strong> Select male or female</li>
            <li><strong>Height:</strong> Enter height in cm or feet/inches</li>
            <li><strong>Weight:</strong> Enter weight in kilograms</li>
          </ul>

          <h3>Step 2: Assess Health Factors</h3>
          <ul className="usage-steps">
            <li><strong>Waist Circumference:</strong> Select the appropriate range for your gender</li>
            <li><strong>Physical Activity:</strong> Choose your exercise frequency</li>
            <li><strong>Diet:</strong> Select your typical eating habits</li>
            <li><strong>Medication:</strong> Indicate if you take blood pressure medication</li>
            <li><strong>Blood Glucose:</strong> Select your last known glucose level</li>
            <li><strong>Family History:</strong> Indicate if you have family history of diabetes</li>
          </ul>

          <h3>Step 3: Calculate and Review Results</h3>
          <ul className="usage-steps">
            <li><strong>Calculate:</strong> Click "Calculate Diabetes Risk" to get your assessment</li>
            <li><strong>Review:</strong> Check your risk score, level, and personalized recommendations</li>
          </ul>
        </ContentSection>

        <ContentSection id="calculation-method" title="Calculation Method">
          <p>
            The diabetes risk calculator uses a scoring system based on established risk factors 
            for type 2 diabetes. Each factor is assigned a point value, and the total score 
            determines your risk level.
          </p>
          
          <div className="calculation-method-section">
            <h3>Scoring System</h3>
            <ul>
              <li><strong>Age:</strong> 0-4 points based on age ranges</li>
              <li><strong>BMI:</strong> 0-3 points based on BMI categories</li>
              <li><strong>Waist Circumference:</strong> 0-4 points based on gender-specific ranges</li>
              <li><strong>Physical Activity:</strong> 0-2 points based on exercise frequency</li>
              <li><strong>Diet:</strong> 0-2 points based on eating habits</li>
              <li><strong>Medication:</strong> 0-2 points for blood pressure medication use</li>
              <li><strong>Blood Glucose:</strong> 0-5 points based on glucose levels</li>
              <li><strong>Family History:</strong> 0-5 points for family history of diabetes</li>
            </ul>
          </div>

          <div className="calculation-method-section">
            <h3>Risk Level Determination</h3>
            <ul>
              <li><strong>0-6 points:</strong> Low risk (1 in 100)</li>
              <li><strong>7-11 points:</strong> Slightly elevated (1 in 25)</li>
              <li><strong>12-14 points:</strong> Moderate risk (1 in 6)</li>
              <li><strong>15-20 points:</strong> High risk (1 in 3)</li>
              <li><strong>21+ points:</strong> Very high risk (1 in 2)</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Low Risk Profile</h3>
            <div className="example-solution">
              <p><strong>Age:</strong> 35 years (0 points)</p>
              <p><strong>BMI:</strong> 22 kg/m² (0 points)</p>
              <p><strong>Waist:</strong> 85 cm male (0 points)</p>
              <p><strong>Physical Activity:</strong> Regular exercise (0 points)</p>
              <p><strong>Diet:</strong> Healthy diet (0 points)</p>
              <p><strong>Other factors:</strong> All normal (0 points each)</p>
              <p><strong>Total Score:</strong> 0 points</p>
              <p><strong>Risk Level:</strong> Low (1 in 100)</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: High Risk Profile</h3>
            <div className="example-solution">
              <p><strong>Age:</strong> 55 years (3 points)</p>
              <p><strong>BMI:</strong> 32 kg/m² (3 points)</p>
              <p><strong>Waist:</strong> 110 cm male (4 points)</p>
              <p><strong>Physical Activity:</strong> Little exercise (2 points)</p>
              <p><strong>Diet:</strong> Poor diet (2 points)</p>
              <p><strong>Medication:</strong> Taking medication (2 points)</p>
              <p><strong>Blood Glucose:</strong> High (5 points)</p>
              <p><strong>Family History:</strong> Yes (5 points)</p>
              <p><strong>Total Score:</strong> 26 points</p>
              <p><strong>Risk Level:</strong> Very High (1 in 2)</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding your diabetes risk is crucial for several reasons:</p>
          <ul>
            <li>Helps identify modifiable risk factors</li>
            <li>Guides lifestyle changes and preventive measures</li>
            <li>Encourages regular health monitoring</li>
            <li>Promotes early intervention and treatment</li>
            <li>Reduces healthcare costs through prevention</li>
            <li>Improves overall health and quality of life</li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Diabetes Risk Calculator provides comprehensive functionality:</p>
          <ul>
            <li><strong>Comprehensive Assessment:</strong> Evaluates 8 key risk factors</li>
            <li><strong>Accurate Scoring:</strong> Uses validated risk scoring system</li>
            <li><strong>Personalized Results:</strong> Tailored risk level and recommendations</li>
            <li><strong>Risk Breakdown:</strong> Detailed factor-by-factor analysis</li>
            <li><strong>BMI Calculation:</strong> Automatic BMI calculation and categorization</li>
            <li><strong>Health Recommendations:</strong> Actionable lifestyle advice</li>
            <li><strong>Multiple Units:</strong> Support for metric and imperial measurements</li>
            <li><strong>Educational Content:</strong> Comprehensive information about diabetes risk</li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-user-md"></i> Health Screening</h4>
              <p>Initial diabetes risk assessment</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-heartbeat"></i> Preventive Care</h4>
              <p>Identify modifiable risk factors</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Health Monitoring</h4>
              <p>Track risk changes over time</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-dumbbell"></i> Lifestyle Planning</h4>
              <p>Guide exercise and diet decisions</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-clipboard-check"></i> Health Education</h4>
              <p>Learn about diabetes risk factors</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-calendar-check"></i> Medical Consultation</h4>
              <p>Prepare for healthcare provider visits</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "How accurate is this diabetes risk calculator?",
              answer: "This calculator uses established risk factors and scoring systems based on scientific research. However, it's a screening tool and should not replace professional medical assessment. Always consult with your healthcare provider for proper diabetes screening."
            },
            {
              question: "What should I do if I have a high risk score?",
              answer: "If you have a high risk score, schedule an appointment with your healthcare provider to discuss your risk factors and get proper screening tests. Consider making lifestyle changes such as improving your diet, increasing physical activity, and maintaining a healthy weight."
            },
            {
              question: "Can I reduce my diabetes risk?",
              answer: "Yes, many diabetes risk factors are modifiable. You can reduce your risk by maintaining a healthy weight, eating a balanced diet, exercising regularly, managing stress, and avoiding smoking. Even small changes can make a significant difference."
            },
            {
              question: "How often should I check my diabetes risk?",
              answer: "It's recommended to reassess your diabetes risk annually, or more frequently if you make significant lifestyle changes or if your health status changes. Regular check-ups with your healthcare provider are also important."
            },
            {
              question: "What's the difference between type 1 and type 2 diabetes?",
              answer: "Type 1 diabetes is an autoimmune condition that usually develops in childhood, while type 2 diabetes is more common in adults and is often related to lifestyle factors. This calculator assesses risk for type 2 diabetes specifically."
            },
            {
              question: "Should I be concerned about prediabetes?",
              answer: "Yes, prediabetes is a serious condition that increases your risk of developing type 2 diabetes. If you have prediabetes, lifestyle changes can help prevent or delay the onset of diabetes. Regular monitoring and medical care are important."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default DiabetesRiskCalculator