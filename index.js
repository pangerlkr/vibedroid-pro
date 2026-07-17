const { app, BrowserWindow, ipcMain, nativeImage, Menu, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

let mainWindow;
const AI_FEED_PATH      = path.join(__dirname, 'live_feed.png');
const PREFS_PATH        = path.join(app.getPath('userData'), 'vibedroid-prefs.json');
const HISTORY_LOG_PATH  = path.join(app.getPath('userData'), 'url-history.log');
const CAPTURE_INTERVAL_MS = 3000;
const MAX_URL_HISTORY     = 20;

// ── Persistent preferences ──────────────────────────────────────────────
function loadPrefs() {
    try {
        if (fs.existsSync(PREFS_PATH)) return JSON.parse(fs.readFileSync(PREFS_PATH, 'utf8'));
    } catch (_) {}
    return { lastUrl: 'http://localhost:5173', urlHistory: [], captureEnabled: true, alwaysOnTop: true };
}

function savePrefs(prefs) {
    try { fs.writeFileSync(PREFS_PATH, JSON.stringify(prefs, null, 2)); } catch (_) {}
}

// ── AI screen capture ────────────────────────────────────────────────
let captureTimer = null;

function startCapture() {
    if (captureTimer) return;
    captureTimer = setInterval(async () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        try {
            const img = await mainWindow.capturePage();
            fs.writeFileSync(AI_FEED_PATH, img.toPNG());
        } catch (_) {}
    }, CAPTURE_INTERVAL_MS);
}

function stopCapture() {
    if (captureTimer) { clearInterval(captureTimer); captureTimer = null; }
}

// ── URL history ──────────────────────────────────────────────────────
function appendUrlHistory(url) {
    try {
        const line = `${new Date().toISOString()} ${url}\n`;
        fs.appendFileSync(HISTORY_LOG_PATH, line);
    } catch (_) {}
}

// ── Main window ──────────────────────────────────────────────────────
function createWindow() {
    const prefs = loadPrefs();
    const args  = process.argv.slice(2);
    const startUrl = args[0] || prefs.lastUrl || 'http://localhost:5173';

    mainWindow = new BrowserWindow({
        width: 480,
        height: 940,
        frame: false,
        transparent: true,
        alwaysOnTop: prefs.alwaysOnTop !== false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
        },
    });

    mainWindow.loadFile('index.html');
    Menu.setApplicationMenu(null);

    // Start AI capture if enabled
    if (prefs.captureEnabled !== false) startCapture();

    // ── IPC: URL navigation + history ───────────────────────────────
    ipcMain.on('url-navigate', (_, url) => {
        const p = loadPrefs();
        p.lastUrl = url;
        p.urlHistory = [url, ...(p.urlHistory || []).filter(u => u !== url)].slice(0, MAX_URL_HISTORY);
        savePrefs(p);
        appendUrlHistory(url);
    });

    // ── IPC: Window controls ─────────────────────────────────────────
    ipcMain.on('set-always-on-top', (_, enabled) => {
        mainWindow.setAlwaysOnTop(enabled);
        const p = loadPrefs(); p.alwaysOnTop = enabled; savePrefs(p);
    });
    ipcMain.on('minimize-window', () => mainWindow.minimize());
    ipcMain.on('close-window',    () => mainWindow.close());

    // ── IPC: AI capture toggle ────────────────────────────────────────
    ipcMain.on('capture-toggle', (_, enabled) => {
        const p = loadPrefs(); p.captureEnabled = enabled; savePrefs(p);
        enabled ? startCapture() : stopCapture();
    });

    // ── IPC: Open AI feed in system viewer ────────────────────────────
    ipcMain.on('open-feed', () => {
        if (fs.existsSync(AI_FEED_PATH)) shell.openPath(AI_FEED_PATH);
    });

    mainWindow.on('closed', () => {
        stopCapture();
        ipcMain.removeAllListeners();
        mainWindow = null;
    });
}

// ── App lifecycle ──────────────────────────────────────────────────────
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
