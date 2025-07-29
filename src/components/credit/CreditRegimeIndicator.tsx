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
  const getRegimeDisplay = (regime: EnhancedCreditData['regime']) => {
    switch (regime) {
      case 'QE_SUPPORTIVE':
        return { 
          label: compact ? 'QE' : 'QE Supportive', 
          color: 'btc-bright',
          icon: '▲'
        };
      case 'QT_STRESS':
        return { 
          label: compact ? 'QT' : 'QT Stress', 
          color: 'btc-dark',
          icon: '▼'
        };
      case 'CRISIS_MODE':
        return { 
          label: compact ? 'Crisis' : 'Crisis Mode', 
          color: 'btc-muted',
          icon: '⚠'
        };
      case 'NEUTRAL':
        return { 
          label: 'Neutral', 
          color: 'btc',
          icon: '○'
        };
    }
  };

  const display = getRegimeDisplay(regime);

  return (
    <div className="flex items-center gap-2">
      <span className={`text-${display.color}`}>
        {display.icon}
      </span>
      <span className={`text-${display.color} font-medium`}>
        {display.label}
      </span>
      {!compact && (
        <span className="text-text-secondary text-xs">
          ({(confidence * 100).toFixed(0)}%)
        </span>
      )}
    </div>
  );
};