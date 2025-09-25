import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/calorie-calculator.css'
import CalorieCalculatorLogic from '../../assets/js/health/calorie-calculator.js'

const CalorieCalculator = () => {
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    height: '',
    heightInches: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    activityLevel: '1.55',
    goal: 'maintain',
    rate: '1'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Calorie Calculator',
    description: 'Calculate your daily calorie needs, BMR, and macronutrient requirements for weight management. Get personalized nutrition recommendations based on your goals.',
    icon: 'fas fa-apple-alt',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Calorie Calculator']
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
    { name: 'Body Fat Calculator', url: '/health/calculators/body-fat-calculator', icon: 'fas fa-user' },
    { name: 'Weight Loss Calculator', url: '/health/calculators/weight-loss-calculator', icon: 'fas fa-chart-line' },
    { name: 'Water Intake Calculator', url: '/health/calculators/water-intake-calculator', icon: 'fas fa-tint' },
    { name: 'Ideal Weight Calculator', url: '/health/calculators/ideal-body-weight-calculator', icon: 'fas fa-balance-scale' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-are-calories', title: 'What are Calories?' },
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
    const { age, height, weight, rate } = formData;
    
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

    if (formData.goal !== 'maintain' && (!rate || parseFloat(rate) <= 0)) {
      setError('Please enter a valid rate for your goal.');
      return false;
    }

    return true;
  };

  const calculateCalories = () => {
    if (!validateInputs()) return;

    try {
      const calculator = new CalorieCalculatorLogic();
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
      gender: 'male',
      age: '',
      height: '',
      heightInches: '',
      heightUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      activityLevel: '1.55',
      goal: 'maintain',
      rate: '1'
    });
    setResult(null);
    setError('');
  };

  // Format weight
  const formatWeight = (weight) => {
    return `${weight.toFixed(1)} kg`;
  };

  // Format calories
  const formatCalories = (calories) => {
    return Math.round(calories);
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
        title="Calorie Calculator"
        onCalculate={calculateCalories}
        calculateButtonText="Calculate Calories"
        error={error}
        result={null}
      >
        <div className="calorie-calculator-form">
          <div className="calorie-input-row">
            <div className="calorie-input-group">
              <label htmlFor="calorie-gender" className="calorie-input-label">
                Gender:
              </label>
              <select
                id="calorie-gender"
                className="calorie-select-field"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="calorie-input-group">
              <label htmlFor="calorie-age" className="calorie-input-label">
                Age (years):
              </label>
              <input
                type="number"
                id="calorie-age"
                className="calorie-input-field"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="e.g., 30"
                min="15"
                max="80"
                step="1"
              />
              <small className="calorie-input-help">
                Age between 15 and 80 years
              </small>
            </div>
          </div>

          <div className="calorie-input-row">
            <div className="calorie-input-group">
              <label htmlFor="calorie-height-unit" className="calorie-input-label">
                Height Unit:
              </label>
              <select
                id="calorie-height-unit"
                className="calorie-select-field"
                value={formData.heightUnit}
                onChange={(e) => handleInputChange('heightUnit', e.target.value)}
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="ft">Feet & Inches</option>
              </select>
            </div>

            <div className="calorie-input-group">
              <label htmlFor="calorie-weight-unit" className="calorie-input-label">
                Weight Unit:
              </label>
              <select
                id="calorie-weight-unit"
                className="calorie-select-field"
                value={formData.weightUnit}
                onChange={(e) => handleInputChange('weightUnit', e.target.value)}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div className="calorie-input-row">
            {formData.heightUnit === 'cm' ? (
              <div className="calorie-input-group">
                <label htmlFor="calorie-height-cm" className="calorie-input-label">
                  Height (cm):
                </label>
                <input
                  type="number"
                  id="calorie-height-cm"
                  className="calorie-input-field"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="e.g., 175"
                  min="130"
                  max="230"
                  step="0.1"
                />
                <small className="calorie-input-help">
                  Enter your height in centimeters
                </small>
              </div>
            ) : (
              <>
                <div className="calorie-input-group">
                  <label htmlFor="calorie-height-ft" className="calorie-input-label">
                    Height (feet):
                  </label>
                  <input
                    type="number"
                    id="calorie-height-ft"
                    className="calorie-input-field"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 5"
                    min="4"
                    max="8"
                    step="1"
                  />
                </div>
                <div className="calorie-input-group">
                  <label htmlFor="calorie-height-in" className="calorie-input-label">
                    Height (inches):
                  </label>
                  <input
                    type="number"
                    id="calorie-height-in"
                    className="calorie-input-field"
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

            <div className="calorie-input-group">
              <label htmlFor="calorie-weight" className="calorie-input-label">
                Current Weight ({formData.weightUnit}):
              </label>
              <input
                type="number"
                id="calorie-weight"
                className="calorie-input-field"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder={formData.weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
                min="40"
                max="200"
                step="0.1"
              />
              <small className="calorie-input-help">
                Enter your current weight in {formData.weightUnit}
              </small>
            </div>
          </div>

          <div className="calorie-input-row">
            <div className="calorie-input-group">
              <label htmlFor="calorie-activity-level" className="calorie-input-label">
                Activity Level:
              </label>
              <select
                id="calorie-activity-level"
                className="calorie-select-field"
                value={formData.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              >
                <option value="1.2">Sedentary (little/no exercise)</option>
                <option value="1.375">Light Activity (light exercise 1-3 days/week)</option>
                <option value="1.55">Moderate Activity (moderate exercise 3-5 days/week)</option>
                <option value="1.725">Very Active (hard exercise 6-7 days/week)</option>
                <option value="1.9">Extra Active (very hard exercise, physical job)</option>
              </select>
              <small className="calorie-input-help">
                Select your typical activity level
              </small>
            </div>

            <div className="calorie-input-group">
              <label htmlFor="calorie-goal" className="calorie-input-label">
                Goal:
              </label>
              <select
                id="calorie-goal"
                className="calorie-select-field"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
              >
                <option value="maintain">Maintain Weight</option>
                <option value="lose">Lose Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>
          </div>

          {formData.goal !== 'maintain' && (
            <div className="calorie-input-row" id="calorie-rate-container">
              <div className="calorie-input-group">
                <label htmlFor="calorie-rate" className="calorie-input-label">
                  Rate ({formData.goal === 'lose' ? 'Weight Loss' : 'Weight Gain'} per week):
                </label>
                <select
                  id="calorie-rate"
                  className="calorie-select-field"
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                >
                  <option value="0.25">0.25 kg/week</option>
                  <option value="0.5">0.5 kg/week</option>
                  <option value="0.75">0.75 kg/week</option>
                  <option value="1">1 kg/week</option>
                  <option value="1.25">1.25 kg/week</option>
                  <option value="1.5">1.5 kg/week</option>
                </select>
                <small className="calorie-input-help">
                  {formData.goal === 'lose' ? 'Recommended: 0.5-1 kg/week for healthy weight loss' : 'Recommended: 0.25-0.5 kg/week for healthy weight gain'}
                </small>
              </div>
            </div>
          )}

          <div className="calorie-calculator-actions">
            <button type="button" className="calorie-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="calorie-calculator-result">
            <h3 className="calorie-result-title">Calorie Calculation Results</h3>
            <div className="calorie-result-content">
              <div className="calorie-result-main">
                <div className="calorie-result-item">
                  <strong>BMR (Basal Metabolic Rate):</strong>
                  <span className="calorie-result-value">
                    {formatCalories(result.bmr)} calories/day
                  </span>
                </div>
                <div className="calorie-result-item">
                  <strong>Maintenance Calories (TDEE):</strong>
                  <span className="calorie-result-value">
                    {formatCalories(result.maintenanceCalories)} calories/day
                  </span>
                </div>
                <div className="calorie-result-item">
                  <strong>Goal Calories:</strong>
                  <span className="calorie-result-value calorie-result-final">
                    {formatCalories(result.goalCalories)} calories/day
                  </span>
                </div>
                {result.calorieChange !== 0 && (
                  <div className="calorie-result-item">
                    <strong>Daily Calorie {result.goal === 'lose' ? 'Deficit' : 'Surplus'}:</strong>
                    <span className="calorie-result-value">
                      {formatCalories(Math.abs(result.calorieChange))} calories/day
                    </span>
                  </div>
                )}
              </div>

              {/* Macronutrients Section */}
              <div className="calorie-macronutrients">
                <h4 className="calorie-macros-title">Macronutrient Breakdown</h4>
                <div className="calorie-macros-grid">
                  <div className="calorie-macro-item">
                    <div className="calorie-macro-header">
                      <i className="fas fa-drumstick-bite"></i>
                      <h5>Protein</h5>
                    </div>
                    <div className="calorie-macro-content">
                      <div className="calorie-macro-grams">{result.macros.protein.grams}g</div>
                      <div className="calorie-macro-calories">{result.macros.protein.calories} calories (30%)</div>
                    </div>
                  </div>

                  <div className="calorie-macro-item">
                    <div className="calorie-macro-header">
                      <i className="fas fa-bread-slice"></i>
                      <h5>Carbohydrates</h5>
                    </div>
                    <div className="calorie-macro-content">
                      <div className="calorie-macro-grams">{result.macros.carbs.grams}g</div>
                      <div className="calorie-macro-calories">{result.macros.carbs.calories} calories (40%)</div>
                    </div>
                  </div>

                  <div className="calorie-macro-item">
                    <div className="calorie-macro-header">
                      <i className="fas fa-seedling"></i>
                      <h5>Fat</h5>
                    </div>
                    <div className="calorie-macro-content">
                      <div className="calorie-macro-grams">{result.macros.fat.grams}g</div>
                      <div className="calorie-macro-calories">{result.macros.fat.calories} calories (30%)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Projection */}
              {result.weightProjection && (
                <div className="calorie-weight-projection">
                  <h4 className="calorie-projection-title">Weight Projection</h4>
                  <div className="calorie-projection-content">
                    <p><strong>Current Weight:</strong> {formatWeight(result.weightProjection.currentWeight)}</p>
                    <p><strong>Projected Weight (12 weeks):</strong> {formatWeight(result.weightProjection.projectedWeight)}</p>
                    <p><strong>Total {result.goal === 'lose' ? 'Weight Loss' : 'Weight Gain'}:</strong> {formatWeight(result.weightProjection.totalChange)}</p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && (
                <div className="calorie-recommendations">
                  <h4 className="calorie-recommendations-title">Recommendations</h4>
                  <div className="calorie-recommendations-content">
                    <ul>
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
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
          The Calorie Calculator is a comprehensive nutrition tool that helps you determine your daily calorie 
          needs based on your personal information, activity level, and health goals. Whether you want to 
          maintain your current weight, lose weight, or gain weight, this calculator provides personalized 
          recommendations for your daily calorie intake and macronutrient distribution.
        </p>
        <p>
          Understanding your calorie needs is fundamental to achieving your health and fitness goals. This 
          calculator uses scientifically validated formulas to calculate your Basal Metabolic Rate (BMR) 
          and Total Daily Energy Expenditure (TDEE), providing you with accurate calorie targets for 
          sustainable weight management.
        </p>
      </ContentSection>

      <ContentSection id="what-are-calories" title="What are Calories?">
        <p>
          A calorie is a unit of energy that measures the amount of energy in food and beverages. When we 
          talk about calories in the context of nutrition, we're referring to kilocalories (kcal), which 
          represent the energy needed to raise the temperature of 1 kilogram of water by 1 degree Celsius.
        </p>
        <ul>
          <li>
            <span><strong>BMR (Basal Metabolic Rate):</strong> The calories your body needs at rest to maintain basic functions</span>
          </li>
          <li>
            <span><strong>TDEE (Total Daily Energy Expenditure):</strong> Total calories burned per day including activity</span>
          </li>
          <li>
            <span><strong>Calorie Deficit:</strong> Consuming fewer calories than you burn (for weight loss)</span>
          </li>
          <li>
            <span><strong>Calorie Surplus:</strong> Consuming more calories than you burn (for weight gain)</span>
          </li>
          <li>
            <span><strong>Macronutrients:</strong> Protein, carbohydrates, and fats that provide calories</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calorie Calculator">
        <p>Using the calorie calculator is straightforward and requires basic personal information:</p>
        
        <ul className="usage-steps">
          <li>
            <span><strong>Personal Information:</strong> Enter your gender, age, height, and current weight</span>
          </li>
          <li>
            <span><strong>Activity Level:</strong> Select your typical activity level from sedentary to extra active</span>
          </li>
          <li>
            <span><strong>Goal Selection:</strong> Choose whether you want to maintain, lose, or gain weight</span>
          </li>
          <li>
            <span><strong>Rate Setting:</strong> If losing or gaining weight, select your desired weekly rate</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Calories" to get your personalized results</span>
          </li>
        </ul>

        <p>
          <strong>Pro Tip:</strong> Be honest about your activity level for the most accurate results. 
          It's better to underestimate than overestimate your activity to avoid consuming too many calories.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>BMR Calculation - Mifflin-St Jeor Equation</h3>
          <div className="math-formula">
            {'\\text{BMR} = 10 \\times \\text{Weight} + 6.25 \\times \\text{Height} - 5 \\times \\text{Age} + \\text{Gender Factor}'}
          </div>
          <p>Gender Factor: +5 for men, -161 for women</p>
        </div>

        <div className="formula-section">
          <h3>TDEE Calculation</h3>
          <div className="math-formula">
            {'\\text{TDEE} = \\text{BMR} \\times \\text{Activity Multiplier}'}
          </div>
          <p>Activity Multipliers: Sedentary (1.2), Light (1.375), Moderate (1.55), Very Active (1.725), Extra Active (1.9)</p>
        </div>

        <div className="formula-section">
          <h3>Weight Loss Calorie Adjustment</h3>
          <div className="math-formula">
            {'\\text{Goal Calories} = \\text{TDEE} - (\\text{Rate} \\times 1100)'}
          </div>
          <p>Approximately 1100 calories deficit per 0.5kg weight loss per week</p>
        </div>

        <div className="formula-section">
          <h3>Weight Gain Calorie Adjustment</h3>
          <div className="math-formula">
            {'\\text{Goal Calories} = \\text{TDEE} + (\\text{Rate} \\times 500)'}
          </div>
          <p>Approximately 500 calories surplus per 0.5kg weight gain per week</p>
        </div>

        <div className="formula-section">
          <h3>Macronutrient Distribution</h3>
          <div className="math-formula">
            {'\\text{Protein} = 30\\%, \\text{Carbs} = 40\\%, \\text{Fat} = 30\\%'}
          </div>
          <p>Calories per gram: Protein (4), Carbs (4), Fat (9)</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Weight Maintenance</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 30-year-old male, 175 cm, 70 kg, moderate activity</p>
            <p><strong>BMR:</strong> 1,785 calories/day</p>
            <p><strong>TDEE:</strong> 2,767 calories/day</p>
            <p><strong>Goal Calories:</strong> 2,767 calories/day (maintain weight)</p>
            <p><strong>Macros:</strong> Protein: 207g, Carbs: 277g, Fat: 92g</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Weight Loss</h3>
          <div className="example-solution">
            <p><strong>Profile:</strong> 25-year-old female, 165 cm, 65 kg, light activity, goal: lose 0.5kg/week</p>
            <p><strong>BMR:</strong> 1,385 calories/day</p>
            <p><strong>TDEE:</strong> 1,904 calories/day</p>
            <p><strong>Goal Calories:</strong> 1,804 calories/day (100 calorie deficit)</p>
            <p><strong>Macros:</strong> Protein: 135g, Carbs: 180g, Fat: 60g</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your calorie needs is crucial for effective weight management and overall health:</p>
        <ul>
          <li>
            <span>Provides a scientific foundation for meal planning and portion control</span>
          </li>
          <li>
            <span>Helps set realistic and achievable weight management goals</span>
          </li>
          <li>
            <span>Prevents overeating or undereating that can harm your health</span>
          </li>
          <li>
            <span>Supports sustainable lifestyle changes rather than crash diets</span>
          </li>
          <li>
            <span>Enables personalized nutrition planning based on individual needs</span>
          </li>
          <li>
            <span>Helps track progress and adjust strategies as needed</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Calorie Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>BMR Calculation:</strong> Accurate basal metabolic rate using Mifflin-St Jeor equation</span>
          </li>
          <li>
            <span><strong>TDEE Calculation:</strong> Total daily energy expenditure based on activity level</span>
          </li>
          <li>
            <span><strong>Goal-Based Calorie Targets:</strong> Personalized calorie needs for weight goals</span>
          </li>
          <li>
            <span><strong>Macronutrient Breakdown:</strong> Protein, carbohydrate, and fat distribution</span>
          </li>
          <li>
            <span><strong>Weight Projection:</strong> 12-week weight change projections</span>
          </li>
          <li>
            <span><strong>Safety Limits:</strong> Minimum calorie recommendations to prevent health risks</span>
          </li>
          <li>
            <span><strong>Multiple Unit Support:</strong> Metric and imperial unit systems</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-utensils"></i> Meal Planning</h4>
            <p>Plan balanced meals that meet your daily calorie and macronutrient needs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Weight Management</h4>
            <p>Set realistic calorie targets for sustainable weight loss or gain</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-dumbbell"></i> Fitness Planning</h4>
            <p>Optimize nutrition to support your fitness and training goals</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-heartbeat"></i> Health Monitoring</h4>
            <p>Track calorie intake to maintain optimal health and energy levels</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-balance-scale"></i> Portion Control</h4>
            <p>Learn appropriate portion sizes based on your calorie needs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-pie"></i> Nutrition Education</h4>
            <p>Understand the relationship between calories, macronutrients, and health</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How accurate are the calorie calculations?",
            answer: "The calculations use the scientifically validated Mifflin-St Jeor equation for BMR, which is considered one of the most accurate formulas. However, individual metabolism can vary, so use these as starting points and adjust based on your results."
          },
          {
            question: "What if my calculated calories seem too low?",
            answer: "The calculator enforces minimum calorie limits (1200 for women, 1500 for men) to prevent health risks. If your calculated calories are below these limits, the calculator will adjust them and show a warning."
          },
          {
            question: "How often should I recalculate my calorie needs?",
            answer: "Recalculate every 4-6 weeks or when your weight changes significantly (5+ kg). As you lose or gain weight, your BMR changes, so your calorie needs will also change."
          },
          {
            question: "What's the difference between BMR and TDEE?",
            answer: "BMR (Basal Metabolic Rate) is the calories you burn at rest for basic body functions. TDEE (Total Daily Energy Expenditure) includes BMR plus calories burned through daily activities and exercise."
          },
          {
            question: "Is the 30-40-30 macronutrient split right for everyone?",
            answer: "This is a general guideline that works well for most people. Athletes or people with specific dietary needs may benefit from different ratios. Consult a nutritionist for personalized macronutrient targets."
          },
          {
            question: "How quickly should I expect to see results?",
            answer: "Weight changes typically become noticeable after 2-4 weeks of consistent calorie tracking. Remember that weight can fluctuate daily due to water retention, so focus on weekly trends rather than daily changes."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default CalorieCalculator
