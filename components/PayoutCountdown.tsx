import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

interface PayoutCountdownProps {
  targetDate?: string;
  fallbackDays?: number;
  className?: string;
  compact?: boolean;
}

export const PayoutCountdown: React.FC<PayoutCountdownProps> = ({ 
  targetDate, 
  fallbackDays = 7, 
  className = "",
  compact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isDue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isDue: false });

  useEffect(() => {
    const calculateTime = () => {
      let targetTime: number;
      if (targetDate) {
        targetTime = new Date(targetDate).getTime();
      } else {
        targetTime = Date.now() + fallbackDays * 24 * 60 * 60 * 1000;
      }

      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isDue: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isDue: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, fallbackDays]);

  if (timeLeft.isDue) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${className}`}>
        <Zap className="w-3 h-3 text-emerald-600 animate-pulse" />
        <span>Yield Ready to Claim</span>
      </div>
    );
  }

  const isFinalMinute = !timeLeft.isDue && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  if (isFinalMinute) {
    if (compact) {
      return (
        <span className={`font-mono text-emerald-600 font-bold animate-pulse ${className}`}>
          {timeLeft.seconds}s (Payout Active)
        </span>
      );
    }
    return (
      <div className={`flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg px-2.5 py-1.5 text-xs font-mono animate-pulse ${className}`}>
        <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-bounce" />
        <span className="text-[10px] text-emerald-800 font-sans font-bold uppercase tracking-wider">Final Minute:</span>
        <div className="flex items-center gap-1 font-bold">
          <span className="bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded text-[11px]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
        <span className="text-[10px] text-emerald-700 font-sans font-bold uppercase ml-1">Payout Button Active</span>
      </div>
    );
  }

  if (compact) {
    return (
      <span className={`font-mono text-amber-700 font-bold ${className}`}>
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 bg-amber-50/80 border border-amber-200/90 text-amber-900 rounded-lg px-2.5 py-1.5 text-xs font-mono ${className}`}>
      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span className="text-[10px] text-amber-700 font-sans font-medium uppercase tracking-wider">Next Payout in:</span>
      <div className="flex items-center gap-1 font-bold">
        <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[11px]">{timeLeft.days}d</span>
        <span>:</span>
        <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[11px]">{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[11px]">{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span className="bg-amber-200 text-amber-950 px-1 py-0.5 rounded text-[11px]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};
