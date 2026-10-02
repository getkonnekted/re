import React from 'react';
import { useAppState } from '../context/StateContext';

interface LiveReserveCounterProps {
  precision?: number;
  showCurrency?: boolean;
  showRateBadge?: boolean;
  showLivePulse?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LiveReserveCounter: React.FC<LiveReserveCounterProps> = ({
  precision = 0,
  showCurrency = true,
  showRateBadge = false,
  showLivePulse = false,
  className = '',
  size = 'md'
}) => {
  const { liveLiquidityReserve } = useAppState();

  // Clean whole number formatting without decimal digits
  const wholePart = Math.floor(liveLiquidityReserve).toLocaleString('en-US');

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-lg sm:text-xl font-bold',
    xl: 'text-2xl sm:text-3xl font-extrabold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono tracking-tight tabular-nums ${className}`}>
      {showLivePulse && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}

      <span className={sizeClasses[size]}>
        {showCurrency && <span className="font-sans mr-0.5">₦</span>}
        <span>{wholePart}</span>
        {precision > 0 && (
          <span className="opacity-70 text-[0.85em]">
            .{(liveLiquidityReserve % 1).toFixed(precision).slice(2)}
          </span>
        )}
      </span>
    </span>
  );
};

export default LiveReserveCounter;
