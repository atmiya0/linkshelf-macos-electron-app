import React, { useEffect, useState } from 'react';
import {
  Plus,
  Power,
  RotateCcw,
  Settings2,
} from 'lucide-react';
import { LinkshelfItem, FormData } from '../types';
import { useStore } from '../hooks/useStore';
import {
  DEFAULT_ALWAYS_ON_TOP,
  getAlwaysOnTopPreference,
  setAlwaysOnTop,
  setAlwaysOnTopPreference,
} from '../state/store';
import { ModeSelector } from './ModeSelector';
import { ItemList } from './ItemList';
import { ItemForm } from './ItemForm';
import { Toast } from './Toast';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FocusAwareIpcRenderer {
  on: (channel: string, listener: (_event: unknown, focused: boolean) => void) => void;
  removeListener: (channel: string, listener: (_event: unknown, focused: boolean) => void) => void;
}

interface ElectronWindow extends Window {
  require?: (module: string) => {
    ipcRenderer?: FocusAwareIpcRenderer;
  };
}

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
    reorderItems,
    copyToClipboard,
    quitApp,
    resetToDefaults,
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LinkshelfItem | null>(null);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState<boolean>(DEFAULT_ALWAYS_ON_TOP);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<{ message: React.ReactNode } | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
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

    const electronWindow = window as ElectronWindow;
    const electronModule = electronWindow.require?.('electron');
    const ipcRenderer = electronModule?.ipcRenderer;
    if (!ipcRenderer) {
      return;
    }

    const handleFocusChange = (_: unknown, focused: boolean) => setIsFocused(focused);
    ipcRenderer.on('window-focus-change', handleFocusChange);

    return () => {
      ipcRenderer.removeListener('window-focus-change', handleFocusChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  const handleCopy = async (value: string, type: string, label: string) => {
    await copyToClipboard(value);
    const truncatedLabel = label.length > 24 ? `${label.substring(0, 24)}...` : label;
    setToast({
      message: (
        <span>
          Copied {type}: <strong>{truncatedLabel}</strong>
        </span>
      )
    });
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
    const normalizedFormData: FormData = {
      ...formData,
      sectionId: undefined,
    };

    try {
      if (editingItem) {
        await updateItem(editingItem.id, normalizedFormData);
      } else {
        await addItem(normalizedFormData);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
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

  const handleResetDefaults = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    const didReset = await resetToDefaults();
    if (!didReset) return;
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
      <div className="window" data-theme="dark" role="region" aria-label="Linkshelf">
        <div className="loading" role="status" aria-live="polite">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="window" data-theme="dark" role="region" aria-label="Linkshelf">
        <div className="error" role="alert">Error: {error}</div>
      </div>
    );
  }

  if (!currentMode) {
    return (
      <div className="window" data-theme="dark" role="region" aria-label="Linkshelf">
        <div className="error" role="alert">No mode selected</div>
      </div>
    );
  }

  return (
    <div
      className={`window ${isFocused ? 'is-focused' : 'not-focused'}`}
      data-theme="dark"
      role="region"
      aria-label="Linkshelf"
    >
      <div className="window-header flex flex-col gap-2.5">
        <div className="pr-1 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <ModeSelector
              modes={modes}
              currentModeId={currentMode.id}
              onModeChange={switchMode}
              onModeAdd={addMode}
              onModeDelete={removeMode}
              canDeleteMode={modes.length > 1}
            />
          </div>
          <div className="pt-[2px]">
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-muted hover:text-text transition-colors shrink-0"
                  title="Settings"
                >
                  <Settings2 size={14} strokeWidth={2.5} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-[100] w-64 p-0" align="end" sideOffset={10}>
                <div className="px-4 pb-3 pt-4">
                  <p className="text-sm font-semibold tracking-tight text-text">Settings</p>
                  <p className="text-xs text-text-soft">Window and app controls.</p>
                </div>

                <Separator className="bg-[var(--item-row-border)]" />

                <div className="space-y-3 px-4 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-soft">Window</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="always-on-top" className="text-xs font-medium text-text-muted cursor-pointer">Always On Top</Label>
                    <Switch id="always-on-top" checked={alwaysOnTopEnabled} onCheckedChange={() => void handleAlwaysOnTopToggle()} />
                  </div>
                </div>

                <Separator className="bg-[var(--item-row-border)]" />

                <div className="space-y-2 px-4 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-soft">System</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start h-8 rounded-lg bg-surface-subtle text-xs text-text-muted hover:bg-surface-hover hover:text-text',
                      confirmReset && 'bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger animate-pulse'
                    )}
                    onClick={() => void handleResetDefaults()}
                  >
                    <RotateCcw className="mr-2 h-3.5 w-3.5" strokeWidth={2.25} />
                    {confirmReset ? 'Confirm Reset' : 'Reset to Defaults'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 rounded-lg bg-surface-subtle text-xs text-danger hover:bg-danger-soft hover:text-danger"
                    onClick={() => void handleQuit()}
                  >
                    <Power className="mr-2 h-3.5 w-3.5" strokeWidth={2.25} />
                    Quit Linkshelf
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="window-content">
        <ItemList
          items={currentMode.items}
          onCopy={handleCopy}
          onEdit={handleEditItem}
          onDelete={deleteItem}
          onReorderItems={reorderItems}
          onAddItem={handleAddItem}
        />
      </div>

      <div className="window-footer p-2 pt-0">
        <Button
          className="w-full h-9 gap-2 bg-accent-app text-[color:var(--btn-primary-text)] hover:bg-accent-app-press rounded-xl font-bold text-sm shadow-lg shadow-accent-app/10 transition-all active:scale-95"
          onClick={handleAddItem}
        >
          <Plus size={16} strokeWidth={3} />
          Add Item
        </Button>
      </div>

      {showForm && (
        <ItemForm
          item={editingItem || undefined}
          onSave={handleSaveItem}
          onCancel={handleCancel}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
