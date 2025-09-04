/**
 * Investment Calculator - JavaScript Logic
 * Handles all investment calculations including compound interest, future value, and inflation adjustments
 */

class InvestmentCalculator {
  constructor() {
    this.compoundingFrequency = 12; // Monthly compounding
  }

  /**
   * Validate all input parameters
   * @param {number} initialInvestment - Initial investment amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} investmentYears - Investment period in years
   * @param {number} inflationRate - Annual inflation rate
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(initialInvestment, monthlyContribution, annualReturn, investmentYears, inflationRate = 0) {
    const errors = [];

    // Validate initial investment
    if (!initialInvestment || isNaN(initialInvestment) || initialInvestment < 0) {
      errors.push('Please enter a valid positive initial investment amount.');
    }

    // Validate monthly contribution (can be 0)
    if (monthlyContribution && (isNaN(monthlyContribution) || monthlyContribution < 0)) {
      errors.push('Monthly contribution must be a positive number or zero.');
    }

    // Validate annual return rate
    if (!annualReturn || isNaN(annualReturn) || annualReturn < 0 || annualReturn > 100) {
      errors.push('Please enter a valid annual return rate between 0 and 100%.');
    }

    // Validate investment years
    if (!investmentYears || isNaN(investmentYears) || investmentYears <= 0 || investmentYears > 100) {
      errors.push('Please enter a valid investment period between 1 and 100 years.');
    }

    // Validate inflation rate (can be 0)
    if (inflationRate && (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 50)) {
      errors.push('Inflation rate must be between 0 and 50%.');
    }

    return errors;
  }

  /**
   * Calculate monthly interest rate from annual rate
   * @param {number} annualRate - Annual percentage rate
   * @returns {number} Monthly interest rate
   */
  calculateMonthlyRate(annualRate) {
    return (annualRate / 100) / this.compoundingFrequency;
  }

  /**
   * Calculate future value of initial investment
   * @param {number} principal - Initial investment amount
   * @param {number} monthlyRate - Monthly interest rate
   * @param {number} totalMonths - Total number of months
   * @returns {number} Future value of initial investment
   */
  calculateInitialInvestmentFutureValue(principal, monthlyRate, totalMonths) {
    if (monthlyRate === 0) {
      return principal;
    }
    return principal * Math.pow(1 + monthlyRate, totalMonths);
  }

  /**
   * Calculate future value of monthly contributions
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} monthlyRate - Monthly interest rate
   * @param {number} totalMonths - Total number of months
   * @returns {number} Future value of monthly contributions
   */
  calculateMonthlyContributionsFutureValue(monthlyContribution, monthlyRate, totalMonths) {
    if (monthlyContribution === 0 || monthlyRate === 0) {
      return monthlyContribution * totalMonths;
    }

    // Formula: PMT × [(1 + r)^n - 1] / r
    const numerator = Math.pow(1 + monthlyRate, totalMonths) - 1;
    const denominator = monthlyRate;
    
    return monthlyContribution * (numerator / denominator);
  }

  /**
   * Calculate total future value
   * @param {number} initialFutureValue - Future value of initial investment
   * @param {number} contributionsFutureValue - Future value of monthly contributions
   * @returns {number} Total future value
   */
  calculateTotalFutureValue(initialFutureValue, contributionsFutureValue) {
    return initialFutureValue + contributionsFutureValue;
  }

  /**
   * Calculate inflation-adjusted value
   * @param {number} futureValue - Future value of investment
   * @param {number} inflationRate - Annual inflation rate
   * @param {number} years - Number of years
   * @returns {number} Inflation-adjusted value
   */
  calculateInflationAdjustedValue(futureValue, inflationRate, years) {
    if (inflationRate === 0) {
      return futureValue;
    }
    const inflationFactor = Math.pow(1 + (inflationRate / 100), years);
    return futureValue / inflationFactor;
  }

  /**
   * Calculate total amount invested
   * @param {number} initialInvestment - Initial investment amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} years - Number of years
   * @returns {number} Total amount invested
   */
  calculateTotalInvested(initialInvestment, monthlyContribution, years) {
    const totalContributions = monthlyContribution * 12 * years;
    return initialInvestment + totalContributions;
  }

  /**
   * Calculate total interest earned
   * @param {number} futureValue - Future value of investment
   * @param {number} totalInvested - Total amount invested
   * @returns {number} Total interest earned
   */
  calculateTotalInterest(futureValue, totalInvested) {
    return futureValue - totalInvested;
  }

  /**
   * Calculate growth rate
   * @param {number} futureValue - Future value of investment
   * @param {number} totalInvested - Total amount invested
   * @param {number} years - Number of years
   * @returns {number} Annual growth rate
   */
  calculateGrowthRate(futureValue, totalInvested, years) {
    if (totalInvested === 0 || years === 0) {
      return 0;
    }
    return ((futureValue / totalInvested) - 1) / years * 100;
  }

  /**
   * Calculate inflation impact
   * @param {number} futureValue - Future value of investment
   * @param {number} inflationAdjustedValue - Inflation-adjusted value
   * @returns {number} Inflation impact amount
   */
  calculateInflationImpact(futureValue, inflationAdjustedValue) {
    return futureValue - inflationAdjustedValue;
  }

  /**
   * Calculate real return rate
   * @param {number} nominalReturn - Nominal return rate
   * @param {number} inflationRate - Inflation rate
   * @returns {number} Real return rate
   */
  calculateRealReturn(nominalReturn, inflationRate) {
    return nominalReturn - inflationRate;
  }

  /**
   * Main calculation function for investment
   * @param {number} initialInvestment - Initial investment amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} investmentYears - Investment period in years
   * @param {number} inflationRate - Annual inflation rate
   * @returns {Object} Calculation results
   */
  calculateInvestment(initialInvestment, monthlyContribution, annualReturn, investmentYears, inflationRate = 0) {
    // Convert to numbers and validate
    initialInvestment = parseFloat(initialInvestment) || 0;
    monthlyContribution = parseFloat(monthlyContribution) || 0;
    annualReturn = parseFloat(annualReturn);
    investmentYears = parseFloat(investmentYears);
    inflationRate = parseFloat(inflationRate) || 0;

    // Calculate monthly rate
    const monthlyRate = this.calculateMonthlyRate(annualReturn);
    const totalMonths = investmentYears * 12;

    // Calculate future values
    const initialFutureValue = this.calculateInitialInvestmentFutureValue(initialInvestment, monthlyRate, totalMonths);
    const contributionsFutureValue = this.calculateMonthlyContributionsFutureValue(monthlyContribution, monthlyRate, totalMonths);
    
    // Calculate total future value
    const futureValue = this.calculateTotalFutureValue(initialFutureValue, contributionsFutureValue);

    // Calculate other metrics
    const totalInvested = this.calculateTotalInvested(initialInvestment, monthlyContribution, investmentYears);
    const totalInterest = this.calculateTotalInterest(futureValue, totalInvested);
    const totalContributions = monthlyContribution * 12 * investmentYears;

    // Calculate inflation-adjusted value
    const inflationAdjustedValue = this.calculateInflationAdjustedValue(futureValue, inflationRate, investmentYears);

    // Calculate growth metrics
    const growthRate = this.calculateGrowthRate(futureValue, totalInvested, investmentYears);
    const inflationImpact = this.calculateInflationImpact(futureValue, inflationAdjustedValue);
    const realReturn = this.calculateRealReturn(annualReturn, inflationRate);

    return {
      initialInvestment: initialInvestment,
      monthlyContribution: monthlyContribution,
      annualReturn: annualReturn,
      investmentYears: investmentYears,
      inflationRate: inflationRate,
      futureValue: futureValue,
      totalInvested: totalInvested,
      totalContributions: totalContributions,
      totalInterest: totalInterest,
      inflationAdjustedValue: inflationAdjustedValue,
      growthRate: growthRate,
      inflationImpact: inflationImpact,
      realReturn: realReturn,
      monthlyRate: monthlyRate,
      totalMonths: totalMonths
    };
  }

  /**
   * Calculate required monthly contribution to reach a target amount
   * @param {number} targetAmount - Target future value
   * @param {number} initialInvestment - Initial investment amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} years - Number of years
   * @returns {number} Required monthly contribution
   */
  calculateRequiredMonthlyContribution(targetAmount, initialInvestment, annualReturn, years) {
    const monthlyRate = this.calculateMonthlyRate(annualReturn);
    const totalMonths = years * 12;

    if (monthlyRate === 0) {
      return (targetAmount - initialInvestment) / totalMonths;
    }

    // Calculate future value of initial investment
    const initialFutureValue = this.calculateInitialInvestmentFutureValue(initialInvestment, monthlyRate, totalMonths);
    
    // Calculate remaining amount needed from contributions
    const remainingAmount = targetAmount - initialFutureValue;
    
    if (remainingAmount <= 0) {
      return 0; // Initial investment alone is sufficient
    }

    // Calculate required monthly contribution
    // Formula: PMT = FV × r / [(1 + r)^n - 1]
    const numerator = remainingAmount * monthlyRate;
    const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
    
    return numerator / denominator;
  }

  /**
   * Calculate time to reach a target amount
   * @param {number} targetAmount - Target future value
   * @param {number} initialInvestment - Initial investment amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Annual return rate
   * @returns {number} Years needed to reach target
   */
  calculateTimeToTarget(targetAmount, initialInvestment, monthlyContribution, annualReturn) {
    const monthlyRate = this.calculateMonthlyRate(annualReturn);
    
    if (monthlyRate === 0) {
      if (monthlyContribution === 0) {
        return targetAmount <= initialInvestment ? 0 : Infinity;
      }
      return (targetAmount - initialInvestment) / (monthlyContribution * 12);
    }

    // Use iterative approach to find the time
    let years = 0;
    let currentValue = initialInvestment;
    
    while (currentValue < targetAmount && years < 100) {
      years += 0.1; // Increment by 0.1 years for precision
      const months = years * 12;
      
      const initialFutureValue = this.calculateInitialInvestmentFutureValue(initialInvestment, monthlyRate, months);
      const contributionsFutureValue = this.calculateMonthlyContributionsFutureValue(monthlyContribution, monthlyRate, months);
      currentValue = initialFutureValue + contributionsFutureValue;
    }
    
    return Math.min(years, 100); // Cap at 100 years
  }

  /**
   * Generate year-by-year breakdown
   * @param {number} initialInvestment - Initial investment amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} annualReturn - Annual return rate
   * @param {number} years - Number of years
   * @returns {Array} Year-by-year breakdown
   */
  generateYearlyBreakdown(initialInvestment, monthlyContribution, annualReturn, years) {
    const breakdown = [];
    let currentValue = initialInvestment;
    const monthlyRate = this.calculateMonthlyRate(annualReturn);

    for (let year = 1; year <= years; year++) {
      const yearlyContributions = monthlyContribution * 12;
      
      // Calculate interest for the year
      let yearlyInterest = 0;
      for (let month = 1; month <= 12; month++) {
        const monthlyInterest = currentValue * monthlyRate;
        yearlyInterest += monthlyInterest;
        currentValue += monthlyInterest + monthlyContribution;
      }

      breakdown.push({
        year: year,
        beginningValue: currentValue - yearlyInterest - yearlyContributions,
        contributions: yearlyContributions,
        interest: yearlyInterest,
        endingValue: currentValue
      });
    }

    return breakdown;
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
export default InvestmentCalculator;
