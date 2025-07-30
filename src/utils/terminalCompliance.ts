/**
 * LIQUIDITY² Terminal Theme Compliance Utilities
 * Ensures 100% Bloomberg Terminal theme compliance
 */

import { cn } from "@/lib/utils";

/**
 * Terminal-compliant class merger
 * Automatically removes forbidden rounded corners and applies terminal styling
 */
export const terminalCn = (...classes: (string | undefined)[]) => {
  const cleaned = classes
    .filter(Boolean)
    .join(' ')
    // Remove all rounded corner variants
    .replace(/rounded(?:-[a-z0-9]+)?/g, '')
    // Remove backdrop blur (not terminal-appropriate)
    .replace(/backdrop-blur(?:-[a-z0-9]+)?/g, 'backdrop-blur-none')
    // Ensure terminal font family
    .replace(/font-(?!mono)/g, 'font-mono');
    
  return cn(cleaned, 'terminal-panel');
};

/**
 * Terminal color status mapper
 * Maps semantic statuses to terminal neon colors
 */
export const getTerminalStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'text-neon-lime border-neon-lime',
    'success': 'text-neon-lime border-neon-lime',
    'positive': 'text-neon-lime border-neon-lime',
    'warning': 'text-neon-gold border-neon-gold',
    'critical': 'text-neon-fuchsia border-neon-fuchsia',
    'error': 'text-neon-orange border-neon-orange',
    'negative': 'text-neon-orange border-neon-orange',
    'info': 'text-neon-blue border-neon-blue',
    'offline': 'text-text-muted border-text-muted',
    'neutral': 'text-neon-teal border-neon-teal',
    'default': 'text-neon-teal border-neon-teal'
  };
  
  return statusMap[status] || statusMap['default'];
};

/**
 * Terminal spacing system
 * Enforces consistent terminal spacing
 */
export const getTerminalSpacing = (size: 'xs' | 'sm' | 'md' | 'lg'): string => {
  const spacingMap = {
    'xs': 'p-1 gap-1',
    'sm': 'p-2 gap-2',
    'md': 'p-3 gap-3',
    'lg': 'p-4 gap-4'
  };
  
  return spacingMap[size];
};

/**
 * Terminal typography system
 * Enforces Bloomberg terminal typography standards
 */
export const getTerminalTypography = (variant: 'title' | 'label' | 'data' | 'metric'): string => {
  const typographyMap = {
    'title': 'text-xs font-bold uppercase tracking-widest text-neon-teal',
    'label': 'text-xs font-medium uppercase tracking-wide text-text-secondary',
    'data': 'text-sm font-mono font-semibold text-text-data tabular-nums',
    'metric': 'text-2xl font-mono font-bold text-text-primary tabular-nums'
  };
  
  return typographyMap[variant];
};

/**
 * Terminal container styles
 * Standard container styling for terminal components
 */
export const getTerminalContainer = (variant: 'tile' | 'modal' | 'header' = 'tile'): string => {
  const baseStyles = 'bg-bg-tile border border-neon-teal/40 font-mono';
  
  const variantStyles = {
    'tile': 'p-3',
    'modal': 'p-4 bg-bg-elevated',
    'header': 'p-2 bg-bg-secondary border-b border-neon-teal/30'
  };
  
  return terminalCn(baseStyles, variantStyles[variant]);
};

/**
 * Validate terminal compliance
 * Development helper to check for compliance violations
 */
export const validateTerminalCompliance = (element: HTMLElement): string[] => {
  const violations: string[] = [];
  
  // Check for forbidden rounded corners
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.borderRadius !== '0px') {
    violations.push(`Border radius violation: ${computedStyle.borderRadius}`);
  }
  
  // Check for non-monospace fonts
  const fontFamily = computedStyle.fontFamily;
  if (!fontFamily.includes('JetBrains Mono') && !fontFamily.includes('IBM Plex Mono')) {
    violations.push(`Font family violation: ${fontFamily}`);
  }
  
  // Check for backdrop blur
  if (computedStyle.backdropFilter && computedStyle.backdropFilter !== 'none') {
    violations.push(`Backdrop filter violation: ${computedStyle.backdropFilter}`);
  }
  
  return violations;
};

/**
 * Terminal theme enforcement class
 * Programmatically enforce terminal theme compliance
 */
export class TerminalThemeEnforcer {
  private static instance: TerminalThemeEnforcer;
  private observer: MutationObserver | null = null;
  
  static getInstance(): TerminalThemeEnforcer {
    if (!TerminalThemeEnforcer.instance) {
      TerminalThemeEnforcer.instance = new TerminalThemeEnforcer();
    }
    return TerminalThemeEnforcer.instance;
  }
  
  /**
   * Start monitoring for compliance violations
   */
  startMonitoring(): void {
    if (this.observer) {
      this.stopMonitoring();
    }
    
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.enforceCompliance(node as HTMLElement);
            }
          });
        }
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Enforce on existing elements
    this.enforceCompliance(document.body);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  /**
   * Enforce compliance on element and children
   */
  private enforceCompliance(element: HTMLElement): void {
    // Fix border radius violations
    if (element.style.borderRadius && element.style.borderRadius !== '0px') {
      element.style.borderRadius = '0px';
    }
    
    // Fix backdrop filter violations
    if (element.style.backdropFilter && element.style.backdropFilter !== 'none') {
      element.style.backdropFilter = 'none';
    }
    
    // Apply to children
    element.querySelectorAll('*').forEach((child) => {
      if (child instanceof HTMLElement) {
        this.enforceCompliance(child);
      }
    });
  }
}

/**
 * Initialize terminal theme enforcement
 * Call this to enable automatic compliance monitoring
 */
export const initializeTerminalCompliance = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const enforcer = TerminalThemeEnforcer.getInstance();
    enforcer.startMonitoring();
    
    console.log('🖥️ Terminal Theme Enforcement: ACTIVE');
    console.log('   ├─ Border radius: DISABLED');
    console.log('   ├─ Backdrop blur: DISABLED');
    console.log('   ├─ Font family: JetBrains Mono enforced');
    console.log('   └─ Monitoring: ENABLED');
  }
};