import React from 'react';

const StickySidebar = ({ children }) => {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        position: 'sticky', 
        top: '2rem',
        height: 'fit-content',
        zIndex: 1000
      }}>
        {children}
      </div>
    </div>
  );
};

export default StickySidebar;
