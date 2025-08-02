import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const MarketPulseWidget: React.FC = () => {
  const [pulse, setPulse] = useState(0);
  const [metrics, setMetrics] = useState({
    rsi: 72.4,
    momentum: 8.3,
    volume: 1.2,
    sentiment: 65
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => (prev + 1) % 100);
      setMetrics(prev => ({
        rsi: prev.rsi + (Math.random() - 0.5) * 2,
        momentum: prev.momentum + (Math.random() - 0.5) * 0.5,
        volume: prev.volume + (Math.random() - 0.5) * 0.1,
        sentiment: prev.sentiment + (Math.random() - 0.5) * 3
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-neon-teal" />
        <h3 className="text-lg font-bold text-text-primary">MARKET PULSE</h3>
      </div>

      {/* Pulse Visualization */}
      <div className="relative mb-6 flex-1 flex items-center justify-center">
        <motion.div
          className="w-32 h-32 rounded-full border-2 border-neon-teal/30"
          animate={{ 
            scale: [1, 1.1, 1],
            borderColor: ['hsl(var(--neon-teal) / 0.3)', 'hsl(var(--neon-teal))', 'hsl(var(--neon-teal) / 0.3)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-neon-teal">
              {pulse}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">RSI</span>
          <div className="flex items-center space-x-2">
            {metrics.rsi > 70 ? 
              <TrendingUp className="w-4 h-4 text-neon-orange" /> :
              <TrendingDown className="w-4 h-4 text-neon-lime" />
            }
            <span className="text-sm font-bold text-text-primary">
              {metrics.rsi.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">MOMENTUM</span>
          <span className="text-sm font-bold text-neon-teal">
            {metrics.momentum.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">VOLUME</span>
          <span className="text-sm font-bold text-text-primary">
            {metrics.volume.toFixed(1)}x
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">SENTIMENT</span>
          <span className={`text-sm font-bold ${
            metrics.sentiment > 60 ? 'text-neon-lime' : 
            metrics.sentiment < 40 ? 'text-neon-orange' : 'text-neon-gold'
          }`}>
            {metrics.sentiment.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};