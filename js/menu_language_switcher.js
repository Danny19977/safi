let currentLanguage = 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            const translatedValue = translations[lang][key].replace('{year}', new Date().getFullYear());
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translatedValue;
            } else {
                element.innerHTML = translatedValue;
            }
        }
    });
    
    // Store language preference
    localStorage.setItem('preferred-language', lang);

    // Notify other scripts that the language changed
    document.dispatchEvent(new CustomEvent('safiLangChange', { detail: { lang: lang } }));
}

function initializeLanguage() {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    switchLanguage(savedLanguage);
}

// Initialize language when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
});

// Use capture-phase delegation on the document so this fires before Bootstrap
// can call stopPropagation on dropdown item clicks.
document.addEventListener('click', function(e) {
    const item = e.target.closest('[data-lang]');
    if (!item) return;
    e.preventDefault();
    e.stopPropagation(); // prevent Bootstrap from scrolling to # or re-toggling
    const lang = item.getAttribute('data-lang');
    if (lang) {
        switchLanguage(lang);
    }
}, true); // true = capture phase — fires before any bubbling handlers
