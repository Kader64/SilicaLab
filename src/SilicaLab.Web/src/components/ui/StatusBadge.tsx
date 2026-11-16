import { cn } from "../../lib/cn";
import type { CertificateStatus, CourseStatus } from "../../types";

export type Status = CourseStatus | CertificateStatus | "Active" | "Disabled";

const variants: Record<Status, string> = {
  Draft: "badge-neutral",
  Unpublished: "badge-warning",
  Published: "badge-success",
  Suspended: "badge-danger",
  Valid: "badge-success",
  Revoked: "badge-danger",
  Active: "badge-success",
  Disabled: "badge-danger",
};

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("badge", variants[status])}>{status}</span>;
}
