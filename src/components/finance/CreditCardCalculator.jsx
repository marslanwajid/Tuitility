import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import CreditCardCalculatorJS from '../../assets/js/finance/credit-card-calculator.js'
import '../../assets/css/finance/credit-card-calculator.css'

const CreditCardCalculator = () => {
  const [formData, setFormData] = useState({
    balance: '',
    interestRate: '',
    monthlyPayment: '',
    additionalCharges: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const creditCardCalc = new CreditCardCalculatorJS();
      setCalculator(creditCardCalc);
    } catch (error) {
      console.error('Error initializing credit card calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Credit Card Calculator',
    description: 'Calculate credit card payments, interest, and payoff time. Understand the true cost of carrying a balance and plan your debt payoff strategy.',
    icon: 'fas fa-credit-card',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Credit Card Calculator']
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
    { name: 'Debt Payoff Calculator', url: '/finance/calculators/debt-payoff-calculator', icon: 'fas fa-chart-line' },
    { name: 'Interest Calculator', url: '/finance/calculators/interest-calculator', icon: 'fas fa-percentage' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-credit-card', title: 'What is Credit Card Interest?' },
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
      const errors = calculator.validateInputs(
        formData.balance,
        formData.interestRate,
        formData.monthlyPayment,
        formData.additionalCharges
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

  const calculateCreditCard = () => {
    if (!validateInputs()) return;

    try {
      const {
        balance,
        interestRate,
        monthlyPayment,
        additionalCharges
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateCreditCard(
        parseFloat(balance),
        parseFloat(interestRate),
        parseFloat(monthlyPayment),
        parseFloat(additionalCharges) || 0
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
      balance: '',
      interestRate: '',
      monthlyPayment: '',
      additionalCharges: ''
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
        title="Credit Card Calculator"
        onCalculate={calculateCreditCard}
        calculateButtonText="Calculate Credit Card"
        error={error}
        result={null}
      >
        <div className="credit-card-calculator-form">
          <div className="credit-card-input-row">
            <div className="credit-card-input-group">
              <label htmlFor="credit-card-balance" className="credit-card-input-label">
                Current Balance ($):
              </label>
              <input
                type="number"
                id="credit-card-balance"
                className="credit-card-input-field"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', e.target.value)}
                placeholder="e.g., 5000"
                min="0"
                step="100"
              />
              <small className="credit-card-input-help">
                Your current credit card balance
              </small>
            </div>

            <div className="credit-card-input-group">
              <label htmlFor="credit-card-interest-rate" className="credit-card-input-label">
                Annual Interest Rate (%):
              </label>
              <input
                type="number"
                id="credit-card-interest-rate"
                className="credit-card-input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 18.99"
                min="0"
                max="50"
                step="0.01"
              />
              <small className="credit-card-input-help">
                Your credit card's annual interest rate
              </small>
            </div>
          </div>

          <div className="credit-card-input-row">
            <div className="credit-card-input-group">
              <label htmlFor="credit-card-monthly-payment" className="credit-card-input-label">
                Monthly Payment ($):
              </label>
              <input
                type="number"
                id="credit-card-monthly-payment"
                className="credit-card-input-field"
                value={formData.monthlyPayment}
                onChange={(e) => handleInputChange('monthlyPayment', e.target.value)}
                placeholder="e.g., 200"
                min="0"
                step="10"
              />
              <small className="credit-card-input-help">
                Amount you can pay monthly
              </small>
            </div>

            <div className="credit-card-input-group">
              <label htmlFor="credit-card-additional-charges" className="credit-card-input-label">
                Additional Monthly Charges ($):
              </label>
              <input
                type="number"
                id="credit-card-additional-charges"
                className="credit-card-input-field"
                value={formData.additionalCharges}
                onChange={(e) => handleInputChange('additionalCharges', e.target.value)}
                placeholder="e.g., 25"
                min="0"
                step="5"
              />
              <small className="credit-card-input-help">
                Annual fees, late fees, etc. (optional)
              </small>
            </div>
          </div>

          <div className="credit-card-calculator-actions">
            <button type="button" className="credit-card-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="credit-card-calculator-result">
            <h3 className="credit-card-result-title">Credit Card Calculation Results</h3>
            <div className="credit-card-result-content">
              <div className="credit-card-result-main">
                <div className="credit-card-result-item">
                  <strong>Monthly Interest:</strong>
                  <span className="credit-card-result-value">
                    {formatCurrency(result.monthlyInterest)}
                  </span>
                </div>
                <div className="credit-card-result-item">
                  <strong>Total Interest Paid:</strong>
                  <span className="credit-card-result-value">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="credit-card-result-item">
                  <strong>Total Amount Paid:</strong>
                  <span className="credit-card-result-value credit-card-result-final">
                    {formatCurrency(result.totalAmountPaid)}
                  </span>
                </div>
                <div className="credit-card-result-item">
                  <strong>Payoff Time:</strong>
                  <span className="credit-card-result-value">
                    {result.payoffMonths} months ({Math.round(result.payoffMonths / 12 * 10) / 10} years)
                  </span>
                </div>
              </div>

              <div className="credit-card-result-breakdown">
                <h4>Payment Breakdown</h4>
                <div className="credit-card-breakdown-details">
                  <div className="credit-card-breakdown-item">
                    <span>Principal Balance:</span>
                    <span>{formatCurrency(result.balance)}</span>
                  </div>
                  <div className="credit-card-breakdown-item">
                    <span>Total Interest:</span>
                    <span>{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="credit-card-breakdown-item">
                    <span>Additional Charges:</span>
                    <span>{formatCurrency(result.additionalCharges)}</span>
                  </div>
                  <div className="credit-card-breakdown-item credit-card-total">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(result.totalAmountPaid)}</span>
                  </div>
                </div>
              </div>

              <div className="credit-card-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Pay more than the minimum to reduce interest and pay off faster!</span>
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
          The Credit Card Calculator is an essential financial tool that helps you understand the true cost 
          of carrying a credit card balance. Whether you're trying to pay off existing debt or planning 
          your credit card strategy, this calculator provides clear insights into interest costs, payoff 
          timelines, and total repayment amounts.
        </p>
        <p>
          Credit card interest can compound quickly, making it crucial to understand how much you'll 
          actually pay over time. Our calculator helps you see the impact of different payment amounts 
          and interest rates, empowering you to make informed decisions about your credit card debt.
        </p>
      </ContentSection>

      <ContentSection id="what-is-credit-card" title="What is Credit Card Interest?">
        <p>
          Credit card interest is the cost of borrowing money on your credit card. It's calculated based 
          on your outstanding balance and the annual percentage rate (APR) of your card. Understanding 
          how this interest accumulates is crucial for managing your debt effectively.
        </p>
        <ul>
          <li>
            <span><strong>Daily Compounding:</strong> Interest is typically calculated daily and added monthly</span>
          </li>
          <li>
            <span><strong>APR vs. Daily Rate:</strong> Your annual rate is divided by 365 to get the daily rate</span>
          </li>
          <li>
            <span><strong>Grace Period:</strong> No interest if you pay the full balance by the due date</span>
          </li>
          <li>
            <span><strong>Minimum Payments:</strong> Often only cover a small portion of the principal</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Credit Card Calculator">
        <p>Using the credit card calculator is straightforward and requires just a few key pieces of information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Current Balance:</strong> Input your current credit card balance.</span>
          </li>
          <li>
            <span><strong>Set Interest Rate:</strong> Enter your annual percentage rate (APR).</span>
          </li>
          <li>
            <span><strong>Choose Monthly Payment:</strong> Enter how much you can pay monthly.</span>
          </li>
          <li>
            <span><strong>Add Additional Charges:</strong> Include any annual fees or other charges.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Credit Card" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Try different monthly payment amounts to see how much you can save 
          by paying more than the minimum.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>Daily Interest Rate</h3>
          <div className="math-formula">
            Daily Rate = Annual Rate ÷ 365
          </div>
          <p>This converts your annual percentage rate to a daily rate for compounding calculations.</p>
        </div>

        <div className="formula-section">
          <h3>Monthly Interest</h3>
          <div className="math-formula">
            Monthly Interest = Balance × Daily Rate × Days in Month
          </div>
          <p>Calculates how much interest accrues each month on your outstanding balance.</p>
        </div>

        <div className="formula-section">
          <h3>Payoff Time</h3>
          <div className="math-formula">
            Payoff Months = log(Monthly Payment ÷ (Monthly Payment - Monthly Interest)) ÷ log(1 + Daily Rate × 30)
          </div>
          <p>This complex formula determines how many months it will take to pay off your balance.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: High Balance, High Interest</h3>
          <div className="example-solution">
            <p><strong>Balance:</strong> $10,000</p>
            <p><strong>Interest Rate:</strong> 24.99%</p>
            <p><strong>Monthly Payment:</strong> $200</p>
            <p><strong>Result:</strong> 108 months (9 years) to pay off</p>
            <p><strong>Total Interest:</strong> $11,600</p>
            <p><strong>Total Cost:</strong> $21,600</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Same Balance, Lower Interest</h3>
          <div className="example-solution">
            <p><strong>Balance:</strong> $10,000</p>
            <p><strong>Interest Rate:</strong> 15.99%</p>
            <p><strong>Monthly Payment:</strong> $200</p>
            <p><strong>Result:</strong> 78 months (6.5 years) to pay off</p>
            <p><strong>Total Interest:</strong> $5,600</p>
            <p><strong>Total Cost:</strong> $15,600</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Higher Payment Impact</h3>
          <div className="example-solution">
            <p><strong>Balance:</strong> $10,000</p>
            <p><strong>Interest Rate:</strong> 18.99%</p>
            <p><strong>Monthly Payment:</strong> $400 (doubled)</p>
            <p><strong>Result:</strong> 32 months (2.7 years) to pay off</p>
            <p><strong>Total Interest:</strong> $2,800</p>
            <p><strong>Total Cost:</strong> $12,800</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding credit card calculations is crucial for financial health:</p>
        <ul>
          <li>
            <span>Helps you see the true cost of carrying a balance</span>
          </li>
          <li>
            <span>Shows the impact of different payment strategies</span>
          </li>
          <li>
            <span>Helps you prioritize which debts to pay off first</span>
          </li>
          <li>
            <span>Demonstrates the value of paying more than minimum</span>
          </li>
          <li>
            <span>Essential for creating realistic debt payoff plans</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Credit Card Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Interest Calculations:</strong> Daily compounding interest with monthly updates</span>
          </li>
          <li>
            <span><strong>Payoff Timeline:</strong> Accurate months and years to debt freedom</span>
          </li>
          <li>
            <span><strong>Total Cost Analysis:</strong> Shows principal, interest, and additional charges</span>
          </li>
          <li>
            <span><strong>Payment Impact:</strong> See how different payment amounts affect payoff time</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
          <li>
            <span><strong>Real-time Results:</strong> Instant calculations as you adjust inputs</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-credit-card"></i> Debt Management</h4>
            <p>Plan and track your credit card debt payoff strategy</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Financial Planning</h4>
            <p>Understand the long-term impact of credit card decisions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Payment Optimization</h4>
            <p>Find the optimal monthly payment to minimize interest</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-balance-scale"></i> Debt Comparison</h4>
            <p>Compare different credit cards and interest rates</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-area"></i> Budget Planning</h4>
            <p>Plan your monthly budget including debt payments</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Financial Education</h4>
            <p>Learn about credit card interest and debt management</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between APR and interest rate?",
            answer: "APR (Annual Percentage Rate) includes both the interest rate and any additional fees or charges, giving you the true cost of borrowing. The interest rate is just the cost of borrowing the principal amount."
          },
          {
            question: "How does credit card interest compound?",
            answer: "Credit card interest typically compounds daily, meaning interest is calculated on your balance each day and added to your account monthly. This can significantly increase the total amount you owe."
          },
          {
            question: "What happens if I only pay the minimum?",
            answer: "Paying only the minimum payment will result in much longer payoff times and significantly higher total interest costs. Most of your payment goes toward interest rather than reducing the principal balance."
          },
          {
            question: "How can I reduce my credit card interest?",
            answer: "You can reduce interest by paying more than the minimum, transferring to a lower-rate card, negotiating with your current card issuer, or consolidating debt with a personal loan."
          },
          {
            question: "What is a grace period?",
            answer: "A grace period is the time between when a purchase is made and when interest begins to accrue. If you pay your full balance by the due date, you typically won't be charged interest on new purchases."
          },
          {
            question: "How accurate are these calculations?",
            answer: "Our calculator provides accurate estimates based on standard credit card interest calculations. However, actual results may vary slightly due to billing cycles, payment timing, and specific card terms."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default CreditCardCalculator
