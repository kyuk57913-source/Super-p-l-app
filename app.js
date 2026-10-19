// Trading Pairs list in UPPERCASE as requested
const tradingPairs = [
    "NAS100", "XAUUSD", "USDJPY", "BTCUSDT", "AUDUSD", 
    "SOLUSDT", "S&P 500", "GBPUSD", "GBPJPY", "NZDUSD", 
    "USOILUSD", "XAGUSD", "EURUSD"
];

let trades = JSON.parse(localStorage.getItem('trades')) || [
    { id: 1, pair: "NAS100", type: "Buy", pnl: 148.90, date: "18 Oct 2026", account: "main" },
    { id: 2, pair: "XAUUSD", type: "Sell", pnl: -72.40, date: "16 Oct 2026", account: "main" }
];

function switchTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    if(tabName === 'journal') {
        document.getElementById('journal-view').classList.add('active');
        event.currentTarget.classList.add('active');
    } else if(tabName === 'reports') {
        document.getElementById('reports-view').classList.add('active');
        event.currentTarget.classList.add('active');
    } else if(tabName === 'data') {
        document.getElementById('data-view').classList.add('active');
        event.currentTarget.classList.add('active');
    }
}

function changeTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('app_theme', themeName);
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trades));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tradetrack_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData() {
    alert("Select a JSON backup file to restore trades.");
}

window.onload = function() {
    const savedTheme = localStorage.getItem('app_theme') || 'theme-oled';
    document.body.className = savedTheme;
    document.getElementById('theme-selector').value = savedTheme;
};
