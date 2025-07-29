import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimeFrame = '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y';

interface TimeFrameSelectorProps {
  value: TimeFrame;
  onChange: (timeFrame: TimeFrame) => void;
  variant?: 'default' | 'compact' | 'pills';
  className?: string;
}

const timeFrameOptions: { value: TimeFrame; label: string; icon: React.ReactNode }[] = [
  { value: '1h', label: '1 Hour', icon: <Clock className="h-3 w-3" /> },
  { value: '4h', label: '4 Hours', icon: <Clock className="h-3 w-3" /> },
  { value: '1d', label: '1 Day', icon: <Calendar className="h-3 w-3" /> },
  { value: '1w', label: '1 Week', icon: <Calendar className="h-3 w-3" /> },
  { value: '1m', label: '1 Month', icon: <TrendingUp className="h-3 w-3" /> },
  { value: '3m', label: '3 Months', icon: <TrendingUp className="h-3 w-3" /> },
  { value: '1y', label: '1 Year', icon: <TrendingUp className="h-3 w-3" /> },
];

export function TimeFrameSelector({ 
  value, 
  onChange, 
  variant = 'default',
  className 
}: TimeFrameSelectorProps) {
  if (variant === 'pills') {
    return (
      <div className={cn("flex gap-1 p-1 bg-glass-bg rounded-lg border border-glass-border", className)}>
        {timeFrameOptions.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 px-3 text-xs transition-all",
              value === option.value
                ? "bg-accent text-accent-foreground shadow-sm"
                : "hover:bg-glass-surface hover:text-foreground"
            )}
          >
            {option.icon}
            <span className="ml-1 hidden sm:inline">{option.label}</span>
            <span className="ml-1 sm:hidden">{option.value.toUpperCase()}</span>
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("w-[120px] h-8 text-xs", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {timeFrameOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              <div className="flex items-center gap-2">
                {option.icon}
                {option.value.toUpperCase()}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select time frame" />
      </SelectTrigger>
      <SelectContent>
        {timeFrameOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}