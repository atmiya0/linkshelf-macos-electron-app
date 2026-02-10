import React, { useState } from "react";
import { Check } from "lucide-react";
import { FormData, ItemType, LinkshelfItem } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFormProps {
  item?: LinkshelfItem;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    label: item?.label || "",
    value: item?.value || "",
    type: item?.type || "link",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const isEditMode = !!item;

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.label.trim()) newErrors.label = "Label is required";
    if (!formData.value.trim()) newErrors.value = "Value is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (validate()) onSave(formData);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[360px] p-0">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            Save links and snippets for fast copy access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          <div className="grid gap-4 border-y border-[var(--item-row-border)] px-5 py-4">
            {/* Label */}
            <div className="grid gap-2">
              <Label htmlFor="label" className="text-xs font-semibold text-text">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Portfolio, GitHub, Email Signature"
                autoFocus
                className={`h-9 rounded-lg bg-surface-subtle border-none text-text text-sm placeholder:text-text-soft focus-visible:ring-1 focus-visible:ring-accent-app-soft ${errors.label ? "ring-1 ring-danger" : ""}`}
              />
              {errors.label && <p className="text-[11px] text-danger">{errors.label}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="text-xs font-semibold text-text">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ItemType })}>
                <SelectTrigger id="type" className="h-9 rounded-lg bg-surface-subtle border-none text-text text-sm focus:ring-1 focus:ring-accent-app-soft">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-none shadow-xl rounded-lg">
                  <SelectItem value="link" className="text-text focus:bg-surface-hover">Link</SelectItem>
                  <SelectItem value="text" className="text-text focus:bg-surface-hover">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="grid gap-2">
              <Label htmlFor="value" className="text-xs font-semibold text-text">{formData.type === "link" ? "URL" : "Text Contents"}</Label>
              {formData.type === "link" ? (
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="https://example.com"
                  className={`h-9 rounded-lg bg-surface-subtle border-none text-text text-sm placeholder:text-text-soft focus-visible:ring-1 focus-visible:ring-accent-app-soft ${errors.value ? "ring-1 ring-danger" : ""}`}
                />
              ) : (
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Enter text snippet..."
                  rows={4}
                  className={`rounded-lg bg-surface-subtle border-none text-text text-sm placeholder:text-text-soft focus-visible:ring-1 focus-visible:ring-accent-app-soft resize-y ${errors.value ? "ring-1 ring-danger" : ""}`}
                />
              )}
              {errors.value && <p className="text-[11px] text-danger">{errors.value}</p>}
            </div>
          </div>

          <DialogFooter className="justify-between">
            <p className="text-text-soft text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5">
              <kbd className="inline-flex h-5 items-center gap-0.5 rounded bg-surface-subtle px-1.5 font-mono text-[10px] font-medium text-text-muted">
                <span className="text-xs">⌘</span>↵
              </kbd>
              save
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="h-9 rounded-lg bg-surface-subtle text-text-muted hover:bg-surface-hover hover:text-text" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="h-9 rounded-lg gap-1.5 bg-accent-app text-[color:var(--btn-primary-text)] hover:bg-accent-app-press font-semibold">
                <Check className="h-4 w-4" /> {isEditMode ? "Save" : "Add Item"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
