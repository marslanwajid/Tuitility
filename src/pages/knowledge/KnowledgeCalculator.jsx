import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const KnowledgeCalculator = () => {
  const knowledgeTools = [
    { name: 'GPA Calculator', desc: 'Calculate your grade point average', url: '/calculators/gpa-calculator', category: 'Education', icon: 'fas fa-graduation-cap' },
    { name: 'Age Calculator', desc: 'Calculate age in years, months, days', url: '/calculators/age-calculator', category: 'General', icon: 'fas fa-calendar-alt' },
    { name: 'WPM Calculator', desc: 'Test your typing speed', url: '/calculators/word-per-minute', category: 'Skills', icon: 'fas fa-keyboard' },
    { name: 'Habit Formation Calculator', desc: 'Calculate your habit formation', url: '/calculators/habit-formation-calculator', category: 'Skills', icon: 'fas fa-check-circle' },
    { name: 'Language Level Calculator', desc: 'Calculate your language level', url: '/calculators/language-level-calculator', category: 'Skills', icon: 'fas fa-language' },
    { name: 'Fuel Calculator', desc: 'Calculate fuel consumption', url: '/calculators/fuel-calculator', category: 'Skills', icon: 'fas fa-gas-pump' },
    { name: 'Average Time Calculator', desc: 'Calculate average time', url: '/calculators/average-time-calculator', category: 'Skills', icon: 'fas fa-clock' },
    { name: 'Career Assessment Calculator', desc: 'Calculate your career assessment', url: '/calculators/career-assessment-calculator', category: 'Skills', icon: 'fas fa-briefcase' },
    { name: 'Trauma Assessment Calculator', desc: 'Calculate your trauma assessment', url: '/calculators/trauma-assessment-calculator', category: 'Skills', icon: 'fas fa-brain' },
    { name: 'Anxiety Assessment Calculator', desc: 'Calculate your anxiety assessment', url: '/calculators/anxiety-assessment-calculator', category: 'Skills', icon: 'fas fa-heart' },
    { name: 'MBTI Personality', desc: 'Discover your personality type', url: '/calculators/mbti-calculator', category: 'Psychology', icon: 'fas fa-user-friends' },
    { name: 'Carbon Footprint', desc: 'Calculate your environmental impact', url: '/calculators/carbon-footprint-calculator', category: 'Environment', icon: 'fas fa-leaf' },
    { name: 'Zakat Calculator', desc: 'Calculate Islamic charity amount', url: '/calculators/zakat-calculator', category: 'Religious', icon: 'fas fa-hand-holding-heart' }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: 'fas fa-th' },
    { id: 'Education', name: 'Education', icon: 'fas fa-graduation-cap' },
    { id: 'General', name: 'General', icon: 'fas fa-info-circle' },
    { id: 'Skills', name: 'Skills', icon: 'fas fa-tools' },
    { id: 'Fun', name: 'Fun', icon: 'fas fa-smile' },
    { id: 'Psychology', name: 'Psychology', icon: 'fas fa-brain' },
    { id: 'Environment', name: 'Environment', icon: 'fas fa-leaf' },
    { id: 'Religious', name: 'Religious', icon: 'fas fa-pray' }
  ]

  return (
    <CategoryPage
      title="Knowledge Calculators"
      description="Educational and knowledge-based calculators for learning, self-assessment, and personal development across various fields."
      tools={knowledgeTools}
      categories={categories}
      searchPlaceholder="Search knowledge calculators..."
      baseUrl="/knowledge"
    />
  )
}

export default KnowledgeCalculator 