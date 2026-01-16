import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import '../../assets/css/finance/roi-calculator.css'
import Seo from '../Seo'

const ROICalculator = () => {
  const [formData, setFormData] = useState({
    initialInvestment: '',
    finalValue: '',
    investmentPeriod: '',
    additionalContributions: '',
    contributionFrequency: 'monthly'
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = () => {
    if (!formData.initialInvestment || !formData.finalValue || !formData.investmentPeriod) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (parseFloat(formData.initialInvestment) <= 0 || 
        parseFloat(formData.finalValue) <= 0 || 
        parseFloat(formData.investmentPeriod) <= 0) {
      setError('All values must be greater than zero.');
      return false;
    }

    return true;
  };

  const getContributionFrequency = (frequency) => {
    switch (frequency) {
      case 'monthly':
        return 12;
      case 'quarterly':
        return 4;
      case 'annually':
        return 1;
      default:
        return 12;
    }
  };

  const calculateROI = () => {
    if (!validateInputs()) return;

    const initialInvestment = parseFloat(formData.initialInvestment);
    const finalValue = parseFloat(formData.finalValue);
    const investmentPeriod = parseFloat(formData.investmentPeriod);
    const additionalContributions = parseFloat(formData.additionalContributions) || 0;
    const contributionFrequency = formData.contributionFrequency;

    let totalInvestment = initialInvestment;
    let contributionsPerYear = getContributionFrequency(contributionFrequency);

    totalInvestment += additionalContributions * contributionsPerYear * investmentPeriod;

    const totalReturn = finalValue - totalInvestment;
    const roi = (totalReturn / totalInvestment) * 100;
    const annualizedROI = (Math.pow((finalValue / initialInvestment), (1 / investmentPeriod)) - 1) * 100;

    setResult({
      totalInvestment,
      totalReturn,
      roi,
      annualizedROI,
      finalValue
    });
    setError('');
  };

  const handleReset = () => {
    setFormData({
      initialInvestment: '',
      finalValue: '',
      investmentPeriod: '',
      additionalContributions: '',
      contributionFrequency: 'monthly'
    });
    setResult(null);
    setError('');
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

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
  }, [result, error]);

  const toolData = {
    name: "ROI Calculator",
    description: "Calculate Return on Investment (ROI) and annualized returns for your investments",
    icon: "fas fa-chart-line",
    category: "Finance",
    breadcrumb: ["Finance", "Calculators", "ROI Calculator"],
    tags: ["ROI", "Investment", "Returns", "Finance", "Calculator"]
  };

  // SEO data
  const seoTitle = `${toolData.name} - ${toolData.category} | Tuitility`;
  const seoDescription = toolData.description;
  const seoKeywords = `${toolData.name.toLowerCase()}, ${toolData.category.toLowerCase()} calculator, return on investment, annualized return, investment analysis`;
  const canonicalUrl = `https://tuitility.vercel.app/finance/calculators/roi-calculator`;

  const categories = [
    { name: "Investment Analysis", icon: "fas fa-chart-pie" },
    { name: "Financial Planning", icon: "fas fa-piggy-bank" },
    { name: "Business Metrics", icon: "fas fa-briefcase" },
    { name: "Portfolio Management", icon: "fas fa-chart-line" }
  ];

  const relatedTools = [
    { name: "Compound Interest Calculator", url: "/finance/calculators/compound-interest-calculator", icon: "fas fa-chart-area" },
    { name: "House Affordability Calculator", url: "/finance/calculators/house-affordability-calculator", icon: "fas fa-home" },
    { name: "Mortgage Calculator", url: "/finance/calculators/mortgage-calculator", icon: "fas fa-calculator" },
    { name: "Amortization Calculator", url: "/finance/calculators/amortization-calculator", icon: "fas fa-chart-line" },
    { name: "Percentage Calculator", url: "/utility-tools/calculators/percentage-calculator", icon: "fas fa-percentage" }
  ];

  const tableOfContents = [
    { id: "introduction", title: "Introduction", icon: "fas fa-info-circle" },
    { id: "calculator", title: "ROI Calculator", icon: "fas fa-calculator" },
    { id: "what-is-roi", title: "What is ROI?", icon: "fas fa-question-circle" },
    { id: "formulas", title: "ROI Formulas", icon: "fas fa-square-root-alt" },
    { id: "examples", title: "Examples", icon: "fas fa-lightbulb" },
    { id: "usage", title: "How to Use", icon: "fas fa-info-circle" },
    { id: "significance", title: "Significance", icon: "fas fa-star" },
    { id: "functionality", title: "Functionality", icon: "fas fa-cogs" },
    { id: "applications", title: "Applications", icon: "fas fa-rocket" },
    { id: "faq", title: "FAQ", icon: "fas fa-question-circle" }
  ];

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
        categories={categories}
        relatedTools={relatedTools}
        tableOfContents={tableOfContents}
      >
        <CalculatorSection title="ROI Calculator" icon="fas fa-chart-line">
          <form className="roi-calculator-form" onSubmit={(e) => { e.preventDefault(); calculateROI(); }}>
            <div className="roi-calculator-input-row">
              <div className="roi-calculator-input-group">
                <label htmlFor="initial-investment" className="roi-calculator-input-label">
                  Initial Investment ($)
                </label>
                <input
                  type="number"
                  id="initial-investment"
                  name="initialInvestment"
                  className="roi-calculator-input-field"
                  value={formData.initialInvestment}
                  onChange={handleInputChange}
                  placeholder="10000"
                  step="0.01"
                  min="0"
                  required
                />
                <small className="roi-calculator-input-help">The amount you initially invested</small>
              </div>

              <div className="roi-calculator-input-group">
                <label htmlFor="final-value" className="roi-calculator-input-label">
                  Final Value ($)
                </label>
                <input
                  type="number"
                  id="final-value"
                  name="finalValue"
                  className="roi-calculator-input-field"
                  value={formData.finalValue}
                  onChange={handleInputChange}
                  placeholder="15000"
                  step="0.01"
                  min="0"
                  required
                />
                <small className="roi-calculator-input-help">The current or final value of your investment</small>
              </div>
            </div>

            <div className="roi-calculator-input-row">
              <div className="roi-calculator-input-group">
                <label htmlFor="investment-period" className="roi-calculator-input-label">
                  Investment Period (Years)
                </label>
                <input
                  type="number"
                  id="investment-period"
                  name="investmentPeriod"
                  className="roi-calculator-input-field"
                  value={formData.investmentPeriod}
                  onChange={handleInputChange}
                  placeholder="5"
                  step="0.1"
                  min="0"
                  required
                />
                <small className="roi-calculator-input-help">How long you've held the investment</small>
              </div>

              <div className="roi-calculator-input-group">
                <label htmlFor="additional-contributions" className="roi-calculator-input-label">
                  Additional Contributions ($)
                </label>
                <input
                  type="number"
                  id="additional-contributions"
                  name="additionalContributions"
                  className="roi-calculator-input-field"
                  value={formData.additionalContributions}
                  onChange={handleInputChange}
                  placeholder="1000"
                  step="0.01"
                  min="0"
                />
                <small className="roi-calculator-input-help">Regular contributions made during the period</small>
              </div>
            </div>

            <div className="roi-calculator-input-row">
              <div className="roi-calculator-input-group">
                <label htmlFor="contribution-frequency" className="roi-calculator-input-label">
                  Contribution Frequency
                </label>
                <select
                  id="contribution-frequency"
                  name="contributionFrequency"
                  className="roi-calculator-input-field"
                  value={formData.contributionFrequency}
                  onChange={handleInputChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
                <small className="roi-calculator-input-help">How often you make additional contributions</small>
              </div>
            </div>

            <div className="roi-calculator-calculator-actions">
              <button type="submit" className="roi-calculator-btn-calculate">
                <i className="fas fa-calculator"></i>
                Calculate ROI
              </button>
              <button type="button" className="roi-calculator-btn-reset" onClick={handleReset}>
                <i className="fas fa-redo"></i>
                Reset
              </button>
            </div>
          </form>

          {error && (
            <div className="roi-calculator-result" style={{ display: 'block' }}>
              <div className="roi-calculator-result-main">
                <div className="roi-calculator-result-title">
                  <i className="fas fa-exclamation-triangle"></i>
                  Error
                </div>
                <div className="roi-calculator-result-content">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="roi-calculator-result" style={{ display: 'block' }}>
              <div className="roi-calculator-result-main">
                <div className="roi-calculator-result-title">
                  <i className="fas fa-chart-line"></i>
                  ROI Results
                </div>
                <div className="roi-calculator-result-content">
                  <div className="roi-calculator-result-item">
                    <strong>Total Investment:</strong>
                    <span className="roi-calculator-result-value">{formatCurrency(result.totalInvestment)}</span>
                  </div>
                  <div className="roi-calculator-result-item">
                    <strong>Final Value:</strong>
                    <span className="roi-calculator-result-value">{formatCurrency(result.finalValue)}</span>
                  </div>
                  <div className="roi-calculator-result-item">
                    <strong>Total Return:</strong>
                    <span className="roi-calculator-result-value">{formatCurrency(result.totalReturn)}</span>
                  </div>
                  <div className="roi-calculator-result-item">
                    <strong>ROI:</strong>
                    <span className="roi-calculator-result-final">{formatPercentage(result.roi)}</span>
                  </div>
                  <div className="roi-calculator-result-item">
                    <strong>Annualized ROI:</strong>
                    <span className="roi-calculator-result-final">{formatPercentage(result.annualizedROI)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CalculatorSection>
        <div className="tool-bottom-section">
          <TableOfContents items={tableOfContents} />
          <FeedbackForm toolName={toolData.name} />
        </div>
      

   <ContentSection id="introduction" title="Introduction" icon="fas fa-info-circle">
          <p>
            The Return on Investment (ROI) Calculator is a powerful tool designed to help you evaluate the profitability of your investments. Whether you're a seasoned investor or just starting out, understanding your ROI is crucial for making informed financial decisions. This calculator provides a simple and accurate way to calculate both the basic ROI and annualized ROI for any investment.
          </p>
          <p>
            ROI is a fundamental metric in finance that measures the return on an investment relative to its cost. It's expressed as a percentage and can be used to compare the performance of different investments. The basic ROI formula calculates the total return as a percentage of the initial investment, while the annualized ROI formula provides a more accurate representation of the compound growth rate over a given period.
          </p>
        </ContentSection>

        <ContentSection id="what-is-roi" title="What is ROI?" icon="fas fa-question-circle">
          <p>
            ROI is a widely used metric in finance to evaluate the efficiency of an investment or to compare the efficiency of a number of different investments. It is a simple and intuitive measure of the return on an investment relative to its cost.
          </p>
          <p>
            The formula for calculating ROI is:
          </p>
          <div className="math-formula">
            {"\\text{ROI} = \\frac{\\text{Final Value} - \\text{Total Investment}}{\\text{Total Investment}} \\times 100\\%"}
          </div>
          <p>
            Where:
          </p>
          <ul>
            <li><strong>Final Value:</strong> The current or final value of your investment.</li>
            <li><strong>Total Investment:</strong> The initial investment amount plus any additional contributions made during the investment period.</li>
          </ul>
          <p>
            For example, if you invested $10,000 and your investment grew to $15,000 over 5 years, your ROI would be 50%.
          </p>
        </ContentSection> 
        
          <ContentSection id="formulas" title="ROI Formulas" icon="fas fa-square-root-alt">
          <div className="formula-section">
            <h3>Basic ROI Formula</h3>
            <div className="math-formula">
              {"\\text{ROI} = \\frac{\\text{Final Value} - \\text{Total Investment}}{\\text{Total Investment}} \\times 100\\%"}
            </div>
            <p>Where Total Investment includes initial amount plus all additional contributions</p>
          </div>

          <div className="formula-section">
            <h3>Annualized ROI Formula</h3>
            <div className="math-formula">
              {"\\text{Annualized ROI} = \\left(\left(\\\frac{\\text{Final Value}}{\\text{Initial Investment}}\\\right)^{\\frac{1}{\\text{Years}}} - 1\right) \\times 100\\%"}
            </div>
            <p>This shows the compound annual growth rate of your initial investment</p>
          </div>

          <div className="formula-section">
            <h3>Total Investment Calculation</h3>
            <div className="math-formula">
              {"\\text{Total Investment} = \\text{Initial Investment} + (\\text{Additional Contributions} \\times \\text{Frequency} \\times \\text{Years})"}
            </div>
            <p>Frequency: Monthly = 12, Quarterly = 4, Annually = 1</p>
          </div>
        </ContentSection>

        <ContentSection id="examples" title="Examples" icon="fas fa-lightbulb">
          <div className="example-section">
            <h3>Example 1: Simple Investment</h3>
            <div className="example-solution">
              <p><strong>Initial Investment:</strong> $10,000</p>
              <p><strong>Final Value:</strong> $15,000</p>
              <p><strong>Investment Period:</strong> 5 years</p>
              <p><strong>Additional Contributions:</strong> $0</p>
              <br />
              <p><strong>Calculation:</strong></p>
              <p>Total Investment = $10,000</p>
              <p>Total Return = $15,000 - $10,000 = $5,000</p>
              <p>ROI = ($5,000 / $10,000) × 100% = 50%</p>
              <p>Annualized ROI = ((15,000/10,000)^(1/5) - 1) × 100% = 8.45%</p>
            </div>
          </div>

          <div className="example-section">
            <h3>Example 2: Investment with Monthly Contributions</h3>
            <div className="example-solution">
              <p><strong>Initial Investment:</strong> $5,000</p>
              <p><strong>Final Value:</strong> $25,000</p>
              <p><strong>Investment Period:</strong> 10 years</p>
              <p><strong>Additional Contributions:</strong> $100 monthly</p>
              <br />
              <p><strong>Calculation:</strong></p>
              <p>Total Investment = $5,000 + ($100 × 12 × 10) = $17,000</p>
              <p>Total Return = $25,000 - $17,000 = $8,000</p>
              <p>ROI = ($8,000 / $17,000) × 100% = 47.06%</p>
              <p>Annualized ROI = ((25,000/5,000)^(1/10) - 1) × 100% = 17.46%</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="usage" title="How to Use" icon="fas fa-info-circle">
          <ol className="usage-steps">
            <li><strong>Enter Initial Investment:</strong> Input the amount you initially invested in dollars.</li>
            <li><strong>Enter Final Value:</strong> Input the current or final value of your investment.</li>
            <li><strong>Enter Investment Period:</strong> Specify how many years you've held the investment.</li>
            <li><strong>Enter Additional Contributions:</strong> If you made regular contributions, enter the amount per contribution.</li>
            <li><strong>Select Contribution Frequency:</strong> Choose how often you made additional contributions.</li>
            <li><strong>Calculate:</strong> Click the Calculate ROI button to see your results.</li>
          </ol>
        </ContentSection>

        <ContentSection id="significance" title="Significance">
          <p>Understanding ROI is crucial for financial planning and investment decision-making:</p>
          <ul>
            <li>
              <span>Helps you evaluate the true performance of your investments</span>
            </li>
            <li>
              <span>Enables comparison between different investment opportunities</span>
            </li>
            <li>
              <span>Provides insight into the effectiveness of your investment strategy</span>
            </li>
            <li>
              <span>Essential for portfolio optimization and risk management</span>
            </li>
            <li>
              <span>Helps determine if an investment meets your financial goals</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="functionality" title="Functionality">
          <p>Our ROI Calculator provides comprehensive functionality:</p>
          <ul>
            <li>
              <span><strong>Basic ROI Calculation:</strong> Calculates total return as a percentage</span>
            </li>
            <li>
              <span><strong>Annualized ROI:</strong> Shows compound annual growth rate</span>
            </li>
            <li>
              <span><strong>Additional Contributions:</strong> Accounts for regular contributions over time</span>
            </li>
            <li>
              <span><strong>Multiple Frequencies:</strong> Supports monthly, quarterly, and annual contributions</span>
            </li>
            <li>
              <span><strong>Total Investment Tracking:</strong> Combines initial investment with contributions</span>
            </li>
            <li>
              <span><strong>Input Validation:</strong> Ensures all inputs are valid and reasonable</span>
            </li>
          </ul>
        </ContentSection>

        <ContentSection id="applications" title="Applications">
          <div className="applications-grid">
            <div className="application-item">
              <h4><i className="fas fa-chart-line"></i> Investment Analysis</h4>
              <p>Evaluate the performance of stocks, bonds, mutual funds, and other investment vehicles.</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-briefcase"></i> Business Decisions</h4>
              <p>Assess the profitability of business investments, projects, and capital expenditures.</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-home"></i> Real Estate</h4>
              <p>Calculate returns on property investments, including rental income and appreciation.</p>
            </div>
            <div className="application-item">
              <h4><i className="fas fa-graduation-cap"></i> Education Planning</h4>
              <p>Compare the ROI of different educational paths and training programs.</p>
            </div>
          </div>
        </ContentSection>

        <FAQSection
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "What is the difference between ROI and Annualized ROI?",
              answer: "ROI shows the total return over the entire investment period, while Annualized ROI shows the compound annual growth rate, making it easier to compare investments of different durations."
            },
            {
              question: "Should I include additional contributions in ROI calculations?",
              answer: "Yes, including additional contributions gives you a more accurate picture of your total investment and actual returns. This is especially important for long-term investments with regular contributions."
            },
            {
              question: "What is a good ROI percentage?",
              answer: "A good ROI depends on the investment type and market conditions. Generally, 7-10% annualized return is considered good for long-term investments, but higher-risk investments may target 15-20% or more."
            },
            {
              question: "How does investment period affect ROI?",
              answer: "Longer investment periods typically show more stable and potentially higher returns due to compound growth and market recovery from short-term fluctuations."
            }
          ]}
        />

       
      </ToolPageLayout>
    </>
  );
};

export default ROICalculator;