import React, { useState } from 'react';
import SitePageLayout from './SitePageLayout';
import { submitSiteMessage } from '../utils/siteMessage';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const ContactPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await submitSiteMessage({
        ...formData,
        formType: 'contact',
      });

      setStatus({
        type: 'success',
        message: 'Your message has been sent successfully. We will review it soon.',
      });
      setFormData(initialForm);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong while sending your message.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SitePageLayout
      title="Contact Tuitility"
      description="Contact Tuitility for calculator corrections, broken-link reports, feature suggestions, technical support, partnerships, and business inquiries."
      canonicalPath="/contact"
      eyebrow="Support and Collaboration"
      icon="fas fa-paper-plane"
      stats={[
        { value: '24/7', label: 'Tool Availability' },
        { value: '100+', label: 'Platform Tools' },
        { value: 'Direct', label: 'Developer Contact' },
      ]}
    >
      <section className="site-page__panel">
        <h2>Contact and Support</h2>
        <p>
          Use the form below for support requests, correction notices, partnership ideas, or feature
          suggestions. For privacy-sensitive issues, include only the details needed to explain the problem.
        </p>
      </section>

      <section className="site-page__panel">
        <div className="site-page__card-grid">
          <article className="site-page__card">
            <h3>General Support</h3>
            <p>Questions about calculators, broken links, output issues, or tool improvements.</p>
          </article>
          <article className="site-page__card">
            <h3>Partnerships</h3>
            <p>Reach out for collaborations, content partnerships, and product growth opportunities.</p>
          </article>
          <article className="site-page__card">
            <h3>Direct Email</h3>
            <p>
              You can also write directly to <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>.
            </p>
          </article>
        </div>
      </section>

      <section className="site-page__panel">
        <h2>Send a Message</h2>
        <form className="site-page__form" onSubmit={handleSubmit}>
          <div className="site-page__form-grid">
            <label className="site-page__field">
              <span>Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
            <label className="site-page__field">
              <span>Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
          </div>

          <label className="site-page__field">
            <span>Subject</span>
            <input
              type="text"
              value={formData.subject}
              onChange={(event) => handleChange('subject', event.target.value)}
              placeholder="What can we help you with?"
              required
            />
          </label>

          <label className="site-page__field">
            <span>Message</span>
            <textarea
              rows="7"
              value={formData.message}
              onChange={(event) => handleChange('message', event.target.value)}
              placeholder="Share the details of your request, correction, partnership idea, or support issue."
              required
            />
          </label>

          <p className="site-page__form-note">
            Messages are intended for business inquiries, feedback, and support. Please do not submit
            passwords, payment information, or other sensitive personal data.
          </p>

          {status.message && (
            <div className={`site-page__alert site-page__alert--${status.type}`}>
              {status.message}
            </div>
          )}

          <button type="submit" className="site-page__button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>
    </SitePageLayout>
  );
};

export default ContactPage;
