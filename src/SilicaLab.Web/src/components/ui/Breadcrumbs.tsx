import { Link } from "react-router-dom";

interface Props {
  items: { label: string; to?: string }[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm font-medium text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map(({ label, to }, i) => (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {to ? (
              <Link to={to} className="transition-colors hover:text-ink">
                {label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
