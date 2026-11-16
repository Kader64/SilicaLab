import { Award, Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import DescriptionList from "../../components/ui/DescriptionList";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { myCertificates } from "../../mocks/data";

export default function Certificates() {
  // TODO API: GET /api/me/certificates
  if (myCertificates.length === 0) {
    return (
      <>
        <PageHeader title="Certificates" />
        <div className="card">
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Finish a course and pass its exam to earn your first certificate."
            action={
              <Link to="/my-learning" className="btn btn-primary">
                My learning
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Your certificates are verifiable by anyone with the code."
      />

      <ul className="grid gap-6 md:grid-cols-2">
        {myCertificates.map((c) => {
          const revoked = c.status === "Revoked";
          return (
            <li key={c.code} className="card-feature p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Award size={26} aria-hidden="true" />
                </span>
                <StatusBadge status={c.status} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-ink">{c.course}</h2>
              <DescriptionList
                className="mt-3"
                items={[
                  { label: "Issued", value: c.date },
                  { label: "Score", value: `${c.score}%` },
                  {
                    label: "Code",
                    value: <span className="font-mono">{c.code}</span>,
                  },
                ]}
              />

              <div className="mt-5 flex flex-wrap gap-3">
                {/* TODO API: GET /api/certificates/{code}/pdf */}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={revoked}
                >
                  <Download size={16} /> Download PDF
                </button>
                <Link to={`/verify/${c.code}`} className="btn btn-secondary">
                  <ExternalLink size={16} /> Verify
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
