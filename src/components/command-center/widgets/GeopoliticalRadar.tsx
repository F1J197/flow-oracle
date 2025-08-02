import React from 'react';
import { motion } from 'framer-motion';
import { Globe, AlertTriangle } from 'lucide-react';

export const GeopoliticalRadar: React.FC = () => {
  const events = [
    { region: 'US', risk: 'LOW', color: 'neon-lime' },
    { region: 'EU', risk: 'MEDIUM', color: 'neon-gold' },
    { region: 'ASIA', risk: 'HIGH', color: 'neon-orange' },
    { region: 'EMERGING', risk: 'CRITICAL', color: 'neon-fuchsia' }
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="w-5 h-5 text-neon-blue" />
        <h3 className="text-sm font-bold text-text-primary">GEO RADAR</h3>
      </div>

      <div className="flex-1 relative">
        {/* Radar Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-24 h-24 rounded-full border border-neon-blue/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border border-neon-blue/20" />
          </motion.div>
        </div>

        {/* Risk Points */}
        <div className="space-y-2 mt-8">
          {events.map((event, index) => (
            <motion.div
              key={event.region}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center justify-between p-2 bg-glass-bg/30 rounded"
            >
              <span className="text-xs font-bold text-text-primary">
                {event.region}
              </span>
              <div className="flex items-center space-x-1">
                <AlertTriangle className={`w-3 h-3 text-${event.color}`} />
                <span className={`text-xs text-${event.color}`}>
                  {event.risk}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};