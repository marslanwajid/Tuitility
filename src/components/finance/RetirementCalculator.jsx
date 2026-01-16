import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import RetirementCalculatorJS from '../../assets/js/finance/retirement-calculator.js'
import '../../assets/css/finance/retirement-calculator.css'
import Seo from '../Seo'

const RetirementCalculator = () => {
  const [formData, setFormData] = useState({
    currentAge: '',
    retirementAge: '',
    currentSavings: '',
    monthlyContribution: '',
    annualReturn: '',
    inflationRate: '',
    retirementIncome: '',
    socialSecurity: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const retirementCalc = new RetirementCalculatorJS();
      setCalculator(retirementCalc);
    } catch (error) {
      console.error('Error initializing retirement calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Retirement Calculator',
    description: 'Calculate retirement savings goals, monthly contributions, and future income. Plan your retirement strategy with detailed projections and inflation-adjusted returns.',
    icon: 'fas fa-piggy-bank',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Retirement Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, 401k, ira, retirement planning`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/retirement-calculator`;

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
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-line' },
    { name: 'Tax Calculator', url: '/finance/calculators/tax-calculator', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Compound Interest Calculator', url: '/finance/calculators/compound-interest-calculator', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', url: '/finance/calculators/roi-calculator', icon: 'fas fa-chart-line' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-retirement', title: 'What is Retirement Planning?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Retirement Formulas & Methods' },
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
        formData.currentAge,
        formData.retirementAge,
        formData.currentSavings,
        formData.monthlyContribution,
        formData.annualReturn,
        formData.inflationRate,
        formData.retirementIncome,
        formData.socialSecurity
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

  const calculateRetirement = () => {
    if (!validateInputs()) return;

    try {
      const {
        currentAge,
        retirementAge,
        currentSavings,
        monthlyContribution,
        annualReturn,
        inflationRate,
        retirementIncome,
        socialSecurity
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateRetirement(
        parseFloat(currentAge),
        parseFloat(retirementAge),
        parseFloat(currentSavings) || 0,
        parseFloat(monthlyContribution) || 0,
        parseFloat(annualReturn),
        parseFloat(inflationRate) || 0,
        parseFloat(retirementIncome) || 0,
        parseFloat(socialSecurity) || 0
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
      currentAge: '',
      retirementAge: '',
      currentSavings: '',
      monthlyContribution: '',
      annualReturn: '',
      inflationRate: '',
      retirementIncome: '',
      socialSecurity: ''
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
          title="Retirement Calculator"
          onCalculate={calculateRetirement}
          calculateButtonText="Calculate Retirement"
          error={error}
          result={null}
        >
          <div className="retirement-calculator-form">
            <div className="retirement-input-row">
              <div className="retirement-input-group">
                <label htmlFor="retirement-current-age" className="retirement-input-label">
                  Current Age:
                </label>
                <input
                  type="number"
                  id="retirement-current-age"
                  className="retirement-input-field"
                  value={formData.currentAge}
                  onChange={(e) => handleInputChange('currentAge', e.target.value)}
                  placeholder="e.g., 30"
                  min="18"
                  max="80"
                  step="1"
                />
                <small className="retirement-input-help">
                  Your current age in years
                </small>
              </div>

              <div className="retirement-input-group">
                <label htmlFor="retirement-retirement-age" className="retirement-input-label">
                  Retirement Age:
                </label>
                <input
                  type="number"
                  id="retirement-retirement-age"
                  className="retirement-input-field"
                  value={formData.retirementAge}
                  onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                  placeholder="e.g., 65"
                  min="50"
                  max="80"
                  step="1"
                />
                <small className="retirement-input-help">
                  Age when you plan to retire
                </small>
              </div>
            </div>

            <div className="retirement-input-row">
              <div className="retirement-input-group">
                <label htmlFor="retirement-current-savings" className="retirement-input-label">
                  Current Retirement Savings ($):
                </label>
                <input
                  type="number"
                  id="retirement-current-savings"
                  className="retirement-input-field"
                  value={formData.currentSavings}
                  onChange={(e) => handleInputChange('currentSavings', e.target.value)}
                  placeholder="e.g., 50000"
                  min="0"
                  step="1000"
                />
                <small className="retirement-input-help">
                  Current amount in retirement accounts
                </small>
              </div>

              <div className="retirement-input-group">
                <label htmlFor="retirement-monthly-contribution" className="retirement-input-label">
                  Monthly Contribution ($):
                </label>
                <input
                  type="number"
                  id="retirement-monthly-contribution"
                  className="retirement-input-field"
                  value={formData.monthlyContribution}
                  onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                  placeholder="e.g., 1000"
                  min="0"
                  step="100"
                />
                <small className="retirement-input-help">
                  Amount you contribute monthly
                </small>
              </div>
            </div>

            <div className="retirement-input-row">
              <div className="retirement-input-group">
                <label htmlFor="retirement-annual-return" className="retirement-input-label">
                  Expected Annual Return (%):
                </label>
                <input
                  type="number"
                  id="retirement-annual-return"
                  className="retirement-input-field"
                  value={formData.annualReturn}
                  onChange={(e) => handleInputChange('annualReturn', e.target.value)}
                  placeholder="e.g., 7"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <small className="retirement-input-help">
                  Expected annual return on investments
                </small>
              </div>

              <div className="retirement-input-group">
                <label htmlFor="retirement-inflation-rate" className="retirement-input-label">
                  Inflation Rate (%):
                </label>
                <input
                  type="number"
                  id="retirement-inflation-rate"
                  className="retirement-input-field"
                  value={formData.inflationRate}
                  onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                  placeholder="e.g., 2.5"
                  min="0"
                  max="10"
                  step="0.1"
                />
                <small className="retirement-input-help">
                  Expected annual inflation rate
                </small>
              </div>
            </div>

            <div className="retirement-input-row">
              <div className="retirement-input-group">
                <label htmlFor="retirement-retirement-income" className="retirement-input-label">
                  Desired Annual Retirement Income ($):
                </label>
                <input
                  type="number"
                  id="retirement-retirement-income"
                  className="retirement-input-field"
                  value={formData.retirementIncome}
                  onChange={(e) => handleInputChange('retirementIncome', e.target.value)}
                  placeholder="e.g., 80000"
                  min="0"
                  step="1000"
                />
                <small className="retirement-input-help">
                  Annual income you want in retirement
                </small>
              </div>

              <div className="retirement-input-group">
                <label htmlFor="retirement-social-security" className="retirement-input-label">
                  Expected Social Security ($):
                </label>
                <input
                  type="number"
                  id="retirement-social-security"
                  className="retirement-input-field"
                  value={formData.socialSecurity}
                  onChange={(e) => handleInputChange('socialSecurity', e.target.value)}
                  placeholder="e.g., 25000"
                  min="0"
                  step="1000"
                />
                <small className="retirement-input-help">
                  Expected annual Social Security benefits
                </small>
              </div>
            </div>

            <div className="retirement-calculator-actions">
              <button type="button" className="retirement-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="retirement-calculator-result">
              <h3 className="retirement-result-title">Retirement Calculation Results</h3>
              <div className="retirement-result-content">
                <div className="retirement-result-main">
                  <div className="retirement-result-item">
                    <strong>Retirement Savings Goal:</strong>
                    <span className="retirement-result-value">
                      {formatCurrency(result.retirementGoal)}
                    </span>
                  </div>
                  <div className="retirement-result-item">
                    <strong>Projected Savings at Retirement:</strong>
                    <span className="retirement-result-value">
                      {formatCurrency(result.projectedSavings)}
                    </span>
                  </div>
                  <div className="retirement-result-item">
                    <strong>Monthly Income Gap:</strong>
                    <span className="retirement-result-value">
                      {formatCurrency(result.monthlyIncomeGap)}
                    </span>
                  </div>
                  <div className="retirement-result-item">
                    <strong>Required Monthly Contribution:</strong>
                    <span className="retirement-result-value retirement-result-final">
                      {formatCurrency(result.requiredMonthlyContribution)}
                    </span>
                  </div>
                </div>

                <div className="retirement-result-breakdown">
                  <h4>Savings Breakdown</h4>
                  <div className="retirement-breakdown-details">
                    <div className="retirement-breakdown-item">
                      <span>Current Savings:</span>
                      <span>{formatCurrency(result.currentSavings)}</span>
                    </div>
                    <div className="retirement-breakdown-item">
                      <span>Total Contributions:</span>
                      <span>{formatCurrency(result.totalContributions)}</span>
                    </div>
                    <div className="retirement-breakdown-item">
                      <span>Compound Interest:</span>
                      <span>{formatCurrency(result.compoundInterest)}</span>
                    </div>
                    <div className="retirement-breakdown-item retirement-total">
                      <span>Total at Retirement:</span>
                      <span>{formatCurrency(result.projectedSavings)}</span>
                    </div>
                  </div>
                </div>

                <div className="retirement-result-income">
                  <h4>Retirement Income Analysis</h4>
                  <div className="retirement-income-details">
                    <div className="retirement-income-item">
                      <span>Desired Annual Income:</span>
                      <span>{formatCurrency(result.desiredAnnualIncome)}</span>
                    </div>
                    <div className="retirement-income-item">
                      <span>Social Security Benefits:</span>
                      <span>{formatCurrency(result.socialSecurityBenefits)}</span>
                    </div>
                    <div className="retirement-income-item">
                      <span>Required from Savings:</span>
                      <span>{formatCurrency(result.requiredFromSavings)}</span>
                    </div>
                    <div className="retirement-income-item">
                      <span>Safe Withdrawal Rate:</span>
                      <span>{formatPercentage(result.safeWithdrawalRate)}</span>
                    </div>
                  </div>
                </div>

                <div className="retirement-result-tip">
                  <i className="fas fa-lightbulb"></i>
                  <span>💡 Tip: Start saving early and increase contributions over time to reach your retirement goals!</span>
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
            The Retirement Calculator is a comprehensive financial planning tool that helps you determine 
            how much you need to save for retirement and whether you're on track to meet your goals. 
            Whether you're just starting your career or approaching retirement age, this calculator 
            provides clear insights into your retirement planning strategy.
          </p>
          <p>
            By analyzing your current savings, contribution amounts, expected returns, and desired 
            retirement income, this calculator helps you understand the gap between where you are 
            and where you need to be. It also accounts for inflation and Social Security benefits 
            to give you a realistic view of your retirement readiness.
          </p>
        </ContentSection>

        <ContentSection id="what-is-retirement" title="What is Retirement Planning?">
          <p>
            Retirement planning is the process of determining retirement income goals and the actions 
            and decisions necessary to achieve those goals. It involves identifying sources of income, 
            estimating expenses, implementing a savings program, and managing assets and risk.
          </p>
          <ul>
            <li>
              <span><strong>Compound Growth:</strong> Time is your greatest asset in retirement planning</span>
            </li>
            <li>
              <span><strong>Inflation Impact:</strong> Your money's purchasing power decreases over time</span>
            </li>
            <li>
              <span><strong>Multiple Income Sources:</strong> Diversify with savings, Social Security, and pensions</span>
            </li>
            <li>
              <span><strong>Safe Withdrawal Rate:</strong> Typically 4% annually to preserve principal</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Retirement Calculator">
          <p>Using the retirement calculator is straightforward and requires key information about your financial situation:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Current Age:</strong> Input your current age in years.</span>
            </li>
            <li>
              <span><strong>Set Retirement Age:</strong> Choose when you plan to retire.</span>
            </li>
            <li>
              <span><strong>Add Current Savings:</strong> Enter your current retirement account balance.</span>
            </li>
            <li>
              <span><strong>Set Monthly Contribution:</strong> Enter how much you save monthly.</span>
            </li>
            <li>
              <span><strong>Choose Return Rate:</strong> Enter your expected annual investment return.</span>
            </li>
            <li>
              <span><strong>Add Inflation Rate:</strong> Include expected inflation for realistic planning.</span>
            </li>
            <li>
              <span><strong>Set Retirement Income:</strong> Enter your desired annual retirement income.</span>
            </li>
            <li>
              <span><strong>Include Social Security:</strong> Add expected Social Security benefits.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Retirement" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Use conservative return estimates and consider increasing your 
            contributions if you're behind on your retirement goals.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Retirement Formulas & Methods">
          <div className="formula-section">
            <h3>Future Value of Current Savings</h3>
            <div className="math-formula">
              Future Value = Current Savings × (1 + Annual Return)^Years to Retirement
            </div>
            <p>Calculates how much your current savings will grow by retirement age.</p>
          </div>

          <div className="formula-section">
            <h3>Future Value of Monthly Contributions</h3>
            <div className="math-formula">
              FV = PMT × [((1 + r)^n - 1) / r] × (1 + r)
            </div>
            <p>Where PMT = Monthly payment, r = Monthly return rate, n = Total months to retirement.</p>
          </div>

          <div className="formula-section">
            <h3>Retirement Savings Goal</h3>
            <div className="math-formula">
              Goal = (Desired Annual Income - Social Security) ÷ Safe Withdrawal Rate
            </div>
            <p>Determines how much you need to save to generate your desired retirement income.</p>
          </div>

          <div className="formula-section">
            <h3>Required Monthly Contribution</h3>
            <div className="math-formula">
              PMT = (Goal - Current FV) ÷ [((1 + r)^n - 1) / r]
            </div>
            <p>Calculates the monthly contribution needed to reach your retirement goal.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: Early Starter</h3>
            <div className="example-solution">
              <p><strong>Current Age:</strong> 25</p>
              <p><strong>Retirement Age:</strong> 65</p>
              <p><strong>Current Savings:</strong> $10,000</p>
              <p><strong>Monthly Contribution:</strong> $500</p>
              <p><strong>Annual Return:</strong> 7%</p>
              <p><strong>Result:</strong> $1.2 million at retirement</p>
              <p><strong>Lesson:</strong> Starting early allows smaller contributions to grow significantly!</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Late Starter</h3>
            <div className="example-solution">
              <p><strong>Current Age:</strong> 45</p>
              <p><strong>Retirement Age:</strong> 65</p>
              <p><strong>Current Savings:</strong> $50,000</p>
              <p><strong>Monthly Contribution:</strong> $1,500</p>
              <p><strong>Annual Return:</strong> 7%</p>
              <p><strong>Result:</strong> $650,000 at retirement</p>
              <p><strong>Lesson:</strong> Late starters need much higher contributions to catch up!</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: High Income Goal</h3>
            <div className="example-solution">
              <p><strong>Desired Retirement Income:</strong> $100,000/year</p>
              <p><strong>Social Security:</strong> $30,000/year</p>
              <p><strong>Required from Savings:</strong> $70,000/year</p>
              <p><strong>Retirement Goal:</strong> $1.75 million (4% withdrawal rate)</p>
              <p><strong>Required Monthly Contribution:</strong> $1,200 (starting at 30)</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding retirement planning is crucial for financial security:</p>
          <ul>
            <li>
              <span>Ensures you can maintain your lifestyle in retirement</span>
            </li>
            <li>
              <span>Helps you take advantage of compound growth over time</span>
            </li>
            <li>
              <span>Provides peace of mind about your financial future</span>
            </li>
            <li>
              <span>Allows you to make informed decisions about spending and saving</span>
            </li>
            <li>
              <span>Helps you understand the impact of starting early vs. late</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Retirement Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Goal Setting:</strong> Calculate how much you need to save for retirement</span>
            </li>
            <li>
              <span><strong>Progress Tracking:</strong> See if you're on track to meet your goals</span>
            </li>
            <li>
              <span><strong>Contribution Planning:</strong> Determine required monthly contributions</span>
            </li>
            <li>
              <span><strong>Income Analysis:</strong> Break down retirement income sources</span>
            </li>
            <li>
              <span><strong>Inflation Adjustment:</strong> Account for the impact of inflation</span>
            </li>
            <li>
              <span><strong>Social Security Integration:</strong> Include expected benefits in planning</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-piggy-bank"></i> Retirement Planning</h4>
              <p>Plan and track your retirement savings goals</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Investment Strategy</h4>
              <p>Optimize your investment approach for retirement</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-calculator"></i> Contribution Planning</h4>
              <p>Determine how much you need to save monthly</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Goal Assessment</h4>
              <p>Evaluate if your current plan meets your retirement needs</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-calendar-alt"></i> Timeline Planning</h4>
              <p>Understand the impact of different retirement ages</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Financial Education</h4>
              <p>Learn about retirement planning principles and strategies</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "How much should I save for retirement?",
              answer: "A common rule of thumb is to save 10-15% of your income, but the exact amount depends on your goals, timeline, and current savings. Our calculator helps you determine the specific amount needed to reach your retirement income goals."
            },
            {
              question: "What's a safe withdrawal rate in retirement?",
              answer: "The 4% rule is commonly used, meaning you can withdraw 4% of your retirement savings annually. This assumes your investments will grow enough to maintain your principal while providing income for 30+ years."
            },
            {
              question: "When should I start saving for retirement?",
              answer: "The best time to start is as early as possible due to compound growth. Even small amounts saved in your 20s can grow significantly more than larger amounts saved later in life. However, it's never too late to start."
            },
            {
              question: "How does inflation affect retirement planning?",
              answer: "Inflation reduces the purchasing power of your money over time. A dollar today will buy less in the future, so you need to account for inflation when setting retirement income goals and investment return expectations."
            },
            {
              question: "Should I rely on Social Security for retirement?",
              answer: "Social Security should be considered as one component of retirement income, not your primary source. The program faces long-term funding challenges, so it's wise to have additional savings and investments for retirement."
            },
            {
              question: "What if I'm behind on my retirement savings?",
              answer: "If you're behind, consider increasing your contributions, working longer, reducing your retirement income expectations, or a combination of these strategies. The calculator can help you see the impact of different approaches."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default RetirementCalculator