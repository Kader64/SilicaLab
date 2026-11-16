import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatAction } from "../../lib/format";
import {
  auditLog,
  coursesByStatus,
  dashboardStats,
  usersByRole,
} from "../../mocks/data";

export default function Dashboard() {
  // TODO API: GET /api/admin/stats
  return (
    <>
      <PageHeader title="Dashboard" description="Platform overview." />

      <div className="card mb-8 grid gap-px overflow-hidden bg-line sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-bold text-ink">Courses by status</h2>
          <ul className="mt-4 divide-y divide-line">
            {coursesByStatus.map(({ status, value }) => (
              <li
                key={status}
                className="flex items-center justify-between py-2.5"
              >
                <StatusBadge status={status} />
                <span className="font-semibold tabular-nums text-ink">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-bold text-ink">Users by role</h2>
          <ul className="mt-4 divide-y divide-line">
            {usersByRole.map(({ label, value }) => (
              <li
                key={label}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-body">{label}</span>
                <span className="font-semibold tabular-nums text-ink">
                  {value.toLocaleString("en")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink">Recent activity</h2>
          <Link to="/admin/audit" className="link text-sm">
            View audit log
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {auditLog.slice(0, 4).map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 py-3 text-sm"
            >
              <span>
                <span className="font-semibold text-ink">
                  {formatAction(entry.action)}
                </span>
                <span className="text-muted"> · {entry.target}</span>
              </span>
              <span className="text-xs text-muted">{entry.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
