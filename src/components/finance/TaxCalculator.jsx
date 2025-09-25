import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import TaxCalculatorJS from '../../assets/js/finance/tax-calculator.js'
import '../../assets/css/finance/tax-calculator.css'

const TaxCalculator = () => {
  const [formData, setFormData] = useState({
    grossIncome: '',
    filingStatus: 'single',
    state: 'CA',
    deductions: '',
    exemptions: '',
    additionalIncome: '',
    taxCredits: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const taxCalc = new TaxCalculatorJS();
      setCalculator(taxCalc);
    } catch (error) {
      console.error('Error initializing tax calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Tax Calculator',
    description: 'Calculate federal and state income taxes, deductions, and credits. Get accurate tax estimates for different filing statuses and income levels.',
    icon: 'fas fa-file-invoice-dollar',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Tax Calculator']
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
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-line' },
    { name: 'Retirement Calculator', url: '/finance/calculators/retirement-calculator', icon: 'fas fa-piggy-bank' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' },
    { name: 'ROI Calculator', url: '/finance/calculators/roi-calculator', icon: 'fas fa-chart-line' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-tax', title: 'What is Income Tax?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Tax Formulas & Methods' },
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
        formData.grossIncome,
        formData.filingStatus,
        formData.state,
        formData.deductions,
        formData.exemptions,
        formData.additionalIncome,
        formData.taxCredits
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

  const calculateTax = () => {
    if (!validateInputs()) return;

    try {
      const {
        grossIncome,
        filingStatus,
        state,
        deductions,
        exemptions,
        additionalIncome,
        taxCredits
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateTax(
        parseFloat(grossIncome),
        filingStatus,
        state,
        parseFloat(deductions) || 0,
        parseFloat(exemptions) || 0,
        parseFloat(additionalIncome) || 0,
        parseFloat(taxCredits) || 0
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
      grossIncome: '',
      filingStatus: 'single',
      state: 'CA',
      deductions: '',
      exemptions: '',
      additionalIncome: '',
      taxCredits: ''
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

  return (
    <ToolPageLayout 
      toolData={toolData} 
      tableOfContents={tableOfContents}
      categories={categories}
      relatedTools={relatedTools}
    >
      <CalculatorSection 
        title="Tax Calculator"
        onCalculate={calculateTax}
        calculateButtonText="Calculate Tax"
        error={error}
        result={null}
      >
        <div className="tax-calculator-form">
          <div className="tax-input-row">
            <div className="tax-input-group">
              <label htmlFor="tax-gross-income" className="tax-input-label">
                Gross Annual Income ($):
              </label>
              <input
                type="number"
                id="tax-gross-income"
                className="tax-input-field"
                value={formData.grossIncome}
                onChange={(e) => handleInputChange('grossIncome', e.target.value)}
                placeholder="e.g., 75000"
                min="0"
                step="1000"
              />
              <small className="tax-input-help">
                Your total annual income before taxes
              </small>
            </div>

            <div className="tax-input-group">
              <label htmlFor="tax-filing-status" className="tax-input-label">
                Filing Status:
              </label>
              <select
                id="tax-filing-status"
                className="tax-input-field tax-select-field"
                value={formData.filingStatus}
                onChange={(e) => handleInputChange('filingStatus', e.target.value)}
              >
                <option value="single">Single</option>
                <option value="married-joint">Married Filing Jointly</option>
                <option value="married-separate">Married Filing Separately</option>
                <option value="head-household">Head of Household</option>
              </select>
              <small className="tax-input-help">
                Your tax filing status
              </small>
            </div>
          </div>

          <div className="tax-input-row">
            <div className="tax-input-group">
              <label htmlFor="tax-state" className="tax-input-label">
                State:
              </label>
              <select
                id="tax-state"
                className="tax-input-field tax-select-field"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              >
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="WA">Washington</option>
                <option value="NV">Nevada</option>
                <option value="other">Other State</option>
              </select>
              <small className="tax-input-help">
                Your state of residence
              </small>
            </div>

            <div className="tax-input-group">
              <label htmlFor="tax-deductions" className="tax-input-label">
                Itemized Deductions ($):
              </label>
              <input
                type="number"
                id="tax-deductions"
                className="tax-input-field"
                value={formData.deductions}
                onChange={(e) => handleInputChange('deductions', e.target.value)}
                placeholder="e.g., 12000"
                min="0"
                step="100"
              />
              <small className="tax-input-help">
                Total itemized deductions (optional)
              </small>
            </div>
          </div>

          <div className="tax-input-row">
            <div className="tax-input-group">
              <label htmlFor="tax-exemptions" className="tax-input-label">
                Personal Exemptions ($):
              </label>
              <input
                type="number"
                id="tax-exemptions"
                className="tax-input-field"
                value={formData.exemptions}
                onChange={(e) => handleInputChange('exemptions', e.target.value)}
                placeholder="e.g., 4000"
                min="0"
                step="100"
              />
              <small className="tax-input-help">
                Personal and dependent exemptions
              </small>
            </div>

            <div className="tax-input-group">
              <label htmlFor="tax-additional-income" className="tax-input-label">
                Additional Income ($):
              </label>
              <input
                type="number"
                id="tax-additional-income"
                className="tax-input-field"
                value={formData.additionalIncome}
                onChange={(e) => handleInputChange('additionalIncome', e.target.value)}
                placeholder="e.g., 5000"
                min="0"
                step="100"
              />
              <small className="tax-input-help">
                Interest, dividends, capital gains (optional)
              </small>
            </div>
          </div>

          <div className="tax-input-row">
            <div className="tax-input-group">
              <label htmlFor="tax-credits" className="tax-input-label">
                Tax Credits ($):
              </label>
              <input
                type="number"
                id="tax-credits"
                className="tax-input-field"
                value={formData.taxCredits}
                onChange={(e) => handleInputChange('taxCredits', e.target.value)}
                placeholder="e.g., 2000"
                min="0"
                step="100"
              />
              <small className="tax-input-help">
                Child tax credit, education credits, etc.
              </small>
            </div>

            <div className="tax-input-group">
              <div className="tax-input-spacer"></div>
            </div>
          </div>

          <div className="tax-calculator-actions">
            <button type="button" className="tax-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="tax-calculator-result">
            <h3 className="tax-result-title">Tax Calculation Results</h3>
            <div className="tax-result-content">
              <div className="tax-result-main">
                <div className="tax-result-item">
                  <strong>Gross Income:</strong>
                  <span className="tax-result-value">
                    {formatCurrency(result.grossIncome)}
                  </span>
                </div>
                <div className="tax-result-item">
                  <strong>Taxable Income:</strong>
                  <span className="tax-result-value">
                    {formatCurrency(result.taxableIncome)}
                  </span>
                </div>
                <div className="tax-result-item">
                  <strong>Federal Tax:</strong>
                  <span className="tax-result-value">
                    {formatCurrency(result.federalTax)}
                  </span>
                </div>
                <div className="tax-result-item">
                  <strong>State Tax:</strong>
                  <span className="tax-result-value">
                    {formatCurrency(result.stateTax)}
                  </span>
                </div>
                <div className="tax-result-item">
                  <strong>Total Tax:</strong>
                  <span className="tax-result-value tax-result-final">
                    {formatCurrency(result.totalTax)}
                  </span>
                </div>
                <div className="tax-result-item">
                  <strong>After-Tax Income:</strong>
                  <span className="tax-result-value">
                    {formatCurrency(result.afterTaxIncome)}
                  </span>
                </div>
              </div>

              <div className="tax-result-breakdown">
                <h4>Tax Breakdown</h4>
                <div className="tax-breakdown-details">
                  <div className="tax-breakdown-item">
                    <span>Gross Income:</span>
                    <span>{formatCurrency(result.grossIncome)}</span>
                  </div>
                  <div className="tax-breakdown-item">
                    <span>Standard Deduction:</span>
                    <span>{formatCurrency(result.standardDeduction)}</span>
                  </div>
                  <div className="tax-breakdown-item">
                    <span>Itemized Deductions:</span>
                    <span>{formatCurrency(result.itemizedDeductions)}</span>
                  </div>
                  <div className="tax-breakdown-item">
                    <span>Personal Exemptions:</span>
                    <span>{formatCurrency(result.personalExemptions)}</span>
                  </div>
                  <div className="tax-breakdown-item tax-total">
                    <span>Taxable Income:</span>
                    <span>{formatCurrency(result.taxableIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="tax-result-rates">
                <h4>Effective Tax Rates</h4>
                <div className="tax-rates-details">
                  <div className="tax-rates-item">
                    <span>Federal Tax Rate:</span>
                    <span>{formatPercentage(result.federalTaxRate)}</span>
                  </div>
                  <div className="tax-rates-item">
                    <span>State Tax Rate:</span>
                    <span>{formatPercentage(result.stateTaxRate)}</span>
                  </div>
                  <div className="tax-rates-item">
                    <span>Total Tax Rate:</span>
                    <span>{formatPercentage(result.totalTaxRate)}</span>
                  </div>
                </div>
              </div>

              <div className="tax-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Consider maximizing deductions and credits to reduce your tax burden!</span>
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
          The Tax Calculator is an essential financial planning tool that helps you estimate your 
          federal and state income taxes. Whether you're planning your budget, preparing for tax 
          season, or making financial decisions, this calculator provides accurate tax estimates 
          based on current tax brackets and rates.
        </p>
        <p>
          By inputting your income, filing status, deductions, and credits, you can get a clear 
          picture of your tax liability and after-tax income. This helps you make informed decisions 
          about investments, retirement planning, and other financial strategies.
        </p>
      </ContentSection>

      <ContentSection id="what-is-tax" title="What is Income Tax?">
        <p>
          Income tax is a tax imposed on individuals based on their income. The United States uses 
          a progressive tax system, meaning higher income earners pay a higher percentage of their 
          income in taxes. Understanding how income tax works is crucial for financial planning.
        </p>
        <ul>
          <li>
            <span><strong>Progressive Tax System:</strong> Tax rates increase as income increases</span>
          </li>
          <li>
            <span><strong>Tax Brackets:</strong> Different portions of income are taxed at different rates</span>
          </li>
          <li>
            <span><strong>Deductions:</strong> Reduce your taxable income, lowering your tax bill</span>
          </li>
          <li>
            <span><strong>Credits:</strong> Directly reduce the amount of tax you owe</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Tax Calculator">
        <p>Using the tax calculator is straightforward and requires just a few key pieces of information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Gross Income:</strong> Input your total annual income before taxes.</span>
          </li>
          <li>
            <span><strong>Select Filing Status:</strong> Choose your tax filing status (single, married, etc.).</span>
          </li>
          <li>
            <span><strong>Choose State:</strong> Select your state of residence for state tax calculation.</span>
          </li>
          <li>
            <span><strong>Add Deductions:</strong> Enter any itemized deductions you plan to claim.</span>
          </li>
          <li>
            <span><strong>Include Exemptions:</strong> Add personal and dependent exemptions.</span>
          </li>
          <li>
            <span><strong>Add Additional Income:</strong> Include interest, dividends, or capital gains.</span>
          </li>
          <li>
            <span><strong>Enter Tax Credits:</strong> Include any applicable tax credits.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Tax" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Use conservative estimates and consider consulting a tax professional 
          for complex situations or major life changes.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Tax Formulas & Methods">
        <div className="formula-section">
          <h3>Taxable Income Calculation</h3>
          <div className="math-formula">
            Taxable Income = Gross Income - Deductions - Exemptions
          </div>
          <p>This is the amount of income subject to taxation after all allowable deductions and exemptions.</p>
        </div>

        <div className="formula-section">
          <h3>Progressive Tax Calculation</h3>
          <div className="math-formula">
            Tax = Σ (Taxable Income in Bracket × Tax Rate for Bracket)
          </div>
          <p>Each portion of your income is taxed at the rate for its corresponding tax bracket.</p>
        </div>

        <div className="formula-section">
          <h3>Effective Tax Rate</h3>
          <div className="math-formula">
            Effective Rate = Total Tax ÷ Gross Income × 100%
          </div>
          <p>This shows the average percentage of your income that goes to taxes.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Single Filer</h3>
          <div className="example-solution">
            <p><strong>Gross Income:</strong> $60,000</p>
            <p><strong>Filing Status:</strong> Single</p>
            <p><strong>State:</strong> California</p>
            <p><strong>Result:</strong> $8,500 total tax</p>
            <p><strong>After-Tax Income:</strong> $51,500</p>
            <p><strong>Effective Tax Rate:</strong> 14.2%</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Married Filing Jointly</h3>
          <div className="example-solution">
            <p><strong>Gross Income:</strong> $120,000</p>
            <p><strong>Filing Status:</strong> Married Filing Jointly</p>
            <p><strong>State:</strong> Texas (no state income tax)</p>
            <p><strong>Result:</strong> $15,200 total tax</p>
            <p><strong>After-Tax Income:</strong> $104,800</p>
            <p><strong>Effective Tax Rate:</strong> 12.7%</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: With Deductions and Credits</h3>
          <div className="example-solution">
            <p><strong>Gross Income:</strong> $80,000</p>
            <p><strong>Itemized Deductions:</strong> $15,000</p>
            <p><strong>Tax Credits:</strong> $3,000</p>
            <p><strong>Result:</strong> $9,800 total tax</p>
            <p><strong>After-Tax Income:</strong> $70,200</p>
            <p><strong>Tax Savings:</strong> $2,200 from credits</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding tax calculations is crucial for financial success:</p>
        <ul>
          <li>
            <span>Helps you plan your budget and cash flow</span>
          </li>
          <li>
            <span>Enables better retirement and investment planning</span>
          </li>
          <li>
            <span>Shows the impact of different financial decisions on your tax burden</span>
          </li>
          <li>
            <span>Helps you maximize deductions and credits</span>
          </li>
          <li>
            <span>Essential for accurate financial projections and goal setting</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Tax Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Federal Tax Calculation:</strong> Uses current tax brackets and rates</span>
          </li>
          <li>
            <span><strong>State Tax Calculation:</strong> Includes state-specific tax rates</span>
          </li>
          <li>
            <span><strong>Deduction Optimization:</strong> Compares standard vs. itemized deductions</span>
          </li>
          <li>
            <span><strong>Credit Application:</strong> Applies tax credits to reduce tax liability</span>
          </li>
          <li>
            <span><strong>Effective Rate Calculation:</strong> Shows your true tax burden</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Budget Planning</h4>
            <p>Plan your monthly budget with accurate after-tax income estimates</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-piggy-bank"></i> Retirement Planning</h4>
            <p>Calculate tax implications of different retirement account contributions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Investment Strategy</h4>
            <p>Understand tax consequences of different investment decisions</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-home"></i> Real Estate Planning</h4>
            <p>Calculate tax benefits of homeownership and mortgage interest</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-graduation-cap"></i> Education Planning</h4>
            <p>Plan for education expenses and available tax benefits</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Career Decisions</h4>
            <p>Evaluate the tax impact of salary changes and job offers</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "What's the difference between marginal and effective tax rates?",
            answer: "Your marginal tax rate is the rate you pay on your last dollar of income, while your effective tax rate is the average rate you pay on all your income. The effective rate is typically lower due to the progressive tax system."
          },
          {
            question: "Should I take the standard deduction or itemize?",
            answer: "You should choose whichever gives you the larger deduction. For most people, the standard deduction is higher, but if you have significant mortgage interest, charitable contributions, or other itemized deductions, itemizing might save you more."
          },
          {
            question: "How do tax credits differ from deductions?",
            answer: "Deductions reduce your taxable income, while tax credits directly reduce the amount of tax you owe. Credits are generally more valuable because they provide a dollar-for-dollar reduction in your tax bill."
          },
          {
            question: "What's the difference between federal and state taxes?",
            answer: "Federal taxes are paid to the U.S. government and fund national programs, while state taxes are paid to your state government and fund state programs. Some states have no income tax, while others have rates comparable to federal rates."
          },
          {
            question: "How accurate are these tax calculations?",
            answer: "Our calculator provides estimates based on current tax brackets and rates. Actual taxes may vary due to changes in tax law, specific circumstances, or additional factors not included in the calculation."
          },
          {
            question: "When should I consult a tax professional?",
            answer: "Consider consulting a tax professional if you have complex financial situations, own a business, have significant investments, or are going through major life changes like marriage, divorce, or retirement."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default TaxCalculator
