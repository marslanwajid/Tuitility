/**
 * Present Value Calculator - JavaScript Logic
 * Handles all present value calculations including simple PV, annuity PV, and complex scenarios
 */

class PresentValueCalculator {
  constructor() {
    // Default values
    this.maxFutureValue = 100000000; // Maximum $100M future value
    this.minFutureValue = 1; // Minimum $1 future value
    this.maxInterestRate = 100; // Maximum 100% interest rate
    this.maxTimePeriod = 100; // Maximum 100 years
    this.minTimePeriod = 0.1; // Minimum 0.1 years
    this.maxPaymentAmount = 10000000; // Maximum $10M payment amount
  }

  /**
   * Validate all input parameters
   * @param {number} futureValue - Future value
   * @param {number} interestRate - Interest rate percentage
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentAmount - Payment amount (optional)
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(futureValue, interestRate, timePeriod, paymentAmount, paymentFrequency) {
    const errors = [];

    // Validate future value
    if (!futureValue || isNaN(futureValue) || futureValue < this.minFutureValue || futureValue > this.maxFutureValue) {
      errors.push(`Please enter a valid future value between $${this.minFutureValue} and $${this.maxFutureValue.toLocaleString()}.`);
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
   * Calculate simple present value
   * @param {number} futureValue - Future value
   * @param {number} interestRate - Annual interest rate
   * @param {number} timePeriod - Time period in years
   * @returns {number} Present value
   */
  calculateSimplePresentValue(futureValue, interestRate, timePeriod) {
    const rate = interestRate / 100;
    return futureValue / Math.pow(1 + rate, timePeriod);
  }

  /**
   * Calculate present value of annuity
   * @param {number} paymentAmount - Payment amount
   * @param {number} interestRate - Annual interest rate
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentsPerYear - Payments per year
   * @returns {number} Present value of annuity
   */
  calculateAnnuityPresentValue(paymentAmount, interestRate, timePeriod, paymentsPerYear) {
    if (paymentAmount === 0 || paymentsPerYear === 0) return 0;
    
    const ratePerPeriod = (interestRate / 100) / paymentsPerYear;
    const totalPeriods = timePeriod * paymentsPerYear;
    
    if (ratePerPeriod === 0) {
      // Handle zero interest rate case
      return paymentAmount * totalPeriods;
    }
    
    return paymentAmount * (1 - Math.pow(1 + ratePerPeriod, -totalPeriods)) / ratePerPeriod;
  }

  /**
   * Calculate present value with multiple compounding
   * @param {number} futureValue - Future value
   * @param {number} interestRate - Annual interest rate
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentsPerYear - Payments per year
   * @returns {number} Present value
   */
  calculatePresentValueWithCompounding(futureValue, interestRate, timePeriod, paymentsPerYear) {
    if (paymentsPerYear === 0) {
      return this.calculateSimplePresentValue(futureValue, interestRate, timePeriod);
    }
    
    const ratePerPeriod = (interestRate / 100) / paymentsPerYear;
    const totalPeriods = timePeriod * paymentsPerYear;
    
    return futureValue / Math.pow(1 + ratePerPeriod, totalPeriods);
  }

  /**
   * Calculate discount amount
   * @param {number} futureValue - Future value
   * @param {number} presentValue - Present value
   * @returns {number} Discount amount
   */
  calculateDiscountAmount(futureValue, presentValue) {
    return futureValue - presentValue;
  }

  /**
   * Calculate effective annual rate
   * @param {number} futureValue - Future value
   * @param {number} presentValue - Present value
   * @param {number} timePeriod - Time period in years
   * @returns {number} Effective annual rate percentage
   */
  calculateEffectiveRate(futureValue, presentValue, timePeriod) {
    if (presentValue === 0 || timePeriod === 0) return 0;
    return (Math.pow(futureValue / presentValue, 1 / timePeriod) - 1) * 100;
  }

  /**
   * Calculate discount factor
   * @param {number} presentValue - Present value
   * @param {number} futureValue - Future value
   * @returns {number} Discount factor
   */
  calculateDiscountFactor(presentValue, futureValue) {
    if (futureValue === 0) return 0;
    return presentValue / futureValue;
  }

  /**
   * Main calculation function for present value
   * @param {number} futureValue - Future value
   * @param {number} interestRate - Interest rate percentage
   * @param {number} timePeriod - Time period in years
   * @param {number} paymentAmount - Payment amount (optional)
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Object} Comprehensive present value calculation results
   */
  calculatePresentValue(futureValue, interestRate, timePeriod, paymentAmount, paymentFrequency) {
    // Convert to numbers and validate
    futureValue = parseFloat(futureValue);
    interestRate = parseFloat(interestRate);
    timePeriod = parseFloat(timePeriod);
    paymentAmount = parseFloat(paymentAmount || 0);

    // Get payment frequency details
    const paymentsPerYear = this.getPaymentsPerYear(paymentFrequency);
    const paymentFrequencyName = this.getFrequencyDisplayName(paymentFrequency);

    // Calculate present value components
    let presentValue;
    let presentValueOfPayments = 0;
    let presentValueOfFutureSum = 0;
    let totalPayments = 0;

    if (paymentsPerYear === 0 || paymentAmount === 0) {
      // Simple present value calculation without payments
      presentValue = this.calculateSimplePresentValue(futureValue, interestRate, timePeriod);
      presentValueOfFutureSum = presentValue;
    } else {
      // Present value calculation with periodic payments
      presentValueOfPayments = this.calculateAnnuityPresentValue(
        paymentAmount, 
        interestRate, 
        timePeriod, 
        paymentsPerYear
      );
      
      presentValueOfFutureSum = this.calculatePresentValueWithCompounding(
        futureValue, 
        interestRate, 
        timePeriod, 
        paymentsPerYear
      );
      
      presentValue = presentValueOfPayments + presentValueOfFutureSum;
      totalPayments = paymentAmount * (timePeriod * paymentsPerYear);
    }

    // Calculate additional metrics
    const discountAmount = this.calculateDiscountAmount(futureValue, presentValueOfFutureSum);
    const effectiveRate = this.calculateEffectiveRate(futureValue, presentValueOfFutureSum, timePeriod);
    const discountFactor = this.calculateDiscountFactor(presentValueOfFutureSum, futureValue);
    const totalPeriods = timePeriod * (paymentsPerYear || 1);

    return {
      // Input values
      futureValue: futureValue,
      interestRate: interestRate,
      timePeriod: timePeriod,
      paymentAmount: paymentAmount,
      paymentFrequency: paymentFrequency,
      paymentFrequencyName: paymentFrequencyName,
      paymentsPerYear: paymentsPerYear,

      // Main calculations
      presentValue: this.roundToCurrency(presentValue),
      presentValueOfPayments: this.roundToCurrency(presentValueOfPayments),
      presentValueOfFutureSum: this.roundToCurrency(presentValueOfFutureSum),
      discountAmount: this.roundToCurrency(discountAmount),
      effectiveRate: this.roundToCurrency(effectiveRate),
      discountFactor: this.roundToCurrency(discountFactor),
      totalPayments: this.roundToCurrency(totalPayments),
      totalPeriods: Math.round(totalPeriods),

      // Formatted values for display
      futureValueFormatted: this.formatCurrency(futureValue),
      presentValueFormatted: this.formatCurrency(presentValue),
      presentValueOfPaymentsFormatted: this.formatCurrency(presentValueOfPayments),
      presentValueOfFutureSumFormatted: this.formatCurrency(presentValueOfFutureSum),
      discountAmountFormatted: this.formatCurrency(discountAmount),
      totalPaymentsFormatted: this.formatCurrency(totalPayments),
      interestRateFormatted: this.formatPercentage(interestRate),
      effectiveRateFormatted: this.formatPercentage(effectiveRate)
    };
  }

  /**
   * Compare different present value scenarios
   * @param {Array} scenarios - Array of present value scenarios
   * @returns {Object} Present value comparison results
   */
  comparePresentValueScenarios(scenarios) {
    const comparisons = scenarios.map(scenario => {
      const result = this.calculatePresentValue(
        scenario.futureValue,
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

    // Sort by present value (ascending - lower is better for investment)
    comparisons.sort((a, b) => a.presentValue - b.presentValue);

    return {
      scenarios: comparisons,
      lowestPresentValue: comparisons[0],
      highestPresentValue: comparisons[comparisons.length - 1],
      bestScenario: comparisons[0] // Lowest present value is best for investment
    };
  }

  /**
   * Calculate required investment for future goal
   * @param {number} futureGoal - Future financial goal
   * @param {number} interestRate - Expected interest rate
   * @param {number} timeToGoal - Years until goal
   * @param {number} monthlyContribution - Monthly contribution (optional)
   * @returns {Object} Required investment analysis
   */
  calculateRequiredInvestment(futureGoal, interestRate, timeToGoal, monthlyContribution = 0) {
    const result = this.calculatePresentValue(
      futureGoal,
      interestRate,
      timeToGoal,
      monthlyContribution,
      'monthly'
    );

    return {
      requiredLumpSum: result.presentValueOfFutureSum,
      requiredLumpSumFormatted: result.presentValueOfFutureSumFormatted,
      monthlyContribution: monthlyContribution,
      monthlyContributionFormatted: this.formatCurrency(monthlyContribution),
      totalContributions: result.totalPayments,
      totalContributionsFormatted: result.totalPaymentsFormatted,
      futureGoal: futureGoal,
      futureGoalFormatted: this.formatCurrency(futureGoal),
      timeToGoal: timeToGoal,
      interestRate: interestRate,
      interestRateFormatted: this.formatPercentage(interestRate)
    };
  }

  /**
   * Calculate present value of different investment options
   * @param {Array} investments - Array of investment options
   * @returns {Object} Investment comparison results
   */
  compareInvestmentOptions(investments) {
    const comparisons = investments.map(investment => {
      const result = this.calculatePresentValue(
        investment.futureValue,
        investment.interestRate,
        investment.timePeriod,
        investment.paymentAmount || 0,
        investment.paymentFrequency || 'none'
      );
      
      return {
        ...result,
        investmentName: investment.name,
        riskLevel: investment.riskLevel || 'Medium',
        liquidity: investment.liquidity || 'Medium'
      };
    });

    // Sort by present value (ascending - lower is better for investment)
    comparisons.sort((a, b) => a.presentValue - b.presentValue);

    return {
      investments: comparisons,
      bestInvestment: comparisons[0],
      worstInvestment: comparisons[comparisons.length - 1],
      averagePresentValue: comparisons.reduce((sum, inv) => sum + inv.presentValue, 0) / comparisons.length
    };
  }

  /**
   * Calculate present value sensitivity analysis
   * @param {number} futureValue - Base future value
   * @param {number} interestRate - Base interest rate
   * @param {number} timePeriod - Base time period
   * @returns {Object} Sensitivity analysis results
   */
  calculateSensitivityAnalysis(futureValue, interestRate, timePeriod) {
    const baseResult = this.calculatePresentValue(futureValue, interestRate, timePeriod, 0, 'none');
    
    const scenarios = [
      { name: 'Base Case', interestRate: interestRate, presentValue: baseResult.presentValue },
      { name: 'Interest Rate +1%', interestRate: interestRate + 1, presentValue: 0 },
      { name: 'Interest Rate -1%', interestRate: interestRate - 1, presentValue: 0 },
      { name: 'Time +1 Year', interestRate: interestRate, timePeriod: timePeriod + 1, presentValue: 0 },
      { name: 'Time -1 Year', interestRate: interestRate, timePeriod: timePeriod - 1, presentValue: 0 }
    ];

    scenarios.forEach(scenario => {
      if (scenario.presentValue === 0) {
        const result = this.calculatePresentValue(
          futureValue,
          scenario.interestRate || interestRate,
          scenario.timePeriod || timePeriod,
          0,
          'none'
        );
        scenario.presentValue = result.presentValue;
        scenario.change = ((scenario.presentValue - baseResult.presentValue) / baseResult.presentValue) * 100;
      }
    });

    return {
      baseCase: baseResult,
      scenarios: scenarios,
      mostSensitive: scenarios.reduce((max, scenario) => 
        Math.abs(scenario.change || 0) > Math.abs(max.change || 0) ? scenario : max
      )
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
   * Get common present value applications
   * @returns {Object} Common present value applications
   */
  getPresentValueApplications() {
    return {
      'Investment Analysis': {
        description: 'Evaluate investment opportunities by comparing present values',
        useCase: 'Compare different investment options with varying returns and timeframes'
      },
      'Retirement Planning': {
        description: 'Calculate how much to save today for future retirement needs',
        useCase: 'Determine required savings to meet retirement income goals'
      },
      'Loan Evaluation': {
        description: 'Assess the true cost of loans and financing options',
        useCase: 'Compare different loan terms and interest rates'
      },
      'Business Valuation': {
        description: 'Value businesses based on future cash flow projections',
        useCase: 'Calculate present value of expected future business earnings'
      },
      'Real Estate Investment': {
        description: 'Evaluate real estate investments based on future rental income',
        useCase: 'Determine if property investment meets return requirements'
      },
      'Education Planning': {
        description: 'Calculate present value of future education costs',
        useCase: 'Plan savings for children\'s education expenses'
      }
    };
  }
}

// Export for use in React component
export default PresentValueCalculator;
