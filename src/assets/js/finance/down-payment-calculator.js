/**
 * Down Payment Calculator - JavaScript Logic
 * Handles all down payment calculations including loan amount, monthly payments, and total costs
 */

class DownPaymentCalculator {
  constructor() {
    // Default values
    this.maxHomePrice = 10000000; // Maximum $10M home price
    this.minHomePrice = 1000; // Minimum $1K home price
    this.maxDownPaymentPercent = 100; // Maximum 100% down payment
    this.minDownPaymentPercent = 0; // Minimum 0% down payment
    this.maxInterestRate = 30; // Maximum 30% interest rate
    this.maxLoanTerm = 50; // Maximum 50 years loan term
    this.minLoanTerm = 1; // Minimum 1 year loan term
  }

  /**
   * Validate all input parameters
   * @param {number} homePrice - Home price
   * @param {number} downPaymentPercent - Down payment percentage
   * @param {number} interestRate - Interest rate percentage
   * @param {number} loanTerm - Loan term in years
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(homePrice, downPaymentPercent, interestRate, loanTerm) {
    const errors = [];

    // Validate home price
    if (!homePrice || isNaN(homePrice) || homePrice < this.minHomePrice || homePrice > this.maxHomePrice) {
      errors.push(`Please enter a valid home price between $${this.minHomePrice.toLocaleString()} and $${this.maxHomePrice.toLocaleString()}.`);
    }

    // Validate down payment percentage
    if (isNaN(downPaymentPercent) || downPaymentPercent < this.minDownPaymentPercent || downPaymentPercent > this.maxDownPaymentPercent) {
      errors.push(`Please enter a valid down payment percentage between ${this.minDownPaymentPercent}% and ${this.maxDownPaymentPercent}%.`);
    }

    // Validate interest rate
    if (isNaN(interestRate) || interestRate < 0 || interestRate > this.maxInterestRate) {
      errors.push(`Please enter a valid interest rate between 0% and ${this.maxInterestRate}%.`);
    }

    // Validate loan term
    if (isNaN(loanTerm) || loanTerm < this.minLoanTerm || loanTerm > this.maxLoanTerm) {
      errors.push(`Please enter a valid loan term between ${this.minLoanTerm} and ${this.maxLoanTerm} years.`);
    }

    return errors;
  }

  /**
   * Calculate down payment amount
   * @param {number} homePrice - Home price
   * @param {number} downPaymentPercent - Down payment percentage
   * @returns {number} Down payment amount
   */
  calculateDownPaymentAmount(homePrice, downPaymentPercent) {
    return homePrice * (downPaymentPercent / 100);
  }

  /**
   * Calculate loan amount
   * @param {number} homePrice - Home price
   * @param {number} downPaymentAmount - Down payment amount
   * @returns {number} Loan amount
   */
  calculateLoanAmount(homePrice, downPaymentAmount) {
    return homePrice - downPaymentAmount;
  }

  /**
   * Calculate monthly mortgage payment
   * @param {number} loanAmount - Loan amount
   * @param {number} interestRate - Annual interest rate
   * @param {number} loanTerm - Loan term in years
   * @returns {number} Monthly payment
   */
  calculateMonthlyPayment(loanAmount, interestRate, loanTerm) {
    if (loanAmount === 0) return 0;
    
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    if (monthlyInterestRate === 0) {
      // Handle 0% interest rate
      return loanAmount / numberOfPayments;
    }
    
    // Standard mortgage calculation
    return (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  /**
   * Calculate total interest paid
   * @param {number} monthlyPayment - Monthly payment
   * @param {number} loanTerm - Loan term in years
   * @param {number} loanAmount - Loan amount
   * @returns {number} Total interest paid
   */
  calculateTotalInterest(monthlyPayment, loanTerm, loanAmount) {
    const totalPayments = monthlyPayment * (loanTerm * 12);
    return totalPayments - loanAmount;
  }

  /**
   * Calculate total cost
   * @param {number} downPaymentAmount - Down payment amount
   * @param {number} totalPayments - Total payments over loan term
   * @returns {number} Total cost
   */
  calculateTotalCost(downPaymentAmount, totalPayments) {
    return downPaymentAmount + totalPayments;
  }

  /**
   * Calculate loan-to-value ratio
   * @param {number} loanAmount - Loan amount
   * @param {number} homePrice - Home price
   * @returns {number} Loan-to-value ratio percentage
   */
  calculateLoanToValueRatio(loanAmount, homePrice) {
    if (homePrice === 0) return 0;
    return (loanAmount / homePrice) * 100;
  }

  /**
   * Determine if PMI is required
   * @param {number} downPaymentPercent - Down payment percentage
   * @returns {boolean} Whether PMI is required
   */
  isPMIRequired(downPaymentPercent) {
    return downPaymentPercent < 20;
  }

  /**
   * Calculate PMI amount (estimated)
   * @param {number} loanAmount - Loan amount
   * @param {number} pmiRate - PMI rate (default 0.5%)
   * @returns {number} Annual PMI amount
   */
  calculatePMIAmount(loanAmount, pmiRate = 0.5) {
    return loanAmount * (pmiRate / 100);
  }

  /**
   * Main calculation function for down payment
   * @param {number} homePrice - Home price
   * @param {number} downPaymentPercent - Down payment percentage
   * @param {number} interestRate - Interest rate percentage
   * @param {number} loanTerm - Loan term in years
   * @returns {Object} Comprehensive down payment calculation results
   */
  calculateDownPayment(homePrice, downPaymentPercent, interestRate, loanTerm) {
    // Convert to numbers and validate
    homePrice = parseFloat(homePrice);
    downPaymentPercent = parseFloat(downPaymentPercent);
    interestRate = parseFloat(interestRate);
    loanTerm = parseFloat(loanTerm);

    // Calculate down payment amount
    const downPaymentAmount = this.calculateDownPaymentAmount(homePrice, downPaymentPercent);

    // Calculate loan amount
    const loanAmount = this.calculateLoanAmount(homePrice, downPaymentAmount);

    // Calculate monthly payment
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, interestRate, loanTerm);

    // Calculate additional metrics
    const totalPayments = monthlyPayment * (loanTerm * 12);
    const totalInterest = this.calculateTotalInterest(monthlyPayment, loanTerm, loanAmount);
    const totalCost = this.calculateTotalCost(downPaymentAmount, totalPayments);
    const loanToValueRatio = this.calculateLoanToValueRatio(loanAmount, homePrice);
    const pmiRequired = this.isPMIRequired(downPaymentPercent);
    const pmiAmount = pmiRequired ? this.calculatePMIAmount(loanAmount) : 0;

    return {
      // Input values
      homePrice: homePrice,
      downPaymentPercent: downPaymentPercent,
      interestRate: interestRate,
      loanTerm: loanTerm,

      // Main calculations
      downPaymentAmount: this.roundToCurrency(downPaymentAmount),
      loanAmount: this.roundToCurrency(loanAmount),
      monthlyPayment: this.roundToCurrency(monthlyPayment),
      totalInterest: this.roundToCurrency(totalInterest),
      totalCost: this.roundToCurrency(totalCost),
      loanToValueRatio: this.roundToCurrency(loanToValueRatio),
      totalPayments: Math.round(loanTerm * 12),

      // Additional metrics
      pmiRequired: pmiRequired,
      pmiAmount: this.roundToCurrency(pmiAmount),
      monthlyPMI: this.roundToCurrency(pmiAmount / 12),

      // Formatted values for display
      homePriceFormatted: this.formatCurrency(homePrice),
      downPaymentAmountFormatted: this.formatCurrency(downPaymentAmount),
      loanAmountFormatted: this.formatCurrency(loanAmount),
      monthlyPaymentFormatted: this.formatCurrency(monthlyPayment),
      totalInterestFormatted: this.formatCurrency(totalInterest),
      totalCostFormatted: this.formatCurrency(totalCost),
      loanToValueRatioFormatted: this.formatPercentage(loanToValueRatio),
      downPaymentPercentFormatted: this.formatPercentage(downPaymentPercent),
      interestRateFormatted: this.formatPercentage(interestRate)
    };
  }

  /**
   * Compare different down payment scenarios
   * @param {Array} scenarios - Array of down payment scenarios
   * @returns {Object} Down payment comparison results
   */
  compareDownPaymentScenarios(scenarios) {
    const comparisons = scenarios.map(scenario => {
      const result = this.calculateDownPayment(
        scenario.homePrice,
        scenario.downPaymentPercent,
        scenario.interestRate,
        scenario.loanTerm
      );
      return {
        ...result,
        scenarioName: scenario.name || `${scenario.downPaymentPercent}% Down Payment`
      };
    });

    // Sort by monthly payment (ascending)
    comparisons.sort((a, b) => a.monthlyPayment - b.monthlyPayment);

    return {
      scenarios: comparisons,
      lowestMonthlyPayment: comparisons[0],
      highestDownPayment: comparisons.reduce((max, scenario) => 
        scenario.downPaymentAmount > max.downPaymentAmount ? scenario : max
      ),
      lowestTotalCost: comparisons.reduce((min, scenario) => 
        scenario.totalCost < min.totalCost ? scenario : min
      )
    };
  }

  /**
   * Calculate maximum affordable home price
   * @param {number} availableDownPayment - Available down payment amount
   * @param {number} downPaymentPercent - Desired down payment percentage
   * @returns {number} Maximum affordable home price
   */
  calculateMaxAffordableHomePrice(availableDownPayment, downPaymentPercent) {
    if (downPaymentPercent === 0) return 0;
    return availableDownPayment / (downPaymentPercent / 100);
  }

  /**
   * Calculate required down payment for target home price
   * @param {number} homePrice - Target home price
   * @param {number} downPaymentPercent - Desired down payment percentage
   * @returns {number} Required down payment amount
   */
  calculateRequiredDownPayment(homePrice, downPaymentPercent) {
    return this.calculateDownPaymentAmount(homePrice, downPaymentPercent);
  }

  /**
   * Calculate break-even point for down payment
   * @param {number} homePrice - Home price
   * @param {number} interestRate - Interest rate
   * @param {number} loanTerm - Loan term
   * @param {number} additionalDownPayment - Additional down payment amount
   * @returns {Object} Break-even analysis
   */
  calculateDownPaymentBreakEven(homePrice, interestRate, loanTerm, additionalDownPayment) {
    const currentScenario = this.calculateDownPayment(homePrice, 20, interestRate, loanTerm);
    const newScenario = this.calculateDownPayment(homePrice, 20 + (additionalDownPayment / homePrice * 100), interestRate, loanTerm);
    
    const monthlySavings = currentScenario.monthlyPayment - newScenario.monthlyPayment;
    const breakEvenMonths = additionalDownPayment / monthlySavings;
    
    return {
      additionalDownPayment: additionalDownPayment,
      monthlySavings: this.roundToCurrency(monthlySavings),
      breakEvenMonths: this.roundToCurrency(breakEvenMonths),
      breakEvenYears: this.roundToCurrency(breakEvenMonths / 12),
      totalSavings: this.roundToCurrency(monthlySavings * (loanTerm * 12))
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
   * Get common down payment percentages and their implications
   * @returns {Object} Common down payment options
   */
  getDownPaymentOptions() {
    return {
      '3.5%': { 
        description: 'FHA minimum', 
        pmiRequired: true, 
        benefits: 'Lowest upfront cost',
        drawbacks: 'Higher monthly payments, PMI required'
      },
      '5%': { 
        description: 'Conventional minimum', 
        pmiRequired: true, 
        benefits: 'Low upfront cost',
        drawbacks: 'PMI required, higher interest rates'
      },
      '10%': { 
        description: 'Moderate down payment', 
        pmiRequired: true, 
        benefits: 'Lower monthly payments than 5%',
        drawbacks: 'PMI still required'
      },
      '20%': { 
        description: 'Standard down payment', 
        pmiRequired: false, 
        benefits: 'No PMI, better interest rates',
        drawbacks: 'Higher upfront cost'
      },
      '25%+': { 
        description: 'Large down payment', 
        pmiRequired: false, 
        benefits: 'Best interest rates, lowest monthly payments',
        drawbacks: 'Significant upfront cost'
      }
    };
  }
}

// Export for use in React component
export default DownPaymentCalculator;
