import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/ideal-weight-calculator.css'
import Seo from '../Seo'

// Ideal Weight Calculator Logic Class
class IdealWeightCalculatorLogic {
  constructor() {
    this.bmiCategories = {
      underweight: { min: 0, max: 18.5, label: 'Underweight', color: '#3498db' },
      normal: { min: 18.5, max: 25, label: 'Normal weight', color: '#2ecc71' },
      overweight: { min: 25, max: 30, label: 'Overweight', color: '#f1c40f' },
      obese1: { min: 30, max: 35, label: 'Obesity class I', color: '#e67e22' },
      obese2: { min: 35, max: 40, label: 'Obesity class II', color: '#e74c3c' },
      obese3: { min: 40, max: 100, label: 'Obesity class III', color: '#8b5cf6' }
    };
    this.bodyFrameAdjustments = { small: 0.9, medium: 1.0, large: 1.1 };
  }

  calculateBasic(formData) {
    const height = this.getHeightInMeters(formData);
    const heightInInches = this.getHeightInInches(formData);
    const gender = formData.gender;

    const devine = this.calculateDevine(heightInInches, gender);
    const robinson = this.calculateRobinson(heightInInches, gender);
    const miller = this.calculateMiller(heightInInches, gender);
    const hamwi = this.calculateHamwi(heightInInches, gender);

    const avgIdealWeight = (devine + robinson + miller + hamwi) / 4;
    const bmiRange = this.calculateBMIRange(height);

    return {
      devine: Math.round(devine * 10) / 10,
      robinson: Math.round(robinson * 10) / 10,
      miller: Math.round(miller * 10) / 10,
      hamwi: Math.round(hamwi * 10) / 10,
      average: Math.round(avgIdealWeight * 10) / 10,
      bmiRange,
      height: height * 100
    };
  }

  calculateAdvanced(formData) {
    const height = this.getHeightInMeters(formData);
    const heightInInches = this.getHeightInInches(formData);
    const gender = formData.gender;
    const age = parseInt(formData.age);
    const bodyType = formData.bodyType;
    const currentWeight = this.getCurrentWeightInKg(formData);

    let devine = this.calculateDevine(heightInInches, gender);
    let robinson = this.calculateRobinson(heightInInches, gender);
    let miller = this.calculateMiller(heightInInches, gender);
    let hamwi = this.calculateHamwi(heightInInches, gender);

    const frameAdjustment = this.bodyFrameAdjustments[bodyType];
    devine *= frameAdjustment;
    robinson *= frameAdjustment;
    miller *= frameAdjustment;
    hamwi *= frameAdjustment;

    if (age > 50) {
      const ageFactor = 1 - ((age - 50) * 0.003);
      devine *= ageFactor;
      robinson *= ageFactor;
      miller *= ageFactor;
      hamwi *= ageFactor;
    }

    const avgIdealWeight = (devine + robinson + miller + hamwi) / 4;
    const bmi = currentWeight ? this.calculateBMI(currentWeight, height) : null;
    const bmiCategory = bmi ? this.getBMICategory(bmi) : null;
    const bmiRange = this.calculateBMIRange(height);
    const weightComparison = currentWeight ? this.calculateWeightComparison(currentWeight, avgIdealWeight) : null;

    return {
      devine: Math.round(devine * 10) / 10,
      robinson: Math.round(robinson * 10) / 10,
      miller: Math.round(miller * 10) / 10,
      hamwi: Math.round(hamwi * 10) / 10,
      average: Math.round(avgIdealWeight * 10) / 10,
      bmi: bmi ? Math.round(bmi * 10) / 10 : null,
      bmiCategory,
      bmiRange,
      weightComparison,
      height: height * 100
    };
  }

  calculateDevine(heightInInches, gender) {
    return gender === 'male' ? 50 + 2.3 * (heightInInches - 60) : 45.5 + 2.3 * (heightInInches - 60);
  }

  calculateRobinson(heightInInches, gender) {
    return gender === 'male' ? 52 + 1.9 * (heightInInches - 60) : 49 + 1.7 * (heightInInches - 60);
  }

  calculateMiller(heightInInches, gender) {
    return gender === 'male' ? 56.2 + 1.41 * (heightInInches - 60) : 53.1 + 1.36 * (heightInInches - 60);
  }

  calculateHamwi(heightInInches, gender) {
    return gender === 'male' ? 48 + 2.7 * (heightInInches - 60) : 45.5 + 2.2 * (heightInInches - 60);
  }

  calculateBMI(weight, height) {
    return weight / (height * height);
  }

  getBMICategory(bmi) {
    for (const [key, category] of Object.entries(this.bmiCategories)) {
      if (bmi >= category.min && bmi < category.max) {
        return { name: category.label, color: category.color, key };
      }
    }
    return { name: 'Out of Range', color: '#95a5a6', key: 'outOfRange' };
  }

  calculateBMIRange(height) {
    const minWeight = 18.5 * (height * height);
    const maxWeight = 24.9 * (height * height);
    return { min: Math.round(minWeight * 10) / 10, max: Math.round(maxWeight * 10) / 10 };
  }

  calculateWeightComparison(currentWeight, idealWeight) {
    const difference = currentWeight - idealWeight;
    const percentage = (difference / idealWeight) * 100;
    let status = Math.abs(percentage) <= 5 ? 'optimal' : percentage > 5 ? 'overweight' : 'underweight';
    return {
      current: Math.round(currentWeight * 10) / 10,
      ideal: Math.round(idealWeight * 10) / 10,
      difference: Math.round(difference * 10) / 10,
      percentage: Math.round(percentage * 10) / 10,
      status
    };
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

  getHeightInInches(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height) / 2.54;
    } else {
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 12) + inches;
    }
  }

  getCurrentWeightInKg(formData) {
    if (!formData.currentWeight) return null;
    const weight = parseFloat(formData.currentWeight);
    return formData.weightUnit === 'lb' ? weight * 0.453592 : weight;
  }
}

const IdealWeightCalculator = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [basicFormData, setBasicFormData] = useState({
    gender: 'male',
    height: '',
    heightInches: '',
    heightUnit: 'cm'
  });
  const [advancedFormData, setAdvancedFormData] = useState({
    gender: 'male',
    age: '',
    height: '',
    heightInches: '',
    heightUnit: 'cm',
    bodyType: 'medium',
    activityLevel: 'light',
    weightUnit: 'kg',
    currentWeight: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const toolData = {
    name: 'Ideal Weight Calculator',
    description: 'Calculate your ideal body weight using multiple scientific formulas. Get personalized recommendations based on your height, gender, age, and body frame.',
    icon: 'fas fa-balance-scale',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Ideal Weight Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, ideal weight, healthy weight, BMI, Devine formula, Robinson formula, Miller formula, Hamwi formula`;
  const canonicalUrl = `https://tuitility.vercel.app/health/calculators/ideal-weight-calculator`;

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
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' },
    { name: 'Weight Gain Calculator', url: '/health/calculators/weight-gain-calculator', icon: 'fas fa-chart-line' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-ideal-weight', title: 'What is Ideal Weight?' },
    { id: 'calculation-methods', title: 'Calculation Methods' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleBasicInputChange = (field, value) => {
    setBasicFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAdvancedInputChange = (field, value) => {
    setAdvancedFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateBasicInputs = () => {
    const { height } = basicFormData;
    if (!height || parseFloat(height) <= 0) {
      setError('Please enter a valid height.');
      return false;
    }
    return true;
  };

  const validateAdvancedInputs = () => {
    const { age, height, currentWeight } = advancedFormData;
    if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
      setError('Please enter a valid age between 18 and 100.');
      return false;
    }
    if (!height || parseFloat(height) <= 0) {
      setError('Please enter a valid height.');
      return false;
    }
    return true;
  };

  const calculateIdealWeight = () => {
    if (activeTab === 'basic') {
      if (!validateBasicInputs()) return;
      try {
        const calculator = new IdealWeightCalculatorLogic();
        const result = calculator.calculateBasic(basicFormData);
        setResult({ ...result, mode: 'basic' });
        setError('');
      } catch (error) {
        setError('An error occurred during calculation. Please check your inputs.');
        setResult(null);
      }
    } else {
      if (!validateAdvancedInputs()) return;
      try {
        const calculator = new IdealWeightCalculatorLogic();
        const result = calculator.calculateAdvanced(advancedFormData);
        setResult({ ...result, mode: 'advanced' });
        setError('');
      } catch (error) {
        setError('An error occurred during calculation. Please check your inputs.');
        setResult(null);
      }
    }
  };

  const handleReset = () => {
    setBasicFormData({
      gender: 'male',
      height: '',
      heightInches: '',
      heightUnit: 'cm'
    });
    setAdvancedFormData({
      gender: 'male',
      age: '',
      height: '',
      heightInches: '',
      heightUnit: 'cm',
      bodyType: 'medium',
      activityLevel: 'light',
      weightUnit: 'kg',
      currentWeight: ''
    });
    setResult(null);
    setError('');
  };

  const formatWeight = (weight) => {
    return `${weight.toFixed(1)} kg`;
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
          title="Ideal Weight Calculator"
          onCalculate={calculateIdealWeight}
          calculateButtonText="Calculate Ideal Weight"
          error={error}
          result={null}
        >
          <div className="ideal-weight-calculator-form">
            {/* Tab Navigation */}
            <div className="ideal-weight-tabs">
              <button 
                className={`ideal-weight-tab ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                <i className="fas fa-calculator"></i>
                Basic Calculator
              </button>
              <button 
                className={`ideal-weight-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setActiveTab('advanced')}
              >
                <i className="fas fa-cogs"></i>
                Advanced Calculator
              </button>
            </div>

            {/* Basic Calculator */}
            {activeTab === 'basic' && (
              <div className="ideal-weight-calculator-content">
                <div className="ideal-weight-section-title">Basic Information</div>
                <div className="ideal-weight-input-row">
                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-gender-basic" className="ideal-weight-input-label">
                      Gender:
                    </label>
                    <select
                      id="ideal-weight-gender-basic"
                      className="ideal-weight-select-field"
                      value={basicFormData.gender}
                      onChange={(e) => handleBasicInputChange('gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-height-unit" className="ideal-weight-input-label">
                      Height Unit:
                    </label>
                    <select
                      id="ideal-weight-height-unit"
                      className="ideal-weight-select-field"
                      value={basicFormData.heightUnit}
                      onChange={(e) => handleBasicInputChange('heightUnit', e.target.value)}
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="ft">Feet & Inches</option>
                    </select>
                  </div>
                </div>

                <div className="ideal-weight-input-row">
                  {basicFormData.heightUnit === 'cm' ? (
                    <div className="ideal-weight-input-group">
                      <label htmlFor="ideal-weight-height-cm" className="ideal-weight-input-label">
                        Height (cm):
                      </label>
                      <input
                        type="number"
                        id="ideal-weight-height-cm"
                        className="ideal-weight-input-field"
                        value={basicFormData.height}
                        onChange={(e) => handleBasicInputChange('height', e.target.value)}
                        placeholder="e.g., 175"
                        min="130"
                        max="230"
                        step="0.1"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="ideal-weight-input-group">
                        <label htmlFor="ideal-weight-height-ft" className="ideal-weight-input-label">
                          Height (feet):
                        </label>
                        <input
                          type="number"
                          id="ideal-weight-height-ft"
                          className="ideal-weight-input-field"
                          value={basicFormData.height}
                          onChange={(e) => handleBasicInputChange('height', e.target.value)}
                          placeholder="e.g., 5"
                          min="4"
                          max="8"
                          step="1"
                        />
                      </div>
                      <div className="ideal-weight-input-group">
                        <label htmlFor="ideal-weight-height-in" className="ideal-weight-input-label">
                          Height (inches):
                        </label>
                        <input
                          type="number"
                          id="ideal-weight-height-in"
                          className="ideal-weight-input-field"
                          value={basicFormData.heightInches}
                          onChange={(e) => handleBasicInputChange('heightInches', e.target.value)}
                          placeholder="e.g., 9"
                          min="0"
                          max="11"
                          step="0.1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Calculator */}
            {activeTab === 'advanced' && (
              <div className="ideal-weight-calculator-content">
                <div className="ideal-weight-section-title">Advanced Information</div>
                <div className="ideal-weight-input-row">
                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-gender-adv" className="ideal-weight-input-label">
                      Gender:
                    </label>
                    <select
                      id="ideal-weight-gender-adv"
                      className="ideal-weight-select-field"
                      value={advancedFormData.gender}
                      onChange={(e) => handleAdvancedInputChange('gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-age" className="ideal-weight-input-label">
                      Age (years):
                    </label>
                    <input
                      type="number"
                      id="ideal-weight-age"
                      className="ideal-weight-input-field"
                      value={advancedFormData.age}
                      onChange={(e) => handleAdvancedInputChange('age', e.target.value)}
                      placeholder="e.g., 30"
                      min="18"
                      max="100"
                      step="1"
                    />
                  </div>

                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-body-type" className="ideal-weight-input-label">
                      Body Frame:
                    </label>
                    <select
                      id="ideal-weight-body-type"
                      className="ideal-weight-select-field"
                      value={advancedFormData.bodyType}
                      onChange={(e) => handleAdvancedInputChange('bodyType', e.target.value)}
                    >
                      <option value="small">Small Frame</option>
                      <option value="medium">Medium Frame</option>
                      <option value="large">Large Frame</option>
                    </select>
                  </div>
                </div>

                <div className="ideal-weight-input-row">
                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-height-unit-adv" className="ideal-weight-input-label">
                      Height Unit:
                    </label>
                    <select
                      id="ideal-weight-height-unit-adv"
                      className="ideal-weight-select-field"
                      value={advancedFormData.heightUnit}
                      onChange={(e) => handleAdvancedInputChange('heightUnit', e.target.value)}
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="ft">Feet & Inches</option>
                    </select>
                  </div>

                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-weight-unit" className="ideal-weight-input-label">
                      Weight Unit:
                    </label>
                    <select
                      id="ideal-weight-weight-unit"
                      className="ideal-weight-select-field"
                      value={advancedFormData.weightUnit}
                      onChange={(e) => handleAdvancedInputChange('weightUnit', e.target.value)}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lb">Pounds (lb)</option>
                    </select>
                  </div>
                </div>

                <div className="ideal-weight-input-row">
                  {advancedFormData.heightUnit === 'cm' ? (
                    <div className="ideal-weight-input-group">
                      <label htmlFor="ideal-weight-height-cm-adv" className="ideal-weight-input-label">
                        Height (cm):
                      </label>
                      <input
                        type="number"
                        id="ideal-weight-height-cm-adv"
                        className="ideal-weight-input-field"
                        value={advancedFormData.height}
                        onChange={(e) => handleAdvancedInputChange('height', e.target.value)}
                        placeholder="e.g., 175"
                        min="130"
                        max="230"
                        step="0.1"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="ideal-weight-input-group">
                        <label htmlFor="ideal-weight-height-ft-adv" className="ideal-weight-input-label">
                          Height (feet):
                        </label>
                        <input
                          type="number"
                          id="ideal-weight-height-ft-adv"
                          className="ideal-weight-input-field"
                          value={advancedFormData.height}
                          onChange={(e) => handleAdvancedInputChange('height', e.target.value)}
                          placeholder="e.g., 5"
                          min="4"
                          max="8"
                          step="1"
                        />
                      </div>
                      <div className="ideal-weight-input-group">
                        <label htmlFor="ideal-weight-height-in-adv" className="ideal-weight-input-label">
                          Height (inches):
                        </label>
                        <input
                          type="number"
                          id="ideal-weight-height-in-adv"
                          className="ideal-weight-input-field"
                          value={advancedFormData.heightInches}
                          onChange={(e) => handleAdvancedInputChange('heightInches', e.target.value)}
                          placeholder="e.g., 9"
                          min="0"
                          max="11"
                          step="0.1"
                        />
                      </div>
                    </>
                  )}

                  <div className="ideal-weight-input-group">
                    <label htmlFor="ideal-weight-current-weight" className="ideal-weight-input-label">
                      Current Weight ({advancedFormData.weightUnit}):
                    </label>
                    <input
                      type="number"
                      id="ideal-weight-current-weight"
                      className="ideal-weight-input-field"
                      value={advancedFormData.currentWeight}
                      onChange={(e) => handleAdvancedInputChange('currentWeight', e.target.value)}
                      placeholder={advancedFormData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                      min="30"
                      max="300"
                      step="0.1"
                    />
                    <small className="ideal-weight-input-help">
                      Optional: Enter your current weight for comparison
                    </small>
                  </div>
                </div>
              </div>
            )}

            <div className="ideal-weight-calculator-actions">
              <button type="button" className="ideal-weight-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="ideal-weight-calculator-result">
              <h3 className="ideal-weight-result-title">Ideal Weight Calculation Results</h3>
              <div className="ideal-weight-result-content">
                <div className="ideal-weight-result-main">
                  <div className="ideal-weight-result-item">
                    <strong>Average Ideal Weight:</strong>
                    <span className="ideal-weight-result-value ideal-weight-result-final">
                      {formatWeight(result.average)}
                    </span>
                  </div>
                  <div className="ideal-weight-result-item">
                    <strong>Devine Formula:</strong>
                    <span className="ideal-weight-result-value">
                      {formatWeight(result.devine)}
                    </span>
                  </div>
                  <div className="ideal-weight-result-item">
                    <strong>Robinson Formula:</strong>
                    <span className="ideal-weight-result-value">
                      {formatWeight(result.robinson)}
                    </span>
                  </div>
                  <div className="ideal-weight-result-item">
                    <strong>Miller Formula:</strong>
                    <span className="ideal-weight-result-value">
                      {formatWeight(result.miller)}
                    </span>
                  </div>
                  <div className="ideal-weight-result-item">
                    <strong>Hamwi Formula:</strong>
                    <span className="ideal-weight-result-value">
                      {formatWeight(result.hamwi)}
                    </span>
                  </div>
                  <div className="ideal-weight-result-item">
                    <strong>Healthy BMI Range:</strong>
                    <span className="ideal-weight-result-value">
                      {formatWeight(result.bmiRange.min)} - {formatWeight(result.bmiRange.max)}
                    </span>
                  </div>
                  
                  {result.mode === 'advanced' && result.bmi && (
                    <>
                      <div className="ideal-weight-result-item">
                        <strong>Current BMI:</strong>
                        <span className="ideal-weight-result-value">
                          {result.bmi}
                        </span>
                      </div>
                      <div className="ideal-weight-result-item">
                        <strong>BMI Category:</strong>
                        <span className="ideal-weight-result-value" style={{ color: result.bmiCategory.color }}>
                          {result.bmiCategory.name}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {result.mode === 'advanced' && result.weightComparison && (
                    <>
                      <div className="ideal-weight-result-item">
                        <strong>Current Weight:</strong>
                        <span className="ideal-weight-result-value">
                          {formatWeight(result.weightComparison.current)}
                        </span>
                      </div>
                      <div className="ideal-weight-result-item">
                        <strong>Weight Difference:</strong>
                        <span className="ideal-weight-result-value">
                          {result.weightComparison.difference > 0 ? '+' : ''}{formatWeight(result.weightComparison.difference)}
                        </span>
                      </div>
                      <div className="ideal-weight-result-item">
                        <strong>Status:</strong>
                        <span className="ideal-weight-result-value">
                          {result.weightComparison.status === 'optimal' ? 'Optimal' : 
                           result.weightComparison.status === 'overweight' ? 'Above Ideal' : 'Below Ideal'}
                        </span>
                      </div>
                    </>
                  )}
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
            The Ideal Weight Calculator helps you determine your optimal body weight using multiple 
            scientifically validated formulas. Understanding your ideal weight is important for 
            setting realistic health and fitness goals.
          </p>
          <p>
            Our calculator offers both basic and advanced modes, providing comprehensive analysis 
            including BMI ranges, body frame adjustments, and personalized recommendations based 
            on your individual characteristics.
          </p>
        </ContentSection>

        <ContentSection id="what-is-ideal-weight" title="What is Ideal Weight?">
          <p>
            Ideal weight is the weight range that is considered optimal for your height, gender, 
            and body frame. It's based on statistical analysis of healthy populations and serves 
            as a guideline for maintaining good health.
          </p>
          <ul>
            <li><strong>Devine Formula:</strong> Originally developed for medical dosing</li>
            <li><strong>Robinson Formula:</strong> Based on 1983 Metropolitan Life Insurance data</li>
            <li><strong>Miller Formula:</strong> Alternative calculation method</li>
            <li><strong>Hamwi Formula:</strong> Developed for clinical use</li>
          </ul>
          <p>
            <strong>Important:</strong> Ideal weight is a guideline, not a strict rule. Focus on 
            overall health, body composition, and how you feel rather than just the number on the scale.
          </p>
        </ContentSection>

        <ContentSection id="calculation-methods" title="Calculation Methods">
          <div className="method-section">
            <h3>Basic Calculator</h3>
            <p>
              The basic calculator uses your height and gender to calculate ideal weight using 
              four different formulas. It provides a comprehensive range to help you understand 
              your optimal weight.
            </p>
            <ul>
              <li>Uses height and gender only</li>
              <li>Applies four different formulas</li>
              <li>Shows BMI healthy weight range</li>
              <li>Quick and simple calculation</li>
            </ul>
          </div>

          <div className="method-section">
            <h3>Advanced Calculator</h3>
            <p>
              The advanced calculator considers additional factors like age, body frame, and 
              current weight to provide more personalized results and comparisons.
            </p>
            <ul>
              <li>Includes age and body frame adjustments</li>
              <li>Compares with current weight</li>
              <li>Calculates current BMI and category</li>
              <li>Provides detailed analysis</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Calculator">
          <h3>Basic Calculator</h3>
          <ul className="usage-steps">
            <li><strong>Select Gender:</strong> Choose male or female</li>
            <li><strong>Enter Height:</strong> Input height in cm or feet/inches</li>
            <li><strong>Calculate:</strong> Click "Calculate Ideal Weight" to get results</li>
          </ul>

          <h3>Advanced Calculator</h3>
          <ul className="usage-steps">
            <li><strong>Enter Personal Info:</strong> Gender, age, and body frame</li>
            <li><strong>Enter Height:</strong> Input height in cm or feet/inches</li>
            <li><strong>Enter Current Weight:</strong> Optional for comparison</li>
            <li><strong>Calculate:</strong> Get detailed analysis and recommendations</li>
          </ul>
        </ContentSection>

        <ContentSection id="formulas" title="Formulas & Methods">
          <div className="formula-section">
            <h3>Devine Formula</h3>
            <div className="math-formula">
              {'\text{Men: } Ideal\ Weight = 50 + 2.3 \times (Height_{inches} - 60)'}
            </div>
            <div className="math-formula">
              {'\text{Women: } Ideal\ Weight = 45.5 + 2.3 \times (Height_{inches} - 60)'}
            </div>
          </div>

          <div className="formula-section">
            <h3>Robinson Formula</h3>
            <div className="math-formula">
              {'\text{Men: } Ideal\ Weight = 52 + 1.9 \times (Height_{inches} - 60)'}
            </div>
            <div className="math-formula">
              {'\text{Women: } Ideal\ Weight = 49 + 1.7 \times (Height_{inches} - 60)'}
            </div>
          </div>

          <div className="formula-section">
            <h3>Miller Formula</h3>
            <div className="math-formula">
              {'\text{Men: } Ideal\ Weight = 56.2 + 1.41 \times (Height_{inches} - 60)'}
            </div>
            <div className="math-formula">
              {'\text{Women: } Ideal\ Weight = 53.1 + 1.36 \times (Height_{inches} - 60)'}
            </div>
          </div>

          <div className="formula-section">
            <h3>Hamwi Formula</h3>
            <div className="math-formula">
              {'\text{Men: } Ideal\ Weight = 48 + 2.7 \times (Height_{inches} - 60)'}
            </div>
            <div className="math-formula">
              {'\text{Women: } Ideal\ Weight = 45.5 + 2.2 \times (Height_{inches} - 60)'}
            </div>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Basic Calculator (Male, 175 cm)</h3>
            <div className="example-solution">
              <p><strong>Height:</strong> 175 cm (68.9 inches)</p>
              <p><strong>Devine Formula:</strong> 70.5 kg</p>
              <p><strong>Robinson Formula:</strong> 72.9 kg</p>
              <p><strong>Miller Formula:</strong> 68.7 kg</p>
              <p><strong>Hamwi Formula:</strong> 72.0 kg</p>
              <p><strong>Average Ideal Weight:</strong> 71.0 kg</p>
              <p><strong>BMI Range:</strong> 56.7 - 76.3 kg</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Advanced Calculator (Female, 165 cm, Age 30)</h3>
            <div className="example-solution">
              <p><strong>Height:</strong> 165 cm (65.0 inches)</p>
              <p><strong>Age:</strong> 30 years</p>
              <p><strong>Body Frame:</strong> Medium</p>
              <p><strong>Devine Formula:</strong> 56.0 kg</p>
              <p><strong>Robinson Formula:</strong> 57.5 kg</p>
              <p><strong>Miller Formula:</strong> 60.8 kg</p>
              <p><strong>Hamwi Formula:</strong> 56.5 kg</p>
              <p><strong>Average Ideal Weight:</strong> 57.7 kg</p>
              <p><strong>BMI Range:</strong> 50.4 - 67.8 kg</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding your ideal weight is important for several reasons:</p>
          <ul>
            <li>Provides a target range for health and fitness goals</li>
            <li>Helps assess if you're underweight, normal weight, or overweight</li>
            <li>Guides nutrition and exercise planning</li>
            <li>Important for medical assessments and treatments</li>
            <li>Helps set realistic expectations for weight management</li>
            <li>Useful for athletes and fitness enthusiasts</li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Ideal Weight Calculator provides comprehensive functionality:</p>
          <ul>
            <li><strong>Multiple Formulas:</strong> Devine, Robinson, Miller, and Hamwi methods</li>
            <li><strong>Basic & Advanced Modes:</strong> Simple or detailed calculations</li>
            <li><strong>BMI Analysis:</strong> Current BMI and healthy weight ranges</li>
            <li><strong>Body Frame Adjustments:</strong> Small, medium, and large frame considerations</li>
            <li><strong>Age Considerations:</strong> Adjustments for adults over 50</li>
            <li><strong>Weight Comparison:</strong> Compare current weight with ideal weight</li>
            <li><strong>Multiple Units:</strong> Metric and imperial unit support</li>
            <li><strong>Personalized Results:</strong> Tailored recommendations</li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-target"></i> Goal Setting</h4>
              <p>Set realistic weight management goals</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-heartbeat"></i> Health Assessment</h4>
              <p>Assess your current weight status</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-dumbbell"></i> Fitness Planning</h4>
              <p>Plan nutrition and exercise programs</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-user-md"></i> Medical Consultation</h4>
              <p>Provide data for healthcare discussions</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Progress Tracking</h4>
              <p>Monitor weight management progress</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Body Composition</h4>
              <p>Understand healthy weight ranges</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "Which formula is most accurate?",
              answer: "All formulas provide estimates based on statistical data. The average of all four formulas often gives the most balanced result. Individual results may vary based on body composition, muscle mass, and other factors."
            },
            {
              question: "Should I aim for the exact ideal weight?",
              answer: "Ideal weight is a guideline, not a strict target. Focus on overall health, body composition, and how you feel. A range of ±5% from your ideal weight is generally considered healthy."
            },
            {
              question: "How does body frame affect ideal weight?",
              answer: "Body frame size affects ideal weight calculations. People with larger frames may naturally weigh more, while those with smaller frames may weigh less. The advanced calculator adjusts for this."
            },
            {
              question: "Is ideal weight the same as healthy weight?",
              answer: "Ideal weight is one indicator of health, but not the only one. Healthy weight also considers body composition, muscle mass, overall fitness, and individual health factors."
            },
            {
              question: "Should I use basic or advanced calculator?",
              answer: "Use the basic calculator for a quick estimate. Use the advanced calculator if you want more personalized results, including BMI analysis and weight comparison."
            },
            {
              question: "How often should I check my ideal weight?",
              answer: "Ideal weight doesn't change frequently unless you're still growing. Check it occasionally as a reference point, but focus more on maintaining a healthy lifestyle and body composition."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default IdealWeightCalculator