import React from 'react'
import { Routes, Route } from 'react-router-dom'
// import './assets/css/tool-components.css'
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
import FractionToPercentCalculator from './components/math/FractionToPercentCalculator'
import BinaryCalculatorTool from './components/tool/BinaryCalculatorTool'
import ComparingDecimalsCalculator from './components/math/ComparingDecimalsCalculator'
import ComparingFractionsCalculator from './components/math/ComparingFractionsCalculator'
import DecimalCalculator from './components/math/DecimalCalculator'
import DecimalToFractionCalculator from './components/math/DecimalToFractionCalculator'
import DerivativeCalculator from './components/math/DerivativeCalculator'
import ImproperFractionToMixedCalculator from './components/math/ImproperFractionToMixedCalculator'
import IntegralCalculator from './components/math/IntegralCalculator'
import PercentageCalculator from './components/math/PercentageCalculator'
import PercentToFractionCalculator from './components/math/PercentToFractionCalculator'
import LCMCalculator from './components/math/LCMCalculator'
import LCDCalculator from './components/math/LCDCalculator'
// import FractionToPercentCalculator from './components/math/FractionToPercentCalculator'
// import PercentToFractionCalculator from './components/math/PercentToFractionCalculator'
import SSECalculator from './components/math/SSECalculator'
// import MortgageCalculator from './components/finance/MortgageCalculator'
// import LoanCalculator from './components/finance/LoanCalculator'
// import CurrencyCalculator from './components/finance/CurrencyCalculator'


const App = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more routes here as needed */}
        <Route path="/math" element={<MathCalculator />} />
        <Route path="/math/calculators/binary-calculator" element={<BinaryCalculatorTool />} />
        <Route path="/math/calculators/comparing-decimals-calculator" element={<ComparingDecimalsCalculator />} />
        <Route path="/math/calculators/comparing-fractions-calculator" element={<ComparingFractionsCalculator />} />
        <Route path="/math/calculators/decimal-calculator" element={<DecimalCalculator />} />
        <Route path="/math/calculators/decimal-to-fraction-calculator" element={<DecimalToFractionCalculator />} />
        <Route path="/math/calculators/derivative-calculator" element={<DerivativeCalculator />} />
        <Route path="/math/calculators/fraction-calculator" element={<FractionCalculator />} />
        <Route path="/math/calculators/fraction-to-percent-calculator" element={<FractionToPercentCalculator />} />
        <Route path="/math/calculators/improper-fraction-to-mixed-calculator" element={<ImproperFractionToMixedCalculator />} />
        <Route path="/math/calculators/integral-calculator" element={<IntegralCalculator />} />
        <Route path="/math/calculators/lcd-calculator" element={<LCDCalculator />} />
        <Route path="/math/calculators/lcm-calculator" element={<LCMCalculator />} />
        <Route path="/math/calculators/percentage-calculator" element={<PercentageCalculator />} />
        <Route path="/math/calculators/percent-to-fraction-calculator" element={<PercentToFractionCalculator />} />
        <Route path="/math/calculators/sse-calculator" element={<SSECalculator />} />
                       {/* <Route path="/finance" element={<FinanceCalculator />} />
                             <Route path="/finance/mortgage-calculator" element={<MortgageCalculator />} />
                             <Route path="/finance/loan-calculator" element={<LoanCalculator />} />
                             <Route path="/finance/currency-calculator" element={<CurrencyCalculator />} /> */}
           
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