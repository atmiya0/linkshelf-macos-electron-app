import React, { useEffect, useRef, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { Mode } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  modes: Mode[];
  currentModeId: string;
  onModeChange: (modeId: string) => void;
  onModeAdd: (modeName: string) => void | Promise<void>;
  onModeDelete: (modeId: string) => void | Promise<void>;
  canDeleteMode: boolean;
}

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

    if (!canDeleteMode) return;

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

  const getModeLabel = (name: string, itemCount: number): string => (
    `${name} (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1.5 w-full">
        <div className="flex-1">
          <Select value={currentModeId} onValueChange={onModeChange}>
            <SelectTrigger className="w-full h-9 rounded-lg bg-surface-subtle border-none text-text text-sm font-semibold focus:ring-1 focus:ring-accent-app-soft hover:bg-surface-hover transition-colors">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-none shadow-xl rounded-lg">
              {modes.map((mode) => (
                <SelectItem key={mode.id} value={mode.id} className="text-sm text-text focus:bg-surface-hover focus:text-text">
                  {getModeLabel(mode.name, mode.items.length)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
            onClick={() => { setIsAddingMode(true); setConfirmDelete(false); }}
            title="Add mode"
          >
            <Plus size={14} strokeWidth={2.25} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canDeleteMode}
            className={cn(
              "h-9 w-9 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-muted hover:text-text transition-colors",
              confirmDelete && "bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger animate-pulse"
            )}
            onClick={() => void handleDeleteMode()}
            title={confirmDelete ? 'Click again to confirm' : 'Delete mode'}
          >
            <Trash2 size={14} strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      {isAddingMode && (
        <form className="flex items-center gap-1.5 rounded-lg bg-surface-subtle p-1" onSubmit={(event) => void handleCreateMode(event)}>
          <Input
            ref={modeInputRef}
            className="h-7 flex-1 text-xs bg-transparent border-none text-text focus-visible:ring-0 placeholder:text-text-soft"
            placeholder="New mode name"
            value={newModeName}
            onChange={(event) => setNewModeName(event.target.value)}
          />
          <div className="flex gap-0.5">
            <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 rounded-md text-success hover:bg-success/10">
              <Check size={14} strokeWidth={2.25} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-text-muted hover:bg-surface-hover"
              onClick={() => { setIsAddingMode(false); setNewModeName(''); setModeError(null); }}
            >
              <X size={14} strokeWidth={2.25} />
            </Button>
          </div>
        </form>
      )}

      {modeError && (
        <p className="text-[10px] text-danger px-1">{modeError}</p>
      )}
    </div>
  );
};
