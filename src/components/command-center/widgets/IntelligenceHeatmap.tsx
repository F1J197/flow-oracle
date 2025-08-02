import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';

export const IntelligenceHeatmap: React.FC = () => {
  const sectors = [
    { name: 'TECH', value: 85, change: 2.3 },
    { name: 'FINANCE', value: 72, change: -1.2 },
    { name: 'ENERGY', value: 68, change: 4.1 },
    { name: 'HEALTHCARE', value: 91, change: 0.8 },
    { name: 'CONSUMER', value: 56, change: -3.4 },
    { name: 'MATERIALS', value: 78, change: 1.9 }
  ];

  const getHeatColor = (value: number) => {
    if (value > 80) return 'bg-neon-lime';
    if (value > 60) return 'bg-neon-gold';
    if (value > 40) return 'bg-neon-orange';
    return 'bg-neon-fuchsia';
  };

  const getHeatOpacity = (value: number) => {
    return value / 100;
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Thermometer className="w-5 h-5 text-neon-orange" />
        <h3 className="text-lg font-bold text-text-primary">SECTOR HEAT</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {sectors.map((sector, index) => (
          <motion.div
            key={sector.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-lg border border-glass-border overflow-hidden`}
          >
            {/* Heat Background */}
            <div 
              className={`absolute inset-0 ${getHeatColor(sector.value)}`}
              style={{ opacity: getHeatOpacity(sector.value) * 0.3 }}
            />
            
            <div className="relative z-10">
              <div className="text-xs font-bold text-text-primary mb-1">
                {sector.name}
              </div>
              <div className="text-lg font-bold text-text-primary">
                {sector.value}%
              </div>
              <div className={`text-xs ${
                sector.change > 0 ? 'text-neon-lime' : 'text-neon-orange'
              }`}>
                {sector.change > 0 ? '+' : ''}{sector.change.toFixed(1)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};