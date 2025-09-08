/**
 * BMI Calculator Logic
 * Handles all BMI-related calculations including basic BMI, advanced body composition analysis,
 * health risk assessment, and metabolic calculations.
 */

class BMICalculatorLogic {
  constructor() {
    this.activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };
  }

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @param {boolean} isAdvanced - Whether to perform advanced calculations
   * @returns {Object} Calculation results
   */
  calculate(formData, isAdvanced = false) {
    const height = this.getHeightInMeters(formData);
    const weight = this.getWeightInKg(formData);
    
    // Basic BMI calculation
    const bmi = this.calculateBMI(weight, height);
    const category = this.getWeightCategory(bmi);
    const healthyRange = this.calculateHealthyWeightRange(height);
    
    const result = {
      bmi,
      category,
      healthyRange,
      interpretation: this.getBMIInterpretation(bmi),
      advanced: isAdvanced
    };

    if (isAdvanced) {
      // Advanced calculations
      const age = parseInt(formData.age);
      const gender = formData.gender;
      const activityLevel = formData.activityLevel;
      const bodyFat = parseFloat(formData.bodyFat) || null;
      
      // Body measurements
      const waist = this.getWaistMeasurement(formData);
      const hip = this.getHipMeasurement(formData);
      const neck = this.getNeckMeasurement(formData);
      
      // Advanced metrics
      const whr = this.calculateWHR(waist, hip);
      const bodyType = this.getBodyType(whr, gender);
      const visceralFatRisk = this.calculateVisceralFatRisk(waist, gender);
      const healthRisk = this.getHealthRisk(bmi, whr, bodyFat, gender);
      const bmr = this.calculateBMR(weight, height, age, gender);
      const dailyCalories = this.calculateDailyCalories(bmr, activityLevel);
      const leanMass = bodyFat ? this.calculateLeanMass(weight, bodyFat) : null;
      
      // Add advanced results
      result.bodyFat = bodyFat;
      result.leanMass = leanMass;
      result.whr = whr;
      result.healthRisk = healthRisk;
      result.visceralFatRisk = visceralFatRisk;
      result.bodyType = bodyType;
      result.bmr = bmr;
      result.dailyCalories = dailyCalories;
      result.recommendations = this.getRecommendations(bmi, whr, bodyFat, healthRisk, gender);
    }

    return result;
  }

  /**
   * Calculate BMI
   * @param {number} weight - Weight in kg
   * @param {number} height - Height in meters
   * @returns {number} BMI value
   */
  calculateBMI(weight, height) {
    return weight / (height * height);
  }

  /**
   * Get weight category based on BMI
   * @param {number} bmi - BMI value
   * @returns {string} Weight category
   */
  getWeightCategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Calculate healthy weight range
   * @param {number} height - Height in meters
   * @returns {Object} Min and max healthy weights
   */
  calculateHealthyWeightRange(height) {
    return {
      min: 18.5 * (height * height),
      max: 24.9 * (height * height)
    };
  }

  /**
   * Get BMI interpretation
   * @param {number} bmi - BMI value
   * @returns {string} BMI interpretation
   */
  getBMIInterpretation(bmi) {
    if (bmi < 18.5) {
      return 'Your BMI indicates you are underweight. Consider consulting with a healthcare provider to ensure you\'re getting adequate nutrition.';
    } else if (bmi < 25) {
      return 'Your BMI is in the healthy range. Maintain your current lifestyle with balanced nutrition and regular exercise.';
    } else if (bmi < 30) {
      return 'Your BMI indicates you are overweight. Consider lifestyle changes including diet and exercise to reach a healthier weight.';
    } else {
      return 'Your BMI indicates obesity. It\'s recommended to consult with a healthcare provider for a comprehensive weight management plan.';
    }
  }

  /**
   * Calculate Waist-to-Hip Ratio
   * @param {number} waist - Waist circumference in cm
   * @param {number} hip - Hip circumference in cm
   * @returns {number} WHR value
   */
  calculateWHR(waist, hip) {
    return waist / hip;
  }

  /**
   * Determine body type based on WHR
   * @param {number} whr - Waist-to-hip ratio
   * @param {string} gender - Gender (male/female)
   * @returns {string} Body type
   */
  getBodyType(whr, gender) {
    if (gender === 'male') {
      if (whr < 0.9) return 'Pear';
      if (whr < 0.95) return 'Normal';
      return 'Apple';
    } else {
      if (whr < 0.8) return 'Pear';
      if (whr < 0.85) return 'Normal';
      return 'Apple';
    }
  }

  /**
   * Calculate visceral fat risk
   * @param {number} waist - Waist circumference in cm
   * @param {string} gender - Gender (male/female)
   * @returns {string} Risk level
   */
  calculateVisceralFatRisk(waist, gender) {
    if (gender === 'male') {
      if (waist < 94) return 'Low';
      if (waist < 102) return 'Moderate';
      return 'High';
    } else {
      if (waist < 80) return 'Low';
      if (waist < 88) return 'Moderate';
      return 'High';
    }
  }

  /**
   * Calculate overall health risk
   * @param {number} bmi - BMI value
   * @param {number} whr - Waist-to-hip ratio
   * @param {number} bodyFat - Body fat percentage
   * @param {string} gender - Gender (male/female)
   * @returns {string} Health risk level
   */
  getHealthRisk(bmi, whr, bodyFat, gender) {
    let riskScore = 0;
    
    // BMI risk
    if (bmi < 18.5 || bmi >= 30) riskScore += 2;
    else if (bmi >= 25) riskScore += 1;
    
    // WHR risk
    if (gender === 'male') {
      if (whr >= 0.95) riskScore += 2;
      else if (whr >= 0.9) riskScore += 1;
    } else {
      if (whr >= 0.85) riskScore += 2;
      else if (whr >= 0.8) riskScore += 1;
    }
    
    // Body fat risk (if provided)
    if (bodyFat) {
      if (gender === 'male') {
        if (bodyFat > 25) riskScore += 2;
        else if (bodyFat > 20) riskScore += 1;
      } else {
        if (bodyFat > 32) riskScore += 2;
        else if (bodyFat > 27) riskScore += 1;
      }
    }
    
    return riskScore <= 1 ? 'Low' : riskScore <= 3 ? 'Moderate' : 'High';
  }

  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
   * @param {number} weight - Weight in kg
   * @param {number} height - Height in meters
   * @param {number} age - Age in years
   * @param {string} gender - Gender (male/female)
   * @returns {number} BMR in calories per day
   */
  calculateBMR(weight, height, age, gender) {
    const heightCm = height * 100;
    if (gender === 'male') {
      return 10 * weight + 6.25 * heightCm - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * heightCm - 5 * age - 161;
    }
  }

  /**
   * Calculate daily calorie needs
   * @param {number} bmr - Basal Metabolic Rate
   * @param {string} activityLevel - Activity level
   * @returns {number} Daily calorie needs
   */
  calculateDailyCalories(bmr, activityLevel) {
    return bmr * this.activityMultipliers[activityLevel];
  }

  /**
   * Calculate lean mass
   * @param {number} weight - Total weight in kg
   * @param {number} bodyFat - Body fat percentage
   * @returns {number} Lean mass in kg
   */
  calculateLeanMass(weight, bodyFat) {
    return weight * (1 - bodyFat / 100);
  }

  /**
   * Get personalized recommendations
   * @param {number} bmi - BMI value
   * @param {number} whr - Waist-to-hip ratio
   * @param {number} bodyFat - Body fat percentage
   * @param {string} healthRisk - Health risk level
   * @param {string} gender - Gender (male/female)
   * @returns {Array} Array of recommendations
   */
  getRecommendations(bmi, whr, bodyFat, healthRisk, gender) {
    const recommendations = [];
    
    // BMI-based recommendations
    if (bmi < 18.5) {
      recommendations.push('Consider increasing caloric intake with nutrient-dense foods');
      recommendations.push('Focus on strength training to build muscle mass');
      recommendations.push('Consult with a healthcare provider or nutritionist');
    } else if (bmi >= 25) {
      recommendations.push('Create a calorie deficit through diet and exercise');
      recommendations.push('Focus on cardiovascular exercise for weight loss');
      recommendations.push('Consider portion control and mindful eating');
    }
    
    // WHR-based recommendations
    const whrThreshold = gender === 'male' ? 0.9 : 0.8;
    if (whr > whrThreshold) {
      recommendations.push('Focus on reducing abdominal fat through targeted exercises');
      recommendations.push('Limit processed foods and added sugars');
      recommendations.push('Increase fiber intake to help with satiety');
    }
    
    // Health risk recommendations
    if (healthRisk === 'High') {
      recommendations.push('Consult with a healthcare provider for comprehensive health assessment');
      recommendations.push('Consider working with a certified fitness professional');
      recommendations.push('Focus on sustainable lifestyle changes rather than quick fixes');
    }
    
    // General recommendations
    recommendations.push('Aim for at least 150 minutes of moderate exercise per week');
    recommendations.push('Include strength training 2-3 times per week');
    recommendations.push('Stay hydrated and get adequate sleep (7-9 hours)');
    
    return recommendations;
  }

  /**
   * Convert height to meters
   * @param {Object} formData - Form data
   * @returns {number} Height in meters
   */
  getHeightInMeters(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height) / 100;
    } else {
      // For feet and inches
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 30.48 + inches * 2.54) / 100;
    }
  }

  /**
   * Convert weight to kilograms
   * @param {Object} formData - Form data
   * @returns {number} Weight in kg
   */
  getWeightInKg(formData) {
    const weight = parseFloat(formData.weight);
    return formData.weightUnit === 'lb' ? weight * 0.453592 : weight;
  }

  /**
   * Get waist measurement in cm
   * @param {Object} formData - Form data
   * @returns {number} Waist measurement in cm
   */
  getWaistMeasurement(formData) {
    const waist = parseFloat(formData.waist);
    return formData.waistUnit === 'in' ? waist * 2.54 : waist;
  }

  /**
   * Get hip measurement in cm
   * @param {Object} formData - Form data
   * @returns {number} Hip measurement in cm
   */
  getHipMeasurement(formData) {
    const hip = parseFloat(formData.hip);
    return formData.hipUnit === 'in' ? hip * 2.54 : hip;
  }

  /**
   * Get neck measurement in cm
   * @param {Object} formData - Form data
   * @returns {number} Neck measurement in cm
   */
  getNeckMeasurement(formData) {
    const neck = parseFloat(formData.neck);
    return formData.neckUnit === 'in' ? neck * 2.54 : neck;
  }

  /**
   * Get calculation steps for display
   * @param {Object} formData - Form data
   * @param {boolean} isAdvanced - Whether advanced calculation
   * @returns {Array} Array of calculation steps
   */
  getCalculationSteps(formData, isAdvanced = false) {
    const steps = [];
    const height = this.getHeightInMeters(formData);
    const weight = this.getWeightInKg(formData);
    const bmi = this.calculateBMI(weight, height);
    
    steps.push({
      step: 1,
      title: 'Convert Measurements',
      description: 'Convert all measurements to metric units',
      formula: `Height: ${height.toFixed(2)} m, Weight: ${weight.toFixed(1)} kg`
    });
    
    steps.push({
      step: 2,
      title: 'Calculate BMI',
      description: 'Apply the BMI formula',
      formula: `{'\\text{BMI} = \\frac{\\text{Weight (kg)}}{\\text{Height (m)}^2} = \\frac{${weight.toFixed(1)}}{${height.toFixed(2)}^2} = ${bmi.toFixed(1)}'}`
    });
    
    if (isAdvanced) {
      const age = parseInt(formData.age);
      const gender = formData.gender;
      const bmr = this.calculateBMR(weight, height, age, gender);
      
      steps.push({
        step: 3,
        title: 'Calculate BMR',
        description: 'Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation',
        formula: `{'\\text{BMR} = 10 \\times ${weight.toFixed(1)} + 6.25 \\times ${(height * 100).toFixed(0)} - 5 \\times ${age} + ${gender === 'male' ? '5' : '-161'} = ${Math.round(bmr)} \\text{ calories/day}'}`
      });
      
      const dailyCalories = this.calculateDailyCalories(bmr, formData.activityLevel);
      steps.push({
        step: 4,
        title: 'Calculate Daily Calorie Needs',
        description: 'Multiply BMR by activity level multiplier',
        formula: `{'\\text{Daily Calories} = ${Math.round(bmr)} \\times ${this.activityMultipliers[formData.activityLevel]} = ${Math.round(dailyCalories)} \\text{ calories/day}'}`
      });
    }
    
    return steps;
  }
}

export default BMICalculatorLogic;
