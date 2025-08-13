import React from 'react';

const FAQSection = ({ 
  faqs = [],
  className = "" 
}) => {
  return (
    <div className={`faq-section ${className}`}>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default FAQSection; 