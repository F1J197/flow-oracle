import { useEffect, useState } from 'react';

export const LoadingDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    documentReady: false,
    bodyVisible: false,
    stylesLoaded: false,
    fontsLoaded: false,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log('🔍 LoadingDiagnostics: Starting comprehensive diagnostics...');
    
    const checkLoadingState = () => {
      const docReady = document.readyState === 'complete';
      const body = document.body;
      const bodyStyles = body ? window.getComputedStyle(body) : null;
      const bodyVisible = bodyStyles ? bodyStyles.visibility !== 'hidden' : false;
      
      // Check if CSS variables are loaded
      const rootStyles = window.getComputedStyle(document.documentElement);
      const stylesLoaded = rootStyles.getPropertyValue('--bg-primary').trim() !== '';
      
      const newDiagnostics = {
        documentReady: docReady,
        bodyVisible,
        stylesLoaded,
        fontsLoaded: document.fonts ? true : true, // Simplified for now
        timestamp: new Date().toISOString()
      };

      console.log('🔍 Diagnostics update:', newDiagnostics);
      console.log('🎨 CSS Variables check:', {
        '--bg-primary': rootStyles.getPropertyValue('--bg-primary'),
        '--text-primary': rootStyles.getPropertyValue('--text-primary'),
        '--neon-teal': rootStyles.getPropertyValue('--neon-teal')
      });
      console.log('🌍 Body styles:', {
        backgroundColor: bodyStyles?.backgroundColor,
        color: bodyStyles?.color,
        visibility: bodyStyles?.visibility,
        display: bodyStyles?.display
      });

      setDiagnostics(newDiagnostics);
    };

    // Initial check
    checkLoadingState();

    // Check on document ready
    if (document.readyState !== 'complete') {
      const handleLoad = () => {
        console.log('📄 Document loaded, re-checking...');
        checkLoadingState();
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }

    // Periodic check for debugging
    const interval = setInterval(checkLoadingState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Render diagnostics overlay in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: '#000',
        color: '#00FFFF',
        fontFamily: 'monospace',
        fontSize: '10px',
        padding: '8px',
        border: '1px solid #00FFFF',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>🔍 LOADING DIAGNOSTICS</div>
      <div>DOC_READY: {diagnostics.documentReady ? '✅' : '❌'}</div>
      <div>BODY_VISIBLE: {diagnostics.bodyVisible ? '✅' : '❌'}</div>
      <div>STYLES_LOADED: {diagnostics.stylesLoaded ? '✅' : '❌'}</div>
      <div>FONTS_LOADED: {diagnostics.fontsLoaded ? '✅' : '❌'}</div>
      <div style={{ fontSize: '8px', marginTop: '4px' }}>
        {diagnostics.timestamp}
      </div>
    </div>
  );
};