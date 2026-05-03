import React from 'react';
import SitePageLayout from './SitePageLayout';

const TermsPage = () => {
  return (
    <SitePageLayout
      title="Terms and Conditions"
      description="Read the Tuitility terms and conditions covering acceptable use, informational limitations, user responsibility, and third-party services."
      canonicalPath="/terms-and-conditions"
      eyebrow="Terms of Use"
      icon="fas fa-scale-balanced"
      stats={[
        { value: 'Informational', label: 'Tool Outputs' },
        { value: 'User Review', label: 'Required' },
        { value: 'Third-Party APIs', label: 'May Apply' },
      ]}
    >
      <section className="site-page__panel">
        <h2>Acceptance of Terms</h2>
        <p>
          By using Tuitility, you agree to use the site lawfully and responsibly. The tools on this platform are
          provided for informational, productivity, and utility purposes and should not be treated as a substitute
          for qualified professional advice.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Tool Accuracy and User Responsibility</h2>
        <p>
          We aim to keep calculators and utilities accurate and useful, but outputs can still depend on formulas,
          assumptions, third-party services, browser behavior, and the quality of user input. You are responsible
          for reviewing important results before relying on them in financial, legal, medical, academic, or business contexts.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Acceptable Use</h2>
        <p>
          You agree not to misuse the site, interfere with operation, exploit vulnerabilities, automate abusive traffic,
          or use the platform for illegal, deceptive, harmful, or fraudulent activity.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Third-Party Services and Ads</h2>
        <p>
          Some tools may rely on third-party APIs or external services. Future advertising may also be supported through
          systems such as Google AdSense. Tuitility is not responsible for the independent policies, outages, or content
          behavior of third-party providers.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Content and Usage Rights</h2>
        <p>
          Users are responsible for ensuring they have permission to upload, transform, download, or repurpose any documents,
          media, or third-party content used with the platform.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>.
        </p>
      </section>
    </SitePageLayout>
  );
};

export default TermsPage;
