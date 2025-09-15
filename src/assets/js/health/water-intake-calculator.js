/**
 * Water Intake Calculator Logic
 * Handles all water intake calculations and validations
 */

class WaterIntakeCalculator {
  constructor() {
    this.defaultValues = {
      weight: '',
      weightUnit: 'kg',
      activityLevel: 'light',
      climate: 'moderate',
      gender: 'male',
      age: '',
      weightAdv: '',
      weightUnitAdv: 'kg',
      heightUnit: 'cm',
      heightCm: '',
      heightFt: '',
      heightIn: '',
      activityLevelAdv: 'light',
      climateAdv: 'moderate',
      caffeine: 'low',
      alcohol: 'none',
      pregnancy: 'no',
      healthConditions: 'none'
    };
  }

  /**
   * Validate basic calculator inputs
   */
  validateBasicInputs(formData) {
    const { weight } = formData;
    
    if (!weight || parseFloat(weight) <= 0) {
      return {
        isValid: false,
        error: 'Please enter a valid weight greater than 0.'
      };
    }

    if (parseFloat(weight) > 500) {
      return {
        isValid: false,
        error: 'Please enter a realistic weight value.'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate advanced calculator inputs
   */
  validateAdvancedInputs(formData) {
    const { age, weightAdv, heightCm, heightFt, heightIn, heightUnit } = formData;
    
    if (!age || parseInt(age) <= 0 || parseInt(age) > 120) {
      return {
        isValid: false,
        error: 'Please enter a valid age between 1 and 120 years.'
      };
    }

    if (!weightAdv || parseFloat(weightAdv) <= 0) {
      return {
        isValid: false,
        error: 'Please enter a valid weight greater than 0.'
      };
    }

    if (parseFloat(weightAdv) > 500) {
      return {
        isValid: false,
        error: 'Please enter a realistic weight value.'
      };
    }

    if (heightUnit === 'cm') {
      if (!heightCm || parseFloat(heightCm) <= 0) {
        return {
          isValid: false,
          error: 'Please enter a valid height in centimeters.'
        };
      }
      if (parseFloat(heightCm) > 250) {
        return {
          isValid: false,
          error: 'Please enter a realistic height value.'
        };
      }
    } else {
      if (!heightFt || parseFloat(heightFt) <= 0 || !heightIn || parseFloat(heightIn) < 0) {
        return {
          isValid: false,
          error: 'Please enter a valid height in feet and inches.'
        };
      }
      if (parseFloat(heightFt) > 8 || parseFloat(heightIn) > 11) {
        return {
          isValid: false,
          error: 'Please enter a realistic height value.'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Calculate basic water intake
   */
  calculateBasicWaterIntake(formData) {
    const { weight, weightUnit, activityLevel, climate } = formData;
    
    // Convert weight to kg if in pounds
    const weightInKg = weightUnit === 'lb' ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    
    // Base calculation: 30-35ml per kg of body weight
    let waterIntake = weightInKg * 0.033; // Liters per day
    
    // Activity level multipliers
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      very: 1.3,
      extra: 1.4
    };
    
    waterIntake *= activityMultipliers[activityLevel] || 1.0;
    
    // Climate multipliers
    const climateMultipliers = {
      moderate: 1.0,
      hot: 1.2,
      humid: 1.3,
      cold: 0.95
    };
    
    waterIntake *= climateMultipliers[climate] || 1.0;
    
    return Math.max(0.5, waterIntake); // Minimum 0.5L per day
  }

  /**
   * Calculate advanced water intake
   */
  calculateAdvancedWaterIntake(formData) {
    const { 
      gender, age, weightAdv, weightUnitAdv, heightUnit, heightCm, heightFt, heightIn,
      activityLevelAdv, climateAdv, caffeine, alcohol, pregnancy, healthConditions 
    } = formData;
    
    // Convert weight to kg if in pounds
    const weightInKg = weightUnitAdv === 'lb' ? parseFloat(weightAdv) * 0.453592 : parseFloat(weightAdv);
    
    // Calculate height in cm
    let height;
    if (heightUnit === 'cm') {
      height = parseFloat(heightCm);
    } else {
      height = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn) * 2.54);
    }
    
    // Base calculation using more factors
    let waterIntake = (weightInKg * 0.033) + (height * 0.0005) - (parseInt(age) * 0.005) + 1.5;
    
    // Gender adjustment
    if (gender === 'female') {
      waterIntake *= 0.95;
    }
    
    // Activity level adjustment
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      very: 1.3,
      extra: 1.4
    };
    
    waterIntake *= activityMultipliers[activityLevelAdv] || 1.0;
    
    // Climate adjustment
    const climateMultipliers = {
      moderate: 1.0,
      hot: 1.2,
      humid: 1.3,
      cold: 0.95
    };
    
    waterIntake *= climateMultipliers[climateAdv] || 1.0;
    
    // Caffeine adjustment
    const caffeineAdjustments = {
      none: 0,
      low: 0.2,
      moderate: 0.4,
      high: 0.6
    };
    
    waterIntake += caffeineAdjustments[caffeine] || 0;
    
    // Alcohol adjustment
    const alcoholAdjustments = {
      none: 0,
      light: 0.3,
      moderate: 0.6,
      heavy: 1.0
    };
    
    waterIntake += alcoholAdjustments[alcohol] || 0;
    
    // Pregnancy and breastfeeding adjustment
    if (gender === 'female') {
      const pregnancyAdjustments = {
        no: 0,
        first: 0.3,
        second: 0.5,
        third: 0.7,
        breastfeeding: 1.0
      };
      
      waterIntake += pregnancyAdjustments[pregnancy] || 0;
    }
    
    // Health conditions adjustment
    if (healthConditions === 'kidney') {
      return 'Consult your doctor';
    } else if (healthConditions === 'heart') {
      waterIntake *= 0.9;
    } else if (healthConditions === 'diabetes') {
      waterIntake *= 1.1;
    }
    
    return Math.max(0.5, waterIntake); // Minimum 0.5L per day
  }

  /**
   * Format water intake results
   */
  formatResults(waterIntake) {
    if (typeof waterIntake === 'string') {
      return {
        waterIntake: waterIntake,
        waterCups: waterIntake,
        waterOunces: waterIntake,
        isSpecialCase: true
      };
    }

    const roundedIntake = Math.round(waterIntake * 100) / 100;
    const cups = Math.round(waterIntake * 4.227);
    const ounces = Math.round(waterIntake * 33.814);
    
    return {
      waterIntake: roundedIntake,
      waterCups: cups,
      waterOunces: ounces,
      isSpecialCase: false,
      morningCups: Math.round(cups * 0.35),
      afternoonCups: Math.round(cups * 0.40),
      eveningCups: Math.round(cups * 0.25)
    };
  }

  /**
   * Generate personalized hydration tips
   */
  generateHydrationTips(waterIntake) {
    const generalTips = [
      'Start your day with a glass of water to kickstart hydration.',
      'Keep a reusable water bottle with you throughout the day.',
      'Set reminders on your phone to drink water regularly.',
      'Add natural flavors like lemon, cucumber, or berries to make water more appealing.',
      'Drink a glass of water before each meal to help with digestion and portion control.',
      'Track your water intake with a mobile app or journal.',
      'Consume water-rich foods like fruits and vegetables to supplement your hydration.',
      'Limit alcohol and caffeine consumption, as they can contribute to dehydration.'
    ];
    
    const highIntakeTips = [
      'Spread your water consumption evenly throughout the day to avoid overhydration.',
      'Consider electrolyte drinks if you are very active to maintain mineral balance.',
      'Monitor your urine color - pale yellow indicates good hydration.',
      'Increase intake before, during, and after exercise to replace lost fluids.'
    ];
    
    const lowIntakeTips = [
      'Even mild dehydration can affect energy levels and cognitive function.',
      'Try drinking a small glass of water every hour rather than large amounts at once.',
      'Set achievable hydration goals and gradually increase your intake.',
      'Consider foods with high water content like watermelon, cucumber, and oranges.'
    ];
    
    let selectedTips = [...generalTips];
    
    if (waterIntake > 3) {
      selectedTips = selectedTips.concat(highIntakeTips);
    } else {
      selectedTips = selectedTips.concat(lowIntakeTips);
    }
    
    // Return 6 random tips
    return this.shuffleArray(selectedTips).slice(0, 6);
  }

  /**
   * Shuffle array utility function
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Convert units utility functions
   */
  convertWeightToKg(weight, unit) {
    return unit === 'lb' ? weight * 0.453592 : weight;
  }

  convertHeightToCm(height, unit, inches = 0) {
    if (unit === 'cm') {
      return height;
    }
    return (height * 30.48) + (inches * 2.54);
  }

  convertLitersToCups(liters) {
    return Math.round(liters * 4.227);
  }

  convertLitersToOunces(liters) {
    return Math.round(liters * 33.814);
  }

  /**
   * Get activity level description
   */
  getActivityLevelDescription(level) {
    const descriptions = {
      sedentary: 'Little to no exercise',
      light: 'Light exercise 1-3 days per week',
      moderate: 'Moderate exercise 3-5 days per week',
      very: 'Hard exercise 6-7 days per week',
      extra: 'Very hard exercise, physical job'
    };
    return descriptions[level] || 'Unknown activity level';
  }

  /**
   * Get climate description
   */
  getClimateDescription(climate) {
    const descriptions = {
      moderate: 'Moderate temperature conditions',
      hot: 'Hot and dry climate',
      humid: 'Hot and humid climate',
      cold: 'Cold climate conditions'
    };
    return descriptions[climate] || 'Unknown climate';
  }

  /**
   * Calculate hydration schedule
   */
  calculateHydrationSchedule(totalCups) {
    return {
      morning: Math.round(totalCups * 0.35),
      afternoon: Math.round(totalCups * 0.40),
      evening: Math.round(totalCups * 0.25)
    };
  }

  /**
   * Get hydration status based on intake
   */
  getHydrationStatus(waterIntake, weight) {
    const weightInKg = this.convertWeightToKg(weight, 'kg');
    const recommendedMin = weightInKg * 0.03; // 30ml per kg
    const recommendedMax = weightInKg * 0.04; // 40ml per kg
    
    if (waterIntake < recommendedMin) {
      return {
        status: 'low',
        message: 'Your water intake is below the recommended minimum. Consider increasing your daily consumption.'
      };
    } else if (waterIntake > recommendedMax * 1.5) {
      return {
        status: 'high',
        message: 'Your water intake is quite high. Make sure to spread it throughout the day and monitor for overhydration symptoms.'
      };
    } else {
      return {
        status: 'optimal',
        message: 'Your water intake appears to be within a healthy range for your body weight and activity level.'
      };
    }
  }
}

// Export for use in React component
export default WaterIntakeCalculator;
