import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableRow {
  [key: string]: string | number | ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: DataTableRow[];
  className?: string;
}

export const DataTable = ({ columns, data, className }: DataTableProps) => {
  return (
    <div className={cn("mono-table border border-glass-border/50 overflow-hidden terminal-panel", className)}>
      {/* Table Header */}
      <div className="mono-table-row">
        {columns.map((column) => (
          <div 
            key={column.key}
            className={cn(
              "mono-table-cell mono-table-header",
              `text-${column.align || 'left'}`
            )}
            style={{ width: column.width }}
          >
            {column.label}
          </div>
        ))}
      </div>
      
      {/* Table Body */}
      {data.map((row, index) => (
        <div key={index} className="mono-table-row hover:bg-glass-bg/30 transition-colors">
          {columns.map((column) => (
            <div 
              key={column.key}
              className={cn(
                "mono-table-cell",
                `text-${column.align || 'left'}`,
                typeof row[column.key] === 'number' && "tabular-nums"
              )}
            >
              {row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};