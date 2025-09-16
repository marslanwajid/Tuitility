import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const HealthCalculator = () => {
  const healthTools = [
    { name: 'BMI Calculator', desc: 'Calculate your body mass index with advanced body composition analysis', url: '/calculators/bmi-calculator', category: 'Fitness', icon: 'fas fa-weight' },
    { name: 'Calorie Calculator', desc: 'Calculate daily calorie needs, BMR, and macronutrient requirements for weight management', url: '/calculators/calorie-calculator', category: 'Nutrition', icon: 'fas fa-apple-alt' },
    { name: 'Water Intake Calculator', desc: 'Calculate optimal daily water intake based on weight, activity level, climate, and health factors with personalized hydration recommendations', url: '/calculators/water-intake-calculator', category: 'Nutrition', icon: 'fas fa-tint' },
    { name: 'Weight Loss Calculator', desc: 'Calculate your personalized weight loss plan with calorie targets, macronutrient distribution, and timeline projections for sustainable weight loss', url: '/calculators/weight-loss-calculator', category: 'Fitness', icon: 'fas fa-chart-line' },
    { name: 'Weight Gain Calculator', desc: 'Calculate your personalized weight gain plan with calorie targets, macronutrient distribution, and timeline projections for healthy weight gain', url: '/calculators/weight-gain-calculator', category: 'Fitness', icon: 'fas fa-chart-line' },
    { name: 'Body Fat Calculator', desc: 'Calculate body fat percentage using Navy Method or BMI-based estimation with comprehensive body composition analysis, health risk assessment, and personalized recommendations', url: '/calculators/body-fat-calculator', category: 'Fitness', icon: 'fas fa-user-circle' },
    { name: 'Ideal Weight Calculator', desc: 'Calculate your ideal body weight using multiple scientific formulas (Devine, Robinson, Miller, Hamwi) with basic and advanced modes, BMI analysis, and body frame adjustments', url: '/calculators/ideal-body-weight-calculator', category: 'Fitness', icon: 'fas fa-balance-scale' },
    { name: 'Diabetes Risk Calculator', desc: 'Assess your risk of developing type 2 diabetes using a comprehensive risk assessment tool with 8 key factors, personalized recommendations, and detailed risk breakdown analysis', url: '/calculators/diabetes-risk-calculator', category: 'Health Assessment', icon: 'fas fa-chart-pie' },
    { name: 'Calorie Burn Calculator', desc: 'Calculate calories burned during various activities with personalized adjustments for age, fitness level, and environmental factors. Get detailed insights and food equivalents', url: '/calculators/calorie-burn-calculator', category: 'Fitness', icon: 'fas fa-fire' },
    { name: 'DRI Calculator', desc: 'Calculate your Dietary Reference Intakes (DRI) including energy needs, macronutrient distribution, and vitamin/mineral requirements based on your personal profile with advanced options for pregnancy, lactation, and health conditions', url: '/calculators/dri-calculator', category: 'Nutrition', icon: 'fas fa-utensils' },
    { name: 'BRI Calculator', desc: 'Calculate your Body Roundness Index (BRI) with comprehensive body composition analysis, health risk assessment, and personalized recommendations based on advanced body shape metrics', url: '/calculators/bri-calculator', category: 'Fitness', icon: 'fas fa-circle-notch' }
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