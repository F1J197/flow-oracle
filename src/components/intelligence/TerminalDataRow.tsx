import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalDataRowProps {
  label: string;
  value: string | number | ReactNode;
  status?: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical';
  className?: string;
}

export const TerminalDataRow = ({ label, value, status, className }: TerminalDataRowProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'positive': return 'text-neon-lime';
      case 'negative': return 'text-neon-orange';
      case 'warning': return 'text-neon-gold';
      case 'critical': return 'text-neon-fuchsia';
      default: return 'text-text-data';
    }
  };

  return (
    <div className={cn("terminal-row", className)}>
      <span className="terminal-label">{label}:</span>
      <span className={cn("terminal-value", getStatusColor())}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
};