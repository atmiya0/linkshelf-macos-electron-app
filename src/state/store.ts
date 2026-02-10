import { AppData, AppPreferences, Mode, LinkshelfItem, ThemeMode, DEFAULT_MODES } from '../types';

/**
 * Interface for communicating with Electron's main process.
 * This uses Electron's IPC (Inter-Process Communication) to persist data
 * and interact with system features like the clipboard.
 */
interface ElectronAPI {
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<boolean>;
  };
  clipboard: {
    write: (text: string) => Promise<boolean>;
  };
  app: {
    quit: () => Promise<void>;
  };
  window: {
    getHeight: () => Promise<number>;
    setHeight: (height: number) => Promise<number>;
    getAlwaysOnTop: () => Promise<boolean>;
    setAlwaysOnTop: (value: boolean) => Promise<boolean>;
    center: () => Promise<void>;
  };
}

interface IpcRendererLike {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

interface ElectronWindow extends Window {
  require?: (module: string) => {
    ipcRenderer?: IpcRendererLike;
  };
}

function resolveIpcRenderer(): IpcRendererLike | null {
  const electronWindow = window as ElectronWindow;
  if (typeof electronWindow.require !== 'function') {
    return null;
  }

  try {
    const electronModule = electronWindow.require('electron');
    return electronModule.ipcRenderer ?? null;
  } catch {
    return null;
  }
}

async function writeClipboardInBrowser(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to the legacy selection API below.
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);

  return copied;
}

const ipcRenderer = resolveIpcRenderer();

const api: ElectronAPI = {
  store: {
    get: async (key: string): Promise<unknown> => {
      if (ipcRenderer) {
        return ipcRenderer.invoke('store:get', key);
      }

      const storedValue = localStorage.getItem(key);
      if (!storedValue) {
        return null;
      }

      try {
        return JSON.parse(storedValue) as unknown;
      } catch {
        return null;
      }
    },
    set: async (key: string, value: unknown): Promise<boolean> => {
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('store:set', key, value);
        return result as boolean;
      }

      localStorage.setItem(key, JSON.stringify(value));
      return true;
    },
  },
  clipboard: {
    write: async (text: string): Promise<boolean> => {
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('clipboard:write', text);
        return result as boolean;
      }

      return writeClipboardInBrowser(text);
    },
  },
  app: {
    quit: async (): Promise<void> => {
      if (ipcRenderer) {
        await ipcRenderer.invoke('app:quit');
      }
    },
  },
  window: {
    getHeight: async (): Promise<number> => {
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('window:get-height');
        return clampWindowHeight(Number(result));
      }
      return clampWindowHeight(window.innerHeight);
    },
    setHeight: async (height: number): Promise<number> => {
      const nextHeight = clampWindowHeight(height);
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('window:set-height', nextHeight);
        return clampWindowHeight(Number(result));
      }
      return nextHeight;
    },
    getAlwaysOnTop: async (): Promise<boolean> => {
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('window:get-always-on-top');
        return Boolean(result);
      }
      return DEFAULT_ALWAYS_ON_TOP;
    },
    setAlwaysOnTop: async (value: boolean): Promise<boolean> => {
      const nextValue = Boolean(value);
      if (ipcRenderer) {
        const result = await ipcRenderer.invoke('window:set-always-on-top', nextValue);
        return Boolean(result);
      }
      return nextValue;
    },
    center: async (): Promise<void> => {
      if (ipcRenderer) {
        await ipcRenderer.invoke('window:center');
      }
    },
  },
};

const STORE_KEY = 'linkshelf-data';
const PREFERENCES_KEY = 'linkshelf-preferences';
export const DEFAULT_THEME: ThemeMode = 'dark';
export const DEFAULT_ALWAYS_ON_TOP = true;
export const DEFAULT_WINDOW_HEIGHT = 520;
export const MIN_WINDOW_HEIGHT = 420;
export const MAX_WINDOW_HEIGHT = 900;

function clampWindowHeight(height: number): number {
  if (!Number.isFinite(height)) {
    return DEFAULT_WINDOW_HEIGHT;
  }
  return Math.min(MAX_WINDOW_HEIGHT, Math.max(MIN_WINDOW_HEIGHT, Math.round(height)));
}

function sanitizeTheme(theme: unknown): ThemeMode {
  return theme === 'light' || theme === 'dark' ? theme : DEFAULT_THEME;
}

function sanitizeAlwaysOnTop(alwaysOnTop: unknown): boolean {
  return typeof alwaysOnTop === 'boolean' ? alwaysOnTop : DEFAULT_ALWAYS_ON_TOP;
}

function cloneDefaultData(): AppData {
  const now = Date.now();
  const defaultModes: Mode[] = DEFAULT_MODES.map(mode => ({
    ...mode,
    items: mode.items.map(item => ({
      ...item,
      createdAt: now,
      updatedAt: now,
    })),
  }));

  return {
    currentModeId: defaultModes[0].id,
    modes: defaultModes,
  };
}

function getDefaultPreferences(): AppPreferences {
  return {
    theme: DEFAULT_THEME,
    windowHeight: DEFAULT_WINDOW_HEIGHT,
    alwaysOnTop: DEFAULT_ALWAYS_ON_TOP,
  };
}

async function getStoredPreferences(): Promise<Partial<AppPreferences> | null> {
  return api.store.get(PREFERENCES_KEY) as Partial<AppPreferences> | null;
}

function sanitizePreferences(preferences: Partial<AppPreferences> | null): AppPreferences {
  return {
    theme: sanitizeTheme(preferences?.theme),
    windowHeight: clampWindowHeight(preferences?.windowHeight ?? DEFAULT_WINDOW_HEIGHT),
    alwaysOnTop: sanitizeAlwaysOnTop(preferences?.alwaysOnTop),
  };
}

async function savePreferences(preferences: Partial<AppPreferences>): Promise<AppPreferences> {
  const existingPreferences = sanitizePreferences(await getStoredPreferences());
  const nextPreferences = sanitizePreferences({
    ...existingPreferences,
    ...preferences,
  });
  await api.store.set(PREFERENCES_KEY, nextPreferences);
  return nextPreferences;
}

function sanitizeAppData(data: AppData | null): AppData {
  if (!data || !Array.isArray(data.modes) || data.modes.length === 0) {
    return cloneDefaultData();
  }

  const hasCurrentMode = data.modes.some(mode => mode.id === data.currentModeId);
  if (!hasCurrentMode) {
    return {
      ...data,
      currentModeId: data.modes[0].id,
    };
  }

  return data;
}

/**
 * Initialize app data with default modes if not exists
 */
export async function initializeStore(): Promise<AppData> {
  const existingData = await api.store.get(STORE_KEY) as AppData | null;
  const sanitizedData = sanitizeAppData(existingData);

  if (
    !existingData
    || existingData.currentModeId !== sanitizedData.currentModeId
    || existingData.modes.length !== sanitizedData.modes.length
  ) {
    await api.store.set(STORE_KEY, sanitizedData);
  }

  return sanitizedData;
}

/**
 * Get all app data
 */
export async function getAppData(): Promise<AppData> {
  const data = await api.store.get(STORE_KEY) as AppData | null;
  if (!data) {
    return initializeStore();
  }

  const sanitizedData = sanitizeAppData(data);
  if (
    data.currentModeId !== sanitizedData.currentModeId
    || data.modes.length !== sanitizedData.modes.length
  ) {
    await saveAppData(sanitizedData);
  }

  return sanitizedData;
}

/**
 * Save all app data
 */
export async function saveAppData(data: AppData): Promise<void> {
  await api.store.set(STORE_KEY, data);
}

/**
 * Get persisted user theme preference.
 */
export async function getThemePreference(): Promise<ThemeMode> {
  const preferences = sanitizePreferences(await getStoredPreferences());
  return preferences.theme;
}

/**
 * Persist user theme preference.
 */
export async function setThemePreference(theme: ThemeMode): Promise<void> {
  await savePreferences({ theme: sanitizeTheme(theme) });
}

/**
 * Get persisted window height preference.
 */
export async function getWindowHeightPreference(): Promise<number> {
  const preferences = sanitizePreferences(await getStoredPreferences());
  return preferences.windowHeight ?? DEFAULT_WINDOW_HEIGHT;
}

/**
 * Persist window height preference.
 */
export async function setWindowHeightPreference(height: number): Promise<void> {
  await savePreferences({ windowHeight: clampWindowHeight(height) });
}

/**
 * Get current window height from Electron.
 */
export async function getWindowHeight(): Promise<number> {
  return api.window.getHeight();
}

/**
 * Resize window height within min/max bounds.
 */
export async function setWindowHeight(height: number): Promise<number> {
  return api.window.setHeight(height);
}

/**
 * Get persisted always-on-top preference.
 */
export async function getAlwaysOnTopPreference(): Promise<boolean> {
  const preferences = sanitizePreferences(await getStoredPreferences());
  return preferences.alwaysOnTop ?? DEFAULT_ALWAYS_ON_TOP;
}

/**
 * Persist always-on-top preference.
 */
export async function setAlwaysOnTopPreference(alwaysOnTop: boolean): Promise<void> {
  await savePreferences({ alwaysOnTop: sanitizeAlwaysOnTop(alwaysOnTop) });
}

/**
 * Get current always-on-top state from Electron.
 */
export async function getAlwaysOnTop(): Promise<boolean> {
  return api.window.getAlwaysOnTop();
}

/**
 * Toggle always-on-top state.
 */
export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<boolean> {
  return api.window.setAlwaysOnTop(alwaysOnTop);
}

/**
 * Center the desktop window on screen.
 */
export async function centerWindow(): Promise<void> {
  await api.window.center();
}

/**
 * Get current mode
 */
export async function getCurrentMode(data: AppData): Promise<Mode | undefined> {
  return data.modes.find(mode => mode.id === data.currentModeId);
}

/**
 * Switch to a different mode
 */
export async function switchMode(data: AppData, modeId: string): Promise<AppData> {
  const newData = { ...data, currentModeId: modeId };
  await saveAppData(newData);
  return newData;
}

/**
 * Create a new mode and switch to it.
 */
export async function createMode(data: AppData, modeName: string): Promise<AppData> {
  const trimmedModeName = modeName.trim();
  if (!trimmedModeName) {
    throw new Error('Mode name is required');
  }

  const modeAlreadyExists = data.modes.some(
    mode => mode.name.toLowerCase() === trimmedModeName.toLowerCase(),
  );
  if (modeAlreadyExists) {
    throw new Error('A mode with this name already exists');
  }

  const newMode: Mode = {
    id: generateId(),
    name: trimmedModeName,
    items: [],
    sections: [],
  };

  const newData: AppData = {
    currentModeId: newMode.id,
    modes: [...data.modes, newMode],
  };

  await saveAppData(newData);
  return newData;
}

/**
 * Delete a mode and switch to another available mode.
 */
export async function deleteMode(data: AppData, modeId: string): Promise<AppData> {
  if (data.modes.length <= 1) {
    throw new Error('At least one mode is required');
  }

  const modeExists = data.modes.some(mode => mode.id === modeId);
  if (!modeExists) {
    throw new Error('Mode not found');
  }

  const newModes = data.modes.filter(mode => mode.id !== modeId);
  const nextModeId = data.currentModeId === modeId ? newModes[0].id : data.currentModeId;
  const newData: AppData = {
    currentModeId: nextModeId,
    modes: newModes,
  };

  await saveAppData(newData);
  return newData;
}

/**
 * Add a new item to the current mode
 */
export async function addItem(
  data: AppData,
  item: Omit<LinkshelfItem, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { order?: number }
): Promise<AppData> {
  const currentItems = data.modes.find(m => m.id === data.currentModeId)?.items || [];
  const maxOrder = currentItems.length > 0
    ? Math.max(...currentItems.map(i => i.order))
    : -1;

  const newItem: LinkshelfItem = {
    ...item,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    order: maxOrder + 1,
  };

  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      return {
        ...mode,
        items: [...mode.items, newItem],
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Update an existing item
 */
export async function updateItem(
  data: AppData,
  itemId: string,
  updates: Partial<Omit<LinkshelfItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<AppData> {
  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      return {
        ...mode,
        items: mode.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              ...updates,
              updatedAt: Date.now(),
            };
          }
          return item;
        }),
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Delete an item
 */
export async function deleteItem(data: AppData, itemId: string): Promise<AppData> {
  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      return {
        ...mode,
        items: mode.items.filter(item => item.id !== itemId),
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Add a new section to the current mode
 */
export async function addSection(data: AppData, name: string): Promise<AppData> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Section name is required');

  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      const sections = mode.sections || [];
      const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) : -1;
      const newSection = {
        id: generateId(),
        name: trimmedName,
        order: maxOrder + 1,
      };
      return {
        ...mode,
        sections: [...sections, newSection],
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Delete a section and unassign its items
 */
export async function deleteSection(data: AppData, sectionId: string): Promise<AppData> {
  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      return {
        ...mode,
        sections: (mode.sections || []).filter(s => s.id !== sectionId),
        items: mode.items.map(item =>
          item.sectionId === sectionId ? { ...item, sectionId: undefined } : item
        ),
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Update a section name
 */
export async function updateSection(data: AppData, sectionId: string, name: string): Promise<AppData> {
  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      return {
        ...mode,
        sections: (mode.sections || []).map(s =>
          s.id === sectionId ? { ...s, name } : s
        ),
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Reorder items globally or within a section
 */
export async function reorderItems(data: AppData, itemIds: string[]): Promise<AppData> {
  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      const itemsMap = new Map(mode.items.map(item => [item.id, item]));
      const newItems = itemIds.map((id, index) => {
        const item = itemsMap.get(id);
        if (!item) return null;
        return { ...item, order: index };
      }).filter((item): item is LinkshelfItem => item !== null);

      // Add back items that weren't in the reorder list (if any)
      const remainingItems = mode.items.filter(item => !itemIds.includes(item.id));

      return {
        ...mode,
        items: [...newItems, ...remainingItems],
      };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Reorder sections
 */
export async function reorderSections(data: AppData, sectionIds: string[]): Promise<AppData> {
  const newModes = data.modes.map(mode => {
    if (mode.id === data.currentModeId) {
      const sections = mode.sections || [];
      const sectionsMap = new Map(sections.map(s => [s.id, s]));
      const newSections = sectionIds.map((id, index) => {
        const section = sectionsMap.get(id);
        if (!section) return null;
        return { ...section, order: index };
      }).filter((section): section is NonNullable<typeof section> => section !== null);

      return { ...mode, sections: newSections };
    }
    return mode;
  });

  const newData = { ...data, modes: newModes };
  await saveAppData(newData);
  return newData;
}

/**
 * Copy text to clipboard using Electron's clipboard API
 */
export async function copyToClipboard(text: string): Promise<void> {
  await api.clipboard.write(text);
}

/**
 * Quit the desktop application.
 */
export async function quitApp(): Promise<void> {
  await api.app.quit();
}

/**
 * Reset app data and preferences back to default state.
 */
export async function resetAppToDefaults(): Promise<AppData> {
  const defaultData = cloneDefaultData();
  const defaultPreferences = getDefaultPreferences();

  await saveAppData(defaultData);
  await api.store.set(PREFERENCES_KEY, defaultPreferences);

  try {
    await api.window.setHeight(defaultPreferences.windowHeight ?? DEFAULT_WINDOW_HEIGHT);
    await api.window.setAlwaysOnTop(defaultPreferences.alwaysOnTop ?? DEFAULT_ALWAYS_ON_TOP);
    await api.window.center();
  } catch {
    // Ignore if running in browser preview mode without Electron window controls.
  }

  return defaultData;
}

/**
 * Generate a unique ID for items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Future enhancement: Add mode management functions
 * - createMode(name: string): Promise<AppData>
 * - deleteMode(modeId: string): Promise<AppData>
 * - renameMode(modeId: string, newName: string): Promise<AppData>
 */

/**
 * Future enhancement: Add search functionality
 * - searchItems(query: string): LinkshelfItem[]
 * This would search across all items in the current mode
 */

/**
 * Future enhancement: Add keyboard shortcuts
 * - registerGlobalShortcut(shortcut: string, callback: () => void)
 * This would allow quick access to the app via keyboard
 */
