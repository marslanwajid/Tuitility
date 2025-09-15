/**
 * Ideal Weight Calculator Logic
 * Handles all ideal weight-related calculations including multiple formulas,
 * BMI analysis, body frame adjustments, and age considerations.
 */

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

    this.bodyFrameAdjustments = {
      small: 0.9,
      medium: 1.0,
      large: 1.1
    };

    this.activityLevels = {
      sedentary: { label: 'Sedentary', multiplier: 1.0 },
      light: { label: 'Light Activity', multiplier: 1.0 },
      moderate: { label: 'Moderate Activity', multiplier: 1.0 },
      active: { label: 'Active', multiplier: 1.0 },
      very: { label: 'Very Active', multiplier: 1.0 }
    };
  }

  /**
   * Main calculation method for basic ideal weight
   * @param {Object} formData - Form input data
   * @returns {Object} Calculation results
   */
  calculateBasic(formData) {
    const height = this.getHeightInMeters(formData);
    const heightInInches = this.getHeightInInches(formData);
    const gender = formData.gender;

    // Calculate using different formulas
    const devine = this.calculateDevine(heightInInches, gender);
    const robinson = this.calculateRobinson(heightInInches, gender);
    const miller = this.calculateMiller(heightInInches, gender);
    const hamwi = this.calculateHamwi(heightInInches, gender);

    // Calculate average ideal weight
    const avgIdealWeight = (devine + robinson + miller + hamwi) / 4;

    // Calculate BMI range weights
    const bmiRange = this.calculateBMIRange(height);

    // Get recommendations
    const recommendations = this.getBasicRecommendations(avgIdealWeight, bmiRange);

    return {
      devine: Math.round(devine * 10) / 10,
      robinson: Math.round(robinson * 10) / 10,
      miller: Math.round(miller * 10) / 10,
      hamwi: Math.round(hamwi * 10) / 10,
      average: Math.round(avgIdealWeight * 10) / 10,
      bmiRange,
      recommendations,
      height: height * 100 // Return height in cm
    };
  }

  /**
   * Main calculation method for advanced ideal weight
   * @param {Object} formData - Form input data
   * @returns {Object} Calculation results
   */
  calculateAdvanced(formData) {
    const height = this.getHeightInMeters(formData);
    const heightInInches = this.getHeightInInches(formData);
    const gender = formData.gender;
    const age = parseInt(formData.age);
    const bodyType = formData.bodyType;
    const currentWeight = this.getCurrentWeightInKg(formData);

    // Calculate base ideal weights using different formulas
    let devine = this.calculateDevine(heightInInches, gender);
    let robinson = this.calculateRobinson(heightInInches, gender);
    let miller = this.calculateMiller(heightInInches, gender);
    let hamwi = this.calculateHamwi(heightInInches, gender);

    // Apply body frame adjustments
    const frameAdjustment = this.bodyFrameAdjustments[bodyType];
    devine *= frameAdjustment;
    robinson *= frameAdjustment;
    miller *= frameAdjustment;
    hamwi *= frameAdjustment;

    // Apply age adjustments (slight decrease after 50)
    if (age > 50) {
      const ageFactor = 1 - ((age - 50) * 0.003); // 0.3% reduction per year after 50
      devine *= ageFactor;
      robinson *= ageFactor;
      miller *= ageFactor;
      hamwi *= ageFactor;
    }

    // Calculate average ideal weight
    const avgIdealWeight = (devine + robinson + miller + hamwi) / 4;

    // Calculate BMI and category
    const bmi = currentWeight ? this.calculateBMI(currentWeight, height) : null;
    const bmiCategory = bmi ? this.getBMICategory(bmi) : null;

    // Calculate BMI range weights
    const bmiRange = this.calculateBMIRange(height);

    // Calculate weight comparison if current weight is provided
    const weightComparison = currentWeight ? this.calculateWeightComparison(currentWeight, avgIdealWeight) : null;

    // Get recommendations
    const recommendations = this.getAdvancedRecommendations(avgIdealWeight, bmiRange, bmi, weightComparison, age, bodyType);

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
      recommendations,
      height: height * 100 // Return height in cm
    };
  }

  /**
   * Calculate Devine formula
   * @param {number} heightInInches - Height in inches
   * @param {string} gender - Gender (male/female)
   * @returns {number} Ideal weight in kg
   */
  calculateDevine(heightInInches, gender) {
    if (gender === 'male') {
      return 50 + 2.3 * (heightInInches - 60);
    } else {
      return 45.5 + 2.3 * (heightInInches - 60);
    }
  }

  /**
   * Calculate Robinson formula
   * @param {number} heightInInches - Height in inches
   * @param {string} gender - Gender (male/female)
   * @returns {number} Ideal weight in kg
   */
  calculateRobinson(heightInInches, gender) {
    if (gender === 'male') {
      return 52 + 1.9 * (heightInInches - 60);
    } else {
      return 49 + 1.7 * (heightInInches - 60);
    }
  }

  /**
   * Calculate Miller formula
   * @param {number} heightInInches - Height in inches
   * @param {string} gender - Gender (male/female)
   * @returns {number} Ideal weight in kg
   */
  calculateMiller(heightInInches, gender) {
    if (gender === 'male') {
      return 56.2 + 1.41 * (heightInInches - 60);
    } else {
      return 53.1 + 1.36 * (heightInInches - 60);
    }
  }

  /**
   * Calculate Hamwi formula
   * @param {number} heightInInches - Height in inches
   * @param {string} gender - Gender (male/female)
   * @returns {number} Ideal weight in kg
   */
  calculateHamwi(heightInInches, gender) {
    if (gender === 'male') {
      return 48 + 2.7 * (heightInInches - 60);
    } else {
      return 45.5 + 2.2 * (heightInInches - 60);
    }
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
   * Get BMI category
   * @param {number} bmi - BMI value
   * @returns {Object} BMI category information
   */
  getBMICategory(bmi) {
    for (const [key, category] of Object.entries(this.bmiCategories)) {
      if (bmi >= category.min && bmi < category.max) {
        return {
          name: category.label,
          color: category.color,
          key
        };
      }
    }
    return {
      name: 'Out of Range',
      color: '#95a5a6',
      key: 'outOfRange'
    };
  }

  /**
   * Calculate BMI range weights
   * @param {number} height - Height in meters
   * @returns {Object} BMI range weights
   */
  calculateBMIRange(height) {
    const minWeight = 18.5 * (height * height);
    const maxWeight = 24.9 * (height * height);
    
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10
    };
  }

  /**
   * Calculate weight comparison
   * @param {number} currentWeight - Current weight in kg
   * @param {number} idealWeight - Ideal weight in kg
   * @returns {Object} Weight comparison data
   */
  calculateWeightComparison(currentWeight, idealWeight) {
    const difference = currentWeight - idealWeight;
    const percentage = (difference / idealWeight) * 100;
    
    let status;
    if (Math.abs(percentage) <= 5) {
      status = 'optimal';
    } else if (percentage > 5) {
      status = 'overweight';
    } else {
      status = 'underweight';
    }

    return {
      current: Math.round(currentWeight * 10) / 10,
      ideal: Math.round(idealWeight * 10) / 10,
      difference: Math.round(difference * 10) / 10,
      percentage: Math.round(percentage * 10) / 10,
      status
    };
  }

  /**
   * Get basic recommendations
   * @param {number} idealWeight - Ideal weight in kg
   * @param {Object} bmiRange - BMI range weights
   * @returns {Array} Array of recommendations
   */
  getBasicRecommendations(idealWeight, bmiRange) {
    const recommendations = [];
    
    recommendations.push(`Your ideal weight range is approximately ${idealWeight.toFixed(1)} kg`);
    recommendations.push(`Healthy BMI range: ${bmiRange.min} - ${bmiRange.max} kg`);
    recommendations.push('Remember that ideal weight is a guideline, not a strict rule');
    recommendations.push('Focus on overall health, not just weight');
    recommendations.push('Consider body composition and muscle mass');
    
    return recommendations;
  }

  /**
   * Get advanced recommendations
   * @param {number} idealWeight - Ideal weight in kg
   * @param {Object} bmiRange - BMI range weights
   * @param {number} bmi - Current BMI
   * @param {Object} weightComparison - Weight comparison data
   * @param {number} age - Age in years
   * @param {string} bodyType - Body frame type
   * @returns {Array} Array of recommendations
   */
  getAdvancedRecommendations(idealWeight, bmiRange, bmi, weightComparison, age, bodyType) {
    const recommendations = [];
    
    recommendations.push(`Your ideal weight range is approximately ${idealWeight.toFixed(1)} kg`);
    recommendations.push(`Healthy BMI range: ${bmiRange.min} - ${bmiRange.max} kg`);
    
    if (weightComparison) {
      switch (weightComparison.status) {
        case 'optimal':
          recommendations.push('Your current weight is within the optimal range!');
          recommendations.push('Maintain your current lifestyle and eating habits');
          break;
        case 'overweight':
          recommendations.push(`You are ${Math.abs(weightComparison.percentage).toFixed(1)}% above your ideal weight`);
          recommendations.push('Consider a moderate calorie deficit of 300-500 calories per day');
          recommendations.push('Focus on whole foods and regular exercise');
          break;
        case 'underweight':
          recommendations.push(`You are ${Math.abs(weightComparison.percentage).toFixed(1)}% below your ideal weight`);
          recommendations.push('Consider a moderate calorie surplus of 300-500 calories per day');
          recommendations.push('Focus on nutrient-dense foods and strength training');
          break;
      }
    }
    
    if (bmi) {
      const bmiCategory = this.getBMICategory(bmi);
      recommendations.push(`Your current BMI category: ${bmiCategory.name}`);
    }
    
    if (age > 50) {
      recommendations.push('For adults over 50, focus on maintaining muscle mass');
      recommendations.push('Consider resistance training to prevent muscle loss');
    }
    
    if (bodyType === 'small') {
      recommendations.push('With a small frame, you may naturally weigh less');
      recommendations.push('Focus on building lean muscle mass');
    } else if (bodyType === 'large') {
      recommendations.push('With a large frame, you may naturally weigh more');
      recommendations.push('Focus on maintaining a healthy body composition');
    }
    
    recommendations.push('Consult with a healthcare provider for personalized advice');
    recommendations.push('Remember that health is more important than a specific number on the scale');
    
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
   * Convert height to inches
   * @param {Object} formData - Form data
   * @returns {number} Height in inches
   */
  getHeightInInches(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height) / 2.54;
    } else {
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 12) + inches;
    }
  }

  /**
   * Convert current weight to kg
   * @param {Object} formData - Form data
   * @returns {number} Weight in kg
   */
  getCurrentWeightInKg(formData) {
    if (!formData.currentWeight) return null;
    const weight = parseFloat(formData.currentWeight);
    return formData.weightUnit === 'lb' ? weight * 0.453592 : weight;
  }

  /**
   * Get calculation steps for display
   * @param {Object} formData - Form data
   * @param {string} mode - Calculation mode (basic/advanced)
   * @returns {Array} Array of calculation steps
   */
  getCalculationSteps(formData, mode) {
    const steps = [];
    const height = this.getHeightInMeters(formData);
    const heightInInches = this.getHeightInInches(formData);
    const gender = formData.gender;
    
    steps.push({
      step: 1,
      title: 'Convert Height',
      description: 'Convert height to inches for formula calculations',
      formula: `Height: ${(height * 100).toFixed(0)} cm = ${heightInInches.toFixed(1)} inches`
    });
    
    steps.push({
      step: 2,
      title: 'Apply Devine Formula',
      description: 'Calculate ideal weight using Devine formula',
      formula: gender === 'male' 
        ? `Ideal Weight = 50 + 2.3 × (${heightInInches.toFixed(1)} - 60)`
        : `Ideal Weight = 45.5 + 2.3 × (${heightInInches.toFixed(1)} - 60)`
    });
    
    steps.push({
      step: 3,
      title: 'Apply Robinson Formula',
      description: 'Calculate ideal weight using Robinson formula',
      formula: gender === 'male'
        ? `Ideal Weight = 52 + 1.9 × (${heightInInches.toFixed(1)} - 60)`
        : `Ideal Weight = 49 + 1.7 × (${heightInInches.toFixed(1)} - 60)`
    });
    
    if (mode === 'advanced') {
      const bodyType = formData.bodyType;
      const age = parseInt(formData.age);
      
      steps.push({
        step: 4,
        title: 'Apply Body Frame Adjustment',
        description: 'Adjust for body frame size',
        formula: `Frame Adjustment: ${this.bodyFrameAdjustments[bodyType]}x`
      });
      
      if (age > 50) {
        const ageFactor = 1 - ((age - 50) * 0.003);
        steps.push({
          step: 5,
          title: 'Apply Age Adjustment',
          description: 'Adjust for age (slight decrease after 50)',
          formula: `Age Factor: ${ageFactor.toFixed(3)}x`
        });
      }
    }
    
    return steps;
  }
}

export default IdealWeightCalculatorLogic;
