import React from 'react';
import { LinkshelfItem } from '../types';
import { ItemRow } from './ItemRow';

interface ItemListProps {
  items: LinkshelfItem[];
  onCopy: (value: string) => void | Promise<void>;
  onEdit: (item: LinkshelfItem) => void;
  onDelete: (itemId: string) => void;
}

/**
 * Scrollable list of all items in the current mode.
 * Displays empty state when no items exist.
 */
export const ItemList: React.FC<ItemListProps> = ({
  items,
  onCopy,
  onEdit,
  onDelete,
}) => {
  if (items.length === 0) {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        <p>No items yet</p>
        <p className="empty-hint">Use Add Item to create your first snippet.</p>
      </div>
    );
  }

  return (
    <ul className="item-list" role="list" aria-label="Saved items">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
