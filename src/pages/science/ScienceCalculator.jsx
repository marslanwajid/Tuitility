import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const ScienceCalculator = () => {
  const scienceTools = [
    { name: 'Wave Speed Calculator', desc: 'Calculate wave speed, frequency, and wavelength', url: '/calculators/wave-speed-calculator', category: 'Physics', icon: 'fas fa-wave-square' },
    { name: 'Gravity Calculator', desc: 'Calculate gravitational force and acceleration', url: '/calculators/gravity-calculator', category: 'Physics', icon: 'fas fa-globe' },
    { name: 'Work Power Calculator', desc: 'Calculate work, power, and energy', url: '/calculators/work-power-calculator', category: 'Physics', icon: 'fas fa-cogs' },
    { name: 'DBm Watts Calculator', desc: 'Convert between dBm and watts', url: '/calculators/dbm-watts-calculator', category: 'Electronics', icon: 'fas fa-bolt' },
    { name: 'DBm to Milliwatts Calculator', desc: 'Convert between dBm and milliwatts', url: '/calculators/dbm-milliwatts-calculator', category: 'Electronics', icon: 'fas fa-broadcast-tower' },
    { name: 'Capacitance Calculator', desc: 'Calculate electrical capacitance from energy and voltage', url: '/calculators/capacitance-calculator', category: 'Electronics', icon: 'fas fa-microchip' },
    { name: 'Electric Flux Calculator', desc: 'Calculate electric flux through surfaces using electric field and area', url: '/calculators/electric-flux-calculator', category: 'Electronics', icon: 'fas fa-lightning' },
    { name: 'Average Atomic Mass Calculator', desc: 'Calculate the average atomic mass of an element from its isotopes', url: '/calculators/average-atomic-mass-calculator', category: 'Chemistry', icon: 'fas fa-atom' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Physics', name: 'Physics', icon: 'fas fa-cogs' },
    { id: 'Electronics', name: 'Electronics', icon: 'fas fa-microchip' },
    { id: 'Chemistry', name: 'Chemistry', icon: 'fas fa-atom' }
  ]

  return (
    <CategoryPage
      title="Science Calculators"
      description="Advanced scientific calculators for physics, chemistry, and electronics. Perform complex calculations with precision and accuracy."
      tools={scienceTools}
      categories={categories}
      searchPlaceholder="Search science calculators..."
      baseUrl="/science"
    />
  )
}

export default ScienceCalculator 