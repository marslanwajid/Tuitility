// Loan Calculator Utility Functions
export class LoanCalculator {
  constructor() {
    this.steps = [];
  }

  /**
   * Calculate basic loan payment
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate (percentage)
   * @param {number} termMonths - Loan term in months
   * @returns {object} Basic loan calculation results
   */
  calculateBasicLoan(principal, annualRate, termMonths) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termMonths;
    
    let monthlyPayment;
    
    if (monthlyRate === 0) {
      monthlyPayment = principal / numberOfPayments;
    } else {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      monthlyPayment = principal * (numerator / denominator);
    }

    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - principal;

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      principal,
      numberOfPayments,
      annualRate
    };
  }

  /**
   * Calculate advanced loan payment with down payment and fees
   * @param {number} principal - Original loan amount
   * @param {number} annualRate - Annual interest rate (percentage)
   * @param {number} termMonths - Loan term in months
   * @param {number} downPayment - Down payment amount
   * @param {number} monthlyFees - Additional monthly fees
   * @returns {object} Advanced loan calculation results
   */
  calculateAdvancedLoan(principal, annualRate, termMonths, downPayment = 0, monthlyFees = 0) {
    const actualLoanAmount = Math.max(0, principal - downPayment);
    
    if (actualLoanAmount <= 0) {
      throw new Error('Loan amount must be greater than down payment');
    }

    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termMonths;
    
    let principalAndInterest;
    
    if (monthlyRate === 0) {
      principalAndInterest = actualLoanAmount / numberOfPayments;
    } else {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      principalAndInterest = actualLoanAmount * (numerator / denominator);
    }

    // Calculate totals
    const totalMonthlyPayment = principalAndInterest + monthlyFees;
    const totalInterest = (principalAndInterest * numberOfPayments) - actualLoanAmount;
    const totalOfPayments = principalAndInterest * numberOfPayments;
    const totalFeesOverTerm = monthlyFees * numberOfPayments;
    const totalCost = totalOfPayments + totalFeesOverTerm + downPayment;

    // Calculate loan-to-value ratio
    const loanToValueRatio = (actualLoanAmount / principal) * 100;

    return {
      principalAndInterest,
      totalMonthlyPayment,
      totalInterest,
      totalOfPayments,
      totalFeesOverTerm,
      totalCost,
      downPayment,
      actualLoanAmount,
      loanToValueRatio,
      numberOfPayments,
      monthlyFees,
      principal
    };
  }

  /**
   * Validate loan inputs
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate
   * @param {number} termMonths - Loan term in months
   * @param {number} downPayment - Down payment amount
   * @returns {object} Validation result
   */
  validateInputs(principal, annualRate, termMonths, downPayment = 0) {
    const errors = [];

    if (!principal || principal <= 0) {
      errors.push('Loan amount must be greater than 0');
    }

    if (!annualRate || annualRate <= 0) {
      errors.push('Interest rate must be greater than 0');
    }

    if (!termMonths || termMonths <= 0) {
      errors.push('Loan term must be greater than 0');
    }

    if (downPayment < 0) {
      errors.push('Down payment cannot be negative');
    }

    if (downPayment >= principal) {
      errors.push('Down payment cannot be greater than or equal to loan amount');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate amortization schedule
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate
   * @param {number} termMonths - Loan term in months
   * @param {number} downPayment - Down payment amount
   * @returns {array} Amortization schedule
   */
  generateAmortizationSchedule(principal, annualRate, termMonths, downPayment = 0) {
    const actualLoanAmount = Math.max(0, principal - downPayment);
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termMonths;
    
    let monthlyPayment;
    
    if (monthlyRate === 0) {
      monthlyPayment = actualLoanAmount / numberOfPayments;
    } else {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      monthlyPayment = actualLoanAmount * (numerator / denominator);
    }

    const schedule = [];
    let remainingBalance = actualLoanAmount;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      schedule.push({
        month,
        payment: monthlyPayment,
        principalPayment,
        interestPayment,
        remainingBalance
      });
    }

    return schedule;
  }

  /**
   * Calculate loan affordability
   * @param {number} monthlyIncome - Monthly gross income
   * @param {number} monthlyDebts - Existing monthly debt payments
   * @param {number} annualRate - Annual interest rate
   * @param {number} termMonths - Loan term in months
   * @param {number} downPaymentPercent - Down payment as percentage
   * @returns {object} Affordability analysis
   */
  calculateAffordability(monthlyIncome, monthlyDebts, annualRate, termMonths, downPaymentPercent = 20) {
    // Standard debt-to-income ratio limits
    const maxDTI = 0.43; // 43% maximum debt-to-income ratio
    const maxHousingDTI = 0.28; // 28% maximum housing debt-to-income ratio

    const maxTotalDebt = monthlyIncome * maxDTI;
    const maxHousingDebt = monthlyIncome * maxHousingDTI;
    const availableForHousing = maxHousingDebt - monthlyDebts;

    if (availableForHousing <= 0) {
      return {
        affordable: false,
        reason: 'Existing debt payments exceed maximum housing allowance',
        maxLoanAmount: 0,
        maxHomePrice: 0
      };
    }

    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termMonths;
    
    let maxMonthlyPayment;
    
    if (monthlyRate === 0) {
      maxMonthlyPayment = availableForHousing;
    } else {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      maxMonthlyPayment = availableForHousing / (numerator / denominator);
    }

    const maxLoanAmount = maxMonthlyPayment;
    const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);

    return {
      affordable: true,
      maxLoanAmount,
      maxHomePrice,
      maxMonthlyPayment: availableForHousing,
      debtToIncomeRatio: (monthlyDebts / monthlyIncome) * 100,
      housingDebtToIncomeRatio: (availableForHousing / monthlyIncome) * 100
    };
  }

  /**
   * Format currency
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
   * Format percentage
   * @param {number} value - Value to format as percentage
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Calculate loan comparison
   * @param {array} loans - Array of loan options
   * @returns {array} Sorted loan options with comparison data
   */
  compareLoans(loans) {
    return loans.map(loan => {
      const result = this.calculateAdvancedLoan(
        loan.principal,
        loan.annualRate,
        loan.termMonths,
        loan.downPayment || 0,
        loan.monthlyFees || 0
      );

      return {
        ...loan,
        ...result,
        totalCost: result.totalCost,
        monthlyPayment: result.totalMonthlyPayment
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }

  /**
   * Calculate early payoff savings
   * @param {number} principal - Original loan amount
   * @param {number} annualRate - Annual interest rate
   * @param {number} originalTerm - Original loan term in months
   * @param {number} newTerm - New loan term in months
   * @returns {object} Early payoff analysis
   */
  calculateEarlyPayoffSavings(principal, annualRate, originalTerm, newTerm) {
    if (newTerm >= originalTerm) {
      return {
        savings: 0,
        monthlyPaymentIncrease: 0,
        totalInterestSaved: 0
      };
    }

    const originalLoan = this.calculateBasicLoan(principal, annualRate, originalTerm);
    const newLoan = this.calculateBasicLoan(principal, annualRate, newTerm);

    const totalInterestSaved = originalLoan.totalInterest - newLoan.totalInterest;
    const monthlyPaymentIncrease = newLoan.monthlyPayment - originalLoan.monthlyPayment;

    return {
      savings: totalInterestSaved,
      monthlyPaymentIncrease,
      totalInterestSaved,
      originalMonthlyPayment: originalLoan.monthlyPayment,
      newMonthlyPayment: newLoan.monthlyPayment,
      originalTotalInterest: originalLoan.totalInterest,
      newTotalInterest: newLoan.totalInterest
    };
  }
}

// Export utility functions for backward compatibility
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

export const validateLoanInputs = (principal, annualRate, termMonths, downPayment = 0) => {
  const calculator = new LoanCalculator();
  return calculator.validateInputs(principal, annualRate, termMonths, downPayment);
};

export const calculateLoanPayment = (principal, annualRate, termMonths, downPayment = 0, monthlyFees = 0) => {
  const calculator = new LoanCalculator();
  return calculator.calculateAdvancedLoan(principal, annualRate, termMonths, downPayment, monthlyFees);
};
