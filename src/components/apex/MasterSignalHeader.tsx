/**
 * MASTER SIGNAL HEADER - Primary Intelligence Display
 * Displays the most critical information at the top level
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MasterSignalHeaderProps {
  masterSignal: string;
  signalConfidence: number;
  clis: number;
  marketRegime: string;
  liquidityConditions: string;
  lastUpdate: Date;
}

export const MasterSignalHeader: React.FC<MasterSignalHeaderProps> = ({
  masterSignal,
  signalConfidence,
  clis,
  marketRegime,
  liquidityConditions,
  lastUpdate
}) => {
  const getMasterSignalColor = (signal: string) => {
    switch (signal) {
      case 'LONG_RISK': return 'text-positive';
      case 'SHORT_RISK': return 'text-negative';
      case 'NEUTRAL': return 'text-info';
      case 'DEFENSIVE': return 'text-warning';
      default: return 'text-muted';
    }
  };

  const getMasterSignalIcon = (signal: string) => {
    switch (signal) {
      case 'LONG_RISK': return <TrendingUp className="w-8 h-8" />;
      case 'SHORT_RISK': return <TrendingDown className="w-8 h-8" />;
      case 'NEUTRAL': return <Activity className="w-8 h-8" />;
      case 'DEFENSIVE': return <Shield className="w-8 h-8" />;
      default: return <Activity className="w-8 h-8" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="terminal-panel p-8 mb-8"
    >
      {/* Main Signal Display */}
      <div className="text-center mb-8">
        <div className={`${getMasterSignalColor(masterSignal)} flex items-center justify-center gap-4 mb-4`}>
          {getMasterSignalIcon(masterSignal)}
          <h1 className="terminal-header text-5xl tracking-wider">
            {masterSignal}
          </h1>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="animate-pulse text-sm px-4 py-2">
            LIVE
          </Badge>
          <div className="terminal-label text-sm">
            {signalConfidence}% CONFIDENCE
          </div>
          <div className="terminal-label text-sm">
            LAST UPDATE: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="terminal-label mb-3">CLIS SCORE</div>
          <div className="terminal-metric text-accent text-4xl">
            {clis}/10
          </div>
          <div className="terminal-label mt-2 text-sm">
            COMPOSITE LIQUIDITY
          </div>
        </div>

        <div className="text-center">
          <div className="terminal-label mb-3">MARKET REGIME</div>
          <div className="terminal-metric text-info text-2xl">
            {marketRegime}
          </div>
          <div className="terminal-label mt-2 text-sm">
            CURRENT PHASE
          </div>
        </div>

        <div className="text-center">
          <div className="terminal-label mb-3">LIQUIDITY</div>
          <div className="terminal-metric text-success text-2xl">
            {liquidityConditions}
          </div>
          <div className="terminal-label mt-2 text-sm">
            CONDITIONS
          </div>
        </div>
      </div>
    </motion.div>
  );
};