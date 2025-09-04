/**
 * Insurance Calculator - JavaScript Logic
 * Handles all insurance calculations including premiums, coverage analysis, and policy comparisons
 */

class InsuranceCalculator {
  constructor() {
    // Default values
    this.maxCoverageAmount = 10000000; // Maximum $10M coverage
    this.minPremiumAmount = 1; // Minimum $1 premium
    this.maxDeductible = 100000; // Maximum $100K deductible
    this.maxAge = 100; // Maximum age
    this.minAge = 18; // Minimum age
  }

  /**
   * Validate all input parameters
   * @param {number} coverageAmount - Coverage amount
   * @param {number} premiumAmount - Premium amount
   * @param {number} deductible - Deductible amount
   * @param {number} policyTerm - Policy term in months
   * @param {string} insuranceType - Type of insurance
   * @param {number} age - Age of insured
   * @param {string} location - Location
   * @param {string} claimsHistory - Claims history
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(coverageAmount, premiumAmount, deductible, policyTerm, insuranceType, age, location, claimsHistory) {
    const errors = [];

    // Validate coverage amount
    if (!coverageAmount || isNaN(coverageAmount) || coverageAmount <= 0 || coverageAmount > this.maxCoverageAmount) {
      errors.push(`Please enter a valid coverage amount between $1 and $${this.maxCoverageAmount.toLocaleString()}.`);
    }

    // Validate premium amount
    if (!premiumAmount || isNaN(premiumAmount) || premiumAmount < this.minPremiumAmount) {
      errors.push(`Please enter a valid premium amount of at least $${this.minPremiumAmount}.`);
    }

    // Validate deductible
    if (deductible === undefined || deductible === null || deductible === '' || isNaN(deductible) || deductible < 0 || deductible > this.maxDeductible) {
      errors.push(`Please enter a valid deductible between $0 and $${this.maxDeductible.toLocaleString()}.`);
    }

    // Validate policy term
    const validTerms = [6, 12, 24, 36];
    if (!validTerms.includes(parseInt(policyTerm))) {
      errors.push('Please select a valid policy term.');
    }

    // Validate insurance type
    const validTypes = ['auto', 'home', 'health', 'life', 'disability', 'renters'];
    if (!validTypes.includes(insuranceType)) {
      errors.push('Please select a valid insurance type.');
    }

    // Validate age (optional)
    if (age && (isNaN(age) || age < this.minAge || age > this.maxAge)) {
      errors.push(`Please enter a valid age between ${this.minAge} and ${this.maxAge}.`);
    }

    // Validate claims history
    const validClaimsHistory = ['none', 'low', 'medium', 'high'];
    if (!validClaimsHistory.includes(claimsHistory)) {
      errors.push('Please select a valid claims history.');
    }

    return errors;
  }

  /**
   * Calculate monthly premium
   * @param {number} annualPremium - Annual premium amount
   * @returns {number} Monthly premium
   */
  calculateMonthlyPremium(annualPremium) {
    return annualPremium / 12;
  }

  /**
   * Calculate total policy cost
   * @param {number} annualPremium - Annual premium amount
   * @param {number} policyTerm - Policy term in months
   * @returns {number} Total policy cost
   */
  calculateTotalPolicyCost(annualPremium, policyTerm) {
    return annualPremium * (policyTerm / 12);
  }

  /**
   * Calculate coverage to premium ratio
   * @param {number} coverageAmount - Coverage amount
   * @param {number} annualPremium - Annual premium amount
   * @returns {number} Coverage to premium ratio
   */
  calculateCoverageToPremiumRatio(coverageAmount, annualPremium) {
    if (annualPremium === 0) return 0;
    return coverageAmount / annualPremium;
  }

  /**
   * Calculate deductible percentage
   * @param {number} deductible - Deductible amount
   * @param {number} coverageAmount - Coverage amount
   * @returns {number} Deductible percentage
   */
  calculateDeductiblePercentage(deductible, coverageAmount) {
    if (coverageAmount === 0) return 0;
    return (deductible / coverageAmount) * 100;
  }

  /**
   * Determine risk level based on various factors
   * @param {string} insuranceType - Type of insurance
   * @param {number} age - Age of insured
   * @param {string} claimsHistory - Claims history
   * @param {string} location - Location
   * @returns {string} Risk level
   */
  determineRiskLevel(insuranceType, age, claimsHistory, location) {
    let riskScore = 0;

    // Age factor
    if (age) {
      if (age < 25) riskScore += 2;
      else if (age < 35) riskScore += 1;
      else if (age > 65) riskScore += 1;
    }

    // Claims history factor
    switch (claimsHistory) {
      case 'none':
        riskScore += 0;
        break;
      case 'low':
        riskScore += 1;
        break;
      case 'medium':
        riskScore += 2;
        break;
      case 'high':
        riskScore += 3;
        break;
    }

    // Location factor (simplified)
    if (location) {
      const highRiskStates = ['Florida', 'California', 'Texas', 'Louisiana'];
      if (highRiskStates.some(state => location.toLowerCase().includes(state.toLowerCase()))) {
        riskScore += 1;
      }
    }

    // Insurance type factor
    switch (insuranceType) {
      case 'auto':
        riskScore += 1;
        break;
      case 'home':
        riskScore += 0;
        break;
      case 'health':
        riskScore += 2;
        break;
      case 'life':
        riskScore += 1;
        break;
      case 'disability':
        riskScore += 2;
        break;
      case 'renters':
        riskScore += 0;
        break;
    }

    // Determine risk level
    if (riskScore <= 2) return 'Low';
    else if (riskScore <= 4) return 'Medium';
    else if (riskScore <= 6) return 'High';
    else return 'Very High';
  }

  /**
   * Calculate value rating based on coverage and cost
   * @param {number} coverageAmount - Coverage amount
   * @param {number} annualPremium - Annual premium amount
   * @param {number} deductible - Deductible amount
   * @param {string} insuranceType - Type of insurance
   * @returns {string} Value rating
   */
  calculateValueRating(coverageAmount, annualPremium, deductible, insuranceType) {
    const coverageToPremiumRatio = this.calculateCoverageToPremiumRatio(coverageAmount, annualPremium);
    const deductiblePercentage = this.calculateDeductiblePercentage(deductible, coverageAmount);

    // Different thresholds for different insurance types
    let excellentThreshold, goodThreshold, fairThreshold;

    switch (insuranceType) {
      case 'life':
        excellentThreshold = 500;
        goodThreshold = 200;
        fairThreshold = 100;
        break;
      case 'auto':
        excellentThreshold = 50;
        goodThreshold = 30;
        fairThreshold = 20;
        break;
      case 'home':
        excellentThreshold = 200;
        goodThreshold = 100;
        fairThreshold = 50;
        break;
      case 'health':
        excellentThreshold = 20;
        goodThreshold = 10;
        fairThreshold = 5;
        break;
      case 'disability':
        excellentThreshold = 30;
        goodThreshold = 15;
        fairThreshold = 8;
        break;
      case 'renters':
        excellentThreshold = 100;
        goodThreshold = 50;
        fairThreshold = 25;
        break;
      default:
        excellentThreshold = 50;
        goodThreshold = 25;
        fairThreshold = 10;
    }

    // Adjust for deductible (higher deductible = better value)
    const deductibleAdjustment = deductiblePercentage > 5 ? 1.2 : 1.0;
    const adjustedRatio = coverageToPremiumRatio * deductibleAdjustment;

    if (adjustedRatio >= excellentThreshold) return 'Excellent';
    else if (adjustedRatio >= goodThreshold) return 'Good';
    else if (adjustedRatio >= fairThreshold) return 'Fair';
    else return 'Poor';
  }

  /**
   * Get insurance type display name
   * @param {string} insuranceType - Insurance type code
   * @returns {string} Display name
   */
  getInsuranceTypeDisplayName(insuranceType) {
    const typeNames = {
      'auto': 'Auto Insurance',
      'home': 'Home Insurance',
      'health': 'Health Insurance',
      'life': 'Life Insurance',
      'disability': 'Disability Insurance',
      'renters': 'Renters Insurance'
    };
    return typeNames[insuranceType] || insuranceType;
  }

  /**
   * Main calculation function for insurance
   * @param {number} coverageAmount - Coverage amount
   * @param {number} premiumAmount - Premium amount
   * @param {number} deductible - Deductible amount
   * @param {number} policyTerm - Policy term in months
   * @param {string} insuranceType - Type of insurance
   * @param {number} age - Age of insured
   * @param {string} location - Location
   * @param {string} claimsHistory - Claims history
   * @returns {Object} Comprehensive insurance calculation results
   */
  calculateInsurance(coverageAmount, premiumAmount, deductible, policyTerm, insuranceType, age, location, claimsHistory) {
    // Convert to numbers and validate
    coverageAmount = parseFloat(coverageAmount);
    premiumAmount = parseFloat(premiumAmount);
    deductible = parseFloat(deductible || 0);
    policyTerm = parseInt(policyTerm);
    age = parseInt(age || 0);

    // Calculate basic metrics
    const monthlyPremium = this.calculateMonthlyPremium(premiumAmount);
    const totalPolicyCost = this.calculateTotalPolicyCost(premiumAmount, policyTerm);
    const coverageToPremiumRatio = this.calculateCoverageToPremiumRatio(coverageAmount, premiumAmount);
    const deductiblePercentage = this.calculateDeductiblePercentage(deductible, coverageAmount);

    // Calculate advanced metrics
    const riskLevel = this.determineRiskLevel(insuranceType, age, location, claimsHistory);
    const valueRating = this.calculateValueRating(coverageAmount, premiumAmount, deductible, insuranceType);

    // Format coverage to premium ratio
    const coverageToPremiumRatioFormatted = `${this.roundToCurrency(coverageToPremiumRatio)}:1`;

    return {
      // Input values
      coverageAmount: coverageAmount,
      premiumAmount: premiumAmount,
      deductible: deductible,
      policyTerm: policyTerm,
      insuranceType: this.getInsuranceTypeDisplayName(insuranceType),
      age: age,
      location: location,
      claimsHistory: claimsHistory,

      // Main calculations
      monthlyPremium: this.roundToCurrency(monthlyPremium),
      totalPolicyCost: this.roundToCurrency(totalPolicyCost),
      coverageToPremiumRatio: coverageToPremiumRatioFormatted,
      deductiblePercentage: this.roundToCurrency(deductiblePercentage),
      riskLevel: riskLevel,
      valueRating: valueRating,

      // Formatted values for display
      coverageAmountFormatted: this.formatCurrency(coverageAmount),
      premiumAmountFormatted: this.formatCurrency(premiumAmount),
      deductibleFormatted: this.formatCurrency(deductible),
      monthlyPremiumFormatted: this.formatCurrency(monthlyPremium),
      totalPolicyCostFormatted: this.formatCurrency(totalPolicyCost),
      deductiblePercentageFormatted: this.formatPercentage(deductiblePercentage)
    };
  }

  /**
   * Compare multiple insurance policies
   * @param {Array} policies - Array of policy objects
   * @returns {Object} Policy comparison results
   */
  comparePolicies(policies) {
    const comparisons = policies.map(policy => {
      const result = this.calculateInsurance(
        policy.coverageAmount,
        policy.premiumAmount,
        policy.deductible,
        policy.policyTerm,
        policy.insuranceType,
        policy.age,
        policy.location,
        policy.claimsHistory
      );
      return {
        ...result,
        provider: policy.provider || 'Unknown'
      };
    });

    // Sort by value rating and coverage to premium ratio
    comparisons.sort((a, b) => {
      const valueOrder = { 'Excellent': 4, 'Good': 3, 'Fair': 2, 'Poor': 1 };
      if (valueOrder[a.valueRating] !== valueOrder[b.valueRating]) {
        return valueOrder[b.valueRating] - valueOrder[a.valueRating];
      }
      return parseFloat(b.coverageToPremiumRatio) - parseFloat(a.coverageToPremiumRatio);
    });

    return {
      policies: comparisons,
      bestValue: comparisons[0],
      cheapest: comparisons.reduce((min, policy) => 
        parseFloat(policy.premiumAmount) < parseFloat(min.premiumAmount) ? policy : min
      ),
      highestCoverage: comparisons.reduce((max, policy) => 
        parseFloat(policy.coverageAmount) > parseFloat(max.coverageAmount) ? policy : max
      )
    };
  }

  /**
   * Calculate insurance needs based on income and assets
   * @param {number} annualIncome - Annual income
   * @param {number} totalAssets - Total assets
   * @param {number} totalDebts - Total debts
   * @param {string} insuranceType - Type of insurance
   * @returns {Object} Insurance needs analysis
   */
  calculateInsuranceNeeds(annualIncome, totalAssets, totalDebts, insuranceType) {
    const netWorth = totalAssets - totalDebts;
    let recommendedCoverage = 0;

    switch (insuranceType) {
      case 'life':
        // 10-12 times annual income
        recommendedCoverage = annualIncome * 10;
        break;
      case 'disability':
        // 60-70% of annual income
        recommendedCoverage = annualIncome * 0.65;
        break;
      case 'home':
        // Replacement cost of home
        recommendedCoverage = totalAssets * 0.7; // Assuming home is 70% of assets
        break;
      case 'auto':
        // State minimum + comprehensive coverage
        recommendedCoverage = 100000; // $100K liability + comprehensive
        break;
      case 'health':
        // Based on medical expenses and income
        recommendedCoverage = Math.max(annualIncome * 0.1, 50000);
        break;
      case 'renters':
        // Value of personal belongings
        recommendedCoverage = Math.max(totalAssets * 0.2, 25000);
        break;
    }

    return {
      annualIncome: annualIncome,
      totalAssets: totalAssets,
      totalDebts: totalDebts,
      netWorth: netWorth,
      recommendedCoverage: this.roundToCurrency(recommendedCoverage),
      insuranceType: this.getInsuranceTypeDisplayName(insuranceType)
    };
  }

  /**
   * Round to 2 decimal places (for currency)
   * @param {number} amount - Amount to round
   * @returns {number} Rounded amount
   */
  roundToCurrency(amount) {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage for display
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  formatPercentage(value, decimals = 2) {
    return `${parseFloat(value).toFixed(decimals)}%`;
  }

  /**
   * Get common insurance types and their typical characteristics
   * @returns {Object} Common insurance types with typical rates and coverage
   */
  getCommonInsuranceTypes() {
    return {
      'auto': {
        name: 'Auto Insurance',
        typicalCoverage: 50000,
        typicalPremium: 1200,
        typicalDeductible: 1000,
        description: 'Protects against vehicle accidents, theft, and damage'
      },
      'home': {
        name: 'Home Insurance',
        typicalCoverage: 300000,
        typicalPremium: 1800,
        typicalDeductible: 2500,
        description: 'Covers damage to home and belongings from disasters'
      },
      'health': {
        name: 'Health Insurance',
        typicalCoverage: 100000,
        typicalPremium: 6000,
        typicalDeductible: 5000,
        description: 'Helps pay for medical expenses and healthcare'
      },
      'life': {
        name: 'Life Insurance',
        typicalCoverage: 500000,
        typicalPremium: 600,
        typicalDeductible: 0,
        description: 'Provides financial protection for family in case of death'
      },
      'disability': {
        name: 'Disability Insurance',
        typicalCoverage: 50000,
        typicalPremium: 1200,
        typicalDeductible: 0,
        description: 'Replaces income if unable to work due to illness or injury'
      },
      'renters': {
        name: 'Renters Insurance',
        typicalCoverage: 50000,
        typicalPremium: 300,
        typicalDeductible: 1000,
        description: 'Protects personal belongings and provides liability coverage'
      }
    };
  }
}

// Export for use in React component
export default InsuranceCalculator;
