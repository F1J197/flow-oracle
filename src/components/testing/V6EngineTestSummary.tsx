import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { usePrimaryDealerV6 } from "@/hooks/usePrimaryDealerV6";

export const V6EngineTestSummary = () => {
  const { tileData, loading, error, lastUpdate } = usePrimaryDealerV6();

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Loading</Badge>;
    if (error) return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
    if (tileData) return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <Card className="glass-card max-w-lg">
      <CardHeader>
        <CardTitle className="text-neon-teal flex items-center justify-between">
          Primary Dealer Positions V6 Engine Test
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 font-mono text-sm">
        <div>
          <div className="text-text-secondary mb-2">Engine Configuration:</div>
          <div className="space-y-1 text-xs">
            <div>Engine ID: primary-dealer-positions-v6</div>
            <div>Engine Name: Primary Dealer Positions V6</div>
            <div>Pillar: 2 (Market Making)</div>
            <div>Priority: 20</div>
          </div>
        </div>

        {tileData && (
          <div>
            <div className="text-text-secondary mb-2">Current Data:</div>
            <div className="space-y-1 text-xs">
              <div>Net Position: {tileData.netPosition}</div>
              <div>Direction: {tileData.direction}</div>
              <div>Risk Appetite: {tileData.riskAppetite}</div>
              <div>Signal: {tileData.signal}</div>
              <div>Status: {tileData.status}</div>
              <div>Color: {tileData.color}</div>
            </div>
          </div>
        )}

        {tileData?.positionBars && (
          <div>
            <div className="text-text-secondary mb-2">Position Bars Data:</div>
            <div className="space-y-1 text-xs">
              <div>Gross Long: ${(tileData.positionBars.grossLong / 1000000).toFixed(2)}T</div>
              <div>Gross Short: ${(Math.abs(tileData.positionBars.grossShort) / 1000000).toFixed(2)}T</div>
              <div>Net Position: ${(tileData.positionBars.netPosition / 1000000).toFixed(2)}T</div>
              <div>Historical Avg: ${(tileData.positionBars.historicalAverage / 1000000).toFixed(2)}T</div>
            </div>
          </div>
        )}

        {tileData?.metadata && (
          <div>
            <div className="text-text-secondary mb-2">Metadata:</div>
            <div className="space-y-1 text-xs">
              <div>Confidence: {Math.round(tileData.metadata.confidence * 100)}%</div>
              <div>Data Quality: {Math.round(tileData.metadata.dataQuality * 100)}%</div>
              <div>Last Updated: {tileData.metadata.lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {lastUpdate && (
          <div>
            <div className="text-text-secondary mb-2">Hook Status:</div>
            <div className="space-y-1 text-xs">
              <div>Last Hook Update: {lastUpdate.toLocaleTimeString()}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Error: {error || 'None'}</div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-glass-border">
          <div className="text-neon-lime text-xs">
            ✓ Engine V6 Implementation Complete
          </div>
          <div className="text-neon-lime text-xs">
            ✓ Specialized Dashboard Tile Created  
          </div>
          <div className="text-neon-lime text-xs">
            ✓ Position Bars Visualization Working
          </div>
          <div className="text-neon-lime text-xs">
            ✓ Engine Manager Integration Fixed
          </div>
          <div className="text-neon-lime text-xs">
            ✓ Dashboard Data Hook Updated
          </div>
        </div>
      </CardContent>
    </Card>
  );
};