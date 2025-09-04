/**
 * Credit Card Calculator - JavaScript Logic
 * Handles all credit card calculations including interest, payoff time, and total costs
 */

class CreditCardCalculator {
  constructor() {
    this.monthlyDays = 30.44; // Average days per month
  }

  /**
   * Validate all input parameters
   * @param {number} balance - Current credit card balance
   * @param {number} interestRate - Annual interest rate (APR)
   * @param {number} monthlyPayment - Monthly payment amount
   * @param {number} additionalCharges - Additional monthly charges
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(balance, interestRate, monthlyPayment, additionalCharges = 0) {
    const errors = [];

    // Validate balance
    if (!balance || isNaN(balance) || balance <= 0) {
      errors.push('Please enter a valid positive balance amount.');
    }

    // Validate interest rate
    if (!interestRate || isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
      errors.push('Please enter a valid interest rate between 0 and 100%.');
    }

    // Validate monthly payment
    if (!monthlyPayment || isNaN(monthlyPayment) || monthlyPayment <= 0) {
      errors.push('Please enter a valid positive monthly payment amount.');
    }

    // Validate additional charges
    if (additionalCharges && (isNaN(additionalCharges) || additionalCharges < 0)) {
      errors.push('Additional charges must be a positive number or zero.');
    }

    // Check if monthly payment is sufficient
    if (monthlyPayment && balance && interestRate) {
      const dailyRate = (interestRate / 100) / 365;
      const monthlyInterest = balance * dailyRate * this.monthlyDays;
      
      if (monthlyPayment <= monthlyInterest) {
        errors.push('Monthly payment must be greater than the monthly interest to pay off the balance.');
      }
    }

    return errors;
  }

  /**
   * Calculate daily interest rate from annual rate
   * @param {number} annualRate - Annual percentage rate
   * @returns {number} Daily interest rate
   */
  calculateDailyRate(annualRate) {
    return (annualRate / 100) / 365;
  }

  /**
   * Calculate monthly interest on current balance
   * @param {number} balance - Current balance
   * @param {number} dailyRate - Daily interest rate
   * @returns {number} Monthly interest amount
   */
  calculateMonthlyInterest(balance, dailyRate) {
    return balance * dailyRate * this.monthlyDays;
  }

  /**
   * Calculate total interest paid over the life of the debt
   * @param {number} balance - Initial balance
   * @param {number} dailyRate - Daily interest rate
   * @param {number} monthlyPayment - Monthly payment amount
   * @returns {number} Total interest paid
   */
  calculateTotalInterest(balance, dailyRate, monthlyPayment) {
    let remainingBalance = balance;
    let totalInterest = 0;
    let months = 0;

    while (remainingBalance > 0 && months < 600) { // Cap at 50 years
      const monthlyInterest = this.calculateMonthlyInterest(remainingBalance, dailyRate);
      totalInterest += monthlyInterest;
      
      // Apply payment
      const paymentApplied = Math.min(monthlyPayment, remainingBalance + monthlyInterest);
      remainingBalance = remainingBalance + monthlyInterest - paymentApplied;
      
      months++;
    }

    return totalInterest;
  }

  /**
   * Calculate payoff time in months
   * @param {number} balance - Initial balance
   * @param {number} dailyRate - Daily interest rate
   * @param {number} monthlyPayment - Monthly payment amount
   * @returns {number} Number of months to pay off
   */
  calculatePayoffMonths(balance, dailyRate, monthlyPayment) {
    let remainingBalance = balance;
    let months = 0;

    while (remainingBalance > 0 && months < 600) { // Cap at 50 years
      const monthlyInterest = this.calculateMonthlyInterest(remainingBalance, dailyRate);
      
      // Apply payment
      const paymentApplied = Math.min(monthlyPayment, remainingBalance + monthlyInterest);
      remainingBalance = remainingBalance + monthlyInterest - paymentApplied;
      
      months++;
    }

    return months;
  }

  /**
   * Main calculation function for credit card
   * @param {number} balance - Current credit card balance
   * @param {number} interestRate - Annual interest rate (APR)
   * @param {number} monthlyPayment - Monthly payment amount
   * @param {number} additionalCharges - Additional monthly charges
   * @returns {Object} Calculation results
   */
  calculateCreditCard(balance, interestRate, monthlyPayment, additionalCharges = 0) {
    // Convert to numbers and validate
    balance = parseFloat(balance);
    interestRate = parseFloat(interestRate);
    monthlyPayment = parseFloat(monthlyPayment);
    additionalCharges = parseFloat(additionalCharges) || 0;

    // Calculate daily rate
    const dailyRate = this.calculateDailyRate(interestRate);

    // Calculate monthly interest
    const monthlyInterest = this.calculateMonthlyInterest(balance, dailyRate);

    // Calculate payoff time
    const payoffMonths = this.calculatePayoffMonths(balance, dailyRate, monthlyPayment);

    // Calculate total interest
    const totalInterest = this.calculateTotalInterest(balance, dailyRate, monthlyPayment);

    // Calculate total amount paid
    const totalAmountPaid = balance + totalInterest + (additionalCharges * payoffMonths);

    // Calculate total additional charges
    const totalAdditionalCharges = additionalCharges * payoffMonths;

    return {
      balance: balance,
      interestRate: interestRate,
      monthlyPayment: monthlyPayment,
      additionalCharges: totalAdditionalCharges,
      monthlyInterest: monthlyInterest,
      totalInterest: totalInterest,
      payoffMonths: payoffMonths,
      totalAmountPaid: totalAmountPaid,
      dailyRate: dailyRate
    };
  }

  /**
   * Calculate minimum payment (typically 2-3% of balance)
   * @param {number} balance - Current balance
   * @param {number} percentage - Minimum payment percentage (default 3%)
   * @returns {number} Minimum payment amount
   */
  calculateMinimumPayment(balance, percentage = 3) {
    return Math.max(balance * (percentage / 100), 25); // Minimum $25
  }

  /**
   * Calculate how much to pay monthly to pay off in specific time
   * @param {number} balance - Current balance
   * @param {number} interestRate - Annual interest rate
   * @param {number} targetMonths - Target months to pay off
   * @returns {number} Required monthly payment
   */
  calculateRequiredPayment(balance, interestRate, targetMonths) {
    const dailyRate = this.calculateDailyRate(interestRate);
    const monthlyRate = dailyRate * this.monthlyDays;
    
    if (monthlyRate === 0) {
      return balance / targetMonths;
    }

    // Use the standard loan payment formula
    const numerator = balance * monthlyRate * Math.pow(1 + monthlyRate, targetMonths);
    const denominator = Math.pow(1 + monthlyRate, targetMonths) - 1;
    
    return numerator / denominator;
  }

  /**
   * Calculate savings from paying extra
   * @param {number} balance - Current balance
   * @param {number} interestRate - Annual interest rate
   * @param {number} currentPayment - Current monthly payment
   * @param {number} extraPayment - Extra amount to pay monthly
   * @returns {Object} Savings information
   */
  calculateExtraPaymentSavings(balance, interestRate, currentPayment, extraPayment) {
    const currentResult = this.calculateCreditCard(balance, interestRate, currentPayment);
    const newPayment = currentPayment + extraPayment;
    const newResult = this.calculateCreditCard(balance, interestRate, newPayment);

    return {
      currentPayoffMonths: currentResult.payoffMonths,
      newPayoffMonths: newResult.payoffMonths,
      monthsSaved: currentResult.payoffMonths - newResult.payoffMonths,
      currentTotalInterest: currentResult.totalInterest,
      newTotalInterest: newResult.totalInterest,
      interestSaved: currentResult.totalInterest - newResult.totalInterest,
      extraPayment: extraPayment
    };
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
   * Generate amortization schedule
   * @param {number} balance - Initial balance
   * @param {number} interestRate - Annual interest rate
   * @param {number} monthlyPayment - Monthly payment
   * @param {number} maxMonths - Maximum months to calculate
   * @returns {Array} Array of monthly payment details
   */
  generateAmortizationSchedule(balance, interestRate, monthlyPayment, maxMonths = 60) {
    const schedule = [];
    let remainingBalance = balance;
    const dailyRate = this.calculateDailyRate(interestRate);

    for (let month = 1; month <= maxMonths && remainingBalance > 0; month++) {
      const monthlyInterest = this.calculateMonthlyInterest(remainingBalance, dailyRate);
      const principalPaid = Math.min(monthlyPayment - monthlyInterest, remainingBalance);
      
      remainingBalance = Math.max(0, remainingBalance - principalPaid);

      schedule.push({
        month: month,
        beginningBalance: remainingBalance + principalPaid,
        payment: monthlyPayment,
        principalPaid: principalPaid,
        interestPaid: monthlyInterest,
        endingBalance: remainingBalance
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  }
}

// Export for use in React component
export default CreditCardCalculator;
