import React from 'react';
import ToolSidebar from './ToolSidebar';

const ToolLayout = ({ 
  children,
  sidebarProps = {},
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
      </div>
    </div>
  );
};

export default ToolLayout; 