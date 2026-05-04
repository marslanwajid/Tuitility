import React from 'react';
import SitePageLayout from './SitePageLayout';

const PrivacyPolicyPage = () => {
  return (
    <SitePageLayout
      title="Privacy Policy"
      description="Comprehensive privacy policy for Tuitility, detailing our data practices, local processing commitment, and cookie usage."
      canonicalPath="/privacy-policy"
      eyebrow="Privacy and Data Security"
      icon="fas fa-user-shield"
      stats={[
        { value: 'Local First', label: 'Processing Model' },
        { value: 'Zero Logs', label: 'User Data' },
        { value: 'Encrypted', label: 'Connections' },
      ]}
    >
      <section className="site-page__panel">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Tuitility. Your privacy is of paramount importance to us. This Privacy Policy explains how we collect, 
          use, disclose, and safeguard your information when you visit our website. Tuitility is designed as a 
          comprehensive collection of free online calculators and utility tools. Our philosophy is built on transparency 
          and minimal data collection.
        </p>
        <p>
          By using our services, you agree to the terms outlined in this policy. If you do not agree with any part of 
          this policy, please discontinue use of the site.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>2. Data Collection & Processing</h2>
        <p>
          <strong>2.1 Client-Side Processing (User-Side):</strong> Tuitility is built on a "User-Side First" architecture. 
          The vast majority of our tools—including PDF utilities, text converters, image processors, and math 
          calculators—perform all operations directly within your web browser. This means your files, inputs, 
          and results are processed locally on your device and are never transmitted to our servers. 
          We do not collect, store, or have access to any data you input into these tools.
        </p>
        <p>
          <strong>2.2 Personal Data:</strong> We do not require user registration. The <strong>only</strong> 
          personal data we collect is your <strong>name</strong> and <strong>email address</strong>, and this 
          only happens if you voluntarily provide them when contacting us for support or sending feedback about a tool. 
          This information is used strictly to respond to your inquiries.
        </p>
        <p>
          <strong>2.3 Automatically Collected Information:</strong> For site security and performance monitoring, 
          basic non-identifiable information (such as browser type or IP address) may be logged by our hosting 
          infrastructure, but this is never linked to the data you process in our tools.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>3. Cookies and Tracking Technologies</h2>
        <p>
          We use minimal cookies to enhance your experience and analyze site traffic.
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> These are necessary for the website to function correctly and handle basic tasks like navigation and security.</li>
          <li><strong>Preference Cookies:</strong> These allow the site to remember choices you make, such as dark mode settings or specific tool preferences.</li>
          <li><strong>Analytics Cookies:</strong> We use Google Analytics to understand how visitors interact with our site. This helps us improve our tools and user experience. All data is processed in an aggregated, anonymous format.</li>
        </ul>
        <p>
          You can manage your cookie preferences through our consent banner or via your browser settings.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>4. AI Integration (Google Gemini)</h2>
        <p>
          Some advanced features, such as our assessment and analysis tools, utilize <strong>Google Gemini AI</strong>. 
          While these tools send relevant prompts to the Gemini API to generate results, Tuitility does not store 
          this data. Your interactions with AI-powered tools are subject to 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Google’s Privacy Policy</a>. 
          We use our own API keys to facilitate these requests, but we do not "see" or "save" your specific AI inputs.
        </p>
      </section>


      <section className="site-page__panel">
        <h2>5. Data Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of your information. All traffic to 
          Tuitility is encrypted via HTTPS (SSL/TLS). However, please be aware that no method of transmission 
          over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>6. Children's Privacy</h2>
        <p>
          Our services are not directed to individuals under the age of 13. We do not knowingly collect personal 
          identifiable information from children under 13. If we discover that a child under 13 has provided us with 
          personal information, we will delete it immediately.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>7. User Rights</h2>
        <p>
          Depending on your location (e.g., EU/UK under GDPR, or California under CCPA), you may have rights regarding 
          your data, including the right to access, correct, or delete any personal information we might hold. 
          Since we do not store personal profiles, these rights are typically exercised through browser settings 
          (clearing cookies/cache).
        </p>
      </section>

      <section className="site-page__panel">
        <h2>8. Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
          Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
          Policy periodically for any changes.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          <br />
          Email: <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>
        </p>
        <p>
          <em>Last Updated: May 2026</em>
        </p>
      </section>
    </SitePageLayout>
  );
};

export default PrivacyPolicyPage;

