import React from 'react';
import Seo from './Seo';
import { getStructuredData } from '../utils/seo';
import '../assets/css/static-page.css';

const StaticPage = ({ title, description, children, canonicalPath }) => {
  return (
    <>
      <Seo
        title={title}
        description={description}
        canonicalUrl={`https://tuitility.vercel.app${canonicalPath}`}
        structuredData={getStructuredData(canonicalPath)}
      />
      <div className="static-page">
        <div className="static-page__container">
          <header className="static-page__hero">
            <p className="static-page__eyebrow">Tuitility</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          <div className="static-page__content">{children}</div>
        </div>
      </div>
    </>
  );
};

export default StaticPage;
