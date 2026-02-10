import { useRef, useState } from 'react';
import { LinkshelfItem } from '../types';
import { ItemRow } from './ItemRow';
import { ArrowUpDown, FolderPlus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ItemListProps {
  items: LinkshelfItem[];
  onCopy: (value: string, type: string, label: string) => void | Promise<void>;
  onEdit: (item: LinkshelfItem) => void;
  onDelete: (itemId: string) => void;
  onReorderItems: (itemIds: string[]) => void;
  onAddItem: () => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onCopy,
  onEdit,
  onDelete,
  onReorderItems,
  onAddItem,
}) => {
  const [isReordering, setIsReordering] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const linkItems = sortedItems.filter((item) => item.type === 'link');
  const textItems = sortedItems.filter((item) => item.type === 'text');

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
    <div
      key={item.id}
      className={cn(
        'item-row-container flex items-center gap-2 transition-all duration-200',
        isReordering && 'cursor-grab active:cursor-grabbing',
        dragOverId === item.id && 'border-t-2 border-accent-app -mt-[2px]'
      )}
      draggable={isReordering}
      onDragStart={(event) => handleItemDragStart(event, item.id)}
      onDragEnd={handleItemDragEnd}
      onDragOver={(event) => handleItemDragOver(event, item.id)}
      onDrop={(event) => handleItemDrop(event, item.id)}
      onDragLeave={() => setDragOverId(null)}
    >
      {isReordering && (
        <div className="pl-1 opacity-60">
          <GripVertical size={14} strokeWidth={2.5} className="text-text-soft cursor-grab" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <ItemRow
          item={item}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center" role="status" aria-live="polite">
        <div className="w-16 h-16 rounded-3xl bg-surface-subtle/30 flex items-center justify-center text-text-soft opacity-20 mb-6">
          <FolderPlus size={32} strokeWidth={1.5} />
        </div>
        <p className="text-base font-bold text-text mb-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Welcome to Linkshelf
        </p>
        <p className="text-xs text-text-soft mb-8 max-w-[220px] leading-relaxed">
          Add your first link or text snippet.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-6 rounded-full bg-accent-app text-[color:var(--btn-primary-text)] border-none hover:bg-accent-app-press transition-all"
          onClick={onAddItem}
        >
          Add First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-[var(--border-strong)] bg-[var(--header-bg)]/95 px-3 py-2 backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-soft">Library</p>
          <p className="text-xs text-text-muted truncate">
            {`${items.length} item${items.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 rounded-lg px-3 text-[11px] font-semibold tracking-wide',
            isReordering
              ? 'bg-accent-app text-[color:var(--btn-primary-text)] hover:bg-accent-app-press'
              : 'bg-surface-subtle text-text-muted hover:bg-surface-hover hover:text-text'
          )}
          onClick={() => setIsReordering((prev) => !prev)}
          title="Reorder items"
        >
          <ArrowUpDown size={12} strokeWidth={2.5} className="mr-1.5" />
          {isReordering ? 'Done' : 'Reorder'}
        </Button>
      </div>

      <div className="flex flex-col gap-7 pb-2" role="list">
        {linkItems.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="px-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-soft">Links</span>
              <span className="text-[10px] text-text-soft">{linkItems.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {linkItems.map(renderItem)}
            </div>
          </div>
        )}

        {textItems.length > 0 && (
          <div className="flex flex-col gap-3 pt-2 border-t border-[var(--item-row-border)]">
            <div className="px-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-soft">Text</span>
              <span className="text-[10px] text-text-soft">{textItems.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {textItems.map(renderItem)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
