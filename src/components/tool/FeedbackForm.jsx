import React, { useState } from 'react';

const FeedbackForm = ({ 
  onSubmit,
  className = "" 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className={`feedback-section ${className}`}>
      <h3 className="feedback-title">
        <i className="fas fa-comment"></i>
        Feedback
      </h3>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="feedback-name">Name</label>
          <input 
            type="text" 
            id="feedback-name" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="feedback-email">Email</label>
          <input 
            type="email" 
            id="feedback-email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="feedback-message">Message</label>
          <textarea 
            id="feedback-message" 
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4" 
            placeholder="Your feedback or suggestions..."
          ></textarea>
        </div>
        <button type="submit" className="btn-submit">
          <i className="fas fa-paper-plane"></i>
          Send Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm; 