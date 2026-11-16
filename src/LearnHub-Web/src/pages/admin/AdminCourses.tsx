import { BookOpen, Ban, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable, { type Column } from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import FilterSelect from "../../components/ui/FilterSelect";
import PageHeader from "../../components/ui/PageHeader";
import ReasonDialog from "../../components/ui/ReasonDialog";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import { courses as initialCourses } from "../../mocks/data";
import type { Course } from "../../types";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "Published", label: "Published" },
  { value: "Draft", label: "Draft" },
  { value: "Unpublished", label: "Unpublished" },
  { value: "Suspended", label: "Suspended" },
];

export default function AdminCourses() {
  const [items, setItems] = useState(initialCourses);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Course | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (c) => (status === "all" || c.status === status) && (!q || c.title.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q)),
    );
  }, [items, query, status]);

  // TODO API: PUT /api/admin/courses/{id}/suspend with { reason }, PUT /api/admin/courses/{id}/restore
  function suspend(reason: string) {
    if (target) setItems((prev) => prev.map((c) => (c.id === target.id ? { ...c, status: "Suspended" as const, suspensionReason: reason } : c)));
    setTarget(null);
  }

  function restore(id: string) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Unpublished" as const, suspensionReason: undefined } : c)));
  }

  const columns: Column<Course>[] = [
    {
      header: "Course",
      cell: (c) => (
        <>
          <p className="font-semibold text-ink">{c.title}</p>
          <p className="text-xs text-muted">{c.category}</p>
        </>
      ),
    },
    { header: "Teacher", cell: (c) => c.teacher },
    { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
    { header: "Students", cell: (c) => c.students },
    {
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <Link to={`/courses/${c.id}`} className="btn btn-secondary btn-sm">
            View
          </Link>
          {c.status === "Suspended" ? (
            <button type="button" className="btn btn-outline-success btn-sm w-28" onClick={() => restore(c.id)}>
              <CheckCircle2 size={14} /> Restore
            </button>
          ) : (
            <button type="button" className="btn btn-outline-danger btn-sm w-28" onClick={() => setTarget(c)}>
              <Ban size={14} /> Suspend
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Courses" description="Review and moderate every course on the platform." />

      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by title or teacher..." />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        empty={<EmptyState icon={BookOpen} title="No courses found" description="Try a different search or status." />}
      />

      <ReasonDialog
        open={target !== null}
        title="Suspend this course?"
        description={`"${target?.title}" is hidden from students and its teacher is notified.`}
        confirmLabel="Suspend course"
        onClose={() => setTarget(null)}
        onConfirm={suspend}
      />
    </>
  );
}
