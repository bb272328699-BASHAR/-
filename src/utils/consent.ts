/**
 * Google Consent Mode v2 Helper
 * Manages privacy choices (ad_storage, ad_user_data, ad_personalization, analytics_storage)
 * compliant with Google AdSense, Google Analytics 4, and GDPR/CCPA regulations.
 */

export interface ConsentSettings {
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted';
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'daleel_consent_mode_v2';

export const DEFAULT_CONSENT: ConsentSettings = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
};

export const GRANTED_ALL_CONSENT: ConsentSettings = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
};

/**
 * Get saved consent settings from localStorage
 */
export function getSavedConsent(): ConsentSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!item) return null;
    return JSON.parse(item) as ConsentSettings;
  } catch (e) {
    console.error('Error reading consent from localStorage:', e);
    return null;
  }
}

/**
 * Initialize or update consent with Google gtag
 */
export function updateGoogleConsent(settings: ConsentSettings, action: 'default' | 'update' = 'update') {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = window.gtag || gtag;

  // Execute gtag consent command
  window.gtag('consent', action, {
    ad_storage: settings.ad_storage,
    ad_user_data: settings.ad_user_data,
    ad_personalization: settings.ad_personalization,
    analytics_storage: settings.analytics_storage,
    personalization_storage: settings.personalization_storage || 'granted',
    functionality_storage: settings.functionality_storage || 'granted',
    security_storage: 'granted',
  });

  if (action === 'update') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settings));
      // Dispatch custom event for reactive UI updates
      window.dispatchEvent(new CustomEvent('daleel_consent_updated', { detail: settings }));
    } catch (e) {
      console.error('Failed to save consent settings:', e);
    }
  }
}

/**
 * Save user consent choice and dispatch update
 */
export function saveConsentChoice(choice: 'all' | 'essential' | ConsentSettings) {
  let settingsToSave: ConsentSettings;

  if (choice === 'all') {
    settingsToSave = GRANTED_ALL_CONSENT;
  } else if (choice === 'essential') {
    settingsToSave = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
    };
  } else {
    settingsToSave = choice;
  }

  updateGoogleConsent(settingsToSave, 'update');
  return settingsToSave;
}
