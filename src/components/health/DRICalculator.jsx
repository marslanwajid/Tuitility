import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/dri-calculator.css'

// DRI Calculator Logic Class
class DRICalculatorLogic {
  constructor() {
    this.activityMultipliers = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra: 1.9
    };
    this.dietTypeAdjustments = {
      omnivore: { protein: 15, carbs: 55, fat: 30 },
      vegetarian: { protein: 15, carbs: 60, fat: 25 },
      vegan: { protein: 15, carbs: 60, fat: 25 },
      keto: { protein: 20, carbs: 5, fat: 75 },
      mediterranean: { protein: 15, carbs: 50, fat: 35 },
      paleo: { protein: 25, carbs: 35, fat: 40 }
    };
    this.healthConditionAdjustments = {
      diabetes: { protein: 20, carbs: 45, fat: 35 },
      hypertension: { sodium: 0.7 },
      kidney_disease: { protein: 0.8, potassium: 0.8 },
      heart_disease: { fat: 25, saturated_fat: 7 },
      osteoporosis: { calcium: 1.2, vitamin_d: 1.5 }
    };
  }

  calculate(formData) {
    const gender = formData.gender;
    const age = parseInt(formData.age);
    const heightCm = this.getHeightInCm(formData);
    const weightKg = this.getWeightInKg(formData);
    const activityLevel = formData.activityLevel;
    const pregnancy = formData.pregnancy || 'none';
    const lactation = formData.lactation || 'none';
    const healthConditions = formData.healthConditions || [];
    const dietType = formData.dietType || 'omnivore';

    const energy = this.calculateEnergyNeeds(gender, age, weightKg, heightCm, activityLevel, pregnancy, lactation);
    const macros = this.calculateMacroDistribution(energy, gender, age, pregnancy, lactation, healthConditions, dietType);
    const vitamins = this.calculateVitaminNeeds(gender, age, pregnancy, lactation, healthConditions);
    const minerals = this.calculateMineralNeeds(gender, age, pregnancy, lactation, healthConditions);
    const water = this.calculateWaterNeeds(weightKg, activityLevel, pregnancy, lactation);
    const recommendations = this.generateRecommendations(gender, age, pregnancy, lactation, healthConditions, dietType);

    return {
      userInfo: {
        gender, age, height: this.formatHeight(formData), weight: this.formatWeight(formData),
        activityLevel: this.getActivityLevelText(activityLevel), pregnancy, lactation, healthConditions, dietType
      },
      energy: Math.round(energy), macros, vitamins, minerals, water: Math.round(water), recommendations
    };
  }

  calculateEnergyNeeds(gender, age, weight, height, activityLevel, pregnancy, lactation) {
    let bmr = gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    
    const activityMultiplier = this.activityMultipliers[activityLevel] || 1.375;
    let tdee = bmr * activityMultiplier;
    
    if (pregnancy === 'second') tdee += 340;
    else if (pregnancy === 'third') tdee += 450;
    
    if (lactation === 'exclusive') tdee += 500;
    else if (lactation === 'partial') tdee += 300;
    
    return tdee;
  }

  calculateMacroDistribution(energy, gender, age, pregnancy, lactation, healthConditions, dietType) {
    let { protein: proteinPercent, carbs: carbsPercent, fat: fatPercent } = 
      this.dietTypeAdjustments[dietType] || this.dietTypeAdjustments.omnivore;

    healthConditions.forEach(condition => {
      if (this.healthConditionAdjustments[condition]) {
        const adjustment = this.healthConditionAdjustments[condition];
        if (adjustment.protein) proteinPercent = adjustment.protein;
        if (adjustment.carbs) carbsPercent = adjustment.carbs;
        if (adjustment.fat) fatPercent = adjustment.fat;
      }
    });

    if (pregnancy !== 'none' || lactation !== 'none') {
      proteinPercent = Math.max(proteinPercent, 18);
    }

    const proteinGrams = (energy * (proteinPercent / 100)) / 4;
    const carbsGrams = (energy * (carbsPercent / 100)) / 4;
    const fatGrams = (energy * (fatPercent / 100)) / 9;
    const fiber = gender === 'male' ? (age < 51 ? 38 : 30) : (age < 51 ? 25 : 21);

    return {
      protein: { percent: proteinPercent, grams: Math.round(proteinGrams), calories: Math.round(proteinGrams * 4) },
      carbs: { percent: carbsPercent, grams: Math.round(carbsGrams), calories: Math.round(carbsGrams * 4) },
      fat: { percent: fatPercent, grams: Math.round(fatGrams), calories: Math.round(fatGrams * 9) },
      fiber: Math.round(fiber)
    };
  }

  calculateVitaminNeeds(gender, age, pregnancy, lactation, healthConditions) {
    let vitamins = {
      vitaminA: 900, vitaminC: 90, vitaminD: 15, vitaminE: 15, vitaminK: 120,
      thiamin: 1.2, riboflavin: 1.3, niacin: 16, vitaminB6: 1.3, vitaminB12: 2.4,
      folate: 400, biotin: 30, pantothenicAcid: 5
    };

    if (gender === 'female') {
      if (age < 19) {
        vitamins = {
          vitaminA: 700, vitaminC: 75, vitaminD: 15, vitaminE: 15, vitaminK: 75,
          thiamin: 1.0, riboflavin: 1.0, niacin: 14, vitaminB6: 1.2, vitaminB12: 2.4,
          folate: 400, biotin: 25, pantothenicAcid: 5
        };
      } else {
        vitamins = {
          vitaminA: 700, vitaminC: 75, vitaminD: 15, vitaminE: 15, vitaminK: 90,
          thiamin: 1.1, riboflavin: 1.1, niacin: 14, vitaminB6: 1.3, vitaminB12: 2.4,
          folate: 400, biotin: 30, pantothenicAcid: 5
        };
      }

      if (pregnancy !== 'none') {
        vitamins = {
          vitaminA: 770, vitaminC: 85, vitaminD: 15, vitaminE: 15, vitaminK: 90,
          thiamin: 1.4, riboflavin: 1.4, niacin: 18, vitaminB6: 1.9, vitaminB12: 2.6,
          folate: 600, biotin: 30, pantothenicAcid: 6
        };
      }

      if (lactation !== 'none') {
        vitamins = {
          vitaminA: 1300, vitaminC: 120, vitaminD: 15, vitaminE: 19, vitaminK: 90,
          thiamin: 1.4, riboflavin: 1.6, niacin: 17, vitaminB6: 2.0, vitaminB12: 2.8,
          folate: 500, biotin: 35, pantothenicAcid: 7
        };
      }
    }

    if (age >= 71) {
      vitamins.vitaminD = 20;
      vitamins.vitaminB6 = gender === 'male' ? 1.7 : 1.5;
    }

    healthConditions.forEach(condition => {
      if (condition === 'osteoporosis') {
        vitamins.vitaminD *= 1.5;
        vitamins.vitaminK *= 1.2;
      }
    });

    Object.keys(vitamins).forEach(key => {
      vitamins[key] = Math.round(vitamins[key] * 10) / 10;
    });

    return vitamins;
  }

  calculateMineralNeeds(gender, age, pregnancy, lactation, healthConditions) {
    let minerals = {
      calcium: 1000, iron: 8, magnesium: 400, zinc: 11, potassium: 3400, sodium: 1500,
      phosphorus: 700, selenium: 55, copper: 900, manganese: 2.3, chromium: 35, molybdenum: 45
    };

    if (gender === 'female') {
      if (age < 19) {
        minerals = {
          calcium: 1300, iron: 15, magnesium: 360, zinc: 9, potassium: 2300, sodium: 1500,
          phosphorus: 1250, selenium: 55, copper: 890, manganese: 1.6, chromium: 24, molybdenum: 43
        };
      } else if (age < 51) {
        minerals = {
          calcium: 1000, iron: 18, magnesium: 310, zinc: 8, potassium: 2600, sodium: 1500,
          phosphorus: 700, selenium: 55, copper: 900, manganese: 1.8, chromium: 25, molybdenum: 45
        };
      } else {
        minerals = {
          calcium: 1200, iron: 8, magnesium: 320, zinc: 8, potassium: 2600, sodium: 1500,
          phosphorus: 700, selenium: 55, copper: 900, manganese: 1.8, chromium: 20, molybdenum: 45
        };
      }

      if (pregnancy !== 'none') {
        minerals.iron = 27;
        minerals.zinc = age < 19 ? 12 : 11;
        minerals.potassium = 2900;
      }

      if (lactation !== 'none') {
        minerals.iron = age < 19 ? 10 : 9;
        minerals.zinc = age < 19 ? 13 : 12;
        minerals.potassium = 2900;
      }
    }

    healthConditions.forEach(condition => {
      if (condition === 'hypertension') {
        minerals.sodium *= 0.7;
        minerals.potassium *= 1.1;
      }
      if (condition === 'osteoporosis') {
        minerals.calcium *= 1.2;
      }
    });

    Object.keys(minerals).forEach(key => {
      minerals[key] = Math.round(minerals[key]);
    });

    return minerals;
  }

  calculateWaterNeeds(weight, activityLevel, pregnancy, lactation) {
    let waterNeeds = weight * 35;
    const activityAdjustment = { sedentary: 1.0, light: 1.1, moderate: 1.2, active: 1.3, extra: 1.4 };
    waterNeeds *= activityAdjustment[activityLevel] || 1.0;
    
    if (pregnancy !== 'none') waterNeeds += 300;
    if (lactation === 'exclusive') waterNeeds += 700;
    else if (lactation === 'partial') waterNeeds += 400;
    
    return waterNeeds;
  }

  generateRecommendations(gender, age, pregnancy, lactation, healthConditions, dietType) {
    const recommendations = [];
    
    if (age >= 65) {
      recommendations.push('Consider vitamin B12 supplementation as absorption may decrease with age');
      recommendations.push('Ensure adequate vitamin D intake for bone health');
    }
    
    if (pregnancy !== 'none') {
      recommendations.push('Take a prenatal vitamin with folic acid to prevent birth defects');
      recommendations.push('Include iron-rich foods and consider iron supplementation');
    }
    
    if (lactation !== 'none') {
      recommendations.push('Continue prenatal vitamins during breastfeeding');
      recommendations.push('Increase fluid intake to support milk production');
    }
    
    if (dietType === 'vegan' || dietType === 'vegetarian') {
      recommendations.push('Consider vitamin B12 supplementation');
      recommendations.push('Combine plant proteins to ensure complete amino acid profiles');
    }
    
    healthConditions.forEach(condition => {
      switch (condition) {
        case 'diabetes':
          recommendations.push('Focus on complex carbohydrates and fiber-rich foods');
          break;
        case 'hypertension':
          recommendations.push('Limit sodium intake and increase potassium-rich foods');
          break;
        case 'osteoporosis':
          recommendations.push('Ensure adequate calcium and vitamin D intake');
          break;
      }
    });
    
    recommendations.push('Eat a variety of nutrient-dense foods from all food groups');
    recommendations.push('Consult with a healthcare provider before making significant dietary changes');
    
    return recommendations;
  }

  getHeightInCm(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height) || 0;
    } else {
      const feet = parseFloat(formData.heightFeet) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 30.48) + (inches * 2.54);
    }
  }

  getWeightInKg(formData) {
    const weight = parseFloat(formData.weight) || 0;
    return formData.weightUnit === 'kg' ? weight : weight * 0.453592;
  }

  formatHeight(formData) {
    return formData.heightUnit === 'cm' ? `${formData.height} cm` : `${formData.heightFeet}'${formData.heightInches}"`;
  }

  formatWeight(formData) {
    return `${formData.weight} ${formData.weightUnit}`;
  }

  getActivityLevelText(level) {
    const descriptions = {
      sedentary: 'Sedentary (little or no exercise)',
      light: 'Lightly active (light exercise 1-3 days/week)',
      moderate: 'Moderately active (moderate exercise 3-5 days/week)',
      active: 'Very active (hard exercise 6-7 days/week)',
      extra: 'Extra active (very hard exercise & physical job)'
    };
    return descriptions[level] || level;
  }

  validateInputs(formData) {
    const errors = [];
    if (!formData.gender) errors.push('Please select your gender.');
    
    const age = parseInt(formData.age);
    if (!age || age < 1 || age > 120) errors.push('Please enter a valid age between 1 and 120.');
    
    if (formData.heightUnit === 'cm') {
      const height = parseFloat(formData.height);
      if (!height || height < 50 || height > 250) errors.push('Please enter a valid height between 50-250 cm.');
    } else {
      const feet = parseFloat(formData.heightFeet);
      const inches = parseFloat(formData.heightInches);
      if (!feet || feet < 2 || feet > 8) errors.push('Please enter a valid height in feet (2-8).');
      if (inches === undefined || inches < 0 || inches >= 12) errors.push('Please enter valid inches (0-11).');
    }
    
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) errors.push('Please enter a valid weight.');
    
    if (!formData.activityLevel) errors.push('Please select your activity level.');
    
    return { isValid: errors.length === 0, errors };
  }
}

const DRICalculator = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    activityLevel: '',
    pregnancy: 'none',
    lactation: 'none',
    healthConditions: [],
    dietType: 'omnivore'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const toolData = {
    name: 'DRI Calculator',
    description: 'Calculate your Dietary Reference Intakes (DRI) including energy needs, macronutrient distribution, and vitamin/mineral requirements based on your personal profile with advanced options for pregnancy, lactation, and health conditions.',
    icon: 'fas fa-utensils',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'DRI Calculator']
  };

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
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'Calorie Burn Calculator', url: '/health/calculators/calorie-burn-calculator', icon: 'fas fa-fire' },
    { name: 'Water Intake Calculator', url: '/health/calculators/water-intake-calculator', icon: 'fas fa-tint' },
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user-circle' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-dri', title: 'What is DRI?' },
    { id: 'components', title: 'DRI Components' },
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

  const handleHealthConditionsChange = (condition, checked) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: checked 
        ? [...prev.healthConditions, condition]
        : prev.healthConditions.filter(c => c !== condition)
    }));
  };

  const validateInputs = () => {
    const calculator = new DRICalculatorLogic();
    const validation = calculator.validateInputs(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return false;
    }
    return true;
  };

  const calculateDRI = () => {
    if (!validateInputs()) return;

    try {
      const calculator = new DRICalculatorLogic();
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
      gender: '',
      age: '',
      height: '',
      heightFeet: '',
      heightInches: '',
      heightUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      activityLevel: '',
      pregnancy: 'none',
      lactation: 'none',
      healthConditions: [],
      dietType: 'omnivore'
    });
    setResult(null);
    setError('');
    setActiveTab('basic');
  };

  return (
    <ToolPageLayout
      toolData={toolData}
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
        {/* Tab Navigation */}
      <div className="dri-calculator-tabs">
          <button
          className={`dri-tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
          >
          Basic Information
          </button>
          <button
          className={`dri-tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced Options
          </button>
        </div>

      <CalculatorSection 
        title="DRI Calculator"
        onCalculate={calculateDRI}
        calculateButtonText="Calculate DRI"
        error={error}
        result={null}
      >
        <div className="dri-calculator-form">
        {/* Basic Tab */}
        {activeTab === 'basic' && (
            <div className="dri-tab-content">
              <div className="dri-section-title">Personal Information</div>
              
              <div className="dri-input-row">
                <div className="dri-input-group">
                  <label htmlFor="dri-gender" className="dri-input-label">Gender:</label>
                  <select
                    id="dri-gender"
                    className="dri-select-field"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="dri-input-group">
                  <label htmlFor="dri-age" className="dri-input-label">Age (years):</label>
                  <input
                    type="number"
                    id="dri-age"
                    className="dri-input-field"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="e.g., 30"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div className="dri-input-row">
                <div className="dri-input-group">
                  <label htmlFor="dri-height-unit" className="dri-input-label">Height Unit:</label>
                  <select
                    id="dri-height-unit"
                    className="dri-select-field"
                    value={formData.heightUnit}
                    onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="ft">Feet & Inches</option>
                  </select>
                </div>

                {formData.heightUnit === 'cm' ? (
                  <div className="dri-input-group">
                    <label htmlFor="dri-height" className="dri-input-label">Height (cm):</label>
                    <input
                      type="number"
                      id="dri-height"
                      className="dri-input-field"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="e.g., 175"
                      min="50"
                      max="250"
                    />
                  </div>
                ) : (
                  <>
                    <div className="dri-input-group">
                      <label htmlFor="dri-height-feet" className="dri-input-label">Height (feet):</label>
                      <input
                        type="number"
                        id="dri-height-feet"
                        className="dri-input-field"
                        value={formData.heightFeet}
                        onChange={(e) => handleInputChange('heightFeet', e.target.value)}
                        placeholder="e.g., 5"
                        min="2"
                        max="8"
                      />
                    </div>
                    <div className="dri-input-group">
                      <label htmlFor="dri-height-inches" className="dri-input-label">Height (inches):</label>
                      <input
                        type="number"
                        id="dri-height-inches"
                        className="dri-input-field"
                        value={formData.heightInches}
                        onChange={(e) => handleInputChange('heightInches', e.target.value)}
                        placeholder="e.g., 9"
                        min="0"
                        max="11"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="dri-input-row">
                <div className="dri-input-group">
                  <label htmlFor="dri-weight-unit" className="dri-input-label">Weight Unit:</label>
                  <select
                    id="dri-weight-unit"
                    className="dri-select-field"
                    value={formData.weightUnit}
                    onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lb">Pounds (lb)</option>
                  </select>
                </div>

                <div className="dri-input-group">
                  <label htmlFor="dri-weight" className="dri-input-label">Weight:</label>
                  <input
                    type="number"
                    id="dri-weight"
                    className="dri-input-field"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 70"
                    min="1"
                    step="0.1"
                  />
              </div>

                <div className="dri-input-group">
                  <label htmlFor="dri-activity-level" className="dri-input-label">Activity Level:</label>
                  <select
                    id="dri-activity-level"
                    className="dri-select-field"
                    value={formData.activityLevel}
                    onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                    <option value="extra">Extra Active</option>
                  </select>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
            <div className="dri-tab-content">
              <div className="dri-section-title">Advanced Options</div>
              
                <div className="dri-input-row">
                  <div className="dri-input-group">
                  <label htmlFor="dri-pregnancy" className="dri-input-label">Pregnancy Status:</label>
                    <select
                    id="dri-pregnancy"
                      className="dri-select-field"
                      value={formData.pregnancy}
                      onChange={(e) => handleInputChange('pregnancy', e.target.value)}
                    >
                    <option value="none">Not Pregnant</option>
                    <option value="first">First Trimester</option>
                    <option value="second">Second Trimester</option>
                    <option value="third">Third Trimester</option>
                    </select>
                  </div>

                  <div className="dri-input-group">
                  <label htmlFor="dri-lactation" className="dri-input-label">Lactation Status:</label>
                    <select
                    id="dri-lactation"
                      className="dri-select-field"
                      value={formData.lactation}
                      onChange={(e) => handleInputChange('lactation', e.target.value)}
                    >
                    <option value="none">Not Breastfeeding</option>
                    <option value="exclusive">Exclusive Breastfeeding</option>
                    <option value="partial">Partial Breastfeeding</option>
                    </select>
                </div>

                <div className="dri-input-group">
                  <label htmlFor="dri-diet-type" className="dri-input-label">Diet Type:</label>
                  <select
                    id="dri-diet-type"
                    className="dri-select-field"
                    value={formData.dietType}
                    onChange={(e) => handleInputChange('dietType', e.target.value)}
                  >
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Ketogenic</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>
              </div>

              <div className="dri-input-group">
                <label className="dri-input-label">Health Conditions (select all that apply):</label>
                <div className="dri-checkbox-group">
                  {[
                    { value: 'diabetes', label: 'Diabetes' },
                    { value: 'hypertension', label: 'High Blood Pressure' },
                    { value: 'heart_disease', label: 'Heart Disease' },
                    { value: 'kidney_disease', label: 'Kidney Disease' },
                    { value: 'osteoporosis', label: 'Osteoporosis' }
                  ].map(condition => (
                    <label key={condition.value} className="dri-checkbox-label">
                      <input
                        type="checkbox"
                        className="dri-checkbox"
                        checked={formData.healthConditions.includes(condition.value)}
                        onChange={(e) => handleHealthConditionsChange(condition.value, e.target.checked)}
                      />
                      {condition.label}
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="dri-calculator-actions">
            <button type="button" className="dri-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
            Reset
          </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="dri-calculator-result">
            <h3 className="dri-result-title">Your Dietary Reference Intakes (DRI)</h3>
            <div className="dri-result-content">
              
              {/* Energy Needs */}
              <div className="dri-result-section">
                <h4 className="dri-result-section-title">Energy Needs</h4>
                <div className="dri-result-item">
                  <strong>Daily Calories:</strong>
                  <span className="dri-result-value dri-result-final">{result.energy} kcal</span>
                </div>
                <div className="dri-result-item">
                  <strong>Daily Water:</strong>
                  <span className="dri-result-value">{result.water} ml ({Math.round(result.water / 240)} cups)</span>
                </div>
              </div>

              {/* Macronutrients */}
              <div className="dri-result-section">
                <h4 className="dri-result-section-title">Macronutrients</h4>
                <div className="dri-result-item">
                  <strong>Protein:</strong>
                  <span className="dri-result-value">{result.macros.protein.grams}g ({result.macros.protein.percent}%)</span>
                </div>
                <div className="dri-result-item">
                  <strong>Carbohydrates:</strong>
                  <span className="dri-result-value">{result.macros.carbs.grams}g ({result.macros.carbs.percent}%)</span>
                </div>
                <div className="dri-result-item">
                  <strong>Fat:</strong>
                  <span className="dri-result-value">{result.macros.fat.grams}g ({result.macros.fat.percent}%)</span>
                </div>
                <div className="dri-result-item">
                  <strong>Fiber:</strong>
                  <span className="dri-result-value">{result.macros.fiber}g</span>
                </div>
              </div>

              {/* Vitamins */}
              <div className="dri-result-section">
                <h4 className="dri-result-section-title">Vitamins</h4>
                <div className="dri-result-grid">
                <div className="dri-result-item">
                  <strong>Vitamin A:</strong>
                    <span className="dri-result-value">{result.vitamins.vitaminA} μg RAE</span>
                </div>
                <div className="dri-result-item">
                  <strong>Vitamin C:</strong>
                    <span className="dri-result-value">{result.vitamins.vitaminC} mg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Vitamin D:</strong>
                    <span className="dri-result-value">{result.vitamins.vitaminD} μg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Vitamin E:</strong>
                    <span className="dri-result-value">{result.vitamins.vitaminE} mg</span>
                </div>
                <div className="dri-result-item">
                    <strong>Folate:</strong>
                    <span className="dri-result-value">{result.vitamins.folate} μg</span>
                </div>
                <div className="dri-result-item">
                    <strong>Vitamin B12:</strong>
                    <span className="dri-result-value">{result.vitamins.vitaminB12} μg</span>
                  </div>
                </div>
              </div>

              {/* Minerals */}
              <div className="dri-result-section">
                <h4 className="dri-result-section-title">Minerals</h4>
                <div className="dri-result-grid">
                <div className="dri-result-item">
                  <strong>Calcium:</strong>
                    <span className="dri-result-value">{result.minerals.calcium} mg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Iron:</strong>
                    <span className="dri-result-value">{result.minerals.iron} mg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Magnesium:</strong>
                    <span className="dri-result-value">{result.minerals.magnesium} mg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Zinc:</strong>
                    <span className="dri-result-value">{result.minerals.zinc} mg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Potassium:</strong>
                    <span className="dri-result-value">{result.minerals.potassium} mg</span>
                </div>
                <div className="dri-result-item">
                  <strong>Sodium:</strong>
                    <span className="dri-result-value">{result.minerals.sodium} mg</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="dri-result-section">
                  <h4 className="dri-result-section-title">Personalized Recommendations</h4>
                  <div className="dri-recommendations">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="dri-recommendation-item">
                        <i className="fas fa-check-circle"></i>
                        {rec}
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
          The DRI (Dietary Reference Intakes) Calculator is a comprehensive tool that helps you determine 
          your personalized nutritional needs based on scientific guidelines established by health authorities. 
          It calculates your daily requirements for energy, macronutrients, vitamins, and minerals.
        </p>
        <p>
          Our calculator considers your individual characteristics including age, gender, height, weight, 
          activity level, pregnancy status, lactation, health conditions, and dietary preferences to 
          provide accurate and personalized recommendations.
        </p>
      </ContentSection>

      <ContentSection id="what-is-dri" title="What is DRI?">
        <p>
          Dietary Reference Intakes (DRIs) are a set of reference values used to plan and assess 
          nutrient intakes of healthy people. They are developed by expert committees and represent 
          the most current scientific knowledge on nutrient needs.
        </p>
        <ul>
          <li><strong>RDA (Recommended Dietary Allowance):</strong> Average daily intake sufficient for 97-98% of healthy individuals</li>
          <li><strong>AI (Adequate Intake):</strong> Used when RDA cannot be determined</li>
          <li><strong>EAR (Estimated Average Requirement):</strong> Intake that meets needs of 50% of individuals</li>
          <li><strong>UL (Tolerable Upper Intake Level):</strong> Maximum daily intake unlikely to cause adverse effects</li>
        </ul>
      </ContentSection>

      <ContentSection id="components" title="DRI Components">
        <div className="dri-components-grid">
          <div className="dri-component">
            <h4>Energy Needs</h4>
            <p>Daily calorie requirements based on BMR and activity level, with adjustments for pregnancy and lactation.</p>
          </div>
          <div className="dri-component">
            <h4>Macronutrients</h4>
            <p>Protein, carbohydrates, and fat distribution based on dietary preferences and health conditions.</p>
          </div>
          <div className="dri-component">
            <h4>Vitamins</h4>
            <p>Fat-soluble (A, D, E, K) and water-soluble (B-complex, C) vitamin requirements.</p>
          </div>
          <div className="dri-component">
            <h4>Minerals</h4>
            <p>Essential minerals including calcium, iron, magnesium, zinc, and electrolytes.</p>
          </div>
          <div className="dri-component">
            <h4>Water Needs</h4>
            <p>Daily fluid requirements based on body weight, activity level, and physiological status.</p>
          </div>
          <div className="dri-component">
            <h4>Fiber</h4>
            <p>Daily fiber intake recommendations for digestive health and disease prevention.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to calculate your personalized DRI:</p>
        
        <h3>Step 1: Basic Information</h3>
        <ul className="usage-steps">
          <li><strong>Personal Details:</strong> Enter your gender, age, height, and weight</li>
          <li><strong>Activity Level:</strong> Select your physical activity level</li>
        </ul>

        <h3>Step 2: Advanced Options (Optional)</h3>
        <ul className="usage-steps">
          <li><strong>Pregnancy/Lactation:</strong> Select current status if applicable</li>
          <li><strong>Diet Type:</strong> Choose your dietary pattern</li>
          <li><strong>Health Conditions:</strong> Select any relevant health conditions</li>
        </ul>

        <h3>Step 3: Calculate and Review</h3>
        <ul className="usage-steps">
          <li><strong>Calculate:</strong> Click "Calculate DRI" to get your results</li>
          <li><strong>Review:</strong> Check all nutrient requirements and recommendations</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The DRI calculation uses established scientific formulas and guidelines:
        </p>
        
        <div className="calculation-method-section">
          <h3>Energy Calculation</h3>
          <ul>
            <li><strong>BMR:</strong> Mifflin-St Jeor equation based on gender, age, weight, and height</li>
            <li><strong>Activity Factor:</strong> Multiplier based on physical activity level</li>
            <li><strong>Adjustments:</strong> Additional calories for pregnancy and lactation</li>
          </ul>
        </div>

        <div className="calculation-method-section">
          <h3>Nutrient Requirements</h3>
          <ul>
            <li><strong>Age & Gender:</strong> Primary factors determining nutrient needs</li>
            <li><strong>Physiological Status:</strong> Pregnancy and lactation adjustments</li>
            <li><strong>Health Conditions:</strong> Modifications based on medical conditions</li>
            <li><strong>Diet Type:</strong> Adjustments for different dietary patterns</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Adult Female</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 30-year-old female, 165 cm, 60 kg, moderately active</p>
            <p><strong>Energy:</strong> ~2000 calories/day</p>
            <p><strong>Protein:</strong> ~75g (15%)</p>
            <p><strong>Iron:</strong> 18 mg (higher due to menstruation)</p>
            <p><strong>Folate:</strong> 400 μg (important for reproductive age)</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Pregnant Female</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> Same female, second trimester pregnancy</p>
            <p><strong>Energy:</strong> ~2340 calories/day (+340 for pregnancy)</p>
            <p><strong>Protein:</strong> ~85g (increased needs)</p>
            <p><strong>Iron:</strong> 27 mg (significantly increased)</p>
            <p><strong>Folate:</strong> 600 μg (critical for fetal development)</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your DRI is important for:</p>
        <ul>
          <li>Optimal health and disease prevention</li>
          <li>Proper growth and development</li>
          <li>Supporting pregnancy and lactation</li>
          <li>Managing chronic health conditions</li>
          <li>Planning balanced meals and supplementation</li>
          <li>Achieving fitness and performance goals</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our DRI Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Complete Nutrient Profile:</strong> Energy, macros, vitamins, minerals, and water</li>
          <li><strong>Life Stage Adjustments:</strong> Pregnancy and lactation considerations</li>
          <li><strong>Health Condition Modifications:</strong> Adjustments for diabetes, hypertension, etc.</li>
          <li><strong>Diet Type Adaptations:</strong> Accommodates various dietary patterns</li>
          <li><strong>Personalized Recommendations:</strong> Specific advice based on your profile</li>
          <li><strong>Scientific Accuracy:</strong> Based on official DRI guidelines</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-utensils"></i> Meal Planning</h4>
            <p>Plan balanced meals meeting nutrient needs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-pills"></i> Supplementation</h4>
            <p>Identify potential nutrient gaps</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-baby"></i> Pregnancy Nutrition</h4>
            <p>Ensure adequate nutrition during pregnancy</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Health Management</h4>
            <p>Support chronic disease management</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Performance</h4>
            <p>Optimize nutrition for athletic performance</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-user-md"></i> Clinical Use</h4>
            <p>Support healthcare professionals</p>
          </div>
      </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How accurate are these DRI calculations?",
            answer: "Our calculations are based on official DRI guidelines from the Institute of Medicine and are highly accurate for the general population. However, individual needs may vary based on genetics, metabolism, and other factors not captured in the standard formulas."
          },
          {
            question: "Should I take supplements to meet my DRI?",
            answer: "It's best to meet nutrient needs through a balanced diet first. Supplements may be helpful for specific nutrients that are difficult to obtain from food alone (like vitamin D or B12 for vegans), but consult with a healthcare provider before starting any supplements."
          },
          {
            question: "How do health conditions affect my DRI?",
            answer: "Certain health conditions can significantly alter nutrient needs. For example, diabetes may require modified carbohydrate intake, while kidney disease may require protein restriction. Always work with healthcare professionals for condition-specific guidance."
          },
          {
            question: "Are DRIs different for athletes?",
            answer: "Athletes may have higher needs for certain nutrients, particularly protein, carbohydrates, and some vitamins and minerals. The calculator's 'extra active' setting accounts for some of these increased needs, but elite athletes may require specialized nutrition planning."
          },
          {
            question: "How often should I recalculate my DRI?",
            answer: "Recalculate your DRI when there are significant changes in your age, weight, activity level, health status, or life circumstances (like pregnancy). Generally, annual reviews are sufficient for most people."
          },
          {
            question: "Can children use this calculator?",
            answer: "This calculator is designed for adults. Children and adolescents have different nutrient needs and growth patterns that require specialized pediatric DRI guidelines. Consult with a pediatric healthcare provider for children's nutritional needs."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default DRICalculator
