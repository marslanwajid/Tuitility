# Tool Page System

This directory contains a comprehensive, reusable tool page system for Tuitility calculators and tools.

## Components Overview

### Core Components
- **ToolPageLayout**: Main layout wrapper with hero, sidebar, and content areas
- **ToolHero**: Hero section with breadcrumb, title, and description
- **ToolSidebar**: Sticky sidebar with categories and related tools
- **TableOfContents**: Auto-scrolling table of contents
- **FeedbackForm**: User rating and feedback system
- **CalculatorSection**: Calculator form wrapper with result display
- **ResultSection**: Displays calculation results
- **ContentSection**: Structured content sections with subcomponents
- **MathFormula**: KaTeX math formula renderer
- **FAQSection**: Frequently asked questions display

### Features
- ✅ **Responsive Design**: Mobile-first, works on all devices
- ✅ **Modern Styling**: Consistent design system with CSS variables
- ✅ **KaTeX Integration**: Beautiful mathematical formulas
- ✅ **Sticky Navigation**: Table of contents and sidebar
- ✅ **Interactive Elements**: Rating system, smooth scrolling
- ✅ **SEO Friendly**: Proper heading structure and semantic HTML
- ✅ **Accessibility**: ARIA labels and keyboard navigation

## Usage Example

```jsx
import React, { useState } from 'react';
import {
  ToolPageLayout,
  CalculatorSection,
  ContentSection,
  MathFormula,
  FAQSection
} from '../tool';

const MyCalculatorTool = () => {
  const [result, setResult] = useState(null);
  
  const toolData = {
    name: 'My Calculator',
    description: 'Description of what this calculator does',
    icon: 'fas fa-calculator',
    category: 'Math',
    breadcrumb: {
      categoryName: 'Math Calculators',
      categoryUrl: '/math'
    }
  };

  const tableOfContents = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'formulas', title: 'Formulas' },
    { id: 'examples', title: 'Examples' }
  ];

  const categories = [
    { name: 'Math Calculators', url: '/math', icon: 'fas fa-calculator' },
    // ... other categories
  ];

  const relatedTools = [
    { name: 'Related Tool', url: '/math/tool', icon: 'fas fa-icon' },
    // ... other tools
  ];

  const faqs = [
    { question: 'How does this work?', answer: 'It works like this...' }
  ];

  return (
    <ToolPageLayout
      toolData={toolData}
      tableOfContents={tableOfContents}
      relatedTools={relatedTools}
      categories={categories}
    >
      <CalculatorSection
        title="Calculator Title"
        result={result}
        onCalculate={() => setResult('Result')}
      >
        {/* Your calculator form inputs here */}
      </CalculatorSection>

      <ContentSection id="introduction" title="Introduction">
        <p>Your content here</p>
        <MathFormula formula="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
      </ContentSection>

      <FAQSection faqs={faqs} />
    </ToolPageLayout>
  );
};
```

## CSS Classes

The system uses a unified CSS file (`tool-page.css`) with consistent styling:

### Key Classes
- `.tool-page` - Main page wrapper
- `.tool-hero` - Hero section
- `.tool-sidebar` - Left sidebar
- `.calculator-section` - Calculator area
- `.content-section` - Content sections
- `.formula` - Math formula container
- `.styled-table` - Responsive tables
- `.faq-section` - FAQ styling

### Color Variables
```css
--primary-color: #3b82f6
--secondary-color: #8b5cf6
--success-color: #10b981
--warning-color: #f59e0b
--danger-color: #ef4444
```

## File Structure
```
src/components/tool/
├── index.js                 # Export all components
├── ToolPageLayout.jsx       # Main layout
├── ToolHero.jsx            # Hero section
├── ToolSidebar.jsx         # Sidebar navigation
├── TableOfContents.jsx     # TOC component
├── FeedbackForm.jsx        # User feedback
├── CalculatorSection.jsx   # Calculator wrapper
├── ResultSection.jsx       # Results display
├── ContentSection.jsx      # Content sections
├── MathFormula.jsx         # KaTeX formulas
├── FAQSection.jsx          # FAQ display
├── BinaryCalculatorTool.jsx # Example implementation
└── README.md               # This file
```

## Dependencies
- React Router (for navigation)
- KaTeX + react-katex (for math formulas)
- FontAwesome (for icons)

## Best Practices
1. Use semantic HTML structure
2. Include proper ARIA labels
3. Keep content sections focused and scannable
4. Use consistent naming for IDs and classes
5. Test on mobile devices
6. Validate math formulas with KaTeX
7. Include comprehensive FAQs
8. Use descriptive breadcrumbs

This system provides a solid foundation for creating consistent, professional tool pages across the entire Tuitility platform.

