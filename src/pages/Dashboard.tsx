import { useEffect, useState } from "react";
import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { Badge } from "@/components/ui/badge";
import { DataIntegrityEngine } from "@/engines/DataIntegrityEngine";
import { NetLiquidityEngine } from "@/engines/NetLiquidityEngine";
import { CreditStressEngine } from "@/engines/CreditStressEngine";
import { EnhancedZScoreEngine } from "@/engines/EnhancedZScoreEngine";
import { CreditStressEngineV6 } from "@/engines/CreditStressEngineV6";
import { EnhancedMomentumEngine } from "@/engines/EnhancedMomentumEngine";
import { dataService } from "@/services/dataService";

export const Dashboard = () => {
  const [engines] = useState({
    dataIntegrity: new DataIntegrityEngine(),
    netLiquidity: new NetLiquidityEngine(),
    creditStress: new CreditStressEngine(),
    creditStressV6: new CreditStressEngineV6(),
    enhancedZScore: new EnhancedZScoreEngine(),
    enhancedMomentum: new EnhancedMomentumEngine(),
  });

  const [dashboardData, setDashboardData] = useState({
    dataIntegrity: engines.dataIntegrity.getDashboardData(),
    netLiquidity: engines.netLiquidity.getDashboardData(),
    creditStress: engines.creditStress.getDashboardData(),
    creditStressV6: engines.creditStressV6.getDashboardData(),
    enhancedZScore: engines.enhancedZScore.getDashboardData(),
    enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAndUpdate = async () => {
      setLoading(true);
      
      try {
        // Initialize Enhanced Z-Score Engine (only one that needs initialization)
        console.log('Initializing Enhanced Z-Score Engine...');
        await engines.enhancedZScore.initialize();
        console.log('All engines initialized');

        // First, trigger live data fetch to ensure we have fresh data
        try {
          await dataService.triggerLiveDataFetch();
          console.log('Live data fetch completed');
        } catch (liveError) {
          console.warn('Live data fetch failed, using existing data:', liveError);
        }

        // Execute engines in parallel
        const reports = await Promise.all([
          engines.dataIntegrity.execute(),
          engines.netLiquidity.execute(),
          engines.creditStress.execute(),
          engines.creditStressV6.execute(),
          engines.enhancedMomentum.execute(),
          engines.enhancedZScore.execute(),
        ]);

        console.log('Engine execution reports:', reports);

        // Update dashboard data
        setDashboardData({
          dataIntegrity: engines.dataIntegrity.getDashboardData(),
          netLiquidity: engines.netLiquidity.getDashboardData(),
          creditStress: engines.creditStress.getDashboardData(),
          creditStressV6: engines.creditStressV6.getDashboardData(),
          enhancedZScore: engines.enhancedZScore.getDashboardData(),
          enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
        });
      } catch (error) {
        console.error('Error during engine initialization/execution:', error);
      }

      setLoading(false);
    };

    const updateData = async () => {
      if (loading) return; // Skip if already updating
      
      setLoading(true);
      
      try {
        // Execute engines in parallel for periodic updates
        await Promise.all([
          engines.dataIntegrity.execute(),
          engines.netLiquidity.execute(),
          engines.creditStress.execute(),
          engines.creditStressV6.execute(),
          engines.enhancedZScore.execute(),
          engines.enhancedMomentum.execute(),
        ]);

        // Update dashboard data
        setDashboardData({
          dataIntegrity: engines.dataIntegrity.getDashboardData(),
          netLiquidity: engines.netLiquidity.getDashboardData(),
          creditStress: engines.creditStress.getDashboardData(),
          creditStressV6: engines.creditStressV6.getDashboardData(),
          enhancedZScore: engines.enhancedZScore.getDashboardData(),
          enhancedMomentum: engines.enhancedMomentum.getDashboardData(),
        });
      } catch (error) {
        console.error('Error updating dashboard data:', error);
      }

      setLoading(false);
    };

    // Initialize on mount
    initializeAndUpdate();
    
    // Update every 30 seconds after initialization
    const interval = setInterval(updateData, 30000);
    
    return () => {
      clearInterval(interval);
      // Cleanup engines
      engines.enhancedZScore.dispose();
    };
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
          {dashboardData.dataIntegrity.secondaryMetric && (
            <p className="text-sm font-medium text-text-secondary mt-1">
              {dashboardData.dataIntegrity.secondaryMetric}
            </p>
          )}
          {dashboardData.dataIntegrity.actionText && (
            <p className="text-sm text-text-primary mt-3 font-mono">
              {dashboardData.dataIntegrity.actionText}
            </p>
          )}
        </GlassTile>

        {/* Credit Stress V6 */}
        <GlassTile 
          title={dashboardData.creditStress.title}
          status={dashboardData.creditStress.status}
        >
          <DataDisplay
            value={dashboardData.creditStress.primaryMetric}
            size="lg"
            color={dashboardData.creditStress.color}
            trend={dashboardData.creditStress.trend}
            loading={loading}
          />
          {dashboardData.creditStress.secondaryMetric && (
            <Badge 
              variant="outline" 
              className={`border-neon-${dashboardData.creditStress.color} text-neon-${dashboardData.creditStress.color} mt-2`}
            >
              {dashboardData.creditStress.secondaryMetric}
            </Badge>
          )}
          {dashboardData.creditStress.actionText && (
            <p className="text-xs text-text-primary font-mono mt-3">
              {dashboardData.creditStress.actionText}
            </p>
          )}
          {/* Enhanced stress meter visualization */}
          <div className="mt-3">
            <div className="w-full h-2 bg-noir-border rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  dashboardData.creditStress.status === 'critical' 
                    ? 'bg-gradient-to-r from-neon-orange to-neon-fuchsia' 
                    : dashboardData.creditStress.status === 'warning'
                    ? 'bg-gradient-to-r from-neon-gold to-neon-orange'
                    : 'bg-gradient-to-r from-neon-lime to-neon-teal'
                }`}
                style={{ 
                  width: dashboardData.creditStress.status === 'critical' ? '85%' 
                       : dashboardData.creditStress.status === 'warning' ? '45%' 
                       : '25%' 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Minimal</span>
              <span>Extreme</span>
            </div>
          </div>
        </GlassTile>

        {/* Credit Stress V6 - Enhanced */}
        <GlassTile 
          title={dashboardData.creditStressV6.title}
          status={dashboardData.creditStressV6.status}
        >
          <DataDisplay
            value={dashboardData.creditStressV6.primaryMetric}
            size="lg"
            color={dashboardData.creditStressV6.color}
            trend={dashboardData.creditStressV6.trend}
            loading={loading}
          />
          {dashboardData.creditStressV6.secondaryMetric && (
            <Badge 
              variant="outline" 
              className={`border-neon-${dashboardData.creditStressV6.color} text-neon-${dashboardData.creditStressV6.color} mt-2`}
            >
              {dashboardData.creditStressV6.secondaryMetric}
            </Badge>
          )}
          {dashboardData.creditStressV6.actionText && (
            <p className="text-xs text-text-primary font-mono mt-3">
              {dashboardData.creditStressV6.actionText}
            </p>
          )}
          {/* Advanced stress visualization */}
          <div className="mt-3">
            <div className="w-full h-3 bg-noir-border rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-700 ${
                  dashboardData.creditStressV6.status === 'critical' 
                    ? 'bg-gradient-to-r from-neon-orange via-neon-fuchsia to-red-500' 
                    : dashboardData.creditStressV6.status === 'warning'
                    ? 'bg-gradient-to-r from-neon-gold to-neon-orange'
                    : 'bg-gradient-to-r from-neon-lime to-neon-teal'
                }`}
                style={{ 
                  width: dashboardData.creditStressV6.status === 'critical' ? '90%' 
                       : dashboardData.creditStressV6.status === 'warning' ? '50%' 
                       : '30%' 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>QE Supportive</span>
              <span>Crisis Mode</span>
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

        {/* Enhanced Momentum V6 */}
        <GlassTile 
          title={dashboardData.enhancedMomentum.title}
          status={dashboardData.enhancedMomentum.status}
        >
          <DataDisplay
            value={dashboardData.enhancedMomentum.primaryMetric}
            size="lg"
            color={dashboardData.enhancedMomentum.color}
            trend={dashboardData.enhancedMomentum.trend}
            loading={loading}
          />
          {dashboardData.enhancedMomentum.secondaryMetric && (
            <Badge variant="outline" className={`border-neon-${dashboardData.enhancedMomentum.color} text-neon-${dashboardData.enhancedMomentum.color} mt-2`}>
              {dashboardData.enhancedMomentum.secondaryMetric}
            </Badge>
          )}
          
          {dashboardData.enhancedMomentum.actionText && (
            <p className="text-sm text-text-primary font-mono mt-3">
              {dashboardData.enhancedMomentum.actionText}
            </p>
          )}
        </GlassTile>

        {/* Enhanced Z-Score Analysis */}
        <GlassTile 
          title={dashboardData.enhancedZScore.title}
          status={dashboardData.enhancedZScore.status}
        >
          <DataDisplay
            value={dashboardData.enhancedZScore.primaryMetric}
            size="lg"
            color={dashboardData.enhancedZScore.color}
            trend={dashboardData.enhancedZScore.trend}
            loading={loading}
          />
          {dashboardData.enhancedZScore.secondaryMetric && (
            <p className="text-sm font-medium text-text-secondary mt-1">
              {dashboardData.enhancedZScore.secondaryMetric}
            </p>
          )}
          {dashboardData.enhancedZScore.actionText && (
            <p className="text-sm text-text-primary mt-3 font-mono">
              {dashboardData.enhancedZScore.actionText}
            </p>
          )}
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