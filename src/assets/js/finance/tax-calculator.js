/**
 * Tax Calculator - JavaScript Logic
 * Handles all tax calculations including federal and state income taxes, deductions, and credits
 */

class TaxCalculator {
  constructor() {
    // 2024 Federal Tax Brackets (Single)
    this.federalBrackets = {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: Infinity, rate: 0.37 }
      ],
      'married-joint': [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: Infinity, rate: 0.37 }
      ],
      'married-separate': [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 346875, rate: 0.35 },
        { min: 346875, max: Infinity, rate: 0.37 }
      ],
      'head-household': [
        { min: 0, max: 15700, rate: 0.10 },
        { min: 15700, max: 59850, rate: 0.12 },
        { min: 59850, max: 95350, rate: 0.22 },
        { min: 95350, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578100, rate: 0.35 },
        { min: 578100, max: Infinity, rate: 0.37 }
      ]
    };

    // 2024 Standard Deductions
    this.standardDeductions = {
      single: 13850,
      'married-joint': 27700,
      'married-separate': 13850,
      'head-household': 20800
    };

    // State tax rates (simplified)
    this.stateRates = {
      CA: 0.05, // California - progressive but simplified
      NY: 0.06, // New York - progressive but simplified
      TX: 0.00, // Texas - no state income tax
      FL: 0.00, // Florida - no state income tax
      WA: 0.00, // Washington - no state income tax
      NV: 0.00, // Nevada - no state income tax
      other: 0.04 // Average for other states
    };
  }

  /**
   * Validate all input parameters
   * @param {number} grossIncome - Gross annual income
   * @param {string} filingStatus - Tax filing status
   * @param {string} state - State of residence
   * @param {number} deductions - Itemized deductions
   * @param {number} exemptions - Personal exemptions
   * @param {number} additionalIncome - Additional income
   * @param {number} taxCredits - Tax credits
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(grossIncome, filingStatus, state, deductions = 0, exemptions = 0, additionalIncome = 0, taxCredits = 0) {
    const errors = [];

    // Validate gross income
    if (!grossIncome || isNaN(grossIncome) || grossIncome < 0) {
      errors.push('Please enter a valid positive gross income amount.');
    }

    // Validate filing status
    if (!filingStatus || !this.federalBrackets[filingStatus]) {
      errors.push('Please select a valid filing status.');
    }

    // Validate state
    if (!state) {
      errors.push('Please select a state.');
    }

    // Validate deductions
    if (deductions && (isNaN(deductions) || deductions < 0)) {
      errors.push('Deductions must be a positive number or zero.');
    }

    // Validate exemptions
    if (exemptions && (isNaN(exemptions) || exemptions < 0)) {
      errors.push('Exemptions must be a positive number or zero.');
    }

    // Validate additional income
    if (additionalIncome && (isNaN(additionalIncome) || additionalIncome < 0)) {
      errors.push('Additional income must be a positive number or zero.');
    }

    // Validate tax credits
    if (taxCredits && (isNaN(taxCredits) || taxCredits < 0)) {
      errors.push('Tax credits must be a positive number or zero.');
    }

    return errors;
  }

  /**
   * Calculate federal tax using progressive tax brackets
   * @param {number} taxableIncome - Taxable income amount
   * @param {string} filingStatus - Tax filing status
   * @returns {number} Federal tax amount
   */
  calculateFederalTax(taxableIncome, filingStatus) {
    if (taxableIncome <= 0) return 0;

    const brackets = this.federalBrackets[filingStatus];
    let totalTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      const taxInBracket = taxableInBracket * bracket.rate;
      totalTax += taxInBracket;
      remainingIncome -= taxableInBracket;
    }

    return totalTax;
  }

  /**
   * Calculate state tax
   * @param {number} taxableIncome - Taxable income amount
   * @param {string} state - State of residence
   * @returns {number} State tax amount
   */
  calculateStateTax(taxableIncome, state) {
    if (taxableIncome <= 0) return 0;

    const stateRate = this.stateRates[state] || this.stateRates.other;
    return taxableIncome * stateRate;
  }

  /**
   * Calculate taxable income
   * @param {number} grossIncome - Gross income
   * @param {number} deductions - Itemized deductions
   * @param {number} exemptions - Personal exemptions
   * @param {string} filingStatus - Filing status
   * @returns {Object} Taxable income and deduction details
   */
  calculateTaxableIncome(grossIncome, deductions, exemptions, filingStatus) {
    const standardDeduction = this.standardDeductions[filingStatus];
    const itemizedDeductions = deductions || 0;
    const personalExemptions = exemptions || 0;

    // Use the larger of standard deduction or itemized deductions
    const totalDeductions = Math.max(standardDeduction, itemizedDeductions);
    const taxableIncome = Math.max(0, grossIncome - totalDeductions - personalExemptions);

    return {
      grossIncome: grossIncome,
      standardDeduction: standardDeduction,
      itemizedDeductions: itemizedDeductions,
      personalExemptions: personalExemptions,
      totalDeductions: totalDeductions,
      taxableIncome: taxableIncome
    };
  }

  /**
   * Calculate effective tax rate
   * @param {number} totalTax - Total tax amount
   * @param {number} grossIncome - Gross income
   * @returns {number} Effective tax rate as percentage
   */
  calculateEffectiveTaxRate(totalTax, grossIncome) {
    if (grossIncome <= 0) return 0;
    return (totalTax / grossIncome) * 100;
  }

  /**
   * Main calculation function for tax
   * @param {number} grossIncome - Gross annual income
   * @param {string} filingStatus - Tax filing status
   * @param {string} state - State of residence
   * @param {number} deductions - Itemized deductions
   * @param {number} exemptions - Personal exemptions
   * @param {number} additionalIncome - Additional income
   * @param {number} taxCredits - Tax credits
   * @returns {Object} Calculation results
   */
  calculateTax(grossIncome, filingStatus, state, deductions = 0, exemptions = 0, additionalIncome = 0, taxCredits = 0) {
    // Convert to numbers and validate
    grossIncome = parseFloat(grossIncome) || 0;
    deductions = parseFloat(deductions) || 0;
    exemptions = parseFloat(exemptions) || 0;
    additionalIncome = parseFloat(additionalIncome) || 0;
    taxCredits = parseFloat(taxCredits) || 0;

    // Calculate total gross income including additional income
    const totalGrossIncome = grossIncome + additionalIncome;

    // Calculate taxable income
    const incomeDetails = this.calculateTaxableIncome(totalGrossIncome, deductions, exemptions, filingStatus);

    // Calculate federal tax
    const federalTax = this.calculateFederalTax(incomeDetails.taxableIncome, filingStatus);

    // Calculate state tax
    const stateTax = this.calculateStateTax(incomeDetails.taxableIncome, state);

    // Calculate total tax before credits
    const totalTaxBeforeCredits = federalTax + stateTax;

    // Apply tax credits
    const totalTax = Math.max(0, totalTaxBeforeCredits - taxCredits);

    // Calculate after-tax income
    const afterTaxIncome = totalGrossIncome - totalTax;

    // Calculate effective tax rates
    const federalTaxRate = this.calculateEffectiveTaxRate(federalTax, totalGrossIncome);
    const stateTaxRate = this.calculateEffectiveTaxRate(stateTax, totalGrossIncome);
    const totalTaxRate = this.calculateEffectiveTaxRate(totalTax, totalGrossIncome);

    return {
      grossIncome: totalGrossIncome,
      filingStatus: filingStatus,
      state: state,
      standardDeduction: incomeDetails.standardDeduction,
      itemizedDeductions: incomeDetails.itemizedDeductions,
      personalExemptions: incomeDetails.personalExemptions,
      totalDeductions: incomeDetails.totalDeductions,
      taxableIncome: incomeDetails.taxableIncome,
      federalTax: federalTax,
      stateTax: stateTax,
      totalTax: totalTax,
      taxCredits: taxCredits,
      afterTaxIncome: afterTaxIncome,
      federalTaxRate: federalTaxRate,
      stateTaxRate: stateTaxRate,
      totalTaxRate: totalTaxRate
    };
  }

  /**
   * Calculate tax savings from deductions
   * @param {number} deductionAmount - Amount of deduction
   * @param {number} marginalTaxRate - Marginal tax rate
   * @returns {number} Tax savings amount
   */
  calculateTaxSavings(deductionAmount, marginalTaxRate) {
    return deductionAmount * marginalTaxRate;
  }

  /**
   * Calculate marginal tax rate
   * @param {number} taxableIncome - Taxable income
   * @param {string} filingStatus - Filing status
   * @returns {number} Marginal tax rate
   */
  calculateMarginalTaxRate(taxableIncome, filingStatus) {
    const brackets = this.federalBrackets[filingStatus];
    
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
        return bracket.rate * 100; // Return as percentage
      }
    }
    
    // If income exceeds highest bracket
    return brackets[brackets.length - 1].rate * 100;
  }

  /**
   * Compare standard vs itemized deductions
   * @param {number} itemizedDeductions - Itemized deductions amount
   * @param {string} filingStatus - Filing status
   * @returns {Object} Comparison results
   */
  compareDeductions(itemizedDeductions, filingStatus) {
    const standardDeduction = this.standardDeductions[filingStatus];
    const betterOption = itemizedDeductions > standardDeduction ? 'itemized' : 'standard';
    const savings = Math.abs(itemizedDeductions - standardDeduction);

    return {
      standardDeduction: standardDeduction,
      itemizedDeductions: itemizedDeductions,
      betterOption: betterOption,
      savings: savings
    };
  }

  /**
   * Calculate tax impact of additional income
   * @param {number} currentTaxableIncome - Current taxable income
   * @param {number} additionalIncome - Additional income amount
   * @param {string} filingStatus - Filing status
   * @param {string} state - State
   * @returns {Object} Tax impact analysis
   */
  calculateTaxImpact(currentTaxableIncome, additionalIncome, filingStatus, state) {
    const currentTax = this.calculateTax(currentTaxableIncome, filingStatus, state, 0, 0, 0, 0);
    const newTax = this.calculateTax(currentTaxableIncome + additionalIncome, filingStatus, state, 0, 0, 0, 0);
    
    const additionalTax = newTax.totalTax - currentTax.totalTax;
    const marginalRate = (additionalTax / additionalIncome) * 100;

    return {
      additionalIncome: additionalIncome,
      additionalTax: additionalTax,
      marginalRate: marginalRate,
      afterTaxAdditionalIncome: additionalIncome - additionalTax
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
}

// Export for use in React component
export default TaxCalculator;
