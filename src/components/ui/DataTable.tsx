import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  /** Renders the cell for one row. */
  cell: (row: T) => ReactNode;
  /** Visually hide the header (e.g. an actions column). It stays readable to screen readers. */
  hideHeader?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Below this width the table scrolls sideways instead of squashing. */
  minWidth?: number;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  minWidth = 800,
  emptyMessage = "Nothing to show yet.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface-muted/30">
      <table
        className="w-full border-collapse text-sm text-body"
        style={{ minWidth }}
      >
        <thead className="border-b border-line bg-input/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-5 py-3 text-left text-xs font-semibold text-muted"
              >
                {col.hideHeader ? (
                  <span className="sr-only">{col.header}</span>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-surface-muted/40">
                {columns.map((col) => (
                  <td key={col.header} className="px-5 py-4 align-middle">
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
