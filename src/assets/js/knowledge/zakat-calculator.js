// Zakat Calculator Logic Class
class ZakatCalculatorLogic {
  constructor() {
    // Current market rates (these would ideally be updated via API)
    this.marketRates = {
      gold: {
        // Price per gram in USD
        USD: 65.50
      },
      silver: {
        // Price per gram in USD
        USD: 0.85
      },
      // Exchange rates to USD
      exchangeRates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.78,
        INR: 83.50,
        PKR: 278.50,
        SAR: 3.75,
        AED: 3.67,
        MYR: 4.65,
        IDR: 15750,
        TRY: 32.15
      }
    };
    
    // Nisab thresholds in grams
    this.nisabThresholds = {
      gold: 87.48,  // 87.48 grams of gold
      silver: 612.36 // 612.36 grams of silver
    };
    
    // Chart instance
    this.breakdownChart = null;
    
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Get form and result elements
    this.zakatForm = document.getElementById('zakat-calculator-form');
    this.resultSection = document.getElementById('result-section');
    
    // Form elements
    this.currencySelect = document.getElementById('currency');
    this.calculationMethodSelect = document.getElementById('calculation-method');
    
    // Input elements
    this.cashInHandInput = document.getElementById('cash-in-hand');
    this.bankDepositsInput = document.getElementById('bank-deposits');
    this.loansToOthersInput = document.getElementById('loans-to-others');
    this.otherCashAssetsInput = document.getElementById('other-cash-assets');
    this.goldJewelryInput = document.getElementById('gold-jewelry');
    this.silverJewelryInput = document.getElementById('silver-jewelry');
    this.stocksMutualFundsInput = document.getElementById('stocks-mutual-funds');
    this.retirementAccountsInput = document.getElementById('retirement-accounts');
    this.businessMerchandiseInput = document.getElementById('business-merchandise');
    this.businessCashInput = document.getElementById('business-cash');
    this.shortTermDebtInput = document.getElementById('short-term-debt');
    this.businessExpensesInput = document.getElementById('business-expenses');
    
    // Result elements
    this.totalZakatElement = document.getElementById('total-zakat');
    this.nisabValueElement = document.getElementById('nisab-value');
    this.totalAssetsElement = document.getElementById('total-assets');
    this.cashAssetsZakatElement = document.getElementById('cash-assets-zakat');
    this.goldSilverZakatElement = document.getElementById('gold-silver-zakat');
    this.investmentsZakatElement = document.getElementById('investments-zakat');
    this.liabilitiesDeductionElement = document.getElementById('liabilities-deduction');
    this.comparisonIndicator = document.getElementById('comparison-indicator');
    this.comparisonResult = document.getElementById('comparison-result');
    this.breakdownChartCanvas = document.getElementById('breakdown-chart');
    this.reductionTipsList = document.getElementById('reduction-tips-list');
    
    // Action buttons
    this.downloadResultsBtn = document.getElementById('download-results');
    this.shareResultsBtn = document.getElementById('share-results');
  }

  attachEventListeners() {
    // Handle form submission
    if (this.zakatForm) {
      this.zakatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateZakat();
      });
      
      // Reset form and hide results
      this.zakatForm.addEventListener('reset', () => {
        this.hideResults();
      });
    }
    
    // Handle download results button
    if (this.downloadResultsBtn) {
      this.downloadResultsBtn.addEventListener('click', () => {
        this.downloadResults();
      });
    }
    
    // Handle share results button
    if (this.shareResultsBtn) {
      this.shareResultsBtn.addEventListener('click', () => {
        this.shareResults();
      });
    }
  }

  // Calculate Zakat
  calculateZakat() {
    try {
      // Get selected currency and calculation method
      const currency = this.currencySelect ? this.currencySelect.value : 'USD';
      const calculationMethod = this.calculationMethodSelect ? this.calculationMethodSelect.value : 'gold';
      
      // Update currency display in results
      this.updateCurrencyDisplay(currency);
      
      // Calculate Nisab threshold in selected currency
      const nisabValue = this.calculateNisabValue(calculationMethod, currency);
      
      // Get asset values
      const cashAssets = this.getCashAssets();
      const preciousMetals = this.getPreciousMetals(currency);
      const investments = this.getInvestments();
      const liabilities = this.getLiabilities();
      
      // Calculate total assets and zakat
      const totalAssets = cashAssets + preciousMetals + investments - liabilities;
      
      // Check if total assets exceed Nisab
      let totalZakat = 0;
      if (totalAssets >= nisabValue) {
        // Zakat is 2.5% of total assets
        totalZakat = totalAssets * 0.025;
      }
      
      // Display results
      this.displayResults(totalZakat, nisabValue, totalAssets, cashAssets, preciousMetals, investments, liabilities, currency);
      
      // Show result section
      this.showResults();
      
      // Scroll to results
      if (this.resultSection) {
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error calculating Zakat:', error);
    }
  }

  // Calculate Nisab value in selected currency
  calculateNisabValue(method, currency) {
    const exchangeRate = this.marketRates.exchangeRates[currency];
    
    if (method === 'gold') {
      // Nisab based on gold value
      return (this.nisabThresholds.gold * this.marketRates.gold.USD) / exchangeRate;
    } else {
      // Nisab based on silver value
      return (this.nisabThresholds.silver * this.marketRates.silver.USD) / exchangeRate;
    }
  }

  // Get total cash assets
  getCashAssets() {
    const cashInHand = parseFloat(this.cashInHandInput ? this.cashInHandInput.value : 0) || 0;
    const bankDeposits = parseFloat(this.bankDepositsInput ? this.bankDepositsInput.value : 0) || 0;
    const loansToOthers = parseFloat(this.loansToOthersInput ? this.loansToOthersInput.value : 0) || 0;
    const otherCashAssets = parseFloat(this.otherCashAssetsInput ? this.otherCashAssetsInput.value : 0) || 0;
    
    return cashInHand + bankDeposits + loansToOthers + otherCashAssets;
  }

  // Get precious metals value
  getPreciousMetals(currency) {
    const goldJewelry = parseFloat(this.goldJewelryInput ? this.goldJewelryInput.value : 0) || 0;
    const silverJewelry = parseFloat(this.silverJewelryInput ? this.silverJewelryInput.value : 0) || 0;
    
    const exchangeRate = this.marketRates.exchangeRates[currency];
    
    // Convert gold and silver values to selected currency
    const goldValue = (goldJewelry * this.marketRates.gold.USD) / exchangeRate;
    const silverValue = (silverJewelry * this.marketRates.silver.USD) / exchangeRate;
    
    return goldValue + silverValue;
  }

  // Get investments value
  getInvestments() {
    const stocksMutualFunds = parseFloat(this.stocksMutualFundsInput ? this.stocksMutualFundsInput.value : 0) || 0;
    const retirementAccounts = parseFloat(this.retirementAccountsInput ? this.retirementAccountsInput.value : 0) || 0;
    const businessMerchandise = parseFloat(this.businessMerchandiseInput ? this.businessMerchandiseInput.value : 0) || 0;
    const businessCash = parseFloat(this.businessCashInput ? this.businessCashInput.value : 0) || 0;
    
    return stocksMutualFunds + retirementAccounts + businessMerchandise + businessCash;
  }

  // Get liabilities
  getLiabilities() {
    const shortTermDebt = parseFloat(this.shortTermDebtInput ? this.shortTermDebtInput.value : 0) || 0;
    const businessExpenses = parseFloat(this.businessExpensesInput ? this.businessExpensesInput.value : 0) || 0;
    
    return shortTermDebt + businessExpenses;
  }

  // Update currency display in results
  updateCurrencyDisplay(currency) {
    const currencyElements = document.querySelectorAll('#currency-display, #nisab-currency, #assets-currency, #cash-currency, #gold-currency, #investments-currency, #liabilities-currency');
    currencyElements.forEach(element => {
      element.textContent = currency;
    });
  }

  // Display results
  displayResults(totalZakat, nisabValue, totalAssets, cashAssets, preciousMetals, investments, liabilities, currency) {
    // Format numbers with commas and 2 decimal places
    const formatNumber = (num) => {
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    
    // Update result values
    if (this.totalZakatElement) {
      this.totalZakatElement.textContent = formatNumber(totalZakat);
    }
    if (this.nisabValueElement) {
      this.nisabValueElement.textContent = formatNumber(nisabValue);
    }
    if (this.totalAssetsElement) {
      this.totalAssetsElement.textContent = formatNumber(totalAssets);
    }
    
    // Calculate Zakat for each category
    const cashAssetsZakat = cashAssets > 0 ? cashAssets * 0.025 : 0;
    const preciousMetalsZakat = preciousMetals > 0 ? preciousMetals * 0.025 : 0;
    const investmentsZakat = investments > 0 ? investments * 0.025 : 0;
    const liabilitiesDeduction = liabilities > 0 ? liabilities * 0.025 : 0;
    
    // Update breakdown values
    if (this.cashAssetsZakatElement) {
      this.cashAssetsZakatElement.textContent = formatNumber(cashAssetsZakat);
    }
    if (this.goldSilverZakatElement) {
      this.goldSilverZakatElement.textContent = formatNumber(preciousMetalsZakat);
    }
    if (this.investmentsZakatElement) {
      this.investmentsZakatElement.textContent = formatNumber(investmentsZakat);
    }
    if (this.liabilitiesDeductionElement) {
      this.liabilitiesDeductionElement.textContent = formatNumber(liabilitiesDeduction);
    }
    
    // Update comparison indicator position
    this.updateComparisonIndicator(totalAssets, nisabValue);
    
    // Update breakdown chart
    this.updateBreakdownChart(cashAssets, preciousMetals, investments, liabilities);
    
    // Update tips
    this.updateTips(totalZakat, nisabValue, totalAssets, currency);
  }

  // Update comparison indicator position
  updateComparisonIndicator(totalAssets, nisabValue) {
    if (!this.comparisonIndicator) return;
    
    if (totalAssets < nisabValue) {
      // Below Nisab
      this.comparisonIndicator.style.left = '25%';
      if (this.comparisonResult) {
        this.comparisonResult.textContent = 'Below Nisab (No Zakat Due)';
      }
    } else if (totalAssets >= nisabValue && totalAssets < nisabValue * 2) {
      // Around Nisab
      this.comparisonIndicator.style.left = '50%';
      if (this.comparisonResult) {
        this.comparisonResult.textContent = 'Above Nisab (Zakat Due)';
      }
    } else {
      // Well above Nisab
      this.comparisonIndicator.style.left = '75%';
      if (this.comparisonResult) {
        this.comparisonResult.textContent = 'Significantly Above Nisab';
      }
    }
  }

  // Update breakdown chart
  updateBreakdownChart(cashAssets, preciousMetals, investments, liabilities) {
    if (!this.breakdownChartCanvas) return;
    
    const ctx = this.breakdownChartCanvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (this.breakdownChart) {
      this.breakdownChart.destroy();
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded. Skipping chart creation.');
      return;
    }
    
    // Create new chart
    this.breakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cash & Bank', 'Gold & Silver', 'Investments', 'Liabilities'],
        datasets: [{
          data: [cashAssets, preciousMetals, investments, liabilities],
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#fff',
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // Update tips based on calculation results
  updateTips(totalZakat, nisabValue, totalAssets, currency) {
    if (!this.reductionTipsList) return;
    
    this.reductionTipsList.innerHTML = '';
    
    // Add tips based on calculation results
    const tips = [];
    
    if (totalAssets < nisabValue) {
      tips.push('Your wealth is below the Nisab threshold. Zakat is not obligatory for you this year.');
      tips.push('Consider giving voluntary charity (Sadaqah) according to your means.');
    } else {
      tips.push(`Your Zakat payment of ${totalZakat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency} helps purify your wealth and supports those in need.`);
      tips.push('Zakat is due on the same lunar date each year. Mark your calendar for next year\'s calculation.');
      tips.push('Consider distributing your Zakat to multiple eligible recipients or reliable Zakat organizations.');
    }
    
    tips.push('Remember that Zakat is calculated on assets owned for a full lunar year (Hawl).');
    tips.push('Personal items like your primary residence, vehicles for personal use, and clothing are exempt from Zakat.');
    
    // Add tips to the list
    tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      this.reductionTipsList.appendChild(li);
    });
  }

  // Show results section
  showResults() {
    if (this.resultSection) {
      this.resultSection.style.display = 'block';
    }
  }

  // Hide results section
  hideResults() {
    if (this.resultSection) {
      this.resultSection.style.display = 'none';
    }
    if (this.breakdownChart) {
      this.breakdownChart.destroy();
      this.breakdownChart = null;
    }
  }

  // Handle download results button
  downloadResults() {
    try {
      // Check if jsPDF is available
      if (typeof window.jsPDF === 'undefined') {
        console.error('jsPDF is not loaded');
        alert('PDF generation is not available. Please try again later.');
        return;
      }

      const { jsPDF } = window.jsPDF;
      const doc = new jsPDF();
      
      const currency = this.currencySelect ? this.currencySelect.value : 'USD';
      const totalZakat = this.totalZakatElement ? this.totalZakatElement.textContent : '0';
      const nisabValue = this.nisabValueElement ? this.nisabValueElement.textContent : '0';
      const totalAssets = this.totalAssetsElement ? this.totalAssetsElement.textContent : '0';
      
      // Add logo to the PDF
      const logoImg = new Image();
      logoImg.src = '/images/logo.png';
      
      // Wait for the image to load before adding it to the PDF
      logoImg.onload = function() {
        // Add logo at the top center
        const imgWidth = 40;
        const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
        doc.addImage(logoImg, 'PNG', (doc.internal.pageSize.width - imgWidth) / 2, 10, imgWidth, imgHeight);
        
        // Add title below the logo
        doc.setFontSize(20);
        doc.text('Zakat Calculation Results', 105, imgHeight + 25, { align: 'center' });
        
        // Add calculation details
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, imgHeight + 40);
        doc.text(`Currency: ${currency}`, 20, imgHeight + 50);
        doc.text(`Nisab Threshold: ${nisabValue} ${currency}`, 20, imgHeight + 60);
        doc.text(`Total Zakat-eligible Assets: ${totalAssets} ${currency}`, 20, imgHeight + 70);
        doc.text(`Total Zakat Payable: ${totalZakat} ${currency}`, 20, imgHeight + 80);
        
        doc.setFontSize(14);
        doc.text('Breakdown of Zakat Calculation:', 20, imgHeight + 100);
        
        doc.setFontSize(12);
        doc.text(`Cash & Bank Assets: ${document.getElementById('cash-assets-zakat')?.textContent || '0'} ${currency}`, 30, imgHeight + 110);
        doc.text(`Gold & Silver: ${document.getElementById('gold-silver-zakat')?.textContent || '0'} ${currency}`, 30, imgHeight + 120);
        doc.text(`Investments & Business: ${document.getElementById('investments-zakat')?.textContent || '0'} ${currency}`, 30, imgHeight + 130);
        doc.text(`Less Liabilities: ${document.getElementById('liabilities-deduction')?.textContent || '0'} ${currency}`, 30, imgHeight + 140);
        
        doc.setFontSize(10);
        doc.text('This calculation is based on the information you provided and current market rates.', 20, imgHeight + 160);
        doc.text('For specific rulings, please consult with a qualified Islamic scholar.', 20, imgHeight + 170);
        
        // Save the PDF
        doc.save('zakat-calculation.pdf');
      };
      
      // Handle image loading error
      logoImg.onerror = function() {
        console.error('Error loading logo image');
        // Proceed with PDF generation without the logo
        doc.setFontSize(20);
        doc.text('Zakat Calculation Results', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
        doc.text(`Currency: ${currency}`, 20, 50);
        doc.text(`Nisab Threshold: ${nisabValue} ${currency}`, 20, 60);
        doc.text(`Total Zakat-eligible Assets: ${totalAssets} ${currency}`, 20, 70);
        doc.text(`Total Zakat Payable: ${totalZakat} ${currency}`, 20, 80);
        
        doc.setFontSize(14);
        doc.text('Breakdown of Zakat Calculation:', 20, 100);
        
        doc.setFontSize(12);
        doc.text(`Cash & Bank Assets: ${document.getElementById('cash-assets-zakat')?.textContent || '0'} ${currency}`, 30, 110);
        doc.text(`Gold & Silver: ${document.getElementById('gold-silver-zakat')?.textContent || '0'} ${currency}`, 30, 120);
        doc.text(`Investments & Business: ${document.getElementById('investments-zakat')?.textContent || '0'} ${currency}`, 30, 130);
        doc.text(`Less Liabilities: ${document.getElementById('liabilities-deduction')?.textContent || '0'} ${currency}`, 30, 140);
        
        doc.setFontSize(10);
        doc.text('This calculation is based on the information you provided and current market rates.', 20, 160);
        doc.text('For specific rulings, please consult with a qualified Islamic scholar.', 20, 170);
        
        doc.save('zakat-calculation.pdf');
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }

  // Handle share results button
  shareResults() {
    try {
      const currency = this.currencySelect ? this.currencySelect.value : 'USD';
      const totalZakat = this.totalZakatElement ? this.totalZakatElement.textContent : '0';
      
      // Create share text
      const shareText = `I calculated my Zakat using the Calculator Universe Zakat Calculator. My Zakat amount is ${totalZakat} ${currency}. Calculate yours at: https://calculatoruniverse.net/knowledge/calculators/zakat-calculator`;
      
      // Check if Web Share API is available
      if (navigator.share) {
        navigator.share({
          title: 'My Zakat Calculation',
          text: shareText,
          url: 'https://calculatoruniverse.net/knowledge/calculators/zakat-calculator'
        })
        .catch(error => {
          console.error('Error sharing:', error);
          this.fallbackShare(shareText);
        });
      } else {
        this.fallbackShare(shareText);
      }
    } catch (error) {
      console.error('Error sharing results:', error);
      alert('Error sharing results. Please try again.');
    }
  }

  // Fallback share method
  fallbackShare(text) {
    try {
      // Create a temporary input element
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      
      // Select and copy the text
      input.select();
      document.execCommand('copy');
      
      // Remove the temporary element
      document.body.removeChild(input);
      
      // Alert the user
      alert('Share text copied to clipboard! You can now paste it in your preferred app.');
    } catch (error) {
      console.error('Error in fallback share:', error);
      alert('Unable to copy to clipboard. Please copy the text manually.');
    }
  }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  new ZakatCalculatorLogic();
});

