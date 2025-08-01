import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Leaf, Sun, Calendar } from 'lucide-react';

interface MarketRegimeIndicatorProps {
  regime: 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN';
  confidence: number;
  duration: number; // days in current regime
}

export const MarketRegimeIndicator: React.FC<MarketRegimeIndicatorProps> = ({
  regime,
  confidence,
  duration
}) => {
  const getRegimeIcon = () => {
    switch (regime) {
      case 'WINTER': return <Snowflake className="w-6 h-6 text-blue-400" />;
      case 'SPRING': return <Leaf className="w-6 h-6 text-green-400" />;
      case 'SUMMER': return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'AUTUMN': return <Calendar className="w-6 h-6 text-orange-400" />;
    }
  };

  const getRegimeColor = () => {
    switch (regime) {
      case 'WINTER': return 'text-blue-400 border-blue-400';
      case 'SPRING': return 'text-green-400 border-green-400';
      case 'SUMMER': return 'text-yellow-400 border-yellow-400';
      case 'AUTUMN': return 'text-orange-400 border-orange-400';
    }
  };

  const getRegimeDescription = () => {
    switch (regime) {
      case 'WINTER': return 'Risk-Off, High Vol, Credit Stress';
      case 'SPRING': return 'Recovery, Improving Liquidity';
      case 'SUMMER': return 'Risk-On, Low Vol, Strong Liquidity';
      case 'AUTUMN': return 'Late Cycle, Volatility Rising';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white font-mono">MARKET REGIME</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRegimeIcon()}
              <div>
                <div className={`text-2xl font-bold font-mono ${getRegimeColor()}`}>
                  {regime}
                </div>
                <div className="text-sm text-gray-400">
                  {getRegimeDescription()}
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className={getRegimeColor()}>
              {confidence}% Confidence
            </Badge>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white font-mono">{duration} days</span>
          </div>
          
          {/* Regime Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>WINTER</span>
              <span>SPRING</span>
              <span>SUMMER</span>
              <span>AUTUMN</span>
            </div>
            <div className="flex space-x-1">
              {['WINTER', 'SPRING', 'SUMMER', 'AUTUMN'].map((season, index) => (
                <div
                  key={season}
                  className={`
                    flex-1 h-2 rounded transition-all duration-300
                    ${regime === season ? 'bg-orange-500' : 'bg-gray-700'}
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};