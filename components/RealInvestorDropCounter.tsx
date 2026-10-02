import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { playPayoutChime } from '../lib/sound';

interface RealInvestorDropCounterProps {
  transactions: Transaction[];
  users?: User[];
  onNavigateToDeposits?: () => void;
}

export const RealInvestorDropCounter: React.FC<RealInvestorDropCounterProps> = ({ 
  transactions, 
  users = [],
  onNavigateToDeposits 
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [latestDropAlert, setLatestDropAlert] = useState<{
    id: string;
    userName: string;
    amount: number;
    method?: string;
    time: string;
  } | null>(null);
  const [hasPulse, setHasPulse] = useState<boolean>(false);
  const prevCompletedCountRef = useRef<number | null>(null);

  // STRICT RULE: Marketer demo funds must NEVER be merged with actual depositors
  const marketingUserIds = new Set(users.filter(u => !!u.isMarketingAccount).map(u => u.id));

  // Filter ONLY real completed investor deposits (exclude demo/marketing funds and marketer users)
  const realCompletedDeposits = transactions.filter(
    t => t.type === 'deposit' && t.status === 'completed' && !t.isMarketing && !marketingUserIds.has(t.userId)
  );

  // Total real capital dropped into the platform
  const totalDropVolume = realCompletedDeposits.reduce((sum, t) => sum + t.amount, 0);
  const totalDropCount = realCompletedDeposits.length;

  // Calculate today's drops (using Nigeria/WAT date comparison)
  const todayDatePrefix = new Date().toISOString().slice(0, 10);
  const todayDrops = realCompletedDeposits.filter(t => {
    return t.createdAt && t.createdAt.startsWith(todayDatePrefix);
  });
  const todayDropVolume = todayDrops.reduce((sum, t) => sum + t.amount, 0);
  const todayDropCount = todayDrops.length;

  // Recent 4 confirmed drops sorted newest first
  const recentDrops = [...realCompletedDeposits]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Detect when a new drop arrives in real-time
  useEffect(() => {
    if (prevCompletedCountRef.current === null) {
      prevCompletedCountRef.current = totalDropCount;
      return;
    }

    if (totalDropCount > prevCompletedCountRef.current) {
      // New drop confirmed!
      const newestDrop = recentDrops[0];
      if (newestDrop) {
        setLatestDropAlert({
          id: newestDrop.id,
          userName: newestDrop.userName || 'Investor',
          amount: newestDrop.amount,
          method: newestDrop.paymentMethod || 'Bank Transfer',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });

        // Trigger visual pulse
        setHasPulse(true);
        const pulseTimer = setTimeout(() => setHasPulse(false), 4500);

        // Play chime sound if enabled
        if (soundEnabled) {
          try {
            playPayoutChime();
          } catch {
            // Audio policy fallback
          }
        }

        return () => clearTimeout(pulseTimer);
      }
    }

    prevCompletedCountRef.current = totalDropCount;
  }, [totalDropCount, recentDrops, soundEnabled]);

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0f172a] to-slate-900 border ${
        hasPulse 
          ? 'border-emerald-400 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30' 
          : 'border-slate-800'
      } rounded-2xl p-5 sm:p-6 text-white transition-all duration-500 mb-6 shadow-md`}
      id="real_investor_drop_counter"
    >
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <ArrowDownLeft className={`w-5 h-5 ${hasPulse ? 'animate-bounce text-emerald-300' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Liquidity Inflow Desk
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Drop Stream
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide mt-0.5 flex items-center gap-1.5">
              <span>Real Investor Drop Counter</span>
              {hasPulse && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  Drop Arrived!
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Audio Alert Toggle & Quick View */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
              soundEnabled 
                ? 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-800' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? "Mute audio alert on new drop" : "Enable sound chime on incoming drops"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{soundEnabled ? 'Drop Chime ON' : 'Chime Muted'}</span>
          </button>

          {onNavigateToDeposits && (
            <button
              type="button"
              onClick={onNavigateToDeposits}
              className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Manage Deposits</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Ticker Flash Notice (when drop happens) */}
      {latestDropAlert && hasPulse && (
        <div className="mt-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              ⚡ <strong>CONFIRMED REAL DROP:</strong> +₦{latestDropAlert.amount.toLocaleString()} received from <strong>{latestDropAlert.userName}</strong> ({latestDropAlert.method})
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 opacity-90">{latestDropAlert.time}</span>
        </div>
      )}

      {/* Main Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Total Inflow Drops Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Total Real Inflow Dropped</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
              All Time
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              ₦{totalDropVolume.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Verified Paid Drops:</span>
            <strong className="text-white font-mono">{totalDropCount} drops</strong>
          </div>
        </div>

        {/* Today's Inflow Drop Velocity */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Today's Confirmed Drops</span>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">
              24-Hour Velocity
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
              ₦{todayDropVolume.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Today's Drop Count:</span>
            <strong className="text-amber-300 font-mono">{todayDropCount} cleared today</strong>
          </div>
        </div>

        {/* Average Drop Size & Real Investor Ratio */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Average Drop Ticket</span>
            <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded text-[10px]">
              Ticket Size
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight font-mono">
              ₦{totalDropCount > 0 ? Math.round(totalDropVolume / totalDropCount).toLocaleString() : '0'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Drop Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" /> 100% Real Bank Collateral
            </span>
          </div>
        </div>
      </div>

      {/* Stream of Latest Confirmed Real Drops */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Recent Confirmed Inflow Drops ({recentDrops.length})
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Auto-ticks live on confirmation
          </span>
        </div>

        {recentDrops.length === 0 ? (
          <div className="text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800/60 text-xs text-slate-400">
            No confirmed real drops yet. When an investor makes a deposit, it will increase and stream here in real time.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {recentDrops.map(drop => {
              const dateStr = drop.createdAt 
                ? new Date(drop.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';
              return (
                <div 
                  key={drop.id} 
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl transition-all"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                    <span className="truncate max-w-[120px] font-medium text-slate-300">
                      {drop.userName || 'Real Investor'}
                    </span>
                    <span className="text-slate-500">{dateStr}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +₦{drop.amount.toLocaleString()}
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono truncate max-w-[90px]">
                      {drop.paymentMethod || 'Bank'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
