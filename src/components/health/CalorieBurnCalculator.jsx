import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/health/calorie-burn-calculator.css'
import Seo from '../Seo'

// Calorie Burn Calculator Logic Class
class CalorieBurnCalculatorLogic {
  constructor() {
    this.metValues = {
      walking_slow: 2.5, cycling_light: 4.0, swimming_light: 4.5, yoga: 2.5, stretching: 2.3,
      walking_brisk: 3.8, cycling_moderate: 6.8, swimming_moderate: 6.0, dancing: 4.5, hiking: 5.3,
      running: 9.8, cycling_vigorous: 10.0, swimming_vigorous: 9.0, hiit: 8.0, weightlifting: 6.0
    };
    this.activityDescriptions = {
      walking_slow: "Walking at a slow pace is a low-impact activity that's great for beginners.",
      cycling_light: "Light cycling is an excellent cardiovascular exercise that's easy on the joints.",
      swimming_light: "Swimming at a light pace provides a full-body workout with minimal joint stress.",
      yoga: "Yoga combines physical postures, breathing exercises, and meditation for overall wellness.",
      stretching: "Stretching improves flexibility and can help prevent injuries.",
      walking_brisk: "Brisk walking raises your heart rate and can be as effective as jogging for cardiovascular health.",
      cycling_moderate: "Moderate cycling builds endurance and strengthens your lower body.",
      swimming_moderate: "Swimming at a moderate pace is an excellent way to build endurance and muscle tone.",
      dancing: "Dancing is a fun way to improve coordination, balance, and cardiovascular health.",
      hiking: "Hiking combines cardiovascular exercise with the mental benefits of being in nature.",
      running: "Running is a high-impact activity that burns significant calories and improves cardiovascular fitness.",
      cycling_vigorous: "Vigorous cycling is an intense workout that builds strength and endurance.",
      swimming_vigorous: "Vigorous swimming is a challenging workout that builds cardiovascular and muscular strength.",
      hiit: "High-Intensity Interval Training alternates between intense bursts of activity and fixed periods of rest.",
      weightlifting: "Weightlifting builds muscle mass, which can increase your resting metabolic rate."
    };
    this.foodEquivalents = [
      { food: "Apple", calories: 95 }, { food: "Banana", calories: 105 }, { food: "Slice of bread", calories: 80 },
      { food: "Chocolate bar", calories: 230 }, { food: "Cheeseburger", calories: 300 }, { food: "Pizza slice", calories: 285 },
      { food: "Can of soda", calories: 150 }, { food: "Cup of rice", calories: 200 }, { food: "Avocado", calories: 240 },
      { food: "Donut", calories: 195 }, { food: "Glass of wine", calories: 125 }, { food: "Beer", calories: 155 },
      { food: "Cookie", calories: 50 }, { food: "Egg", calories: 70 }, { food: "Cup of pasta", calories: 220 }
    ];
  }

  calculate(formData) {
    const weight = parseFloat(formData.weight);
    const weightUnit = formData.weightUnit;
    const activity = formData.activity;
    const duration = parseFloat(formData.duration);
    const durationUnit = formData.durationUnit;
    const age = parseInt(formData.age) || null;
    const gender = formData.gender || null;
    const height = this.getHeightInCm(formData);
    const fitnessLevel = formData.fitnessLevel || 'intermediate';
    const intensity = formData.intensity || 'moderate';
    const temperature = parseFloat(formData.temperature) || null;
    const temperatureUnit = formData.temperatureUnit || 'c';

    const weightInKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
    const durationInHours = durationUnit === 'min' ? duration / 60 : duration;
    let met = this.metValues[activity] || 3.0;

    met = this.applyPersonalAdjustments(met, { fitnessLevel, age, height, weightInKg, gender, intensity, temperature, temperatureUnit });
    const caloriesBurned = met * weightInKg * durationInHours;
    const fatBurned = caloriesBurned / 7700 * 1000;
    const caloriesPerMinute = caloriesBurned / (durationInHours * 60);
    const timeToBurn = 500 / caloriesPerMinute;
    const dailyGoalPercentage = (durationInHours * 60) / 30 * 100;
    const foodEquivalents = this.getFoodEquivalents(caloriesBurned);
    const explanation = this.generateExplanation({ weight, weightUnit, duration, durationUnit, activity, caloriesBurned, age, height, fitnessLevel });

    return {
      caloriesBurned: Math.round(caloriesBurned),
      met: Math.round(met * 10) / 10,
      fatBurned: Math.round(fatBurned),
      caloriesPerMinute: Math.round(caloriesPerMinute * 10) / 10,
      timeToBurn: Math.round(timeToBurn),
      dailyGoalPercentage: Math.round(dailyGoalPercentage),
      foodEquivalents,
      explanation,
      activityName: this.getActivityName(activity),
      activityDescription: this.activityDescriptions[activity] || ''
    };
  }

  applyPersonalAdjustments(baseMet, adjustments) {
    let met = baseMet;
    if (adjustments.fitnessLevel === 'beginner') met *= 0.85;
    else if (adjustments.fitnessLevel === 'advanced') met *= 1.1;
    else if (adjustments.fitnessLevel === 'athlete') met *= 1.2;

    if (adjustments.age && adjustments.age > 40) {
      const ageFactor = 1 - ((adjustments.age - 40) * 0.005);
      met *= Math.max(0.8, ageFactor);
    }

    if (adjustments.age && adjustments.height > 0 && adjustments.gender) {
      const bmr = this.calculateBMR(adjustments.weightInKg, adjustments.height, adjustments.age, adjustments.gender);
      const averageBMR = adjustments.weightInKg * 24;
      const bmrFactor = bmr / averageBMR;
      met *= bmrFactor;
    }

    if (adjustments.intensity === 'low') met *= 0.85;
    else if (adjustments.intensity === 'high') met *= 1.15;

    if (adjustments.temperature) {
      let temp = adjustments.temperature;
      if (adjustments.temperatureUnit === 'f') temp = (temp - 32) * 5/9;
      if (temp < 10) met *= 1 + ((10 - temp) * 0.01);
      else if (temp > 25) met *= 1 + ((temp - 25) * 0.015);
    }

    return met;
  }

  calculateBMR(weight, height, age, gender) {
    if (gender === 'male') return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    else if (gender === 'female') return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    else return (10 * weight) + (6.25 * height) - (5 * age) - 78;
  }

  getHeightInCm(formData) {
    const heightUnit = formData.heightUnit;
    if (heightUnit === 'ft') {
      const feet = parseFloat(formData.heightFeet) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return ((feet * 12) + inches) * 2.54;
    } else if (heightUnit === 'in') {
      return (parseFloat(formData.height) || 0) * 2.54;
    } else {
      return parseFloat(formData.height) || 0;
    }
  }

  getFoodEquivalents(calories) {
    const equivalents = [];
    let remainingCalories = calories;
    while (equivalents.length < 3 && remainingCalories > 50) {
      const possibleFoods = this.foodEquivalents.filter(food => food.calories <= remainingCalories);
      if (possibleFoods.length === 0) break;
      const randomIndex = Math.floor(Math.random() * possibleFoods.length);
      const selectedFood = possibleFoods[randomIndex];
      const quantity = Math.floor(remainingCalories / selectedFood.calories);
      if (quantity > 0) {
        equivalents.push({ food: selectedFood.food, quantity, calories: quantity * selectedFood.calories });
        remainingCalories -= quantity * selectedFood.calories;
      } else break;
    }
    return equivalents;
  }

  getActivityName(activityKey) {
    const activityNames = {
      walking_slow: "Slow Walking", cycling_light: "Light Cycling", swimming_light: "Light Swimming",
      yoga: "Yoga", stretching: "Stretching", walking_brisk: "Brisk Walking", cycling_moderate: "Moderate Cycling",
      swimming_moderate: "Moderate Swimming", dancing: "Dancing", hiking: "Hiking", running: "Running",
      cycling_vigorous: "Vigorous Cycling", swimming_vigorous: "Vigorous Swimming", hiit: "HIIT", weightlifting: "Weightlifting"
    };
    return activityNames[activityKey] || "Exercise";
  }

  generateExplanation(data) {
    const { weight, weightUnit, duration, durationUnit, activity, caloriesBurned, age, height, fitnessLevel } = data;
    const activityName = this.getActivityName(activity);
    const activityDescription = this.activityDescriptions[activity] || '';
    let explanation = `Based on your weight of ${weight} ${weightUnit} and ${duration} ${durationUnit === 'min' ? 'minutes' : 'hours'} of ${activityName.toLowerCase()}, you've burned approximately ${Math.round(caloriesBurned)} calories. ${activityDescription}`;
    if (age || height > 0) explanation += ` Your personal metrics have been factored into this calculation for greater accuracy.`;
    if (age) explanation += ` Age can affect metabolic rate, and this has been considered in your results.`;
    if (fitnessLevel !== 'intermediate') explanation += ` Your ${fitnessLevel} fitness level impacts how efficiently your body burns calories during exercise.`;
    if (age && height > 0) explanation += ` Your height and age have been used to calculate a personalized metabolic rate for more precise results.`;
    return explanation;
  }

  validateInputs(formData) {
    const errors = [];
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) errors.push('Please enter a valid weight.');
    if (!formData.activity) errors.push('Please select an activity.');
    const duration = parseFloat(formData.duration);
    if (!duration || duration <= 0) errors.push('Please enter a valid duration.');
    if (formData.heightUnit === 'ft') {
      const feet = parseFloat(formData.heightFeet);
      const inches = parseFloat(formData.heightInches) || 0;
      if (formData.heightFeet && (isNaN(feet) || feet < 0)) errors.push('Please enter a valid height in feet.');
      if (formData.heightInches && (isNaN(inches) || inches < 0 || inches >= 12)) errors.push('Inches should be between 0 and 11.');
    } else if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height <= 0) errors.push('Please enter a valid height.');
    }
    if (formData.age) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) errors.push('Please enter a valid age between 1 and 120.');
    }
    if (formData.temperature) {
      const temperature = parseFloat(formData.temperature);
      if (isNaN(temperature) || temperature < -50 || temperature > 60) errors.push('Please enter a valid temperature.');
    }
    return { isValid: errors.length === 0, errors };
  }
}

const CalorieBurnCalculator = () => {
  const [formData, setFormData] = useState({
    weight: '',
    weightUnit: 'kg',
    activity: '',
    duration: '',
    durationUnit: 'min',
    age: '',
    gender: 'male',
    height: '',
    heightFeet: '',
    heightInches: '',
    heightUnit: 'cm',
    fitnessLevel: 'intermediate',
    intensity: 'moderate',
    temperature: '',
    temperatureUnit: 'c'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const toolData = {
    name: 'Calorie Burn Calculator',
    description: 'Calculate calories burned during various activities with personalized adjustments for age, fitness level, and environmental factors. Get detailed insights and food equivalents.',
    icon: 'fas fa-fire',
    category: 'Health',
    breadcrumb: ['Health', 'Calculators', 'Calorie Burn Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, calories burned, exercise, MET values, activity calculator`;
  const canonicalUrl = `https://tuitility.vercel.app/health/calculators/calorie-burn-calculator`;

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
    { name: 'Diabetes Risk Calculator', url: '/health/calculators/diabetes-risk-calculator', icon: 'fas fa-chart-pie' },
    { name: 'Calorie Calculator', url: '/health/calculators/calorie-calculator', icon: 'fas fa-apple-alt' }
  ];

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-calorie-burn', title: 'What is Calorie Burn?' },
    { id: 'met-values', title: 'MET Values' },
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
    const calculator = new CalorieBurnCalculatorLogic();
    const validation = calculator.validateInputs(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return false;
    }
    return true;
  };

  const calculateCalorieBurn = () => {
    if (!validateInputs()) return;

    try {
      const calculator = new CalorieBurnCalculatorLogic();
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
      weight: '',
      weightUnit: 'kg',
      activity: '',
      duration: '',
      durationUnit: 'min',
      age: '',
      gender: 'male',
      height: '',
      heightFeet: '',
      heightInches: '',
      heightUnit: 'cm',
      fitnessLevel: 'intermediate',
      intensity: 'moderate',
      temperature: '',
      temperatureUnit: 'c'
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
          title="Calorie Burn Calculator"
          onCalculate={calculateCalorieBurn}
          calculateButtonText="Calculate Calories Burned"
          error={error}
          result={null}
        >
          <div className="calorie-burn-calculator-form">
            <div className="calorie-burn-section-title">Basic Information</div>
            <div className="calorie-burn-input-row">
              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-weight" className="calorie-burn-input-label">
                  Weight:
                </label>
                <input
                  type="number"
                  id="calorie-burn-weight"
                  className="calorie-burn-input-field"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="e.g., 70"
                  min="1"
                  max="500"
                  step="0.1"
                />
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-weight-unit" className="calorie-burn-input-label">
                  Weight Unit:
                </label>
                <select
                  id="calorie-burn-weight-unit"
                  className="calorie-burn-select-field"
                  value={formData.weightUnit}
                  onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-activity" className="calorie-burn-input-label">
                  Activity:
                </label>
                <select
                  id="calorie-burn-activity"
                  className="calorie-burn-select-field"
                  value={formData.activity}
                  onChange={(e) => handleInputChange('activity', e.target.value)}
                >
                  <option value="">Select Activity</option>
                  <optgroup label="Light Activities">
                    <option value="walking_slow">Slow Walking</option>
                    <option value="cycling_light">Light Cycling</option>
                    <option value="swimming_light">Light Swimming</option>
                    <option value="yoga">Yoga</option>
                    <option value="stretching">Stretching</option>
                  </optgroup>
                  <optgroup label="Moderate Activities">
                    <option value="walking_brisk">Brisk Walking</option>
                    <option value="cycling_moderate">Moderate Cycling</option>
                    <option value="swimming_moderate">Moderate Swimming</option>
                    <option value="dancing">Dancing</option>
                    <option value="hiking">Hiking</option>
                  </optgroup>
                  <optgroup label="Vigorous Activities">
                    <option value="running">Running</option>
                    <option value="cycling_vigorous">Vigorous Cycling</option>
                    <option value="swimming_vigorous">Vigorous Swimming</option>
                    <option value="hiit">HIIT</option>
                    <option value="weightlifting">Weightlifting</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="calorie-burn-input-row">
              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-duration" className="calorie-burn-input-label">
                  Duration:
                </label>
                <input
                  type="number"
                  id="calorie-burn-duration"
                  className="calorie-burn-input-field"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="600"
                  step="1"
                />
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-duration-unit" className="calorie-burn-input-label">
                  Duration Unit:
                </label>
                <select
                  id="calorie-burn-duration-unit"
                  className="calorie-burn-select-field"
                  value={formData.durationUnit}
                  onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                >
                  <option value="min">Minutes</option>
                  <option value="hr">Hours</option>
                </select>
              </div>
            </div>

            <div className="calorie-burn-section-title">Advanced Options (Optional)</div>
            <div className="calorie-burn-input-row">
              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-age" className="calorie-burn-input-label">
                  Age (years):
                </label>
                <input
                  type="number"
                  id="calorie-burn-age"
                  className="calorie-burn-input-field"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="120"
                  step="1"
                />
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-gender" className="calorie-burn-input-label">
                  Gender:
                </label>
                <select
                  id="calorie-burn-gender"
                  className="calorie-burn-select-field"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-height-unit" className="calorie-burn-input-label">
                  Height Unit:
                </label>
                <select
                  id="calorie-burn-height-unit"
                  className="calorie-burn-select-field"
                  value={formData.heightUnit}
                  onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                  <option value="ft">Feet & Inches</option>
                </select>
              </div>
            </div>

            <div className="calorie-burn-input-row">
              {formData.heightUnit === 'ft' ? (
                <>
                  <div className="calorie-burn-input-group">
                    <label htmlFor="calorie-burn-height-feet" className="calorie-burn-input-label">
                      Height (feet):
                    </label>
                    <input
                      type="number"
                      id="calorie-burn-height-feet"
                      className="calorie-burn-input-field"
                      value={formData.heightFeet}
                      onChange={(e) => handleInputChange('heightFeet', e.target.value)}
                      placeholder="e.g., 5"
                      min="1"
                      max="8"
                      step="1"
                    />
                  </div>
                  <div className="calorie-burn-input-group">
                    <label htmlFor="calorie-burn-height-inches" className="calorie-burn-input-label">
                      Height (inches):
                    </label>
                    <input
                      type="number"
                      id="calorie-burn-height-inches"
                      className="calorie-burn-input-field"
                      value={formData.heightInches}
                      onChange={(e) => handleInputChange('heightInches', e.target.value)}
                      placeholder="e.g., 9"
                      min="0"
                      max="11"
                      step="0.1"
                    />
                  </div>
                </>
              ) : (
                <div className="calorie-burn-input-group">
                  <label htmlFor="calorie-burn-height" className="calorie-burn-input-label">
                    Height ({formData.heightUnit}):
                  </label>
                  <input
                    type="number"
                    id="calorie-burn-height"
                    className="calorie-burn-input-field"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder={formData.heightUnit === 'cm' ? 'e.g., 175' : 'e.g., 69'}
                    min="1"
                    max={formData.heightUnit === 'cm' ? '250' : '100'}
                    step="0.1"
                  />
                </div>
              )}

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-fitness-level" className="calorie-burn-input-label">
                  Fitness Level:
                </label>
                <select
                  id="calorie-burn-fitness-level"
                  className="calorie-burn-select-field"
                  value={formData.fitnessLevel}
                  onChange={(e) => handleInputChange('fitnessLevel', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="athlete">Athlete</option>
                </select>
              </div>
            </div>

            <div className="calorie-burn-input-row">
              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-intensity" className="calorie-burn-input-label">
                  Intensity:
                </label>
                <select
                  id="calorie-burn-intensity"
                  className="calorie-burn-select-field"
                  value={formData.intensity}
                  onChange={(e) => handleInputChange('intensity', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-temperature" className="calorie-burn-input-label">
                  Temperature:
                </label>
                <input
                  type="number"
                  id="calorie-burn-temperature"
                  className="calorie-burn-input-field"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  placeholder="e.g., 20"
                  min="-50"
                  max="60"
                  step="0.1"
                />
              </div>

              <div className="calorie-burn-input-group">
                <label htmlFor="calorie-burn-temperature-unit" className="calorie-burn-input-label">
                  Temperature Unit:
                </label>
                <select
                  id="calorie-burn-temperature-unit"
                  className="calorie-burn-select-field"
                  value={formData.temperatureUnit}
                  onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                >
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>

            <div className="calorie-burn-calculator-actions">
              <button type="button" className="calorie-burn-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="calorie-burn-calculator-result">
              <h3 className="calorie-burn-result-title">Calorie Burn Results</h3>
              <div className="calorie-burn-result-content">
                <div className="calorie-burn-result-main">
                  <div className="calorie-burn-result-item">
                    <strong>Calories Burned:</strong>
                    <span className="calorie-burn-result-value calorie-burn-result-final">
                      {result.caloriesBurned} calories
                    </span>
                  </div>
                  <div className="calorie-burn-result-item">
                    <strong>MET Value:</strong>
                    <span className="calorie-burn-result-value">
                      {result.met}
                    </span>
                  </div>
                  <div className="calorie-burn-result-item">
                    <strong>Fat Burned:</strong>
                    <span className="calorie-burn-result-value">
                      {result.fatBurned} grams
                    </span>
                  </div>
                  <div className="calorie-burn-result-item">
                    <strong>Calories per Minute:</strong>
                    <span className="calorie-burn-result-value">
                      {result.caloriesPerMinute} cal/min
                    </span>
                  </div>
                  <div className="calorie-burn-result-item">
                    <strong>Time to Burn 500 cal:</strong>
                    <span className="calorie-burn-result-value">
                      {result.timeToBurn} minutes
                    </span>
                  </div>
                  <div className="calorie-burn-result-item">
                    <strong>Daily Goal:</strong>
                    <span className="calorie-burn-result-value">
                      {result.dailyGoalPercentage}% of recommended
                    </span>
                  </div>
                </div>

                {/* Food Equivalents */}
                {result.foodEquivalents.length > 0 && (
                  <div className="calorie-burn-food-equivalents">
                    <h4 className="calorie-burn-food-equivalents-title">Food Equivalents</h4>
                    <div className="calorie-burn-food-equivalents-list">
                      {result.foodEquivalents.map((equivalent, index) => (
                        <div key={index} className="calorie-burn-food-equivalent-item">
                          <span className="calorie-burn-food-quantity">{equivalent.quantity}</span>
                          <span className="calorie-burn-food-name">{equivalent.food}{equivalent.quantity > 1 ? 's' : ''}</span>
                          <span className="calorie-burn-food-calories">({equivalent.calories} cal)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="calorie-burn-explanation">
                  <h4 className="calorie-burn-explanation-title">Explanation</h4>
                  <p className="calorie-burn-explanation-text">{result.explanation}</p>
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
            The Calorie Burn Calculator is a comprehensive tool that helps you estimate the number of calories 
            burned during various physical activities. It uses scientifically validated MET (Metabolic Equivalent 
            of Task) values and applies personalized adjustments based on your individual characteristics.
          </p>
          <p>
            Our calculator considers factors such as your weight, age, fitness level, activity intensity, and 
            environmental conditions to provide accurate calorie burn estimates for over 15 different activities.
          </p>
        </ContentSection>

        <ContentSection id="what-is-calorie-burn" title="What is Calorie Burn?">
          <p>
            Calorie burn refers to the number of calories your body expends during physical activity. This 
            includes the energy used for muscle contractions, increased heart rate, breathing, and other 
            physiological processes that occur during exercise.
          </p>
          <ul>
            <li><strong>Basal Metabolic Rate (BMR):</strong> Calories burned at rest for basic body functions</li>
            <li><strong>Activity Calories:</strong> Additional calories burned during physical activity</li>
            <li><strong>Total Daily Energy Expenditure:</strong> BMR + activity calories + thermic effect of food</li>
          </ul>
          <p>
            Understanding your calorie burn helps with weight management, fitness planning, and achieving 
            your health goals.
          </p>
        </ContentSection>

        <ContentSection id="met-values" title="MET Values">
          <p>
            MET (Metabolic Equivalent of Task) values represent the energy cost of physical activities. 
            One MET is equivalent to the energy expended while sitting quietly at rest.
          </p>
          <div className="met-values-grid">
            <div className="met-category">
              <h4>Light Activities (2.0-3.9 METs)</h4>
              <ul>
                <li>Slow Walking: 2.5 METs</li>
                <li>Light Cycling: 4.0 METs</li>
                <li>Yoga: 2.5 METs</li>
                <li>Stretching: 2.3 METs</li>
              </ul>
            </div>
            <div className="met-category">
              <h4>Moderate Activities (4.0-6.9 METs)</h4>
              <ul>
                <li>Brisk Walking: 3.8 METs</li>
                <li>Moderate Cycling: 6.8 METs</li>
                <li>Dancing: 4.5 METs</li>
                <li>Hiking: 5.3 METs</li>
              </ul>
            </div>
            <div className="met-category">
              <h4>Vigorous Activities (7.0+ METs)</h4>
              <ul>
                <li>Running: 9.8 METs</li>
                <li>Vigorous Cycling: 10.0 METs</li>
                <li>HIIT: 8.0 METs</li>
                <li>Weightlifting: 6.0 METs</li>
              </ul>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Calculator">
          <p>Follow these steps to calculate your calorie burn:</p>
          
          <h3>Step 1: Enter Basic Information</h3>
          <ul className="usage-steps">
            <li><strong>Weight:</strong> Enter your current weight in kg or lbs</li>
            <li><strong>Activity:</strong> Select the activity you performed</li>
            <li><strong>Duration:</strong> Enter how long you exercised</li>
          </ul>

          <h3>Step 2: Add Advanced Options (Optional)</h3>
          <ul className="usage-steps">
            <li><strong>Age & Gender:</strong> For more accurate BMR calculations</li>
            <li><strong>Height:</strong> For personalized metabolic rate adjustments</li>
            <li><strong>Fitness Level:</strong> Affects calorie burn efficiency</li>
            <li><strong>Intensity:</strong> Low, moderate, or high intensity</li>
            <li><strong>Temperature:</strong> Environmental conditions affect calorie burn</li>
          </ul>

          <h3>Step 3: Calculate and Review Results</h3>
          <ul className="usage-steps">
            <li><strong>Calculate:</strong> Click "Calculate Calories Burned" to get your results</li>
            <li><strong>Review:</strong> Check calories burned, MET value, and food equivalents</li>
          </ul>
        </ContentSection>

        <ContentSection id="calculation-method" title="Calculation Method">
          <p>
            The calorie burn calculation uses the following formula:
          </p>
          <div className="math-formula">
            Calories Burned = MET × Weight (kg) × Duration (hours)
          </div>
          
          <div className="calculation-method-section">
            <h3>Personal Adjustments</h3>
            <ul>
              <li><strong>Fitness Level:</strong> Beginners burn 15% fewer calories, athletes burn 20% more</li>
              <li><strong>Age:</strong> Metabolism decreases 0.5% per year after age 40</li>
              <li><strong>BMR Adjustment:</strong> Individual metabolic rate based on height, weight, age, and gender</li>
              <li><strong>Intensity:</strong> Low intensity reduces MET by 15%, high intensity increases by 15%</li>
              <li><strong>Temperature:</strong> Extreme temperatures increase calorie burn</li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Basic Calculation</h3>
            <div className="example-solution">
              <p><strong>Weight:</strong> 70 kg</p>
              <p><strong>Activity:</strong> Running (9.8 METs)</p>
              <p><strong>Duration:</strong> 30 minutes</p>
              <p><strong>Calculation:</strong> 9.8 × 70 × 0.5 = 343 calories</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Advanced Calculation</h3>
            <div className="example-solution">
              <p><strong>Weight:</strong> 70 kg, Age: 35, Male, Height: 175 cm</p>
              <p><strong>Activity:</strong> Cycling (6.8 METs), Advanced fitness level</p>
              <p><strong>Duration:</strong> 45 minutes, High intensity</p>
              <p><strong>Adjusted MET:</strong> 6.8 × 1.1 (advanced) × 1.15 (high intensity) = 8.6</p>
              <p><strong>Calculation:</strong> 8.6 × 70 × 0.75 = 451 calories</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding calorie burn is important for:</p>
          <ul>
            <li>Weight management and fat loss goals</li>
            <li>Planning exercise routines and intensity</li>
            <li>Balancing calorie intake with expenditure</li>
            <li>Tracking fitness progress over time</li>
            <li>Setting realistic health and fitness goals</li>
            <li>Understanding the impact of different activities</li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Calorie Burn Calculator provides comprehensive functionality:</p>
          <ul>
            <li><strong>15+ Activities:</strong> From light walking to vigorous HIIT</li>
            <li><strong>Personalized Adjustments:</strong> Age, fitness level, and BMR considerations</li>
            <li><strong>Environmental Factors:</strong> Temperature adjustments</li>
            <li><strong>Food Equivalents:</strong> Visual representation of calories burned</li>
            <li><strong>Multiple Units:</strong> Support for metric and imperial measurements</li>
            <li><strong>Detailed Insights:</strong> Calories per minute, time to burn 500 cal</li>
            <li><strong>Educational Content:</strong> Comprehensive information about calorie burn</li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-dumbbell"></i> Fitness Planning</h4>
              <p>Plan workout routines and intensity</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-weight"></i> Weight Management</h4>
              <p>Balance calorie intake and expenditure</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Progress Tracking</h4>
              <p>Monitor fitness improvements over time</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-target"></i> Goal Setting</h4>
              <p>Set realistic health and fitness targets</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-heartbeat"></i> Health Monitoring</h4>
              <p>Track daily activity and energy expenditure</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-apple-alt"></i> Nutrition Planning</h4>
              <p>Plan meals based on activity levels</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "How accurate is this calorie burn calculator?",
              answer: "This calculator uses scientifically validated MET values and applies personalized adjustments for age, fitness level, and environmental factors. While it provides good estimates, individual variations in metabolism and exercise efficiency can affect actual calorie burn."
            },
            {
              question: "Why do I burn different calories for the same activity?",
              answer: "Calorie burn varies based on your weight, age, fitness level, exercise intensity, and environmental conditions. Heavier individuals burn more calories, while more fit individuals may burn calories more efficiently."
            },
            {
              question: "What is a MET value?",
              answer: "MET (Metabolic Equivalent of Task) is a unit that represents the energy cost of physical activities. One MET equals the energy expended while sitting quietly at rest. Higher MET values indicate more intense activities."
            },
            {
              question: "How does fitness level affect calorie burn?",
              answer: "Fitness level affects exercise efficiency. Beginners may burn fewer calories due to lower efficiency, while advanced athletes can burn more calories due to higher intensity and better form."
            },
            {
              question: "Should I eat back the calories I burn during exercise?",
              answer: "This depends on your goals. For weight loss, you may not need to eat back all calories burned. For maintenance or muscle gain, eating back some calories can help fuel recovery and performance."
            },
            {
              question: "How often should I recalculate my calorie burn?",
              answer: "Recalculate when your weight changes significantly (5+ lbs), when you improve your fitness level, or when you change your exercise routine. Regular updates ensure accuracy."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default CalorieBurnCalculator