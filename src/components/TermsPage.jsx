import React from 'react';
import SitePageLayout from './SitePageLayout';

const TermsPage = () => {
  return (
    <SitePageLayout
      title="Terms and Conditions"
      description="Comprehensive terms and conditions for using Tuitility, covering user responsibilities, service limitations, and intellectual property."
      canonicalPath="/terms-and-conditions"
      eyebrow="Terms of Use"
      icon="fas fa-scale-balanced"
      stats={[
        { value: 'Informational', label: 'Tool Outputs' },
        { value: 'User Review', label: 'Required' },
        { value: 'Free Access', label: 'Service Model' },
      ]}
    >
      <section className="site-page__panel">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Tuitility ("the Website"), you agree to be bound by these Terms and Conditions. 
          If you do not agree to all of these terms, you are prohibited from using or accessing this site. 
          The materials contained in this Website are protected by applicable copyright and trademark law.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>2. Use License & Service Description</h2>
        <p>
          Tuitility provides a collection of free online calculators, converters, and utility tools. 
          The Website operates primarily on a <strong>User-Side (Client-Side)</strong> model, where 
          calculations and data processing occur directly within your browser. 
          Permission is granted to use these tools for personal or commercial productivity purposes. 
          This is the grant of a license, not a transfer of title, and under this license, you may not:
        </p>
        <ul>
          <li>Modify or copy the materials or underlying code;</li>
          <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
          <li>Attempt to decompile or reverse engineer any software contained on the Website;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
      </section>

      <section className="site-page__panel">
        <h2>3. Disclaimer of Warranties</h2>
        <p>
          <strong>3.1 "As Is" Basis:</strong> The tools and materials on Tuitility are provided on an 'as is' basis. 
          Tuitility makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties 
          including, without limitation, implied warranties or conditions of merchantability, fitness for a 
          particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p>
          <strong>3.2 Accuracy:</strong> Further, Tuitility does not warrant or make any representations concerning 
          the accuracy, likely results, or reliability of the use of the materials on its Website or otherwise 
          relating to such materials or on any sites linked to this site. Calculators and utility tools are 
          intended for informational and productivity purposes only and should not be relied upon for critical 
          financial, legal, medical, or engineering decisions without professional verification.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>4. Limitation of Liability</h2>
        <p>
          In no event shall Tuitility or its suppliers be liable for any damages (including, without limitation, 
          damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
          to use the materials on Tuitility, even if Tuitility or an authorized representative has been notified 
          orally or in writing of the possibility of such damage. Because some jurisdictions do not allow 
          limitations on implied warranties, or limitations of liability for consequential or incidental damages, 
          these limitations may not apply to you.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>5. User Conduct & Acceptable Use</h2>
        <p>
          You agree to use the Website only for lawful purposes. You are prohibited from:
        </p>
        <ul>
          <li>Using the site in any way that violates any applicable local, national, or international law or regulation;</li>
          <li>Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the site;</li>
          <li>Attempting to interfere with the proper working of the site, including through hacking, 
          distribution of viruses, or denial-of-service attacks;</li>
          <li>Automating requests to the site (scraping/crawling) without prior written permission.</li>
        </ul>
      </section>

      <section className="site-page__panel">
        <h2>6. Third-Party Links & Services</h2>
        <p>
          Tuitility has not reviewed all of the sites linked to its Website and is not responsible for the contents 
          of any such linked site. The inclusion of any link does not imply endorsement by Tuitility. Use of any 
          such linked website is at the user's own risk. Some tools may rely on third-party APIs; your use of 
          those tools is also subject to the terms of those service providers.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>7. Intellectual Property</h2>
        <p>
          The content, organization, graphics, design, compilation, and other matters related to the Website are 
          protected under applicable copyrights, trademarks, and other proprietary rights. The copying, redistribution, 
          use, or publication by you of any such matters or any part of the site is strictly prohibited.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>8. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Tuitility, its officers, directors, employees, 
          agents, and third parties, for any losses, costs, liabilities, and expenses relating to or arising out 
          of your use of or inability to use the site or services, any user postings made by you, your violation 
          of any terms of this Agreement or your violation of any rights of a third party, or your violation 
          of any applicable laws, rules, or regulations.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>9. Modifications to Terms</h2>
        <p>
          Tuitility may revise these Terms and Conditions for its Website at any time without notice. By using this 
          Website, you are agreeing to be bound by the then-current version of these Terms and Conditions.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>10. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction, 
          and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>11. Contact Information</h2>
        <p>
          If you have any questions regarding these Terms and Conditions, please contact us at:
          <br />
          Email: <a href="mailto:wajidmarslan@gmail.com">wajidmarslan@gmail.com</a>
        </p>
      </section>
    </SitePageLayout>
  );
};

export default TermsPage;

