import { useEffect, useRef, useState } from 'react';
import { LinkshelfItem } from '../types';
import { ItemRow } from './ItemRow';
import { GripVertical, Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QUICK_COPY_SLOTS, getDisplayOrder } from '@/lib/items';

interface ItemListProps {
  items: LinkshelfItem[];
  modeName: string;
  isReordering: boolean;
  onAddItem: () => void;
  copiedId: string | null;
  onCopy: (item: LinkshelfItem) => void | Promise<void>;
  onEdit: (item: LinkshelfItem) => void;
  onDelete: (itemId: string) => void;
  onReorderItems: (itemIds: string[]) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  modeName,
  isReordering,
  onAddItem,
  copiedId,
  onCopy,
  onEdit,
  onDelete,
  onReorderItems,
}) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // ↑/↓ move between rows (Raycast-style); Enter copies because each row is a button.
  // From anywhere outside the list (header, nothing focused), ↓ jumps to the first row and ↑ to the last.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const list = listRef.current;
      if (!list || document.querySelector('[role="dialog"], [role="menu"]')) return;
      const active = document.activeElement as HTMLElement | null;
      // Leave arrow keys alone while typing
      if (active && (active.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName))) return;

      const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-copy-button]:not(:disabled)'));
      if (buttons.length === 0) return;
      const current = buttons.findIndex((button) => button === active || button.parentElement?.contains(active));
      let next: number;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else if (current === -1) next = event.key === 'ArrowDown' ? 0 : buttons.length - 1;
      else next = Math.min(buttons.length - 1, Math.max(0, current + (event.key === 'ArrowDown' ? 1 : -1)));

      event.preventDefault();
      buttons[next].focus();
      buttons[next].scrollIntoView({ block: 'nearest' });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const linkItems = sortedItems.filter((item) => item.type === 'link');
  const textItems = sortedItems.filter((item) => item.type === 'text');
  // Shortcut slot for each item, matching the on-screen order (⌃⌥1 is the top row)
  const slotById = new Map(
    getDisplayOrder(items)
      .slice(0, QUICK_COPY_SLOTS)
      .map((item, index) => [item.id, index + 1] as const)
  );

  const handleItemDragStart = (event: React.DragEvent, itemId: string) => {
    if (!isReordering) return;
    dragItemId.current = itemId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', itemId);
    (event.currentTarget as HTMLElement).classList.add('dragging');
  };

  const handleItemDragEnd = (event: React.DragEvent) => {
    (event.currentTarget as HTMLElement).classList.remove('dragging');
    dragItemId.current = null;
    setDragOverId(null);
  };

  const handleItemDragOver = (event: React.DragEvent, targetId: string) => {
    if (!isReordering) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragItemId.current && dragItemId.current !== targetId) {
      setDragOverId(targetId);
    }
  };

  const handleItemDrop = (event: React.DragEvent, targetId: string) => {
    if (!isReordering) return;
    event.preventDefault();
    setDragOverId(null);
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) return;

    const ids = sortedItems.map((item) => item.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, sourceId);
    onReorderItems(newIds);
  };

  const renderItem = (item: LinkshelfItem) => (
    <li
      key={item.id}
      className={cn(
        'item-row-container flex items-center gap-0.5 rounded-lg transition-[box-shadow,opacity] duration-150',
        isReordering && 'cursor-grab active:cursor-grabbing',
        dragOverId === item.id && 'shadow-[0_-2px_0_0_var(--app-accent)]'
      )}
      draggable={isReordering}
      onDragStart={(event) => handleItemDragStart(event, item.id)}
      onDragEnd={handleItemDragEnd}
      onDragOver={(event) => handleItemDragOver(event, item.id)}
      onDrop={(event) => handleItemDrop(event, item.id)}
      onDragLeave={() => setDragOverId(null)}
    >
      {isReordering && (
        <GripVertical size={16} strokeWidth={2} className="-ml-0.5 shrink-0 text-text-soft" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <ItemRow
          item={item}
          shortcutSlot={slotById.get(item.id)}
          copied={copiedId === item.id}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={isReordering}
        />
      </div>
    </li>
  );

  const renderGroup = (title: string, groupItems: LinkshelfItem[]) => {
    if (groupItems.length === 0) return null;
    const headingId = `group-${title.toLowerCase()}`;
    return (
      <section className="flex flex-col" aria-labelledby={headingId}>
        <h2
          id={headingId}
          className="flex h-7 items-center gap-1.5 px-2 text-[12px] font-medium text-text-soft"
        >
          {title}
          <span className="tabular-nums opacity-70">{groupItems.length}</span>
        </h2>
        <ul className="flex flex-col gap-px">
          {groupItems.map(renderItem)}
        </ul>
      </section>
    );
  };

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-subtle text-text-soft">
          <Inbox size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <p className="mb-1 text-[15px] font-semibold text-text text-balance">
          {modeName} is empty
        </p>
        <p className="mb-5 max-w-[220px] text-[13px] leading-relaxed text-text-soft text-pretty">
          Save the links and answers you paste into applications. Click one to copy it.
        </p>
        <Button
          className="press-scale h-8 gap-1.5 rounded-md bg-accent-app px-3 text-[13px] font-semibold text-(--btn-primary-text) hover:bg-accent-app-press focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg) [&_svg]:size-4"
          onClick={onAddItem}
        >
          <Plus strokeWidth={2.5} />
          Add item
          <kbd className="ml-1 font-sans text-[11px] font-medium opacity-60">⌘N</kbd>
        </Button>
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex flex-col gap-1.5">
      {isReordering && (
        <p className="flex items-center gap-1.5 rounded-md bg-surface-subtle px-2 py-1.5 text-[12px] text-text-muted" role="status">
          <GripVertical size={14} strokeWidth={2} aria-hidden="true" />
          Drag to reorder. Press Esc when done.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {renderGroup('Links', linkItems)}
        {renderGroup('Text', textItems)}
      </div>
    </div>
  );
};
