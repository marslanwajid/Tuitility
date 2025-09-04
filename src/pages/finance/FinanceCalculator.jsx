import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const FinanceCalculator = () => {
  const financeTools = [
            { name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments with taxes, insurance, PMI', url: '/finance/calculators/mortgage-calculator', category: 'Real Estate', icon: 'fas fa-home' },
         { name: 'Loan Calculator', desc: 'Calculate loan payments with down payment and fees', url: '/finance/calculators/loan-calculator', category: 'Personal Loans', icon: 'fas fa-hand-holding-usd' },
        { name: 'Currency Calculator', desc: 'Convert between 170+ world currencies with real-time rates', url: '/finance/calculators/currency-calculator', category: 'Currency', icon: 'fas fa-exchange-alt' },
        { name: 'House Affordability Calculator', desc: 'Calculate how much house you can afford', url: '/finance/calculators/house-affordability-calculator', category: 'Real Estate', icon: 'fas fa-home' },
                { name: 'Compound Interest Calculator', desc: 'Calculate investment growth with compound interest', url: '/finance/calculators/compound-interest-calculator', category: 'Investments', icon: 'fas fa-chart-area' },
        { name: 'ROI Calculator', desc: 'Calculate return on investment and annualized returns', url: '/finance/calculators/roi-calculator', category: 'Investments', icon: 'fas fa-chart-line' },
      { name: 'Amortization Calculator', desc: 'Generate detailed loan amortization schedules', url: '/finance/calculators/amortization-calculator', category: 'Loans', icon: 'fas fa-chart-line' },
    { name: 'Business Loan Calculator', desc: 'Calculate business loan payments and terms', url: '/finance/calculators/business-loan-calculator', category: 'Business', icon: 'fas fa-briefcase' },
    { name: 'Credit Card Calculator', desc: 'Calculate credit card payments and interest', url: '/finance/calculators/credit-card-calculator', category: 'Loans', icon: 'fas fa-credit-card' },
    { name: 'Investment Calculator', desc: 'Plan your investment strategy and growth', url: '/finance/calculators/investment-calculator', category: 'Investments', icon: 'fas fa-chart-pie' },
    { name: 'Tax Calculator', desc: 'Calculate income tax and deductions', url: '/finance/calculators/tax-calculator', category: 'Taxes', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Retirement Calculator', desc: 'Plan your retirement savings and income', url: '/finance/calculators/retirement-calculator', category: 'Planning', icon: 'fas fa-piggy-bank' },
    { name: 'Debt Payoff Calculator', desc: 'Create debt payoff strategies and schedules', url: '/finance/calculators/debt-payoff-calculator', category: 'Loans', icon: 'fas fa-credit-card' },
    { name: 'Insurance Calculator', desc: 'Calculate insurance premiums and coverage', url: '/finance/calculators/insurance-calculator', category: 'Insurance', icon: 'fas fa-shield-alt' },
    { name: 'Sales Tax Calculator', desc: 'Calculate sales tax and total cost', url: '/finance/calculators/sales-tax-calculator', category: 'Taxes', icon: 'fas fa-receipt' },
    { name: 'Rental Property Calculator', desc: 'Calculate rental property ROI and cash flow', url: '/finance/calculators/rental-property-calculator', category: 'Real Estate', icon: 'fas fa-home' },
    { name: 'Budget Calculator', desc: 'Create and manage personal budgets', url: '/finance/calculators/budget-calculator', category: 'Planning', icon: 'fas fa-calculator' },
    { name: 'Debt Income Calculator', desc: 'Calculate your debt-to-income ratio to assess financial health and loan eligibility', url: '/finance/calculators/debt-income-calculator', category: 'Loans', icon: 'fas fa-balance-scale' },
    { name: 'Down Payment Calculator', desc: 'Calculate the down payment needed for a home purchase', url: '/finance/calculators/down-payment-calculator', category: 'Real Estate', icon: 'fas fa-home' },
    { name: 'Present Value Calculator', desc: 'Calculate the present value of a future amount', url: '/finance/calculators/present-value-calculator', category: 'Investments', icon: 'fas fa-chart-line' },
    { name: 'Future Value Calculator', desc: 'Calculate the future value of a present amount', url: '/finance/calculators/future-value-calculator', category: 'Investments', icon: 'fas fa-chart-line' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Loans', name: 'Loans', icon: 'fas fa-hand-holding-usd' },
    { id: 'Currency', name: 'Currency', icon: 'fas fa-exchange-alt' },
    { id: 'Real Estate', name: 'Real Estate', icon: 'fas fa-home' },
    { id: 'Investments', name: 'Investments', icon: 'fas fa-chart-line' },
    { id: 'Business', name: 'Business', icon: 'fas fa-briefcase' },
    { id: 'Taxes', name: 'Taxes', icon: 'fas fa-file-invoice-dollar' },
    { id: 'Planning', name: 'Planning', icon: 'fas fa-calendar-alt' },
    { id: 'Insurance', name: 'Insurance', icon: 'fas fa-shield-alt' }
  ]

  return (
    <CategoryPage
      title="Finance Calculators"
      description="Comprehensive financial planning tools to help you make informed decisions about loans, investments, real estate, business finances, and personal financial planning."
      tools={financeTools}
      categories={categories}
      searchPlaceholder="Search finance calculators..."
      baseUrl=""
    />
  )
}

export default FinanceCalculator 