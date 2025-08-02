import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Activity, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketIntelligenceWidget } from '@/components/intelligence/MarketIntelligenceWidget';
import { ExecutiveBriefing } from '@/components/apex/ExecutiveBriefing';
import { StandardLayout } from '@/components/layout/StandardLayout';

const Intelligence = () => {
  return (
    <StandardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-terminal-primary mb-2">
            INTELLIGENCE ENGINE
          </h1>
          <p className="text-terminal-secondary">
            AI-powered market intelligence and narrative analysis
          </p>
        </motion.div>

        {/* Intelligence Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Market Intelligence Widget */}
          <MarketIntelligenceWidget />

          {/* Executive Briefing */}
          <ExecutiveBriefing 
            narrativeHeadline="AI intelligence systems operational"
            executiveSummary={[
              "Multiple engine consensus indicates stable market conditions",
              "Liquidity metrics remain within normal operational parameters",
              "Hidden alpha opportunities detected in institutional flows",
              "Risk-adjusted positioning favors defensive allocation"
            ]}
          />
        </div>

        {/* Intelligence Features Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-3">
                <Target className="w-5 h-5" />
                PATTERN RECOGNITION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Whale Movements</span>
                  <span className="text-accent font-mono">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hidden Orders</span>
                  <span className="text-destructive font-mono">Detected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Regime Shifts</span>
                  <span className="text-muted-foreground font-mono">Monitor</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-3">
                <Zap className="w-5 h-5" />
                SIGNAL STRENGTH
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consensus</span>
                    <span className="font-mono">87%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence</span>
                    <span className="font-mono">73%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                RISK MONITOR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">System Health: Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Market Stress: Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm">Tail Risk: Low</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Intelligence Stream */}
        <Card className="terminal-panel">
          <CardHeader>
            <CardTitle className="terminal-header flex items-center gap-3">
              <Activity className="w-5 h-5" />
              LIVE INTELLIGENCE STREAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-accent"
              >
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </span>
                <span>Signal aggregator consensus reached: NEUTRAL bias confirmed</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-muted-foreground">
                  {new Date(Date.now() - 60000).toLocaleTimeString()}
                </span>
                <span>Credit stress engine: OAS spreads within normal range</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-muted-foreground">
                  {new Date(Date.now() - 120000).toLocaleTimeString()}
                </span>
                <span>Net liquidity tracker: Kalman filter updated</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};

export default Intelligence;