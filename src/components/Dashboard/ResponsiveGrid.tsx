import { ReactNode, useMemo } from 'react';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveGrid = ({ children, className = '' }: ResponsiveGridProps) => {
  const { theme } = useTerminalTheme();

  const gridClasses = useMemo(() => {
    return [
      'grid',
      'auto-rows-fr',
      'gap-3 md:gap-4 lg:gap-5',
      // Responsive columns: 1 on mobile, 2 on tablet, 3-4 on desktop
      'grid-cols-1',
      'sm:grid-cols-2', 
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      // Dense grid flow for better tile packing
      'grid-flow-dense',
      className
    ].filter(Boolean).join(' ');
  }, [className]);

  return (
    <div 
      className={gridClasses}
      style={{
        padding: `${theme.layout.spacing.md} ${theme.layout.spacing.lg}`,
        minHeight: 'calc(100vh - 80px)', // Account for header height
      }}
    >
      {children}
    </div>
  );
};