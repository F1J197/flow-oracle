/**
 * INTELLIGENCE INSIGHTS - High-Value Alpha & Alerts
 * Displays actionable insights and critical alerts in priority order
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HiddenAlpha {
  type: string;
  description: string;
  actionable: string;
  confidence: number;
}

interface PriceProjection {
  scenario: string;
  timeframe: string;
  btcTarget: number;
}

interface IntelligenceInsightsProps {
  hiddenAlpha?: HiddenAlpha[];
  priceProjections: PriceProjection[];
  criticalAlerts?: string[];
}

export const IntelligenceInsights: React.FC<IntelligenceInsightsProps> = ({
  hiddenAlpha,
  priceProjections,
  criticalAlerts
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Price Projections */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="terminal-panel h-full">
          <CardHeader className="pb-4">
            <CardTitle className="terminal-header flex items-center gap-3">
              <Target className="w-6 h-6" />
              PROJECTIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceProjections.map((projection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="border border-border p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="terminal-label font-medium">
                      {projection.scenario.toUpperCase()}
                    </div>
                    <Badge variant={projection.scenario === 'bull' ? 'default' : 'secondary'}>
                      {projection.timeframe}
                    </Badge>
                  </div>
                  <div className="terminal-metric text-accent text-2xl">
                    ${projection.btcTarget.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hidden Alpha Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-2"
      >
        <Card className="terminal-panel h-full">
          <CardHeader className="pb-4">
            <CardTitle className="terminal-header flex items-center gap-3">
              <Eye className="w-6 h-6" />
              ALPHA INSIGHTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hiddenAlpha && hiddenAlpha.length > 0 ? (
              <div className="space-y-4">
                {hiddenAlpha.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="border border-accent/30 p-4 bg-accent/5 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="w-5 h-5 text-accent" />
                      <div className="terminal-label text-accent font-medium">
                        {insight.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}% CONF
                      </Badge>
                    </div>
                    <div className="text-base mb-3 leading-relaxed">
                      {insight.description}
                    </div>
                    <div className="text-sm text-accent font-medium p-2 bg-accent/10 border-l-2 border-accent">
                      ACTION: {insight.actionable}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div>No alpha insights detected</div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Critical Alerts */}
      <AnimatePresence>
        {criticalAlerts && criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="terminal-panel p-6 border-destructive bg-destructive/10">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div className="terminal-header text-destructive text-xl">
                  CRITICAL ALERTS
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalAlerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-3 bg-destructive/20 border border-destructive/50"
                  >
                    <div className="text-destructive font-medium">
                      ⚠ {alert}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};