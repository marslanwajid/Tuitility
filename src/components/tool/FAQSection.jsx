import React from 'react';

const FAQSection = ({ faqs, title = "Frequently Asked Questions" }) => {
  return (
    <section id="frequently-asked-questions-faqs" className="content-section">
      <h2 className="section-title">{title}</h2>
      <div className="faq-section">
        <dl>
          {faqs.map((faq, index) => (
            <React.Fragment key={index}>
              <dt>{faq.question}</dt>
              <dd>{faq.answer}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default FAQSection;

