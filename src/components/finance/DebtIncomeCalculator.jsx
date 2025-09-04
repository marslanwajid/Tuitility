 import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import DebtIncomeCalculatorJS from '../../assets/js/finance/debt-income-calculator.js'
import '../../assets/css/finance/debt-income-calculator.css'

const DebtIncomeCalculator = () => {
  const [formData, setFormData] = useState({
    salary: '',
    salaryPeriod: 'year',
    pension: '',
    pensionPeriod: 'year',
    investment: '',
    investmentPeriod: 'year',
    otherIncome: '',
    otherIncomePeriod: 'year',
    rentalCost: '',
    rentalCostPeriod: 'month',
    mortgage: '',
    mortgagePeriod: 'month',
    hoaFees: '',
    hoaFeesPeriod: 'month',
    creditCards: '',
    creditCardsPeriod: 'month',
    studentLoan: '',
    studentLoanPeriod: 'month',
    autoLoan: '',
    autoLoanPeriod: 'month',
    otherLoans: '',
    otherLoansPeriod: 'month',
    propertyTax: '',
    propertyTaxPeriod: 'year',
    homeownerInsurance: '',
    homeownerInsurancePeriod: 'year'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const debtIncomeCalc = new DebtIncomeCalculatorJS();
      setCalculator(debtIncomeCalc);
    } catch (error) {
      console.error('Error initializing debt income calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Debt Income Calculator',
    description: 'Calculate your debt-to-income ratio to assess financial health and loan eligibility. Analyze income vs debt obligations for better financial planning.',
    icon: 'fas fa-balance-scale',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Debt Income Calculator']
  };

  // Categories for sidebar
  const categories = [
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Utility', url: '/utility', icon: 'fas fa-wrench' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  // Related tools for sidebar
  const relatedTools = [
    { name: 'Debt Payoff Calculator', url: '/finance/calculators/debt-payoff-calculator', icon: 'fas fa-credit-card' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' },
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'House Affordability Calculator', url: '/finance/calculators/house-affordability-calculator', icon: 'fas fa-home' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-dti', title: 'What is Debt-to-Income Ratio?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'DTI Formulas & Calculations' },
    { id: 'examples', title: 'Examples' },
    { id: 'dti-ranges', title: 'DTI Ratio Ranges & Interpretation' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateInputs = () => {
    if (!calculator) return false;
    
    try {
      const errors = calculator.validateInputs(
        formData.salary,
        formData.pension,
        formData.investment,
        formData.otherIncome,
        formData.rentalCost,
        formData.mortgage,
        formData.hoaFees,
        formData.creditCards,
        formData.studentLoan,
        formData.autoLoan,
        formData.otherLoans,
        formData.propertyTax,
        formData.homeownerInsurance
      );
      
      if (errors.length > 0) {
        setError(errors[0]);
        return false;
      }
      return true;
    } catch (error) {
      setError('Validation error occurred. Please check your inputs.');
      return false;
    }
  };

  const calculateDebtIncome = () => {
    if (!validateInputs()) return;

    try {
      const {
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
        homeownerInsurance, homeownerInsurancePeriod
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateDebtIncome(
        parseFloat(salary || 0), salaryPeriod,
        parseFloat(pension || 0), pensionPeriod,
        parseFloat(investment || 0), investmentPeriod,
        parseFloat(otherIncome || 0), otherIncomePeriod,
        parseFloat(rentalCost || 0), rentalCostPeriod,
        parseFloat(mortgage || 0), mortgagePeriod,
        parseFloat(hoaFees || 0), hoaFeesPeriod,
        parseFloat(creditCards || 0), creditCardsPeriod,
        parseFloat(studentLoan || 0), studentLoanPeriod,
        parseFloat(autoLoan || 0), autoLoanPeriod,
        parseFloat(otherLoans || 0), otherLoansPeriod,
        parseFloat(propertyTax || 0), propertyTaxPeriod,
        parseFloat(homeownerInsurance || 0), homeownerInsurancePeriod
      );

      setResult(result);
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      salary: '',
      salaryPeriod: 'year',
      pension: '',
      pensionPeriod: 'year',
      investment: '',
      investmentPeriod: 'year',
      otherIncome: '',
      otherIncomePeriod: 'year',
      rentalCost: '',
      rentalCostPeriod: 'month',
      mortgage: '',
      mortgagePeriod: 'month',
      hoaFees: '',
      hoaFeesPeriod: 'month',
      creditCards: '',
      creditCardsPeriod: 'month',
      studentLoan: '',
      studentLoanPeriod: 'month',
      autoLoan: '',
      autoLoanPeriod: 'month',
      otherLoans: '',
      otherLoansPeriod: 'month',
      propertyTax: '',
      propertyTaxPeriod: 'year',
      homeownerInsurance: '',
      homeownerInsurancePeriod: 'year'
    });
    setResult(null);
    setError('');
  };

  // Format currency using the JS utility function
  const formatCurrency = (amount) => {
    if (calculator && calculator.formatCurrency) {
      return calculator.formatCurrency(amount);
    }
    // Fallback formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage using the JS utility function
  const formatPercentage = (value, decimals = 2) => {
    if (calculator && calculator.formatPercentage) {
      return calculator.formatPercentage(value);
    }
    // Fallback formatting
    return `${parseFloat(value).toFixed(decimals)}%`;
  };

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Debt Income Calculator"
        onCalculate={calculateDebtIncome}
        calculateButtonText="Calculate DTI Ratio"
        error={error}
        result={null}
      >
        <div className="debt-income-calculator-form">
          {/* Income Section */}
            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-salary" className="debt-income-input-label">
                  Salary/Wages:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-salary"
                    className="debt-income-input-field"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="e.g., 75000"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-salary-period"
                    className="debt-income-select-field"
                    value={formData.salaryPeriod}
                    onChange={(e) => handleInputChange('salaryPeriod', e.target.value)}
                  >
                    <option value="year">per year</option>
                    <option value="month">per month</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Your primary employment income
                </small>
              </div>

              <div className="debt-income-input-group">
                <label htmlFor="debt-income-pension" className="debt-income-input-label">
                  Pension/Retirement:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-pension"
                    className="debt-income-input-field"
                    value={formData.pension}
                    onChange={(e) => handleInputChange('pension', e.target.value)}
                    placeholder="e.g., 2000"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-pension-period"
                    className="debt-income-select-field"
                    value={formData.pensionPeriod}
                    onChange={(e) => handleInputChange('pensionPeriod', e.target.value)}
                  >
                    <option value="year">per year</option>
                    <option value="month">per month</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Retirement or pension income
                </small>
              </div>
            </div>

            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-investment" className="debt-income-input-label">
                  Investment Income:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-investment"
                    className="debt-income-input-field"
                    value={formData.investment}
                    onChange={(e) => handleInputChange('investment', e.target.value)}
                    placeholder="e.g., 5000"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-investment-period"
                    className="debt-income-select-field"
                    value={formData.investmentPeriod}
                    onChange={(e) => handleInputChange('investmentPeriod', e.target.value)}
                  >
                    <option value="year">per year</option>
                    <option value="month">per month</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Dividends, interest, capital gains
                </small>
              </div>

              <div className="debt-income-input-group">
                <label htmlFor="debt-income-other-income" className="debt-income-input-label">
                  Other Income:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-other-income"
                    className="debt-income-input-field"
                    value={formData.otherIncome}
                    onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                    placeholder="e.g., 3000"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-other-income-period"
                    className="debt-income-select-field"
                    value={formData.otherIncomePeriod}
                    onChange={(e) => handleInputChange('otherIncomePeriod', e.target.value)}
                  >
                    <option value="year">per year</option>
                    <option value="month">per month</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Freelance, rental, side business
                </small>
              </div>
            </div>

          {/* Debt Section */}
            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-rental-cost" className="debt-income-input-label">
                  Rent/Housing:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-rental-cost"
                    className="debt-income-input-field"
                    value={formData.rentalCost}
                    onChange={(e) => handleInputChange('rentalCost', e.target.value)}
                    placeholder="e.g., 1500"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-rental-cost-period"
                    className="debt-income-select-field"
                    value={formData.rentalCostPeriod}
                    onChange={(e) => handleInputChange('rentalCostPeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Monthly rent or housing payment
                </small>
              </div>

              <div className="debt-income-input-group">
                <label htmlFor="debt-income-mortgage" className="debt-income-input-label">
                  Mortgage Payment:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-mortgage"
                    className="debt-income-input-field"
                    value={formData.mortgage}
                    onChange={(e) => handleInputChange('mortgage', e.target.value)}
                    placeholder="e.g., 2000"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-mortgage-period"
                    className="debt-income-select-field"
                    value={formData.mortgagePeriod}
                    onChange={(e) => handleInputChange('mortgagePeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Principal, interest, taxes, insurance
                </small>
              </div>
            </div>

            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-hoa-fees" className="debt-income-input-label">
                  HOA Fees:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-hoa-fees"
                    className="debt-income-input-field"
                    value={formData.hoaFees}
                    onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                    placeholder="e.g., 200"
                    min="0"
                    step="10"
                  />
                  <select
                    id="debt-income-hoa-fees-period"
                    className="debt-income-select-field"
                    value={formData.hoaFeesPeriod}
                    onChange={(e) => handleInputChange('hoaFeesPeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Homeowners association fees
                </small>
              </div>

              <div className="debt-income-input-group">
                <label htmlFor="debt-income-credit-cards" className="debt-income-input-label">
                  Credit Card Payments:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-credit-cards"
                    className="debt-income-input-field"
                    value={formData.creditCards}
                    onChange={(e) => handleInputChange('creditCards', e.target.value)}
                    placeholder="e.g., 400"
                    min="0"
                    step="10"
                  />
                  <select
                    id="debt-income-credit-cards-period"
                    className="debt-income-select-field"
                    value={formData.creditCardsPeriod}
                    onChange={(e) => handleInputChange('creditCardsPeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Minimum monthly payments
                </small>
              </div>
            </div>

            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-student-loan" className="debt-income-input-label">
                  Student Loan:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-student-loan"
                    className="debt-income-input-field"
                    value={formData.studentLoan}
                    onChange={(e) => handleInputChange('studentLoan', e.target.value)}
                    placeholder="e.g., 300"
                    min="0"
                    step="10"
                  />
                  <select
                    id="debt-income-student-loan-period"
                    className="debt-income-select-field"
                    value={formData.studentLoanPeriod}
                    onChange={(e) => handleInputChange('studentLoanPeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Monthly student loan payment
                </small>
              </div>

              <div className="debt-income-input-group">
                <label htmlFor="debt-income-auto-loan" className="debt-income-input-label">
                  Auto Loan:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-auto-loan"
                    className="debt-income-input-field"
                    value={formData.autoLoan}
                    onChange={(e) => handleInputChange('autoLoan', e.target.value)}
                    placeholder="e.g., 350"
                    min="0"
                    step="10"
                  />
                  <select
                    id="debt-income-auto-loan-period"
                    className="debt-income-select-field"
                    value={formData.autoLoanPeriod}
                    onChange={(e) => handleInputChange('autoLoanPeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Monthly car payment
                </small>
              </div>
            </div>

            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-other-loans" className="debt-income-input-label">
                  Other Loans:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-other-loans"
                    className="debt-income-input-field"
                    value={formData.otherLoans}
                    onChange={(e) => handleInputChange('otherLoans', e.target.value)}
                    placeholder="e.g., 200"
                    min="0"
                    step="10"
                  />
                  <select
                    id="debt-income-other-loans-period"
                    className="debt-income-select-field"
                    value={formData.otherLoansPeriod}
                    onChange={(e) => handleInputChange('otherLoansPeriod', e.target.value)}
                  >
                    <option value="month">per month</option>
                    <option value="year">per year</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Personal loans, business loans
                </small>
              </div>

              <div className="debt-income-input-group">
                <label htmlFor="debt-income-property-tax" className="debt-income-input-label">
                  Property Tax:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-property-tax"
                    className="debt-income-input-field"
                    value={formData.propertyTax}
                    onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                    placeholder="e.g., 3600"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-property-tax-period"
                    className="debt-income-select-field"
                    value={formData.propertyTaxPeriod}
                    onChange={(e) => handleInputChange('propertyTaxPeriod', e.target.value)}
                  >
                    <option value="year">per year</option>
                    <option value="month">per month</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Annual property tax (if not in mortgage)
                </small>
              </div>
            </div>

            <div className="debt-income-input-row">
              <div className="debt-income-input-group">
                <label htmlFor="debt-income-homeowner-insurance" className="debt-income-input-label">
                  Homeowner Insurance:
                </label>
                <div className="debt-income-input-with-period">
                  <input
                    type="number"
                    id="debt-income-homeowner-insurance"
                    className="debt-income-input-field"
                    value={formData.homeownerInsurance}
                    onChange={(e) => handleInputChange('homeownerInsurance', e.target.value)}
                    placeholder="e.g., 1200"
                    min="0"
                    step="100"
                  />
                  <select
                    id="debt-income-homeowner-insurance-period"
                    className="debt-income-select-field"
                    value={formData.homeownerInsurancePeriod}
                    onChange={(e) => handleInputChange('homeownerInsurancePeriod', e.target.value)}
                  >
                    <option value="year">per year</option>
                    <option value="month">per month</option>
                  </select>
                </div>
                <small className="debt-income-input-help">
                  Annual insurance (if not in mortgage)
                </small>
              </div>

              <div className="debt-income-input-group">
                <div className="debt-income-input-spacer"></div>
              </div>
            </div>

          <div className="debt-income-calculator-actions">
            <button type="button" className="debt-income-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="debt-income-calculator-result">
            <h3 className="debt-income-result-title">Debt-to-Income Analysis Results</h3>
            <div className="debt-income-result-content">
              <div className="debt-income-result-main">
                <div className="debt-income-result-item">
                  <strong>Total Annual Income:</strong>
                  <span className="debt-income-result-value">
                    {formatCurrency(result.totalAnnualIncome)}
                  </span>
                </div>
                <div className="debt-income-result-item">
                  <strong>Total Monthly Income:</strong>
                  <span className="debt-income-result-value">
                    {formatCurrency(result.totalMonthlyIncome)}
                  </span>
                </div>
                <div className="debt-income-result-item">
                  <strong>Total Monthly Debt:</strong>
                  <span className="debt-income-result-value">
                    {formatCurrency(result.totalMonthlyDebt)}
                  </span>
                </div>
                <div className="debt-income-result-item">
                  <strong>Debt-to-Income Ratio:</strong>
                  <span className="debt-income-result-value debt-income-dti-ratio">
                    {formatPercentage(result.debtToIncomeRatio)}
                  </span>
                </div>
                <div className="debt-income-result-item">
                  <strong>Financial Health:</strong>
                  <span className="debt-income-result-value debt-income-health-status">
                    {result.healthStatus}
                  </span>
                </div>
              </div>

              <div className="debt-income-result-breakdown">
                <h4>Income Breakdown</h4>
                <div className="debt-income-breakdown-details">
                  <div className="debt-income-breakdown-item">
                    <span>Salary/Wages:</span>
                    <span>{formatCurrency(result.incomeBreakdown.salary)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Pension/Retirement:</span>
                    <span>{formatCurrency(result.incomeBreakdown.pension)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Investment Income:</span>
                    <span>{formatCurrency(result.incomeBreakdown.investment)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Other Income:</span>
                    <span>{formatCurrency(result.incomeBreakdown.otherIncome)}</span>
                  </div>
                  <div className="debt-income-breakdown-item debt-income-total">
                    <span>Total Annual Income:</span>
                    <span>{formatCurrency(result.totalAnnualIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="debt-income-result-breakdown">
                <h4>Debt Breakdown</h4>
                <div className="debt-income-breakdown-details">
                  <div className="debt-income-breakdown-item">
                    <span>Rent/Housing:</span>
                    <span>{formatCurrency(result.debtBreakdown.rentalCost)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Mortgage Payment:</span>
                    <span>{formatCurrency(result.debtBreakdown.mortgage)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>HOA Fees:</span>
                    <span>{formatCurrency(result.debtBreakdown.hoaFees)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Credit Card Payments:</span>
                    <span>{formatCurrency(result.debtBreakdown.creditCards)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Student Loan:</span>
                    <span>{formatCurrency(result.debtBreakdown.studentLoan)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Auto Loan:</span>
                    <span>{formatCurrency(result.debtBreakdown.autoLoan)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Other Loans:</span>
                    <span>{formatCurrency(result.debtBreakdown.otherLoans)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Property Tax:</span>
                    <span>{formatCurrency(result.debtBreakdown.propertyTax)}</span>
                  </div>
                  <div className="debt-income-breakdown-item">
                    <span>Homeowner Insurance:</span>
                    <span>{formatCurrency(result.debtBreakdown.homeownerInsurance)}</span>
                  </div>
                  <div className="debt-income-breakdown-item debt-income-total">
                    <span>Total Monthly Debt:</span>
                    <span>{formatCurrency(result.totalMonthlyDebt)}</span>
                  </div>
                </div>
              </div>

              <div className="debt-income-result-interpretation">
                <h4>Financial Health Assessment</h4>
                <div className="debt-income-interpretation-details">
                  <div className="debt-income-interpretation-item">
                    <span>DTI Ratio:</span>
                    <span>{formatPercentage(result.debtToIncomeRatio)}</span>
                  </div>
                  <div className="debt-income-interpretation-item">
                    <span>Health Status:</span>
                    <span>{result.healthStatus}</span>
                  </div>
                  <div className="debt-income-interpretation-item">
                    <span>Loan Eligibility:</span>
                    <span>{result.loanEligibility}</span>
                  </div>
                  <div className="debt-income-interpretation-item">
                    <span>Recommendation:</span>
                    <span>{result.recommendation}</span>
                  </div>
                </div>
              </div>

              <div className="debt-income-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Keep your DTI ratio below 36% for optimal financial health and loan approval chances!</span>
              </div>
            </div>
          </div>
        )}
      </CalculatorSection>

      {/* TOC and Feedback Section - After Calculator, Before Content */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Debt-to-Income (DTI) Calculator is a crucial financial tool that helps you assess your 
          financial health by comparing your monthly debt payments to your monthly income. This ratio 
          is one of the most important factors lenders consider when evaluating loan applications.
        </p>
        <p>
          By calculating your DTI ratio, you can understand your financial position, improve your 
          chances of loan approval, and make informed decisions about taking on additional debt.
        </p>
      </ContentSection>

      <ContentSection id="what-is-dti" title="What is Debt-to-Income Ratio?">
        <p>
          The debt-to-income ratio is a personal finance measure that compares an individual's monthly 
          debt payments to their monthly gross income. It's expressed as a percentage and is used by 
          lenders to assess a borrower's ability to manage monthly payments and repay debts.
        </p>
        <ul>
          <li>
            <span><strong>Front-End DTI:</strong> Housing costs (rent/mortgage, property tax, insurance, HOA) divided by gross monthly income</span>
          </li>
          <li>
            <span><strong>Back-End DTI:</strong> All monthly debt payments divided by gross monthly income</span>
          </li>
          <li>
            <span><strong>Gross Income:</strong> Total income before taxes and deductions</span>
          </li>
          <li>
            <span><strong>Monthly Debt:</strong> All recurring monthly debt obligations</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Debt Income Calculator">
        <p>Using the debt-to-income calculator requires gathering your financial information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Income Sources:</strong> Salary, pension, investment income, and other income sources with their payment periods.</span>
          </li>
          <li>
            <span><strong>Add Monthly Debts:</strong> Include all monthly debt payments like rent/mortgage, credit cards, loans, and insurance.</span>
          </li>
          <li>
            <span><strong>Select Payment Periods:</strong> Choose whether each amount is monthly or annual for accurate calculations.</span>
          </li>
          <li>
            <span><strong>Include All Debts:</strong> Don't forget HOA fees, property taxes, and insurance if not included in mortgage.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate DTI Ratio" to see your financial health assessment.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use your gross income (before taxes) and include all recurring monthly 
          debt payments for the most accurate DTI calculation.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="DTI Formulas & Calculations">
        <div className="formula-section">
          <h3>Debt-to-Income Ratio</h3>
          <div className="math-formula">
            DTI Ratio = (Total Monthly Debt Payments ÷ Total Monthly Income) × 100
          </div>
          <p>This calculates your debt-to-income ratio as a percentage.</p>
        </div>

        <div className="formula-section">
          <h3>Monthly Income Conversion</h3>
          <div className="math-formula">
            Monthly Income = Annual Income ÷ 12
          </div>
          <p>Converts annual income to monthly income for DTI calculation.</p>
        </div>

        <div className="formula-section">
          <h3>Monthly Debt Conversion</h3>
          <div className="math-formula">
            Monthly Debt = Annual Debt ÷ 12
          </div>
          <p>Converts annual debt payments to monthly amounts.</p>
        </div>

        <div className="formula-section">
          <h3>Total Monthly Income</h3>
          <div className="math-formula">
            Total Monthly Income = (Salary + Pension + Investment + Other Income) ÷ 12
          </div>
          <p>Calculates total monthly income from all sources.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Excellent DTI Ratio</h3>
          <div className="example-solution">
            <p><strong>Monthly Income:</strong> $6,000</p>
            <p><strong>Monthly Debts:</strong> $1,800</p>
            <p><strong>DTI Ratio:</strong> 30%</p>
            <p><strong>Health Status:</strong> Excellent</p>
            <p><strong>Loan Eligibility:</strong> High approval chances</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Good DTI Ratio</h3>
          <div className="example-solution">
            <p><strong>Monthly Income:</strong> $5,500</p>
            <p><strong>Monthly Debts:</strong> $2,200</p>
            <p><strong>DTI Ratio:</strong> 40%</p>
            <p><strong>Health Status:</strong> Good</p>
            <p><strong>Loan Eligibility:</strong> Good approval chances</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: High DTI Ratio</h3>
          <div className="example-solution">
            <p><strong>Monthly Income:</strong> $4,000</p>
            <p><strong>Monthly Debts:</strong> $2,400</p>
            <p><strong>DTI Ratio:</strong> 60%</p>
            <p><strong>Health Status:</strong> Poor</p>
            <p><strong>Loan Eligibility:</strong> Low approval chances</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="dti-ranges" title="DTI Ratio Ranges & Interpretation">
        <div className="dti-ranges-grid">
          <div className="dti-range-item dti-excellent">
            <h4><i className="fas fa-check-circle"></i> Excellent (0-35%)</h4>
            <p>Your debt-to-income ratio is in the healthy range. You have excellent financial flexibility and should qualify for most loans with favorable terms.</p>
          </div>
          <div className="dti-range-item dti-good">
            <h4><i className="fas fa-thumbs-up"></i> Good (36-43%)</h4>
            <p>Your DTI ratio is manageable but approaching the upper limit. Most lenders will approve loans, but you may want to reduce debt before taking on new obligations.</p>
          </div>
          <div className="dti-range-item dti-caution">
            <h4><i className="fas fa-exclamation-triangle"></i> Caution (44-50%)</h4>
            <p>Your DTI ratio is high. Many lenders may be hesitant to approve new loans. Focus on paying down existing debt to improve your financial position.</p>
          </div>
          <div className="dti-range-item dti-warning">
            <h4><i className="fas fa-exclamation-circle"></i> Warning (50%+)</h4>
            <p>Your DTI ratio is very high and indicates financial stress. Immediate action is needed to reduce debt and improve your financial health.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding your debt-to-income ratio is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Lenders use DTI to assess your ability to repay loans and determine loan approval</span>
          </li>
          <li>
            <span>Helps you understand your financial health and capacity to take on additional debt</span>
          </li>
          <li>
            <span>Provides insight into your spending patterns and debt management</span>
          </li>
          <li>
            <span>Essential for mortgage applications and other major loan decisions</span>
          </li>
          <li>
            <span>Helps you set realistic financial goals and budgets</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Debt Income Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Multiple Income Sources:</strong> Salary, pension, investment income, and other income</span>
          </li>
          <li>
            <span><strong>Comprehensive Debt Tracking:</strong> All types of monthly debt payments</span>
          </li>
          <li>
            <span><strong>Flexible Periods:</strong> Monthly or annual input options for all amounts</span>
          </li>
          <li>
            <span><strong>Detailed Breakdown:</strong> Income and debt breakdown with totals</span>
          </li>
          <li>
            <span><strong>Health Assessment:</strong> Financial health status and recommendations</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Mortgage Applications</h4>
            <p>Calculate DTI for home loan applications and pre-approval</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-car"></i> Auto Loan Applications</h4>
            <p>Assess DTI before applying for car loans</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-credit-card"></i> Credit Card Applications</h4>
            <p>Evaluate DTI for credit card and personal loan applications</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Financial Planning</h4>
            <p>Use DTI for budgeting and financial goal setting</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-balance-scale"></i> Debt Management</h4>
            <p>Monitor DTI as part of debt reduction strategies</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Savings Planning</h4>
            <p>Determine how much you can save based on your DTI</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What's a good debt-to-income ratio?",
            answer: "A good DTI ratio is generally 36% or lower. Lenders typically prefer ratios below 43%, with 36% being the ideal maximum for most loan types. Lower ratios indicate better financial health and higher loan approval chances."
          },
          {
            question: "What debts should I include in my DTI calculation?",
            answer: "Include all recurring monthly debt payments: rent/mortgage, credit card minimum payments, student loans, auto loans, personal loans, and any other monthly debt obligations. Don't include utilities, groceries, or other living expenses."
          },
          {
            question: "Should I use gross or net income for DTI calculations?",
            answer: "Always use gross income (before taxes and deductions) for DTI calculations. Lenders use gross income to assess your ability to repay loans, as it represents your total earning capacity."
          },
          {
            question: "How can I improve my debt-to-income ratio?",
            answer: "You can improve your DTI by increasing your income (raise, side job, investment returns) or reducing your debt payments (pay off loans, refinance at lower rates, consolidate debt). Focus on paying down high-interest debt first."
          },
          {
            question: "Does DTI affect my credit score?",
            answer: "DTI doesn't directly affect your credit score, but it's a major factor in loan approval decisions. High DTI can limit your ability to get new credit, which can indirectly impact your credit utilization and credit mix."
          },
          {
            question: "What's the difference between front-end and back-end DTI?",
            answer: "Front-end DTI only includes housing costs (rent/mortgage, property tax, insurance, HOA), while back-end DTI includes all monthly debt payments. Lenders typically look at back-end DTI for most loans, but front-end DTI is important for mortgages."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default DebtIncomeCalculator
