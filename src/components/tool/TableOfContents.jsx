import React, { useState, useEffect } from 'react';

const TableOfContents = ({ items }) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active section

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const handleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="table-of-contents">
      <h3 className="toc-title">
        <i className="fas fa-list"></i>
        Table of Contents
      </h3>
      <ul className="toc-list">
        {items.map((item, index) => (
          <li key={index} className="toc-item">
            <button
              onClick={() => handleClick(item.id)}
              className={`toc-link ${activeSection === item.id ? 'active' : ''}`}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;

