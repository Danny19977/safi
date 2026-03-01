let currentLanguage = 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    if (!blogTranslations || !blogTranslations[lang]) {
        return;
    }
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (blogTranslations[lang] && blogTranslations[lang][key]) {
            const translatedValue = blogTranslations[lang][key].replace('{year}', new Date().getFullYear());
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translatedValue;
            } else {
                element.innerHTML = translatedValue;
            }
        }
    });
    
    // Store language preference
    localStorage.setItem('preferred-language', lang);
}

function initializeLanguage() {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    switchLanguage(savedLanguage);
}

// Initialize language when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    
    // Add click event listeners to language dropdown items
    document.querySelectorAll('#langDropdown + .dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            if (lang) {
                switchLanguage(lang);
            }
        });
    });
});
