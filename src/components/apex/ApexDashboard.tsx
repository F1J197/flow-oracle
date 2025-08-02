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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const ApexDashboard: React.FC = () => {
  const [apexReport, setApexReport] = useState<ApexReport | null>(null);
  const [thermalData, setThermalData] = useState<ThermalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadApexData();
    const interval = setInterval(loadApexData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const testOrchestrationSystem = async () => {
    setTesting(true);
    toast.info("🧪 Testing orchestration system...");
    
    try {
      // Test data orchestrator
      const { data: dataResult, error: dataError } = await supabase.functions.invoke('data-orchestrator', {
        body: { action: 'ingest' }
      });

      if (dataError) {
        toast.error(`Data Orchestrator failed: ${dataError.message}`);
        return;
      }

      toast.success(`✅ Data Orchestrator: ${dataResult?.indicatorsProcessed || 0} indicators processed`);

      // Wait a bit then test engine orchestrator
      setTimeout(async () => {
        const { data: engineResult, error: engineError } = await supabase.functions.invoke('engine-orchestrator', {
          body: { action: 'orchestrate', forceExecution: true }
        });

        if (engineError) {
          toast.error(`Engine Orchestrator failed: ${engineError.message}`);
          return;
        }

        toast.success(`✅ Engine Orchestrator: ${engineResult?.enginesExecuted || 0} engines executed, CLIS: ${engineResult?.clis || 'N/A'}`);
        
        // Reload the dashboard after successful orchestration
        setTimeout(loadApexData, 2000);
      }, 3000);

    } catch (error) {
      toast.error(`System test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

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
      {/* System Test Button */}
      <div className="flex justify-center mb-6">
        <Button 
          onClick={testOrchestrationSystem}
          disabled={testing}
          variant="outline"
          size="sm"
          className="bg-accent/10 hover:bg-accent/20 text-accent border-accent/30"
        >
          {testing ? "🧪 Testing System..." : "🚀 Test Orchestration System"}
        </Button>
      </div>

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