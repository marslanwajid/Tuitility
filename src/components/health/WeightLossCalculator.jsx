import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/weight-loss-calculator.css'

const WeightLossCalculator = () => {
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    heightUnit: 'cm',
    heightCm: '',
    heightFt: '',
    heightIn: '',
    weightUnit: 'kg',
    currentWeight: '',
    targetWeight: '',
    activityLevel: '1.55',
    lossRate: '0.5',
    timeframe: ''
  });
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Weight Loss Calculator',
    description: 'Calculate your personalized weight loss plan with calorie targets, macronutrient distribution, and timeline projections. Get science-based recommendations for sustainable weight loss.',
    icon: 'fas fa-chart-line',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Weight Loss Calculator']
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
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' },
    { name: 'Water Intake Calculator', url: '/health/calculators/water-intake-calculator', icon: 'fas fa-tint' },
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-weight-loss', title: 'What is Weight Loss?' },
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
    const { age, heightCm, heightFt, heightIn, heightUnit, currentWeight, targetWeight } = formData;
    
    if (!age || parseInt(age) < 15 || parseInt(age) > 80) {
      setError('Please enter a valid age between 15 and 80 years.');
      return false;
    }

    if (heightUnit === 'cm') {
      if (!heightCm || parseFloat(heightCm) < 130 || parseFloat(heightCm) > 230) {
        setError('Please enter a valid height between 130-230 cm.');
        return false;
      }
    } else {
      if (!heightFt || parseFloat(heightFt) <= 0 || !heightIn || parseFloat(heightIn) < 0) {
        setError('Please enter a valid height in feet and inches.');
        return false;
      }
    }

    if (!currentWeight || parseFloat(currentWeight) < 40 || parseFloat(currentWeight) > 200) {
      setError('Please enter a valid current weight between 40-200 kg.');
      return false;
    }

    if (!targetWeight || parseFloat(targetWeight) < 40 || parseFloat(targetWeight) > 200) {
      setError('Please enter a valid target weight between 40-200 kg.');
      return false;
    }

    if (parseFloat(targetWeight) >= parseFloat(currentWeight)) {
      setError('Target weight must be less than current weight for weight loss.');
      return false;
    }

    return true;
  };

  const calculateWeightLoss = () => {
    if (!validateInputs()) return;

    try {
      const { 
        gender, age, heightUnit, heightCm, heightFt, heightIn, 
        weightUnit, currentWeight, targetWeight, activityLevel, lossRate 
      } = formData;
      
      // Convert height to cm
      let heightCmValue;
      if (heightUnit === 'cm') {
        heightCmValue = parseFloat(heightCm);
      } else {
        heightCmValue = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn) * 2.54);
      }
      
      // Convert weights to kg
      let currentWeightKg, targetWeightKg;
      if (weightUnit === 'kg') {
        currentWeightKg = parseFloat(currentWeight);
        targetWeightKg = parseFloat(targetWeight);
      } else {
        currentWeightKg = parseFloat(currentWeight) * 0.453592;
        targetWeightKg = parseFloat(targetWeight) * 0.453592;
      }
      
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (gender === 'male') {
        bmr = 10 * currentWeightKg + 6.25 * heightCmValue - 5 * parseInt(age) + 5;
      } else {
        bmr = 10 * currentWeightKg + 6.25 * heightCmValue - 5 * parseInt(age) - 161;
      }
      
      // Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = bmr * parseFloat(activityLevel);
      
      // Calculate calorie deficit needed based on loss rate
      // 1 kg of weight loss requires approximately 7700 calories
      const caloriesDeficit = parseFloat(lossRate) * 7700 / 7; // Daily deficit
      
      // Calculate total calories needed for weight loss
      const lossCalories = Math.round(tdee - caloriesDeficit);
      
      // Calculate estimated time to reach target weight
      const weightToLose = currentWeightKg - targetWeightKg;
      const estimatedWeeks = weightToLose / parseFloat(lossRate);
      
      // Calculate macronutrient distribution
      const proteinGrams = Math.round(2 * currentWeightKg);
      const proteinCalories = proteinGrams * 4;
      
      const fatCalories = Math.round(lossCalories * 0.25);
      const fatGrams = Math.round(fatCalories / 9);
      
      const carbsCalories = lossCalories - proteinCalories - fatCalories;
      const carbsGrams = Math.round(carbsCalories / 4);
      
      setResult({
        maintenanceCalories: Math.round(tdee),
        lossCalories: lossCalories,
        calorieDeficit: Math.round(caloriesDeficit),
        estimatedWeeks: Math.round(estimatedWeeks * 10) / 10,
        proteinGrams: proteinGrams,
        proteinCalories: proteinCalories,
        carbsGrams: carbsGrams,
        carbsCalories: carbsCalories,
        fatGrams: fatGrams,
        fatCalories: fatCalories,
        weightToLose: Math.round((currentWeightKg - targetWeightKg) * 10) / 10,
        weightUnit: weightUnit
      });
      
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      gender: 'male',
      age: '',
      heightUnit: 'cm',
      heightCm: '',
      heightFt: '',
      heightIn: '',
      weightUnit: 'kg',
      currentWeight: '',
      targetWeight: '',
      activityLevel: '1.55',
      lossRate: '0.5',
      timeframe: ''
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
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Weight Loss Calculator"
        onCalculate={calculateWeightLoss}
        calculateButtonText="Calculate Weight Loss Plan"
        error={error}
        result={null}
      >
        <div className="weight-loss-calculator-form">
          <div className="weight-loss-input-row">
            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-gender" className="weight-loss-input-label">
                Gender:
              </label>
              <select
                id="weight-loss-gender"
                className="weight-loss-input-field"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-age" className="weight-loss-input-label">
                Age (years):
              </label>
              <input
                type="number"
                id="weight-loss-age"
                className="weight-loss-input-field"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="e.g., 30"
                min="15"
                max="80"
              />
            </div>
          </div>

          <div className="weight-loss-input-row">
            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-height-unit" className="weight-loss-input-label">
                Height Unit:
              </label>
              <select
                id="weight-loss-height-unit"
                className="weight-loss-input-field"
                value={formData.heightUnit}
                onChange={(e) => handleInputChange('heightUnit', e.target.value)}
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="ft">Feet & Inches (ft/in)</option>
              </select>
            </div>
          </div>

          <div className="weight-loss-input-row">
            {formData.heightUnit === 'cm' ? (
              <div className="weight-loss-input-group">
                <label htmlFor="weight-loss-height-cm" className="weight-loss-input-label">
                  Height (cm):
                </label>
                <input
                  type="number"
                  id="weight-loss-height-cm"
                  className="weight-loss-input-field"
                  value={formData.heightCm}
                  onChange={(e) => handleInputChange('heightCm', e.target.value)}
                  placeholder="e.g., 175"
                  min="130"
                  max="230"
                  step="0.1"
                />
              </div>
            ) : (
              <>
                <div className="weight-loss-input-group">
                  <label htmlFor="weight-loss-height-ft" className="weight-loss-input-label">
                    Height (ft):
                  </label>
                  <input
                    type="number"
                    id="weight-loss-height-ft"
                    className="weight-loss-input-field"
                    value={formData.heightFt}
                    onChange={(e) => handleInputChange('heightFt', e.target.value)}
                    placeholder="e.g., 5"
                    min="4"
                    max="8"
                  />
                </div>
                <div className="weight-loss-input-group">
                  <label htmlFor="weight-loss-height-in" className="weight-loss-input-label">
                    Height (in):
                  </label>
                  <input
                    type="number"
                    id="weight-loss-height-in"
                    className="weight-loss-input-field"
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

          <div className="weight-loss-input-row">
            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-weight-unit" className="weight-loss-input-label">
                Weight Unit:
              </label>
              <select
                id="weight-loss-weight-unit"
                className="weight-loss-input-field"
                value={formData.weightUnit}
                onChange={(e) => handleInputChange('weightUnit', e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div className="weight-loss-input-row">
            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-current-weight" className="weight-loss-input-label">
                Current Weight:
              </label>
              <input
                type="number"
                id="weight-loss-current-weight"
                className="weight-loss-input-field"
                value={formData.currentWeight}
                onChange={(e) => handleInputChange('currentWeight', e.target.value)}
                placeholder={formData.weightUnit === 'kg' ? 'e.g., 80' : 'e.g., 176'}
                min="40"
                max="200"
                step="0.1"
              />
              <small className="weight-loss-input-help">
                Your current body weight
              </small>
            </div>

            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-target-weight" className="weight-loss-input-label">
                Target Weight:
              </label>
              <input
                type="number"
                id="weight-loss-target-weight"
                className="weight-loss-input-field"
                value={formData.targetWeight}
                onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                placeholder={formData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                min="40"
                max="200"
                step="0.1"
              />
              <small className="weight-loss-input-help">
                Your target body weight
              </small>
            </div>
          </div>

          <div className="weight-loss-input-row">
            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-activity-level" className="weight-loss-input-label">
                Activity Level:
              </label>
              <select
                id="weight-loss-activity-level"
                className="weight-loss-input-field"
                value={formData.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              >
                <option value="1.2">Sedentary (little/no exercise)</option>
                <option value="1.375">Light (light exercise 1-3 days/week)</option>
                <option value="1.55">Moderate (moderate exercise 3-5 days/week)</option>
                <option value="1.725">Very Active (hard exercise 6-7 days/week)</option>
                <option value="1.9">Extra Active (very hard exercise, physical job)</option>
              </select>
            </div>

            <div className="weight-loss-input-group">
              <label htmlFor="weight-loss-loss-rate" className="weight-loss-input-label">
                Weight Loss Rate (kg/week):
              </label>
              <select
                id="weight-loss-loss-rate"
                className="weight-loss-input-field"
                value={formData.lossRate}
                onChange={(e) => handleInputChange('lossRate', e.target.value)}
              >
                <option value="0.25">0.25 kg/week (0.5 lb/week)</option>
                <option value="0.5">0.5 kg/week (1 lb/week)</option>
                <option value="0.75">0.75 kg/week (1.5 lb/week)</option>
                <option value="1.0">1.0 kg/week (2 lb/week)</option>
              </select>
            </div>
          </div>

          <div className="weight-loss-calculator-actions">
            <button type="button" className="weight-loss-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="weight-loss-calculator-result">
            <h3 className="weight-loss-result-title">Weight Loss Plan Results</h3>
            <div className="weight-loss-result-content">
              <div className="weight-loss-result-main">
                <div className="weight-loss-result-item">
                  <strong>Weight to Lose:</strong>
                  <span className="weight-loss-result-value weight-loss-result-final">
                    {result.weightToLose} {result.weightUnit}
                  </span>
                </div>
                <div className="weight-loss-result-item">
                  <strong>Estimated Time:</strong>
                  <span className="weight-loss-result-value">
                    {result.estimatedWeeks} weeks
                  </span>
                </div>
                <div className="weight-loss-result-item">
                  <strong>Maintenance Calories:</strong>
                  <span className="weight-loss-result-value">
                    {result.maintenanceCalories} kcal/day
                  </span>
                </div>
                <div className="weight-loss-result-item">
                  <strong>Weight Loss Calories:</strong>
                  <span className="weight-loss-result-value">
                    {result.lossCalories} kcal/day
                  </span>
                </div>
                <div className="weight-loss-result-item">
                  <strong>Daily Calorie Deficit:</strong>
                  <span className="weight-loss-result-value">
                    {result.calorieDeficit} kcal/day
                  </span>
                </div>
              </div>

              {/* Macronutrient Breakdown */}
              <div className="weight-loss-macronutrient-breakdown">
                <h4 className="weight-loss-macro-title">Macronutrient Distribution</h4>
                <div className="weight-loss-macro-grid">
                  <div className="weight-loss-macro-item">
                    <div className="weight-loss-macro-icon">🥩</div>
                    <div className="weight-loss-macro-content">
                      <div className="weight-loss-macro-name">Protein</div>
                      <div className="weight-loss-macro-amount">{result.proteinGrams}g</div>
                      <div className="weight-loss-macro-calories">({result.proteinCalories} kcal)</div>
                    </div>
                  </div>
                  <div className="weight-loss-macro-item">
                    <div className="weight-loss-macro-icon">🍞</div>
                    <div className="weight-loss-macro-content">
                      <div className="weight-loss-macro-name">Carbohydrates</div>
                      <div className="weight-loss-macro-amount">{result.carbsGrams}g</div>
                      <div className="weight-loss-macro-calories">({result.carbsCalories} kcal)</div>
                    </div>
                  </div>
                  <div className="weight-loss-macro-item">
                    <div className="weight-loss-macro-icon">🥑</div>
                    <div className="weight-loss-macro-content">
                      <div className="weight-loss-macro-name">Fat</div>
                      <div className="weight-loss-macro-amount">{result.fatGrams}g</div>
                      <div className="weight-loss-macro-calories">({result.fatCalories} kcal)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Loss Tips */}
              <div className="weight-loss-tips">
                <h4 className="weight-loss-tips-title">Weight Loss Tips</h4>
                <ul className="weight-loss-tips-list">
                  <li>Create a sustainable calorie deficit through diet and exercise</li>
                  <li>Focus on whole, nutrient-dense foods to meet your calorie targets</li>
                  <li>Include regular strength training to preserve muscle mass</li>
                  <li>Stay hydrated and get adequate sleep for optimal results</li>
                  <li>Track your progress weekly and adjust as needed</li>
                  <li>Be patient - sustainable weight loss takes time</li>
                </ul>
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
          The Weight Loss Calculator is a comprehensive tool that helps you create a personalized weight loss plan 
          based on scientific principles. It calculates your daily calorie needs, optimal macronutrient distribution, 
          and provides realistic timelines for achieving your weight loss goals.
        </p>
        <p>
          Whether you're looking to lose a few pounds or embark on a significant weight loss journey, this calculator 
          provides evidence-based recommendations to help you achieve sustainable results while maintaining your health and energy levels.
        </p>
      </ContentSection>

      <ContentSection id="what-is-weight-loss" title="What is Weight Loss?">
        <p>
          Weight loss occurs when you consume fewer calories than your body burns, creating a calorie deficit. 
          This process involves several key components:
        </p>
        <ul>
          <li>
            <span><strong>Calorie Deficit:</strong> The foundation of weight loss - burning more calories than you consume</span>
          </li>
          <li>
            <span><strong>Metabolism:</strong> Your body's energy expenditure at rest and during activity</span>
          </li>
          <li>
            <span><strong>Macronutrients:</strong> The balance of proteins, carbohydrates, and fats in your diet</span>
          </li>
          <li>
            <span><strong>Muscle Preservation:</strong> Maintaining lean muscle mass during weight loss</span>
          </li>
          <li>
            <span><strong>Sustainable Rate:</strong> Losing weight at a pace that's maintainable long-term</span>
          </li>
          <li>
            <span><strong>Lifestyle Factors:</strong> Exercise, sleep, stress management, and hydration</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Weight Loss Calculator">
        <p>Using the weight loss calculator is straightforward and requires accurate personal information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Personal Details:</strong> Provide your gender, age, height, and current weight</span>
          </li>
          <li>
            <span><strong>Set Your Goal:</strong> Enter your target weight (must be less than current weight)</span>
          </li>
          <li>
            <span><strong>Select Activity Level:</strong> Choose your current activity level for accurate calorie calculations</span>
          </li>
          <li>
            <span><strong>Choose Loss Rate:</strong> Select a sustainable weekly weight loss rate (0.25-1.0 kg/week)</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Weight Loss Plan" to get your personalized recommendations</span>
          </li>
          <li>
            <span><strong>Follow the Plan:</strong> Use the calorie targets and macronutrient distribution to guide your diet</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Start with a moderate weight loss rate (0.5 kg/week) for sustainable results. 
          More aggressive rates may lead to muscle loss and metabolic slowdown.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>BMR Calculation (Mifflin-St Jeor Equation)</h3>
          <div className="math-formula">
            {'\\text{BMR} = 10 \\times \\text{Weight(kg)} + 6.25 \\times \\text{Height(cm)} - 5 \\times \\text{Age} + \\text{Gender Factor}'}
          </div>
          <p>Where Gender Factor = +5 for males, -161 for females</p>
        </div>

        <div className="formula-section">
          <h3>TDEE Calculation</h3>
          <div className="math-formula">
            {'\\text{TDEE} = \\text{BMR} \\times \\text{Activity Factor}'}
          </div>
          <p>Activity factors: Sedentary (1.2), Light (1.375), Moderate (1.55), Very Active (1.725), Extra Active (1.9)</p>
        </div>

        <div className="formula-section">
          <h3>Calorie Deficit for Weight Loss</h3>
          <div className="math-formula">
            {'\\text{Daily Deficit} = \\frac{\\text{Weekly Loss Rate} \\times 7700}{7}'}
          </div>
          <p>Where 7700 calories ≈ 1 kg of body weight</p>
        </div>

        <div className="formula-section">
          <h3>Macronutrient Distribution</h3>
          <div className="math-formula">
            {'\\text{Protein} = 2g \\times \\text{Body Weight(kg)}'}
          </div>
          <p>Fat: 25% of total calories, Carbohydrates: Remaining calories</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Moderate Weight Loss</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 30-year-old female, 165 cm, 70 kg, target 60 kg</p>
            <p><strong>Activity Level:</strong> Moderate (1.55)</p>
            <p><strong>Loss Rate:</strong> 0.5 kg/week</p>
            <p><strong>BMR:</strong> 1,447 kcal/day</p>
            <p><strong>TDEE:</strong> 2,243 kcal/day</p>
            <p><strong>Weight Loss Calories:</strong> 1,693 kcal/day</p>
            <p><strong>Estimated Time:</strong> 20 weeks</p>
            <p><strong>Macros:</strong> Protein: 140g, Carbs: 169g, Fat: 47g</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Conservative Weight Loss</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 35-year-old male, 180 cm, 85 kg, target 75 kg</p>
            <p><strong>Activity Level:</strong> Light (1.375)</p>
            <p><strong>Loss Rate:</strong> 0.25 kg/week</p>
            <p><strong>BMR:</strong> 1,789 kcal/day</p>
            <p><strong>TDEE:</strong> 2,460 kcal/day</p>
            <p><strong>Weight Loss Calories:</strong> 2,185 kcal/day</p>
            <p><strong>Estimated Time:</strong> 40 weeks</p>
            <p><strong>Macros:</strong> Protein: 170g, Carbs: 218g, Fat: 61g</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding weight loss science is crucial for achieving sustainable results:</p>
        <ul>
          <li>
            <span>Prevents muscle loss by maintaining adequate protein intake</span>
          </li>
          <li>
            <span>Ensures adequate nutrition while creating a calorie deficit</span>
          </li>
          <li>
            <span>Sets realistic expectations for weight loss timelines</span>
          </li>
          <li>
            <span>Helps maintain metabolic health during weight loss</span>
          </li>
          <li>
            <span>Reduces risk of weight regain by promoting sustainable habits</span>
          </li>
          <li>
            <span>Supports long-term health and wellness goals</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Weight Loss Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>BMR Calculation:</strong> Uses the scientifically validated Mifflin-St Jeor equation</span>
          </li>
          <li>
            <span><strong>TDEE Estimation:</strong> Accounts for your activity level and lifestyle</span>
          </li>
          <li>
            <span><strong>Calorie Targets:</strong> Calculates maintenance and weight loss calorie needs</span>
          </li>
          <li>
            <span><strong>Macronutrient Distribution:</strong> Optimal protein, carb, and fat ratios</span>
          </li>
          <li>
            <span><strong>Timeline Projection:</strong> Realistic estimates for reaching your goal</span>
          </li>
          <li>
            <span><strong>Safety Validation:</strong> Ensures weight loss rates are within healthy ranges</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Fitness Planning</h4>
            <p>Create structured weight loss programs for clients and personal training</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-utensils"></i> Nutrition Planning</h4>
            <p>Design meal plans that meet specific calorie and macronutrient targets</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Progress Tracking</h4>
            <p>Monitor weight loss progress and adjust plans as needed</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Health Management</h4>
            <p>Support medical weight loss programs and health improvement goals</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Learn about weight loss science and sustainable practices</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Lifestyle Coaching</h4>
            <p>Guide individuals toward healthier eating and exercise habits</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How much weight can I safely lose per week?",
            answer: "A safe and sustainable weight loss rate is 0.25-0.5 kg (0.5-1 lb) per week. Faster rates may lead to muscle loss and metabolic slowdown."
          },
          {
            question: "Why is protein important during weight loss?",
            answer: "Protein helps preserve muscle mass, increases satiety, and has a higher thermic effect, making it crucial for successful weight loss."
          },
          {
            question: "Can I lose weight without exercise?",
            answer: "Yes, weight loss is primarily about calorie deficit. However, exercise helps preserve muscle mass and improves overall health."
          },
          {
            question: "What if I hit a weight loss plateau?",
            answer: "Plateaus are normal. Try adjusting your calorie intake, changing your exercise routine, or reassessing your activity level."
          },
          {
            question: "How accurate are these calculations?",
            answer: "The calculations are based on established scientific formulas, but individual results may vary. Use them as starting points and adjust based on your progress."
          },
          {
            question: "Should I eat back exercise calories?",
            answer: "It depends on your goals. For weight loss, it's generally better to not eat back all exercise calories to maintain your deficit."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default WeightLossCalculator
