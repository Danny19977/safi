document.addEventListener('DOMContentLoaded', () => {
    const languageDropdownItems = document.querySelectorAll('[data-lang]');
    const currentLangSpan = document.getElementById('current-lang');

    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
        updateTranslations(lang);
        updateCurrentLanguageDisplay(lang);
    };

    const updateTranslations = (lang) => {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
    };

    const updateCurrentLanguageDisplay = (lang) => {
        const langNames = {
            'en': 'English',
            'fr': 'Français'
        };
        if (currentLangSpan) {
            currentLangSpan.textContent = langNames[lang] || 'English';
        }
    };

    languageDropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const selectedLang = event.target.getAttribute('data-lang');
            setLanguage(selectedLang);
        });
    });

    // Set initial language
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
});
