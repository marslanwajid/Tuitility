import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import InsuranceCalculatorJS from '../../assets/js/finance/insurance-calculator.js'
import '../../assets/css/finance/insurance-calculator.css'

const InsuranceCalculator = () => {
  const [formData, setFormData] = useState({
    coverageAmount: '',
    premiumAmount: '',
    deductible: '',
    policyTerm: '12',
    insuranceType: 'auto',
    age: '',
    location: '',
    claimsHistory: 'none'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const insuranceCalc = new InsuranceCalculatorJS();
      setCalculator(insuranceCalc);
    } catch (error) {
      console.error('Error initializing insurance calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Insurance Calculator',
    description: 'Calculate insurance premiums, coverage costs, and policy comparisons. Get accurate insurance calculations for different types of coverage.',
    icon: 'fas fa-shield-alt',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Insurance Calculator']
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
    { name: 'Tax Calculator', url: '/finance/calculators/tax-calculator', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' },
    { name: 'Retirement Calculator', url: '/finance/calculators/retirement-calculator', icon: 'fas fa-piggy-bank' },
    { name: 'Investment Calculator', url: '/finance/calculators/investment-calculator', icon: 'fas fa-chart-line' },
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-insurance', title: 'What is Insurance?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Insurance Formulas & Methods' },
    { id: 'examples', title: 'Examples' },
    { id: 'types', title: 'Types of Insurance' },
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
        formData.coverageAmount,
        formData.premiumAmount,
        formData.deductible,
        formData.policyTerm,
        formData.insuranceType,
        formData.age,
        formData.location,
        formData.claimsHistory
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

  const calculateInsurance = () => {
    if (!validateInputs()) return;

    try {
      const {
        coverageAmount,
        premiumAmount,
        deductible,
        policyTerm,
        insuranceType,
        age,
        location,
        claimsHistory
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateInsurance(
        parseFloat(coverageAmount),
        parseFloat(premiumAmount),
        parseFloat(deductible),
        parseInt(policyTerm),
        insuranceType,
        parseInt(age || 0),
        location,
        claimsHistory
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
      coverageAmount: '',
      premiumAmount: '',
      deductible: '',
      policyTerm: '12',
      insuranceType: 'auto',
      age: '',
      location: '',
      claimsHistory: 'none'
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
        title="Insurance Calculator"
        onCalculate={calculateInsurance}
        calculateButtonText="Calculate Insurance"
        error={error}
        result={null}
      >
        <div className="insurance-calculator-form">
          <div className="insurance-input-row">
            <div className="insurance-input-group">
              <label htmlFor="insurance-coverage-amount" className="insurance-input-label">
                Coverage Amount ($):
              </label>
              <input
                type="number"
                id="insurance-coverage-amount"
                className="insurance-input-field"
                value={formData.coverageAmount}
                onChange={(e) => handleInputChange('coverageAmount', e.target.value)}
                placeholder="e.g., 50000"
                min="0"
                step="100"
              />
              <small className="insurance-input-help">
                Total coverage amount
              </small>
            </div>

            <div className="insurance-input-group">
              <label htmlFor="insurance-premium-amount" className="insurance-input-label">
                Premium Amount ($):
              </label>
              <input
                type="number"
                id="insurance-premium-amount"
                className="insurance-input-field"
                value={formData.premiumAmount}
                onChange={(e) => handleInputChange('premiumAmount', e.target.value)}
                placeholder="e.g., 1200"
                min="0"
                step="0.01"
              />
              <small className="insurance-input-help">
                Annual premium cost
              </small>
            </div>
          </div>

          <div className="insurance-input-row">
            <div className="insurance-input-group">
              <label htmlFor="insurance-deductible" className="insurance-input-label">
                Deductible ($):
              </label>
              <input
                type="number"
                id="insurance-deductible"
                className="insurance-input-field"
                value={formData.deductible}
                onChange={(e) => handleInputChange('deductible', e.target.value)}
                placeholder="e.g., 1000"
                min="0"
                step="100"
              />
              <small className="insurance-input-help">
                Out-of-pocket deductible
              </small>
            </div>

            <div className="insurance-input-group">
              <label htmlFor="insurance-policy-term" className="insurance-input-label">
                Policy Term (months):
              </label>
              <select
                id="insurance-policy-term"
                className="insurance-input-field insurance-select"
                value={formData.policyTerm}
                onChange={(e) => handleInputChange('policyTerm', e.target.value)}
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
              <small className="insurance-input-help">
                Policy duration
              </small>
            </div>
          </div>

          <div className="insurance-input-row">
            <div className="insurance-input-group">
              <label htmlFor="insurance-type" className="insurance-input-label">
                Insurance Type:
              </label>
              <select
                id="insurance-type"
                className="insurance-input-field insurance-select"
                value={formData.insuranceType}
                onChange={(e) => handleInputChange('insuranceType', e.target.value)}
              >
                <option value="auto">Auto Insurance</option>
                <option value="home">Home Insurance</option>
                <option value="health">Health Insurance</option>
                <option value="life">Life Insurance</option>
                <option value="disability">Disability Insurance</option>
                <option value="renters">Renters Insurance</option>
              </select>
              <small className="insurance-input-help">
                Type of insurance coverage
              </small>
            </div>

            <div className="insurance-input-group">
              <label htmlFor="insurance-age" className="insurance-input-label">
                Age (optional):
              </label>
              <input
                type="number"
                id="insurance-age"
                className="insurance-input-field"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="e.g., 35"
                min="18"
                max="100"
                step="1"
              />
              <small className="insurance-input-help">
                Your age (affects rates)
              </small>
            </div>
          </div>

          <div className="insurance-input-row">
            <div className="insurance-input-group">
              <label htmlFor="insurance-location" className="insurance-input-label">
                Location (optional):
              </label>
              <input
                type="text"
                id="insurance-location"
                className="insurance-input-field"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., California"
                maxLength="50"
              />
              <small className="insurance-input-help">
                State or region
              </small>
            </div>

            <div className="insurance-input-group">
              <label htmlFor="insurance-claims-history" className="insurance-input-label">
                Claims History:
              </label>
              <select
                id="insurance-claims-history"
                className="insurance-input-field insurance-select"
                value={formData.claimsHistory}
                onChange={(e) => handleInputChange('claimsHistory', e.target.value)}
              >
                <option value="none">No claims</option>
                <option value="low">Low risk (1-2 claims)</option>
                <option value="medium">Medium risk (3-5 claims)</option>
                <option value="high">High risk (5+ claims)</option>
              </select>
              <small className="insurance-input-help">
                Your claims history
              </small>
            </div>
          </div>

          <div className="insurance-calculator-actions">
            <button type="button" className="insurance-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="insurance-calculator-result">
            <h3 className="insurance-result-title">Insurance Calculation Results</h3>
            <div className="insurance-result-content">
              <div className="insurance-result-main">
                <div className="insurance-result-item">
                  <strong>Insurance Type:</strong>
                  <span className="insurance-result-value">
                    {result.insuranceType}
                  </span>
                </div>
                <div className="insurance-result-item">
                  <strong>Coverage Amount:</strong>
                  <span className="insurance-result-value">
                    {formatCurrency(result.coverageAmount)}
                  </span>
                </div>
                <div className="insurance-result-item">
                  <strong>Annual Premium:</strong>
                  <span className="insurance-result-value">
                    {formatCurrency(result.premiumAmount)}
                  </span>
                </div>
                <div className="insurance-result-item">
                  <strong>Deductible:</strong>
                  <span className="insurance-result-value">
                    {formatCurrency(result.deductible)}
                  </span>
                </div>
                <div className="insurance-result-item">
                  <strong>Policy Term:</strong>
                  <span className="insurance-result-value">
                    {result.policyTerm} months
                  </span>
                </div>
                <div className="insurance-result-item">
                  <strong>Monthly Premium:</strong>
                  <span className="insurance-result-value">
                    {formatCurrency(result.monthlyPremium)}
                  </span>
                </div>
                <div className="insurance-result-item">
                  <strong>Total Policy Cost:</strong>
                  <span className="insurance-result-value insurance-result-final">
                    {formatCurrency(result.totalPolicyCost)}
                  </span>
                </div>
              </div>

              <div className="insurance-result-breakdown">
                <h4>Cost Breakdown</h4>
                <div className="insurance-breakdown-details">
                  <div className="insurance-breakdown-item">
                    <span>Annual Premium:</span>
                    <span>{formatCurrency(result.premiumAmount)}</span>
                  </div>
                  <div className="insurance-breakdown-item">
                    <span>Policy Duration:</span>
                    <span>{result.policyTerm} months</span>
                  </div>
                  <div className="insurance-breakdown-item">
                    <span>Monthly Cost:</span>
                    <span>{formatCurrency(result.monthlyPremium)}</span>
                  </div>
                  <div className="insurance-breakdown-item insurance-total">
                    <span>Total Policy Cost:</span>
                    <span>{formatCurrency(result.totalPolicyCost)}</span>
                  </div>
                </div>
              </div>

              <div className="insurance-result-summary">
                <h4>Coverage Analysis</h4>
                <div className="insurance-summary-details">
                  <div className="insurance-summary-item">
                    <span>Coverage to Premium Ratio:</span>
                    <span>{result.coverageToPremiumRatio}</span>
                  </div>
                  <div className="insurance-summary-item">
                    <span>Deductible as % of Coverage:</span>
                    <span>{formatPercentage(result.deductiblePercentage)}</span>
                  </div>
                  <div className="insurance-summary-item">
                    <span>Risk Level:</span>
                    <span>{result.riskLevel}</span>
                  </div>
                  <div className="insurance-summary-item">
                    <span>Value Rating:</span>
                    <span>{result.valueRating}</span>
                  </div>
                </div>
              </div>

              <div className="insurance-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Compare multiple insurance providers to find the best coverage and rates for your needs!</span>
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
          The Insurance Calculator is a comprehensive financial tool that helps you analyze and compare 
          different insurance policies. Whether you're shopping for auto, home, health, life, or other 
          types of insurance, this calculator provides detailed insights into coverage costs, premiums, 
          and policy value.
        </p>
        <p>
          By inputting your coverage amount, premium costs, deductible, and other relevant factors, 
          you can evaluate the true cost of insurance and make informed decisions about your coverage 
          needs and budget.
        </p>
      </ContentSection>

      <ContentSection id="what-is-insurance" title="What is Insurance?">
        <p>
          Insurance is a financial product that provides protection against financial losses from 
          unexpected events. It works by transferring risk from individuals to insurance companies 
          in exchange for regular premium payments.
        </p>
        <ul>
          <li>
            <span><strong>Premium:</strong> Regular payments made to maintain insurance coverage</span>
          </li>
          <li>
            <span><strong>Coverage:</strong> The maximum amount the insurance company will pay for a claim</span>
          </li>
          <li>
            <span><strong>Deductible:</strong> The amount you must pay out-of-pocket before insurance coverage begins</span>
          </li>
          <li>
            <span><strong>Policy Term:</strong> The duration of the insurance policy</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Insurance Calculator">
        <p>Using the insurance calculator is straightforward and requires key policy information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Coverage Amount:</strong> Input the total coverage amount of your policy.</span>
          </li>
          <li>
            <span><strong>Set Premium Amount:</strong> Enter your annual premium cost.</span>
          </li>
          <li>
            <span><strong>Add Deductible:</strong> Enter your out-of-pocket deductible amount.</span>
          </li>
          <li>
            <span><strong>Select Policy Term:</strong> Choose the duration of your policy.</span>
          </li>
          <li>
            <span><strong>Choose Insurance Type:</strong> Select the type of insurance you're analyzing.</span>
          </li>
          <li>
            <span><strong>Add Optional Details:</strong> Include age, location, and claims history for more accurate analysis.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Insurance" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Compare multiple policies using the same inputs to find the best value 
          for your insurance needs.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Insurance Formulas & Methods">
        <div className="formula-section">
          <h3>Monthly Premium Calculation</h3>
          <div className="math-formula">
            Monthly Premium = Annual Premium ÷ 12
          </div>
          <p>This calculates your monthly insurance cost from the annual premium.</p>
        </div>

        <div className="formula-section">
          <h3>Total Policy Cost</h3>
          <div className="math-formula">
            Total Policy Cost = Annual Premium × (Policy Term ÷ 12)
          </div>
          <p>This calculates the total cost of your insurance policy over its duration.</p>
        </div>

        <div className="formula-section">
          <h3>Coverage to Premium Ratio</h3>
          <div className="math-formula">
            Coverage to Premium Ratio = Coverage Amount ÷ Annual Premium
          </div>
          <p>This shows how much coverage you get per dollar of premium paid.</p>
        </div>

        <div className="formula-section">
          <h3>Deductible Percentage</h3>
          <div className="math-formula">
            Deductible % = (Deductible ÷ Coverage Amount) × 100
          </div>
          <p>This shows what percentage of your coverage is your deductible.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Auto Insurance</h3>
          <div className="example-solution">
            <p><strong>Coverage Amount:</strong> $50,000</p>
            <p><strong>Annual Premium:</strong> $1,200</p>
            <p><strong>Deductible:</strong> $1,000</p>
            <p><strong>Policy Term:</strong> 12 months</p>
            <p><strong>Monthly Premium:</strong> $100</p>
            <p><strong>Total Policy Cost:</strong> $1,200</p>
            <p><strong>Coverage to Premium Ratio:</strong> 41.67:1</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Home Insurance</h3>
          <div className="example-solution">
            <p><strong>Coverage Amount:</strong> $300,000</p>
            <p><strong>Annual Premium:</strong> $1,800</p>
            <p><strong>Deductible:</strong> $2,500</p>
            <p><strong>Policy Term:</strong> 12 months</p>
            <p><strong>Monthly Premium:</strong> $150</p>
            <p><strong>Total Policy Cost:</strong> $1,800</p>
            <p><strong>Coverage to Premium Ratio:</strong> 166.67:1</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: Life Insurance</h3>
          <div className="example-solution">
            <p><strong>Coverage Amount:</strong> $500,000</p>
            <p><strong>Annual Premium:</strong> $600</p>
            <p><strong>Deductible:</strong> $0</p>
            <p><strong>Policy Term:</strong> 12 months</p>
            <p><strong>Monthly Premium:</strong> $50</p>
            <p><strong>Total Policy Cost:</strong> $600</p>
            <p><strong>Coverage to Premium Ratio:</strong> 833.33:1</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="types" title="Types of Insurance">
        <div className="types-grid">
          <div className="type-item">
            <h4><i className="fas fa-car"></i> Auto Insurance</h4>
            <p>Protects against financial loss from vehicle accidents, theft, and damage. Required in most states.</p>
          </div>
          <div className="type-item">
            <h4><i className="fas fa-home"></i> Home Insurance</h4>
            <p>Covers damage to your home and belongings from disasters, theft, and liability claims.</p>
          </div>
          <div className="type-item">
            <h4><i className="fas fa-heartbeat"></i> Health Insurance</h4>
            <p>Helps pay for medical expenses, including doctor visits, hospital stays, and prescription drugs.</p>
          </div>
          <div className="type-item">
            <h4><i className="fas fa-user"></i> Life Insurance</h4>
            <p>Provides financial protection for your family in case of your death.</p>
          </div>
          <div className="type-item">
            <h4><i className="fas fa-wheelchair"></i> Disability Insurance</h4>
            <p>Replaces a portion of your income if you become unable to work due to illness or injury.</p>
          </div>
          <div className="type-item">
            <h4><i className="fas fa-key"></i> Renters Insurance</h4>
            <p>Protects your personal belongings and provides liability coverage when renting.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding insurance calculations is crucial for several reasons:</p>
        <ul>
          <li>
            <span>Helps you compare different insurance policies and providers</span>
          </li>
          <li>
            <span>Enables you to budget for insurance costs accurately</span>
          </li>
          <li>
            <span>Shows the true value and cost-effectiveness of coverage</span>
          </li>
          <li>
            <span>Helps you choose appropriate coverage levels and deductibles</span>
          </li>
          <li>
            <span>Essential for comprehensive financial planning and risk management</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Insurance Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Multiple Insurance Types:</strong> Auto, home, health, life, disability, and renters insurance</span>
          </li>
          <li>
            <span><strong>Cost Analysis:</strong> Monthly premiums, total policy costs, and coverage ratios</span>
          </li>
          <li>
            <span><strong>Risk Assessment:</strong> Evaluates risk levels based on age, location, and claims history</span>
          </li>
          <li>
            <span><strong>Value Rating:</strong> Provides overall value assessment of insurance policies</span>
          </li>
          <li>
            <span><strong>Policy Comparison:</strong> Compare different policies and coverage options</span>
          </li>
          <li>
            <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="applications" title="Applications">
        <div className="applications-grid">
          <div className="application-item">
            <h4><i className="fas fa-search"></i> Policy Comparison</h4>
            <p>Compare different insurance policies to find the best coverage and rates</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Budget Planning</h4>
            <p>Calculate insurance costs for accurate monthly and annual budgeting</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Coverage Analysis</h4>
            <p>Analyze coverage amounts, deductibles, and premium relationships</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-shield-alt"></i> Risk Assessment</h4>
            <p>Evaluate risk levels and determine appropriate coverage amounts</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-dollar-sign"></i> Cost Optimization</h4>
            <p>Find the optimal balance between coverage and premium costs</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-file-contract"></i> Policy Review</h4>
            <p>Review existing policies and identify potential savings opportunities</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How much insurance coverage do I need?",
            answer: "Coverage needs vary by insurance type and personal circumstances. For auto insurance, consider your state's minimum requirements and your assets. For life insurance, consider 10-12 times your annual income. For home insurance, ensure coverage equals your home's replacement cost."
          },
          {
            question: "What's the difference between a high and low deductible?",
            answer: "A high deductible means you pay more out-of-pocket before insurance kicks in, but you'll have lower premiums. A low deductible means higher premiums but less out-of-pocket cost when you file a claim. Choose based on your financial situation and risk tolerance."
          },
          {
            question: "How often should I review my insurance policies?",
            answer: "Review your insurance policies annually or when major life events occur (marriage, birth, home purchase, job change). This ensures your coverage remains adequate and you're getting competitive rates."
          },
          {
            question: "What factors affect insurance premiums?",
            answer: "Factors include age, location, claims history, credit score, coverage amounts, deductibles, and the type of insurance. Some factors you can control (deductible, coverage), while others you cannot (age, location)."
          },
          {
            question: "Should I bundle multiple insurance policies?",
            answer: "Bundling (getting multiple policies from the same company) often provides discounts of 5-25%. However, always compare bundled rates with individual policies from different providers to ensure you're getting the best overall value."
          },
          {
            question: "How can I lower my insurance premiums?",
            answer: "Ways to lower premiums include increasing deductibles, maintaining good credit, taking advantage of discounts, bundling policies, improving home security, and maintaining a clean claims history. Always balance premium savings with adequate coverage."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default InsuranceCalculator
