import { cn } from "@/lib/utils";

interface DataDisplayProps {
  value: string | number;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'teal' | 'orange' | 'lime' | 'gold' | 'fuchsia' | 'btc' | 'btc-light' | 'btc-glow' | 'btc-muted' | 'default';
  suffix?: string;
  loading?: boolean;
}

export const DataDisplay = ({
  value,
  label,
  trend,
  size = 'md',
  color = 'default',
  suffix,
  loading = false
}: DataDisplayProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className={cn(
          "shimmer rounded",
          size === 'sm' && "h-6 w-16",
          size === 'md' && "h-8 w-24",
          size === 'lg' && "h-10 w-32",
          size === 'xl' && "h-12 w-40"
        )}></div>
        {label && <div className="shimmer h-4 w-20 rounded"></div>}
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="btc-light">↗</span>;
      case 'down':
        return <span className="btc-muted">↘</span>;
      default:
        return null;
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'teal':
        return 'neon-teal';
      case 'orange':
        return 'neon-orange';
      case 'lime':
        return 'neon-lime';
      case 'gold':
        return 'neon-gold';
      case 'fuchsia':
        return 'neon-fuchsia';
      case 'btc':
        return 'btc-primary';
      case 'btc-light':
        return 'btc-light';
      case 'btc-glow':
        return 'btc-glow';
      case 'btc-muted':
        return 'btc-muted';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-baseline space-x-2">
        <span
          className={cn(
            "font-bold tracking-wide font-mono",
            size === 'sm' && "text-lg",
            size === 'md' && "text-xl",
            size === 'lg' && "text-2xl",
            size === 'xl' && "text-3xl",
            getColorClass()
          )}
        >
          {value}
          {suffix && <span className="text-sm ml-1">{suffix}</span>}
        </span>
        {getTrendIcon()}
      </div>
      {label && (
        <p className="text-xs text-text-muted uppercase tracking-wider">
          {label}
        </p>
      )}
    </div>
  );
};