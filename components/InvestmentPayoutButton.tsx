import React, { useState, useEffect } from 'react';
import { Lock, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { UserInvestment } from '../types';

interface InvestmentPayoutButtonProps {
  investment: UserInvestment;
  onPayout: (id: string) => void;
}

export const InvestmentPayoutButton: React.FC<InvestmentPayoutButtonProps> = ({
  investment,
  onPayout
}) => {
  const [diff, setDiff] = useState<number>(() => {
    if (!investment.nextPayoutDate) return 0;
    return new Date(investment.nextPayoutDate).getTime() - Date.now();
  });
  const [hasClicked, setHasClicked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // When investment data updates (e.g. weeksPaid or nextPayoutDate advances), reset click state
  useEffect(() => {
    setHasClicked(false);
    setIsProcessing(false);
  }, [investment.nextPayoutDate, investment.weeksPaid]);

  useEffect(() => {
    const updateDiff = () => {
      if (!investment.nextPayoutDate) {
        setDiff(0);
        return;
      }
      const remaining = new Date(investment.nextPayoutDate).getTime() - Date.now();
      setDiff(remaining);
    };

    updateDiff();
    const interval = setInterval(updateDiff, 1000);
    return () => clearInterval(interval);
  }, [investment.nextPayoutDate]);

  const isCompleted = investment.weeksPaid >= investment.totalWeeks;
  // Active ONLY on the last minute of the countdown (<= 60,000 ms) or when due (<= 0), and NOT yet clicked
  const isLastMinuteOrDue = !isCompleted && !hasClicked && diff <= 60 * 1000;

  const handleClaim = () => {
    if (hasClicked || isProcessing || isCompleted) return;
    // When clicked once, immediately mark as clicked and transition back to idle
    setHasClicked(true);
    setIsProcessing(true);
    try {
      onPayout(investment.id);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCompleted) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed select-none"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
        <span>Plan Completed</span>
      </button>
    );
  }

  // Active state during the final minute before clicking
  if (isLastMinuteOrDue) {
    const secondsRemaining = Math.max(0, Math.floor(diff / 1000));
    return (
      <button
        onClick={handleClaim}
        disabled={isProcessing}
        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer ring-2 ring-emerald-400/50 animate-pulse"
        id={`btn_credit_weekly_payout_${investment.id}`}
        title="Active on last minute! Click once to credit your weekly yield and return to idle"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
        )}
        <span>
          Claim Due Yield (+₦{investment.weeklyPayout.toLocaleString()})
          {secondsRemaining > 0 && ` [${secondsRemaining}s]`}
        </span>
      </button>
    );
  }

  // Idle state (either before the last minute or once clicked and payout has processed)
  return (
    <button
      disabled
      className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed select-none opacity-80"
      id={`btn_credit_weekly_payout_${investment.id}`}
      title={hasClicked ? "Payout claimed. Idle until next cycle." : "Payout button can only be active on the last minute of the countdown"}
    >
      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span>
        {hasClicked 
          ? `Payout Claimed — Idle (+₦${investment.weeklyPayout.toLocaleString()})`
          : `Payout Idle (Active In Last Minute) (+₦${investment.weeklyPayout.toLocaleString()})`}
      </span>
    </button>
  );
};
