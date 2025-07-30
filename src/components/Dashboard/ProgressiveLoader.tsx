import { useEffect, useState } from 'react';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { Loader2 } from 'lucide-react';

interface ProgressiveLoaderProps {
  totalEngines: number;
  loadedEngines: number;
  currentEngine?: string;
  errors?: string[];
}

export const ProgressiveLoader = ({ 
  totalEngines, 
  loadedEngines, 
  currentEngine,
  errors = []
}: ProgressiveLoaderProps) => {
  const { theme } = useTerminalTheme();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const progress = totalEngines > 0 ? (loadedEngines / totalEngines) * 100 : 0;

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
      style={{ color: theme.colors.text.primary }}
    >
      {/* Terminal-style loader */}
      <div className="flex items-center space-x-3">
        <Loader2 
          className="animate-spin" 
          size={24}
          style={{ color: theme.colors.neon.teal }}
        />
        <div 
          className="text-xl"
          style={{ 
            fontFamily: theme.typography.terminal.mono.fontFamily,
            color: theme.colors.neon.teal,
          }}
        >
          LIQUIDITY² INITIALIZING{dots}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div 
          className="h-1 w-full border"
          style={{ 
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.neon.teal + '40',
          }}
        >
          <div 
            className="h-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              backgroundColor: theme.colors.neon.teal,
              boxShadow: `0 0 10px ${theme.colors.neon.teal}40`,
            }}
          />
        </div>
        
        {/* Progress text */}
        <div 
          className="flex justify-between mt-2 text-sm"
          style={{ 
            fontFamily: theme.typography.terminal.mono.fontFamily,
            color: theme.colors.text.secondary,
          }}
        >
          <span>Engines: {loadedEngines}/{totalEngines}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>

      {/* Current engine */}
      {currentEngine && (
        <div 
          className="text-sm"
          style={{ 
            fontFamily: theme.typography.terminal.mono.fontFamily,
            color: theme.colors.text.muted,
          }}
        >
          Loading: {currentEngine}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="w-full max-w-md space-y-1">
          {errors.map((error, index) => (
            <div 
              key={index}
              className="text-xs p-2 border"
              style={{ 
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.semantic.critical + '40',
                color: theme.colors.semantic.critical,
                fontFamily: theme.typography.terminal.mono.fontFamily,
              }}
            >
              ⚠ {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};