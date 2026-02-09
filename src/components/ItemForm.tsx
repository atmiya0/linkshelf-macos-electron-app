import React, { useId, useState } from 'react';
import { Check, X } from 'lucide-react';
import { FormData, ItemType, LinkshelfItem } from '../types';

interface ItemFormProps {
  item?: LinkshelfItem; // If provided, form is in edit mode
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

/**
 * Form for adding or editing an item.
 * Includes fields for label, value, and type (link or text).
 * Validates that all fields are filled before allowing submission.
 */
export const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    label: item?.label || '',
    value: item?.value || '',
    type: item?.type || 'link',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const isEditMode = !!item;
  const titleId = useId();
  const labelErrorId = useId();
  const valueErrorId = useId();

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{isEditMode ? 'Edit Item' : 'Add New Item'}</h2>
          <button type="button" className="close-btn" onClick={onCancel} aria-label="Close form">
            <X size={16} strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="form-group">
            <label htmlFor="label">Label</label>
            <input
              type="text"
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Portfolio, GitHub, Email Signature"
              autoFocus
              className={errors.label ? 'error' : ''}
              aria-invalid={Boolean(errors.label)}
              aria-describedby={errors.label ? labelErrorId : undefined}
            />
            {errors.label && (
              <span id={labelErrorId} className="error-message">
                {errors.label}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as ItemType })
              }
            >
              <option value="link">Link</option>
              <option value="text">Text</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="value">
              {formData.type === 'link' ? 'URL' : 'Text'}
            </label>
            {formData.type === 'link' ? (
              <input
                type="text"
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="https://example.com"
                className={errors.value ? 'error' : ''}
                aria-invalid={Boolean(errors.value)}
                aria-describedby={errors.value ? valueErrorId : undefined}
              />
            ) : (
              <textarea
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter text snippet..."
                rows={4}
                className={errors.value ? 'error' : ''}
                aria-invalid={Boolean(errors.value)}
                aria-describedby={errors.value ? valueErrorId : undefined}
              />
            )}
            {errors.value && (
              <span id={valueErrorId} className="error-message">
                {errors.value}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              <X size={14} strokeWidth={2.25} />
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={14} strokeWidth={2.25} />
              {isEditMode ? 'Save Changes' : 'Add Item'}
            </button>
          </div>

          <div className="form-hint">
            Press <kbd>Esc</kbd> to cancel, <kbd>Cmd + Enter</kbd> to save
          </div>
        </form>
      </div>
    </div>
  );
};
