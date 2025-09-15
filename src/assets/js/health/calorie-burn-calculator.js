/**
 * Calorie Burn Calculator Logic
 * Handles all calorie burn-related calculations including MET values,
 * BMR adjustments, fitness level modifications, and personalized recommendations.
 */

class CalorieBurnCalculatorLogic {
  constructor() {
    this.metValues = {
      // Light Activities
      walking_slow: 2.5,
      cycling_light: 4.0,
      swimming_light: 4.5,
      yoga: 2.5,
      stretching: 2.3,
      
      // Moderate Activities
      walking_brisk: 3.8,
      cycling_moderate: 6.8,
      swimming_moderate: 6.0,
      dancing: 4.5,
      hiking: 5.3,
      
      // Vigorous Activities
      running: 9.8,
      cycling_vigorous: 10.0,
      swimming_vigorous: 9.0,
      hiit: 8.0,
      weightlifting: 6.0
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
      { food: "Apple", calories: 95 },
      { food: "Banana", calories: 105 },
      { food: "Slice of bread", calories: 80 },
      { food: "Chocolate bar", calories: 230 },
      { food: "Cheeseburger", calories: 300 },
      { food: "Pizza slice", calories: 285 },
      { food: "Can of soda", calories: 150 },
      { food: "Cup of rice", calories: 200 },
      { food: "Avocado", calories: 240 },
      { food: "Donut", calories: 195 },
      { food: "Glass of wine", calories: 125 },
      { food: "Beer", calories: 155 },
      { food: "Cookie", calories: 50 },
      { food: "Egg", calories: 70 },
      { food: "Cup of pasta", calories: 220 }
    ];
  }

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @returns {Object} Calculation results
   */
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

    // Convert weight to kg if needed
    const weightInKg = weightUnit === 'lb' ? weight * 0.453592 : weight;

    // Convert duration to hours
    const durationInHours = durationUnit === 'min' ? duration / 60 : duration;

    // Get base MET value for the selected activity
    let met = this.metValues[activity] || 3.0;

    // Apply personal adjustments
    met = this.applyPersonalAdjustments(met, {
      fitnessLevel,
      age,
      height,
      weightInKg,
      gender,
      intensity,
      temperature,
      temperatureUnit
    });

    // Calculate calories burned using the formula: calories = MET × weight (kg) × duration (hours)
    const caloriesBurned = met * weightInKg * durationInHours;

    // Calculate additional metrics
    const fatBurned = caloriesBurned / 7700 * 1000; // Convert to grams
    const caloriesPerMinute = caloriesBurned / (durationInHours * 60);
    const timeToBurn = 500 / caloriesPerMinute;
    const dailyGoalPercentage = (durationInHours * 60) / 30 * 100;

    // Get food equivalents
    const foodEquivalents = this.getFoodEquivalents(caloriesBurned);

    // Generate explanation
    const explanation = this.generateExplanation({
      weight,
      weightUnit,
      duration,
      durationUnit,
      activity,
      caloriesBurned,
      age,
      height,
      fitnessLevel
    });

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

  /**
   * Apply personal adjustments to MET value
   * @param {number} baseMet - Base MET value
   * @param {Object} adjustments - Adjustment factors
   * @returns {number} Adjusted MET value
   */
  applyPersonalAdjustments(baseMet, adjustments) {
    let met = baseMet;

    // Adjust MET based on fitness level
    if (adjustments.fitnessLevel === 'beginner') {
      met *= 0.85; // Beginners burn fewer calories due to lower efficiency
    } else if (adjustments.fitnessLevel === 'advanced') {
      met *= 1.1; // Advanced fitness can increase calorie burn
    } else if (adjustments.fitnessLevel === 'athlete') {
      met *= 1.2; // Athletes can burn more calories
    }

    // Adjust for age if provided
    if (adjustments.age) {
      if (adjustments.age > 40) {
        // Metabolism slows with age
        const ageFactor = 1 - ((adjustments.age - 40) * 0.005); // 0.5% reduction per year over 40
        met *= Math.max(0.8, ageFactor); // Cap at 20% reduction
      }
    }

    // Apply BMR-based adjustment if height, age, and gender are all provided
    if (adjustments.age && adjustments.height > 0 && adjustments.gender) {
      const bmr = this.calculateBMR(
        adjustments.weightInKg,
        adjustments.height,
        adjustments.age,
        adjustments.gender
      );
      
      // Adjust MET based on individual BMR vs average BMR
      const averageBMR = adjustments.weightInKg * 24; // Rough average BMR estimate
      const bmrFactor = bmr / averageBMR;
      met *= bmrFactor;
    }

    // Adjust for intensity if selected
    if (adjustments.intensity === 'low') {
      met *= 0.85;
    } else if (adjustments.intensity === 'high') {
      met *= 1.15;
    }

    // Adjust for temperature if provided
    if (adjustments.temperature) {
      let temp = adjustments.temperature;
      
      // Convert to Celsius if needed
      if (adjustments.temperatureUnit === 'f') {
        temp = (temp - 32) * 5/9;
      }
      
      // Adjust MET based on temperature
      if (temp < 10) {
        // Cold weather increases calorie burn
        met *= 1 + ((10 - temp) * 0.01); // 1% increase per degree below 10°C
      } else if (temp > 25) {
        // Hot weather increases calorie burn
        met *= 1 + ((temp - 25) * 0.015); // 1.5% increase per degree above 25°C
      }
    }

    return met;
  }

  /**
   * Calculate BMR using Mifflin-St Jeor equation
   * @param {number} weight - Weight in kg
   * @param {number} height - Height in cm
   * @param {number} age - Age in years
   * @param {string} gender - Gender (male/female)
   * @returns {number} BMR value
   */
  calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'female') {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      // Use average for other
      return (10 * weight) + (6.25 * height) - (5 * age) - 78;
    }
  }

  /**
   * Get height in centimeters
   * @param {Object} formData - Form data
   * @returns {number} Height in cm
   */
  getHeightInCm(formData) {
    const heightUnit = formData.heightUnit;
    
    if (heightUnit === 'ft') {
      const feet = parseFloat(formData.heightFeet) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      const totalInches = (feet * 12) + inches;
      return totalInches * 2.54;
    } else if (heightUnit === 'in') {
      const heightInInches = parseFloat(formData.height) || 0;
      return heightInInches * 2.54;
    } else {
      return parseFloat(formData.height) || 0;
    }
  }

  /**
   * Get food equivalents for calories burned
   * @param {number} calories - Calories burned
   * @returns {Array} Array of food equivalents
   */
  getFoodEquivalents(calories) {
    const equivalents = [];
    let remainingCalories = calories;
    
    // Try to find 2-3 food items that approximately equal the calories burned
    while (equivalents.length < 3 && remainingCalories > 50) {
      // Find foods that are less than the remaining calories
      const possibleFoods = this.foodEquivalents.filter(food => food.calories <= remainingCalories);
      
      if (possibleFoods.length === 0) break;
      
      // Select a random food
      const randomIndex = Math.floor(Math.random() * possibleFoods.length);
      const selectedFood = possibleFoods[randomIndex];
      
      // Calculate how many of this food item
      const quantity = Math.floor(remainingCalories / selectedFood.calories);
      
      if (quantity > 0) {
        // Add to equivalents
        equivalents.push({
          food: selectedFood.food,
          quantity: quantity,
          calories: quantity * selectedFood.calories
        });
        
        // Update remaining calories
        remainingCalories -= quantity * selectedFood.calories;
      } else {
        break;
      }
    }
    
    return equivalents;
  }

  /**
   * Get activity name from key
   * @param {string} activityKey - Activity key
   * @returns {string} Activity name
   */
  getActivityName(activityKey) {
    const activityNames = {
      walking_slow: "Slow Walking",
      cycling_light: "Light Cycling",
      swimming_light: "Light Swimming",
      yoga: "Yoga",
      stretching: "Stretching",
      walking_brisk: "Brisk Walking",
      cycling_moderate: "Moderate Cycling",
      swimming_moderate: "Moderate Swimming",
      dancing: "Dancing",
      hiking: "Hiking",
      running: "Running",
      cycling_vigorous: "Vigorous Cycling",
      swimming_vigorous: "Vigorous Swimming",
      hiit: "HIIT",
      weightlifting: "Weightlifting"
    };
    
    return activityNames[activityKey] || "Exercise";
  }

  /**
   * Generate personalized explanation
   * @param {Object} data - Calculation data
   * @returns {string} Explanation text
   */
  generateExplanation(data) {
    const { weight, weightUnit, duration, durationUnit, activity, caloriesBurned, age, height, fitnessLevel } = data;
    
    const activityName = this.getActivityName(activity);
    const activityDescription = this.activityDescriptions[activity] || '';
    
    let explanation = `Based on your weight of ${weight} ${weightUnit} and ${duration} ${durationUnit === 'min' ? 'minutes' : 'hours'} of ${activityName.toLowerCase()}, you've burned approximately ${Math.round(caloriesBurned)} calories. ${activityDescription}`;
    
    // Add personalized insights if available
    if (age || height > 0) {
      explanation += ` Your personal metrics have been factored into this calculation for greater accuracy.`;
    }
    
    if (age) {
      explanation += ` Age can affect metabolic rate, and this has been considered in your results.`;
    }
    
    if (fitnessLevel !== 'intermediate') {
      explanation += ` Your ${fitnessLevel} fitness level impacts how efficiently your body burns calories during exercise.`;
    }
    
    // Check if height was provided for BMR calculation
    if (age && height > 0) {
      explanation += ` Your height and age have been used to calculate a personalized metabolic rate for more precise results.`;
    }
    
    return explanation;
  }

  /**
   * Validate form inputs
   * @param {Object} formData - Form data
   * @returns {Object} Validation result
   */
  validateInputs(formData) {
    const errors = [];

    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) {
      errors.push('Please enter a valid weight.');
    }

    if (!formData.activity) {
      errors.push('Please select an activity.');
    }

    const duration = parseFloat(formData.duration);
    if (!duration || duration <= 0) {
      errors.push('Please enter a valid duration.');
    }

    // Height validation (optional but if provided, should be valid)
    if (formData.heightUnit === 'ft') {
      const feet = parseFloat(formData.heightFeet);
      const inches = parseFloat(formData.heightInches) || 0;
      if (formData.heightFeet && (isNaN(feet) || feet < 0)) {
        errors.push('Please enter a valid height in feet.');
      }
      if (formData.heightInches && (isNaN(inches) || inches < 0 || inches >= 12)) {
        errors.push('Inches should be between 0 and 11.');
      }
    } else if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height <= 0) {
        errors.push('Please enter a valid height.');
      }
    }

    // Age validation (optional but if provided, should be valid)
    if (formData.age) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) {
        errors.push('Please enter a valid age between 1 and 120.');
      }
    }

    // Temperature validation (optional but if provided, should be valid)
    if (formData.temperature) {
      const temperature = parseFloat(formData.temperature);
      if (isNaN(temperature) || temperature < -50 || temperature > 60) {
        errors.push('Please enter a valid temperature.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get calculation steps for display
   * @param {Object} formData - Form data
   * @returns {Array} Array of calculation steps
   */
  getCalculationSteps(formData) {
    const steps = [];
    const weight = parseFloat(formData.weight);
    const weightUnit = formData.weightUnit;
    const activity = formData.activity;
    const duration = parseFloat(formData.duration);
    const durationUnit = formData.durationUnit;

    const weightInKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
    const durationInHours = durationUnit === 'min' ? duration / 60 : duration;
    const baseMet = this.metValues[activity] || 3.0;

    steps.push({
      step: 1,
      title: 'Convert Weight to Kilograms',
      description: 'Convert weight to standard metric unit',
      formula: weightUnit === 'lb' 
        ? `${weight} lb × 0.453592 = ${weightInKg.toFixed(2)} kg`
        : `${weight} kg (already in kg)`
    });

    steps.push({
      step: 2,
      title: 'Convert Duration to Hours',
      description: 'Convert duration to standard time unit',
      formula: durationUnit === 'min'
        ? `${duration} minutes ÷ 60 = ${durationInHours.toFixed(2)} hours`
        : `${duration} hours (already in hours)`
    });

    steps.push({
      step: 3,
      title: 'Get Base MET Value',
      description: 'Get Metabolic Equivalent of Task for selected activity',
      formula: `${this.getActivityName(activity)}: ${baseMet} METs`
    });

    steps.push({
      step: 4,
      title: 'Calculate Calories Burned',
      description: 'Apply the calorie burn formula',
      formula: `Calories = ${baseMet} METs × ${weightInKg.toFixed(2)} kg × ${durationInHours.toFixed(2)} hours = ${(baseMet * weightInKg * durationInHours).toFixed(0)} calories`
    });

    return steps;
  }
}

export default CalorieBurnCalculatorLogic;
