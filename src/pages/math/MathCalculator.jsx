import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const MathCalculator = () => {
  const mathTools = [
    { name: 'Fraction Calculator', desc: 'Add, subtract, multiply and divide fractions', url: '/math/calculators/fraction-calculator', category: 'Fractions', icon: 'fas fa-divide' },
    { name: 'Percentage Calculator', desc: 'Calculate percentages quickly and easily', url: '/math/calculators/percentage-calculator', category: 'Percentages', icon: 'fas fa-percentage' },
    { name: 'Decimal to Fraction', desc: 'Convert decimals to fractions instantly', url: '/math/calculators/decimal-to-fraction-calculator', category: 'Conversions', icon: 'fas fa-arrows-alt-h' },
    { name: 'LCM Calculator', desc: 'Find least common multiple', url: '/math/calculators/lcm-calculator', category: 'Number Theory', icon: 'fas fa-sort-numeric-up' },
    { name: 'Binary Calculator', desc: 'Convert and calculate binary numbers', url: '/math/calculators/binary-calculator', category: 'Number Systems', icon: 'fas fa-1' },
    { name: 'LCD Calculator', desc: 'Find lowest common denominator', url: '/math/calculators/lcd-calculator', category: 'Number Theory', icon: 'fas fa-sort-numeric-down' },
    { name: 'Compare Fractions', desc: 'Compare multiple fractions', url: '/math/calculators/comparing-fractions-calculator', category: 'Fractions', icon: 'fas fa-balance-scale' },
    { name: 'Decimal Calculator', desc: 'Perform decimal arithmetic operations', url: '/math/calculators/decimal-calculator', category: 'Decimals', icon: 'fas fa-calculator' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Fractions', name: 'Fractions', icon: 'fas fa-divide' },
    { id: 'Percentages', name: 'Percentages', icon: 'fas fa-percentage' },
    { id: 'Conversions', name: 'Conversions', icon: 'fas fa-exchange-alt' },
    { id: 'Number Theory', name: 'Number Theory', icon: 'fas fa-sort-numeric-up' },
    { id: 'Number Systems', name: 'Number Systems', icon: 'fas fa-1' },
    { id: 'Decimals', name: 'Decimals', icon: 'fas fa-calculator' }
  ]

  return (
    <CategoryPage
      title="Math Calculators"
      description="Powerful mathematical tools to solve complex calculations, convert between number systems, and perform advanced mathematical operations with ease."
      tools={mathTools}
      categories={categories}
      searchPlaceholder="Search math calculators..."
      baseUrl=""
    />
  )
}

export default MathCalculator 