import React, { useState } from 'react';
import { submitSiteMessage } from '../../utils/siteMessage';

const FeedbackForm = ({ toolName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await submitSiteMessage({
        formType: 'tool-feedback',
        toolName: toolName || 'Tuitility Tool',
        name,
        email,
        subject: `Tool Feedback: ${toolName || 'Tuitility Tool'}`,
        message,
        rating,
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      });

      setStatus({
        type: 'success',
        message: 'Your feedback has been sent successfully. Thank you for helping improve this tool.',
      });
      setName('');
      setEmail('');
      setRating(0);
      setMessage('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to submit feedback right now.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {status.message && (
          <div className={`site-page__alert site-page__alert--${status.type}`}>
            {status.message}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          className="feedback-submit"
          disabled={!name || !email || rating === 0 || isSubmitting}
        >
          <i className="fas fa-paper-plane"></i>
          {isSubmitting ? 'Sending Feedback...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
