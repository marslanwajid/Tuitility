/**
 * Diabetes Risk Calculator Logic
 * Handles all diabetes risk-related calculations including risk scoring,
 * BMI analysis, personalized recommendations, and risk visualization.
 */

class DiabetesRiskCalculatorLogic {
  constructor() {
    this.riskCategories = {
      low: { min: 0, max: 6, label: 'Low', color: '#2ecc71', percentage: '1 in 100' },
      slightlyElevated: { min: 7, max: 11, label: 'Slightly Elevated', color: '#f1c40f', percentage: '1 in 25' },
      moderate: { min: 12, max: 14, label: 'Moderate', color: '#e67e22', percentage: '1 in 6' },
      high: { min: 15, max: 20, label: 'High', color: '#e74c3c', percentage: '1 in 3' },
      veryHigh: { min: 21, max: 26, label: 'Very High', color: '#8b5cf6', percentage: '1 in 2' }
    };

    this.bmiCategories = {
      normal: { min: 0, max: 25, label: 'Normal', color: '#2ecc71' },
      overweight: { min: 25, max: 30, label: 'Overweight', color: '#f1c40f' },
      obese: { min: 30, max: 100, label: 'Obese', color: '#e74c3c' }
    };

    this.waistCircumferenceRanges = {
      male: [
        { min: 0, max: 94, score: 0, label: '≤ 94 cm (≤ 37 inches)' },
        { min: 94, max: 102, score: 3, label: '94-102 cm (37-40 inches)' },
        { min: 102, max: 1000, score: 4, label: '> 102 cm (> 40 inches)' }
      ],
      female: [
        { min: 0, max: 80, score: 0, label: '≤ 80 cm (≤ 31 inches)' },
        { min: 80, max: 88, score: 3, label: '80-88 cm (31-35 inches)' },
        { min: 88, max: 1000, score: 4, label: '> 88 cm (> 35 inches)' }
      ]
    };
  }

  /**
   * Main calculation method
   * @param {Object} formData - Form input data
   * @returns {Object} Calculation results
   */
  calculate(formData) {
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const height = this.getHeightInCm(formData);
    const weight = parseFloat(formData.weight);
    const waist = parseInt(formData.waist);
    const physicalActivity = parseInt(formData.physicalActivity);
    const diet = parseInt(formData.diet);
    const medication = parseInt(formData.medication);
    const bloodGlucose = parseInt(formData.bloodGlucose);
    const familyDiabetes = parseInt(formData.familyDiabetes);

    // Calculate BMI
    const bmi = this.calculateBMI(height, weight);
    const bmiScore = this.getBMIScore(bmi);
    const bmiCategory = this.getBMICategory(bmi);

    // Calculate age score
    const ageScore = this.getAgeScore(age);

    // Calculate waist score
    const waistScore = this.getWaistScore(waist, gender);

    // Calculate total risk score
    const totalScore = ageScore + bmiScore + waistScore + physicalActivity + diet + medication + bloodGlucose + familyDiabetes;

    // Determine risk level
    const riskLevel = this.getRiskLevel(totalScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(totalScore, riskLevel, bmi, bmiCategory);

    // Get risk breakdown
    const riskBreakdown = this.getRiskBreakdown(ageScore, bmiScore, waistScore, physicalActivity, diet, medication, bloodGlucose, familyDiabetes);

    return {
      totalScore,
      riskLevel,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      riskBreakdown,
      recommendations,
      height,
      weight
    };
  }

  /**
   * Calculate BMI
   * @param {number} height - Height in cm
   * @param {number} weight - Weight in kg
   * @returns {number} BMI value
   */
  calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  /**
   * Get BMI score based on calculated BMI value
   * @param {number} bmiValue - BMI value
   * @returns {number} BMI score
   */
  getBMIScore(bmiValue) {
    if (bmiValue < 25) {
      return 0;
    } else if (bmiValue >= 25 && bmiValue <= 30) {
      return 1;
    } else {
      return 3;
    }
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
   * Get age score based on age value
   * @param {number} age - Age in years
   * @returns {number} Age score
   */
  getAgeScore(age) {
    if (age < 45) {
      return 0;
    } else if (age >= 45 && age <= 54) {
      return 2;
    } else if (age >= 55 && age <= 64) {
      return 3;
    } else {
      return 4;
    }
  }

  /**
   * Get waist circumference score
   * @param {number} waist - Waist circumference in cm
   * @param {string} gender - Gender (male/female)
   * @returns {number} Waist score
   */
  getWaistScore(waist, gender) {
    const ranges = this.waistCircumferenceRanges[gender];
    for (const range of ranges) {
      if (waist >= range.min && waist < range.max) {
        return range.score;
      }
    }
    return 0;
  }

  /**
   * Get risk level based on total score
   * @param {number} totalScore - Total risk score
   * @returns {Object} Risk level information
   */
  getRiskLevel(totalScore) {
    for (const [key, category] of Object.entries(this.riskCategories)) {
      if (totalScore >= category.min && totalScore <= category.max) {
        return {
          name: category.label,
          color: category.color,
          percentage: category.percentage,
          key
        };
      }
    }
    return {
      name: 'Very High',
      color: '#8b5cf6',
      percentage: '1 in 2',
      key: 'veryHigh'
    };
  }

  /**
   * Get risk breakdown for visualization
   * @param {number} ageScore - Age score
   * @param {number} bmiScore - BMI score
   * @param {number} waistScore - Waist score
   * @param {number} physicalActivity - Physical activity score
   * @param {number} diet - Diet score
   * @param {number} medication - Medication score
   * @param {number} bloodGlucose - Blood glucose score
   * @param {number} familyDiabetes - Family diabetes score
   * @returns {Array} Risk breakdown array
   */
  getRiskBreakdown(ageScore, bmiScore, waistScore, physicalActivity, diet, medication, bloodGlucose, familyDiabetes) {
    return [
      { name: 'Age', score: ageScore, maxScore: 4 },
      { name: 'BMI', score: bmiScore, maxScore: 3 },
      { name: 'Waist Circumference', score: waistScore, maxScore: 4 },
      { name: 'Physical Activity', score: physicalActivity, maxScore: 2 },
      { name: 'Diet', score: diet, maxScore: 2 },
      { name: 'Medication', score: medication, maxScore: 2 },
      { name: 'Blood Glucose', score: bloodGlucose, maxScore: 5 },
      { name: 'Family History', score: familyDiabetes, maxScore: 5 }
    ];
  }

  /**
   * Generate personalized recommendations
   * @param {number} score - Total risk score
   * @param {Object} riskLevel - Risk level information
   * @param {number} bmiValue - BMI value
   * @param {Object} bmiCategory - BMI category information
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(score, riskLevel, bmiValue, bmiCategory) {
    const recommendations = [];

    // General recommendation
    recommendations.push({
      type: 'general',
      title: `Your diabetes risk level is ${riskLevel.name}`,
      content: `Your calculated BMI is ${bmiValue.toFixed(1)} kg/m² (${bmiCategory.name}).`
    });

    // Risk-specific recommendations
    if (score < 7) {
      recommendations.push({
        type: 'low-risk',
        title: 'Your current risk of developing type 2 diabetes is low.',
        subtitle: 'To maintain your low risk:',
        items: [
          'Continue your healthy lifestyle habits',
          'Maintain a healthy weight',
          'Stay physically active with at least 30 minutes of activity daily',
          'Keep eating a balanced diet rich in fruits and vegetables'
        ],
        note: 'Consider rechecking your risk every 5 years, or sooner if your health status changes.'
      });
    } else if (score >= 7 && score <= 11) {
      recommendations.push({
        type: 'slightly-elevated',
        title: 'Your risk of developing type 2 diabetes is slightly elevated.',
        subtitle: 'Consider these steps:',
        items: [
          'Aim to lose 5-7% of your body weight if overweight',
          'Increase physical activity to at least 150 minutes per week',
          'Reduce intake of processed foods and sugary beverages',
          'Increase consumption of whole grains, lean proteins, and vegetables'
        ],
        note: 'Consider discussing your risk with a healthcare provider during your next visit.'
      });
    } else if (score >= 12 && score <= 14) {
      recommendations.push({
        type: 'moderate',
        title: 'Your risk of developing type 2 diabetes is moderate.',
        subtitle: 'Take action with these steps:',
        items: [
          'Schedule a check-up with your healthcare provider to discuss your diabetes risk',
          'Ask about getting your blood glucose levels tested',
          'Work on achieving a healthier weight through diet and exercise',
          'Aim for 30 minutes of moderate exercise most days of the week',
          'Consider consulting with a dietitian for personalized nutrition advice'
        ],
        note: 'Regular monitoring of your health is recommended.'
      });
    } else if (score >= 15) {
      recommendations.push({
        type: 'high-risk',
        title: `Your risk of developing type 2 diabetes is ${riskLevel.name.toLowerCase()}.`,
        subtitle: 'Take these important steps:',
        items: [
          'Make an appointment with your healthcare provider soon to discuss your diabetes risk',
          'Request blood glucose testing to check for prediabetes or diabetes',
          'Consider participating in a diabetes prevention program',
          'Make significant lifestyle changes including diet improvements and increased physical activity',
          'Monitor other health conditions like blood pressure and cholesterol',
          'If recommended by your doctor, consider medication options to help prevent diabetes'
        ],
        note: 'Taking action now can significantly reduce your risk of developing type 2 diabetes.'
      });
    }

    // BMI-specific recommendations
    if (bmiValue >= 25) {
      recommendations.push({
        type: 'bmi-recommendation',
        title: 'BMI Recommendation:',
        content: `Your BMI is ${bmiValue.toFixed(1)}, which is ${bmiValue >= 30 ? 'in the obese range' : 'overweight'}.`,
        note: 'Weight loss of 5-10% can significantly reduce your diabetes risk and improve overall health.'
      });
    }

    return recommendations;
  }

  /**
   * Convert height to cm
   * @param {Object} formData - Form data
   * @returns {number} Height in cm
   */
  getHeightInCm(formData) {
    if (formData.heightUnit === 'cm') {
      return parseFloat(formData.height);
    } else {
      const feet = parseFloat(formData.height) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      return (feet * 30.48) + (inches * 2.54);
    }
  }

  /**
   * Validate form inputs
   * @param {Object} formData - Form data
   * @returns {Object} Validation result
   */
  validateInputs(formData) {
    const errors = [];

    const age = parseInt(formData.age);
    if (!age || age < 18 || age > 120) {
      errors.push('Please enter a valid age between 18 and 120.');
    }

    const height = this.getHeightInCm(formData);
    if (!height || height < 100 || height > 250) {
      errors.push('Please enter a valid height between 100-250 cm or 3-8 feet.');
    }

    const weight = parseFloat(formData.weight);
    if (!weight || weight < 30 || weight > 300) {
      errors.push('Please enter a valid weight between 30-300 kg or 66-660 lbs.');
    }

    const waist = parseInt(formData.waist);
    if (!waist || waist < 50 || waist > 200) {
      errors.push('Please select a valid waist circumference range.');
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
    const height = this.getHeightInCm(formData);
    const weight = parseFloat(formData.weight);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const waist = parseInt(formData.waist);

    steps.push({
      step: 1,
      title: 'Calculate BMI',
      description: 'Calculate Body Mass Index from height and weight',
      formula: `BMI = ${weight} kg / (${(height/100).toFixed(2)} m)² = ${this.calculateBMI(height, weight).toFixed(1)}`
    });

    steps.push({
      step: 2,
      title: 'Age Score',
      description: 'Determine age-based risk score',
      formula: `Age ${age}: ${this.getAgeScore(age)} points`
    });

    steps.push({
      step: 3,
      title: 'BMI Score',
      description: 'Determine BMI-based risk score',
      formula: `BMI ${this.calculateBMI(height, weight).toFixed(1)}: ${this.getBMIScore(this.calculateBMI(height, weight))} points`
    });

    steps.push({
      step: 4,
      title: 'Waist Circumference Score',
      description: 'Determine waist circumference-based risk score',
      formula: `Waist ${waist} cm (${gender}): ${this.getWaistScore(waist, gender)} points`
    });

    return steps;
  }
}

export default DiabetesRiskCalculatorLogic;
