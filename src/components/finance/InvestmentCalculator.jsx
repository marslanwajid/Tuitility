import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import InvestmentCalculatorJS from '../../assets/js/finance/investment-calculator.js'
import '../../assets/css/finance/investment-calculator.css'
import Seo from '../Seo'

const InvestmentCalculator = () => {
  const [formData, setFormData] = useState({
    initialInvestment: '',
    monthlyContribution: '',
    annualReturn: '',
    investmentYears: '',
    inflationRate: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const investmentCalc = new InvestmentCalculatorJS();
      setCalculator(investmentCalc);
    } catch (error) {
      console.error('Error initializing investment calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Investment Calculator',
    description: 'Calculate investment growth, compound returns, and future value. Plan your investment strategy with detailed projections and inflation-adjusted returns.',
    icon: 'fas fa-chart-line',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Investment Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, compound interest, stock market, retirement planning`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/investment-calculator`;

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
    { name: 'Compound Interest Calculator', url: '/finance/calculators/compound-interest-calculator', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', url: '/finance/calculators/roi-calculator', icon: 'fas fa-chart-line' },
    { name: 'Retirement Calculator', url: '/finance/calculators/retirement-calculator', icon: 'fas fa-piggy-bank' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Mortgage Calculator', url: '/finance/calculators/mortgage-calculator', icon: 'fas fa-home' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-investment', title: 'What is Investment Growth?' },
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
        formData.initialInvestment,
        formData.monthlyContribution,
        formData.annualReturn,
        formData.investmentYears,
        formData.inflationRate
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

  const calculateInvestment = () => {
    if (!validateInputs()) return;

    try {
      const {
        initialInvestment,
        monthlyContribution,
        annualReturn,
        investmentYears,
        inflationRate
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateInvestment(
        parseFloat(initialInvestment),
        parseFloat(monthlyContribution) || 0,
        parseFloat(annualReturn),
        parseFloat(investmentYears),
        parseFloat(inflationRate) || 0
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
      initialInvestment: '',
      monthlyContribution: '',
      annualReturn: '',
      investmentYears: '',
      inflationRate: ''
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
          title="Investment Calculator"
          onCalculate={calculateInvestment}
          calculateButtonText="Calculate Investment"
          error={error}
          result={null}
        >
          <div className="investment-calculator-form">
            <div className="investment-input-row">
              <div className="investment-input-group">
                <label htmlFor="investment-initial" className="investment-input-label">
                  Initial Investment ($):
                </label>
                <input
                  type="number"
                  id="investment-initial"
                  className="investment-input-field"
                  value={formData.initialInvestment}
                  onChange={(e) => handleInputChange('initialInvestment', e.target.value)}
                  placeholder="e.g., 10000"
                  min="0"
                  step="1000"
                />
                <small className="investment-input-help">
                  Your starting investment amount
                </small>
              </div>

              <div className="investment-input-group">
                <label htmlFor="investment-monthly" className="investment-input-label">
                  Monthly Contribution ($):
                </label>
                <input
                  type="number"
                  id="investment-monthly"
                  className="investment-input-field"
                  value={formData.monthlyContribution}
                  onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                  step="50"
                />
                <small className="investment-input-help">
                  Amount you'll invest monthly (optional)
                </small>
              </div>
            </div>

            <div className="investment-input-row">
              <div className="investment-input-group">
                <label htmlFor="investment-return" className="investment-input-label">
                  Annual Return Rate (%):
                </label>
                <input
                  type="number"
                  id="investment-return"
                  className="investment-input-field"
                  value={formData.annualReturn}
                  onChange={(e) => handleInputChange('annualReturn', e.target.value)}
                  placeholder="e.g., 8.5"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <small className="investment-input-help">
                  Expected annual return on investment
                </small>
              </div>

              <div className="investment-input-group">
                <label htmlFor="investment-years" className="investment-input-label">
                  Investment Period (Years):
                </label>
                <input
                  type="number"
                  id="investment-years"
                  className="investment-input-field"
                  value={formData.investmentYears}
                  onChange={(e) => handleInputChange('investmentYears', e.target.value)}
                  placeholder="e.g., 20"
                  min="1"
                  max="50"
                  step="1"
                />
                <small className="investment-input-help">
                  How long you'll invest
                </small>
              </div>
            </div>

            <div className="investment-input-row">
              <div className="investment-input-group">
                <label htmlFor="investment-inflation" className="investment-input-label">
                  Inflation Rate (%):
                </label>
                <input
                  type="number"
                  id="investment-inflation"
                  className="investment-input-field"
                  value={formData.inflationRate}
                  onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                  placeholder="e.g., 2.5"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <small className="investment-input-help">
                  Expected annual inflation rate (optional)
                </small>
              </div>

              <div className="investment-input-group">
                <div className="investment-input-spacer"></div>
              </div>
            </div>

            <div className="investment-calculator-actions">
              <button type="button" className="investment-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="investment-calculator-result">
              <h3 className="investment-result-title">Investment Calculation Results</h3>
              <div className="investment-result-content">
                <div className="investment-result-main">
                  <div className="investment-result-item">
                    <strong>Total Invested:</strong>
                    <span className="investment-result-value">
                      {formatCurrency(result.totalInvested)}
                    </span>
                  </div>
                  <div className="investment-result-item">
                    <strong>Total Interest Earned:</strong>
                    <span className="investment-result-value">
                      {formatCurrency(result.totalInterest)}
                    </span>
                  </div>
                  <div className="investment-result-item">
                    <strong>Future Value:</strong>
                    <span className="investment-result-value investment-result-final">
                      {formatCurrency(result.futureValue)}
                    </span>
                  </div>
                  <div className="investment-result-item">
                    <strong>Inflation-Adjusted Value:</strong>
                    <span className="investment-result-value">
                      {formatCurrency(result.inflationAdjustedValue)}
                    </span>
                  </div>
                </div>

                <div className="investment-result-breakdown">
                  <h4>Investment Breakdown</h4>
                  <div className="investment-breakdown-details">
                    <div className="investment-breakdown-item">
                      <span>Initial Investment:</span>
                      <span>{formatCurrency(result.initialInvestment)}</span>
                    </div>
                    <div className="investment-breakdown-item">
                      <span>Total Contributions:</span>
                      <span>{formatCurrency(result.totalContributions)}</span>
                    </div>
                    <div className="investment-breakdown-item">
                      <span>Compound Interest:</span>
                      <span>{formatCurrency(result.totalInterest)}</span>
                    </div>
                    <div className="investment-breakdown-item investment-total">
                      <span>Final Value:</span>
                      <span>{formatCurrency(result.futureValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="investment-result-growth">
                  <h4>Growth Analysis</h4>
                  <div className="investment-growth-details">
                    <div className="investment-growth-item">
                      <span>Growth Rate:</span>
                      <span>{formatPercentage(result.growthRate)}</span>
                    </div>
                    <div className="investment-growth-item">
                      <span>Inflation Impact:</span>
                      <span>{formatCurrency(result.inflationImpact)}</span>
                    </div>
                    <div className="investment-growth-item">
                      <span>Real Return:</span>
                      <span>{formatPercentage(result.realReturn)}</span>
                    </div>
                  </div>
                </div>

                <div className="investment-result-tip">
                  <i className="fas fa-lightbulb"></i>
                  <span>💡 Tip: Start early and invest regularly to maximize compound growth!</span>
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
            The Investment Calculator is a powerful financial planning tool that helps you understand 
            the potential growth of your investments over time. Whether you're planning for retirement, 
            saving for a major purchase, or building wealth, this calculator provides clear insights into 
            how compound interest can work in your favor.
          </p>
          <p>
            By inputting your initial investment, monthly contributions, expected return rate, and 
            investment timeline, you can see the dramatic impact of compound growth and make informed 
            decisions about your investment strategy. The calculator also accounts for inflation to give 
            you a realistic view of your purchasing power in the future.
          </p>
        </ContentSection>

        <ContentSection id="what-is-investment" title="What is Investment Growth?">
          <p>
            Investment growth is the increase in the value of your investments over time, primarily 
            driven by compound interest. Understanding how this growth works is crucial for long-term 
            financial planning and wealth building.
          </p>
          <ul>
            <li>
              <span><strong>Compound Interest:</strong> Interest earned on both principal and accumulated interest</span>
            </li>
            <li>
              <span><strong>Time Value of Money:</strong> Money invested today is worth more than the same amount in the future</span>
            </li>
            <li>
              <span><strong>Regular Contributions:</strong> Consistent monthly investments can significantly boost long-term returns</span>
            </li>
            <li>
              <span><strong>Inflation Impact:</strong> Reduces the real purchasing power of your returns over time</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Investment Calculator">
          <p>Using the investment calculator is straightforward and requires just a few key pieces of information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Initial Investment:</strong> Input your starting investment amount.</span>
            </li>
            <li>
              <span><strong>Set Monthly Contribution:</strong> Enter how much you'll invest monthly (optional).</span>
            </li>
            <li>
              <span><strong>Choose Return Rate:</strong> Enter your expected annual return percentage.</span>
            </li>
            <li>
              <span><strong>Set Time Period:</strong> Enter how many years you plan to invest.</span>
            </li>
            <li>
              <span><strong>Add Inflation Rate:</strong> Include expected inflation for realistic projections.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Investment" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Use conservative return estimates and consider inflation to get 
            realistic projections of your investment growth.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Formulas & Methods">
          <div className="formula-section">
            <h3>Compound Interest Formula</h3>
            <div className="math-formula">
              Future Value = P(1 + r/n)^(nt) + PMT × [(1 + r/n)^(nt) - 1] / (r/n)
            </div>
            <p>Where P = Principal, r = Annual rate, n = Compounding frequency, t = Time in years, PMT = Monthly payment.</p>
          </div>

          <div className="formula-section">
            <h3>Monthly Contribution Growth</h3>
            <div className="math-formula">
              Monthly Growth = PMT × [(1 + r/12)^(12t) - 1] / (r/12)
            </div>
            <p>Calculates the future value of regular monthly contributions with compound interest.</p>
          </div>

          <div className="formula-section">
            <h3>Inflation-Adjusted Value</h3>
            <div className="math-formula">
              Real Value = Future Value / (1 + inflation)^t
            </div>
            <p>Shows the purchasing power of your investment after accounting for inflation.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Conservative Growth</h3>
            <div className="example-solution">
              <p><strong>Initial Investment:</strong> $10,000</p>
              <p><strong>Monthly Contribution:</strong> $500</p>
              <p><strong>Annual Return:</strong> 6%</p>
              <p><strong>Time Period:</strong> 20 years</p>
              <p><strong>Result:</strong> $245,000 total value</p>
              <p><strong>Total Invested:</strong> $130,000</p>
              <p><strong>Interest Earned:</strong> $115,000</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Aggressive Growth</h3>
            <div className="example-solution">
              <p><strong>Initial Investment:</strong> $25,000</p>
              <p><strong>Monthly Contribution:</strong> $1,000</p>
              <p><strong>Annual Return:</strong> 10%</p>
              <p><strong>Time Period:</strong> 30 years</p>
              <p><strong>Result:</strong> $2.1 million total value</p>
              <p><strong>Total Invested:</strong> $385,000</p>
              <p><strong>Interest Earned:</strong> $1.7 million</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: Impact of Starting Early</h3>
            <div className="example-solution">
              <p><strong>Starting at 25:</strong> $500/month for 40 years at 8% = $1.4 million</p>
              <p><strong>Starting at 35:</strong> $500/month for 30 years at 8% = $680,000</p>
              <p><strong>Starting at 45:</strong> $500/month for 20 years at 8% = $275,000</p>
              <p><strong>Lesson:</strong> Starting 10 years earlier can double or triple your final value!</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding investment calculations is crucial for financial success:</p>
          <ul>
            <li>
              <span>Helps you set realistic financial goals and timelines</span>
            </li>
            <li>
              <span>Shows the power of compound interest over long periods</span>
            </li>
            <li>
              <span>Demonstrates the importance of starting early and investing regularly</span>
            </li>
            <li>
              <span>Helps you understand the impact of inflation on your returns</span>
            </li>
            <li>
              <span>Essential for retirement planning and wealth building</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Investment Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Compound Interest Calculations:</strong> Accurate projections with monthly compounding</span>
            </li>
            <li>
              <span><strong>Regular Contribution Analysis:</strong> See how monthly investments boost your returns</span>
            </li>
            <li>
              <span><strong>Inflation Adjustment:</strong> Realistic view of future purchasing power</span>
            </li>
            <li>
              <span><strong>Growth Rate Analysis:</strong> Understand your investment performance</span>
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
              <h4><i className="fas fa-piggy-bank"></i> Retirement Planning</h4>
              <p>Calculate how much you need to save for a comfortable retirement</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Major Purchase Planning</h4>
              <p>Plan for buying a house, car, or other large expenses</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Education Funding</h4>
              <p>Plan for children's college education costs</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Investment Strategy</h4>
              <p>Compare different investment approaches and timeframes</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Risk Assessment</h4>
              <p>Understand the relationship between risk and potential returns</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-calendar-alt"></i> Goal Setting</h4>
              <p>Set realistic financial goals with specific timelines</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "What is compound interest and why is it important?",
              answer: "Compound interest is interest earned on both your initial investment and the accumulated interest from previous periods. It's crucial because it allows your money to grow exponentially over time, making it one of the most powerful forces in wealth building."
            },
            {
              question: "How accurate are these investment projections?",
              answer: "These are estimates based on consistent returns and contributions. Actual results may vary due to market fluctuations, changes in contribution amounts, and varying return rates. Use conservative estimates for more realistic planning."
            },
            {
              question: "What's the difference between nominal and real returns?",
              answer: "Nominal returns are the stated percentage returns, while real returns account for inflation. For example, a 7% nominal return with 2% inflation gives you a 5% real return, which represents your actual purchasing power increase."
            },
            {
              question: "How much should I invest monthly?",
              answer: "This depends on your goals, timeline, and current financial situation. A common rule is to invest 10-15% of your income, but start with what you can afford and increase gradually. The key is consistency over time."
            },
            {
              question: "What's a realistic annual return rate?",
              answer: "Historically, stock market returns average 7-10% annually, but this varies by asset class and time period. Conservative estimates (5-7%) are better for long-term planning, while aggressive estimates (8-12%) assume higher-risk investments."
            },
            {
              question: "How does inflation affect my investments?",
              answer: "Inflation reduces the purchasing power of your money over time. Even if your investment grows at 7% annually, with 2% inflation, your real return is only 5%. This is why it's important to consider inflation in long-term planning."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default InvestmentCalculator