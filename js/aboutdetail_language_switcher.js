document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.getElementById('language-switcher');
    const elementsToTranslate = document.querySelectorAll('[data-translate]');

    const switchLanguage = (lang) => {
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
    };

    languageSwitcher.addEventListener('change', (event) => {
        switchLanguage(event.target.value);
    });

    // Initial language setup
    switchLanguage('en');
});
