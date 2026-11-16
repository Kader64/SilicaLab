import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="px-3 text-sm text-muted" aria-live="polite">
        Page {page} of {pageCount}
      </span>
      <button type="button" className="btn btn-secondary" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={16} />
      </button>
    </nav>
  );
}
