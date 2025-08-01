import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

export const BitcoinDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Bitcoin Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-500 font-mono">BITCOIN ANALYTICS</h2>
        <Badge className="bg-orange-500 text-black font-mono">
          REAL-TIME
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Card */}
        <Card className="bg-gray-900/50 border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-500 font-mono">BTC/USD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">$67,234.56</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">+2.34%</span>
              <span className="text-gray-400">24h</span>
            </div>
          </CardContent>
        </Card>

        {/* Volume Card */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white font-mono">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">$45.2B</div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">High Activity</span>
            </div>
          </CardContent>
        </Card>

        {/* Market Cap */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white font-mono">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">$1.32T</div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-400">Rank #1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future Bitcoin analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white font-mono">On-Chain Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-400 py-8">
              Coming Soon: MVRV-Z, Puell Multiple, aSOPR
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white font-mono">Network Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-400 py-8">
              Coming Soon: Hash Rate, Difficulty, Mempool
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};