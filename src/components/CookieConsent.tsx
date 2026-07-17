'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    functional: false,
    marketing: false,
  });

  // Load saved preferences
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('tuitility-cookie-consent');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({
          analytics: !!parsed.analytics,
          functional: !!parsed.functional,
          marketing: !!parsed.marketing,
        });
        setHasChoice(true);
      } catch (e) {
        // Fallback if JSON is corrupt
      }
    } else {
      // Check for Global Privacy Control (GPC) signal
      if (typeof navigator !== 'undefined' && (navigator as any).globalPrivacyControl) {
        setPreferences((prev) => ({ ...prev, marketing: false }));
      }
    }

    // Custom event listener to reopen settings from other parts of the site
    const handleOpenSettings = () => {
      setIsOpen(true);
      setShowPreferences(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  // Update Gtag consent states
  const updateGtagConsent = (prefs: CookiePreferences) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        ad_storage: prefs.marketing ? 'granted' : 'denied',
        ad_user_data: prefs.marketing ? 'granted' : 'denied',
        ad_personalization: prefs.marketing ? 'granted' : 'denied',
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        personalization_storage: prefs.functional ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied',
      });
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      necessary: true,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem('tuitility-cookie-consent', JSON.stringify(consentData));

    // Save to Cookie (1 year expiration)
    const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
    document.cookie = `tuitility_cookie_consent=${encodeURIComponent(
      JSON.stringify(consentData)
    )}; path=/; max-age=31536000; SameSite=Lax; ${secure}`;

    updateGtagConsent(prefs);
    setHasChoice(true);
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = { analytics: true, functional: true, marketing: true };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = { analytics: false, functional: false, marketing: false };
    setPreferences(allRejected);
    saveConsent(allRejected);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!mounted) return null;

  // Show banner if the user has not made a choice yet OR if the settings panel is explicitly opened
  const shouldShow = !hasChoice || isOpen;

  return (
    <>
      {/* Small floating badge to reopen settings (GDPR consent withdrawal/change requirement) */}
      {hasChoice && !shouldShow && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowPreferences(true);
          }}
          className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-lg rounded-full text-slate-700 hover:text-slate-900 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-slate-900"
          aria-label="Cookie Preferences"
          title="Cookie Preferences"
        >
          <i className="fas fa-cookie-bite text-lg group-hover:rotate-12 transition-transform duration-300"></i>
        </button>
      )}

      {shouldShow && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md w-[calc(100vw-3rem)] md:max-w-lg bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-6 transition-all duration-500 ease-in-out animate-fade-in-up">
          <div className="flex items-start space-x-3.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 shrink-0">
              <i className="fas fa-cookie-bite text-base"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Cookie Preferences</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We use cookies to improve your browsing experience, analyze site traffic, and personalize content. You can manage your choices below. Read our{' '}
                <Link href="/privacy-policy" className="text-slate-900 hover:text-slate-700 underline font-semibold">
                  Privacy Policy
                </Link>{' '}
                to learn more.
              </p>
            </div>
          </div>

          {/* Preferences Settings Drawer */}
          {showPreferences ? (
            <div className="space-y-4 my-6 border-t border-b border-slate-100 py-4 max-h-[250px] overflow-y-auto no-scrollbar">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Necessary Cookies</span>
                    <span className="bg-slate-200/80 text-slate-700 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md leading-none">
                      Required
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Essential for basic site functionality, security, and saving your preferences. Cannot be disabled.
                  </p>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    disabled
                    checked
                    className="sr-only"
                    aria-label="Necessary Cookies (Always Active)"
                  />
                  <div className="w-10 h-5.5 bg-slate-300 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:translate-x-4.5"></div>
                </div>
              </div>

              {/* Analytics & Performance Cookies */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1 pr-4">
                  <span className="text-xs font-bold text-slate-900">Analytics &amp; Performance</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Helps us understand how visitors use Tuitility (e.g. page traffic, tool usage) so we can improve the platform.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => togglePreference('analytics')}
                    className="sr-only peer"
                    aria-label="Analytics & Performance Cookies"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4.5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1 pr-4">
                  <span className="text-xs font-bold text-slate-900">Preferences &amp; Functionality</span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Saves your theme preference, settings configurations inside our calculators, or local gameplay histories.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => togglePreference('functional')}
                    className="sr-only peer"
                    aria-label="Preferences & Functionality Cookies"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4.5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {/* Marketing & Ad Cookies (Do Not Sell/Share) */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Marketing &amp; Targeting</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-semibold text-rose-600/90">
                    Opt-out option: "Do Not Sell or Share My Personal Info"
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Used to serve personalized ads based on your browser history. Disabling this opts you out of target tracking.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => togglePreference('marketing')}
                    className="sr-only peer"
                    aria-label="Marketing & Targeting Cookies"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4.5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>
          ) : null}

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-2.5 mt-4">
            {!showPreferences ? (
              <>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="w-full sm:w-auto text-xs text-slate-500 hover:text-slate-900 underline font-semibold cursor-pointer py-2 text-center"
                >
                  Cookie Settings
                </button>
                <div className="flex w-full sm:w-auto gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-white text-center"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-sm hover:shadow text-center"
                  >
                    Accept All
                  </button>
                </div>
              </>
            ) : (
              <div className="flex w-full justify-between items-center">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 underline font-semibold cursor-pointer py-2"
                >
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer bg-white"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
