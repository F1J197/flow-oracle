import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapData {
  label: string;
  value: number;
  zscore: number;
}

interface CreditStressHeatmapProps {
  data: HeatmapData[];
}

export const CreditStressHeatmap: React.FC<CreditStressHeatmapProps> = ({ data }) => {
  const getHeatmapColor = (zscore: number) => {
    if (zscore > 2) return 'bg-red-500';
    if (zscore > 1) return 'bg-orange-500';
    if (zscore > 0) return 'bg-yellow-500';
    if (zscore > -1) return 'bg-green-500';
    if (zscore > -2) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  const getTextColor = (zscore: number) => {
    return Math.abs(zscore) > 1 ? 'text-white' : 'text-black';
  };

  const defaultData: HeatmapData[] = [
    { label: 'IG Spreads', value: 125, zscore: 1.2 },
    { label: 'HY Spreads', value: 450, zscore: 0.8 },
    { label: 'CDX', value: 85, zscore: -0.5 },
    { label: 'VIX', value: 18.5, zscore: 0.2 },
    { label: 'MOVE', value: 102, zscore: 1.1 },
    { label: 'CVIX', value: 88, zscore: -0.3 },
    { label: 'SKEW', value: 145, zscore: 0.9 },
    { label: 'TERM', value: 1.2, zscore: -0.7 },
  ];

  const displayData = data.length > 0 ? data : defaultData;

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white font-mono">CREDIT STRESS HEATMAP</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {displayData.map((item, index) => (
            <div
              key={index}
              className={`
                p-3 rounded text-center transition-all duration-300 hover:scale-105
                ${getHeatmapColor(item.zscore)} ${getTextColor(item.zscore)}
              `}
            >
              <div className="font-mono text-xs font-semibold">
                {item.label}
              </div>
              <div className="font-bold text-sm">
                {item.value}
              </div>
              <div className="text-xs opacity-90">
                Z: {item.zscore.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Low Stress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High Stress</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};