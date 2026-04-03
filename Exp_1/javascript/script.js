document.addEventListener('DOMContentLoaded', function () {
    // Displays static shop details enhancement.
    var shopCard = document.querySelector('.shop-card');
    if (shopCard) {
        var shopDetails = { owner: 'Avaneesh B' };
        var rows = shopCard.querySelectorAll('.detail-row');
        if (rows.length >= 2) {
            var ownerSpan = rows[1].querySelector('span');
            if (ownerSpan) {
                ownerSpan.textContent = shopDetails.owner + ' (Verified)';
                ownerSpan.style.color = '#2ecc71';
                ownerSpan.style.fontWeight = 'bold';
            }
        }
    }

    if (!localStorage.getItem('stock')) {
        localStorage.setItem('stock', JSON.stringify({ Rice: 450, Wheat: 300, Oil: 120, Salt: 85 }));
    }

    function getStock() {
        return JSON.parse(localStorage.getItem('stock'));
    }

    function updateStock(item, qtyToDeduct) {
        var stock = getStock();
        if (stock[item] !== undefined) {
            stock[item] = stock[item] - qtyToDeduct;
            localStorage.setItem('stock', JSON.stringify(stock));
        }
    }

    function displayStock() {
        var stock = getStock();
        var stockItems = document.querySelectorAll('.stock-item');

        stockItems.forEach(function (item) {
            var text = item.innerText;
            var itemKey = '';
            if (text.includes('Rice')) itemKey = 'Rice';
            else if (text.includes('Wheat')) itemKey = 'Wheat';
            else if (text.includes('Oil')) itemKey = 'Oil';
            else if (text.includes('Salt')) itemKey = 'Salt';

            if (itemKey && stock[itemKey] !== undefined) {
                var valSpan = item.querySelector('.stock-value');
                if (valSpan) valSpan.textContent = stock[itemKey];
            }
        });

        var lowItems = [];
        for (var stockKey in stock) {
            if (stock[stockKey] < 20) {
                lowItems.push(stockKey);
            }
        }

        var alertContainer = document.getElementById('stock-alert-container');
        if (alertContainer) {
            if (lowItems.length > 0) {
                alertContainer.innerHTML = '<div style="background:#ffcccc; color:#cc0000; padding:10px; border:1px solid red; margin-top:20px; border-radius:8px;"><strong>Low Stock Alert:</strong> The following items are below 20kg: ' + lowItems.join(', ') + '</div>';
            } else {
                alertContainer.innerHTML = '';
            }
        }
    }

    function calculateEligibility(category, members) {
        var ricePerMember = 0;
        if (category === 'APL') {
            ricePerMember = 5;
        } else if (category === 'BPL') {
            ricePerMember = 8;
        } else if (category === 'AAY') {
            return 35;
        }
        return ricePerMember * members;
    }

    function getBeneficiaries() {
        return JSON.parse(localStorage.getItem('beneficiaries')) || [];
    }

    function addBeneficiary(beneficiary) {
        var beneficiaries = getBeneficiaries();
        beneficiaries.push(beneficiary);
        localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
    }

    function generateReport() {
        var distTable = document.querySelector('.dist-table');
        if (!distTable) return;

        var tbody = distTable.querySelector('tbody');
        var beneficiaries = getBeneficiaries();
        tbody.innerHTML = '';

        if (beneficiaries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records found.</td></tr>';
            return;
        }

        for (var i = 0; i < beneficiaries.length; i++) {
            var b = beneficiaries[i];
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + (b.date || new Date().toLocaleDateString()) + '</td>' +
                '<td>' + b.name + '</td>' +
                '<td>' + b.cardNo + '</td>' +
                '<td>Rice</td>' +
                '<td>' + b.allocatedRice + ' kg</td>';
            tbody.appendChild(row);
        }

        var caption = distTable.querySelector('caption');
        if (caption) {
            caption.textContent = 'Daily Ration Distribution Log - ' + new Date().toLocaleDateString();
        }
    }

    var form = document.getElementById('beneficiaryForm');
    var searchBtn = document.getElementById('searchBtn');
    var resetBtn = document.getElementById('resetBtn');

    var fieldNames = [
        'fullName',
        'rationNumber',
        'email',
        'mobile',
        'familySize',
        'category',
        'password',
        'confirmPassword',
        'address'
    ];

    function getFieldElement(fieldName) {
        if (!form) return null;
        return form.querySelector('[name="' + fieldName + '"]');
    }

    function getFieldErrorNode(fieldName) {
        if (!form) return null;
        return form.querySelector('[data-error-for="' + fieldName + '"]');
    }

    function showFieldError(fieldName, message) {
        var field = getFieldElement(fieldName);
        var errorNode = getFieldErrorNode(fieldName);
        if (field) {
            field.classList.remove('field-valid');
            field.classList.add('field-invalid');
        }
        if (errorNode) {
            errorNode.textContent = message;
        }
    }

    function clearFieldError(fieldName) {
        var field = getFieldElement(fieldName);
        var errorNode = getFieldErrorNode(fieldName);
        if (field) {
            field.classList.remove('field-invalid');
            field.classList.add('field-valid');
        }
        if (errorNode) {
            errorNode.textContent = '';
        }
    }

    function normalizeValue(fieldName) {
        var field = getFieldElement(fieldName);
        if (!field) return '';
        return String(field.value || '').trim();
    }

    function validateField(fieldName, shouldCheckDuplicateCard) {
        var value = normalizeValue(fieldName);
        var passwordValue = normalizeValue('password');

        if (fieldName === 'fullName') {
            if (value.length === 0) return showFieldError(fieldName, 'Full name is required.'), false;
            if (value.length < 3 || value.length > 60) return showFieldError(fieldName, 'Full name must be between 3 and 60 characters.'), false;
            if (!/^[A-Za-z ]+$/.test(value)) return showFieldError(fieldName, 'Use alphabets and spaces only for full name.'), false;
        }

        if (fieldName === 'rationNumber') {
            if (!/^\d{10}$/.test(value)) return showFieldError(fieldName, 'Ration card number must be exactly 10 digits.'), false;
            if (shouldCheckDuplicateCard) {
                var beneficiaries = getBeneficiaries();
                var duplicate = beneficiaries.some(function (b) {
                    return b.cardNo === value;
                });
                if (duplicate) return showFieldError(fieldName, 'This ration card is already registered.'), false;
            }
        }

        if (fieldName === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return showFieldError(fieldName, 'Enter a valid email address.'), false;
        }

        if (fieldName === 'mobile') {
            if (!/^[6-9]\d{9}$/.test(value)) return showFieldError(fieldName, 'Enter a valid 10-digit mobile number.'), false;
        }

        if (fieldName === 'familySize') {
            var family = Number(value);
            if (!Number.isInteger(family)) return showFieldError(fieldName, 'Family size must be a whole number.'), false;
            if (family < 1 || family > 15) return showFieldError(fieldName, 'Family size must be between 1 and 15.'), false;
        }

        if (fieldName === 'category') {
            if (value !== 'APL' && value !== 'BPL' && value !== 'AAY') return showFieldError(fieldName, 'Please select a beneficiary category.'), false;
        }

        if (fieldName === 'password') {
            if (value.length < 8 || value.length > 32) return showFieldError(fieldName, 'Password must be between 8 and 32 characters.'), false;
            if (!/[A-Z]/.test(value)) return showFieldError(fieldName, 'Password must contain at least one uppercase letter.'), false;
            if (!/[a-z]/.test(value)) return showFieldError(fieldName, 'Password must contain at least one lowercase letter.'), false;
            if (!/[0-9]/.test(value)) return showFieldError(fieldName, 'Password must contain at least one digit.'), false;
            if (!/[^A-Za-z0-9]/.test(value)) return showFieldError(fieldName, 'Password must contain at least one special character.'), false;
        }

        if (fieldName === 'confirmPassword') {
            if (value.length === 0) return showFieldError(fieldName, 'Please confirm your password.'), false;
            if (value !== passwordValue) return showFieldError(fieldName, 'Passwords do not match.'), false;
        }

        if (fieldName === 'address') {
            if (value.length < 10 || value.length > 180) return showFieldError(fieldName, 'Address must be between 10 and 180 characters.'), false;
        }

        clearFieldError(fieldName);
        return true;
    }

    function validateForm() {
        var allValid = true;
        fieldNames.forEach(function (fieldName) {
            if (!validateField(fieldName, true)) {
                allValid = false;
            }
        });
        return allValid;
    }

    function attachRealtimeValidation() {
        if (!form) return;

        fieldNames.forEach(function (fieldName) {
            var field = getFieldElement(fieldName);
            if (!field) return;

            field.addEventListener('input', function () {
                validateField(fieldName, false);
                if (fieldName === 'password') {
                    validateField('confirmPassword', false);
                }
            });

            field.addEventListener('blur', function () {
                validateField(fieldName, false);
            });

            if (field.tagName === 'SELECT') {
                field.addEventListener('change', function () {
                    validateField(fieldName, false);
                });
            }
        });
    }

    function runValidationSelfTests() {
        // Quick console tests for common validation cases during debugging.
        var tests = [
            { name: 'Valid ration card', pass: /^\d{10}$/.test('1234567890') },
            { name: 'Invalid ration card', pass: !/^\d{10}$/.test('1234ABCD') },
            { name: 'Valid email', pass: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('citizen@domain.com') },
            { name: 'Invalid mobile', pass: !/^[6-9]\d{9}$/.test('1234567890') },
            { name: 'Password strength', pass: /[A-Z]/.test('Abcd@123') && /[a-z]/.test('Abcd@123') && /[0-9]/.test('Abcd@123') && /[^A-Za-z0-9]/.test('Abcd@123') }
        ];

        var failed = tests.filter(function (t) { return !t.pass; });
        if (failed.length > 0) {
            console.warn('Validation self-tests failed:', failed);
        } else {
            console.info('Validation self-tests passed:', tests.length);
        }
    }

    displayStock();
    generateReport();
    attachRealtimeValidation();
    runValidationSelfTests();

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateForm()) {
                var firstInvalid = form.querySelector('.field-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            var fullName = normalizeValue('fullName');
            var rationCard = normalizeValue('rationNumber');
            var email = normalizeValue('email');
            var mobile = normalizeValue('mobile');
            var familySize = Number(normalizeValue('familySize'));
            var category = normalizeValue('category');
            var address = normalizeValue('address');

            var allocatedRice = calculateEligibility(category, familySize);
            var currentStock = getStock();

            if (currentStock.Rice < allocatedRice) {
                alert('Insufficient Rice stock. Available: ' + currentStock.Rice + ' kg');
                return;
            }

            updateStock('Rice', allocatedRice);

            var beneficiary = {
                name: fullName,
                cardNo: rationCard,
                email: email,
                mobile: mobile,
                members: familySize,
                category: category,
                address: address,
                allocatedRice: allocatedRice,
                date: new Date().toLocaleDateString()
            };
            addBeneficiary(beneficiary);

            alert('Beneficiary registered successfully. Allocated Rice: ' + allocatedRice + ' kg');

            form.reset();
            fieldNames.forEach(function (fieldName) {
                var field = getFieldElement(fieldName);
                if (field) {
                    field.classList.remove('field-valid');
                    field.classList.remove('field-invalid');
                }
                var errorNode = getFieldErrorNode(fieldName);
                if (errorNode) {
                    errorNode.textContent = '';
                }
            });

            displayStock();
            generateReport();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            var cardNo = String(document.getElementById('searchCardNo').value || '').trim();
            var resultDiv = document.getElementById('searchResult');
            var beneficiaries = getBeneficiaries();

            if (cardNo === '') {
                resultDiv.innerHTML = '<span style="color:orange;">Please enter a ration card number.</span>';
                return;
            }

            var found = null;
            for (var i = 0; i < beneficiaries.length; i++) {
                if (beneficiaries[i].cardNo === cardNo) {
                    found = beneficiaries[i];
                    break;
                }
            }

            if (found) {
                resultDiv.innerHTML = '<span style="color:green;">Found: ' + found.name + ' (' + found.category + ') - Last issued: ' + found.allocatedRice + 'kg Rice</span>';
            } else {
                resultDiv.innerHTML = '<span style="color:red;">Not Found</span>';
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to reset all stock and beneficiary data?')) {
                localStorage.clear();
                alert('System reset completed. Stock will be restored to defaults on next load.');
                location.reload();
            }
        });
    }
});
