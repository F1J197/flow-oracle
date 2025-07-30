import { TERMINAL_THEME } from '@/config/terminal.theme';
import { useMemo } from 'react';

/**
 * Hook for accessing Bloomberg Terminal Theme
 * Provides type-safe access to theme values and utility functions
 */
export const useTerminalTheme = () => {
  const theme = useMemo(() => TERMINAL_THEME, []);

  // Utility functions for common theme operations
  const getStatusColor = (status: 'active' | 'warning' | 'critical' | 'offline' | 'success' | 'info') => {
    switch (status) {
      case 'active':
      case 'success':
        return theme.colors.semantic.success;
      case 'warning':
        return theme.colors.semantic.warning;
      case 'critical':
        return theme.colors.semantic.critical;
      case 'offline':
        return theme.colors.text.muted;
      case 'info':
        return theme.colors.semantic.info;
      default:
        return theme.colors.neon.teal;
    }
  };

  const getBorderOpacity = (state: 'default' | 'active' | 'muted') => {
    switch (state) {
      case 'active':
        return '0.5';
      case 'muted':
        return '0.1';
      default:
        return '0.3';
    }
  };

  const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => {
    return theme.layout.spacing[size];
  };

  const getTypography = (type: 'mono' | 'data' | 'label') => {
    return theme.typography.terminal[type];
  };

  return {
    theme,
    getStatusColor,
    getBorderOpacity,
    getSpacing,
    getTypography,
    colors: theme.colors,
    layout: theme.layout,
    typography: theme.typography,
    animations: theme.animations,
  };
};

export type TerminalThemeHook = ReturnType<typeof useTerminalTheme>;