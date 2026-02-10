import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, FileText, Link2, Pencil, Trash2 } from 'lucide-react';
import { LinkshelfItem } from '../types';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ItemRowProps {
  item: LinkshelfItem;
  onCopy: (value: string, type: string, label: string) => void | Promise<void>;
  onEdit: (item: LinkshelfItem) => void;
  onDelete: (itemId: string) => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = async () => {
    await onCopy(item.value, item.type, item.label);
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
    <li
      className="group flex items-center gap-1.5 rounded-lg bg-[var(--item-row-bg)] hover:bg-surface-hover/35 border border-[var(--item-row-border)] hover:border-[var(--border-strong)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/5 min-h-[48px]"
      data-item-type={item.type}
    >
      {/* Main clickable area */}
      <button
        type="button"
        className="flex-1 min-w-0 border-none bg-transparent py-3 pl-4 pr-0 cursor-pointer flex items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-accent-app-soft focus-visible:-outline-offset-2 focus-visible:rounded-lg"
        onClick={() => void handleCopy()}
        aria-label={`Copy ${item.type} item: ${item.label}`}
      >
        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-text truncate tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }} title={item.label}>
              {item.label}
            </span>
            <span
              className={cn(
                "shrink-0 h-[18px] px-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center",
                item.type === 'link'
                  ? "bg-[var(--item-kind-link-bg)] text-[var(--item-kind-link-color)]"
                  : "bg-[var(--item-kind-text-bg)] text-[var(--item-kind-text-color)]"
              )}
            >
              {item.type === 'link' ? 'Link' : 'Text'}
            </span>
          </div>
          {/* Value row */}
          <div className="flex items-center gap-1.5 min-w-0 text-xs text-text-soft">
            <span className="inline-flex shrink-0 text-text-muted">
              {item.type === 'link' ? <Link2 size={11} strokeWidth={2.5} /> : <FileText size={11} strokeWidth={2.5} />}
            </span>
            <span className={cn("truncate text-text-muted", item.type === 'link' && "text-[var(--link-text)] font-medium")} title={item.value}>
              {item.value}
            </span>
          </div>
        </div>

      </button>

      {/* Action buttons */}
      <div className="flex gap-1 pr-3 items-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-lg bg-surface-subtle/40 hover:bg-surface-pressed text-text-soft hover:text-text transition-colors",
            copied && "bg-success/15 text-success hover:bg-success/20 hover:text-success"
          )}
          onClick={() => void handleCopy()}
          title={`Copy ${item.label}`}
        >
          {copied ? <Check size={11} strokeWidth={2.75} /> : <Copy size={11} strokeWidth={2.25} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg bg-surface-subtle/40 hover:bg-surface-pressed text-text-soft hover:text-text transition-colors"
          onClick={() => onEdit(item)}
          title={`Edit ${item.label}`}
        >
          <Pencil size={11} strokeWidth={2.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-lg bg-surface-subtle/40 hover:bg-surface-pressed text-text-soft hover:text-text transition-colors",
            showDeleteConfirm && "bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger animate-pulse"
          )}
          onClick={handleDelete}
          title={showDeleteConfirm ? 'Confirm delete' : 'Delete item'}
        >
          {showDeleteConfirm ? <AlertTriangle size={11} strokeWidth={2.5} /> : <Trash2 size={11} strokeWidth={2.5} />}
        </Button>
      </div>
    </li>
  );
};
