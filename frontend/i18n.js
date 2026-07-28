(function () {
  const supportedLanguages = ['en', 'zh-CN', 'ja', 'fr'];
  const storageKey = 'safestay_preferred_language';
  let currentLanguage = 'en';
  let translations = {};

  function normalizeLanguage(languageCode) {
    if (typeof languageCode !== 'string') return 'en';
    const trimmed = languageCode.trim();
    return supportedLanguages.includes(trimmed) ? trimmed : 'en';
  }

  function getStoredLanguage() {
    const stored = localStorage.getItem(storageKey);
    return normalizeLanguage(stored);
  }

  function resolveValue(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applyReplacements(template, replacements) {
    if (!template) return '';
    if (!replacements) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return replacements[key] !== undefined ? String(replacements[key]) : match;
    });
  }

  function getTranslationValue(key, replacements) {
    const value = resolveValue(translations, key);
    if (typeof value === 'string') {
      return applyReplacements(value, replacements);
    }
    const englishValue = resolveValue(window.__i18nFallback || {}, key);
    if (typeof englishValue === 'string') {
      return applyReplacements(englishValue, replacements);
    }
    return key;
  }

  function setText(node, value) {
    if (!node) return;
    node.textContent = value;
  }

  function translateElement(element) {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const translated = getTranslationValue(key);
    if (translated !== key) {
      setText(element, translated);
    }
  }

  function translatePlaceholder(element) {
    const key = element.getAttribute('data-i18n-placeholder');
    if (!key) return;
    const translated = getTranslationValue(key);
    if (translated !== key) {
      element.setAttribute('placeholder', translated);
    }
  }

  function translateTitle(element) {
    const key = element.getAttribute('data-i18n-title');
    if (!key) return;
    const translated = getTranslationValue(key);
    if (translated !== key) {
      element.setAttribute('title', translated);
    }
  }

  function translateAriaLabel(element) {
    const key = element.getAttribute('data-i18n-aria-label');
    if (!key) return;
    const translated = getTranslationValue(key);
    if (translated !== key) {
      element.setAttribute('aria-label', translated);
    }
  }

  function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(translateElement);
    document.querySelectorAll('[data-i18n-placeholder]').forEach(translatePlaceholder);
    document.querySelectorAll('[data-i18n-title]').forEach(translateTitle);
    document.querySelectorAll('[data-i18n-aria-label]').forEach(translateAriaLabel);
    document.dispatchEvent(new CustomEvent('safestay:language-ready', { detail: { language: currentLanguage } }));
  }

  window.t = function (key, replacements) {
    return getTranslationValue(key, replacements);
  };

  window.getCurrentLanguage = function () {
    return currentLanguage;
  };

  window.changeLanguage = function (languageCode) {
    const nextLanguage = normalizeLanguage(languageCode);
    if (!nextLanguage) return false;
    currentLanguage = nextLanguage;
    localStorage.setItem(storageKey, nextLanguage);
    window.initI18n();
    return true;
  };

  window.initI18n = async function () {
    const language = getStoredLanguage();
    currentLanguage = language;

    const fallbackUrl = 'locales/en.json';
    const response = await fetch(fallbackUrl);
    window.__i18nFallback = await response.json();

    const localeUrl = 'locales/' + currentLanguage + '.json';
    try {
      const localeResponse = await fetch(localeUrl);
      translations = await localeResponse.json();
    } catch (e) {
      translations = window.__i18nFallback;
    }

    applyTranslations();
  };

  window.addEventListener('DOMContentLoaded', function () {
    window.initI18n();
  });
})();
