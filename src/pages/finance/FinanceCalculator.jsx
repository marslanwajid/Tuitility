import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const FinanceCalculator = () => {
  const financeTools = [
    { name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments', url: '/finance/mortgage-calculator', category: 'Loans', icon: 'fas fa-home' },
    { name: 'Loan Calculator', desc: 'Calculate loan payments and interest', url: '/finance/loan-calculator', category: 'Loans', icon: 'fas fa-hand-holding-usd' },
    { name: 'Currency Converter', desc: 'Convert between different currencies', url: '/finance/currency-calculator', category: 'Currency', icon: 'fas fa-exchange-alt' },
    { name: 'Amortization Calculator', desc: 'Calculate loan amortization schedule', url: '/finance/amortization-calculator', category: 'Loans', icon: 'fas fa-chart-line' },
    { name: 'House Affordability', desc: 'How much house can you afford?', url: '/finance/house-affordability-calculator', category: 'Real Estate', icon: 'fas fa-house-user' },
    { name: 'Compound Interest', desc: 'Calculate compound interest growth', url: '/finance/compound-interest-calculator', category: 'Investments', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', desc: 'Calculate return on investment', url: '/finance/roi-calculator', category: 'Investments', icon: 'fas fa-trending-up' },
    { name: 'Business Loan Calculator', desc: 'Calculate business loan payments', url: '/finance/business-loan-calculator', category: 'Business', icon: 'fas fa-briefcase' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Loans', name: 'Loans', icon: 'fas fa-hand-holding-usd' },
    { id: 'Currency', name: 'Currency', icon: 'fas fa-exchange-alt' },
    { id: 'Real Estate', name: 'Real Estate', icon: 'fas fa-home' },
    { id: 'Investments', name: 'Investments', icon: 'fas fa-chart-line' },
    { id: 'Business', name: 'Business', icon: 'fas fa-briefcase' }
  ]

  return (
    <CategoryPage
      title="Finance Calculators"
      description="Comprehensive financial planning tools to help you make informed decisions about loans, investments, real estate, and business finances."
      tools={financeTools}
      categories={categories}
      searchPlaceholder="Search finance calculators..."
      baseUrl="/finance"
    />
  )
}

export default FinanceCalculator 