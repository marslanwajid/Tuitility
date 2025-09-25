/**
 * Rental Property Calculator - JavaScript Logic
 * Handles all rental property calculations including cash flow, ROI, and investment analysis
 */

class RentalPropertyCalculator {
  constructor() {
    // Default values
    this.maxPurchasePrice = 10000000; // Maximum $10M purchase price
    this.minPurchasePrice = 1000; // Minimum $1K purchase price
    this.maxInterestRate = 30; // Maximum 30% interest rate
    this.maxLoanTerm = 50; // Maximum 50 years loan term
    this.maxHoldingLength = 50; // Maximum 50 years holding period
  }

  /**
   * Validate all input parameters
   * @param {number} purchasePrice - Purchase price
   * @param {boolean} useLoan - Whether to use loan financing
   * @param {number} downPayment - Down payment percentage
   * @param {number} interestRate - Interest rate percentage
   * @param {number} loanTerm - Loan term in years
   * @param {number} closingCost - Closing costs
   * @param {boolean} needRepairs - Whether property needs repairs
   * @param {number} repairCost - Repair costs
   * @param {number} valueAfterRepairs - Value after repairs
   * @param {number} monthlyRent - Monthly rent
   * @param {number} vacancyRate - Vacancy rate percentage
   * @param {number} managementFee - Management fee percentage
   * @param {number} propertyTax - Annual property tax
   * @param {number} insurance - Annual insurance
   * @param {number} maintenance - Annual maintenance
   * @param {boolean} knowSellPrice - Whether user knows future sale price
   * @param {number} sellPrice - Future sale price
   * @param {number} valueAppreciation - Annual appreciation rate
   * @param {number} holdingLength - Holding period in years
   * @param {number} costToSell - Cost to sell percentage
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(purchasePrice, useLoan, downPayment, interestRate, loanTerm, closingCost, needRepairs, repairCost, valueAfterRepairs, monthlyRent, vacancyRate, managementFee, propertyTax, insurance, maintenance, knowSellPrice, sellPrice, valueAppreciation, holdingLength, costToSell) {
    const errors = [];

    // Validate purchase price
    if (!purchasePrice || isNaN(purchasePrice) || purchasePrice < this.minPurchasePrice || purchasePrice > this.maxPurchasePrice) {
      errors.push(`Please enter a valid purchase price between $${this.minPurchasePrice.toLocaleString()} and $${this.maxPurchasePrice.toLocaleString()}.`);
    }

    // Validate monthly rent
    if (!monthlyRent || isNaN(monthlyRent) || monthlyRent <= 0) {
      errors.push('Please enter a valid monthly rent amount.');
    }

    // Validate loan parameters if using loan
    if (useLoan) {
      if (isNaN(downPayment) || downPayment < 0 || downPayment > 100) {
        errors.push('Please enter a valid down payment percentage between 0% and 100%.');
      }
      if (isNaN(interestRate) || interestRate < 0 || interestRate > this.maxInterestRate) {
        errors.push(`Please enter a valid interest rate between 0% and ${this.maxInterestRate}%.`);
      }
      if (isNaN(loanTerm) || loanTerm < 1 || loanTerm > this.maxLoanTerm) {
        errors.push(`Please enter a valid loan term between 1 and ${this.maxLoanTerm} years.`);
      }
    }

    // Validate repair costs if needed
    if (needRepairs) {
      if (isNaN(repairCost) || repairCost < 0) {
        errors.push('Please enter a valid repair cost amount.');
      }
      if (isNaN(valueAfterRepairs) || valueAfterRepairs <= 0) {
        errors.push('Please enter a valid value after repairs amount.');
      }
    }

    // Validate holding length
    if (isNaN(holdingLength) || holdingLength < 1 || holdingLength > this.maxHoldingLength) {
      errors.push(`Please enter a valid holding length between 1 and ${this.maxHoldingLength} years.`);
    }

    // Validate sale price if known
    if (knowSellPrice && (isNaN(sellPrice) || sellPrice <= 0)) {
      errors.push('Please enter a valid future sale price.');
    }

    // Validate appreciation rate if not using known sale price
    if (!knowSellPrice && (isNaN(valueAppreciation) || valueAppreciation < 0 || valueAppreciation > 20)) {
      errors.push('Please enter a valid appreciation rate between 0% and 20%.');
    }

    return errors;
  }

  /**
   * Calculate monthly mortgage payment
   * @param {number} loanAmount - Loan amount
   * @param {number} interestRate - Annual interest rate
   * @param {number} loanTerm - Loan term in years
   * @returns {number} Monthly mortgage payment
   */
  calculateMonthlyMortgage(loanAmount, interestRate, loanTerm) {
    if (loanAmount === 0) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    
    if (monthlyRate === 0) {
      return loanAmount / numPayments;
    }
    
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  /**
   * Calculate remaining loan balance
   * @param {number} loanAmount - Original loan amount
   * @param {number} monthlyPayment - Monthly payment
   * @param {number} interestRate - Annual interest rate
   * @param {number} paymentsMade - Number of payments made
   * @returns {number} Remaining loan balance
   */
  calculateRemainingLoanBalance(loanAmount, monthlyPayment, interestRate, paymentsMade) {
    if (loanAmount === 0) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = paymentsMade;
    
    if (monthlyRate === 0) {
      return Math.max(0, loanAmount - (monthlyPayment * totalPayments));
    }
    
    const remainingPayments = (loanAmount * Math.pow(1 + monthlyRate, totalPayments)) - 
                             (monthlyPayment * ((Math.pow(1 + monthlyRate, totalPayments) - 1) / monthlyRate));
    
    return Math.max(0, remainingPayments);
  }

  /**
   * Calculate cash flow
   * @param {number} monthlyRent - Monthly rent
   * @param {number} vacancyRate - Vacancy rate percentage
   * @param {number} monthlyExpenses - Monthly operating expenses
   * @param {number} monthlyMortgage - Monthly mortgage payment
   * @returns {number} Monthly cash flow
   */
  calculateCashFlow(monthlyRent, vacancyRate, monthlyExpenses, monthlyMortgage) {
    const effectiveRent = monthlyRent * (1 - vacancyRate / 100);
    return effectiveRent - monthlyExpenses - monthlyMortgage;
  }

  /**
   * Calculate total investment
   * @param {number} purchasePrice - Purchase price
   * @param {number} downPayment - Down payment percentage
   * @param {number} closingCost - Closing costs
   * @param {number} repairCost - Repair costs
   * @returns {number} Total investment
   */
  calculateTotalInvestment(purchasePrice, downPayment, closingCost, repairCost) {
    const downPaymentAmount = purchasePrice * (downPayment / 100);
    return downPaymentAmount + closingCost + repairCost;
  }

  /**
   * Calculate cash on cash return
   * @param {number} annualCashFlow - Annual cash flow
   * @param {number} totalInvestment - Total investment
   * @returns {number} Cash on cash return percentage
   */
  calculateCashOnCashReturn(annualCashFlow, totalInvestment) {
    if (totalInvestment === 0) return 0;
    return (annualCashFlow / totalInvestment) * 100;
  }

  /**
   * Calculate future property value
   * @param {number} currentValue - Current property value
   * @param {number} appreciationRate - Annual appreciation rate
   * @param {number} years - Number of years
   * @returns {number} Future property value
   */
  calculateFutureValue(currentValue, appreciationRate, years) {
    return currentValue * Math.pow(1 + appreciationRate / 100, years);
  }

  /**
   * Calculate annualized return
   * @param {number} totalReturn - Total return over holding period
   * @param {number} totalInvestment - Total investment
   * @param {number} years - Holding period in years
   * @returns {number} Annualized return percentage
   */
  calculateAnnualizedReturn(totalReturn, totalInvestment, years) {
    if (totalInvestment === 0 || years === 0) return 0;
    return (Math.pow((totalReturn + totalInvestment) / totalInvestment, 1 / years) - 1) * 100;
  }

  /**
   * Main calculation function for rental property
   * @param {number} purchasePrice - Purchase price
   * @param {boolean} useLoan - Whether to use loan financing
   * @param {number} downPayment - Down payment percentage
   * @param {number} interestRate - Interest rate percentage
   * @param {number} loanTerm - Loan term in years
   * @param {number} closingCost - Closing costs
   * @param {boolean} needRepairs - Whether property needs repairs
   * @param {number} repairCost - Repair costs
   * @param {number} valueAfterRepairs - Value after repairs
   * @param {number} monthlyRent - Monthly rent
   * @param {number} vacancyRate - Vacancy rate percentage
   * @param {number} managementFee - Management fee percentage
   * @param {number} propertyTax - Annual property tax
   * @param {number} insurance - Annual insurance
   * @param {number} maintenance - Annual maintenance
   * @param {boolean} knowSellPrice - Whether user knows future sale price
   * @param {number} sellPrice - Future sale price
   * @param {number} valueAppreciation - Annual appreciation rate
   * @param {number} holdingLength - Holding period in years
   * @param {number} costToSell - Cost to sell percentage
   * @returns {Object} Comprehensive rental property calculation results
   */
  calculateRentalProperty(purchasePrice, useLoan, downPayment, interestRate, loanTerm, closingCost, needRepairs, repairCost, valueAfterRepairs, monthlyRent, vacancyRate, managementFee, propertyTax, insurance, maintenance, knowSellPrice, sellPrice, valueAppreciation, holdingLength, costToSell) {
    // Convert to numbers and validate
    purchasePrice = parseFloat(purchasePrice);
    downPayment = parseFloat(downPayment || 0);
    interestRate = parseFloat(interestRate || 0);
    loanTerm = parseFloat(loanTerm || 0);
    closingCost = parseFloat(closingCost || 0);
    repairCost = parseFloat(repairCost || 0);
    valueAfterRepairs = parseFloat(valueAfterRepairs || purchasePrice);
    monthlyRent = parseFloat(monthlyRent);
    vacancyRate = parseFloat(vacancyRate || 0);
    managementFee = parseFloat(managementFee || 0);
    propertyTax = parseFloat(propertyTax || 0);
    insurance = parseFloat(insurance || 0);
    maintenance = parseFloat(maintenance || 0);
    sellPrice = parseFloat(sellPrice || 0);
    valueAppreciation = parseFloat(valueAppreciation || 0);
    holdingLength = parseFloat(holdingLength);
    costToSell = parseFloat(costToSell || 0);

    // Calculate loan details
    let loanAmount = 0;
    let monthlyMortgage = 0;
    
    if (useLoan) {
      loanAmount = purchasePrice * (1 - downPayment / 100);
      monthlyMortgage = this.calculateMonthlyMortgage(loanAmount, interestRate, loanTerm);
    }

    // Calculate operating expenses
    const annualRent = monthlyRent * 12;
    const effectiveGrossIncome = annualRent * (1 - vacancyRate / 100);
    const managementFeeAmount = effectiveGrossIncome * (managementFee / 100);
    const annualOperatingExpenses = propertyTax + insurance + maintenance + managementFeeAmount;
    const monthlyOperatingExpenses = annualOperatingExpenses / 12;

    // Calculate cash flow
    const monthlyCashFlow = this.calculateCashFlow(monthlyRent, vacancyRate, monthlyOperatingExpenses, monthlyMortgage);
    const annualCashFlow = monthlyCashFlow * 12;

    // Calculate total investment
    const totalInvestment = this.calculateTotalInvestment(purchasePrice, downPayment, closingCost, repairCost);

    // Calculate cash on cash return
    const cashOnCashReturn = this.calculateCashOnCashReturn(annualCashFlow, totalInvestment);

    // Calculate future sale price
    let estimatedSellPrice;
    if (knowSellPrice) {
      estimatedSellPrice = sellPrice;
    } else {
      estimatedSellPrice = this.calculateFutureValue(valueAfterRepairs, valueAppreciation, holdingLength);
    }

    // Calculate remaining loan balance after holding period
    const paymentsMade = holdingLength * 12;
    const remainingLoanBalance = this.calculateRemainingLoanBalance(loanAmount, monthlyMortgage, interestRate, paymentsMade);

    // Calculate profit on sale
    const equity = estimatedSellPrice - remainingLoanBalance;
    const sellingCosts = estimatedSellPrice * (costToSell / 100);
    const profitOnSale = equity - sellingCosts - totalInvestment;

    // Calculate total return
    const totalCashFlow = annualCashFlow * holdingLength;
    const totalReturn = totalCashFlow + profitOnSale;
    const annualizedReturn = this.calculateAnnualizedReturn(totalReturn, totalInvestment, holdingLength);

    return {
      // Input values
      purchasePrice: purchasePrice,
      useLoan: useLoan,
      downPayment: downPayment,
      interestRate: interestRate,
      loanTerm: loanTerm,
      closingCost: closingCost,
      needRepairs: needRepairs,
      repairCost: repairCost,
      valueAfterRepairs: valueAfterRepairs,
      monthlyRent: monthlyRent,
      vacancyRate: vacancyRate,
      managementFee: managementFee,
      propertyTax: propertyTax,
      insurance: insurance,
      maintenance: maintenance,
      knowSellPrice: knowSellPrice,
      sellPrice: sellPrice,
      valueAppreciation: valueAppreciation,
      holdingLength: holdingLength,
      costToSell: costToSell,

      // Main calculations
      loanAmount: this.roundToCurrency(loanAmount),
      monthlyMortgage: this.roundToCurrency(monthlyMortgage),
      monthlyCashFlow: this.roundToCurrency(monthlyCashFlow),
      annualCashFlow: this.roundToCurrency(annualCashFlow),
      totalInvestment: this.roundToCurrency(totalInvestment),
      cashOnCashReturn: this.roundToCurrency(cashOnCashReturn),
      estimatedSellPrice: this.roundToCurrency(estimatedSellPrice),
      remainingLoanBalance: this.roundToCurrency(remainingLoanBalance),
      profitOnSale: this.roundToCurrency(profitOnSale),
      totalCashFlow: this.roundToCurrency(totalCashFlow),
      totalReturn: this.roundToCurrency(totalReturn),
      annualizedReturn: this.roundToCurrency(annualizedReturn),

      // Additional metrics
      effectiveGrossIncome: this.roundToCurrency(effectiveGrossIncome),
      annualOperatingExpenses: this.roundToCurrency(annualOperatingExpenses),
      monthlyOperatingExpenses: this.roundToCurrency(monthlyOperatingExpenses),
      equity: this.roundToCurrency(equity),
      sellingCosts: this.roundToCurrency(sellingCosts),

      // Formatted values for display
      purchasePriceFormatted: this.formatCurrency(purchasePrice),
      loanAmountFormatted: this.formatCurrency(loanAmount),
      monthlyMortgageFormatted: this.formatCurrency(monthlyMortgage),
      monthlyCashFlowFormatted: this.formatCurrency(monthlyCashFlow),
      annualCashFlowFormatted: this.formatCurrency(annualCashFlow),
      totalInvestmentFormatted: this.formatCurrency(totalInvestment),
      cashOnCashReturnFormatted: this.formatPercentage(cashOnCashReturn),
      estimatedSellPriceFormatted: this.formatCurrency(estimatedSellPrice),
      remainingLoanBalanceFormatted: this.formatCurrency(remainingLoanBalance),
      profitOnSaleFormatted: this.formatCurrency(profitOnSale),
      totalCashFlowFormatted: this.formatCurrency(totalCashFlow),
      totalReturnFormatted: this.formatCurrency(totalReturn),
      annualizedReturnFormatted: this.formatPercentage(annualizedReturn)
    };
  }

  /**
   * Compare multiple rental properties
   * @param {Array} properties - Array of property objects
   * @returns {Object} Property comparison results
   */
  compareRentalProperties(properties) {
    const comparisons = properties.map(property => {
      const result = this.calculateRentalProperty(
        property.purchasePrice,
        property.useLoan,
        property.downPayment,
        property.interestRate,
        property.loanTerm,
        property.closingCost,
        property.needRepairs,
        property.repairCost,
        property.valueAfterRepairs,
        property.monthlyRent,
        property.vacancyRate,
        property.managementFee,
        property.propertyTax,
        property.insurance,
        property.maintenance,
        property.knowSellPrice,
        property.sellPrice,
        property.valueAppreciation,
        property.holdingLength,
        property.costToSell
      );
      return {
        ...result,
        propertyName: property.name || 'Property'
      };
    });

    // Sort by cash on cash return
    comparisons.sort((a, b) => b.cashOnCashReturn - a.cashOnCashReturn);

    return {
      properties: comparisons,
      bestCashFlow: comparisons[0],
      bestTotalReturn: comparisons.reduce((max, property) => 
        property.totalReturn > max.totalReturn ? property : max
      ),
      worstPerformer: comparisons[comparisons.length - 1]
    };
  }

  /**
   * Calculate break-even rent
   * @param {number} purchasePrice - Purchase price
   * @param {number} downPayment - Down payment percentage
   * @param {number} interestRate - Interest rate
   * @param {number} loanTerm - Loan term
   * @param {number} operatingExpenses - Annual operating expenses
   * @param {number} vacancyRate - Vacancy rate
   * @returns {number} Break-even monthly rent
   */
  calculateBreakEvenRent(purchasePrice, downPayment, interestRate, loanTerm, operatingExpenses, vacancyRate) {
    const loanAmount = purchasePrice * (1 - downPayment / 100);
    const monthlyMortgage = this.calculateMonthlyMortgage(loanAmount, interestRate, loanTerm);
    const monthlyOperatingExpenses = operatingExpenses / 12;
    
    const totalMonthlyExpenses = monthlyMortgage + monthlyOperatingExpenses;
    const breakEvenRent = totalMonthlyExpenses / (1 - vacancyRate / 100);
    
    return this.roundToCurrency(breakEvenRent);
  }

  /**
   * Calculate cap rate
   * @param {number} netOperatingIncome - Net operating income
   * @param {number} propertyValue - Property value
   * @returns {number} Cap rate percentage
   */
  calculateCapRate(netOperatingIncome, propertyValue) {
    if (propertyValue === 0) return 0;
    return (netOperatingIncome / propertyValue) * 100;
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
   * Get common rental property metrics and benchmarks
   * @returns {Object} Common metrics and benchmarks
   */
  getRentalPropertyBenchmarks() {
    return {
      'cashOnCashReturn': {
        excellent: 12,
        good: 8,
        fair: 6,
        poor: 4
      },
      'capRate': {
        excellent: 8,
        good: 6,
        fair: 4,
        poor: 2
      },
      'vacancyRate': {
        excellent: 3,
        good: 5,
        fair: 8,
        poor: 12
      },
      'expenseRatio': {
        excellent: 35,
        good: 45,
        fair: 55,
        poor: 65
      },
      'debtServiceCoverage': {
        excellent: 1.5,
        good: 1.25,
        fair: 1.1,
        poor: 1.0
      }
    };
  }
}

// Export for use in React component
export default RentalPropertyCalculator;
