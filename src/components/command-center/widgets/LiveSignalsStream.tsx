import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Signal {
  id: string;
  type: 'buy' | 'sell' | 'alert';
  symbol: string;
  message: string;
  strength: number;
  timestamp: Date;
}

export const LiveSignalsStream: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const generateSignal = (): Signal => {
      const types: Signal['type'][] = ['buy', 'sell', 'alert'];
      const symbols = ['BTC', 'ETH', 'SPY', 'TSLA', 'AAPL'];
      const messages = [
        'Bullish divergence detected',
        'Volume surge confirmed',
        'Resistance breakout',
        'Support level holding',
        'Momentum shift incoming'
      ];

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        strength: Math.floor(Math.random() * 100),
        timestamp: new Date()
      };
    };

    const interval = setInterval(() => {
      setSignals(prev => {
        const newSignal = generateSignal();
        return [newSignal, ...prev.slice(0, 4)]; // Keep only 5 signals
      });
    }, 3000);

    // Initialize with some signals
    setSignals([generateSignal(), generateSignal(), generateSignal()]);

    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = (type: Signal['type']) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-4 h-4 text-neon-lime" />;
      case 'sell': return <TrendingDown className="w-4 h-4 text-neon-orange" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-neon-gold" />;
    }
  };

  const getSignalColor = (type: Signal['type']) => {
    switch (type) {
      case 'buy': return 'text-neon-lime';
      case 'sell': return 'text-neon-orange';
      case 'alert': return 'text-neon-gold';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Radio className="w-5 h-5 text-neon-teal animate-pulse" />
        <h3 className="text-lg font-bold text-text-primary">LIVE SIGNALS</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden">
        <AnimatePresence>
          {signals.map((signal) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-3 bg-glass-bg/50 border border-glass-border rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getSignalIcon(signal.type)}
                  <span className={`text-sm font-bold ${getSignalColor(signal.type)}`}>
                    {signal.symbol}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  {signal.strength}%
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {signal.message}
              </p>
              <div className="text-xs text-text-muted mt-1">
                {signal.timestamp.toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};