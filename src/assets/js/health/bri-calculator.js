/**
 * BRI (Body Roundness Index) Calculator Logic
 * Handles all BRI-related calculations including body composition analysis,
 * health risk assessment, body shape determination, and personalized recommendations.
 */

class BRICalculatorLogic {
  constructor() {
    this.riskCategories = {
      veryLow: { min: 0, max: 1, label: 'Very Low', color: '#4caf50' },
      low: { min: 1, max: 2, label: 'Low', color: '#8bc34a' },
      moderate: { min: 2, max: 3, label: 'Moderate', color: '#ffc107' },
      high: { min: 3, max: 4, label: 'High', color: '#ff9800' },
      veryHigh: { min: 4, max: Infinity, label: 'Very High', color: '#f44336' }
    };

    this.bodyShapeThresholds = {
      male: { pear: 0.85, avocado: 0.95 },
      female: { pear: 0.75, avocado: 0.85 }
    };

    this.healthRiskFactors = {
      waistHeightRatio: { threshold: 0.6, impact: 'moderate' },
      bmiObesity: { threshold: 30, impact: 'high' },
      ageRisk: { threshold: 50, impact: 'moderate' }
    };
  }

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @returns {Object} BRI calculation results
   */
  calculate(formData) {
    const gender = formData.gender;
    const age = parseInt(formData.age);
    const heightCm = this.getHeightInCm(formData);
    const weightKg = this.getWeightInKg(formData);
    const waistCm = this.getWaistInCm(formData);
    const hipCm = this.getHipInCm(formData);

    // Calculate all metrics
    const bri = this.calculateBRI(heightCm, waistCm);
    const bmi = this.calculateBMI(weightKg, heightCm);
    const whtr = this.calculateWHTR(waistCm, heightCm);
    const whr = this.calculateWHR(waistCm, hipCm);

    // Determine body shape and health risk
    const bodyShape = this.determineBodyShape(gender, whr);
    const healthRisk = this.determineHealthRisk(bri, bmi, whtr, whr, gender, age);
    const riskCategory = this.getRiskCategory(bri);

    // Generate recommendations
    const recommendations = this.generateRecommendations(bri, bmi, whtr, whr, healthRisk, age, gender);

    // Calculate additional metrics
    const additionalMetrics = this.calculateAdditionalMetrics(weightKg, heightCm, waistCm, hipCm, age, gender);

    return {
      userInfo: {
        gender,
        age,
        height: this.formatHeight(formData),
        weight: this.formatWeight(formData),
        waist: this.formatWaist(formData),
        hip: this.formatHip(formData)
      },
      primaryMetrics: {
        bri: Math.round(bri * 100) / 100,
        bmi: Math.round(bmi * 10) / 10,
        whtr: Math.round(whtr * 100) / 100,
        whr: Math.round(whr * 100) / 100
      },
      bodyShape,
      healthRisk,
      riskCategory,
      recommendations,
      additionalMetrics
    };
  }

  /**
   * Calculate Body Roundness Index (BRI)
   * @param {number} heightCm - Height in centimeters
   * @param {number} waistCm - Waist circumference in centimeters
   * @returns {number} BRI value
   */
  calculateBRI(heightCm, waistCm) {
    const heightM = heightCm / 100;
    const waistM = waistCm / 100;
    
    // Calculate the eccentricity using the BRI formula
    const ratio = waistM / (2 * Math.PI * heightM);
    const eccentricity = Math.sqrt(1 - Math.pow(ratio, 2));
    
    // Calculate BRI: 364.2 - 365.5 * sqrt(1 - (waist/(2*π*height))^2)
    const bri = 364.2 - (365.5 * eccentricity);
    
    return Math.max(0, bri); // Ensure non-negative value
  }

  /**
   * Calculate Body Mass Index (BMI)
   * @param {number} weightKg - Weight in kilograms
   * @param {number} heightCm - Height in centimeters
   * @returns {number} BMI value
   */
  calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  /**
   * Calculate Waist-to-Height Ratio (WHtR)
   * @param {number} waistCm - Waist circumference in centimeters
   * @param {number} heightCm - Height in centimeters
   * @returns {number} WHtR value
   */
  calculateWHTR(waistCm, heightCm) {
    return waistCm / heightCm;
  }

  /**
   * Calculate Waist-to-Hip Ratio (WHR)
   * @param {number} waistCm - Waist circumference in centimeters
   * @param {number} hipCm - Hip circumference in centimeters
   * @returns {number} WHR value
   */
  calculateWHR(waistCm, hipCm) {
    return waistCm / hipCm;
  }

  /**
   * Determine body shape based on WHR and gender
   * @param {string} gender - Gender (male/female)
   * @param {number} whr - Waist-to-hip ratio
   * @returns {Object} Body shape information
   */
  determineBodyShape(gender, whr) {
    const thresholds = this.bodyShapeThresholds[gender];
    let shape, description, characteristics;

    if (whr < thresholds.pear) {
      shape = 'Pear';
      description = 'Lower body fat distribution';
      characteristics = 'Fat storage primarily in hips, thighs, and buttocks. Generally lower cardiovascular risk.';
    } else if (whr < thresholds.avocado) {
      shape = 'Avocado';
      description = 'Balanced fat distribution';
      characteristics = 'Even distribution of body fat. Moderate cardiovascular risk.';
    } else {
      shape = 'Apple';
      description = 'Upper body fat distribution';
      characteristics = 'Fat storage primarily in abdomen and waist. Higher cardiovascular risk.';
    }

    return {
      shape,
      description,
      characteristics,
      whr: Math.round(whr * 100) / 100
    };
  }

  /**
   * Determine health risk based on multiple factors
   * @param {number} bri - Body Roundness Index
   * @param {number} bmi - Body Mass Index
   * @param {number} whtr - Waist-to-height ratio
   * @param {number} whr - Waist-to-hip ratio
   * @param {string} gender - Gender
   * @param {number} age - Age
   * @returns {Object} Health risk assessment
   */
  determineHealthRisk(bri, bmi, whtr, whr, gender, age) {
    // Primary assessment based on BRI
    let risk = this.getRiskCategory(bri).label;
    let level = this.getRiskLevel(bri);
    let factors = [];

    // Adjust based on other factors
    if (whtr > this.healthRiskFactors.waistHeightRatio.threshold) {
      factors.push('High waist-to-height ratio');
      if (risk === 'Low') risk = 'Moderate';
      else if (risk === 'Very Low') risk = 'Low';
    }

    if (bmi >= this.healthRiskFactors.bmiObesity.threshold) {
      factors.push('Obesity (BMI ≥ 30)');
      if (risk === 'Low') risk = 'Moderate';
      else if (risk === 'Moderate') risk = 'High';
    }

    if (age >= this.healthRiskFactors.ageRisk.threshold) {
      factors.push('Age-related risk factors');
    }

    // Gender-specific adjustments
    if (gender === 'male' && whr > 0.95) {
      factors.push('High waist-to-hip ratio (male)');
    } else if (gender === 'female' && whr > 0.85) {
      factors.push('High waist-to-hip ratio (female)');
    }

    return {
      risk,
      level,
      factors,
      score: this.calculateRiskScore(bri, bmi, whtr, whr, age)
    };
  }

  /**
   * Get risk category based on BRI value
   * @param {number} bri - BRI value
   * @returns {Object} Risk category information
   */
  getRiskCategory(bri) {
    for (const [key, category] of Object.entries(this.riskCategories)) {
      if (bri >= category.min && bri < category.max) {
        return {
          key,
          ...category,
          range: `${category.min}-${category.max === Infinity ? '∞' : category.max}`
        };
      }
    }
    return this.riskCategories.veryHigh;
  }

  /**
   * Get risk level description
   * @param {number} bri - BRI value
   * @returns {string} Risk level description
   */
  getRiskLevel(bri) {
    if (bri < 1) return 'Excellent health profile';
    if (bri < 2) return 'Good health profile';
    if (bri < 3) return 'Increased health risk';
    if (bri < 4) return 'High health risk';
    return 'Very high health risk';
  }

  /**
   * Calculate overall risk score (0-100)
   * @param {number} bri - BRI value
   * @param {number} bmi - BMI value
   * @param {number} whtr - WHtR value
   * @param {number} whr - WHR value
   * @param {number} age - Age
   * @returns {number} Risk score (0-100)
   */
  calculateRiskScore(bri, bmi, whtr, whr, age) {
    let score = 0;

    // BRI contribution (40% of score)
    score += Math.min(bri * 10, 40);

    // BMI contribution (25% of score)
    if (bmi >= 30) score += 25;
    else if (bmi >= 25) score += 15;
    else if (bmi >= 18.5) score += 5;

    // WHtR contribution (20% of score)
    if (whtr > 0.6) score += 20;
    else if (whtr > 0.5) score += 10;

    // Age contribution (10% of score)
    if (age >= 65) score += 10;
    else if (age >= 50) score += 5;

    // WHR contribution (5% of score)
    if (whr > 0.9) score += 5;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate additional body composition metrics
   * @param {number} weightKg - Weight in kg
   * @param {number} heightCm - Height in cm
   * @param {number} waistCm - Waist in cm
   * @param {number} hipCm - Hip in cm
   * @param {number} age - Age
   * @param {string} gender - Gender
   * @returns {Object} Additional metrics
   */
  calculateAdditionalMetrics(weightKg, heightCm, waistCm, hipCm, age, gender) {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    // Body Surface Area (BSA) using Mosteller formula
    const bsa = Math.sqrt((heightCm * weightKg) / 3600);
    
    // Ideal weight range (BMI 18.5-24.9)
    const idealWeightMin = 18.5 * (heightM * heightM);
    const idealWeightMax = 24.9 * (heightM * heightM);
    
    // Weight difference from ideal
    const weightDifference = weightKg - ((idealWeightMin + idealWeightMax) / 2);
    
    // Body volume estimation (simplified)
    const bodyVolume = (weightKg / 1000) * 0.001; // Rough estimation in cubic meters
    
    // Metabolic age estimation (simplified)
    const metabolicAge = this.estimateMetabolicAge(bmi, waistCm, heightCm, age, gender);
    
    return {
      bsa: Math.round(bsa * 100) / 100,
      idealWeightRange: {
        min: Math.round(idealWeightMin * 10) / 10,
        max: Math.round(idealWeightMax * 10) / 10
      },
      weightDifference: Math.round(weightDifference * 10) / 10,
      bodyVolume: Math.round(bodyVolume * 1000) / 1000,
      metabolicAge: Math.round(metabolicAge)
    };
  }

  /**
   * Estimate metabolic age based on body composition
   * @param {number} bmi - BMI value
   * @param {number} waistCm - Waist circumference
   * @param {number} heightCm - Height
   * @param {number} chronologicalAge - Actual age
   * @param {string} gender - Gender
   * @returns {number} Estimated metabolic age
   */
  estimateMetabolicAge(bmi, waistCm, heightCm, chronologicalAge, gender) {
    let metabolicAge = chronologicalAge;
    
    // Adjust based on BMI
    if (bmi < 18.5) metabolicAge += 2; // Underweight
    else if (bmi > 30) metabolicAge += 5; // Obese
    else if (bmi > 25) metabolicAge += 2; // Overweight
    
    // Adjust based on waist circumference
    const waistHeightRatio = waistCm / heightCm;
    if (waistHeightRatio > 0.6) metabolicAge += 3;
    else if (waistHeightRatio < 0.4) metabolicAge -= 2;
    
    // Gender adjustments
    if (gender === 'female' && waistCm > 88) metabolicAge += 2;
    else if (gender === 'male' && waistCm > 102) metabolicAge += 2;
    
    return Math.max(18, Math.min(metabolicAge, 80)); // Clamp between 18-80
  }

  /**
   * Generate personalized recommendations
   * @param {number} bri - BRI value
   * @param {number} bmi - BMI value
   * @param {number} whtr - WHtR value
   * @param {number} whr - WHR value
   * @param {Object} healthRisk - Health risk assessment
   * @param {number} age - Age
   * @param {string} gender - Gender
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(bri, bmi, whtr, whr, healthRisk, age, gender) {
    const recommendations = [];

    // BRI-specific recommendations
    if (bri < 1) {
      recommendations.push({
        category: 'Maintenance',
        title: '🌟 Excellent Body Composition',
        items: [
          'Maintain your current healthy lifestyle',
          'Continue regular physical activity (150+ min/week)',
          'Keep following a balanced, nutrient-rich diet',
          'Regular health check-ups for monitoring'
        ]
      });
    } else if (bri < 2) {
      recommendations.push({
        category: 'Optimization',
        title: '✅ Good Body Composition',
        items: [
          'Aim for 150-300 minutes of moderate exercise weekly',
          'Include both cardio and strength training',
          'Focus on whole foods, lean proteins, fruits, and vegetables',
          'Monitor waist circumference regularly',
          'Limit processed foods and added sugars'
        ]
      });
    } else if (bri < 3) {
      recommendations.push({
        category: 'Improvement',
        title: '⚠️ Moderate Health Risk',
        items: [
          'Consult with a healthcare provider about your body composition',
          'Target waist reduction through diet and exercise',
          'Increase physical activity to 300+ minutes per week',
          'Consider working with a nutritionist',
          'Monitor blood pressure and blood sugar levels'
        ]
      });
    } else {
      recommendations.push({
        category: 'Action Required',
        title: '🚨 High Health Risk - Take Action',
        items: [
          'Schedule an appointment with your healthcare provider immediately',
          'Request screening for diabetes and cardiovascular disease',
          'Work with a healthcare team (doctor, nutritionist, trainer)',
          'Start with gentle, regular physical activity',
          'Focus on sustainable dietary changes',
          'Set realistic, gradual weight loss goals'
        ]
      });
    }

    // Additional specific recommendations
    if (bmi >= 30) {
      recommendations.push({
        category: 'Weight Management',
        title: '📊 BMI Consideration',
        items: [
          'Your BMI indicates obesity - consider comprehensive weight management',
          'Focus on sustainable lifestyle changes rather than quick fixes',
          'Consider medical supervision for weight loss'
        ]
      });
    }

    if (whtr > 0.6) {
      recommendations.push({
        category: 'Waist Reduction',
        title: '🎯 Waist Circumference Focus',
        items: [
          'High waist-to-height ratio increases health risks',
          'Focus on abdominal fat reduction through targeted exercises',
          'Consider stress management techniques',
          'Limit alcohol consumption'
        ]
      });
    }

    if (age >= 50) {
      recommendations.push({
        category: 'Age-Specific',
        title: '🎂 Age-Related Considerations',
        items: [
          'Focus on maintaining muscle mass through strength training',
          'Ensure adequate calcium and vitamin D intake for bone health',
          'Consider regular health screenings',
          'Maintain social connections and mental health'
        ]
      });
    }

    // General recommendations
    recommendations.push({
      category: 'General Health',
      title: '💡 General Recommendations',
      items: [
        'Stay hydrated throughout the day',
        'Get adequate sleep (7-9 hours per night)',
        'Manage stress through relaxation techniques',
        'Avoid smoking and limit alcohol consumption',
        'Regular health check-ups and screenings'
      ]
    });

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
   * Get waist circumference in centimeters
   * @param {Object} formData - Form data
   * @returns {number} Waist in cm
   */
  getWaistInCm(formData) {
    const waist = parseFloat(formData.waist) || 0;
    return formData.waistUnit === 'cm' ? waist : waist * 2.54;
  }

  /**
   * Get hip circumference in centimeters
   * @param {Object} formData - Form data
   * @returns {number} Hip in cm
   */
  getHipInCm(formData) {
    const hip = parseFloat(formData.hip) || 0;
    return formData.hipUnit === 'cm' ? hip : hip * 2.54;
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
   * Format waist for display
   * @param {Object} formData - Form data
   * @returns {string} Formatted waist
   */
  formatWaist(formData) {
    return `${formData.waist} ${formData.waistUnit}`;
  }

  /**
   * Format hip for display
   * @param {Object} formData - Form data
   * @returns {string} Formatted hip
   */
  formatHip(formData) {
    return `${formData.hip} ${formData.hipUnit}`;
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
    if (!age || age < 18 || age > 120) {
      errors.push('Age must be between 18 and 120 years.');
    }

    // Height validation
    if (formData.heightUnit === 'cm') {
      const height = parseFloat(formData.height);
      if (!height || height < 100 || height > 250) {
        errors.push('Height must be between 100 and 250 cm.');
      }
    } else {
      const feet = parseFloat(formData.heightFeet);
      const inches = parseFloat(formData.heightInches);
      if (!feet || feet < 3 || feet > 8) {
        errors.push('Height must be between 3 and 8 feet.');
      }
      if (inches === undefined || inches < 0 || inches > 11) {
        errors.push('Inches must be between 0 and 11.');
      }
    }

    // Weight validation
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) {
      errors.push('Please enter a valid weight.');
    } else {
      const weightKg = formData.weightUnit === 'kg' ? weight : weight * 0.453592;
      if (weightKg < 30 || weightKg > 300) {
        errors.push('Weight must be between 30-300 kg or 66-660 lbs.');
      }
    }

    // Waist validation
    const waist = parseFloat(formData.waist);
    if (!waist || waist <= 0) {
      errors.push('Please enter a valid waist circumference.');
    } else {
      const waistCm = formData.waistUnit === 'cm' ? waist : waist * 2.54;
      if (waistCm < 40 || waistCm > 200) {
        errors.push('Waist circumference must be between 40-200 cm or 16-80 inches.');
      }
    }

    // Hip validation
    const hip = parseFloat(formData.hip);
    if (!hip || hip <= 0) {
      errors.push('Please enter a valid hip circumference.');
    } else {
      const hipCm = formData.hipUnit === 'cm' ? hip : hip * 2.54;
      if (hipCm < 40 || hipCm > 200) {
        errors.push('Hip circumference must be between 40-200 cm or 16-80 inches.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get chart data for visualization
   * @param {number} bri - BRI value
   * @returns {Object} Chart data
   */
  getChartData(bri) {
    const categories = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    const ranges = ['< 1', '1-2', '2-3', '3-4', '> 4'];
    const colors = [
      'rgba(76, 175, 80, 0.8)',
      'rgba(139, 195, 74, 0.8)',
      'rgba(255, 193, 7, 0.8)',
      'rgba(255, 152, 0, 0.8)',
      'rgba(244, 67, 54, 0.8)'
    ];

    // Determine user's category
    let userCategoryIndex = 0;
    if (bri >= 1 && bri < 2) userCategoryIndex = 1;
    else if (bri >= 2 && bri < 3) userCategoryIndex = 2;
    else if (bri >= 3 && bri < 4) userCategoryIndex = 3;
    else if (bri >= 4) userCategoryIndex = 4;

    return {
      labels: categories.map((cat, index) => `${cat}\n(${ranges[index]})`),
      backgroundData: [1, 2, 3, 4, 5],
      userData: categories.map((_, index) => index === userCategoryIndex ? bri : 0),
      colors,
      userCategoryIndex
    };
  }
}

export default BRICalculatorLogic;
