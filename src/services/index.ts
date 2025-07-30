/**
 * Services Export Index
 * Centralized exports for all data services
 */

// Main universal data service (V2 is production ready)
export { default as UniversalDataService } from './UniversalDataServiceV2';
export { default as UniversalDataServiceV1 } from './UniversalDataService';

// Specialized services
export { default as FREDService } from './FREDService';

// Legacy services (deprecated - use UniversalDataService)
export { default as ProductionDataService } from './ProductionDataService';

// Types
export type { 
  UniversalIndicatorData, 
  DataProviderRequest,
  HealthStatus 
} from './UniversalDataServiceV2';

// Configuration
export * from '../config/fredSymbolMapping';

/**
 * Get the recommended data service instance
 * Use this for all new implementations
 */
export function getDataService() {
  // Import dynamically to avoid circular dependencies
  const UniversalDataServiceV2 = require('./UniversalDataServiceV2').default;
  return UniversalDataServiceV2.getInstance();
}

/**
 * Legacy compatibility function
 * @deprecated Use getDataService() instead
 */
export function getLegacyDataService() {
  console.warn('getLegacyDataService is deprecated. Use getDataService() instead.');
  const UniversalDataService = require('./UniversalDataService').default;
  return UniversalDataService.getInstance();
}