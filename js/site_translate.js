(function () {
  if (window.__siteTranslateInitialized) {
    return;
  }
  window.__siteTranslateInitialized = true;

  var STORAGE_KEY = 'preferred-language';
  var SUPPORTED = ['en', 'fr'];
  var DEFAULT_LANGUAGE = 'en';

  function normalizeLanguage(lang) {
    if (!lang) {
      return DEFAULT_LANGUAGE;
    }
    var normalized = String(lang).toLowerCase().trim().slice(0, 2);
    return SUPPORTED.indexOf(normalized) >= 0 ? normalized : DEFAULT_LANGUAGE;
  }

  function getSavedLanguage() {
    return normalizeLanguage(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE);
  }

  function saveLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, normalizeLanguage(lang));
  }

  function ensureGoogleContainer() {
    if (!document.getElementById('google_translate_element')) {
      var element = document.createElement('div');
      element.id = 'google_translate_element';
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.overflow = 'hidden';
      document.body.appendChild(element);
    }
  }

  function createLanguageControl() {
    if (document.getElementById('siteTranslateControl')) {
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.id = 'siteTranslateControl';
    wrapper.style.position = 'fixed';
    wrapper.style.right = '12px';
    wrapper.style.bottom = '12px';
    wrapper.style.zIndex = '9999';
    wrapper.style.background = '#fff';
    wrapper.style.border = '1px solid rgba(0,0,0,0.15)';
    wrapper.style.borderRadius = '6px';
    wrapper.style.padding = '8px 10px';
    wrapper.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';

    var label = document.createElement('label');
    label.textContent = 'Language';
    label.setAttribute('for', 'siteTranslateSelect');
    label.style.marginRight = '8px';
    label.style.fontSize = '12px';

    var select = document.createElement('select');
    select.id = 'siteTranslateSelect';
    select.style.fontSize = '12px';
    select.style.padding = '2px 4px';

    var options = [
      { value: 'en', text: 'English' },
      { value: 'fr', text: 'Français' }
    ];

    options.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.text;
      select.appendChild(option);
    });

    select.value = getSavedLanguage();

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    document.body.appendChild(wrapper);

    select.addEventListener('change', function () {
      var lang = normalizeLanguage(select.value);
      saveLanguage(lang);
      applyLanguage(lang);
    });
  }

  function applyLanguage(lang) {
    var combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      return false;
    }

    var selectedLang = normalizeLanguage(lang);

    if (selectedLang === 'en') {
      combo.value = '';
    } else {
      combo.value = selectedLang;
    }

    combo.dispatchEvent(new Event('change'));

    var select = document.getElementById('siteTranslateSelect');
    if (select && select.value !== selectedLang) {
      select.value = selectedLang;
    }

    return true;
  }

  function syncExistingLanguageMenus() {
    document.querySelectorAll('[data-lang]').forEach(function (item) {
      item.addEventListener('click', function (event) {
        var lang = normalizeLanguage(item.getAttribute('data-lang'));
        if (!lang) {
          return;
        }

        event.preventDefault();
        saveLanguage(lang);
        applyLanguage(lang);

        var select = document.getElementById('siteTranslateSelect');
        if (select) {
          select.value = lang;
        }
      });
    });
  }

  function waitAndApplySavedLanguage() {
    var tries = 0;
    var maxTries = 60;

    var timer = setInterval(function () {
      tries += 1;
      var applied = applyLanguage(getSavedLanguage());
      if (applied || tries >= maxTries) {
        clearInterval(timer);
      }
    }, 250);
  }

  window.googleTranslateElementInit = function () {
    if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
      return;
    }

    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: SUPPORTED.join(','),
        autoDisplay: false
      },
      'google_translate_element'
    );

    waitAndApplySavedLanguage();
  };

  function loadGoogleScript() {
    if (document.getElementById('siteGoogleTranslateScript')) {
      return;
    }

    var script = document.createElement('script');
    script.id = 'siteGoogleTranslateScript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }

  function init() {
    ensureGoogleContainer();
    syncExistingLanguageMenus();
    loadGoogleScript();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
