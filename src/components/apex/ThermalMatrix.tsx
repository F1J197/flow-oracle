/**
 * THERMAL MATRIX - Market Heat Map Display
 * Compact visualization of all key metrics thermal status
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ThermalData } from '@/services/ApexIntelligenceService';

interface ThermalMatrixProps {
  thermalData: ThermalData[];
}

export const ThermalMatrix: React.FC<ThermalMatrixProps> = ({ thermalData }) => {
  const getThermalColor = (status: string) => {
    switch (status) {
      case 'extreme': return 'bg-destructive';
      case 'hot': return 'bg-warning';
      case 'warm': return 'bg-neon-teal';
      case 'cold': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'extreme': return '🔥';
      case 'hot': return '🟡';
      case 'warm': return '🟢';
      case 'cold': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="terminal-panel">
        <CardHeader className="pb-4">
          <CardTitle className="terminal-header flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            THERMAL MATRIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thermalData.map((metric, index) => (
              <motion.div
                key={metric.metric}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="border border-border p-4 hover:border-accent/50 transition-colors"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="terminal-label text-sm font-medium">
                    {metric.metric}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getStatusIcon(metric.status)}
                    </span>
                    <div className={`w-3 h-3 ${getThermalColor(metric.status)} rounded-full`} />
                  </div>
                </div>
                
                {/* Value */}
                <div className="terminal-metric text-2xl mb-3">
                  {metric.value.toFixed(2)}
                </div>
                
                {/* Change and Percentile */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className={`font-medium ${metric.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {metric.change24h >= 0 ? '+' : ''}{metric.change24h.toFixed(1)}%
                  </div>
                  <div className="text-muted">
                    {metric.percentile}th %ile
                  </div>
                </div>
                
                {/* Percentile Bar */}
                <Progress 
                  value={metric.percentile} 
                  className="h-2" 
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};