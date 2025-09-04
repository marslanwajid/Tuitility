/**
 * Debt Payoff Calculator - JavaScript Logic
 * Handles all debt payoff calculations including payment schedules, interest calculations, and payoff strategies
 */

class DebtPayoffCalculator {
  constructor() {
    // Default values
    this.maxInterestRate = 50; // Maximum 50% interest rate
    this.minPayment = 1; // Minimum payment of $1
    this.maxPayoffYears = 30; // Maximum 30 years payoff time
  }

  /**
   * Validate all input parameters
   * @param {number} currentBalance - Current debt balance
   * @param {number} interestRate - Annual interest rate percentage
   * @param {number} minimumPayment - Minimum payment amount
   * @param {number} extraPayment - Extra payment amount
   * @param {string} paymentFrequency - Payment frequency (monthly, biweekly, weekly)
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(currentBalance, interestRate, minimumPayment, extraPayment, paymentFrequency) {
    const errors = [];

    // Validate current balance
    if (!currentBalance || isNaN(currentBalance) || currentBalance <= 0) {
      errors.push('Please enter a valid positive current balance.');
    }

    // Validate interest rate
    if (interestRate === undefined || interestRate === null || isNaN(interestRate) || interestRate < 0 || interestRate > this.maxInterestRate) {
      errors.push(`Please enter a valid interest rate between 0% and ${this.maxInterestRate}%.`);
    }

    // Validate minimum payment
    if (!minimumPayment || isNaN(minimumPayment) || minimumPayment < this.minPayment) {
      errors.push(`Please enter a valid minimum payment of at least $${this.minPayment}.`);
    }

    // Validate extra payment
    if (extraPayment !== undefined && extraPayment !== null && extraPayment !== '' && (isNaN(extraPayment) || extraPayment < 0)) {
      errors.push('Please enter a valid non-negative extra payment amount.');
    }

    // Validate payment frequency
    const validFrequencies = ['monthly', 'biweekly', 'weekly'];
    if (!validFrequencies.includes(paymentFrequency)) {
      errors.push('Please select a valid payment frequency.');
    }

    // Check if minimum payment is sufficient
    if (currentBalance && interestRate && minimumPayment) {
      const monthlyRate = interestRate / 100 / 12;
      const interestOnlyPayment = currentBalance * monthlyRate;
      if (minimumPayment <= interestOnlyPayment) {
        errors.push('Minimum payment must be greater than the interest-only payment to reduce the principal.');
      }
    }

    return errors;
  }

  /**
   * Calculate payment frequency multiplier
   * @param {string} frequency - Payment frequency
   * @returns {number} Number of payments per year
   */
  getPaymentsPerYear(frequency) {
    switch (frequency) {
      case 'weekly':
        return 52;
      case 'biweekly':
        return 26;
      case 'monthly':
      default:
        return 12;
    }
  }

  /**
   * Calculate monthly interest rate
   * @param {number} annualRate - Annual interest rate percentage
   * @param {string} frequency - Payment frequency
   * @returns {number} Interest rate per payment period
   */
  getPeriodInterestRate(annualRate, frequency) {
    const paymentsPerYear = this.getPaymentsPerYear(frequency);
    return annualRate / 100 / paymentsPerYear;
  }

  /**
   * Calculate debt payoff schedule
   * @param {number} balance - Current balance
   * @param {number} interestRate - Annual interest rate
   * @param {number} payment - Payment amount
   * @param {string} frequency - Payment frequency
   * @returns {Object} Payoff schedule details
   */
  calculatePayoffSchedule(balance, interestRate, payment, frequency) {
    const periodRate = this.getPeriodInterestRate(interestRate, frequency);
    const paymentsPerYear = this.getPaymentsPerYear(frequency);
    
    let currentBalance = balance;
    let totalInterest = 0;
    let paymentNumber = 0;
    const schedule = [];

    while (currentBalance > 0.01 && paymentNumber < 1000) { // Safety limit
      paymentNumber++;
      
      const interestPayment = currentBalance * periodRate;
      const principalPayment = Math.min(payment - interestPayment, currentBalance);
      const actualPayment = principalPayment + interestPayment;
      
      currentBalance -= principalPayment;
      totalInterest += interestPayment;
      
      schedule.push({
        payment: paymentNumber,
        balance: Math.max(0, currentBalance),
        interest: interestPayment,
        principal: principalPayment,
        totalPayment: actualPayment
      });
    }

    return {
      schedule: schedule,
      totalPayments: paymentNumber,
      totalInterest: totalInterest,
      finalBalance: Math.max(0, currentBalance)
    };
  }

  /**
   * Format time period
   * @param {number} totalPayments - Total number of payments
   * @param {string} frequency - Payment frequency
   * @returns {string} Formatted time period
   */
  formatPayoffTime(totalPayments, frequency) {
    const paymentsPerYear = this.getPaymentsPerYear(frequency);
    const years = Math.floor(totalPayments / paymentsPerYear);
    const remainingPayments = totalPayments % paymentsPerYear;
    
    let result = '';
    
    if (years > 0) {
      result += `${years} year${years > 1 ? 's' : ''}`;
    }
    
    if (remainingPayments > 0) {
      if (years > 0) result += ' ';
      
      if (frequency === 'monthly') {
        result += `${remainingPayments} month${remainingPayments > 1 ? 's' : ''}`;
      } else if (frequency === 'biweekly') {
        const months = Math.floor(remainingPayments / 2);
        const weeks = remainingPayments % 2;
        if (months > 0) {
          result += `${months} month${months > 1 ? 's' : ''}`;
        }
        if (weeks > 0) {
          if (months > 0) result += ' ';
          result += `${weeks} week${weeks > 1 ? 's' : ''}`;
        }
      } else if (frequency === 'weekly') {
        result += `${remainingPayments} week${remainingPayments > 1 ? 's' : ''}`;
      }
    }
    
    return result || 'Less than 1 payment';
  }

  /**
   * Calculate interest savings from extra payments
   * @param {number} balance - Current balance
   * @param {number} interestRate - Annual interest rate
   * @param {number} minimumPayment - Minimum payment
   * @param {number} extraPayment - Extra payment
   * @param {string} frequency - Payment frequency
   * @returns {number} Interest savings amount
   */
  calculateInterestSavings(balance, interestRate, minimumPayment, extraPayment, frequency) {
    const minimumSchedule = this.calculatePayoffSchedule(balance, interestRate, minimumPayment, frequency);
    const totalSchedule = this.calculatePayoffSchedule(balance, interestRate, minimumPayment + extraPayment, frequency);
    
    return minimumSchedule.totalInterest - totalSchedule.totalInterest;
  }

  /**
   * Main calculation function for debt payoff
   * @param {number} currentBalance - Current debt balance
   * @param {number} interestRate - Annual interest rate percentage
   * @param {number} minimumPayment - Minimum payment amount
   * @param {number} extraPayment - Extra payment amount
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Object} Comprehensive debt payoff calculation results
   */
  calculateDebtPayoff(currentBalance, interestRate, minimumPayment, extraPayment, paymentFrequency) {
    // Convert to numbers and validate
    currentBalance = parseFloat(currentBalance);
    interestRate = parseFloat(interestRate);
    minimumPayment = parseFloat(minimumPayment);
    extraPayment = parseFloat(extraPayment || 0);
    
    const totalPayment = minimumPayment + extraPayment;
    
    // Calculate payoff schedule
    const schedule = this.calculatePayoffSchedule(currentBalance, interestRate, totalPayment, paymentFrequency);
    
    // Calculate additional metrics
    const totalAmountPaid = currentBalance + schedule.totalInterest;
    const interestPercentage = (schedule.totalInterest / totalAmountPaid) * 100;
    const averagePayment = totalAmountPaid / schedule.totalPayments;
    
    // Calculate interest savings if extra payment is made
    let interestSavings = 0;
    if (extraPayment > 0) {
      interestSavings = this.calculateInterestSavings(currentBalance, interestRate, minimumPayment, extraPayment, paymentFrequency);
    }
    
    // Format payoff time
    const payoffTime = this.formatPayoffTime(schedule.totalPayments, paymentFrequency);
    
    return {
      // Input values
      currentBalance: currentBalance,
      interestRate: interestRate,
      minimumPayment: minimumPayment,
      extraPayment: extraPayment,
      totalPayment: totalPayment,
      paymentFrequency: paymentFrequency,
      
      // Main calculations
      payoffTime: payoffTime,
      totalPayments: schedule.totalPayments,
      totalInterest: this.roundToCurrency(schedule.totalInterest),
      totalAmountPaid: this.roundToCurrency(totalAmountPaid),
      
      // Additional metrics
      interestPercentage: this.roundToCurrency(interestPercentage),
      averagePayment: this.roundToCurrency(averagePayment),
      interestSavings: this.roundToCurrency(interestSavings),
      
      // Formatted values for display
      currentBalanceFormatted: this.formatCurrency(currentBalance),
      totalPaymentFormatted: this.formatCurrency(totalPayment),
      totalInterestFormatted: this.formatCurrency(schedule.totalInterest),
      totalAmountPaidFormatted: this.formatCurrency(totalAmountPaid),
      interestRateFormatted: this.formatPercentage(interestRate),
      interestPercentageFormatted: this.formatPercentage(interestPercentage),
      averagePaymentFormatted: this.formatCurrency(averagePayment),
      interestSavingsFormatted: this.formatCurrency(interestSavings),
      
      // Schedule for detailed breakdown
      schedule: schedule.schedule
    };
  }

  /**
   * Calculate debt payoff with different strategies
   * @param {Array} debts - Array of debt objects with balance, rate, and minimum payment
   * @param {number} extraPayment - Extra payment amount
   * @param {string} strategy - Strategy type ('snowball' or 'avalanche')
   * @returns {Object} Strategy comparison results
   */
  calculateDebtStrategy(debts, extraPayment, strategy) {
    const results = {
      snowball: { totalTime: 0, totalInterest: 0, payoffOrder: [] },
      avalanche: { totalTime: 0, totalInterest: 0, payoffOrder: [] }
    };
    
    // Sort debts for each strategy
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
    const avalancheDebts = [...debts].sort((a, b) => b.rate - a.rate);
    
    // Calculate snowball strategy
    let remainingExtra = extraPayment;
    for (const debt of snowballDebts) {
      const debtResult = this.calculateDebtPayoff(
        debt.balance, 
        debt.rate, 
        debt.minimumPayment, 
        remainingExtra, 
        'monthly'
      );
      results.snowball.totalTime += debtResult.totalPayments;
      results.snowball.totalInterest += debtResult.totalInterest;
      results.snowball.payoffOrder.push({
        balance: debt.balance,
        rate: debt.rate,
        payoffTime: debtResult.payoffTime
      });
      remainingExtra = 0; // Extra payment goes to first debt only
    }
    
    // Calculate avalanche strategy
    remainingExtra = extraPayment;
    for (const debt of avalancheDebts) {
      const debtResult = this.calculateDebtPayoff(
        debt.balance, 
        debt.rate, 
        debt.minimumPayment, 
        remainingExtra, 
        'monthly'
      );
      results.avalanche.totalTime += debtResult.totalPayments;
      results.avalanche.totalInterest += debtResult.totalInterest;
      results.avalanche.payoffOrder.push({
        balance: debt.balance,
        rate: debt.rate,
        payoffTime: debtResult.payoffTime
      });
      remainingExtra = 0; // Extra payment goes to first debt only
    }
    
    return results;
  }

  /**
   * Calculate debt consolidation impact
   * @param {Array} debts - Array of current debts
   * @param {number} consolidationRate - New consolidated interest rate
   * @param {number} consolidationTerm - New loan term in years
   * @returns {Object} Consolidation comparison results
   */
  calculateDebtConsolidation(debts, consolidationRate, consolidationTerm) {
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const currentTotalPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    
    // Calculate current total interest
    let currentTotalInterest = 0;
    for (const debt of debts) {
      const result = this.calculateDebtPayoff(debt.balance, debt.rate, debt.minimumPayment, 0, 'monthly');
      currentTotalInterest += result.totalInterest;
    }
    
    // Calculate consolidation payment
    const monthlyRate = consolidationRate / 100 / 12;
    const totalPayments = consolidationTerm * 12;
    const consolidationPayment = totalBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                                 (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    // Calculate consolidation interest
    const consolidationInterest = (consolidationPayment * totalPayments) - totalBalance;
    
    return {
      currentTotalBalance: totalBalance,
      currentTotalPayment: currentTotalPayment,
      currentTotalInterest: currentTotalInterest,
      consolidationPayment: this.roundToCurrency(consolidationPayment),
      consolidationInterest: this.roundToCurrency(consolidationInterest),
      consolidationSavings: this.roundToCurrency(currentTotalInterest - consolidationInterest),
      paymentDifference: this.roundToCurrency(consolidationPayment - currentTotalPayment)
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
   * Main calculation function for debt payoff
   * @param {number} currentBalance - Current debt balance
   * @param {number} interestRate - Annual interest rate percentage
   * @param {number} minimumPayment - Minimum payment amount
   * @param {number} extraPayment - Extra payment amount
   * @param {string} paymentFrequency - Payment frequency
   * @returns {Object} Comprehensive debt payoff calculation results
   */
  calculateDebtPayoff(currentBalance, interestRate, minimumPayment, extraPayment, paymentFrequency) {
    // Convert to numbers and validate
    currentBalance = parseFloat(currentBalance);
    interestRate = parseFloat(interestRate);
    minimumPayment = parseFloat(minimumPayment);
    extraPayment = parseFloat(extraPayment || 0);
    
    const totalPayment = minimumPayment + extraPayment;
    
    // Calculate payoff schedule
    const schedule = this.calculatePayoffSchedule(currentBalance, interestRate, totalPayment, paymentFrequency);
    
    // Calculate additional metrics
    const totalAmountPaid = currentBalance + schedule.totalInterest;
    const interestPercentage = (schedule.totalInterest / totalAmountPaid) * 100;
    const averagePayment = totalAmountPaid / schedule.totalPayments;
    
    // Calculate interest savings if extra payment is made
    let interestSavings = 0;
    if (extraPayment > 0) {
      interestSavings = this.calculateInterestSavings(currentBalance, interestRate, minimumPayment, extraPayment, paymentFrequency);
    }
    
    // Format payoff time
    const payoffTime = this.formatPayoffTime(schedule.totalPayments, paymentFrequency);
    
    return {
      // Input values
      currentBalance: currentBalance,
      interestRate: interestRate,
      minimumPayment: minimumPayment,
      extraPayment: extraPayment,
      totalPayment: totalPayment,
      paymentFrequency: paymentFrequency,
      
      // Main calculations
      payoffTime: payoffTime,
      totalPayments: schedule.totalPayments,
      totalInterest: this.roundToCurrency(schedule.totalInterest),
      totalAmountPaid: this.roundToCurrency(totalAmountPaid),
      
      // Additional metrics
      interestPercentage: this.roundToCurrency(interestPercentage),
      averagePayment: this.roundToCurrency(averagePayment),
      interestSavings: this.roundToCurrency(interestSavings),
      
      // Formatted values for display
      currentBalanceFormatted: this.formatCurrency(currentBalance),
      totalPaymentFormatted: this.formatCurrency(totalPayment),
      totalInterestFormatted: this.formatCurrency(schedule.totalInterest),
      totalAmountPaidFormatted: this.formatCurrency(totalAmountPaid),
      interestRateFormatted: this.formatPercentage(interestRate),
      interestPercentageFormatted: this.formatPercentage(interestPercentage),
      averagePaymentFormatted: this.formatCurrency(averagePayment),
      interestSavingsFormatted: this.formatCurrency(interestSavings),
      
      // Schedule for detailed breakdown
      schedule: schedule.schedule
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
   * Get common debt types and their typical interest rates
   * @returns {Object} Common debt types with typical rates
   */
  getCommonDebtTypes() {
    return {
      'Credit Card': { min: 12, max: 30, typical: 18.99 },
      'Personal Loan': { min: 6, max: 36, typical: 12.5 },
      'Auto Loan': { min: 3, max: 15, typical: 6.5 },
      'Student Loan': { min: 3, max: 12, typical: 6.8 },
      'Home Equity Loan': { min: 4, max: 12, typical: 7.5 },
      'Payday Loan': { min: 200, max: 500, typical: 400 },
      'Medical Debt': { min: 0, max: 15, typical: 0 }
    };
  }
}

// Export for use in React component
export default DebtPayoffCalculator;
