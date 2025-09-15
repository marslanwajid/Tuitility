/**
 * Weight Loss Calculator Logic
 * Handles all weight loss calculations and validations
 */

class WeightLossCalculator {
  constructor() {
    this.defaultValues = {
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
    };
  }

  /**
   * Validate user inputs
   */
  validateInputs(formData) {
    const { age, heightCm, heightFt, heightIn, heightUnit, currentWeight, targetWeight } = formData;
    
    if (!age || parseInt(age) < 15 || parseInt(age) > 80) {
      return {
        isValid: false,
        error: 'Please enter a valid age between 15 and 80 years.'
      };
    }

    if (heightUnit === 'cm') {
      if (!heightCm || parseFloat(heightCm) < 130 || parseFloat(heightCm) > 230) {
        return {
          isValid: false,
          error: 'Please enter a valid height between 130-230 cm.'
        };
      }
    } else {
      if (!heightFt || parseFloat(heightFt) <= 0 || !heightIn || parseFloat(heightIn) < 0) {
        return {
          isValid: false,
          error: 'Please enter a valid height in feet and inches.'
        };
      }
    }

    if (!currentWeight || parseFloat(currentWeight) < 40 || parseFloat(currentWeight) > 200) {
      return {
        isValid: false,
        error: 'Please enter a valid current weight between 40-200 kg.'
      };
    }

    if (!targetWeight || parseFloat(targetWeight) < 40 || parseFloat(targetWeight) > 200) {
      return {
        isValid: false,
        error: 'Please enter a valid target weight between 40-200 kg.'
      };
    }

    if (parseFloat(targetWeight) >= parseFloat(currentWeight)) {
      return {
        isValid: false,
        error: 'Target weight must be less than current weight for weight loss.'
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   */
  calculateBMR(gender, age, heightCm, weightKg) {
    if (gender === 'male') {
      return 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) + 5;
    } else {
      return 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) - 161;
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  calculateTDEE(bmr, activityLevel) {
    return bmr * parseFloat(activityLevel);
  }

  /**
   * Calculate calorie deficit for weight loss
   */
  calculateCalorieDeficit(lossRate) {
    // 1 kg of weight loss requires approximately 7700 calories
    return parseFloat(lossRate) * 7700 / 7; // Daily deficit
  }

  /**
   * Calculate weight loss calories
   */
  calculateWeightLossCalories(tdee, calorieDeficit) {
    return Math.round(tdee - calorieDeficit);
  }

  /**
   * Calculate estimated time to reach target weight
   */
  calculateEstimatedTime(currentWeight, targetWeight, lossRate) {
    const weightToLose = currentWeight - targetWeight;
    return weightToLose / parseFloat(lossRate);
  }

  /**
   * Calculate macronutrient distribution
   */
  calculateMacronutrients(currentWeight, totalCalories) {
    // Protein: 2g per kg of body weight
    const proteinGrams = Math.round(2 * currentWeight);
    const proteinCalories = proteinGrams * 4;
    
    // Fat: 25% of total calories
    const fatCalories = Math.round(totalCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);
    
    // Carbohydrates: remaining calories
    const carbsCalories = totalCalories - proteinCalories - fatCalories;
    const carbsGrams = Math.round(carbsCalories / 4);
    
    return {
      protein: {
        grams: proteinGrams,
        calories: proteinCalories
      },
      carbs: {
        grams: carbsGrams,
        calories: carbsCalories
      },
      fat: {
        grams: fatGrams,
        calories: fatCalories
      }
    };
  }

  /**
   * Convert height to cm
   */
  convertHeightToCm(height, unit, inches = 0) {
    if (unit === 'cm') {
      return height;
    }
    return (height * 30.48) + (inches * 2.54);
  }

  /**
   * Convert weight to kg
   */
  convertWeightToKg(weight, unit) {
    return unit === 'kg' ? weight : weight * 0.453592;
  }

  /**
   * Get activity level description
   */
  getActivityLevelDescription(level) {
    const descriptions = {
      '1.2': 'Sedentary (little/no exercise)',
      '1.375': 'Light (light exercise 1-3 days/week)',
      '1.55': 'Moderate (moderate exercise 3-5 days/week)',
      '1.725': 'Very Active (hard exercise 6-7 days/week)',
      '1.9': 'Extra Active (very hard exercise, physical job)'
    };
    return descriptions[level] || 'Unknown activity level';
  }

  /**
   * Get weight loss rate description
   */
  getWeightLossRateDescription(rate) {
    const descriptions = {
      '0.25': '0.25 kg/week (0.5 lb/week) - Conservative',
      '0.5': '0.5 kg/week (1 lb/week) - Moderate',
      '0.75': '0.75 kg/week (1.5 lb/week) - Aggressive',
      '1.0': '1.0 kg/week (2 lb/week) - Very Aggressive'
    };
    return descriptions[rate] || 'Unknown loss rate';
  }

  /**
   * Calculate weight loss timeline
   */
  calculateWeightLossTimeline(currentWeight, targetWeight, lossRate, weeks = 52) {
    const weightToLose = currentWeight - targetWeight;
    const totalWeeksNeeded = Math.ceil(weightToLose / parseFloat(lossRate));
    const timeline = [];
    
    for (let week = 0; week <= Math.min(totalWeeksNeeded, weeks); week++) {
      const weightAtWeek = currentWeight - (parseFloat(lossRate) * week);
      timeline.push({
        week: week,
        weight: Math.round(weightAtWeek * 10) / 10,
        weightLost: Math.round((currentWeight - weightAtWeek) * 10) / 10
      });
    }
    
    return timeline;
  }

  /**
   * Generate weight loss recommendations
   */
  generateRecommendations(weightToLose, estimatedWeeks, lossRate) {
    const recommendations = [];
    
    if (parseFloat(lossRate) > 0.75) {
      recommendations.push('Consider a more moderate weight loss rate to preserve muscle mass');
    }
    
    if (estimatedWeeks > 52) {
      recommendations.push('This is a long-term goal - focus on sustainable lifestyle changes');
    }
    
    if (weightToLose > 20) {
      recommendations.push('For significant weight loss, consider consulting a healthcare professional');
    }
    
    recommendations.push('Include strength training to preserve muscle mass during weight loss');
    recommendations.push('Focus on whole, nutrient-dense foods to meet your calorie targets');
    recommendations.push('Stay hydrated and get adequate sleep for optimal results');
    
    return recommendations;
  }

  /**
   * Calculate BMI
   */
  calculateBMI(weight, height) {
    return weight / Math.pow(height / 100, 2);
  }

  /**
   * Get BMI category
   */
  getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Calculate ideal weight range
   */
  calculateIdealWeightRange(height, gender) {
    // Using BMI range of 18.5-24.9
    const heightM = height / 100;
    const minWeight = 18.5 * Math.pow(heightM, 2);
    const maxWeight = 24.9 * Math.pow(heightM, 2);
    
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10
    };
  }

  /**
   * Format results for display
   */
  formatResults(results) {
    return {
      ...results,
      maintenanceCalories: Math.round(results.maintenanceCalories),
      lossCalories: Math.round(results.lossCalories),
      calorieDeficit: Math.round(results.calorieDeficit),
      estimatedWeeks: Math.round(results.estimatedWeeks * 10) / 10,
      weightToLose: Math.round(results.weightToLose * 10) / 10
    };
  }

  /**
   * Main calculation function
   */
  calculateWeightLoss(formData) {
    const validation = this.validateInputs(formData);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    const { 
      gender, age, heightUnit, heightCm, heightFt, heightIn, 
      weightUnit, currentWeight, targetWeight, activityLevel, lossRate 
    } = formData;
    
    // Convert height to cm
    const heightCmValue = this.convertHeightToCm(
      parseFloat(heightCm || heightFt), 
      heightUnit, 
      parseFloat(heightIn || 0)
    );
    
    // Convert weights to kg
    const currentWeightKg = this.convertWeightToKg(parseFloat(currentWeight), weightUnit);
    const targetWeightKg = this.convertWeightToKg(parseFloat(targetWeight), weightUnit);
    
    // Calculate BMR
    const bmr = this.calculateBMR(gender, age, heightCmValue, currentWeightKg);
    
    // Calculate TDEE
    const tdee = this.calculateTDEE(bmr, activityLevel);
    
    // Calculate calorie deficit
    const calorieDeficit = this.calculateCalorieDeficit(lossRate);
    
    // Calculate weight loss calories
    const lossCalories = this.calculateWeightLossCalories(tdee, calorieDeficit);
    
    // Calculate estimated time
    const estimatedWeeks = this.calculateEstimatedTime(currentWeightKg, targetWeightKg, lossRate);
    
    // Calculate macronutrients
    const macros = this.calculateMacronutrients(currentWeightKg, lossCalories);
    
    // Calculate additional metrics
    const weightToLose = currentWeightKg - targetWeightKg;
    const currentBMI = this.calculateBMI(currentWeightKg, heightCmValue);
    const targetBMI = this.calculateBMI(targetWeightKg, heightCmValue);
    const idealWeightRange = this.calculateIdealWeightRange(heightCmValue, gender);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(weightToLose, estimatedWeeks, lossRate);
    
    // Generate timeline
    const timeline = this.calculateWeightLossTimeline(currentWeightKg, targetWeightKg, lossRate);
    
    return this.formatResults({
      maintenanceCalories: tdee,
      lossCalories: lossCalories,
      calorieDeficit: calorieDeficit,
      estimatedWeeks: estimatedWeeks,
      weightToLose: weightToLose,
      weightUnit: weightUnit,
      proteinGrams: macros.protein.grams,
      proteinCalories: macros.protein.calories,
      carbsGrams: macros.carbs.grams,
      carbsCalories: macros.carbs.calories,
      fatGrams: macros.fat.grams,
      fatCalories: macros.fat.calories,
      currentBMI: Math.round(currentBMI * 10) / 10,
      targetBMI: Math.round(targetBMI * 10) / 10,
      idealWeightRange: idealWeightRange,
      recommendations: recommendations,
      timeline: timeline
    });
  }
}

// Export for use in React component
export default WeightLossCalculator;
