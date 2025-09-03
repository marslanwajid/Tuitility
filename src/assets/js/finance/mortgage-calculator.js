// Mortgage Calculator Utility Functions

export class MortgageCalculator {
  constructor() {
    this.steps = [];
  }

  calculateBasicMortgage(loanAmount, annualRate, termYears) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termYears * 12;
    
    let monthlyPayment;
    
    if (monthlyRate === 0) {
      // Handle 0% interest rate
      monthlyPayment = loanAmount / numberOfPayments;
    } else {
      // Standard mortgage calculation
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      monthlyPayment = loanAmount * (numerator / denominator);
    }
    
    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - loanAmount;
    
    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      loanAmount,
      numberOfPayments
    };
  }

  calculateAdvancedMortgage(loanAmount, annualRate, termYears, downPayment = 0, propertyTax = 0, insurance = 0, pmiRate = 0, hoaFees = 0) {
    // Calculate actual loan amount after down payment
    const actualLoanAmount = Math.max(0, loanAmount - downPayment);
    
    if (actualLoanAmount <= 0) {
      throw new Error('Down payment cannot be greater than or equal to the loan amount.');
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termYears * 12;
    
    let principalAndInterest;
    
    if (monthlyRate === 0) {
      principalAndInterest = actualLoanAmount / numberOfPayments;
    } else {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      principalAndInterest = actualLoanAmount * (numerator / denominator);
    }
    
    // Calculate monthly costs
    const monthlyPropertyTax = propertyTax / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyPMI = (actualLoanAmount * pmiRate / 100) / 12;
    
    const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoaFees;
    
    // Calculate totals
    const totalInterest = (principalAndInterest * numberOfPayments) - actualLoanAmount;
    const totalOfPayments = principalAndInterest * numberOfPayments;
    const loanToValueRatio = (actualLoanAmount / loanAmount) * 100;
    
    return {
      principalAndInterest,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyPMI,
      hoaFees,
      totalMonthlyPayment,
      totalInterest,
      totalOfPayments,
      downPayment,
      loanToValueRatio,
      actualLoanAmount,
      loanAmount,
      numberOfPayments
    };
  }

  validateInputs(loanAmount, interestRate, loanTerm, downPayment = 0) {
    const errors = [];
    
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      errors.push('Please enter a valid loan amount greater than 0.');
    }

    if (!interestRate || parseFloat(interestRate) <= 0) {
      errors.push('Please enter a valid interest rate greater than 0.');
    }

    if (!loanTerm || parseInt(loanTerm) <= 0 || parseInt(loanTerm) > 50) {
      errors.push('Please enter a valid loan term between 1 and 50 years.');
    }

    if (downPayment && parseFloat(downPayment) >= parseFloat(loanAmount)) {
      errors.push('Down payment cannot be greater than or equal to the loan amount.');
    }

    return errors;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(value) {
    return `${parseFloat(value).toFixed(2)}%`;
  }

  generateAmortizationSchedule(loanAmount, annualRate, termYears, downPayment = 0) {
    const actualLoanAmount = Math.max(0, loanAmount - downPayment);
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = termYears * 12;
    
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
    
    for (let month = 1; month <= Math.min(numberOfPayments, 12); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    
    return schedule;
  }

  calculateAffordability(monthlyIncome, monthlyDebts, downPaymentPercent = 20, propertyTaxRate = 1.1, insuranceRate = 0.5) {
    // 28/36 rule: 28% of gross income for housing, 36% for total debt
    const maxHousingPayment = monthlyIncome * 0.28;
    const maxTotalDebtPayment = monthlyIncome * 0.36;
    const maxDebtPayment = maxTotalDebtPayment - monthlyDebts;
    
    // Use the lower of the two limits
    const maxPayment = Math.min(maxHousingPayment, maxDebtPayment);
    
    // Estimate property tax and insurance
    const estimatedPropertyTax = 0;
    const estimatedInsurance = 0;
    
    // Calculate maximum loan amount (simplified calculation)
    const maxLoanAmount = maxPayment * 12 * 30; // Rough estimate
    
    // Calculate maximum home price
    const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);
    
    return {
      maxHousingPayment,
      maxTotalDebtPayment,
      maxDebtPayment,
      maxPayment,
      maxLoanAmount,
      maxHomePrice,
      downPaymentPercent,
      propertyTaxRate,
      insuranceRate
    };
  }
}

// Export utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value) => {
  return `${parseFloat(value).toFixed(2)}%`;
};

export const validateMortgageInputs = (loanAmount, interestRate, loanTerm, downPayment = 0) => {
  const errors = [];
  
  if (!loanAmount || parseFloat(loanAmount) <= 0) {
    errors.push('Please enter a valid loan amount greater than 0.');
  }

  if (!interestRate || parseFloat(interestRate) <= 0) {
    errors.push('Please enter a valid interest rate greater than 0.');
  }

  if (!loanTerm || parseInt(loanTerm) <= 0 || parseInt(loanTerm) > 50) {
    errors.push('Please enter a valid loan term between 1 and 50 years.');
  }

  if (downPayment && parseFloat(downPayment) >= parseFloat(loanAmount)) {
    errors.push('Down payment cannot be greater than or equal to the loan amount.');
  }

  return errors;
};
