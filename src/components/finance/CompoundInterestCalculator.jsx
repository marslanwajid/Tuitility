import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/finance/compound-interest-calculator.css'

const CompoundInterestCalculator = () => {
  const [formData, setFormData] = useState({
    principal: '',
    interestRate: '',
    time: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    compoundFrequency: 'monthly'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Tool data
  const toolData = {
    name: 'Compound Interest Calculator',
    description: 'Calculate compound interest growth on investments with regular contributions. See how your money grows over time with different compounding frequencies and contribution schedules.',
    icon: 'fas fa-chart-area',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Compound Interest Calculator']
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
    { name: 'House Affordability Calculator', url: '/finance/calculators/house-affordability-calculator', icon: 'fas fa-home' },
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' },
    { name: 'Amortization Calculator', url: '/finance/calculators/amortization-calculator', icon: 'fas fa-chart-line' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-compound-interest', title: 'What is Compound Interest?' },
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
    const { principal, interestRate, time, contributionAmount } = formData;
    
    if (!principal || parseFloat(principal) <= 0) {
      setError('Please enter a valid initial investment amount.');
      return false;
    }

    if (!interestRate || parseFloat(interestRate) < 0) {
      setError('Please enter a valid interest rate.');
      return false;
    }

    if (!time || parseFloat(time) <= 0 || parseFloat(time) > 50) {
      setError('Please enter a valid time period (1-50 years).');
      return false;
    }

    if (contributionAmount && parseFloat(contributionAmount) < 0) {
      setError('Contribution amount cannot be negative.');
      return false;
    }

    return true;
  };

  const getCompoundFrequency = (frequency) => {
    switch (frequency) {
      case 'daily': return 365;
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'annually': return 1;
      default: return 12;
    }
  };

  const getContributionFrequency = (frequency) => {
    switch (frequency) {
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'annually': return 1;
      default: return 12;
    }
  };

  const calculateCompoundInterest = () => {
    if (!validateInputs()) return;

    try {
      const { 
        principal, 
        interestRate, 
        time, 
        contributionAmount, 
        contributionFrequency, 
        compoundFrequency 
      } = formData;
      
      const principalAmount = parseFloat(principal);
      const rate = parseFloat(interestRate) / 100;
      const timePeriod = parseFloat(time);
      const contributionAmountValue = parseFloat(contributionAmount) || 0;
      
      let n = getCompoundFrequency(compoundFrequency);
      let contributionsPerYear = getContributionFrequency(contributionFrequency);
      
      // Calculate year-by-year breakdown
      let yearlyBreakdown = [];
      let currentBalance = principalAmount;
      let totalContributions = 0;
      let totalInterest = 0;
      
      for (let year = 1; year <= timePeriod; year++) {
        let startingBalance = currentBalance;
        let yearlyContributions = contributionAmountValue * contributionsPerYear;
        let yearlyInterest = 0;
        
        // Calculate monthly compound interest
        for (let month = 1; month <= 12; month++) {
          // Add monthly contribution if applicable
          if (contributionFrequency === 'monthly' && contributionAmountValue > 0) {
            currentBalance += contributionAmountValue;
            totalContributions += contributionAmountValue;
          }
          
          // Calculate interest for this month
          let monthlyInterest = (currentBalance * rate) / n;
          currentBalance += monthlyInterest;
          yearlyInterest += monthlyInterest;
          totalInterest += monthlyInterest;
        }
        
        // Add quarterly contributions
        if (contributionFrequency === 'quarterly' && contributionAmountValue > 0) {
          currentBalance += yearlyContributions;
          totalContributions += yearlyContributions;
          // Recalculate interest for contributions added during the year
          let additionalInterest = (yearlyContributions * rate) / 2; // Average interest for mid-year contributions
          currentBalance += additionalInterest;
          yearlyInterest += additionalInterest;
          totalInterest += additionalInterest;
        }
        
        // Add annual contributions
        if (contributionFrequency === 'annually' && contributionAmountValue > 0) {
          currentBalance += yearlyContributions;
          totalContributions += yearlyContributions;
        }
        
        yearlyBreakdown.push({
          year: year,
          startingBalance: startingBalance,
          contributions: yearlyContributions,
          interest: yearlyInterest,
          endingBalance: currentBalance
        });
      }
      
      const futureValue = currentBalance;
      const totalInvested = principalAmount + totalContributions;

      setResult({
        futureValue,
        totalInterest,
        totalInvested,
        yearlyBreakdown,
        principal: principalAmount,
        rate: rate * 100,
        time: timePeriod
      });
      
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('An error occurred during calculation. Please check your inputs and try again.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFormData({
      principal: '',
      interestRate: '',
      time: '',
      contributionAmount: '',
      contributionFrequency: 'monthly',
      compoundFrequency: 'monthly'
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
        title="Compound Interest Calculator"
        onCalculate={calculateCompoundInterest}
        calculateButtonText="Calculate Compound Interest"
        error={error}
        result={null}
      >
        <div className="compound-interest-calculator-form">
          <div className="compound-interest-input-row">
            <div className="compound-interest-input-group">
              <label htmlFor="compound-interest-principal" className="compound-interest-input-label">
                Initial Investment ($):
              </label>
              <input
                type="number"
                id="compound-interest-principal"
                className="compound-interest-input-field"
                value={formData.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                placeholder="e.g., 10000"
                min="0"
                step="1000"
              />
              <small className="compound-interest-input-help">
                Starting amount you want to invest
              </small>
            </div>

            <div className="compound-interest-input-group">
              <label htmlFor="compound-interest-interest-rate" className="compound-interest-input-label">
                Annual Interest Rate (%):
              </label>
              <input
                type="number"
                id="compound-interest-interest-rate"
                className="compound-interest-input-field"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="e.g., 7.5"
                min="0"
                max="100"
                step="0.1"
              />
              <small className="compound-interest-input-help">
                Expected annual return rate
              </small>
            </div>
          </div>

          <div className="compound-interest-input-row">
            <div className="compound-interest-input-group">
              <label htmlFor="compound-interest-time" className="compound-interest-input-label">
                Time Period (Years):
              </label>
              <input
                type="number"
                id="compound-interest-time"
                className="compound-interest-input-field"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                placeholder="e.g., 20"
                min="1"
                max="50"
                step="1"
              />
              <small className="compound-interest-input-help">
                How long you plan to invest (1-50 years)
              </small>
            </div>

            <div className="compound-interest-input-group">
              <label htmlFor="compound-interest-contribution-amount" className="compound-interest-input-label">
                Regular Contribution ($):
              </label>
              <input
                type="number"
                id="compound-interest-contribution-amount"
                className="compound-interest-input-field"
                value={formData.contributionAmount}
                onChange={(e) => handleInputChange('contributionAmount', e.target.value)}
                placeholder="e.g., 500"
                min="0"
                step="100"
              />
              <small className="compound-interest-input-help">
                Optional: Amount you'll add regularly
              </small>
            </div>
          </div>

          <div className="compound-interest-input-row">
            <div className="compound-interest-input-group">
              <label htmlFor="compound-interest-contribution-frequency" className="compound-interest-input-label">
                Contribution Frequency:
              </label>
              <select
                id="compound-interest-contribution-frequency"
                className="compound-interest-input-field"
                value={formData.contributionFrequency}
                onChange={(e) => handleInputChange('contributionFrequency', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div className="compound-interest-input-group">
              <label htmlFor="compound-interest-compound-frequency" className="compound-interest-input-label">
                Compound Frequency:
              </label>
              <select
                id="compound-interest-compound-frequency"
                className="compound-interest-input-field"
                value={formData.compoundFrequency}
                onChange={(e) => handleInputChange('compoundFrequency', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          <div className="compound-interest-calculator-actions">
            <button type="button" className="compound-interest-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="compound-interest-calculator-result">
            <h3 className="compound-interest-result-title">Compound Interest Results</h3>
            <div className="compound-interest-result-content">
              <div className="compound-interest-result-main">
                <div className="compound-interest-result-item">
                  <strong>Future Value:</strong>
                  <span className="compound-interest-result-value compound-interest-result-final">
                    {formatCurrency(result.futureValue)}
                  </span>
                </div>
                <div className="compound-interest-result-item">
                  <strong>Total Interest Earned:</strong>
                  <span className="compound-interest-result-value">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </div>
                <div className="compound-interest-result-item">
                  <strong>Total Amount Invested:</strong>
                  <span className="compound-interest-result-value">
                    {formatCurrency(result.totalInvested)}
                  </span>
                </div>
                <div className="compound-interest-result-item">
                  <strong>Initial Investment:</strong>
                  <span className="compound-interest-result-value">
                    {formatCurrency(result.principal)}
                  </span>
                </div>
              </div>

              <div className="compound-interest-summary">
                <h4 className="compound-interest-summary-title">Investment Summary</h4>
                <div className="compound-interest-summary-content">
                  <div className="compound-interest-summary-item">
                    <strong>Interest Rate:</strong>
                    <span className="compound-interest-summary-value">
                      {formatPercentage(result.rate)}
                    </span>
                  </div>
                  <div className="compound-interest-summary-item">
                    <strong>Time Period:</strong>
                    <span className="compound-interest-summary-value">
                      {result.time} years
                    </span>
                  </div>
                  <div className="compound-interest-summary-item">
                    <strong>Growth Factor:</strong>
                    <span className="compound-interest-summary-value">
                      {(result.futureValue / result.principal).toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Yearly Breakdown Table */}
              <div className="compound-interest-table-container">
                <h4 className="compound-interest-table-title">Year-by-Year Breakdown</h4>
                <div className="compound-interest-table-wrapper">
                  <table className="compound-interest-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Starting Balance</th>
                        <th>Contributions</th>
                        <th>Interest Earned</th>
                        <th>Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyBreakdown.slice(0, 10).map((year) => (
                        <tr key={year.year}>
                          <td>{year.year}</td>
                          <td>{formatCurrency(year.startingBalance)}</td>
                          <td>{formatCurrency(year.contributions)}</td>
                          <td>{formatCurrency(year.interest)}</td>
                          <td>{formatCurrency(year.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.yearlyBreakdown.length > 10 && (
                  <div className="compound-interest-table-note">
                    <p>Showing first 10 years. Total breakdown has {result.yearlyBreakdown.length} years.</p>
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
          The Compound Interest Calculator is a powerful financial planning tool that shows you how your 
          investments grow over time. It demonstrates the incredible power of compound interest, where 
          your money earns interest on both the principal and the accumulated interest from previous periods.
        </p>
        <p>
          Whether you're planning for retirement, saving for a major purchase, or just want to understand 
          how your investments will perform, this calculator helps you visualize the long-term growth potential 
          of your money with different contribution schedules and compounding frequencies.
        </p>
      </ContentSection>

      <ContentSection id="what-is-compound-interest" title="What is Compound Interest?">
        <p>
          Compound interest is the interest earned on both the initial principal and the accumulated interest 
          from previous periods. Unlike simple interest, which only calculates interest on the principal amount, 
          compound interest allows your money to grow exponentially over time.
        </p>
        <ul>
          <li>
            <span><strong>Principal:</strong> The initial amount you invest</span>
          </li>
          <li>
            <span><strong>Interest Rate:</strong> The percentage return on your investment</span>
          </li>
          <li>
            <span><strong>Compounding Frequency:</strong> How often interest is calculated and added</span>
          </li>
          <li>
            <span><strong>Time:</strong> The length of your investment period</span>
          </li>
          <li>
            <span><strong>Regular Contributions:</strong> Additional money you add periodically</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Compound Interest Calculator">
        <p>Using the compound interest calculator is straightforward and requires just a few key inputs:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Initial Investment:</strong> Enter the amount you're starting with.</span>
          </li>
          <li>
            <span><strong>Interest Rate:</strong> Specify your expected annual return rate.</span>
          </li>
          <li>
            <span><strong>Time Period:</strong> Choose how many years you plan to invest.</span>
          </li>
          <li>
            <span><strong>Regular Contributions:</strong> Optionally add periodic investment amounts.</span>
          </li>
          <li>
            <span><strong>Frequencies:</strong> Select how often you contribute and how often interest compounds.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Compound Interest" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Even small regular contributions can dramatically increase your final 
          investment value due to the power of compound interest over time.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Formulas & Methods">
        <div className="formula-section">
          <h3>Basic Compound Interest Formula</h3>
          <div className="math-formula">
            {'A = P\\left(1 + \\frac{r}{n}\\right)^{nt}'}
          </div>
          <p>Where A = Future Value, P = Principal, r = Annual Rate, n = Compounding Frequency, t = Time</p>
        </div>

        <div className="formula-section">
          <h3>With Regular Contributions</h3>
          <div className="math-formula">
            {'\\text{Future Value} = P\\left(1 + \\frac{r}{n}\\right)^{nt} + PMT \\cdot \\frac{\\left(1 + \\frac{r}{n}\\right)^{nt} - 1}{\\frac{r}{n}}'}
          </div>
          <p>PMT = Regular contribution amount, adjusted for frequency</p>
        </div>

        <div className="formula-section">
          <h3>Compounding Frequencies</h3>
          <div className="math-formula">
            {'\\text{Daily: } n = 365, \\text{ Monthly: } n = 12, \\text{ Quarterly: } n = 4, \\text{ Annually: } n = 1'}
          </div>
          <p>More frequent compounding generally leads to higher returns.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Basic Compound Interest</h3>
          <div className="example-solution">
            <p><strong>Initial Investment:</strong> $10,000</p>
            <p><strong>Interest Rate:</strong> 7% annually</p>
            <p><strong>Time:</strong> 20 years</p>
            <p><strong>Compounding:</strong> Monthly</p>
            <p><strong>Result:</strong> Future Value: $40,427.50</p>
            <p><strong>Total Interest:</strong> $30,427.50</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: With Monthly Contributions</h3>
          <div className="example-solution">
            <p><strong>Initial Investment:</strong> $10,000</p>
            <p><strong>Monthly Contribution:</strong> $500</p>
            <p><strong>Interest Rate:</strong> 7% annually</p>
            <p><strong>Time:</strong> 20 years</p>
            <p><strong>Result:</strong> Future Value: $286,984.50</p>
            <p><strong>Total Invested:</strong> $130,000</p>
            <p><strong>Total Interest:</strong> $156,984.50</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding compound interest is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Shows the true power of long-term investing</span>
          </li>
          <li>
            <span>Demonstrates why starting early is so important</span>
          </li>
          <li>
            <span>Highlights the impact of regular contributions</span>
          </li>
          <li>
            <span>Helps with retirement and financial planning</span>
          </li>
          <li>
            <span>Shows how small changes can create big differences over time</span>
          </li>
          <li>
            <span>Essential for comparing different investment strategies</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Compound Interest Calculator provides comprehensive analysis:</p>
        <ul>
          <li>
            <span><strong>Basic Calculations:</strong> Future value, total interest, and growth factor</span>
          </li>
          <li>
            <span><strong>Regular Contributions:</strong> Monthly, quarterly, or annual investment additions</span>
          </li>
          <li>
            <span><strong>Compounding Frequencies:</strong> Daily, monthly, quarterly, or annual compounding</span>
          </li>
          <li>
            <span><strong>Year-by-Year Breakdown:</strong> Detailed analysis of each year's growth</span>
          </li>
          <li>
            <span><strong>Visual Results:</strong> Clear presentation of all key metrics</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Retirement Planning</h4>
            <p>Calculate how much you'll have saved for retirement</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education Savings</h4>
            <p>Plan for college or university expenses</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Home Purchase</h4>
            <p>Save for a down payment on a house</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Investment Strategy</h4>
            <p>Compare different investment approaches</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-umbrella-beach"></i> Dream Vacations</h4>
            <p>Save for major travel or lifestyle goals</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-shield-alt"></i> Emergency Fund</h4>
            <p>Build financial security over time</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What's the difference between simple and compound interest?",
            answer: "Simple interest only calculates interest on the principal amount, while compound interest calculates interest on both the principal and the accumulated interest from previous periods. This makes compound interest much more powerful over long periods."
          },
          {
            question: "How does compounding frequency affect my returns?",
            answer: "More frequent compounding (daily vs. monthly vs. annually) generally leads to slightly higher returns because interest is calculated and added more often. However, the difference is usually small for most practical purposes."
          },
          {
            question: "Why is starting early so important for compound interest?",
            answer: "Compound interest works exponentially over time. Starting early gives your money more time to grow, and the longer the time period, the more dramatic the effect becomes. Even small amounts can grow significantly over decades."
          },
          {
            question: "How do regular contributions affect compound interest?",
            answer: "Regular contributions dramatically increase your final investment value because each contribution also earns compound interest. Even small monthly contributions can add up to substantial amounts over time due to the power of compounding."
          },
          {
            question: "What's a realistic interest rate to expect?",
            answer: "Historical stock market returns average around 7-10% annually, but this varies by asset class and time period. Bonds typically return 3-6%, while savings accounts offer 1-3%. Consider your risk tolerance and investment goals when choosing a rate."
          },
          {
            question: "How can I maximize my compound interest returns?",
            answer: "Start early, invest regularly, choose appropriate compounding frequencies, reinvest all earnings, and maintain a long-term perspective. The key is time - the longer you can let your money compound, the better your results will be."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default CompoundInterestCalculator
