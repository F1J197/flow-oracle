import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'tile' | 'modal';
}

export const TerminalContainer = ({ 
  children, 
  className,
  variant = 'default'
}: TerminalContainerProps) => {
  return (
    <div className={cn(
      "terminal-container bg-bg-primary text-text-primary font-mono",
      variant === 'tile' && "bg-bg-tile rounded-lg border border-glass-border p-4",
      variant === 'modal' && "bg-bg-secondary rounded-lg border border-neon-teal/20 p-6",
      className
    )}>
      {children}
    </div>
  );
};