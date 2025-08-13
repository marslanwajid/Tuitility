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
import '../../assets/css/finance/mortgage-calculator.css';

const MortgageCalculator = () => {
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '30',
    downPayment: '',
    propertyTax: '',
    insurance: '',
    pmi: '',
    hoaFees: ''
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

    if (!loanTerm || parseInt(loanTerm) <= 0 || parseInt(loanTerm) > 50) {
      setError('Please enter a valid loan term between 1 and 50 years.');
      return false;
    }

    if (showAdvanced && downPayment) {
      const downPaymentAmount = parseFloat(downPayment);
      const loanAmountValue = parseFloat(loanAmount);
      if (downPaymentAmount >= loanAmountValue) {
        setError('Down payment cannot be greater than or equal to the loan amount.');
        return false;
      }
    }

    return true;
  };

  const calculateMortgage = () => {
    if (!validateInputs()) return;

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

      const principal = parseFloat(loanAmount);
      const annualRate = parseFloat(interestRate);
      const termYears = parseInt(loanTerm);
      const downPaymentAmount = parseFloat(downPayment) || 0;
      const propertyTaxAnnual = parseFloat(propertyTax) || 0;
      const insuranceAnnual = parseFloat(insurance) || 0;
      const pmiRate = parseFloat(pmi) || 0;
      const hoaFeesMonthly = parseFloat(hoaFees) || 0;

      // Calculate actual loan amount after down payment
      const actualLoanAmount = Math.max(0, principal - downPaymentAmount);
      
      const monthlyRate = annualRate / 100 / 12;
      const numberOfPayments = termYears * 12;
      
      let principalAndInterest;
      
      if (monthlyRate === 0) {
        principalAndInterest = actualLoanAmount / numberOfPayments;
      } else {
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
        const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
        principalAndInterest = actualLoanAmount * (numerator / denominator);
      }
      
      // Calculate monthly costs
      const monthlyPropertyTax = propertyTaxAnnual / 12;
      const monthlyInsurance = insuranceAnnual / 12;
      const monthlyPMI = (actualLoanAmount * pmiRate / 100) / 12;
      
      const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoaFeesMonthly;
      
      // Calculate totals
      const totalInterest = (principalAndInterest * numberOfPayments) - actualLoanAmount;
      const totalOfPayments = principalAndInterest * numberOfPayments;
      const loanToValueRatio = (actualLoanAmount / principal) * 100;

      setResult({
        principalAndInterest,
        monthlyPropertyTax,
        monthlyInsurance,
        monthlyPMI,
        hoaFees: hoaFeesMonthly,
        totalMonthlyPayment,
        totalInterest,
        totalOfPayments,
        downPayment: downPaymentAmount,
        loanToValueRatio,
        actualLoanAmount,
        principal,
        numberOfPayments,
        isAdvanced: showAdvanced
      });
      setError('');
    } catch (error) {
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateMortgage();
  };

  const handleReset = () => {
    setFormData({
      loanAmount: '',
      interestRate: '',
      loanTerm: '30',
      downPayment: '',
      propertyTax: '',
      insurance: '',
      pmi: '',
      hoaFees: ''
    });
    setShowAdvanced(false);
    setResult(null);
    setError('');
  };

  const relatedTools = [
    { name: 'Loan Calculator', path: '/finance/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Amortization Calculator', path: '/finance/amortization-calculator', icon: 'fas fa-chart-line' },
    { name: 'House Affordability Calculator', path: '/finance/house-affordability-calculator', icon: 'fas fa-house-user' },
    { name: 'Compound Interest Calculator', path: '/finance/compound-interest-calculator', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', path: '/finance/roi-calculator', icon: 'fas fa-trending-up' },
    { name: 'Business Loan Calculator', path: '/finance/business-loan-calculator', icon: 'fas fa-briefcase' }
  ];

  const categories = [
    {
      name: 'Loan Calculators',
      tools: [
        { name: 'Mortgage Calculator', path: '/finance/mortgage-calculator' },
        { name: 'Loan Calculator', path: '/finance/loan-calculator' },
        { name: 'Business Loan Calculator', path: '/finance/business-loan-calculator' }
      ]
    },
    {
      name: 'Investment Calculators',
      tools: [
        { name: 'Compound Interest Calculator', path: '/finance/compound-interest-calculator' },
        { name: 'ROI Calculator', path: '/finance/roi-calculator' }
      ]
    },
    {
      name: 'Real Estate',
      tools: [
        { name: 'House Affordability Calculator', path: '/finance/house-affordability-calculator' },
        { name: 'Amortization Calculator', path: '/finance/amortization-calculator' }
      ]
    }
  ];

  // Content sections for the Mortgage Calculator
  const contentSections = [
    {
      id: "what-is-mortgage",
      title: "What is a Mortgage Calculator?",
      intro: [
        "A mortgage calculator is a financial tool that helps you estimate monthly mortgage payments and understand the total cost of homeownership. It takes into account the principal loan amount, interest rate, loan term, and additional costs like property taxes, insurance, and PMI."
      ],
      list: [
        "Monthly Payment Calculation: Determines your principal and interest payment",
        "Total Cost Analysis: Shows the complete cost over the loan term",
        "Additional Costs: Includes taxes, insurance, PMI, and HOA fees",
        "Loan-to-Value Ratio: Calculates the percentage of home value being financed",
        "Amortization Preview: Shows how payments are split between principal and interest"
      ]
    },
    {
      id: "mortgage-formula",
      title: "Mortgage Payment Formula",
      intro: [
        "The standard mortgage payment formula calculates the monthly payment for a fixed-rate mortgage."
      ],
      content: (
        <div>
          <div className="formula-section">
            <h3>Standard Mortgage Formula</h3>
            <div className="math-formula">
              M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>M</strong> = Monthly mortgage payment</li>
              <li><strong>P</strong> = Principal loan amount</li>
              <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
              <li><strong>n</strong> = Total number of payments (years × 12)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "how-to-use",
      title: "How to Use the Mortgage Calculator",
      intro: [
        "Follow these steps to calculate your mortgage payment accurately."
      ],
      steps: [
        "Enter the loan amount (home price minus down payment)",
        "Input the annual interest rate as a percentage",
        "Select the loan term in years (typically 15, 20, or 30 years)",
        "Toggle 'Advanced Calculator' for additional costs",
        "Fill in property taxes, insurance, PMI, and HOA fees if applicable",
        "Click 'Calculate Mortgage' to see your results"
      ]
    },
    {
      id: "understanding-results",
      title: "Understanding Your Results",
      intro: [
        "The calculator provides detailed breakdowns to help you understand the true cost of homeownership."
      ],
      list: [
        "Principal & Interest: The base mortgage payment covering loan principal and interest",
        "Property Tax: Annual property taxes divided into monthly payments",
        "Insurance: Monthly homeowner's insurance premium",
        "PMI (Private Mortgage Insurance): Required if down payment is less than 20%",
        "HOA Fees: Monthly homeowners association fees if applicable",
        "Total Monthly Payment: Sum of all monthly housing costs",
        "Loan-to-Value Ratio: Percentage of home value being financed",
        "Total Interest: Total interest paid over the loan term"
      ]
    },
    {
      id: "factors-affecting-payment",
      title: "Factors Affecting Mortgage Payments",
      intro: [
        "Several factors influence your monthly mortgage payment and total loan cost."
      ],
      content: (
        <div className="factors-grid">
          <div className="factor-item">
            <h4><i className="fas fa-percentage"></i>Interest Rate</h4>
            <p>Higher rates increase monthly payments and total interest. Even a 0.5% difference can significantly impact your payment.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-calendar-alt"></i>Loan Term</h4>
            <p>Longer terms (30 years) have lower monthly payments but higher total interest. Shorter terms (15 years) have higher payments but less total interest.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-money-bill-wave"></i>Down Payment</h4>
            <p>Larger down payments reduce the loan amount, lowering monthly payments and potentially eliminating PMI requirements.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-home"></i>Property Taxes</h4>
            <p>Vary by location and property value. Higher taxes increase monthly housing costs.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-shield-alt"></i>Insurance Costs</h4>
            <p>Includes homeowner's insurance and PMI if down payment is less than 20% of home value.</p>
          </div>
          <div className="factor-item">
            <h4><i className="fas fa-building"></i>HOA Fees</h4>
            <p>Monthly fees for community amenities and maintenance in planned communities or condominiums.</p>
          </div>
        </div>
      )
    },
    {
      id: "tips-for-buyers",
      title: "Tips for Home Buyers",
      intro: [
        "Use these strategies to make informed decisions about your mortgage."
      ],
      list: [
        "Compare multiple loan offers to find the best rates and terms",
        "Consider the total cost of homeownership, not just the mortgage payment",
        "Aim for a down payment of at least 20% to avoid PMI",
        "Factor in closing costs, which typically range from 2-5% of the home price",
        "Consider your long-term financial goals when choosing loan terms",
        "Get pre-approved for a mortgage before house hunting",
        "Maintain a good credit score to qualify for better interest rates",
        "Consider future expenses like maintenance, utilities, and potential rate increases"
      ]
    },
    {
      id: "common-mistakes",
      title: "Common Mortgage Mistakes to Avoid",
      intro: [
        "Avoid these common pitfalls when calculating and applying for a mortgage."
      ],
      list: [
        "Focusing only on monthly payment without considering total loan cost",
        "Not accounting for all housing costs in your budget",
        "Choosing the longest loan term just to get a lower payment",
        "Not shopping around for the best mortgage rates",
        "Underestimating closing costs and other upfront expenses",
        "Not considering future financial changes or emergencies",
        "Taking on a mortgage payment that's too high for your income",
        "Not understanding the terms and conditions of your loan"
      ]
    }
  ];

  return (
    <div className="tool-page">
      <ToolHero
        title="Mortgage Calculator"
        description="Calculate monthly mortgage payments with detailed breakdowns including taxes, insurance, PMI, and HOA fees. Perfect for homebuyers planning their purchase."
        icon="fas fa-home"
        features={[
          "Monthly payment calculation",
          "Advanced cost breakdown",
          "Loan-to-value analysis",
          "Total interest calculation"
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
                Mortgage Calculator
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
                    Advanced Calculator (Include taxes, insurance, PMI, HOA)
                  </label>
                </div>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <div className="advanced-fields">
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

                <div className="calculator-actions">
                  <button type="submit" className="btn-calculate">
                    <i className="fas fa-calculator"></i>
                    Calculate Mortgage
                  </button>
                  <button type="button" className="btn-reset" onClick={handleReset}>
                    <i className="fas fa-redo"></i>
                    Reset
                  </button>
                </div>
              </form>

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
                    Mortgage Calculation Results
                  </h3>
                  <div className="result-content">
                    <div className="result-main">
                      {result.isAdvanced ? (
                        <>
                          <div className="result-item">
                            <strong>Monthly Payment Breakdown:</strong>
                            <div className="payment-breakdown">
                              <div className="breakdown-item">
                                <span>Principal & Interest:</span>
                                <span className="amount">${result.principalAndInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="breakdown-item">
                                <span>Property Tax:</span>
                                <span className="amount">${result.monthlyPropertyTax.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="breakdown-item">
                                <span>Insurance:</span>
                                <span className="amount">${result.monthlyInsurance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="breakdown-item">
                                <span>PMI:</span>
                                <span className="amount">${result.monthlyPMI.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="breakdown-item">
                                <span>HOA Fees:</span>
                                <span className="amount">${result.hoaFees.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="breakdown-item total">
                                <span>Total Monthly Payment:</span>
                                <span className="amount">${result.totalMonthlyPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                            </div>
                          </div>

                          <div className="result-item">
                            <strong>Loan Details:</strong>
                            <div className="loan-details">
                              <div className="detail-item">
                                <span>Down Payment:</span>
                                <span>${result.downPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="detail-item">
                                <span>Loan Amount:</span>
                                <span>${result.actualLoanAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="detail-item">
                                <span>Loan-to-Value Ratio:</span>
                                <span>{result.loanToValueRatio.toFixed(2)}%</span>
                              </div>
                              <div className="detail-item">
                                <span>Total Interest:</span>
                                <span>${result.totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="detail-item">
                                <span>Total of Payments:</span>
                                <span>${result.totalOfPayments.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="result-item">
                            <strong>Monthly Payment:</strong>
                            <div className="result-formula">
                              ${result.principalAndInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                          </div>
                          <div className="result-item">
                            <strong>Total of Payments:</strong>
                            <span>${result.totalOfPayments.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </div>
                          <div className="result-item">
                            <strong>Total Interest:</strong>
                            <span>${result.totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </div>
                          <div className="result-item">
                            <strong>Principal Amount:</strong>
                            <span>${result.principal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!result.isAdvanced && (
                      <div className="result-tip">
                        <i className="fas fa-lightbulb"></i>
                        <span>💡 Tip: Use the Advanced Calculator for more detailed breakdown including taxes, insurance, and PMI</span>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </section>

            {/* Table of Contents & Feedback */}
            <div className="toc-feedback-section">
              <div className="toc-feedback-container">
                <TableOfContents
                  sections={[
                    { id: "what-is-mortgage", title: "What is a Mortgage Calculator?" },
                    { id: "mortgage-formula", title: "Mortgage Payment Formula" },
                    { id: "how-to-use", title: "How to Use" },
                    { id: "understanding-results", title: "Understanding Results" },
                    { id: "factors-affecting-payment", title: "Factors Affecting Payment" },
                    { id: "tips-for-buyers", title: "Tips for Home Buyers" },
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
            />
          </ToolLayout>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
