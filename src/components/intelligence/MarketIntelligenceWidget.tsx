import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apexIntelligenceService } from '@/services/ApexIntelligenceService';

interface IntelligenceMetric {
  label: string;
  value: string;
  change: string;
  status: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

interface MarketIntelligenceWidgetProps {
  className?: string;
}

export const MarketIntelligenceWidget: React.FC<MarketIntelligenceWidgetProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<IntelligenceMetric[]>([]);
  const [dominantNarrative, setDominantNarrative] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntelligenceData();
    const interval = setInterval(loadIntelligenceData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadIntelligenceData = async () => {
    try {
      const report = await apexIntelligenceService.generateApexReport();
      
      if (report) {
        setDominantNarrative(report.executiveSummary[0] || 'Analyzing market conditions...');
        
        // Generate sample intelligence metrics
        const sampleMetrics: IntelligenceMetric[] = [
          {
            label: 'CLIS Score',
            value: '6.8/10',
            change: '+0.3',
            status: 'bullish',
            confidence: 87
          },
          {
            label: 'Liquidity Flow',
            value: '+$2.1B',
            change: '+12%',
            status: 'bullish',
            confidence: 92
          },
          {
            label: 'Credit Stress',
            value: '289bps',
            change: '-15bps',
            status: 'neutral',
            confidence: 78
          },
          {
            label: 'Dealer Risk',
            value: 'Elevated',
            change: 'Stable',
            status: 'bearish',
            confidence: 83
          }
        ];
        
        setMetrics(sampleMetrics);
      }
    } catch (error) {
      console.error('Failed to load intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-accent';
      case 'bearish': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-accent" />;
      case 'bearish': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Card className={`terminal-panel ${className}`}>
        <CardHeader>
          <CardTitle className="terminal-header flex items-center gap-3">
            <Brain className="w-6 h-6" />
            MARKET INTELLIGENCE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading intelligence...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`terminal-panel ${className}`}>
      <CardHeader>
        <CardTitle className="terminal-header flex items-center gap-3">
          <Brain className="w-6 h-6" />
          MARKET INTELLIGENCE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dominant Narrative */}
        <div className="p-4 bg-accent/5 border-l-4 border-accent rounded-r">
          <div className="text-sm text-accent font-semibold mb-2">DOMINANT NARRATIVE</div>
          <div className="text-sm leading-relaxed">{dominantNarrative}</div>
        </div>

        {/* Intelligence Metrics */}
        <div className="grid gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(metric.status)}
                <div>
                  <div className="font-medium text-sm">{metric.label}</div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {metric.confidence}%
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-mono font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Badge variant="outline" className="text-accent border-accent">
            Intelligence Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};