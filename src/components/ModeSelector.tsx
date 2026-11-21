import React, { useRef, useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Mode } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  modes: Mode[];
  currentModeId: string;
  onModeChange: (modeId: string) => void;
  onModeAdd: (modeName: string) => void | Promise<void>;
}

const menuItem =
  'flex h-8 cursor-default items-center gap-2 rounded-md px-2 text-[13px] text-text outline-hidden transition-colors duration-150 focus:bg-surface-hover data-highlighted:bg-surface-hover [&_svg]:size-4';

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  modes,
  currentModeId,
  onModeChange,
  onModeAdd,
}) => {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [modeError, setModeError] = useState<string | null>(null);
  // Opening the dialog from a menu item: stop the closing menu from pulling focus back to its trigger
  const openingDialog = useRef(false);

  const currentMode = modes.find((mode) => mode.id === currentModeId);

  const closeAddDialog = () => {
    setIsAddingMode(false);
    setNewModeName('');
    setModeError(null);
  };

  const handleCreateMode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newModeName.trim();
    if (!trimmedName) {
      setModeError('Give the mode a name.');
      return;
    }
    try {
      await onModeAdd(trimmedName);
      closeAddDialog();
    } catch (error) {
      setModeError(error instanceof Error ? error.message : 'Couldn’t create the mode. Try again.');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="press-scale flex h-8 min-w-0 max-w-full items-center gap-1.5 rounded-md px-2 text-[14px] font-semibold text-text outline-hidden transition-colors duration-150 hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-accent-app-soft data-[state=open]:bg-surface-subtle"
            aria-label={`Mode: ${currentMode?.name ?? 'none'}. Switch mode`}
          >
            <span className="truncate">{currentMode?.name ?? 'Choose a mode'}</span>
            <ChevronsUpDown size={14} strokeWidth={2} className="shrink-0 text-text-soft" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          onCloseAutoFocus={(event) => {
            if (openingDialog.current) {
              event.preventDefault();
              openingDialog.current = false;
            }
          }}
          className="w-60 rounded-lg border border-(--glass-border) bg-(--glass) backdrop-blur-2xl backdrop-saturate-[1.7] p-1 text-text shadow-(--modal-shadow)"
        >
          <DropdownMenuLabel className="px-2 pb-1 pt-1.5 text-[11px] font-medium text-text-soft">
            Modes
          </DropdownMenuLabel>
          {modes.map((mode) => {
            const selected = mode.id === currentModeId;
            return (
              <DropdownMenuItem
                key={mode.id}
                className={menuItem}
                onSelect={() => onModeChange(mode.id)}
              >
                <span className="flex w-4 justify-center text-text">
                  {selected && <Check strokeWidth={2.5} aria-hidden="true" />}
                </span>
                <span className={cn('min-w-0 flex-1 truncate', selected && 'font-medium')}>{mode.name}</span>
                <span className="tabular-nums text-[12px] text-text-soft">{mode.items.length}</span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator className="mx-1 my-1 bg-(--item-row-border)" />
          <DropdownMenuItem className={cn(menuItem, 'text-text-muted')} onSelect={() => {
              openingDialog.current = true;
              setIsAddingMode(true);
            }}>
            <Plus strokeWidth={2} aria-hidden="true" />
            New mode…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddingMode} onOpenChange={(open) => !open && closeAddDialog()}>
        <DialogContent className="max-w-[320px] p-0">
          <DialogHeader>
            <DialogTitle>New mode</DialogTitle>
            <DialogDescription>Group items for one context, like a job hunt or support replies.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void handleCreateMode(event)} noValidate>
            <div className="grid gap-1.5 px-5 py-4">
              <Label htmlFor="new-mode-name" className="text-[12px] font-medium text-text-muted">Name</Label>
              <Input
                id="new-mode-name"
                autoFocus
                className={cn(
                  'h-9 rounded-lg border border-(--border-strong) bg-(--bg) px-3 text-[14px] text-text placeholder:text-text-soft focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-0',
                  modeError && 'border-danger'
                )}
                placeholder="Job hunt"
                value={newModeName}
                aria-invalid={!!modeError}
                aria-describedby={modeError ? 'new-mode-error' : undefined}
                onChange={(event) => {
                  setNewModeName(event.target.value);
                  if (modeError) setModeError(null);
                }}
              />
              {modeError && (
                <p id="new-mode-error" className="text-[12px] text-danger" role="alert">{modeError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-md px-3 text-[13px] text-text-muted hover:bg-surface-subtle hover:text-text focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-0"
                onClick={closeAddDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="press-scale h-8 rounded-md bg-accent-app px-3 text-[13px] font-semibold text-(--btn-primary-text) hover:bg-accent-app-press focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Create mode
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
