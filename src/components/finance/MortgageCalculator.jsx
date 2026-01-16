import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import { MortgageCalculator as MortgageCalculatorJS } from '../../assets/js/finance/mortgage-calculator.js'
import '../../assets/css/finance/mortgage-calculator.css'
import Seo from '../Seo'

const MortgageCalculator = () => {
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '30',
    downPayment: '',
    propertyTax: '',
    insurance: '',
    pmi: '',
    hoaFees: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const mortgageCalc = new MortgageCalculatorJS();
      setCalculator(mortgageCalc);
    } catch (error) {
      console.error('Error initializing mortgage calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Mortgage Calculator',
    description: 'Calculate monthly mortgage payments with detailed breakdowns including taxes, insurance, PMI, and HOA fees. Perfect for homebuyers planning their purchase.',
    icon: 'fas fa-home',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Mortgage Calculator']
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, home loan, pmi, amortization`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/mortgage-calculator`;

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
    { name: 'Loan Calculator', url: '/finance/calculators/loan-calculator', icon: 'fas fa-hand-holding-usd' },
    { name: 'Currency Calculator', url: '/finance/calculators/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Percentage Calculator', url: '/math/calculators/percentage-calculator', icon: 'fas fa-percentage' },
    { name: 'Fraction Calculator', url: '/math/calculators/fraction-calculator', icon: 'fas fa-divide' },
    { name: 'SSE Calculator', url: '/math/calculators/sse-calculator', icon: 'fas fa-chart-line' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-mortgage', title: 'What is a Mortgage Calculator?' },
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
        formData.loanAmount,
        formData.interestRate,
        formData.loanTerm,
        formData.downPayment
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

  const calculateMortgage = () => {
    if (!validateInputs()) return;

    try {
      const {
        loanAmount,
        interestRate,
        loanTerm,
        downPayment,
        propertyTax,
        insurance,
        pmi,
        hoaFees
      } = formData;

      let result;
      
      if (showAdvanced) {
        // Use advanced calculation from JS file
        result = calculator.calculateAdvancedMortgage(
          parseFloat(loanAmount),
          parseFloat(interestRate),
          parseInt(loanTerm),
          parseFloat(downPayment) || 0,
          parseFloat(propertyTax) || 0,
          parseFloat(insurance) || 0,
          parseFloat(pmi) || 0,
          parseFloat(hoaFees) || 0
        );
      } else {
        // Use basic calculation from JS file
        result = calculator.calculateBasicMortgage(
          parseFloat(loanAmount),
          parseFloat(interestRate),
          parseInt(loanTerm)
        );
      }

      // Transform the result to match our component's expected format
      const transformedResult = {
        principalAndInterest: result.monthlyPayment || result.principalAndInterest,
        monthlyPropertyTax: result.monthlyPropertyTax || 0,
        monthlyInsurance: result.monthlyInsurance || 0,
        monthlyPMI: result.monthlyPMI || 0,
        hoaFees: result.hoaFees || 0,
        totalMonthlyPayment: result.totalMonthlyPayment || result.monthlyPayment,
        totalInterest: result.totalInterest,
        totalOfPayments: result.totalPayments || result.totalOfPayments,
        downPayment: parseFloat(downPayment) || 0,
        loanToValueRatio: result.loanToValueRatio || 100,
        actualLoanAmount: result.actualLoanAmount || parseFloat(loanAmount),
        principal: parseFloat(loanAmount),
        numberOfPayments: result.numberOfPayments,
        isAdvanced: showAdvanced
      };

      setResult(transformedResult);
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
      loanTerm: '30',
      downPayment: '',
      propertyTax: '',
      insurance: '',
      pmi: '',
      hoaFees: ''
    });
    setShowAdvanced(false);
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
          title="Mortgage Calculator"
          onCalculate={calculateMortgage}
          calculateButtonText="Calculate Mortgage"
          error={error}
          result={null}
        >
          <div className="mortgage-calculator-form">
            {/* Basic Fields */}
            <div className="mortgage-input-row">
              <div className="mortgage-input-group">
                <label htmlFor="mortgage-loan-amount" className="mortgage-input-label">
                  Loan Amount ($):
                </label>
                <input
                  type="number"
                  id="mortgage-loan-amount"
                  className="mortgage-input-field"
                  value={formData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                  placeholder="e.g., 300000"
                  min="0"
                  step="1000"
                />
                <small className="mortgage-input-help">
                  Total amount you want to borrow
                </small>
              </div>

              <div className="mortgage-input-group">
                <label htmlFor="mortgage-interest-rate" className="mortgage-input-label">
                  Interest Rate (%):
                </label>
                <input
                  type="number"
                  id="mortgage-interest-rate"
                  className="mortgage-input-field"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  placeholder="e.g., 4.5"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <small className="mortgage-input-help">
                  Annual interest rate
                </small>
              </div>
            </div>

            <div className="mortgage-input-row">
              <div className="mortgage-input-group">
                <label htmlFor="mortgage-loan-term" className="mortgage-input-label">
                  Loan Term (Years):
                </label>
                <select
                  id="mortgage-loan-term"
                  className="mortgage-input-field"
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

              <div className="mortgage-input-group">
                <label htmlFor="mortgage-down-payment" className="mortgage-input-label">
                  Down Payment ($):
                </label>
                <input
                  type="number"
                  id="mortgage-down-payment"
                  className="mortgage-input-field"
                  value={formData.downPayment}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  placeholder="e.g., 60000"
                  min="0"
                  step="1000"
                />
                <small className="mortgage-input-help">
                  Optional: Reduces loan amount
                </small>
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="mortgage-checkbox-group">
              <label className="mortgage-checkbox-label">
                <input
                  type="checkbox"
                  id="mortgage-advanced-toggle"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                />
                <span className="mortgage-checkmark"></span>
                Advanced Calculator (Include taxes, insurance, PMI, HOA)
              </label>
            </div>

            {/* Advanced Fields */}
            {showAdvanced && (
              <div className="mortgage-advanced-fields">
                <h3>Additional Monthly Costs</h3>
                <div className="mortgage-input-row">
                  <div className="mortgage-input-group">
                    <label htmlFor="mortgage-property-tax" className="mortgage-input-label">
                      Annual Property Tax ($):
                    </label>
                    <input
                      type="number"
                      id="mortgage-property-tax"
                      className="mortgage-input-field"
                      value={formData.propertyTax}
                      onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                      placeholder="e.g., 3600"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="mortgage-input-group">
                    <label htmlFor="mortgage-insurance" className="mortgage-input-label">
                      Annual Insurance ($):
                    </label>
                    <input
                      type="number"
                      id="mortgage-insurance"
                      className="mortgage-input-field"
                      value={formData.insurance}
                      onChange={(e) => handleInputChange('insurance', e.target.value)}
                      placeholder="e.g., 1200"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div className="mortgage-input-row">
                  <div className="mortgage-input-group">
                    <label htmlFor="mortgage-pmi" className="mortgage-input-label">
                      PMI Rate (%):
                    </label>
                    <input
                      type="number"
                      id="mortgage-pmi"
                      className="mortgage-input-field"
                      value={formData.pmi}
                      onChange={(e) => handleInputChange('pmi', e.target.value)}
                      placeholder="e.g., 0.5"
                      min="0"
                      max="2"
                      step="0.1"
                    />
                    <small className="mortgage-input-help">
                      Required if down payment &lt; 20%
                    </small>
                  </div>

                  <div className="mortgage-input-group">
                    <label htmlFor="mortgage-hoa-fees" className="mortgage-input-label">
                      Monthly HOA Fees ($):
                    </label>
                    <input
                      type="number"
                      id="mortgage-hoa-fees"
                      className="mortgage-input-field"
                      value={formData.hoaFees}
                      onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                      placeholder="e.g., 200"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mortgage-calculator-actions">
              <button type="button" className="mortgage-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </div>

          {/* Custom Results Section */}
          {result && (
            <div className="mortgage-calculator-result">
              <h3 className="mortgage-result-title">Mortgage Calculation Results</h3>
              <div className="mortgage-result-content">
                {result.isAdvanced ? (
                  <>
                    <div className="mortgage-result-main">
                      <div className="mortgage-result-item">
                        <strong>Monthly Payment Breakdown:</strong>
                        <div className="mortgage-payment-breakdown">
                          <div className="mortgage-breakdown-item">
                            <span>Principal & Interest:</span>
                            <span className="mortgage-amount">{formatCurrency(result.principalAndInterest)}</span>
                          </div>
                          <div className="mortgage-breakdown-item">
                            <span>Property Tax:</span>
                            <span className="mortgage-amount">{formatCurrency(result.monthlyPropertyTax)}</span>
                          </div>
                          <div className="mortgage-breakdown-item">
                            <span>Insurance:</span>
                            <span className="mortgage-amount">{formatCurrency(result.monthlyInsurance)}</span>
                          </div>
                          <div className="mortgage-breakdown-item">
                            <span>PMI:</span>
                            <span className="mortgage-amount">{formatCurrency(result.monthlyPMI)}</span>
                          </div>
                          <div className="mortgage-breakdown-item">
                            <span>HOA Fees:</span>
                            <span className="mortgage-amount">{formatCurrency(result.hoaFees)}</span>
                          </div>
                          <div className="mortgage-breakdown-item mortgage-total">
                            <span>Total Monthly Payment:</span>
                            <span className="mortgage-amount mortgage-result-final">{formatCurrency(result.totalMonthlyPayment)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mortgage-result-item">
                        <strong>Loan Details:</strong>
                        <div className="mortgage-loan-details">
                          <div className="mortgage-detail-item">
                            <span>Down Payment:</span>
                            <span>{formatCurrency(result.downPayment)}</span>
                          </div>
                          <div className="mortgage-detail-item">
                            <span>Loan Amount:</span>
                            <span>{formatCurrency(result.actualLoanAmount)}</span>
                          </div>
                          <div className="mortgage-detail-item">
                            <span>Loan-to-Value Ratio:</span>
                            <span>{formatPercentage(result.loanToValueRatio)}</span>
                          </div>
                          <div className="mortgage-detail-item">
                            <span>Total Interest:</span>
                            <span>{formatCurrency(result.totalInterest)}</span>
                          </div>
                          <div className="mortgage-detail-item">
                            <span>Total of Payments:</span>
                            <span>{formatCurrency(result.totalOfPayments)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mortgage-result-main">
                    <div className="mortgage-result-item">
                      <strong>Monthly Payment:</strong>
                      <span className="mortgage-result-value mortgage-result-final">
                        {formatCurrency(result.principalAndInterest)}
                      </span>
                    </div>
                    <div className="mortgage-result-item">
                      <strong>Total of Payments:</strong>
                      <span className="mortgage-result-value">
                        {formatCurrency(result.totalOfPayments)}
                      </span>
                    </div>
                    <div className="mortgage-result-item">
                      <strong>Total Interest:</strong>
                      <span className="mortgage-result-value">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                    <div className="mortgage-result-item">
                      <strong>Principal Amount:</strong>
                      <span className="mortgage-result-value">
                        {formatCurrency(result.principal)}
                      </span>
                    </div>
                  </div>
                )}

                {!result.isAdvanced && (
                  <div className="mortgage-result-tip">
                    <i className="fas fa-lightbulb"></i>
                    <span>💡 Tip: Use the Advanced Calculator for more detailed breakdown including taxes, insurance, and PMI</span>
                  </div>
                )}
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
            The Mortgage Calculator is an essential financial tool that helps you understand the true cost of homeownership. 
            Whether you're a first-time homebuyer or looking to refinance, this calculator provides comprehensive insights 
            into your monthly mortgage payments, including principal, interest, taxes, insurance, and other associated costs.
          </p>
          <p>
            Our advanced mortgage calculator goes beyond basic payment calculations to include property taxes, homeowner's 
            insurance, PMI (Private Mortgage Insurance), and HOA fees. This gives you a complete picture of your housing 
            costs before you commit to a mortgage, helping you make informed financial decisions.
          </p>
        </ContentSection>

        <ContentSection id="what-is-mortgage" title="What is a Mortgage Calculator?">
          <p>
            A mortgage calculator is a financial tool that computes various aspects of a mortgage loan, including monthly 
            payments, total interest, and the overall cost of homeownership. It uses mathematical formulas to determine 
            how much you'll pay each month and over the life of the loan.
          </p>
          <ul>
            <li>
              <span><strong>Payment Calculation:</strong> Determines your monthly mortgage payment</span>
            </li>
            <li>
              <span><strong>Cost Breakdown:</strong> Shows all housing costs including taxes and insurance</span>
            </li>
            <li>
              <span><strong>Loan Analysis:</strong> Calculates loan-to-value ratios and total interest</span>
            </li>
            <li>
              <span><strong>Affordability Assessment:</strong> Helps determine if a mortgage fits your budget</span>
            </li>
            <li>
              <span><strong>Comparison Tool:</strong> Allows you to compare different loan options</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="how-to-use" title="How to Use Mortgage Calculator">
          <p>Using the mortgage calculator is straightforward and requires just a few key pieces of information:</p>
          <ul className="usage-steps">
            <li>
              <span><strong>Enter Loan Amount:</strong> Input the total amount you want to borrow.</span>
            </li>
            <li>
              <span><strong>Set Interest Rate:</strong> Enter the annual interest rate as a percentage.</span>
            </li>
            <li>
              <span><strong>Choose Loan Term:</strong> Select how many years you want to repay the mortgage.</span>
            </li>
            <li>
              <span><strong>Add Down Payment:</strong> Enter any down payment to reduce the loan amount.</span>
            </li>
            <li>
              <span><strong>Toggle Advanced Mode:</strong> Enable for additional costs like taxes and insurance.</span>
            </li>
            <li>
              <span><strong>Calculate:</strong> Click "Calculate Mortgage" to see your results.</span>
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> Use the Advanced Calculator to get a complete picture of your monthly housing costs, 
            including property taxes, insurance, PMI, and HOA fees.
          </p>
        </ContentSection>

        <ContentSection id="formulas" title="Formulas & Methods">
          <div className="formula-section">
            <h3>Standard Mortgage Formula</h3>
            <div className="math-formula">
              M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>M</strong> = Monthly mortgage payment</li>
              <li><strong>P</strong> = Principal loan amount</li>
              <li><strong>r</strong> = Monthly interest rate (Annual rate ÷ 12)</li>
              <li><strong>n</strong> = Total number of payments (Years × 12)</li>
            </ul>
          </div>

          <div className="formula-section">
            <h3>Total Monthly Payment</h3>
            <div className="math-formula">
              Total = Principal & Interest + Property Tax + Insurance + PMI + HOA Fees
            </div>
            <p>This formula includes all monthly housing costs for a complete picture of affordability.</p>
          </div>

          <div className="formula-section">
            <h3>Loan-to-Value Ratio</h3>
            <div className="math-formula">
              LTV = (Loan Amount ÷ Property Value) × 100
            </div>
            <p>A lower LTV ratio typically results in better loan terms and eliminates PMI requirements.</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples">
          <div className="example-section">
            <h3>Example 1: 30-Year Fixed Mortgage</h3>
            <div className="example-solution">
              <p><strong>Loan Amount:</strong> $300,000</p>
              <p><strong>Interest Rate:</strong> 4.5%</p>
              <p><strong>Term:</strong> 30 years</p>
              <p><strong>Down Payment:</strong> $60,000</p>
              <p><strong>Result:</strong> Monthly payment of $1,216.04</p>
              <p><strong>Total Interest:</strong> $137,774.40</p>
              <p><strong>Total Cost:</strong> $437,774.40</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: 15-Year Fixed Mortgage</h3>
            <div className="example-solution">
              <p><strong>Loan Amount:</strong> $240,000</p>
              <p><strong>Interest Rate:</strong> 3.75%</p>
              <p><strong>Term:</strong> 15 years</p>
              <p><strong>Down Payment:</strong> $60,000</p>
              <p><strong>Result:</strong> Monthly payment of $1,746.38</p>
              <p><strong>Total Interest:</strong> $74,348.40</p>
              <p><strong>Total Cost:</strong> $314,348.40</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 3: Advanced Calculation with Additional Costs</h3>
            <div className="example-solution">
              <p><strong>Loan Amount:</strong> $400,000</p>
              <p><strong>Interest Rate:</strong> 5.0%</p>
              <p><strong>Term:</strong> 30 years</p>
              <p><strong>Property Tax:</strong> $4,800/year</p>
              <p><strong>Insurance:</strong> $1,200/year</p>
              <p><strong>PMI:</strong> 0.5%</p>
              <p><strong>HOA Fees:</strong> $200/month</p>
              <p><strong>Result:</strong> Total monthly payment of $2,847.67</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding mortgage calculations is crucial for homebuying and financial planning:</p>
          <ul>
            <li>
              <span>Helps determine if a home is affordable within your budget</span>
            </li>
            <li>
              <span>Allows comparison between different loan options and terms</span>
            </li>
            <li>
              <span>Provides transparency into the true cost of homeownership</span>
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
          <p>Our Mortgage Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Basic Calculations:</strong> Monthly payments, total interest, and total cost</span>
            </li>
            <li>
              <span><strong>Advanced Features:</strong> Property taxes, insurance, PMI, and HOA fees</span>
            </li>
            <li>
              <span><strong>Down Payment Analysis:</strong> Impact on monthly payments and PMI requirements</span>
            </li>
            <li>
              <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
            </li>
            <li>
              <span><strong>Real-time Results:</strong> Instant calculations as you adjust inputs</span>
            </li>
            <li>
              <span><strong>Comprehensive Output:</strong> Detailed breakdown of all housing costs</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Home Buying</h4>
              <p>Calculate monthly payments and total costs for home purchases</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Refinancing</h4>
              <p>Compare current mortgage with refinancing options</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-calculator"></i> Budget Planning</h4>
              <p>Plan monthly housing costs and overall budget</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-balance-scale"></i> Loan Comparison</h4>
              <p>Compare different loan terms and interest rates</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-chart-area"></i> Investment Analysis</h4>
              <p>Analyze real estate investment opportunities</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Financial Education</h4>
              <p>Learn about mortgage calculations and home financing</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection 
          faqs={[
            {
              question: "What is PMI and when do I need it?",
              answer: "PMI (Private Mortgage Insurance) is required when your down payment is less than 20% of the home's value. It protects the lender if you default on the loan. PMI typically costs 0.5% to 1% of the loan amount annually."
            },
            {
              question: "How does the down payment affect my mortgage?",
              answer: "A larger down payment reduces your loan amount, which lowers your monthly payment and total interest paid. It can also help you avoid PMI if you put down 20% or more."
            },
            {
              question: "What's the difference between 15-year and 30-year mortgages?",
              answer: "A 15-year mortgage has higher monthly payments but significantly less total interest paid. A 30-year mortgage has lower monthly payments but more total interest. Choose based on your budget and long-term financial goals."
            },
            {
              question: "Are property taxes included in my mortgage payment?",
              answer: "Property taxes are often included in your monthly mortgage payment through an escrow account, but they're not part of the actual mortgage loan. The lender collects them monthly and pays them annually."
            },
            {
              question: "What is the loan-to-value ratio?",
              answer: "The loan-to-value (LTV) ratio is the percentage of the home's value that you're borrowing. For example, if you borrow $240,000 on a $300,000 home, your LTV is 80%. Lower LTV ratios typically qualify for better interest rates."
            },
            {
              question: "How do I know if I can afford a mortgage?",
              answer: "A general rule is that your total housing costs (mortgage, taxes, insurance) should not exceed 28% of your gross monthly income. However, consider your overall debt-to-income ratio and other financial obligations."
            }
          ]}
          title="Frequently Asked Questions"
        />
      </ToolPageLayout>
    </>
  )
}

export default MortgageCalculator