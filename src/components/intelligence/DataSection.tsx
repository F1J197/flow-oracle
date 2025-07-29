import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const DataSection = ({ 
  title, 
  children, 
  className,
  collapsible = false,
  defaultOpen = true 
}: DataSectionProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="section-divider">
        <span>{title}</span>
      </div>
      <div className="pl-4">
        {children}
      </div>
    </div>
  );
};