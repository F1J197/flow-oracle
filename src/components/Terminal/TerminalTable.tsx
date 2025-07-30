import { TERMINAL_THEME } from "@/config/terminal.theme";

interface TerminalTableProps {
  headers: string[];
  rows: string[][];
  highlight?: (rowIndex: number, cellValue: string) => boolean;
  className?: string;
}

export const TerminalTable = ({ 
  headers, 
  rows, 
  highlight,
  className = ''
}: TerminalTableProps) => {
  const tableStyle: React.CSSProperties = {
    fontFamily: TERMINAL_THEME.typography.terminal.mono.fontFamily,
    fontSize: TERMINAL_THEME.typography.scale.sm,
    color: TERMINAL_THEME.colors.text.primary,
    borderCollapse: 'collapse' as const,
    width: '100%',
    border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: TERMINAL_THEME.colors.background.primary,
    color: TERMINAL_THEME.colors.text.primary,
    fontWeight: TERMINAL_THEME.fonts.weights.semibold,
    padding: TERMINAL_THEME.layout.spacing.sm,
    borderBottom: `1px solid ${TERMINAL_THEME.colors.border.default}`,
    textAlign: 'left' as const,
  };

  const cellStyle: React.CSSProperties = {
    padding: TERMINAL_THEME.layout.spacing.sm,
    borderBottom: `1px solid ${TERMINAL_THEME.colors.border.muted}`,
    borderRight: `1px solid ${TERMINAL_THEME.colors.border.muted}`,
  };

  const getHighlightedCellStyle = (rowIndex: number, cellValue: string): React.CSSProperties => {
    if (highlight?.(rowIndex, cellValue)) {
      return {
        ...cellStyle,
        backgroundColor: `${TERMINAL_THEME.colors.semantic.warning}20`,
        color: TERMINAL_THEME.colors.semantic.warning,
        fontWeight: TERMINAL_THEME.fonts.weights.semibold,
      };
    }
    return cellStyle;
  };

  return (
    <div className={`terminal-table ${className}`}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={headerStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  style={getHighlightedCellStyle(rowIndex, cell)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};