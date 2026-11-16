import { Award, Ban, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable, { type Column } from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import FilterSelect from "../../components/ui/FilterSelect";
import PageHeader from "../../components/ui/PageHeader";
import ReasonDialog from "../../components/ui/ReasonDialog";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import { certificates as initialCertificates } from "../../mocks/data";
import type { Certificate } from "../../types";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "Valid", label: "Valid" },
  { value: "Revoked", label: "Revoked" },
];

export default function AdminCertificates() {
  const [items, setItems] = useState(initialCertificates);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Certificate | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!q || [c.code, c.student, c.course].some((text) => text.toLowerCase().includes(q))),
    );
  }, [items, query, status]);

  // TODO API: PUT /api/admin/certificates/{code}/revoke with { reason }, PUT /api/admin/certificates/{code}/restore
  const setCertificateStatus = (code: string, next: Certificate["status"]) =>
    setItems((prev) => prev.map((c) => (c.code === code ? { ...c, status: next } : c)));

  const columns: Column<Certificate>[] = [
    { header: "Code", cell: (c) => <span className="font-mono text-sm">{c.code}</span> },
    { header: "Student", cell: (c) => c.student },
    { header: "Course", cell: (c) => c.course },
    { header: "Issued", cell: (c) => c.date },
    { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
    {
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <Link to={`/verify/${c.code}`} className="btn btn-secondary btn-sm">
            View
          </Link>
          {c.status === "Revoked" ? (
            <button type="button" className="btn btn-outline-success btn-sm w-28" onClick={() => setCertificateStatus(c.code, "Valid")}>
              <CheckCircle2 size={14} /> Restore
            </button>
          ) : (
            <button type="button" className="btn btn-outline-danger btn-sm w-28" onClick={() => setTarget(c)}>
              <Ban size={14} /> Revoke
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Certificates" description="Search and revoke issued certificates." />

      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by code, student or course..." />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.code}
        empty={<EmptyState icon={Award} title="No certificates found" description="Try a different search or status." />}
      />

      <ReasonDialog
        open={target !== null}
        title="Revoke this certificate?"
        description={`Verification of ${target?.code} will show it as revoked.`}
        confirmLabel="Revoke certificate"
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) setCertificateStatus(target.code, "Revoked");
          setTarget(null);
        }}
      />
    </>
  );
}
