import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import PresentValueCalculatorJS from '../../assets/js/finance/present-value-calculator.js'
import '../../assets/css/finance/present-value-calculator.css'
import Seo from '../Seo'

const PresentValueCalculator = () => {
  const [formData, setFormData] = useState({
    futureValue: '',
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
      const presentValueCalc = new PresentValueCalculatorJS();
      setCalculator(presentValueCalc);
    } catch (error) {
      console.error('Error initializing present value calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Present Value Calculator',
    description: 'Calculate the present value of future cash flows, investments, and annuities. Determine how much money you need today to reach future financial goals.',
    icon: 'fas fa-chart-line',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Present Value Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, pv, discounted cash flow, dcf`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/present-value-calculator`;

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
    { name: 'Future Value Calculator', url: '/finance/calculators/future-value-calculator', icon: 'fas fa-chart-line' },
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-pie' },
    { name: 'Retirement Calculator', url: '/finance/calculators/retirement-calculator', icon: 'fas fa-piggy-bank' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'ROI Calculator', url: '/finance/calculators/roi-calculator', icon: 'fas fa-percentage' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-present-value', title: 'What is Present Value?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Present Value Formulas & Calculations' },
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
        formData.futureValue,
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

  const calculatePresentValue = () => {
    if (!validateInputs()) return;

    try {
      const {
        futureValue,
        interestRate,
        timePeriod,
        paymentAmount,
        paymentFrequency
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculatePresentValue(
        parseFloat(futureValue),
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
      futureValue: '',
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
          title="Present Value Calculator"
          onCalculate={calculatePresentValue}
          calculateButtonText="Calculate Present Value"
          error={error}
          result={null}
        >
          <div className="present-value-calculator-form">
            <div className="present-value-input-row">
              <div className="present-value-input-group">
                <label htmlFor="present-value-future-value" className="present-value-input-label">
                  Future Value ($):
                </label>
                <input
                  type="number"
                  id="present-value-future-value"
                  className="present-value-input-field"
                  value={formData.futureValue}
                  onChange={(e) => handleInputChange('futureValue', e.target.value)}
                  placeholder="e.g., 100000"
                  min="0"
                  step="1000"
                />
                <small className="present-value-input-help">
                  The amount you want to have in the future
                </small>
              </div>

              <div className="present-value-input-group">
                <label htmlFor="present-value-interest-rate" className="present-value-input-label">
                  Interest Rate (%):
                </label>
                <input
                  type="number"
                  id="present-value-interest-rate"
                  className="present-value-input-field"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  placeholder="e.g., 6"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <small className="present-value-input-help">
                  Annual interest rate or discount rate
                </small>
              </div>
            </div>

            <div className="present-value-input-row">
              <div className="present-value-input-group">
                <label htmlFor="present-value-time-period" className="present-value-input-label">
                  Time Period (years):
                </label>
                <input
                  type="number"
                  id="present-value-time-period"
                  className="present-value-input-field"
                  value={formData.timePeriod}
                  onChange={(e) => handleInputChange('timePeriod', e.target.value)}
                  placeholder="e.g., 5"
                  min="0.1"
                  max="100"
                  step="0.1"
                />
                <small className="present-value-input-help">
                  Number of years until future value
                </small>
              </div>

              <div className="present-value-input-group">
                <label htmlFor="present-value-payment-amount" className="present-value-input-label">
                  Payment Amount ($):
                </label>
                <input
                  type="number"
                  id="present-value-payment-amount"
                  className="present-value-input-field"
                  value={formData.paymentAmount}
                  onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                  placeholder="e.g., 1000 (optional)"
                  min="0"
                  step="100"
                />
                <small className="present-value-input-help">
                  Regular payment amount (optional)
                </small>
              </div>
            </div>

            <div className="present-value-input-row">
              <div className="present-value-input-group">
                <label htmlFor="present-value-payment-frequency" className="present-value-input-label">
                  Payment Frequency:
                </label>
                <select
                  id="present-value-payment-frequency"
                  className="present-value-select-field"
                  value={formData.paymentFrequency}
                  onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
                >
                  <option value="none">No Payments</option>
                  <option value="annually">Annually</option>
                  <option value="semi-annually">Semi-annually</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <small className="present-value-input-help">
                  How often payments are made
                </small>
              </div>
            </div>

            <div className="present-value-calculator-actions">
              <button type="button" className="present-value-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="present-value-calculator-result">
              <h3 className="present-value-result-title">Present Value Calculator Results</h3>
              <div className="present-value-result-content">
                <div className="present-value-result-main">
                  <div className="present-value-result-item">
                    <strong>Present Value:</strong>
                    <span className="present-value-result-value">
                      {formatCurrency(result.presentValue)}
                    </span>
                  </div>
                  <div className="present-value-result-item">
                    <strong>Future Value:</strong>
                    <span className="present-value-result-value">
                      {formatCurrency(result.futureValue)}
                    </span>
                  </div>
                  <div className="present-value-result-item">
                    <strong>Discount Amount:</strong>
                    <span className="present-value-result-value">
                      {formatCurrency(result.discountAmount)}
                    </span>
                  </div>
                  <div className="present-value-result-item">
                    <strong>Time Period:</strong>
                    <span className="present-value-result-value">
                      {result.timePeriod} year{result.timePeriod !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {result.paymentAmount > 0 && result.paymentsPerYear > 0 && (
                  <div className="present-value-result-breakdown">
                    <h4>Payment Analysis</h4>
                    <div className="present-value-breakdown-details">
                      <div className="present-value-breakdown-item">
                        <span>Payment Amount:</span>
                        <span>{formatCurrency(result.paymentAmount)} ({result.paymentFrequencyName})</span>
                      </div>
                      <div className="present-value-breakdown-item">
                        <span>Total Payments:</span>
                        <span>{formatCurrency(result.totalPayments)}</span>
                      </div>
                      <div className="present-value-breakdown-item">
                        <span>Present Value of Payments:</span>
                        <span>{formatCurrency(result.presentValueOfPayments)}</span>
                      </div>
                      <div className="present-value-breakdown-item">
                        <span>Present Value of Future Sum:</span>
                        <span>{formatCurrency(result.presentValueOfFutureSum)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="present-value-result-summary">
                  <h4>Financial Insights</h4>
                  <div className="present-value-summary-details">
                    <div className="present-value-summary-item">
                      <span>Effective Annual Rate:</span>
                      <span>{formatPercentage(result.effectiveRate)}</span>
                    </div>
                    <div className="present-value-summary-item">
                      <span>Discount Factor:</span>
                      <span>{result.discountFactor.toFixed(4)}</span>
                    </div>
                    <div className="present-value-summary-item">
                      <span>Interest Rate:</span>
                      <span>{formatPercentage(result.interestRate)}</span>
                    </div>
                    <div className="present-value-summary-item">
                      <span>Compounding Periods:</span>
                      <span>{result.totalPeriods} periods</span>
                    </div>
                  </div>
                </div>

                <div className="present-value-result-tip">
                  <i className="fas fa-lightbulb"></i>
                  <span>💡 Tip: The present value shows how much you need to invest today to reach your future financial goal!</span>
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
            The Present Value Calculator is a powerful financial tool that helps you determine the current 
            worth of future cash flows, investments, and financial goals. By calculating present value, 
            you can make informed decisions about investments, loans, and financial planning.
          </p>
          <p>
            This calculator helps you understand the time value of money, determine how much you need to 
            invest today to reach future goals, and evaluate the true cost of future financial obligations.
          </p>
        </ContentSection>

        <ContentSection id="what-is-present-value" title="What is Present Value?">
          <p>
            Present Value (PV) is the current worth of a future sum of money or stream of cash flows, 
            given a specific rate of return or discount rate. It's based on the principle that money 
            available today is worth more than the same amount in the future due to its potential earning capacity.
          </p>
          <ul>
            <li>
              <span><strong>Time Value of Money:</strong> Money today is worth more than money tomorrow</span>
            </li>
            <li>
              <span><strong>Discounting:</strong> The process of determining present value by applying a discount rate</span>
            </li>
            <li>
              <span><strong>Investment Decisions:</strong> Helps evaluate whether investments are worthwhile</span>
            </li>
            <li>
              <span><strong>Financial Planning:</strong> Essential for retirement and goal planning</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Present Value Calculator">
          <p>Using the present value calculator is straightforward and requires basic financial information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Future Value:</strong> Input the amount you want to have in the future.</span>
            </li>
            <li>
              <span><strong>Set Interest Rate:</strong> Enter the annual interest rate or discount rate.</span>
            </li>
            <li>
              <span><strong>Enter Time Period:</strong> Specify the number of years until the future value.</span>
            </li>
            <li>
              <span><strong>Add Payment Amount (Optional):</strong> Include regular payments if applicable.</span>
            </li>
            <li>
              <span><strong>Select Payment Frequency:</strong> Choose how often payments are made.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Present Value" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Use this calculator to determine how much you need to invest today 
            to reach specific financial goals like retirement, education, or major purchases.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Present Value Formulas & Calculations">
          <div className="formula-section">
            <h3>Simple Present Value</h3>
            <div className="math-formula">
              PV = FV ÷ (1 + r)^n
            </div>
            <p>Where PV = Present Value, FV = Future Value, r = Interest Rate, n = Number of Periods.</p>
          </div>

          <div className="formula-section">
            <h3>Present Value of Annuity</h3>
            <div className="math-formula">
              PV = PMT × [1 - (1 + r)^-n] ÷ r
            </div>
            <p>Where PMT = Payment Amount, r = Interest Rate per Period, n = Number of Payments.</p>
          </div>

          <div className="formula-section">
            <h3>Present Value with Multiple Compounding</h3>
            <div className="math-formula">
              PV = FV ÷ (1 + r/m)^(m×n)
            </div>
            <p>Where m = Number of Compounding Periods per Year.</p>
          </div>

          <div className="formula-section">
            <h3>Discount Factor</h3>
            <div className="math-formula">
              Discount Factor = 1 ÷ (1 + r)^n
            </div>
            <p>This factor shows how much a future dollar is worth today.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Simple Present Value</h3>
            <div className="example-solution">
              <p><strong>Future Value:</strong> $100,000</p>
              <p><strong>Interest Rate:</strong> 6% annually</p>
              <p><strong>Time Period:</strong> 10 years</p>
              <p><strong>Present Value:</strong> $55,839.48</p>
              <p><strong>Discount Amount:</strong> $44,160.52</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Present Value with Monthly Payments</h3>
            <div className="example-solution">
              <p><strong>Future Value:</strong> $50,000</p>
              <p><strong>Interest Rate:</strong> 5% annually</p>
              <p><strong>Time Period:</strong> 5 years</p>
              <p><strong>Monthly Payment:</strong> $500</p>
              <p><strong>Present Value:</strong> $39,176.10</p>
              <p><strong>Present Value of Payments:</strong> $26,533.20</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: Retirement Goal</h3>
            <div className="example-solution">
              <p><strong>Retirement Goal:</strong> $1,000,000</p>
              <p><strong>Interest Rate:</strong> 7% annually</p>
              <p><strong>Time to Retirement:</strong> 30 years</p>
              <p><strong>Present Value:</strong> $131,366.69</p>
              <p><strong>Required Investment:</strong> $131,366.69 today</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-piggy-bank"></i> Investment Planning</h4>
              <p>Determine how much to invest today to reach future financial goals</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Education Planning</h4>
              <p>Calculate present value of future education costs and savings needs</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Real Estate Investment</h4>
              <p>Evaluate the present value of future rental income and property appreciation</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Business Valuation</h4>
              <p>Calculate present value of future cash flows for business investments</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-handshake"></i> Loan Analysis</h4>
              <p>Determine the true cost of loans and compare different financing options</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Financial Planning</h4>
              <p>Integrate present value calculations into comprehensive financial plans</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding present value calculations is crucial for several reasons:</p>
          <ul>
            <li>
              <span>Helps you make informed investment decisions by comparing present costs to future benefits</span>
            </li>
            <li>
              <span>Essential for retirement planning and determining required savings amounts</span>
            </li>
            <li>
              <span>Enables accurate comparison of different financial options and opportunities</span>
            </li>
            <li>
              <span>Critical for business valuation and investment analysis</span>
            </li>
            <li>
              <span>Helps you understand the true cost of future financial obligations</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Present Value Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Simple Present Value:</strong> Calculates present value of a single future amount</span>
            </li>
            <li>
              <span><strong>Annuity Present Value:</strong> Handles regular payment streams with different frequencies</span>
            </li>
            <li>
              <span><strong>Multiple Compounding:</strong> Supports various compounding frequencies</span>
            </li>
            <li>
              <span><strong>Financial Insights:</strong> Provides discount factors and effective rates</span>
            </li>
            <li>
              <span><strong>Payment Analysis:</strong> Breaks down present value of payments vs. future sum</span>
            </li>
            <li>
              <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
            </li>
          </ul>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "What's the difference between present value and future value?",
              answer: "Present value is the current worth of future money, while future value is what current money will be worth in the future. Present value discounts future amounts to today's value, accounting for the time value of money."
            },
            {
              question: "How does the interest rate affect present value?",
              answer: "Higher interest rates result in lower present values because money grows faster, so you need less today to reach the same future amount. Lower interest rates mean higher present values."
            },
            {
              question: "What is the discount factor?",
              answer: "The discount factor is a multiplier that converts future values to present values. It's calculated as 1 ÷ (1 + interest rate)^time periods and shows how much a future dollar is worth today."
            },
            {
              question: "When should I use present value calculations?",
              answer: "Use present value for investment decisions, retirement planning, loan comparisons, business valuations, and any situation where you need to compare money at different points in time."
            },
            {
              question: "How do regular payments affect present value?",
              answer: "Regular payments increase the present value because they represent additional cash flows. The calculator accounts for both the present value of the future lump sum and the present value of all regular payments."
            },
            {
              question: "What's the difference between annual and monthly compounding?",
              answer: "Monthly compounding results in slightly higher effective interest rates because interest is calculated more frequently. This affects the present value calculation, making future amounts worth slightly less in present value terms."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default PresentValueCalculator