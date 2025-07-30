import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { terminalCn, getTerminalContainer } from "@/utils/terminalCompliance";

interface TerminalContainerProps {
  children: ReactNode;
  variant?: 'tile' | 'modal' | 'header';
  className?: string;
}

export const TerminalContainer = ({ 
  children, 
  variant = 'tile', 
  className 
}: TerminalContainerProps) => {
  return (
    <div className={terminalCn(
      getTerminalContainer(variant),
      className
    )}>
      {children}
    </div>
  );
};