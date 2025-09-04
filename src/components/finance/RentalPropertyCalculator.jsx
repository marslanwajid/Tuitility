import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import RentalPropertyCalculatorJS from '../../assets/js/finance/rental-property-calculator.js'
import '../../assets/css/finance/rental-property-calculator.css'

const RentalPropertyCalculator = () => {
  const [formData, setFormData] = useState({
    purchasePrice: '',
    useLoan: false,
    downPayment: '20',
    interestRate: '6',
    loanTerm: '30',
    closingCost: '',
    needRepairs: false,
    repairCost: '',
    valueAfterRepairs: '',
    monthlyRent: '',
    vacancyRate: '5',
    managementFee: '',
    propertyTax: '',
    insurance: '',
    maintenance: '',
    knowSellPrice: false,
    sellPrice: '',
    valueAppreciation: '3',
    holdingLength: '20',
    costToSell: '8'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const rentalPropertyCalc = new RentalPropertyCalculatorJS();
      setCalculator(rentalPropertyCalc);
    } catch (error) {
      console.error('Error initializing rental property calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Rental Property Calculator',
    description: 'Calculate rental property ROI, cash flow, and investment returns. Analyze rental property investments with comprehensive financial metrics.',
    icon: 'fas fa-home',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Rental Property Calculator']
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
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'House Affordability Calculator', url: '/finance/calculators/house-affordability-calculator', icon: 'fas fa-home' },
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-line' },
    { name: 'ROI Calculator', url: '/finance/calculators/roi-calculator', icon: 'fas fa-chart-line' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-rental-property', title: 'What is Rental Property Investment?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Rental Property Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'metrics', title: 'Key Investment Metrics' },
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

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
    setError('');
  };

  const validateInputs = () => {
    if (!calculator) return false;
    
    try {
      const errors = calculator.validateInputs(
        formData.purchasePrice,
        formData.useLoan,
        formData.downPayment,
        formData.interestRate,
        formData.loanTerm,
        formData.closingCost,
        formData.needRepairs,
        formData.repairCost,
        formData.valueAfterRepairs,
        formData.monthlyRent,
        formData.vacancyRate,
        formData.managementFee,
        formData.propertyTax,
        formData.insurance,
        formData.maintenance,
        formData.knowSellPrice,
        formData.sellPrice,
        formData.valueAppreciation,
        formData.holdingLength,
        formData.costToSell
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

  const calculateRentalProperty = () => {
    if (!validateInputs()) return;

    try {
      const {
        purchasePrice,
        useLoan,
        downPayment,
        interestRate,
        loanTerm,
        closingCost,
        needRepairs,
        repairCost,
        valueAfterRepairs,
        monthlyRent,
        vacancyRate,
        managementFee,
        propertyTax,
        insurance,
        maintenance,
        knowSellPrice,
        sellPrice,
        valueAppreciation,
        holdingLength,
        costToSell
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateRentalProperty(
        parseFloat(purchasePrice),
        useLoan,
        parseFloat(downPayment),
        parseFloat(interestRate),
        parseFloat(loanTerm),
        parseFloat(closingCost || 0),
        needRepairs,
        parseFloat(repairCost || 0),
        parseFloat(valueAfterRepairs || purchasePrice),
        parseFloat(monthlyRent),
        parseFloat(vacancyRate),
        parseFloat(managementFee || 0),
        parseFloat(propertyTax || 0),
        parseFloat(insurance || 0),
        parseFloat(maintenance || 0),
        knowSellPrice,
        parseFloat(sellPrice || 0),
        parseFloat(valueAppreciation),
        parseFloat(holdingLength),
        parseFloat(costToSell)
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
      purchasePrice: '',
      useLoan: false,
      downPayment: '20',
      interestRate: '6',
      loanTerm: '30',
      closingCost: '',
      needRepairs: false,
      repairCost: '',
      valueAfterRepairs: '',
      monthlyRent: '',
      vacancyRate: '5',
      managementFee: '',
      propertyTax: '',
      insurance: '',
      maintenance: '',
      knowSellPrice: false,
      sellPrice: '',
      valueAppreciation: '3',
      holdingLength: '20',
      costToSell: '8'
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
        title="Rental Property Calculator"
        onCalculate={calculateRentalProperty}
        calculateButtonText="Calculate Rental Property"
        error={error}
        result={null}
      >
        <div className="rental-property-calculator-form">
          {/* Property Details */}
          <div className="rental-property-section">
            <h3 className="rental-property-section-title">Property Details</h3>
            <div className="rental-property-input-row">
              <div className="rental-property-input-group">
                <label htmlFor="rental-property-purchase-price" className="rental-property-input-label">
                  Purchase Price ($):
                </label>
                <input
                  type="number"
                  id="rental-property-purchase-price"
                  className="rental-property-input-field"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="e.g., 300000"
                  min="0"
                  step="1000"
                />
                <small className="rental-property-input-help">
                  Total purchase price of the property
                </small>
              </div>

              <div className="rental-property-input-group">
                <label htmlFor="rental-property-monthly-rent" className="rental-property-input-label">
                  Monthly Rent ($):
                </label>
                <input
                  type="number"
                  id="rental-property-monthly-rent"
                  className="rental-property-input-field"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                  placeholder="e.g., 2500"
                  min="0"
                  step="100"
                />
                <small className="rental-property-input-help">
                  Expected monthly rental income
                </small>
              </div>
            </div>

            <div className="rental-property-input-row">
              <div className="rental-property-input-group">
                <label htmlFor="rental-property-closing-cost" className="rental-property-input-label">
                  Closing Costs ($):
                </label>
                <input
                  type="number"
                  id="rental-property-closing-cost"
                  className="rental-property-input-field"
                  value={formData.closingCost}
                  onChange={(e) => handleInputChange('closingCost', e.target.value)}
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                />
                <small className="rental-property-input-help">
                  Closing costs and fees
                </small>
              </div>

              <div className="rental-property-input-group">
                <label htmlFor="rental-property-holding-length" className="rental-property-input-label">
                  Holding Period (years):
                </label>
                <input
                  type="number"
                  id="rental-property-holding-length"
                  className="rental-property-input-field"
                  value={formData.holdingLength}
                  onChange={(e) => handleInputChange('holdingLength', e.target.value)}
                  placeholder="e.g., 20"
                  min="1"
                  max="50"
                  step="1"
                />
                <small className="rental-property-input-help">
                  How long you plan to hold the property
                </small>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="rental-property-section">
            <h3 className="rental-property-section-title">Loan Details</h3>
            <div className="rental-property-checkbox-group">
              <label className="rental-property-checkbox-label">
                <input
                  type="checkbox"
                  id="rental-property-use-loan"
                  className="rental-property-checkbox"
                  checked={formData.useLoan}
                  onChange={(e) => handleCheckboxChange('useLoan', e.target.checked)}
                />
                <span className="rental-property-checkbox-text">Use Loan Financing</span>
              </label>
            </div>

            {formData.useLoan && (
              <div className="rental-property-loan-details">
                <div className="rental-property-input-row">
                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-down-payment" className="rental-property-input-label">
                      Down Payment (%):
                    </label>
                    <input
                      type="number"
                      id="rental-property-down-payment"
                      className="rental-property-input-field"
                      value={formData.downPayment}
                      onChange={(e) => handleInputChange('downPayment', e.target.value)}
                      placeholder="e.g., 20"
                      min="0"
                      max="100"
                      step="1"
                    />
                    <small className="rental-property-input-help">
                      Down payment percentage
                    </small>
                  </div>

                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-interest-rate" className="rental-property-input-label">
                      Interest Rate (%):
                    </label>
                    <input
                      type="number"
                      id="rental-property-interest-rate"
                      className="rental-property-input-field"
                      value={formData.interestRate}
                      onChange={(e) => handleInputChange('interestRate', e.target.value)}
                      placeholder="e.g., 6"
                      min="0"
                      max="30"
                      step="0.1"
                    />
                    <small className="rental-property-input-help">
                      Annual interest rate
                    </small>
                  </div>
                </div>

                <div className="rental-property-input-row">
                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-loan-term" className="rental-property-input-label">
                      Loan Term (years):
                    </label>
                    <input
                      type="number"
                      id="rental-property-loan-term"
                      className="rental-property-input-field"
                      value={formData.loanTerm}
                      onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                      placeholder="e.g., 30"
                      min="1"
                      max="50"
                      step="1"
                    />
                    <small className="rental-property-input-help">
                      Loan term in years
                    </small>
                  </div>

                  <div className="rental-property-input-group">
                    <div className="rental-property-input-spacer"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Repairs */}
          <div className="rental-property-section">
            <h3 className="rental-property-section-title">Repairs & Improvements</h3>
            <div className="rental-property-checkbox-group">
              <label className="rental-property-checkbox-label">
                <input
                  type="checkbox"
                  id="rental-property-need-repairs"
                  className="rental-property-checkbox"
                  checked={formData.needRepairs}
                  onChange={(e) => handleCheckboxChange('needRepairs', e.target.checked)}
                />
                <span className="rental-property-checkbox-text">Property Needs Repairs</span>
              </label>
            </div>

            {formData.needRepairs && (
              <div className="rental-property-repair-details">
                <div className="rental-property-input-row">
                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-repair-cost" className="rental-property-input-label">
                      Repair Cost ($):
                    </label>
                    <input
                      type="number"
                      id="rental-property-repair-cost"
                      className="rental-property-input-field"
                      value={formData.repairCost}
                      onChange={(e) => handleInputChange('repairCost', e.target.value)}
                      placeholder="e.g., 15000"
                      min="0"
                      step="100"
                    />
                    <small className="rental-property-input-help">
                      Total cost of repairs and improvements
                    </small>
                  </div>

                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-value-after-repairs" className="rental-property-input-label">
                      Value After Repairs ($):
                    </label>
                    <input
                      type="number"
                      id="rental-property-value-after-repairs"
                      className="rental-property-input-field"
                      value={formData.valueAfterRepairs}
                      onChange={(e) => handleInputChange('valueAfterRepairs', e.target.value)}
                      placeholder="e.g., 350000"
                      min="0"
                      step="1000"
                    />
                    <small className="rental-property-input-help">
                      Estimated value after repairs
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operating Expenses */}
          <div className="rental-property-section">
            <h3 className="rental-property-section-title">Operating Expenses</h3>
            <div className="rental-property-input-row">
              <div className="rental-property-input-group">
                <label htmlFor="rental-property-vacancy-rate" className="rental-property-input-label">
                  Vacancy Rate (%):
                </label>
                <input
                  type="number"
                  id="rental-property-vacancy-rate"
                  className="rental-property-input-field"
                  value={formData.vacancyRate}
                  onChange={(e) => handleInputChange('vacancyRate', e.target.value)}
                  placeholder="e.g., 5"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <small className="rental-property-input-help">
                  Expected vacancy rate
                </small>
              </div>

              <div className="rental-property-input-group">
                <label htmlFor="rental-property-management-fee" className="rental-property-input-label">
                  Management Fee (%):
                </label>
                <input
                  type="number"
                  id="rental-property-management-fee"
                  className="rental-property-input-field"
                  value={formData.managementFee}
                  onChange={(e) => handleInputChange('managementFee', e.target.value)}
                  placeholder="e.g., 8"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <small className="rental-property-input-help">
                  Property management fee percentage
                </small>
              </div>
            </div>

            <div className="rental-property-input-row">
              <div className="rental-property-input-group">
                <label htmlFor="rental-property-property-tax" className="rental-property-input-label">
                  Annual Property Tax ($):
                </label>
                <input
                  type="number"
                  id="rental-property-property-tax"
                  className="rental-property-input-field"
                  value={formData.propertyTax}
                  onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                  placeholder="e.g., 3600"
                  min="0"
                  step="100"
                />
                <small className="rental-property-input-help">
                  Annual property tax
                </small>
              </div>

              <div className="rental-property-input-group">
                <label htmlFor="rental-property-insurance" className="rental-property-input-label">
                  Annual Insurance ($):
                </label>
                <input
                  type="number"
                  id="rental-property-insurance"
                  className="rental-property-input-field"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  placeholder="e.g., 1200"
                  min="0"
                  step="100"
                />
                <small className="rental-property-input-help">
                  Annual insurance premium
                </small>
              </div>
            </div>

            <div className="rental-property-input-row">
              <div className="rental-property-input-group">
                <label htmlFor="rental-property-maintenance" className="rental-property-input-label">
                  Annual Maintenance ($):
                </label>
                <input
                  type="number"
                  id="rental-property-maintenance"
                  className="rental-property-input-field"
                  value={formData.maintenance}
                  onChange={(e) => handleInputChange('maintenance', e.target.value)}
                  placeholder="e.g., 2400"
                  min="0"
                  step="100"
                />
                <small className="rental-property-input-help">
                  Annual maintenance and repairs
                </small>
              </div>

              <div className="rental-property-input-group">
                <div className="rental-property-input-spacer"></div>
              </div>
            </div>
          </div>

          {/* Sale Analysis */}
          <div className="rental-property-section">
            <h3 className="rental-property-section-title">Sale Analysis</h3>
            <div className="rental-property-checkbox-group">
              <label className="rental-property-checkbox-label">
                <input
                  type="checkbox"
                  id="rental-property-know-sell-price"
                  className="rental-property-checkbox"
                  checked={formData.knowSellPrice}
                  onChange={(e) => handleCheckboxChange('knowSellPrice', e.target.checked)}
                />
                <span className="rental-property-checkbox-text">I Know the Future Sale Price</span>
              </label>
            </div>

            {formData.knowSellPrice ? (
              <div className="rental-property-sell-price-known">
                <div className="rental-property-input-row">
                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-sell-price" className="rental-property-input-label">
                      Future Sale Price ($):
                    </label>
                    <input
                      type="number"
                      id="rental-property-sell-price"
                      className="rental-property-input-field"
                      value={formData.sellPrice}
                      onChange={(e) => handleInputChange('sellPrice', e.target.value)}
                      placeholder="e.g., 500000"
                      min="0"
                      step="1000"
                    />
                    <small className="rental-property-input-help">
                      Expected sale price
                    </small>
                  </div>

                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-cost-to-sell" className="rental-property-input-label">
                      Cost to Sell (%):
                    </label>
                    <input
                      type="number"
                      id="rental-property-cost-to-sell"
                      className="rental-property-input-field"
                      value={formData.costToSell}
                      onChange={(e) => handleInputChange('costToSell', e.target.value)}
                      placeholder="e.g., 8"
                      min="0"
                      max="20"
                      step="0.1"
                    />
                    <small className="rental-property-input-help">
                      Selling costs percentage
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rental-property-sell-price-unknown">
                <div className="rental-property-input-row">
                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-value-appreciation" className="rental-property-input-label">
                      Annual Appreciation (%):
                    </label>
                    <input
                      type="number"
                      id="rental-property-value-appreciation"
                      className="rental-property-input-field"
                      value={formData.valueAppreciation}
                      onChange={(e) => handleInputChange('valueAppreciation', e.target.value)}
                      placeholder="e.g., 3"
                      min="0"
                      max="20"
                      step="0.1"
                    />
                    <small className="rental-property-input-help">
                      Expected annual appreciation rate
                    </small>
                  </div>

                  <div className="rental-property-input-group">
                    <label htmlFor="rental-property-cost-to-sell" className="rental-property-input-label">
                      Cost to Sell (%):
                    </label>
                    <input
                      type="number"
                      id="rental-property-cost-to-sell"
                      className="rental-property-input-field"
                      value={formData.costToSell}
                      onChange={(e) => handleInputChange('costToSell', e.target.value)}
                      placeholder="e.g., 8"
                      min="0"
                      max="20"
                      step="0.1"
                    />
                    <small className="rental-property-input-help">
                      Selling costs percentage
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rental-property-calculator-actions">
            <button type="button" className="rental-property-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="rental-property-calculator-result">
            <h3 className="rental-property-result-title">Rental Property Analysis Results</h3>
            <div className="rental-property-result-content">
              <div className="rental-property-result-grid">
                <div className="rental-property-result-section">
                  <h4 className="rental-property-result-section-title">Cash Flow Analysis</h4>
                  <div className="rental-property-result-details">
                    <div className="rental-property-result-item">
                      <span>Monthly Cash Flow:</span>
                      <span>{formatCurrency(result.monthlyCashFlow)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Annual Cash Flow:</span>
                      <span>{formatCurrency(result.annualCashFlow)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Cash on Cash Return:</span>
                      <span>{formatPercentage(result.cashOnCashReturn)}</span>
                    </div>
                  </div>
                </div>

                <div className="rental-property-result-section">
                  <h4 className="rental-property-result-section-title">Investment Summary</h4>
                  <div className="rental-property-result-details">
                    <div className="rental-property-result-item">
                      <span>Total Investment:</span>
                      <span>{formatCurrency(result.totalInvestment)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Monthly Mortgage:</span>
                      <span>{formatCurrency(result.monthlyMortgage)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Loan Amount:</span>
                      <span>{formatCurrency(result.loanAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="rental-property-result-section">
                  <h4 className="rental-property-result-section-title">Future Sale Analysis</h4>
                  <div className="rental-property-result-details">
                    <div className="rental-property-result-item">
                      <span>Estimated Sell Price:</span>
                      <span>{formatCurrency(result.estimatedSellPrice)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Total Profit on Sale:</span>
                      <span>{formatCurrency(result.profitOnSale)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Remaining Loan Balance:</span>
                      <span>{formatCurrency(result.remainingLoanBalance)}</span>
                    </div>
                  </div>
                </div>

                <div className="rental-property-result-section">
                  <h4 className="rental-property-result-section-title">Total Return Analysis</h4>
                  <div className="rental-property-result-details">
                    <div className="rental-property-result-item">
                      <span>Total Cash Flow ({result.holdingLength} years):</span>
                      <span>{formatCurrency(result.totalCashFlow)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Total Return:</span>
                      <span>{formatCurrency(result.totalReturn)}</span>
                    </div>
                    <div className="rental-property-result-item">
                      <span>Annualized Return:</span>
                      <span>{formatPercentage(result.annualizedReturn)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rental-property-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: A good rental property should generate positive cash flow and provide strong returns over the long term!</span>
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
          The Rental Property Calculator is a comprehensive investment analysis tool that helps you 
          evaluate the financial performance of rental property investments. Whether you're a first-time 
          investor or an experienced landlord, this calculator provides detailed insights into cash flow, 
          ROI, and long-term returns.
        </p>
        <p>
          By inputting property details, financing information, operating expenses, and sale projections, 
          you can make informed decisions about rental property investments and compare different 
          investment opportunities.
        </p>
      </ContentSection>

      <ContentSection id="what-is-rental-property" title="What is Rental Property Investment?">
        <p>
          Rental property investment involves purchasing real estate with the intention of generating 
          rental income and potential appreciation. It's a popular form of real estate investing that 
          can provide both immediate cash flow and long-term wealth building.
        </p>
        <ul>
          <li>
            <span><strong>Cash Flow:</strong> Monthly rental income minus operating expenses and mortgage payments</span>
          </li>
          <li>
            <span><strong>Appreciation:</strong> Increase in property value over time</span>
          </li>
          <li>
            <span><strong>Leverage:</strong> Using borrowed money to increase potential returns</span>
          </li>
          <li>
            <span><strong>Tax Benefits:</strong> Deductions for mortgage interest, depreciation, and operating expenses</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Rental Property Calculator">
        <p>Using the rental property calculator requires several key pieces of information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Property Details:</strong> Purchase price, monthly rent, closing costs, and holding period.</span>
          </li>
          <li>
            <span><strong>Configure Financing:</strong> Choose cash purchase or loan financing with down payment, interest rate, and loan term.</span>
          </li>
          <li>
            <span><strong>Add Repairs:</strong> Include repair costs and value after repairs if the property needs work.</span>
          </li>
          <li>
            <span><strong>Set Operating Expenses:</strong> Vacancy rate, management fees, property tax, insurance, and maintenance.</span>
          </li>
          <li>
            <span><strong>Configure Sale Analysis:</strong> Choose between known sale price or appreciation rate for future value.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Rental Property" to see your analysis.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use conservative estimates for expenses and vacancy rates to ensure 
          realistic projections for your investment analysis.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Rental Property Formulas & Methods">
        <div className="formula-section">
          <h3>Monthly Cash Flow</h3>
          <div className="math-formula">
            Monthly Cash Flow = (Monthly Rent × (1 - Vacancy Rate)) - Monthly Expenses - Monthly Mortgage
          </div>
          <p>This calculates your monthly cash flow after all expenses and mortgage payments.</p>
        </div>

        <div className="formula-section">
          <h3>Cash on Cash Return</h3>
          <div className="math-formula">
            Cash on Cash Return = (Annual Cash Flow ÷ Total Investment) × 100
          </div>
          <p>This shows the return on your actual cash investment in the property.</p>
        </div>

        <div className="formula-section">
          <h3>Total Investment</h3>
          <div className="math-formula">
            Total Investment = Down Payment + Closing Costs + Repair Costs
          </div>
          <p>This calculates your total cash investment in the property.</p>
        </div>

        <div className="formula-section">
          <h3>Annualized Return</h3>
          <div className="math-formula">
            Annualized Return = ((Total Return + Total Investment) ÷ Total Investment)^(1 ÷ Years) - 1
          </div>
          <p>This shows your compound annual growth rate over the holding period.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Cash Purchase</h3>
          <div className="example-solution">
            <p><strong>Purchase Price:</strong> $300,000</p>
            <p><strong>Monthly Rent:</strong> $2,500</p>
            <p><strong>Annual Expenses:</strong> $8,000</p>
            <p><strong>Monthly Cash Flow:</strong> $1,333</p>
            <p><strong>Cash on Cash Return:</strong> 5.33%</p>
            <p><strong>Annualized Return:</strong> 6.8%</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Leveraged Purchase</h3>
          <div className="example-solution">
            <p><strong>Purchase Price:</strong> $300,000</p>
            <p><strong>Down Payment:</strong> $60,000 (20%)</p>
            <p><strong>Monthly Rent:</strong> $2,500</p>
            <p><strong>Monthly Mortgage:</strong> $1,200</p>
            <p><strong>Monthly Cash Flow:</strong> $133</p>
            <p><strong>Cash on Cash Return:</strong> 2.66%</p>
            <p><strong>Annualized Return:</strong> 8.2%</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Fix and Flip</h3>
          <div className="example-solution">
            <p><strong>Purchase Price:</strong> $200,000</p>
            <p><strong>Repair Costs:</strong> $50,000</p>
            <p><strong>Value After Repairs:</strong> $300,000</p>
            <p><strong>Monthly Rent:</strong> $2,200</p>
            <p><strong>Monthly Cash Flow:</strong> $800</p>
            <p><strong>Cash on Cash Return:</strong> 3.84%</p>
            <p><strong>Annualized Return:</strong> 12.5%</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="metrics" title="Key Investment Metrics">
        <div className="metrics-grid">
          <div className="metric-item">
            <h4><i className="fas fa-dollar-sign"></i> Cash Flow</h4>
            <p>The amount of money left over after all expenses and mortgage payments. Positive cash flow is essential for profitable rental properties.</p>
          </div>
          <div className="metric-item">
            <h4><i className="fas fa-percentage"></i> Cash on Cash Return</h4>
            <p>The return on your actual cash investment. A good rental property typically provides 8-12% cash on cash return.</p>
          </div>
          <div className="metric-item">
            <h4><i className="fas fa-chart-line"></i> Cap Rate</h4>
            <p>The net operating income divided by the property value. Useful for comparing properties without considering financing.</p>
          </div>
          <div className="metric-item">
            <h4><i className="fas fa-home"></i> Loan-to-Value (LTV)</h4>
            <p>The ratio of the loan amount to the property value. Lower LTV ratios typically result in better loan terms.</p>
          </div>
          <div className="metric-item">
            <h4><i className="fas fa-calculator"></i> Debt Service Coverage Ratio</h4>
            <p>The ratio of net operating income to debt service. Lenders typically require a ratio of 1.25 or higher.</p>
          </div>
          <div className="metric-item">
            <h4><i className="fas fa-trending-up"></i> Total Return</h4>
            <p>The combination of cash flow and appreciation over the holding period. This is your overall investment return.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding rental property investment analysis is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Helps you evaluate investment opportunities and compare different properties</span>
          </li>
          <li>
            <span>Provides realistic expectations for cash flow and returns</span>
          </li>
          <li>
            <span>Enables you to make informed financing decisions</span>
          </li>
          <li>
            <span>Helps you identify potential risks and challenges</span>
          </li>
          <li>
            <span>Essential for building a profitable rental property portfolio</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Rental Property Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Cash Flow Analysis:</strong> Monthly and annual cash flow calculations</span>
          </li>
          <li>
            <span><strong>ROI Calculations:</strong> Cash on cash return and annualized return</span>
          </li>
          <li>
            <span><strong>Financing Options:</strong> Cash purchase or loan financing analysis</span>
          </li>
          <li>
            <span><strong>Repair Analysis:</strong> Fix and flip investment calculations</span>
          </li>
          <li>
            <span><strong>Sale Projections:</strong> Future value and profit calculations</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-search"></i> Property Evaluation</h4>
            <p>Analyze potential rental properties before making purchase decisions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Investment Comparison</h4>
            <p>Compare different rental properties and investment opportunities</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-tools"></i> Fix and Flip Analysis</h4>
            <p>Evaluate properties that need repairs and improvements</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-hand-holding-usd"></i> Financing Decisions</h4>
            <p>Determine optimal financing strategies and down payment amounts</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calendar-alt"></i> Portfolio Planning</h4>
            <p>Plan and manage a portfolio of rental properties</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-bar"></i> Performance Tracking</h4>
            <p>Track the performance of existing rental property investments</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What's a good cash on cash return for rental properties?",
            answer: "A good cash on cash return for rental properties is typically 8-12% or higher. However, this can vary based on location, property type, and market conditions. Properties in high-appreciation areas might have lower cash returns but higher total returns."
          },
          {
            question: "How do I calculate the right rent for my property?",
            answer: "Research comparable properties in your area, consider the property's condition and amenities, and factor in your expenses and desired returns. Online tools and local real estate agents can help determine market rents."
          },
          {
            question: "What expenses should I include in my rental property analysis?",
            answer: "Include property taxes, insurance, maintenance, property management fees, vacancy allowance, utilities (if paid by landlord), and any HOA fees. Don't forget to account for capital expenditures and unexpected repairs."
          },
          {
            question: "Is it better to pay cash or use financing for rental properties?",
            answer: "Both strategies have advantages. Cash purchases provide immediate positive cash flow and eliminate mortgage payments. Financing allows you to leverage your money and potentially acquire more properties, but reduces cash flow due to mortgage payments."
          },
          {
            question: "How do I account for vacancy in my calculations?",
            answer: "Include a vacancy rate of 5-10% in your calculations, depending on your local market. This accounts for periods when the property is unoccupied and not generating rental income."
          },
          {
            question: "What's the difference between cap rate and cash on cash return?",
            answer: "Cap rate is calculated using net operating income divided by property value and doesn't consider financing. Cash on cash return uses actual cash flow after mortgage payments divided by your cash investment, making it more relevant for leveraged purchases."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default RentalPropertyCalculator
