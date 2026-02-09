import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { Mode } from '../types';

interface ModeSelectorProps {
  modes: Mode[];
  currentModeId: string;
  onModeChange: (modeId: string) => void;
  onModeAdd: (modeName: string) => void | Promise<void>;
  onModeDelete: (modeId: string) => void | Promise<void>;
  canDeleteMode: boolean;
}

/**
 * Dropdown selector for switching between different modes.
 * Supports creating and deleting modes.
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({
  modes,
  currentModeId,
  onModeChange,
  onModeAdd,
  onModeDelete,
  canDeleteMode,
}) => {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [modeError, setModeError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const modeInputRef = useRef<HTMLInputElement | null>(null);
  const deleteTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAddingMode) {
      modeInputRef.current?.focus();
    }
  }, [isAddingMode]);

  useEffect(() => {
    setConfirmDelete(false);
  }, [currentModeId]);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        window.clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const handleStartAddMode = () => {
    setModeError(null);
    setIsAddingMode(true);
    setConfirmDelete(false);
  };

  const handleCancelAddMode = () => {
    setIsAddingMode(false);
    setNewModeName('');
    setModeError(null);
  };

  const handleCreateMode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newModeName.trim();

    if (!trimmedName) {
      setModeError('Mode name is required');
      return;
    }

    try {
      await onModeAdd(trimmedName);
      setNewModeName('');
      setModeError(null);
      setIsAddingMode(false);
    } catch (error) {
      setModeError(error instanceof Error ? error.message : 'Failed to create mode');
    }
  };

  const handleDeleteMode = async () => {
    setModeError(null);

    if (!canDeleteMode) {
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      if (deleteTimeoutRef.current) {
        window.clearTimeout(deleteTimeoutRef.current);
      }
      deleteTimeoutRef.current = window.setTimeout(() => {
        setConfirmDelete(false);
      }, 2500);
      return;
    }

    try {
      await onModeDelete(currentModeId);
      setConfirmDelete(false);
      if (deleteTimeoutRef.current) {
        window.clearTimeout(deleteTimeoutRef.current);
      }
    } catch (error) {
      setModeError(error instanceof Error ? error.message : 'Failed to delete mode');
    }
  };

  return (
    <div className="mode-selector">
      <div className="mode-row">
        <div className="mode-select-wrap">
          <select
            value={currentModeId}
            onChange={(e) => onModeChange(e.target.value)}
            className="mode-select"
            aria-label="Select mode"
          >
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
          <ChevronDown className="mode-select-icon" size={14} strokeWidth={2.25} />
        </div>
        <div className="mode-action-group">
          <button
            type="button"
            className="mode-action-btn"
            onClick={handleStartAddMode}
            title="Add mode"
            aria-label="Add mode"
          >
            <Plus size={14} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className={`mode-action-btn ${confirmDelete ? 'confirm' : ''}`}
            onClick={() => void handleDeleteMode()}
            disabled={!canDeleteMode}
            title={
              canDeleteMode
                ? confirmDelete
                  ? 'Click to confirm mode delete'
                  : 'Delete current mode'
                : 'At least one mode is required'
            }
            aria-label="Delete current mode"
          >
            <Trash2 size={14} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {isAddingMode && (
        <form className="mode-create-form" onSubmit={(event) => void handleCreateMode(event)}>
          <input
            ref={modeInputRef}
            type="text"
            className="mode-create-input"
            placeholder="New mode name"
            value={newModeName}
            onChange={(event) => setNewModeName(event.target.value)}
            aria-label="New mode name"
          />
          <button type="submit" className="mode-inline-btn" aria-label="Save mode" title="Save mode">
            <Check size={14} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className="mode-inline-btn"
            onClick={handleCancelAddMode}
            aria-label="Cancel mode creation"
            title="Cancel"
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </form>
      )}

      {modeError && (
        <div className="mode-error" role="alert">
          {modeError}
        </div>
      )}
    </div>
  );
};
