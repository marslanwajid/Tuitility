import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import { MortgageCalculator } from '../../assets/js/finance/mortgage-calculator';
import '../../assets/css/finance/mortgage-calculator.css';

const MortgageCalculatorComponent = () => {
  const [formData, setFormData] = useState({
    loanAmount: '300000',
    interestRate: '4.5',
    loanTerm: '30',
    downPayment: '60000',
    propertyTax: '3600',
    insurance: '1200',
    pmi: '0.5',
    hoaFees: '200'
  });
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Initialize mortgage calculator
  const [calculator] = useState(() => new MortgageCalculator());

  // Tool data
  const toolData = {
    name: 'Mortgage Calculator',
    description: 'Calculate monthly mortgage payments with detailed breakdowns including taxes, insurance, PMI, and HOA fees. Perfect for homebuyers planning their purchase.',
    icon: 'fas fa-home',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Mortgage Calculator']
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
    { name: 'Loan Calculator', url: '/finance/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Currency Calculator', url: '/finance/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-mortgage', title: 'What is a Mortgage Calculator?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'mortgage-formulas', title: 'Mortgage Formulas' },
    { id: 'factors-affecting-payment', title: 'Factors Affecting Payment' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Handle mortgage calculation
  const calculateMortgage = () => {
    try {
      const {
        loanAmount,
        interestRate,
        loanTerm,
        downPayment,
        propertyTax,
        insurance,
        pmi,
        hoaFees
      } = formData;

      // Validate inputs
      const validation = calculator.validateInputs(
        parseFloat(loanAmount),
        parseFloat(interestRate),
        parseInt(loanTerm),
        parseFloat(downPayment)
      );

      if (validation.length > 0) {
        setError(validation.join(' '));
        return;
      }

      // Calculate mortgage
      const mortgageResult = calculator.calculateAdvancedMortgage(
        parseFloat(loanAmount),
        parseFloat(interestRate),
        parseInt(loanTerm),
        parseFloat(downPayment),
        parseFloat(propertyTax),
        parseFloat(insurance),
        parseFloat(pmi),
        parseFloat(hoaFees)
      );

      setResult(mortgageResult);
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      loanAmount: '300000',
      interestRate: '4.5',
      loanTerm: '30',
      downPayment: '60000',
      propertyTax: '3600',
      insurance: '1200',
      pmi: '0.5',
      hoaFees: '200'
    });
    setShowAdvanced(true);
    setResult(null);
    setError('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return calculator.formatCurrency(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return calculator.formatPercentage(value);
  };

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Mortgage Calculator"
        onCalculate={calculateMortgage}
        calculateButtonText="Calculate Mortgage"
        error={error}
        result={null}
      >
        <div className="calculator-form">
          {/* Basic Fields */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="loan-amount" className="input-label">
                Loan Amount ($):
              </label>
              <input
                type="number"
                id="loan-amount"
                className="input-field"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="e.g., 300000"
                min="0"
                step="1000"
              />
              <small className="input-help">
                Total amount you want to borrow
              </small>
            </div>

            <div className="input-group">
              <label htmlFor="interest-rate" className="input-label">
                Interest Rate (%):
              </label>
              <input
                type="number"
                id="interest-rate"
                className="input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 4.5"
                min="0"
                max="20"
                step="0.1"
              />
              <small className="input-help">
                Annual interest rate
              </small>
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="loan-term" className="input-label">
                Loan Term (Years):
              </label>
              <select
                id="loan-term"
                className="input-field"
                value={formData.loanTerm}
                onChange={(e) => handleInputChange('loanTerm', e.target.value)}
              >
                <option value="10">10 Years</option>
                <option value="15">15 Years</option>
                <option value="20">20 Years</option>
                <option value="25">25 Years</option>
                <option value="30">30 Years</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="down-payment" className="input-label">
                Down Payment ($):
              </label>
              <input
                type="number"
                id="down-payment"
                className="input-field"
                value={formData.downPayment}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                placeholder="e.g., 60000"
                min="0"
                step="1000"
              />
              <small className="input-help">
                Reduces loan amount
              </small>
            </div>
          </div>

          {/* Advanced Toggle */}
          <div className="advanced-options">
            <button
              type="button"
              className="btn-toggle-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="advanced-inputs">
                <h3>Additional Monthly Costs</h3>
                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="property-tax" className="input-label">
                      Annual Property Tax ($):
                    </label>
                    <input
                      type="number"
                      id="property-tax"
                      className="input-field"
                      value={formData.propertyTax}
                      onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                      placeholder="e.g., 3600"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="insurance" className="input-label">
                      Annual Insurance ($):
                    </label>
                    <input
                      type="number"
                      id="insurance"
                      className="input-field"
                      value={formData.insurance}
                      onChange={(e) => handleInputChange('insurance', e.target.value)}
                      placeholder="e.g., 1200"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="pmi" className="input-label">
                      PMI Rate (%):
                    </label>
                    <input
                      type="number"
                      id="pmi"
                      className="input-field"
                      value={formData.pmi}
                      onChange={(e) => handleInputChange('pmi', e.target.value)}
                      placeholder="e.g., 0.5"
                      min="0"
                      max="2"
                      step="0.1"
                    />
                    <small className="input-help">
                      Required if down payment &lt; 20%
                    </small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="hoa-fees" className="input-label">
                      Monthly HOA Fees ($):
                    </label>
                    <input
                      type="number"
                      id="hoa-fees"
                      className="input-field"
                      value={formData.hoaFees}
                      onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                      placeholder="e.g., 200"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <small className="input-help">
            Enter the mortgage details above. The calculator will show monthly payments, total interest, and complete cost breakdown.
          </small>

          <div className="calculator-actions">
            <button type="button" className="btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="result-section mortgage-calculator-result">
            <h3 className="result-title">Mortgage Calculation Results</h3>
            <div className="result-content">
              <div className="result-main">
                <div className="result-item">
                  <strong>Total Monthly Payment:</strong>
                  <span className="result-value">
                    {formatCurrency(result.totalMonthlyPayment)}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Principal & Interest:</strong>
                  <span className="result-value">
                    {formatCurrency(result.principalAndInterest)}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Total Interest:</strong>
                  <span className="result-value">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Total of Payments:</strong>
                  <span className="result-value">
                    {formatCurrency(result.totalOfPayments)}
                  </span>
                </div>
              </div>

              <div className="monthly-breakdown">
                <h4>Monthly Payment Breakdown</h4>
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <strong>Principal & Interest:</strong>
                    <span>{formatCurrency(result.principalAndInterest)}</span>
                  </div>
                  <div className="breakdown-item">
                    <strong>Property Tax:</strong>
                    <span>{formatCurrency(result.monthlyPropertyTax)}</span>
                  </div>
                  <div className="breakdown-item">
                    <strong>Insurance:</strong>
                    <span>{formatCurrency(result.monthlyInsurance)}</span>
                  </div>
                  <div className="breakdown-item">
                    <strong>PMI:</strong>
                    <span>{formatCurrency(result.monthlyPMI)}</span>
                  </div>
                  <div className="breakdown-item">
                    <strong>HOA Fees:</strong>
                    <span>{formatCurrency(result.hoaFees)}</span>
                  </div>
                </div>
              </div>

              <div className="mortgage-details">
                <h4>Mortgage Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Original Loan Amount:</strong>
                    <span>{formatCurrency(result.loanAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Actual Loan Amount:</strong>
                    <span>{formatCurrency(result.actualLoanAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Down Payment:</strong>
                    <span>{formatCurrency(result.downPayment)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Loan-to-Value Ratio:</strong>
                    <span>{formatPercentage(result.loanToValueRatio)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Number of Payments:</strong>
                    <span>{result.numberOfPayments}</span>
                  </div>
                </div>
              </div>

              <div className="payment-breakdown">
                <h4>Payment Breakdown</h4>
                <div className="breakdown-chart">
                  <div className="chart-item">
                    <div className="chart-label">Principal</div>
                    <div className="chart-bar principal-bar" style={{ width: `${(result.actualLoanAmount / result.totalOfPayments) * 100}%` }}>
                      {formatCurrency(result.actualLoanAmount)}
                    </div>
                  </div>
                  <div className="chart-item">
                    <div className="chart-label">Interest</div>
                    <div className="chart-bar interest-bar" style={{ width: `${(result.totalInterest / result.totalOfPayments) * 100}%` }}>
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>
                  {result.monthlyPropertyTax > 0 && (
                    <div className="chart-item">
                      <div className="chart-label">Taxes</div>
                      <div className="chart-bar taxes-bar" style={{ width: `${(result.monthlyPropertyTax * result.numberOfPayments / result.totalOfPayments) * 100}%` }}>
                        {formatCurrency(result.monthlyPropertyTax * result.numberOfPayments)}
                      </div>
                    </div>
                  )}
                  {result.monthlyInsurance > 0 && (
                    <div className="chart-item">
                      <div className="chart-label">Insurance</div>
                      <div className="chart-bar insurance-bar" style={{ width: `${(result.monthlyInsurance * result.numberOfPayments / result.totalOfPayments) * 100}%` }}>
                        {formatCurrency(result.monthlyInsurance * result.numberOfPayments)}
                      </div>
                    </div>
                  )}
                </div>
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
          A mortgage calculator is an essential financial tool that helps you understand the true cost of homeownership. 
          Whether you're a first-time homebuyer or looking to refinance, understanding your monthly mortgage payments, 
          total interest costs, and additional expenses is crucial for making informed decisions.
        </p>
        <p>
          Our Mortgage Calculator provides comprehensive calculations including principal and interest payments, 
          property taxes, insurance costs, PMI (Private Mortgage Insurance), and HOA fees. This gives you a complete 
          picture of your monthly housing costs and helps you determine what you can truly afford.
        </p>
      </ContentSection>

      <ContentSection id="what-is-mortgage" title="What is a Mortgage Calculator?">
        <p>
          A mortgage calculator is a financial tool that estimates monthly mortgage payments and provides detailed 
          breakdowns of all costs associated with homeownership. It helps you understand:
        </p>
        <ul>
          <li>
            <span><strong>Monthly Payment Calculation:</strong> Determines your principal and interest payment</span>
          </li>
          <li>
            <span><strong>Total Cost Analysis:</strong> Shows the complete cost over the loan term</span>
          </li>
          <li>
            <span><strong>Additional Costs:</strong> Includes taxes, insurance, PMI, and HOA fees</span>
          </li>
          <li>
            <span><strong>Loan-to-Value Ratio:</strong> Calculates the percentage of home value being financed</span>
          </li>
          <li>
            <span><strong>Amortization Preview:</strong> Shows how payments are split between principal and interest</span>
          </li>
        </ul>
        <p>
          Understanding these calculations helps you compare different loan offers, plan your budget, 
          and make informed decisions about one of the biggest financial commitments of your life.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Mortgage Calculator">
        <p>Using our Mortgage Calculator is straightforward and user-friendly:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Loan Amount:</strong> Input the total amount you want to borrow</span>
          </li>
          <li>
            <span><strong>Set Interest Rate:</strong> Enter the annual interest rate as a percentage</span>
          </li>
          <li>
            <span><strong>Choose Loan Term:</strong> Select the repayment period (10, 15, 20, 25, or 30 years)</span>
          </li>
          <li>
            <span><strong>Add Down Payment:</strong> Enter any down payment to reduce the loan amount</span>
          </li>
          <li>
            <span><strong>Include Additional Costs:</strong> Add property taxes, insurance, PMI, and HOA fees</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click the calculate button to see detailed results</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use the advanced options to include all housing costs and get a more accurate 
          picture of your total monthly housing expense.
        </p>
      </ContentSection>

      <ContentSection id="mortgage-formulas" title="Mortgage Formulas">
        <p>Our calculator uses standard financial formulas to determine mortgage payments:</p>
        <div className="formula-section">
          <h3>Standard Mortgage Formula</h3>
          <p><strong>Monthly Payment = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</strong></p>
          <p>Where:</p>
          <ul>
            <li><strong>P</strong> = Principal loan amount</li>
            <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
            <li><strong>n</strong> = Total number of payments (years × 12)</li>
          </ul>
        </div>
        <div className="formula-section">
          <h3>Interest Calculation</h3>
          <p><strong>Monthly Interest = Remaining Balance × Monthly Rate</strong></p>
          <p><strong>Principal Payment = Monthly Payment - Monthly Interest</strong></p>
        </div>
        <div className="formula-section">
          <h3>Total Cost Formula</h3>
          <p><strong>Total Monthly Payment = Principal & Interest + Property Tax + Insurance + PMI + HOA Fees</strong></p>
        </div>
      </ContentSection>

      <ContentSection id="factors-affecting-payment" title="Factors Affecting Mortgage Payments">
        <p>Several factors influence your monthly mortgage payment and total loan cost:</p>
        <div className="factors-grid">
          <div className="factor-item">
            <h4><i className="fas fa-percentage"></i> Interest Rate</h4>
            <p>Higher rates increase monthly payments and total interest. Even a 0.5% difference can significantly impact your payment.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-calendar-alt"></i> Loan Term</h4>
            <p>Longer terms (30 years) have lower monthly payments but higher total interest. Shorter terms (15 years) have higher payments but less total interest.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-money-bill-wave"></i> Down Payment</h4>
            <p>Larger down payments reduce the loan amount, lowering monthly payments and potentially eliminating PMI requirements.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-home"></i> Property Taxes</h4>
            <p>Vary by location and property value. Higher taxes increase monthly housing costs.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-shield-alt"></i> Insurance Costs</h4>
            <p>Includes homeowner's insurance and PMI if down payment is less than 20% of home value.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-building"></i> HOA Fees</h4>
            <p>Monthly fees for community amenities and maintenance in planned communities or condominiums.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding mortgage calculations is crucial for several important reasons:</p>
        <ul>
          <li>
            <span><strong>Financial Planning:</strong> Helps you budget for monthly payments and plan long-term expenses</span>
          </li>
          <li>
            <span><strong>Loan Comparison:</strong> Allows you to compare different mortgage offers and terms</span>
          </li>
          <li>
            <span><strong>Affordability Assessment:</strong> Determines if a home purchase fits within your budget</span>
          </li>
          <li>
            <span><strong>Interest Cost Awareness:</strong> Shows the true cost of borrowing over time</span>
          </li>
          <li>
            <span><strong>Refinancing Decisions:</strong> Helps evaluate whether refinancing makes financial sense</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Mortgage Calculator provides comprehensive features:</p>
        <ul>
          <li>
            <span><strong>Basic Calculations:</strong> Monthly payments, total interest, and total cost</span>
          </li>
          <li>
            <span><strong>Advanced Features:</strong> Down payment calculations and additional cost inclusion</span>
          </li>
          <li>
            <span><strong>Loan-to-Value Analysis:</strong> Shows the relationship between loan amount and property value</span>
          </li>
          <li>
            <span><strong>Payment Breakdown:</strong> Visual representation of all monthly housing costs</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and logical</span>
          </li>
          <li>
            <span><strong>Responsive Design:</strong> Works perfectly on all devices and screen sizes</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Home Buying</h4>
            <p>Calculate mortgage payments, compare different loan terms, and determine home affordability</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Refinancing</h4>
            <p>Compare current mortgage with new loan offers and calculate potential savings</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Budget Planning</h4>
            <p>Plan monthly housing costs and ensure they fit within your overall budget</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-search"></i> Loan Comparison</h4>
            <p>Compare different mortgage offers from various lenders</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-lightbulb"></i> Financial Education</h4>
            <p>Learn about mortgage costs and understand the true cost of homeownership</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-file-contract"></i> Pre-approval Planning</h4>
            <p>Estimate payments before getting pre-approved for a mortgage</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is PMI and when do I need it?",
            answer: "PMI (Private Mortgage Insurance) is required when your down payment is less than 20% of the home's value. It protects the lender if you default on the loan. PMI typically costs 0.5% to 1% of the loan amount annually."
          },
          {
            question: "How does the down payment affect my mortgage?",
            answer: "A larger down payment reduces your loan amount, which lowers your monthly payment and total interest paid. It can also help you avoid PMI if you put down 20% or more."
          },
          {
            question: "What's the difference between 15-year and 30-year mortgages?",
            answer: "A 15-year mortgage has higher monthly payments but significantly less total interest paid. A 30-year mortgage has lower monthly payments but more total interest. Choose based on your budget and long-term financial goals."
          },
          {
            question: "Are property taxes included in my mortgage payment?",
            answer: "Property taxes are often included in your monthly mortgage payment through an escrow account, but they're not part of the actual mortgage loan. The lender collects them monthly and pays them annually."
          },
          {
            question: "What is the loan-to-value ratio?",
            answer: "The loan-to-value (LTV) ratio is the percentage of the home's value that you're borrowing. For example, if you borrow $240,000 on a $300,000 home, your LTV is 80%. Lower LTV ratios typically qualify for better interest rates."
          },
          {
            question: "How do I know if I can afford a mortgage?",
            answer: "A general rule is that your total housing costs (mortgage, taxes, insurance) should not exceed 28% of your gross monthly income. However, consider your overall debt-to-income ratio and other financial obligations."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
}

export default MortgageCalculatorComponent;
