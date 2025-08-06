import React from 'react';
import ToolSidebar from './ToolSidebar';
import TableOfContents from './TableOfContents';
import FeedbackForm from './FeedbackForm';

const ToolLayout = ({ 
  children,
  sidebarProps = {},
  tocProps = {},
  feedbackProps = {},
  className = "" 
}) => {
  return (
    <div className={`tool-main ${className}`}>
      <div className="container">
        <div className="tool-layout">
          {/* Sidebar */}
          <ToolSidebar {...sidebarProps} />

          {/* Main Content */}
          <main className="tool-content">
            {children}
          </main>
        </div>

        {/* Table of Contents & Feedback */}
        <section className="toc-feedback-section">
          <div className="toc-feedback-container">
            <TableOfContents {...tocProps} />
            <FeedbackForm {...feedbackProps} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ToolLayout; 