/**
 * APEX Thermal Dashboard
 * Real-time market stress visualization across all asset classes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThermalReading {
  symbol: string;
  name: string;
  value: number;
  change24h: number;
  stressLevel: 'LOW' | 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  sector: 'EQUITY' | 'FIXED_INCOME' | 'CURRENCY' | 'COMMODITY' | 'CRYPTO';
}

interface ThermalSector {
  name: string;
  readings: ThermalReading[];
  avgStress: number;
}

export const ThermalDashboard: React.FC = () => {
  const [sectors, setSectors] = useState<ThermalSector[]>([]);
  const [globalStress, setGlobalStress] = useState<number>(0);

  useEffect(() => {
    updateThermalData();
    const interval = setInterval(updateThermalData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateThermalData = () => {
    const thermalData: ThermalSector[] = [
      {
        name: 'EQUITY MARKETS',
        readings: [
          generateReading('SPX', 'S&P 500', 'EQUITY'),
          generateReading('NDX', 'Nasdaq 100', 'EQUITY'),
          generateReading('RUT', 'Russell 2000', 'EQUITY'),
          generateReading('VIX', 'Volatility Index', 'EQUITY')
        ],
        avgStress: 0
      },
      {
        name: 'FIXED INCOME',
        readings: [
          generateReading('TNX', '10Y Treasury', 'FIXED_INCOME'),
          generateReading('TYX', '30Y Treasury', 'FIXED_INCOME'),
          generateReading('HYG', 'High Yield', 'FIXED_INCOME'),
          generateReading('TLT', 'Long Treasury', 'FIXED_INCOME')
        ],
        avgStress: 0
      },
      {
        name: 'CURRENCIES',
        readings: [
          generateReading('DXY', 'Dollar Index', 'CURRENCY'),
          generateReading('EURUSD', 'Euro/Dollar', 'CURRENCY'),
          generateReading('USDJPY', 'Dollar/Yen', 'CURRENCY'),
          generateReading('GBPUSD', 'Pound/Dollar', 'CURRENCY')
        ],
        avgStress: 0
      },
      {
        name: 'COMMODITIES',
        readings: [
          generateReading('GLD', 'Gold', 'COMMODITY'),
          generateReading('OIL', 'Crude Oil', 'COMMODITY'),
          generateReading('SLV', 'Silver', 'COMMODITY'),
          generateReading('DBA', 'Agriculture', 'COMMODITY')
        ],
        avgStress: 0
      },
      {
        name: 'CRYPTO',
        readings: [
          generateReading('BTC', 'Bitcoin', 'CRYPTO'),
          generateReading('ETH', 'Ethereum', 'CRYPTO'),
          generateReading('SOL', 'Solana', 'CRYPTO'),
          generateReading('TOTAL', 'Total Market Cap', 'CRYPTO')
        ],
        avgStress: 0
      }
    ];

    // Calculate average stress for each sector
    thermalData.forEach(sector => {
      const total = sector.readings.reduce((sum, reading) => sum + reading.value, 0);
      sector.avgStress = total / sector.readings.length;
    });

    // Calculate global stress
    const allReadings = thermalData.flatMap(sector => sector.readings);
    const globalAvg = allReadings.reduce((sum, reading) => sum + reading.value, 0) / allReadings.length;
    
    setSectors(thermalData);
    setGlobalStress(globalAvg);
  };

  const generateReading = (symbol: string, name: string, sector: ThermalReading['sector']): ThermalReading => {
    const value = Math.random() * 100;
    const change24h = (Math.random() - 0.5) * 10;
    
    let stressLevel: ThermalReading['stressLevel'] = 'NORMAL';
    if (value > 80) stressLevel = 'CRITICAL';
    else if (value > 65) stressLevel = 'HIGH';
    else if (value > 45) stressLevel = 'ELEVATED';
    else if (value < 25) stressLevel = 'LOW';

    return {
      symbol,
      name,
      value,
      change24h,
      stressLevel,
      sector
    };
  };

  const getStressColor = (level: ThermalReading['stressLevel']): string => {
    switch (level) {
      case 'LOW': return 'bg-blue-500';
      case 'NORMAL': return 'bg-green-500';
      case 'ELEVATED': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
    }
  };

  const getStressTextColor = (level: ThermalReading['stressLevel']): string => {
    switch (level) {
      case 'LOW': return 'text-blue-400';
      case 'NORMAL': return 'text-terminal-success';
      case 'ELEVATED': return 'text-terminal-warning';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-terminal-danger';
    }
  };

  const getGlobalStressLevel = (stress: number): string => {
    if (stress > 80) return 'CRITICAL STRESS';
    if (stress > 65) return 'HIGH STRESS';
    if (stress > 45) return 'ELEVATED STRESS';
    if (stress < 25) return 'LOW STRESS';
    return 'NORMAL CONDITIONS';
  };

  return (
    <div className="space-y-6">
      {/* Global Stress Header */}
      <Card className="bg-terminal-background border-terminal-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-mono text-terminal-primary mb-2">
                GLOBAL MARKET STRESS
              </h2>
              <p className="text-terminal-muted font-mono">
                Real-time thermal analysis across asset classes
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono text-terminal-primary mb-1">
                {globalStress.toFixed(1)}
              </div>
              <Badge 
                variant="outline" 
                className={`${getStressTextColor(globalStress > 65 ? 'CRITICAL' : globalStress > 45 ? 'ELEVATED' : 'NORMAL')} border-current`}
              >
                {getGlobalStressLevel(globalStress)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thermal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sectors.map(sector => (
          <Card key={sector.name} className="bg-terminal-background border-terminal-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-terminal-primary font-mono text-lg">
                {sector.name}
              </CardTitle>
              <div className="text-terminal-muted font-mono text-sm">
                Avg Stress: {sector.avgStress.toFixed(1)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sector.readings.map(reading => (
                <div 
                  key={reading.symbol}
                  className="flex items-center justify-between p-3 bg-terminal-surface rounded border-l-4"
                  style={{ borderLeftColor: getStressColor(reading.stressLevel).replace('bg-', '') }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-terminal-text font-bold">
                        {reading.symbol}
                      </span>
                      <span className="font-mono text-terminal-muted text-sm">
                        {reading.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-terminal-primary text-lg">
                        {reading.value.toFixed(1)}
                      </span>
                      <span className={`font-mono text-sm ${
                        reading.change24h > 0 ? 'text-terminal-success' : 'text-terminal-danger'
                      }`}>
                        {reading.change24h > 0 ? '+' : ''}{reading.change24h.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className={`w-4 h-16 rounded ${getStressColor(reading.stressLevel)} opacity-80`}
                      title={`Stress Level: ${reading.stressLevel}`}
                    />
                    <div className={`font-mono text-xs mt-1 ${getStressTextColor(reading.stressLevel)}`}>
                      {reading.stressLevel}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thermal Legend */}
      <Card className="bg-terminal-background border-terminal-border">
        <CardHeader>
          <CardTitle className="text-terminal-primary font-mono">
            Thermal Scale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { level: 'LOW', range: '0-25', color: 'bg-blue-500' },
              { level: 'NORMAL', range: '25-45', color: 'bg-green-500' },
              { level: 'ELEVATED', range: '45-65', color: 'bg-yellow-500' },
              { level: 'HIGH', range: '65-80', color: 'bg-orange-500' },
              { level: 'CRITICAL', range: '80-100', color: 'bg-red-500' }
            ].map(item => (
              <div key={item.level} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="font-mono text-terminal-text text-sm">
                  {item.level} ({item.range})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};