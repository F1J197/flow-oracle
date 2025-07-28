import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { GlassTile } from "@/components/shared/GlassTile";
import { DataDisplay } from "@/components/shared/DataDisplay";
import { dataService } from "@/services/dataService";
import { Play, RefreshCw, Database, AlertCircle, CheckCircle } from "lucide-react";

interface IngestionLog {
  id: string;
  status: 'success' | 'failed' | 'partial';
  records_processed: number;
  error_message?: string;
  execution_time_ms: number;
  started_at: string;
  indicators: {
    symbol: string;
    name: string;
  };
}

interface Indicator {
  id: string;
  symbol: string;
  name: string;
  pillar: number;
  data_source: string;
  last_updated: string;
}

export const DataIngestionPanel = () => {
  const { toast } = useToast();
  const [isRunningFRED, setIsRunningFRED] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const [indicatorsData, logsData] = await Promise.all([
        dataService.getIndicators(),
        dataService.getIngestionLogs(undefined, 10)
      ]);
      
      setIndicators(indicatorsData);
      setIngestionLogs(logsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ingestion data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFREDIngestion = async () => {
    setIsRunningFRED(true);
    try {
      const result = await dataService.triggerFREDIngestion();
      
      toast({
        title: "FRED Ingestion Started",
        description: `Processing ${result.total_indicators} indicators`,
      });

      // Refresh data after ingestion
      setTimeout(() => {
        fetchData();
      }, 2000);

    } catch (error) {
      console.error('Error triggering FRED ingestion:', error);
      toast({
        title: "Error",
        description: "Failed to trigger FRED data ingestion",
        variant: "destructive",
      });
    } finally {
      setIsRunningFRED(false);
    }
  };

  const handleFinancialIngestion = async (source: 'finnhub' | 'twelvedata' | 'fmp' | 'marketstack') => {
    try {
      let endpoint = '';
      let symbol = '';
      
      switch (source) {
        case 'finnhub':
          endpoint = 'crypto_price';
          break;
        case 'twelvedata':
          endpoint = 'crypto_price';
          break;
        case 'fmp':
          endpoint = 'market_cap';
          symbol = 'AAPL';
          break;
        case 'marketstack':
          endpoint = 'market_data';
          symbol = 'AAPL';
          break;
      }

      const result = await dataService.triggerFinancialIngestion(source, endpoint, symbol);
      console.log(`${source} ingestion result:`, result);
      
      toast({
        title: `${source.toUpperCase()} Data Fetched`,
        description: `Successfully retrieved live market data from ${source}`,
        duration: 3000,
      });
    } catch (error) {
      console.error(`Error fetching ${source} data:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch data from ${source}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const fredIndicators = indicators.filter(i => i.data_source === 'FRED');
  const successfulRuns = ingestionLogs.filter(log => log.status === 'success').length;
  const totalRuns = ingestionLogs.length;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassTile title="FRED Indicators">
          <DataDisplay 
            value={fredIndicators.length}
            suffix="active"
            size="lg"
            color="teal"
          />
        </GlassTile>

        <GlassTile title="Success Rate">
          <DataDisplay 
            value={totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0}
            suffix="%"
            size="lg"
            color="lime"
          />
        </GlassTile>

        <GlassTile title="Last Update">
          <DataDisplay 
            value={lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
            size="md"
            color="gold"
          />
        </GlassTile>

        <GlassTile title="Total Runs">
          <DataDisplay 
            value={totalRuns}
            size="lg"
            color="fuchsia"
          />
        </GlassTile>
      </div>

      {/* Control Panel */}
      <Card className="glass-tile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Ingestion Control
          </CardTitle>
          <CardDescription>
            Trigger data ingestion for various sources and monitor execution status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleFREDIngestion}
              disabled={isRunningFRED}
              className="flex items-center gap-2"
            >
              {isRunningFRED ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunningFRED ? 'Running FRED...' : 'Run FRED Ingestion'}
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleFinancialIngestion('finnhub')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Finnhub Data
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleFinancialIngestion('twelvedata')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Twelve Data
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleFinancialIngestion('fmp')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              FMP Data
            </Button>

            <Button 
              variant="outline" 
              onClick={() => handleFinancialIngestion('marketstack')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Marketstack
            </Button>

            <Button 
              variant="outline" 
              onClick={fetchData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ingestion Logs */}
      <Card className="glass-tile">
        <CardHeader>
          <CardTitle>Recent Ingestion Logs</CardTitle>
          <CardDescription>
            Latest data ingestion runs and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ingestionLogs.length === 0 ? (
              <p className="text-text-secondary text-center py-4">
                No ingestion logs found. Run your first data ingestion above.
              </p>
            ) : (
              ingestionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="font-medium text-text-primary">
                        {log.indicators.symbol} - {log.indicators.name}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {new Date(log.started_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                    
                    {log.status === 'success' && (
                      <div className="text-sm text-text-secondary">
                        {log.records_processed} records • {log.execution_time_ms}ms
                      </div>
                    )}
                    
                    {log.error_message && (
                      <div className="text-sm text-red-400 max-w-xs truncate">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Indicators */}
      <Card className="glass-tile">
        <CardHeader>
          <CardTitle>Active Indicators</CardTitle>
          <CardDescription>
            Currently configured indicators across all pillars
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators.map((indicator) => (
              <div
                key={indicator.id}
                className="p-4 rounded-lg bg-surface/20 border border-border/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-text-primary">
                      {indicator.symbol}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {indicator.name}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Pillar {indicator.pillar}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-xs">
                    {indicator.data_source}
                  </Badge>
                  {indicator.last_updated && (
                    <div className="text-xs text-text-secondary">
                      {new Date(indicator.last_updated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};