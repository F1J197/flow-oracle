import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Shield,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock
} from 'lucide-react';
import { EngineIntelligence } from '@/types/intelligence';

interface IntelligenceTileProps {
  intelligence: EngineIntelligence;
  size?: 'compact' | 'standard' | 'expanded';
  onClick?: () => void;
}

export const IntelligenceTile: React.FC<IntelligenceTileProps> = ({
  intelligence,
  size = 'standard',
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { narrative, contextualData, status, engineName } = intelligence;

  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'hsl(var(--destructive))';
      case 'warning': return 'hsl(var(--orange))';
      case 'healthy': return 'hsl(var(--teal))';
      case 'offline': return 'hsl(var(--muted))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <Activity className="h-4 w-4" />;
      case 'healthy': return <TrendingUp className="h-4 w-4" />;
      case 'offline': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = () => {
    const trend = contextualData.historicalContext.trend;
    switch (trend) {
      case 'rising': return <TrendingUp className="h-3 w-3 text-teal" />;
      case 'falling': return <TrendingDown className="h-3 w-3 text-orange" />;
      default: return <div className="h-3 w-3 rounded-full bg-primary-800" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'position': return <Target className="h-3 w-3" />;
      case 'hedge': return <Shield className="h-3 w-3" />;
      case 'alert': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'hsl(var(--destructive))';
      case 'high': return 'hsl(var(--orange))';
      case 'medium': return 'hsl(var(--gold))';
      default: return 'hsl(var(--muted))';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          hover:shadow-lg hover:scale-[1.02]
          ${size === 'compact' ? 'min-h-[240px]' : size === 'expanded' ? 'min-h-[400px]' : 'min-h-[320px]'}
          border-l-4
        `}
        style={{ borderLeftColor: getStatusColor() }}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick?.();
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-md"
                style={{ backgroundColor: getStatusColor(), opacity: 0.1 }}
              >
                <div style={{ color: getStatusColor() }}>
                  {getStatusIcon()}
                </div>
              </div>
              <div>
                <h3 className="font-mono font-semibold text-sm text-primary">
                  {engineName}
                </h3>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: getStatusColor(), color: getStatusColor() }}
                >
                  {status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {narrative.timeframe}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Headline & Current Reading */}
          <div className="space-y-2">
            <h4 className="font-semibold text-base leading-tight text-primary">
              {narrative.headline}
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-primary">
                  {contextualData.currentReading.value.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {contextualData.currentReading.unit}
                </span>
                {getTrendIcon()}
              </div>
              <div className="text-right text-xs">
                <div className="text-muted-foreground">
                  {contextualData.historicalContext.percentile.toFixed(0)}th percentile
                </div>
                <div className="font-medium">
                  {contextualData.currentReading.interpretation}
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{narrative.confidence}%</span>
            </div>
            <Progress 
              value={narrative.confidence} 
              className="h-2"
              style={{
                '--progress-foreground': getStatusColor()
              } as React.CSSProperties}
            />
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {narrative.summary}
          </p>

          {/* Key Insights - Always show first 2 */}
          {narrative.keyInsights.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">
                Key Insights
              </h5>
              <div className="space-y-1">
                {narrative.keyInsights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <div className="w-1 h-1 rounded-full bg-teal mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Items - Show highest priority */}
          {narrative.actionableItems.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">
                Action Required
              </h5>
              {narrative.actionableItems
                .sort((a, b) => {
                  const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
                  return priorities[b.priority] - priorities[a.priority];
                })
                .slice(0, 1)
                .map((action, index) => (
                  <div 
                    key={index} 
                    className="p-2 rounded-md border"
                    style={{ 
                      borderColor: getPriorityColor(action.priority),
                      backgroundColor: getPriorityColor(action.priority) + '0A'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div style={{ color: getPriorityColor(action.priority) }}>
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{action.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {action.timeframe} • {action.priority} priority
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Expandable Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <Separator />
                
                {/* Market Implications */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Market Implications
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Risk Assets:</span>
                      <span className={`ml-1 font-medium ${
                        contextualData.marketImplications.riskAssets === 'bullish' 
                          ? 'text-teal' 
                          : contextualData.marketImplications.riskAssets === 'bearish'
                          ? 'text-orange'
                          : 'text-muted-foreground'
                      }`}>
                        {contextualData.marketImplications.riskAssets}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Liquidity:</span>
                      <span className="ml-1 font-medium text-primary">
                        {contextualData.marketImplications.liquidityConditions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* All Implications */}
                {narrative.implications.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Implications
                    </h5>
                    <div className="space-y-1">
                      {narrative.implications.map((implication, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 rounded-full bg-gold mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{implication}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {narrative.riskFactors.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Risk Factors
                    </h5>
                    <div className="space-y-1">
                      {narrative.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="h-3 w-3 text-orange mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Action Items */}
                {narrative.actionableItems.length > 1 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">
                      All Actions
                    </h5>
                    <div className="space-y-2">
                      {narrative.actionableItems.slice(1).map((action, index) => (
                        <div 
                          key={index} 
                          className="p-2 rounded-md border"
                          style={{ 
                            borderColor: getPriorityColor(action.priority),
                            backgroundColor: getPriorityColor(action.priority) + '0A'
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div style={{ color: getPriorityColor(action.priority) }}>
                              {getActionIcon(action.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium">{action.description}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {action.rationale}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {action.timeframe} • {action.priority} priority
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};