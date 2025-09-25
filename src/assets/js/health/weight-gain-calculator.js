/**
 * Weight Gain Calculator Logic
 * Handles all weight gain calculations and validations
 */

class WeightGainCalculator {
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
      gainRate: '0.5',
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

    if (parseFloat(targetWeight) <= parseFloat(currentWeight)) {
      return {
        isValid: false,
        error: 'Target weight must be greater than current weight for weight gain.'
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
   * Calculate calorie surplus for weight gain
   */
  calculateCalorieSurplus(gainRate) {
    // 1 kg of weight gain requires approximately 7700 calories
    return parseFloat(gainRate) * 7700 / 7; // Daily surplus
  }

  /**
   * Calculate weight gain calories
   */
  calculateWeightGainCalories(tdee, calorieSurplus) {
    return Math.round(tdee + calorieSurplus);
  }

  /**
   * Calculate estimated time to reach target weight
   */
  calculateEstimatedTime(currentWeight, targetWeight, gainRate) {
    const weightToGain = targetWeight - currentWeight;
    return weightToGain / parseFloat(gainRate);
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
   * Get weight gain rate description
   */
  getWeightGainRateDescription(rate) {
    const descriptions = {
      '0.25': '0.25 kg/week (0.5 lb/week) - Conservative',
      '0.5': '0.5 kg/week (1 lb/week) - Moderate',
      '0.75': '0.75 kg/week (1.5 lb/week) - Aggressive',
      '1.0': '1.0 kg/week (2 lb/week) - Very Aggressive'
    };
    return descriptions[rate] || 'Unknown gain rate';
  }

  /**
   * Calculate weight gain timeline
   */
  calculateWeightGainTimeline(currentWeight, targetWeight, gainRate, weeks = 52) {
    const weightToGain = targetWeight - currentWeight;
    const totalWeeksNeeded = Math.ceil(weightToGain / parseFloat(gainRate));
    const timeline = [];
    
    for (let week = 0; week <= Math.min(totalWeeksNeeded, weeks); week++) {
      const weightAtWeek = currentWeight + (parseFloat(gainRate) * week);
      timeline.push({
        week: week,
        weight: Math.round(weightAtWeek * 10) / 10,
        weightGained: Math.round((weightAtWeek - currentWeight) * 10) / 10
      });
    }
    
    return timeline;
  }

  /**
   * Generate weight gain recommendations
   */
  generateRecommendations(weightToGain, estimatedWeeks, gainRate) {
    const recommendations = [];
    
    if (parseFloat(gainRate) > 0.75) {
      recommendations.push('Consider a more moderate weight gain rate to minimize fat gain');
    }
    
    if (estimatedWeeks > 52) {
      recommendations.push('This is a long-term goal - focus on sustainable lifestyle changes');
    }
    
    if (weightToGain > 20) {
      recommendations.push('For significant weight gain, consider consulting a healthcare professional');
    }
    
    recommendations.push('Include strength training to build muscle mass during weight gain');
    recommendations.push('Focus on nutrient-dense foods to meet your calorie targets');
    recommendations.push('Eat frequent meals and snacks throughout the day');
    recommendations.push('Stay consistent with your eating schedule and training routine');
    
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
   * Calculate muscle vs fat gain ratio
   */
  calculateMuscleFatRatio(gainRate, activityLevel) {
    // Higher activity levels and moderate gain rates favor muscle gain
    const activityFactor = parseFloat(activityLevel);
    const rateFactor = parseFloat(gainRate);
    
    let muscleRatio = 0.6; // Base 60% muscle gain
    
    // Adjust based on activity level
    if (activityFactor >= 1.725) {
      muscleRatio += 0.2; // +20% for very active
    } else if (activityFactor >= 1.55) {
      muscleRatio += 0.1; // +10% for moderate activity
    }
    
    // Adjust based on gain rate (slower rates favor muscle)
    if (rateFactor <= 0.25) {
      muscleRatio += 0.15; // +15% for conservative rates
    } else if (rateFactor <= 0.5) {
      muscleRatio += 0.1; // +10% for moderate rates
    }
    
    // Cap at 85% muscle gain
    muscleRatio = Math.min(muscleRatio, 0.85);
    
    return {
      muscleRatio: Math.round(muscleRatio * 100) / 100,
      fatRatio: Math.round((1 - muscleRatio) * 100) / 100
    };
  }

  /**
   * Calculate meal timing recommendations
   */
  calculateMealTiming(totalCalories) {
    const meals = Math.ceil(totalCalories / 600); // Aim for 600 calories per meal
    const snacks = Math.max(0, Math.ceil((totalCalories - (meals * 600)) / 300));
    
    return {
      meals: Math.min(meals, 6), // Cap at 6 meals
      snacks: Math.min(snacks, 3), // Cap at 3 snacks
      caloriesPerMeal: Math.round(totalCalories / Math.max(meals, 3)),
      caloriesPerSnack: snacks > 0 ? Math.round((totalCalories - (meals * 600)) / snacks) : 0
    };
  }

  /**
   * Format results for display
   */
  formatResults(results) {
    return {
      ...results,
      maintenanceCalories: Math.round(results.maintenanceCalories),
      gainCalories: Math.round(results.gainCalories),
      calorieSurplus: Math.round(results.calorieSurplus),
      estimatedWeeks: Math.round(results.estimatedWeeks * 10) / 10,
      weightToGain: Math.round(results.weightToGain * 10) / 10
    };
  }

  /**
   * Main calculation function
   */
  calculateWeightGain(formData) {
    const validation = this.validateInputs(formData);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    const { 
      gender, age, heightUnit, heightCm, heightFt, heightIn, 
      weightUnit, currentWeight, targetWeight, activityLevel, gainRate 
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
    
    // Calculate calorie surplus
    const calorieSurplus = this.calculateCalorieSurplus(gainRate);
    
    // Calculate weight gain calories
    const gainCalories = this.calculateWeightGainCalories(tdee, calorieSurplus);
    
    // Calculate estimated time
    const estimatedWeeks = this.calculateEstimatedTime(currentWeightKg, targetWeightKg, gainRate);
    
    // Calculate macronutrients
    const macros = this.calculateMacronutrients(currentWeightKg, gainCalories);
    
    // Calculate additional metrics
    const weightToGain = targetWeightKg - currentWeightKg;
    const currentBMI = this.calculateBMI(currentWeightKg, heightCmValue);
    const targetBMI = this.calculateBMI(targetWeightKg, heightCmValue);
    const idealWeightRange = this.calculateIdealWeightRange(heightCmValue, gender);
    const muscleFatRatio = this.calculateMuscleFatRatio(gainRate, activityLevel);
    const mealTiming = this.calculateMealTiming(gainCalories);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(weightToGain, estimatedWeeks, gainRate);
    
    // Generate timeline
    const timeline = this.calculateWeightGainTimeline(currentWeightKg, targetWeightKg, gainRate);
    
    return this.formatResults({
      maintenanceCalories: tdee,
      gainCalories: gainCalories,
      calorieSurplus: calorieSurplus,
      estimatedWeeks: estimatedWeeks,
      weightToGain: weightToGain,
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
      muscleFatRatio: muscleFatRatio,
      mealTiming: mealTiming,
      recommendations: recommendations,
      timeline: timeline
    });
  }
}

// Export for use in React component
export default WeightGainCalculator;
