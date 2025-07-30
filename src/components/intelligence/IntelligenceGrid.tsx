import React, { useState, useMemo } from 'react';
import { TerminalContainer, TerminalHeader } from '@/components/terminal';
import { TerminalGrid } from '@/components/TerminalSystem';
import { TerminalTile } from '@/components/terminal/TerminalTile';
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
        return <TrendingUp className="w-3 h-3 text-neon-lime" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-neon-orange" />;
      case 'neutral':
        return <Minus className="w-3 h-3 text-text-secondary" />;
      default:
        return null;
    }
  };

  const getPillarColor = (pillar: number) => {
    switch (pillar) {
      case 1: return 'border-l-neon-teal';
      case 2: return 'border-l-neon-lime';
      case 3: return 'border-l-neon-orange';
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
      <TerminalTile
        key={engineMetadata.id}
        title={intelligenceData.title.toUpperCase()}
        status={intelligenceData.status === 'active' ? 'active' : intelligenceData.status === 'warning' ? 'warning' : 'critical'}
        size="md"
        interactive="clickable"
        onClick={() => handleEngineClick(engineMetadata.id)}
        className={cn(
          "border-l-4",
          getPillarColor(engineMetadata.pillar)
        )}
      >
        <div className="space-y-3">
          {/* Primary Metrics */}
          <div className="space-y-2">
            {Object.entries(intelligenceData.primaryMetrics).slice(0, 2).map(([key, metric]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="terminal-label text-xs truncate">
                  {metric.label}
                </span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={cn(
                    "terminal-data text-xs",
                    metric.status === 'critical' ? 'text-neon-orange' :
                    metric.status === 'warning' ? 'text-neon-gold' :
                    'text-text-data'
                  )}>
                    {metric.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts Indicator */}
          {intelligenceData.alerts && intelligenceData.alerts.length > 0 && (
            <div className="terminal-divider">
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="w-3 h-3 text-neon-gold" />
                <span className="terminal-text text-xs text-neon-gold">
                  {intelligenceData.alerts.length} ALERT{intelligenceData.alerts.length !== 1 ? 'S' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Confidence & Update Time */}
          <div className="terminal-divider">
            <div className="flex justify-between terminal-text text-xs text-text-muted mt-2">
              <span>CONF: {Math.round(intelligenceData.confidence * 100)}%</span>
              <span>P{engineMetadata.pillar}</span>
            </div>
            <div className="terminal-text text-xs text-text-muted">
              {intelligenceData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </TerminalTile>
    );
  };

  if (loading) {
    return (
      <TerminalGrid columns={3} gap="12px">
        {[...Array(9)].map((_, i) => (
          <TerminalTile key={i} title="LOADING..." status="warning" size="md">
            <div className="space-y-2">
              <div className="h-3 bg-glass-surface animate-pulse" />
              <div className="h-3 bg-glass-surface animate-pulse w-1/2" />
            </div>
          </TerminalTile>
        ))}
      </TerminalGrid>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <TerminalGrid columns={3} gap="12px">
        {currentEngines.map((engine, index) => renderEngineCard(engine, index))}
      </TerminalGrid>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="terminal-section">
          <div className="terminal-divider"></div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="terminal-text text-xs px-3 py-1 border border-glass-border hover:border-neon-teal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3 inline mr-1" />
              PREV
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "terminal-text text-xs w-6 h-6 border",
                    currentPage === i 
                      ? "bg-neon-teal text-bg-primary border-neon-teal" 
                      : "border-glass-border hover:border-neon-teal"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="terminal-text text-xs px-3 py-1 border border-glass-border hover:border-neon-teal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT
              <ChevronRight className="w-3 h-3 inline ml-1" />
            </button>
          </div>
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