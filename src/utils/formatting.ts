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
    case 'positive': return 'text-btc-primary';
    case 'negative': return 'text-btc-error';
    case 'warning': return 'text-btc-light';
    case 'critical': return 'text-btc-error';
    case 'neutral':
    default: return 'text-text-primary';
  }
};

// Semantic value color helper for numeric values
export const getValueColor = (value: number, threshold?: { positive?: number; negative?: number }): string => {
  if (threshold) {
    if (threshold.positive && value >= threshold.positive) return 'text-btc-primary';
    if (threshold.negative && value <= threshold.negative) return 'text-btc-error';
  } else {
    if (value > 0) return 'text-btc-primary';
    if (value < 0) return 'text-btc-error';
  }
  return 'text-text-primary';
};