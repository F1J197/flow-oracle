import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, X, Calculator } from 'lucide-react';
import { Alert, PositionSizingRecommendation } from '@/engines/synthesis/AlertEngine';
import { TERMINAL_THEME } from '@/config/terminal.theme';

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
  onShowPositionSizing: (recommendation: PositionSizingRecommendation) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  onDismiss,
  onShowPositionSizing
}) => {
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    const critical = alerts.filter(alert => alert.level === 'critical');
    setCriticalAlerts(critical);
    
    // Show full-screen overlay for critical alerts
    if (critical.length > 0 && !showFullScreen) {
      setShowFullScreen(true);
    }
  }, [alerts]);

  const getAlertIcon = (level: Alert['level']) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getAlertColor = (level: Alert['level']) => {
    switch (level) {
      case 'critical':
        return TERMINAL_THEME.colors.semantic.negative;
      case 'warning':
        return TERMINAL_THEME.colors.semantic.warning;
      default:
        return TERMINAL_THEME.colors.semantic.info;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Critical Alert Full-Screen Modal
  const CriticalAlertModal = () => (
    <AnimatePresence>
      {showFullScreen && criticalAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: `${TERMINAL_THEME.colors.semantic.negative}20`,
            backdropFilter: 'blur(8px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-8 rounded-lg max-w-2xl w-full mx-4"
            style={{
              backgroundColor: TERMINAL_THEME.colors.background.primary,
              border: `2px solid ${TERMINAL_THEME.colors.semantic.negative}`,
              boxShadow: `0 0 30px ${TERMINAL_THEME.colors.semantic.negative}40`
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded"
                  style={{ backgroundColor: `${TERMINAL_THEME.colors.semantic.negative}20` }}
                >
                  <AlertTriangle 
                    className="w-8 h-8" 
                    style={{ color: TERMINAL_THEME.colors.semantic.negative }}
                  />
                </div>
                <div>
                  <h2 
                    className="text-2xl font-bold"
                    style={{ 
                      color: TERMINAL_THEME.colors.semantic.negative,
                      fontFamily: TERMINAL_THEME.typography.fontFamily.mono 
                    }}
                  >
                    CRITICAL ALERTS
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: TERMINAL_THEME.colors.text.secondary }}
                  >
                    Immediate attention required
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullScreen(false)}
                className="p-2 rounded hover:bg-gray-800 transition-colors"
                style={{ color: TERMINAL_THEME.colors.text.secondary }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Critical Alerts List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {criticalAlerts.map(alert => (
                <CriticalAlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onDismiss={onDismiss}
                  onShowPositionSizing={onShowPositionSizing}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  criticalAlerts.forEach(alert => onDismiss(alert.id));
                  setShowFullScreen(false);
                }}
                className="px-6 py-2 rounded transition-colors"
                style={{
                  backgroundColor: TERMINAL_THEME.colors.background.secondary,
                  color: TERMINAL_THEME.colors.text.primary,
                  border: `1px solid ${TERMINAL_THEME.colors.border.default}`
                }}
              >
                Dismiss All
              </button>
              <button
                onClick={() => setShowFullScreen(false)}
                className="px-6 py-2 rounded transition-colors"
                style={{
                  backgroundColor: TERMINAL_THEME.colors.semantic.negative,
                  color: TERMINAL_THEME.colors.text.primary
                }}
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Non-critical alerts toast system
  const ToastAlerts = () => (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-md">
      <AnimatePresence>
        {alerts
          .filter(alert => alert.level !== 'critical')
          .slice(0, 5) // Show max 5 toasts
          .map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className="p-4 rounded-lg shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: `${TERMINAL_THEME.colors.background.secondary}E6`,
                border: `1px solid ${getAlertColor(alert.level)}`,
                fontFamily: TERMINAL_THEME.typography.fontFamily.mono
              }}
            >
              <div className="flex items-start justify-between space-x-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div style={{ color: getAlertColor(alert.level) }}>
                    {getAlertIcon(alert.level)}
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium mb-1"
                      style={{ color: TERMINAL_THEME.colors.text.primary }}
                    >
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs"
                        style={{ color: TERMINAL_THEME.colors.text.secondary }}
                      >
                        {alert.engineId} • {formatTimestamp(alert.timestamp)}
                      </span>
                      {alert.actionable && alert.positionSizing && (
                        <button
                          onClick={() => onShowPositionSizing(alert.positionSizing!)}
                          className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
                          style={{ 
                            color: TERMINAL_THEME.colors.semantic.info,
                            border: `1px solid ${TERMINAL_THEME.colors.semantic.info}`
                          }}
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Size</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <CriticalAlertModal />
      <ToastAlerts />
    </>
  );
};

// Critical Alert Card Component
const CriticalAlertCard: React.FC<{
  alert: Alert;
  onDismiss: (id: string) => void;
  onShowPositionSizing: (rec: PositionSizingRecommendation) => void;
}> = ({ alert, onDismiss, onShowPositionSizing }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
  <div 
    className="p-4 rounded-lg"
    style={{
      backgroundColor: `${TERMINAL_THEME.colors.semantic.negative}10`,
      border: `1px solid ${TERMINAL_THEME.colors.semantic.negative}`
    }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span 
            className="px-2 py-1 text-xs font-bold rounded"
            style={{
              backgroundColor: TERMINAL_THEME.colors.semantic.negative,
              color: TERMINAL_THEME.colors.text.primary
            }}
          >
            {alert.engineId.toUpperCase()}
          </span>
          <span 
            className="text-xs"
            style={{ color: TERMINAL_THEME.colors.text.secondary }}
          >
            {formatTimestamp(alert.timestamp)}
          </span>
        </div>
        <p 
          className="text-base font-medium mb-3"
          style={{ 
            color: TERMINAL_THEME.colors.text.primary,
            fontFamily: TERMINAL_THEME.typography.fontFamily.mono
          }}
        >
          {alert.message}
        </p>
        
        {alert.actionable && alert.positionSizing && (
          <div className="flex space-x-3">
            <button
              onClick={() => onShowPositionSizing(alert.positionSizing!)}
              className="px-4 py-2 rounded transition-colors flex items-center space-x-2"
              style={{
                backgroundColor: TERMINAL_THEME.colors.semantic.info,
                color: TERMINAL_THEME.colors.text.primary
              }}
            >
              <Calculator className="w-4 h-4" />
              <span>Position Sizing</span>
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onDismiss(alert.id)}
        className="p-1 rounded hover:bg-gray-700 transition-colors ml-4"
        style={{ color: TERMINAL_THEME.colors.text.secondary }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
  );
};