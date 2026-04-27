/**
 * Café SAFI – Order Form Logic
 * Handles both hot drink orders (Kinshasa Gombe only) and pack orders (RDC / International)
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  i18n helper – reads current language from localStorage             */
    /* ------------------------------------------------------------------ */
    function t(key) {
        var lang = localStorage.getItem('preferred-language') || 'en';
        if (typeof translations !== 'undefined') {
            var dict = translations[lang] || translations['en'];
            if (dict && dict[key] !== undefined) return dict[key];
        }
        return key;
    }

    /* ------------------------------------------------------------------ */
    /*  Product catalogs                                                    */
    /* ------------------------------------------------------------------ */
    var HOT_DRINKS = [
        'Chocolate Chaud',
        'Americano',
        'Cafe au Lait',
        'Cafe glace',
        'Mocha',
        'The au lait',
        'Capuccino',
        'Espresso',
        'The au citron',
        'Cafe au gingembre',
        'The au gingembre +miel'
    ];

    var PACKS = [
        { name: 'Pack 250g',  label: 'Pack 250g – Café Petit Kwilu' },
        { name: 'Pack 500g',  label: 'Pack 500g – Café Petit Kwilu' },
        { name: 'Pack 1kg',   label: 'Pack 1 kg – Café Petit Kwilu' },
        { name: 'Pack 5kg',   label: 'Pack 5 kg (professionnel)' },
        { name: 'Pack 10kg',  label: 'Pack 10 kg (professionnel)' },
        { name: 'Pack 25kg',  label: 'Pack 25 kg (exportation)' }
    ];

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                             */
    /* ------------------------------------------------------------------ */
    function el(id) { return document.getElementById(id); }

    function showAlert(container, type, msg) {
        container.innerHTML =
            '<div class="alert alert-' + type + ' mt-3" role="alert">' + msg + '</div>';
    }

    function buildItemRow(items, type) {
        var catalog = type === 'hot_drink' ? HOT_DRINKS.map(function (n) { return { name: n, label: n }; }) : PACKS;
        var options = catalog.map(function (p) {
            return '<option value="' + p.name + '">' + p.label + '</option>';
        }).join('');

        var row = document.createElement('div');
        row.className = 'safi-item-row d-flex align-items-center mb-2';
        row.innerHTML =
            '<select class="form-control safi-item-name mr-2" required>' +
            '<option value="" disabled selected>' + t('order_choose_item') + '</option>' +
            options +
            '</select>' +
            '<input type="number" class="form-control safi-item-qty mr-2" min="1" value="1" style="max-width:80px" placeholder="Qty" required />' +
            '<button type="button" class="btn btn-sm btn-danger safi-remove-item">✕</button>';

        row.querySelector('.safi-remove-item').addEventListener('click', function () {
            if (items.querySelectorAll('.safi-item-row').length > 1) {
                row.remove();
            }
        });

        items.appendChild(row);
    }

    /* ------------------------------------------------------------------ */
    /*  Main init – runs for every .safi-order-form on the page            */
    /* ------------------------------------------------------------------ */
    function hide(element) { element.classList.add('d-none', 'hidden'); }
    function show(element) { element.classList.remove('d-none', 'hidden'); }

    function initForm(form) {
        var tabHot      = form.querySelector('.safi-tab-hot');
        var tabPack     = form.querySelector('.safi-tab-pack');
        var zoneSection = form.querySelector('.safi-zone-section');
        var packCountry = form.querySelector('.safi-country');
        var packIntlRow = form.querySelector('.safi-intl-country-row');
        var itemsList   = form.querySelector('.safi-items-list');
        var addItemBtn  = form.querySelector('.safi-add-item');
        var feedback    = form.querySelector('.safi-feedback');
        var submitBtn   = form.querySelector('.safi-submit');

        if (!tabHot || !tabPack || !itemsList) return; // guard

        var currentType = 'hot_drink';

        /* ---------- switch order type ---------- */
        function switchType(type) {
            currentType = type;
            // Rebuild item rows for the selected type
            itemsList.innerHTML = '';
            buildItemRow(itemsList, type);

            // Highlight the active tab, dim the other
            if (type === 'hot_drink') {
                tabHot.classList.add('active');
                tabPack.classList.remove('active');
                if (zoneSection) hide(zoneSection);
                if (packIntlRow) hide(packIntlRow);
            } else {
                tabPack.classList.add('active');
                tabHot.classList.remove('active');
                if (zoneSection) show(zoneSection);
                updateZone();
            }
        }

        function updateZone() {
            if (!packCountry) return;
            if (packIntlRow) {
                if (packCountry.value === 'international') {
                    show(packIntlRow);
                } else {
                    hide(packIntlRow);
                }
            }
        }

        tabHot.addEventListener('click',  function () { switchType('hot_drink'); });
        tabPack.addEventListener('click', function () { switchType('pack'); });
        if (packCountry) packCountry.addEventListener('change', updateZone);

        addItemBtn.addEventListener('click', function () {
            buildItemRow(itemsList, currentType);
        });

        // Initial state
        switchType('hot_drink');

        /* ---------- submit ---------- */
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            feedback.innerHTML = '';

            var name    = form.querySelector('.safi-name').value.trim();
            var email   = form.querySelector('.safi-email').value.trim();
            var phone   = form.querySelector('.safi-phone').value.trim();
            var address = form.querySelector('.safi-address').value.trim();
            var notes   = form.querySelector('.safi-notes') ? form.querySelector('.safi-notes').value.trim() : '';

            if (!name || !phone || !address) {
                showAlert(feedback, 'danger', t('order_err_required'));
                return;
            }

            var rows = itemsList.querySelectorAll('.safi-item-row');
            var items = [];
            var valid = true;
            rows.forEach(function (row) {
                var itemName = row.querySelector('.safi-item-name').value;
                var qty      = parseInt(row.querySelector('.safi-item-qty').value, 10);
                if (!itemName || isNaN(qty) || qty < 1) { valid = false; return; }
                items.push({ name: itemName, quantity: qty });
            });

            if (!valid || items.length === 0) {
                showAlert(feedback, 'danger', t('order_err_items'));
                return;
            }

            var deliveryZone = 'kinshasa_gombe';
            var country      = 'RDC';

            if (currentType === 'pack') {
                deliveryZone = packCountry ? packCountry.value : 'rdc';
                if (deliveryZone === 'international') {
                    var intlInput = form.querySelector('.safi-intl-country-input');
                    country = intlInput ? intlInput.value.trim() : '';
                    if (!country) {
                        showAlert(feedback, 'danger', t('order_err_country'));
                        return;
                    }
                }
            }

            var payload = {
                name:          name,
                email:         email,
                phone:         phone,
                address:       address,
                type:          currentType,
                delivery_zone: deliveryZone,
                country:       country,
                notes:         notes,
                items:         items
            };

            submitBtn.disabled = true;
            submitBtn.textContent = t('order_placing');

            // Absolute URL – works from index.html, menu.html, or any page in the same folder
            var siteRoot = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
            var orderUrl = siteRoot + '/php/place_order.php';

            fetch(orderUrl, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                submitBtn.disabled    = false;
                submitBtn.textContent = t('order_submit');
                if (data.success) {
                    feedback.innerHTML =
                        '<div class="alert alert-success mt-3">' +
                        '<strong>' + t('order_success_title') + '</strong><br>' +
                        t('order_success_number') + ' <strong>' + data.ordernumber + '</strong><br>' +
                        t('order_success_contact').replace('{phone}', '<strong>' + phone + '</strong>') +
                        '</div>';
                    form.reset();
                    itemsList.innerHTML = '';
                    switchType('hot_drink');
                } else {
                    showAlert(feedback, 'danger', data.message || t('order_err_generic'));
                }
            })
            .catch(function (err) {
                submitBtn.disabled    = false;
                submitBtn.textContent = t('order_submit');
                console.error('Order fetch error:', err);
                showAlert(feedback, 'danger', t('order_err_network'));
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Bootstrap on DOMContentLoaded                                      */
    /* ------------------------------------------------------------------ */
    var activeForms = [];

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.safi-order-form').forEach(function (form) {
            initForm(form);
            activeForms.push(form);
        });
    });

    // Re-render dynamic content when language switches
    document.addEventListener('safiLangChange', function () {
        activeForms.forEach(function (form) {
            var itemsList = form.querySelector('.safi-items-list');
            if (!itemsList) return;

            // Determine current type from which tab is active
            var tabHot  = form.querySelector('.safi-tab-hot');
            var curType = (tabHot && tabHot.classList.contains('active')) ? 'hot_drink' : 'pack';

            // Rebuild each row keeping its selected value and qty
            var rows = itemsList.querySelectorAll('.safi-item-row');
            rows.forEach(function (oldRow) {
                var oldVal = oldRow.querySelector('.safi-item-name').value;
                var oldQty = oldRow.querySelector('.safi-item-qty').value;
                // Build fresh row
                buildItemRow(itemsList, curType);
                var newRow = itemsList.lastElementChild;
                if (oldVal) newRow.querySelector('.safi-item-name').value = oldVal;
                newRow.querySelector('.safi-item-qty').value = oldQty;
                oldRow.remove();
            });

            // Also translate the Add-item button text (JS-rendered if any)
            var addBtn = form.querySelector('.safi-add-item');
            if (addBtn && addBtn.hasAttribute('data-translate')) {
                addBtn.textContent = t(addBtn.getAttribute('data-translate'));
            }
        });
    });

})();