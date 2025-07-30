import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { terminalCn } from "@/utils/terminalCompliance";

interface TerminalTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TerminalTableProps {
  columns: TerminalTableColumn[];
  data: Record<string, any>[];
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
  className?: string;
}

export const TerminalTable = ({ 
  columns, 
  data, 
  size = 'md',
  striped = true,
  bordered = true,
  className 
}: TerminalTableProps) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1';
      case 'md': return 'px-3 py-2';
      case 'lg': return 'px-4 py-3';
      default: return 'px-3 py-2';
    }
  };

  const getAlignment = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className={terminalCn(
      "terminal-table overflow-x-auto",
      bordered && "border border-glass-border rounded-md",
      className
    )}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-glass-border bg-bg-secondary">
            {columns.map((column) => (
              <th
                key={column.key}
                className={terminalCn(
                  "terminal-label font-medium text-text-primary",
                  getSize(),
                  getPadding(),
                  getAlignment(column.align)
                )}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={terminalCn(
                "terminal-row transition-colors hover:bg-glass-bg",
                striped && rowIndex % 2 === 1 && "bg-glass-bg/50",
                rowIndex < data.length - 1 && "border-b border-glass-border/50"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={terminalCn(
                    "terminal-data",
                    getSize(),
                    getPadding(),
                    getAlignment(column.align)
                  )}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};