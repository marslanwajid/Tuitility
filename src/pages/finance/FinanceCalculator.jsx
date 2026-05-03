import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const FinanceCalculator = () => {
  const financeTools = [
    { name: 'Mortgage Calculator', desc: 'Estimate mortgage payments with taxes, insurance, PMI, HOA fees, and total long-term borrowing cost.', url: '/finance/calculators/mortgage-calculator', category: 'Real Estate', icon: 'fas fa-home' },
    { name: 'Loan Calculator', desc: 'Calculate loan payments, fees, loan-to-value impact, and the full cost of borrowing over time.', url: '/finance/calculators/loan-calculator', category: 'Personal Loans', icon: 'fas fa-hand-holding-usd' },
    { name: 'Currency Calculator', desc: 'Convert world currencies with live exchange rates, reverse rates, and major forex pair comparisons.', url: '/finance/calculators/currency-calculator', category: 'Currency', icon: 'fas fa-exchange-alt' },
    { name: 'House Affordability Calculator', desc: 'Estimate how much house you can afford based on income, debt, rate, and homeownership costs.', url: '/finance/calculators/house-affordability-calculator', category: 'Real Estate', icon: 'fas fa-home' },
    { name: 'Compound Interest Calculator', desc: 'Project long-term investment growth with compounding frequency and regular contribution scenarios.', url: '/finance/calculators/compound-interest-calculator', category: 'Investments', icon: 'fas fa-chart-area' },
    { name: 'ROI Calculator', desc: 'Measure return on investment, profitability, and annualized performance for business and investment decisions.', url: '/finance/calculators/roi-calculator', category: 'Investments', icon: 'fas fa-chart-line' },
    { name: 'Amortization Calculator', desc: 'Generate amortization schedules with monthly principal, interest, and remaining balance by payment period.', url: '/finance/calculators/amortization-calculator', category: 'Loans', icon: 'fas fa-chart-line' },
    { name: 'Business Loan Calculator', desc: 'Estimate business financing payments, origination fees, documentation costs, and all-in loan expense.', url: '/finance/calculators/business-loan-calculator', category: 'Business', icon: 'fas fa-briefcase' },
    { name: 'Credit Card Calculator', desc: 'Estimate APR-driven interest, payoff time, and total repayment cost for revolving card balances.', url: '/finance/calculators/credit-card-calculator', category: 'Loans', icon: 'fas fa-credit-card' },
    { name: 'Investment Calculator', desc: 'Plan contributions, projected returns, and total portfolio growth with long-term investment scenarios.', url: '/finance/calculators/investment-calculator', category: 'Investments', icon: 'fas fa-chart-pie' },
    { name: 'Tax Calculator', desc: 'Estimate income tax obligations, deductions, and take-home impact for personal financial planning.', url: '/finance/calculators/tax-calculator', category: 'Taxes', icon: 'fas fa-file-invoice-dollar' },
    { name: 'Retirement Calculator', desc: 'Project retirement savings, future income needs, and how long your retirement funds may last.', url: '/finance/calculators/retirement-calculator', category: 'Planning', icon: 'fas fa-piggy-bank' },
    { name: 'Debt Payoff Calculator', desc: 'Build debt payoff plans and compare repayment strategies to reduce interest and payoff time.', url: '/finance/calculators/debt-payoff-calculator', category: 'Loans', icon: 'fas fa-credit-card' },
    { name: 'Insurance Calculator', desc: 'Estimate insurance needs, premium ranges, and coverage considerations for financial protection planning.', url: '/finance/calculators/insurance-calculator', category: 'Insurance', icon: 'fas fa-shield-alt' },
    { name: 'Sales Tax Calculator', desc: 'Calculate sales tax amounts, tax-inclusive totals, and final purchase prices quickly and accurately.', url: '/finance/calculators/sales-tax-calculator', category: 'Taxes', icon: 'fas fa-receipt' },
    { name: 'Rental Property Calculator', desc: 'Analyze rental property cash flow, ROI, expenses, and long-term investment performance.', url: '/finance/calculators/rental-property-calculator', category: 'Real Estate', icon: 'fas fa-home' },
    { name: 'Budget Calculator', desc: 'Plan income, expenses, savings, and category allocations with practical budgeting frameworks.', url: '/finance/calculators/budget-calculator', category: 'Planning', icon: 'fas fa-calculator' },
    { name: 'Debt Income Calculator', desc: 'Calculate debt-to-income ratio to assess loan eligibility, repayment pressure, and financial risk.', url: '/finance/calculators/debt-income-calculator', category: 'Loans', icon: 'fas fa-balance-scale' },
    { name: 'Down Payment Calculator', desc: 'Estimate the down payment required for a home purchase and its impact on financing.', url: '/finance/calculators/down-payment-calculator', category: 'Real Estate', icon: 'fas fa-home' },
    { name: 'Present Value Calculator', desc: 'Find the present value of a future amount using discounting and time-value-of-money logic.', url: '/finance/calculators/present-value-calculator', category: 'Investments', icon: 'fas fa-chart-line' },
    { name: 'Future Value Calculator', desc: 'Estimate the future value of money based on growth rate, time horizon, and compounding.', url: '/finance/calculators/future-value-calculator', category: 'Investments', icon: 'fas fa-chart-line' }
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
      description="Browse finance calculators for mortgages, loans, debt payoff, budgeting, taxes, business financing, insurance, currency exchange, and investment planning. Compare costs, project growth, and make better financial decisions with detailed calculation tools."
      tools={financeTools}
      categories={categories}
      searchPlaceholder="Search finance calculators..."
      baseUrl=""
    />
  )
}

export default FinanceCalculator 
