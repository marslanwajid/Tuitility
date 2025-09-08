/**
 * Calorie Calculator Logic
 * Handles all calorie-related calculations including BMR, TDEE, macronutrient distribution,
 * weight projections, and personalized recommendations.
 */

class CalorieCalculatorLogic {
  constructor() {
    this.activityMultipliers = {
      '1.2': 'Sedentary',
      '1.375': 'Light Activity',
      '1.55': 'Moderate Activity',
      '1.725': 'Very Active',
      '1.9': 'Extra Active'
    };
    
    this.macroRatios = {
      protein: 0.30,
      carbs: 0.40,
      fat: 0.30
    };
    
    this.caloriesPerGram = {
      protein: 4,
      carbs: 4,
      fat: 9
    };
  }

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @returns {Object} Calculation results
   */
  calculate(formData) {
    const height = this.getHeightInCm(formData);
    const weight = this.getWeightInKg(formData);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const activityLevel = parseFloat(formData.activityLevel);
    const goal = formData.goal;
    const rate = parseFloat(formData.rate) || 0;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = this.calculateBMR(weight, height, age, gender);
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const maintenanceCalories = Math.round(bmr * activityLevel);
    
    // Calculate goal calories based on weight goal
    const { goalCalories, calorieChange } = this.calculateGoalCalories(
      maintenanceCalories, 
      goal, 
      rate, 
      gender
    );
    
    // Calculate macronutrients
    const macros = this.calculateMacronutrients(goalCalories);
    
    // Calculate weight projection
    const weightProjection = this.calculateWeightProjection(weight, goal, rate);
    
    // Generate recommendations
    const recommendations = this.getRecommendations(goal, rate, goalCalories, gender);
    
    return {
      bmr,
      maintenanceCalories,
      goalCalories,
      calorieChange,
      macros,
      weightProjection,
      recommendations,
      goal,
      rate
    };
  }

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   * @param {number} weight - Weight in kg
   * @param {number} height - Height in cm
   * @param {number} age - Age in years
   * @param {string} gender - Gender (male/female)
   * @returns {number} BMR in calories per day
   */
  calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  /**
   * Calculate goal calories based on weight goal
   * @param {number} maintenanceCalories - Maintenance calories (TDEE)
   * @param {string} goal - Weight goal (maintain/lose/gain)
   * @param {number} rate - Weekly weight change rate
   * @param {string} gender - Gender for minimum calorie limits
   * @returns {Object} Goal calories and calorie change
   */
  calculateGoalCalories(maintenanceCalories, goal, rate, gender) {
    let goalCalories = maintenanceCalories;
    let calorieChange = 0;
    
    if (goal === 'lose') {
      // Approximately 1100 calories deficit per 0.5kg/week
      calorieChange = rate * 1100;
      goalCalories = Math.round(maintenanceCalories - calorieChange);
    } else if (goal === 'gain') {
      // Approximately 500 calories surplus per 0.5kg/week
      calorieChange = rate * 500;
      goalCalories = Math.round(maintenanceCalories + calorieChange);
    }
    
    // Ensure minimum calories for health
    const minCalories = gender === 'male' ? 1500 : 1200;
    if (goalCalories < minCalories) {
      goalCalories = minCalories;
    }
    
    return { goalCalories, calorieChange };
  }

  /**
   * Calculate macronutrient distribution
   * @param {number} totalCalories - Total daily calories
   * @returns {Object} Macronutrient breakdown
   */
  calculateMacronutrients(totalCalories) {
    const proteinCalories = Math.round(totalCalories * this.macroRatios.protein);
    const carbsCalories = Math.round(totalCalories * this.macroRatios.carbs);
    const fatCalories = Math.round(totalCalories * this.macroRatios.fat);
    
    return {
      protein: {
        calories: proteinCalories,
        grams: Math.round(proteinCalories / this.caloriesPerGram.protein)
      },
      carbs: {
        calories: carbsCalories,
        grams: Math.round(carbsCalories / this.caloriesPerGram.carbs)
      },
      fat: {
        calories: fatCalories,
        grams: Math.round(fatCalories / this.caloriesPerGram.fat)
      }
    };
  }

  /**
   * Calculate weight projection over 12 weeks
   * @param {number} currentWeight - Current weight in kg
   * @param {string} goal - Weight goal
   * @param {number} rate - Weekly weight change rate
   * @returns {Object} Weight projection data
   */
  calculateWeightProjection(currentWeight, goal, rate) {
    if (goal === 'maintain') {
      return null;
    }
    
    const weeklyChange = goal === 'lose' ? -rate : rate;
    const projectedWeight = currentWeight + (weeklyChange * 12);
    const totalChange = projectedWeight - currentWeight;
    
    return {
      currentWeight,
      projectedWeight: Math.max(projectedWeight, 0), // Prevent negative weight
      totalChange: Math.abs(totalChange)
    };
  }

  /**
   * Get personalized recommendations
   * @param {string} goal - Weight goal
   * @param {number} rate - Weekly rate
   * @param {number} goalCalories - Goal calories
   * @param {string} gender - Gender
   * @returns {Array} Array of recommendations
   */
  getRecommendations(goal, rate, goalCalories, gender) {
    const recommendations = [];
    
    // Goal-specific recommendations
    if (goal === 'lose') {
      if (rate > 1) {
        recommendations.push('Consider a slower weight loss rate (0.5-1 kg/week) for sustainable results');
      }
      recommendations.push('Focus on creating a moderate calorie deficit through diet and exercise');
      recommendations.push('Include strength training to preserve muscle mass during weight loss');
    } else if (goal === 'gain') {
      if (rate > 0.5) {
        recommendations.push('Consider a slower weight gain rate (0.25-0.5 kg/week) for healthy muscle gain');
      }
      recommendations.push('Focus on nutrient-dense foods and strength training for lean muscle gain');
      recommendations.push('Ensure adequate protein intake to support muscle growth');
    } else {
      recommendations.push('Maintain your current eating and exercise habits for weight maintenance');
      recommendations.push('Focus on balanced nutrition and regular physical activity');
    }
    
    // Calorie-specific recommendations
    const minCalories = gender === 'male' ? 1500 : 1200;
    if (goalCalories <= minCalories) {
      recommendations.push('Your calorie target is at the minimum safe level - consult a healthcare provider');
    }
    
    // General recommendations
    recommendations.push('Track your food intake consistently for best results');
    recommendations.push('Drink plenty of water throughout the day');
    recommendations.push('Get adequate sleep (7-9 hours) for optimal metabolism');
    recommendations.push('Be patient - sustainable changes take time');
    
    return recommendations;
  }

  /**
   * Convert height to centimeters
   * @param {Object} formData - Form data
   * @returns {number} Height in cm
   */
  getHeightInCm(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height);
    } else {
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return feet * 30.48 + inches * 2.54;
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
   * Get calculation steps for display
   * @param {Object} formData - Form data
   * @returns {Array} Array of calculation steps
   */
  getCalculationSteps(formData) {
    const steps = [];
    const height = this.getHeightInCm(formData);
    const weight = this.getWeightInKg(formData);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const activityLevel = parseFloat(formData.activityLevel);
    
    steps.push({
      step: 1,
      title: 'Convert Measurements',
      description: 'Convert all measurements to metric units',
      formula: `Height: ${height.toFixed(0)} cm, Weight: ${weight.toFixed(1)} kg`
    });
    
    const bmr = this.calculateBMR(weight, height, age, gender);
    steps.push({
      step: 2,
      title: 'Calculate BMR',
      description: 'Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation',
      formula: `{'\\text{BMR} = 10 \\times ${weight.toFixed(1)} + 6.25 \\times ${height.toFixed(0)} - 5 \\times ${age} + ${gender === 'male' ? '5' : '-161'} = ${Math.round(bmr)} \\text{ calories/day}'}`
    });
    
    const maintenanceCalories = Math.round(bmr * activityLevel);
    steps.push({
      step: 3,
      title: 'Calculate TDEE',
      description: 'Calculate Total Daily Energy Expenditure',
      formula: `{'\\text{TDEE} = ${Math.round(bmr)} \\times ${activityLevel} = ${maintenanceCalories} \\text{ calories/day}'}`
    });
    
    if (formData.goal !== 'maintain') {
      const rate = parseFloat(formData.rate);
      const calorieChange = formData.goal === 'lose' ? rate * 1100 : rate * 500;
      const goalCalories = formData.goal === 'lose' 
        ? Math.round(maintenanceCalories - calorieChange)
        : Math.round(maintenanceCalories + calorieChange);
      
      steps.push({
        step: 4,
        title: 'Calculate Goal Calories',
        description: `Adjust calories for ${formData.goal} weight goal`,
        formula: `{'\\text{Goal Calories} = ${maintenanceCalories} ${formData.goal === 'lose' ? '-' : '+'} ${Math.round(calorieChange)} = ${goalCalories} \\text{ calories/day}'}`
      });
    }
    
    return steps;
  }

  /**
   * Validate input data
   * @param {Object} formData - Form data
   * @returns {Object} Validation result
   */
  validateInputs(formData) {
    const errors = [];
    
    const age = parseInt(formData.age);
    if (!age || age < 15 || age > 80) {
      errors.push('Age must be between 15 and 80 years');
    }
    
    const height = this.getHeightInCm(formData);
    if (!height || height < 130 || height > 230) {
      errors.push('Height must be between 130cm and 230cm');
    }
    
    const weight = this.getWeightInKg(formData);
    if (!weight || weight < 40 || weight > 200) {
      errors.push('Weight must be between 40kg and 200kg');
    }
    
    if (formData.goal !== 'maintain') {
      const rate = parseFloat(formData.rate);
      if (!rate || rate <= 0 || rate > 2) {
        errors.push('Rate must be between 0.25 and 2.0 kg/week');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get activity level description
   * @param {string} multiplier - Activity multiplier
   * @returns {string} Activity level description
   */
  getActivityDescription(multiplier) {
    return this.activityMultipliers[multiplier] || 'Unknown';
  }

  /**
   * Get goal description
   * @param {string} goal - Goal type
   * @returns {string} Goal description
   */
  getGoalDescription(goal) {
    const descriptions = {
      maintain: 'Maintain Current Weight',
      lose: 'Lose Weight',
      gain: 'Gain Weight'
    };
    return descriptions[goal] || 'Unknown';
  }
}

export default CalorieCalculatorLogic;
