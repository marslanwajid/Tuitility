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
    { name: 'BMI Calculator', desc: 'Calculate your body mass index', url: '/health/calculators/bmi-calculator', category: 'Health', icon: 'fas fa-weight' },
    { name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments', url: '/finance/mortgage-calculator', category: 'Finance', icon: 'fas fa-home' },
    { name: 'QR Code Generator', desc: 'Generate QR codes instantly', url: '/utility-tools/converter-tools/qr-code-generator', category: 'Utility', icon: 'fas fa-qrcode' },
    { name: 'Password Generator', desc: 'Create secure passwords', url: '/utility-tools/converter-tools/password-generator', category: 'Utility', icon: 'fas fa-key' },
    { name: 'PDF Merger', desc: 'Combine multiple PDF files into one', url: '/utility-tools/converter-tools/merge-pdf', category: 'Utility', icon: 'fas fa-object-group' },
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
              <div className="tool-content">
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