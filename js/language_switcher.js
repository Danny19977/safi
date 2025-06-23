document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        // ... (Your existing translation keys)
    };

    const getLanguage = () => {
        const urlParams = new URLSearchParams(window.location.search);
        let lang = urlParams.get('lang');
        if (lang && ['en', 'fr'].includes(lang)) {
            localStorage.setItem('language', lang);
            return lang;
        }
        return localStorage.getItem('language') || 'en';
    };

    const translatePage = () => {
        const lang = getLanguage();
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = translations[lang][key] || translations['en'][key];
            if (translation) {
                element.textContent = translation;
            } else {
                console.warn(`Missing translation for key: ${key}`);
            }
        });
    };

    const setLanguage = (lang) => {
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);
        localStorage.setItem('language', lang);
        translatePage();
    };

    document.querySelectorAll('.dropdown-item[href^="?lang="]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const lang = new URLSearchParams(link.getAttribute('href')).get('lang');
            if (lang) {
                setLanguage(lang);
            }
        });
    });

    translatePage();
});