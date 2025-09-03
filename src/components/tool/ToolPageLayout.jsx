import React from 'react';
import ToolHero from './ToolHero';
import ToolSidebar from './ToolSidebar';
import TableOfContents from './TableOfContents';
import FeedbackForm from './FeedbackForm';
import '../../assets/css/tool-page.css';

const ToolPageLayout = ({ 
  toolData, 
  children, 
  tableOfContents, 
  relatedTools,
  categories 
}) => {
  return (
    <div className="tool-page">
      <ToolHero toolData={toolData} />
      
      <main className="tool-main">
        {/* Left Sidebar */}
        <ToolSidebar 
          categories={categories}
          relatedTools={relatedTools}
          currentTool={toolData.name}
        />
        
        {/* Main Content */}
        <div className="tool-content">
          {/* Calculator, TOC, Feedback, and Content Sections */}
          {children}
        </div>
        
        {/* Right Sidebar - Can be used for ads or additional content */}
        <div className="tool-right-sidebar">
          {/* Additional content can be added here */}
        </div>
      </main>
    </div>
  );
};

export default ToolPageLayout;
