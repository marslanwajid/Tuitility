/**
 * DRI (Dietary Reference Intakes) Calculator Logic
 * Handles all DRI-related calculations including energy needs, macronutrient distribution,
 * vitamin and mineral requirements with adjustments for pregnancy, lactation, and health conditions.
 */

class DRICalculatorLogic {
  constructor() {
    this.activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9
    };

    this.dietTypeAdjustments = {
      omnivore: { protein: 15, carbs: 55, fat: 30 },
      vegetarian: { protein: 15, carbs: 60, fat: 25 },
      vegan: { protein: 15, carbs: 60, fat: 25 },
      keto: { protein: 20, carbs: 5, fat: 75 },
      mediterranean: { protein: 15, carbs: 50, fat: 35 },
      paleo: { protein: 25, carbs: 35, fat: 40 }
    };

    this.healthConditionAdjustments = {
      diabetes: { protein: 20, carbs: 45, fat: 35 },
      hypertension: { sodium: 0.7 }, // Reduce sodium by 30%
      kidney_disease: { protein: 0.8, potassium: 0.8 }, // Reduce protein and potassium
      heart_disease: { fat: 25, saturated_fat: 7 },
      osteoporosis: { calcium: 1.2, vitamin_d: 1.5 }
    };
  }

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @returns {Object} DRI calculation results
   */
  calculate(formData) {
    const gender = formData.gender;
    const age = parseInt(formData.age);
    const heightCm = this.getHeightInCm(formData);
    const weightKg = this.getWeightInKg(formData);
    const activityLevel = formData.activityLevel;
    const pregnancy = formData.pregnancy || 'none';
    const lactation = formData.lactation || 'none';
    const healthConditions = formData.healthConditions || [];
    const dietType = formData.dietType || 'omnivore';

    // Calculate energy needs
    const energy = this.calculateEnergyNeeds(gender, age, weightKg, heightCm, activityLevel, pregnancy, lactation);

    // Calculate macronutrient distribution
    const macros = this.calculateMacroDistribution(energy, gender, age, pregnancy, lactation, healthConditions, dietType);

    // Calculate vitamin needs
    const vitamins = this.calculateVitaminNeeds(gender, age, pregnancy, lactation, healthConditions);

    // Calculate mineral needs
    const minerals = this.calculateMineralNeeds(gender, age, pregnancy, lactation, healthConditions);

    // Calculate water needs
    const water = this.calculateWaterNeeds(weightKg, activityLevel, pregnancy, lactation);

    // Generate recommendations
    const recommendations = this.generateRecommendations(gender, age, pregnancy, lactation, healthConditions, dietType);

    return {
      userInfo: {
        gender,
        age,
        height: this.formatHeight(formData),
        weight: this.formatWeight(formData),
        activityLevel: this.getActivityLevelText(activityLevel),
        pregnancy,
        lactation,
        healthConditions,
        dietType
      },
      energy: Math.round(energy),
      macros,
      vitamins,
      minerals,
      water: Math.round(water),
      recommendations
    };
  }

  /**
   * Calculate energy needs using Mifflin-St Jeor equation
   * @param {string} gender - Gender (male/female)
   * @param {number} age - Age in years
   * @param {number} weight - Weight in kg
   * @param {number} height - Height in cm
   * @param {string} activityLevel - Activity level
   * @param {string} pregnancy - Pregnancy stage
   * @param {string} lactation - Lactation status
   * @returns {number} Daily energy needs in calories
   */
  calculateEnergyNeeds(gender, age, weight, height, activityLevel, pregnancy, lactation) {
    // Calculate BMR using Mifflin-St Jeor equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Apply activity multiplier
    const activityMultiplier = this.activityMultipliers[activityLevel] || 1.375;
    let tdee = bmr * activityMultiplier;

    // Adjust for pregnancy
    if (pregnancy !== 'none') {
      switch (pregnancy) {
        case 'first':
          tdee += 0; // No additional calories in first trimester
          break;
        case 'second':
          tdee += 340; // Additional 340 calories in second trimester
          break;
        case 'third':
          tdee += 450; // Additional 450 calories in third trimester
          break;
      }
    }

    // Adjust for lactation
    if (lactation !== 'none') {
      switch (lactation) {
        case 'exclusive':
          tdee += 500; // Additional 500 calories for exclusive breastfeeding
          break;
        case 'partial':
          tdee += 300; // Additional 300 calories for partial breastfeeding
          break;
      }
    }

    return tdee;
  }

  /**
   * Calculate macronutrient distribution
   * @param {number} energy - Daily energy needs
   * @param {string} gender - Gender
   * @param {number} age - Age
   * @param {string} pregnancy - Pregnancy stage
   * @param {string} lactation - Lactation status
   * @param {Array} healthConditions - Health conditions
   * @param {string} dietType - Diet type
   * @returns {Object} Macronutrient distribution
   */
  calculateMacroDistribution(energy, gender, age, pregnancy, lactation, healthConditions, dietType) {
    // Get base percentages from diet type
    let { protein: proteinPercent, carbs: carbsPercent, fat: fatPercent } = this.dietTypeAdjustments[dietType] || this.dietTypeAdjustments.omnivore;

    // Adjust for health conditions
    healthConditions.forEach(condition => {
      if (this.healthConditionAdjustments[condition]) {
        const adjustment = this.healthConditionAdjustments[condition];
        if (adjustment.protein) proteinPercent = adjustment.protein;
        if (adjustment.carbs) carbsPercent = adjustment.carbs;
        if (adjustment.fat) fatPercent = adjustment.fat;
      }
    });

    // Adjust for pregnancy/lactation
    if (pregnancy !== 'none' || lactation !== 'none') {
      proteinPercent = Math.max(proteinPercent, 18); // Minimum 18% protein during pregnancy/lactation
    }

    // Calculate grams
    const proteinGrams = (energy * (proteinPercent / 100)) / 4; // 4 calories per gram
    const carbsGrams = (energy * (carbsPercent / 100)) / 4; // 4 calories per gram
    const fatGrams = (energy * (fatPercent / 100)) / 9; // 9 calories per gram

    // Calculate fiber needs
    const fiber = gender === 'male' ? (age < 51 ? 38 : 30) : (age < 51 ? 25 : 21);

    return {
      protein: {
        percent: proteinPercent,
        grams: Math.round(proteinGrams),
        calories: Math.round(proteinGrams * 4)
      },
      carbs: {
        percent: carbsPercent,
        grams: Math.round(carbsGrams),
        calories: Math.round(carbsGrams * 4)
      },
      fat: {
        percent: fatPercent,
        grams: Math.round(fatGrams),
        calories: Math.round(fatGrams * 9)
      },
      fiber: Math.round(fiber)
    };
  }

  /**
   * Calculate vitamin needs
   * @param {string} gender - Gender
   * @param {number} age - Age
   * @param {string} pregnancy - Pregnancy stage
   * @param {string} lactation - Lactation status
   * @param {Array} healthConditions - Health conditions
   * @returns {Object} Vitamin requirements
   */
  calculateVitaminNeeds(gender, age, pregnancy, lactation, healthConditions) {
    // Base values for adult male
    let vitamins = {
      vitaminA: 900,    // μg RAE/day
      vitaminC: 90,     // mg/day
      vitaminD: 15,     // μg/day
      vitaminE: 15,     // mg/day
      vitaminK: 120,    // μg/day
      thiamin: 1.2,     // mg/day
      riboflavin: 1.3,  // mg/day
      niacin: 16,       // mg/day
      vitaminB6: 1.3,   // mg/day
      vitaminB12: 2.4,  // μg/day
      folate: 400,      // μg/day
      biotin: 30,       // μg/day
      pantothenicAcid: 5 // mg/day
    };

    // Adjust for gender and age
    if (gender === 'female') {
      if (age < 19) {
        vitamins = {
          vitaminA: 700, vitaminC: 75, vitaminD: 15, vitaminE: 15, vitaminK: 75,
          thiamin: 1.0, riboflavin: 1.0, niacin: 14, vitaminB6: 1.2, vitaminB12: 2.4,
          folate: 400, biotin: 25, pantothenicAcid: 5
        };
      } else {
        vitamins = {
          vitaminA: 700, vitaminC: 75, vitaminD: 15, vitaminE: 15, vitaminK: 90,
          thiamin: 1.1, riboflavin: 1.1, niacin: 14, vitaminB6: 1.3, vitaminB12: 2.4,
          folate: 400, biotin: 30, pantothenicAcid: 5
        };
      }

      // Adjust for pregnancy
      if (pregnancy !== 'none') {
        vitamins.vitaminA = 770;
        vitamins.vitaminC = 85;
        vitamins.vitaminD = 15;
        vitamins.vitaminE = 15;
        vitamins.vitaminK = 90;
        vitamins.thiamin = 1.4;
        vitamins.riboflavin = 1.4;
        vitamins.niacin = 18;
        vitamins.vitaminB6 = 1.9;
        vitamins.vitaminB12 = 2.6;
        vitamins.folate = 600; // Critical for pregnancy
        vitamins.biotin = 30;
        vitamins.pantothenicAcid = 6;
      }

      // Adjust for lactation
      if (lactation !== 'none') {
        vitamins.vitaminA = 1300;
        vitamins.vitaminC = 120;
        vitamins.vitaminD = 15;
        vitamins.vitaminE = 19;
        vitamins.vitaminK = 90;
        vitamins.thiamin = 1.4;
        vitamins.riboflavin = 1.6;
        vitamins.niacin = 17;
        vitamins.vitaminB6 = 2.0;
        vitamins.vitaminB12 = 2.8;
        vitamins.folate = 500;
        vitamins.biotin = 35;
        vitamins.pantothenicAcid = 7;
      }
    }

    // Age-specific adjustments
    if (age >= 51 && age < 71) {
      vitamins.vitaminD = 15;
    } else if (age >= 71) {
      vitamins.vitaminD = 20;
      vitamins.vitaminB6 = gender === 'male' ? 1.7 : 1.5;
      vitamins.vitaminB12 = 2.4; // May need higher due to absorption issues
    }

    // Health condition adjustments
    healthConditions.forEach(condition => {
      if (condition === 'osteoporosis') {
        vitamins.vitaminD *= 1.5;
        vitamins.vitaminK *= 1.2;
      }
      if (condition === 'anemia') {
        vitamins.vitaminC *= 1.3; // Enhances iron absorption
        vitamins.folate *= 1.2;
        vitamins.vitaminB12 *= 1.2;
      }
    });

    // Round values
    Object.keys(vitamins).forEach(key => {
      vitamins[key] = Math.round(vitamins[key] * 10) / 10;
    });

    return vitamins;
  }

  /**
   * Calculate mineral needs
   * @param {string} gender - Gender
   * @param {number} age - Age
   * @param {string} pregnancy - Pregnancy stage
   * @param {string} lactation - Lactation status
   * @param {Array} healthConditions - Health conditions
   * @returns {Object} Mineral requirements
   */
  calculateMineralNeeds(gender, age, pregnancy, lactation, healthConditions) {
    // Base values for adult male
    let minerals = {
      calcium: 1000,    // mg/day
      iron: 8,          // mg/day
      magnesium: 400,   // mg/day
      zinc: 11,         // mg/day
      potassium: 3400,  // mg/day
      sodium: 1500,     // mg/day
      phosphorus: 700,  // mg/day
      selenium: 55,     // μg/day
      copper: 900,      // μg/day
      manganese: 2.3,   // mg/day
      chromium: 35,     // μg/day
      molybdenum: 45    // μg/day
    };

    // Adjust for gender and age
    if (gender === 'female') {
      if (age < 19) {
        minerals = {
          calcium: 1300, iron: 15, magnesium: 360, zinc: 9, potassium: 2300, sodium: 1500,
          phosphorus: 1250, selenium: 55, copper: 890, manganese: 1.6, chromium: 24, molybdenum: 43
        };
      } else if (age < 51) {
        minerals = {
          calcium: 1000, iron: 18, magnesium: 310, zinc: 8, potassium: 2600, sodium: 1500,
          phosphorus: 700, selenium: 55, copper: 900, manganese: 1.8, chromium: 25, molybdenum: 45
        };
      } else {
        minerals = {
          calcium: 1200, iron: 8, magnesium: 320, zinc: 8, potassium: 2600, sodium: 1500,
          phosphorus: 700, selenium: 55, copper: 900, manganese: 1.8, chromium: 20, molybdenum: 45
        };
      }

      // Adjust for pregnancy
      if (pregnancy !== 'none') {
        minerals.calcium = age < 19 ? 1300 : 1000;
        minerals.iron = 27; // Significant increase during pregnancy
        minerals.magnesium = age < 19 ? 400 : 350;
        minerals.zinc = age < 19 ? 12 : 11;
        minerals.potassium = 2900;
        minerals.sodium = 1500;
        minerals.phosphorus = age < 19 ? 1250 : 700;
        minerals.selenium = 60;
        minerals.copper = 1000;
        minerals.manganese = 2.0;
        minerals.chromium = 29;
        minerals.molybdenum = 50;
      }

      // Adjust for lactation
      if (lactation !== 'none') {
        minerals.calcium = age < 19 ? 1300 : 1000;
        minerals.iron = age < 19 ? 10 : 9;
        minerals.magnesium = age < 19 ? 360 : 310;
        minerals.zinc = age < 19 ? 13 : 12;
        minerals.potassium = 2900;
        minerals.sodium = 1500;
        minerals.phosphorus = age < 19 ? 1250 : 700;
        minerals.selenium = 70;
        minerals.copper = 1300;
        minerals.manganese = 2.6;
        minerals.chromium = 44;
        minerals.molybdenum = 50;
      }
    } else {
      // Male age adjustments
      if (age < 19) {
        minerals.calcium = 1300;
        minerals.iron = 11;
        minerals.magnesium = 410;
        minerals.zinc = 11;
        minerals.potassium = 3000;
        minerals.phosphorus = 1250;
        minerals.selenium = 55;
        minerals.copper = 890;
        minerals.manganese = 2.2;
        minerals.chromium = 35;
        minerals.molybdenum = 43;
      } else if (age >= 51 && age < 71) {
        minerals.calcium = 1000;
        minerals.magnesium = 420;
      } else if (age >= 71) {
        minerals.calcium = 1200;
        minerals.magnesium = 420;
      }
    }

    // Health condition adjustments
    healthConditions.forEach(condition => {
      const adjustment = this.healthConditionAdjustments[condition];
      if (adjustment) {
        if (adjustment.sodium) minerals.sodium *= adjustment.sodium;
        if (adjustment.potassium) minerals.potassium *= adjustment.potassium;
        if (adjustment.calcium) minerals.calcium *= adjustment.calcium;
      }
      
      if (condition === 'osteoporosis') {
        minerals.calcium *= 1.2;
        minerals.magnesium *= 1.1;
      }
      if (condition === 'hypertension') {
        minerals.sodium *= 0.7; // Reduce sodium
        minerals.potassium *= 1.1; // Increase potassium
      }
      if (condition === 'anemia') {
        minerals.iron *= 1.5;
        minerals.copper *= 1.1;
      }
    });

    // Round values
    Object.keys(minerals).forEach(key => {
      minerals[key] = Math.round(minerals[key]);
    });

    return minerals;
  }

  /**
   * Calculate water needs
   * @param {number} weight - Weight in kg
   * @param {string} activityLevel - Activity level
   * @param {string} pregnancy - Pregnancy stage
   * @param {string} lactation - Lactation status
   * @returns {number} Daily water needs in ml
   */
  calculateWaterNeeds(weight, activityLevel, pregnancy, lactation) {
    // Base water needs: 35ml per kg of body weight
    let waterNeeds = weight * 35;

    // Adjust for activity level
    const activityAdjustment = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      extra: 1.4
    };

    waterNeeds *= activityAdjustment[activityLevel] || 1.0;

    // Adjust for pregnancy
    if (pregnancy !== 'none') {
      waterNeeds += 300; // Additional 300ml during pregnancy
    }

    // Adjust for lactation
    if (lactation !== 'none') {
      if (lactation === 'exclusive') {
        waterNeeds += 700; // Additional 700ml for exclusive breastfeeding
      } else {
        waterNeeds += 400; // Additional 400ml for partial breastfeeding
      }
    }

    return waterNeeds;
  }

  /**
   * Generate personalized recommendations
   * @param {string} gender - Gender
   * @param {number} age - Age
   * @param {string} pregnancy - Pregnancy stage
   * @param {string} lactation - Lactation status
   * @param {Array} healthConditions - Health conditions
   * @param {string} dietType - Diet type
   * @returns {Array} Recommendations
   */
  generateRecommendations(gender, age, pregnancy, lactation, healthConditions, dietType) {
    const recommendations = [];

    // Age-specific recommendations
    if (age >= 65) {
      recommendations.push('Consider vitamin B12 supplementation as absorption may decrease with age');
      recommendations.push('Ensure adequate vitamin D intake for bone health');
      recommendations.push('Include protein-rich foods to maintain muscle mass');
    }

    // Gender-specific recommendations
    if (gender === 'female' && age >= 19 && age <= 50) {
      recommendations.push('Focus on iron-rich foods to meet higher iron needs');
      recommendations.push('Include folate-rich foods in case of future pregnancy');
    }

    // Pregnancy recommendations
    if (pregnancy !== 'none') {
      recommendations.push('Take a prenatal vitamin with folic acid to prevent birth defects');
      recommendations.push('Include iron-rich foods and consider iron supplementation');
      recommendations.push('Ensure adequate calcium intake for fetal bone development');
      recommendations.push('Consume omega-3 fatty acids for fetal brain development');
    }

    // Lactation recommendations
    if (lactation !== 'none') {
      recommendations.push('Continue prenatal vitamins during breastfeeding');
      recommendations.push('Increase fluid intake to support milk production');
      recommendations.push('Include calcium-rich foods to maintain bone health');
    }

    // Diet-specific recommendations
    if (dietType === 'vegan' || dietType === 'vegetarian') {
      recommendations.push('Consider vitamin B12 supplementation');
      recommendations.push('Combine plant proteins to ensure complete amino acid profiles');
      recommendations.push('Include iron-rich plant foods with vitamin C for better absorption');
    }

    if (dietType === 'keto') {
      recommendations.push('Monitor electrolyte balance, especially sodium and potassium');
      recommendations.push('Include nutrient-dense, low-carb vegetables');
      recommendations.push('Consider magnesium supplementation');
    }

    // Health condition recommendations
    healthConditions.forEach(condition => {
      switch (condition) {
        case 'diabetes':
          recommendations.push('Focus on complex carbohydrates and fiber-rich foods');
          recommendations.push('Monitor carbohydrate intake and timing');
          break;
        case 'hypertension':
          recommendations.push('Limit sodium intake and increase potassium-rich foods');
          recommendations.push('Follow the DASH diet pattern');
          break;
        case 'heart_disease':
          recommendations.push('Limit saturated and trans fats');
          recommendations.push('Include omega-3 fatty acids from fish or supplements');
          break;
        case 'osteoporosis':
          recommendations.push('Ensure adequate calcium and vitamin D intake');
          recommendations.push('Include weight-bearing exercises');
          break;
        case 'kidney_disease':
          recommendations.push('Monitor protein and potassium intake');
          recommendations.push('Work with a registered dietitian');
          break;
      }
    });

    // General recommendations
    recommendations.push('Eat a variety of nutrient-dense foods from all food groups');
    recommendations.push('Stay hydrated throughout the day');
    recommendations.push('Consult with a healthcare provider before making significant dietary changes');

    return recommendations;
  }

  /**
   * Get height in centimeters
   * @param {Object} formData - Form data
   * @returns {number} Height in cm
   */
  getHeightInCm(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height) || 0;
    } else {
      const feet = parseFloat(formData.heightFeet) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 30.48) + (inches * 2.54);
    }
  }

  /**
   * Get weight in kilograms
   * @param {Object} formData - Form data
   * @returns {number} Weight in kg
   */
  getWeightInKg(formData) {
    const weight = parseFloat(formData.weight) || 0;
    return formData.weightUnit === 'kg' ? weight : weight * 0.453592;
  }

  /**
   * Format height for display
   * @param {Object} formData - Form data
   * @returns {string} Formatted height
   */
  formatHeight(formData) {
    if (formData.heightUnit === 'cm') {
      return `${formData.height} cm`;
    } else {
      return `${formData.heightFeet}'${formData.heightInches}"`;
    }
  }

  /**
   * Format weight for display
   * @param {Object} formData - Form data
   * @returns {string} Formatted weight
   */
  formatWeight(formData) {
    return `${formData.weight} ${formData.weightUnit}`;
  }

  /**
   * Get activity level text
   * @param {string} level - Activity level code
   * @returns {string} Activity level description
   */
  getActivityLevelText(level) {
    const descriptions = {
      sedentary: 'Sedentary (little or no exercise)',
      light: 'Lightly active (light exercise 1-3 days/week)',
      moderate: 'Moderately active (moderate exercise 3-5 days/week)',
      active: 'Very active (hard exercise 6-7 days/week)',
      extra: 'Extra active (very hard exercise & physical job)'
    };
    return descriptions[level] || level;
  }

  /**
   * Validate form inputs
   * @param {Object} formData - Form data
   * @returns {Object} Validation result
   */
  validateInputs(formData) {
    const errors = [];

    if (!formData.gender) {
      errors.push('Please select your gender.');
    }

    const age = parseInt(formData.age);
    if (!age || age < 1 || age > 120) {
      errors.push('Please enter a valid age between 1 and 120.');
    }

    if (formData.heightUnit === 'cm') {
      const height = parseFloat(formData.height);
      if (!height || height < 50 || height > 250) {
        errors.push('Please enter a valid height between 50-250 cm.');
      }
    } else {
      const feet = parseFloat(formData.heightFeet);
      const inches = parseFloat(formData.heightInches);
      if (!feet || feet < 2 || feet > 8) {
        errors.push('Please enter a valid height in feet (2-8).');
      }
      if (inches === undefined || inches < 0 || inches >= 12) {
        errors.push('Please enter valid inches (0-11).');
      }
    }

    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) {
      errors.push('Please enter a valid weight.');
    }

    if (!formData.activityLevel) {
      errors.push('Please select your activity level.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Compare DRI values between different profiles
   * @param {Object} currentResults - Current user's results
   * @param {Object} compareData - Comparison profile data
   * @returns {Object} Comparison results
   */
  compareDRI(currentResults, compareData) {
    const compareResults = this.calculate(compareData);
    
    return {
      current: currentResults,
      comparison: compareResults,
      differences: this.calculateDifferences(currentResults, compareResults)
    };
  }

  /**
   * Calculate percentage differences between two DRI profiles
   * @param {Object} current - Current results
   * @param {Object} comparison - Comparison results
   * @returns {Object} Percentage differences
   */
  calculateDifferences(current, comparison) {
    const calculatePercentDiff = (val1, val2) => {
      return val2 !== 0 ? Math.round(((val1 - val2) / val2) * 100) : 0;
    };

    return {
      energy: calculatePercentDiff(current.energy, comparison.energy),
      protein: calculatePercentDiff(current.macros.protein.grams, comparison.macros.protein.grams),
      carbs: calculatePercentDiff(current.macros.carbs.grams, comparison.macros.carbs.grams),
      fat: calculatePercentDiff(current.macros.fat.grams, comparison.macros.fat.grams),
      vitaminC: calculatePercentDiff(current.vitamins.vitaminC, comparison.vitamins.vitaminC),
      calcium: calculatePercentDiff(current.minerals.calcium, comparison.minerals.calcium),
      iron: calculatePercentDiff(current.minerals.iron, comparison.minerals.iron)
    };
  }
}

export default DRICalculatorLogic;
