/**
 * EXECUTIVE BRIEFING - Narrative Intelligence Summary
 * Condensed, actionable intelligence for decision makers
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutiveBriefingProps {
  narrativeHeadline: string;
  executiveSummary: string[];
}

export const ExecutiveBriefing: React.FC<ExecutiveBriefingProps> = ({
  narrativeHeadline,
  executiveSummary
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="terminal-panel h-full">
        <CardHeader className="pb-4">
          <CardTitle className="terminal-header flex items-center gap-3">
            <Brain className="w-6 h-6" />
            EXECUTIVE BRIEFING
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Headline */}
            <div className="p-4 border-l-4 border-accent bg-accent/5">
              <div className="text-accent font-semibold text-xl leading-relaxed">
                {narrativeHeadline}
              </div>
            </div>
            
            {/* Summary Points */}
            <div className="space-y-3">
              {executiveSummary.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0" />
                  <div className="text-base leading-relaxed">{point}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};