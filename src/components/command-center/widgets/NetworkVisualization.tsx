import React from 'react';
import { motion } from 'framer-motion';
import { Network, Zap } from 'lucide-react';

export const NetworkVisualization: React.FC = () => {
  const nodes = [
    { id: 1, x: 50, y: 30, strength: 0.8 },
    { id: 2, x: 20, y: 60, strength: 0.6 },
    { id: 3, x: 80, y: 70, strength: 0.9 },
    { id: 4, x: 30, y: 80, strength: 0.4 },
    { id: 5, x: 70, y: 40, strength: 0.7 }
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Network className="w-5 h-5 text-neon-fuchsia" />
        <h3 className="text-sm font-bold text-text-primary">NETWORK</h3>
      </div>

      <div className="flex-1 relative bg-glass-bg/20 rounded">
        <svg className="w-full h-full">
          {/* Connections */}
          {nodes.map((node, i) => 
            nodes.slice(i + 1).map((otherNode, j) => (
              <motion.line
                key={`${node.id}-${otherNode.id}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${otherNode.x}%`}
                y2={`${otherNode.y}%`}
                stroke="hsl(var(--neon-fuchsia) / 0.3)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: (i + j) * 0.1 }}
              />
            ))
          )}
          
          {/* Nodes */}
          {nodes.map((node) => (
            <motion.circle
              key={node.id}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="4"
              fill="hsl(var(--neon-fuchsia))"
              initial={{ scale: 0 }}
              animate={{ scale: node.strength }}
              transition={{ 
                duration: 1, 
                delay: node.id * 0.2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 text-xs text-text-secondary text-center">
        <Zap className="w-3 h-3 inline mr-1" />
        REAL-TIME CONNECTIONS
      </div>
    </div>
  );
};