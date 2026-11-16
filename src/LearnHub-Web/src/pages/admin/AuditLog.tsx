import { ScrollText } from "lucide-react";
import { useMemo, useState } from "react";
import DataTable, { type Column } from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import FilterSelect from "../../components/ui/FilterSelect";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import { formatAction } from "../../lib/format";
import { auditLog } from "../../mocks/data";
import type { AuditEntry } from "../../types";

const DAY_MS = 24 * 60 * 60 * 1000;

const actionOptions = [
  { value: "all", label: "All actions" },
  ...[...new Set(auditLog.map((e) => e.action))].map((action) => ({ value: action, label: formatAction(action) })),
];

const periodOptions = [
  { value: "all", label: "Any time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

const columns: Column<AuditEntry>[] = [
  { header: "Time", cell: (e) => <span className="whitespace-nowrap text-muted">{e.time}</span> },
  { header: "Actor", cell: (e) => e.actor },
  { header: "Action", cell: (e) => <span className="font-semibold text-ink">{formatAction(e.action)}</span> },
  { header: "Target", cell: (e) => e.target },
  { header: "Details", cell: (e) => <span className="text-muted">{e.details}</span> },
];

export default function AuditLog() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");
  const [period, setPeriod] = useState("all");
  const [now] = useState(() => Date.now());

  // TODO API: GET /api/admin/audit?action=&period=&search=&page=
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLog.filter(
      (e) =>
        (action === "all" || e.action === action) &&
        (period === "all" || now - new Date(e.at).getTime() <= Number(period) * DAY_MS) &&
        (!q || [e.actor, e.target, e.details].some((text) => text.toLowerCase().includes(q))),
    );
  }, [query, action, period, now]);

  return (
    <>
      <PageHeader title="Audit log" description="Every admin action is recorded here." />

      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search actor, target or details..." />
        <FilterSelect label="Action" value={action} onChange={setAction} options={actionOptions} className="sm:w-52" />
        <FilterSelect label="Period" value={period} onChange={setPeriod} options={periodOptions} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(e) => e.id}
        empty={<EmptyState icon={ScrollText} title="No entries found" description="Try a different search, action or period." />}
      />
    </>
  );
}
