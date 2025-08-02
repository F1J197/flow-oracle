/**
 * APEX DASHBOARD - Elite Financial Intelligence Interface
 * Bloomberg Terminal aesthetic with institutional-grade insights
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Target, 
  Brain, Zap, Shield, Eye, Activity, BarChart3 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apexIntelligenceService, ApexReport, ThermalData } from '@/services/ApexIntelligenceService';

export const ApexDashboard: React.FC = () => {
  const [apexReport, setApexReport] = useState<ApexReport | null>(null);
  const [thermalData, setThermalData] = useState<ThermalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadApexData();
    const interval = setInterval(loadApexData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadApexData = async () => {
    try {
      setLoading(true);
      const [report, thermal] = await Promise.all([
        apexIntelligenceService.generateApexReport(),
        apexIntelligenceService.generateThermalDashboard()
      ]);
      
      setApexReport(report);
      setThermalData(thermal);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load Apex data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      case 'LONG_RISK': return <TrendingUp className="w-6 h-6" />;
      case 'SHORT_RISK': return <TrendingDown className="w-6 h-6" />;
      case 'NEUTRAL': return <Activity className="w-6 h-6" />;
      case 'DEFENSIVE': return <Shield className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getThermalColor = (status: string) => {
    switch (status) {
      case 'extreme': return 'bg-destructive';
      case 'hot': return 'bg-warning';
      case 'warm': return 'bg-neon-teal';
      case 'cold': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  if (loading && !apexReport) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="terminal-text text-center">
          <div className="animate-pulse text-accent mb-2">⚡</div>
          <div className="text-sm text-muted">INITIALIZING APEX INTELLIGENCE...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Signal Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="terminal-panel p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`${getMasterSignalColor(apexReport?.masterSignal || '')} flex items-center gap-2`}>
              {getMasterSignalIcon(apexReport?.masterSignal || '')}
              <h1 className="terminal-header text-2xl">
                APEX INTELLIGENCE
              </h1>
            </div>
            <Badge variant="outline" className="animate-pulse">
              LIVE
            </Badge>
          </div>
          <div className="terminal-label">
            LAST UPDATE: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Master Signal */}
          <div className="text-center">
            <div className="terminal-label mb-2">MASTER SIGNAL</div>
            <div className={`terminal-metric ${getMasterSignalColor(apexReport?.masterSignal || '')}`}>
              {apexReport?.masterSignal}
            </div>
            <div className="terminal-label mt-1">
              {apexReport?.signalConfidence}% CONFIDENCE
            </div>
          </div>

          {/* CLIS Score */}
          <div className="text-center">
            <div className="terminal-label mb-2">CLIS SCORE</div>
            <div className="terminal-metric text-accent">
              {apexReport?.clis}/10
            </div>
            <div className="terminal-label mt-1">
              COMPOSITE LIQUIDITY
            </div>
          </div>

          {/* Market Regime */}
          <div className="text-center">
            <div className="terminal-label mb-2">MARKET REGIME</div>
            <div className="terminal-metric text-info">
              {apexReport?.marketRegime}
            </div>
            <div className="terminal-label mt-1">
              CURRENT PHASE
            </div>
          </div>

          {/* Liquidity Conditions */}
          <div className="text-center">
            <div className="terminal-label mb-2">LIQUIDITY</div>
            <div className="terminal-metric text-success">
              {apexReport?.liquidityConditions}
            </div>
            <div className="terminal-label mt-1">
              CONDITIONS
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="terminal-panel h-full">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-2">
                <Brain className="w-5 h-5" />
                EXECUTIVE BRIEFING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-accent font-semibold text-lg">
                  {apexReport?.narrativeHeadline}
                </div>
                <div className="space-y-2">
                  {apexReport?.executiveSummary.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <div>{point}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Price Projections */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="terminal-panel h-full">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-2">
                <Target className="w-5 h-5" />
                PRICE PROJECTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apexReport?.priceProjections.map((projection, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="border border-border p-3 rounded-none"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="terminal-label">{projection.scenario.toUpperCase()}</div>
                      <Badge variant={projection.scenario === 'bull' ? 'default' : 'secondary'}>
                        {projection.timeframe}
                      </Badge>
                    </div>
                    <div className="terminal-metric text-accent">
                      ${projection.btcTarget.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Thermal Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="terminal-panel">
          <CardHeader>
            <CardTitle className="terminal-header flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              THERMAL DASHBOARD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {thermalData.map((metric, index) => (
                <motion.div
                  key={metric.metric}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="border border-border p-4 rounded-none"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="terminal-label">{metric.metric}</div>
                    <div className={`w-3 h-3 ${getThermalColor(metric.status)} rounded-full`} />
                  </div>
                  <div className="terminal-metric text-2xl mb-2">
                    {metric.value.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className={metric.change24h >= 0 ? 'text-positive' : 'text-negative'}>
                      {metric.change24h >= 0 ? '+' : ''}{metric.change24h}%
                    </div>
                    <div className="text-muted">
                      {metric.percentile}th %ile
                    </div>
                  </div>
                  <Progress value={metric.percentile} className="mt-2 h-1" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hidden Alpha Insights */}
      {apexReport?.hiddenAlpha && apexReport.hiddenAlpha.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="terminal-header flex items-center gap-2">
                <Eye className="w-5 h-5" />
                HIDDEN ALPHA INSIGHTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apexReport.hiddenAlpha.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="border border-accent p-4 rounded-none bg-accent/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <div className="terminal-label text-accent">
                        {insight.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-sm mb-2">{insight.description}</div>
                    <div className="text-xs text-accent font-medium">
                      ACTION: {insight.actionable}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Critical Alerts */}
      <AnimatePresence>
        {apexReport?.criticalAlerts && apexReport.criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.5 }}
            className="terminal-panel p-4 border-destructive bg-destructive/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div className="terminal-header text-destructive">CRITICAL ALERTS</div>
            </div>
            <div className="space-y-2">
              {apexReport.criticalAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-sm text-destructive"
                >
                  ⚠ {alert}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};