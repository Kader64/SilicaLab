import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import CategoryRow from "../../components/admin/CategoryRow";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Field from "../../components/ui/Field";
import PageHeader from "../../components/ui/PageHeader";
import { uid } from "../../lib/uid";
import { categories as initialCategories } from "../../mocks/data";
import type { Category } from "../../types";

export default function Categories() {
  const [items, setItems] = useState(initialCategories);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Category | null>(null);

  // TODO API: POST /api/admin/categories, PUT /api/admin/categories/{id}, DELETE /api/admin/categories/{id}
  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter a name.");
    if (items.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return setError("This category already exists.");
    setItems([...items, { id: uid(), name: trimmed, courses: 0 }]);
    setName("");
    setError(null);
  }

  return (
    <>
      <PageHeader title="Categories" description="Categories group courses on the browse page. A category in use can't be deleted." />

      <form onSubmit={add} noValidate className="mb-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start">
        <Field label="New category" error={error} className="flex-1">
          {(control) => (
            <input
              {...control}
              className="input"
              value={name}
              maxLength={60}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
            />
          )}
        </Field>
        <button type="submit" className="btn btn-primary sm:mt-7">
          <Plus size={16} /> Add
        </button>
      </form>

      <ul className="card max-w-xl divide-y divide-line px-5">
        {items.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            onRename={(newName) => setItems(items.map((c) => (c.id === category.id ? { ...c, name: newName } : c)))}
            onDelete={() => setTarget(category)}
          />
        ))}
      </ul>

      <ConfirmDialog
        open={target !== null}
        title="Delete this category?"
        tone="danger"
        confirmLabel="Delete category"
        onCancel={() => setTarget(null)}
        onConfirm={() => {
          if (target) setItems(items.filter((c) => c.id !== target.id));
          setTarget(null);
        }}
      >
        <p>
          <strong className="text-ink">{target?.name}</strong> will be removed.
        </p>
      </ConfirmDialog>
    </>
  );
}
