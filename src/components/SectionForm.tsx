import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SectionFormProps {
    onSave: (name: string) => void;
    onCancel: () => void;
}

export const SectionForm: React.FC<SectionFormProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Section name is required");
            return;
        }
        onSave(name.trim());
    };

    const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            if (!name.trim()) {
                setError("Section name is required");
                return;
            }
            onSave(name.trim());
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="max-w-[360px] p-0">
                <DialogHeader>
                    <DialogTitle>New Section</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
                    <div className="grid gap-4 px-5 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-semibold text-text">Section Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder="e.g., Profiles, Work, Personal"
                                autoFocus
                                className={`h-9 rounded-lg bg-surface-subtle border-none text-text text-sm placeholder:text-text-soft focus-visible:ring-1 focus-visible:ring-accent-app-soft ${error ? "ring-1 ring-danger" : ""}`}
                            />
                            {error && <p className="text-[11px] text-danger">{error}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" className="h-9 rounded-lg bg-surface-subtle text-text-muted hover:bg-surface-hover hover:text-text" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" className="h-9 rounded-lg gap-1.5 bg-accent-app text-[color:var(--btn-primary-text)] hover:bg-accent-app-press font-semibold">
                                <Check className="h-4 w-4" /> Add Section
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
