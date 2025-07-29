import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Info, AlertCircle, Clock } from 'lucide-react';
import { DetailedModalData } from '@/types/engines';
import { cn } from '@/lib/utils';
// DataIntegrityView import removed - using StandardDataIntegrityView pattern now

interface EngineModalSystemProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetailedModalData | null;
}

export const EngineModalSystem: React.FC<EngineModalSystemProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!data) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-critical';
      case 'medium': return 'text-warning';
      case 'low': return 'text-accent';
      default: return 'text-text-secondary';
    }
  };

  const getSignificanceIcon = (significance: string) => {
    switch (significance) {
      case 'high': return <TrendingUp className="w-4 h-4 text-btc-primary" />;
      case 'medium': return <Minus className="w-4 h-4 text-warning" />;
      case 'low': return <TrendingDown className="w-4 h-4 text-text-secondary" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-noir-surface border-noir-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary mb-2">
            {data.title}
          </DialogTitle>
          <p className="text-text-secondary text-sm leading-relaxed">
            {data.description}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Insights */}
          {data.keyInsights && data.keyInsights.length > 0 && (
            <Card className="bg-noir-bg border-noir-border">
              <CardHeader>
                <CardTitle className="text-lg text-btc-primary flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-btc-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-text-primary text-sm leading-relaxed">
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.detailedMetrics.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="bg-noir-bg border-noir-border">
                <CardHeader>
                  <CardTitle className="text-lg text-accent">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(category.metrics).map(([key, metric]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm font-medium">
                          {key}
                        </span>
                        <div className="flex items-center gap-2">
                          {metric.significance && getSignificanceIcon(metric.significance)}
                          <span className="text-text-primary font-mono">
                            {metric.value}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {metric.description}
                      </p>
                      {metric.calculation && (
                        <p className="text-xs text-accent font-mono bg-noir-surface px-2 py-1 rounded">
                          {metric.calculation}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Historical Context */}
          {data.historicalContext && (
            <Card className="bg-noir-bg border-noir-border">
              <CardHeader>
                <CardTitle className="text-lg text-warning flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historical Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-text-secondary text-sm block">Period</span>
                    <span className="text-text-primary font-mono">
                      {data.historicalContext.period}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm block">Comparison</span>
                    <span className="text-text-primary font-mono">
                      {data.historicalContext.comparison}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-sm block">Significance</span>
                    <span className="text-text-primary">
                      {data.historicalContext.significance}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {data.actionItems && data.actionItems.length > 0 && (
            <Card className="bg-noir-bg border-noir-border">
              <CardHeader>
                <CardTitle className="text-lg text-critical flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.actionItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-noir-surface rounded-lg">
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex-shrink-0 mt-0.5",
                          getPriorityColor(item.priority)
                        )}
                      >
                        {item.priority.toUpperCase()}
                      </Badge>
                      <div className="flex-1 space-y-1">
                        <p className="text-text-primary text-sm font-medium">
                          {item.action}
                        </p>
                        <p className="text-text-secondary text-xs">
                          Timeframe: {item.timeframe}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};