/**
 * Noir & Neon Theme Provider - Phase 1 Implementation
 * Global theme provider for the LIQUIDITY² Terminal
 * Implements complete "Noir & Neon" design system with glassmorphism elements
 */

import { ReactNode, createContext, useContext, useEffect } from 'react';
import { NOIR_NEON_THEME, NoirNeonTheme } from '@/config/noirNeon.theme';

interface NoirNeonThemeContextType {
  theme: NoirNeonTheme;
  isDarkMode: boolean;
  isGlassmorphismEnabled: boolean;
}

const NoirNeonThemeContext = createContext<NoirNeonThemeContextType | undefined>(undefined);

interface NoirNeonThemeProviderProps {
  children: ReactNode;
  glassmorphism?: boolean;
}

/**
 * Noir & Neon Theme Provider
 * Provides Bloomberg Terminal-inspired aesthetic with modern glassmorphism
 */
export const NoirNeonThemeProvider = ({ 
  children, 
  glassmorphism = true 
}: NoirNeonThemeProviderProps) => {
  
  useEffect(() => {
    // Apply theme CSS variables to document root
    const root = document.documentElement;
    
    // Background colors
    root.style.setProperty('--bg-primary', NOIR_NEON_THEME.colors.background.primary);
    root.style.setProperty('--bg-secondary', NOIR_NEON_THEME.colors.background.secondary);
    root.style.setProperty('--bg-tile', NOIR_NEON_THEME.colors.background.tile);
    root.style.setProperty('--bg-elevated', NOIR_NEON_THEME.colors.background.elevated);
    
    // Neon colors
    root.style.setProperty('--neon-teal', NOIR_NEON_THEME.colors.neon.teal);
    root.style.setProperty('--neon-orange', NOIR_NEON_THEME.colors.neon.orange);
    root.style.setProperty('--neon-lime', NOIR_NEON_THEME.colors.neon.lime);
    root.style.setProperty('--neon-fuchsia', NOIR_NEON_THEME.colors.neon.fuchsia);
    root.style.setProperty('--neon-gold', NOIR_NEON_THEME.colors.neon.gold);
    root.style.setProperty('--neon-blue', NOIR_NEON_THEME.colors.neon.blue);
    root.style.setProperty('--neon-amber', NOIR_NEON_THEME.colors.neon.amber);
    
    // Text colors
    root.style.setProperty('--text-primary', NOIR_NEON_THEME.colors.text.primary);
    root.style.setProperty('--text-secondary', NOIR_NEON_THEME.colors.text.secondary);
    root.style.setProperty('--text-muted', NOIR_NEON_THEME.colors.text.muted);
    root.style.setProperty('--text-accent', NOIR_NEON_THEME.colors.text.accent);
    
    // Semantic colors
    root.style.setProperty('--color-positive', NOIR_NEON_THEME.colors.semantic.positive);
    root.style.setProperty('--color-negative', NOIR_NEON_THEME.colors.semantic.negative);
    root.style.setProperty('--color-warning', NOIR_NEON_THEME.colors.semantic.warning);
    root.style.setProperty('--color-critical', NOIR_NEON_THEME.colors.semantic.critical);
    root.style.setProperty('--color-info', NOIR_NEON_THEME.colors.semantic.info);
    
    // Glass effects
    root.style.setProperty('--glass-bg', NOIR_NEON_THEME.colors.glass.background);
    root.style.setProperty('--glass-border', NOIR_NEON_THEME.colors.glass.border);
    root.style.setProperty('--glass-border-active', NOIR_NEON_THEME.colors.glass.borderActive);
    
    // Add theme classes to body
    document.body.classList.add('noir-neon-theme');
    if (glassmorphism) {
      document.body.classList.add('glassmorphism-enabled');
    }
    
    // Set font family
    document.body.style.fontFamily = NOIR_NEON_THEME.typography.fontFamily.mono;
    
    return () => {
      document.body.classList.remove('noir-neon-theme', 'glassmorphism-enabled');
    };
  }, [glassmorphism]);

  const contextValue: NoirNeonThemeContextType = {
    theme: NOIR_NEON_THEME,
    isDarkMode: true, // Always dark mode for terminal
    isGlassmorphismEnabled: glassmorphism,
  };

  return (
    <NoirNeonThemeContext.Provider value={contextValue}>
      {children}
    </NoirNeonThemeContext.Provider>
  );
};

/**
 * Hook to access Noir & Neon theme context
 */
export const useNoirNeonTheme = () => {
  const context = useContext(NoirNeonThemeContext);
  if (context === undefined) {
    throw new Error('useNoirNeonTheme must be used within a NoirNeonThemeProvider');
  }
  return context;
};

/**
 * HOC for components that need theme access
 */
export const withNoirNeonTheme = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <NoirNeonThemeProvider>
      <Component {...props} />
    </NoirNeonThemeProvider>
  );
};

/**
 * Theme utility hooks for common operations
 */
export const useThemeColors = () => {
  const { theme } = useNoirNeonTheme();
  return {
    neon: theme.colors.neon,
    semantic: theme.colors.semantic,
    background: theme.colors.background,
    text: theme.colors.text,
    glass: theme.colors.glass,
    status: theme.colors.status
  };
};

export const useThemeUtils = () => {
  const { theme } = useNoirNeonTheme();
  
  const getSemanticColor = (type: 'positive' | 'negative' | 'warning' | 'critical' | 'info' | 'neutral') => {
    return theme.colors.semantic[type];
  };
  
  const getNeonGlow = (color: keyof typeof theme.colors.neon) => {
    return `0 0 20px ${theme.colors.neon[color]}40`;
  };
  
  const getStatusColor = (status: 'online' | 'warning' | 'critical' | 'offline') => {
    return theme.colors.status[status];
  };
  
  return {
    getSemanticColor,
    getNeonGlow,
    getStatusColor,
    spacing: theme.spacing,
    typography: theme.typography,
    animations: theme.animations
  };
};