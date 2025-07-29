import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Zap,
  Target,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChartType = 'line' | 'area' | 'bar' | 'candlestick' | 'heatmap' | 'scatter' | 'correlation';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  availableTypes?: ChartType[];
  className?: string;
}

const chartTypeConfig: Record<ChartType, {
  label: string;
  icon: React.ReactNode;
  description: string;
  category: 'basic' | 'advanced' | 'analysis';
}> = {
  line: {
    label: 'Line Chart',
    icon: <LineChart className="h-4 w-4" />,
    description: 'Simple time series visualization',
    category: 'basic'
  },
  area: {
    label: 'Area Chart',
    icon: <Activity className="h-4 w-4" />,
    description: 'Filled area under the curve',
    category: 'basic'
  },
  bar: {
    label: 'Bar Chart',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Discrete value comparison',
    category: 'basic'
  },
  candlestick: {
    label: 'Candlestick',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'OHLC price data visualization',
    category: 'advanced'
  },
  heatmap: {
    label: 'Heatmap',
    icon: <Target className="h-4 w-4" />,
    description: 'Color-coded intensity matrix',
    category: 'analysis'
  },
  scatter: {
    label: 'Scatter Plot',
    icon: <Zap className="h-4 w-4" />,
    description: 'Correlation and distribution',
    category: 'analysis'
  },
  correlation: {
    label: 'Correlation Matrix',
    icon: <MoreHorizontal className="h-4 w-4" />,
    description: 'Multi-indicator relationships',
    category: 'analysis'
  }
};

export function ChartTypeSelector({ 
  value, 
  onChange, 
  availableTypes = ['line', 'area', 'bar', 'candlestick', 'heatmap', 'scatter'],
  className 
}: ChartTypeSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categorizedTypes = availableTypes.reduce((acc, type) => {
    const config = chartTypeConfig[type];
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(type);
    return acc;
  }, {} as Record<string, ChartType[]>);

  const handleTypeSelect = (type: ChartType) => {
    onChange(type);
    setExpandedCategory(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Current Selection */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glass-bg border border-glass-border">
          {chartTypeConfig[value].icon}
          <span className="text-sm font-medium">{chartTypeConfig[value].label}</span>
          <Badge variant="secondary" className="text-xs">
            {chartTypeConfig[value].category}
          </Badge>
        </div>
      </div>

      {/* Type Categories */}
      <div className="space-y-3">
        {Object.entries(categorizedTypes).map(([category, types]) => (
          <div key={category}>
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="capitalize">{category} Charts</span>
              <span className={cn(
                "transition-transform",
                expandedCategory === category && "rotate-180"
              )}>
                ▼
              </span>
            </button>

            {expandedCategory === category && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {types.map(type => {
                  const config = chartTypeConfig[type];
                  const isSelected = value === type;
                  
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTypeSelect(type)}
                      className={cn(
                        "justify-start h-auto p-3 text-left",
                        isSelected && "border-primary bg-primary/10"
                      )}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="mt-0.5">{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{config.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Selection Pills */}
      <div className="flex flex-wrap gap-1 pt-2 border-t border-glass-border">
        <span className="text-xs text-muted-foreground py-1">Quick:</span>
        {['line', 'area', 'bar'].filter(type => availableTypes.includes(type as ChartType)).map(type => (
          <Button
            key={type}
            variant={value === type ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTypeSelect(type as ChartType)}
            className="h-6 px-2 text-xs"
          >
            {chartTypeConfig[type as ChartType].icon}
            <span className="ml-1">{type}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}