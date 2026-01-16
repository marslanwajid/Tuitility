import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import BudgetCalculatorJS from '../../assets/js/finance/budget-calculator.js'
import '../../assets/css/finance/budget-calculator.css'
import Seo from '../Seo'

const BudgetCalculator = () => {
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    housing: '',
    transportation: '',
    food: '',
    utilities: '',
    insurance: '',
    healthcare: '',
    entertainment: '',
    savings: '',
    debt: '',
    other: '',
    budgetType: '50-30-20'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const budgetCalc = new BudgetCalculatorJS();
      setCalculator(budgetCalc);
    } catch (error) {
      console.error('Error initializing budget calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Budget Calculator',
    description: 'Create and manage personal budgets with the 50-30-20 rule and custom allocations. Track expenses and optimize your financial planning.',
    icon: 'fas fa-calculator',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Budget Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, personal finance, 50-30-20 rule, expense tracker`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/budget-calculator`;

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
    { name: 'Tax Calculator', url: '/finance/calculators/tax-calculator', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Debt Payoff Calculator', url: '/finance/calculators/debt-payoff-calculator', icon: 'fas fa-credit-card' },
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-line' },
    { name: 'Retirement Calculator', url: '/finance/calculators/retirement-calculator', icon: 'fas fa-piggy-bank' },
    { name: 'Insurance Calculator', url: '/finance/calculators/insurance-calculator', icon: 'fas fa-shield-alt' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-budgeting', title: 'What is Budgeting?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Budget Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'budget-types', title: 'Budget Types & Strategies' },
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
        formData.monthlyIncome,
        formData.housing,
        formData.transportation,
        formData.food,
        formData.utilities,
        formData.insurance,
        formData.healthcare,
        formData.entertainment,
        formData.savings,
        formData.debt,
        formData.other,
        formData.budgetType
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

  const calculateBudget = () => {
    if (!validateInputs()) return;

    try {
      const {
        monthlyIncome,
        housing,
        transportation,
        food,
        utilities,
        insurance,
        healthcare,
        entertainment,
        savings,
        debt,
        other,
        budgetType
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateBudget(
        parseFloat(monthlyIncome),
        parseFloat(housing || 0),
        parseFloat(transportation || 0),
        parseFloat(food || 0),
        parseFloat(utilities || 0),
        parseFloat(insurance || 0),
        parseFloat(healthcare || 0),
        parseFloat(entertainment || 0),
        parseFloat(savings || 0),
        parseFloat(debt || 0),
        parseFloat(other || 0),
        budgetType
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
      monthlyIncome: '',
      housing: '',
      transportation: '',
      food: '',
      utilities: '',
      insurance: '',
      healthcare: '',
      entertainment: '',
      savings: '',
      debt: '',
      other: '',
      budgetType: '50-30-20'
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
          title="Budget Calculator"
          onCalculate={calculateBudget}
          calculateButtonText="Calculate Budget"
          error={error}
          result={null}
        >
          <div className="budget-calculator-form">
            <div className="budget-input-row">
              <div className="budget-input-group">
                <label htmlFor="budget-monthly-income" className="budget-input-label">
                  Monthly Income ($):
                </label>
                <input
                  type="number"
                  id="budget-monthly-income"
                  className="budget-input-field"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="e.g., 5000"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Your total monthly income
                </small>
              </div>

              <div className="budget-input-group">
                <label htmlFor="budget-type" className="budget-input-label">
                  Budget Type:
                </label>
                <select
                  id="budget-type"
                  className="budget-input-field budget-select"
                  value={formData.budgetType}
                  onChange={(e) => handleInputChange('budgetType', e.target.value)}
                >
                  <option value="50-30-20">50-30-20 Rule</option>
                  <option value="70-20-10">70-20-10 Rule</option>
                  <option value="60-20-20">60-20-20 Rule</option>
                  <option value="custom">Custom Budget</option>
                </select>
                <small className="budget-input-help">
                  Choose your budgeting strategy
                </small>
              </div>
            </div>

            <div className="budget-input-row">
              <div className="budget-input-group">
                <label htmlFor="budget-housing" className="budget-input-label">
                  Housing ($):
                </label>
                <input
                  type="number"
                  id="budget-housing"
                  className="budget-input-field"
                  value={formData.housing}
                  onChange={(e) => handleInputChange('housing', e.target.value)}
                  placeholder="e.g., 1500"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Rent, mortgage, property tax
                </small>
              </div>

              <div className="budget-input-group">
                <label htmlFor="budget-transportation" className="budget-input-label">
                  Transportation ($):
                </label>
                <input
                  type="number"
                  id="budget-transportation"
                  className="budget-input-field"
                  value={formData.transportation}
                  onChange={(e) => handleInputChange('transportation', e.target.value)}
                  placeholder="e.g., 400"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Car payment, gas, maintenance
                </small>
              </div>
            </div>

            <div className="budget-input-row">
              <div className="budget-input-group">
                <label htmlFor="budget-food" className="budget-input-label">
                  Food ($):
                </label>
                <input
                  type="number"
                  id="budget-food"
                  className="budget-input-field"
                  value={formData.food}
                  onChange={(e) => handleInputChange('food', e.target.value)}
                  placeholder="e.g., 600"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Groceries, dining out
                </small>
              </div>

              <div className="budget-input-group">
                <label htmlFor="budget-utilities" className="budget-input-label">
                  Utilities ($):
                </label>
                <input
                  type="number"
                  id="budget-utilities"
                  className="budget-input-field"
                  value={formData.utilities}
                  onChange={(e) => handleInputChange('utilities', e.target.value)}
                  placeholder="e.g., 200"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Electricity, water, internet
                </small>
              </div>
            </div>

            <div className="budget-input-row">
              <div className="budget-input-group">
                <label htmlFor="budget-insurance" className="budget-input-label">
                  Insurance ($):
                </label>
                <input
                  type="number"
                  id="budget-insurance"
                  className="budget-input-field"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  placeholder="e.g., 300"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Health, auto, life insurance
                </small>
              </div>

              <div className="budget-input-group">
                <label htmlFor="budget-healthcare" className="budget-input-label">
                  Healthcare ($):
                </label>
                <input
                  type="number"
                  id="budget-healthcare"
                  className="budget-input-field"
                  value={formData.healthcare}
                  onChange={(e) => handleInputChange('healthcare', e.target.value)}
                  placeholder="e.g., 200"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Medical expenses, prescriptions
                </small>
              </div>
            </div>

            <div className="budget-input-row">
              <div className="budget-input-group">
                <label htmlFor="budget-entertainment" className="budget-input-label">
                  Entertainment ($):
                </label>
                <input
                  type="number"
                  id="budget-entertainment"
                  className="budget-input-field"
                  value={formData.entertainment}
                  onChange={(e) => handleInputChange('entertainment', e.target.value)}
                  placeholder="e.g., 300"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Movies, hobbies, subscriptions
                </small>
              </div>

              <div className="budget-input-group">
                <label htmlFor="budget-savings" className="budget-input-label">
                  Savings ($):
                </label>
                <input
                  type="number"
                  id="budget-savings"
                  className="budget-input-field"
                  value={formData.savings}
                  onChange={(e) => handleInputChange('savings', e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Emergency fund, investments
                </small>
              </div>
            </div>

            <div className="budget-input-row">
              <div className="budget-input-group">
                <label htmlFor="budget-debt" className="budget-input-label">
                  Debt Payments ($):
                </label>
                <input
                  type="number"
                  id="budget-debt"
                  className="budget-input-field"
                  value={formData.debt}
                  onChange={(e) => handleInputChange('debt', e.target.value)}
                  placeholder="e.g., 400"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Credit cards, loans, student debt
                </small>
              </div>

              <div className="budget-input-group">
                <label htmlFor="budget-other" className="budget-input-label">
                  Other Expenses ($):
                </label>
                <input
                  type="number"
                  id="budget-other"
                  className="budget-input-field"
                  value={formData.other}
                  onChange={(e) => handleInputChange('other', e.target.value)}
                  placeholder="e.g., 200"
                  min="0"
                  step="0.01"
                />
                <small className="budget-input-help">
                  Miscellaneous expenses
                </small>
              </div>
            </div>

            <div className="budget-calculator-actions">
              <button type="button" className="budget-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="budget-calculator-result">
              <h3 className="budget-result-title">Budget Analysis Results</h3>
              <div className="budget-result-content">
                <div className="budget-result-main">
                  <div className="budget-result-item">
                    <strong>Monthly Income:</strong>
                    <span className="budget-result-value">
                      {formatCurrency(result.monthlyIncome)}
                    </span>
                  </div>
                  <div className="budget-result-item">
                    <strong>Total Expenses:</strong>
                    <span className="budget-result-value">
                      {formatCurrency(result.totalExpenses)}
                    </span>
                  </div>
                  <div className="budget-result-item">
                    <strong>Remaining Amount:</strong>
                    <span className="budget-result-value">
                      {formatCurrency(result.remainingAmount)}
                    </span>
                  </div>
                  <div className="budget-result-item">
                    <strong>Budget Type:</strong>
                    <span className="budget-result-value">
                      {result.budgetType}
                    </span>
                  </div>
                  <div className="budget-result-item">
                    <strong>Budget Status:</strong>
                    <span className="budget-result-value budget-result-status">
                      {result.budgetStatus}
                    </span>
                  </div>
                  <div className="budget-result-item">
                    <strong>Savings Rate:</strong>
                    <span className="budget-result-value">
                      {formatPercentage(result.savingsRate)}
                    </span>
                  </div>
                </div>

                <div className="budget-result-breakdown">
                  <h4>Expense Breakdown</h4>
                  <div className="budget-breakdown-details">
                    <div className="budget-breakdown-item">
                      <span>Housing:</span>
                      <span>{formatCurrency(result.expenses.housing)} ({formatPercentage(result.percentages.housing)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Transportation:</span>
                      <span>{formatCurrency(result.expenses.transportation)} ({formatPercentage(result.percentages.transportation)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Food:</span>
                      <span>{formatCurrency(result.expenses.food)} ({formatPercentage(result.percentages.food)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Utilities:</span>
                      <span>{formatCurrency(result.expenses.utilities)} ({formatPercentage(result.percentages.utilities)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Insurance:</span>
                      <span>{formatCurrency(result.expenses.insurance)} ({formatPercentage(result.percentages.insurance)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Healthcare:</span>
                      <span>{formatCurrency(result.expenses.healthcare)} ({formatPercentage(result.percentages.healthcare)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Entertainment:</span>
                      <span>{formatCurrency(result.expenses.entertainment)} ({formatPercentage(result.percentages.entertainment)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Debt Payments:</span>
                      <span>{formatCurrency(result.expenses.debt)} ({formatPercentage(result.percentages.debt)})</span>
                    </div>
                    <div className="budget-breakdown-item">
                      <span>Other:</span>
                      <span>{formatCurrency(result.expenses.other)} ({formatPercentage(result.percentages.other)})</span>
                    </div>
                    <div className="budget-breakdown-item budget-total">
                      <span>Total Expenses:</span>
                      <span>{formatCurrency(result.totalExpenses)}</span>
                    </div>
                  </div>
                </div>

                <div className="budget-result-summary">
                  <h4>Budget Analysis</h4>
                  <div className="budget-summary-details">
                    <div className="budget-summary-item">
                      <span>Recommended Savings:</span>
                      <span>{formatCurrency(result.recommendedSavings)}</span>
                    </div>
                    <div className="budget-summary-item">
                      <span>Actual Savings:</span>
                      <span>{formatCurrency(result.expenses.savings)}</span>
                    </div>
                    <div className="budget-summary-item">
                      <span>Savings Gap:</span>
                      <span>{formatCurrency(result.savingsGap)}</span>
                    </div>
                    <div className="budget-summary-item">
                      <span>Budget Health Score:</span>
                      <span>{result.budgetHealthScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="budget-result-tip">
                  <i className="fas fa-lightbulb"></i>
                  <span>💡 Tip: Aim to save at least 20% of your income and keep housing costs under 30% for a healthy budget!</span>
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
            The Budget Calculator is a comprehensive financial planning tool that helps you create, 
            analyze, and optimize your personal budget. Whether you're following the popular 50-30-20 
            rule or creating a custom budget, this calculator provides detailed insights into your 
            spending patterns and financial health.
          </p>
          <p>
            By inputting your monthly income and expenses, you can track where your money goes, 
            identify areas for improvement, and ensure you're on track to meet your financial goals.
          </p>
        </ContentSection>

        <ContentSection id="what-is-budgeting" title="What is Budgeting?">
          <p>
            Budgeting is the process of creating a plan for your money. It involves tracking your 
            income and expenses to ensure you're spending within your means and working toward your 
            financial goals.
          </p>
          <ul>
            <li>
              <span><strong>Income:</strong> All money coming in each month (salary, freelance, investments)</span>
            </li>
            <li>
              <span><strong>Fixed Expenses:</strong> Regular, predictable costs (rent, insurance, loan payments)</span>
            </li>
            <li>
              <span><strong>Variable Expenses:</strong> Costs that change each month (food, entertainment, utilities)</span>
            </li>
            <li>
              <span><strong>Savings:</strong> Money set aside for future goals and emergencies</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Budget Calculator">
          <p>Using the budget calculator is simple and requires your financial information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Monthly Income:</strong> Input your total monthly income from all sources.</span>
            </li>
            <li>
              <span><strong>Choose Budget Type:</strong> Select from 50-30-20, 70-20-10, 60-20-20, or custom budget.</span>
            </li>
            <li>
              <span><strong>Add Expenses:</strong> Enter your monthly expenses in each category.</span>
            </li>
            <li>
              <span><strong>Include All Categories:</strong> Housing, transportation, food, utilities, insurance, healthcare, entertainment, savings, debt, and other expenses.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Budget" to see your analysis.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Track your actual expenses for a few months to get accurate 
            numbers for your budget calculations.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Budget Formulas & Methods">
          <div className="formula-section">
            <h3>50-30-20 Rule</h3>
            <div className="math-formula">
              Needs: 50% of Income | Wants: 30% of Income | Savings: 20% of Income
            </div>
            <p>This popular budgeting rule allocates income into three main categories.</p>
          </div>

          <div className="formula-section">
            <h3>Total Expenses Calculation</h3>
            <div className="math-formula">
              Total Expenses = Housing + Transportation + Food + Utilities + Insurance + Healthcare + Entertainment + Debt + Other
            </div>
            <p>This calculates your total monthly expenses across all categories.</p>
          </div>

          <div className="formula-section">
            <h3>Remaining Amount</h3>
            <div className="math-formula">
              Remaining = Monthly Income - Total Expenses
            </div>
            <p>This shows how much money you have left after all expenses.</p>
          </div>

          <div className="formula-section">
            <h3>Savings Rate</h3>
            <div className="math-formula">
              Savings Rate = (Savings ÷ Monthly Income) × 100
            </div>
            <p>This calculates what percentage of your income you're saving.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: 50-30-20 Budget</h3>
            <div className="example-solution">
              <p><strong>Monthly Income:</strong> $5,000</p>
              <p><strong>Needs (50%):</strong> $2,500</p>
              <p><strong>Wants (30%):</strong> $1,500</p>
              <p><strong>Savings (20%):</strong> $1,000</p>
              <p><strong>Budget Status:</strong> Balanced</p>
              <p><strong>Savings Rate:</strong> 20%</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: High Housing Costs</h3>
            <div className="example-solution">
              <p><strong>Monthly Income:</strong> $4,000</p>
              <p><strong>Housing:</strong> $1,800 (45%)</p>
              <p><strong>Other Expenses:</strong> $1,500</p>
              <p><strong>Savings:</strong> $700</p>
              <p><strong>Budget Status:</strong> Needs Adjustment</p>
              <p><strong>Savings Rate:</strong> 17.5%</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: Debt-Heavy Budget</h3>
            <div className="example-solution">
              <p><strong>Monthly Income:</strong> $3,500</p>
              <p><strong>Total Expenses:</strong> $3,200</p>
              <p><strong>Debt Payments:</strong> $800 (23%)</p>
              <p><strong>Savings:</strong> $300</p>
              <p><strong>Budget Status:</strong> Tight</p>
              <p><strong>Savings Rate:</strong> 8.6%</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="budget-types" title="Budget Types & Strategies">
          <div className="budget-types-grid">
            <div className="budget-type-item">
              <h4><i className="fas fa-chart-pie"></i> 50-30-20 Rule</h4>
              <p>Allocate 50% to needs, 30% to wants, and 20% to savings. Great for beginners and balanced financial planning.</p>
            </div>
            <div className="budget-type-item">
              <h4><i className="fas fa-piggy-bank"></i> 70-20-10 Rule</h4>
              <p>Spend 70% on living expenses, save 20%, and invest 10%. Good for those focusing on building wealth.</p>
            </div>
            <div className="budget-type-item">
              <h4><i className="fas fa-balance-scale"></i> 60-20-20 Rule</h4>
              <p>Use 60% for expenses, 20% for savings, and 20% for debt payments. Ideal for those with significant debt.</p>
            </div>
            <div className="budget-type-item">
              <h4><i className="fas fa-cogs"></i> Custom Budget</h4>
              <p>Create your own allocation based on your specific financial situation and goals.</p>
            </div>
            <div className="budget-type-item">
              <h4><i className="fas fa-envelope"></i> Envelope Method</h4>
              <p>Allocate cash to different envelopes for each spending category to control expenses.</p>
            </div>
            <div className="budget-type-item">
              <h4><i className="fas fa-chart-line"></i> Zero-Based Budget</h4>
              <p>Assign every dollar of income to a specific purpose, leaving zero unallocated money.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Budgeting is crucial for several reasons:</p>
          <ul>
            <li>
              <span>Helps you track where your money goes and identify spending patterns</span>
            </li>
            <li>
              <span>Ensures you're living within your means and not overspending</span>
            </li>
            <li>
              <span>Enables you to save for future goals and emergencies</span>
            </li>
            <li>
              <span>Reduces financial stress by providing a clear financial plan</span>
            </li>
            <li>
              <span>Helps you make informed decisions about spending and saving</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our Budget Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Multiple Budget Types:</strong> 50-30-20, 70-20-10, 60-20-20, and custom budgets</span>
            </li>
            <li>
              <span><strong>Expense Tracking:</strong> Detailed breakdown of all expense categories</span>
            </li>
            <li>
              <span><strong>Percentage Analysis:</strong> Shows what percentage of income goes to each category</span>
            </li>
            <li>
              <span><strong>Budget Health Score:</strong> Overall assessment of your budget's health</span>
            </li>
            <li>
              <span><strong>Savings Analysis:</strong> Compares actual vs. recommended savings</span>
            </li>
            <li>
              <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Personal Finance</h4>
              <p>Manage your personal budget and track household expenses</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-briefcase"></i> Business Planning</h4>
              <p>Create budgets for small businesses and freelance work</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Student Budgeting</h4>
              <p>Help students manage limited income and expenses</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-heart"></i> Family Planning</h4>
              <p>Plan budgets for growing families and major life changes</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-retirement"></i> Retirement Planning</h4>
              <p>Budget for retirement and plan for reduced income</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Financial Goals</h4>
              <p>Align your budget with specific financial objectives</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "What's the best budgeting method for beginners?",
              answer: "The 50-30-20 rule is excellent for beginners because it's simple and provides clear guidelines. Allocate 50% to needs, 30% to wants, and 20% to savings. As you get more comfortable, you can adjust these percentages or try other methods."
            },
            {
              question: "How much should I save each month?",
              answer: "Financial experts recommend saving at least 20% of your income, but start with whatever you can afford. Even saving 5-10% is better than nothing. Focus on building an emergency fund first, then save for other goals."
            },
            {
              question: "What percentage of my income should go to housing?",
              answer: "The general rule is to keep housing costs (rent or mortgage) under 30% of your gross income. However, in high-cost areas, this might be challenging. Try to keep it under 35% maximum to maintain financial flexibility."
            },
            {
              question: "How often should I review my budget?",
              answer: "Review your budget monthly to track your progress and make adjustments. Life changes, income fluctuations, and unexpected expenses may require budget modifications. Annual reviews help you set new financial goals."
            },
            {
              question: "What if my expenses exceed my income?",
              answer: "If you're spending more than you earn, you need to either increase your income or reduce expenses. Look for areas to cut back, consider a side hustle, or find ways to reduce fixed costs like housing or transportation."
            },
            {
              question: "Should I include irregular expenses in my budget?",
              answer: "Yes! Include irregular expenses like car maintenance, insurance premiums, and holiday gifts. Estimate these costs and divide by 12 to include them in your monthly budget, or create separate savings accounts for these expenses."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  );
}

export default BudgetCalculator;