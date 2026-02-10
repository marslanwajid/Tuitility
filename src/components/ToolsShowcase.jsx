import React from 'react'
import { Link } from 'react-router-dom'
import '../assets/css/tools-showcase.css'

const ToolsShowcase = () => {
  const featuredTools = [
    { name: 'Fraction Calculator', desc: 'Add, subtract, multiply and divide fractions', url: '/math/calculators/fraction-calculator', category: 'Math', icon: 'fas fa-divide' },
    { name: 'Percentage Calculator', desc: 'Calculate percentages quickly and easily', url: '/math/calculators/percentage-calculator', category: 'Math', icon: 'fas fa-percentage' },
    { name: 'Decimal Calculator', desc: 'Perform precise arithmetic operations on decimal numbers', url: '/math/calculators/decimal-calculator', category: 'Math', icon: 'fas fa-calculator' },
    { name: 'Decimal to Fraction', desc: 'Convert decimals to fractions with step-by-step solutions', url: '/math/calculators/decimal-to-fraction-calculator', category: 'Math', icon: 'fas fa-exchange-alt' },
    { name: 'Derivative Calculator', desc: 'Calculate derivatives with step-by-step solutions', url: '/math/calculators/derivative-calculator', category: 'Math', icon: 'fas fa-function' },
    { name: 'Comparing Fractions', desc: 'Compare fractions, decimals, and percentages', url: '/math/calculators/comparing-fractions-calculator', category: 'Math', icon: 'fas fa-balance-scale' },
    { name: 'Improper to Mixed', desc: 'Convert improper fractions to mixed numbers', url: '/math/calculators/improper-fraction-to-mixed-calculator', category: 'Math', icon: 'fas fa-layer-group' },
    { name: 'Percent to Fraction', desc: 'Convert percentages to simplified fractions', url: '/math/calculators/percent-to-fraction-calculator', category: 'Math', icon: 'fas fa-percentage' },
    { name: 'Integral Calculator', desc: 'Calculate definite and indefinite integrals', url: '/math/calculators/integral-calculator', category: 'Math', icon: 'fas fa-calculator' },
    { name: 'Percentage Calculator', desc: 'Calculate percentages with 14 different types', url: '/math/calculators/percentage-calculator', category: 'Math', icon: 'fas fa-percentage' },
    { name: 'LCD Calculator', desc: 'Find least common denominator of fractions', url: '/math/calculators/lcd-calculator', category: 'Math', icon: 'fas fa-sort-numeric-down' },
    { name: 'LCM Calculator', desc: 'Find least common multiple of numbers', url: '/math/calculators/lcm-calculator', category: 'Math', icon: 'fas fa-sort-numeric-up' },
    { name: 'SSE Calculator', desc: 'Calculate Sum of Squared Errors for statistical analysis', url: '/math/calculators/sse-calculator', category: 'Math', icon: 'fas fa-chart-line' },
    { name: 'Currency Calculator', desc: 'Convert between 150+ world currencies with real-time rates', url: '/finance/calculators/currency-calculator', category: 'Finance', icon: 'fas fa-exchange-alt' },
    { name: 'Loan Calculator', desc: 'Calculate loan payments, interest, and amortization schedules', url: '/finance/calculators/loan-calculator', category: 'Finance', icon: 'fas fa-home' },
    { name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments with taxes, insurance, and PMI', url: '/finance/calculators/mortgage-calculator', category: 'Finance', icon: 'fas fa-home' },
    { name: 'Amortization Calculator', desc: 'Generate detailed loan amortization schedules', url: '/finance/calculators/amortization-calculator', category: 'Finance', icon: 'fas fa-chart-line' },
    { name: 'House Affordability Calculator', desc: 'Calculate how much house you can afford', url: '/finance/calculators/house-affordability-calculator', category: 'Finance', icon: 'fas fa-home' },
    { name: 'Compound Interest Calculator', desc: 'Calculate investment growth with compound interest', url: '/finance/calculators/compound-interest-calculator', category: 'Finance', icon: 'fas fa-chart-area' },
    { name: 'Business Loan Calculator', desc: 'Calculate business loan payments and terms', url: '/finance/calculators/business-loan-calculator', category: 'Finance', icon: 'fas fa-briefcase' },
    { name: 'ROI Calculator', desc: 'Calculate return on investment and annualized returns', url: '/finance/calculators/roi-calculator', category: 'Finance', icon: 'fas fa-chart-line' },
    { name: 'Credit Card Calculator', desc: 'Calculate credit card payments, interest, and payoff time', url: '/finance/calculators/credit-card-calculator', category: 'Finance', icon: 'fas fa-credit-card' },
    { name: 'Investment Calculator', desc: 'Calculate investment growth, compound returns, and future value', url: '/finance/calculators/investment-calculator', category: 'Finance', icon: 'fas fa-chart-line' },
    { name: 'Tax Calculator', desc: 'Calculate federal and state income taxes, deductions, and credits', url: '/finance/calculators/tax-calculator', category: 'Finance', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Retirement Calculator', desc: 'Calculate retirement savings goals, monthly contributions, and future income', url: '/finance/calculators/retirement-calculator', category: 'Finance', icon: 'fas fa-piggy-bank' },
    { name: 'Sales Tax Calculator', desc: 'Calculate sales tax, subtotal, and total amount for purchases', url: '/finance/calculators/sales-tax-calculator', category: 'Finance', icon: 'fas fa-receipt' },
    { name: 'Debt Payoff Calculator', desc: 'Calculate debt payoff time, total interest, and payment strategies', url: '/finance/calculators/debt-payoff-calculator', category: 'Finance', icon: 'fas fa-credit-card' },
    { name: 'Insurance Calculator', desc: 'Calculate insurance premiums, coverage costs, and policy comparisons', url: '/finance/calculators/insurance-calculator', category: 'Finance', icon: 'fas fa-shield-alt' },
    { name: 'Budget Calculator', desc: 'Create and manage personal budgets with the 50-30-20 rule and custom allocations', url: '/finance/calculators/budget-calculator', category: 'Finance', icon: 'fas fa-calculator' },
    { name: 'Rental Property Calculator', desc: 'Calculate rental property ROI, cash flow, and investment returns', url: '/finance/calculators/rental-property-calculator', category: 'Finance', icon: 'fas fa-home' },
    { name: 'Debt Income Calculator', desc: 'Calculate your debt-to-income ratio to assess financial health and loan eligibility', url: '/finance/calculators/debt-income-calculator', category: 'Finance', icon: 'fas fa-balance-scale' },
    { name: 'Down Payment Calculator', desc: 'Calculate down payment amount, loan amount, and monthly mortgage payments', url: '/finance/calculators/down-payment-calculator', category: 'Finance', icon: 'fas fa-home' },
    { name: 'Present Value Calculator', desc: 'Calculate the present value of future cash flows and investments', url: '/finance/calculators/present-value-calculator', category: 'Finance', icon: 'fas fa-chart-line' },
    { name: 'Future Value Calculator', desc: 'Calculate the future value of investments and savings with compound interest', url: '/finance/calculators/future-value-calculator', category: 'Finance', icon: 'fas fa-chart-line' },
    { name: 'Gravity Calculator', desc: 'Calculate gravitational force and acceleration between two masses', url: '/science/calculators/gravity-calculator', category: 'Science', icon: 'fas fa-globe' },
    { name: 'Work Power Calculator', desc: 'Calculate work and power using force, distance, angle, and time', url: '/science/calculators/work-power-calculator', category: 'Science', icon: 'fas fa-cogs' },
    { name: 'DBm Watts Calculator', desc: 'Convert between dBm and Watts for power measurements in telecommunications', url: '/science/calculators/dbm-watts-calculator', category: 'Science', icon: 'fas fa-bolt' },
    { name: 'BMI Calculator', desc: 'Calculate your body mass index', url: '/health/calculators/bmi-calculator', category: 'Health', icon: 'fas fa-weight' },

    { name: 'QR Code Generator', desc: 'Generate QR codes instantly', url: '/utility-tools/converter-tools/qr-code-generator', category: 'Utility', icon: 'fas fa-qrcode' },
    { name: 'PDF to Image Converter', desc: 'Convert PDF pages to images (PNG/JPG)', url: '/utility-tools/converter-tools/pdf-to-image-converter', category: 'Utility', icon: 'fas fa-file-image' },
    { name: 'Password Generator', desc: 'Create secure passwords', url: '/utility-tools/converter-tools/password-generator', category: 'Utility', icon: 'fas fa-key' },
    { name: 'PDF Merger', desc: 'Combine multiple PDF files into one', url: '/utility-tools/converter-tools/merge-pdf', category: 'Utility', icon: 'fas fa-object-group' },
    { name: 'PDF Splitter', desc: 'Split PDF files into multiple documents', url: '/utility-tools/converter-tools/split-pdf', category: 'Utility', icon: 'fas fa-cut' },
    { name: 'Delete PDF Pages', desc: 'Remove unwanted pages from PDF files', url: '/utility-tools/converter-tools/delete-pdf-pages', category: 'Utility', icon: 'fas fa-trash-alt' },
    { name: 'Text Case Converter', desc: 'Convert text between different cases', url: '/utility-tools/converter-tools/text-case-converter', category: 'Utility', icon: 'fas fa-font' },
    { name: 'Age Calculator', desc: 'Calculate age in years, months, days', url: '/knowledge/calculators/age-calculator', category: 'Knowledge', icon: 'fas fa-calendar-alt' }
  ]

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
    return colors[index % colors.length]
  }

  return (
    <section className="tools-showcase">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Tools</h2>
          <p className="section-description">
            Discover our most popular and essential calculators and tools
          </p>
        </div>

        <div className="tools-grid">
          {featuredTools.map((tool, index) => (
            <Link
              key={index}
              to={tool.url}
              className="tool-card"
              style={{ '--tool-color': getToolColor(index) }}
            >
              <div className="tool-icon">
                <i className={tool.icon}></i>
              </div>
              <div
                className="tool-content"
                style={{ boxShadow: 'none !important' }}
              >
                <h4 className="tool-title">{tool.name}</h4>
                <p className="tool-description">{tool.desc}</p>
                <div className="tool-category">
                  <span className="tool-category-badge">{tool.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/math/math-calculators" className="cta-button">
            <i className="fas fa-arrow-right"></i>
            Explore All Tools
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ToolsShowcase 