import React, { useState, useEffect } from 'react'
import ToolPageLayout from '../tool/ToolPageLayout'
import CalculatorSection from '../tool/CalculatorSection'
import ContentSection from '../tool/ContentSection'
import FAQSection from '../tool/FAQSection'
import TableOfContents from '../tool/TableOfContents'
import FeedbackForm from '../tool/FeedbackForm'
import SalesTaxCalculatorJS from '../../assets/js/finance/sales-tax-calculator.js'
import '../../assets/css/finance/sales-tax-calculator.css'

const SalesTaxCalculator = () => {
  const [formData, setFormData] = useState({
    itemPrice: '',
    taxRate: '',
    quantity: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculator, setCalculator] = useState(null);

  // Initialize calculator on component mount
  useEffect(() => {
    try {
      const salesTaxCalc = new SalesTaxCalculatorJS();
      setCalculator(salesTaxCalc);
    } catch (error) {
      console.error('Error initializing sales tax calculator:', error);
    }
  }, []);

  // Tool data
  const toolData = {
    name: 'Sales Tax Calculator',
    description: 'Calculate sales tax, subtotal, and total amount for purchases. Get accurate tax calculations for different tax rates and quantities.',
    icon: 'fas fa-receipt',
    category: 'Finance',
    breadcrumb: ['Finance', 'Calculators', 'Sales Tax Calculator']
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
    { name: 'Tip Calculator', url: '/finance/calculators/tip-calculator', icon: 'fas fa-utensils' },
    { name: 'Discount Calculator', url: '/finance/calculators/discount-calculator', icon: 'fas fa-percentage' },
    { name: 'Currency Calculator', url: '/finance/calculators/currency-calculator', icon: 'fas fa-exchange-alt' },
    { name: 'Budget Calculator', url: '/finance/calculators/budget-calculator', icon: 'fas fa-calculator' }
  ];

  // Table of contents
  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-is-sales-tax', title: 'What is Sales Tax?' },
    { id: 'how-to-use', title: 'How to Use Calculator' },
    { id: 'formulas', title: 'Sales Tax Formulas & Methods' },
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
        formData.itemPrice,
        formData.taxRate,
        formData.quantity
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

  const calculateSalesTax = () => {
    if (!validateInputs()) return;

    try {
      const {
        itemPrice,
        taxRate,
        quantity
      } = formData;

      // Use calculation from JS file
      const result = calculator.calculateSalesTax(
        parseFloat(itemPrice),
        parseFloat(taxRate),
        parseFloat(quantity)
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
      itemPrice: '',
      taxRate: '',
      quantity: ''
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
        title="Sales Tax Calculator"
        onCalculate={calculateSalesTax}
        calculateButtonText="Calculate Sales Tax"
        error={error}
        result={null}
      >
        <div className="sales-tax-calculator-form">
          <div className="sales-tax-input-row">
            <div className="sales-tax-input-group">
              <label htmlFor="sales-tax-item-price" className="sales-tax-input-label">
                Item Price ($):
              </label>
              <input
                type="number"
                id="sales-tax-item-price"
                className="sales-tax-input-field"
                value={formData.itemPrice}
                onChange={(e) => handleInputChange('itemPrice', e.target.value)}
                placeholder="e.g., 25.99"
                min="0"
                step="0.01"
              />
              <small className="sales-tax-input-help">
                Price of a single item
              </small>
            </div>

            <div className="sales-tax-input-group">
              <label htmlFor="sales-tax-tax-rate" className="sales-tax-input-label">
                Tax Rate (%):
              </label>
              <input
                type="number"
                id="sales-tax-tax-rate"
                className="sales-tax-input-field"
                value={formData.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                placeholder="e.g., 8.5"
                min="0"
                max="50"
                step="0.01"
              />
              <small className="sales-tax-input-help">
                Sales tax rate percentage
              </small>
            </div>
          </div>

          <div className="sales-tax-input-row">
            <div className="sales-tax-input-group">
              <label htmlFor="sales-tax-quantity" className="sales-tax-input-label">
                Quantity:
              </label>
              <input
                type="number"
                id="sales-tax-quantity"
                className="sales-tax-input-field"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="e.g., 2"
                min="1"
                step="1"
              />
              <small className="sales-tax-input-help">
                Number of items to purchase
              </small>
            </div>

            <div className="sales-tax-input-group">
              <div className="sales-tax-input-spacer"></div>
            </div>
          </div>

          <div className="sales-tax-calculator-actions">
            <button type="button" className="sales-tax-btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>
        </div>

        {/* Custom Results Section */}
        {result && (
          <div className="sales-tax-calculator-result">
            <h3 className="sales-tax-result-title">Sales Tax Calculation Results</h3>
            <div className="sales-tax-result-content">
              <div className="sales-tax-result-main">
                <div className="sales-tax-result-item">
                  <strong>Item Price:</strong>
                  <span className="sales-tax-result-value">
                    {formatCurrency(result.itemPrice)}
                  </span>
                </div>
                <div className="sales-tax-result-item">
                  <strong>Quantity:</strong>
                  <span className="sales-tax-result-value">
                    {result.quantity}
                  </span>
                </div>
                <div className="sales-tax-result-item">
                  <strong>Subtotal:</strong>
                  <span className="sales-tax-result-value">
                    {formatCurrency(result.subtotal)}
                  </span>
                </div>
                <div className="sales-tax-result-item">
                  <strong>Tax Rate:</strong>
                  <span className="sales-tax-result-value">
                    {formatPercentage(result.taxRate)}
                  </span>
                </div>
                <div className="sales-tax-result-item">
                  <strong>Tax Amount:</strong>
                  <span className="sales-tax-result-value">
                    {formatCurrency(result.taxAmount)}
                  </span>
                </div>
                <div className="sales-tax-result-item">
                  <strong>Total Amount:</strong>
                  <span className="sales-tax-result-value sales-tax-result-final">
                    {formatCurrency(result.total)}
                  </span>
                </div>
              </div>

              <div className="sales-tax-result-breakdown">
                <h4>Purchase Breakdown</h4>
                <div className="sales-tax-breakdown-details">
                  <div className="sales-tax-breakdown-item">
                    <span>Item Price × Quantity:</span>
                    <span>{formatCurrency(result.itemPrice)} × {result.quantity}</span>
                  </div>
                  <div className="sales-tax-breakdown-item">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(result.subtotal)}</span>
                  </div>
                  <div className="sales-tax-breakdown-item">
                    <span>Tax ({formatPercentage(result.taxRate)}):</span>
                    <span>{formatCurrency(result.taxAmount)}</span>
                  </div>
                  <div className="sales-tax-breakdown-item sales-tax-total">
                    <span>Total:</span>
                    <span>{formatCurrency(result.total)}</span>
                  </div>
                </div>
              </div>

              <div className="sales-tax-result-summary">
                <h4>Summary</h4>
                <div className="sales-tax-summary-details">
                  <div className="sales-tax-summary-item">
                    <span>Tax as % of Subtotal:</span>
                    <span>{formatPercentage(result.taxRate)}</span>
                  </div>
                  <div className="sales-tax-summary-item">
                    <span>Tax as % of Total:</span>
                    <span>{formatPercentage(result.taxPercentageOfTotal)}</span>
                  </div>
                  <div className="sales-tax-summary-item">
                    <span>Average Tax per Item:</span>
                    <span>{formatCurrency(result.averageTaxPerItem)}</span>
                  </div>
                </div>
              </div>

              <div className="sales-tax-result-tip">
                <i className="fas fa-lightbulb"></i>
                <span>💡 Tip: Sales tax rates vary by location, so check your local tax rate for accurate calculations!</span>
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
          The Sales Tax Calculator is a practical financial tool that helps you calculate the exact 
          amount of sales tax on your purchases. Whether you're shopping for personal items, 
          business expenses, or planning a budget, this calculator provides accurate tax calculations 
          for different tax rates and quantities.
        </p>
        <p>
          By inputting the item price, tax rate, and quantity, you can quickly determine the 
          subtotal, tax amount, and total cost of your purchase. This helps you budget accurately 
          and understand the true cost of items including taxes.
        </p>
      </ContentSection>

      <ContentSection id="what-is-sales-tax" title="What is Sales Tax?">
        <p>
          Sales tax is a consumption tax imposed by the government on the sale of goods and services. 
          It's typically calculated as a percentage of the purchase price and varies by location, 
          with different rates for different types of items and jurisdictions.
        </p>
        <ul>
          <li>
            <span><strong>Consumption Tax:</strong> Taxed when you purchase goods or services</span>
          </li>
          <li>
            <span><strong>Location-Based:</strong> Tax rates vary by state, county, and city</span>
          </li>
          <li>
            <span><strong>Item-Specific:</strong> Some items may be exempt or have different rates</span>
          </li>
          <li>
            <span><strong>Added to Price:</strong> Calculated on top of the item's base price</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="how-to-use" title="How to Use Sales Tax Calculator">
        <p>Using the sales tax calculator is simple and requires just three pieces of information:</p>
        <ul className="usage-steps">
          <li>
            <span><strong>Enter Item Price:</strong> Input the price of a single item.</span>
          </li>
          <li>
            <span><strong>Set Tax Rate:</strong> Enter the sales tax rate percentage for your location.</span>
          </li>
          <li>
            <span><strong>Add Quantity:</strong> Enter the number of items you're purchasing.</span>
          </li>
          <li>
            <span><strong>Calculate:</strong> Click "Calculate Sales Tax" to see your results.</span>
          </li>
        </ul>
        <p>
          <strong>Pro Tip:</strong> Check your local government website or ask the retailer for the 
          current sales tax rate in your area for the most accurate calculations.
        </p>
      </ContentSection>

      <ContentSection id="formulas" title="Sales Tax Formulas & Methods">
        <div className="formula-section">
          <h3>Subtotal Calculation</h3>
          <div className="math-formula">
            Subtotal = Item Price × Quantity
          </div>
          <p>This calculates the total cost of items before tax is applied.</p>
        </div>

        <div className="formula-section">
          <h3>Tax Amount Calculation</h3>
          <div className="math-formula">
            Tax Amount = Subtotal × (Tax Rate ÷ 100)
          </div>
          <p>This calculates the total tax amount based on the subtotal and tax rate.</p>
        </div>

        <div className="formula-section">
          <h3>Total Amount Calculation</h3>
          <div className="math-formula">
            Total = Subtotal + Tax Amount
          </div>
          <p>This gives you the final amount you'll pay including tax.</p>
        </div>

        <div className="formula-section">
          <h3>Tax Percentage of Total</h3>
          <div className="math-formula">
            Tax % of Total = (Tax Amount ÷ Total) × 100
          </div>
          <p>This shows what percentage of your total payment goes to taxes.</p>
        </div>
      </ContentSection>

      <ContentSection id="examples" title="Examples">
        <div className="example-section">
          <h3>Example 1: Single Item Purchase</h3>
          <div className="example-solution">
            <p><strong>Item Price:</strong> $25.99</p>
            <p><strong>Tax Rate:</strong> 8.5%</p>
            <p><strong>Quantity:</strong> 1</p>
            <p><strong>Subtotal:</strong> $25.99</p>
            <p><strong>Tax Amount:</strong> $2.21</p>
            <p><strong>Total:</strong> $28.20</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 2: Multiple Items</h3>
          <div className="example-solution">
            <p><strong>Item Price:</strong> $15.50</p>
            <p><strong>Tax Rate:</strong> 6.25%</p>
            <p><strong>Quantity:</strong> 3</p>
            <p><strong>Subtotal:</strong> $46.50</p>
            <p><strong>Tax Amount:</strong> $2.91</p>
            <p><strong>Total:</strong> $49.41</p>
          </div>
        </div>

        <div className="example-section">
          <h3>Example 3: High Tax Rate</h3>
          <div className="example-solution">
            <p><strong>Item Price:</strong> $100.00</p>
            <p><strong>Tax Rate:</strong> 10.5%</p>
            <p><strong>Quantity:</strong> 2</p>
            <p><strong>Subtotal:</strong> $200.00</p>
            <p><strong>Tax Amount:</strong> $21.00</p>
            <p><strong>Total:</strong> $221.00</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection id="significance" title="Significance">
        <p>Understanding sales tax calculations is important for several reasons:</p>
        <ul>
          <li>
            <span>Helps you budget accurately for purchases</span>
          </li>
          <li>
            <span>Allows you to compare true costs between different locations</span>
          </li>
          <li>
            <span>Essential for business expense tracking and reporting</span>
          </li>
          <li>
            <span>Helps you understand the impact of taxes on your spending</span>
          </li>
          <li>
            <span>Useful for financial planning and cash flow management</span>
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="functionality" title="Functionality">
        <p>Our Sales Tax Calculator provides comprehensive functionality:</p>
        <ul>
          <li>
            <span><strong>Accurate Calculations:</strong> Precise tax calculations with proper rounding</span>
          </li>
          <li>
            <span><strong>Multiple Items:</strong> Calculate tax for any quantity of items</span>
          </li>
          <li>
            <span><strong>Detailed Breakdown:</strong> Shows subtotal, tax amount, and total</span>
          </li>
          <li>
            <span><strong>Tax Analysis:</strong> Displays tax as percentage of total and per item</span>
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
            <h4><i className="fas fa-shopping-cart"></i> Personal Shopping</h4>
            <p>Calculate exact costs for personal purchases and budget planning</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-briefcase"></i> Business Expenses</h4>
            <p>Track and calculate taxes for business purchases and expenses</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-calculator"></i> Budget Planning</h4>
            <p>Include tax costs in your monthly and annual budget planning</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-map-marker-alt"></i> Location Comparison</h4>
            <p>Compare total costs between different locations with varying tax rates</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-receipt"></i> Receipt Verification</h4>
            <p>Verify that tax calculations on receipts are correct</p>
          </div>
          <div className="application-item">
            <h4><i className="fas fa-chart-line"></i> Financial Analysis</h4>
            <p>Analyze the impact of taxes on your overall spending patterns</p>
          </div>
        </div>
      </ContentSection>

      <FAQSection 
        faqs={[
          {
            question: "How do I find the sales tax rate for my area?",
            answer: "You can find your local sales tax rate by checking your state's department of revenue website, asking the retailer, or using online tax rate lookup tools. Rates often vary by state, county, and city."
          },
          {
            question: "Are all items subject to sales tax?",
            answer: "No, some items may be exempt from sales tax depending on your location. Common exemptions include groceries, prescription medications, and certain services. Check your local tax laws for specific exemptions."
          },
          {
            question: "Why do sales tax rates vary by location?",
            answer: "Sales tax rates vary because they're set by different levels of government (state, county, city). Each jurisdiction can set its own rate, leading to different total rates in different areas."
          },
          {
            question: "How is sales tax different from other taxes?",
            answer: "Sales tax is a consumption tax paid at the point of purchase, while income tax is based on earnings and property tax is based on property value. Sales tax is typically regressive, meaning it takes a larger percentage of income from lower earners."
          },
          {
            question: "Can I deduct sales tax on my income tax return?",
            answer: "In some cases, you can deduct sales tax instead of state income tax on your federal return, but this depends on your specific situation and tax laws. Consult a tax professional for advice on your specific circumstances."
          },
          {
            question: "How accurate are these calculations?",
            answer: "Our calculator provides accurate calculations based on the inputs you provide. However, actual tax rates may change, and some items may have special tax rules, so always verify with official sources for important purchases."
          }
        ]}
        title="Frequently Asked Questions"
      />
    </ToolPageLayout>
  )
}

export default SalesTaxCalculator
