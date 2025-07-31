/**
 * Utility functions for data formatting in the Intelligence Engine
 */

export const formatCurrency = (value: number, options?: {
  decimals?: number;
  compact?: boolean;
  showSign?: boolean;
}): string => {
  const { decimals = 2, compact = false, showSign = false } = options || {};
  
  if (compact && Math.abs(value) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
    const scaledValue = value / Math.pow(1000, unitIndex);
    
    return `${showSign && value > 0 ? '+' : ''}$${scaledValue.toFixed(decimals)}${units[unitIndex]}`;
  }
  
  const formatted = value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return showSign && value > 0 ? `+${formatted}` : formatted;
};

export const formatPercentage = (value: number, options?: {
  decimals?: number;
  showSign?: boolean;
}): string => {
  const { decimals = 2, showSign = false } = options || {};
  const formatted = `${value.toFixed(decimals)}%`;
  
  return showSign && value > 0 ? `+${formatted}` : formatted;
};

export const formatNumber = (value: number, options?: {
  decimals?: number;
  compact?: boolean;
  showSign?: boolean;
}): string => {
  const { decimals = 2, compact = false, showSign = false } = options || {};
  
  if (compact && Math.abs(value) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
    const scaledValue = value / Math.pow(1000, unitIndex);
    
    return `${showSign && value > 0 ? '+' : ''}${scaledValue.toFixed(decimals)}${units[unitIndex]}`;
  }
  
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return showSign && value > 0 ? `+${formatted}` : formatted;
};

export const formatTimestamp = (date: Date, format: 'time' | 'date' | 'datetime' = 'datetime'): string => {
  switch (format) {
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    case 'date':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    case 'datetime':
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit'
      })} ${date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    default:
      return date.toISOString();
  }
};

export const formatBasisPoints = (value: number): string => {
  return `${value.toFixed(1)}bp`;
};

export const formatZScore = (value: number): string => {
  const formatted = value.toFixed(2);
  return value > 0 ? `+${formatted}σ` : `${formatted}σ`;
};

export const getStatusColor = (status: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'positive': return 'text-neon-lime';
    case 'negative': return 'text-neon-orange';
    case 'warning': return 'text-neon-gold';
    case 'critical': return 'text-neon-fuchsia';
    case 'neutral':
    default: return 'text-text-data';
  }
};

// Semantic value color helper for numeric values
export const getValueColor = (value: number, threshold?: { positive?: number; negative?: number }): string => {
  if (threshold) {
    if (threshold.positive && value >= threshold.positive) return 'text-neon-lime';
    if (threshold.negative && value <= threshold.negative) return 'text-neon-orange';
  } else {
    if (value > 0) return 'text-neon-lime';
    if (value < 0) return 'text-neon-orange';
  }
  return 'text-text-data';
};

// Generic value formatter - automatically chooses the best format
export const formatValue = (value: number | string, options?: {
  type?: 'currency' | 'percentage' | 'number' | 'basis-points' | 'z-score';
  decimals?: number;
  compact?: boolean;
  showSign?: boolean;
}): string => {
  if (typeof value === 'string') return value;
  
  const { type = 'number', decimals, compact, showSign } = options || {};
  
  switch (type) {
    case 'currency':
      return formatCurrency(value, { decimals, compact, showSign });
    case 'percentage':
      return formatPercentage(value, { decimals, showSign });
    case 'basis-points':
      return formatBasisPoints(value);
    case 'z-score':
      return formatZScore(value);
    case 'number':
    default:
      return formatNumber(value, { decimals, compact, showSign });
  }
};