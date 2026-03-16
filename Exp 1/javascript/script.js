document.addEventListener('DOMContentLoaded', function () {

    // TASK 1 — Display Ration Shop Information (DOM + Data Types)

    var shopCard = document.querySelector('.shop-card');
    if (shopCard) {
        var shopDetails = { owner: "Avaneesh B" };
        var rows = shopCard.querySelectorAll('.detail-row');
        if (rows.length >= 2) {
            var ownerSpan = rows[1].querySelector('span');
            if (ownerSpan) {
                ownerSpan.textContent = shopDetails.owner + " (Verified)";
                ownerSpan.style.color = "#2ecc71";
                ownerSpan.style.fontWeight = "bold";
            }
        }
    }

    // TASK 7 — Update Stock After Distribution (Functions + Operators)

    if (!localStorage.getItem('stock')) {
        var initialStock = { Rice: 450, Wheat: 300, Oil: 120, Salt: 85 };
        localStorage.setItem('stock', JSON.stringify(initialStock));
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

    // TASK 7 continued + TASK 8 — Stock Display & Low Stock Alert

    function displayStock() {
        var stock = getStock();
        var stockItems = document.querySelectorAll('.stock-item');

        stockItems.forEach(function (item) {
            var text = item.innerText;
            var key = '';
            if (text.includes('Rice')) key = 'Rice';
            else if (text.includes('Wheat')) key = 'Wheat';
            else if (text.includes('Oil')) key = 'Oil';
            else if (text.includes('Salt')) key = 'Salt';

            if (key && stock[key] !== undefined) {
                var valSpan = item.querySelector('.stock-value');
                if (valSpan) valSpan.textContent = stock[key];
            }
        });

        // TASK 8 — Low Stock Alert
        var lowItems = [];
        for (var key in stock) {
            if (stock[key] < 20) {
                lowItems.push(key);
            }
        }

        var alertContainer = document.getElementById('stock-alert-container');
        if (alertContainer) {
            if (lowItems.length > 0) {
                alertContainer.innerHTML = '<div style="background:#ffcccc; color:#cc0000; padding:10px; border:1px solid red; margin-top:20px; border-radius:8px;"><strong>⚠️ Low Stock Alert:</strong> The following items are below 20kg: ' + lowItems.join(', ') + '</div>';
            } else {
                alertContainer.innerHTML = '';
            }
        }
    }

    displayStock();

    // TASK 3 — Validate Ration Card Number (Operators + Control Flow)

    function validateRationCard(cardNumber) {
        if (cardNumber.length !== 10) {
            return false;
        }
        if (isNaN(cardNumber)) {
            return false;
        }
        return true;
    }

    // TASK 4 — Calculate Monthly Ration Eligibility (Operators)

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

    // TASK 5 — Store Multiple Beneficiaries (Arrays)

    function getBeneficiaries() {
        return JSON.parse(localStorage.getItem('beneficiaries')) || [];
    }

    function addBeneficiary(beneficiary) {
        var beneficiaries = getBeneficiaries();
        beneficiaries.push(beneficiary);
        localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
    }

    // TASK 9 — Generate Distribution Report (Arrays + DOM)

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
        if (caption) caption.textContent = 'Daily Ration Distribution Log - ' + new Date().toLocaleDateString();
    }

    generateReport();

    // TASK 2 — Add Beneficiary Details Form (DOM + Data Types)

    var form = document.getElementById('beneficiaryForm');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var fullName = document.querySelector('input[name="fullName"]').value;
            var rationCard = document.querySelector('input[name="rationNumber"]').value;
            var familySize = parseInt(document.querySelector('input[name="familySize"]').value);
            var category = document.querySelector('select[name="category"]').value;
            var address = document.querySelector('textarea[name="address"]').value;

            var errorDiv = document.getElementById('ration-error');

            // Task 3: Validate
            if (!validateRationCard(rationCard)) {
                errorDiv.innerHTML = '❌ Invalid! Ration Card Number must be exactly 10 digits.';
                return;
            }
            errorDiv.innerHTML = '';

            // Task 4: Calculate
            var allocatedRice = calculateEligibility(category, familySize);

            // Task 7: Stock Check
            var currentStock = getStock();
            if (currentStock['Rice'] < allocatedRice) {
                alert('Insufficient Rice stock! Available: ' + currentStock['Rice'] + ' kg');
                return;
            }
            updateStock('Rice', allocatedRice);

            // Task 5: Store
            var beneficiary = {
                name: fullName,
                cardNo: rationCard,
                members: familySize,
                category: category,
                address: address,
                allocatedRice: allocatedRice,
                date: new Date().toLocaleDateString()
            };
            addBeneficiary(beneficiary);

            alert('Beneficiary Registered!\nAllocated Rice: ' + allocatedRice + ' kg');

            displayStock();
            generateReport();
            form.reset();
        });
    }

    // TASK 6 — Search Beneficiary by Ration Card (Arrays + Functions)

    var searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            var cardNo = document.getElementById('searchCardNo').value;
            var resultDiv = document.getElementById('searchResult');
            var beneficiaries = getBeneficiaries();

            if (cardNo === '') {
                resultDiv.innerHTML = '<span style="color:orange;">Please enter a Ration Card Number.</span>';
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

    // TASK 10 — Clear Form and Reset System (Functions + DOM)

    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to reset all stock and beneficiary data?')) {
                localStorage.clear();
                alert('System Reset! Stock restored to defaults on next load.');
                location.reload();
            }
        });
    }

});
