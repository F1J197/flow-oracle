/**
 * Development Code Remover - Utility to clean up development-only code
 */

export interface DevCodePattern {
  pattern: RegExp;
  replacement: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class DevelopmentCodeRemover {
  private static readonly DEV_PATTERNS: DevCodePattern[] = [
    // Console statements
    {
      pattern: /console\.(log|debug|info|warn|error)\([^)]*\);?\s*\n?/g,
      replacement: '',
      description: 'Console statements should be removed from production',
      severity: 'medium'
    },
    
    // Debug comments
    {
      pattern: /\/\/ (TODO|FIXME|DEBUG|HACK|XXX|TEMP).*\n/g,
      replacement: '',
      description: 'Development comments should be cleaned up',
      severity: 'low'
    },
    
    // Development-only imports
    {
      pattern: /import.*['"].*mock.*['"];?\s*\n/g,
      replacement: '',
      description: 'Mock imports should be removed from production',
      severity: 'high'
    },
    
    // Test code blocks
    {
      pattern: /if\s*\(\s*process\.env\.NODE_ENV\s*===?\s*['"]development['"].*?\}/gs,
      replacement: '',
      description: 'Development-only code blocks should be removed',
      severity: 'critical'
    },
    
    // Alert statements
    {
      pattern: /alert\([^)]*\);?\s*\n?/g,
      replacement: '',
      description: 'Alert statements should be removed from production',
      severity: 'high'
    },
    
    // Debugger statements
    {
      pattern: /debugger;?\s*\n?/g,
      replacement: '',
      description: 'Debugger statements should be removed from production',
      severity: 'critical'
    },
    
    // Development API endpoints
    {
      pattern: /['"]https?:\/\/localhost[^'"]*['"]/g,
      replacement: '""',
      description: 'Localhost URLs should not be in production',
      severity: 'critical'
    }
  ];

  /**
   * Scan code for development patterns
   */
  static scanForDevCode(content: string): Array<{
    pattern: DevCodePattern;
    matches: RegExpMatchArray[];
    lineNumbers: number[];
  }> {
    const results: Array<{
      pattern: DevCodePattern;
      matches: RegExpMatchArray[];
      lineNumbers: number[];
    }> = [];

    const lines = content.split('\n');

    for (const pattern of this.DEV_PATTERNS) {
      const matches = Array.from(content.matchAll(pattern.pattern));
      const lineNumbers: number[] = [];

      for (const match of matches) {
        if (match.index !== undefined) {
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          lineNumbers.push(lineNumber);
        }
      }

      if (matches.length > 0) {
        results.push({
          pattern,
          matches,
          lineNumbers
        });
      }
    }

    return results;
  }

  /**
   * Clean development code from content
   */
  static cleanDevCode(content: string, options: {
    severityThreshold?: 'low' | 'medium' | 'high' | 'critical';
    preservePatterns?: RegExp[];
  } = {}): {
    cleanedContent: string;
    removedPatterns: Array<{
      pattern: DevCodePattern;
      occurrences: number;
    }>;
  } {
    const { severityThreshold = 'low', preservePatterns = [] } = options;
    
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const threshold = severityLevels[severityThreshold];
    
    let cleanedContent = content;
    const removedPatterns: Array<{
      pattern: DevCodePattern;
      occurrences: number;
    }> = [];

    for (const pattern of this.DEV_PATTERNS) {
      const patternSeverity = severityLevels[pattern.severity];
      
      if (patternSeverity >= threshold) {
        // Check if pattern should be preserved
        const shouldPreserve = preservePatterns.some(preservePattern => 
          preservePattern.source === pattern.pattern.source
        );

        if (!shouldPreserve) {
          const matches = cleanedContent.match(pattern.pattern);
          const occurrences = matches ? matches.length : 0;
          
          if (occurrences > 0) {
            cleanedContent = cleanedContent.replace(pattern.pattern, pattern.replacement);
            removedPatterns.push({ pattern, occurrences });
          }
        }
      }
    }

    return { cleanedContent, removedPatterns };
  }

  /**
   * Generate production build cleanup report
   */
  static generateCleanupReport(filePath: string, originalContent: string, cleanedContent: string): {
    filePath: string;
    originalSize: number;
    cleanedSize: number;
    sizeReduction: number;
    patternsRemoved: Array<{
      description: string;
      severity: string;
      occurrences: number;
    }>;
  } {
    const originalSize = originalContent.length;
    const cleanedSize = cleanedContent.length;
    const sizeReduction = originalSize - cleanedSize;

    const { removedPatterns } = this.cleanDevCode(originalContent);

    return {
      filePath,
      originalSize,
      cleanedSize,
      sizeReduction,
      patternsRemoved: removedPatterns.map(rp => ({
        description: rp.pattern.description,
        severity: rp.pattern.severity,
        occurrences: rp.occurrences
      }))
    };
  }

  /**
   * Validate production readiness
   */
  static validateProductionReadiness(content: string): {
    isReady: boolean;
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const scanResults = this.scanForDevCode(content);
    
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    for (const result of scanResults) {
      const { pattern, matches } = result;
      
      switch (pattern.severity) {
        case 'critical':
          criticalIssues.push(`${pattern.description} (${matches.length} occurrences)`);
          break;
        case 'high':
          warnings.push(`${pattern.description} (${matches.length} occurrences)`);
          break;
        case 'medium':
        case 'low':
          recommendations.push(`${pattern.description} (${matches.length} occurrences)`);
          break;
      }
    }

    return {
      isReady: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      recommendations
    };
  }
}

export default DevelopmentCodeRemover;