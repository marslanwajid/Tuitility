import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/cookie-banner.css';

const CONSENT_KEY = 'tuitility-cookie-consent';

const defaultConsent = {
  essential: true,
  analytics: false,
  advertising: false,
  status: 'unset',
};

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(CONSENT_KEY);
    if (!savedConsent) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const className = 'cookie-banner-visible';

    if (isVisible) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [isVisible]);

  const saveConsent = (consent) => {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="cookie-banner__content">
        <p className="cookie-banner__eyebrow">Privacy & Cookies</p>
        <h2>We use cookies to enhance your experience.</h2>
        <p>
          Essential cookies ensure the site functions correctly, while anonymous analytics 
          help us improve our tools and user experience. We never collect or store 
          any data from the tools themselves. Read our <Link to="/privacy-policy">Privacy Policy</Link> for more information.
        </p>

      </div>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--secondary"
          onClick={() =>
            saveConsent({
              ...defaultConsent,
              status: 'essential-only',
            })
          }
        >
          Essential Only
        </button>
        <button
          type="button"
          className="cookie-banner__btn cookie-banner__btn--primary"
          onClick={() =>
            saveConsent({
              essential: true,
              analytics: true,
              advertising: true,
              status: 'accepted-all',
            })
          }
        >
          Accept All
        </button>
      </div>
    </aside>
  );
};

export default CookieBanner;
