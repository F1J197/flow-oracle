import { useEffect } from 'react';

export const ConsoleLogger = () => {
  useEffect(() => {
    console.log('🚀 Application starting...');
    console.log('📍 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      isDev: process.env.NODE_ENV === 'development',
      userAgent: navigator.userAgent,
      location: window.location.href
    });
    
    // Log CSS loading state
    const rootElement = document.documentElement;
    const computedStyles = window.getComputedStyle(rootElement);
    
    console.log('🎨 CSS System Check:', {
      '--bg-primary': computedStyles.getPropertyValue('--bg-primary'),
      '--text-primary': computedStyles.getPropertyValue('--text-primary'), 
      '--neon-teal': computedStyles.getPropertyValue('--neon-teal'),
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      bodyColor: window.getComputedStyle(document.body).color
    });

    // Check if we're in terminal mode
    const hasTerminalClass = document.body.classList.contains('terminal-mode');
    console.log('🖥️ Terminal Mode Active:', hasTerminalClass);
    
    // Font loading check
    console.log('🔤 Font Status:', {
      fontsReady: document.fonts.ready,
      fontFamily: window.getComputedStyle(document.body).fontFamily
    });

    // Component mount timing
    const startTime = performance.now();
    console.log('⏱️ Component mount time:', startTime, 'ms');
    
    return () => {
      const endTime = performance.now();
      console.log('⏱️ Component unmount after:', endTime - startTime, 'ms');
    };
  }, []);

  return null;
};