/**
 * Enhanced Dashboard View with Smart Grid System
 * Dynamic tile repositioning based on importance scores
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TERMINAL_THEME } from '@/config/terminal.theme';
import { SmartGrid } from './SmartGrid';
import { TerminalDataService } from '@/services/TerminalDataService';
import { DatabaseEngineOutput } from '@/types/database';
import { debugLogger } from '@/utils/debugLogger';

export const DashboardView: React.FC = () => {
  const [engineOutputs, setEngineOutputs] = useState<Map<string, DatabaseEngineOutput>>(new Map());
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const terminalService = TerminalDataService.getInstance();
    
    // Initialize service and get initial data
    const initializeDashboard = async () => {
      try {
        debugLogger.info('DASHBOARD', 'Initializing terminal dashboard');
        await terminalService.initialize();
        
        // Get initial engine outputs
        const initialOutputs = terminalService.getAllEngineOutputs();
        setEngineOutputs(initialOutputs);
        setIsLoading(false);
        setLastUpdate(new Date());
        
        debugLogger.info('DASHBOARD', `Loaded ${initialOutputs.size} engine outputs`);
      } catch (error: any) {
        debugLogger.error('DASHBOARD', 'Failed to initialize dashboard', error?.message);
        setIsLoading(false);
      }
    };
    
    // Subscribe to real-time updates
    const handleDataUpdate = (newOutputs: Map<string, DatabaseEngineOutput>) => {
      setEngineOutputs(new Map(newOutputs));
      setLastUpdate(new Date());
      debugLogger.info('DASHBOARD', `Updated ${newOutputs.size} engine outputs`);
    };
    
    terminalService.subscribe(handleDataUpdate);
    initializeDashboard();
    
    return () => {
      terminalService.unsubscribe(handleDataUpdate);
    };
  }, []);

  /**
   * Handle tile click for detailed view
   */
  const handleTileClick = (engineId: string) => {
    setSelectedEngine(selectedEngine === engineId ? null : engineId);
    debugLogger.info('DASHBOARD', `${selectedEngine === engineId ? 'Closed' : 'Opened'} engine details`, engineId);
  };

  /**
   * Trigger manual data refresh
   */
  const handleRefresh = async () => {
    const terminalService = TerminalDataService.getInstance();
    try {
      await terminalService.triggerDataUpdate();
      debugLogger.info('DASHBOARD', 'Manual refresh triggered');
    } catch (error: any) {
      debugLogger.error('DASHBOARD', 'Manual refresh failed', error?.message);
    }
  };

  /**
   * Calculate system health metrics
   */
  const calculateSystemHealth = () => {
    if (engineOutputs.size === 0) return 0;
    
    let totalConfidence = 0;
    engineOutputs.forEach(output => {
      totalConfidence += output.confidence || 0;
    });
    
    return totalConfidence / engineOutputs.size;
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: TERMINAL_THEME.colors.background.primary,
          color: TERMINAL_THEME.colors.text.primary,
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div 
            className="text-4xl font-bold mb-4"
            style={{ color: TERMINAL_THEME.colors.headers.primary }}
          >
            LIQUIDITY² TERMINAL
          </div>
          <div className="text-lg">
            INITIALIZING ENGINES...
          </div>
          <div className="mt-4">
            <div 
              className="w-16 h-1 rounded"
              style={{ backgroundColor: TERMINAL_THEME.colors.border.default }}
            >
              <motion.div
                className="h-full rounded"
                style={{ backgroundColor: TERMINAL_THEME.colors.headers.primary }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundColor: TERMINAL_THEME.colors.background.primary,
        fontFamily: TERMINAL_THEME.typography.fontFamily.mono
      }}
    >
      {/* Terminal Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 
            className="text-4xl font-bold tracking-wider"
            style={{ 
              color: TERMINAL_THEME.colors.headers.primary,
              textShadow: `0 0 10px ${TERMINAL_THEME.colors.headers.primary}40`
            }}
          >
            LIQUIDITY² TERMINAL
          </h1>
          
          <div className="flex items-center space-x-6">
            {/* System Health */}
            <div className="text-center">
              <div 
                className="text-xs uppercase tracking-wider"
                style={{ color: TERMINAL_THEME.colors.text.secondary }}
              >
                System Health
              </div>
              <div 
                className="text-xl font-bold"
                style={{ 
                  color: calculateSystemHealth() > 70 ? 
                    TERMINAL_THEME.colors.semantic.positive : 
                    calculateSystemHealth() > 40 ? 
                    TERMINAL_THEME.colors.semantic.warning : 
                    TERMINAL_THEME.colors.semantic.negative
                }}
              >
                {calculateSystemHealth().toFixed(0)}%
              </div>
            </div>
            
            {/* Last Update */}
            <div className="text-center">
              <div 
                className="text-xs uppercase tracking-wider"
                style={{ color: TERMINAL_THEME.colors.text.secondary }}
              >
                Last Update
              </div>
              <div 
                className="text-sm font-semibold"
                style={{ color: TERMINAL_THEME.colors.text.primary }}
              >
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-4 py-2 border text-sm font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: 'transparent',
                color: TERMINAL_THEME.colors.headers.primary,
                borderColor: TERMINAL_THEME.colors.headers.primary
              }}
            >
              REFRESH
            </motion.button>
          </div>
        </div>
        
        {/* Status Bar */}
        <div 
          className="h-px w-full"
          style={{ backgroundColor: TERMINAL_THEME.colors.border.default }}
        />
      </motion.div>

      {/* Smart Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <SmartGrid 
          engineOutputs={engineOutputs}
          onTileClick={handleTileClick}
        />
      </motion.div>

      {/* Selected Engine Detail Modal */}
      <AnimatePresence>
        {selectedEngine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedEngine(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl w-full mx-4 p-6 border"
              style={{
                backgroundColor: TERMINAL_THEME.colors.background.secondary,
                borderColor: TERMINAL_THEME.colors.border.important
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 
                  className="text-2xl font-bold uppercase tracking-wider"
                  style={{ color: TERMINAL_THEME.colors.headers.primary }}
                >
                  {selectedEngine} DETAILS
                </h2>
                <button
                  onClick={() => setSelectedEngine(null)}
                  className="text-2xl"
                  style={{ color: TERMINAL_THEME.colors.text.secondary }}
                >
                  ×
                </button>
              </div>
              
              {/* Engine details would go here */}
              <div 
                className="text-sm"
                style={{ color: TERMINAL_THEME.colors.text.primary }}
              >
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(engineOutputs.get(selectedEngine), null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};