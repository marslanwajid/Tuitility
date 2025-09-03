import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import { BusinessLoanCalculator as BusinessLoanCalculatorJS } from '../../assets/js/finance/business-loan-calculator.js'
import '../../assets/css/finance/business-loan-calculator.css'

const BusinessLoanCalculator = () => {
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    compound: 'monthly',
    loanTermYears: '',
    loanTermMonths: '',
    paybackFrequency: 'monthly',
    originationFee: '',
    documentationFee: '',
    otherFees: ''
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const businessLoanCalc = new BusinessLoanCalculatorJS();
      setCalculator(businessLoanCalc);
    } catch (error) {
      console.error('Error initializing business loan calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Business Loan Calculator',
    description: 'Calculate business loan payments with detailed breakdowns including origination fees, documentation fees, and other costs. Perfect for business owners planning financing.',
    icon: 'fas fa-building',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Business Loan Calculator']
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
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Currency Calculator', url: '/finance/calculators/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-business-loan', title: 'What is a Business Loan Calculator?' },
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
    if (!calculator) return false;
    
    try {
      const validation = calculator.validateInputs(
        parseFloat(formData.loanAmount),
        parseFloat(formData.interestRate),
        parseFloat(formData.loanTermYears),
        parseFloat(formData.loanTermMonths),
        parseFloat(formData.originationFee)
      );
      
      if (validation.error) {
        setError(validation.error);
        return false;
      }
      
      return true;
    } catch (error) {
      setError('Validation error occurred');
      return false;
    }
  };

  const calculateBusinessLoan = () => {
    if (!validateInputs()) return;

    try {
      setError('');
      
      const result = calculator.calculateBusinessLoan(
        parseFloat(formData.loanAmount),
        parseFloat(formData.interestRate),
        formData.compound,
        parseFloat(formData.loanTermYears),
        parseFloat(formData.loanTermMonths),
        formData.paybackFrequency,
        parseFloat(formData.originationFee),
        parseFloat(formData.documentationFee) || 0,
        parseFloat(formData.otherFees) || 0
      );
      
      setResult(result);
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      loanAmount: '',
      interestRate: '',
      compound: 'monthly',
      loanTermYears: '',
      loanTermMonths: '',
      paybackFrequency: 'monthly',
      originationFee: '',
      documentationFee: '',
      otherFees: ''
    });
    setResult(null);
    setError('');
  };

  const formatCurrency = (value) => {
    return calculator ? calculator.formatCurrency(value) : `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value) => {
    return calculator ? calculator.formatPercentage(value) : `${parseFloat(value).toFixed(2)}%`;
  };

  return (
    <ToolPageLayout
      toolData={toolData}
      categories={categories}
      relatedTools={relatedTools}
      tableOfContents={tableOfContents}
    >
      <CalculatorSection title="Business Loan Calculator" icon="fas fa-building">
        <form className="business-loan-calculator-form" onSubmit={(e) => { e.preventDefault(); calculateBusinessLoan(); }}>
          <div className="business-loan-calculator-input-row">
            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-amount" className="business-loan-calculator-input-label">
                Loan Amount ($)
              </label>
              <input
                type="number"
                id="business-loan-amount"
                className="business-loan-calculator-input-field"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="100000"
                step="1000"
                min="0"
                required
              />
              <small className="business-loan-calculator-input-help">The amount you want to borrow</small>
            </div>

            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-interest-rate" className="business-loan-calculator-input-label">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                id="business-loan-interest-rate"
                className="business-loan-calculator-input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="5.5"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <small className="business-loan-calculator-input-help">The annual interest rate on your loan</small>
            </div>
          </div>

          <div className="business-loan-calculator-input-row">
            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-compound" className="business-loan-calculator-input-label">
                Compounding Frequency
              </label>
              <select
                id="business-loan-compound"
                className="business-loan-calculator-input-field"
                value={formData.compound}
                onChange={(e) => handleInputChange('compound', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="annually">Annually</option>
              </select>
              <small className="business-loan-calculator-input-help">How often interest is compounded</small>
            </div>

            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-payback-frequency" className="business-loan-calculator-input-label">
                Payment Frequency
              </label>
              <select
                id="business-loan-payback-frequency"
                className="business-loan-calculator-input-field"
                value={formData.paybackFrequency}
                onChange={(e) => handleInputChange('paybackFrequency', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </select>
              <small className="business-loan-calculator-input-help">How often you'll make payments</small>
            </div>
          </div>

          <div className="business-loan-calculator-input-row">
            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-term-years" className="business-loan-calculator-input-label">
                Loan Term (Years)
              </label>
              <input
                type="number"
                id="business-loan-term-years"
                className="business-loan-calculator-input-field"
                value={formData.loanTermYears}
                onChange={(e) => handleInputChange('loanTermYears', e.target.value)}
                placeholder="5"
                step="1"
                min="0"
                required
              />
              <small className="business-loan-calculator-input-help">The length of your loan in years</small>
            </div>

            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-term-months" className="business-loan-calculator-input-label">
                Additional Months
              </label>
              <input
                type="number"
                id="business-loan-term-months"
                className="business-loan-calculator-input-field"
                value={formData.loanTermMonths}
                onChange={(e) => handleInputChange('loanTermMonths', e.target.value)}
                placeholder="0"
                step="1"
                min="0"
                max="11"
              />
              <small className="business-loan-calculator-input-help">Additional months beyond the years</small>
            </div>
          </div>

          <div className="business-loan-calculator-input-row">
            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-origination-fee" className="business-loan-calculator-input-label">
                Origination Fee (%)
              </label>
              <input
                type="number"
                id="business-loan-origination-fee"
                className="business-loan-calculator-input-field"
                value={formData.originationFee}
                onChange={(e) => handleInputChange('originationFee', e.target.value)}
                placeholder="1.0"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <small className="business-loan-calculator-input-help">Percentage fee charged by the lender</small>
            </div>

            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-documentation-fee" className="business-loan-calculator-input-label">
                Documentation Fee ($)
              </label>
              <input
                type="number"
                id="business-loan-documentation-fee"
                className="business-loan-calculator-input-field"
                value={formData.documentationFee}
                onChange={(e) => handleInputChange('documentationFee', e.target.value)}
                placeholder="500"
                step="50"
                min="0"
              />
              <small className="business-loan-calculator-input-help">Fixed fee for processing documents</small>
            </div>
          </div>

          <div className="business-loan-calculator-input-row">
            <div className="business-loan-calculator-input-group">
              <label htmlFor="business-loan-other-fees" className="business-loan-calculator-input-label">
                Other Fees ($)
              </label>
              <input
                type="number"
                id="business-loan-other-fees"
                className="business-loan-calculator-input-field"
                value={formData.otherFees}
                onChange={(e) => handleInputChange('otherFees', e.target.value)}
                placeholder="0"
                step="50"
                min="0"
              />
              <small className="business-loan-calculator-input-help">Any additional fees or costs</small>
            </div>
          </div>

          <div className="business-loan-calculator-calculator-actions">
            <button type="submit" className="business-loan-calculator-btn-calculate">
              <i className="fas fa-calculator"></i>
              Calculate Business Loan
            </button>
            <button type="button" className="business-loan-calculator-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="business-loan-calculator-result" style={{ display: 'block' }}>
            <div className="business-loan-error-message">
              <h3>Error</h3>
              <p>{error}</p>
              <p>Please check your inputs and try again.</p>
            </div>
          </div>
        )}

        {result && (
          <div className="business-loan-calculator-result" style={{ display: 'block' }}>
            <h3>Business Loan Summary</h3>
            <div className="business-loan-result-grid">
              <div className="business-loan-result-item">
                <h4>{calculator?.getFrequencyText(result.paybackFrequency) || 'Monthly'} Payment</h4>
                <p className="business-loan-result-value">{formatCurrency(result.payment)}</p>
              </div>
              <div className="business-loan-result-item">
                <h4>Total Interest</h4>
                <p className="business-loan-result-value">{formatCurrency(result.totalInterest)}</p>
              </div>
              <div className="business-loan-result-item">
                <h4>Total Fees</h4>
                <p className="business-loan-result-value">{formatCurrency(result.totalFees)}</p>
              </div>
              <div className="business-loan-result-item">
                <h4>Total Cost of Loan</h4>
                <p className="business-loan-result-value highlight">{formatCurrency(result.totalCost)}</p>
              </div>
            </div>
            <div className="business-loan-result-breakdown">
              <h4>Loan Breakdown</h4>
              <ul>
                <li>Original Loan Amount: {formatCurrency(result.originalLoanAmount)}</li>
                <li>Total Fees Added: {formatCurrency(result.totalFees)}</li>
                <li>Amount to Finance: {formatCurrency(result.loanAmountWithFees)}</li>
                <li>Total Interest Paid: {formatCurrency(result.totalInterest)}</li>
                <li><strong>Total Amount You'll Pay: {formatCurrency(result.totalCost)}</strong></li>
              </ul>
            </div>
          </div>
        )}
      </CalculatorSection>

      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      <ContentSection id="introduction" title="Introduction" icon="fas fa-info-circle">
        <p>
          The Business Loan Calculator is a comprehensive tool designed to help business owners and entrepreneurs understand the true cost of business financing. This calculator goes beyond simple interest calculations to include all the fees and costs associated with business loans, providing you with a complete picture of your financial obligations.
        </p>
        <p>
          Whether you're looking to expand your business, purchase equipment, or cover operational costs, understanding the total cost of borrowing is crucial for making informed financial decisions. This calculator helps you compare different loan offers and understand the impact of various fees on your overall loan cost.
        </p>
      </ContentSection>

      <ContentSection id="what-is-business-loan" title="What is a Business Loan Calculator?" icon="fas fa-question-circle">
        <p>
          A Business Loan Calculator is a specialized financial tool that calculates loan payments while accounting for all the additional costs associated with business financing. Unlike basic loan calculators, it includes origination fees, documentation fees, and other business-specific costs that can significantly impact the total amount you'll pay.
        </p>
        <p>
          Business loans often come with higher fees than personal loans, and these costs can vary significantly between lenders. Understanding these fees upfront helps you make better decisions about which loan offer to accept and how much you can afford to borrow.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Calculator" icon="fas fa-info-circle">
        <ol className="usage-steps">
          <li><strong>Enter Loan Amount:</strong> Input the amount you want to borrow for your business.</li>
          <li><strong>Enter Interest Rate:</strong> Specify the annual interest rate on your loan.</li>
          <li><strong>Select Compounding:</strong> Choose how often interest is compounded (monthly, daily, or annually).</li>
          <li><strong>Set Payment Frequency:</strong> Choose how often you'll make payments (monthly, bi-weekly, or weekly).</li>
          <li><strong>Enter Loan Term:</strong> Specify the length of your loan in years and additional months.</li>
          <li><strong>Add Fees:</strong> Include origination fees, documentation fees, and any other costs.</li>
          <li><strong>Calculate:</strong> Click the Calculate button to see your complete loan breakdown.</li>
        </ol>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods" icon="fas fa-square-root-alt">
        <div className="formula-section">
          <h3>Loan Payment Formula</h3>
          <div className="math-formula">
            {"\\text{Payment} = \\frac{P \\times r \\times (1 + r)^n}{(1 + r)^n - 1}"}
          </div>
          <p>Where:</p>
          <ul>
            <li><strong>P</strong> = Principal amount (loan amount + fees)</li>
            <li><strong>r</strong> = Rate per payment period</li>
            <li><strong>n</strong> = Total number of payments</li>
          </ul>
        </div>

        <div className="formula-section">
          <h3>Total Cost Calculation</h3>
          <div className="math-formula">
            {"\\text{Total Cost} = \\text{Loan Amount} + \\text{Total Fees} + \\text{Total Interest}"}
          </div>
          <p>This gives you the complete picture of what you'll pay over the life of the loan.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples" icon="fas fa-lightbulb">
        <div className="example-section">
          <h3>Example: Equipment Purchase Loan</h3>
          <div className="example-solution">
            <p><strong>Loan Amount:</strong> $50,000</p>
            <p><strong>Interest Rate:</strong> 6.5% annually</p>
            <p><strong>Term:</strong> 5 years</p>
            <p><strong>Origination Fee:</strong> 2%</p>
            <p><strong>Documentation Fee:</strong> $300</p>
            <br />
            <p><strong>Results:</strong></p>
            <p>Monthly Payment: $978.45</p>
            <p>Total Fees: $1,300</p>
            <p>Total Interest: $8,707</p>
            <p>Total Cost: $60,007</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance" icon="fas fa-star">
        <p>Understanding the total cost of business loans is crucial for several reasons:</p>
        <ul>
          <li><strong>Accurate Budgeting:</strong> Know exactly how much you'll pay over the loan term</li>
          <li><strong>Comparison Shopping:</strong> Compare different loan offers on an equal basis</li>
          <li><strong>Business Planning:</strong> Make informed decisions about financing options</li>
          <li><strong>Cash Flow Management:</strong> Plan for regular payments and total costs</li>
          <li><strong>Profitability Analysis:</strong> Ensure the loan makes financial sense for your business</li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality" icon="fas fa-cogs">
        <p>Our Business Loan Calculator provides comprehensive functionality:</p>
        <ul>
          <li><strong>Complete Fee Calculation:</strong> Includes all types of fees and costs</li>
          <li><strong>Flexible Payment Frequencies:</strong> Supports monthly, bi-weekly, and weekly payments</li>
          <li><strong>Multiple Compounding Options:</strong> Accounts for different interest compounding methods</li>
          <li><strong>Detailed Breakdown:</strong> Shows payment, interest, fees, and total cost</li>
          <li><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</li>
          <li><strong>Responsive Design:</strong> Works on all devices and screen sizes</li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications" icon="fas fa-rocket">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-tools"></i> Equipment Financing</h4>
            <p>Calculate the true cost of purchasing business equipment on credit.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-building"></i> Business Expansion</h4>
            <p>Plan financing for business growth, new locations, or increased capacity.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Working Capital</h4>
            <p>Understand the cost of borrowing to cover operational expenses.</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-handshake"></i> Loan Comparison</h4>
            <p>Compare different loan offers to find the most cost-effective option.</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection
        title="Frequently Asked Questions"
        faqs={[
          {
            question: "What is an origination fee?",
            answer: "An origination fee is a percentage-based fee charged by lenders to process and approve your loan. It's typically 1-5% of the loan amount and is added to your loan balance."
          },
          {
            question: "How do payment frequency and compounding affect my loan?",
            answer: "Payment frequency determines how often you make payments, while compounding affects how interest is calculated. More frequent payments can reduce total interest, and different compounding methods can affect the effective interest rate."
          },
          {
            question: "Should I include all fees when calculating loan costs?",
            answer: "Yes, including all fees gives you the true cost of borrowing. Fees can significantly impact your total loan cost, so it's important to factor them into your decision-making process."
          },
          {
            question: "How can I reduce the total cost of my business loan?",
            answer: "You can reduce costs by negotiating lower fees, choosing shorter loan terms, making larger down payments, or shopping around for better interest rates. Always compare the total cost, not just the interest rate."
          }
        ]}
      />
    </ToolPageLayout>
  );
};

export default BusinessLoanCalculator;
