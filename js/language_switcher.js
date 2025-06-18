document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let currentLang = params.get('lang') || 'en'; // Default to English

    // Ensure the dropdown shows the current language (optional, good for UX)
    const langDropdownToggle = document.getElementById('langDropdown');
    if (langDropdownToggle && translations.nav_language) {
         if (translations.nav_language[currentLang]) {
            langDropdownToggle.textContent = translations.nav_language[currentLang];
        } else if (translations.nav_language['en']) { // Fallback to English if current lang translation missing
             langDropdownToggle.textContent = translations.nav_language['en'];
        }
    }


    function applyTranslations() {
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[key] && translations[key][currentLang]) {
                // Preserve child elements if only text content needs changing for simple tags
                if (element.children.length === 0 || ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'BUTTON', 'SMALL', 'STRONG', 'EM', 'B', 'I'].includes(element.tagName)) {
                    element.textContent = translations[key][currentLang];
                } else if (element.tagName === 'A' && element.classList.contains('nav-link') || element.classList.contains('dropdown-item') || element.classList.contains('btn')) {
                     // For links and buttons, only change text node, keep other children (like icons)
                    let textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
                    if (textNode) {
                        textNode.textContent = translations[key][currentLang];
                    } else { // If no direct text node, might be nested, or set innerHTML as fallback (less safe)
                        // This part might need adjustment based on your exact HTML structure for complex buttons/links
                        // For simplicity, if it's a link/button and no direct text node, we'll try setting textContent
                        // which might overwrite icons if not handled carefully.
                        // A more robust solution would be to wrap text in <span> and translate the span.
                        element.textContent = translations[key][currentLang]; // Fallback, might remove icons
                    }
                }
                // Add more specific handlers if needed, e.g., for input placeholders
                // else {
                //     element.innerHTML = translations[key][currentLang]; // Use innerHTML if structure might change or contains HTML
                // }
            } else if (translations[key] && translations[key]['en']) {
                // Fallback to English if translation for currentLang is missing
                 if (element.children.length === 0 || ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'BUTTON', 'SMALL', 'STRONG', 'EM', 'B', 'I'].includes(element.tagName)) {
                    element.textContent = translations[key]['en'];
                } else if (element.tagName === 'A' && element.classList.contains('nav-link') || element.classList.contains('dropdown-item') || element.classList.contains('btn')) {
                    let textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
                    if (textNode) {
                        textNode.textContent = translations[key]['en'];
                    } else {
                        element.textContent = translations[key]['en'];
                    }
                }
            }
            // else {
            //     console.warn(`Translation key "${key}" not found or language "${currentLang}" not available.`);
            // }
        });
    }

    applyTranslations();

    // Update language links to set the lang parameter correctly
    document.querySelectorAll('.dropdown-menu a[href*="?lang="]').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Stop the default link behavior
            const lang = new URL(this.href).searchParams.get('lang');
            if (lang) {
                const currentSearchParams = new URLSearchParams(window.location.search);
                currentSearchParams.set('lang', lang);
                window.location.search = currentSearchParams.toString();
            }
        });
    });
});