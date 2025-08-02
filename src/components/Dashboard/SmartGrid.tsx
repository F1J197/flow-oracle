/**
 * Smart Grid - Dynamic Tile Repositioning System
 * Automatically reorders tiles based on importance scores
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TERMINAL_THEME } from '@/config/terminal.theme';
import { EngineOutput } from '@/engines/BaseEngine';
import { ENGINE_REGISTRY } from '@/config/engine.registry';
import { SmartTile } from '@/components/dashboard/SmartTile';

interface SmartGridProps {
  engineOutputs: Map<string, any>;
  onTileClick?: (engineId: string) => void;
}

interface TileData {
  engineId: string;
  engineName: string;
  output: EngineOutput;
  importance: number;
  size: 'small' | 'medium' | 'large';
}

export const SmartGrid: React.FC<SmartGridProps> = ({
  engineOutputs,
  onTileClick
}) => {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const newTiles: TileData[] = [];
    
    engineOutputs.forEach((output, engineId) => {
      const engineConfig = ENGINE_REGISTRY[engineId];
      if (!engineConfig) return;
      
      const importance = calculateImportanceScore(output, engineConfig);
      const size = determineTileSize(importance);
      
      newTiles.push({
        engineId,
        engineName: engineConfig.name,
        output,
        importance,
        size
      });
    });
    
    // Sort by importance (highest first)
    newTiles.sort((a, b) => b.importance - a.importance);
    
    setTiles(newTiles);
    setLastUpdate(Date.now());
  }, [engineOutputs]);

  /**
   * Calculate importance score (0-100) based on multiple factors
   */
  const calculateImportanceScore = (output: EngineOutput, config: any): number => {
    let score = config.priority || 50; // Base priority from config
    
    // Signal urgency modifier
    switch (output.signal) {
      case 'RISK_OFF':
        score += 25; // High urgency
        break;
      case 'WARNING':
        score += 15;
        break;
      case 'RISK_ON':
        score += 10;
        break;
      case 'NEUTRAL':
        score += 0;
        break;
    }
    
    // Confidence modifier (higher confidence = more important)
    score += (output.confidence - 50) * 0.3;
    
    // Recent change magnitude
    const changeAbs = Math.abs(output.primaryMetric.changePercent || 0);
    if (changeAbs > 10) score += 20;
    else if (changeAbs > 5) score += 10;
    else if (changeAbs > 2) score += 5;
    
    // Alert count modifier
    const alertCount = output.alerts?.length || 0;
    score += alertCount * 5;
    
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, score));
  };

  /**
   * Determine tile size based on importance
   */
  const determineTileSize = (importance: number): 'small' | 'medium' | 'large' => {
    if (importance >= 85) return 'large';
    if (importance >= 60) return 'medium';
    return 'small';
  };

  /**
   * Get grid layout based on tile sizes
   */
  const getGridLayout = () => {
    const largeTiles = tiles.filter(t => t.size === 'large');
    const mediumTiles = tiles.filter(t => t.size === 'medium');
    const smallTiles = tiles.filter(t => t.size === 'small');
    
    // Dynamic grid: Adapt based on tile distribution
    if (largeTiles.length > 0) {
      return {
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: TERMINAL_THEME.spacing.lg
      };
    } else if (mediumTiles.length > 6) {
      return {
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: TERMINAL_THEME.spacing.md
      };
    } else {
      return {
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: TERMINAL_THEME.spacing.md
      };
    }
  };

  /**
   * Grid animation variants
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const tileVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20
    }
  };

  return (
    <div className="w-full">
      {/* Grid Header */}
      <div 
        className="flex justify-between items-center mb-6"
        style={{
          color: TERMINAL_THEME.colors.text.secondary,
          fontSize: TERMINAL_THEME.typography.sizes.small,
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono
        }}
      >
        <div>
          <span style={{ color: TERMINAL_THEME.colors.headers.primary }}>
            {tiles.length}
          </span> ENGINES ACTIVE
        </div>
        <div>
          LAST UPDATE: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>

      {/* Adaptive Grid */}
      <motion.div
        style={{
          display: 'grid',
          ...getGridLayout(),
          minHeight: '400px'
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.engineId}
              variants={tileVariants}
              layout
              layoutId={tile.engineId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SmartTile
                engineId={tile.engineId}
                data={tile.output}
                importance={tile.importance}
                size={tile.size}
                onClick={() => onTileClick?.(tile.engineId)}
                rank={index + 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Status Bar */}
      <div 
        className="mt-6 flex justify-center items-center space-x-8"
        style={{
          color: TERMINAL_THEME.colors.text.secondary,
          fontSize: TERMINAL_THEME.typography.sizes.tiny,
          fontFamily: TERMINAL_THEME.typography.fontFamily.mono
        }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: TERMINAL_THEME.colors.semantic.negative }}
          />
          <span>CRITICAL ({tiles.filter(t => t.importance >= 85).length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: TERMINAL_THEME.colors.headers.primary }}
          />
          <span>HIGH ({tiles.filter(t => t.importance >= 60 && t.importance < 85).length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: TERMINAL_THEME.colors.text.secondary }}
          />
          <span>NORMAL ({tiles.filter(t => t.importance < 60).length})</span>
        </div>
      </div>
    </div>
  );
};