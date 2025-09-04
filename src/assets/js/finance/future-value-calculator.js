/**
 * Future Value Calculator - JavaScript Logic
 * Handles all future value calculations including simple FV, annuity FV, and complex scenarios
 */

class FutureValueCalculator {
  constructor() {
    // Default values
    this.maxPresentValue = 100000000; // Maximum $100M present value
    this.minPresentValue = 0; // Minimum $0 present value
    this.maxInterestRate = 100; // Maximum 100% interest rate
    this.maxTimePeriod = 100; // Maximum 100 years
    this.minTimePeriod = 0.1; // Minimum 0.1 years
    this.maxPaymentAmount = 10000000; // Maximum $10M payment amount
  }

  /**
   * Validate all input parameters
   * @param {number} presentValue - Present value
   * @param {number} interestRate - Interest rate percentage
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentAmount - Payment amount (optional)
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(presentValue, interestRate, timePeriod, paymentAmount, paymentFrequency) {
    const errors = [];

    // Validate present value (can be 0)
    if (presentValue && (isNaN(presentValue) || presentValue < 0 || presentValue > this.maxPresentValue)) {
      errors.push(`Please enter a valid present value between $0 and $${this.maxPresentValue.toLocaleString()}.`);
    }

    // Validate interest rate
    if (isNaN(interestRate) || interestRate < 0 || interestRate > this.maxInterestRate) {
      errors.push(`Please enter a valid interest rate between 0% and ${this.maxInterestRate}%.`);
    }

    // Validate time period
    if (isNaN(timePeriod) || timePeriod < this.minTimePeriod || timePeriod > this.maxTimePeriod) {
      errors.push(`Please enter a valid time period between ${this.minTimePeriod} and ${this.maxTimePeriod} years.`);
    }

    // Validate payment amount if provided
    if (paymentAmount && (isNaN(paymentAmount) || paymentAmount < 0 || paymentAmount > this.maxPaymentAmount)) {
      errors.push(`Please enter a valid payment amount between $0 and $${this.maxPaymentAmount.toLocaleString()}.`);
    }

    // At least one of present value or payment amount must be provided
    if ((!presentValue || presentValue === 0) && (!paymentAmount || paymentAmount === 0)) {
      errors.push('Please enter either a present value or payment amount (or both).');
    }

    return errors;
  }

  /**
   * Get payments per year based on frequency
   * @param {string} frequency - Payment frequency
   * @returns {number} Payments per year
   */
  getPaymentsPerYear(frequency) {
    switch (frequency) {
      case 'annually': return 1;
      case 'semi-annually': return 2;
      case 'quarterly': return 4;
      case 'monthly': return 12;
      case 'none': return 0;
      default: return 0;
    }
  }

  /**
   * Get frequency display name
   * @param {string} frequency - Payment frequency
   * @returns {string} Display name
   */
  getFrequencyDisplayName(frequency) {
    switch (frequency) {
      case 'annually': return 'Annual';
      case 'semi-annually': return 'Semi-annual';
      case 'quarterly': return 'Quarterly';
      case 'monthly': return 'Monthly';
      case 'none': return 'None';
      default: return 'None';
    }
  }

  /**
   * Calculate simple future value
   * @param {number} presentValue - Present value
   * @param {number} interestRate - Annual interest rate
   * @param {number} timePeriod - Time period in years
   * @returns {number} Future value
   */
  calculateSimpleFutureValue(presentValue, interestRate, timePeriod) {
    if (presentValue === 0) return 0;
    const rate = interestRate / 100;
    return presentValue * Math.pow(1 + rate, timePeriod);
  }

  /**
   * Calculate future value of annuity
   * @param {number} paymentAmount - Payment amount
   * @param {number} interestRate - Annual interest rate
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentsPerYear - Payments per year
   * @returns {number} Future value of annuity
   */
  calculateAnnuityFutureValue(paymentAmount, interestRate, timePeriod, paymentsPerYear) {
    if (paymentAmount === 0 || paymentsPerYear === 0) return 0;
    
    const ratePerPeriod = (interestRate / 100) / paymentsPerYear;
    const totalPaymentCount = timePeriod * paymentsPerYear;
    
    if (ratePerPeriod === 0) {
      // Handle zero interest rate case
      return paymentAmount * totalPaymentCount;
    }
    
    return paymentAmount * (Math.pow(1 + ratePerPeriod, totalPaymentCount) - 1) / ratePerPeriod;
  }

  /**
   * Calculate future value with multiple compounding
   * @param {number} presentValue - Present value
   * @param {number} interestRate - Annual interest rate
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentsPerYear - Payments per year
   * @returns {number} Future value
   */
  calculateFutureValueWithCompounding(presentValue, interestRate, timePeriod, paymentsPerYear) {
    if (presentValue === 0) return 0;
    if (paymentsPerYear === 0) {
      return this.calculateSimpleFutureValue(presentValue, interestRate, timePeriod);
    }
    
    const ratePerPeriod = (interestRate / 100) / paymentsPerYear;
    const totalPeriods = timePeriod * paymentsPerYear;
    
    return presentValue * Math.pow(1 + ratePerPeriod, totalPeriods);
  }

  /**
   * Calculate total contributions
   * @param {number} presentValue - Present value
   * @param {number} paymentAmount - Payment amount
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentsPerYear - Payments per year
   * @returns {number} Total contributions
   */
  calculateTotalContributions(presentValue, paymentAmount, timePeriod, paymentsPerYear) {
    const totalPayments = paymentAmount * (timePeriod * paymentsPerYear);
    return presentValue + totalPayments;
  }

  /**
   * Calculate total interest earned
   * @param {number} futureValue - Future value
   * @param {number} totalContributions - Total contributions
   * @returns {number} Total interest earned
   */
  calculateTotalInterest(futureValue, totalContributions) {
    return futureValue - totalContributions;
  }

  /**
   * Calculate growth rate
   * @param {number} futureValue - Future value
   * @param {number} presentValue - Present value
   * @param {number} timePeriod - Time period in years
   * @returns {number} Growth rate percentage
   */
  calculateGrowthRate(futureValue, presentValue, timePeriod) {
    if (presentValue === 0 || timePeriod === 0) return 0;
    return (Math.pow(futureValue / presentValue, 1 / timePeriod) - 1) * 100;
  }

  /**
   * Main calculation function for future value
   * @param {number} presentValue - Present value
   * @param {number} interestRate - Interest rate percentage
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentAmount - Payment amount (optional)
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Object} Comprehensive future value calculation results
   */
  calculateFutureValue(presentValue, interestRate, timePeriod, paymentAmount, paymentFrequency) {
    // Convert to numbers and validate
    presentValue = parseFloat(presentValue || 0);
    interestRate = parseFloat(interestRate);
    timePeriod = parseFloat(timePeriod);
    paymentAmount = parseFloat(paymentAmount || 0);

    // Get payment frequency details
    const paymentsPerYear = this.getPaymentsPerYear(paymentFrequency);
    const paymentFrequencyName = this.getFrequencyDisplayName(paymentFrequency);

    // Calculate future value components
    let futureValue = 0;
    let futureValueOfPresentValue = 0;
    let futureValueOfPayments = 0;
    let totalContributions = 0;
    let totalFromPayments = 0;
    let interestOnPayments = 0;

    // Calculate future value of present value
    if (presentValue > 0) {
      futureValueOfPresentValue = this.calculateFutureValueWithCompounding(
        presentValue, 
        interestRate, 
        timePeriod, 
        paymentsPerYear
      );
    }

    // Calculate future value of payments
    if (paymentAmount > 0 && paymentsPerYear > 0) {
      futureValueOfPayments = this.calculateAnnuityFutureValue(
        paymentAmount, 
        interestRate, 
        timePeriod, 
        paymentsPerYear
      );
      
      totalFromPayments = paymentAmount * (timePeriod * paymentsPerYear);
      interestOnPayments = futureValueOfPayments - totalFromPayments;
    }

    // Calculate total future value
    futureValue = futureValueOfPresentValue + futureValueOfPayments;

    // Calculate additional metrics
    totalContributions = this.calculateTotalContributions(presentValue, paymentAmount, timePeriod, paymentsPerYear);
    const totalInterest = this.calculateTotalInterest(futureValue, totalContributions);
    const growthRate = presentValue > 0 ? this.calculateGrowthRate(futureValueOfPresentValue, presentValue, timePeriod) : 0;
    const totalPaymentCount = timePeriod * paymentsPerYear;
    const totalPeriods = timePeriod * (paymentsPerYear || 1);

    return {
      // Input values
      presentValue: presentValue,
      interestRate: interestRate,
      timePeriod: timePeriod,
      paymentAmount: paymentAmount,
      paymentFrequency: paymentFrequency,
      paymentFrequencyName: paymentFrequencyName,
      paymentsPerYear: paymentsPerYear,

      // Main calculations
      futureValue: this.roundToCurrency(futureValue),
      futureValueOfPresentValue: this.roundToCurrency(futureValueOfPresentValue),
      futureValueOfPayments: this.roundToCurrency(futureValueOfPayments),
      totalContributions: this.roundToCurrency(totalContributions),
      totalInterest: this.roundToCurrency(totalInterest),
      totalFromPayments: this.roundToCurrency(totalFromPayments),
      interestOnPayments: this.roundToCurrency(interestOnPayments),
      growthRate: this.roundToCurrency(growthRate),
      totalPaymentCount: Math.round(totalPaymentCount),
      totalPeriods: Math.round(totalPeriods),

      // Formatted values for display
      presentValueFormatted: this.formatCurrency(presentValue),
      futureValueFormatted: this.formatCurrency(futureValue),
      futureValueOfPresentValueFormatted: this.formatCurrency(futureValueOfPresentValue),
      futureValueOfPaymentsFormatted: this.formatCurrency(futureValueOfPayments),
      totalContributionsFormatted: this.formatCurrency(totalContributions),
      totalInterestFormatted: this.formatCurrency(totalInterest),
      totalFromPaymentsFormatted: this.formatCurrency(totalFromPayments),
      interestOnPaymentsFormatted: this.formatCurrency(interestOnPayments),
      interestRateFormatted: this.formatPercentage(interestRate),
      growthRateFormatted: this.formatPercentage(growthRate)
    };
  }

  /**
   * Compare different future value scenarios
   * @param {Array} scenarios - Array of future value scenarios
   * @returns {Object} Future value comparison results
   */
  compareFutureValueScenarios(scenarios) {
    const comparisons = scenarios.map(scenario => {
      const result = this.calculateFutureValue(
        scenario.presentValue || 0,
        scenario.interestRate,
        scenario.timePeriod,
        scenario.paymentAmount || 0,
        scenario.paymentFrequency || 'none'
      );
      return {
        ...result,
        scenarioName: scenario.name || `${scenario.interestRate}% Interest Rate`
      };
    });

    // Sort by future value (descending - higher is better)
    comparisons.sort((a, b) => b.futureValue - a.futureValue);

    return {
      scenarios: comparisons,
      highestFutureValue: comparisons[0],
      lowestFutureValue: comparisons[comparisons.length - 1],
      bestScenario: comparisons[0] // Highest future value is best
    };
  }

  /**
   * Calculate required monthly contribution for future goal
   * @param {number} futureGoal - Future financial goal
   * @param {number} presentValue - Current savings
   * @param {number} interestRate - Expected interest rate
   * @param {number} timeToGoal - Years until goal
   * @returns {Object} Required contribution analysis
   */
  calculateRequiredContribution(futureGoal, presentValue, interestRate, timeToGoal) {
    // Calculate future value of current savings
    const futureValueOfCurrentSavings = this.calculateSimpleFutureValue(presentValue, interestRate, timeToGoal);
    
    // Calculate remaining amount needed from contributions
    const remainingAmount = futureGoal - futureValueOfCurrentSavings;
    
    // Calculate required monthly contribution
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = timeToGoal * 12;
    
    let requiredMonthlyContribution = 0;
    if (monthlyRate > 0 && remainingAmount > 0) {
      requiredMonthlyContribution = remainingAmount / ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (remainingAmount > 0) {
      requiredMonthlyContribution = remainingAmount / totalMonths;
    }

    return {
      futureGoal: futureGoal,
      futureGoalFormatted: this.formatCurrency(futureGoal),
      presentValue: presentValue,
      presentValueFormatted: this.formatCurrency(presentValue),
      futureValueOfCurrentSavings: this.roundToCurrency(futureValueOfCurrentSavings),
      futureValueOfCurrentSavingsFormatted: this.formatCurrency(futureValueOfCurrentSavings),
      remainingAmount: this.roundToCurrency(remainingAmount),
      remainingAmountFormatted: this.formatCurrency(remainingAmount),
      requiredMonthlyContribution: this.roundToCurrency(requiredMonthlyContribution),
      requiredMonthlyContributionFormatted: this.formatCurrency(requiredMonthlyContribution),
      timeToGoal: timeToGoal,
      interestRate: interestRate,
      interestRateFormatted: this.formatPercentage(interestRate)
    };
  }

  /**
   * Calculate future value growth projection
   * @param {number} presentValue - Present value
   * @param {number} interestRate - Interest rate
   * @param {number} timePeriod - Time period
   * @param {number} paymentAmount - Payment amount
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Object} Growth projection results
   */
  calculateGrowthProjection(presentValue, interestRate, timePeriod, paymentAmount, paymentFrequency) {
    const yearlyProjections = [];
    const paymentsPerYear = this.getPaymentsPerYear(paymentFrequency);
    
    for (let year = 1; year <= timePeriod; year++) {
      const result = this.calculateFutureValue(presentValue, interestRate, year, paymentAmount, paymentFrequency);
      yearlyProjections.push({
        year: year,
        futureValue: result.futureValue,
        totalContributions: result.totalContributions,
        totalInterest: result.totalInterest,
        futureValueFormatted: result.futureValueFormatted,
        totalContributionsFormatted: result.totalContributionsFormatted,
        totalInterestFormatted: result.totalInterestFormatted
      });
    }

    return {
      projections: yearlyProjections,
      finalValue: yearlyProjections[yearlyProjections.length - 1],
      totalGrowth: yearlyProjections[yearlyProjections.length - 1].totalInterest,
      averageYearlyGrowth: yearlyProjections[yearlyProjections.length - 1].totalInterest / timePeriod
    };
  }

  /**
   * Calculate compound interest comparison
   * @param {number} principal - Principal amount
   * @param {number} interestRate - Interest rate
   * @param {number} timePeriod - Time period
   * @returns {Object} Compound vs simple interest comparison
   */
  calculateCompoundInterestComparison(principal, interestRate, timePeriod) {
    const compoundInterest = this.calculateSimpleFutureValue(principal, interestRate, timePeriod) - principal;
    const simpleInterest = principal * (interestRate / 100) * timePeriod;
    const difference = compoundInterest - simpleInterest;

    return {
      principal: principal,
      principalFormatted: this.formatCurrency(principal),
      compoundInterest: this.roundToCurrency(compoundInterest),
      compoundInterestFormatted: this.formatCurrency(compoundInterest),
      simpleInterest: this.roundToCurrency(simpleInterest),
      simpleInterestFormatted: this.formatCurrency(simpleInterest),
      difference: this.roundToCurrency(difference),
      differenceFormatted: this.formatCurrency(difference),
      differencePercentage: this.roundToCurrency((difference / simpleInterest) * 100),
      timePeriod: timePeriod,
      interestRate: interestRate,
      interestRateFormatted: this.formatPercentage(interestRate)
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
   * Get common future value applications
   * @returns {Object} Common future value applications
   */
  getFutureValueApplications() {
    return {
      'Retirement Planning': {
        description: 'Calculate how much your retirement savings will grow over time',
        useCase: 'Project retirement fund growth with regular contributions'
      },
      'Education Planning': {
        description: 'Estimate the future value of education savings accounts',
        useCase: 'Plan for children\'s college education costs'
      },
      'Investment Analysis': {
        description: 'Evaluate different investment options and their potential returns',
        useCase: 'Compare stocks, bonds, and other investment vehicles'
      },
      'Real Estate Investment': {
        description: 'Calculate the future value of real estate investments',
        useCase: 'Project property appreciation and rental income growth'
      },
      'Business Planning': {
        description: 'Project the growth of business investments and expansion funds',
        useCase: 'Plan for business growth and capital requirements'
      },
      'Emergency Fund Planning': {
        description: 'Calculate how much to save for emergency funds',
        useCase: 'Build adequate emergency savings over time'
      }
    };
  }
}

// Export for use in React component
export default FutureValueCalculator;
