/**
 * Budget Calculator - JavaScript Logic
 * Handles all budget calculations including expense tracking, budget analysis, and financial health assessment
 */

class BudgetCalculator {
  constructor() {
    // Default values
    this.maxIncome = 1000000; // Maximum $1M monthly income
    this.minIncome = 1; // Minimum $1 monthly income
    this.maxExpense = 1000000; // Maximum $1M per expense category
  }

  /**
   * Validate all input parameters
   * @param {number} monthlyIncome - Monthly income
   * @param {number} housing - Housing expenses
   * @param {number} transportation - Transportation expenses
   * @param {number} food - Food expenses
   * @param {number} utilities - Utilities expenses
   * @param {number} insurance - Insurance expenses
   * @param {number} healthcare - Healthcare expenses
   * @param {number} entertainment - Entertainment expenses
   * @param {number} savings - Savings amount
   * @param {number} debt - Debt payments
   * @param {number} other - Other expenses
   * @param {string} budgetType - Budget type
   * @returns {Array} Array of error messages, empty if valid
   */
  validateInputs(monthlyIncome, housing, transportation, food, utilities, insurance, healthcare, entertainment, savings, debt, other, budgetType) {
    const errors = [];

    // Validate monthly income
    if (!monthlyIncome || isNaN(monthlyIncome) || monthlyIncome < this.minIncome || monthlyIncome > this.maxIncome) {
      errors.push(`Please enter a valid monthly income between $${this.minIncome} and $${this.maxIncome.toLocaleString()}.`);
    }

    // Validate budget type
    const validBudgetTypes = ['50-30-20', '70-20-10', '60-20-20', 'custom'];
    if (!validBudgetTypes.includes(budgetType)) {
      errors.push('Please select a valid budget type.');
    }

    // Validate expense amounts (optional fields)
    const expenses = { housing, transportation, food, utilities, insurance, healthcare, entertainment, savings, debt, other };
    for (const [category, amount] of Object.entries(expenses)) {
      if (amount !== undefined && amount !== null && amount !== '' && (isNaN(amount) || amount < 0 || amount > this.maxExpense)) {
        errors.push(`Please enter a valid ${category} amount between $0 and $${this.maxExpense.toLocaleString()}.`);
      }
    }

    return errors;
  }

  /**
   * Calculate total expenses
   * @param {Object} expenses - Object containing all expense amounts
   * @returns {number} Total expenses
   */
  calculateTotalExpenses(expenses) {
    return Object.values(expenses).reduce((total, amount) => {
      return total + (parseFloat(amount) || 0);
    }, 0);
  }

  /**
   * Calculate remaining amount
   * @param {number} income - Monthly income
   * @param {number} totalExpenses - Total expenses
   * @returns {number} Remaining amount
   */
  calculateRemainingAmount(income, totalExpenses) {
    return income - totalExpenses;
  }

  /**
   * Calculate percentage of income for each expense
   * @param {number} amount - Expense amount
   * @param {number} income - Monthly income
   * @returns {number} Percentage of income
   */
  calculatePercentage(amount, income) {
    if (income === 0) return 0;
    return (amount / income) * 100;
  }

  /**
   * Calculate savings rate
   * @param {number} savings - Savings amount
   * @param {number} income - Monthly income
   * @returns {number} Savings rate percentage
   */
  calculateSavingsRate(savings, income) {
    return this.calculatePercentage(savings, income);
  }

  /**
   * Get budget recommendations based on budget type
   * @param {number} income - Monthly income
   * @param {string} budgetType - Budget type
   * @returns {Object} Budget recommendations
   */
  getBudgetRecommendations(income, budgetType) {
    const recommendations = {};

    switch (budgetType) {
      case '50-30-20':
        recommendations.needs = income * 0.50;
        recommendations.wants = income * 0.30;
        recommendations.savings = income * 0.20;
        break;
      case '70-20-10':
        recommendations.living = income * 0.70;
        recommendations.savings = income * 0.20;
        recommendations.investing = income * 0.10;
        break;
      case '60-20-20':
        recommendations.expenses = income * 0.60;
        recommendations.savings = income * 0.20;
        recommendations.debt = income * 0.20;
        break;
      case 'custom':
        // For custom budget, use general recommendations
        recommendations.housing = income * 0.30;
        recommendations.transportation = income * 0.15;
        recommendations.food = income * 0.12;
        recommendations.savings = income * 0.20;
        break;
    }

    return recommendations;
  }

  /**
   * Determine budget status
   * @param {number} remaining - Remaining amount
   * @param {number} income - Monthly income
   * @param {number} savings - Savings amount
   * @returns {string} Budget status
   */
  determineBudgetStatus(remaining, income, savings) {
    const savingsRate = this.calculateSavingsRate(savings, income);
    
    if (remaining < 0) {
      return 'Over Budget';
    } else if (remaining === 0) {
      return 'Balanced';
    } else if (savingsRate >= 20) {
      return 'Excellent';
    } else if (savingsRate >= 15) {
      return 'Good';
    } else if (savingsRate >= 10) {
      return 'Fair';
    } else if (savingsRate >= 5) {
      return 'Needs Improvement';
    } else {
      return 'Poor';
    }
  }

  /**
   * Calculate budget health score
   * @param {Object} expenses - Expense breakdown
   * @param {number} income - Monthly income
   * @param {string} budgetType - Budget type
   * @returns {number} Budget health score (0-100)
   */
  calculateBudgetHealthScore(expenses, income, budgetType) {
    let score = 100;

    // Housing should be under 30%
    const housingPercentage = this.calculatePercentage(expenses.housing, income);
    if (housingPercentage > 35) score -= 20;
    else if (housingPercentage > 30) score -= 10;

    // Transportation should be under 15%
    const transportationPercentage = this.calculatePercentage(expenses.transportation, income);
    if (transportationPercentage > 20) score -= 15;
    else if (transportationPercentage > 15) score -= 5;

    // Food should be under 15%
    const foodPercentage = this.calculatePercentage(expenses.food, income);
    if (foodPercentage > 20) score -= 10;
    else if (foodPercentage > 15) score -= 5;

    // Debt should be under 20%
    const debtPercentage = this.calculatePercentage(expenses.debt, income);
    if (debtPercentage > 30) score -= 25;
    else if (debtPercentage > 20) score -= 15;

    // Savings should be at least 10%
    const savingsPercentage = this.calculatePercentage(expenses.savings, income);
    if (savingsPercentage < 5) score -= 20;
    else if (savingsPercentage < 10) score -= 10;
    else if (savingsPercentage >= 20) score += 10;

    // Check if over budget
    const totalExpenses = this.calculateTotalExpenses(expenses);
    if (totalExpenses > income) score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate savings gap
   * @param {number} actualSavings - Actual savings amount
   * @param {number} recommendedSavings - Recommended savings amount
   * @returns {number} Savings gap
   */
  calculateSavingsGap(actualSavings, recommendedSavings) {
    return recommendedSavings - actualSavings;
  }

  /**
   * Main calculation function for budget
   * @param {number} monthlyIncome - Monthly income
   * @param {number} housing - Housing expenses
   * @param {number} transportation - Transportation expenses
   * @param {number} food - Food expenses
   * @param {number} utilities - Utilities expenses
   * @param {number} insurance - Insurance expenses
   * @param {number} healthcare - Healthcare expenses
   * @param {number} entertainment - Entertainment expenses
   * @param {number} savings - Savings amount
   * @param {number} debt - Debt payments
   * @param {number} other - Other expenses
   * @param {string} budgetType - Budget type
   * @returns {Object} Comprehensive budget calculation results
   */
  calculateBudget(monthlyIncome, housing, transportation, food, utilities, insurance, healthcare, entertainment, savings, debt, other, budgetType) {
    // Convert to numbers and validate
    monthlyIncome = parseFloat(monthlyIncome);
    housing = parseFloat(housing || 0);
    transportation = parseFloat(transportation || 0);
    food = parseFloat(food || 0);
    utilities = parseFloat(utilities || 0);
    insurance = parseFloat(insurance || 0);
    healthcare = parseFloat(healthcare || 0);
    entertainment = parseFloat(entertainment || 0);
    savings = parseFloat(savings || 0);
    debt = parseFloat(debt || 0);
    other = parseFloat(other || 0);

    // Create expenses object
    const expenses = {
      housing,
      transportation,
      food,
      utilities,
      insurance,
      healthcare,
      entertainment,
      savings,
      debt,
      other
    };

    // Calculate totals and percentages
    const totalExpenses = this.calculateTotalExpenses(expenses);
    const remainingAmount = this.calculateRemainingAmount(monthlyIncome, totalExpenses);
    const savingsRate = this.calculateSavingsRate(savings, monthlyIncome);

    // Calculate percentages for each expense
    const percentages = {};
    for (const [category, amount] of Object.entries(expenses)) {
      percentages[category] = this.calculatePercentage(amount, monthlyIncome);
    }

    // Get budget recommendations
    const recommendations = this.getBudgetRecommendations(monthlyIncome, budgetType);
    const recommendedSavings = recommendations.savings || (monthlyIncome * 0.20);
    const savingsGap = this.calculateSavingsGap(savings, recommendedSavings);

    // Determine budget status and health score
    const budgetStatus = this.determineBudgetStatus(remainingAmount, monthlyIncome, savings);
    const budgetHealthScore = this.calculateBudgetHealthScore(expenses, monthlyIncome, budgetType);

    return {
      // Input values
      monthlyIncome: monthlyIncome,
      budgetType: budgetType,

      // Main calculations
      totalExpenses: this.roundToCurrency(totalExpenses),
      remainingAmount: this.roundToCurrency(remainingAmount),
      savingsRate: this.roundToCurrency(savingsRate),
      budgetStatus: budgetStatus,
      budgetHealthScore: Math.round(budgetHealthScore),

      // Expense breakdown
      expenses: {
        housing: this.roundToCurrency(housing),
        transportation: this.roundToCurrency(transportation),
        food: this.roundToCurrency(food),
        utilities: this.roundToCurrency(utilities),
        insurance: this.roundToCurrency(insurance),
        healthcare: this.roundToCurrency(healthcare),
        entertainment: this.roundToCurrency(entertainment),
        savings: this.roundToCurrency(savings),
        debt: this.roundToCurrency(debt),
        other: this.roundToCurrency(other)
      },

      // Percentage breakdown
      percentages: {
        housing: this.roundToCurrency(percentages.housing),
        transportation: this.roundToCurrency(percentages.transportation),
        food: this.roundToCurrency(percentages.food),
        utilities: this.roundToCurrency(percentages.utilities),
        insurance: this.roundToCurrency(percentages.insurance),
        healthcare: this.roundToCurrency(percentages.healthcare),
        entertainment: this.roundToCurrency(percentages.entertainment),
        savings: this.roundToCurrency(percentages.savings),
        debt: this.roundToCurrency(percentages.debt),
        other: this.roundToCurrency(percentages.other)
      },

      // Recommendations and analysis
      recommendedSavings: this.roundToCurrency(recommendedSavings),
      savingsGap: this.roundToCurrency(savingsGap),
      recommendations: recommendations,

      // Formatted values for display
      monthlyIncomeFormatted: this.formatCurrency(monthlyIncome),
      totalExpensesFormatted: this.formatCurrency(totalExpenses),
      remainingAmountFormatted: this.formatCurrency(remainingAmount),
      savingsRateFormatted: this.formatPercentage(savingsRate),
      recommendedSavingsFormatted: this.formatCurrency(recommendedSavings),
      savingsGapFormatted: this.formatCurrency(savingsGap)
    };
  }

  /**
   * Compare different budget scenarios
   * @param {Array} scenarios - Array of budget scenarios
   * @returns {Object} Budget comparison results
   */
  compareBudgetScenarios(scenarios) {
    const comparisons = scenarios.map(scenario => {
      const result = this.calculateBudget(
        scenario.monthlyIncome,
        scenario.housing,
        scenario.transportation,
        scenario.food,
        scenario.utilities,
        scenario.insurance,
        scenario.healthcare,
        scenario.entertainment,
        scenario.savings,
        scenario.debt,
        scenario.other,
        scenario.budgetType
      );
      return {
        ...result,
        scenarioName: scenario.name || 'Scenario'
      };
    });

    // Sort by budget health score
    comparisons.sort((a, b) => b.budgetHealthScore - a.budgetHealthScore);

    return {
      scenarios: comparisons,
      bestScenario: comparisons[0],
      worstScenario: comparisons[comparisons.length - 1]
    };
  }

  /**
   * Calculate debt-to-income ratio
   * @param {number} debtPayments - Monthly debt payments
   * @param {number} income - Monthly income
   * @returns {number} Debt-to-income ratio percentage
   */
  calculateDebtToIncomeRatio(debtPayments, income) {
    return this.calculatePercentage(debtPayments, income);
  }

  /**
   * Calculate housing affordability
   * @param {number} housingCost - Monthly housing cost
   * @param {number} income - Monthly income
   * @returns {Object} Housing affordability analysis
   */
  calculateHousingAffordability(housingCost, income) {
    const housingPercentage = this.calculatePercentage(housingCost, income);
    let affordability = '';

    if (housingPercentage <= 25) {
      affordability = 'Excellent';
    } else if (housingPercentage <= 30) {
      affordability = 'Good';
    } else if (housingPercentage <= 35) {
      affordability = 'Fair';
    } else {
      affordability = 'Poor';
    }

    return {
      housingPercentage: this.roundToCurrency(housingPercentage),
      affordability: affordability,
      recommendedMax: this.roundToCurrency(income * 0.30)
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
   * Get common budget categories and their typical percentages
   * @returns {Object} Common budget categories with typical percentages
   */
  getCommonBudgetCategories() {
    return {
      'housing': { name: 'Housing', typicalPercentage: 30, maxPercentage: 35 },
      'transportation': { name: 'Transportation', typicalPercentage: 15, maxPercentage: 20 },
      'food': { name: 'Food', typicalPercentage: 12, maxPercentage: 15 },
      'utilities': { name: 'Utilities', typicalPercentage: 5, maxPercentage: 8 },
      'insurance': { name: 'Insurance', typicalPercentage: 8, maxPercentage: 12 },
      'healthcare': { name: 'Healthcare', typicalPercentage: 5, maxPercentage: 10 },
      'entertainment': { name: 'Entertainment', typicalPercentage: 5, maxPercentage: 10 },
      'savings': { name: 'Savings', typicalPercentage: 20, minPercentage: 10 },
      'debt': { name: 'Debt Payments', typicalPercentage: 10, maxPercentage: 20 },
      'other': { name: 'Other Expenses', typicalPercentage: 5, maxPercentage: 10 }
    };
  }
}

// Export for use in React component
export default BudgetCalculator;
