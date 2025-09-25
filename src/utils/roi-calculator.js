/**
 * ROI Calculator - JavaScript Logic
 * Handles ROI calculations and validation
 */

class ROICalculator {
  constructor() {
    this.form = null;
    this.resultSection = null;
    this.init();
  }

  init() {
    this.form = document.getElementById('roi-form');
    this.resultSection = document.getElementById('result');
    
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateROI();
      });
    }
  }

  calculateROI() {
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
    const finalValue = parseFloat(document.getElementById('final-value').value);
    const investmentPeriod = parseFloat(document.getElementById('investment-period').value);
    const additionalContributions = parseFloat(document.getElementById('additional-contributions').value) || 0;
    const contributionFrequency = document.getElementById('contribution-frequency').value;

    // Validation
    if (!this.validateInputs(initialInvestment, finalValue, investmentPeriod)) {
      return;
    }

    let totalInvestment = initialInvestment;
    let contributionsPerYear = this.getContributionFrequency(contributionFrequency);

    totalInvestment += additionalContributions * contributionsPerYear * investmentPeriod;

    const totalReturn = finalValue - totalInvestment;
    const roi = (totalReturn / totalInvestment) * 100;
    const annualizedROI = (Math.pow((finalValue / initialInvestment), (1 / investmentPeriod)) - 1) * 100;

    this.displayResults(totalInvestment, totalReturn, roi, annualizedROI, finalValue);
  }

  validateInputs(initialInvestment, finalValue, investmentPeriod) {
    if (!initialInvestment || !finalValue || !investmentPeriod) {
      this.displayError('Please fill in all required fields.');
      return false;
    }

    if (initialInvestment <= 0 || finalValue <= 0 || investmentPeriod <= 0) {
      this.displayError('All values must be greater than zero.');
      return false;
    }

    return true;
  }

  getContributionFrequency(frequency) {
    switch (frequency) {
      case 'monthly':
        return 12;
      case 'quarterly':
        return 4;
      case 'annually':
        return 1;
      default:
        return 12;
    }
  }

  displayResults(totalInvestment, totalReturn, roi, annualizedROI, finalValue) {
    if (this.resultSection) {
      this.resultSection.style.display = 'block';
      
      const resultsElement = document.getElementById('roi-results');
      if (resultsElement) {
        resultsElement.innerHTML = `
          <p><strong>Total Investment:</strong> $${this.formatCurrency(totalInvestment)}</p>
          <p><strong>Final Value:</strong> $${this.formatCurrency(finalValue)}</p>
          <p><strong>Total Return:</strong> $${this.formatCurrency(totalReturn)}</p>
          <p><strong>ROI:</strong> ${roi.toFixed(2)}%</p>
          <p><strong>Annualized ROI:</strong> ${annualizedROI.toFixed(2)}%</p>
        `;
      }
      
      // Scroll to results
      this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  displayError(message) {
    if (this.resultSection) {
      this.resultSection.style.display = 'block';
      
      const resultsElement = document.getElementById('roi-results');
      if (resultsElement) {
        resultsElement.innerHTML = `
          <div class="error">
            <p>${message}</p>
          </div>
        `;
      }
      
      // Scroll to error
      this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  formatCurrency(value) {
    return parseFloat(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }

  formatPercentage(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
  }

  reset() {
    if (this.form) {
      this.form.reset();
    }
    if (this.resultSection) {
      this.resultSection.style.display = 'none';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ROICalculator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ROICalculator;
}
