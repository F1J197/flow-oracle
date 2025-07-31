/**
 * Master Prompts Compliance Utilities
 * Validation and migration helpers for Master Prompts compliance
 */

import { MasterPromptsEngineRegistry } from '@/engines/base/MasterPromptsEngineRegistry';
import { ALL_INDICATORS } from '@/config/indicators.config';
import { API_CONFIG } from '@/config/api.config';

export interface ComplianceReport {
  compliant: boolean;
  score: number;
  issues: ComplianceIssue[];
  recommendations: string[];
}

export interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'architecture' | 'configuration' | 'implementation' | 'documentation';
  message: string;
  solution?: string;
}

/**
 * Validate Master Prompts compliance
 */
export function validateMasterPromptsCompliance(): ComplianceReport {
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];

  // Check configuration completeness
  validateConfiguration(issues);
  
  // Check engine architecture
  validateEngineArchitecture(issues);
  
  // Check indicator coverage
  validateIndicatorCoverage(issues, recommendations);
  
  // Calculate compliance score
  const totalChecks = 10;
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;
  
  const score = Math.max(0, 
    100 - (criticalIssues * 25) - (highIssues * 10) - (mediumIssues * 5)
  );

  return {
    compliant: score >= 90 && criticalIssues === 0,
    score,
    issues,
    recommendations
  };
}

function validateConfiguration(issues: ComplianceIssue[]): void {
  // Check API configuration
  if (!API_CONFIG) {
    issues.push({
      severity: 'critical',
      category: 'configuration',
      message: 'API configuration missing',
      solution: 'Implement api.config.ts with all required endpoints'
    });
  }

  // Check indicators configuration
  if (!ALL_INDICATORS || ALL_INDICATORS.length < 50) {
    issues.push({
      severity: 'high',
      category: 'configuration',
      message: `Insufficient indicators configured (${ALL_INDICATORS?.length || 0}/50+)`,
      solution: 'Complete indicators.config.ts with all 50+ market indicators'
    });
  }
}

function validateEngineArchitecture(issues: ComplianceIssue[]): void {
  try {
    const registry = MasterPromptsEngineRegistry.getInstance();
    
    if (!registry) {
      issues.push({
        severity: 'critical',
        category: 'architecture',
        message: 'Master Prompts Engine Registry not available',
        solution: 'Implement MasterPromptsEngineRegistry system'
      });
    }
  } catch (error) {
    issues.push({
      severity: 'high',
      category: 'architecture',
      message: 'Engine registry initialization failed',
      solution: 'Fix engine registry implementation'
    });
  }
}

function validateIndicatorCoverage(issues: ComplianceIssue[], recommendations: string[]): void {
  const requiredPillars: Array<1 | 2 | 3> = [1, 2, 3];
  const availablePillars = new Set(ALL_INDICATORS?.map(i => i.pillar) || []);
  
  for (const pillar of requiredPillars) {
    if (!availablePillars.has(pillar)) {
      issues.push({
        severity: 'high',
        category: 'implementation',
        message: `Missing Pillar ${pillar} indicators`,
        solution: `Implement Pillar ${pillar} indicator engines`
      });
    }
  }

  // Add recommendations
  recommendations.push(
    'Implement real-time WebSocket connections for high-frequency data',
    'Add comprehensive error handling and fallback mechanisms',
    'Set up monitoring and alerting for engine health',
    'Implement data validation and integrity checks',
    'Add comprehensive logging and debugging capabilities'
  );
}

/**
 * Generate migration plan for Master Prompts compliance
 */
export function generateMigrationPlan(): string[] {
  const plan = [
    '1. Configuration Consolidation',
    '   - Implement api.config.ts with all external API configurations',
    '   - Complete indicators.config.ts with 50+ market indicators',
    '   - Consolidate environment variables and settings',
    '',
    '2. Engine Architecture Migration',
    '   - Implement MasterPromptBaseEngine with EventEmitter pattern',
    '   - Set up MasterPromptsEngineRegistry for unified management',
    '   - Migrate existing engines to new base class',
    '',
    '3. Data Pipeline Enhancement',
    '   - Implement robust data ingestion services',
    '   - Add comprehensive caching and validation',
    '   - Set up real-time WebSocket connections',
    '',
    '4. System Integration',
    '   - Update React hooks for new engine system',
    '   - Implement comprehensive error boundaries',
    '   - Add system health monitoring',
    '',
    '5. Testing and Validation',
    '   - Run compliance validation tests',
    '   - Perform integration testing',
    '   - Validate all 28 engines functionality',
    '',
    '6. Documentation and Cleanup',
    '   - Update documentation to reflect new architecture',
    '   - Remove redundant code and dependencies',
    '   - Optimize performance and memory usage'
  ];

  return plan;
}

/**
 * Auto-fix common compliance issues
 */
export function autoFixCompliance(): ComplianceIssue[] {
  const fixedIssues: ComplianceIssue[] = [];
  
  try {
    // Initialize Master Prompts registry if not available
    const registry = MasterPromptsEngineRegistry.getInstance({
      autoStart: true,
      enableLegacySupport: true
    });
    
    fixedIssues.push({
      severity: 'high',
      category: 'architecture',
      message: 'Auto-initialized Master Prompts Engine Registry'
    });
  } catch (error) {
    // Registry initialization failed - manual intervention required
  }

  return fixedIssues;
}