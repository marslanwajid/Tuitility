import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/finance/amortization-calculator.css'

const AmortizationCalculator = () => {
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '30'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Amortization Calculator',
    description: 'Generate detailed loan amortization schedules showing monthly payments, principal, interest, and remaining balance. Perfect for understanding how loans are paid off over time.',
    icon: 'fas fa-chart-line',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Amortization Calculator']
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
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Currency Calculator', url: '/finance/calculators/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-amortization', title: 'What is Amortization?' },
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
    const { loanAmount, interestRate, loanTerm } = formData;
    
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

    return true;
  };

  const calculateAmortization = () => {
    if (!validateInputs()) return;

    try {
      const { loanAmount, interestRate, loanTerm } = formData;
      
      const principal = parseFloat(loanAmount);
      const monthlyRate = parseFloat(interestRate) / 100 / 12;
      const numberOfPayments = parseInt(loanTerm) * 12;

      if (monthlyRate === 0) {
        // Handle 0% interest rate
        const monthlyPayment = principal / numberOfPayments;
        const schedule = [];
        let balance = principal;
        
        for (let month = 1; month <= numberOfPayments; month++) {
          const principalPayment = monthlyPayment;
          balance -= principalPayment;
          
          schedule.push({
            month,
            payment: principalPayment,
            principal: principalPayment,
            interest: 0,
            balance: Math.max(0, balance)
          });
          
          if (balance <= 0) break;
        }
        
        const totalInterest = 0;
        const totalAmount = monthlyPayment * schedule.length;
        
        setResult({
          monthlyPayment,
          totalInterest,
          totalAmount,
          schedule,
          principal,
          numberOfPayments
        });
      } else {
        // Standard amortization calculation
        const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                              (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        let balance = principal;
        let totalInterest = 0;
        let schedule = [];

        for (let month = 1; month <= numberOfPayments; month++) {
          const interest = balance * monthlyRate;
          let principalPayment = monthlyPayment - interest;
          
          if (principalPayment > balance) {
            principalPayment = balance;
          }

          balance -= principalPayment;
          totalInterest += interest;

          schedule.push({
            month,
            payment: principalPayment + interest,
            principal: principalPayment,
            interest,
            balance: Math.max(0, balance)
          });

          if (balance <= 0) break;
        }

        const totalAmount = monthlyPayment * schedule.length;
        
        setResult({
          monthlyPayment,
          totalInterest,
          totalAmount,
          schedule,
          principal,
          numberOfPayments
        });
      }
      
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      loanAmount: '',
      interestRate: '',
      loanTerm: '30'
    });
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
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Amortization Calculator"
        onCalculate={calculateAmortization}
        calculateButtonText="Calculate Amortization"
        error={error}
        result={null}
      >
        <div className="amortization-calculator-form">
          <div className="amortization-input-row">
            <div className="amortization-input-group">
              <label htmlFor="amortization-loan-amount" className="amortization-input-label">
                Loan Amount ($):
              </label>
              <input
                type="number"
                id="amortization-loan-amount"
                className="amortization-input-field"
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="e.g., 300000"
                min="0"
                step="1000"
              />
              <small className="amortization-input-help">
                Total amount you want to borrow
              </small>
            </div>

            <div className="amortization-input-group">
              <label htmlFor="amortization-interest-rate" className="amortization-input-label">
                Interest Rate (%):
              </label>
              <input
                type="number"
                id="amortization-interest-rate"
                className="amortization-input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 4.5"
                min="0"
                max="20"
                step="0.1"
              />
              <small className="amortization-input-help">
                Annual interest rate
              </small>
            </div>
          </div>

          <div className="amortization-input-row">
            <div className="amortization-input-group">
              <label htmlFor="amortization-loan-term" className="amortization-input-label">
                Loan Term (Years):
              </label>
              <select
                id="amortization-loan-term"
                className="amortization-input-field"
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
          </div>

          <div className="amortization-calculator-actions">
            <button type="button" className="amortization-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="amortization-calculator-result">
            <h3 className="amortization-result-title">Amortization Schedule Results</h3>
            <div className="amortization-result-content">
              <div className="amortization-result-main">
                <div className="amortization-result-item">
                  <strong>Monthly Payment:</strong>
                  <span className="amortization-result-value amortization-result-final">
                    {formatCurrency(result.monthlyPayment)}
                  </span>
                </div>
                <div className="amortization-result-item">
                  <strong>Total Interest:</strong>
                  <span className="amortization-result-value">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="amortization-result-item">
                  <strong>Total Amount:</strong>
                  <span className="amortization-result-value">
                    {formatCurrency(result.totalAmount)}
                  </span>
                </div>
                <div className="amortization-result-item">
                  <strong>Principal Amount:</strong>
                  <span className="amortization-result-value">
                    {formatCurrency(result.principal)}
                  </span>
                </div>
                <div className="amortization-result-item">
                  <strong>Number of Payments:</strong>
                  <span className="amortization-result-value">
                    {result.numberOfPayments}
                  </span>
                </div>
              </div>

              {/* Amortization Table */}
              <div className="amortization-table-container">
                <h4 className="amortization-table-title">Amortization Schedule</h4>
                <div className="amortization-table-wrapper">
                  <table className="amortization-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Payment</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.slice(0, 12).map((row) => (
                        <tr key={row.month}>
                          <td>{row.month}</td>
                          <td>{formatCurrency(row.payment)}</td>
                          <td>{formatCurrency(row.principal)}</td>
                          <td>{formatCurrency(row.interest)}</td>
                          <td>{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.schedule.length > 12 && (
                  <div className="amortization-table-note">
                    <p>Showing first 12 months. Total schedule has {result.schedule.length} payments.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CalculatorSection>

      {/* TOC and Feedback Section */}
      <div className="tool-bottom-section">
        <TableOfContents items={tableOfContents} />
        <FeedbackForm toolName={toolData.name} />
      </div>

      {/* Content Sections */}
      <ContentSection id="introduction" title="Introduction">
        <p>
          The Amortization Calculator is a powerful financial tool that shows you exactly how your loan payments 
          are structured over time. It breaks down each monthly payment into principal and interest components, 
          helping you understand how much of your payment goes toward reducing the loan balance versus paying interest.
        </p>
        <p>
          Whether you're planning to take out a mortgage, auto loan, or personal loan, understanding the amortization 
          schedule helps you make informed decisions about loan terms, refinancing opportunities, and overall financial planning.
        </p>
      </ContentSection>

      <ContentSection id="what-is-amortization" title="What is Amortization?">
        <p>
          Amortization is the process of paying off a loan over time through regular payments. Each payment consists 
          of two parts: principal (the original loan amount) and interest (the cost of borrowing money).
        </p>
        <ul>
          <li>
            <span><strong>Principal:</strong> The portion of your payment that reduces the loan balance</span>
          </li>
          <li>
            <span><strong>Interest:</strong> The portion that goes to the lender as profit</span>
          </li>
          <li>
            <span><strong>Early Payments:</strong> Mostly interest, very little principal reduction</span>
          </li>
          <li>
            <span><strong>Later Payments:</strong> Mostly principal, very little interest</span>
          </li>
          <li>
            <span><strong>Total Cost:</strong> The sum of all payments over the loan term</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Amortization Calculator">
        <p>Using the amortization calculator is simple and requires just three key pieces of information:</p>
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
            <span><strong>Calculate:</strong> Click "Calculate Amortization" to see your detailed schedule.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> The calculator shows the first 12 months of your amortization schedule. 
          Use this to understand how your payments are structured early in the loan term.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>Monthly Payment Formula</h3>
          <div className="math-formula">
            {'M = P \\times \\frac{r(1 + r)^n}{(1 + r)^n - 1}'}
          </div>
          <p>Where:</p>
          <ul>
            <li><strong>M</strong> = Monthly payment</li>
            <li><strong>P</strong> = Principal loan amount</li>
            <li><strong>r</strong> = Monthly interest rate (Annual rate ÷ 12)</li>
            <li><strong>n</strong> = Total number of payments (Years × 12)</li>
          </ul>
        </div>

        <div className="formula-section">
          <h3>Interest Calculation</h3>
          <div className="math-formula">
            {'\\text{Interest} = \\text{Remaining Balance} \\times \\text{Monthly Interest Rate}'}
          </div>
          <p>Interest is calculated on the remaining loan balance each month.</p>
        </div>

        <div className="formula-section">
          <h3>Principal Calculation</h3>
          <div className="math-formula">
            {'\\text{Principal} = \\text{Monthly Payment} - \\text{Interest}'}
          </div>
          <p>Principal is what remains after paying the interest portion.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: 30-Year Fixed Mortgage</h3>
          <div className="example-solution">
            <p><strong>Loan Amount:</strong> $300,000</p>
            <p><strong>Interest Rate:</strong> 4.5%</p>
            <p><strong>Term:</strong> 30 years</p>
            <p><strong>Monthly Payment:</strong> $1,520.06</p>
            <p><strong>Month 1:</strong> Principal: $455.06, Interest: $1,065.00</p>
            <p><strong>Month 360:</strong> Principal: $1,513.56, Interest: $6.50</p>
            <p><strong>Total Interest:</strong> $247,220.80</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: 15-Year Auto Loan</h3>
          <div className="example-solution">
            <p><strong>Loan Amount:</strong> $25,000</p>
            <p><strong>Interest Rate:</strong> 6.0%</p>
            <p><strong>Term:</strong> 5 years</p>
            <p><strong>Monthly Payment:</strong> $483.32</p>
            <p><strong>Month 1:</strong> Principal: $358.32, Interest: $125.00</p>
            <p><strong>Month 60:</strong> Principal: $480.32, Interest: $3.00</p>
            <p><strong>Total Interest:</strong> $3,999.20</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding amortization is crucial for financial planning and loan management:</p>
        <ul>
          <li>
            <span>Helps you see the true cost of borrowing over time</span>
          </li>
          <li>
            <span>Shows how much equity you build in your home or asset</span>
          </li>
          <li>
            <span>Helps determine if refinancing makes financial sense</span>
          </li>
          <li>
            <span>Provides insight into early payoff strategies</span>
          </li>
          <li>
            <span>Essential for comparing different loan options</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Amortization Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Monthly Payment Calculation:</strong> Determines your fixed monthly payment</span>
          </li>
          <li>
            <span><strong>Detailed Schedule:</strong> Shows month-by-month breakdown of payments</span>
          </li>
          <li>
            <span><strong>Principal vs Interest:</strong> Clear separation of payment components</span>
          </li>
          <li>
            <span><strong>Balance Tracking:</strong> Shows remaining loan balance after each payment</span>
          </li>
          <li>
            <span><strong>Total Cost Analysis:</strong> Calculates total interest and total amount paid</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Mortgage Planning</h4>
            <p>Understand how your home loan payments are structured over time</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-car"></i> Auto Loans</h4>
            <p>Plan car financing and understand total borrowing costs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Student Loans</h4>
            <p>Plan repayment strategies for educational debt</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Refinancing Analysis</h4>
            <p>Compare current loan terms with refinancing options</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Early Payoff Planning</h4>
            <p>Calculate savings from making extra payments</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Financial Education</h4>
            <p>Learn how loans work and build financial literacy</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "Why do early payments have more interest than principal?",
            answer: "Early in the loan, you owe the most money, so interest charges are highest. As you pay down the principal, the interest portion decreases because it's calculated on the remaining balance."
          },
          {
            question: "Can I pay off my loan early?",
            answer: "Yes! Making extra payments reduces the principal faster, which means less interest over time. Check with your lender about any prepayment penalties."
          },
          {
            question: "What's the difference between simple and compound interest?",
            "answer": "Simple interest is calculated only on the principal amount. Compound interest (like in loans) is calculated on the principal plus any accumulated interest, which is why loan costs can be higher than expected."
          },
          {
            question: "How does a shorter loan term affect my payments?",
            answer: "Shorter terms mean higher monthly payments but significantly less total interest. You pay more each month but less overall."
          },
          {
            question: "What is negative amortization?",
            answer: "Negative amortization occurs when your monthly payment is less than the interest due, causing your loan balance to increase rather than decrease. This can happen with certain adjustable-rate mortgages."
          },
          {
            question: "How can I reduce my total interest costs?",
            answer: "Make extra payments, choose a shorter loan term, negotiate a lower interest rate, or refinance when rates drop. Even small extra payments can save thousands in interest."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default AmortizationCalculator
