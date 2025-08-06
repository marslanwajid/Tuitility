import React from 'react'
import HeroSection from './HeroSection'
import CategoryNavigation from './CategoryNavigation'
import ToolsShowcase from './ToolsShowcase'
import PopularTools from './PopularTools'
import "../assets/css/home.css"

const Home = () => {
  return (
    <div className="home-container">
      <HeroSection />
      <CategoryNavigation />
      <ToolsShowcase />
      <PopularTools />
    </div>
  )
}

export default Home