import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import FutureValueCalculatorJS from '../../assets/js/finance/future-value-calculator.js'
import '../../assets/css/finance/future-value-calculator.css'

const FutureValueCalculator = () => {
  const [formData, setFormData] = useState({
    presentValue: '',
    interestRate: '6',
    timePeriod: '5',
    paymentAmount: '',
    paymentFrequency: 'monthly'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const futureValueCalc = new FutureValueCalculatorJS();
      setCalculator(futureValueCalc);
    } catch (error) {
      console.error('Error initializing future value calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Future Value Calculator',
    description: 'Calculate the future value of investments, savings, and cash flows. Determine how much your money will grow over time with compound interest.',
    icon: 'fas fa-chart-line',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Future Value Calculator']
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
    { name: 'Present Value Calculator', url: '/finance/calculators/present-value-calculator', icon: 'fas fa-chart-line' },
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-pie' },
    { name: 'Retirement Calculator', url: '/finance/calculators/retirement-calculator', icon: 'fas fa-piggy-bank' },
    { name: 'Compound Interest Calculator', url: '/finance/calculators/compound-interest-calculator', icon: 'fas fa-percentage' },
    { name: 'ROI Calculator', url: '/finance/calculators/roi-calculator', icon: 'fas fa-percentage' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-future-value', title: 'What is Future Value?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Future Value Formulas & Calculations' },
    { id: 'examples', title: 'Examples' },
    { id: 'applications', title: 'Applications' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
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
        formData.presentValue,
        formData.interestRate,
        formData.timePeriod,
        formData.paymentAmount,
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

  const calculateFutureValue = () => {
    if (!validateInputs()) return;

    try {
      const {
        presentValue,
        interestRate,
        timePeriod,
        paymentAmount,
        paymentFrequency
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateFutureValue(
        parseFloat(presentValue || 0),
        parseFloat(interestRate),
        parseFloat(timePeriod),
        parseFloat(paymentAmount || 0),
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
      presentValue: '',
      interestRate: '6',
      timePeriod: '5',
      paymentAmount: '',
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
        title="Future Value Calculator"
        onCalculate={calculateFutureValue}
        calculateButtonText="Calculate Future Value"
        error={error}
        result={null}
      >
        <div className="future-value-calculator-form">
          <div className="future-value-input-row">
            <div className="future-value-input-group">
              <label htmlFor="future-value-present-value" className="future-value-input-label">
                Present Value ($):
              </label>
              <input
                type="number"
                id="future-value-present-value"
                className="future-value-input-field"
                value={formData.presentValue}
                onChange={(e) => handleInputChange('presentValue', e.target.value)}
                placeholder="e.g., 10000"
                min="0"
                step="1000"
              />
              <small className="future-value-input-help">
                Initial investment amount (optional)
              </small>
            </div>

            <div className="future-value-input-group">
              <label htmlFor="future-value-interest-rate" className="future-value-input-label">
                Interest Rate (%):
              </label>
              <input
                type="number"
                id="future-value-interest-rate"
                className="future-value-input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 6"
                min="0"
                max="50"
                step="0.1"
              />
              <small className="future-value-input-help">
                Annual interest rate or return
              </small>
            </div>
          </div>

          <div className="future-value-input-row">
            <div className="future-value-input-group">
              <label htmlFor="future-value-time-period" className="future-value-input-label">
                Time Period (years):
              </label>
              <input
                type="number"
                id="future-value-time-period"
                className="future-value-input-field"
                value={formData.timePeriod}
                onChange={(e) => handleInputChange('timePeriod', e.target.value)}
                placeholder="e.g., 5"
                min="0.1"
                max="100"
                step="0.1"
              />
              <small className="future-value-input-help">
                Number of years to invest
              </small>
            </div>

            <div className="future-value-input-group">
              <label htmlFor="future-value-payment-amount" className="future-value-input-label">
                Payment Amount ($):
              </label>
              <input
                type="number"
                id="future-value-payment-amount"
                className="future-value-input-field"
                value={formData.paymentAmount}
                onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                placeholder="e.g., 1000 (optional)"
                min="0"
                step="100"
              />
              <small className="future-value-input-help">
                Regular payment amount (optional)
              </small>
            </div>
          </div>

          <div className="future-value-input-row">
            <div className="future-value-input-group">
              <label htmlFor="future-value-payment-frequency" className="future-value-input-label">
                Payment Frequency:
              </label>
              <select
                id="future-value-payment-frequency"
                className="future-value-select-field"
                value={formData.paymentFrequency}
                onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
              >
                <option value="none">No Payments</option>
                <option value="annually">Annually</option>
                <option value="semi-annually">Semi-annually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
              <small className="future-value-input-help">
                How often payments are made
              </small>
            </div>
          </div>

          <div className="future-value-calculator-actions">
            <button type="button" className="future-value-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="future-value-calculator-result">
            <h3 className="future-value-result-title">Future Value Calculator Results</h3>
            <div className="future-value-result-content">
              <div className="future-value-result-main">
                <div className="future-value-result-item">
                  <strong>Future Value:</strong>
                  <span className="future-value-result-value">
                    {formatCurrency(result.futureValue)}
                  </span>
                </div>
                <div className="future-value-result-item">
                  <strong>Total Contributions:</strong>
                  <span className="future-value-result-value">
                    {formatCurrency(result.totalContributions)}
                  </span>
                </div>
                <div className="future-value-result-item">
                  <strong>Total Interest Earned:</strong>
                  <span className="future-value-result-value">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="future-value-result-item">
                  <strong>Time Period:</strong>
                  <span className="future-value-result-value">
                    {result.timePeriod} year{result.timePeriod !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {result.paymentAmount > 0 && result.paymentsPerYear > 0 && (
                <div className="future-value-result-breakdown">
                  <h4>Payment Details</h4>
                  <div className="future-value-breakdown-details">
                    <div className="future-value-breakdown-item">
                      <span>Payment Amount:</span>
                      <span>{formatCurrency(result.paymentAmount)} ({result.paymentFrequencyName})</span>
                    </div>
                    <div className="future-value-breakdown-item">
                      <span>Total Payments:</span>
                      <span>{result.totalPaymentCount} payments</span>
                    </div>
                    <div className="future-value-breakdown-item">
                      <span>Total from Payments:</span>
                      <span>{formatCurrency(result.totalFromPayments)}</span>
                    </div>
                    <div className="future-value-breakdown-item">
                      <span>Interest on Payments:</span>
                      <span>{formatCurrency(result.interestOnPayments)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="future-value-result-summary">
                <h4>Investment Summary</h4>
                <div className="future-value-summary-details">
                  <div className="future-value-summary-item">
                    <span>Initial Investment:</span>
                    <span>{formatCurrency(result.presentValue)}</span>
                  </div>
                  <div className="future-value-summary-item">
                    <span>Interest Rate:</span>
                    <span>{formatPercentage(result.interestRate)}</span>
                  </div>
                  <div className="future-value-summary-item">
                    <span>Compounding Periods:</span>
                    <span>{result.totalPeriods} periods</span>
                  </div>
                  <div className="future-value-summary-item">
                    <span>Growth Rate:</span>
                    <span>{formatPercentage(result.growthRate)}</span>
                  </div>
                </div>
              </div>

              <div className="future-value-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: The power of compound interest can significantly grow your investments over time!</span>
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
          The Future Value Calculator is an essential financial tool that helps you determine how much 
          your investments, savings, and cash flows will be worth in the future. By calculating future value, 
          you can plan for long-term financial goals and understand the power of compound interest.
        </p>
        <p>
          This calculator helps you project the growth of your money over time, plan for retirement, 
          education, or major purchases, and make informed investment decisions based on expected returns.
        </p>
      </ContentSection>

      <ContentSection id="what-is-future-value" title="What is Future Value?">
        <p>
          Future Value (FV) is the value of a current asset or investment at a specified date in the future, 
          based on an assumed rate of growth or interest. It's calculated using compound interest, which 
          means interest is earned on both the principal and previously earned interest.
        </p>
        <ul>
          <li>
            <span><strong>Compound Interest:</strong> Interest earned on both principal and previously earned interest</span>
          </li>
          <li>
            <span><strong>Time Value of Money:</strong> Money invested today grows over time</span>
          </li>
          <li>
            <span><strong>Investment Growth:</strong> Shows how investments appreciate over time</span>
          </li>
          <li>
            <span><strong>Financial Planning:</strong> Essential for retirement and goal planning</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Future Value Calculator">
        <p>Using the future value calculator is straightforward and requires basic investment information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Present Value:</strong> Input your initial investment amount (optional).</span>
          </li>
          <li>
            <span><strong>Set Interest Rate:</strong> Enter the annual interest rate or expected return.</span>
          </li>
          <li>
            <span><strong>Enter Time Period:</strong> Specify the number of years for investment growth.</span>
          </li>
          <li>
            <span><strong>Add Payment Amount (Optional):</strong> Include regular contributions if applicable.</span>
          </li>
          <li>
            <span><strong>Select Payment Frequency:</strong> Choose how often contributions are made.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Future Value" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use this calculator to project the growth of your savings, retirement funds, 
          or any investment to see how compound interest can work in your favor over time.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Future Value Formulas & Calculations">
        <div className="formula-section">
          <h3>Simple Future Value</h3>
          <div className="math-formula">
            FV = PV × (1 + r)^n
          </div>
          <p>Where FV = Future Value, PV = Present Value, r = Interest Rate, n = Number of Periods.</p>
        </div>

        <div className="formula-section">
          <h3>Future Value of Annuity</h3>
          <div className="math-formula">
            FV = PMT × [(1 + r)^n - 1] ÷ r
          </div>
          <p>Where PMT = Payment Amount, r = Interest Rate per Period, n = Number of Payments.</p>
        </div>

        <div className="formula-section">
          <h3>Future Value with Multiple Compounding</h3>
          <div className="math-formula">
            FV = PV × (1 + r/m)^(m×n)
          </div>
          <p>Where m = Number of Compounding Periods per Year.</p>
        </div>

        <div className="formula-section">
          <h3>Compound Interest Formula</h3>
          <div className="math-formula">
            A = P(1 + r/n)^(nt)
          </div>
          <p>Where A = Final Amount, P = Principal, r = Annual Interest Rate, n = Compounding Frequency, t = Time.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Simple Future Value</h3>
          <div className="example-solution">
            <p><strong>Present Value:</strong> $10,000</p>
            <p><strong>Interest Rate:</strong> 6% annually</p>
            <p><strong>Time Period:</strong> 10 years</p>
            <p><strong>Future Value:</strong> $17,908.48</p>
            <p><strong>Total Interest:</strong> $7,908.48</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Future Value with Monthly Contributions</h3>
          <div className="example-solution">
            <p><strong>Present Value:</strong> $5,000</p>
            <p><strong>Interest Rate:</strong> 7% annually</p>
            <p><strong>Time Period:</strong> 20 years</p>
            <p><strong>Monthly Payment:</strong> $500</p>
            <p><strong>Future Value:</strong> $312,909.46</p>
            <p><strong>Total Contributions:</strong> $125,000</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Retirement Savings</h3>
          <div className="example-solution">
            <p><strong>Present Value:</strong> $0</p>
            <p><strong>Interest Rate:</strong> 8% annually</p>
            <p><strong>Time Period:</strong> 30 years</p>
            <p><strong>Monthly Payment:</strong> $1,000</p>
            <p><strong>Future Value:</strong> $1,490,359.68</p>
            <p><strong>Total Contributions:</strong> $360,000</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Retirement Planning</h4>
            <p>Calculate how much your retirement savings will grow over time</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education Planning</h4>
            <p>Project the growth of education savings accounts and 529 plans</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Investment Analysis</h4>
            <p>Evaluate different investment options and their potential returns</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Real Estate Investment</h4>
            <p>Calculate the future value of real estate investments and appreciation</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business Planning</h4>
            <p>Project the growth of business investments and expansion funds</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-balance-scale"></i> Financial Planning</h4>
            <p>Integrate future value calculations into comprehensive financial plans</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding future value calculations is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Helps you set realistic financial goals and plan for long-term objectives</span>
          </li>
          <li>
            <span>Essential for retirement planning and determining required savings amounts</span>
          </li>
          <li>
            <span>Enables accurate comparison of different investment options and strategies</span>
          </li>
          <li>
            <span>Critical for understanding the power of compound interest over time</span>
          </li>
          <li>
            <span>Helps you make informed decisions about when and how much to invest</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Future Value Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Simple Future Value:</strong> Calculates future value of a single investment</span>
          </li>
          <li>
            <span><strong>Annuity Future Value:</strong> Handles regular contribution streams with different frequencies</span>
          </li>
          <li>
            <span><strong>Multiple Compounding:</strong> Supports various compounding frequencies</span>
          </li>
          <li>
            <span><strong>Investment Analysis:</strong> Breaks down contributions vs. interest earned</span>
          </li>
          <li>
            <span><strong>Growth Projections:</strong> Shows how investments grow over time</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What's the difference between future value and present value?",
            answer: "Future value calculates what current money will be worth in the future, while present value determines what future money is worth today. Future value shows growth, present value shows discounting."
          },
          {
            question: "How does compound interest affect future value?",
            answer: "Compound interest significantly increases future value because you earn interest on both your principal and previously earned interest. The longer the time period, the more dramatic the effect."
          },
          {
            question: "What's the difference between simple and compound interest?",
            answer: "Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus any previously earned interest. Compound interest grows much faster over time."
          },
          {
            question: "How often should I compound my investments?",
            answer: "More frequent compounding (monthly vs. annually) results in slightly higher returns. However, the difference is usually small, and the most important factors are the interest rate and time period."
          },
          {
            question: "Can I use this calculator for different types of investments?",
            answer: "Yes, this calculator works for any investment that earns compound interest, including savings accounts, CDs, bonds, stocks, mutual funds, and retirement accounts like 401(k)s and IRAs."
          },
          {
            question: "How accurate are future value projections?",
            answer: "Future value calculations are based on assumed constant interest rates, which may not reflect actual market conditions. Use them as estimates and consider various scenarios with different rates."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default FutureValueCalculator
