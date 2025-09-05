import React from 'react'
import { Link } from 'react-router-dom'
import '../assets/css/popular-tools.css'

const PopularTools = () => {
  const popularTools = [
    { name: 'Fraction Calculator', desc: 'Add, subtract, multiply and divide fractions', url: '/math/calculators/fraction-calculator', category: 'Math', icon: 'fas fa-divide', rating: 4.8, usage: '50K+' },
    { name: 'BMI Calculator', desc: 'Calculate your body mass index', url: '/health/calculators/bmi-calculator', category: 'Health', icon: 'fas fa-weight', rating: 4.9, usage: '75K+' },
    
    { name: 'Password Generator', desc: 'Create secure passwords', url: '/utility-tools/converter-tools/password-generator', category: 'Utility', icon: 'fas fa-key', rating: 4.6, usage: '25K+' },
    { name: 'Percentage Calculator', desc: 'Calculate percentages quickly and easily', url: '/math/calculators/percentage-calculator', category: 'Math', icon: 'fas fa-percentage', rating: 4.8, usage: '45K+' },
    { name: 'Decimal Calculator', desc: 'Perform precise arithmetic operations on decimal numbers', url: '/math/calculators/decimal-calculator', category: 'Math', icon: 'fas fa-calculator', rating: 4.7, usage: '40K+' },
    { name: 'Decimal to Fraction', desc: 'Convert decimals to fractions with step-by-step solutions', url: '/math/calculators/decimal-to-fraction-calculator', category: 'Math', icon: 'fas fa-exchange-alt', rating: 4.6, usage: '35K+' },
    { name: 'Derivative Calculator', desc: 'Calculate derivatives with step-by-step solutions', url: '/math/calculators/derivative-calculator', category: 'Math', icon: 'fas fa-function', rating: 4.7, usage: '38K+' },
    { name: 'Comparing Fractions', desc: 'Compare fractions, decimals, and percentages', url: '/math/calculators/comparing-fractions-calculator', category: 'Math', icon: 'fas fa-balance-scale', rating: 4.7, usage: '35K+' },
    { name: 'Improper to Mixed', desc: 'Convert improper fractions to mixed numbers', url: '/math/calculators/improper-fraction-to-mixed-calculator', category: 'Math', icon: 'fas fa-layer-group', rating: 4.6, usage: '32K+' },
    { name: 'Percent to Fraction', desc: 'Convert percentages to simplified fractions', url: '/math/calculators/percent-to-fraction-calculator', category: 'Math', icon: 'fas fa-percentage', rating: 4.7, usage: '38K+' },
            { name: 'Integral Calculator', desc: 'Calculate definite and indefinite integrals', url: '/math/calculators/integral-calculator', category: 'Math', icon: 'fas fa-calculator', rating: 4.7, usage: '35K+' },
        { name: 'Percentage Calculator', desc: 'Calculate percentages with 14 different types', url: '/math/calculators/percentage-calculator', category: 'Math', icon: 'fas fa-percentage', rating: 4.8, usage: '40K+' },
        { name: 'LCD Calculator', desc: 'Find least common denominator of fractions', url: '/math/calculators/lcd-calculator', category: 'Math', icon: 'fas fa-sort-numeric-down', rating: 4.6, usage: '30K+' },
        { name: 'LCM Calculator', desc: 'Find least common multiple of numbers', url: '/math/calculators/lcm-calculator', category: 'Math', icon: 'fas fa-sort-numeric-up', rating: 4.7, usage: '28K+' },
                { name: 'SSE Calculator', desc: 'Calculate Sum of Squared Errors for statistical analysis', url: '/math/calculators/sse-calculator', category: 'Math', icon: 'fas fa-chart-line', rating: 4.6, usage: '25K+' },
            { name: 'Currency Calculator', desc: 'Convert between 150+ world currencies with real-time rates', url: '/finance/calculators/currency-calculator', category: 'Finance', icon: 'fas fa-exchange-alt', rating: 4.8, usage: '45K+' },
            { name: 'Loan Calculator', desc: 'Calculate loan payments, interest, and amortization schedules', url: '/finance/calculators/loan-calculator', category: 'Finance', icon: 'fas fa-home', rating: 4.7, usage: '38K+' },
            { name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments with taxes, insurance, and PMI', url: '/finance/calculators/mortgage-calculator', category: 'Finance', icon: 'fas fa-home', rating: 4.8, usage: '42K+' },
            { name: 'Amortization Calculator', desc: 'Generate detailed loan amortization schedules', url: '/finance/calculators/amortization-calculator', category: 'Finance', icon: 'fas fa-chart-line', rating: 4.6, usage: '35K+' },
            { name: 'House Affordability Calculator', desc: 'Calculate how much house you can afford', url: '/finance/calculators/house-affordability-calculator', category: 'Finance', icon: 'fas fa-home', rating: 4.7, usage: '28K+' },
            { name: 'Business Loan Calculator', desc: 'Calculate business loan payments and terms', url: '/finance/calculators/business-loan-calculator', category: 'Finance', icon: 'fas fa-briefcase', rating: 4.6, usage: '25K+' },
                    { name: 'Compound Interest Calculator', desc: 'Calculate investment growth with compound interest', url: '/finance/calculators/compound-interest-calculator', category: 'Finance', icon: 'fas fa-chart-area', rating: 4.8, usage: '32K+' },
        { name: 'ROI Calculator', desc: 'Calculate return on investment and annualized returns', url: '/finance/calculators/roi-calculator', category: 'Finance', icon: 'fas fa-chart-line', rating: 4.7, usage: '30K+' },
        { name: 'Credit Card Calculator', desc: 'Calculate credit card payments, interest, and payoff time', url: '/finance/calculators/credit-card-calculator', category: 'Finance', icon: 'fas fa-credit-card', rating: 4.6, usage: '28K+' },
        { name: 'Investment Calculator', desc: 'Calculate investment growth, compound returns, and future value', url: '/finance/calculators/investment-calculator', category: 'Finance', icon: 'fas fa-chart-line', rating: 4.7, usage: '32K+' },
        { name: 'Tax Calculator', desc: 'Calculate federal and state income taxes, deductions, and credits', url: '/finance/calculators/tax-calculator', category: 'Finance', icon: 'fas fa-file-invoice-dollar', rating: 4.8, usage: '45K+' },
        { name: 'Retirement Calculator', desc: 'Calculate retirement savings goals, monthly contributions, and future income', url: '/finance/calculators/retirement-calculator', category: 'Finance', icon: 'fas fa-piggy-bank', rating: 4.9, usage: '38K+' },
        { name: 'Sales Tax Calculator', desc: 'Calculate sales tax, subtotal, and total amount for purchases', url: '/finance/calculators/sales-tax-calculator', category: 'Finance', icon: 'fas fa-receipt', rating: 4.7, usage: '42K+' },
        { name: 'Debt Payoff Calculator', desc: 'Calculate debt payoff time, total interest, and payment strategies', url: '/finance/calculators/debt-payoff-calculator', category: 'Finance', icon: 'fas fa-credit-card', rating: 4.8, usage: '35K+' },
        { name: 'Insurance Calculator', desc: 'Calculate insurance premiums, coverage costs, and policy comparisons', url: '/finance/calculators/insurance-calculator', category: 'Finance', icon: 'fas fa-shield-alt', rating: 4.6, usage: '28K+' },
        { name: 'Budget Calculator', desc: 'Create and manage personal budgets with the 50-30-20 rule and custom allocations', url: '/finance/calculators/budget-calculator', category: 'Finance', icon: 'fas fa-calculator', rating: 4.7, usage: '40K+' },
        { name: 'Rental Property Calculator', desc: 'Calculate rental property ROI, cash flow, and investment returns', url: '/finance/calculators/rental-property-calculator', category: 'Finance', icon: 'fas fa-home', rating: 4.8, usage: '25K+' },
        { name: 'Debt Income Calculator', desc: 'Calculate your debt-to-income ratio to assess financial health and loan eligibility', url: '/finance/calculators/debt-income-calculator', category: 'Finance', icon: 'fas fa-balance-scale', rating: 4.9, usage: '35K+' },
        { name: 'Down Payment Calculator', desc: 'Calculate down payment amount, loan amount, and monthly mortgage payments', url: '/finance/calculators/down-payment-calculator', category: 'Finance', icon: 'fas fa-home', rating: 4.8, usage: '30K+' },
        { name: 'Present Value Calculator', desc: 'Calculate the present value of future cash flows and investments', url: '/finance/calculators/present-value-calculator', category: 'Finance', icon: 'fas fa-chart-line', rating: 4.7, usage: '25K+' },
        { name: 'Future Value Calculator', desc: 'Calculate the future value of investments and savings with compound interest', url: '/finance/calculators/future-value-calculator', category: 'Finance', icon: 'fas fa-chart-line', rating: 4.7, usage: '25K+' },
        { name: 'Gravity Calculator', desc: 'Calculate gravitational force and acceleration between two masses', url: '/science/calculators/gravity-calculator', category: 'Science', icon: 'fas fa-globe', rating: 4.8, usage: '30K+' },
        { name: 'Work Power Calculator', desc: 'Calculate work and power using force, distance, angle, and time', url: '/science/calculators/work-power-calculator', category: 'Science', icon: 'fas fa-cogs', rating: 4.7, usage: '25K+' },
        { name: 'DBm Watts Calculator', desc: 'Convert between dBm and Watts for power measurements in telecommunications', url: '/science/calculators/dbm-watts-calculator', category: 'Science', icon: 'fas fa-bolt', rating: 4.6, usage: '20K+' },
      { name: 'Age Calculator', desc: 'Calculate age in years, months, days', url: '/knowledge/calculators/age-calculator', category: 'Knowledge', icon: 'fas fa-calendar-alt', rating: 4.5, usage: '20K+' },
    { name: 'QR Code Generator', desc: 'Generate QR codes instantly', url: '/utility-tools/converter-tools/qr-code-generator', category: 'Utility', icon: 'fas fa-qrcode', rating: 4.7, usage: '35K+' },
    { name: 'PDF Merger', desc: 'Combine multiple PDF files into one', url: '/utility-tools/converter-tools/merge-pdf', category: 'Utility', icon: 'fas fa-object-group', rating: 4.6, usage: '28K+' }
  ]

  const getToolColor = (index) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#84cc16']
    return colors[index % colors.length]
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star star"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt star"></i>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fas fa-star star empty"></i>)
    }

    return stars
  }

  return (
    <section className="popular-tools">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Tools</h2>
          <p className="section-description">
            Our most used and highly rated calculators and tools
          </p>
        </div>

        <div className="tools-grid">
          {popularTools.map((tool, index) => (
            <Link
              key={index}
              to={tool.url}
              className="tool-card"
              style={{ '--tool-color': getToolColor(index) }}
            >
              <div className="tool-icon">
                <i className={tool.icon}></i>
              </div>
              <div className="tool-content">
                <h4 className="tool-title">{tool.name}</h4>
                <p className="tool-description">{tool.desc}</p>
                
                <div className="tool-rating">
                  <div className="stars">
                    {renderStars(tool.rating)}
                  </div>
                  <span className="rating-text">{tool.rating}</span>
                </div>

                <div className="tool-stats">
                  <span className="usage-count">{tool.usage} users</span>
                  <span className="popular-badge">
                    <i className="fas fa-fire"></i>
                    Popular
                  </span>
                </div>

                <div className="tool-category">
                  <span className="tool-category-badge">{tool.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularTools 