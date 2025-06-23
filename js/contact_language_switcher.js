document.addEventListener('DOMContentLoaded', () => {
    const setLanguage = (lang) => {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (contact_translations[lang] && contact_translations[lang][key]) {
                element.innerText = contact_translations[lang][key];
            }
        });
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (contact_translations[lang] && contact_translations[lang][key]) {
                element.innerText = contact_translations[lang][key];
            }
        });
    };

    const langDropdown = document.getElementById('langDropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-item[href*="?lang="]');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = new URLSearchParams(e.target.href.split('?')[1]).get('lang');
            setLanguage(lang);
            localStorage.setItem('language', lang);
        });
    });

    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
});
