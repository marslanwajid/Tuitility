/**
 * Body Fat Calculator Logic
 * Handles all body fat-related calculations including Navy Method, BMI-based estimation,
 * body composition analysis, and health risk assessment.
 */

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

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @param {string} method - Calculation method ('navy', 'bmi', 'both')
   * @returns {Object} Calculation results
   */
  calculate(formData, method = 'navy') {
    const height = this.getHeightInMeters(formData);
    const weight = this.getWeightInKg(formData);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    
    // Calculate BMI
    const bmi = this.calculateBMI(weight, height);
    
    let navyBfPercent = 0;
    let bmiBfPercent = 0;
    
    // Calculate Navy Method if selected
    if (method === 'navy' || method === 'both') {
      navyBfPercent = this.calculateNavyMethod(formData, height, weight, gender);
    }
    
    // Calculate BMI Method if selected
    if (method === 'bmi' || method === 'both') {
      bmiBfPercent = this.calculateBMIMethod(bmi, age, gender);
    }
    
    // Ensure values are within reasonable ranges
    navyBfPercent = Math.max(2, Math.min(navyBfPercent, 60));
    bmiBfPercent = Math.max(2, Math.min(bmiBfPercent, 60));
    
    // Calculate fat mass and lean mass based on the primary method
    let selectedBfPercent;
    if (method === 'navy' || method === 'both') {
      selectedBfPercent = navyBfPercent;
    } else {
      selectedBfPercent = bmiBfPercent;
    }
    
    const fatMass = (selectedBfPercent / 100) * weight;
    const leanMass = weight - fatMass;
    
    // Get body fat category
    const category = this.getBodyFatCategory(selectedBfPercent, gender);
    
    // Calculate health risk
    const healthRisk = this.calculateHealthRisk(selectedBfPercent, gender, age);
    
    // Get recommendations
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
      height: height * 100 // Return height in cm
    };
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
   * Calculate Navy Method body fat percentage
   * @param {Object} formData - Form data
   * @param {number} height - Height in meters
   * @param {number} weight - Weight in kg
   * @param {string} gender - Gender (male/female)
   * @returns {number} Body fat percentage
   */
  calculateNavyMethod(formData, height, weight, gender) {
    const heightCm = height * 100;
    
    // Get measurements in cm
    let neckMeasurement = this.getNeckMeasurement(formData);
    let waistMeasurement = this.getWaistMeasurement(formData);
    let hipMeasurement = this.getHipMeasurement(formData);
    
    if (gender === 'male') {
      // Navy Method formula for males
      return 495 / (1.0324 - 0.19077 * Math.log10(waistMeasurement - neckMeasurement) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      // Navy Method formula for females
      return 495 / (1.29579 - 0.35004 * Math.log10(waistMeasurement + hipMeasurement - neckMeasurement) + 0.22100 * Math.log10(heightCm)) - 450;
    }
  }

  /**
   * Calculate BMI-based body fat percentage
   * @param {number} bmi - BMI value
   * @param {number} age - Age in years
   * @param {string} gender - Gender (male/female)
   * @returns {number} Body fat percentage
   */
  calculateBMIMethod(bmi, age, gender) {
    if (gender === 'male') {
      return (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      return (1.20 * bmi) + (0.23 * age) - 5.4;
    }
  }

  /**
   * Get body fat category
   * @param {number} bfPercent - Body fat percentage
   * @param {string} gender - Gender (male/female)
   * @returns {Object} Category information
   */
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
    
    // Fallback for values outside normal ranges
    return {
      name: 'Out of Range',
      color: '#95a5a6',
      range: 'N/A',
      key: 'outOfRange'
    };
  }

  /**
   * Calculate health risk based on body fat percentage
   * @param {number} bfPercent - Body fat percentage
   * @param {string} gender - Gender (male/female)
   * @param {number} age - Age in years
   * @returns {string} Health risk level
   */
  calculateHealthRisk(bfPercent, gender, age) {
    let riskScore = 0;
    
    // Age factor
    if (age > 50) riskScore += 1;
    if (age > 65) riskScore += 1;
    
    // Body fat risk
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

  /**
   * Get personalized recommendations
   * @param {number} bfPercent - Body fat percentage
   * @param {string} gender - Gender (male/female)
   * @param {Object} category - Body fat category
   * @param {string} healthRisk - Health risk level
   * @returns {Array} Array of recommendations
   */
  getRecommendations(bfPercent, gender, category, healthRisk) {
    const recommendations = [];
    
    // Category-based recommendations
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
    
    // Health risk recommendations
    if (healthRisk === 'High') {
      recommendations.push('High health risk detected. Please consult with a healthcare provider.');
      recommendations.push('Consider working with certified fitness and nutrition professionals.');
    }
    
    // General recommendations
    recommendations.push('Aim for 150-300 minutes of moderate exercise per week');
    recommendations.push('Include strength training 2-3 times per week');
    recommendations.push('Focus on whole foods and adequate protein intake');
    recommendations.push('Get 7-9 hours of quality sleep per night');
    
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
   * Get neck measurement in cm
   * @param {Object} formData - Form data
   * @returns {number} Neck measurement in cm
   */
  getNeckMeasurement(formData) {
    const neck = parseFloat(formData.neck);
    return formData.measurementUnit === 'in' ? neck * 2.54 : neck;
  }

  /**
   * Get waist measurement in cm
   * @param {Object} formData - Form data
   * @returns {number} Waist measurement in cm
   */
  getWaistMeasurement(formData) {
    const waist = parseFloat(formData.waist);
    return formData.measurementUnit === 'in' ? waist * 2.54 : waist;
  }

  /**
   * Get hip measurement in cm
   * @param {Object} formData - Form data
   * @returns {number} Hip measurement in cm
   */
  getHipMeasurement(formData) {
    const hip = parseFloat(formData.hip);
    return formData.measurementUnit === 'in' ? hip * 2.54 : hip;
  }

  /**
   * Get calculation steps for display
   * @param {Object} formData - Form data
   * @param {string} method - Calculation method
   * @returns {Array} Array of calculation steps
   */
  getCalculationSteps(formData, method) {
    const steps = [];
    const height = this.getHeightInMeters(formData);
    const weight = this.getWeightInKg(formData);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    
    steps.push({
      step: 1,
      title: 'Convert Measurements',
      description: 'Convert all measurements to metric units',
      formula: `Height: ${(height * 100).toFixed(0)} cm, Weight: ${weight.toFixed(1)} kg`
    });
    
    if (method === 'navy' || method === 'both') {
      const neck = this.getNeckMeasurement(formData);
      const waist = this.getWaistMeasurement(formData);
      const hip = this.getHipMeasurement(formData);
      
      steps.push({
        step: 2,
        title: 'Navy Method Calculation',
        description: 'Apply Navy Method formula for body fat estimation',
        formula: gender === 'male' 
          ? `BF% = 495 / (1.0324 - 0.19077 × log(waist - neck) + 0.15456 × log(height)) - 450`
          : `BF% = 495 / (1.29579 - 0.35004 × log(waist + hip - neck) + 0.22100 × log(height)) - 450`
      });
    }
    
    if (method === 'bmi' || method === 'both') {
      const bmi = this.calculateBMI(weight, height);
      
      steps.push({
        step: method === 'navy' ? 3 : 2,
        title: 'BMI Method Calculation',
        description: 'Apply BMI-based body fat estimation',
        formula: gender === 'male'
          ? `BF% = (1.20 × BMI) + (0.23 × Age) - 16.2`
          : `BF% = (1.20 × BMI) + (0.23 × Age) - 5.4`
      });
    }
    
    return steps;
  }
}

export default BodyFatCalculatorLogic;
