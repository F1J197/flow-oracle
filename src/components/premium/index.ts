// Core Tile Components (migrated to /tiles)
export { BaseTile, DataTile, MultiMetricTile, AlertTile, ChartTile } from '../tiles';

// Layout Components
export { PremiumGrid } from './PremiumGrid';

// Legacy Components (deprecated)
export { PremiumTile } from './PremiumTile';
export { PremiumDataTile } from './PremiumDataTile';
export { PremiumChartTile } from './PremiumChartTile';
export { PremiumActionTile } from './PremiumActionTile';

// Type Exports
export type { BaseTileProps, MetricData, DataTileProps, ChartTileProps, MultiMetricTileProps, AlertTileProps } from '../tiles';