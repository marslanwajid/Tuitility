import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import DebtPayoffCalculatorJS from '../../assets/js/finance/debt-payoff-calculator.js'
import '../../assets/css/finance/debt-payoff-calculator.css'

const DebtPayoffCalculator = () => {
  const [formData, setFormData] = useState({
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    extraPayment: '',
    paymentFrequency: 'monthly'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const debtPayoffCalc = new DebtPayoffCalculatorJS();
      setCalculator(debtPayoffCalc);
    } catch (error) {
      console.error('Error initializing debt payoff calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Debt Payoff Calculator',
    description: 'Calculate debt payoff time, total interest, and payment strategies. Plan your debt elimination with different payment scenarios.',
    icon: 'fas fa-credit-card',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Debt Payoff Calculator']
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
    { name: 'Credit Card Calculator', url: '/finance/calculators/credit-card-calculator', icon: 'fas fa-credit-card' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' },
    { name: 'Debt Consolidation Calculator', url: '/finance/calculators/debt-consolidation-calculator', icon: 'fas fa-balance-scale' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-debt-payoff', title: 'What is Debt Payoff?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Debt Payoff Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'strategies', title: 'Debt Payoff Strategies' },
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
        formData.currentBalance,
        formData.interestRate,
        formData.minimumPayment,
        formData.extraPayment,
        formData.paymentFrequency
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

  const calculateDebtPayoff = () => {
    if (!validateInputs()) return;

    try {
      const {
        currentBalance,
        interestRate,
        minimumPayment,
        extraPayment,
        paymentFrequency
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateDebtPayoff(
        parseFloat(currentBalance),
        parseFloat(interestRate),
        parseFloat(minimumPayment),
        parseFloat(extraPayment || 0),
        paymentFrequency
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
      currentBalance: '',
      interestRate: '',
      minimumPayment: '',
      extraPayment: '',
      paymentFrequency: 'monthly'
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
        title="Debt Payoff Calculator"
        onCalculate={calculateDebtPayoff}
        calculateButtonText="Calculate Debt Payoff"
        error={error}
        result={null}
      >
        <div className="debt-payoff-calculator-form">
          <div className="debt-payoff-input-row">
            <div className="debt-payoff-input-group">
              <label htmlFor="debt-payoff-current-balance" className="debt-payoff-input-label">
                Current Balance ($):
              </label>
              <input
                type="number"
                id="debt-payoff-current-balance"
                className="debt-payoff-input-field"
                value={formData.currentBalance}
                onChange={(e) => handleInputChange('currentBalance', e.target.value)}
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
              />
              <small className="debt-payoff-input-help">
                Current debt balance
              </small>
            </div>

            <div className="debt-payoff-input-group">
              <label htmlFor="debt-payoff-interest-rate" className="debt-payoff-input-label">
                Interest Rate (%):
              </label>
              <input
                type="number"
                id="debt-payoff-interest-rate"
                className="debt-payoff-input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 18.99"
                min="0"
                max="50"
                step="0.01"
              />
              <small className="debt-payoff-input-help">
                Annual interest rate
              </small>
            </div>
          </div>

          <div className="debt-payoff-input-row">
            <div className="debt-payoff-input-group">
              <label htmlFor="debt-payoff-minimum-payment" className="debt-payoff-input-label">
                Minimum Payment ($):
              </label>
              <input
                type="number"
                id="debt-payoff-minimum-payment"
                className="debt-payoff-input-field"
                value={formData.minimumPayment}
                onChange={(e) => handleInputChange('minimumPayment', e.target.value)}
                placeholder="e.g., 150"
                min="0"
                step="0.01"
              />
              <small className="debt-payoff-input-help">
                Minimum monthly payment
              </small>
            </div>

            <div className="debt-payoff-input-group">
              <label htmlFor="debt-payoff-extra-payment" className="debt-payoff-input-label">
                Extra Payment ($):
              </label>
              <input
                type="number"
                id="debt-payoff-extra-payment"
                className="debt-payoff-input-field"
                value={formData.extraPayment}
                onChange={(e) => handleInputChange('extraPayment', e.target.value)}
                placeholder="e.g., 50"
                min="0"
                step="0.01"
              />
              <small className="debt-payoff-input-help">
                Additional payment (optional)
              </small>
            </div>
          </div>

          <div className="debt-payoff-input-row">
            <div className="debt-payoff-input-group">
              <label htmlFor="debt-payoff-payment-frequency" className="debt-payoff-input-label">
                Payment Frequency:
              </label>
              <select
                id="debt-payoff-payment-frequency"
                className="debt-payoff-input-field debt-payoff-select"
                value={formData.paymentFrequency}
                onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </select>
              <small className="debt-payoff-input-help">
                How often you make payments
              </small>
            </div>

            <div className="debt-payoff-input-group">
              <div className="debt-payoff-input-spacer"></div>
            </div>
          </div>

          <div className="debt-payoff-calculator-actions">
            <button type="button" className="debt-payoff-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="debt-payoff-calculator-result">
            <h3 className="debt-payoff-result-title">Debt Payoff Calculation Results</h3>
            <div className="debt-payoff-result-content">
              <div className="debt-payoff-result-main">
                <div className="debt-payoff-result-item">
                  <strong>Current Balance:</strong>
                  <span className="debt-payoff-result-value">
                    {formatCurrency(result.currentBalance)}
                  </span>
                </div>
                <div className="debt-payoff-result-item">
                  <strong>Interest Rate:</strong>
                  <span className="debt-payoff-result-value">
                    {formatPercentage(result.interestRate)}
                  </span>
                </div>
                <div className="debt-payoff-result-item">
                  <strong>Payment Frequency:</strong>
                  <span className="debt-payoff-result-value">
                    {result.paymentFrequency}
                  </span>
                </div>
                <div className="debt-payoff-result-item">
                  <strong>Total Payment:</strong>
                  <span className="debt-payoff-result-value">
                    {formatCurrency(result.totalPayment)}
                  </span>
                </div>
                <div className="debt-payoff-result-item">
                  <strong>Payoff Time:</strong>
                  <span className="debt-payoff-result-value">
                    {result.payoffTime}
                  </span>
                </div>
                <div className="debt-payoff-result-item">
                  <strong>Total Interest:</strong>
                  <span className="debt-payoff-result-value">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="debt-payoff-result-item">
                  <strong>Total Amount Paid:</strong>
                  <span className="debt-payoff-result-value debt-payoff-result-final">
                    {formatCurrency(result.totalAmountPaid)}
                  </span>
                </div>
              </div>

              <div className="debt-payoff-result-breakdown">
                <h4>Payment Breakdown</h4>
                <div className="debt-payoff-breakdown-details">
                  <div className="debt-payoff-breakdown-item">
                    <span>Original Balance:</span>
                    <span>{formatCurrency(result.currentBalance)}</span>
                  </div>
                  <div className="debt-payoff-breakdown-item">
                    <span>Total Interest:</span>
                    <span>{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="debt-payoff-breakdown-item">
                    <span>Interest as % of Total:</span>
                    <span>{formatPercentage(result.interestPercentage)}</span>
                  </div>
                  <div className="debt-payoff-breakdown-item debt-payoff-total">
                    <span>Total Amount Paid:</span>
                    <span>{formatCurrency(result.totalAmountPaid)}</span>
                  </div>
                </div>
              </div>

              <div className="debt-payoff-result-summary">
                <h4>Payoff Summary</h4>
                <div className="debt-payoff-summary-details">
                  <div className="debt-payoff-summary-item">
                    <span>Payoff Time:</span>
                    <span>{result.payoffTime}</span>
                  </div>
                  <div className="debt-payoff-summary-item">
                    <span>Total Payments:</span>
                    <span>{result.totalPayments}</span>
                  </div>
                  <div className="debt-payoff-summary-item">
                    <span>Average Payment:</span>
                    <span>{formatCurrency(result.averagePayment)}</span>
                  </div>
                  <div className="debt-payoff-summary-item">
                    <span>Interest Savings:</span>
                    <span>{formatCurrency(result.interestSavings)}</span>
                  </div>
                </div>
              </div>

              <div className="debt-payoff-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Making extra payments can significantly reduce your payoff time and total interest paid!</span>
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
          The Debt Payoff Calculator is a powerful financial tool that helps you plan and strategize 
          your debt elimination journey. Whether you're dealing with credit card debt, personal loans, 
          or other forms of debt, this calculator provides detailed insights into your payoff timeline 
          and total costs.
        </p>
        <p>
          By inputting your current balance, interest rate, minimum payment, and any extra payments 
          you plan to make, you can see exactly how long it will take to become debt-free and how 
          much interest you'll pay over the life of your debt.
        </p>
      </ContentSection>

      <ContentSection id="what-is-debt-payoff" title="What is Debt Payoff?">
        <p>
          Debt payoff refers to the process of completely eliminating your outstanding debt through 
          regular payments. It involves paying back the principal amount borrowed plus any accrued 
          interest according to the terms of your loan or credit agreement.
        </p>
        <ul>
          <li>
            <span><strong>Principal:</strong> The original amount borrowed</span>
          </li>
          <li>
            <span><strong>Interest:</strong> The cost of borrowing money, calculated as a percentage of the principal</span>
          </li>
          <li>
            <span><strong>Minimum Payment:</strong> The smallest amount you must pay each period</span>
          </li>
          <li>
            <span><strong>Extra Payment:</strong> Additional payments beyond the minimum to accelerate payoff</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Debt Payoff Calculator">
        <p>Using the debt payoff calculator is straightforward and requires just a few key pieces of information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Current Balance:</strong> Input your current debt balance.</span>
          </li>
          <li>
            <span><strong>Set Interest Rate:</strong> Enter the annual interest rate on your debt.</span>
          </li>
          <li>
            <span><strong>Add Minimum Payment:</strong> Enter your minimum required payment amount.</span>
          </li>
          <li>
            <span><strong>Include Extra Payment:</strong> Add any additional payments you plan to make (optional).</span>
          </li>
          <li>
            <span><strong>Select Frequency:</strong> Choose how often you make payments.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Debt Payoff" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Try different extra payment amounts to see how they affect your 
          payoff timeline and total interest paid.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Debt Payoff Formulas & Methods">
        <div className="formula-section">
          <h3>Monthly Interest Calculation</h3>
          <div className="math-formula">
            Monthly Interest = (Current Balance × Annual Interest Rate) ÷ 12
          </div>
          <p>This calculates the interest charged each month on your remaining balance.</p>
        </div>

        <div className="formula-section">
          <h3>Principal Payment</h3>
          <div className="math-formula">
            Principal Payment = Total Payment - Monthly Interest
          </div>
          <p>This shows how much of your payment goes toward reducing the principal balance.</p>
        </div>

        <div className="formula-section">
          <h3>New Balance</h3>
          <div className="math-formula">
            New Balance = Current Balance - Principal Payment
          </div>
          <p>This calculates your remaining balance after each payment.</p>
        </div>

        <div className="formula-section">
          <h3>Total Interest Calculation</h3>
          <div className="math-formula">
            Total Interest = Sum of all monthly interest payments
          </div>
          <p>This shows the total amount of interest you'll pay over the life of the debt.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Credit Card Debt</h3>
          <div className="example-solution">
            <p><strong>Current Balance:</strong> $5,000</p>
            <p><strong>Interest Rate:</strong> 18.99%</p>
            <p><strong>Minimum Payment:</strong> $150</p>
            <p><strong>Extra Payment:</strong> $0</p>
            <p><strong>Payoff Time:</strong> 3 years 8 months</p>
            <p><strong>Total Interest:</strong> $1,650</p>
            <p><strong>Total Amount Paid:</strong> $6,650</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: With Extra Payments</h3>
          <div className="example-solution">
            <p><strong>Current Balance:</strong> $5,000</p>
            <p><strong>Interest Rate:</strong> 18.99%</p>
            <p><strong>Minimum Payment:</strong> $150</p>
            <p><strong>Extra Payment:</strong> $50</p>
            <p><strong>Payoff Time:</strong> 2 years 6 months</p>
            <p><strong>Total Interest:</strong> $1,200</p>
            <p><strong>Total Amount Paid:</strong> $6,200</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Personal Loan</h3>
          <div className="example-solution">
            <p><strong>Current Balance:</strong> $10,000</p>
            <p><strong>Interest Rate:</strong> 12.5%</p>
            <p><strong>Minimum Payment:</strong> $300</p>
            <p><strong>Extra Payment:</strong> $100</p>
            <p><strong>Payoff Time:</strong> 2 years 2 months</p>
            <p><strong>Total Interest:</strong> $1,400</p>
            <p><strong>Total Amount Paid:</strong> $11,400</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="strategies" title="Debt Payoff Strategies">
        <div className="strategy-grid">
          <div className="strategy-item">
            <h4><i className="fas fa-snowflake"></i> Snowball Method</h4>
            <p>Pay minimums on all debts, then put extra money toward the smallest balance first. This provides psychological motivation as you eliminate debts quickly.</p>
          </div>
          <div className="strategy-item">
            <h4><i className="fas fa-fire"></i> Avalanche Method</h4>
            <p>Pay minimums on all debts, then put extra money toward the highest interest rate debt first. This saves the most money on interest.</p>
          </div>
          <div className="strategy-item">
            <h4><i className="fas fa-plus"></i> Extra Payment Strategy</h4>
            <p>Make additional payments beyond the minimum to reduce principal faster and save on interest charges.</p>
          </div>
          <div className="strategy-item">
            <h4><i className="fas fa-calendar-alt"></i> Bi-weekly Payments</h4>
            <p>Make half your monthly payment every two weeks. This results in 26 half-payments per year, equivalent to 13 full payments.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding debt payoff calculations is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Helps you create a realistic timeline for becoming debt-free</span>
          </li>
          <li>
            <span>Shows the true cost of debt including interest charges</span>
          </li>
          <li>
            <span>Enables you to compare different payoff strategies</span>
          </li>
          <li>
            <span>Motivates you to make extra payments when you see the savings</span>
          </li>
          <li>
            <span>Essential for financial planning and budgeting</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Debt Payoff Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Accurate Calculations:</strong> Precise payoff timeline and interest calculations</span>
          </li>
          <li>
            <span><strong>Multiple Payment Frequencies:</strong> Monthly, bi-weekly, and weekly payment options</span>
          </li>
          <li>
            <span><strong>Extra Payment Analysis:</strong> See how additional payments affect your timeline</span>
          </li>
          <li>
            <span><strong>Detailed Breakdown:</strong> Shows principal, interest, and remaining balance for each payment</span>
          </li>
          <li>
            <span><strong>Interest Savings:</strong> Calculate how much you save with extra payments</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-credit-card"></i> Credit Card Debt</h4>
            <p>Plan payoff strategies for high-interest credit card balances</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-hand-holding-usd"></i> Personal Loans</h4>
            <p>Calculate payoff timelines for personal and unsecured loans</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-car"></i> Auto Loans</h4>
            <p>Determine if paying off your car loan early makes financial sense</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Student Loans</h4>
            <p>Plan repayment strategies for student loan debt</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Debt Consolidation</h4>
            <p>Compare consolidation options and their impact on payoff time</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Financial Planning</h4>
            <p>Integrate debt payoff into your overall financial strategy</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "Should I pay off debt or invest my extra money?",
            answer: "Generally, if your debt interest rate is higher than your expected investment returns, focus on paying off debt first. However, consider factors like tax benefits, employer matching, and your risk tolerance."
          },
          {
            question: "What's the difference between the snowball and avalanche methods?",
            answer: "The snowball method focuses on paying off the smallest debt first for psychological motivation, while the avalanche method targets the highest interest rate debt first to save the most money on interest."
          },
          {
            question: "How much extra should I pay toward my debt?",
            answer: "Any extra payment helps, but aim for at least 10-20% more than your minimum payment. Even small extra payments can significantly reduce your payoff time and total interest."
          },
          {
            question: "Is it better to make bi-weekly or monthly payments?",
            answer: "Bi-weekly payments can help you pay off debt faster because you make 26 half-payments per year (equivalent to 13 full payments) instead of 12 monthly payments."
          },
          {
            question: "What if I can't afford extra payments?",
            answer: "Focus on making your minimum payments on time to avoid late fees and credit damage. Look for ways to increase your income or reduce expenses to free up money for extra payments."
          },
          {
            question: "Should I consolidate my debts?",
            answer: "Debt consolidation can be beneficial if you can get a lower interest rate and it helps you stay organized. However, make sure you don't extend your payoff timeline significantly."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default DebtPayoffCalculator
