import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, FileText, Link2, Pencil, Trash2 } from 'lucide-react';
import { LinkshelfItem } from '../types';

interface ItemRowProps {
  item: LinkshelfItem;
  onCopy: (value: string) => void | Promise<void>;
  onEdit: (item: LinkshelfItem) => void;
  onDelete: (itemId: string) => void;
}

/**
 * Individual row displaying a single item (link or text snippet).
 * Clicking the row or copy button copies the value to clipboard.
 * Hover shows edit and delete buttons.
 */
export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = async () => {
    await onCopy(item.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <li className="item-row" data-item-type={item.type}>
      <button
        type="button"
        className="item-main"
        onClick={() => void handleCopy()}
        aria-label={`Copy ${item.type} item: ${item.label}`}
      >
        <div className="item-content">
          <div className="item-label-row">
            <div className="item-label" title={item.label}>
              {item.label}
            </div>
            <span className="item-kind">{item.type === 'link' ? 'Link' : 'Text'}</span>
          </div>
          <div className="item-value">
            <span className="item-type-icon" aria-hidden="true">
              {item.type === 'link' ? (
                <Link2 size={13} strokeWidth={2.25} />
              ) : (
                <FileText size={13} strokeWidth={2.25} />
              )}
            </span>
            <span
              className={item.type === 'link' ? 'item-link' : 'item-text'}
              title={item.value}
            >
              {item.value.length > 60 ? `${item.value.substring(0, 60)}...` : item.value}
            </span>
          </div>
        </div>
        <span className={`copy-indicator ${copied ? 'copied' : ''}`} aria-hidden="true">
          {copied ? <Check size={14} strokeWidth={2.25} /> : <Copy size={14} strokeWidth={2.25} />}
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? `${item.label} copied to clipboard` : ''}
        </span>
      </button>

      <div className="item-actions">
        <button
          type="button"
          className="action-btn edit-btn"
          onClick={() => onEdit(item)}
          title={`Edit ${item.label}`}
          aria-label={`Edit ${item.label}`}
        >
          <Pencil size={14} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          className={`action-btn delete-btn ${showDeleteConfirm ? 'confirm' : ''}`}
          onClick={handleDelete}
          title={showDeleteConfirm ? 'Click again to confirm delete' : 'Delete item'}
          aria-label={
            showDeleteConfirm
              ? `Confirm delete ${item.label}`
              : `Delete ${item.label}. Click again to confirm`
          }
        >
          {showDeleteConfirm ? (
            <AlertTriangle size={14} strokeWidth={2.25} />
          ) : (
            <Trash2 size={14} strokeWidth={2.25} />
          )}
        </button>
      </div>
    </li>
  );
};
