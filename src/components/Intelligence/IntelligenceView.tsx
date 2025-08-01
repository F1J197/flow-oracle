import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TerminalContainer } from '@/components/Terminal/TerminalContainer';
import { IntelligenceTile } from '@/components/intelligence/IntelligenceTile';
import { MarketIntelligenceHeader } from '@/components/intelligence/MarketIntelligenceHeader';
import { EngineIntelligenceService } from '@/services/EngineIntelligenceService';
import { DataFlowManager } from '@/engines/DataFlowManager';
import { EngineIntelligence, MarketIntelligenceSnapshot } from '@/types/intelligence';

export const IntelligenceView = () => {
  const [intelligenceData, setIntelligenceData] = useState<EngineIntelligence[]>([]);
  const [marketSnapshot, setMarketSnapshot] = useState<MarketIntelligenceSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateIntelligence = async () => {
      try {
        const dataFlowManager = DataFlowManager.getInstance();
        const intelligenceService = EngineIntelligenceService.getInstance();
        
        const engineOutputs = dataFlowManager.getAllEngineOutputs();
        const engineConfigs = dataFlowManager.getRegisteredEngines();
        
        const intelligence: EngineIntelligence[] = [];
        
        engineConfigs.forEach(config => {
          const output = engineOutputs.get(config.id);
          if (output) {
            const engineIntelligence = intelligenceService.transformEngineOutput(
              config.id, 
              config.name, 
              output
            );
            intelligence.push(engineIntelligence);
          }
        });
        
        setIntelligenceData(intelligence);
        
        if (intelligence.length > 0) {
          const snapshot = intelligenceService.getMarketIntelligenceSnapshot();
          setMarketSnapshot(snapshot);
        }
      } catch (error) {
        console.error('Intelligence update error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateIntelligence();
    const interval = setInterval(updateIntelligence, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <TerminalContainer>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold font-mono text-primary">INTELLIGENCE ENGINE</h1>
          <p className="text-muted-foreground">Processing market intelligence...</p>
        </div>
      </TerminalContainer>
    );
  }

  return (
    <TerminalContainer>
      <div className="space-y-8">
        {marketSnapshot && <MarketIntelligenceHeader snapshot={marketSnapshot} />}
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-mono text-primary">ENGINE INTELLIGENCE</h2>
          
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {intelligenceData.map((intelligence, index) => (
              <motion.div
                key={intelligence.engineId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <IntelligenceTile intelligence={intelligence} size="standard" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </TerminalContainer>
  );
};