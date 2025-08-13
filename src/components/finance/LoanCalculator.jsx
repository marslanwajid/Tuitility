import React, { useState, useEffect } from 'react';
import {
  ToolHero,
  ToolLayout,
  ContentSection,
  TableOfContents,
  FeedbackForm,
  FAQSection,
  MathFormula
} from '../tool';
import '../../assets/css/finance/loan-calculator.css';

const LoanCalculator = () => {
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '12',
    downPayment: '',
    additionalFees: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateInputs = () => {
    const { loanAmount, interestRate, loanTerm, downPayment } = formData;
    
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      setError('Please enter a valid loan amount greater than 0.');
      return false;
    }

    if (!interestRate || parseFloat(interestRate) <= 0) {
      setError('Please enter a valid interest rate greater than 0.');
      return false;
    }

    if (!loanTerm || parseInt(loanTerm) <= 0) {
      setError('Please enter a valid loan term greater than 0.');
      return false;
    }

    if (downPayment) {
      const downPaymentAmount = parseFloat(downPayment);
      const loanAmountValue = parseFloat(loanAmount);
      if (downPaymentAmount >= loanAmountValue) {
        setError('Down payment cannot be greater than or equal to the loan amount.');
        return false;
      }
    }

    return true;
  };

  const calculateLoan = () => {
    if (!validateInputs()) return;

    try {
      const {
        loanAmount,
        interestRate,
        loanTerm,
        downPayment,
        additionalFees
      } = formData;

      const principal = parseFloat(loanAmount);
      const annualRate = parseFloat(interestRate);
      const termMonths = parseInt(loanTerm);
      const downPaymentAmount = parseFloat(downPayment) || 0;
      const fees = parseFloat(additionalFees) || 0;

      // Calculate actual loan amount after down payment
      const actualLoanAmount = Math.max(0, principal - downPaymentAmount);
      
      const monthlyRate = annualRate / 100 / 12;
      const numberOfPayments = termMonths;
      
      let principalAndInterest;
      
      if (monthlyRate === 0) {
        principalAndInterest = actualLoanAmount / numberOfPayments;
      } else {
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
        const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
        principalAndInterest = actualLoanAmount * (numerator / denominator);
      }

      // Calculate totals
      const totalMonthlyPayment = principalAndInterest + fees;
      const totalInterest = (principalAndInterest * numberOfPayments) - actualLoanAmount;
      const totalOfPayments = principalAndInterest * numberOfPayments;
      const totalFeesOverTerm = fees * numberOfPayments;
      const totalCost = totalOfPayments + totalFeesOverTerm + downPaymentAmount;

      // Calculate loan-to-value ratio
      const loanToValueRatio = (actualLoanAmount / principal) * 100;

      setResult({
        principalAndInterest,
        totalMonthlyPayment,
        totalInterest,
        totalOfPayments,
        totalFeesOverTerm,
        totalCost,
        downPaymentAmount,
        actualLoanAmount,
        loanToValueRatio,
        numberOfPayments,
        fees,
        isAdvanced: showAdvanced
      });
      setError('');
    } catch (err) {
      setError('Error calculating loan. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateLoan();
  };

  const handleReset = () => {
    setFormData({
      loanAmount: '',
      interestRate: '',
      loanTerm: '12',
      downPayment: '',
      additionalFees: ''
    });
    setShowAdvanced(false);
    setResult(null);
    setError('');
  };

  const relatedTools = [
    { name: 'Mortgage Calculator', path: '/finance/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Amortization Calculator', path: '/finance/amortization-calculator', icon: 'fas fa-chart-line' },
    { name: 'House Affordability Calculator', path: '/finance/house-affordability-calculator', icon: 'fas fa-house-user' },
    { name: 'Compound Interest Calculator', path: '/finance/compound-interest-calculator', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', path: '/finance/roi-calculator', icon: 'fas fa-trending-up' },
    { name: 'Business Loan Calculator', path: '/finance/business-loan-calculator', icon: 'fas fa-briefcase' }
  ];

  const categories = [
    {
      name: 'Personal Loans',
      tools: [
        { name: 'Loan Calculator', path: '/finance/loan-calculator' },
        { name: 'Mortgage Calculator', path: '/finance/mortgage-calculator' },
        { name: 'Amortization Calculator', path: '/finance/amortization-calculator' }
      ]
    },
    {
      name: 'Business Finance',
      tools: [
        { name: 'Business Loan Calculator', path: '/finance/business-loan-calculator' },
        { name: 'ROI Calculator', path: '/finance/roi-calculator' },
        { name: 'Compound Interest Calculator', path: '/finance/compound-interest-calculator' }
      ]
    },
    {
      name: 'Real Estate',
      tools: [
        { name: 'House Affordability Calculator', path: '/finance/house-affordability-calculator' }
      ]
    }
  ];

  // Content sections for the Loan Calculator
  const contentSections = [
    {
      id: "what-is-loan",
      title: "What is a Loan Calculator?",
      intro: [
        "A loan calculator is a financial tool that helps you estimate monthly loan payments and understand the total cost of borrowing. It calculates principal and interest payments, total interest paid, and provides a complete breakdown of your loan costs."
      ],
      list: [
        "Monthly Payment Calculation: Determines your principal and interest payment",
        "Total Cost Analysis: Shows the complete cost over the loan term",
        "Interest Breakdown: Calculates total interest paid over the loan life",
        "Down Payment Impact: Shows how down payments affect loan terms",
        "Additional Fees: Includes processing fees, insurance, and other costs"
      ]
    },
    {
      id: "loan-formula",
      title: "Loan Payment Formula",
      intro: [
        "The standard loan payment formula calculates the monthly payment for a fixed-rate loan."
      ],
      content: (
        <div>
          <div className="formula-section">
            <h3>Standard Loan Formula</h3>
            <div className="math-formula">
              M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>M</strong> = Monthly loan payment</li>
              <li><strong>P</strong> = Principal loan amount</li>
              <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
              <li><strong>n</strong> = Total number of payments</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use the Loan Calculator",
      intro: [
        "Follow these steps to calculate your loan payment accurately."
      ],
      steps: [
        "Enter the loan amount you want to borrow",
        "Input the annual interest rate as a percentage",
        "Select the loan term in months",
        "Enter any down payment amount (optional)",
        "Add additional monthly fees if applicable",
        "Click 'Calculate Loan' to see your results"
      ]
    },
    {
      id: "understanding-results",
      title: "Understanding Your Results",
      intro: [
        "The calculator provides detailed breakdowns to help you understand the true cost of borrowing."
      ],
      list: [
        "Principal & Interest: The base loan payment covering principal and interest",
        "Additional Fees: Monthly fees like processing charges or insurance",
        "Total Monthly Payment: Sum of principal, interest, and fees",
        "Total Interest: Total interest paid over the loan term",
        "Total Cost: Complete cost including principal, interest, fees, and down payment",
        "Loan-to-Value Ratio: Percentage of the loan amount being financed"
      ]
    },
    {
      id: "factors-affecting-loan",
      title: "Factors Affecting Loan Payments",
      intro: [
        "Several factors influence your monthly loan payment and total loan cost."
      ],
      content: (
        <div className="factors-grid">
          <div className="factor-item">
            <h4><i className="fas fa-percentage"></i>Interest Rate</h4>
            <p>Higher rates increase monthly payments and total interest. Even a small rate difference can significantly impact your total cost.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-calendar-alt"></i>Loan Term</h4>
            <p>Longer terms have lower monthly payments but higher total interest. Shorter terms have higher payments but less total interest.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-money-bill-wave"></i>Down Payment</h4>
            <p>Larger down payments reduce the loan amount, lowering monthly payments and total interest paid.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-file-invoice-dollar"></i>Additional Fees</h4>
            <p>Processing fees, insurance, and other charges increase your total monthly payment and overall loan cost.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-chart-line"></i>Loan Amount</h4>
            <p>Higher loan amounts result in higher monthly payments and more total interest paid over the loan term.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-credit-card"></i>Credit Score</h4>
            <p>Better credit scores typically qualify for lower interest rates, reducing both monthly payments and total interest.</p>
          </div>
        </div>
      )
    },
    {
      id: "tips-for-borrowers",
      title: "Tips for Loan Borrowers",
      intro: [
        "Use these strategies to make informed decisions about your loan."
      ],
      list: [
        "Compare multiple loan offers to find the best rates and terms",
        "Consider the total cost of the loan, not just the monthly payment",
        "Make larger down payments when possible to reduce loan amount",
        "Factor in all fees and charges when calculating affordability",
        "Consider your long-term financial goals when choosing loan terms",
        "Check your credit score before applying for better rates",
        "Read and understand all loan terms and conditions",
        "Consider prepayment options to reduce total interest paid"
      ]
    },
    {
      id: "common-mistakes",
      title: "Common Loan Mistakes to Avoid",
      intro: [
        "Avoid these common pitfalls when calculating and applying for loans."
      ],
      list: [
        "Focusing only on monthly payment without considering total loan cost",
        "Not accounting for all fees and charges in your budget",
        "Choosing the longest loan term just to get a lower payment",
        "Not shopping around for the best loan rates",
        "Underestimating the impact of interest rates on total cost",
        "Not considering future financial changes or emergencies",
        "Taking on a loan payment that's too high for your income",
        "Not understanding prepayment penalties or fees"
      ]
    }
  ];

  return (
    <div className="tool-page">
      <ToolHero
        title="Loan Calculator"
        description="Calculate monthly loan payments with detailed breakdowns including principal, interest, fees, and total cost. Perfect for personal loans, auto loans, and other financing needs."
        icon="fas fa-hand-holding-usd"
        features={[
          "Monthly payment calculation",
          "Total cost breakdown",
          "Interest analysis",
          "Down payment impact"
        ]}
      />

      <div className="container">
        <div className="tool-main">
          <ToolLayout
            sidebarProps={{
              relatedTools,
              categories
            }}
          >
            {/* Calculator Section */}
            <section className="calculator-section">
              <h2 className="section-title">
                <i className="fas fa-calculator"></i>
                Loan Calculator
              </h2>

              <form className="calculator-form" onSubmit={handleSubmit}>
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
                      placeholder="e.g., 10000"
                      min="0"
                      step="100"
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
                      placeholder="e.g., 7.5"
                      min="0"
                      max="50"
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
                      Loan Term (Months):
                    </label>
                    <select
                      id="loan-term"
                      className="input-field"
                      value={formData.loanTerm}
                      onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                    >
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="18">18 Months</option>
                      <option value="24">24 Months</option>
                      <option value="36">36 Months</option>
                      <option value="48">48 Months</option>
                      <option value="60">60 Months</option>
                      <option value="72">72 Months</option>
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
                      placeholder="e.g., 2000"
                      min="0"
                      step="100"
                    />
                    <small className="input-help">
                      Optional: Reduces loan amount
                    </small>
                  </div>
                </div>

                {/* Advanced Toggle */}
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      id="advanced-toggle"
                      checked={showAdvanced}
                      onChange={(e) => setShowAdvanced(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Include Additional Monthly Fees
                  </label>
                </div>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <div className="advanced-fields">
                    <h3>Additional Monthly Costs</h3>
                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="additional-fees" className="input-label">
                          Monthly Fees ($):
                        </label>
                        <input
                          type="number"
                          id="additional-fees"
                          className="input-field"
                          value={formData.additionalFees}
                          onChange={(e) => handleInputChange('additionalFees', e.target.value)}
                          placeholder="e.g., 25"
                          min="0"
                          step="5"
                        />
                        <small className="input-help">
                          Processing fees, insurance, etc.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <div className="calculator-actions">
                  <button type="submit" className="btn-calculate">
                    <i className="fas fa-calculator"></i>
                    Calculate Loan
                  </button>
                  <button type="button" className="btn-reset" onClick={handleReset}>
                    <i className="fas fa-redo"></i>
                    Reset
                  </button>
                </div>
              </form>
            </section>

            {/* Results Section */}
            {error && (
              <section className="result-section error show">
                <div className="result-content">
                  <i className="fas fa-exclamation-triangle"></i>
                  {error}
                </div>
              </section>
            )}

            {result && (
              <section className="result-section show">
                <h3 className="result-title">
                  <i className="fas fa-check-circle"></i>
                  Loan Calculation Results
                </h3>
                <div className="result-content">
                  <div className="result-main">
                    <div className="result-item">
                      <strong>Monthly Payment (P&I):</strong>
                      <div className="result-formula">
                        ${result.principalAndInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>

                    <div className="result-item">
                      <strong>Total Monthly Payment:</strong>
                      <span>${result.totalMonthlyPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>

                    <div className="result-item">
                      <strong>Principal Amount:</strong>
                      <span>${result.actualLoanAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>

                    <div className="result-item">
                      <strong>Total Interest Paid:</strong>
                      <span>${result.totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>

                    <div className="result-item">
                      <strong>Total Cost of Loan:</strong>
                      <span>${result.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>

                    {result.downPaymentAmount > 0 && (
                      <div className="payment-breakdown">
                        <h4>Payment Breakdown</h4>
                        <div className="breakdown-item">
                          <span>Down Payment:</span>
                          <span className="amount">${result.downPaymentAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Amount Financed:</span>
                          <span className="amount">${result.actualLoanAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="breakdown-item">
                          <span>Total Principal & Interest:</span>
                          <span className="amount">${result.totalOfPayments.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      </div>
                    )}

                    {result.fees > 0 && (
                      <div className="loan-details">
                        <h4>Additional Costs</h4>
                        <div className="detail-item">
                          <span>Monthly Fees:</span>
                          <span>${result.fees.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="detail-item">
                          <span>Total Fees Over Term:</span>
                          <span>${result.totalFeesOverTerm.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="detail-item">
                          <span>Loan-to-Value Ratio:</span>
                          <span>{result.loanToValueRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!result.isAdvanced && (
                    <div className="result-tip">
                      <i className="fas fa-lightbulb"></i>
                      <span>💡 Tip: Use the Advanced Calculator to include additional monthly fees for a more accurate total cost</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Table of Contents & Feedback */}
            <div className="toc-feedback-section">
              <div className="toc-feedback-container">
                                            <TableOfContents
                              sections={[
                                { id: "what-is-loan", title: "What is a Loan Calculator?" },
                                { id: "loan-formula", title: "Loan Payment Formula" },
                                { id: "how-to-use", title: "How to Use" },
                                { id: "understanding-results", title: "Understanding Results" },
                                { id: "factors-affecting-loan", title: "Factors Affecting Loan" },
                                { id: "tips-for-borrowers", title: "Tips for Borrowers" },
                                { id: "common-mistakes", title: "Common Mistakes to Avoid" },
                                { id: "faq", title: "FAQ" }
                              ]}
                            />
                <FeedbackForm
                  title="Feedback"
                  icon="fas fa-comment"
                />
              </div>
            </div>

            {/* Content Sections */}
            <ContentSection sections={contentSections} />

            <FAQSection
              title="Frequently Asked Questions"
              id="faq"
              faqs={[
                {
                  question: "What's the difference between APR and interest rate?",
                  answer: "The interest rate is the cost of borrowing the principal loan amount, while APR (Annual Percentage Rate) includes the interest rate plus other loan costs such as broker fees, discount points, and some closing costs. APR gives you a more complete picture of the loan cost."
                },
                {
                  question: "How does the loan term affect my payments?",
                  answer: "Longer loan terms result in lower monthly payments but higher total interest paid. Shorter terms have higher monthly payments but less total interest. Choose based on your budget and how quickly you want to pay off the loan."
                },
                {
                  question: "What is a down payment and why is it important?",
                  answer: "A down payment is an upfront payment that reduces the loan amount. Larger down payments lower your monthly payments, reduce total interest, and may help you qualify for better interest rates. They also reduce the lender's risk."
                },
                {
                  question: "How do I know if I can afford a loan?",
                  answer: "A general rule is that your total debt payments (including the new loan) should not exceed 36% of your gross monthly income. Consider your other expenses, emergency fund, and future financial goals when determining affordability."
                },
                {
                  question: "What are prepayment penalties?",
                  answer: "Prepayment penalties are fees charged if you pay off your loan early. They're designed to compensate lenders for lost interest. Always check your loan terms for prepayment penalties and consider them when choosing a loan."
                },
                {
                  question: "How does my credit score affect my loan?",
                  answer: "Your credit score significantly impacts your interest rate. Higher scores typically qualify for lower rates, which can save thousands in interest over the loan term. Check your credit score before applying and work to improve it if needed."
                }
              ]}
            />
          </ToolLayout>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
