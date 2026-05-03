import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import DownPaymentCalculatorJS from '../../assets/js/finance/down-payment-calculator.js'
import '../../assets/css/finance/down-payment-calculator.css'

const DownPaymentCalculator = () => {
  const [formData, setFormData] = useState({
    homePrice: '',
    downPaymentPercent: '20',
    interestRate: '6',
    loanTerm: '30'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const downPaymentCalc = new DownPaymentCalculatorJS();
      setCalculator(downPaymentCalc);
    } catch (error) {
      console.error('Error initializing down payment calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Down Payment Calculator',
    description: 'Calculate down payment amount, loan amount, and monthly mortgage payments. Plan your home purchase with accurate financial projections.',
    icon: 'fas fa-home',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Down Payment Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, mortgage, home loan, pmi`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/down-payment-calculator`;
  const faqs = [
    {
      question: "What's the minimum down payment required?",
      answer: "The minimum depends on the loan program. Some conventional, FHA, VA, and USDA options allow much less than 20 percent, but lower down payments can change cost and qualification requirements."
    },
    {
      question: "Should I make a larger down payment?",
      answer: "A larger down payment often lowers the loan amount, monthly payment, and lifetime interest cost, but you should also preserve emergency savings and closing-cost cash."
    },
    {
      question: "What is private mortgage insurance (PMI)?",
      answer: "PMI is lender protection that is often required on conventional loans with smaller down payments. It adds to monthly housing cost until enough equity is built."
    },
    {
      question: "Can I use gift money for my down payment?",
      answer: "Many programs allow gift funds from approved sources, but lenders usually require documentation that shows where the money came from."
    },
    {
      question: "How does my down payment affect my interest rate?",
      answer: "A stronger down payment can reduce lender risk and sometimes improve pricing, though the impact depends on your full loan profile."
    },
    {
      question: "What's the difference between down payment and closing costs?",
      answer: "The down payment reduces the purchase price financed by the lender, while closing costs are separate transaction expenses paid to complete the purchase."
    }
  ];

  // Categories for sidebar
  const categories = [
    { name: 'Math', url: '/math', icon: 'fas fa-calculator' },
    { name: 'Finance', url: '/finance', icon: 'fas fa-dollar-sign' },
    { name: 'Health', url: '/health', icon: 'fas fa-heartbeat' },
    { name: 'Science', url: '/science', icon: 'fas fa-flask' },
    { name: 'Utility', url: '/utility-tools', icon: 'fas fa-wrench' },
    { name: 'Knowledge', url: '/knowledge', icon: 'fas fa-book' }
  ];

  // Related tools for sidebar
  const relatedTools = [
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'House Affordability Calculator', url: '/finance/calculators/house-affordability-calculator', icon: 'fas fa-home' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Debt Income Calculator', url: '/finance/calculators/debt-income-calculator', icon: 'fas fa-balance-scale' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-down-payment', title: 'What is a Down Payment?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Down Payment Formulas & Calculations' },
    { id: 'examples', title: 'Examples' },
    { id: 'down-payment-options', title: 'Down Payment Options & Strategies' },
    { id: 'significance', title: 'Significance' },
    { id: 'functionality', title: 'Functionality' },
    { id: 'applications', title: 'Applications' },
    { id: 'next-steps', title: 'Related Calculators and Next Steps' },
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
        formData.homePrice,
        formData.downPaymentPercent,
        formData.interestRate,
        formData.loanTerm
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

  const calculateDownPayment = () => {
    if (!validateInputs()) return;

    try {
      const {
        homePrice,
        downPaymentPercent,
        interestRate,
        loanTerm
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateDownPayment(
        parseFloat(homePrice),
        parseFloat(downPaymentPercent),
        parseFloat(interestRate),
        parseFloat(loanTerm)
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
      homePrice: '',
      downPaymentPercent: '20',
      interestRate: '6',
      loanTerm: '30'
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
      <ToolPageLayout 
        toolData={{
          ...toolData,
          seoTitle,
          seoDescription,
          seoKeywords,
          canonicalUrl,
          schemaData: [
            {
              '@context': 'https://schema.org',
              '@type': 'FinancialProduct',
              name: toolData.name,
              url: canonicalUrl,
              description: seoDescription,
              category: toolData.name
            },
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: toolData.name,
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Any',
              browserRequirements: 'Requires JavaScript and a modern browser',
              url: canonicalUrl,
              description: seoDescription
            },
            {
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'How to use the down payment calculator',
              step: [
                { '@type': 'HowToStep', text: 'Enter the home price and your target down payment percentage.' },
                { '@type': 'HowToStep', text: 'Add the interest rate and loan term you want to test.' },
                { '@type': 'HowToStep', text: 'Review the down payment amount, loan amount, and monthly payment.' },
                { '@type': 'HowToStep', text: 'Use related home-buying calculators to compare affordability, DTI, and mortgage structure.' }
              ]
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer
                }
              }))
            }
          ]
        }} 
        tableOfContents={tableOfContents}
        categories={categories}
        relatedTools={relatedTools}
      >
        <CalculatorSection 
          title="Down Payment Calculator"
          onCalculate={calculateDownPayment}
          calculateButtonText="Calculate Down Payment"
          error={error}
          result={null}
        >
          <div className="down-payment-calculator-form">
            <div className="down-payment-input-row">
              <div className="down-payment-input-group">
                <label htmlFor="down-payment-home-price" className="down-payment-input-label">
                  Home Price ($):
                </label>
                <input
                  type="number"
                  id="down-payment-home-price"
                  className="down-payment-input-field"
                  value={formData.homePrice}
                  onChange={(e) => handleInputChange('homePrice', e.target.value)}
                  placeholder="e.g., 400000"
                  min="0"
                  step="1000"
                />
                <small className="down-payment-input-help">
                  Total purchase price of the home
                </small>
              </div>

              <div className="down-payment-input-group">
                <label htmlFor="down-payment-percent" className="down-payment-input-label">
                  Down Payment (%):
                </label>
                <input
                  type="number"
                  id="down-payment-percent"
                  className="down-payment-input-field"
                  value={formData.downPaymentPercent}
                  onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
                  placeholder="e.g., 20"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <small className="down-payment-input-help">
                  Down payment percentage
                </small>
              </div>
            </div>

            <div className="down-payment-input-row">
              <div className="down-payment-input-group">
                <label htmlFor="down-payment-interest-rate" className="down-payment-input-label">
                  Interest Rate (%):
                </label>
                <input
                  type="number"
                  id="down-payment-interest-rate"
                  className="down-payment-input-field"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  placeholder="e.g., 6"
                  min="0"
                  max="30"
                  step="0.1"
                />
                <small className="down-payment-input-help">
                  Annual interest rate
                </small>
              </div>

              <div className="down-payment-input-group">
                <label htmlFor="down-payment-loan-term" className="down-payment-input-label">
                  Loan Term (years):
                </label>
                <input
                  type="number"
                  id="down-payment-loan-term"
                  className="down-payment-input-field"
                  value={formData.loanTerm}
                  onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="50"
                  step="1"
                />
                <small className="down-payment-input-help">
                  Loan term in years
                </small>
              </div>
            </div>

            <div className="down-payment-calculator-actions">
              <button type="button" className="down-payment-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="down-payment-calculator-result">
              <h3 className="down-payment-result-title">Down Payment Calculator Results</h3>
              <div className="down-payment-result-content">
                <div className="down-payment-result-main">
                  <div className="down-payment-result-item">
                    <strong>Down Payment:</strong>
                    <span className="down-payment-result-value">
                      {formatCurrency(result.downPaymentAmount)}
                    </span>
                  </div>
                  <div className="down-payment-result-item">
                    <strong>Loan Amount:</strong>
                    <span className="down-payment-result-value">
                      {formatCurrency(result.loanAmount)}
                    </span>
                  </div>
                  <div className="down-payment-result-item">
                    <strong>Monthly Payment:</strong>
                    <span className="down-payment-result-value">
                      {formatCurrency(result.monthlyPayment)}
                    </span>
                  </div>
                </div>

                <div className="down-payment-result-breakdown">
                  <h4>Loan Details</h4>
                  <div className="down-payment-breakdown-details">
                    <div className="down-payment-breakdown-item">
                      <span>Total Interest:</span>
                      <span>{formatCurrency(result.totalInterest)}</span>
                    </div>
                    <div className="down-payment-breakdown-item">
                      <span>Total Cost:</span>
                      <span>{formatCurrency(result.totalCost)}</span>
                    </div>
                    <div className="down-payment-breakdown-item">
                      <span>Interest Rate:</span>
                      <span>{formatPercentage(result.interestRate)}</span>
                    </div>
                    <div className="down-payment-breakdown-item">
                      <span>Loan Term:</span>
                      <span>{result.loanTerm} years</span>
                    </div>
                  </div>
                </div>

                <div className="down-payment-result-summary">
                  <h4>Payment Summary</h4>
                  <div className="down-payment-summary-details">
                    <div className="down-payment-summary-item">
                      <span>Down Payment Percentage:</span>
                      <span>{formatPercentage(result.downPaymentPercent)}</span>
                    </div>
                    <div className="down-payment-summary-item">
                      <span>Loan-to-Value Ratio:</span>
                      <span>{formatPercentage(result.loanToValueRatio)}</span>
                    </div>
                    <div className="down-payment-summary-item">
                      <span>Total Payments:</span>
                      <span>{result.totalPayments} payments</span>
                    </div>
                    <div className="down-payment-summary-item">
                      <span>Monthly Principal & Interest:</span>
                      <span>{formatCurrency(result.monthlyPayment)}</span>
                    </div>
                  </div>
                </div>

                <div className="down-payment-result-tip">
                  <i className="fas fa-lightbulb"></i>
                  <span>💡 Tip: A larger down payment reduces your monthly payment and total interest paid over the life of the loan!</span>
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
            The Down Payment Calculator is an essential tool for homebuyers to understand the financial 
            implications of their down payment decision. By calculating the down payment amount, loan amount, 
            and monthly mortgage payments, you can make informed decisions about your home purchase.
          </p>
          <p>
            This calculator helps you plan your budget, compare different down payment scenarios, and 
            understand how your down payment affects your monthly payments and total loan cost.
          </p>
        </ContentSection>

        <ContentSection id="what-is-down-payment" title="What is a Down Payment?">
          <p>
            A down payment is the initial payment made when purchasing a home, representing a percentage 
            of the total home price. It's paid upfront and reduces the amount you need to borrow from a lender.
          </p>
          <ul>
            <li>
              <span><strong>Purpose:</strong> Reduces the lender's risk and demonstrates your financial commitment</span>
            </li>
            <li>
              <span><strong>Amount:</strong> Typically 3-20% of the home price, depending on loan type</span>
            </li>
            <li>
              <span><strong>Benefits:</strong> Lower monthly payments, reduced interest, and better loan terms</span>
            </li>
            <li>
              <span><strong>Sources:</strong> Personal savings, gifts, grants, or assistance programs</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Down Payment Calculator">
          <p>Using the down payment calculator is straightforward and requires basic home purchase information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Home Price:</strong> Input the total purchase price of the home you're considering.</span>
            </li>
            <li>
              <span><strong>Set Down Payment Percentage:</strong> Choose your desired down payment percentage (typically 3-20%).</span>
            </li>
            <li>
              <span><strong>Enter Interest Rate:</strong> Input the current mortgage interest rate you expect to receive.</span>
            </li>
            <li>
              <span><strong>Select Loan Term:</strong> Choose your preferred loan term (typically 15, 20, or 30 years).</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Down Payment" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Try different down payment percentages to see how they affect your 
            monthly payment and total interest paid over the life of the loan.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Down Payment Formulas & Calculations">
          <div className="formula-section">
            <h3>Down Payment Amount</h3>
            <div className="math-formula">
              Down Payment = Home Price × (Down Payment Percentage ÷ 100)
            </div>
            <p>This calculates the actual dollar amount of your down payment.</p>
          </div>

          <div className="formula-section">
            <h3>Loan Amount</h3>
            <div className="math-formula">
              Loan Amount = Home Price - Down Payment
            </div>
            <p>This determines how much you need to borrow from the lender.</p>
          </div>

          <div className="formula-section">
            <h3>Monthly Mortgage Payment</h3>
            <div className="math-formula">
              M = P × [r(1+r)^n] ÷ [(1+r)^n - 1]
            </div>
            <p>Where M = Monthly payment, P = Loan amount, r = Monthly interest rate, n = Total number of payments.</p>
          </div>

          <div className="formula-section">
            <h3>Loan-to-Value Ratio</h3>
            <div className="math-formula">
              LTV = (Loan Amount ÷ Home Price) × 100
            </div>
            <p>This ratio affects your loan terms and whether you need private mortgage insurance.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: 20% Down Payment</h3>
            <div className="example-solution">
              <p><strong>Home Price:</strong> $400,000</p>
              <p><strong>Down Payment (20%):</strong> $80,000</p>
              <p><strong>Loan Amount:</strong> $320,000</p>
              <p><strong>Monthly Payment (6%, 30 years):</strong> $1,918</p>
              <p><strong>Total Interest:</strong> $370,480</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: 10% Down Payment</h3>
            <div className="example-solution">
              <p><strong>Home Price:</strong> $400,000</p>
              <p><strong>Down Payment (10%):</strong> $40,000</p>
              <p><strong>Loan Amount:</strong> $360,000</p>
              <p><strong>Monthly Payment (6%, 30 years):</strong> $2,158</p>
              <p><strong>Total Interest:</strong> $416,790</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: 5% Down Payment</h3>
            <div className="example-solution">
              <p><strong>Home Price:</strong> $400,000</p>
              <p><strong>Down Payment (5%):</strong> $20,000</p>
              <p><strong>Loan Amount:</strong> $380,000</p>
              <p><strong>Monthly Payment (6%, 30 years):</strong> $2,278</p>
              <p><strong>Total Interest:</strong> $440,080</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="down-payment-options" title="Down Payment Options & Strategies">
          <div className="down-payment-options-grid">
            <div className="down-payment-option-item">
              <h4><i className="fas fa-percentage"></i> Conventional Loans</h4>
              <p>Typically require 5-20% down payment. Higher down payments often result in better interest rates and no PMI.</p>
            </div>
            <div className="down-payment-option-item">
              <h4><i className="fas fa-home"></i> FHA Loans</h4>
              <p>Allow down payments as low as 3.5% for qualified borrowers with lower credit scores.</p>
            </div>
            <div className="down-payment-option-item">
              <h4><i className="fas fa-university"></i> VA Loans</h4>
              <p>Available to eligible veterans with no down payment required and no PMI.</p>
            </div>
            <div className="down-payment-option-item">
              <h4><i className="fas fa-seedling"></i> USDA Loans</h4>
              <p>Rural development loans with no down payment required for eligible properties and borrowers.</p>
            </div>
            <div className="down-payment-option-item">
              <h4><i className="fas fa-gift"></i> Down Payment Assistance</h4>
              <p>Various programs offer grants, loans, or tax credits to help with down payment and closing costs.</p>
            </div>
            <div className="down-payment-option-item">
              <h4><i className="fas fa-piggy-bank"></i> Savings Strategies</h4>
              <p>Build your down payment through dedicated savings accounts, automatic transfers, and budget adjustments.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding down payment calculations is crucial for several reasons:</p>
          <ul>
            <li>
              <span>Helps you determine how much you need to save before buying a home</span>
            </li>
            <li>
              <span>Shows the impact of different down payment amounts on monthly payments</span>
            </li>
            <li>
              <span>Helps you compare loan options and choose the best strategy</span>
            </li>
            <li>
              <span>Essential for budgeting and financial planning</span>
            </li>
            <li>
              <span>Helps you understand the total cost of homeownership</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Down Payment Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Down Payment Calculation:</strong> Calculates exact down payment amount based on percentage</span>
            </li>
            <li>
              <span><strong>Loan Amount Calculation:</strong> Determines the amount you need to borrow</span>
            </li>
            <li>
              <span><strong>Monthly Payment Calculation:</strong> Calculates principal and interest payments</span>
            </li>
            <li>
              <span><strong>Total Cost Analysis:</strong> Shows total interest and total cost over loan term</span>
            </li>
            <li>
              <span><strong>Loan-to-Value Ratio:</strong> Calculates LTV ratio for loan qualification</span>
            </li>
            <li>
              <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Home Purchase Planning</h4>
              <p>Plan your home purchase budget and determine required savings</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Loan Comparison</h4>
              <p>Compare different down payment scenarios and loan terms</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-piggy-bank"></i> Savings Planning</h4>
              <p>Set savings goals based on your target down payment amount</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-calculator"></i> Affordability Analysis</h4>
              <p>Determine what home price you can afford with your available down payment</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-handshake"></i> Loan Pre-approval</h4>
              <p>Prepare for loan pre-approval with accurate financial projections</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Financial Planning</h4>
              <p>Integrate home purchase into your overall financial plan</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="next-steps" title="Related Calculators and Next Steps">
          <p>
            Down payment planning is one part of the larger home financing decision. The amount you put down
            affects loan size, affordability, cash reserves, and often the long-term interest bill.
          </p>
          <ul>
            <li><a href="/finance/calculators/house-affordability-calculator">House Affordability Calculator</a> helps test whether the target home price fits your income and debt profile.</li>
            <li><a href="/finance/calculators/mortgage-calculator">Mortgage Calculator</a> helps convert the financed balance into a fuller monthly housing payment estimate.</li>
            <li><a href="/finance/calculators/amortization-calculator">Amortization Calculator</a> shows how the smaller or larger loan balance changes principal and interest over time.</li>
            <li><a href="/finance/calculators/debt-income-calculator">Debt Income Calculator</a> helps you see whether the resulting payment fits comfortably inside lender and budget limits.</li>
            <li><a href="/finance/calculators/budget-calculator">Budget Calculator</a> is useful when you want to balance saving for a down payment with other monthly priorities.</li>
          </ul>
        </ContentSection>


        <FAQSection 
          faqs={faqs}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
  )
}

export default DownPaymentCalculator
