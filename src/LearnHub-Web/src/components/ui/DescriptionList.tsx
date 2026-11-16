import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  items: { label: string; value: ReactNode }[];
  className?: string;
}

export default function DescriptionList({ items, className }: Props) {
  return (
    <dl className={cn("divide-y divide-line text-sm", className)}>
      {items.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-4 py-3">
          <dt className="text-muted">{label}</dt>
          <dd className="text-right font-semibold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
