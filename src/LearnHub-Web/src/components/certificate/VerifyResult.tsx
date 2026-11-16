import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Certificate } from "../../types";
import DescriptionList from "../ui/DescriptionList";

interface Props {
  code: string;
  /** Undefined when no certificate has this code. */
  certificate?: Certificate;
}

/** Variants: valid, revoked, not found. */
export default function VerifyResult({ code, certificate }: Props) {
  const variant = !certificate
    ? { icon: XCircle, tone: "text-danger-dark", eyebrow: "Not found", title: "Certificate not found" }
    : certificate.status === "Revoked"
      ? { icon: AlertTriangle, tone: "text-warning", eyebrow: "Revoked", title: "Certificate revoked" }
      : { icon: CheckCircle2, tone: "text-success", eyebrow: "Valid certificate", title: "Certificate is authentic" };
  const Icon = variant.icon;

  return (
    <section aria-live="polite" className="card-feature mt-10 p-6 sm:p-8">
      <p className={`eyebrow flex items-center gap-2 ${variant.tone}`}>
        <Icon size={16} aria-hidden="true" /> {variant.eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-bold text-ink">{variant.title}</h2>
      <p className="mt-1 font-mono text-sm text-muted">{certificate?.code ?? code}</p>

      {!certificate && <p className="mt-3 text-sm text-body">This code does not match any certificate in our system. Check it for typos.</p>}
      {certificate?.status === "Revoked" && (
        <p className="mt-3 text-sm text-body">This certificate has been revoked and is no longer valid.</p>
      )}
      {certificate?.status === "Valid" && (
        <DescriptionList
          className="mt-6"
          items={[
            { label: "Student", value: certificate.student },
            { label: "Course", value: certificate.course },
            { label: "Issued", value: certificate.date },
            { label: "Score", value: `${certificate.score}%` },
          ]}
        />
      )}
    </section>
  );
}
