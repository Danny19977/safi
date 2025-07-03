document.addEventListener('DOMContentLoaded', () => {
    class LanguageSwitcher {
        constructor() {
            this.currentLanguage = this.getLanguageFromURL() || 'en';
            this.init();
        }

        init() {
            this.translatePage();
            this.updateLanguageDisplay();
            this.setupEventListeners();
        }

        getLanguageFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('lang');
        }

        translatePage() {
            if (!translations[this.currentLanguage]) {
                console.warn(`Translation not found for language: ${this.currentLanguage}`);
                return;
            }

            const elements = document.querySelectorAll('[data-translate]');
            elements.forEach(element => {
                const key = element.getAttribute('data-translate');
                const translation = translations[this.currentLanguage][key];
                
                if (translation) {
                    if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                        element.placeholder = translation;
                    } else {
                        element.innerHTML = translation;
                    }
                } else {
                    console.warn(`Translation key not found: ${key} for language: ${this.currentLanguage}`);
                }
            });

            // Update document language attribute
            document.documentElement.lang = this.currentLanguage;
        }

        updateLanguageDisplay() {
            // Update the language dropdown button text
            const langButton = document.getElementById('langDropdown');
            if (langButton) {
                const currentLangText = this.currentLanguage === 'en' ? 'English' : 'Français';
                // Keep the data-translate attribute for future translations
                langButton.innerHTML = translations[this.currentLanguage]['nav_language'] || currentLangText;
            }

            // Update active state of dropdown items
            const dropdownItems = document.querySelectorAll('#langDropdown + .dropdown-menu .dropdown-item');
            dropdownItems.forEach(item => {
                const href = item.getAttribute('href');
                if (href && href.includes(`lang=${this.currentLanguage}`)) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        setupEventListeners() {
            // Handle language dropdown clicks
            const langDropdownItems = document.querySelectorAll('#langDropdown + .dropdown-menu .dropdown-item');
            langDropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = item.getAttribute('href');
                    const urlParams = new URLSearchParams(href.split('?')[1]);
                    const newLang = urlParams.get('lang');
                    
                    if (newLang && newLang !== this.currentLanguage) {
                        this.switchLanguage(newLang);
                    }
                });
            });
        }

        switchLanguage(newLanguage) {
            if (!translations[newLanguage]) {
                console.error(`Language ${newLanguage} not supported`);
                return;
            }

            this.currentLanguage = newLanguage;
            
            // Update URL without page reload
            const url = new URL(window.location);
            url.searchParams.set('lang', newLanguage);
            window.history.pushState({}, '', url);

            // Translate the page
            this.translatePage();
            this.updateLanguageDisplay();

            // Store preference in localStorage
            localStorage.setItem('preferredLanguage', newLanguage);
        }

        // Get user's preferred language
        getPreferredLanguage() {
            // Priority: URL parameter > localStorage > browser language > default (en)
            const urlLang = this.getLanguageFromURL();
            if (urlLang && translations[urlLang]) {
                return urlLang;
            }

            const storedLang = localStorage.getItem('preferredLanguage');
            if (storedLang && translations[storedLang]) {
                return storedLang;
            }

            const browserLang = navigator.language.substr(0, 2);
            if (translations[browserLang]) {
                return browserLang;
            }

            return 'en'; // default
        }
    }

    new LanguageSwitcher();
});