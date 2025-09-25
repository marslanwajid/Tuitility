import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import '../../assets/css/knowledge/zakat-calculator.css';

const ZakatCalculator = () => {
  const [formData, setFormData] = useState({
    currency: 'USD',
    calculationMethod: 'gold',
    cashInHand: '',
    bankDeposits: '',
    loansToOthers: '',
    otherCashAssets: '',
    goldJewelry: '',
    silverJewelry: '',
    stocksMutualFunds: '',
    retirementAccounts: '',
    businessMerchandise: '',
    businessCash: '',
    shortTermDebt: '',
    businessExpenses: ''
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data for ToolPageLayout
  const toolData = {
    name: "Zakat Calculator",
    description: "Calculate your Zakat obligation with our comprehensive Islamic finance calculator. Determine your Zakat amount based on your assets, including cash, gold, silver, investments, and business assets, following Islamic principles.",
    category: "Knowledge",
    icon: "fas fa-mosque",
    breadcrumb: ['Knowledge', 'Calculators', 'Zakat Calculator'],
    keywords: ["zakat", "islamic", "finance", "charity", "obligation", "nisab", "gold", "silver", "assets"]
  };

  // Categories for navigation
  const categories = [
    { name: "Knowledge", url: "/knowledge" },
    { name: "Zakat Calculator", url: "/knowledge/calculators/zakat-calculator" }
  ];

  // Related tools
  const relatedTools = [
    { name: "GPA Calculator", url: "/knowledge/calculators/gpa-calculator", icon: "fas fa-graduation-cap" },
    { name: "Age Calculator", url: "/knowledge/calculators/age-calculator", icon: "fas fa-calendar-alt" },
    { name: "WPM Calculator", url: "/knowledge/calculators/wpm-calculator", icon: "fas fa-keyboard" },
    { name: "Habit Formation Calculator", url: "/knowledge/calculators/habit-formation-calculator", icon: "fas fa-calendar-check" },
    { name: "MBTI Calculator", url: "/knowledge/calculators/mbti-calculator", icon: "fas fa-user-friends" },
    { name: "Language Level Calculator", url: "/knowledge/calculators/language-level-calculator", icon: "fas fa-language" }
  ];

  // Market rates and exchange rates
  const marketRates = {
    gold: {
      USD: 65.50
    },
    silver: {
      USD: 0.85
    },
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
  const nisabThresholds = {
    gold: 87.48,
    silver: 612.36
  };

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'PKR', label: 'PKR - Pakistani Rupee' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
    { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
    { value: 'TRY', label: 'TRY - Turkish Lira' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate Zakat
  const calculateZakat = () => {
    try {
      const { currency, calculationMethod } = formData;
      
      // Calculate Nisab value
      const nisabValue = calculateNisabValue(calculationMethod, currency);
      
      // Get asset values
      const cashAssets = getCashAssets();
      const preciousMetals = getPreciousMetals(currency);
      const investments = getInvestments();
      const liabilities = getLiabilities();
      
      // Calculate total assets and zakat
      const totalAssets = cashAssets + preciousMetals + investments - liabilities;
      
      // Check if total assets exceed Nisab
      let totalZakat = 0;
      if (totalAssets >= nisabValue) {
        totalZakat = totalAssets * 0.025; // 2.5%
      }

      // Calculate Zakat for each category
      const cashAssetsZakat = cashAssets > 0 ? cashAssets * 0.025 : 0;
      const preciousMetalsZakat = preciousMetals > 0 ? preciousMetals * 0.025 : 0;
      const investmentsZakat = investments > 0 ? investments * 0.025 : 0;
      const liabilitiesDeduction = liabilities > 0 ? liabilities * 0.025 : 0;

      setResult({
        totalZakat,
        nisabValue,
        totalAssets,
        cashAssets,
        preciousMetals,
        investments,
        liabilities,
        cashAssetsZakat,
        preciousMetalsZakat,
        investmentsZakat,
        liabilitiesDeduction,
        currency,
        calculationMethod
      });

      setError('');
    } catch (err) {
      setError('Error calculating Zakat. Please check your inputs.');
      console.error('Calculation error:', err);
    }
  };

  // Calculate Nisab value in selected currency
  const calculateNisabValue = (method, currency) => {
    const exchangeRate = marketRates.exchangeRates[currency];
    
    if (method === 'gold') {
      return (nisabThresholds.gold * marketRates.gold.USD) / exchangeRate;
    } else {
      return (nisabThresholds.silver * marketRates.silver.USD) / exchangeRate;
    }
  };

  // Get total cash assets
  const getCashAssets = () => {
    const cashInHand = parseFloat(formData.cashInHand) || 0;
    const bankDeposits = parseFloat(formData.bankDeposits) || 0;
    const loansToOthers = parseFloat(formData.loansToOthers) || 0;
    const otherCashAssets = parseFloat(formData.otherCashAssets) || 0;
    
    return cashInHand + bankDeposits + loansToOthers + otherCashAssets;
  };

  // Get precious metals value
  const getPreciousMetals = (currency) => {
    const goldJewelry = parseFloat(formData.goldJewelry) || 0;
    const silverJewelry = parseFloat(formData.silverJewelry) || 0;
    
    const exchangeRate = marketRates.exchangeRates[currency];
    
    const goldValue = (goldJewelry * marketRates.gold.USD) / exchangeRate;
    const silverValue = (silverJewelry * marketRates.silver.USD) / exchangeRate;
    
    return goldValue + silverValue;
  };

  // Get investments value
  const getInvestments = () => {
    const stocksMutualFunds = parseFloat(formData.stocksMutualFunds) || 0;
    const retirementAccounts = parseFloat(formData.retirementAccounts) || 0;
    const businessMerchandise = parseFloat(formData.businessMerchandise) || 0;
    const businessCash = parseFloat(formData.businessCash) || 0;
    
    return stocksMutualFunds + retirementAccounts + businessMerchandise + businessCash;
  };

  // Get liabilities
  const getLiabilities = () => {
    const shortTermDebt = parseFloat(formData.shortTermDebt) || 0;
    const businessExpenses = parseFloat(formData.businessExpenses) || 0;
    
    return shortTermDebt + businessExpenses;
  };

  // Reset calculator
  const resetCalculator = () => {
    setFormData({
      currency: 'USD',
      calculationMethod: 'gold',
      cashInHand: '',
      bankDeposits: '',
      loansToOthers: '',
      otherCashAssets: '',
      goldJewelry: '',
      silverJewelry: '',
      stocksMutualFunds: '',
      retirementAccounts: '',
      businessMerchandise: '',
      businessCash: '',
      shortTermDebt: '',
      businessExpenses: ''
    });
    setResult(null);
    setError('');
  };

  // Format number with commas and 2 decimal places
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Load external JavaScript
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/assets/js/knowledge/zakat-calculator.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="/src/assets/js/knowledge/zakat-calculator.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Table of Contents data
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-zakat', title: 'What is Zakat?' },
    { id: 'nisab-thresholds', title: 'Nisab Thresholds' },
    { id: 'zakatable-assets', title: 'Zakatable Assets' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'calculation-method', title: 'Calculation Method' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' }
  ];

  // FAQ data
  const faqData = [
    {
      question: "What is the Nisab threshold for Zakat?",
      answer: "The Nisab threshold is the minimum amount of wealth that makes Zakat obligatory. It's equivalent to 87.48 grams of gold or 612.36 grams of silver. If your total Zakatable assets exceed this threshold and you've owned them for a full lunar year (Hawl), then Zakat becomes obligatory."
    },
    {
      question: "What assets are subject to Zakat?",
      answer: "Zakat is due on cash, bank deposits, gold, silver, business assets, investments, and loans given to others. Personal items like your primary residence, vehicles for personal use, and clothing are exempt from Zakat."
    },
    {
      question: "How is Zakat calculated?",
      answer: "Zakat is calculated as 2.5% of your total Zakatable assets that exceed the Nisab threshold. The calculation includes cash, gold, silver, investments, and business assets, minus any short-term debts and business expenses."
    },
    {
      question: "When is Zakat due?",
      answer: "Zakat is due once every lunar year (Hawl) on the same date you first reached the Nisab threshold. It's important to mark this date and calculate Zakat annually on the same date."
    },
    {
      question: "Can I deduct debts from my Zakat calculation?",
      answer: "Yes, short-term debts and business expenses that are due within the year can be deducted from your Zakatable assets. However, long-term debts like mortgages are generally not deducted."
    },
    {
      question: "What currency should I use for Zakat calculation?",
      answer: "You can calculate Zakat in any major currency. The calculator automatically converts gold and silver values to your selected currency using current market rates. Choose the currency that's most convenient for you."
    }
  ];

  return (
    <ToolPageLayout 
      toolData={toolData} 
      categories={categories} 
      relatedTools={relatedTools}
    >
      <CalculatorSection
        title="Zakat Calculator"
        description="Calculate your Zakat obligation based on your assets and Islamic principles."
        onCalculate={calculateZakat}
        calculateButtonText="Calculate Zakat"
        showCalculateButton={true}
      >
        <div className="zakat-calculator-form">
          <div className="zakat-form-section">
            <h3>Currency & Calculation Method</h3>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="currency" className="zakat-form-label">
                  <i className="fas fa-coins"></i>
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="zakat-form-select"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="zakat-form-group">
                <label htmlFor="calculation-method" className="zakat-form-label">
                  <i className="fas fa-balance-scale"></i>
                  Nisab Method
                </label>
                <select
                  id="calculation-method"
                  name="calculationMethod"
                  className="zakat-form-select"
                  value={formData.calculationMethod}
                  onChange={handleInputChange}
                >
                  <option value="gold">Gold Standard (87.48g)</option>
                  <option value="silver">Silver Standard (612.36g)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="zakat-form-section">
            <h3>Cash & Bank Assets</h3>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="cash-in-hand" className="zakat-form-label">
                  <i className="fas fa-money-bill-wave"></i>
                  Cash in Hand
                </label>
                <input
                  type="number"
                  id="cash-in-hand"
                  name="cashInHand"
                  className="zakat-form-input"
                  value={formData.cashInHand}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="zakat-form-group">
                <label htmlFor="bank-deposits" className="zakat-form-label">
                  <i className="fas fa-university"></i>
                  Bank Deposits
                </label>
                <input
                  type="number"
                  id="bank-deposits"
                  name="bankDeposits"
                  className="zakat-form-input"
                  value={formData.bankDeposits}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="loans-to-others" className="zakat-form-label">
                  <i className="fas fa-hand-holding-usd"></i>
                  Loans Given to Others
                </label>
                <input
                  type="number"
                  id="loans-to-others"
                  name="loansToOthers"
                  className="zakat-form-input"
                  value={formData.loansToOthers}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="zakat-form-group">
                <label htmlFor="other-cash-assets" className="zakat-form-label">
                  <i className="fas fa-wallet"></i>
                  Other Cash Assets
                </label>
                <input
                  type="number"
                  id="other-cash-assets"
                  name="otherCashAssets"
                  className="zakat-form-input"
                  value={formData.otherCashAssets}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="zakat-form-section">
            <h3>Gold & Silver (in grams)</h3>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="gold-jewelry" className="zakat-form-label">
                  <i className="fas fa-gem"></i>
                  Gold Jewelry/Coins
                </label>
                <input
                  type="number"
                  id="gold-jewelry"
                  name="goldJewelry"
                  className="zakat-form-input"
                  value={formData.goldJewelry}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="zakat-form-group">
                <label htmlFor="silver-jewelry" className="zakat-form-label">
                  <i className="fas fa-medal"></i>
                  Silver Jewelry/Coins
                </label>
                <input
                  type="number"
                  id="silver-jewelry"
                  name="silverJewelry"
                  className="zakat-form-input"
                  value={formData.silverJewelry}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="zakat-form-section">
            <h3>Investments & Business</h3>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="stocks-mutual-funds" className="zakat-form-label">
                  <i className="fas fa-chart-line"></i>
                  Stocks & Mutual Funds
                </label>
                <input
                  type="number"
                  id="stocks-mutual-funds"
                  name="stocksMutualFunds"
                  className="zakat-form-input"
                  value={formData.stocksMutualFunds}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="zakat-form-group">
                <label htmlFor="retirement-accounts" className="zakat-form-label">
                  <i className="fas fa-piggy-bank"></i>
                  Retirement Accounts
                </label>
                <input
                  type="number"
                  id="retirement-accounts"
                  name="retirementAccounts"
                  className="zakat-form-input"
                  value={formData.retirementAccounts}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="business-merchandise" className="zakat-form-label">
                  <i className="fas fa-boxes"></i>
                  Business Merchandise
                </label>
                <input
                  type="number"
                  id="business-merchandise"
                  name="businessMerchandise"
                  className="zakat-form-input"
                  value={formData.businessMerchandise}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="zakat-form-group">
                <label htmlFor="business-cash" className="zakat-form-label">
                  <i className="fas fa-cash-register"></i>
                  Business Cash
                </label>
                <input
                  type="number"
                  id="business-cash"
                  name="businessCash"
                  className="zakat-form-input"
                  value={formData.businessCash}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="zakat-form-section">
            <h3>Liabilities & Deductions</h3>
            <div className="zakat-form-row">
              <div className="zakat-form-group">
                <label htmlFor="short-term-debt" className="zakat-form-label">
                  <i className="fas fa-credit-card"></i>
                  Short-term Debt
                </label>
                <input
                  type="number"
                  id="short-term-debt"
                  name="shortTermDebt"
                  className="zakat-form-input"
                  value={formData.shortTermDebt}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="zakat-form-group">
                <label htmlFor="business-expenses" className="zakat-form-label">
                  <i className="fas fa-receipt"></i>
                  Business Expenses
                </label>
                <input
                  type="number"
                  id="business-expenses"
                  name="businessExpenses"
                  className="zakat-form-input"
                  value={formData.businessExpenses}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="zakat-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="zakat-calculator-result">
            <div className="zakat-result-header">
              <h3>Your Zakat Calculation</h3>
            </div>
            
            <div className="zakat-summary">
              <div className="zakat-main-result">
                <div className="zakat-amount">
                  <span className="zakat-amount-label">Total Zakat Payable</span>
                  <span className="zakat-amount-value">
                    {formatNumber(result.totalZakat)} {result.currency}
                  </span>
                </div>
                <div className="zakat-nisab-info">
                  <span className="zakat-nisab-label">Nisab Threshold</span>
                  <span className="zakat-nisab-value">
                    {formatNumber(result.nisabValue)} {result.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="zakat-breakdown">
              <h4>Asset Breakdown</h4>
              <div className="zakat-breakdown-grid">
                <div className="zakat-breakdown-item">
                  <span className="zakat-breakdown-label">Cash & Bank Assets</span>
                  <span className="zakat-breakdown-value">
                    {formatNumber(result.cashAssets)} {result.currency}
                  </span>
                  <span className="zakat-breakdown-zakat">
                    Zakat: {formatNumber(result.cashAssetsZakat)} {result.currency}
                  </span>
                </div>
                <div className="zakat-breakdown-item">
                  <span className="zakat-breakdown-label">Gold & Silver</span>
                  <span className="zakat-breakdown-value">
                    {formatNumber(result.preciousMetals)} {result.currency}
                  </span>
                  <span className="zakat-breakdown-zakat">
                    Zakat: {formatNumber(result.preciousMetalsZakat)} {result.currency}
                  </span>
                </div>
                <div className="zakat-breakdown-item">
                  <span className="zakat-breakdown-label">Investments & Business</span>
                  <span className="zakat-breakdown-value">
                    {formatNumber(result.investments)} {result.currency}
                  </span>
                  <span className="zakat-breakdown-zakat">
                    Zakat: {formatNumber(result.investmentsZakat)} {result.currency}
                  </span>
                </div>
                <div className="zakat-breakdown-item">
                  <span className="zakat-breakdown-label">Less Liabilities</span>
                  <span className="zakat-breakdown-value">
                    -{formatNumber(result.liabilities)} {result.currency}
                  </span>
                  <span className="zakat-breakdown-zakat">
                    Deduction: {formatNumber(result.liabilitiesDeduction)} {result.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="zakat-tips">
              <h4>Important Notes</h4>
              <ul className="zakat-tips-list">
                {result.totalAssets < result.nisabValue ? (
                  <>
                    <li>Your wealth is below the Nisab threshold. Zakat is not obligatory for you this year.</li>
                    <li>Consider giving voluntary charity (Sadaqah) according to your means.</li>
                  </>
                ) : (
                  <>
                    <li>Your Zakat payment helps purify your wealth and supports those in need.</li>
                    <li>Zakat is due on the same lunar date each year. Mark your calendar for next year's calculation.</li>
                    <li>Consider distributing your Zakat to multiple eligible recipients or reliable Zakat organizations.</li>
                  </>
                )}
                <li>Remember that Zakat is calculated on assets owned for a full lunar year (Hawl).</li>
                <li>Personal items like your primary residence, vehicles for personal use, and clothing are exempt from Zakat.</li>
              </ul>
            </div>

            <div className="zakat-disclaimer">
              <p><i className="fas fa-info-circle"></i> <strong>Disclaimer:</strong> This calculation is based on the information you provided and current market rates. For specific rulings, please consult with a qualified Islamic scholar.</p>
            </div>
          </div>
        )}

        <div className="zakat-form-actions">
          <button type="button" className="zakat-btn-reset" onClick={resetCalculator}>
            <i className="fas fa-undo"></i>
            Reset Calculator
          </button>
        </div>
      </CalculatorSection>

      {/* TOC and Feedback Section */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Zakat Calculator is a comprehensive Islamic finance tool that helps you calculate your Zakat 
          obligation based on your assets and wealth. Zakat is one of the Five Pillars of Islam and is 
          obligatory for Muslims who meet the Nisab threshold.
        </p>
        <p>
          Our calculator considers all Zakatable assets including cash, bank deposits, gold, silver, 
          investments, business assets, and loans given to others. It automatically calculates the Nisab 
          threshold based on current gold and silver prices and provides accurate Zakat calculations 
          following Islamic principles.
        </p>
      </ContentSection>

      <ContentSection id="what-is-zakat" title="What is Zakat?">
        <p>
          Zakat is an obligatory form of charity in Islam, representing 2.5% of a Muslim's wealth that 
          exceeds the Nisab threshold. It's one of the Five Pillars of Islam and serves to purify wealth 
          while helping those in need.
        </p>
        <p>
          Zakat is not just a financial obligation but a spiritual act that purifies the soul and wealth. 
          It's calculated annually on the same lunar date (Hawl) and must be given to eligible recipients 
          as defined in the Quran.
        </p>
        <ul>
          <li><strong>Purpose:</strong> Purify wealth and help those in need</li>
          <li><strong>Rate:</strong> 2.5% of Zakatable assets above Nisab</li>
          <li><strong>Frequency:</strong> Once every lunar year (Hawl)</li>
          <li><strong>Recipients:</strong> Eight categories defined in the Quran</li>
        </ul>
      </ContentSection>

      <ContentSection id="nisab-thresholds" title="Nisab Thresholds">
        <p>
          The Nisab is the minimum amount of wealth that makes Zakat obligatory. It's based on the value 
          of gold or silver and must be owned for a full lunar year (Hawl) before Zakat becomes due.
        </p>
        
        <div className="nisab-thresholds-grid">
          <div className="nisab-threshold-item">
            <h4><i className="fas fa-gem"></i> Gold Standard</h4>
            <p><strong>87.48 grams of gold</strong></p>
            <p>This is the traditional gold-based Nisab threshold. The value is calculated using current gold prices.</p>
          </div>
          <div className="nisab-threshold-item">
            <h4><i className="fas fa-medal"></i> Silver Standard</h4>
            <p><strong>612.36 grams of silver</strong></p>
            <p>This is the silver-based Nisab threshold. Generally lower than gold standard, making it more accessible.</p>
          </div>
        </div>

        <div className="nisab-calculation-info">
          <h4>How Nisab is Calculated</h4>
          <ul>
            <li>Gold Nisab: 87.48g × Current Gold Price per gram</li>
            <li>Silver Nisab: 612.36g × Current Silver Price per gram</li>
            <li>Prices are updated based on current market rates</li>
            <li>You can choose either gold or silver standard for calculation</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection id="zakatable-assets" title="Zakatable Assets">
        <p>
          Understanding which assets are subject to Zakat is crucial for accurate calculation. Here are 
          the main categories of Zakatable assets:
        </p>
        
        <div className="zakatable-assets-grid">
          <div className="zakatable-asset-item">
            <h4><i className="fas fa-money-bill-wave"></i> Cash & Bank Assets</h4>
            <ul>
              <li>Cash in hand and at home</li>
              <li>Bank deposits and savings accounts</li>
              <li>Loans given to others</li>
              <li>Other liquid cash assets</li>
            </ul>
          </div>
          <div className="zakatable-asset-item">
            <h4><i className="fas fa-gem"></i> Precious Metals</h4>
            <ul>
              <li>Gold jewelry, coins, and bullion</li>
              <li>Silver jewelry, coins, and bullion</li>
              <li>Mixed metal jewelry (calculated proportionally)</li>
            </ul>
          </div>
          <div className="zakatable-asset-item">
            <h4><i className="fas fa-chart-line"></i> Investments & Business</h4>
            <ul>
              <li>Stocks and mutual funds</li>
              <li>Retirement accounts</li>
              <li>Business merchandise and inventory</li>
              <li>Business cash and receivables</li>
            </ul>
          </div>
          <div className="zakatable-asset-item">
            <h4><i className="fas fa-home"></i> Exempt Assets</h4>
            <ul>
              <li>Primary residence (personal use)</li>
              <li>Personal vehicles</li>
              <li>Clothing and personal items</li>
              <li>Tools of trade (for personal use)</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator">
        <p>Follow these steps to calculate your Zakat obligation:</p>
        
        <h3>Step 1: Select Currency & Method</h3>
        <ul className="usage-steps">
          <li><strong>Choose Currency:</strong> Select your preferred currency from the dropdown</li>
          <li><strong>Select Nisab Method:</strong> Choose between gold or silver standard for Nisab calculation</li>
          <li><strong>Current Rates:</strong> The calculator uses current market rates for gold and silver</li>
        </ul>

        <h3>Step 2: Enter Your Assets</h3>
        <ul className="usage-steps">
          <li><strong>Cash Assets:</strong> Enter cash in hand, bank deposits, loans given, and other cash assets</li>
          <li><strong>Precious Metals:</strong> Enter gold and silver amounts in grams (jewelry, coins, bullion)</li>
          <li><strong>Investments:</strong> Include stocks, mutual funds, retirement accounts, and business assets</li>
          <li><strong>Liabilities:</strong> Enter short-term debts and business expenses to be deducted</li>
        </ul>

        <h3>Step 3: Review Results</h3>
        <ul className="usage-steps">
          <li><strong>Check Nisab:</strong> Verify if your assets exceed the Nisab threshold</li>
          <li><strong>Review Breakdown:</strong> See how Zakat is calculated for each asset category</li>
          <li><strong>Read Tips:</strong> Follow the important notes and recommendations</li>
        </ul>
      </ContentSection>

      <ContentSection id="calculation-method" title="Calculation Method">
        <p>
          The Zakat calculation follows a systematic approach based on Islamic principles and current 
          market rates for precious metals.
        </p>
        
        <div className="calculation-method-section">
          <h3>Step-by-Step Calculation</h3>
          <ol>
            <li><strong>Determine Nisab:</strong> Calculate Nisab threshold based on selected method (gold/silver)</li>
            <li><strong>Sum Assets:</strong> Add all Zakatable assets (cash, gold, silver, investments, business)</li>
            <li><strong>Subtract Liabilities:</strong> Deduct short-term debts and business expenses</li>
            <li><strong>Check Threshold:</strong> Verify if total assets exceed Nisab</li>
            <li><strong>Calculate Zakat:</strong> Apply 2.5% rate to assets above Nisab</li>
          </ol>
          
          <h3>Formula</h3>
          <div className="zakat-formula">
            <p><strong>Total Zakatable Assets = Cash + Gold + Silver + Investments + Business - Liabilities</strong></p>
            <p><strong>Zakat = 2.5% × (Total Assets - Nisab) [if Total Assets ≥ Nisab]</strong></p>
            <p><strong>Zakat = 0 (if Total Assets &lt; Nisab)</strong></p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Above Nisab (Zakat Due)</h3>
          <div className="example-solution">
            <p><strong>Assets:</strong> Cash: $5,000, Gold: 100g, Silver: 500g, Investments: $10,000</p>
            <p><strong>Liabilities:</strong> Short-term debt: $2,000</p>
            <p><strong>Nisab (Gold Standard):</strong> $5,730</p>
            <p><strong>Total Assets:</strong> $18,500</p>
            <p><strong>Zakat Due:</strong> 2.5% × $18,500 = $462.50</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Below Nisab (No Zakat)</h3>
          <div className="example-solution">
            <p><strong>Assets:</strong> Cash: $2,000, Gold: 50g, Silver: 200g</p>
            <p><strong>Liabilities:</strong> $500</p>
            <p><strong>Nisab (Silver Standard):</strong> $520</p>
            <p><strong>Total Assets:</strong> $3,200</p>
            <p><strong>Zakat Due:</strong> $0 (Below Nisab threshold)</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Business Owner</h3>
          <div className="example-solution">
            <p><strong>Assets:</strong> Cash: $10,000, Business inventory: $15,000, Business cash: $5,000</p>
            <p><strong>Liabilities:</strong> Business expenses: $3,000</p>
            <p><strong>Nisab (Gold Standard):</strong> $5,730</p>
            <p><strong>Total Assets:</strong> $27,000</p>
            <p><strong>Zakat Due:</strong> 2.5% × $27,000 = $675</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding and calculating Zakat correctly is crucial for several reasons:</p>
        <ul>
          <li><strong>Religious Obligation:</strong> Zakat is one of the Five Pillars of Islam and is obligatory for eligible Muslims</li>
          <li><strong>Wealth Purification:</strong> Zakat purifies wealth and removes greed from the heart</li>
          <li><strong>Social Justice:</strong> Redistributes wealth to help those in need and reduce inequality</li>
          <li><strong>Spiritual Growth:</strong> Fulfilling Zakat obligations strengthens faith and spiritual connection</li>
          <li><strong>Community Support:</strong> Zakat funds support various community needs and social welfare</li>
          <li><strong>Economic Balance:</strong> Helps maintain economic balance in society</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Zakat Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Multi-Currency Support:</strong> Calculate Zakat in 10 major currencies with real-time conversion</li>
          <li><strong>Dual Nisab Methods:</strong> Choose between gold or silver standard for Nisab calculation</li>
          <li><strong>Comprehensive Asset Categories:</strong> Covers all Zakatable assets including cash, precious metals, investments, and business assets</li>
          <li><strong>Automatic Calculations:</strong> Real-time calculation with current market rates for gold and silver</li>
          <li><strong>Detailed Breakdown:</strong> Shows Zakat calculation for each asset category</li>
          <li><strong>Liability Deductions:</strong> Properly accounts for short-term debts and business expenses</li>
          <li><strong>Educational Content:</strong> Comprehensive information about Zakat principles and calculations</li>
          <li><strong>Mobile Friendly:</strong> Responsive design for calculation on any device</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-mosque"></i> Religious Obligation</h4>
            <p>Fulfill your annual Zakat obligation as one of the Five Pillars of Islam</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Financial Planning</h4>
            <p>Plan your annual charitable giving and budget for Zakat payments</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-pie"></i> Wealth Management</h4>
            <p>Understand which assets are subject to Zakat for better wealth management</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-users"></i> Community Support</h4>
            <p>Calculate appropriate Zakat amounts to support community and charitable causes</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Educational Tool</h4>
            <p>Learn about Islamic finance principles and Zakat calculations</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-globe"></i> International Use</h4>
            <p>Calculate Zakat in different currencies for Muslims worldwide</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection faqs={faqData} />
    </ToolPageLayout>
  );
};

export default ZakatCalculator;

