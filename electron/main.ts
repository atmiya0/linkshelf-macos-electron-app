import { app, BrowserWindow, clipboard, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

// Hot reload with electron-reloader in development
try {
  if (process.env.VITE_DEV_SERVER_URL) {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: false, // Vite handles renderer HMR
    });
  }
} catch (err) {
  console.log('Error loading electron-reloader:', err);
}

// Initialize electron-store for local data persistence
const store = new Store();

// Desktop window dimensions: fixed width + clamped resizable height
const WINDOW_WIDTH = 380;
const DEFAULT_WINDOW_HEIGHT = 520;
const MIN_WINDOW_HEIGHT = 120;
const MAX_WINDOW_HEIGHT = 900;
const DEFAULT_ALWAYS_ON_TOP = true;
const PREFERENCES_KEY = 'linkshelf-preferences';

type StoredPreferences = {
  windowHeight?: unknown;
  alwaysOnTop?: unknown;
};

function getStoredPreferences(): Record<string, unknown> {
  const preferences = store.get(PREFERENCES_KEY);
  if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
    return preferences as Record<string, unknown>;
  }
  return {};
}

function clampWindowHeight(height: number): number {
  if (!Number.isFinite(height)) {
    return DEFAULT_WINDOW_HEIGHT;
  }
  return Math.min(MAX_WINDOW_HEIGHT, Math.max(MIN_WINDOW_HEIGHT, Math.round(height)));
}

function sanitizeAlwaysOnTop(alwaysOnTop: unknown): boolean {
  return typeof alwaysOnTop === 'boolean' ? alwaysOnTop : DEFAULT_ALWAYS_ON_TOP;
}

function savePreferences(preferences: Partial<StoredPreferences>): void {
  const existingPreferences = getStoredPreferences() as StoredPreferences;
  store.set(PREFERENCES_KEY, {
    ...existingPreferences,
    ...preferences,
  });
}

function getInitialWindowHeight(): number {
  const preferences = getStoredPreferences() as StoredPreferences;
  return clampWindowHeight(Number(preferences?.windowHeight));
}

function getInitialAlwaysOnTop(): boolean {
  const preferences = getStoredPreferences() as StoredPreferences;
  return sanitizeAlwaysOnTop(preferences?.alwaysOnTop);
}

// Determine the renderer URL based on environment.
// If a dev server URL is provided, use that. Otherwise fall back to built files.
const distPath = path.join(__dirname, '../dist/index.html');
const devServerUrl = process.env.VITE_DEV_SERVER_URL;
const isDev = Boolean(devServerUrl);

let indexUrl: string;
if (isDev && devServerUrl) {
  indexUrl = devServerUrl;
} else if (fs.existsSync(distPath)) {
  indexUrl = `file://${distPath}`;
} else {
  indexUrl = 'http://localhost:3000';
  console.warn('dist/index.html not found; falling back to http://localhost:3000');
}

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  const initialHeight = getInitialWindowHeight();
  const initialAlwaysOnTop = getInitialAlwaysOnTop();
  const window = new BrowserWindow({
    useContentSize: true,
    width: WINDOW_WIDTH,
    height: initialHeight,
    minWidth: WINDOW_WIDTH,
    maxWidth: WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
    maxHeight: MAX_WINDOW_HEIGHT,
    title: 'Linkshelf',
    resizable: true,
    fullscreenable: false,
    maximizable: false,
    alwaysOnTop: initialAlwaysOnTop,
    show: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.on('focus', () => {
    window.setWindowButtonVisibility(true);
    window.webContents.send('window-focus-change', true);
  });

  window.on('blur', () => {
    window.setWindowButtonVisibility(false);
    window.webContents.send('window-focus-change', false);
  });

  if (initialAlwaysOnTop) {
    window.setAlwaysOnTop(true, 'floating');
  } else {
    window.setAlwaysOnTop(false);
  }
  window.center();
  window.once('ready-to-show', () => {
    window.show();
    window.focus();
  });

  window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load: ${errorCode} - ${errorDescription}`);
    console.error(`URL: ${validatedURL}`);
    if (isDev) {
      console.error('Make sure Vite dev server is running: npm run start:react');
    }
  });

  window.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
  });

  if (isDev && process.env.OPEN_DEVTOOLS === '1') {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  let resizeDebounce: NodeJS.Timeout | null = null;
  window.on('resize', () => {
    if (resizeDebounce) {
      clearTimeout(resizeDebounce);
    }
    resizeDebounce = setTimeout(() => {
      const nextHeight = clampWindowHeight(window.getContentBounds().height);
      savePreferences({ windowHeight: nextHeight });
    }, 80);
  });

  void window.loadURL(indexUrl);
  return window;
}

/**
 * IPC handlers for communication between renderer and main process
 */

// Get all data from store
ipcMain.handle('store:get', (_event, key: string) => {
  return store.get(key);
});

// Set data in store
ipcMain.handle('store:set', (_event, key: string, value: unknown) => {
  store.set(key, value);
  return true;
});

// Copy text to clipboard
ipcMain.handle('clipboard:write', (_event, text: string) => {
  clipboard.writeText(text);
  return true;
});

// Quit the app
ipcMain.handle('app:quit', () => {
  app.quit();
});

// Get current content height of the main window
ipcMain.handle('window:get-height', () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return DEFAULT_WINDOW_HEIGHT;
  }
  return clampWindowHeight(mainWindow.getContentBounds().height);
});

// Resize the main window height while keeping fixed width and bounds
ipcMain.handle('window:set-height', (_event, height: number) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return DEFAULT_WINDOW_HEIGHT;
  }

  const nextHeight = clampWindowHeight(Number(height));
  mainWindow.setContentSize(WINDOW_WIDTH, nextHeight);
  return clampWindowHeight(mainWindow.getContentBounds().height);
});

// Get current always-on-top value for the main window
ipcMain.handle('window:get-always-on-top', () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return getInitialAlwaysOnTop();
  }
  return mainWindow.isAlwaysOnTop();
});

// Update always-on-top for the main window and persist preference
ipcMain.handle('window:set-always-on-top', (_event, value: boolean) => {
  const nextValue = Boolean(value);

  if (mainWindow && !mainWindow.isDestroyed()) {
    if (nextValue) {
      mainWindow.setAlwaysOnTop(true, 'floating');
    } else {
      mainWindow.setAlwaysOnTop(false);
    }
  }

  savePreferences({ alwaysOnTop: nextValue });
  return nextValue;
});

// Center the main window on the current display
ipcMain.handle('window:center', () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return false;
  }

  mainWindow.center();
  mainWindow.focus();
  return true;
});

/**
 * App lifecycle
 */

app.whenReady().then(() => {
  console.log('Linkshelf desktop app is ready');
  console.log(`Loading from: ${indexUrl}`);
  mainWindow = createMainWindow();
});

// Keep macOS-standard behavior for desktop apps.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Reopen when clicking dock icon and no window is open.
app.on('activate', () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
});

// Handle app quit
app.on('before-quit', () => {
  // Cleanup if needed
});
