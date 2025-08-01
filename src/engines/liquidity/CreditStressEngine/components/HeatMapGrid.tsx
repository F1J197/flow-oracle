/**
 * Credit Stress Heat Map - Dynamic Grid Visualization
 * Shows credit indicators with color-coded intensity
 */

import React from 'react';
import { EngineOutput } from '@/engines/BaseEngine';

interface HeatMapGridProps {
  data: EngineOutput;
  indicators?: string[];
}

interface IndicatorTile {
  id: string;
  name: string;
  value: number;
  zScore: number;
  unit: string;
  category: 'spread' | 'rate' | 'index' | 'ratio';
}

export const HeatMapGrid: React.FC<HeatMapGridProps> = ({ data }) => {
  const { subMetrics } = data;
  
  // Define top 15 credit indicators for heat map
  const indicators: IndicatorTile[] = [
    {
      id: 'hy_spread',
      name: 'HY Spread',
      value: subMetrics?.highYieldSpread || 450,
      zScore: subMetrics?.zScore || 0,
      unit: 'bps',
      category: 'spread'
    },
    {
      id: 'ig_spread',
      name: 'IG Spread',
      value: subMetrics?.investmentGradeSpread || 120,
      zScore: (subMetrics?.investmentGradeSpread - 100) / 30 || 0,
      unit: 'bps',
      category: 'spread'
    },
    {
      id: 'credit_risk_premium',
      name: 'Credit Risk',
      value: subMetrics?.credit_risk_premium || 350,
      zScore: (subMetrics?.credit_risk_premium - 300) / 100 || 0,
      unit: 'bps',
      category: 'spread'
    },
    {
      id: 'quality_spread',
      name: 'Quality Spread',
      value: subMetrics?.quality_spread || 330,
      zScore: (subMetrics?.quality_spread - 280) / 80 || 0,
      unit: 'bps',
      category: 'spread'
    },
    {
      id: 'vix_credit_ratio',
      name: 'VIX/Credit',
      value: subMetrics?.vix_credit_ratio || 3.5,
      zScore: (subMetrics?.vix_credit_ratio - 3.0) / 1.5 || 0,
      unit: 'ratio',
      category: 'ratio'
    },
    {
      id: 'risk_appetite',
      name: 'Risk Appetite',
      value: subMetrics?.risk_appetite || 60,
      zScore: (subMetrics?.risk_appetite - 50) / 25 || 0,
      unit: 'index',
      category: 'index'
    },
    {
      id: 'credit_beta',
      name: 'Credit Beta',
      value: subMetrics?.credit_beta || 1.2,
      zScore: (subMetrics?.credit_beta - 1.0) / 0.5 || 0,
      unit: 'β',
      category: 'ratio'
    },
    {
      id: 'spread_velocity',
      name: 'Spread Velocity',
      value: subMetrics?.spreadVelocity || 0,
      zScore: subMetrics?.spreadVelocity / 10 || 0,
      unit: 'bps/d',
      category: 'rate'
    },
    {
      id: 'equity_correlation',
      name: 'Equity Corr',
      value: (subMetrics?.equity_correlation || -0.8) * 100,
      zScore: ((subMetrics?.equity_correlation || -0.8) + 0.8) / 0.2 || 0,
      unit: '%',
      category: 'ratio'
    },
    // Mock additional indicators for comprehensive heat map
    {
      id: 'cds_5y',
      name: 'CDS 5Y',
      value: 85,
      zScore: 0.5,
      unit: 'bps',
      category: 'spread'
    },
    {
      id: 'loan_spreads',
      name: 'Loan Spreads',
      value: 280,
      zScore: -0.3,
      unit: 'bps',
      category: 'spread'
    },
    {
      id: 'distressed_ratio',
      name: 'Distressed %',
      value: 8.5,
      zScore: 1.2,
      unit: '%',
      category: 'ratio'
    },
    {
      id: 'fallen_angels',
      name: 'Fallen Angels',
      value: 15,
      zScore: 0.8,
      unit: 'count',
      category: 'index'
    },
    {
      id: 'duration_risk',
      name: 'Duration Risk',
      value: 6.8,
      zScore: 0.2,
      unit: 'years',
      category: 'ratio'
    },
    {
      id: 'convexity',
      name: 'Convexity',
      value: -12.5,
      zScore: -0.6,
      unit: 'gamma',
      category: 'ratio'
    }
  ];

  const getIntensityColor = (zScore: number): string => {
    // Color intensity based on Z-score
    const absZScore = Math.abs(zScore);
    const intensity = Math.min(1, absZScore / 2); // Cap at 2 std devs
    
    if (zScore > 0) {
      // Positive Z-score = stress (red spectrum)
      return `hsla(var(--semantic-negative-hsl), ${0.3 + intensity * 0.7})`;
    } else if (zScore < 0) {
      // Negative Z-score = compressed (green spectrum)
      return `hsla(var(--semantic-positive-hsl), ${0.3 + intensity * 0.7})`;
    } else {
      // Neutral
      return 'hsla(var(--text-muted-hsl), 0.2)';
    }
  };

  const getTextColor = (zScore: number): string => {
    const absZScore = Math.abs(zScore);
    if (absZScore > 1) {
      return 'hsl(var(--text-primary))';
    } else {
      return 'hsl(var(--text-secondary))';
    }
  };

  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'bps':
        return `${Math.round(value)}bps`;
      case '%':
        return `${value.toFixed(1)}%`;
      case 'ratio':
        return value.toFixed(2);
      case 'β':
        return `β${value.toFixed(2)}`;
      case 'bps/d':
        return `${value.toFixed(1)}`;
      case 'years':
        return `${value.toFixed(1)}y`;
      case 'gamma':
        return value.toFixed(1);
      case 'count':
        return Math.round(value).toString();
      case 'index':
        return Math.round(value).toString();
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-primary font-mono">
          CREDIT STRESS HEAT MAP
        </h3>
        <p className="text-sm text-secondary font-mono">
          Top 15 Credit Indicators • Color: Z-Score Intensity
        </p>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-5 gap-2">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className="relative p-3 rounded border border-border/30 transition-all duration-300 hover:border-primary/50 hover:scale-105 cursor-pointer group"
            style={{ backgroundColor: getIntensityColor(indicator.zScore) }}
          >
            {/* Indicator Name */}
            <div className="text-xs font-semibold font-mono text-center mb-1" 
                 style={{ color: getTextColor(indicator.zScore) }}>
              {indicator.name}
            </div>
            
            {/* Value */}
            <div className="text-sm font-bold text-center font-mono"
                 style={{ color: getTextColor(indicator.zScore) }}>
              {formatValue(indicator.value, indicator.unit)}
            </div>
            
            {/* Z-Score */}
            <div className="text-xs text-center font-mono opacity-75"
                 style={{ color: getTextColor(indicator.zScore) }}>
              z: {indicator.zScore.toFixed(2)}
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-background border border-border rounded text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
              <div className="text-primary font-semibold">{indicator.name}</div>
              <div className="text-secondary">
                Value: {formatValue(indicator.value, indicator.unit)}
              </div>
              <div className="text-secondary">
                Z-Score: {indicator.zScore.toFixed(2)}
              </div>
              <div className="text-muted text-xs">
                Category: {indicator.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" 
                 style={{ backgroundColor: 'hsla(var(--semantic-negative-hsl), 0.8)' }}></div>
            <span className="text-secondary">High Stress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" 
                 style={{ backgroundColor: 'hsla(var(--text-muted-hsl), 0.2)' }}></div>
            <span className="text-secondary">Neutral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" 
                 style={{ backgroundColor: 'hsla(var(--semantic-positive-hsl), 0.8)' }}></div>
            <span className="text-secondary">Compressed</span>
          </div>
        </div>
        
        <div className="text-muted">
          Last Update: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default HeatMapGrid;