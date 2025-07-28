export interface PrimaryDealerTileData {
  title: string;
  netPosition: string;           // e.g., "-$310B"
  direction: 'up' | 'down' | 'neutral';
  riskAppetite: 'EXPANDING' | 'CONTRACTING' | 'STABLE' | 'CRISIS';
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  status: 'normal' | 'warning' | 'critical';
  color: 'teal' | 'orange' | 'lime' | 'gold' | 'fuchsia';
  
  // Position bars data
  positionBars: {
    grossLong: number;         // Gross long positions
    grossShort: number;        // Gross short positions  
    netPosition: number;       // Net position (long - short)
    historicalAverage: number; // Historical average for comparison
    
    // Normalized values for display (0-100)
    grossLongPct: number;
    grossShortPct: number;
    netPositionPct: number;
    historicalAvgPct: number;
  };
  
  // Additional context
  metadata: {
    lastUpdated: Date;
    confidence: number;
    dataQuality: number;
  };
}

export interface PositionBarsData {
  grossLong: number;
  grossShort: number;
  netPosition: number;
  historicalAverage: number;
  grossLongPct: number;
  grossShortPct: number;
  netPositionPct: number;
  historicalAvgPct: number;
}