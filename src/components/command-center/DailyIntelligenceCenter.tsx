import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Zap, Clock, Users, Globe, Activity, Menu, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DailyReportView } from '@/components/reports/DailyReportView';
import { MarketPulseWidget } from './widgets/MarketPulseWidget';
import { LiveSignalsStream } from './widgets/LiveSignalsStream';
import { IntelligenceHeatmap } from './widgets/IntelligenceHeatmap';
import { GeopoliticalRadar } from './widgets/GeopoliticalRadar';
import { NetworkVisualization } from './widgets/NetworkVisualization';

interface DailyIntelligenceCenterProps {
  onNavigate?: (tab: string) => void;
}

export const DailyIntelligenceCenter: React.FC<DailyIntelligenceCenterProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<'pre' | 'open' | 'close' | 'after'>('open');
  const [intelligenceLevel, setIntelligenceLevel] = useState(87);
  const [showNavMenu, setShowNavMenu] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate intelligence level fluctuation
      setIntelligenceLevel(prev => prev + (Math.random() - 0.5) * 2);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getMarketStatusColor = () => {
    switch (marketStatus) {
      case 'open': return 'neon-lime';
      case 'pre': case 'after': return 'neon-gold';
      case 'close': return 'neon-orange';
      default: return 'text-muted';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary font-mono overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-teal/5 via-transparent to-neon-fuchsia/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-btc-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-teal/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <Brain className="w-12 h-12 text-btc-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-lime rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-btc-primary tracking-wider">
                  DAILY INTELLIGENCE
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  COMMAND CENTER • REAL-TIME INSIGHTS
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Market Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-${getMarketStatusColor()} animate-pulse`} />
              <span className="text-sm font-semibold text-text-primary">
                {marketStatus.toUpperCase()}
              </span>
            </div>

            {/* Live Time */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-neon-teal" />
              <span className="text-lg font-bold text-text-primary">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            {/* Intelligence Level */}
            <motion.div
              className="px-4 py-2 bg-glass-bg border border-glass-border rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-neon-lime" />
                <span className="text-sm text-text-secondary">INTEL</span>
                <span className="text-lg font-bold text-neon-lime">
                  {intelligenceLevel.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <motion.div
          className="flex items-center justify-between mb-8 p-4 bg-glass-bg/50 border border-glass-border rounded-lg backdrop-blur-sm"
          whileHover={{ backgroundColor: "hsl(var(--glass-bg) / 0.7)" }}
        >
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-neon-lime text-neon-lime">
              <TrendingUp className="w-3 h-3 mr-1" />
              BULLISH MOMENTUM
            </Badge>
            <Badge variant="outline" className="border-neon-gold text-neon-gold">
              <AlertTriangle className="w-3 h-3 mr-1" />
              2 ALERTS
            </Badge>
            <Badge variant="outline" className="border-neon-teal text-neon-teal">
              <Users className="w-3 h-3 mr-1" />
              5 SIGNALS
            </Badge>
          </div>

          <Button 
            variant="outline" 
            className="border-btc-primary text-btc-primary hover:bg-btc-primary hover:text-bg-primary"
          >
            <Zap className="w-4 h-4 mr-2" />
            GENERATE INSIGHT
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="relative z-10 px-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
          {/* Primary Intelligence Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0, duration: 0.6 }}
            className="col-span-8 row-span-2"
          >
            <Card className="h-full bg-glass-bg/80 border-glass-border backdrop-blur-sm overflow-hidden">
              <div className="p-6 h-full">
                <DailyReportView />
              </div>
            </Card>
          </motion.div>

          {/* Market Pulse Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="col-span-4"
          >
            <Card className="h-full bg-glass-bg/80 border-glass-border backdrop-blur-sm">
              <MarketPulseWidget />
            </Card>
          </motion.div>

          {/* Live Signals Stream */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="col-span-4"
          >
            <Card className="h-full bg-glass-bg/80 border-glass-border backdrop-blur-sm">
              <LiveSignalsStream />
            </Card>
          </motion.div>

          {/* Intelligence Heatmap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="col-span-6"
          >
            <Card className="h-full bg-glass-bg/80 border-glass-border backdrop-blur-sm">
              <IntelligenceHeatmap />
            </Card>
          </motion.div>

          {/* Geopolitical Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="col-span-3"
          >
            <Card className="h-full bg-glass-bg/80 border-glass-border backdrop-blur-sm">
              <GeopoliticalRadar />
            </Card>
          </motion.div>

          {/* Network Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="col-span-3"
          >
            <Card className="h-full bg-glass-bg/80 border-glass-border backdrop-blur-sm">
              <NetworkVisualization />
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Panel */}
      <AnimatePresence>
        {activeWidget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm"
            onClick={() => setActiveWidget(null)}
          >
            <motion.div
              className="w-4/5 h-4/5 bg-glass-bg border border-glass-border rounded-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-btc-primary">
                  {activeWidget} DETAILED VIEW
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveWidget(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </Button>
              </div>
              <div className="h-full overflow-auto">
                {/* Widget-specific content would go here */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navigation Menu */}
      <div className="fixed top-6 right-6 z-30">
        <Button
          onClick={() => setShowNavMenu(!showNavMenu)}
          className="bg-glass-bg/80 border-glass-border backdrop-blur-sm hover:bg-glass-bg"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <AnimatePresence>
          {showNavMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-12 right-0 bg-glass-bg border border-glass-border rounded-lg p-2 min-w-40"
            >
              <Button variant="ghost" size="sm" className="w-full justify-start text-left" onClick={() => onNavigate?.('intelligence')}>
                <Activity className="w-4 h-4 mr-2" />
                Intelligence
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-left" onClick={() => onNavigate?.('charts')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Charts
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-left" onClick={() => onNavigate?.('bitcoin')}>
                <div className="w-4 h-4 mr-2 bg-btc-primary rounded-sm" />
                Bitcoin
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-glass-bg/90 border-t border-glass-border backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse" />
              <span className="text-xs text-text-secondary">SYSTEMS OPERATIONAL</span>
            </div>
            <div className="text-xs text-text-secondary">
              LAST UPDATE: {currentTime.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs text-text-secondary">
              © 2024 LIQUIDITY² INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};