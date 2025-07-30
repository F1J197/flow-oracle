import { useTerminalTheme } from '@/hooks/useTerminalTheme';
import { Clock, Activity, Database } from 'lucide-react';

interface DashboardHeaderProps {
  systemHealth: number;
  totalEngines: number;
  activeEngines: number;
  lastUpdate?: Date;
}

export const DashboardHeader = ({
  systemHealth,
  totalEngines,
  activeEngines,
  lastUpdate
}: DashboardHeaderProps) => {
  const { theme } = useTerminalTheme();

  const formatTime = (date?: Date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getHealthStatus = () => {
    if (systemHealth >= 90) return { color: theme.colors.semantic.success, text: 'OPTIMAL' };
    if (systemHealth >= 70) return { color: theme.colors.semantic.warning, text: 'DEGRADED' };
    return { color: theme.colors.semantic.critical, text: 'CRITICAL' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div 
      className="w-full border-b"
      style={{
        backgroundColor: theme.colors.background.tile,
        borderColor: theme.colors.border.default,
        padding: theme.layout.spacing.lg,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Main Title */}
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{
              color: theme.colors.text.primary,
              fontFamily: theme.typography.terminal.mono.fontFamily,
            }}
          >
            LIQUIDITY² DASHBOARD
          </h1>
          <p 
            className="text-sm mt-1"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.terminal.mono.fontFamily,
            }}
          >
            Real-time Market Intelligence System
          </p>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-6">
          {/* System Health */}
          <div className="flex items-center gap-2">
            <Activity 
              size={16} 
              style={{ color: healthStatus.color }}
            />
            <div>
              <div 
                className="text-xs uppercase tracking-wider"
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.terminal.label.fontFamily,
                }}
              >
                SYS HEALTH
              </div>
              <div 
                className="text-sm font-semibold"
                style={{
                  color: healthStatus.color,
                  fontFamily: theme.typography.terminal.data.fontFamily,
                }}
              >
                {healthStatus.text} {systemHealth.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Engine Status */}
          <div className="flex items-center gap-2">
            <Database 
              size={16} 
              style={{ color: theme.colors.neon.teal }}
            />
            <div>
              <div 
                className="text-xs uppercase tracking-wider"
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.terminal.label.fontFamily,
                }}
              >
                ENGINES
              </div>
              <div 
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.terminal.data.fontFamily,
                }}
              >
                {activeEngines}/{totalEngines} ACTIVE
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-2">
            <Clock 
              size={16} 
              style={{ color: theme.colors.neon.lime }}
            />
            <div>
              <div 
                className="text-xs uppercase tracking-wider"
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.terminal.label.fontFamily,
                }}
              >
                LAST UPDATE
              </div>
              <div 
                className="text-sm font-semibold"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.terminal.data.fontFamily,
                }}
              >
                {formatTime(lastUpdate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};