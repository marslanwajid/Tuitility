import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './assets/css/tool-components.css'
import Home from './components/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import MathCalculator from './pages/math/MathCalculator'
import FinanceCalculator from './pages/finance/FinanceCalculator'
import ScienceCalculator from './pages/science/ScienceCalculator'
import HealthCalculator from './pages/health/HealthCalculator'
import UtilityTools from './pages/utility/UtilityTools'
import KnowledgeCalculator from './pages/knowledge/KnowledgeCalculator'
import FractionCalculator from './components/math/FractionCalculator'
import BinaryCalculator from './components/math/BinaryCalculator'
import DecimalCalculator from './components/math/DecimalCalculator'
import PercentageCalculator from './components/math/PercentageCalculator'

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more routes here as needed */}
        <Route path="/math" element={<MathCalculator />} />
                       <Route path="/math/calculators/fraction-calculator" element={<FractionCalculator />} />
               <Route path="/math/calculators/binary-calculator" element={<BinaryCalculator />} />
               <Route path="/math/calculators/decimal-calculator" element={<DecimalCalculator />} />
               <Route path="/math/calculators/percentage-calculator" element={<PercentageCalculator />} />
        <Route path="/finance" element={<FinanceCalculator />} />
        <Route path="/science" element={<ScienceCalculator />} />
        <Route path="/health" element={<HealthCalculator />} />
        <Route path="/utility-tools" element={<UtilityTools />} />
        <Route path="/knowledge" element={<KnowledgeCalculator />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App