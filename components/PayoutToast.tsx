import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  X, 
  Sparkles, 
  ArrowUpRight, 
  Coins, 
  CheckCircle2,
  Users
} from 'lucide-react';
import { PayoutToastData } from '../types';

interface PayoutToastItemProps {
  toast: PayoutToastData;
  onDismiss: (id: string) => void;
  onNavigateToWallet?: () => void;
}

const TOAST_DURATION_MS = 7000;

export const PayoutToastItem: React.FC<PayoutToastItemProps> = ({ 
  toast, 
  onDismiss, 
  onNavigateToWallet 
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(TOAST_DURATION_MS);

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const percent = (newRemaining / TOAST_DURATION_MS) * 100;
      setProgress(percent);

      if (newRemaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, toast.id, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const isReferral = toast.type === 'referral_bonus';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, y: -8, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 70, scale: 0.9, transition: { duration: 0.22, ease: 'easeOut' } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-live="polite"
      id={`payout_toast_${toast.id}`}
      className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/40 text-slate-100 overflow-hidden relative"
    >
      {/* Subtle emerald top glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-5 relative z-10">
        {/* Header Badge & Action */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border ${
              isReferral 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isReferral ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{isReferral ? '7.5% Referral Commission' : 'Investment Payout Credited'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">{toast.timestamp}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Dismiss notification"
              id={`btn_dismiss_toast_${toast.id}`}
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3.5">
          {/* Animated Coin Badge */}
          <div className={`w-12 h-12 rounded-xl p-0.5 shrink-0 flex items-center justify-center shadow-md ${
            isReferral 
              ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950'
              : 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-slate-950'
          }`}>
            <div className="w-full h-full rounded-[10px] bg-slate-950/20 backdrop-blur-xs flex items-center justify-center">
              {isReferral ? (
                <Users className="w-6 h-6 text-white stroke-[2.5]" />
              ) : (
                <Coins className="w-6 h-6 text-white stroke-[2.5]" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {/* Amount Credited */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-400">
                +₦{toast.amount.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-300/80 uppercase font-sans tracking-wide">
                Direct to Wallet
              </span>
            </div>

            {/* Plan / Referral Source details */}
            <p className="text-xs text-slate-200 font-semibold mt-0.5 truncate">
              {toast.planName}
            </p>

            {/* Cycle / Progress indicator */}
            {!isReferral && toast.totalWeeks > 0 && (
              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300 font-mono">
                <span className="text-slate-400">Yield Cycle:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: toast.totalWeeks }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 w-4 rounded-full transition-colors ${
                        idx < toast.weeksPaid 
                          ? 'bg-emerald-400' 
                          : 'bg-slate-700'
                      }`}
                      title={`Week ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-emerald-300 ml-1">
                  Week {toast.weeksPaid}/{toast.totalWeeks}
                </span>
              </div>
            )}

            {/* Wallet Balance Summary */}
            <div className="mt-2 text-[11px] bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>Updated Balance:</span>
              </span>
              <span className="font-bold font-mono text-white">
                ₦{toast.walletBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Treasure Homes Reserve Backed</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToWallet && (
              <button
                onClick={() => {
                  onNavigateToWallet();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                id={`btn_view_wallet_toast_${toast.id}`}
              >
                <span>View Wallet</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Shrinking Progress Timer Bar */}
      <div className="w-full bg-slate-800/50 h-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${
            isReferral ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

interface PayoutToastContainerProps {
  toasts: PayoutToastData[];
  onDismiss: (id: string) => void;
  onNavigateToWallet?: () => void;
}

export const PayoutToastContainer: React.FC<PayoutToastContainerProps> = ({
  toasts,
  onDismiss,
  onNavigateToWallet
}) => {
  return (
    <div 
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-[calc(100vw-2rem)]"
      id="payout_toast_notification_container"
      aria-live="assertive"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <PayoutToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            onNavigateToWallet={onNavigateToWallet}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
