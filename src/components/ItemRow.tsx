import React, { useEffect, useRef, useState } from 'react';
import { Check, FileText, Link2, Pencil, Trash2 } from 'lucide-react';
import { LinkshelfItem } from '../types';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ItemRowProps {
  item: LinkshelfItem;
  /** 1–9 when the item can be copied with ⌃⌥ + number from any app */
  shortcutSlot?: number;
  /** True for a moment after this item was copied, by click or by shortcut */
  copied: boolean;
  onCopy: (item: LinkshelfItem) => void | Promise<void>;
  onEdit: (item: LinkshelfItem) => void;
  onDelete: (itemId: string) => void;
  disabled?: boolean;
}

/** Links read better without the protocol; text snippets collapse to one line. */
const formatPreview = (item: LinkshelfItem): string => {
  if (item.type === 'link') {
    return item.value.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  }
  return item.value.replace(/\s+/g, ' ').trim();
};

const iconSwap =
  'absolute inset-0 m-auto transition-[opacity,transform,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity';

const actionButton =
  'h-8 w-8 rounded-md focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-0 [&_svg]:size-4';

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  shortcutSlot,
  copied,
  onCopy,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
  }, []);

  const handleDelete = () => {
    if (confirmingDelete) {
      if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
      setConfirmingDelete(false);
      onDelete(item.id);
      return;
    }
    setConfirmingDelete(true);
    if (deleteTimer.current) window.clearTimeout(deleteTimer.current);
    deleteTimer.current = window.setTimeout(() => setConfirmingDelete(false), 3000);
  };

  const isLink = item.type === 'link';
  const KindIcon = isLink ? Link2 : FileText;

  return (
    <div
      className={cn(
        'item-row relative flex min-h-[52px] items-center rounded-lg transition-colors duration-150',
        !disabled && 'hover:bg-(--row-hover) focus-within:bg-(--row-hover)',
        // Keyboard selection: fill the whole row, like Raycast and Spotlight
        'has-[[data-copy-button]:focus-visible]:bg-(--row-selected) has-[[data-copy-button]:focus-visible]:shadow-[inset_0_0_0_1px_var(--row-selected-ring)]',
        copied && 'bg-[rgba(111,211,165,0.08)] hover:bg-[rgba(111,211,165,0.1)]',
        confirmingDelete && 'bg-(--row-hover)'
      )}
      data-item-type={item.type}
    >
      {/* The whole row copies: the biggest possible target */}
      <button
        type="button"
        data-copy-button
        className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 self-stretch rounded-lg py-2 pl-2 pr-1 text-left outline-hidden disabled:cursor-grab"
        onClick={() => void onCopy(item)}
        disabled={disabled}
        aria-label={`Copy ${item.label}${shortcutSlot ? `, shortcut Control Option ${shortcutSlot}` : ''}`}
      >
        {/* Type tile: one soft icon for links, one for text; becomes a check when copied */}
        <span
          className={cn(
            'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-colors duration-150',
            copied
              ? 'bg-[rgba(111,211,165,0.16)] text-success'
              : isLink
                ? 'bg-(--item-kind-link-bg) text-(--item-kind-link-color)'
                : 'bg-(--item-kind-text-bg) text-(--item-kind-text-color)'
          )}
          aria-hidden="true"
        >
          <KindIcon
            size={16}
            strokeWidth={2}
            className={cn(iconSwap, copied ? 'scale-[0.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0')}
          />
          <Check
            size={16}
            strokeWidth={2.5}
            className={cn(iconSwap, copied ? 'scale-100 opacity-100 blur-0' : 'scale-[0.25] opacity-0 blur-[4px]')}
          />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-[14px] font-medium leading-[18px] text-text" title={item.label}>
            {item.label}
          </span>
          <span
            className={cn(
              'truncate text-[12px] leading-4',
              copied ? 'text-success' : isLink ? 'text-(--link-text)' : 'text-text-soft'
            )}
            title={item.value}
          >
            {copied ? 'Copied. Paste with ⌘V' : formatPreview(item)}
          </span>
        </span>
      </button>

      {/* Shortcut hint; swaps with the edit/delete actions on hover */}
      {!disabled && shortcutSlot && (
        <kbd
          className="item-shortcut pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-sans text-[11px] font-medium tabular-nums tracking-wide text-text-soft"
          aria-hidden="true"
        >
          ⌃⌥{shortcutSlot}
        </kbd>
      )}

      {!disabled && (
        <div
          className="item-actions flex shrink-0 items-center gap-0.5 pr-1.5"
          data-pinned={confirmingDelete ? 'true' : 'false'}
        >
          {!confirmingDelete && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(actionButton, 'text-text-soft hover:bg-surface-hover hover:text-text')}
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.label}`}
              title="Edit"
            >
              <Pencil strokeWidth={2} />
            </Button>
          )}
          <Button
            variant="ghost"
            size={confirmingDelete ? 'sm' : 'icon'}
            className={cn(
              actionButton,
              confirmingDelete
                ? 'w-auto gap-1 px-2.5 text-[12px] font-medium bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger'
                : 'text-text-soft hover:bg-danger-soft hover:text-danger'
            )}
            onClick={handleDelete}
            onBlur={() => setConfirmingDelete(false)}
            aria-label={confirmingDelete ? `Confirm delete ${item.label}` : `Delete ${item.label}`}
            title={confirmingDelete ? 'Click again to delete' : 'Delete'}
          >
            <Trash2 strokeWidth={2} />
            {confirmingDelete && 'Delete'}
          </Button>
        </div>
      )}
    </div>
  );
};
