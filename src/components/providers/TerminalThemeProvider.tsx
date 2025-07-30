import { ReactNode, createContext, useContext, useEffect } from 'react';
import { TERMINAL_THEME, globalStyles } from '@/config/terminal.theme';
import { initializeTerminalCompliance } from '@/utils/terminalCompliance';

interface TerminalThemeContextType {
  theme: typeof TERMINAL_THEME;
  isTerminalMode: boolean;
}

const TerminalThemeContext = createContext<TerminalThemeContextType | undefined>(undefined);

interface TerminalThemeProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

/**
 * Bloomberg Terminal Theme Provider
 * Enables strict terminal theme compliance when activated
 */
export const TerminalThemeProvider = ({ 
  children, 
  enabled = true 
}: TerminalThemeProviderProps) => {
  
  useEffect(() => {
    if (enabled) {
      // Inject global terminal styles
      const styleElement = document.createElement('style');
      styleElement.id = 'terminal-theme-globals';
      styleElement.textContent = globalStyles;
      
      // Remove existing if present
      const existing = document.getElementById('terminal-theme-globals');
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(styleElement);
      
      // Add terminal mode class to body
      document.body.classList.add('terminal-mode');
      
      // Initialize terminal compliance enforcement - commented out temporarily
      // initializeTerminalCompliance();
      
      return () => {
        styleElement.remove();
        document.body.classList.remove('terminal-mode');
      };
    }
  }, [enabled]);

  const contextValue: TerminalThemeContextType = {
    theme: TERMINAL_THEME,
    isTerminalMode: enabled,
  };

  return (
    <TerminalThemeContext.Provider value={contextValue}>
      {children}
    </TerminalThemeContext.Provider>
  );
};

/**
 * Hook to access terminal theme context
 */
export const useTerminalThemeContext = () => {
  const context = useContext(TerminalThemeContext);
  if (context === undefined) {
    throw new Error('useTerminalThemeContext must be used within a TerminalThemeProvider');
  }
  return context;
};

/**
 * HOC for components that need terminal theme access
 */
export const withTerminalTheme = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <TerminalThemeProvider>
      <Component {...props} />
    </TerminalThemeProvider>
  );
};