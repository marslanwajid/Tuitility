import React from 'react';
import Seo from './Seo';
import { getStructuredData } from '../utils/seo';
import '../assets/css/site-page.css';

const SitePageLayout = ({
  title,
  description,
  canonicalPath,
  eyebrow = 'Tuitility',
  icon = 'fas fa-compass',
  stats = [],
  sidebar,
  structuredData,
  children,
}) => {
  const canonicalUrl = `https://tuitility.vercel.app${canonicalPath}`;

  return (
    <>
      <Seo
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData || getStructuredData(canonicalPath)}
      />
      <div className="site-page">
        <div className="site-page__container">
          <section className="site-page__hero">
            <div className="site-page__hero-content">
              <p className="site-page__eyebrow">
                <i className={icon}></i>
                <span>{eyebrow}</span>
              </p>
              <h1>{title}</h1>
              <p className="site-page__description">{description}</p>
              {stats.length > 0 && (
                <div className="site-page__stats">
                  {stats.map((stat) => (
                    <div className="site-page__stat" key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <main className={`site-page__main ${sidebar ? 'site-page__main--with-sidebar' : ''}`}>
            <div className="site-page__content">{children}</div>
            {sidebar ? <aside className="site-page__sidebar">{sidebar}</aside> : null}
          </main>
        </div>
      </div>
    </>
  );
};

export default SitePageLayout;
