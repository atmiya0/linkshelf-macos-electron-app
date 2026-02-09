import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Moon, Pin, PinOff, Plus, Power, RotateCcw, Settings2, Sun } from 'lucide-react';
import { LinkshelfItem, FormData, ThemeMode } from '../types';
import { useStore } from '../hooks/useStore';
import {
  DEFAULT_ALWAYS_ON_TOP,
  DEFAULT_THEME,
  DEFAULT_WINDOW_HEIGHT,
  getAlwaysOnTopPreference,
  getThemePreference,
  getWindowHeightPreference,
  MAX_WINDOW_HEIGHT,
  MIN_WINDOW_HEIGHT,
  centerWindow,
  setAlwaysOnTop,
  setAlwaysOnTopPreference,
  setThemePreference,
  setWindowHeight,
  setWindowHeightPreference,
} from '../state/store';
import { ModeSelector } from './ModeSelector';
import { ItemList } from './ItemList';
import { ItemForm } from './ItemForm';

const clampHeight = (height: number): number => (
  Math.min(MAX_WINDOW_HEIGHT, Math.max(MIN_WINDOW_HEIGHT, Math.round(height)))
);

/**
 * Main desktop window component.
 * Contains mode selector, item list, and add button.
 * Manages modal state for add/edit forms.
 */
export const MenuBarWindow: React.FC = () => {
  const {
    loading,
    error,
    currentMode,
    modes,
    switchMode,
    addMode,
    removeMode,
    addItem,
    updateItem,
    deleteItem,
    copyToClipboard,
    quitApp,
    resetToDefaults,
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LinkshelfItem | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [windowHeightValue, setWindowHeightValue] = useState<number>(MIN_WINDOW_HEIGHT);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState<boolean>(DEFAULT_ALWAYS_ON_TOP);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await getThemePreference();
        setTheme(savedTheme);
      } catch {
        setTheme('dark');
      }

      try {
        const preferredHeight = await getWindowHeightPreference();
        const appliedHeight = await setWindowHeight(preferredHeight);
        await setWindowHeightPreference(appliedHeight);
        setWindowHeightValue(appliedHeight);
      } catch {
        // Fallback to the current window height when IPC is unavailable.
        setWindowHeightValue(clampHeight(window.innerHeight));
      }

      try {
        const savedAlwaysOnTop = await getAlwaysOnTopPreference();
        const appliedAlwaysOnTop = await setAlwaysOnTop(savedAlwaysOnTop);
        await setAlwaysOnTopPreference(appliedAlwaysOnTop);
        setAlwaysOnTopEnabled(appliedAlwaysOnTop);
      } catch {
        setAlwaysOnTopEnabled(DEFAULT_ALWAYS_ON_TOP);
      }
    };

    void loadPreferences();
  }, []);

  useEffect(() => {
    const syncHeight = () => {
      setWindowHeightValue(clampHeight(window.innerHeight));
    };

    window.addEventListener('resize', syncHeight);
    return () => {
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

  useEffect(() => {
    if (!showSettings) {
      setConfirmReset(false);
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSettings]);

  const handleCopy = async (value: string) => {
    await copyToClipboard(value);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: LinkshelfItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSaveItem = async (formData: FormData) => {
    if (editingItem) {
      await updateItem(editingItem.id, formData);
    } else {
      await addItem(formData);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleThemeChange = async (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    try {
      await setThemePreference(nextTheme);
    } catch (themeError) {
      console.error('Failed to save theme preference:', themeError);
    }
  };

  const handleWindowHeightChange = async (nextHeight: number) => {
    const clampedHeight = clampHeight(nextHeight);
    setWindowHeightValue(clampedHeight);

    try {
      const appliedHeight = await setWindowHeight(clampedHeight);
      setWindowHeightValue(appliedHeight);
      await setWindowHeightPreference(appliedHeight);
    } catch (heightError) {
      console.error('Failed to resize window:', heightError);
    }
  };

  const handleAlwaysOnTopToggle = async () => {
    const nextValue = !alwaysOnTopEnabled;
    setAlwaysOnTopEnabled(nextValue);

    try {
      const appliedValue = await setAlwaysOnTop(nextValue);
      setAlwaysOnTopEnabled(appliedValue);
      await setAlwaysOnTopPreference(appliedValue);
    } catch (pinError) {
      console.error('Failed to update always-on-top:', pinError);
      setAlwaysOnTopEnabled(!nextValue);
    }
  };

  const handleCenterWindow = async () => {
    try {
      await centerWindow();
    } catch (centerError) {
      console.error('Failed to center window:', centerError);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    const didReset = await resetToDefaults();
    if (!didReset) {
      return;
    }

    setTheme(DEFAULT_THEME);
    setWindowHeightValue(DEFAULT_WINDOW_HEIGHT);
    setAlwaysOnTopEnabled(DEFAULT_ALWAYS_ON_TOP);
    setConfirmReset(false);
    setShowSettings(false);
  };

  const handleQuit = async () => {
    setShowSettings(false);
    await quitApp();
  };

  if (loading) {
    return (
      <div className="window" data-theme={theme} role="region" aria-label="Linkshelf">
        <div className="loading" role="status" aria-live="polite">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window" data-theme={theme} role="region" aria-label="Linkshelf">
        <div className="error" role="alert">Error: {error}</div>
      </div>
    );
  }

  if (!currentMode) {
    return (
      <div className="window" data-theme={theme} role="region" aria-label="Linkshelf">
        <div className="error" role="alert">No mode selected</div>
      </div>
    );
  }

  const itemCount = currentMode.items.length;
  const itemCountLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;

  return (
    <div className="window" data-theme={theme} role="region" aria-label="Linkshelf">
      <div className="window-header">
        <div className="header-top-row">
          <div className="app-title">
            <span>Linkshelf</span>
          </div>
          <div className="header-actions">
            <span className="header-badge">{itemCountLabel}</span>
            <div className="settings-wrapper" ref={settingsRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowSettings(prev => !prev)}
                aria-label="Open settings"
                aria-haspopup="dialog"
                aria-expanded={showSettings}
                aria-controls="settings-popover"
                title="Settings"
              >
                <Settings2 size={14} strokeWidth={2.25} />
              </button>
              {showSettings && (
                <div
                  id="settings-popover"
                  className="settings-popover"
                  role="dialog"
                  aria-label="Settings"
                >
                  <div className="settings-label">Appearance</div>
                  <div className="settings-inline-controls" role="radiogroup" aria-label="Theme">
                    <button
                      type="button"
                      className={`settings-control settings-control-inline ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => void handleThemeChange('light')}
                      role="radio"
                      aria-checked={theme === 'light'}
                    >
                      <Sun size={14} strokeWidth={2.25} />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      className={`settings-control settings-control-inline ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => void handleThemeChange('dark')}
                      role="radio"
                      aria-checked={theme === 'dark'}
                    >
                      <Moon size={14} strokeWidth={2.25} />
                      <span>Dark</span>
                    </button>
                  </div>

                  <div className="settings-divider" />

                  <div className="settings-row">
                    <div className="settings-label">Window</div>
                    <span className="settings-value">{windowHeightValue}px</span>
                  </div>
                  <button
                    type="button"
                    className={`settings-control ${alwaysOnTopEnabled ? 'active' : ''}`}
                    onClick={() => void handleAlwaysOnTopToggle()}
                  >
                    {alwaysOnTopEnabled ? <Pin size={14} strokeWidth={2.25} /> : <PinOff size={14} strokeWidth={2.25} />}
                    <span>{alwaysOnTopEnabled ? 'Always On Top: On' : 'Always On Top: Off'}</span>
                  </button>
                  <label className="settings-range-label" htmlFor="window-height-range">
                    Height
                  </label>
                  <input
                    id="window-height-range"
                    type="range"
                    className="height-range"
                    min={MIN_WINDOW_HEIGHT}
                    max={MAX_WINDOW_HEIGHT}
                    value={windowHeightValue}
                    onChange={(event) => void handleWindowHeightChange(Number(event.target.value))}
                    aria-label="Window height"
                  />
                  <div className="height-meta">
                    <span>{MIN_WINDOW_HEIGHT}px</span>
                    <span>{MAX_WINDOW_HEIGHT}px</span>
                  </div>
                  <button
                    type="button"
                    className="settings-control"
                    onClick={() => void handleCenterWindow()}
                  >
                    <Crosshair size={14} strokeWidth={2.25} />
                    <span>Center Window</span>
                  </button>

                  <div className="settings-divider" />

                  <div className="settings-label">Data</div>
                  <p className="settings-hint">
                    Reset modes, links, and preferences.
                  </p>
                  <button
                    type="button"
                    className={`settings-control settings-control-danger ${confirmReset ? 'confirm' : ''}`}
                    onClick={() => void handleResetDefaults()}
                  >
                    <RotateCcw size={14} strokeWidth={2.25} />
                    <span>{confirmReset ? 'Confirm Reset' : 'Reset to Defaults'}</span>
                  </button>

                  <div className="settings-divider" />
                  <button
                    type="button"
                    className="settings-control settings-control-danger"
                    onClick={() => void handleQuit()}
                  >
                    <Power size={14} strokeWidth={2.25} />
                    <span>Quit Linkshelf</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="header-subtitle">Compact shelf for links and snippets</p>
        <ModeSelector
          modes={modes}
          currentModeId={currentMode.id}
          onModeChange={switchMode}
          onModeAdd={addMode}
          onModeDelete={removeMode}
          canDeleteMode={modes.length > 1}
        />
      </div>

      <div className="window-content">
        <ItemList
          items={currentMode.items}
          onCopy={handleCopy}
          onEdit={handleEditItem}
          onDelete={deleteItem}
        />
      </div>

      <div className="window-footer">
        <button className="btn btn-primary btn-add" onClick={handleAddItem}>
          <Plus size={14} strokeWidth={2.25} />
          <span>Add Item</span>
        </button>
      </div>

      {showForm && (
        <ItemForm
          item={editingItem || undefined}
          onSave={handleSaveItem}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

/**
 * Future enhancements that could be added here:
 * 
 * 1. Search functionality:
 *    - Add a search input in the header
 *    - Filter items based on label or value
 *    - Keyboard shortcut to focus search (e.g., Cmd+F)
 * 
 * 2. Keyboard shortcuts:
 *    - Cmd+N for new item
 *    - Number keys 1-9 to quickly copy items
 *    - Arrow keys for navigation
 * 
 * 3. AI-assisted modes:
 *    - Integration with AI to suggest items based on context
 *    - Auto-categorization of pasted content
 *    - Smart suggestions for email templates
 * 
 * 4. Export/Import:
 *    - Export mode as JSON
 *    - Import items from JSON or CSV
 *    - Share modes with team members (local files only)
 * 
 * 5. Statistics:
 *    - Track most copied items
 *    - Show usage analytics
 *    - Time-based sorting options
 */
