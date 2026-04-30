(function () {
    var storageKey = 'safi_order_intro_seen';
    var sectionId = 'place-order-section';

    var fallbackStrings = {
        en: {
            popup_welcome_title: 'Welcome to Cafe SAFI',
            popup_welcome_text: 'Explore our Our Stores section where you can place your order directly with us.',
            popup_go_btn: 'Go to Our Stores',
            popup_close_btn: 'Close'
        },
        fr: {
            popup_welcome_title: 'Bienvenue chez Café SAFI',
            popup_welcome_text: 'Découvrez notre section Nos Magasins où vous pouvez passer votre commande directement avec nous.',
            popup_go_btn: 'Aller à Nos Magasins',
            popup_close_btn: 'Fermer'
        }
    };

    function getLang() {
        try {
            var stored = localStorage.getItem('preferred-language');
            if (stored && (stored === 'en' || stored === 'fr')) {
                return stored;
            }
        } catch (e) { /* ignore */ }
        var docLang = document.documentElement.lang;
        if (docLang && (docLang === 'en' || docLang === 'fr')) {
            return docLang;
        }
        return 'en';
    }

    function t(key) {
        var lang = getLang();
        // Try the global translations object loaded by the page first.
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }
        // Fall back to built-in strings.
        var fb = fallbackStrings[lang] || fallbackStrings.en;
        return fb[key] || fallbackStrings.en[key] || key;
    }

    function applyTexts() {
        var title = document.getElementById('safiOrderPopupTitle');
        var body  = document.getElementById('safiOrderPopupBody');
        var goBtn = document.getElementById('safiOrderPopupGo');
        var closeBtn = document.getElementById('safiOrderPopupClose');
        if (title)    { title.textContent    = t('popup_welcome_title'); }
        if (body)     { body.textContent     = t('popup_welcome_text'); }
        if (goBtn)    { goBtn.textContent    = t('popup_go_btn'); }
        if (closeBtn) { closeBtn.textContent = t('popup_close_btn'); }
    }

    function buildPopup() {
        if (!document.getElementById('safi-order-popup-style')) {
            var style = document.createElement('style');
            style.id = 'safi-order-popup-style';
            style.textContent = [
                '.safi-order-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px;}',
                '.safi-order-popup{max-width:520px;width:100%;background:#111;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.35);padding:24px;position:relative;}',
                '.safi-order-popup h3{margin:0 0 10px 0;font-size:1.5rem;line-height:1.3;}',
                '.safi-order-popup p{margin:0 0 18px 0;color:rgba(255,255,255,.86);line-height:1.5;}',
                '.safi-order-popup-actions{display:flex;gap:10px;flex-wrap:wrap;}',
                '.safi-order-popup-cta,.safi-order-popup-close{border:none;border-radius:8px;padding:10px 14px;cursor:pointer;font-weight:600;}',
                '.safi-order-popup-cta{background:#c49b63;color:#111;}',
                '.safi-order-popup-close{background:#2f2f2f;color:#fff;}',
                '@media (max-width: 480px){.safi-order-popup{padding:18px;}.safi-order-popup h3{font-size:1.25rem;}}'
            ].join('');
            document.head.appendChild(style);
        }

        var overlay = document.createElement('div');
        overlay.className = 'safi-order-popup-overlay';
        overlay.id = 'safiOrderPopupOverlay';

        var popup = document.createElement('div');
        popup.className = 'safi-order-popup';
        popup.innerHTML =
            '<h3 id="safiOrderPopupTitle"></h3>' +
            '<p id="safiOrderPopupBody"></p>' +
            '<div class="safi-order-popup-actions">' +
            '  <button type="button" class="safi-order-popup-cta" id="safiOrderPopupGo"></button>' +
            '  <button type="button" class="safi-order-popup-close" id="safiOrderPopupClose"></button>' +
            '</div>';

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Fill in translated text right away.
        applyTexts();

        return overlay;
    }

    function closePopup(overlay) {
        if (!overlay) { return; }
        overlay.remove();
    }

    function scrollToOrderSection() {
        var target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        try {
            if (localStorage.getItem(storageKey)) { return; }
        } catch (e) {
            // If storage is unavailable, show popup for this load only.
        }

        var overlay = buildPopup();

        function markSeen() {
            try { localStorage.setItem(storageKey, '1'); } catch (e) { /* ignore */ }
        }

        document.getElementById('safiOrderPopupGo').addEventListener('click', function () {
            markSeen();
            closePopup(overlay);
            scrollToOrderSection();
        });

        document.getElementById('safiOrderPopupClose').addEventListener('click', function () {
            markSeen();
            closePopup(overlay);
        });

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                markSeen();
                closePopup(overlay);
            }
        });

        // Re-apply translations if the user switches language while popup is still open.
        document.addEventListener('safiLangChange', function () {
            applyTexts();
        });
    });
})();
