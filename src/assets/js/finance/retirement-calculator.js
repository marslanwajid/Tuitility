/**
 * Retirement Calculator - JavaScript Logic
 * Handles all retirement planning calculations including savings goals, contributions, and income projections
 */

class RetirementCalculator {
  constructor() {
    // Default values
    this.defaultSafeWithdrawalRate = 0.04; // 4% rule
    this.defaultInflationRate = 0.025; // 2.5% annual inflation
    this.defaultAnnualReturn = 0.07; // 7% annual return
    this.defaultRetirementAge = 65;
    this.defaultSocialSecurityAge = 67;
  }

  /**
   * Validate all input parameters
   * @param {number} currentAge - Current age
   * @param {number} retirementAge - Retirement age
   * @param {number} currentSavings - Current retirement savings
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Expected annual return rate
   * @param {number} inflationRate - Expected inflation rate
   * @param {number} retirementIncome - Desired annual retirement income
   * @param {number} socialSecurity - Expected Social Security benefits
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(currentAge, retirementAge, currentSavings = 0, monthlyContribution = 0, annualReturn, inflationRate = 0, retirementIncome = 0, socialSecurity = 0) {
    const errors = [];

    // Validate current age
    if (!currentAge || isNaN(currentAge) || currentAge < 18 || currentAge > 80) {
      errors.push('Please enter a valid current age between 18 and 80.');
    }

    // Validate retirement age
    if (!retirementAge || isNaN(retirementAge) || retirementAge < 50 || retirementAge > 80) {
      errors.push('Please enter a valid retirement age between 50 and 80.');
    }

    // Check if retirement age is after current age
    if (currentAge && retirementAge && retirementAge <= currentAge) {
      errors.push('Retirement age must be greater than current age.');
    }

    // Validate current savings
    if (currentSavings && (isNaN(currentSavings) || currentSavings < 0)) {
      errors.push('Current savings must be a positive number or zero.');
    }

    // Validate monthly contribution
    if (monthlyContribution && (isNaN(monthlyContribution) || monthlyContribution < 0)) {
      errors.push('Monthly contribution must be a positive number or zero.');
    }

    // Validate annual return
    if (!annualReturn || isNaN(annualReturn) || annualReturn < 0 || annualReturn > 50) {
      errors.push('Please enter a valid annual return rate between 0% and 50%.');
    }

    // Validate inflation rate
    if (inflationRate && (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 20)) {
      errors.push('Inflation rate must be between 0% and 20%.');
    }

    // Validate retirement income
    if (retirementIncome && (isNaN(retirementIncome) || retirementIncome < 0)) {
      errors.push('Desired retirement income must be a positive number or zero.');
    }

    // Validate Social Security
    if (socialSecurity && (isNaN(socialSecurity) || socialSecurity < 0)) {
      errors.push('Social Security benefits must be a positive number or zero.');
    }

    return errors;
  }

  /**
   * Calculate future value of current savings
   * @param {number} currentSavings - Current savings amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} yearsToRetirement - Years until retirement
   * @returns {number} Future value of current savings
   */
  calculateFutureValueOfCurrentSavings(currentSavings, annualReturn, yearsToRetirement) {
    if (currentSavings <= 0 || yearsToRetirement <= 0) return 0;
    return currentSavings * Math.pow(1 + annualReturn, yearsToRetirement);
  }

  /**
   * Calculate future value of monthly contributions
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} yearsToRetirement - Years until retirement
   * @returns {number} Future value of monthly contributions
   */
  calculateFutureValueOfContributions(monthlyContribution, annualReturn, yearsToRetirement) {
    if (monthlyContribution <= 0 || yearsToRetirement <= 0) return 0;
    
    const monthlyRate = annualReturn / 12;
    const totalMonths = yearsToRetirement * 12;
    
    if (monthlyRate === 0) {
      return monthlyContribution * totalMonths;
    }
    
    return monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  }

  /**
   * Calculate total projected savings at retirement
   * @param {number} currentSavings - Current savings amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} yearsToRetirement - Years until retirement
   * @returns {Object} Breakdown of projected savings
   */
  calculateProjectedSavings(currentSavings, monthlyContribution, annualReturn, yearsToRetirement) {
    const futureValueOfCurrentSavings = this.calculateFutureValueOfCurrentSavings(
      currentSavings, annualReturn, yearsToRetirement
    );
    
    const futureValueOfContributions = this.calculateFutureValueOfContributions(
      monthlyContribution, annualReturn, yearsToRetirement
    );
    
    const totalProjectedSavings = futureValueOfCurrentSavings + futureValueOfContributions;
    const totalContributions = monthlyContribution * yearsToRetirement * 12;
    const compoundInterest = totalProjectedSavings - currentSavings - totalContributions;
    
    return {
      currentSavings: currentSavings,
      futureValueOfCurrentSavings: futureValueOfCurrentSavings,
      futureValueOfContributions: futureValueOfContributions,
      totalContributions: totalContributions,
      compoundInterest: compoundInterest,
      totalProjectedSavings: totalProjectedSavings
    };
  }

  /**
   * Calculate retirement savings goal
   * @param {number} desiredAnnualIncome - Desired annual retirement income
   * @param {number} socialSecurityBenefits - Expected Social Security benefits
   * @param {number} safeWithdrawalRate - Safe withdrawal rate (default 4%)
   * @returns {Object} Retirement goal breakdown
   */
  calculateRetirementGoal(desiredAnnualIncome, socialSecurityBenefits, safeWithdrawalRate = this.defaultSafeWithdrawalRate) {
    const requiredFromSavings = Math.max(0, desiredAnnualIncome - socialSecurityBenefits);
    const retirementGoal = requiredFromSavings / safeWithdrawalRate;
    
    return {
      desiredAnnualIncome: desiredAnnualIncome,
      socialSecurityBenefits: socialSecurityBenefits,
      requiredFromSavings: requiredFromSavings,
      safeWithdrawalRate: safeWithdrawalRate,
      retirementGoal: retirementGoal
    };
  }

  /**
   * Calculate required monthly contribution to reach goal
   * @param {number} retirementGoal - Target retirement savings goal
   * @param {number} currentSavings - Current savings amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} yearsToRetirement - Years until retirement
   * @returns {number} Required monthly contribution
   */
  calculateRequiredMonthlyContribution(retirementGoal, currentSavings, annualReturn, yearsToRetirement) {
    if (yearsToRetirement <= 0) return 0;
    
    const futureValueOfCurrentSavings = this.calculateFutureValueOfCurrentSavings(
      currentSavings, annualReturn, yearsToRetirement
    );
    
    const shortfall = Math.max(0, retirementGoal - futureValueOfCurrentSavings);
    
    if (shortfall <= 0) return 0;
    
    const monthlyRate = annualReturn / 12;
    const totalMonths = yearsToRetirement * 12;
    
    if (monthlyRate === 0) {
      return shortfall / totalMonths;
    }
    
    return shortfall / ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  }

  /**
   * Calculate inflation-adjusted values
   * @param {number} amount - Amount to adjust
   * @param {number} inflationRate - Annual inflation rate
   * @param {number} years - Number of years
   * @returns {number} Inflation-adjusted amount
   */
  calculateInflationAdjusted(amount, inflationRate, years) {
    if (amount <= 0 || years <= 0) return amount;
    return amount / Math.pow(1 + inflationRate, years);
  }

  /**
   * Main calculation function for retirement planning
   * @param {number} currentAge - Current age
   * @param {number} retirementAge - Retirement age
   * @param {number} currentSavings - Current retirement savings
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Expected annual return rate
   * @param {number} inflationRate - Expected inflation rate
   * @param {number} retirementIncome - Desired annual retirement income
   * @param {number} socialSecurity - Expected Social Security benefits
   * @returns {Object} Comprehensive retirement calculation results
   */
  calculateRetirement(currentAge, retirementAge, currentSavings = 0, monthlyContribution = 0, annualReturn, inflationRate = 0, retirementIncome = 0, socialSecurity = 0) {
    // Convert to numbers and validate
    currentAge = parseFloat(currentAge);
    retirementAge = parseFloat(retirementAge);
    currentSavings = parseFloat(currentSavings) || 0;
    monthlyContribution = parseFloat(monthlyContribution) || 0;
    annualReturn = parseFloat(annualReturn) / 100; // Convert percentage to decimal
    inflationRate = parseFloat(inflationRate) / 100 || 0; // Convert percentage to decimal
    retirementIncome = parseFloat(retirementIncome) || 0;
    socialSecurity = parseFloat(socialSecurity) || 0;

    const yearsToRetirement = retirementAge - currentAge;
    
    // Calculate projected savings
    const projectedSavings = this.calculateProjectedSavings(
      currentSavings, monthlyContribution, annualReturn, yearsToRetirement
    );
    
    // Calculate retirement goal
    const retirementGoal = this.calculateRetirementGoal(
      retirementIncome, socialSecurity, this.defaultSafeWithdrawalRate
    );
    
    // Calculate required monthly contribution
    const requiredMonthlyContribution = this.calculateRequiredMonthlyContribution(
      retirementGoal.retirementGoal, currentSavings, annualReturn, yearsToRetirement
    );
    
    // Calculate monthly income gap
    const monthlyIncomeGap = Math.max(0, (retirementIncome - socialSecurity) / 12);
    
    // Calculate inflation-adjusted values
    const inflationAdjustedGoal = this.calculateInflationAdjusted(
      retirementGoal.retirementGoal, inflationRate, yearsToRetirement
    );
    
    const inflationAdjustedProjectedSavings = this.calculateInflationAdjusted(
      projectedSavings.totalProjectedSavings, inflationRate, yearsToRetirement
    );
    
    // Calculate savings rate
    const annualContribution = monthlyContribution * 12;
    const savingsRate = annualContribution > 0 ? (annualContribution / (annualContribution / 0.1)) * 100 : 0; // Simplified calculation
    
    return {
      // Basic inputs
      currentAge: currentAge,
      retirementAge: retirementAge,
      yearsToRetirement: yearsToRetirement,
      currentSavings: currentSavings,
      monthlyContribution: monthlyContribution,
      annualReturn: annualReturn * 100, // Convert back to percentage
      inflationRate: inflationRate * 100, // Convert back to percentage
      
      // Projected savings breakdown
      projectedSavings: projectedSavings.totalProjectedSavings,
      futureValueOfCurrentSavings: projectedSavings.futureValueOfCurrentSavings,
      totalContributions: projectedSavings.totalContributions,
      compoundInterest: projectedSavings.compoundInterest,
      
      // Retirement goal analysis
      retirementGoal: retirementGoal.retirementGoal,
      desiredAnnualIncome: retirementIncome,
      socialSecurityBenefits: socialSecurity,
      requiredFromSavings: retirementGoal.requiredFromSavings,
      safeWithdrawalRate: this.defaultSafeWithdrawalRate * 100,
      
      // Gap analysis
      monthlyIncomeGap: monthlyIncomeGap,
      requiredMonthlyContribution: requiredMonthlyContribution,
      savingsGap: Math.max(0, retirementGoal.retirementGoal - projectedSavings.totalProjectedSavings),
      
      // Inflation-adjusted values
      inflationAdjustedGoal: inflationAdjustedGoal,
      inflationAdjustedProjectedSavings: inflationAdjustedProjectedSavings,
      
      // Additional metrics
      savingsRate: savingsRate,
      onTrack: projectedSavings.totalProjectedSavings >= retirementGoal.retirementGoal,
      shortfall: Math.max(0, retirementGoal.retirementGoal - projectedSavings.totalProjectedSavings)
    };
  }

  /**
   * Calculate retirement scenarios with different parameters
   * @param {number} currentAge - Current age
   * @param {number} retirementAge - Retirement age
   * @param {number} currentSavings - Current savings
   * @param {number} annualReturn - Annual return rate
   * @param {number} retirementIncome - Desired retirement income
   * @param {number} socialSecurity - Social Security benefits
   * @returns {Array} Array of scenarios with different contribution amounts
   */
  calculateRetirementScenarios(currentAge, retirementAge, currentSavings, annualReturn, retirementIncome, socialSecurity) {
    const scenarios = [];
    const yearsToRetirement = retirementAge - currentAge;
    const retirementGoal = this.calculateRetirementGoal(retirementIncome, socialSecurity);
    
    // Test different monthly contribution amounts
    const contributionAmounts = [0, 500, 1000, 1500, 2000, 2500, 3000];
    
    contributionAmounts.forEach(contribution => {
      const projectedSavings = this.calculateProjectedSavings(
        currentSavings, contribution, annualReturn / 100, yearsToRetirement
      );
      
      const shortfall = Math.max(0, retirementGoal.retirementGoal - projectedSavings.totalProjectedSavings);
      const onTrack = projectedSavings.totalProjectedSavings >= retirementGoal.retirementGoal;
      
      scenarios.push({
        monthlyContribution: contribution,
        projectedSavings: projectedSavings.totalProjectedSavings,
        shortfall: shortfall,
        onTrack: onTrack,
        requiredContribution: onTrack ? contribution : this.calculateRequiredMonthlyContribution(
          retirementGoal.retirementGoal, currentSavings, annualReturn / 100, yearsToRetirement
        )
      });
    });
    
    return scenarios;
  }

  /**
   * Calculate impact of starting age on retirement savings
   * @param {number} retirementAge - Retirement age
   * @param {number} monthlyContribution - Monthly contribution
   * @param {number} annualReturn - Annual return rate
   * @returns {Array} Array showing impact of different starting ages
   */
  calculateStartingAgeImpact(retirementAge, monthlyContribution, annualReturn) {
    const scenarios = [];
    const startingAges = [25, 30, 35, 40, 45, 50];
    
    startingAges.forEach(startingAge => {
      if (startingAge < retirementAge) {
        const yearsToRetirement = retirementAge - startingAge;
        const projectedSavings = this.calculateProjectedSavings(
          0, monthlyContribution, annualReturn / 100, yearsToRetirement
        );
        
        scenarios.push({
          startingAge: startingAge,
          yearsToRetirement: yearsToRetirement,
          projectedSavings: projectedSavings.totalProjectedSavings,
          totalContributions: projectedSavings.totalContributions,
          compoundInterest: projectedSavings.compoundInterest
        });
      }
    });
    
    return scenarios;
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
}

// Export for use in React component
export default RetirementCalculator;
