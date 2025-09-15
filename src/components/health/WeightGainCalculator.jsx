import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/weight-gain-calculator.css'

const WeightGainCalculator = () => {
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
    gainRate: '0.5',
    timeframe: ''
  });
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Weight Gain Calculator',
    description: 'Calculate your personalized weight gain plan with calorie targets, macronutrient distribution, and timeline projections. Get science-based recommendations for healthy weight gain.',
    icon: 'fas fa-chart-line',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Weight Gain Calculator']
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
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' },
    { name: 'Water Intake Calculator', url: '/health/calculators/water-intake-calculator', icon: 'fas fa-tint' },
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-weight-gain', title: 'What is Weight Gain?' },
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

    if (parseFloat(targetWeight) <= parseFloat(currentWeight)) {
      setError('Target weight must be greater than current weight for weight gain.');
      return false;
    }

    return true;
  };

  const calculateWeightGain = () => {
    if (!validateInputs()) return;

    try {
      const { 
        gender, age, heightUnit, heightCm, heightFt, heightIn, 
        weightUnit, currentWeight, targetWeight, activityLevel, gainRate 
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
      
      // Calculate calorie surplus needed based on gain rate
      // 1 kg of weight gain requires approximately 7700 calories
      const caloriesSurplus = parseFloat(gainRate) * 7700 / 7; // Daily surplus
      
      // Calculate total calories needed for weight gain
      const gainCalories = Math.round(tdee + caloriesSurplus);
      
      // Calculate estimated time to reach target weight
      const weightToGain = targetWeightKg - currentWeightKg;
      const estimatedWeeks = weightToGain / parseFloat(gainRate);
      
      // Calculate macronutrient distribution
      const proteinGrams = Math.round(2 * currentWeightKg);
      const proteinCalories = proteinGrams * 4;
      
      const fatCalories = Math.round(gainCalories * 0.25);
      const fatGrams = Math.round(fatCalories / 9);
      
      const carbsCalories = gainCalories - proteinCalories - fatCalories;
      const carbsGrams = Math.round(carbsCalories / 4);
      
      setResult({
        maintenanceCalories: Math.round(tdee),
        gainCalories: gainCalories,
        calorieSurplus: Math.round(caloriesSurplus),
        estimatedWeeks: Math.round(estimatedWeeks * 10) / 10,
        proteinGrams: proteinGrams,
        proteinCalories: proteinCalories,
        carbsGrams: carbsGrams,
        carbsCalories: carbsCalories,
        fatGrams: fatGrams,
        fatCalories: fatCalories,
        weightToGain: Math.round((targetWeightKg - currentWeightKg) * 10) / 10,
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
      gainRate: '0.5',
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
        title="Weight Gain Calculator"
        onCalculate={calculateWeightGain}
        calculateButtonText="Calculate Weight Gain Plan"
        error={error}
        result={null}
      >
        <div className="weight-gain-calculator-form">
          <div className="weight-gain-input-row">
            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-gender" className="weight-gain-input-label">
                Gender:
              </label>
              <select
                id="weight-gain-gender"
                className="weight-gain-input-field"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-age" className="weight-gain-input-label">
                Age (years):
              </label>
              <input
                type="number"
                id="weight-gain-age"
                className="weight-gain-input-field"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="e.g., 30"
                min="15"
                max="80"
              />
            </div>
          </div>

          <div className="weight-gain-input-row">
            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-height-unit" className="weight-gain-input-label">
                Height Unit:
              </label>
              <select
                id="weight-gain-height-unit"
                className="weight-gain-input-field"
                value={formData.heightUnit}
                onChange={(e) => handleInputChange('heightUnit', e.target.value)}
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="ft">Feet & Inches (ft/in)</option>
              </select>
            </div>
          </div>

          <div className="weight-gain-input-row">
            {formData.heightUnit === 'cm' ? (
              <div className="weight-gain-input-group">
                <label htmlFor="weight-gain-height-cm" className="weight-gain-input-label">
                  Height (cm):
                </label>
                <input
                  type="number"
                  id="weight-gain-height-cm"
                  className="weight-gain-input-field"
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
                <div className="weight-gain-input-group">
                  <label htmlFor="weight-gain-height-ft" className="weight-gain-input-label">
                    Height (ft):
                  </label>
                  <input
                    type="number"
                    id="weight-gain-height-ft"
                    className="weight-gain-input-field"
                    value={formData.heightFt}
                    onChange={(e) => handleInputChange('heightFt', e.target.value)}
                    placeholder="e.g., 5"
                    min="4"
                    max="8"
                  />
                </div>
                <div className="weight-gain-input-group">
                  <label htmlFor="weight-gain-height-in" className="weight-gain-input-label">
                    Height (in):
                  </label>
                  <input
                    type="number"
                    id="weight-gain-height-in"
                    className="weight-gain-input-field"
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

          <div className="weight-gain-input-row">
            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-weight-unit" className="weight-gain-input-label">
                Weight Unit:
              </label>
              <select
                id="weight-gain-weight-unit"
                className="weight-gain-input-field"
                value={formData.weightUnit}
                onChange={(e) => handleInputChange('weightUnit', e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div className="weight-gain-input-row">
            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-current-weight" className="weight-gain-input-label">
                Current Weight:
              </label>
              <input
                type="number"
                id="weight-gain-current-weight"
                className="weight-gain-input-field"
                value={formData.currentWeight}
                onChange={(e) => handleInputChange('currentWeight', e.target.value)}
                placeholder={formData.weightUnit === 'kg' ? 'e.g., 60' : 'e.g., 132'}
                min="40"
                max="200"
                step="0.1"
              />
              <small className="weight-gain-input-help">
                Your current body weight
              </small>
            </div>

            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-target-weight" className="weight-gain-input-label">
                Target Weight:
              </label>
              <input
                type="number"
                id="weight-gain-target-weight"
                className="weight-gain-input-field"
                value={formData.targetWeight}
                onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                placeholder={formData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                min="40"
                max="200"
                step="0.1"
              />
              <small className="weight-gain-input-help">
                Your target body weight
              </small>
            </div>
          </div>

          <div className="weight-gain-input-row">
            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-activity-level" className="weight-gain-input-label">
                Activity Level:
              </label>
              <select
                id="weight-gain-activity-level"
                className="weight-gain-input-field"
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

            <div className="weight-gain-input-group">
              <label htmlFor="weight-gain-gain-rate" className="weight-gain-input-label">
                Weight Gain Rate (kg/week):
              </label>
              <select
                id="weight-gain-gain-rate"
                className="weight-gain-input-field"
                value={formData.gainRate}
                onChange={(e) => handleInputChange('gainRate', e.target.value)}
              >
                <option value="0.25">0.25 kg/week (0.5 lb/week)</option>
                <option value="0.5">0.5 kg/week (1 lb/week)</option>
                <option value="0.75">0.75 kg/week (1.5 lb/week)</option>
                <option value="1.0">1.0 kg/week (2 lb/week)</option>
              </select>
            </div>
          </div>

          <div className="weight-gain-calculator-actions">
            <button type="button" className="weight-gain-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="weight-gain-calculator-result">
            <h3 className="weight-gain-result-title">Weight Gain Plan Results</h3>
            <div className="weight-gain-result-content">
              <div className="weight-gain-result-main">
                <div className="weight-gain-result-item">
                  <strong>Weight to Gain:</strong>
                  <span className="weight-gain-result-value weight-gain-result-final">
                    {result.weightToGain} {result.weightUnit}
                  </span>
                </div>
                <div className="weight-gain-result-item">
                  <strong>Estimated Time:</strong>
                  <span className="weight-gain-result-value">
                    {result.estimatedWeeks} weeks
                  </span>
                </div>
                <div className="weight-gain-result-item">
                  <strong>Maintenance Calories:</strong>
                  <span className="weight-gain-result-value">
                    {result.maintenanceCalories} kcal/day
                  </span>
                </div>
                <div className="weight-gain-result-item">
                  <strong>Weight Gain Calories:</strong>
                  <span className="weight-gain-result-value">
                    {result.gainCalories} kcal/day
                  </span>
                </div>
                <div className="weight-gain-result-item">
                  <strong>Daily Calorie Surplus:</strong>
                  <span className="weight-gain-result-value">
                    {result.calorieSurplus} kcal/day
                  </span>
                </div>
              </div>

              {/* Macronutrient Breakdown */}
              <div className="weight-gain-macronutrient-breakdown">
                <h4 className="weight-gain-macro-title">Macronutrient Distribution</h4>
                <div className="weight-gain-macro-grid">
                  <div className="weight-gain-macro-item">
                    <div className="weight-gain-macro-icon">🥩</div>
                    <div className="weight-gain-macro-content">
                      <div className="weight-gain-macro-name">Protein</div>
                      <div className="weight-gain-macro-amount">{result.proteinGrams}g</div>
                      <div className="weight-gain-macro-calories">({result.proteinCalories} kcal)</div>
                    </div>
                  </div>
                  <div className="weight-gain-macro-item">
                    <div className="weight-gain-macro-icon">🍞</div>
                    <div className="weight-gain-macro-content">
                      <div className="weight-gain-macro-name">Carbohydrates</div>
                      <div className="weight-gain-macro-amount">{result.carbsGrams}g</div>
                      <div className="weight-gain-macro-calories">({result.carbsCalories} kcal)</div>
                    </div>
                  </div>
                  <div className="weight-gain-macro-item">
                    <div className="weight-gain-macro-icon">🥑</div>
                    <div className="weight-gain-macro-content">
                      <div className="weight-gain-macro-name">Fat</div>
                      <div className="weight-gain-macro-amount">{result.fatGrams}g</div>
                      <div className="weight-gain-macro-calories">({result.fatCalories} kcal)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Gain Tips */}
              <div className="weight-gain-tips">
                <h4 className="weight-gain-tips-title">Weight Gain Tips</h4>
                <ul className="weight-gain-tips-list">
                  <li>Focus on nutrient-dense foods to meet your calorie targets</li>
                  <li>Include regular strength training to build muscle mass</li>
                  <li>Eat frequent meals and snacks throughout the day</li>
                  <li>Choose healthy fats and complex carbohydrates</li>
                  <li>Stay consistent with your eating schedule</li>
                  <li>Monitor your progress and adjust as needed</li>
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
          The Weight Gain Calculator is a comprehensive tool that helps you create a personalized weight gain plan 
          based on scientific principles. It calculates your daily calorie needs, optimal macronutrient distribution, 
          and provides realistic timelines for achieving your weight gain goals.
        </p>
        <p>
          Whether you're looking to gain a few pounds or build significant muscle mass, this calculator 
          provides evidence-based recommendations to help you achieve healthy weight gain while maintaining proper nutrition and energy levels.
        </p>
      </ContentSection>

      <ContentSection id="what-is-weight-gain" title="What is Weight Gain?">
        <p>
          Weight gain occurs when you consume more calories than your body burns, creating a calorie surplus. 
          This process involves several key components:
        </p>
        <ul>
          <li>
            <span><strong>Calorie Surplus:</strong> The foundation of weight gain - consuming more calories than you burn</span>
          </li>
          <li>
            <span><strong>Metabolism:</strong> Your body's energy expenditure at rest and during activity</span>
          </li>
          <li>
            <span><strong>Macronutrients:</strong> The balance of proteins, carbohydrates, and fats in your diet</span>
          </li>
          <li>
            <span><strong>Muscle Building:</strong> Combining proper nutrition with strength training for lean mass gain</span>
          </li>
          <li>
            <span><strong>Sustainable Rate:</strong> Gaining weight at a pace that's healthy and maintainable</span>
          </li>
          <li>
            <span><strong>Quality Nutrition:</strong> Focusing on nutrient-dense foods for healthy weight gain</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Weight Gain Calculator">
        <p>Using the weight gain calculator is straightforward and requires accurate personal information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Personal Details:</strong> Provide your gender, age, height, and current weight</span>
          </li>
          <li>
            <span><strong>Set Your Goal:</strong> Enter your target weight (must be greater than current weight)</span>
          </li>
          <li>
            <span><strong>Select Activity Level:</strong> Choose your current activity level for accurate calorie calculations</span>
          </li>
          <li>
            <span><strong>Choose Gain Rate:</strong> Select a healthy weekly weight gain rate (0.25-1.0 kg/week)</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Weight Gain Plan" to get your personalized recommendations</span>
          </li>
          <li>
            <span><strong>Follow the Plan:</strong> Use the calorie targets and macronutrient distribution to guide your diet</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Start with a moderate weight gain rate (0.5 kg/week) for sustainable results. 
          Combine your nutrition plan with strength training for optimal muscle building.
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
          <h3>Calorie Surplus for Weight Gain</h3>
          <div className="math-formula">
            {'\\text{Daily Surplus} = \\frac{\\text{Weekly Gain Rate} \\times 7700}{7}'}
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
          <h3>Example 1: Moderate Weight Gain</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 25-year-old male, 175 cm, 65 kg, target 75 kg</p>
            <p><strong>Activity Level:</strong> Moderate (1.55)</p>
            <p><strong>Gain Rate:</strong> 0.5 kg/week</p>
            <p><strong>BMR:</strong> 1,689 kcal/day</p>
            <p><strong>TDEE:</strong> 2,618 kcal/day</p>
            <p><strong>Weight Gain Calories:</strong> 3,168 kcal/day</p>
            <p><strong>Estimated Time:</strong> 20 weeks</p>
            <p><strong>Macros:</strong> Protein: 130g, Carbs: 396g, Fat: 88g</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Conservative Weight Gain</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 30-year-old female, 165 cm, 55 kg, target 60 kg</p>
            <p><strong>Activity Level:</strong> Light (1.375)</p>
            <p><strong>Gain Rate:</strong> 0.25 kg/week</p>
            <p><strong>BMR:</strong> 1,267 kcal/day</p>
            <p><strong>TDEE:</strong> 1,742 kcal/day</p>
            <p><strong>Weight Gain Calories:</strong> 2,017 kcal/day</p>
            <p><strong>Estimated Time:</strong> 20 weeks</p>
            <p><strong>Macros:</strong> Protein: 110g, Carbs: 252g, Fat: 56g</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding weight gain science is crucial for achieving healthy results:</p>
        <ul>
          <li>
            <span>Promotes muscle building through adequate protein intake</span>
          </li>
          <li>
            <span>Ensures proper nutrition while creating a calorie surplus</span>
          </li>
          <li>
            <span>Sets realistic expectations for weight gain timelines</span>
          </li>
          <li>
            <span>Supports metabolic health during weight gain</span>
          </li>
          <li>
            <span>Reduces risk of excessive fat gain by focusing on quality nutrition</span>
          </li>
          <li>
            <span>Supports long-term health and fitness goals</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Weight Gain Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>BMR Calculation:</strong> Uses the scientifically validated Mifflin-St Jeor equation</span>
          </li>
          <li>
            <span><strong>TDEE Estimation:</strong> Accounts for your activity level and lifestyle</span>
          </li>
          <li>
            <span><strong>Calorie Targets:</strong> Calculates maintenance and weight gain calorie needs</span>
          </li>
          <li>
            <span><strong>Macronutrient Distribution:</strong> Optimal protein, carb, and fat ratios</span>
          </li>
          <li>
            <span><strong>Timeline Projection:</strong> Realistic estimates for reaching your goal</span>
          </li>
          <li>
            <span><strong>Safety Validation:</strong> Ensures weight gain rates are within healthy ranges</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Muscle Building</h4>
            <p>Create structured weight gain programs for muscle building and strength training</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-utensils"></i> Nutrition Planning</h4>
            <p>Design meal plans that meet specific calorie and macronutrient targets for weight gain</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Progress Tracking</h4>
            <p>Monitor weight gain progress and adjust plans as needed</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Health Recovery</h4>
            <p>Support recovery from illness or underweight conditions with proper nutrition</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education</h4>
            <p>Learn about weight gain science and healthy practices</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Sports Nutrition</h4>
            <p>Guide athletes toward optimal nutrition for performance and muscle building</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How much weight can I safely gain per week?",
            answer: "A safe and sustainable weight gain rate is 0.25-0.5 kg (0.5-1 lb) per week. Faster rates may lead to excessive fat gain."
          },
          {
            question: "Why is protein important during weight gain?",
            answer: "Protein is essential for muscle building and repair. Aim for 1.6-2.2g per kg of body weight to support lean mass gain."
          },
          {
            question: "Should I focus on muscle or fat gain?",
            answer: "For healthy weight gain, focus on building muscle through strength training and adequate protein intake rather than just gaining fat."
          },
          {
            question: "What if I'm not gaining weight?",
            answer: "Increase your calorie intake gradually, eat more frequently, and ensure you're consuming enough protein and healthy fats."
          },
          {
            question: "How accurate are these calculations?",
            answer: "The calculations are based on established scientific formulas, but individual results may vary. Use them as starting points and adjust based on your progress."
          },
          {
            question: "Should I eat more on workout days?",
            answer: "Yes, you may need additional calories on training days to support muscle building and recovery."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default WeightGainCalculator
