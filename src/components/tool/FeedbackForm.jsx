import React, { useState } from 'react';

const FeedbackForm = ({ toolName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { toolName, name, email, rating, message });
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setRating(0);
      setMessage('');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="feedback-form">
        <div style={{ textAlign: 'center', color: 'var(--success-color)' }}>
          <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <h3>Thank you for your feedback!</h3>
          <p>Your input helps us improve our tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form">
      <h3 className="feedback-title">
        <i className="fas fa-comment-dots"></i>
        Share Your Feedback
      </h3>
      
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Rating Stars */}
        <div className="form-group">
          <label className="form-label">Rating *</label>
          <div className="feedback-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`fas fa-star rating-star ${star <= rating ? 'active' : ''}`}
                onClick={() => handleRatingClick(star)}
              ></i>
            ))}
          </div>
        </div>
        
        {/* Message Textarea */}
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="feedback-textarea"
            placeholder="Share your thoughts about this tool..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="feedback-submit"
          disabled={!name || !email || rating === 0}
        >
          <i className="fas fa-paper-plane"></i>
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
