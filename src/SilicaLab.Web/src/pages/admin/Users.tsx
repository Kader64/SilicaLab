import { Ban, CheckCircle2, Users as UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";
import RoleDialog from "../../components/admin/RoleDialog";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import FilterSelect from "../../components/ui/FilterSelect";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import { users as initialUsers } from "../../mocks/data";
import type { User, UserRole } from "../../types";

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "Student", label: "Student" },
  { value: "Teacher", label: "Teacher" },
  { value: "Admin", label: "Admin" },
];

export default function Users() {
  const [items, setItems] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [disableTarget, setDisableTarget] = useState<User | null>(null);

  const update = (id: string, patch: Partial<User>) =>
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (u) =>
        (role === "all" || u.role === role) &&
        (!q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)),
    );
  }, [items, query, role]);

  // TODO API: GET /api/admin/users, PUT /api/admin/users/{id}/role, PUT /api/admin/users/{id}/active
  const columns: Column<User>[] = [
    {
      header: "User",
      cell: (u) => (
        <>
          <p className="font-semibold text-ink">{u.name}</p>
          <p className="text-xs text-muted">{u.email}</p>
        </>
      ),
    },
    { header: "Role", cell: (u) => u.role },
    {
      header: "Status",
      cell: (u) => <StatusBadge status={u.active ? "Active" : "Disabled"} />,
    },
    { header: "Courses", cell: (u) => u.courses },
    { header: "Certificates", cell: (u) => u.certificates },
    {
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      cell: (u) =>
        u.role === "Admin" ? null : (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setRoleTarget(u)}
            >
              Change role
            </button>
            {u.active ? (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm w-28"
                onClick={() => setDisableTarget(u)}
              >
                <Ban size={14} /> Disable
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-success btn-sm w-28"
                onClick={() => update(u.id, { active: true })}
              >
                <CheckCircle2 size={14} /> Enable
              </button>
            )}
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Users" description="Manage roles and access." />

      <div className="toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name or email..."
        />
        <FilterSelect
          label="Role"
          value={role}
          onChange={setRole}
          options={roleOptions}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
        empty={
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="Try a different search or role."
          />
        }
      />

      <RoleDialog
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onConfirm={(newRole: UserRole) => {
          if (roleTarget) update(roleTarget.id, { role: newRole });
          setRoleTarget(null);
        }}
      />

      <ConfirmDialog
        open={disableTarget !== null}
        title="Disable this account?"
        tone="danger"
        confirmLabel="Disable account"
        onCancel={() => setDisableTarget(null)}
        onConfirm={() => {
          if (disableTarget) update(disableTarget.id, { active: false });
          setDisableTarget(null);
        }}
      >
        <p>
          <strong className="text-ink">{disableTarget?.name}</strong> will not
          be able to log in until the account is enabled again.
        </p>
      </ConfirmDialog>
    </>
  );
}
