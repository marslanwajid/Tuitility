import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import { LoanCalculator as LoanCalculatorJS } from '../../assets/js/finance/loan-calculator.js'
import '../../assets/css/finance/loan-calculator.css'
import Seo from '../Seo'

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState('250000')
  const [annualRate, setAnnualRate] = useState('4.5')
  const [termYears, setTermYears] = useState('30')
  const [downPayment, setDownPayment] = useState('50000')
  const [monthlyFees, setMonthlyFees] = useState('0')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [calculator, setCalculator] = useState(null)

  // Tool data
  const toolData = {
    name: 'Loan Calculator',
    description: 'Calculate loan payments, interest, and amortization schedules. Perfect for mortgages, personal loans, auto loans, and financial planning.',
    icon: 'fas fa-home',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Loan Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, mortgage calculator, auto loan, personal loan`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/loan-calculator`;

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
    { name: 'Currency Calculator', url: '/finance/calculators/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' },
    { name: 'SSE Calculator', url: '/math/calculators/sse-calculator', icon: 'fas fa-chart-line' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-loan', title: 'What is a Loan Calculator?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'faqs', title: 'FAQs' }
  ];

  // Initialize calculator
  useEffect(() => {
    const calc = new LoanCalculatorJS();
    setCalculator(calc);
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'principal') {
      setPrincipal(value);
    } else if (field === 'annualRate') {
      setAnnualRate(value);
    } else if (field === 'termYears') {
      setTermYears(value);
    } else if (field === 'downPayment') {
      setDownPayment(value);
    } else if (field === 'monthlyFees') {
      setMonthlyFees(value);
    }
  };

  // Calculate loan
  const calculateLoan = () => {
    if (!calculator) {
      setError('Calculator not initialized');
      return;
    }

    try {
      setError('');

      const principalNum = parseFloat(principal);
      const annualRateNum = parseFloat(annualRate);
      const termYearsNum = parseFloat(termYears);
      const downPaymentNum = parseFloat(downPayment);
      const monthlyFeesNum = parseFloat(monthlyFees);

      // Validate inputs
      const validation = calculator.validateInputs(principalNum, annualRateNum, termYearsNum * 12, downPaymentNum);
      if (!validation.isValid) {
        setError(validation.errors.join(' '));
        return;
      }

      // Calculate loan
      const loanResult = calculator.calculateAdvancedLoan(
        principalNum,
        annualRateNum,
        termYearsNum * 12,
        downPaymentNum,
        monthlyFeesNum
      );

      setResult(loanResult);
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    setPrincipal('250000');
    setAnnualRate('4.5');
    setTermYears('30');
    setDownPayment('50000');
    setMonthlyFees('0');
    setResult(null);
    setError('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
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
          title="Loan Calculator"
          onCalculate={calculateLoan}
          calculateButtonText="Calculate Loan"
          error={error}
          result={null}
        >
          <div className="loan-calculator-form">
            <div className="loan-input-row">
              <div className="loan-input-group">
                <label htmlFor="loan-principal" className="loan-input-label">
                  Loan Amount ($):
                </label>
                <input
                  id="loan-principal"
                  type="number"
                  className="loan-input-field"
                  value={principal}
                  onChange={(e) => handleInputChange('principal', e.target.value)}
                  placeholder="e.g., 250000"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="loan-input-group">
                <label htmlFor="loan-rate" className="loan-input-label">
                  Annual Interest Rate (%):
                </label>
                <input
                  id="loan-rate"
                  type="number"
                  className="loan-input-field"
                  value={annualRate}
                  onChange={(e) => handleInputChange('annualRate', e.target.value)}
                  placeholder="e.g., 4.5"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="loan-input-row">
              <div className="loan-input-group">
                <label htmlFor="loan-term" className="loan-input-label">
                  Loan Term (Years):
                </label>
                <input
                  id="loan-term"
                  type="number"
                  className="loan-input-field"
                  value={termYears}
                  onChange={(e) => handleInputChange('termYears', e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="50"
                  step="1"
                />
              </div>

              <div className="loan-input-group">
                <label htmlFor="loan-down-payment" className="loan-input-label">
                  Down Payment ($):
                </label>
                <input
                  id="loan-down-payment"
                  type="number"
                  className="loan-input-field"
                  value={downPayment}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  placeholder="e.g., 50000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="loan-input-row">
              <div className="loan-input-group">
                <label htmlFor="loan-monthly-fees" className="loan-input-label">
                  Monthly Fees ($):
                </label>
                <input
                  id="loan-monthly-fees"
                  type="number"
                  className="loan-input-field"
                  value={monthlyFees}
                  onChange={(e) => handleInputChange('monthlyFees', e.target.value)}
                  placeholder="e.g., 0"
                  min="0"
                  step="10"
                />
              </div>
            </div>

            <div className="loan-calculator-actions">
              <button type="button" className="loan-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="loan-calculator-result">
              <h3 className="loan-result-title">Loan Calculation Result</h3>
              <div className="loan-result-content">
                <div className="loan-result-main">
                  <div className="loan-result-item">
                    <strong>Monthly Payment:</strong>
                    <span className="loan-result-value loan-result-final">
                      {formatCurrency(result.totalMonthlyPayment)}
                    </span>
                  </div>
                  <div className="loan-result-item">
                    <strong>Principal & Interest:</strong>
                    <span className="loan-result-value">
                      {formatCurrency(result.principalAndInterest)}
                    </span>
                  </div>
                  <div className="loan-result-item">
                    <strong>Monthly Fees:</strong>
                    <span className="loan-result-value">
                      {formatCurrency(result.monthlyFees)}
                    </span>
                  </div>
                  <div className="loan-result-item">
                    <strong>Total Interest:</strong>
                    <span className="loan-result-value">
                      {formatCurrency(result.totalInterest)}
                    </span>
                  </div>
                </div>
                
                <div className="loan-summary-info">
                  <h4>Loan Summary</h4>
                  <div className="loan-summary-details">
                    <div className="loan-summary-row">
                      <span><strong>Original Loan Amount:</strong></span>
                      <span>{formatCurrency(result.principal)}</span>
                    </div>
                    <div className="loan-summary-row">
                      <span><strong>Down Payment:</strong></span>
                      <span>{formatCurrency(result.downPayment)}</span>
                    </div>
                    <div className="loan-summary-row">
                      <span><strong>Actual Loan Amount:</strong></span>
                      <span>{formatCurrency(result.actualLoanAmount)}</span>
                    </div>
                    <div className="loan-summary-row">
                      <span><strong>Loan-to-Value Ratio:</strong></span>
                      <span>{formatPercentage(result.loanToValueRatio)}</span>
                    </div>
                    <div className="loan-summary-row">
                      <span><strong>Total Cost:</strong></span>
                      <span className="loan-total-cost">{formatCurrency(result.totalCost)}</span>
                    </div>
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
            The Loan Calculator is an essential financial tool that helps you understand the true cost of borrowing money. 
            Whether you're planning to buy a home, finance a car, or take out a personal loan, this calculator provides 
            comprehensive insights into your loan payments, interest costs, and overall financial commitment.
          </p>
          <p>
            Our advanced loan calculator goes beyond basic payment calculations to include down payments, monthly fees, 
            loan-to-value ratios, and total cost analysis. This gives you a complete picture of your loan before you commit, 
            helping you make informed financial decisions.
          </p>
        </ContentSection>

        <ContentSection id="what-is-loan" title="What is a Loan Calculator?">
          <p>
            A loan calculator is a financial tool that computes various aspects of a loan, including monthly payments, 
            total interest, and the overall cost of borrowing. It uses mathematical formulas to determine how much you'll 
            pay each month and over the life of the loan.
          </p>
          <ul>
            <li>
              <span><strong>Payment Calculation:</strong> Determines your monthly payment amount</span>
            </li>
            <li>
              <span><strong>Interest Analysis:</strong> Shows total interest paid over the loan term</span>
            </li>
            <li>
              <span><strong>Cost Breakdown:</strong> Breaks down all costs including fees and charges</span>
            </li>
            <li>
              <span><strong>Affordability Assessment:</strong> Helps determine if a loan fits your budget</span>
            </li>
            <li>
              <span><strong>Comparison Tool:</strong> Allows you to compare different loan options</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Loan Calculator">
          <p>Using the loan calculator is straightforward and requires just a few key pieces of information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Loan Amount:</strong> Input the total amount you want to borrow.</span>
            </li>
            <li>
              <span><strong>Set Interest Rate:</strong> Enter the annual interest rate as a percentage.</span>
            </li>
            <li>
              <span><strong>Choose Loan Term:</strong> Select how many years you want to repay the loan.</span>
            </li>
            <li>
              <span><strong>Add Down Payment:</strong> Enter any down payment to reduce the loan amount.</span>
            </li>
            <li>
              <span><strong>Include Monthly Fees:</strong> Add any additional monthly fees or charges.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Loan" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Use the calculator to experiment with different down payment amounts and loan terms 
            to find the most affordable option for your situation.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Formulas & Methods">
          <div className="formula-section">
            <h3>Monthly Payment Formula</h3>
            <div className="math-formula">
              P = L × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>P</strong> = Monthly Payment</li>
              <li><strong>L</strong> = Loan Amount</li>
              <li><strong>r</strong> = Monthly Interest Rate (Annual Rate ÷ 12)</li>
              <li><strong>n</strong> = Total Number of Payments (Years × 12)</li>
            </ul>
          </div>

          <div className="formula-section">
            <h3>Interest Calculation</h3>
            <div className="math-formula">
              Interest = Monthly Payment × Number of Payments - Principal
            </div>
            <p>This formula calculates the total interest paid over the life of the loan.</p>
          </div>

          <div className="formula-section">
            <h3>Loan-to-Value Ratio</h3>
            <div className="math-formula">
              LTV = (Loan Amount ÷ Property Value) × 100
            </div>
            <p>A lower LTV ratio typically results in better loan terms and lower interest rates.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: 30-Year Fixed Mortgage</h3>
            <div className="example-solution">
              <p><strong>Loan Amount:</strong> $250,000</p>
              <p><strong>Interest Rate:</strong> 4.5%</p>
              <p><strong>Term:</strong> 30 years</p>
              <p><strong>Down Payment:</strong> $50,000</p>
              <p><strong>Result:</strong> Monthly payment of $1,013.37</p>
              <p><strong>Total Interest:</strong> $114,813.42</p>
              <p><strong>Total Cost:</strong> $364,813.42</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: 15-Year Fixed Mortgage</h3>
            <div className="example-solution">
              <p><strong>Loan Amount:</strong> $200,000</p>
              <p><strong>Interest Rate:</strong> 3.75%</p>
              <p><strong>Term:</strong> 15 years</p>
              <p><strong>Down Payment:</strong> $40,000</p>
              <p><strong>Result:</strong> Monthly payment of $1,454.93</p>
              <p><strong>Total Interest:</strong> $61,887.40</p>
              <p><strong>Total Cost:</strong> $261,887.40</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: Auto Loan</h3>
            <div className="example-solution">
              <p><strong>Loan Amount:</strong> $25,000</p>
              <p><strong>Interest Rate:</strong> 6.5%</p>
              <p><strong>Term:</strong> 5 years</p>
              <p><strong>Down Payment:</strong> $5,000</p>
              <p><strong>Result:</strong> Monthly payment of $389.71</p>
              <p><strong>Total Interest:</strong> $3,382.60</p>
              <p><strong>Total Cost:</strong> $28,382.60</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding loan calculations is crucial for financial planning and decision-making:</p>
          <ul>
            <li>
              <span>Helps determine if a loan is affordable within your budget</span>
            </li>
            <li>
              <span>Allows comparison between different loan options and terms</span>
            </li>
            <li>
              <span>Provides transparency into the true cost of borrowing</span>
            </li>
            <li>
              <span>Helps plan for long-term financial commitments</span>
            </li>
            <li>
              <span>Essential for making informed decisions about major purchases</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Loan Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Basic Calculations:</strong> Monthly payments, total interest, and total cost</span>
            </li>
            <li>
              <span><strong>Advanced Features:</strong> Down payment analysis and loan-to-value ratios</span>
            </li>
            <li>
              <span><strong>Fee Integration:</strong> Includes monthly fees and charges in calculations</span>
            </li>
            <li>
              <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
            </li>
            <li>
              <span><strong>Real-time Results:</strong> Instant calculations as you adjust inputs</span>
            </li>
            <li>
              <span><strong>Comprehensive Output:</strong> Detailed breakdown of all loan costs</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Mortgage Planning</h4>
              <p>Calculate monthly payments and total costs for home purchases</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-car"></i> Auto Financing</h4>
              <p>Determine car loan payments and compare financing options</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Student Loans</h4>
              <p>Plan for education financing and repayment strategies</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-tools"></i> Personal Loans</h4>
              <p>Evaluate personal loan options and affordability</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Investment Analysis</h4>
              <p>Compare loan costs with potential investment returns</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Refinancing</h4>
              <p>Analyze refinancing options and potential savings</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "What is the difference between principal and interest?",
              answer: "Principal is the original loan amount you borrow, while interest is the cost of borrowing that money. Each monthly payment includes both principal (reducing your loan balance) and interest (the lender's fee)."
            },
            {
              question: "How does a down payment affect my loan?",
              answer: "A larger down payment reduces your loan amount, which typically results in lower monthly payments, less total interest, and better loan terms. It also improves your loan-to-value ratio."
            },
            {
              question: "What is a loan-to-value ratio?",
              answer: "The loan-to-value (LTV) ratio is the percentage of the property value that you're borrowing. A lower LTV ratio (like 80% or less) usually results in better interest rates and terms."
            },
            {
              question: "How do I know if I can afford a loan?",
              answer: "A general rule is that your total monthly debt payments (including the new loan) should not exceed 43% of your gross monthly income. Use our calculator to see the actual monthly payment and assess affordability."
            },
            {
              question: "What's the difference between a 15-year and 30-year mortgage?",
              answer: "A 15-year mortgage has higher monthly payments but significantly less total interest and faster equity building. A 30-year mortgage has lower monthly payments but more total interest over time."
            },
            {
              question: "Are the calculations accurate?",
              answer: "Yes, our calculator uses standard financial formulas and provides accurate results. However, actual loan terms may vary based on your credit score, lender policies, and other factors."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default LoanCalculator