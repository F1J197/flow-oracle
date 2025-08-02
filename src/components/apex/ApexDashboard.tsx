/**
 * APEX DASHBOARD - Elite Financial Intelligence Interface
 * Restructured for optimal information hierarchy and reduced clutter
 */

import React, { useState, useEffect } from 'react';
import { apexIntelligenceService, ApexReport, ThermalData } from '@/services/ApexIntelligenceService';
import { MasterSignalHeader } from './MasterSignalHeader';
import { ExecutiveBriefing } from './ExecutiveBriefing';
import { ThermalMatrix } from './ThermalMatrix';
import { IntelligenceInsights } from './IntelligenceInsights';

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

  // Utility functions moved to individual components

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

  if (!apexReport) return null;

  return (
    <div className="space-y-8">
      {/* Master Signal Header - Primary Information */}
      <MasterSignalHeader
        masterSignal={apexReport.masterSignal}
        signalConfidence={apexReport.signalConfidence}
        clis={apexReport.clis}
        marketRegime={apexReport.marketRegime}
        liquidityConditions={apexReport.liquidityConditions}
        lastUpdate={lastUpdate}
      />

      {/* Executive Briefing - Key Narrative */}
      <ExecutiveBriefing
        narrativeHeadline={apexReport.narrativeHeadline}
        executiveSummary={apexReport.executiveSummary}
      />

      {/* Thermal Matrix - Market Health Overview */}
      <ThermalMatrix thermalData={thermalData} />

      {/* Intelligence Insights - Alpha & Projections */}
      <IntelligenceInsights
        hiddenAlpha={apexReport.hiddenAlpha}
        priceProjections={apexReport.priceProjections}
        criticalAlerts={apexReport.criticalAlerts}
      />
    </div>
  );
};