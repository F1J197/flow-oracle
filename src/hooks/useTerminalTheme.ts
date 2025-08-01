import { TERMINAL_THEME } from '@/config/theme';
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
        return theme.colors.semantic.positive;
      case 'warning':
        return theme.colors.semantic.warning;
      case 'critical':
        return theme.colors.semantic.negative;
      case 'offline':
        return theme.colors.text.secondary;
      case 'info':
        return theme.colors.semantic.info;
      default:
        return theme.colors.semantic.info;
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

  const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    return theme.spacing[size];
  };

  const getTypography = (variant: 'micro' | 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge') => {
    return theme.typography.sizes[variant];
  };

  return {
    theme,
    getStatusColor,
    getBorderOpacity,
    getSpacing,
    getTypography,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
  };
};

export type TerminalThemeHook = ReturnType<typeof useTerminalTheme>;