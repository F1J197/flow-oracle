import { ReactNode } from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { TERMINAL_THEME } from '@/config/terminal.theme';

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Global Motion Provider for Terminal Animations
 * Provides optimized motion configuration for Bloomberg-style animations
 */
export const MotionProvider = ({ children }: MotionProviderProps) => {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        transition={{ 
          duration: parseFloat(TERMINAL_THEME.animations.normal) / 1000,
          ease: [0.4, 0, 0.2, 1]
        }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
};

/**
 * Common animation variants for terminal components
 */
export const terminalAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  glow: {
    initial: { boxShadow: 'none' },
    animate: { 
      boxShadow: `0 0 20px ${TERMINAL_THEME.colors.headers.primary}40` 
    },
    hover: { 
      boxShadow: `0 0 30px ${TERMINAL_THEME.colors.headers.primary}60` 
    }
  },
  tile: {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  },
  metric: {
    initial: { scale: 1 },
    update: { 
      scale: [1, 1.1, 1],
      transition: { duration: 0.4, ease: 'easeInOut' }
    }
  }
};