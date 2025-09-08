import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const HealthCalculator = () => {
  const healthTools = [
    { name: 'BMI Calculator', desc: 'Calculate your body mass index with advanced body composition analysis', url: '/health/calculators/bmi-calculator', category: 'Fitness', icon: 'fas fa-weight' },
    { name: 'Calorie Calculator', desc: 'Calculate daily calorie needs, BMR, and macronutrient requirements for weight management', url: '/health/calculators/calorie-calculator', category: 'Nutrition', icon: 'fas fa-apple-alt' },
    { name: 'Water Intake Calculator', desc: 'Calculate daily water requirements', url: '/health/calculators/water-intake-calculator', category: 'Nutrition', icon: 'fas fa-tint' },
    { name: 'Weight Loss Calculator', desc: 'Plan your weight loss journey', url: '/health/calculators/weight-loss-calculator', category: 'Fitness', icon: 'fas fa-chart-line' },
    { name: 'Body Fat Calculator', desc: 'Calculate body fat percentage', url: '/health/calculators/body-fat-calculator', category: 'Fitness', icon: 'fas fa-user' },
    { name: 'Ideal Weight Calculator', desc: 'Find your ideal body weight', url: '/health/calculators/ideal-body-weight-calculator', category: 'Fitness', icon: 'fas fa-balance-scale' },
    { name: 'Diabetes Risk Calculator', desc: 'Assess your diabetes risk', url: '/health/calculators/diabetes-risk-calculator', category: 'Health Assessment', icon: 'fas fa-chart-pie' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Fitness', name: 'Fitness', icon: 'fas fa-dumbbell' },
    { id: 'Nutrition', name: 'Nutrition', icon: 'fas fa-apple-alt' },
    { id: 'Health Assessment', name: 'Health Assessment', icon: 'fas fa-heartbeat' }
  ]

  return (
    <CategoryPage
      title="Health Calculators"
      description="Comprehensive health and fitness calculators to help you track your wellness journey, nutrition, and overall health metrics."
      tools={healthTools}
      categories={categories}
      searchPlaceholder="Search health calculators..."
      baseUrl="/health"
    />
  )
}

export default HealthCalculator 