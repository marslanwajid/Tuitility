import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/finance/house-affordability-calculator.css'
import Seo from '../Seo'

const HouseAffordabilityCalculator = () => {
  const [formData, setFormData] = useState({
    annualIncome: '',
    loanTerm: '30',
    interestRate: '',
    monthlyDebt: '',
    downPayment: '',
    propertyTaxRate: '',
    hoaFees: '',
    homeInsurance: '',
    dtiRatio: '43'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'House Affordability Calculator',
    description: 'Calculate how much house you can afford based on your income, debt, down payment, and other financial factors. Get a realistic estimate of your home buying budget.',
    icon: 'fas fa-home',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'House Affordability Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, home buying, mortgage affordability, real estate`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/house-affordability-calculator`;

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
    { name: 'Amortization Calculator', url: '/finance/calculators/amortization-calculator', icon: 'fas fa-chart-line' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Currency Calculator', url: '/finance/calculators/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-house-affordability', title: 'What is House Affordability?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
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
    const { 
      annualIncome, 
      interestRate, 
      loanTerm, 
      monthlyDebt, 
      downPayment, 
      propertyTaxRate, 
      homeInsurance, 
      dtiRatio 
    } = formData;
    
    if (!annualIncome || parseFloat(annualIncome) <= 0) {
      setError('Please enter a valid positive number for annual income.');
      return false;
    }

    if (!interestRate || parseFloat(interestRate) < 0) {
      setError('Please enter a valid interest rate.');
      return false;
    }

    if (!loanTerm || parseInt(loanTerm) <= 0 || parseInt(loanTerm) > 30) {
      setError('Please enter a valid loan term between 1 and 30 years.');
      return false;
    }

    if (!monthlyDebt || parseFloat(monthlyDebt) < 0) {
      setError('Please enter a valid monthly debt amount.');
      return false;
    }

    if (!downPayment || parseFloat(downPayment) < 0) {
      setError('Please enter a valid down payment amount.');
      return false;
    }

    if (!propertyTaxRate || parseFloat(propertyTaxRate) < 0) {
      setError('Please enter a valid property tax rate.');
      return false;
    }

    if (!homeInsurance || parseFloat(homeInsurance) < 0) {
      setError('Please enter a valid annual home insurance amount.');
      return false;
    }

    if (!dtiRatio || parseFloat(dtiRatio) <= 0 || parseFloat(dtiRatio) > 100) {
      setError('Please enter a valid debt-to-income ratio between 0 and 100%.');
      return false;
    }

    return true;
  };

  const calculateHouseAffordability = () => {
    if (!validateInputs()) return;

    try {
      const { 
        annualIncome, 
        loanTerm, 
        interestRate, 
        monthlyDebt, 
        downPayment, 
        propertyTaxRate, 
        hoaFees, 
        homeInsurance, 
        dtiRatio 
      } = formData;
      
      const monthlyIncome = parseFloat(annualIncome) / 12;
      const monthlyRate = parseFloat(interestRate) / 100 / 12;
      const numberOfPayments = parseInt(loanTerm) * 12;
      const monthlyDebtAmount = parseFloat(monthlyDebt) || 0;
      const downPaymentAmount = parseFloat(downPayment) || 0;
      const propertyTaxRateValue = parseFloat(propertyTaxRate) / 100;
      const hoaFeesAmount = parseFloat(hoaFees) || 0;
      const annualInsuranceAmount = parseFloat(homeInsurance);
      const dtiRatioValue = parseFloat(dtiRatio) / 100;

      const maxMonthlyPayment = monthlyIncome * dtiRatioValue - monthlyDebtAmount;

      if (maxMonthlyPayment <= 0) {
        setError('Your monthly debt exceeds your affordable payment capacity. Please review your debt-to-income ratio.');
        return;
      }

      const monthlyInsurance = annualInsuranceAmount / 12;

      // Calculate maximum loan amount using the standard loan payment formula
      let maxLoanAmount;
      if (monthlyRate > 0) {
        const availableForMortgage = maxMonthlyPayment - hoaFeesAmount - monthlyInsurance;
        if (availableForMortgage <= 0) {
          setError('The insurance and HOA fees exceed your available payment capacity.');
          return;
        }
        maxLoanAmount = availableForMortgage * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);
      } else {
        // For 0% interest rate
        maxLoanAmount = (maxMonthlyPayment - hoaFeesAmount - monthlyInsurance) * numberOfPayments;
      }

      const maxHomePrice = maxLoanAmount + downPaymentAmount;
      const monthlyPropertyTax = (maxHomePrice * propertyTaxRateValue) / 12;

      // Recalculate with property tax included
      const totalMonthlyPayment = maxMonthlyPayment;
      const actualAvailableForMortgage = maxMonthlyPayment - hoaFeesAmount - monthlyInsurance - monthlyPropertyTax;
      
      let actualMaxLoanAmount;
      if (monthlyRate > 0) {
        actualMaxLoanAmount = actualAvailableForMortgage * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);
      } else {
        actualMaxLoanAmount = actualAvailableForMortgage * numberOfPayments;
      }
      
      const actualMaxHomePrice = actualMaxLoanAmount + downPaymentAmount;
      const finalMonthlyPropertyTax = (actualMaxHomePrice * propertyTaxRateValue) / 12;
      const monthlyMortgagePayment = actualAvailableForMortgage;

      setResult({
        maxHomePrice: actualMaxHomePrice,
        maxLoanAmount: actualMaxLoanAmount,
        totalMonthlyPayment,
        monthlyMortgagePayment,
        monthlyPropertyTax: finalMonthlyPropertyTax,
        monthlyHomeInsurance: monthlyInsurance,
        monthlyHoaFees: hoaFeesAmount,
        monthlyIncome,
        dtiRatio: dtiRatioValue * 100
      });
      
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      annualIncome: '',
      loanTerm: '30',
      interestRate: '',
      monthlyDebt: '',
      downPayment: '',
      propertyTaxRate: '',
      hoaFees: '',
      homeInsurance: '',
      dtiRatio: '43'
    });
    setResult(null);
    setError('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value, decimals = 2) => {
    return `${parseFloat(value).toFixed(decimals)}%`;
  };

  // KaTeX rendering effect
  useEffect(() => {
    if (typeof window !== 'undefined' && window.katex) {
      // Render all math formulas
      const mathElements = document.querySelectorAll('.math-formula');
      mathElements.forEach(element => {
        if (element && !element.dataset.rendered) {
          try {
            window.katex.render(element.textContent, element, {
              throwOnError: false,
              displayMode: true
            });
            element.dataset.rendered = 'true';
          } catch (error) {
            console.error('KaTeX rendering error:', error);
          }
        }
      });
    }
  }, [result]); // Re-render when results change

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
      />
      <ToolPageLayout 
        toolData={toolData} 
        tableOfContents={tableOfContents}
        categories={categories}
        relatedTools={relatedTools}
      >
        <CalculatorSection 
          title="House Affordability Calculator"
          onCalculate={calculateHouseAffordability}
          calculateButtonText="Calculate Affordability"
          error={error}
          result={null}
        >
          <div className="house-affordability-calculator-form">
            <div className="house-affordability-input-row">
              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-annual-income" className="house-affordability-input-label">
                  Annual Income ($):
                </label>
                <input
                  type="number"
                  id="house-affordability-annual-income"
                  className="house-affordability-input-field"
                  value={formData.annualIncome}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                  placeholder="e.g., 75000"
                  min="0"
                  step="1000"
                />
                <small className="house-affordability-input-help">
                  Your gross annual income before taxes
                </small>
              </div>

              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-interest-rate" className="house-affordability-input-label">
                  Interest Rate (%):
                </label>
                <input
                  type="number"
                  id="house-affordability-interest-rate"
                  className="house-affordability-input-field"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  placeholder="e.g., 4.5"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <small className="house-affordability-input-help">
                  Expected mortgage interest rate
                </small>
              </div>
            </div>

            <div className="house-affordability-input-row">
              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-loan-term" className="house-affordability-input-label">
                  Loan Term (Years):
                </label>
                <select
                  id="house-affordability-loan-term"
                  className="house-affordability-input-field"
                  value={formData.loanTerm}
                  onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                >
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="25">25 Years</option>
                  <option value="30">30 Years</option>
                </select>
              </div>

              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-dti-ratio" className="house-affordability-input-label">
                  Debt-to-Income Ratio (%):
                </label>
                <input
                  type="number"
                  id="house-affordability-dti-ratio"
                  className="house-affordability-input-field"
                  value={formData.dtiRatio}
                  onChange={(e) => handleInputChange('dtiRatio', e.target.value)}
                  placeholder="e.g., 43"
                  min="20"
                  max="50"
                  step="1"
                />
                <small className="house-affordability-input-help">
                  Recommended: 43% or less
                </small>
              </div>
            </div>

            <div className="house-affordability-input-row">
              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-monthly-debt" className="house-affordability-input-label">
                  Monthly Debt Payments ($):
                </label>
                <input
                  type="number"
                  id="house-affordability-monthly-debt"
                  className="house-affordability-input-field"
                  value={formData.monthlyDebt}
                  onChange={(e) => handleInputChange('monthlyDebt', e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                  step="50"
                />
                <small className="house-affordability-input-help">
                  Car loans, credit cards, student loans, etc.
                </small>
              </div>

              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-down-payment" className="house-affordability-input-label">
                  Down Payment ($):
                </label>
                <input
                  type="number"
                  id="house-affordability-down-payment"
                  className="house-affordability-input-field"
                  value={formData.downPayment}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  placeholder="e.g., 20000"
                  min="0"
                  step="1000"
                />
                <small className="house-affordability-input-help">
                  Cash you have for down payment
                </small>
              </div>
            </div>

            <div className="house-affordability-input-row">
              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-property-tax-rate" className="house-affordability-input-label">
                  Property Tax Rate (%):
                </label>
                <input
                  type="number"
                  id="house-affordability-property-tax-rate"
                  className="house-affordability-input-field"
                  value={formData.propertyTaxRate}
                  onChange={(e) => handleInputChange('propertyTaxRate', e.target.value)}
                  placeholder="e.g., 1.2"
                  min="0"
                  max="5"
                  step="0.1"
                />
                <small className="house-affordability-input-help">
                  Annual property tax rate in your area
                </small>
              </div>

              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-home-insurance" className="house-affordability-input-label">
                  Annual Home Insurance ($):
                </label>
                <input
                  type="number"
                  id="house-affordability-home-insurance"
                  className="house-affordability-input-field"
                  value={formData.homeInsurance}
                  onChange={(e) => handleInputChange('homeInsurance', e.target.value)}
                  placeholder="e.g., 1200"
                  min="0"
                  step="100"
                />
                <small className="house-affordability-input-help">
                  Annual cost of homeowners insurance
                </small>
              </div>
            </div>

            <div className="house-affordability-input-row">
              <div className="house-affordability-input-group">
                <label htmlFor="house-affordability-hoa-fees" className="house-affordability-input-label">
                  Monthly HOA Fees ($):
                </label>
                <input
                  type="number"
                  id="house-affordability-hoa-fees"
                  className="house-affordability-input-field"
                  value={formData.hoaFees}
                  onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                  placeholder="e.g., 200"
                  min="0"
                  step="25"
                />
                <small className="house-affordability-input-help">
                  Monthly HOA or condo fees (if applicable)
                </small>
              </div>
            </div>

            <div className="house-affordability-calculator-actions">
              <button type="button" className="house-affordability-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="house-affordability-calculator-result">
              <h3 className="house-affordability-result-title">House Affordability Results</h3>
              <div className="house-affordability-result-content">
                <div className="house-affordability-result-main">
                  <div className="house-affordability-result-item">
                    <strong>Maximum Home Price:</strong>
                    <span className="house-affordability-result-value house-affordability-result-final">
                      {formatCurrency(result.maxHomePrice)}
                    </span>
                  </div>
                  <div className="house-affordability-result-item">
                    <strong>Maximum Loan Amount:</strong>
                    <span className="house-affordability-result-value">
                      {formatCurrency(result.maxLoanAmount)}
                    </span>
                  </div>
                  <div className="house-affordability-result-item">
                    <strong>Total Monthly Payment:</strong>
                    <span className="house-affordability-result-value">
                      {formatCurrency(result.totalMonthlyPayment)}
                    </span>
                  </div>
                  <div className="house-affordability-result-item">
                    <strong>Monthly Mortgage Payment:</strong>
                    <span className="house-affordability-result-value">
                      {formatCurrency(result.monthlyMortgagePayment)}
                    </span>
                  </div>
                </div>

                <div className="house-affordability-payment-breakdown">
                  <h4 className="house-affordability-breakdown-title">Monthly Payment Breakdown</h4>
                  <div className="house-affordability-breakdown-content">
                    <div className="house-affordability-breakdown-item">
                      <strong>Property Tax:</strong>
                      <span className="house-affordability-breakdown-value">
                        {formatCurrency(result.monthlyPropertyTax)}
                      </span>
                    </div>
                    <div className="house-affordability-breakdown-item">
                      <strong>Home Insurance:</strong>
                      <span className="house-affordability-breakdown-value">
                        {formatCurrency(result.monthlyHomeInsurance)}
                      </span>
                    </div>
                    <div className="house-affordability-breakdown-item">
                      <strong>HOA Fees:</strong>
                      <span className="house-affordability-breakdown-value">
                        {formatCurrency(result.monthlyHoaFees)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="house-affordability-income-summary">
                  <h4 className="house-affordability-summary-title">Income Summary</h4>
                  <div className="house-affordability-summary-content">
                    <div className="house-affordability-summary-item">
                      <strong>Monthly Income:</strong>
                      <span className="house-affordability-summary-value">
                        {formatCurrency(result.monthlyIncome)}
                      </span>
                    </div>
                    <div className="house-affordability-summary-item">
                      <strong>Debt-to-Income Ratio:</strong>
                      <span className="house-affordability-summary-value">
                        {formatPercentage(result.dtiRatio)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CalculatorSection>

        {/* TOC and Feedback Section */}
        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>

        {/* Content Sections */}
        <ContentSection id="introduction" title="Introduction">
          <p>
            The House Affordability Calculator is an essential financial planning tool that helps you determine 
            how much house you can realistically afford based on your current financial situation. It takes into 
            account your income, existing debt, down payment, and various homeownership costs to give you a 
            comprehensive picture of your home buying budget.
          </p>
          <p>
            Understanding your true home affordability is crucial before starting your house hunt. This calculator 
            helps you set realistic expectations, avoid overextending yourself financially, and make informed 
            decisions about your home purchase.
          </p>
        </ContentSection>

        <ContentSection id="what-is-house-affordability" title="What is House Affordability?">
          <p>
            House affordability refers to the maximum amount you can spend on a home while maintaining financial 
            stability and meeting all your other financial obligations. It's not just about the purchase price, 
            but includes all ongoing costs of homeownership.
          </p>
          <ul>
            <li>
              <span><strong>Purchase Price:</strong> The actual cost of the home</span>
            </li>
            <li>
              <span><strong>Monthly Mortgage:</strong> Principal and interest payments</span>
            </li>
            <li>
              <span><strong>Property Taxes:</strong> Annual taxes based on home value</span>
            </li>
            <li>
              <span><strong>Insurance:</strong> Homeowners insurance premiums</span>
            </li>
            <li>
              <span><strong>HOA Fees:</strong> Community association fees</span>
            </li>
            <li>
              <span><strong>Maintenance:</strong> Ongoing repair and upkeep costs</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use House Affordability Calculator">
          <p>Using the house affordability calculator requires gathering several key pieces of financial information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Income Information:</strong> Enter your gross annual income before taxes.</span>
            </li>
            <li>
              <span><strong>Debt Assessment:</strong> Include all monthly debt payments (car loans, credit cards, student loans).</span>
            </li>
            <li>
              <span><strong>Down Payment:</strong> Specify how much cash you have available for the down payment.</span>
            </li>
            <li>
              <span><strong>Interest Rate:</strong> Use current market rates or your expected mortgage rate.</span>
            </li>
            <li>
              <span><strong>Additional Costs:</strong> Include property taxes, insurance, and HOA fees.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Affordability" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Be conservative with your estimates. It's better to underestimate your 
            affordability and have room for unexpected expenses than to overextend yourself.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Formulas & Methods">
          <div className="formula-section">
            <h3>Debt-to-Income Ratio</h3>
            <div className="math-formula">
              {'DTI = \frac{\text{Monthly Debt} + \text{Monthly Housing Payment}}{\text{Monthly Gross Income}}'}
            </div>
            <p>Lenders typically prefer a DTI ratio of 43% or less.</p>
          </div>

          <div className="formula-section">
            <h3>Maximum Monthly Payment</h3>
            <div className="math-formula">
              {'\text{Max Payment} = (\text{Monthly Income} \times \text{DTI Ratio}) - \text{Monthly Debt}'}
            </div>
            <p>This determines how much you can afford for housing costs.</p>
          </div>

          <div className="formula-section">
            <h3>Maximum Loan Amount</h3>
            <div className="math-formula">
              {'\text{Max Loan} = \text{Available Payment} \times \frac{1 - (1 + r)^{-n}}{r}'}
            </div>
            <p>Where r = monthly interest rate, n = total number of payments.</p>
          </div>

          <div className="formula-section">
            <h3>Total Home Price</h3>
            <div className="math-formula">
              {'\text{Max Home Price} = \text{Maximum Loan Amount} + \text{Down Payment}'}
            </div>
            <p>This is the total amount you can afford to spend on a home.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: First-Time Homebuyer</h3>
            <div className="example-solution">
              <p><strong>Annual Income:</strong> $75,000</p>
              <p><strong>Monthly Debt:</strong> $300 (car loan + credit cards)</p>
              <p><strong>Down Payment:</strong> $20,000</p>
              <p><strong>Interest Rate:</strong> 4.5%</p>
              <p><strong>DTI Ratio:</strong> 43%</p>
              <p><strong>Result:</strong> Maximum home price: $285,000</p>
              <p><strong>Monthly Payment:</strong> $1,450 (including taxes and insurance)</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Higher Income, Lower Debt</h3>
            <div className="example-solution">
              <p><strong>Annual Income:</strong> $120,000</p>
              <p><strong>Monthly Debt:</strong> $150 (minimal debt)</p>
              <p><strong>Down Payment:</strong> $50,000</p>
              <p><strong>Interest Rate:</strong> 4.0%</p>
              <p><strong>DTI Ratio:</strong> 40%</p>
              <p><strong>Result:</strong> Maximum home price: $520,000</p>
              <p><strong>Monthly Payment:</strong> $2,200 (including taxes and insurance)</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding house affordability is crucial for several reasons:</p>
          <ul>
            <li>
              <span>Prevents financial overextension and potential foreclosure</span>
            </li>
            <li>
              <span>Helps maintain a healthy debt-to-income ratio</span>
            </li>
            <li>
              <span>Ensures you can afford ongoing homeownership costs</span>
            </li>
            <li>
              <span>Provides realistic expectations for your house search</span>
            </li>
            <li>
              <span>Helps you save appropriately for down payment and closing costs</span>
            </li>
            <li>
              <span>Allows for emergency savings and other financial goals</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our House Affordability Calculator provides comprehensive analysis:</p>
          <ul>
            <li>
              <span><strong>Income Analysis:</strong> Considers your gross annual income and debt-to-income ratio</span>
            </li>
            <li>
              <span><strong>Debt Assessment:</strong> Accounts for existing monthly debt obligations</span>
            </li>
            <li>
              <span><strong>Down Payment Calculation:</strong> Includes your available cash for down payment</span>
            </li>
            <li>
              <span><strong>Interest Rate Impact:</strong> Shows how rates affect your buying power</span>
            </li>
            <li>
              <span><strong>Total Cost Analysis:</strong> Includes property taxes, insurance, and HOA fees</span>
            </li>
            <li>
              <span><strong>Monthly Payment Breakdown:</strong> Shows detailed cost structure</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-search"></i> House Hunting</h4>
              <p>Set realistic price ranges before starting your search</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-piggy-bank"></i> Saving Goals</h4>
              <p>Determine how much you need to save for down payment</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Financial Planning</h4>
              <p>Plan your budget and debt management strategy</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-handshake"></i> Lender Discussions</h4>
              <p>Have informed conversations with mortgage lenders</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Neighborhood Selection</h4>
              <p>Choose areas that fit your budget and lifestyle</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-shield-alt"></i> Risk Assessment</h4>
              <p>Evaluate your financial risk tolerance</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "What is a good debt-to-income ratio for buying a house?",
              answer: "Most lenders prefer a DTI ratio of 43% or less. This means your total monthly debt payments (including the new mortgage) should not exceed 43% of your gross monthly income. Some lenders may approve up to 50%, but lower is better for financial stability."
            },
            {
              question: "Should I include utilities in my affordability calculation?",
              answer: "While utilities aren't typically included in mortgage affordability calculations, you should budget for them separately. Our calculator focuses on housing costs that lenders consider, but you'll need additional income for utilities, maintenance, and other living expenses."
            },
            {
              question: "How much should I save for a down payment?",
              answer: "Traditional wisdom suggests 20% down to avoid PMI, but many first-time buyers use 3-10% down payment programs. The more you put down, the lower your monthly payment and the more house you can afford. Aim for at least 10% if possible."
            },
            {
              question: "What if my income changes after buying a house?",
              answer: "Consider your job stability and potential income growth when calculating affordability. If your income is variable or you're in a field with uncertain prospects, be more conservative in your estimates. It's better to buy less house than you can afford than to risk financial stress."
            },
            {
              question: "How do property taxes affect affordability?",
              answer: "Property taxes can significantly impact your monthly housing costs. Higher property tax rates reduce the amount you can afford to borrow. Research property tax rates in your target areas, as they can vary widely between cities and neighborhoods."
            },
            {
              question: "What other costs should I consider beyond the mortgage?",
              answer: "Beyond the mortgage, budget for property taxes, homeowners insurance, HOA fees, maintenance (1-3% of home value annually), utilities, and emergency repairs. These costs can add 25-40% to your monthly housing expenses, so factor them into your affordability calculation."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default HouseAffordabilityCalculator