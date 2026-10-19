// State Management
let currentAccount = localStorage.getItem('current_account') || 'main';
let accounts = JSON.parse(localStorage.getItem('accounts')) || [
    { id: 'main', name: 'Main Account', balance: 10000 }
];
let trades = JSON.parse(localStorage.getItem('trades')) || [];
let currentScreenshots = [];
let enteredPin = "";

// 1. App Initialization & Security Check
window.onload = function() {
    loadAccounts();
    loadTheme();
    checkPinSecurity();
    renderJournal();
};

function checkPinSecurity() {
    const pinEnabled = localStorage.getItem('pin_enabled') === 'true';
    if(pinEnabled) {
        document.getElementById('pin-overlay').classList.remove('hidden');
    }
}

// PIN Security Pad Logic
function pressPin(num) {
    if(enteredPin.length < 4) {
        enteredPin += num;
        updatePinDots();
    }
}

function clearPin() {
    enteredPin = "";
    updatePinDots();
}

function updatePinDots() {
    const dots = document.querySelectorAll('.pin-dots .dot');
    dots.forEach((dot, index) => {
        if(index < enteredPin.length) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function submitPin() {
    const savedPin = localStorage.getItem('user_pin');
    if(enteredPin === savedPin) {
        document.getElementById('pin-overlay').classList.add('hidden');
        clearPin();
    } else {
        alert("Incorrect PIN!");
        clearPin();
    }
}

function togglePinSecurity(enabled) {
    if(enabled) {
        document.getElementById('set-pin-section').classList.remove('hidden');
    } else {
        localStorage.setItem('pin_enabled', 'false');
        document.getElementById('set-pin-section').classList.add('hidden');
    }
}

function saveNewPin() {
    const newPin = document.getElementById('new-pin').value;
    if(newPin.length === 4) {
        localStorage.setItem('user_pin', newPin);
        localStorage.setItem('pin_enabled', 'true');
        alert("PIN saved successfully!");
        document.getElementById('set-pin-section').classList.add('hidden');
    } else {
        alert("Please enter a 4-digit PIN");
    }
}

// 2. Navigation & Themes
function switchTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(tabName + '-view').classList.add('active');
    event.currentTarget.classList.add('active');

    if(tabName === 'reports') renderReports();
}

function changeTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('app_theme', themeName);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('app_theme') || 'theme-oled';
    document.body.className = savedTheme;
    document.getElementById('theme-selector').value = savedTheme;
}

// 3. Multi-Account Management
function loadAccounts() {
    const dropdown = document.getElementById('account-dropdown');
    dropdown.innerHTML = accounts.map(acc => `<option value="${acc.id}" ${acc.id === currentAccount ? 'selected' : ''}>${acc.name}</option>`).join('');
    
    const activeAccObj = accounts.find(a => a.id === currentAccount) || accounts[0];
    document.getElementById('account-display-name').innerText = activeAccObj.name;
}

function switchAccount(accId) {
    currentAccount = accId;
    localStorage.setItem('current_account', accId);
    loadAccounts();
    renderJournal();
}

function openAddAccountModal() { document.getElementById('account-modal').classList.remove('hidden'); }
function closeAddAccountModal() { document.getElementById('account-modal').classList.add('hidden'); }

function saveAccount(e) {
    e.preventDefault();
    const name = document.getElementById('new-account-name').value;
    const balance = parseFloat(document.getElementById('new-account-balance').value);
    const newId = 'acc_' + Date.now();

    accounts.push({ id: newId, name, balance });
    localStorage.setItem('accounts', JSON.stringify(accounts));
    closeAddAccountModal();
    switchAccount(newId);
}

// 4. Trade Entry & Screenshot Uploads
function openAddTradeModal() { 
    document.getElementById('trade-date').valueAsDate = new Date();
    document.getElementById('trade-modal').classList.remove('hidden'); 
}
function closeAddTradeModal() { 
    document.getElementById('trade-modal').classList.add('hidden'); 
    currentScreenshots = [];
    document.getElementById('screenshot-preview-container').innerHTML = '';
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files).slice(0, 5); // Max 5 screenshots
    currentScreenshots = [];
    const container = document.getElementById('screenshot-preview-container');
    container.innerHTML = '';

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentScreenshots.push(event.target.result);
            const img = document.createElement('img');
            img.src = event.target.result;
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function saveTrade(e) {
    e.preventDefault();
    const pair = document.getElementById('trade-pair').value.toUpperCase();
    const type = document.getElementById('trade-type').value;
    const pnl = parseFloat(document.getElementById('trade-pnl').value);
    const entryPrice = document.getElementById('trade-entry').value;
    const exitPrice = document.getElementById('trade-exit').value;
    const stopLoss = document.getElementById('trade-sl').value;
    const takeProfit = document.getElementById('trade-tp').value;
    const date = document.getElementById('trade-date').value;
    const notes = document.getElementById('trade-notes').value;

    const newTrade = {
        id: Date.now(),
        accountId: currentAccount,
        pair, type, pnl, entryPrice, exitPrice, stopLoss, takeProfit, date, notes,
        screenshots: currentScreenshots
    };

    trades.unshift(newTrade);
    localStorage.setItem('trades', JSON.stringify(trades));
    closeAddTradeModal();
    renderJournal();
}

// 5. Render Journal & Stats Calculation
function renderJournal() {
    const filteredTrades = trades.filter(t => t.accountId === currentAccount);
    const tradesList = document.getElementById('trades-list');
    
    let totalPnL = 0;
    let wins = 0;
    let totalWinVal = 0;
    let totalLossVal = 0;

    tradesList.innerHTML = filteredTrades.map(t => {
        totalPnL += t.pnl;
        if(t.pnl > 0) { wins++; totalWinVal += t.pnl; }
        else { totalLossVal += Math.abs(t.pnl); }

        const pnlClass = t.pnl >= 0 ? 'positive' : 'negative';
        const badgeClass = t.type === 'BUY' ? 'badge-buy' : 'badge-sell';

        return `
            <div class="trade-card liquid-glass">
                <div class="trade-info">
                    <h4>${t.pair} <span class="trade-badge ${badgeClass}">${t.type}</span></h4>
                    <small>${t.date}</small>
                </div>
                <div class="trade-pnl">
                    <span class="${pnlClass}">${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');

    // Update Summary
    const pnlElem = document.getElementById('total-pnl');
    pnlElem.innerText = `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`;
    pnlElem.className = totalPnL >= 0 ? 'positive' : 'negative';
    document.getElementById('total-trades').innerText = `${filteredTrades.length} trades`;

    // Stats Calculations
    const winrate = filteredTrades.length > 0 ? ((wins / filteredTrades.length) * 100).toFixed(0) : 0;
    const pf = totalLossVal > 0 ? (totalWinVal / totalLossVal).toFixed(2) : totalWinVal.toFixed(2);

    document.getElementById('stat-winrate').innerText = `${winrate}%`;
    document.getElementById('stat-pf').innerText = pf;
}

// 6. Shareable P&L Image Generation
function sharePnLCard() {
    const card = document.getElementById('summary-pnl-card');
    html2canvas(card).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `P&L_Summary_${currentAccount}.png`;
        link.href = image;
        link.click();
    });
}

// 7. Monthly Reports Calendar
function renderReports() {
    const filteredTrades = trades.filter(t => t.accountId === currentAccount);
    let totalProfit = 0;
    let totalLoss = 0;

    filteredTrades.forEach(t => {
        if(t.pnl > 0) totalProfit += t.pnl;
        else totalLoss += Math.abs(t.pnl);
    });

    document.getElementById('stat-total-profit').innerText = `+$${totalProfit.toFixed(2)}`;
    document.getElementById('stat-total-loss').innerText = `-$${totalLoss.toFixed(2)}`;
}

// 8. Offline JSON / CSV Backup & Restore
function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ accounts, trades }));
    downloadFile(dataStr, "tradetrack_backup.json");
}

function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,ID,Pair,Type,PnL,Date,Account\n";
    trades.forEach(t => {
        csvContent += `${t.id},${t.pair},${t.type},${t.pnl},${t.date},${t.accountId}\n`;
    });
    downloadFile(csvContent, "tradetrack_trades.csv");
}

function downloadFile(content, filename) {
    const a = document.createElement('a');
    a.href = content;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function importData(e) {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if(data.trades) trades = data.trades;
            if(data.accounts) accounts = data.accounts;
            localStorage.setItem('trades', JSON.stringify(trades));
            localStorage.setItem('accounts', JSON.stringify(accounts));
            alert("Backup restored successfully!");
            location.reload();
        } catch(err) {
            alert("Invalid backup file!");
        }
    };
    reader.readAsText(file);
}
