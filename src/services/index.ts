/**
 * Services Export Index - V6 Unified Implementation
 * Centralized exports for all data services with standardization
 */

// Core Services
export { MockDataService } from './MockDataService';
export { default as UniversalDataServiceV2 } from './UniversalDataServiceV2';

// Legacy Services (Deprecated)
export { FREDService } from './FREDService';
export { default as ProductionDataService } from './ProductionDataService';
export { WebSocketManager, WebSocketConnections } from './WebSocketManager';
export { default as RealtimeDataService } from './RealtimeDataService';

// Types
export type { 
  MockIndicatorData,
  MockEngineResult
} from './MockDataService';

export type { 
  UniversalIndicatorData, 
  DataProviderRequest,
  HealthStatus 
} from './UniversalDataServiceV2';

/**
 * Get the unified data service instance (V6)
 * Use this for all new implementations
 */
export function getUnifiedDataService() {
  const MockDataService = require('./MockDataService').MockDataService;
  return MockDataService.getInstance();
}

/**
 * Legacy compatibility function
 * @deprecated Use getUnifiedDataService() instead
 */
export function getDataService() {
  console.warn('getDataService is deprecated. Use getUnifiedDataService() instead.');
  const UniversalDataServiceV2 = require('./UniversalDataServiceV2').default;
  return UniversalDataServiceV2.getInstance();
}