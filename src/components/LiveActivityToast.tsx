import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ArrowDownLeft, 
  CheckCircle, 
  X, 
  TrendingUp,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { LiveActivityItem } from '../types';

const NIGERIAN_FIRST_NAMES = [
  'Chinedu', 'Oluwaseun', 'Emeka', 'Damilola', 'Blessing', 'Tunde', 
  'Amina', 'Uche', 'Zainab', 'Babatunde', 'Ngozi', 'Kelechi', 
  'Femi', 'Hauwa', 'Kemi', 'Ifeanyi', 'Aisha', 'Funke', 
  'Chukwudi', 'Mary', 'Adebayo', 'Chioma', 'Nnamdi', 'Halima', 
  'Folake', 'Segun', 'Fatima', 'Ebuka', 'Toyin', 'Ibrahim', 
  'Bola', 'Osas', 'Tari', 'Somto', 'Seyi', 'Victor', 'Amaka'
];

const LAST_INITIALS = ['O.', 'A.', 'B.', 'E.', 'K.', 'N.', 'M.', 'D.', 'S.', 'T.', 'Y.', 'F.', 'U.', 'I.', 'W.', 'C.'];

const LOCATIONS = [
  'Lekki Phase 1, Lagos', 'Ikeja GRA, Lagos', 'Victoria Island, Lagos', 
  'Maitama, Abuja', 'Wuse 2, Abuja', 'Garki, Abuja', 
  'Port Harcourt, Rivers', 'Ibadan, Oyo', 'Enugu, Enugu', 
  'Asaba, Delta', 'Benin City, Edo', 'Calabar, Cross River', 
  'Abeokuta, Ogun', 'Kano State', 'Warri, Delta', 
  'Akure, Ondo', 'Uyo, Akwa Ibom', 'Surulere, Lagos', 
  'Yaba, Lagos', 'Owerri, Imo', 'Gwarinpa, Abuja'
];

const NON_PAYOUT_ACTIVITIES = [
  {
    type: 'purchase' as const,
    action: 'Acquired Plan 1 (₦15,000)',
    sub: '4-Week Property Investment Active',
    amount: 15000,
    iconType: 'investment' as const
  },
  {
    type: 'purchase' as const,
    action: 'Acquired Plan 2 (₦45,000)',
    sub: '4-Week Property Investment Active',
    amount: 45000,
    iconType: 'investment' as const
  },
  {
    type: 'purchase' as const,
    action: 'Acquired Plan 3 (₦115,000)',
    sub: '4-Week Property Investment Active',
    amount: 115000,
    iconType: 'investment' as const
  },
  {
    type: 'purchase' as const,
    action: 'Acquired Plan 4 (₦270,000)',
    sub: '4-Week Property Investment Active',
    amount: 270000,
    iconType: 'investment' as const
  },
  {
    type: 'purchase' as const,
    action: 'Acquired Plan 5 (₦500,000)',
    sub: '4-Week Property Investment Active',
    amount: 500000,
    iconType: 'investment' as const
  },
  {
    type: 'deposit' as const,
    action: 'Deposited ₦45,000 via Transfer',
    sub: 'Instant wallet clearance',
    amount: 45000,
    iconType: 'deposit' as const
  },
  {
    type: 'deposit' as const,
    action: 'Deposited ₦115,000 via Transfer',
    sub: 'Treasury reserve confirmed',
    amount: 115000,
    iconType: 'deposit' as const
  },
  {
    type: 'deposit' as const,
    action: 'Deposited ₦270,000 via Bank Transfer',
    sub: 'Verified investor account',
    amount: 270000,
    iconType: 'deposit' as const
  },
  {
    type: 'kyc' as const,
    action: 'Identity Verified & Approved',
    sub: 'Verified Real Estate Investor',
    iconType: 'verified' as const
  },
  {
    type: 'purchase' as const,
    action: 'Subscribed to Prime Estate Plan',
    sub: 'Treasure Homes Backed',
    amount: 45000,
    iconType: 'investment' as const
  }
];

const PAYOUT_DAY_ACTIVITIES = [
  ...NON_PAYOUT_ACTIVITIES,
  {
    type: 'payout' as const,
    action: 'Received ₦17,250 Friday Payout',
    sub: 'Direct bank settlement completed',
    amount: 17250,
    iconType: 'payout' as const
  },
  {
    type: 'payout' as const,
    action: 'Received ₦44,850 Friday Payout',
    sub: 'Direct bank settlement completed',
    amount: 44850,
    iconType: 'payout' as const
  },
  {
    type: 'payout' as const,
    action: 'Withdrew ₦105,300 Friday Yield',
    sub: 'Disbursed to commercial bank',
    amount: 105300,
    iconType: 'payout' as const
  },
  {
    type: 'payout' as const,
    action: 'Received ₦195,000 Friday Payout',
    sub: 'Cleared into commercial bank account',
    amount: 195000,
    iconType: 'payout' as const
  }
];

function isPayoutActivity(item: { type?: string; message?: string; action?: string; sub?: string }): boolean {
  if (item.type === 'payout') return true;
  const txt = `${item.action || ''} ${item.message || ''} ${item.sub || ''}`.toLowerCase();
  return txt.includes('payout') || txt.includes('yield') || txt.includes('withdrew');
}

function generateRandomFomoItem(isPayoutDay: boolean = false): LiveActivityItem {
  const firstName = NIGERIAN_FIRST_NAMES[Math.floor(Math.random() * NIGERIAN_FIRST_NAMES.length)];
  const initial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  
  // STRICT RULE: If it is not Friday (payout day), exclusively use non-payout activities
  const eligibleActivities = isPayoutDay ? PAYOUT_DAY_ACTIVITIES : NON_PAYOUT_ACTIVITIES;
  const activity = eligibleActivities[Math.floor(Math.random() * eligibleActivities.length)];

  return {
    id: 'fomo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type: activity.type,
    title: `${firstName} ${initial}`,
    message: activity.action,
    amount: activity.amount,
    timeAgo: 'Just now',
    location,
    iconType: activity.iconType,
    avatarInitials: `${firstName[0]}${initial[0]}`,
    timestamp: Date.now()
  };
}

export const LiveActivityToast: React.FC = () => {
  const { settings, activeLiveActivity, dismissLiveActivity, isPayoutDay } = useAppState();
  const [currentToast, setCurrentToast] = useState<LiveActivityItem | null>(null);
  const [isDismissedSession, setIsDismissedSession] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isEnabled = settings.enableLiveActivityToasts !== false && !isDismissedSession;

  // React to REAL platform activity triggered from StateContext (stay for 3 seconds)
  useEffect(() => {
    if (!isEnabled || !activeLiveActivity) return;

    // Strict guard: Do not display payout notification if it is not payout day
    if (!isPayoutDay && isPayoutActivity(activeLiveActivity)) {
      dismissLiveActivity();
      return;
    }

    if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    setCurrentToast(activeLiveActivity);

    // Auto-dismiss after strictly 3 seconds unless hovered
    displayTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setCurrentToast(null);
        dismissLiveActivity();
      }
    }, 3000);

    return () => {
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    };
  }, [activeLiveActivity, isEnabled, isHovered, isPayoutDay, dismissLiveActivity]);

  // Periodic random FOMO notifications (stays for 3 seconds)
  useEffect(() => {
    if (!isEnabled) {
      setCurrentToast(null);
      return;
    }

    const scheduleNextFomo = () => {
      // Randomized gap between 8 and 14 seconds
      const delay = Math.floor(Math.random() * (14000 - 8000 + 1)) + 8000;

      intervalRef.current = setTimeout(() => {
        if (!currentToast && !isHovered) {
          const item = generateRandomFomoItem(isPayoutDay);
          setCurrentToast(item);

          // Stays on screen for strictly 3 seconds
          displayTimeoutRef.current = setTimeout(() => {
            if (!isHovered) {
              setCurrentToast(null);
            }
          }, 3000);
        }

        scheduleNextFomo();
      }, delay);
    };

    // First FOMO pop-up starts after 4 seconds of entering page
    const initialTimer = setTimeout(() => {
      scheduleNextFomo();
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    };
  }, [isEnabled, isHovered, currentToast, isPayoutDay]);

  const handleManualClose = () => {
    setCurrentToast(null);
    dismissLiveActivity();
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 max-w-[280px] sm:max-w-[310px] pointer-events-none select-none">
      <AnimatePresence>
        {currentToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-xl p-2.5 shadow-xl shadow-black/40 relative overflow-hidden"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

            <div className="flex items-center gap-2.5">
              {/* Compact icon badge */}
              <div className="relative shrink-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentToast.iconType === 'payout'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : currentToast.iconType === 'investment'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : currentToast.iconType === 'deposit'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {currentToast.iconType === 'payout' ? (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  ) : currentToast.iconType === 'investment' ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : currentToast.iconType === 'deposit' ? (
                    <CreditCard className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Live pulsing dot */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <span className="font-bold text-[11px] text-white truncate">
                      {currentToast.title}
                    </span>
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0">
                    {currentToast.timeAgo}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-200 font-semibold truncate leading-tight mt-0.5">
                  {currentToast.message}
                </p>

                {currentToast.location && (
                  <p className="text-[9px] text-amber-400/90 font-mono truncate mt-0.5">
                    📍 {currentToast.location}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleManualClose}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* 3-Second Progress Bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: isHovered ? '100%' : '0%' }}
              transition={{ duration: isHovered ? 0 : 3, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-[2px] bg-emerald-500/80"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityToast;
