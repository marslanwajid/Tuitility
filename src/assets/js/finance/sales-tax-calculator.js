/**
 * Sales Tax Calculator - JavaScript Logic
 * Handles all sales tax calculations including subtotal, tax amount, and total calculations
 */

class SalesTaxCalculator {
  constructor() {
    // Default values
    this.defaultTaxRate = 0; // 0% default tax rate
    this.maxTaxRate = 50; // Maximum 50% tax rate
    this.minQuantity = 1; // Minimum quantity of 1
  }

  /**
   * Validate all input parameters
   * @param {number} itemPrice - Price of a single item
   * @param {number} taxRate - Sales tax rate percentage
   * @param {number} quantity - Number of items
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(itemPrice, taxRate, quantity) {
    const errors = [];

    // Validate item price
    if (!itemPrice || isNaN(itemPrice) || itemPrice <= 0) {
      errors.push('Please enter a valid positive item price.');
    }

    // Validate tax rate
    if (taxRate === undefined || taxRate === null || isNaN(taxRate) || taxRate < 0 || taxRate > this.maxTaxRate) {
      errors.push(`Please enter a valid tax rate between 0% and ${this.maxTaxRate}%.`);
    }

    // Validate quantity
    if (!quantity || isNaN(quantity) || quantity < this.minQuantity || !Number.isInteger(parseFloat(quantity))) {
      errors.push(`Please enter a valid quantity of at least ${this.minQuantity}.`);
    }

    return errors;
  }

  /**
   * Calculate subtotal (item price × quantity)
   * @param {number} itemPrice - Price of a single item
   * @param {number} quantity - Number of items
   * @returns {number} Subtotal amount
   */
  calculateSubtotal(itemPrice, quantity) {
    return itemPrice * quantity;
  }

  /**
   * Calculate tax amount
   * @param {number} subtotal - Subtotal amount
   * @param {number} taxRate - Tax rate percentage
   * @returns {number} Tax amount
   */
  calculateTaxAmount(subtotal, taxRate) {
    return subtotal * (taxRate / 100);
  }

  /**
   * Calculate total amount (subtotal + tax)
   * @param {number} subtotal - Subtotal amount
   * @param {number} taxAmount - Tax amount
   * @returns {number} Total amount
   */
  calculateTotal(subtotal, taxAmount) {
    return subtotal + taxAmount;
  }

  /**
   * Calculate tax as percentage of total
   * @param {number} taxAmount - Tax amount
   * @param {number} total - Total amount
   * @returns {number} Tax percentage of total
   */
  calculateTaxPercentageOfTotal(taxAmount, total) {
    if (total === 0) return 0;
    return (taxAmount / total) * 100;
  }

  /**
   * Calculate average tax per item
   * @param {number} taxAmount - Total tax amount
   * @param {number} quantity - Number of items
   * @returns {number} Average tax per item
   */
  calculateAverageTaxPerItem(taxAmount, quantity) {
    if (quantity === 0) return 0;
    return taxAmount / quantity;
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
   * Main calculation function for sales tax
   * @param {number} itemPrice - Price of a single item
   * @param {number} taxRate - Sales tax rate percentage
   * @param {number} quantity - Number of items
   * @returns {Object} Comprehensive sales tax calculation results
   */
  calculateSalesTax(itemPrice, taxRate, quantity) {
    // Convert to numbers and validate
    itemPrice = parseFloat(itemPrice);
    taxRate = parseFloat(taxRate);
    quantity = parseInt(quantity);

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(itemPrice, quantity);

    // Calculate tax amount
    const taxAmount = this.calculateTaxAmount(subtotal, taxRate);

    // Calculate total
    const total = this.calculateTotal(subtotal, taxAmount);

    // Calculate additional metrics
    const taxPercentageOfTotal = this.calculateTaxPercentageOfTotal(taxAmount, total);
    const averageTaxPerItem = this.calculateAverageTaxPerItem(taxAmount, quantity);

    // Round all currency amounts to 2 decimal places
    const roundedSubtotal = this.roundToCurrency(subtotal);
    const roundedTaxAmount = this.roundToCurrency(taxAmount);
    const roundedTotal = this.roundToCurrency(total);
    const roundedAverageTaxPerItem = this.roundToCurrency(averageTaxPerItem);

    return {
      // Input values
      itemPrice: itemPrice,
      taxRate: taxRate,
      quantity: quantity,

      // Main calculations
      subtotal: roundedSubtotal,
      taxAmount: roundedTaxAmount,
      total: roundedTotal,

      // Additional metrics
      taxPercentageOfTotal: this.roundToCurrency(taxPercentageOfTotal),
      averageTaxPerItem: roundedAverageTaxPerItem,

      // Breakdown for display
      itemPriceFormatted: this.formatCurrency(itemPrice),
      subtotalFormatted: this.formatCurrency(roundedSubtotal),
      taxAmountFormatted: this.formatCurrency(roundedTaxAmount),
      totalFormatted: this.formatCurrency(roundedTotal),
      taxRateFormatted: this.formatPercentage(taxRate),
      taxPercentageOfTotalFormatted: this.formatPercentage(taxPercentageOfTotal),
      averageTaxPerItemFormatted: this.formatCurrency(roundedAverageTaxPerItem)
    };
  }

  /**
   * Calculate sales tax for multiple items with different prices
   * @param {Array} items - Array of items with price and quantity
   * @param {number} taxRate - Sales tax rate percentage
   * @returns {Object} Calculation results for multiple items
   */
  calculateMultipleItems(items, taxRate) {
    let totalSubtotal = 0;
    let totalQuantity = 0;
    const itemBreakdown = [];

    // Calculate each item
    items.forEach((item, index) => {
      const itemSubtotal = this.calculateSubtotal(item.price, item.quantity);
      const itemTaxAmount = this.calculateTaxAmount(itemSubtotal, taxRate);
      const itemTotal = this.calculateTotal(itemSubtotal, itemTaxAmount);

      totalSubtotal += itemSubtotal;
      totalQuantity += item.quantity;

      itemBreakdown.push({
        itemNumber: index + 1,
        price: item.price,
        quantity: item.quantity,
        subtotal: this.roundToCurrency(itemSubtotal),
        taxAmount: this.roundToCurrency(itemTaxAmount),
        total: this.roundToCurrency(itemTotal)
      });
    });

    // Calculate totals
    const totalTaxAmount = this.calculateTaxAmount(totalSubtotal, taxRate);
    const grandTotal = this.calculateTotal(totalSubtotal, totalTaxAmount);

    return {
      itemBreakdown: itemBreakdown,
      totalSubtotal: this.roundToCurrency(totalSubtotal),
      totalTaxAmount: this.roundToCurrency(totalTaxAmount),
      grandTotal: this.roundToCurrency(grandTotal),
      totalQuantity: totalQuantity,
      taxRate: taxRate
    };
  }

  /**
   * Calculate reverse sales tax (find original price before tax)
   * @param {number} totalWithTax - Total amount including tax
   * @param {number} taxRate - Tax rate percentage
   * @returns {Object} Original price breakdown
   */
  calculateReverseSalesTax(totalWithTax, taxRate) {
    // Formula: Original Price = Total / (1 + Tax Rate / 100)
    const originalPrice = totalWithTax / (1 + taxRate / 100);
    const taxAmount = totalWithTax - originalPrice;

    return {
      totalWithTax: this.roundToCurrency(totalWithTax),
      originalPrice: this.roundToCurrency(originalPrice),
      taxAmount: this.roundToCurrency(taxAmount),
      taxRate: taxRate,
      taxPercentageOfTotal: this.calculateTaxPercentageOfTotal(taxAmount, totalWithTax)
    };
  }

  /**
   * Compare tax rates for different locations
   * @param {number} itemPrice - Price of item
   * @param {number} quantity - Number of items
   * @param {Array} taxRates - Array of tax rates to compare
   * @returns {Array} Comparison results
   */
  compareTaxRates(itemPrice, quantity, taxRates) {
    const comparisons = [];

    taxRates.forEach(taxRate => {
      const calculation = this.calculateSalesTax(itemPrice, taxRate, quantity);
      comparisons.push({
        taxRate: taxRate,
        taxRateFormatted: this.formatPercentage(taxRate),
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxAmount,
        total: calculation.total,
        taxPercentageOfTotal: calculation.taxPercentageOfTotal
      });
    });

    // Sort by total amount
    comparisons.sort((a, b) => a.total - b.total);

    return comparisons;
  }

  /**
   * Calculate tax savings from tax-free purchases
   * @param {number} itemPrice - Price of item
   * @param {number} quantity - Number of items
   * @param {number} taxRate - Tax rate percentage
   * @returns {Object} Tax savings calculation
   */
  calculateTaxSavings(itemPrice, quantity, taxRate) {
    const withTax = this.calculateSalesTax(itemPrice, taxRate, quantity);
    const withoutTax = this.calculateSalesTax(itemPrice, 0, quantity);

    const taxSavings = withTax.total - withoutTax.total;
    const savingsPercentage = (taxSavings / withTax.total) * 100;

    return {
      withTax: withTax,
      withoutTax: withoutTax,
      taxSavings: this.roundToCurrency(taxSavings),
      savingsPercentage: this.roundToCurrency(savingsPercentage)
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
   * Get common tax rates by state (simplified)
   * @returns {Object} Common tax rates by state
   */
  getCommonTaxRates() {
    return {
      'Alabama': 4.0,
      'Alaska': 0.0,
      'Arizona': 5.6,
      'Arkansas': 6.5,
      'California': 7.25,
      'Colorado': 2.9,
      'Connecticut': 6.35,
      'Delaware': 0.0,
      'Florida': 6.0,
      'Georgia': 4.0,
      'Hawaii': 4.17,
      'Idaho': 6.0,
      'Illinois': 6.25,
      'Indiana': 7.0,
      'Iowa': 6.0,
      'Kansas': 6.5,
      'Kentucky': 6.0,
      'Louisiana': 4.45,
      'Maine': 5.5,
      'Maryland': 6.0,
      'Massachusetts': 6.25,
      'Michigan': 6.0,
      'Minnesota': 6.88,
      'Mississippi': 7.0,
      'Missouri': 4.23,
      'Montana': 0.0,
      'Nebraska': 5.5,
      'Nevada': 6.85,
      'New Hampshire': 0.0,
      'New Jersey': 6.63,
      'New Mexico': 5.13,
      'New York': 8.0,
      'North Carolina': 4.75,
      'North Dakota': 5.0,
      'Ohio': 5.75,
      'Oklahoma': 4.5,
      'Oregon': 0.0,
      'Pennsylvania': 6.0,
      'Rhode Island': 7.0,
      'South Carolina': 6.0,
      'South Dakota': 4.5,
      'Tennessee': 7.0,
      'Texas': 6.25,
      'Utah': 6.1,
      'Vermont': 6.0,
      'Virginia': 5.3,
      'Washington': 6.5,
      'West Virginia': 6.0,
      'Wisconsin': 5.0,
      'Wyoming': 4.0
    };
  }
}

// Export for use in React component
export default SalesTaxCalculator;
