import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalDataSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const TerminalDataSection = ({ title, children, className }: TerminalDataSectionProps) => {
  return (
    <div className={cn("terminal-section", className)}>
      <div className="terminal-section-header">
        {title}
      </div>
      <div className="terminal-section-divider"></div>
      <div className="terminal-section-content">
        {children}
      </div>
    </div>
  );
};