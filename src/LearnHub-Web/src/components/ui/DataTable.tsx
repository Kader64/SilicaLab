import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideHeader?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty: ReactNode;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
}: Props<T>) {
  if (rows.length === 0) return <div className="card">{empty}</div>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-190">
        <thead className="table-head">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className="th">
                <span className={cn(c.hideHeader && "sr-only")}>
                  {c.header}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.header} className={cn("td", c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
