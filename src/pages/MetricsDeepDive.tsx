import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  BarChart3,
  DollarSign,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import { terminalDataService } from '@/services/TerminalDataService';
import type { DatabaseEngineOutput } from '@/types/database';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  signal?: string;
  confidence?: number;
  pillar: number;
  analysis?: string;
  icon: React.ReactNode;
  subMetrics?: Record<string, any>;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  signal, 
  confidence,
  pillar,
  analysis,
  icon,
  subMetrics 
}) => {
  const getSignalColor = (signal?: string) => {
    switch (signal?.toLowerCase()) {
      case 'bullish':
      case 'risk_on':
        return 'text-terminal-success';
      case 'bearish':
      case 'risk_off':
        return 'text-terminal-danger';
      case 'warning':
        return 'text-terminal-warning';
      default:
        return 'text-terminal-muted';
    }
  };

  const getPillarName = (pillar: number) => {
    const pillars = ['Unknown', 'Momentum', 'Liquidity', 'Systemic Risk', 'Macro', 'Synthesis'];
    return pillars[pillar] || 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="terminal-panel h-full">
        <CardHeader className="pb-3">
          <CardTitle className="terminal-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-sm">{title}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getPillarName(pillar)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-2xl font-mono text-terminal-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {signal && (
              <div className="flex items-center gap-2">
                <Badge className={getSignalColor(signal)}>
                  {signal.toUpperCase()}
                </Badge>
                {confidence && (
                  <span className="text-xs text-terminal-muted">
                    {confidence}% confidence
                  </span>
                )}
              </div>
            )}
            
            {change && (
              <div className={`flex items-center gap-1 text-sm ${
                change > 0 ? 'text-terminal-success' : 'text-terminal-danger'
              }`}>
                {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change > 0 ? '+' : ''}{change}%
              </div>
            )}
          </div>

          {analysis && (
            <>
              <Separator />
              <p className="text-xs text-terminal-muted leading-relaxed">
                {analysis}
              </p>
            </>
          )}

          {subMetrics && Object.keys(subMetrics).length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="text-xs text-terminal-accent uppercase tracking-wide">
                  Sub-Metrics
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(subMetrics).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="space-y-0.5">
                      <div className="text-terminal-muted capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="font-mono text-terminal-foreground">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MetricsDeepDive: React.FC = () => {
  const [engineOutputs, setEngineOutputs] = useState<Map<string, DatabaseEngineOutput>>(new Map());
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      // Subscribe to engine outputs
      const unsubscribe = terminalDataService.subscribe((data) => {
        setEngineOutputs(data);
        setIsLoading(false);
      });

      // Get initial data
      const initialData = terminalDataService.getAllEngineOutputs();
      setEngineOutputs(initialData);
      setIsLoading(false);

      return unsubscribe;
    };

    initializeData();
  }, []);

  const organizeEnginesByPillar = () => {
    const pillars: Record<number, DatabaseEngineOutput[]> = {};
    
    engineOutputs.forEach((output) => {
      if (!pillars[output.pillar]) {
        pillars[output.pillar] = [];
      }
      pillars[output.pillar].push(output);
    });

    return pillars;
  };

  const pillarData = organizeEnginesByPillar();
  const pillarNames = {
    1: 'Momentum & Volatility',
    2: 'Liquidity & Credit',
    3: 'Systemic Risk',
    4: 'Macro & Behavioral',
    5: 'Synthesis'
  };

  const getEngineIcon = (engineId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'net_liquidity': <DollarSign className="w-4 h-4" />,
      'credit_stress': <AlertTriangle className="w-4 h-4" />,
      'enhanced_momentum': <TrendingUp className="w-4 h-4" />,
      'volatility_regime': <Activity className="w-4 h-4" />,
      'tail_risk': <AlertTriangle className="w-4 h-4" />,
      'macro_factor': <BarChart3 className="w-4 h-4" />,
      'signal_aggregator': <Brain className="w-4 h-4" />,
      'regime_classifier': <Target className="w-4 h-4" />
    };
    return iconMap[engineId] || <Zap className="w-4 h-4" />;
  };

  if (isLoading || engineOutputs.size === 0) {
    return (
      <ResponsiveLayout currentPage="charts">
        <div className="terminal-container">
          <div className="text-center py-20">
            <div className="terminal-header text-xl mb-4">LOADING METRICS...</div>
            <div className="text-terminal-muted">
              {engineOutputs.size === 0 ? 'No engine data available. Use the Data Populator on the home page.' : 'Initializing deep dive analysis...'}
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout currentPage="charts">
      <div className="terminal-container space-y-6">
        <div className="terminal-header-section">
          <h1 className="terminal-header">METRICS DEEP DIVE</h1>
          <p className="text-terminal-muted">
            Comprehensive analysis of all {engineOutputs.size} active engines across {Object.keys(pillarData).length} pillars
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-terminal-background-subtle">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="pillar1" className="text-xs">P1: Momentum</TabsTrigger>
            <TabsTrigger value="pillar2" className="text-xs">P2: Liquidity</TabsTrigger>
            <TabsTrigger value="pillar3" className="text-xs">P3: Risk</TabsTrigger>
            <TabsTrigger value="pillar4" className="text-xs">P4: Macro</TabsTrigger>
            <TabsTrigger value="pillar5" className="text-xs">P5: Synthesis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from(engineOutputs.values()).map((engine) => (
                <MetricCard
                  key={engine.engine_id}
                  title={engine.engine_id.replace(/_/g, ' ').toUpperCase()}
                  value={engine.primary_value}
                  signal={engine.signal}
                  confidence={engine.confidence}
                  pillar={engine.pillar}
                  analysis={engine.analysis}
                  icon={getEngineIcon(engine.engine_id)}
                  subMetrics={engine.sub_metrics}
                />
              ))}
            </div>
          </TabsContent>

          {[1, 2, 3, 4, 5].map(pillarNum => (
            <TabsContent key={pillarNum} value={`pillar${pillarNum}`} className="space-y-6">
              <div className="terminal-section">
                <h2 className="terminal-header">
                  Pillar {pillarNum}: {pillarNames[pillarNum as keyof typeof pillarNames]}
                </h2>
                <p className="text-terminal-muted text-sm">
                  {pillarData[pillarNum]?.length || 0} engines active in this pillar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pillarData[pillarNum]?.map((engine) => (
                  <MetricCard
                    key={engine.engine_id}
                    title={engine.engine_id.replace(/_/g, ' ').toUpperCase()}
                    value={engine.primary_value}
                    signal={engine.signal}
                    confidence={engine.confidence}
                    pillar={engine.pillar}
                    analysis={engine.analysis}
                    icon={getEngineIcon(engine.engine_id)}
                    subMetrics={engine.sub_metrics}
                  />
                )) || (
                  <div className="col-span-full text-center py-20 text-terminal-muted">
                    No engines active in this pillar
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default MetricsDeepDive;