import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Check,
  Plus,
  Power,
  RotateCcw,
  Settings2,
  Trash2,
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
import { getDisplayOrder } from '@/lib/items';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IpcListener = (_event: unknown, ...args: any[]) => void;

interface FocusAwareIpcRenderer {
  on: (channel: string, listener: IpcListener) => void;
  removeListener: (channel: string, listener: IpcListener) => void;
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
  const [confirmDeleteMode, setConfirmDeleteMode] = useState(false);
  const [toast, setToast] = useState<{ message: React.ReactNode } | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const handleToastClose = useCallback(() => setToast(null), []);

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

  // Leave reorder mode when switching modes
  useEffect(() => {
    setIsReordering(false);
  }, [currentMode?.id]);

  // ⌘N adds an item, ⌘, opens settings, Esc leaves reorder mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showForm || document.querySelector('[role="dialog"]')) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        setIsReordering(false);
        setEditingItem(null);
        setShowForm(true);
      } else if (mod && event.key === ',') {
        event.preventDefault();
        setShowSettings(true);
      } else if (event.key === 'Escape' && isReordering) {
        setIsReordering(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm, isReordering]);

  // Every copy (click or ⌃⌥ shortcut) goes through here so the row and toast both confirm it
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copiedTimer = useRef<number | null>(null);

  const handleCopy = async (item: LinkshelfItem) => {
    await copyToClipboard(item.value);
    setCopiedId(item.id);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopiedId(null), 1600);
    setToastKey((key) => key + 1);
    setToast({
      message: (
        <>
          Copied <strong>{item.label}</strong>
        </>
      )
    });
  };

  // Global ⌃⌥1–9 from the main process: copy the item at that position
  const copySlotRef = useRef<(slot: number) => void>(() => {});
  copySlotRef.current = (slot: number) => {
    const item = getDisplayOrder(currentMode?.items ?? [])[slot];
    if (item) void handleCopy(item);
  };

  useEffect(() => {
    const ipcRenderer = (window as ElectronWindow).require?.('electron')?.ipcRenderer;
    if (!ipcRenderer) return;
    const handleSlot: IpcListener = (_event, slot: number) => copySlotRef.current(slot);
    ipcRenderer.on('shortcut:copy-slot', handleSlot);
    return () => {
      ipcRenderer.removeListener('shortcut:copy-slot', handleSlot);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  const handleAddItem = () => {
    setIsReordering(false);
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

  const handleSettingsOpenChange = (open: boolean) => {
    setShowSettings(open);
    if (!open) {
      setConfirmReset(false);
      setConfirmDeleteMode(false);
    }
  };

  const handleDeleteMode = async () => {
    if (!currentMode || modes.length <= 1) return;
    if (!confirmDeleteMode) {
      setConfirmDeleteMode(true);
      return;
    }
    try {
      await removeMode(currentMode.id);
      setConfirmDeleteMode(false);
      setShowSettings(false);
    } catch (deleteError) {
      console.error('Failed to delete mode:', deleteError);
    }
  };

  const handleQuit = async () => {
    setShowSettings(false);
    await quitApp();
  };

  if (loading) {
    return (
      <div className="window" role="region" aria-label="Linkshelf">
        <div className="loading" role="status" aria-live="polite">Loading…</div>
      </div>
    );
  }

  if (error || !currentMode) {
    return (
      <div className="window" role="region" aria-label="Linkshelf">
        <div className="error flex-col gap-1 text-center" role="alert">
          <p className="font-semibold">Linkshelf couldn’t load your items</p>
          <p className="text-[12px] text-text-soft">{error ?? 'No mode is selected.'} Restart the app to try again.</p>
        </div>
      </div>
    );
  }

  const toolbarButton =
    'press-scale h-8 w-8 rounded-md text-text-muted hover:bg-surface-subtle hover:text-text focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-0 [&_svg]:size-4';
  const toolbarIconSwap =
    'absolute inset-0 transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity';
  const settingsRow =
    'h-8 w-full justify-start gap-2 rounded-md px-2 text-[13px] font-normal focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-app-soft focus-visible:ring-offset-0 [&_svg]:size-4 [&_svg]:text-text-soft';
  const canDeleteMode = modes.length > 1;

  return (
    <div
      className={cn('window', isFocused ? 'is-focused' : 'not-focused')}
      role="region"
      aria-label="Linkshelf"
    >
      <header className="window-header">
        <div className="min-w-0 flex-1">
          <ModeSelector
            modes={modes}
            currentModeId={currentMode.id}
            onModeChange={switchMode}
            onModeAdd={addMode}
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={toolbarButton}
            onClick={handleAddItem}
            aria-label="Add item"
            title="Add item (⌘N)"
          >
            <Plus strokeWidth={2.25} />
          </Button>
          <Button
              variant="ghost"
              size="icon"
              className={cn(
                toolbarButton,
                isReordering &&
                  'bg-accent-app text-(--btn-primary-text) hover:bg-accent-app-press hover:text-(--btn-primary-text)'
              )}
              onClick={() => setIsReordering((prev) => !prev)}
              disabled={!isReordering && currentMode.items.length < 2}
              aria-pressed={isReordering}
              aria-label={isReordering ? 'Done reordering' : 'Reorder items'}
              title={isReordering ? 'Done reordering' : 'Reorder items'}
            >
              <span className="relative block size-4">
                <ArrowUpDown
                  strokeWidth={2}
                  className={cn(toolbarIconSwap, isReordering ? 'scale-[0.25] opacity-0 blur-xs' : 'scale-100 opacity-100 blur-0')}
                />
                <Check
                  strokeWidth={2.5}
                  className={cn(toolbarIconSwap, isReordering ? 'scale-100 opacity-100 blur-0' : 'scale-[0.25] opacity-0 blur-xs')}
                />
              </span>
            </Button>
          <Popover open={showSettings} onOpenChange={handleSettingsOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(toolbarButton, 'data-[state=open]:bg-surface-subtle data-[state=open]:text-text')}
                aria-label="Settings"
                title="Settings (⌘,)"
              >
                <Settings2 strokeWidth={2} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-100 w-64 p-1" align="end" sideOffset={6}>
              <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5">
                <Label htmlFor="always-on-top" className="flex cursor-pointer flex-col gap-0.5 leading-snug">
                  <span className="block text-[13px] text-text">Keep on top</span>
                  <span className="block text-[12px] text-text-soft">Stay above other windows</span>
                </Label>
                <Switch
                  id="always-on-top"
                  checked={alwaysOnTopEnabled}
                  onCheckedChange={() => void handleAlwaysOnTopToggle()}
                  className="h-5 w-9 data-[state=checked]:bg-accent-app data-[state=unchecked]:bg-surface-pressed focus-visible:ring-accent-app-soft focus-visible:ring-offset-surface [&>span]:h-4 [&>span]:w-4 data-[state=checked]:[&>span]:translate-x-4"
                />
              </div>

              <Separator className="mx-1 my-1 bg-(--item-row-border)" />

              <Button
                variant="ghost"
                size="sm"
                disabled={!canDeleteMode}
                className={cn(
                  settingsRow,
                  confirmDeleteMode
                    ? 'bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger [&_svg]:text-danger'
                    : 'text-text hover:bg-surface-hover hover:text-text'
                )}
                onClick={() => void handleDeleteMode()}
                title={canDeleteMode ? undefined : 'You need at least one mode'}
              >
                <Trash2 strokeWidth={2} />
                <span className="truncate">
                  {confirmDeleteMode ? `Delete “${currentMode.name}” and its items?` : `Delete “${currentMode.name}” mode`}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  settingsRow,
                  confirmReset
                    ? 'bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger [&_svg]:text-danger'
                    : 'text-text hover:bg-surface-hover hover:text-text'
                )}
                onClick={() => void handleResetDefaults()}
              >
                <RotateCcw strokeWidth={2} />
                {confirmReset ? 'Erase everything? Click to confirm' : 'Reset to defaults'}
              </Button>

              <Separator className="mx-1 my-1 bg-(--item-row-border)" />

              <Button
                variant="ghost"
                size="sm"
                className={cn(settingsRow, 'text-text hover:bg-surface-hover hover:text-text')}
                onClick={() => void handleQuit()}
              >
                <Power strokeWidth={2} />
                Quit Linkshelf
                <kbd className="ml-auto font-sans text-[12px] text-text-soft">⌘Q</kbd>
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="window-content">
        <ItemList
          items={currentMode.items}
          modeName={currentMode.name}
          isReordering={isReordering}
          onAddItem={handleAddItem}
          copiedId={copiedId}
          onCopy={handleCopy}
          onEdit={handleEditItem}
          onDelete={deleteItem}
          onReorderItems={reorderItems}
        />
      </main>


      {showForm && (
        <ItemForm
          item={editingItem || undefined}
          onSave={handleSaveItem}
          onCancel={handleCancel}
        />
      )}

      {toast && (
        <Toast
          key={toastKey}
          message={toast.message}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};
