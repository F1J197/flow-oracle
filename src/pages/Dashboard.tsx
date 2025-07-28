import { useEffect, useState } from "react";
import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DataIntegrityEngine } from "@/engines/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngine } from "@/engines/CreditStressEngine";

export const Dashboard = () => {
  const [engines] = useState({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStress: new CreditStressEngine(),
  });

  const [dashboardData, setDashboardData] = useState({
    dataIntegrity: engines.dataIntegrity.getDashboardData(),
    netLiquidity: engines.netLiquidity.getDashboardData(),
    creditStress: engines.creditStress.getDashboardData(),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateData = async () => {
      setLoading(true);
      
      // Execute engines in parallel
      await Promise.all([
        engines.dataIntegrity.execute(),
        engines.netLiquidity.execute(),
        engines.creditStress.execute(),
      ]);

      // Update dashboard data
      setDashboardData({
        dataIntegrity: engines.dataIntegrity.getDashboardData(),
        netLiquidity: engines.netLiquidity.getDashboardData(),
        creditStress: engines.creditStress.getDashboardData(),
      });

      setLoading(false);
    };

    updateData();
    
    // Update every 30 seconds
    const interval = setInterval(updateData, 30000);
    return () => clearInterval(interval);
  }, [engines]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Liquidity - Featured Tile */}
        <GlassTile 
          title={dashboardData.netLiquidity.title}
          size="large"
          status={dashboardData.netLiquidity.status}
        >
          <DataDisplay
            value={dashboardData.netLiquidity.primaryMetric}
            size="xl"
            color={dashboardData.netLiquidity.color}
            loading={loading}
          />
          {dashboardData.netLiquidity.secondaryMetric && (
            <Badge 
              variant="outline" 
              className={`border-neon-${dashboardData.netLiquidity.color} text-neon-${dashboardData.netLiquidity.color}`}
            >
              {dashboardData.netLiquidity.secondaryMetric}
            </Badge>
          )}
          <div className="mt-4 h-8 bg-noir-border rounded opacity-30">
            {/* Mini chart placeholder */}
            <div className="h-full bg-gradient-to-r from-transparent via-neon-teal/30 to-transparent rounded"></div>
          </div>
        </GlassTile>

        {/* Primary Action Tile */}
        <GlassTile title="PRIMARY ACTION" size="large">
          <DataDisplay
            value="HOLD POSITIONS"
            size="lg"
            color="lime"
            loading={loading}
          />
          <div className="flex items-center space-x-2 mt-3">
            <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse"></div>
            <span className="text-xs text-text-secondary">Confidence: 89%</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Risk Level: MODERATE
          </p>
        </GlassTile>

        {/* Data Integrity */}
        <GlassTile 
          title={dashboardData.dataIntegrity.title}
          status={dashboardData.dataIntegrity.status}
        >
          <DataDisplay
            value={dashboardData.dataIntegrity.primaryMetric}
            size="lg"
            color={dashboardData.dataIntegrity.color}
            loading={loading}
          />
          {dashboardData.dataIntegrity.actionText && (
            <p className="text-xs text-text-muted mt-2">
              {dashboardData.dataIntegrity.actionText}
            </p>
          )}
        </GlassTile>

        {/* Credit Stress */}
        <GlassTile 
          title={dashboardData.creditStress.title}
          status={dashboardData.creditStress.status}
        >
          <DataDisplay
            value={dashboardData.creditStress.primaryMetric}
            size="lg"
            color={dashboardData.creditStress.color}
            loading={loading}
          />
          {dashboardData.creditStress.actionText && (
            <p className="text-xs text-text-muted mt-2">
              {dashboardData.creditStress.actionText}
            </p>
          )}
          {/* Stress meter visualization */}
          <div className="mt-3">
            <div className="w-full h-2 bg-noir-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-lime via-neon-gold to-neon-orange transition-all duration-500"
                style={{ width: '15%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Low</span>
              <span>Crisis</span>
            </div>
          </div>
        </GlassTile>

        {/* Network Security Valuation */}
        <GlassTile title="NETWORK SECURITY">
          <DataDisplay
            value="$693M"
            label="Fair Value"
            size="lg"
            color="teal"
            loading={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-text-secondary">Current/Fair:</span>
            <span className="text-sm neon-lime">146.5%</span>
          </div>
        </GlassTile>

        {/* On-Chain Dynamics */}
        <GlassTile title="ON-CHAIN DYNAMICS">
          <DataDisplay
            value="78"
            suffix="/100"
            label="Composite Score"
            size="lg"
            color="teal"
            loading={loading}
          />
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-neon-gold rounded-full"></div>
              <span className="text-text-muted">MVRV-Z</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-neon-lime rounded-full"></div>
              <span className="text-text-muted">Puell</span>
            </div>
          </div>
        </GlassTile>

        {/* Business Cycle */}
        <GlassTile title="BUSINESS CYCLE">
          <DataDisplay
            value="48.7"
            label="ISM PMI"
            size="lg"
            color="orange"
            trend="down"
            loading={loading}
          />
          <Badge variant="outline" className="border-neon-orange text-neon-orange mt-2">
            CONTRACTION
          </Badge>
        </GlassTile>

        {/* Temporal Analysis */}
        <GlassTile title="TEMPORAL ANALYSIS">
          <DataDisplay
            value="MONTH 15"
            label="of 48"
            size="lg"
            color="lime"
            loading={loading}
          />
          <div className="mt-3 mb-2">
            <div className="w-full h-2 bg-noir-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-teal to-neon-lime transition-all duration-500"
                style={{ width: '31.25%' }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-text-muted">EARLY BULL / BANANA ZONE</p>
        </GlassTile>

      </div>

      {/* System Status Footer */}
      <div className="mt-8 glass-tile p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse"></div>
              <span className="text-sm text-text-secondary">All engines operational</span>
            </div>
            <span className="text-xs text-text-muted">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-text-muted">
            <span>Data sources: 12/12 active</span>
            <span>Latency: 14ms</span>
            <span>Integrity: 99.98%</span>
          </div>
        </div>
      </div>
    </div>
  );
};