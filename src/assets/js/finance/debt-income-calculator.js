/**
 * Debt Income Calculator - JavaScript Logic
 * Handles all debt-to-income ratio calculations and financial health assessments
 */

class DebtIncomeCalculator {
  constructor() {
    // Default values
    this.maxIncome = 10000000; // Maximum $10M income
    this.minIncome = 1; // Minimum $1 income
    this.maxDebt = 1000000; // Maximum $1M debt payment
    this.maxDTI = 100; // Maximum 100% DTI ratio
  }

  /**
   * Validate all input parameters
   * @param {number} salary - Salary amount
   * @param {number} pension - Pension amount
   * @param {number} investment - Investment income
   * @param {number} otherIncome - Other income
   * @param {number} rentalCost - Rental cost
   * @param {number} mortgage - Mortgage payment
   * @param {number} hoaFees - HOA fees
   * @param {number} creditCards - Credit card payments
   * @param {number} studentLoan - Student loan payment
   * @param {number} autoLoan - Auto loan payment
   * @param {number} otherLoans - Other loan payments
   * @param {number} propertyTax - Property tax
   * @param {number} homeownerInsurance - Homeowner insurance
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(salary, pension, investment, otherIncome, rentalCost, mortgage, hoaFees, creditCards, studentLoan, autoLoan, otherLoans, propertyTax, homeownerInsurance) {
    const errors = [];

    // Validate that at least one income source is provided
    const totalIncome = (salary || 0) + (pension || 0) + (investment || 0) + (otherIncome || 0);
    if (totalIncome <= 0) {
      errors.push('Please enter at least one income source (salary, pension, investment, or other income).');
    }

    // Validate individual income amounts
    const incomeSources = [
      { name: 'Salary', value: salary },
      { name: 'Pension', value: pension },
      { name: 'Investment Income', value: investment },
      { name: 'Other Income', value: otherIncome }
    ];

    for (const source of incomeSources) {
      if (source.value !== undefined && source.value !== null && source.value !== '' && 
          (isNaN(source.value) || source.value < 0 || source.value > this.maxIncome)) {
        errors.push(`Please enter a valid ${source.name} amount between $0 and $${this.maxIncome.toLocaleString()}.`);
      }
    }

    // Validate debt amounts
    const debtSources = [
      { name: 'Rental Cost', value: rentalCost },
      { name: 'Mortgage Payment', value: mortgage },
      { name: 'HOA Fees', value: hoaFees },
      { name: 'Credit Card Payments', value: creditCards },
      { name: 'Student Loan', value: studentLoan },
      { name: 'Auto Loan', value: autoLoan },
      { name: 'Other Loans', value: otherLoans },
      { name: 'Property Tax', value: propertyTax },
      { name: 'Homeowner Insurance', value: homeownerInsurance }
    ];

    for (const debt of debtSources) {
      if (debt.value !== undefined && debt.value !== null && debt.value !== '' && 
          (isNaN(debt.value) || debt.value < 0 || debt.value > this.maxDebt)) {
        errors.push(`Please enter a valid ${debt.name} amount between $0 and $${this.maxDebt.toLocaleString()}.`);
      }
    }

    return errors;
  }

  /**
   * Convert amount to annual value
   * @param {number} amount - Amount to convert
   * @param {string} period - Period (year or month)
   * @returns {number} Annual amount
   */
  convertToAnnual(amount, period) {
    if (!amount || isNaN(amount)) return 0;
    return period === 'month' ? amount * 12 : amount;
  }

  /**
   * Convert amount to monthly value
   * @param {number} amount - Amount to convert
   * @param {string} period - Period (year or month)
   * @returns {number} Monthly amount
   */
  convertToMonthly(amount, period) {
    if (!amount || isNaN(amount)) return 0;
    return period === 'year' ? amount / 12 : amount;
  }

  /**
   * Calculate total annual income
   * @param {Object} incomeData - Income data with amounts and periods
   * @returns {number} Total annual income
   */
  calculateTotalAnnualIncome(incomeData) {
    const { salary, salaryPeriod, pension, pensionPeriod, investment, investmentPeriod, otherIncome, otherIncomePeriod } = incomeData;
    
    const annualSalary = this.convertToAnnual(salary, salaryPeriod);
    const annualPension = this.convertToAnnual(pension, pensionPeriod);
    const annualInvestment = this.convertToAnnual(investment, investmentPeriod);
    const annualOtherIncome = this.convertToAnnual(otherIncome, otherIncomePeriod);
    
    return annualSalary + annualPension + annualInvestment + annualOtherIncome;
  }

  /**
   * Calculate total monthly debt
   * @param {Object} debtData - Debt data with amounts and periods
   * @returns {number} Total monthly debt
   */
  calculateTotalMonthlyDebt(debtData) {
    const { 
      rentalCost, rentalCostPeriod, 
      mortgage, mortgagePeriod, 
      hoaFees, hoaFeesPeriod, 
      creditCards, creditCardsPeriod, 
      studentLoan, studentLoanPeriod, 
      autoLoan, autoLoanPeriod, 
      otherLoans, otherLoansPeriod, 
      propertyTax, propertyTaxPeriod, 
      homeownerInsurance, homeownerInsurancePeriod 
    } = debtData;
    
    const monthlyRentalCost = this.convertToMonthly(rentalCost, rentalCostPeriod);
    const monthlyMortgage = this.convertToMonthly(mortgage, mortgagePeriod);
    const monthlyHoaFees = this.convertToMonthly(hoaFees, hoaFeesPeriod);
    const monthlyCreditCards = this.convertToMonthly(creditCards, creditCardsPeriod);
    const monthlyStudentLoan = this.convertToMonthly(studentLoan, studentLoanPeriod);
    const monthlyAutoLoan = this.convertToMonthly(autoLoan, autoLoanPeriod);
    const monthlyOtherLoans = this.convertToMonthly(otherLoans, otherLoansPeriod);
    const monthlyPropertyTax = this.convertToMonthly(propertyTax, propertyTaxPeriod);
    const monthlyHomeownerInsurance = this.convertToMonthly(homeownerInsurance, homeownerInsurancePeriod);
    
    return monthlyRentalCost + monthlyMortgage + monthlyHoaFees + monthlyCreditCards + 
           monthlyStudentLoan + monthlyAutoLoan + monthlyOtherLoans + monthlyPropertyTax + monthlyHomeownerInsurance;
  }

  /**
   * Calculate debt-to-income ratio
   * @param {number} monthlyDebt - Total monthly debt
   * @param {number} monthlyIncome - Total monthly income
   * @returns {number} DTI ratio percentage
   */
  calculateDTIRatio(monthlyDebt, monthlyIncome) {
    if (monthlyIncome === 0) return 0;
    return (monthlyDebt / monthlyIncome) * 100;
  }

  /**
   * Determine financial health status based on DTI ratio
   * @param {number} dtiRatio - Debt-to-income ratio
   * @returns {Object} Health status information
   */
  determineFinancialHealth(dtiRatio) {
    let status, eligibility, recommendation;
    
    if (dtiRatio < 36) {
      status = 'Excellent';
      eligibility = 'High approval chances';
      recommendation = 'Your financial health is excellent. You have good flexibility and should qualify for most loans with favorable terms.';
    } else if (dtiRatio >= 36 && dtiRatio <= 43) {
      status = 'Good';
      eligibility = 'Good approval chances';
      recommendation = 'Your DTI ratio is manageable but approaching the upper limit. Consider reducing debt before taking on new obligations.';
    } else if (dtiRatio > 43 && dtiRatio <= 50) {
      status = 'Caution';
      eligibility = 'Limited approval chances';
      recommendation = 'Your DTI ratio is high. Many lenders may be hesitant to approve new loans. Focus on paying down existing debt.';
    } else {
      status = 'Warning';
      eligibility = 'Low approval chances';
      recommendation = 'Your DTI ratio is very high and indicates financial stress. Immediate action is needed to reduce debt and improve your financial health.';
    }
    
    return { status, eligibility, recommendation };
  }

  /**
   * Main calculation function for debt-to-income ratio
   * @param {number} salary - Salary amount
   * @param {string} salaryPeriod - Salary period
   * @param {number} pension - Pension amount
   * @param {string} pensionPeriod - Pension period
   * @param {number} investment - Investment income
   * @param {string} investmentPeriod - Investment period
   * @param {number} otherIncome - Other income
   * @param {string} otherIncomePeriod - Other income period
   * @param {number} rentalCost - Rental cost
   * @param {string} rentalCostPeriod - Rental cost period
   * @param {number} mortgage - Mortgage payment
   * @param {string} mortgagePeriod - Mortgage period
   * @param {number} hoaFees - HOA fees
   * @param {string} hoaFeesPeriod - HOA fees period
   * @param {number} creditCards - Credit card payments
   * @param {string} creditCardsPeriod - Credit card period
   * @param {number} studentLoan - Student loan payment
   * @param {string} studentLoanPeriod - Student loan period
   * @param {number} autoLoan - Auto loan payment
   * @param {string} autoLoanPeriod - Auto loan period
   * @param {number} otherLoans - Other loan payments
   * @param {string} otherLoansPeriod - Other loan period
   * @param {number} propertyTax - Property tax
   * @param {string} propertyTaxPeriod - Property tax period
   * @param {number} homeownerInsurance - Homeowner insurance
   * @param {string} homeownerInsurancePeriod - Homeowner insurance period
   * @returns {Object} Comprehensive debt-to-income calculation results
   */
  calculateDebtIncome(salary, salaryPeriod, pension, pensionPeriod, investment, investmentPeriod, otherIncome, otherIncomePeriod, rentalCost, rentalCostPeriod, mortgage, mortgagePeriod, hoaFees, hoaFeesPeriod, creditCards, creditCardsPeriod, studentLoan, studentLoanPeriod, autoLoan, autoLoanPeriod, otherLoans, otherLoansPeriod, propertyTax, propertyTaxPeriod, homeownerInsurance, homeownerInsurancePeriod) {
    // Convert to numbers and validate
    salary = parseFloat(salary || 0);
    pension = parseFloat(pension || 0);
    investment = parseFloat(investment || 0);
    otherIncome = parseFloat(otherIncome || 0);
    rentalCost = parseFloat(rentalCost || 0);
    mortgage = parseFloat(mortgage || 0);
    hoaFees = parseFloat(hoaFees || 0);
    creditCards = parseFloat(creditCards || 0);
    studentLoan = parseFloat(studentLoan || 0);
    autoLoan = parseFloat(autoLoan || 0);
    otherLoans = parseFloat(otherLoans || 0);
    propertyTax = parseFloat(propertyTax || 0);
    homeownerInsurance = parseFloat(homeownerInsurance || 0);

    // Calculate income breakdown
    const incomeData = {
      salary, salaryPeriod,
      pension, pensionPeriod,
      investment, investmentPeriod,
      otherIncome, otherIncomePeriod
    };

    const totalAnnualIncome = this.calculateTotalAnnualIncome(incomeData);
    const totalMonthlyIncome = totalAnnualIncome / 12;

    const incomeBreakdown = {
      salary: this.convertToAnnual(salary, salaryPeriod),
      pension: this.convertToAnnual(pension, pensionPeriod),
      investment: this.convertToAnnual(investment, investmentPeriod),
      otherIncome: this.convertToAnnual(otherIncome, otherIncomePeriod)
    };

    // Calculate debt breakdown
    const debtData = {
      rentalCost, rentalCostPeriod,
      mortgage, mortgagePeriod,
      hoaFees, hoaFeesPeriod,
      creditCards, creditCardsPeriod,
      studentLoan, studentLoanPeriod,
      autoLoan, autoLoanPeriod,
      otherLoans, otherLoansPeriod,
      propertyTax, propertyTaxPeriod,
      homeownerInsurance, homeownerInsurancePeriod
    };

    const totalMonthlyDebt = this.calculateTotalMonthlyDebt(debtData);

    const debtBreakdown = {
      rentalCost: this.convertToMonthly(rentalCost, rentalCostPeriod),
      mortgage: this.convertToMonthly(mortgage, mortgagePeriod),
      hoaFees: this.convertToMonthly(hoaFees, hoaFeesPeriod),
      creditCards: this.convertToMonthly(creditCards, creditCardsPeriod),
      studentLoan: this.convertToMonthly(studentLoan, studentLoanPeriod),
      autoLoan: this.convertToMonthly(autoLoan, autoLoanPeriod),
      otherLoans: this.convertToMonthly(otherLoans, otherLoansPeriod),
      propertyTax: this.convertToMonthly(propertyTax, propertyTaxPeriod),
      homeownerInsurance: this.convertToMonthly(homeownerInsurance, homeownerInsurancePeriod)
    };

    // Calculate DTI ratio
    const debtToIncomeRatio = this.calculateDTIRatio(totalMonthlyDebt, totalMonthlyIncome);

    // Determine financial health
    const healthInfo = this.determineFinancialHealth(debtToIncomeRatio);

    return {
      // Input values
      salary, salaryPeriod,
      pension, pensionPeriod,
      investment, investmentPeriod,
      otherIncome, otherIncomePeriod,
      rentalCost, rentalCostPeriod,
      mortgage, mortgagePeriod,
      hoaFees, hoaFeesPeriod,
      creditCards, creditCardsPeriod,
      studentLoan, studentLoanPeriod,
      autoLoan, autoLoanPeriod,
      otherLoans, otherLoansPeriod,
      propertyTax, propertyTaxPeriod,
      homeownerInsurance, homeownerInsurancePeriod,

      // Main calculations
      totalAnnualIncome: this.roundToCurrency(totalAnnualIncome),
      totalMonthlyIncome: this.roundToCurrency(totalMonthlyIncome),
      totalMonthlyDebt: this.roundToCurrency(totalMonthlyDebt),
      debtToIncomeRatio: this.roundToCurrency(debtToIncomeRatio),

      // Breakdowns
      incomeBreakdown: {
        salary: this.roundToCurrency(incomeBreakdown.salary),
        pension: this.roundToCurrency(incomeBreakdown.pension),
        investment: this.roundToCurrency(incomeBreakdown.investment),
        otherIncome: this.roundToCurrency(incomeBreakdown.otherIncome)
      },
      debtBreakdown: {
        rentalCost: this.roundToCurrency(debtBreakdown.rentalCost),
        mortgage: this.roundToCurrency(debtBreakdown.mortgage),
        hoaFees: this.roundToCurrency(debtBreakdown.hoaFees),
        creditCards: this.roundToCurrency(debtBreakdown.creditCards),
        studentLoan: this.roundToCurrency(debtBreakdown.studentLoan),
        autoLoan: this.roundToCurrency(debtBreakdown.autoLoan),
        otherLoans: this.roundToCurrency(debtBreakdown.otherLoans),
        propertyTax: this.roundToCurrency(debtBreakdown.propertyTax),
        homeownerInsurance: this.roundToCurrency(debtBreakdown.homeownerInsurance)
      },

      // Health assessment
      healthStatus: healthInfo.status,
      loanEligibility: healthInfo.eligibility,
      recommendation: healthInfo.recommendation,

      // Formatted values for display
      totalAnnualIncomeFormatted: this.formatCurrency(totalAnnualIncome),
      totalMonthlyIncomeFormatted: this.formatCurrency(totalMonthlyIncome),
      totalMonthlyDebtFormatted: this.formatCurrency(totalMonthlyDebt),
      debtToIncomeRatioFormatted: this.formatPercentage(debtToIncomeRatio)
    };
  }

  /**
   * Calculate front-end DTI (housing costs only)
   * @param {number} housingCosts - Monthly housing costs
   * @param {number} monthlyIncome - Monthly income
   * @returns {number} Front-end DTI ratio
   */
  calculateFrontEndDTI(housingCosts, monthlyIncome) {
    return this.calculateDTIRatio(housingCosts, monthlyIncome);
  }

  /**
   * Calculate back-end DTI (all debt payments)
   * @param {number} totalDebt - Total monthly debt
   * @param {number} monthlyIncome - Monthly income
   * @returns {number} Back-end DTI ratio
   */
  calculateBackEndDTI(totalDebt, monthlyIncome) {
    return this.calculateDTIRatio(totalDebt, monthlyIncome);
  }

  /**
   * Get DTI benchmarks and guidelines
   * @returns {Object} DTI benchmarks
   */
  getDTIBenchmarks() {
    return {
      'excellent': { min: 0, max: 35, description: 'Excellent financial health' },
      'good': { min: 36, max: 43, description: 'Good financial health' },
      'caution': { min: 44, max: 50, description: 'Caution - high DTI' },
      'warning': { min: 51, max: 100, description: 'Warning - very high DTI' },
      'lender_preference': { max: 43, description: 'Preferred by most lenders' },
      'mortgage_limit': { max: 50, description: 'Maximum for most mortgages' }
    };
  }

  /**
   * Calculate maximum affordable debt payment
   * @param {number} monthlyIncome - Monthly income
   * @param {number} targetDTI - Target DTI ratio
   * @returns {number} Maximum affordable debt payment
   */
  calculateMaxAffordableDebt(monthlyIncome, targetDTI = 36) {
    return monthlyIncome * (targetDTI / 100);
  }

  /**
   * Calculate required income for target DTI
   * @param {number} monthlyDebt - Monthly debt payments
   * @param {number} targetDTI - Target DTI ratio
   * @returns {number} Required monthly income
   */
  calculateRequiredIncome(monthlyDebt, targetDTI = 36) {
    if (targetDTI === 0) return 0;
    return monthlyDebt / (targetDTI / 100);
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
}

// Export for use in React component
export default DebtIncomeCalculator;
