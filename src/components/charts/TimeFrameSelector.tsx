/**
 * Time Frame Selector - Advanced time frame switching
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { ChartConfig } from '@/config/charts.config';

interface TimeFrameSelectorProps {
  config: ChartConfig;
  selectedTimeFrame: string;
  onTimeFrameChange: (timeFrame: string) => void;
  className?: string;
}

interface TimeFrameOption {
  value: string;
  label: string;
  shortLabel: string;
  description: string;
  category: 'realtime' | 'short' | 'medium' | 'long';
  recommended?: boolean;
}

const timeFrameOptions: TimeFrameOption[] = [
  {
    value: '1h',
    label: '1 Hour',
    shortLabel: '1H',
    description: 'Intraday trading and scalping',
    category: 'realtime',
    recommended: false
  },
  {
    value: '4h',
    label: '4 Hours',
    shortLabel: '4H',
    description: 'Short-term swing trading',
    category: 'realtime',
    recommended: false
  },
  {
    value: '1d',
    label: '1 Day',
    shortLabel: '1D',
    description: 'Daily price action analysis',
    category: 'short',
    recommended: true
  },
  {
    value: '1w',
    label: '1 Week',
    shortLabel: '1W',
    description: 'Weekly trend analysis',
    category: 'short',
    recommended: false
  },
  {
    value: '1m',
    label: '1 Month',
    shortLabel: '1M',
    description: 'Medium-term trend analysis',
    category: 'medium',
    recommended: true
  },
  {
    value: '3m',
    label: '3 Months',
    shortLabel: '3M',
    description: 'Quarterly performance review',
    category: 'medium',
    recommended: false
  },
  {
    value: '1y',
    label: '1 Year',
    shortLabel: '1Y',
    description: 'Long-term trend and cycles',
    category: 'long',
    recommended: false
  }
];

export const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  config,
  selectedTimeFrame,
  onTimeFrameChange,
  className = ''
}) => {
  // Filter available time frames based on chart config
  const availableTimeFrames = timeFrameOptions.filter(tf => 
    config.timeFrames.includes(tf.value as any)
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'realtime':
        return <TrendingUp className="h-3 w-3" />;
      case 'short':
        return <Clock className="h-3 w-3" />;
      case 'medium':
      case 'long':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'realtime':
        return 'text-neon-orange';
      case 'short':
        return 'text-neon-teal';
      case 'medium':
        return 'text-neon-lime';
      case 'long':
        return 'text-neon-gold';
      default:
        return 'text-text-secondary';
    }
  };

  const selectedOption = timeFrameOptions.find(tf => tf.value === selectedTimeFrame);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-text-primary font-mono text-sm font-medium">
            Time Frame
          </h4>
          <p className="text-text-secondary text-xs">
            Current: {selectedOption?.label || selectedTimeFrame}
          </p>
        </div>
        
        {selectedOption && (
          <Badge 
            variant="secondary" 
            className={`text-xs ${getCategoryColor(selectedOption.category)}`}
          >
            {getCategoryIcon(selectedOption.category)}
            <span className="ml-1">{selectedOption.category}</span>
          </Badge>
        )}
      </div>

      {/* Quick Selection Buttons */}
      <div className="flex flex-wrap gap-2">
        {availableTimeFrames.map(timeFrame => {
          const isSelected = selectedTimeFrame === timeFrame.value;
          const isRecommended = timeFrame.recommended;
          
          return (
            <Button
              key={timeFrame.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeFrameChange(timeFrame.value)}
              className={`relative text-xs transition-all ${
                isSelected 
                  ? 'bg-neon-teal text-bg-primary border-neon-teal' 
                  : 'border-glass-border hover:border-neon-teal hover:text-neon-teal'
              }`}
            >
              {timeFrame.shortLabel}
              {isRecommended && !isSelected && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-gold rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Detailed Description */}
      {selectedOption && (
        <Card className="bg-bg-primary border-glass-border p-3">
          <div className="flex items-start space-x-2">
            <div className={`mt-0.5 ${getCategoryColor(selectedOption.category)}`}>
              {getCategoryIcon(selectedOption.category)}
            </div>
            <div className="flex-1">
              <div className="text-text-primary font-mono text-xs font-medium">
                {selectedOption.label} Analysis
              </div>
              <p className="text-text-secondary text-xs mt-1">
                {selectedOption.description}
              </p>
              
              {/* Additional context based on chart type */}
              <div className="mt-2 flex items-center space-x-3 text-xs">
                <div className="text-text-secondary">
                  Chart: {config.chartType}
                </div>
                {config.realtime && selectedOption.category === 'realtime' && (
                  <div className="text-neon-lime flex items-center">
                    <div className="w-2 h-2 bg-neon-lime rounded-full mr-1 animate-pulse" />
                    Live Data
                  </div>
                )}
                {config.aggregationSupported && (
                  <div className="text-text-secondary">
                    Aggregated
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Hints */}
      <div className="text-xs text-text-secondary opacity-75">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-neon-gold rounded-full mr-1" />
            Recommended
          </div>
          {config.realtime && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-neon-lime rounded-full mr-1" />
              Real-time available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};