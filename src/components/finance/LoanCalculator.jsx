import React, { useState, useEffect } from 'react';
import ToolPageLayout from '../tool/ToolPageLayout';
import CalculatorSection from '../tool/CalculatorSection';
import ContentSection from '../tool/ContentSection';
import FAQSection from '../tool/FAQSection';
import TableOfContents from '../tool/TableOfContents';
import FeedbackForm from '../tool/FeedbackForm';
import { LoanCalculator } from '../../assets/js/finance/loan-calculator';
import '../../assets/css/finance/loan-calculator.css';

const LoanCalculatorComponent = () => {
  const [formData, setFormData] = useState({
    principal: '100000',
    annualRate: '5.5',
    termMonths: '360',
    downPayment: '20000',
    monthlyFees: '0'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize loan calculator
  const [calculator] = useState(() => new LoanCalculator());

  // Tool data
  const toolData = {
    name: 'Loan Calculator',
    description: 'Calculate loan payments, interest, and amortization schedules. Perfect for mortgages, personal loans, auto loans, and business financing.',
    icon: 'fas fa-hand-holding-usd',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Loan Calculator']
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
    { name: 'Currency Calculator', url: '/finance/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Mortgage Calculator', url: '/finance/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'Binary Calculator', url: '/math/calculators/binary-calculator', icon: 'fas fa-1' },
    { name: 'Decimal Calculator', url: '/math/calculators/decimal-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-loan-calculation', title: 'What is Loan Calculation?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'loan-formulas', title: 'Loan Formulas' },
    { id: 'types-of-loans', title: 'Types of Loans' },
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

  // Handle loan calculation
  const calculateLoan = () => {
    try {
      const { principal, annualRate, termMonths, downPayment, monthlyFees } = formData;
      
      // Validate inputs
      const validation = calculator.validateInputs(
        parseFloat(principal),
        parseFloat(annualRate),
        parseInt(termMonths),
        parseFloat(downPayment)
      );

      if (!validation.isValid) {
        setError(validation.errors.join(' '));
        return;
      }

      // Calculate loan
      const loanResult = calculator.calculateAdvancedLoan(
        parseFloat(principal),
        parseFloat(annualRate),
        parseInt(termMonths),
        parseFloat(downPayment),
        parseFloat(monthlyFees)
      );

      setResult(loanResult);
      setError('');
    } catch (error) {
      setError(error.message);
      setResult(null);
    }
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      principal: '100000',
      annualRate: '5.5',
      termMonths: '360',
      downPayment: '20000',
      monthlyFees: '0'
    });
    setResult(null);
    setError('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return calculator.formatCurrency(amount);
  };

  // Format percentage
  const formatPercentage = (value, decimals = 2) => {
    return calculator.formatPercentage(value, decimals);
  };

  return (
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
        <div className="calculator-form">
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="principal" className="input-label">
                Loan Amount ($):
              </label>
              <input
                type="number"
                id="principal"
                name="principal"
                className="input-field"
                value={formData.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                placeholder="e.g., 100000"
                min="0"
                step="1000"
              />
            </div>

            <div className="input-group">
              <label htmlFor="annualRate" className="input-label">
                Annual Interest Rate (%):
              </label>
              <input
                type="number"
                id="annualRate"
                name="annualRate"
                className="input-field"
                value={formData.annualRate}
                onChange={(e) => handleInputChange('annualRate', e.target.value)}
                placeholder="e.g., 5.5"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="termMonths" className="input-label">
                Loan Term (months):
              </label>
              <select
                id="termMonths"
                name="termMonths"
                className="input-field"
                value={formData.termMonths}
                onChange={(e) => handleInputChange('termMonths', e.target.value)}
              >
                <option value="12">1 Year (12 months)</option>
                <option value="24">2 Years (24 months)</option>
                <option value="36">3 Years (36 months)</option>
                <option value="48">4 Years (48 months)</option>
                <option value="60">5 Years (60 months)</option>
                <option value="72">6 Years (72 months)</option>
                <option value="84">7 Years (84 months)</option>
                <option value="96">8 Years (96 months)</option>
                <option value="108">9 Years (108 months)</option>
                <option value="120">10 Years (120 months)</option>
                <option value="180">15 Years (180 months)</option>
                <option value="240">20 Years (240 months)</option>
                <option value="300">25 Years (300 months)</option>
                <option value="360">30 Years (360 months)</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="downPayment" className="input-label">
                Down Payment ($):
              </label>
              <input
                type="number"
                id="downPayment"
                name="downPayment"
                className="input-field"
                value={formData.downPayment}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                placeholder="e.g., 20000"
                min="0"
                step="1000"
              />
            </div>
          </div>

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
                <div className="input-group">
                  <label htmlFor="monthlyFees" className="input-label">
                    Monthly Fees ($):
                  </label>
                  <input
                    type="number"
                    id="monthlyFees"
                    name="monthlyFees"
                    className="input-field"
                    value={formData.monthlyFees}
                    onChange={(e) => handleInputChange('monthlyFees', e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    step="10"
                  />
                  <small className="input-help">
                    Additional monthly fees like PMI, insurance, or maintenance
                  </small>
                </div>
              </div>
            )}
          </div>

          <small className="input-help">
            Enter the loan details above. The calculator will show monthly payments, total interest, and loan breakdown.
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
          <div className="result-section loan-calculator-result">
            <h3 className="result-title">Loan Calculation Results</h3>
            <div className="result-content">
              <div className="result-main">
                <div className="result-item">
                  <strong>Monthly Payment:</strong>
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
                  <strong>Total Cost:</strong>
                  <span className="result-value">
                    {formatCurrency(result.totalCost)}
                  </span>
                </div>
              </div>

              <div className="loan-details">
                <h4>Loan Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Original Loan Amount:</strong>
                    <span>{formatCurrency(result.principal)}</span>
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
                  <div className="detail-item">
                    <strong>Monthly Fees:</strong>
                    <span>{formatCurrency(result.monthlyFees)}</span>
                  </div>
                </div>
              </div>

              <div className="payment-breakdown">
                <h4>Payment Breakdown</h4>
                <div className="breakdown-chart">
                  <div className="chart-item">
                    <div className="chart-label">Principal</div>
                    <div className="chart-bar principal-bar" style={{ width: `${(result.actualLoanAmount / result.totalCost) * 100}%` }}>
                      {formatCurrency(result.actualLoanAmount)}
                    </div>
                  </div>
                  <div className="chart-item">
                    <div className="chart-label">Interest</div>
                    <div className="chart-bar interest-bar" style={{ width: `${(result.totalInterest / result.totalCost) * 100}%` }}>
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>
                  {result.totalFeesOverTerm > 0 && (
                    <div className="chart-item">
                      <div className="chart-label">Fees</div>
                      <div className="chart-bar fees-bar" style={{ width: `${(result.totalFeesOverTerm / result.totalCost) * 100}%` }}>
                        {formatCurrency(result.totalFeesOverTerm)}
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
          A loan calculator is an essential financial tool that helps you understand the true cost of borrowing money. 
          Whether you're planning to buy a home, finance a car, or take out a personal loan, understanding your monthly 
          payments and total interest costs is crucial for making informed financial decisions.
        </p>
        <p>
          Our Loan Calculator provides comprehensive calculations including monthly payments, total interest, 
          amortization schedules, and loan affordability analysis. It supports various loan types and includes 
          advanced features like down payments and monthly fees to give you a complete picture of your loan.
        </p>
      </ContentSection>

      <ContentSection id="what-is-loan-calculation" title="What is Loan Calculation?">
        <p>
          Loan calculation involves determining the periodic payments required to pay off a loan over a specified term. 
          The calculation considers several key factors:
        </p>
        <ul>
          <li>
            <span><strong>Principal:</strong> The original amount borrowed</span>
          </li>
          <li>
            <span><strong>Interest Rate:</strong> The cost of borrowing, expressed as an annual percentage</span>
          </li>
          <li>
            <span><strong>Loan Term:</strong> The length of time to repay the loan</span>
          </li>
          <li>
            <span><strong>Payment Frequency:</strong> How often payments are made (usually monthly)</span>
          </li>
          <li>
            <span><strong>Additional Costs:</strong> Fees, insurance, and other charges</span>
          </li>
        </ul>
        <p>
          Understanding these calculations helps you compare different loan offers, plan your budget, 
          and make informed decisions about borrowing money.
        </p>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Loan Calculator">
        <p>Using our Loan Calculator is straightforward and user-friendly:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Loan Amount:</strong> Input the total amount you want to borrow</span>
          </li>
          <li>
            <span><strong>Set Interest Rate:</strong> Enter the annual interest rate as a percentage</span>
          </li>
          <li>
            <span><strong>Choose Loan Term:</strong> Select the repayment period from the dropdown</span>
          </li>
          <li>
            <span><strong>Add Down Payment:</strong> Enter any down payment to reduce the loan amount</span>
          </li>
          <li>
            <span><strong>Include Monthly Fees:</strong> Add any additional monthly costs (optional)</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click the calculate button to see detailed results</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use the advanced options to include monthly fees and get a more accurate 
          picture of your total monthly payment.
        </p>
      </ContentSection>

      <ContentSection id="loan-formulas" title="Loan Formulas">
        <p>Our calculator uses standard financial formulas to determine loan payments:</p>
        <div className="formula-section">
          <h3>Monthly Payment Formula</h3>
          <p><strong>Monthly Payment = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1]</strong></p>
          <p>Where:</p>
          <ul>
            <li><strong>P</strong> = Principal loan amount</li>
            <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
            <li><strong>n</strong> = Total number of payments</li>
          </ul>
        </div>
        <div className="formula-section">
          <h3>Interest Calculation</h3>
          <p><strong>Monthly Interest = Remaining Balance × Monthly Rate</strong></p>
          <p><strong>Principal Payment = Monthly Payment - Monthly Interest</strong></p>
        </div>
        <div className="formula-section">
          <h3>Total Cost Formula</h3>
          <p><strong>Total Cost = (Monthly Payment × Number of Payments) + Down Payment + Total Fees</strong></p>
        </div>
      </ContentSection>

      <ContentSection id="types-of-loans" title="Types of Loans">
        <p>Our calculator works with various types of loans:</p>
        <div className="loans-grid">
          <div className="loan-type">
            <h4><i className="fas fa-home"></i> Mortgage Loans</h4>
            <p>Home loans with terms typically ranging from 15 to 30 years. Includes fixed-rate and adjustable-rate mortgages.</p>
            <ul>
              <li>Fixed-rate mortgages</li>
              <li>Adjustable-rate mortgages (ARMs)</li>
              <li>FHA and VA loans</li>
              <li>Conventional loans</li>
            </ul>
          </div>
          <div className="loan-type">
            <h4><i className="fas fa-car"></i> Auto Loans</h4>
            <p>Vehicle financing with shorter terms, usually 3 to 7 years. Interest rates may be higher than mortgages.</p>
            <ul>
              <li>New car loans</li>
              <li>Used car loans</li>
              <li>Refinancing options</li>
              <li>Lease buyouts</li>
            </ul>
          </div>
          <div className="loan-type">
            <h4><i className="fas fa-credit-card"></i> Personal Loans</h4>
            <p>Unsecured loans for various purposes with terms typically 2 to 7 years and higher interest rates.</p>
            <ul>
              <li>Debt consolidation</li>
              <li>Home improvements</li>
              <li>Medical expenses</li>
              <li>Education costs</li>
            </ul>
          </div>
          <div className="loan-type">
            <h4><i className="fas fa-briefcase"></i> Business Loans</h4>
            <p>Financing for business purposes with varying terms and rates based on business credit and collateral.</p>
            <ul>
              <li>Equipment financing</li>
              <li>Working capital</li>
              <li>Commercial real estate</li>
              <li>Business expansion</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding loan calculations is crucial for several important reasons:</p>
        <ul>
          <li>
            <span><strong>Financial Planning:</strong> Helps you budget for monthly payments and plan long-term expenses</span>
          </li>
          <li>
            <span><strong>Loan Comparison:</strong> Allows you to compare different loan offers and terms</span>
          </li>
          <li>
            <span><strong>Affordability Assessment:</strong> Determines if a loan fits within your budget</span>
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
        <p>Our Loan Calculator provides comprehensive features:</p>
        <ul>
          <li>
            <span><strong>Basic Calculations:</strong> Monthly payments, total interest, and total cost</span>
          </li>
          <li>
            <span><strong>Advanced Features:</strong> Down payment calculations and monthly fee inclusion</span>
          </li>
          <li>
            <span><strong>Loan-to-Value Analysis:</strong> Shows the relationship between loan amount and property value</span>
          </li>
          <li>
            <span><strong>Payment Breakdown:</strong> Visual representation of principal, interest, and fees</span>
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
            <h4><i className="fas fa-car"></i> Vehicle Financing</h4>
            <p>Compare auto loan offers, calculate monthly payments, and plan for car purchases</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Debt Management</h4>
            <p>Analyze existing loans, plan debt consolidation, and optimize repayment strategies</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education Planning</h4>
            <p>Calculate student loan payments, plan for education costs, and budget for repayment</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business Planning</h4>
            <p>Evaluate business loan options, plan equipment financing, and assess cash flow impact</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Financial Analysis</h4>
            <p>Compare loan scenarios, analyze refinancing options, and make informed borrowing decisions</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What is the difference between principal and interest?",
            answer: "Principal is the original amount borrowed, while interest is the cost of borrowing that money. Each payment includes both principal (reducing your debt) and interest (the lender's fee)."
          },
          {
            question: "How does a down payment affect my loan?",
            answer: "A down payment reduces the amount you need to borrow, which lowers your monthly payments and total interest costs. It also improves your loan-to-value ratio, potentially qualifying you for better rates."
          },
          {
            question: "What is loan-to-value ratio?",
            answer: "Loan-to-value (LTV) ratio is the percentage of the property value that you're borrowing. A lower LTV ratio (like 80% or less) typically results in better loan terms and avoids private mortgage insurance."
          },
          {
            question: "How do I know if I can afford a loan?",
            answer: "Use the 28/36 rule: your housing payment should not exceed 28% of your gross monthly income, and total debt payments should not exceed 36%. Our calculator helps you see the actual monthly payment."
          },
          {
            question: "What's the difference between APR and interest rate?",
            answer: "The interest rate is the cost of borrowing the principal amount, while APR (Annual Percentage Rate) includes the interest rate plus other loan costs like fees and points. APR gives you the true cost of the loan."
          },
          {
            question: "Should I choose a shorter or longer loan term?",
            answer: "Shorter terms (15 years) have higher monthly payments but lower total interest costs. Longer terms (30 years) have lower monthly payments but higher total interest. Choose based on your budget and long-term financial goals."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  );
}

export default LoanCalculatorComponent;

