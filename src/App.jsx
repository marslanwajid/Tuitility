import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Header from './components/Header'

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add more routes here as needed */}
        <Route path="/math/math-calculators" element={<div>Math Calculators Page</div>} />
        <Route path="/finance/finance-calculators" element={<div>Finance Calculators Page</div>} />
        <Route path="/science/science-calculators" element={<div>Science Calculators Page</div>} />
        <Route path="/health/health-calculators" element={<div>Health Calculators Page</div>} />
        <Route path="/utility-tools/conversion-tools" element={<div>Utility Tools Page</div>} />
        <Route path="/knowledge/knowledge-calculators" element={<div>Knowledge Calculators Page</div>} />
      </Routes>
    </>
  )
}

export default App