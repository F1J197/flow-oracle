/**
 * Import Path Normalizer - Utility to fix inconsistent import paths
 */

export interface ImportPathConfig {
  baseDir: string;
  aliasMap: Record<string, string>;
  extensions: string[];
}

export class ImportPathNormalizer {
  private static readonly DEFAULT_CONFIG: ImportPathConfig = {
    baseDir: 'src',
    aliasMap: {
      '@/': 'src/',
      '@components/': 'src/components/',
      '@services/': 'src/services/',
      '@types/': 'src/types/',
      '@engines/': 'src/engines/',
      '@hooks/': 'src/hooks/',
      '@utils/': 'src/utils/',
      '@integrations/': 'src/integrations/'
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  };

  /**
   * Normalize import path to use consistent @ alias syntax
   */
  static normalizeImportPath(importPath: string, currentFilePath: string, config = this.DEFAULT_CONFIG): string {
    // Skip external packages
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return importPath;
    }

    // Convert relative paths to absolute paths first
    let absolutePath = this.resolveRelativePath(importPath, currentFilePath);
    
    // Apply alias mapping
    for (const [alias, realPath] of Object.entries(config.aliasMap)) {
      if (absolutePath.startsWith(realPath)) {
        absolutePath = absolutePath.replace(realPath, alias);
        break;
      }
    }

    return absolutePath;
  }

  /**
   * Resolve relative import path to absolute path
   */
  private static resolveRelativePath(importPath: string, currentFilePath: string): string {
    if (!importPath.startsWith('.')) {
      return importPath;
    }

    const currentDir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'));
    const segments = currentDir.split('/').filter(s => s.length > 0);
    const importSegments = importPath.split('/').filter(s => s.length > 0);

    let resolvedSegments = [...segments];

    for (const segment of importSegments) {
      if (segment === '..') {
        resolvedSegments.pop();
      } else if (segment !== '.') {
        resolvedSegments.push(segment);
      }
    }

    return resolvedSegments.join('/');
  }

  /**
   * Validate import path and suggest corrections
   */
  static validateImportPath(importPath: string): {
    isValid: boolean;
    suggestions: string[];
    issues: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for common anti-patterns
    if (importPath.includes('../../../')) {
      issues.push('Deep relative imports detected');
      suggestions.push('Use @ alias imports instead of deep relative paths');
    }

    if (importPath.includes('./components/') && !importPath.startsWith('@/')) {
      issues.push('Inconsistent component import');
      suggestions.push('Use @/components/ for component imports');
    }

    if (importPath.includes('./types/') && !importPath.startsWith('@/')) {
      issues.push('Inconsistent type import');
      suggestions.push('Use @/types/ for type imports');
    }

    return {
      isValid: issues.length === 0,
      suggestions,
      issues
    };
  }

  /**
   * Get recommended import path for a file
   */
  static getRecommendedImportPath(targetFile: string, fromFile: string): string {
    // Remove file extensions
    const cleanTarget = targetFile.replace(/\.(ts|tsx|js|jsx)$/, '');
    const cleanFrom = fromFile.replace(/\.(ts|tsx|js|jsx)$/, '');

    // Determine if we should use alias or relative path
    const targetSegments = cleanTarget.split('/');
    const fromSegments = cleanFrom.split('/');

    // If in same directory, use relative
    if (targetSegments.slice(0, -1).join('/') === fromSegments.slice(0, -1).join('/')) {
      return `./${targetSegments[targetSegments.length - 1]}`;
    }

    // Otherwise, use alias
    if (cleanTarget.startsWith('src/')) {
      return cleanTarget.replace('src/', '@/');
    }

    return cleanTarget;
  }
}

export default ImportPathNormalizer;
