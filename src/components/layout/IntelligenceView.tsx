/**
 * Intelligence View - The Brain
 * Organized engine display with 3-tier progressive depth
 */

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ENGINE_REGISTRY, getEnginesByPillar } from '@/config/engine.registry';
import { EngineOutput } from '@/engines/BaseEngine';

const PILLAR_NAMES = {
  0: 'Foundation Layer',
  1: 'Liquidity Engines',
  2: 'Network & Market',
  3: 'Economic Context',
  4: 'Synthesis Layer'
};

interface EngineTierState {
  [engineId: string]: 1 | 2 | 3;
}

export const IntelligenceView: React.FC = () => {
  const [tierStates, setTierStates] = useState<EngineTierState>({});
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);

  const toggleTier = (engineId: string) => {
    setTierStates(prev => {
      const current = prev[engineId] || 1;
      const next = current === 3 ? 1 : (current + 1) as 1 | 2 | 3;
      return { ...prev, [engineId]: next };
    });
  };

  const generateMockEngineData = (engineId: string): EngineOutput => {
    return {
      primaryMetric: {
        value: Math.random() * 100,
        change24h: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5
      },
      signal: ['RISK_ON', 'RISK_OFF', 'NEUTRAL', 'WARNING'][Math.floor(Math.random() * 4)] as any,
      confidence: 60 + Math.random() * 30,
      analysis: `Advanced ${engineId} analysis showing current market dynamics and risk assessment.`,
      subMetrics: {
        regime: 'NORMAL',
        trend: Math.random() > 0.5 ? 'EXPANDING' : 'CONTRACTING',
        score: Math.random() * 100,
        volatility: Math.random() * 20 + 10,
        momentum: (Math.random() - 0.5) * 10
      }
    };
  };

  const renderEngineTile = (engineId: string, data: EngineOutput) => {
    const config = ENGINE_REGISTRY[engineId];
    const tier = tierStates[engineId] || 1;
    
    const getSignalColor = () => {
      switch (data.signal) {
        case 'RISK_ON': return 'hsl(var(--neon-lime))';
        case 'RISK_OFF': return 'hsl(var(--neon-orange))';
        case 'WARNING': return 'hsl(var(--neon-gold))';
        default: return 'hsl(var(--text-primary))';
      }
    };

    const renderTier1 = () => (
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-2xl font-bold font-mono" style={{ color: getSignalColor() }}>
            {data.primaryMetric.value.toFixed(1)}
          </div>
          <div className="text-xs text-secondary font-mono uppercase">Primary Metric</div>
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-data">
            {Math.round(data.confidence)}%
          </div>
          <div className="text-xs text-secondary font-mono uppercase">Confidence</div>
        </div>
        <div>
          <div className="text-lg font-bold font-mono" style={{ color: getSignalColor() }}>
            {data.signal}
          </div>
          <div className="text-xs text-secondary font-mono uppercase">Signal</div>
        </div>
      </div>
    );

    const renderTier2 = () => (
      <div className="space-y-4">
        {renderTier1()}
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.subMetrics).slice(0, 6).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-xs text-secondary font-mono uppercase tracking-wider">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-data font-mono font-semibold">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const renderTier3 = () => (
      <div className="space-y-4">
        {renderTier2()}
        <div className="border-t border-border pt-4">
          <div className="text-xs text-secondary font-mono mb-2 uppercase tracking-wider">
            Analysis
          </div>
          <div className="text-sm text-data font-mono leading-relaxed">
            {data.analysis}
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <div className="text-xs text-secondary font-mono mb-2 uppercase tracking-wider">
            Configuration
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-secondary">Update Interval:</span>
              <span className="text-data">{config.updateInterval / 1000}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Priority:</span>
              <span className="text-data">{config.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Indicators:</span>
              <span className="text-data">{config.requiredIndicators.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Dependencies:</span>
              <span className="text-data">{config.dependencies?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div 
        key={engineId}
        className="bg-card border border-border p-4 cursor-pointer transition-all duration-200 hover:border-primary"
        onClick={() => toggleTier(engineId)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-primary font-mono uppercase tracking-wider">
            {config.name}
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="text-xs font-mono"
              style={{ borderColor: getSignalColor(), color: getSignalColor() }}
            >
              TIER {tier}
            </Badge>
            <div 
              className="w-3 h-3 rounded-full border-2"
              style={{ borderColor: getSignalColor() }}
            />
          </div>
        </div>

        {tier === 1 && renderTier1()}
        {tier === 2 && renderTier2()}
        {tier === 3 && renderTier3()}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Intelligence Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-wider mb-2" style={{ color: 'hsl(var(--btc-primary))' }}>
          INTELLIGENCE ENGINE
        </h2>
        <div className="text-sm text-secondary font-mono">
          28 engines organized by pillar • Click tiles to cycle through detail levels
        </div>
      </div>

      {/* Pillar Accordion */}
      <Accordion type="multiple" defaultValue={['0', '1', '4']} className="space-y-4">
        {Object.entries(PILLAR_NAMES).map(([pillar, name]) => {
          const pillarNumber = parseInt(pillar);
          const engines = getEnginesByPillar(pillarNumber);
          
          return (
            <AccordionItem key={pillar} value={pillar} className="border border-border bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-primary font-mono uppercase tracking-wider">
                      {name}
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {engines.length} ENGINES
                    </Badge>
                  </div>
                  <div className="text-xs text-secondary font-mono">
                    PILLAR {pillar}
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {engines.map(engine => {
                    const mockData = generateMockEngineData(engine.id);
                    return renderEngineTile(engine.id, mockData);
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
            Active Engines
          </div>
          <div className="text-2xl font-bold text-data font-mono">
            28/28
          </div>
        </div>
        
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
            Avg Confidence
          </div>
          <div className="text-2xl font-bold text-data font-mono">
            87%
          </div>
        </div>
        
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
            Risk Signals
          </div>
          <div className="text-2xl font-bold font-mono" style={{ color: 'hsl(var(--neon-orange))' }}>
            3
          </div>
        </div>
        
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-secondary font-mono uppercase tracking-wider mb-1">
            Last Update
          </div>
          <div className="text-lg font-bold text-data font-mono">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceView;