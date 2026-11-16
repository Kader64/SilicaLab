import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { pluralize } from "../../lib/format";
import type { Category } from "../../types";

interface Props {
  category: Category;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export default function CategoryRow({ category, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const inUse = category.courses > 0;

  function save() {
    const trimmed = name.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  }

  function cancel() {
    setName(category.name);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="py-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            className="input py-1.5"
            aria-label={`New name for ${category.name}`}
            value={name}
            maxLength={60}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancel()}
          />
          <button type="submit" className="icon-btn" aria-label="Save name">
            <Check size={18} />
          </button>
          <button type="button" className="icon-btn" aria-label="Cancel renaming" onClick={cancel}>
            <X size={18} />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex-1 font-semibold text-ink">{category.name}</span>
      <span className="text-sm text-muted">
        {category.courses} {pluralize(category.courses, "course")}
      </span>
      <button type="button" className="icon-btn" aria-label={`Rename ${category.name}`} onClick={() => setEditing(true)}>
        <Pencil size={16} />
      </button>
      {/* Delete is blocked while the category is in use */}
      <button
        type="button"
        className="icon-btn icon-btn-danger"
        aria-label={`Delete ${category.name}`}
        disabled={inUse}
        title={inUse ? "Category is in use" : undefined}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}
