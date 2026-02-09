import { useState, useEffect, useCallback } from 'react';
import { AppData, LinkshelfItem } from '../types';
import {
  initializeStore,
  switchMode as switchModeInStore,
  createMode as createModeInStore,
  deleteMode as deleteModeInStore,
  addItem as addItemToStore,
  updateItem as updateItemInStore,
  deleteItem as deleteItemFromStore,
  copyToClipboard as copyToClipboardUtil,
  quitApp as quitAppInStore,
  resetAppToDefaults as resetAppToDefaultsInStore,
} from '../state/store';

/**
 * Custom hook that manages all app state and provides methods to interact with it.
 * This is the single source of truth for the application's data.
 */
export function useStore() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize store on mount
  useEffect(() => {
    initializeStore()
      .then(initialData => {
        setData(initialData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get current mode
  const currentMode = data?.modes.find(mode => mode.id === data.currentModeId);

  /**
   * Switch to a different mode
   */
  const switchMode = useCallback(async (modeId: string) => {
    if (!data) return;
    try {
      const newData = await switchModeInStore(data, modeId);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch mode');
    }
  }, [data]);

  /**
   * Create a new mode
   */
  const addMode = useCallback(async (modeName: string) => {
    if (!data) {
      throw new Error('Store is not ready');
    }
    try {
      const newData = await createModeInStore(data, modeName);
      setData(newData);
    } catch (err) {
      throw (err instanceof Error ? err : new Error('Failed to create mode'));
    }
  }, [data]);

  /**
   * Delete an existing mode
   */
  const removeMode = useCallback(async (modeId: string) => {
    if (!data) {
      throw new Error('Store is not ready');
    }
    try {
      const newData = await deleteModeInStore(data, modeId);
      setData(newData);
    } catch (err) {
      throw (err instanceof Error ? err : new Error('Failed to delete mode'));
    }
  }, [data]);

  /**
   * Add a new item to the current mode
   */
  const addItem = useCallback(async (
    item: Omit<LinkshelfItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!data) return;
    try {
      const newData = await addItemToStore(data, item);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  }, [data]);

  /**
   * Update an existing item
   */
  const updateItem = useCallback(async (
    itemId: string,
    updates: Partial<Omit<LinkshelfItem, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!data) return;
    try {
      const newData = await updateItemInStore(data, itemId, updates);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  }, [data]);

  /**
   * Delete an item
   */
  const deleteItem = useCallback(async (itemId: string) => {
    if (!data) return;
    try {
      const newData = await deleteItemFromStore(data, itemId);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  }, [data]);

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await copyToClipboardUtil(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy to clipboard');
    }
  }, []);

  /**
   * Quit desktop app.
   */
  const quitApp = useCallback(async () => {
    try {
      await quitAppInStore();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to quit app');
    }
  }, []);

  /**
   * Reset app to default modes, links, and preferences.
   */
  const resetToDefaults = useCallback(async () => {
    try {
      const newData = await resetAppToDefaultsInStore();
      setData(newData);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset app');
      return false;
    }
  }, []);

  return {
    data,
    loading,
    error,
    currentMode,
    modes: data?.modes || [],
    switchMode,
    addMode,
    removeMode,
    addItem,
    updateItem,
    deleteItem,
    copyToClipboard,
    quitApp,
    resetToDefaults,
  };
}
