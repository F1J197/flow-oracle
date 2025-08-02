import React, { useEffect, useState } from "react";
import { ApexDashboard } from "@/components/apex/ApexDashboard";
import { RealTimeDataPipeline } from "@/components/enhanced/RealTimeDataPipeline";
import { DataPopulator } from "@/components/system/DataPopulator";
import { motion } from "framer-motion";

/**
 * APEX FINANCIAL INTELLIGENCE PLATFORM
 * Single-dashboard elite financial intelligence system
 * Bloomberg Terminal aesthetic with institutional-grade insights
 */
const Index = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the APEX system
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-terminal flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-4xl text-accent mb-4 font-mono"
          >
            ⚡
          </motion.div>
          <div className="terminal-text text-accent text-xl mb-2">
            APEX FINANCIAL INTELLIGENCE
          </div>
          <div className="terminal-text text-muted text-sm">
            INITIALIZING ELITE SYSTEMS...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal text-primary font-mono">
      {/* Real-time Data Pipeline - Hidden but Active */}
      <RealTimeDataPipeline />
      
      {/* Main APEX Dashboard */}
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="terminal-header text-4xl md:text-5xl text-accent mb-2 tracking-wider">
            APEX INTELLIGENCE
          </h1>
          <div className="terminal-text text-muted text-sm tracking-widest">
            ELITE FINANCIAL INTELLIGENCE PLATFORM
          </div>
        </motion.div>

        {/* System Data Population */}
        <div className="mb-6">
          <DataPopulator />
        </div>

        <ApexDashboard />
      </div>
    </div>
  );
};

export default Index;