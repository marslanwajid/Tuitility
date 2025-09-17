import React from 'react'
import CategoryPage from '../../components/CategoryPage'

const KnowledgeCalculator = () => {
  const knowledgeTools = [
    { name: 'GPA Calculator', desc: 'Calculate your grade point average', url: '/knowledge/calculators/gpa-calculator', category: 'Education', icon: 'fas fa-graduation-cap' },
    { name: 'Age Calculator', desc: 'Calculate age in years, months, days', url: '/knowledge/calculators/age-calculator', category: 'General', icon: 'fas fa-calendar-alt' },
    { name: 'WPM Calculator', desc: 'Test your typing speed', url: '/knowledge/calculators/word-per-minute', category: 'Skills', icon: 'fas fa-keyboard' },
    { name: 'Habit Formation Calculator', desc: 'Calculate your habit formation', url: '/knowledge/calculators/habit-formation-calculator', category: 'Skills', icon: 'fas fa-check-circle' },
    { name: 'Love Calculator', desc: 'Calculate love compatibility', url: '/knowledge/calculators/love-calculator', category: 'Fun', icon: 'fas fa-heart' },
    { name: 'MBTI Personality', desc: 'Discover your personality type', url: '/knowledge/calculators/mbti-calculator', category: 'Psychology', icon: 'fas fa-user-friends' },
    { name: 'Carbon Footprint', desc: 'Calculate your environmental impact', url: '/knowledge/calculators/carbon-footprint-calculator', category: 'Environment', icon: 'fas fa-leaf' },
    { name: 'Zakat Calculator', desc: 'Calculate Islamic charity amount', url: '/knowledge/calculators/zakat-calculator', category: 'Religious', icon: 'fas fa-hand-holding-heart' }
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