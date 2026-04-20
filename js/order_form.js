/**
 * Café SAFI – Order Form Logic
 * Handles both hot drink orders (Kinshasa Gombe only) and pack orders (RDC / International)
 */
(function () {
    'use strict';

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
            '<option value="" disabled selected>-- Choose item --</option>' +
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
                showAlert(feedback, 'danger', 'Please fill in your name, phone, and address.');
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
                showAlert(feedback, 'danger', 'Please select at least one item with a valid quantity.');
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
                        showAlert(feedback, 'danger', 'Please enter your country for international export.');
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
            submitBtn.textContent = 'Placing order…';

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
                submitBtn.textContent = 'Place Order';
                if (data.success) {
                    feedback.innerHTML =
                        '<div class="alert alert-success mt-3">' +
                        '<strong>Order placed! 🎉</strong><br>' +
                        'Your order number is: <strong>' + data.ordernumber + '</strong><br>' +
                        'We will contact you shortly on <strong>' + phone + '</strong> to confirm.' +
                        '</div>';
                    form.reset();
                    itemsList.innerHTML = '';
                    switchType('hot_drink');
                } else {
                    showAlert(feedback, 'danger', data.message || 'Something went wrong. Please try again.');
                }
            })
            .catch(function (err) {
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Place Order';
                console.error('Order fetch error:', err);
                showAlert(feedback, 'danger', 'Network error. Please check your connection and try again.');
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Bootstrap on DOMContentLoaded                                      */
    /* ------------------------------------------------------------------ */
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.safi-order-form').forEach(initForm);
    });
})();
