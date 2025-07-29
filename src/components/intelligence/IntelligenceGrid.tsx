import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useEngineRegistry } from '@/hooks/useEngineRegistry';
import { EngineModalSystem } from './EngineModalSystem';
import { IntelligenceViewData, DetailedModalData } from '@/types/engines';
import { cn } from '@/lib/utils';

interface IntelligenceGridProps {
  pillarFilter?: 1 | 2 | 3;
  categoryFilter?: 'foundation' | 'core' | 'synthesis' | 'execution';
}

export const IntelligenceGrid: React.FC<IntelligenceGridProps> = ({
  pillarFilter,
  categoryFilter
}) => {
  const { engines, loading, executeEngine, getEngine } = useEngineRegistry({
    autoExecute: true,
    refreshInterval: 15000,
    pillar: pillarFilter,
    category: categoryFilter
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [modalData, setModalData] = useState<DetailedModalData | null>(null);

  const ENGINES_PER_PAGE = 9; // 3x3 grid
  const totalPages = Math.ceil(engines.length / ENGINES_PER_PAGE);

  const currentEngines = useMemo(() => {
    const startIndex = currentPage * ENGINES_PER_PAGE;
    return engines.slice(startIndex, startIndex + ENGINES_PER_PAGE);
  }, [engines, currentPage]);

  const handleEngineClick = async (engineId: string) => {
    const engine = getEngine(engineId);
    if (!engine) return;

    try {
      setSelectedEngine(engineId);
      
      // Get detailed modal data
      const detailedData = engine.getDetailedModal();
      setModalData(detailedData);
    } catch (error) {
      console.error(`Error getting engine data for ${engineId}:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-btc-primary" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-critical" />;
      case 'offline':
        return <Clock className="w-4 h-4 text-text-secondary" />;
      default:
        return <Activity className="w-4 h-4 text-accent" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-btc-primary" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-critical" />;
      case 'neutral':
        return <Minus className="w-3 h-3 text-text-secondary" />;
      default:
        return null;
    }
  };

  const getPillarColor = (pillar: number) => {
    switch (pillar) {
      case 1: return 'border-l-btc-primary';
      case 2: return 'border-l-accent';
      case 3: return 'border-l-warning';
      default: return 'border-l-text-secondary';
    }
  };

  const renderEngineCard = (engineMetadata: any, index: number) => {
    const engine = getEngine(engineMetadata.id);
    if (!engine) return null;

    let intelligenceData: IntelligenceViewData;
    try {
      intelligenceData = engine.getIntelligenceView();
    } catch (error) {
      console.error(`Error getting intelligence view for ${engineMetadata.id}:`, error);
      return null;
    }

    return (
      <Card
        key={engineMetadata.id}
        className={cn(
          "bg-noir-bg border-noir-border hover:border-primary/50 transition-all duration-200 cursor-pointer",
          "border-l-4",
          getPillarColor(engineMetadata.pillar)
        )}
        onClick={() => handleEngineClick(engineMetadata.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-primary truncate">
              {intelligenceData.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(intelligenceData.status)}
              <Badge 
                variant="outline" 
                className="text-xs px-1 py-0"
              >
                P{engineMetadata.pillar}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Primary Metrics */}
          <div className="space-y-2">
            {Object.entries(intelligenceData.primaryMetrics).slice(0, 2).map(([key, metric]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary truncate">
                  {metric.label}
                </span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={cn(
                    "text-xs font-mono",
                    metric.status === 'critical' ? 'text-critical' :
                    metric.status === 'warning' ? 'text-warning' :
                    'text-text-primary'
                  )}>
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts Indicator */}
          {intelligenceData.alerts && intelligenceData.alerts.length > 0 && (
            <div className="pt-2 border-t border-noir-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-warning" />
                <span className="text-xs text-warning">
                  {intelligenceData.alerts.length} alert{intelligenceData.alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Confidence & Update Time */}
          <div className="pt-2 border-t border-noir-border text-xs text-text-secondary">
            <div className="flex justify-between">
              <span>Confidence: {Math.round(intelligenceData.confidence * 100)}%</span>
              <span>{intelligenceData.lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 p-6">
        {[...Array(9)].map((_, i) => (
          <Card key={i} className="bg-noir-bg border-noir-border animate-pulse">
            <CardHeader>
              <div className="h-4 bg-noir-surface rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-noir-surface rounded w-3/4" />
                <div className="h-3 bg-noir-surface rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-3 gap-4 min-h-[600px]">
        {currentEngines.map((engine, index) => renderEngineCard(engine, index))}
        
        {/* Empty slots for consistent grid */}
        {currentEngines.length < ENGINES_PER_PAGE && 
          [...Array(ENGINES_PER_PAGE - currentEngines.length)].map((_, i) => (
            <div key={`empty-${i}`} className="opacity-0" />
          ))
        }
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="text-primary border-primary/50 hover:bg-primary/10"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i)}
                className={cn(
                  "w-8 h-8 p-0",
                  currentPage === i 
                    ? "bg-primary text-noir-bg" 
                    : "text-primary border-primary/50 hover:bg-primary/10"
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="text-primary border-primary/50 hover:bg-primary/10"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Engine Detail Modal */}
      <EngineModalSystem
        isOpen={!!selectedEngine}
        onClose={() => {
          setSelectedEngine(null);
          setModalData(null);
        }}
        data={modalData}
      />
    </div>
  );
};