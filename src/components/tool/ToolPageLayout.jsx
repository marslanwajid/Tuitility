import React from 'react';
import ToolHero from './ToolHero';
import ToolSidebar from './ToolSidebar';
import TableOfContents from './TableOfContents';
import FeedbackForm from './FeedbackForm';
import Seo from '../Seo';
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
      <Seo
        title={toolData?.seoTitle}
        description={toolData?.seoDescription || toolData?.description}
        keywords={toolData?.seoKeywords}
        canonicalUrl={toolData?.canonicalUrl}
        structuredData={toolData?.schemaData}
        type="article"
      />
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
          <section className="tool-trust-links">
            <h2>Site Policies and Support</h2>
            <p>
              For transparency, privacy information, support requests, and site policies, review our
              <a href="/about"> About page</a>,
              <a href="/privacy-policy"> Privacy Policy</a>,
              <a href="/terms-and-conditions"> Terms &amp; Conditions</a>, and
              <a href="/contact"> Contact page</a>.
            </p>
          </section>
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
