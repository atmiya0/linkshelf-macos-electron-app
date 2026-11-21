import React, { useState } from "react";
import { FileText, Link2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface ItemFormProps {
  item?: LinkshelfItem;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

type FormErrors = Partial<Record<"label" | "value", string>>;

const fieldClass =
  "rounded-lg border border-(--border-strong) bg-(--bg) px-3 text-[14px] text-text placeholder:text-text-soft focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-0";

const TYPE_OPTIONS: { value: ItemType; label: string; Icon: typeof Link2 }[] = [
  { value: "link", label: "Link", Icon: Link2 },
  { value: "text", label: "Text", Icon: FileText },
];

export const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    label: item?.label || "",
    value: item?.value || "",
    type: item?.type || "link",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = !!item;
  const isLink = formData.type === "link";

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.label.trim()) newErrors.label = "Add a name so you can find it later.";
    if (!formData.value.trim()) {
      newErrors.value = isLink ? "Paste the link to save." : "Add the text to save.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ ...formData, label: formData.label.trim(), value: formData.value.trim() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  const update = (patch: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      if ("label" in patch) delete next.label;
      if ("value" in patch || "type" in patch) delete next.value;
      return next;
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[340px] p-0">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit item" : "New item"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Changes save to this mode." : "Click it in the list any time to copy it."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
          <div className="grid gap-4 px-5 py-4">
            {/* Type */}
            <div
              role="radiogroup"
              aria-label="Item type"
              className="grid grid-cols-2 gap-1 rounded-lg bg-(--bg) p-1"
            >
              {TYPE_OPTIONS.map(({ value, label, Icon }) => {
                const selected = formData.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ type: value })}
                    className={cn(
                      "flex h-8 items-center justify-center gap-1.5 rounded-md text-[13px] font-semibold outline-hidden transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-app-soft",
                      selected
                        ? "bg-surface-hover text-text shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                        : "text-text-soft hover:text-text"
                    )}
                  >
                    <Icon size={14} strokeWidth={2} aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Label */}
            <div className="grid gap-1.5">
              <Label htmlFor="label" className="text-[12px] font-semibold text-text-muted">Name</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => update({ label: e.target.value })}
                placeholder={isLink ? "Portfolio, GitHub…" : "Intro message, address…"}
                autoFocus
                aria-invalid={!!errors.label}
                aria-describedby={errors.label ? "label-error" : undefined}
                className={cn("h-9", fieldClass, errors.label && "border-danger")}
              />
              {errors.label && <p id="label-error" className="text-[12px] text-danger">{errors.label}</p>}
            </div>

            {/* Value */}
            <div className="grid gap-1.5">
              <Label htmlFor="value" className="text-[12px] font-semibold text-text-muted">
                {isLink ? "URL" : "Text"}
              </Label>
              {isLink ? (
                <Input
                  id="value"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  value={formData.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder="https://example.com"
                  aria-invalid={!!errors.value}
                  aria-describedby={errors.value ? "value-error" : undefined}
                  className={cn("h-9", fieldClass, errors.value && "border-danger")}
                />
              ) : (
                <Textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder="The text you want to paste later"
                  rows={4}
                  aria-invalid={!!errors.value}
                  aria-describedby={errors.value ? "value-error" : undefined}
                  className={cn("resize-y py-2 leading-relaxed", fieldClass, errors.value && "border-danger")}
                />
              )}
              {errors.value && <p id="value-error" className="text-[12px] text-danger">{errors.value}</p>}
            </div>
          </div>

          <DialogFooter className="justify-between">
            <span className="text-[12px] text-text-soft" aria-hidden="true">
              <kbd className="font-sans">⌘</kbd> <kbd className="font-sans">↵</kbd> to save
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-md px-3 text-[13px] text-text-muted hover:bg-surface-subtle hover:text-text focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-0"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="press-scale h-8 rounded-md bg-accent-app px-3 text-[13px] font-semibold text-(--btn-primary-text) hover:bg-accent-app-press focus-visible:ring-2 focus-visible:ring-accent-app-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {isEditMode ? "Save" : "Add item"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
