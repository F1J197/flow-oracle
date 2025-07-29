import { EnhancedCreditData } from '@/types/data';

interface CreditRegimeIndicatorProps {
  regime: EnhancedCreditData['regime'];
  confidence: number;
  compact?: boolean;
}

export const CreditRegimeIndicator = ({ 
  regime, 
  confidence, 
  compact = false 
}: CreditRegimeIndicatorProps) => {
  const getRegimeColor = (regime: EnhancedCreditData['regime']) => {
    switch (regime) {
      case 'QE_SUPPORTIVE':
        return 'text-btc-orange-bright';
      case 'QT_STRESS':
        return 'text-btc-orange-dark';
      case 'CRISIS_MODE':
        return 'text-btc-orange-muted';
      case 'NEUTRAL':
        return 'text-btc-orange';
    }
  };

  const getRegimeIcon = (regime: EnhancedCreditData['regime']) => {
    switch (regime) {
      case 'QE_SUPPORTIVE':
        return '▲';
      case 'QT_STRESS':
        return '▼';
      case 'CRISIS_MODE':
        return '⚠';
      case 'NEUTRAL':
        return '○';
    }
  };

  const getRegimeLabel = (regime: EnhancedCreditData['regime']) => {
    switch (regime) {
      case 'QE_SUPPORTIVE':
        return compact ? 'QE' : 'QE Supportive';
      case 'QT_STRESS':
        return compact ? 'QT' : 'QT Stress';
      case 'CRISIS_MODE':
        return compact ? 'Crisis' : 'Crisis Mode';
      case 'NEUTRAL':
        return 'Neutral';
    }
  };

  const colorClass = getRegimeColor(regime);

  return (
    <div className="flex items-center gap-2">
      <span className={colorClass}>
        {getRegimeIcon(regime)}
      </span>
      <span className={`${colorClass} font-medium`}>
        {getRegimeLabel(regime)}
      </span>
      {!compact && (
        <span className="text-text-secondary text-xs">
          ({(confidence * 100).toFixed(0)}%)
        </span>
      )}
    </div>
  );
};