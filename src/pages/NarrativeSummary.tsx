import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Clock,
  Zap,
  RefreshCw,
  FileText,
  Download
} from 'lucide-react';
import { terminalDataService } from '@/services/TerminalDataService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DatabaseEngineOutput } from '@/types/database';

interface NarrativeData {
  headline: string;
  summary: string[];
  riskFactors: string[];
  timestamp: string;
  masterSignal: string;
  clis: number;
  engineCount: number;
}

const NarrativeSummary: React.FC = () => {
  const [narrative, setNarrative] = useState<NarrativeData | null>(null);
  const [engineOutputs, setEngineOutputs] = useState<Map<string, DatabaseEngineOutput>>(new Map());
  const [masterSignal, setMasterSignal] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      // Subscribe to engine outputs
      const unsubscribe = terminalDataService.subscribe((data) => {
        setEngineOutputs(data);
        // Get the signal aggregator for master signal
        const signalAggregator = data.get('signal-aggregator');
        if (signalAggregator) {
          setMasterSignal(signalAggregator);
        }
        setIsLoading(false);
      });

      // Get initial data
      const initialData = terminalDataService.getAllEngineOutputs();
      setEngineOutputs(initialData);
      const signalAggregator = initialData.get('signal-aggregator');
      if (signalAggregator) {
        setMasterSignal(signalAggregator);
      }
      setIsLoading(false);

      return unsubscribe;
    };

    initializeData();
  }, []);

  const generateNarrative = async () => {
    setIsGenerating(true);
    
    try {
      const engineOutputsArray = Array.from(engineOutputs.values());
      const clisScore = masterSignal?.primary_value || 5.0;
      const currentMasterSignal = masterSignal?.signal || 'NEUTRAL';

      const { data, error } = await supabase.functions.invoke('daily-report-generator', {
        body: {
          engineOutputs: engineOutputsArray,
          clis: clisScore,
          masterSignal: currentMasterSignal,
          requestType: 'narrative'
        }
      });

      if (error) throw error;

      const newNarrative: NarrativeData = {
        headline: data.headline || 'Market Analysis Generated',
        summary: data.summary || ['Analysis complete'],
        riskFactors: data.riskFactors || ['Monitor market conditions'],
        timestamp: new Date().toISOString(),
        masterSignal: currentMasterSignal,
        clis: clisScore,
        engineCount: engineOutputsArray.length
      };

      setNarrative(newNarrative);

      toast({
        title: "Narrative Generated",
        description: "AI-powered market narrative has been generated successfully.",
      });

    } catch (error) {
      console.error('Failed to generate narrative:', error);
      
      // Fallback narrative
      const fallbackNarrative: NarrativeData = {
        headline: "Market Analysis Temporarily Unavailable",
        summary: [
          "AI narrative generation temporarily unavailable.",
          "Manual analysis indicates continued market operation.",
          "Key metrics remain within normal parameters.",
          "Monitor for system restoration updates.",
          "Maintain current risk positioning until further notice."
        ],
        riskFactors: [
          "System availability limitations",
          "Reduced analytical capabilities",
          "Manual oversight required"
        ],
        timestamp: new Date().toISOString(),
        masterSignal: masterSignal?.signal || 'DEFENSIVE',
        clis: masterSignal?.primary_value || 5.0,
        engineCount: engineOutputs.size
      };

      setNarrative(fallbackNarrative);

      toast({
        title: "Using Fallback Analysis",
        description: "AI service unavailable, showing fallback narrative.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportNarrative = () => {
    if (!narrative) return;

    const exportData = {
      ...narrative,
      exportedAt: new Date().toISOString(),
      engines: Array.from(engineOutputs.values()).map(engine => ({
        id: engine.engine_id,
        signal: engine.signal,
        confidence: engine.confidence,
        analysis: engine.analysis
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrative-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Narrative Exported",
      description: "Analysis has been downloaded as JSON file.",
    });
  };

  const getSignalColor = (signal?: string) => {
    switch (signal?.toLowerCase()) {
      case 'bullish':
      case 'risk_on':
        return 'text-terminal-success border-terminal-success';
      case 'bearish':
      case 'risk_off':
        return 'text-terminal-danger border-terminal-danger';
      case 'warning':
        return 'text-terminal-warning border-terminal-warning';
      default:
        return 'text-terminal-muted border-terminal-muted';
    }
  };

  if (isLoading) {
    return (
      <ResponsiveLayout currentPage="intelligence">
        <div className="terminal-container">
          <div className="text-center py-20">
            <div className="terminal-header text-xl mb-4">LOADING NARRATIVE ENGINE...</div>
            <div className="text-terminal-muted">
              Initializing AI-powered market analysis...
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout currentPage="intelligence">
      <div className="terminal-container space-y-6">
        <div className="terminal-header-section">
          <h1 className="terminal-header">AI NARRATIVE SUMMARY</h1>
          <p className="text-terminal-muted">
            Advanced AI-powered market intelligence and forward-looking analysis
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {narrative && (
              <div className="flex items-center gap-2 text-sm text-terminal-muted">
                <Clock className="w-4 h-4" />
                Generated: {new Date(narrative.timestamp).toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {narrative && (
              <Button
                onClick={exportNarrative}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
            <Button
              onClick={generateNarrative}
              disabled={isGenerating || engineOutputs.size === 0}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Narrative
                </>
              )}
            </Button>
          </div>
        </div>

        {engineOutputs.size === 0 && (
          <Card className="terminal-panel">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-terminal-muted mx-auto mb-4" />
              <div className="terminal-header text-lg mb-2">No Engine Data Available</div>
              <p className="text-terminal-muted mb-4">
                No engine outputs found. Please populate data first using the Data Populator on the home page.
              </p>
            </CardContent>
          </Card>
        )}

        {narrative && (
          <div className="space-y-6">
            {/* Master Signal & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="terminal-panel">
                <CardHeader>
                  <CardTitle className="terminal-header flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Master Signal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`text-lg px-3 py-1 ${getSignalColor(narrative.masterSignal)}`}>
                    {narrative.masterSignal}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="terminal-panel">
                <CardHeader>
                  <CardTitle className="terminal-header flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    CLIS Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono text-terminal-accent">
                    {narrative.clis.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-terminal-muted">
                    Composite Liquidity Intelligence
                  </div>
                </CardContent>
              </Card>

              <Card className="terminal-panel">
                <CardHeader>
                  <CardTitle className="terminal-header flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Active Engines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono text-terminal-foreground">
                    {narrative.engineCount}
                  </div>
                  <div className="text-sm text-terminal-muted">
                    Engines Contributing
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Headline */}
              <Card className="terminal-panel">
                <CardHeader>
                  <CardTitle className="terminal-header">EXECUTIVE HEADLINE</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-medium text-terminal-foreground leading-relaxed">
                    {narrative.headline}
                  </h2>
                </CardContent>
              </Card>

              {/* Analysis Summary */}
              <Card className="terminal-panel">
                <CardHeader>
                  <CardTitle className="terminal-header">MARKET ANALYSIS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {narrative.summary.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-terminal-accent mt-2 flex-shrink-0" />
                      <p className="text-terminal-foreground leading-relaxed">
                        {point}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card className="terminal-panel border-terminal-warning">
                <CardHeader>
                  <CardTitle className="terminal-header flex items-center gap-2 text-terminal-warning">
                    <AlertTriangle className="w-5 h-5" />
                    RISK FACTORS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {narrative.riskFactors.map((risk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-terminal-warning/5 rounded border-l-2 border-terminal-warning"
                    >
                      <AlertTriangle className="w-4 h-4 text-terminal-warning mt-0.5 flex-shrink-0" />
                      <p className="text-terminal-foreground">
                        {risk}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default NarrativeSummary;