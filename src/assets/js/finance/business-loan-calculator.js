// Business Loan Calculator Utility Functions
export class BusinessLoanCalculator {
  constructor() {
    this.steps = [];
  }

  /**
   * Calculate business loan payment with fees
   * @param {number} loanAmount - Original loan amount
   * @param {number} interestRateAnnual - Annual interest rate (percentage)
   * @param {string} compound - Compounding frequency (monthly, daily, annually)
   * @param {number} loanTermYears - Loan term in years
   * @param {number} loanTermMonths - Additional loan term in months
   * @param {string} paybackFrequency - Payment frequency (monthly, biweekly, weekly)
   * @param {number} originationFeePercent - Origination fee percentage
   * @param {number} documentationFee - Documentation fee amount
   * @param {number} otherFees - Other fees amount
   * @returns {object} Business loan calculation results
   */
  calculateBusinessLoan(
    loanAmount,
    interestRateAnnual,
    compound,
    loanTermYears,
    loanTermMonths,
    paybackFrequency,
    originationFeePercent,
    documentationFee,
    otherFees
  ) {
    try {
      // Validate inputs
      const validation = this.validateInputs(
        loanAmount,
        interestRateAnnual,
        loanTermYears,
        loanTermMonths,
        originationFeePercent
      );
      
      if (validation.error) {
        throw new Error(validation.error);
      }

      // Convert percentages to decimals
      const interestRate = interestRateAnnual / 100;
      const originationFee = originationFeePercent / 100;

      // Calculate fees
      const totalOriginationFee = loanAmount * originationFee;
      const totalFees = totalOriginationFee + documentationFee + otherFees;
      const loanAmountWithFees = loanAmount + totalFees;

      // Calculate total loan term in months
      const totalLoanTermMonths = (loanTermYears * 12) + loanTermMonths;

      // Calculate rate per period and number of payments
      let ratePerPeriod, numberOfPayments;

      switch (paybackFrequency) {
        case 'monthly':
          ratePerPeriod = this.getMonthlyRate(interestRate, compound);
          numberOfPayments = totalLoanTermMonths;
          break;
        case 'biweekly':
          ratePerPeriod = this.getMonthlyRate(interestRate, compound) / 2;
          numberOfPayments = totalLoanTermMonths * 2;
          break;
        case 'weekly':
          ratePerPeriod = this.getMonthlyRate(interestRate, compound) / 4;
          numberOfPayments = totalLoanTermMonths * 4;
          break;
        default:
          ratePerPeriod = this.getMonthlyRate(interestRate, compound);
          numberOfPayments = totalLoanTermMonths;
      }

      // Calculate payment
      const payment = this.calculatePayment(loanAmountWithFees, ratePerPeriod, numberOfPayments);
      const totalAmountToPay = payment * numberOfPayments;
      const totalInterest = totalAmountToPay - loanAmountWithFees;
      const totalCost = loanAmountWithFees + totalInterest;

      return {
        payment,
        totalInterest,
        totalFees,
        loanAmountWithFees,
        paybackFrequency,
        totalAmountToPay,
        totalCost,
        originalLoanAmount: loanAmount,
        totalOriginationFee,
        documentationFee,
        otherFees,
        numberOfPayments,
        ratePerPeriod,
        loanTermYears,
        loanTermMonths,
        totalLoanTermMonths
      };
    } catch (error) {
      throw new Error(`Calculation error: ${error.message}`);
    }
  }

  /**
   * Get monthly interest rate based on compounding frequency
   * @param {number} annualRate - Annual interest rate (decimal)
   * @param {string} compound - Compounding frequency
   * @returns {number} Monthly interest rate
   */
  getMonthlyRate(annualRate, compound) {
    switch (compound) {
      case 'monthly':
        return annualRate / 12;
      case 'daily':
        return Math.pow(1 + annualRate / 365, 365 / 12) - 1;
      case 'annually':
        return Math.pow(1 + annualRate, 1 / 12) - 1;
      default:
        return annualRate / 12;
    }
  }

  /**
   * Calculate payment amount using the loan payment formula
   * @param {number} principal - Principal amount
   * @param {number} rate - Rate per period
   * @param {number} numberOfPayments - Total number of payments
   * @returns {number} Payment amount per period
   */
  calculatePayment(principal, rate, numberOfPayments) {
    if (rate === 0 || numberOfPayments === 0) {
      return numberOfPayments > 0 ? principal / numberOfPayments : 0;
    }

    const numerator = principal * rate * Math.pow(1 + rate, numberOfPayments);
    const denominator = Math.pow(1 + rate, numberOfPayments) - 1;

    if (denominator === 0) {
      return principal / numberOfPayments;
    }

    return numerator / denominator;
  }

  /**
   * Validate business loan inputs
   * @param {number} loanAmount - Loan amount
   * @param {number} interestRateAnnual - Annual interest rate
   * @param {number} loanTermYears - Loan term in years
   * @param {number} loanTermMonths - Additional loan term in months
   * @param {number} originationFeePercent - Origination fee percentage
   * @returns {object} Validation result
   */
  validateInputs(loanAmount, interestRateAnnual, loanTermYears, loanTermMonths, originationFeePercent) {
    if (!loanAmount || loanAmount <= 0) {
      return { error: 'Please enter a valid loan amount greater than 0.' };
    }

    if (interestRateAnnual < 0 || interestRateAnnual > 100) {
      return { error: 'Please enter a valid interest rate between 0 and 100.' };
    }

    const totalLoanTermMonths = (loanTermYears * 12) + loanTermMonths;
    if (totalLoanTermMonths <= 0) {
      return { error: 'Please enter a valid loan term (at least 1 month).' };
    }

    if (originationFeePercent < 0 || originationFeePercent > 100) {
      return { error: 'Please enter a valid origination fee percentage between 0 and 100.' };
    }

    return { valid: true };
  }

  /**
   * Get frequency text for display
   * @param {string} frequency - Payment frequency
   * @returns {string} Formatted frequency text
   */
  getFrequencyText(frequency) {
    const frequencyMap = {
      'monthly': 'Monthly',
      'biweekly': 'Bi-weekly',
      'weekly': 'Weekly'
    };
    return frequencyMap[frequency] || 'Monthly';
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return `$${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /**
   * Format percentage for display
   * @param {number} percentage - Percentage to format
   * @returns {string} Formatted percentage string
   */
  formatPercentage(percentage) {
    return `${parseFloat(percentage).toFixed(2)}%`;
  }

  /**
   * Reset calculator state
   */
  reset() {
    this.steps = [];
  }
}
