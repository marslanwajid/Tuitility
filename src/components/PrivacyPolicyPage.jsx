import React from 'react';
import SitePageLayout from './SitePageLayout';

const PrivacyPolicyPage = () => {
  return (
    <SitePageLayout
      title="Privacy Policy"
      description="Understand how Tuitility handles privacy, cookies, local browser processing, third-party services, and future Google AdSense support."
      canonicalPath="/privacy-policy"
      eyebrow="Privacy and Data Use"
      icon="fas fa-user-shield"
      stats={[
        { value: 'Local First', label: 'Processing Model' },
        { value: 'Cookie Consent', label: 'Supported' },
        { value: 'AdSense Ready', label: 'Future Support' },
      ]}
    >
      <section className="site-page__panel">
        <h2>Overview</h2>
        <p>
          Tuitility aims to minimize unnecessary data collection. Many tools are designed to process files,
          calculations, and user input directly in the browser, which means your data often remains on your device
          unless a specific feature clearly requires an external API or server-side service.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Cookies and Consent</h2>
        <p>
          Tuitility may use cookies or similar technologies for essential functionality, saved preferences,
          site performance, and future advertising support. A consent banner is used so visitors can manage
          whether they allow only essential cookies or broader optional categories.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Google AdSense and Advertising</h2>
        <p>
          Tuitility may apply for and use Google AdSense in the future. If AdSense is enabled, cookies may be used
          to personalize ads, measure ad performance, and improve ad relevance. Users should also review Google’s
          advertising and privacy policies for details about how Google may process advertising-related data.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Third-Party Services</h2>
        <p>
          Some tools rely on external APIs such as AI services, exchange-rate providers, or media-processing helpers.
          When that happens, only the information needed for the feature should be transmitted. Users should avoid
          entering highly sensitive personal data into tools that explicitly depend on external services.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Files and User Responsibility</h2>
        <p>
          PDF, image, audio, and text tools may process content locally, but users should still be cautious with
          confidential legal, medical, financial, or personal documents. Review the behavior of each tool before
          uploading sensitive material.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Contact</h2>
        <p>
          For privacy questions, cookie concerns, or requests related to future advertising systems,
          contact <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>.
        </p>
      </section>
    </SitePageLayout>
  );
};

export default PrivacyPolicyPage;
