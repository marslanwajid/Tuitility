import React from 'react';
import SitePageLayout from './SitePageLayout';
import { allTools } from '../data/allTools';
import { toolCategories } from '../data/toolCategories';

const profileLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/arslan-wajid/', icon: 'fab fa-linkedin' },
  { label: 'GitHub', url: 'https://github.com/marslanwajid/', icon: 'fab fa-github' },
  { label: 'Portfolio', url: 'https://pixelcodewizard.vercel.app/', icon: 'fas fa-globe' },
  { label: 'Email', url: 'mailto:wajidmarslan@gmail.com', icon: 'fas fa-envelope' },
];

const skills = [
  ['Programming Languages', 'JavaScript, Python, PHP, ES6, Node JS'],
  ['Databases and Servers', 'SQL, MongoDB'],
  ['Web Technologies', 'JavaScript, HTML5, CSS3, AJAX, JSP, Bootstrap, WordPress'],
  ['Frameworks and Libraries', 'React JS, Redux, Express JS, jQuery, Next JS'],
  ['SEO', 'On-page SEO, Off-page SEO, Google Search Console, Semrush, Ahrefs, Moz'],
  ['WordPress Development', 'Custom themes and plugins, ACF, WP-CLI, CPT, custom taxonomies, Gutenberg blocks, hooks and filters, REST API integration, AJAX API, performance optimization, Core Web Vitals'],
  ['Design and Optimization', 'Figma to WordPress conversion, responsive UI design, W3C standards, WCAG accessibility'],
  ['Debugging and Tools', 'Firebug, Chrome Developer Tools, browser console, Git, GitHub, Microsoft Office, Electron JS'],
  ['Languages and Workflow', 'English, Urdu, payment gateways, cross-functional collaboration, Agile workflow, SDLC'],
];

const featuredTools = [
  'Fraction Calculator',
  'Percentage Calculator',
  'Mortgage Calculator',
  'BMI Calculator',
  'QR Code Generator',
  'PDF to Image Converter',
];

const AboutPage = () => {
  const categoryCounts = toolCategories.map((category) => ({
    ...category,
    toolCount: allTools.filter((tool) => tool.category === category.name).length,
  }));

  const sidebar = (
    <>
      <div className="site-page__panel">
        <h3>Developer Links</h3>
        <div className="site-page__link-list">
          {profileLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <i className={link.icon}></i>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="site-page__panel">
        <h3>Other Tool Site</h3>
        <a
          className="site-page__partner-card"
          href="https://json-prompt-generator.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/images/logo-prompt-genetaor.png" alt="JSON Prompt Generator" />
          <div>
            <strong>JSON Prompt Generator</strong>
            <span>Structured prompt generation for AI image workflows.</span>
          </div>
        </a>
      </div>
    </>
  );

  return (
    <SitePageLayout
      title="About Tuitility"
      description="Learn about Tuitility, the online tools platform built by Arslan Wajid, and the product, engineering, SEO, and accessibility experience behind the site."
      canonicalPath="/about"
      eyebrow="About the Platform"
      icon="fas fa-user-astronaut"
      stats={[
        { value: '100+', label: 'Tools' },
        { value: '2.5+ Years', label: 'Professional Experience' },
        { value: '24/7', label: 'Availability' },
      ]}
      structuredData={[
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Tuitility',
          url: 'https://tuitility.vercel.app/about',
          description: 'About the Tuitility online calculators and tools platform.',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Arslan Wajid',
          url: 'https://pixelcodewizard.vercel.app/',
          sameAs: [
            'https://www.linkedin.com/in/arslan-wajid/',
            'https://github.com/marslanwajid/',
          ],
          jobTitle: 'Dedicated FullStack Developer',
        },
      ]}
      sidebar={sidebar}
    >
      <section className="site-page__panel">
        <h2>What Tuitility Is</h2>
        <p>
          Tuitility is a free online tools platform designed to make calculations, conversions, PDF workflows,
          document processing, and digital productivity tasks easier to complete in the browser. The site is being
          built as a connected utility ecosystem instead of a thin one-page-per-tool directory.
        </p>
        <p>
          The platform is organized around clear categories, useful core tools, and simple navigation so people can
          get to the right tool faster without extra friction.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Categories</h2>
        <div className="site-page__card-grid">
          {categoryCounts.map((category) => (
            <article className="site-page__card" key={category.name}>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <p>
                <strong>{category.toolCount}</strong> tools in this category
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-page__panel">
        <h2>Main Tools</h2>
        <p>
          These are some of the main tools people use most often on the site. They cover quick math, finance,
          health, and utility tasks that come up in everyday work.
        </p>
        <div className="site-page__skill-grid">
          {featuredTools.map((tool) => (
            <article className="site-page__skill-card" key={tool}>
              <h3>{tool}</h3>
              <p>Built for fast, simple, and practical everyday use.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-page__panel">
        <h2>Why I Built This</h2>
        <p>
          I built Tuitility to make online tools easier to find and easier to use. Instead of sending people across
          scattered websites or cluttered pages, the goal is to keep the experience clear, fast, and helpful in one
          place.
        </p>
        <p>
          It is made for convenience, time savings, and a smoother workflow for students, professionals, creators,
          and anyone who just wants a tool that works without hassle.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>About the Developer</h2>
        <p>
          Arslan Wajid is a dedicated FullStack Developer with over 2.5 years of professional experience,
          specializing in React, Next.js, and modern JavaScript frameworks. He has experience driving meaningful
          improvements in website performance, user engagement, and client satisfaction while building responsive,
          accessible, and pixel-accurate interfaces.
        </p>
        <p>
          His work includes technical SEO optimization using Google Search Console, Semrush, and Ahrefs,
          plus headless architecture and custom WordPress development with a strong focus on performance,
          accessibility, and maintainable UI systems.
        </p>
      </section>

      <section className="site-page__panel">
        <h2>Core Strengths</h2>
        <div className="site-page__card-grid">
          <article className="site-page__card">
            <h3>Frontend Engineering</h3>
            <p>React, Next.js, responsive UI systems, accessibility-first implementation, and high-quality Figma-to-code workflows.</p>
          </article>
          <article className="site-page__card">
            <h3>Technical SEO</h3>
            <p>On-page SEO, internal linking, crawl structure, Search Console workflows, Semrush/Ahrefs research, and organic visibility improvements.</p>
          </article>
          <article className="site-page__card">
            <h3>WordPress and Web Architecture</h3>
            <p>Custom themes, plugins, REST integrations, Gutenberg blocks, performance optimization, and Core Web Vitals improvements.</p>
          </article>
        </div>
      </section>

      <section className="site-page__panel">
        <h2>Technical Skill Set</h2>
        <div className="site-page__skill-grid">
          {skills.map(([title, items]) => (
            <article className="site-page__skill-card" key={title}>
              <h3>{title}</h3>
              <p>{items}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-page__panel">
        <h2>Platform Direction</h2>
        <p>
          Tuitility is being refined category by category and tool by tool, with more useful content sections,
          stronger internal linking, cleaner UI consistency, and clearer policy pages. That product direction is
          shaped by both engineering discipline and SEO-focused thinking.
        </p>
      </section>
    </SitePageLayout>
  );
};

export default AboutPage;
