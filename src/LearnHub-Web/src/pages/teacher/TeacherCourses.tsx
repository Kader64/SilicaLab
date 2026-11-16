import { BookOpen, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import DataTable, { type Column } from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { courses } from "../../mocks/data";
import type { Course } from "../../types";

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
  { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
  { header: "Lessons", cell: (c) => c.lessons },
  { header: "Students", cell: (c) => c.students },
  {
    header: "Actions",
    hideHeader: true,
    className: "text-right",
    cell: (c) => (
      <Link to={`/teach/courses/${c.id}`} className="btn btn-secondary btn-sm">
        <Pencil size={14} /> Edit
      </Link>
    ),
  },
];

export default function TeacherCourses() {
  // TODO API: GET /api/teach/courses (only the courses of the logged-in teacher)
  const suspended = courses.filter((c) => c.status === "Suspended");

  return (
    <>
      <PageHeader
        title="My courses"
        description="Create, edit and publish your courses."
        actions={
          <Link to="/teach/courses/new" className="btn btn-primary">
            <Plus size={16} /> New course
          </Link>
        }
      />

      {suspended.map((c) => (
        <p key={c.id} role="alert" className="alert alert-danger mb-6">
          <strong>{c.title}</strong> was suspended by an admin. Reason:{" "}
          {c.suspensionReason ?? "not given"}.
        </p>
      ))}

      <DataTable
        columns={columns}
        rows={courses}
        rowKey={(c) => c.id}
        empty={
          <EmptyState
            icon={BookOpen}
            title="You have no courses yet"
            description="Create your first course and publish it when it is ready."
            action={
              <Link to="/teach/courses/new" className="btn btn-primary">
                <Plus size={16} /> New course
              </Link>
            }
          />
        }
      />
    </>
  );
}
