import { ReactNode } from 'react';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { Header } from './Header';

interface ResponsiveLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'intelligence' | 'charts' | 'system';
}

export const ResponsiveLayout = ({ children, currentPage = 'dashboard' }: ResponsiveLayoutProps) => {
  const { theme } = useTerminalTheme();

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: theme.colors.background.primary,
        fontFamily: theme.typography.fontFamily.mono,
      }}
    >
      {/* Fixed Header */}
      <Header currentPage={currentPage} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};