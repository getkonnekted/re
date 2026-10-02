import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, InvestmentPlan, UserInvestment, Transaction, SystemSettings, INVESTMENT_PLANS, DailyTask, TaskSubmission, UserDailyProgress, PayoutToastData, LiveActivityItem } from '../types';
import { DEFAULT_DAILY_TASKS } from '../data/dailyTasks';
import { playPayoutChime } from '../lib/sound';
import { getWatDate, getWatDateString, getWatYesterdayString } from '../lib/watTime';
import { 
  isSupabaseConfigured, 
  supabase, 
  fetchAllSupabaseData, 
  syncUserToSupabase, 
  syncInvestmentToSupabase, 
  syncTransactionToSupabase, 
  syncSettingsToSupabase, 
  syncWeekToSupabase,
  syncMultipleUsersToSupabase,
  syncMultipleInvestmentsToSupabase,
  syncMultipleTransactionsToSupabase,
  syncTaskSubmissionToSupabase,
  syncMultipleTaskSubmissionsToSupabase,
  syncUserDailyProgressToSupabase,
  recordWalletAuditToSupabase,
  subscribeToSupabaseRealtime,
  getSupabaseConfig,
  saveSupabaseCredentials,
  getSupabaseClient
} from '../lib/supabase';

interface StateContextType {
  users: User[];
  currentUser: User | null;
  investments: UserInvestment[];
  transactions: Transaction[];
  settings: SystemSettings;
  currentWeek: number;
  errorMsg: string | null;
  successMsg: string | null;
  supabaseStatus: 'idle' | 'loading' | 'connected' | 'error' | 'not_configured';
  isDbLoaded: boolean;
  lastSyncedAt: string | null;
  getSupabaseConfig: () => { url: string; key: string; isConfigured: boolean; isFromEnv: boolean };
  saveSupabaseCredentials: (url: string, key: string) => boolean;
  refreshFromSupabase: () => Promise<void>;
  
  // Daily Tasks state & helpers
  dailyTasks: DailyTask[];
  taskSubmissions: TaskSubmission[];
  userDailyProgress: Record<string, UserDailyProgress>;
  virtualDate: string;
  getUserActiveWeeklyPayout: (userId: string) => number;
  getUserDailyPool: (userId: string) => number;
  getUserDailyTaskReward: (userId: string, task: DailyTask) => number;
  getUserProgress: (userId: string) => UserDailyProgress;
  
  // Auth actions
  register: (name: string, email: string, referredByCode?: string, password?: string, phone?: string) => boolean;
  login: (email: string, password?: string) => Promise<boolean> | boolean;
  requestPasswordReset: (email: string) => { success: boolean; code?: string; message: string };
  confirmPasswordReset: (email: string, code: string, newPassword: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  
  // User actions
  submitDeposit: (amount: number, method: string, accountDetails: string, proofUrl?: string) => void;
  processAutomatedDeposit: (amount: number, reference: string, channel: string) => void;
  submitWithdrawal: (amount: number, accountDetails: string) => boolean;
  purchaseInvestment: (planId: string) => boolean;
  topUpAndPurchaseInvestment: (planId: string, topUpAmount: number, reference?: string) => boolean;
  toggleAutoReinvest: (investmentId: string) => void;
  submitKyc: (fullName: string, idType: string, idNumber: string) => void;

  // Daily Tasks user actions
  completeInstantTask: (taskId: string, answerIndex?: number, isAdBoosted?: boolean) => boolean;
  applyRewardedAdBoost: (taskId: string) => boolean;
  submitTaskProof: (taskId: string, proof: string) => boolean;
  claimStreakBonus: () => boolean;
  claimGuestTrialEarnings: () => number;
  
  // Admin actions
  adminCreateUser: (userData: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    walletBalance?: number;
    role?: 'user' | 'admin';
    referralCode?: string;
    referredByCode?: string;
    kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
    isDeactivated?: boolean;
    isMarketingAccount?: boolean;
  }) => { success: boolean; message: string; user?: User };
  adminToggleUserStatus: (userId: string, isDeactivated: boolean) => { success: boolean; message: string };
  adminUpdateUser: (userId: string, updates: { walletBalance?: number; role?: 'user' | 'admin'; kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected'; name?: string; password?: string; phone?: string; isDeactivated?: boolean; isMarketingAccount?: boolean }) => boolean;
  adminTopUpMarketingWallet: (userId: string, amount: number, notes?: string) => boolean;
  adminToggleMarketingStatus: (userId: string) => boolean;
  approveDeposit: (txId: string, adjustedAmount?: number) => void;
  rejectDeposit: (txId: string) => void;
  approveWithdrawal: (txId: string) => void;
  rejectWithdrawal: (txId: string) => void;
  reviewKyc: (userId: string, approve: boolean) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  approveTaskSubmission: (subId: string) => void;
  rejectTaskSubmission: (subId: string) => void;
  recordAdImpression: (adRevenue: number) => void;
  
  // Payout Notification Toasts
  payoutToasts: PayoutToastData[];
  dismissPayoutToast: (id: string) => void;
  triggerPayoutToast: (toast: Omit<PayoutToastData, 'id' | 'timestamp'>) => void;
  processSingleInvestmentPayout: (invId: string) => boolean;

  // Live Continuously Compounding Reserve
  liveLiquidityReserve: number;
  formatLiquidityReserve: (precision?: number) => string;

  // Live Activity Popups & Social Proof
  activeLiveActivity: LiveActivityItem | null;
  dismissLiveActivity: () => void;
  triggerLiveActivity: (activity: Omit<LiveActivityItem, 'id' | 'timestamp'>) => void;

  // Friday Payout Detection
  isPayoutDay: boolean;

  // Simulator
  simulateWeek: () => void;
  simulateNextDay: () => void;
  resetAll: () => void;
  clearMessages: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const getEnvAdminEmail = (): string => {
  return (
    (import.meta as any).env?.VITE_ADMIN_EMAIL ||
    (import.meta as any).env?.ADMIN_EMAIL ||
    ''
  ).toLowerCase().trim();
};

export const getEnvAdminPassword = (): string => {
  return (
    (import.meta as any).env?.VITE_ADMIN_PASSWORD ||
    (import.meta as any).env?.ADMIN_PASSWORD ||
    ''
  );
};

export const ADMIN_EMAIL = getEnvAdminEmail();

// Initial users: Empty unless configured via Vercel env, ensuring Supabase and Vercel manage users completely
const getSeedUsers = (): User[] => {
  const envEmail = getEnvAdminEmail();
  if (envEmail) {
    return [
      {
        id: 'usr_admin',
        name: 'Administrator',
        email: envEmail,
        phone: '+2348000000000',
        referralCode: 'ADMIN_PROD',
        walletBalance: 0,
        kycStatus: 'verified',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
  }
  return [];
};

const SEED_INVESTMENTS: UserInvestment[] = [];

const SEED_TRANSACTIONS: Transaction[] = [];

// Base cash reserve backing and automated hourly accretion (+₦10,000 every hour)
export const BASE_LIQUIDITY_RESERVE = 92066059.975; // Starting cash reserve backing (Treasure Homes Backed)
export const HOURLY_LIQUIDITY_GROWTH = 10000; // Adds ₦10,000 to the reserve every hour
export const DAILY_LIQUIDITY_GROWTH = 240000; // ₦10,000 x 24 hours = ₦240,000 daily
export const LIQUIDITY_ANCHOR_DATE = '2026-10-01T03:00:00.000Z'; // Reference baseline anchor

export function calculateHourlyLiquidity(virtualDayOffset: number = 0): number {
  const anchorTime = new Date(LIQUIDITY_ANCHOR_DATE).getTime();
  const now = Date.now();
  const elapsedHours = Math.max(0, Math.floor((now - anchorTime) / (1000 * 60 * 60)));
  const virtualHours = virtualDayOffset * 24;
  const totalHours = elapsedHours + virtualHours;
  return BASE_LIQUIDITY_RESERVE + (totalHours * HOURLY_LIQUIDITY_GROWTH);
}

export function calculateContinuousLiquidity(virtualDayOffset: number = 0, nowTime?: number): number {
  const anchorTime = new Date(LIQUIDITY_ANCHOR_DATE).getTime();
  const now = nowTime ?? Date.now();
  const elapsedMs = Math.max(0, now - anchorTime);
  const virtualMs = virtualDayOffset * 24 * 60 * 60 * 1000;
  const totalMs = elapsedMs + virtualMs;
  // ₦10,000 spread continuously across each hour (3,600,000 ms)
  const accrued = (totalMs * HOURLY_LIQUIDITY_GROWTH) / (3600 * 1000);
  return BASE_LIQUIDITY_RESERVE + accrued;
}

export function formatReserveNumber(num: number, decimals: number = 0): string {
  if (decimals <= 0) {
    return Math.floor(num).toLocaleString('en-US');
  }
  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export const calculateDailyLiquidity = calculateContinuousLiquidity;

const DEFAULT_SETTINGS: SystemSettings = {
  liquidityReserve: calculateContinuousLiquidity(0), // Dynamic cash reserve (+₦10,000 spread continuously every hour)
  dailyLiquidityGrowth: DAILY_LIQUIDITY_GROWTH,
  hourlyLiquidityGrowth: HOURLY_LIQUIDITY_GROWTH,
  riskAlertLevel: 'low',
  minWithdrawal: 5000,
  maxWithdrawal: 1000000,
  autoApproveDeposits: false, // Production live mode: real bank transfers verified by treasury
  automatedPayouts: true,
  paystackTestMode: false, // Production live mode
  isMaintenanceMode: false,
  pauseInvestments: false,
  pauseWithdrawals: false,
  dailyTaskEnabled: true,
  dailyTaskBonusRate: 0.05, // 5% of weekly payout
  dailyTaskBaseReward: 200, // ₦200 base for users with no active plan
  dailyTaskStreakBonus: 1500, // ₦1,500 bonus for 7-day streak
  freeStarterWithdrawalLimit: 3000, // ₦3,000 max free starter cashout
  rewardedAdBonusMultiplier: 2, // 2x yield booster on video ad view
  estimatedAdRevenueTotal: 284500, // Simulated external advertiser revenue pool
  enableLiveActivityToasts: true // Real-time purchase and investor activity toasts
};

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pm_prod_users_v1');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && Array.isArray(parsed)) {
      return parsed.filter((u: any) => u.id !== 'usr_demo_investor');
    }
    return getSeedUsers();
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pm_prod_current_user_v1');
    return saved ? JSON.parse(saved) : null; 
  });

  const [investments, setInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('pm_prod_investments_v1');
    return saved ? JSON.parse(saved) : SEED_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pm_prod_transactions_v1');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pm_prod_settings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...DEFAULT_SETTINGS, 
          ...parsed,
          autoApproveDeposits: false, // Force production mode
          paystackTestMode: false // Force production mode
        };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    const saved = localStorage.getItem('pm_prod_current_week_v1');
    return saved ? Number(saved) : 1;
  });

  // Daily Tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(DEFAULT_DAILY_TASKS);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>(() => {
    const saved = localStorage.getItem('pm_prod_task_submissions_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [userDailyProgress, setUserDailyProgress] = useState<Record<string, UserDailyProgress>>(() => {
    const saved = localStorage.getItem('pm_prod_daily_progress_v1');
    return saved ? JSON.parse(saved) : {};
  });
  const [virtualDayOffset, setVirtualDayOffset] = useState<number>(() => {
    const saved = localStorage.getItem('pm_prod_virtual_day_v1');
    return saved ? Number(saved) : 0;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payout Notification Toasts
  const [payoutToasts, setPayoutToasts] = useState<PayoutToastData[]>([]);

  // Periodic calendar tick to ensure reserve updates daily
  const [calendarTick, setCalendarTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCalendarTick(prev => prev + 1);
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const dismissPayoutToast = (id: string) => {
    setPayoutToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerPayoutToast = (toastData: Omit<PayoutToastData, 'id' | 'timestamp'>) => {
    const newToast: PayoutToastData = {
      ...toastData,
      id: 'toast_payout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setPayoutToasts(prev => [newToast, ...prev]);
    playPayoutChime();
  };

  // High-Resolution Live Continuous Liquidity Reserve
  const [liveLiquidityReserve, setLiveLiquidityReserve] = useState<number>(() => calculateContinuousLiquidity(virtualDayOffset));

  useEffect(() => {
    // High-resolution real-time ticker: updates every 80ms so the digits continuously increment before user eyes!
    const timer = setInterval(() => {
      setLiveLiquidityReserve(calculateContinuousLiquidity(virtualDayOffset));
    }, 80);
    return () => clearInterval(timer);
  }, [virtualDayOffset]);

  const formatLiquidityReserve = (precision: number = 0): string => {
    return formatReserveNumber(liveLiquidityReserve, precision);
  };

  // Live Activity Popups & Social Proof Toasts
  const [activeLiveActivity, setActiveLiveActivity] = useState<LiveActivityItem | null>(null);

  const dismissLiveActivity = () => {
    setActiveLiveActivity(null);
  };

  const triggerLiveActivity = (activityData: Omit<LiveActivityItem, 'id' | 'timestamp'>) => {
    if (settings.enableLiveActivityToasts === false) return;
    const item: LiveActivityItem = {
      ...activityData,
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };
    setActiveLiveActivity(item);
  };

  // Supabase states
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'loading' | 'connected' | 'error' | 'not_configured'>('idle');
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const isRemoteSyncingRef = useRef(false);

  // Live Refresh from Supabase (Realtime + Heartbeat)
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const dbData = await fetchAllSupabaseData();
      if (!dbData) return;

      isRemoteSyncingRef.current = true;
      setSupabaseStatus('connected');
      setLastSyncedAt(new Date().toLocaleTimeString());

      if (dbData.users && dbData.users.length > 0) {
        const sanitizedUsers = dbData.users.filter((u: any) => u.id !== 'usr_demo_investor');
        setUsers(sanitizedUsers);

        // Keep active logged-in user in sync with updated balance, KYC status, etc.
        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          const freshUser = sanitizedUsers.find(u => u.id === prevUser.id);
          return freshUser ? { ...prevUser, ...freshUser } : prevUser;
        });
      }

      if (dbData.investments) {
        setInvestments(dbData.investments);
      }

      if (dbData.transactions) {
        setTransactions(dbData.transactions);
      }

      if (dbData.settings) {
        setSettings(prev => ({ ...prev, ...dbData.settings }));
      }

      if (dbData.currentWeek !== null) {
        setCurrentWeek(dbData.currentWeek);
      }

      if (dbData.taskSubmissions) {
        setTaskSubmissions(dbData.taskSubmissions);
      }

      if (dbData.userDailyProgress && Object.keys(dbData.userDailyProgress).length > 0) {
        setUserDailyProgress(prev => ({ ...prev, ...dbData.userDailyProgress }));
      }

      setTimeout(() => {
        isRemoteSyncingRef.current = false;
      }, 500);
    } catch (err) {
      console.warn('Live sync refresh notice:', err);
    }
  }, []);

  // Initialize and Fetch from Supabase with Live Realtime Subscriptions
  useEffect(() => {
    let unsubscribeRealtime = () => {};

    const initSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setSupabaseStatus('not_configured');
        setIsDbLoaded(true);
        return;
      }

      setSupabaseStatus('loading');
      try {
        const dbData = await fetchAllSupabaseData();

        if (dbData) {
          setSupabaseStatus('connected');
          setLastSyncedAt(new Date().toLocaleTimeString());
          
          if (dbData.users.length === 0) {
            const defaultSeed = getSeedUsers();
            if (defaultSeed.length > 0) {
              await syncMultipleUsersToSupabase(defaultSeed);
              setUsers(defaultSeed);
            }
            await syncSettingsToSupabase(settings);
            await syncWeekToSupabase(currentWeek);
          } else {
            const sanitizedUsers = dbData.users.filter((u: any) => u.id !== 'usr_demo_investor');
            setUsers(sanitizedUsers);
            setInvestments(dbData.investments);
            setTransactions(dbData.transactions);
            if (dbData.settings) {
              setSettings(prev => ({ ...prev, ...dbData.settings }));
            }
            if (dbData.currentWeek !== null) {
              setCurrentWeek(dbData.currentWeek);
            }
            if (dbData.taskSubmissions) {
              setTaskSubmissions(dbData.taskSubmissions);
            }
            if (dbData.userDailyProgress && Object.keys(dbData.userDailyProgress).length > 0) {
              setUserDailyProgress(prev => ({ ...prev, ...dbData.userDailyProgress }));
            }

            const savedUser = localStorage.getItem('pm_prod_current_user_v1');
            if (savedUser) {
              try {
                const parsed = JSON.parse(savedUser);
                const freshUser = sanitizedUsers.find(u => u.id === parsed.id);
                if (freshUser) {
                  setCurrentUser(freshUser);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }

          // 1. Establish Live Supabase Realtime WebSocket Connection
          unsubscribeRealtime = subscribeToSupabaseRealtime((table) => {
            console.log(`[Supabase Live Event] Realtime push on ${table}`);
            refreshFromSupabase();
          });
        } else {
          setSupabaseStatus('error');
        }
      } catch (err) {
        console.error('Supabase setup exception:', err);
        setSupabaseStatus('error');
      }
      setIsDbLoaded(true);
    };

    initSupabase();

    // 2. Background Heartbeat Poll every 12 seconds for guaranteed consistency
    const pollInterval = setInterval(() => {
      refreshFromSupabase();
    }, 12000);

    return () => {
      unsubscribeRealtime();
      clearInterval(pollInterval);
    };
  }, [refreshFromSupabase]);

  // Sync to local storage and Supabase (guarded against echo loops)
  useEffect(() => {
    localStorage.setItem('pm_prod_users_v1', JSON.stringify(users));
    if (isDbLoaded && isSupabaseConfigured() && users.length > 0) {
      if (isRemoteSyncingRef.current) return;
      syncMultipleUsersToSupabase(users);
    }
  }, [users, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_current_user_v1', JSON.stringify(currentUser));
    if (isDbLoaded && isSupabaseConfigured() && currentUser) {
      if (isRemoteSyncingRef.current) return;
      syncUserToSupabase(currentUser);
    }
  }, [currentUser, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_investments_v1', JSON.stringify(investments));
    if (isDbLoaded && isSupabaseConfigured()) {
      if (isRemoteSyncingRef.current) return;
      syncMultipleInvestmentsToSupabase(investments);
    }
  }, [investments, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_transactions_v1', JSON.stringify(transactions));
    if (isDbLoaded && isSupabaseConfigured()) {
      if (isRemoteSyncingRef.current) return;
      syncMultipleTransactionsToSupabase(transactions);
    }
  }, [transactions, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_settings_v1', JSON.stringify(settings));
    if (isDbLoaded && isSupabaseConfigured()) {
      if (isRemoteSyncingRef.current) return;
      syncSettingsToSupabase(settings);
    }
  }, [settings, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_current_week_v1', String(currentWeek));
    if (isDbLoaded && isSupabaseConfigured()) {
      if (isRemoteSyncingRef.current) return;
      syncWeekToSupabase(currentWeek);
    }
  }, [currentWeek, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_task_submissions_v1', JSON.stringify(taskSubmissions));
    if (isDbLoaded && isSupabaseConfigured() && taskSubmissions.length > 0) {
      if (isRemoteSyncingRef.current) return;
      syncMultipleTaskSubmissionsToSupabase(taskSubmissions);
    }
  }, [taskSubmissions, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_daily_progress_v1', JSON.stringify(userDailyProgress));
    if (isDbLoaded && isSupabaseConfigured()) {
      if (isRemoteSyncingRef.current) return;
      if (currentUser && userDailyProgress[currentUser.id]) {
        syncUserDailyProgressToSupabase(userDailyProgress[currentUser.id]);
      }
    }
  }, [userDailyProgress, currentUser, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_virtual_day_v1', String(virtualDayOffset));
  }, [virtualDayOffset]);


  // Recalculate liquidity and risk alert level based on stats and automated daily growth (+₦530,234 Naira/day)
  useEffect(() => {
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed' && !t.isMarketing)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed' && !t.isMarketing)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayouts = transactions
      .filter((t) => (t.type === 'payout' || t.type === 'referral_bonus') && t.status === 'completed' && !t.isMarketing)
      .reduce((sum, t) => sum + t.amount, 0);

    // Initial base cash reserve with hourly growth (+₦10,000 every hour) + deposits - withdrawals - payouts
    const dynamicBaseReserve = calculateHourlyLiquidity(virtualDayOffset);
    const activeLiquidity = dynamicBaseReserve + totalDeposits - totalWithdrawals - totalPayouts;
    
    // Risk assessment
    let risk: 'low' | 'medium' | 'high' = 'low';
    const pendingWithdrawalSum = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    if (activeLiquidity < 50000000 || pendingWithdrawalSum > activeLiquidity * 0.4) {
      risk = 'high';
    } else if (activeLiquidity < 65000000 || pendingWithdrawalSum > activeLiquidity * 0.2) {
      risk = 'medium';
    }

    if (
      settings.liquidityReserve !== activeLiquidity || 
      settings.riskAlertLevel !== risk || 
      settings.dailyLiquidityGrowth !== DAILY_LIQUIDITY_GROWTH ||
      settings.hourlyLiquidityGrowth !== HOURLY_LIQUIDITY_GROWTH
    ) {
      setSettings(prev => ({
        ...prev,
        liquidityReserve: activeLiquidity,
        dailyLiquidityGrowth: DAILY_LIQUIDITY_GROWTH,
        hourlyLiquidityGrowth: HOURLY_LIQUIDITY_GROWTH,
        riskAlertLevel: risk
      }));
    }
  }, [transactions, virtualDayOffset, calendarTick]);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const register = (name: string, email: string, referredByCode?: string, password?: string, phone?: string): boolean => {
    clearMessages();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMsg('Full legal name and email address are required.');
      return false;
    }

    if (!cleanPhone) {
      setErrorMsg('Phone number is required for account security and SMS transaction updates.');
      return false;
    }

    // Basic email format check
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }

    // Email uniqueness check
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setErrorMsg('An account with this email already exists. Please sign in instead.');
      return false;
    }

    if (password && password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return false;
    }

    // Referral code is strictly compulsory for Account Creation (Gated Platform)
    const cleanRef = (referredByCode || '').trim();
    if (!cleanRef) {
      setErrorMsg('Referral code is compulsory for account creation. PM Invest is an invite-only platform; please enter a valid sponsor code to register.');
      return false;
    }

    // Validate referral code against existing users
    const sponsor = users.find(u => u.referralCode.toUpperCase() === cleanRef.toUpperCase());
    if (!sponsor) {
      setErrorMsg(`Invalid referral code "${cleanRef}". Account creation is gated to verified invite codes.`);
      return false;
    }

    // Create new user
    const refCode = trimmedName.split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase() + Math.floor(100 + Math.random() * 900);
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      phone: cleanPhone,
      password: password || undefined,
      referralCode: refCode || ('INV' + Math.floor(1000 + Math.random() * 9000)),
      referredByCode: sponsor.referralCode,
      walletBalance: 0,
      kycStatus: 'unverified',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    syncUserToSupabase(newUser);
    setSuccessMsg(`Account created successfully! Welcome to PM Invest, ${trimmedName}.`);
    return true;
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    clearMessages();
    const normEmail = email.toLowerCase().trim();

    if (!normEmail) {
      setErrorMsg('Please enter your email address to sign in.');
      return false;
    }

    if (!password) {
      setErrorMsg('Please enter your account password.');
      return false;
    }

    const envAdminEmail = getEnvAdminEmail();
    const envAdminPassword = getEnvAdminPassword();

    // 1. Managed via Vercel Environment Variables (VITE_ADMIN_EMAIL / ADMIN_EMAIL)
    if (envAdminEmail && normEmail === envAdminEmail) {
      if (envAdminPassword && password !== envAdminPassword) {
        setErrorMsg('Incorrect administrator password.');
        return false;
      }

      const existingUser = users.find(u => u.email.toLowerCase() === normEmail);
      if (existingUser) {
        if (existingUser.isDeactivated) {
          setErrorMsg('This administrator account has been deactivated.');
          return false;
        }
        if (existingUser.role !== 'admin') {
          existingUser.role = 'admin';
        }
        setCurrentUser(existingUser);
        setSuccessMsg(`Welcome back, ${existingUser.name}!`);
        return true;
      }

      // Auto-create dynamically from Vercel env configuration
      const newAdmin: User = {
        id: 'usr_admin',
        name: 'Administrator',
        email: normEmail,
        phone: '+2348000000000',
        password: password,
        referralCode: 'ADMIN_PROD',
        walletBalance: 0,
        kycStatus: 'verified',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [newAdmin, ...prev.filter(u => u.email.toLowerCase() !== normEmail)]);
      syncUserToSupabase(newAdmin);
      setCurrentUser(newAdmin);
      setSuccessMsg('Logged in successfully as Administrator.');
      return true;
    }

    // 2. Managed via Supabase Database (or local state synced from Supabase)
    let user = users.find(u => u.email.toLowerCase() === normEmail);

    // If user not in local memory, query Supabase database directly in real-time
    if (!user && isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('users')
            .select('*')
            .eq('email', normEmail)
            .maybeSingle();

          if (!error && data) {
            user = data as User;
            setUsers(prev => [...prev.filter(u => u.id !== (data as any).id), data as User]);
          }
        } catch (err) {
          console.warn('Real-time Supabase user fetch error:', err);
        }
      }
    }

    if (user) {
      if (user.isDeactivated) {
        setErrorMsg('This account has been deactivated. Please contact support or the administrator.');
        return false;
      }
      if (user.password && user.password !== password) {
        setErrorMsg('Incorrect password. Please verify and try again.');
        return false;
      }
      setCurrentUser(user);
      setSuccessMsg(`Welcome back, ${user.name}!`);
      return true;
    }

    setErrorMsg('No account found with this email address. Please register a new account or configure in Supabase.');
    return false;
  };

  const [pendingResets, setPendingResets] = useState<Record<string, { code: string; expiresAt: number; email: string }>>({});

  const requestPasswordReset = (email: string): { success: boolean; code?: string; message: string } => {
    clearMessages();
    const normEmail = email.toLowerCase().trim();
    if (!normEmail) {
      setErrorMsg('Please enter your registered email address.');
      return { success: false, message: 'Please enter your registered email address.' };
    }

    const envAdmin = getEnvAdminEmail();
    const user = users.find(u => u.email.toLowerCase() === normEmail) || (envAdmin && normEmail === envAdmin ? { email: envAdmin, name: 'Administrator' } : null);

    if (!user) {
      setErrorMsg(`No account found matching email "${normEmail}".`);
      return { success: false, message: `No account found matching email "${normEmail}".` };
    }

    // Generate 6-digit verification confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    setPendingResets(prev => ({
      ...prev,
      [normEmail]: { code, expiresAt, email: normEmail }
    }));

    const msg = `Security confirmation code generated: ${code}. Enter this 6-digit code with your new password to confirm the reset.`;
    setSuccessMsg(msg);
    return { success: true, code, message: msg };
  };

  const confirmPasswordReset = (email: string, code: string, newPassword: string): boolean => {
    clearMessages();
    const normEmail = email.toLowerCase().trim();
    const trimmedCode = code.trim();

    if (!normEmail) {
      setErrorMsg('Email address is required.');
      return false;
    }

    if (!trimmedCode) {
      setErrorMsg('Confirmation code is required.');
      return false;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return false;
    }

    const pending = pendingResets[normEmail];
    if (!pending) {
      setErrorMsg('No active password reset request found for this email. Please request a new confirmation code.');
      return false;
    }

    if (Date.now() > pending.expiresAt) {
      setErrorMsg('The confirmation code has expired. Please request a new reset code.');
      return false;
    }

    if (pending.code !== trimmedCode) {
      setErrorMsg('Invalid confirmation code. Please enter the exact 6-digit code provided.');
      return false;
    }

    // Confirmation code verified! Update user password
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === normEmail) {
        const updated = { ...u, password: newPassword };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        syncUserToSupabase(updated);
        return updated;
      }
      return u;
    }));

    setPendingResets(prev => {
      const next = { ...prev };
      delete next[normEmail];
      return next;
    });

    setSuccessMsg('Password reset confirmed! Your password has been successfully updated. You can now sign in.');
    return true;
  };

  const adminCreateUser = (userData: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    walletBalance?: number;
    role?: 'user' | 'admin';
    referralCode?: string;
    referredByCode?: string;
    kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
    isDeactivated?: boolean;
    isMarketingAccount?: boolean;
  }): { success: boolean; message: string; user?: User } => {
    clearMessages();
    const trimmedName = userData.name.trim();
    const trimmedEmail = userData.email.toLowerCase().trim();

    if (!trimmedName) {
      const msg = 'User full legal name is required.';
      setErrorMsg(msg);
      return { success: false, message: msg };
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      const msg = 'A valid email address is required.';
      setErrorMsg(msg);
      return { success: false, message: msg };
    }

    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      const msg = `An account with email "${trimmedEmail}" already exists.`;
      setErrorMsg(msg);
      return { success: false, message: msg };
    }

    // Generate referral code if not provided
    let refCode = userData.referralCode?.trim().toUpperCase();
    if (!refCode) {
      const prefix = trimmedName.split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'PM';
      refCode = `${prefix}${Math.floor(100 + Math.random() * 900)}`;
    }

    // Validate sponsor code if provided
    const sponsorCode = userData.referredByCode?.trim().toUpperCase();
    if (sponsorCode) {
      const sponsorExists = users.some(u => u.referralCode === sponsorCode);
      if (!sponsorExists && sponsorCode !== 'TREASURE_ADMIN') {
        const msg = `Sponsor referral code "${sponsorCode}" was not found on the platform.`;
        setErrorMsg(msg);
        return { success: false, message: msg };
      }
    }

    const initBalance = typeof userData.walletBalance === 'number' && !isNaN(userData.walletBalance)
      ? Math.max(0, userData.walletBalance)
      : 0;

    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmedName,
      email: trimmedEmail,
      phone: userData.phone?.trim() || undefined,
      password: userData.password?.trim() || 'password123',
      referralCode: refCode,
      referredByCode: sponsorCode || undefined,
      walletBalance: initBalance,
      kycStatus: userData.kycStatus || 'unverified',
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      isDeactivated: userData.isDeactivated ?? false,
      isMarketingAccount: userData.isMarketingAccount ?? false,
      marketingAllocatedBalance: userData.isMarketingAccount ? initBalance : 0
    };

    setUsers(prev => [newUser, ...prev]);
    syncUserToSupabase(newUser);

    if (initBalance > 0) {
      const isMkt = userData.isMarketingAccount === true;
      const initTx: Transaction = {
        id: 'tx_init_' + Date.now(),
        userId: newUser.id,
        userName: newUser.name,
        type: 'deposit',
        amount: initBalance,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: isMkt 
          ? `Admin Marketing Canvassing Allocation: +₦${initBalance.toLocaleString()}`
          : `Admin Initial Account Credit: +₦${initBalance.toLocaleString()}`,
        isMarketing: isMkt
      };
      setTransactions(prev => [initTx, ...prev]);
      syncTransactionToSupabase(initTx);
      recordWalletAuditToSupabase({
        userId: newUser.id,
        transactionType: isMkt ? 'marketing_allocation' : 'initial_credit',
        amount: initBalance,
        balanceBefore: 0,
        balanceAfter: initBalance,
        description: initTx.description,
        reference: initTx.id,
        performedBy: currentUser?.id || 'admin'
      });
    }

    const successMessage = userData.isMarketingAccount
      ? `Marketing Canvasser account for "${trimmedName}" (${trimmedEmail}) created with ₦${initBalance.toLocaleString()} canvas allocation!`
      : `Account for "${trimmedName}" (${trimmedEmail}) was created successfully!`;
    setSuccessMsg(successMessage);
    return { success: true, message: successMessage, user: newUser };
  };

  const adminToggleUserStatus = (userId: string, isDeactivated: boolean): { success: boolean; message: string } => {
    clearMessages();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      const msg = 'User not found.';
      setErrorMsg(msg);
      return { success: false, message: msg };
    }

    if (targetUser.role === 'admin' && isDeactivated) {
      const msg = 'Cannot deactivate an administrator account.';
      setErrorMsg(msg);
      return { success: false, message: msg };
    }

    if (currentUser?.id === userId && isDeactivated) {
      const msg = 'You cannot deactivate your own active session account.';
      setErrorMsg(msg);
      return { success: false, message: msg };
    }

    const updatedUser: User = {
      ...targetUser,
      isDeactivated
    };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    syncUserToSupabase(updatedUser);

    const actionText = isDeactivated ? 'deactivated' : 'reactivated';
    const msg = `Account for ${targetUser.name} has been ${actionText}.`;
    setSuccessMsg(msg);
    return { success: true, message: msg };
  };

  const adminToggleMarketingStatus = (userId: string): boolean => {
    clearMessages();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      setErrorMsg('User not found.');
      return false;
    }
    const newStatus = !targetUser.isMarketingAccount;
    const updatedUser: User = {
      ...targetUser,
      isMarketingAccount: newStatus
    };
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }
    syncUserToSupabase(updatedUser);
    setSuccessMsg(`${targetUser.name} is now designated as ${newStatus ? 'a MARKETING / SALES CANVASSER' : 'a REGULAR REAL INVESTOR'}.`);
    return true;
  };

  const adminTopUpMarketingWallet = (userId: string, amount: number, notes?: string): boolean => {
    clearMessages();
    if (!amount || amount <= 0) {
      setErrorMsg('Please specify a positive top-up amount.');
      return false;
    }
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      setErrorMsg('Marketing account not found.');
      return false;
    }

    const newBalance = targetUser.walletBalance + amount;
    const newMktAlloc = (targetUser.marketingAllocatedBalance || 0) + amount;

    const updatedUser: User = {
      ...targetUser,
      walletBalance: newBalance,
      isMarketingAccount: true,
      marketingAllocatedBalance: newMktAlloc
    };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }
    syncUserToSupabase(updatedUser);

    const txId = 'tx_mkt_' + Date.now();
    const mktTx: Transaction = {
      id: txId,
      userId: targetUser.id,
      userName: targetUser.name,
      type: 'deposit',
      amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: notes?.trim() 
        ? `Marketing Canvassing Top-up: +₦${amount.toLocaleString()} (${notes.trim()})`
        : `Marketing Canvassing Top-up: +₦${amount.toLocaleString()}`,
      isMarketing: true
    };
    setTransactions(prev => [mktTx, ...prev]);
    syncTransactionToSupabase(mktTx);

    recordWalletAuditToSupabase({
      userId: targetUser.id,
      transactionType: 'marketing_allocation',
      amount,
      balanceBefore: targetUser.walletBalance,
      balanceAfter: newBalance,
      description: mktTx.description,
      reference: txId,
      performedBy: currentUser?.id || 'admin'
    });

    setSuccessMsg(`Successfully topped up ₦${amount.toLocaleString()} into ${targetUser.name}'s marketing wallet. Ready for client canvassing.`);
    return true;
  };

  const adminUpdateUser = (
    userId: string, 
    updates: { 
      walletBalance?: number; 
      role?: 'user' | 'admin'; 
      kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected'; 
      name?: string; 
      password?: string;
      phone?: string;
      isDeactivated?: boolean;
      isMarketingAccount?: boolean;
    }
  ): boolean => {
    clearMessages();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      setErrorMsg('User not found.');
      return false;
    }

    let balanceDiff = 0;
    if (updates.walletBalance !== undefined && !isNaN(updates.walletBalance)) {
      balanceDiff = updates.walletBalance - targetUser.walletBalance;
    }

    const updatedUser: User = {
      ...targetUser,
      name: updates.name !== undefined && updates.name.trim() ? updates.name.trim() : targetUser.name,
      walletBalance: updates.walletBalance !== undefined && !isNaN(updates.walletBalance) ? updates.walletBalance : targetUser.walletBalance,
      role: updates.role !== undefined ? updates.role : targetUser.role,
      kycStatus: updates.kycStatus !== undefined ? updates.kycStatus : targetUser.kycStatus,
      password: updates.password !== undefined && updates.password.trim() ? updates.password.trim() : targetUser.password,
      phone: updates.phone !== undefined ? updates.phone.trim() : targetUser.phone,
      isDeactivated: updates.isDeactivated !== undefined ? updates.isDeactivated : targetUser.isDeactivated,
      isMarketingAccount: updates.isMarketingAccount !== undefined ? updates.isMarketingAccount : targetUser.isMarketingAccount
    };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }
    syncUserToSupabase(updatedUser);

    if (balanceDiff !== 0) {
      const isMkt = updatedUser.isMarketingAccount === true;
      const auditTx: Transaction = {
        id: 'tx_adj_' + Date.now(),
        userId: targetUser.id,
        userName: targetUser.name,
        type: balanceDiff > 0 ? 'deposit' : 'withdrawal',
        amount: Math.abs(balanceDiff),
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: isMkt
          ? `Admin Marketing Balance Adjustment: ${balanceDiff > 0 ? '+' : '-'}₦${Math.abs(balanceDiff).toLocaleString()} (New Balance: ₦${updatedUser.walletBalance.toLocaleString()})`
          : `Admin Wallet Balance Adjustment: ${balanceDiff > 0 ? '+' : '-'}₦${Math.abs(balanceDiff).toLocaleString()} (New Balance: ₦${updatedUser.walletBalance.toLocaleString()})`,
        isMarketing: isMkt
      };
      setTransactions(prev => [auditTx, ...prev]);
      syncTransactionToSupabase(auditTx);
    }

    setSuccessMsg(`Successfully updated account and wallet balance for ${updatedUser.name}.`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setSuccessMsg('Logged out successfully.');
  };

  const switchUser = (userId: string) => {
    clearMessages();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.isDeactivated) {
        setErrorMsg(`Cannot switch session to deactivated account "${user.name}". Please reactivate the account from Admin Panel.`);
        return;
      }
      setCurrentUser(user);
      setSuccessMsg(`Switched view to ${user.name} (${user.role.toUpperCase()})`);
    }
  };

  const submitDeposit = (amount: number, method: string, accountDetails: string, proofUrl?: string) => {
    clearMessages();
    if (!currentUser) return;

    if (currentUser.isDeactivated) {
      setErrorMsg('Your account has been deactivated. Deposit submissions are restricted.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg('Deposit amount must be greater than zero.');
      return;
    }

    const txId = 'tx_' + Date.now();
    const newTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'deposit',
      amount,
      status: settings.autoApproveDeposits ? 'completed' : 'pending',
      paymentMethod: method,
      accountDetails,
      proofUrl: proofUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60', // Default placeholder
      createdAt: new Date().toISOString(),
      description: `Deposit request of ₦${amount.toLocaleString()}`
    };

    setTransactions(prev => [newTx, ...prev]);

    if (settings.autoApproveDeposits) {
      // Instantly credit cleanly
      const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance + amount };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setSuccessMsg(`Deposit of ₦${amount.toLocaleString()} has been automatically credited!`);
    } else {
      setSuccessMsg(`Deposit request of ₦${amount.toLocaleString()} submitted. Our compliance and treasury desk will confirm the bank transfer alert and credit your wallet within 10 to 30 minutes.`);
    }
  };

  const processAutomatedDeposit = (amount: number, reference: string, channel: string) => {
    clearMessages();
    if (!currentUser) return;

    if (amount <= 0) {
      setErrorMsg('Deposit amount must be greater than zero.');
      return;
    }

    const txId = 'tx_' + Date.now();
    const newTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'deposit',
      amount,
      status: 'completed',
      paymentMethod: `Paystack (${channel})`,
      accountDetails: `Paystack Ref: ${reference}`,
      gatewayReference: reference,
      gatewayChannel: channel,
      createdAt: new Date().toISOString(),
      description: `Automated Paystack Deposit of ₦${amount.toLocaleString()} via ${channel}`
    };

    setTransactions(prev => [newTx, ...prev]);

    // Instantly credit user balance cleanly
    const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance + amount };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    setSuccessMsg(`⚡ Instant Automated Deposit Approved! ₦${amount.toLocaleString()} has been credited to your wallet via Paystack (${channel}).`);
  };

  const submitWithdrawal = (amount: number, accountDetails: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (currentUser.isDeactivated) {
      setErrorMsg('Your account has been deactivated. Withdrawals cannot be processed.');
      return false;
    }

    if (settings.pauseWithdrawals) {
      setErrorMsg('Withdrawal Restored Limit: Withdrawals are currently paused by the administrator for regular system balance checks. Please check back later.');
      return false;
    }

    if (amount < settings.minWithdrawal) {
      setErrorMsg(`Minimum withdrawal limit is ₦${settings.minWithdrawal.toLocaleString()}`);
      return false;
    }

    if (amount > settings.maxWithdrawal) {
      setErrorMsg(`Maximum single withdrawal limit is ₦${settings.maxWithdrawal.toLocaleString()}`);
      return false;
    }

    if (currentUser.walletBalance < amount) {
      setErrorMsg('Insufficient wallet balance.');
      return false;
    }

    if (!accountDetails.trim()) {
      setErrorMsg('Bank account details are required.');
      return false;
    }

    // Deduct immediately on request for safety
    const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance - amount };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    const txId = 'tx_' + Date.now();

    const newTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdrawal',
      amount,
      status: 'pending',
      accountDetails,
      createdAt: new Date().toISOString(),
      description: `Manual Bank Withdrawal of ₦${amount.toLocaleString()} to: ${accountDetails}`
    };

    setTransactions(prev => [newTx, ...prev]);
    setSuccessMsg(`Withdrawal request of ₦${amount.toLocaleString()} submitted. Our finance team will review and disburse to ${accountDetails} within 1-24 hours.`);
    return true;
  };

  const purchaseInvestment = (planId: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (currentUser.isDeactivated) {
      setErrorMsg('Your account has been deactivated. Plan purchases are restricted.');
      return false;
    }

    if (settings.pauseInvestments) {
      setErrorMsg('Investment Notice: Initiating new investment plans is currently paused by the administrator. Existing plans will continue to yield returns as normal.');
      return false;
    }

    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      setErrorMsg('Selected investment plan is invalid.');
      return false;
    }

    if (currentUser.walletBalance < plan.cost) {
      setErrorMsg(`Insufficient balance. Plan cost is ₦${plan.cost.toLocaleString()}. Your balance: ₦${currentUser.walletBalance.toLocaleString()}`);
      return false;
    }

    // Deduct balance cleanly
    const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance - plan.cost };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    const isMkt = currentUser.isMarketingAccount === true;

    // Create Investment record
    const invId = 'inv_' + Date.now();
    const nextPayout = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newInv: UserInvestment = {
      id: invId,
      userId: currentUser.id,
      userName: currentUser.name,
      planId: plan.id,
      planName: plan.name,
      cost: plan.cost,
      weeklyPayout: plan.weeklyPayout,
      totalReturns: plan.totalReturns,
      weeksPaid: 0,
      totalWeeks: plan.weeksDuration,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextPayoutDate: nextPayout,
      autoReinvest: false,
      isMarketing: isMkt
    };

    // Log internally
    const logTx: Transaction = {
      id: 'tx_inv_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdrawal', // Recorded transaction in history
      amount: plan.cost,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: isMkt 
        ? `[Marketing Demo] Purchased ${plan.name} (₦${plan.cost.toLocaleString()})`
        : `Purchased ${plan.name} (₦${plan.cost.toLocaleString()})`,
      isMarketing: isMkt
    };

    setInvestments(prev => [newInv, ...prev]);
    setTransactions(prev => [logTx, ...prev]);
    setSuccessMsg(`Congratulations! You have successfully acquired ${plan.name}. First weekly payout due in 7 days.`);

    triggerLiveActivity({
      type: 'purchase',
      title: `${currentUser.name}`,
      message: `Just activated ${plan.name} (₦${plan.cost.toLocaleString()})`,
      amount: plan.cost,
      timeAgo: 'Just now',
      location: 'Verified Investor',
      iconType: 'investment',
      avatarInitials: currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    });

    return true;
  };

  const topUpAndPurchaseInvestment = (planId: string, topUpAmount: number, reference?: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (settings.pauseInvestments) {
      setErrorMsg('Investment Notice: Initiating new investment plans is currently paused by the administrator.');
      return false;
    }

    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      setErrorMsg('Selected investment plan is invalid.');
      return false;
    }

    const requiredTopUp = Math.max(0, topUpAmount);
    const totalAvailable = currentUser.walletBalance + requiredTopUp;

    if (totalAvailable < plan.cost) {
      setErrorMsg(`Insufficient funds. Plan cost is ₦${plan.cost.toLocaleString()}, total available is ₦${totalAvailable.toLocaleString()}.`);
      return false;
    }

    const newBalance = totalAvailable - plan.cost;
    const updatedUser = { ...currentUser, walletBalance: newBalance };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    const newTransactionsList: Transaction[] = [];

    // 1. Log the completed deposit transaction if top-up occurred
    if (requiredTopUp > 0) {
      const depTxId = 'tx_dep_' + Date.now();
      const depTx: Transaction = {
        id: depTxId,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'deposit',
        amount: requiredTopUp,
        status: 'completed',
        paymentMethod: 'Paystack (card) - Quick Fund',
        accountDetails: reference ? `Ref: ${reference}` : 'Instant Wallet Top-up',
        gatewayReference: reference || 'ref_' + Date.now(),
        gatewayChannel: 'card',
        createdAt: new Date().toISOString(),
        description: `Automated Paystack Deposit of ₦${requiredTopUp.toLocaleString()} via card`
      };
      newTransactionsList.push(depTx);
    }

    // 2. Log the investment purchase transaction
    const isMkt = currentUser.isMarketingAccount === true;
    const invTxId = 'tx_inv_' + (Date.now() + 1);
    const invTx: Transaction = {
      id: invTxId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdrawal',
      amount: plan.cost,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: isMkt 
        ? `[Marketing Demo] Purchased ${plan.name} (₦${plan.cost.toLocaleString()})`
        : `Purchased ${plan.name} (₦${plan.cost.toLocaleString()})`,
      isMarketing: isMkt
    };
    newTransactionsList.push(invTx);

    setTransactions(prev => [...newTransactionsList, ...prev]);

    // 3. Create Investment record
    const invId = 'inv_' + Date.now();
    const nextPayout = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newInv: UserInvestment = {
      id: invId,
      userId: currentUser.id,
      userName: currentUser.name,
      planId: plan.id,
      planName: plan.name,
      cost: plan.cost,
      weeklyPayout: plan.weeklyPayout,
      totalReturns: plan.totalReturns,
      weeksPaid: 0,
      totalWeeks: plan.weeksDuration,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextPayoutDate: nextPayout,
      autoReinvest: false,
      isMarketing: isMkt
    };

    setInvestments(prev => [newInv, ...prev]);
    setSuccessMsg(`🎉 Success! ₦${requiredTopUp.toLocaleString()} funded and ${plan.name} activated successfully.`);

    triggerLiveActivity({
      type: 'purchase',
      title: `${currentUser.name}`,
      message: `Funded & activated ${plan.name} (₦${plan.cost.toLocaleString()})`,
      amount: plan.cost,
      timeAgo: 'Just now',
      location: 'Verified Investor',
      iconType: 'investment',
      avatarInitials: currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    });

    return true;
  };

  const processSingleInvestmentPayout = (invId: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    const inv = investments.find(i => i.id === invId && i.userId === currentUser.id);
    if (!inv) {
      setErrorMsg('Active investment plan not found.');
      return false;
    }

    if (inv.status === 'completed' || inv.weeksPaid >= inv.totalWeeks) {
      setErrorMsg('This investment plan has already completed all scheduled weekly payouts.');
      return false;
    }

    // Payouts button can only be active on the last minute of the countdown not before
    if (inv.nextPayoutDate) {
      const remainingMs = new Date(inv.nextPayoutDate).getTime() - Date.now();
      if (remainingMs > 60 * 1000) {
        setErrorMsg('Payout button can only be active on the last minute of the countdown.');
        return false;
      }
    }

    const nextWeeksPaid = inv.weeksPaid + 1;
    const payoutAmount = inv.weeklyPayout;
    const isCompleted = nextWeeksPaid === inv.totalWeeks;
    const updatedBalance = currentUser.walletBalance + payoutAmount;

    // 1. Credit User
    const updatedUser = { ...currentUser, walletBalance: updatedBalance };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // 2. Update Investment
    const nextPayout = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    let updatedInv: UserInvestment;
    if (isCompleted && inv.autoReinvest) {
      updatedInv = {
        ...inv,
        weeksPaid: 0,
        status: 'active',
        lastPayoutDate: new Date().toISOString(),
        nextPayoutDate: nextPayout
      };
      setSuccessMsg(`₦${payoutAmount.toLocaleString()} weekly payout credited! ${inv.planName} has automatically rolled over into a new 4-week compounding cycle.`);
    } else {
      updatedInv = {
        ...inv,
        weeksPaid: nextWeeksPaid,
        status: isCompleted ? 'completed' : 'active',
        lastPayoutDate: new Date().toISOString(),
        nextPayoutDate: isCompleted ? undefined : nextPayout
      };
    }
    setInvestments(prev => prev.map(i => i.id === invId ? updatedInv : i));

    // 3. Create Transaction
    const payoutTxId = 'tx_payout_' + Date.now() + '_' + inv.id;
    const logTx: Transaction = {
      id: payoutTxId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'payout',
      amount: payoutAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Weekly payout: ${inv.planName} (Week ${nextWeeksPaid}/${inv.totalWeeks})`
    };
    setTransactions(prev => [logTx, ...prev]);

    // 4. Trigger slide-in notification toast
    triggerPayoutToast({
      planName: inv.planName,
      amount: payoutAmount,
      weeksPaid: nextWeeksPaid,
      totalWeeks: inv.totalWeeks,
      walletBalance: updatedBalance,
      type: 'payout'
    });

    // 5. If investor was referred, credit sponsor 7.5% bonus
    if (currentUser.referredByCode) {
      const sponsorUser = users.find(u => u.referralCode === currentUser.referredByCode);
      if (sponsorUser) {
        const bonusAmount = payoutAmount * 0.075;
        const updatedSponsorBal = sponsorUser.walletBalance + bonusAmount;
        setUsers(prev => prev.map(u => u.id === sponsorUser.id ? { ...u, walletBalance: updatedSponsorBal } : u));
        
        const bonusTxId = 'tx_ref_bonus_' + Date.now() + '_' + inv.id;
        const refTx: Transaction = {
          id: bonusTxId,
          userId: sponsorUser.id,
          userName: sponsorUser.name,
          type: 'referral_bonus',
          amount: bonusAmount,
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: `7.5% Referral bonus from ${currentUser.name}'s ${inv.planName} weekly payout`
        };
        setTransactions(prev => [refTx, ...prev]);
      }
    }

    setSuccessMsg(`₦${payoutAmount.toLocaleString()} weekly yield credited directly to your wallet!`);
    return true;
  };

  const toggleAutoReinvest = (investmentId: string) => {
    setInvestments(prev => prev.map(inv => {
      if (inv.id === investmentId) {
        const nextState = !inv.autoReinvest;
        setSuccessMsg(
          nextState 
            ? `Auto-Compounding activated for ${inv.planName}. Principal will automatically roll over upon maturity.`
            : `Auto-Compounding disabled for ${inv.planName}. Funds will be released to your wallet upon maturity.`
        );
        return { ...inv, autoReinvest: nextState };
      }
      return inv;
    }));
  };

  const submitKyc = (fullName: string, idType: string, idNumber: string) => {
    clearMessages();
    if (!currentUser) return;

    if (!fullName.trim() || !idType || !idNumber.trim()) {
      setErrorMsg('All KYC details are required.');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated: User = {
          ...u,
          kycStatus: 'pending',
          kycDetails: { fullName, idType, idNumber }
        };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    setSuccessMsg('KYC documents submitted. Treasure Homes compliance team will review shortly.');
  };

  // Admin approval workflow with optional manual amount adjustment to match verified bank receipt
  const approveDeposit = (txId: string, adjustedAmount?: number) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'deposit' || tx.status !== 'pending') return;

    // Use adjusted amount if valid positive number provided, otherwise use original claim
    const finalAmount = (typeof adjustedAmount === 'number' && adjustedAmount > 0) ? adjustedAmount : tx.amount;
    const wasAdjusted = finalAmount !== tx.amount;

    // Update transaction
    setTransactions(prev => prev.map(t => t.id === txId ? { 
      ...t, 
      amount: finalAmount,
      status: 'completed',
      description: wasAdjusted
        ? `${t.description || 'Bank Transfer Deposit'} (Reconciled from ₦${tx.amount.toLocaleString()} to ₦${finalAmount.toLocaleString()})`
        : t.description
    } : t));

    // Credit user wallet with verified receipt amount
    setUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        const updated = { ...u, walletBalance: u.walletBalance + finalAmount };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    if (wasAdjusted) {
      setSuccessMsg(`Approved deposit for ${tx.userName}. Credited reconciled bank amount of ₦${finalAmount.toLocaleString()} (adjusted from original ₦${tx.amount.toLocaleString()}).`);
    } else {
      setSuccessMsg(`Approved deposit of ₦${finalAmount.toLocaleString()} for ${tx.userName}.`);
    }

    triggerLiveActivity({
      type: 'deposit',
      title: `${tx.userName}`,
      message: `Deposit of ₦${finalAmount.toLocaleString()} verified & credited to wallet`,
      amount: finalAmount,
      timeAgo: 'Just now',
      location: 'Treasure Homes Vault',
      iconType: 'deposit',
      avatarInitials: tx.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    });
  };

  const rejectDeposit = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'deposit' || tx.status !== 'pending') return;

    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'rejected' } : t));
    setSuccessMsg(`Rejected deposit of ₦${tx.amount.toLocaleString()} for ${tx.userName}.`);
  };

  const approveWithdrawal = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') return;

    setTransactions(prev => prev.map(t => t.id === txId ? { 
      ...t, 
      status: 'completed',
      description: `${t.description} (Manually Disbursed by Finance Admin)`
    } : t));

    setSuccessMsg(`Approved and marked withdrawal of ₦${tx.amount.toLocaleString()} as disbursed to ${tx.accountDetails} for ${tx.userName}.`);

    triggerLiveActivity({
      type: 'payout',
      title: `${tx.userName}`,
      message: `Withdrew ₦${tx.amount.toLocaleString()} to ${tx.accountDetails || 'Bank'}`,
      amount: tx.amount,
      timeAgo: 'Just now',
      location: 'Bank Transfer Cleared',
      iconType: 'payout',
      avatarInitials: tx.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    });
  };

  const rejectWithdrawal = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') return;

    // Refund wallet balance!
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'rejected' } : t));
    setUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        const updated = { ...u, walletBalance: u.walletBalance + tx.amount };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    setSuccessMsg(`Rejected and refunded withdrawal of ₦${tx.amount.toLocaleString()} for ${tx.userName}.`);
  };

  const reviewKyc = (userId: string, approve: boolean) => {
    clearMessages();
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated: User = {
          ...u,
          kycStatus: approve ? 'verified' : 'rejected'
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    if (approve && target) {
      triggerLiveActivity({
        type: 'kyc',
        title: `${target.name}`,
        message: `KYC Identity Verified • Priority Investor Status`,
        timeAgo: 'Just now',
        location: 'Nigeria',
        iconType: 'verified',
        avatarInitials: target.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      });
    }

    setSuccessMsg(`KYC verification ${approve ? 'APPROVED' : 'REJECTED'} for selected user.`);
  };

  // Daily Task Calculation Helpers (Strictly West Africa Time - WAT / UTC+1)
  const getCurrentDateStr = (): string => {
    const d = new Date(Date.now() + virtualDayOffset * 86400000);
    return getWatDateString(d);
  };

  const getYesterdayDateStr = (): string => {
    const d = new Date(Date.now() + virtualDayOffset * 86400000);
    return getWatYesterdayString(d);
  };

  const virtualDate = getCurrentDateStr();

  // Payout Day Detection: In West Africa Time (WAT), payouts are strictly on Fridays (day 5)
  const isPayoutDay = (() => {
    const d = new Date(Date.now() + virtualDayOffset * 86400000);
    const wat = getWatDate(d);
    return wat.getDay() === 5;
  })();

  const getUserActiveWeeklyPayout = (userId: string): number => {
    return investments
      .filter(i => i.userId === userId && i.status === 'active')
      .reduce((sum, i) => sum + i.weeklyPayout, 0);
  };

  const getUserDailyPool = (userId: string): number => {
    const activeWeekly = getUserActiveWeeklyPayout(userId);
    if (activeWeekly > 0) {
      const rate = settings.dailyTaskBonusRate ?? 0.05;
      return Math.round(activeWeekly * rate);
    }
    return settings.dailyTaskBaseReward ?? 200;
  };

  const getUserDailyTaskReward = (userId: string, task: DailyTask): number => {
    if (task.fixedReward) {
      return task.fixedReward;
    }
    const pool = getUserDailyPool(userId);
    return Math.max(50, Math.round(pool * (task.rewardShare || 0.2)));
  };

  const getUserProgress = (userId: string): UserDailyProgress => {
    const today = getCurrentDateStr();
    const yesterday = getYesterdayDateStr();
    const existing = userDailyProgress[userId];

    if (!existing || existing.currentDate !== today) {
      let currentStreak = existing ? existing.streakCount : 0;
      // Genuine Consecutive Attendance Check:
      // If the last completed attendance was NOT yesterday and NOT today,
      // the user skipped a day -> streak genuinely resets to 0 (becomes Day 1 on next check-in)
      if (existing?.lastCompletedDate && existing.lastCompletedDate !== yesterday && existing.lastCompletedDate !== today) {
        currentStreak = 0;
      }

      return {
        userId,
        currentDate: today,
        completedTaskIds: [],
        pendingSubmissionTaskIds: existing?.pendingSubmissionTaskIds || [],
        streakCount: currentStreak,
        lastCompletedDate: existing?.lastCompletedDate,
        streakBonusClaimedDate: existing?.streakBonusClaimedDate,
        pollAnswers: existing?.pollAnswers || {}
      };
    }
    return existing;
  };

  // Instant Task Completion with Live In-App Verification
  const completeInstantTask = (taskId: string, answerIndex?: number, isAdBoosted?: boolean): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (!settings.dailyTaskEnabled) {
      setErrorMsg('Daily Tasks are temporarily disabled in system controls.');
      return false;
    }

    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) {
      setErrorMsg('Task not found.');
      return false;
    }

    const today = getCurrentDateStr();
    const yesterday = getYesterdayDateStr();
    const progress = getUserProgress(currentUser.id);

    if (progress.completedTaskIds.includes(taskId)) {
      setErrorMsg('You have already completed and claimed this quest today!');
      return false;
    }

    // 1. Real In-App Account Verification Checks
    if (taskId === 'task_active_portfolio') {
      const hasActive = investments.some(i => i.userId === currentUser.id && i.status === 'active');
      if (!hasActive) {
        setErrorMsg('Active Investment Required! You must hold at least one active investment plan to claim your Active Investor Reward.');
        return false;
      }
      const hasClaimedActiveRewardBefore = transactions.some(t => t.userId === currentUser.id && (t.description?.includes('Active Investor') || t.description?.includes('Active Portfolio')));
      if (hasClaimedActiveRewardBefore) {
        setErrorMsg('You have already claimed your one-time ₦300 Active Investor Reward.');
        return false;
      }
    }

    if (taskId === 'task_auto_reinvest') {
      const hasAutoCompounding = investments.some(i => i.userId === currentUser.id && i.status === 'active' && i.autoReinvest === true);
      if (!hasAutoCompounding) {
        setErrorMsg('Auto-Compounding Required! Enable Auto-Compounding on at least one of your active investment plans to claim this bonus.');
        return false;
      }
      const hasClaimedReinvestBefore = transactions.some(t => t.userId === currentUser.id && (t.description?.includes('Auto-Renew') || t.description?.includes('Auto-Compounding')));
      if (hasClaimedReinvestBefore) {
        setErrorMsg('You have already claimed your one-time ₦250 Auto-Renew Bonus.');
        return false;
      }
    }

    if (taskId === 'task_kyc_bounty') {
      if (currentUser.kycStatus !== 'verified') {
        setErrorMsg('KYC Verification Required! Submit and receive approval for your government ID to claim the ₦1,000 KYC bounty.');
        return false;
      }
      const hasClaimedKycBefore = transactions.some(t => t.userId === currentUser.id && t.description?.includes('KYC Identity Verification Bounty'));
      if (hasClaimedKycBefore) {
        setErrorMsg('You have already claimed your one-time ₦1,000 KYC Verification Bounty.');
        return false;
      }
    }

    let rewardAmount = task.fixedReward || getUserDailyTaskReward(currentUser.id, task);
    if (isAdBoosted) {
      rewardAmount = rewardAmount * (settings.rewardedAdBonusMultiplier || 2);
    }

    // 1. Credit User Wallet
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + rewardAmount };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // 2. Create Transaction Log
    const txId = 'tx_task_' + Date.now();
    const taskTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_reward',
      amount: rewardAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: isAdBoosted 
        ? `Daily Quest Reward (2X Boosted): ${task.title}`
        : `Daily Quest Reward: ${task.title}`
    };
    setTransactions(prev => [taskTx, ...prev]);

    // 3. Update User Progress & Streak calculation
    const updatedCompleted = [...progress.completedTaskIds, taskId];
    const updatedBoosted = isAdBoosted 
      ? [...(progress.adBoostedTaskIds || []), taskId]
      : (progress.adBoostedTaskIds || []);
    
    let newStreak = progress.streakCount;
    let newLastCompletedDate = progress.lastCompletedDate;

    // Daily Attendance Streak Handling:
    if (taskId === 'task_daily_attendance') {
      if (progress.lastCompletedDate === yesterday) {
        // Consecutive day
        newStreak = (progress.streakCount || 0) + 1;
      } else {
        // Missed a day or first check-in -> genuinely resets to Day 1
        newStreak = 1;
      }
      newLastCompletedDate = today;
    }

    const updatedProg: UserDailyProgress = {
      ...progress,
      currentDate: today,
      completedTaskIds: updatedCompleted,
      adBoostedTaskIds: updatedBoosted,
      streakCount: newStreak,
      lastCompletedDate: newLastCompletedDate,
      pollAnswers: { ...progress.pollAnswers }
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: updatedProg
    }));

    if (taskId === 'task_daily_attendance' && newStreak === 7) {
      setSuccessMsg(`🎉 Day 7 Attendance Complete! Credited ₦${rewardAmount.toLocaleString()}. You have unlocked the ₦1,500 Unbroken Streak Milestone Bonus!`);
    } else {
      setSuccessMsg(`🎉 Quest Completed! Credited ₦${rewardAmount.toLocaleString()} to your available balance.`);
    }
    return true;
  };

  // Apply rewarded ad boost retroactively or immediately
  const applyRewardedAdBoost = (taskId: string): boolean => {
    if (!currentUser) return false;
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return false;

    const progress = getUserProgress(currentUser.id);
    if (!progress.completedTaskIds.includes(taskId)) return false;
    if (progress.adBoostedTaskIds?.includes(taskId)) {
      setErrorMsg('You have already applied the 2x Rewarded Ad boost to this task today.');
      return false;
    }

    const baseReward = getUserDailyTaskReward(currentUser.id, task);
    const bonusDifference = baseReward * ((settings.rewardedAdBonusMultiplier || 2) - 1);

    // Credit user wallet with the bonus difference
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + bonusDifference };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Log transaction
    const txId = 'tx_task_boost_' + Date.now();
    const boostTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_reward',
      amount: bonusDifference,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `2X Rewarded Ad Boost: ${task.title}`
    };
    setTransactions(prev => [boostTx, ...prev]);

    // Update progress
    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: {
        ...progress,
        adBoostedTaskIds: [...(progress.adBoostedTaskIds || []), taskId]
      }
    }));

    // Record sponsor revenue
    setSettings(prev => ({
      ...prev,
      estimatedAdRevenueTotal: (prev.estimatedAdRevenueTotal || 0) + 25
    }));

    setSuccessMsg(`⚡ 2X Ad Yield Boost Applied! Credited additional +₦${bonusDifference.toLocaleString()} to your balance.`);
    return true;
  };

  // Claim guest trial earnings when user registers or logs in
  const claimGuestTrialEarnings = (): number => {
    if (!currentUser) return 0;
    const guestStored = localStorage.getItem('pm_guest_trial_earnings');
    if (!guestStored) return 0;

    const guestAmount = Number(guestStored);
    if (guestAmount > 0) {
      // Credit to user balance
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          const updated = { ...u, walletBalance: u.walletBalance + guestAmount };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      }));

      // Log transaction
      const guestTx: Transaction = {
        id: 'tx_guest_claim_' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'task_reward',
        amount: guestAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: `Claimed Guest Trial Task Earnings (+₦${guestAmount.toLocaleString()})`
      };
      setTransactions(prev => [guestTx, ...prev]);

      localStorage.removeItem('pm_guest_trial_earnings');
      setSuccessMsg(`🎁 Welcome Bonus! Successfully transferred your ₦${guestAmount.toLocaleString()} guest trial earnings to your official investment wallet.`);
      return guestAmount;
    }
    return 0;
  };

  const recordAdImpression = (adRevenue: number) => {
    setSettings(prev => ({
      ...prev,
      estimatedAdRevenueTotal: (prev.estimatedAdRevenueTotal || 0) + adRevenue
    }));
  };

  // Task Submission (e.g., Social Share proof)
  const submitTaskProof = (taskId: string, proof: string): boolean => {
    clearMessages();
    if (!currentUser) {
      setErrorMsg('Please sign in to an active account before submitting advocacy proof.');
      return false;
    }

    if (!proof.trim()) {
      setErrorMsg('Please provide your post link, screenshot upload, or proof details.');
      return false;
    }

    const task = dailyTasks.find(t => t.id === taskId) || dailyTasks.find(t => t.category === 'social_share');
    const taskTitle = task ? task.title : 'Social Advocacy & Proof-of-Work Bounty';
    const taskIdToUse = task ? task.id : taskId;
    const rewardAmount = task?.fixedReward || 500;

    const today = getCurrentDateStr();
    const progress = getUserProgress(currentUser.id);

    const submission: TaskSubmission = {
      id: 'sub_' + Date.now(),
      taskId: taskIdToUse,
      taskTitle: taskTitle,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      proof: proof.trim(),
      rewardAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTaskSubmissions(prev => [submission, ...prev]);

    // Mark as pending in progress
    const updatedProg: UserDailyProgress = {
      ...progress,
      currentDate: today,
      pendingSubmissionTaskIds: Array.from(new Set([...progress.pendingSubmissionTaskIds, taskIdToUse]))
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: updatedProg
    }));

    setSuccessMsg(`🎉 Proof submitted successfully! The Admin Control Centre will audit your submission and credit ₦${rewardAmount.toLocaleString()} to your wallet upon approval.`);
    return true;
  };

  // Claim 7-day Streak Jackpot Bonus
  const claimStreakBonus = (): boolean => {
    clearMessages();
    if (!currentUser) return false;

    const today = getCurrentDateStr();
    const progress = getUserProgress(currentUser.id);

    if (progress.streakCount < 7) {
      setErrorMsg(`You need a 7-day streak to claim this bonus. Current streak: ${progress.streakCount}/7 days.`);
      return false;
    }

    if (progress.streakBonusClaimedDate === today) {
      setErrorMsg('You have already claimed your 7-day streak milestone for this cycle!');
      return false;
    }

    const streakBonusAmount = settings.dailyTaskStreakBonus || 1500;

    // Credit User Wallet
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + streakBonusAmount };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Log Transaction
    const streakTx: Transaction = {
      id: 'tx_streak_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_reward',
      amount: streakBonusAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `🔥 7-Day Consistency Streak Bonus (+₦${streakBonusAmount.toLocaleString()})`
    };
    setTransactions(prev => [streakTx, ...prev]);

    // Update Progress
    const updatedProg: UserDailyProgress = {
      ...progress,
      streakBonusClaimedDate: today,
      streakCount: 0 // Reset for next 7-day cycle
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: updatedProg
    }));

    setSuccessMsg(`🔥 Boom! 7-Day Consistency Streak Bonus of ₦${streakBonusAmount.toLocaleString()} credited to your balance!`);
    return true;
  };

  // Admin Task Submission Review Actions
  const approveTaskSubmission = (subId: string) => {
    clearMessages();
    const sub = taskSubmissions.find(s => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    // Update submission
    setTaskSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'approved', reviewedAt: new Date().toISOString() } : s));

    // Credit user wallet
    setUsers(prev => prev.map(u => {
      if (u.id === sub.userId) {
        const updated = { ...u, walletBalance: u.walletBalance + sub.rewardAmount };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    // Create Transaction
    const taskTx: Transaction = {
      id: 'tx_task_sub_' + Date.now(),
      userId: sub.userId,
      userName: sub.userName,
      type: 'task_reward',
      amount: sub.rewardAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Approved Task Reward: ${sub.taskTitle}`
    };
    setTransactions(prev => [taskTx, ...prev]);

    // Update user's progress
    const today = getCurrentDateStr();
    const targetProg = userDailyProgress[sub.userId] || {
      userId: sub.userId,
      currentDate: today,
      completedTaskIds: [],
      pendingSubmissionTaskIds: [],
      streakCount: 0
    };

    const updatedProg: UserDailyProgress = {
      ...targetProg,
      pendingSubmissionTaskIds: targetProg.pendingSubmissionTaskIds.filter(id => id !== sub.taskId),
      completedTaskIds: [...targetProg.completedTaskIds, sub.taskId]
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [sub.userId]: updatedProg
    }));

    setSuccessMsg(`Approved task submission from ${sub.userName} (+₦${sub.rewardAmount.toLocaleString()}).`);
  };

  const rejectTaskSubmission = (subId: string) => {
    clearMessages();
    const sub = taskSubmissions.find(s => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    setTaskSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'rejected', reviewedAt: new Date().toISOString() } : s));

    // Remove from pending in progress
    const targetProg = userDailyProgress[sub.userId];
    if (targetProg) {
      setUserDailyProgress(prev => ({
        ...prev,
        [sub.userId]: {
          ...targetProg,
          pendingSubmissionTaskIds: targetProg.pendingSubmissionTaskIds.filter(id => id !== sub.taskId)
        }
      }));
    }

    setSuccessMsg(`Rejected task submission for ${sub.userName}.`);
  };

  // Fast testing: Simulate next day (Midnight Reset & Liquidity Accretion)
  const simulateNextDay = () => {
    clearMessages();
    setVirtualDayOffset(prev => prev + 1);
    setSuccessMsg('Simulated next day! Daily tasks board has reset with fresh daily yield opportunities.');
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    clearMessages();
    setSettings(prev => ({ ...prev, ...newSettings }));
    setSuccessMsg('System settings updated successfully.');
  };

  // WEEKLY PAYOUT SIMULATOR - CRUCIAL FEATURE!
  const simulateWeek = () => {
    clearMessages();
    
    let payoutLog: string[] = [];
    let updatedUsers = [...users];
    let newTransactions: Transaction[] = [];
    let pendingToasts: PayoutToastData[] = [];

    const updatedInvestments = investments.map(inv => {
      if (inv.status === 'completed' || inv.weeksPaid >= inv.totalWeeks) {
        return inv;
      }

      const nextWeeksPaid = inv.weeksPaid + 1;
      const payoutAmount = inv.weeklyPayout;
      const isCompleted = nextWeeksPaid === inv.totalWeeks;

      // Credit the investor
      let newInvestorBal = 0;
      updatedUsers = updatedUsers.map(u => {
        if (u.id === inv.userId) {
          newInvestorBal = u.walletBalance + payoutAmount;
          return { ...u, walletBalance: newInvestorBal };
        }
        return u;
      });

      // If this investment belongs to the currently logged in user, trigger slide-in toast
      if (currentUser && currentUser.id === inv.userId) {
        pendingToasts.push({
          id: 'toast_payout_' + Date.now() + '_' + inv.id + '_' + Math.random().toString(36).substring(2, 6),
          planName: inv.planName,
          amount: payoutAmount,
          weeksPaid: nextWeeksPaid,
          totalWeeks: inv.totalWeeks,
          walletBalance: newInvestorBal,
          type: 'payout',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // Create payout transaction
      const payoutTxId = 'tx_payout_' + Date.now() + '_' + inv.id;
      newTransactions.push({
        id: payoutTxId,
        userId: inv.userId,
        userName: inv.userName,
        type: 'payout',
        amount: payoutAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: `Weekly payout: ${inv.planName} (Week ${nextWeeksPaid}/${inv.totalWeeks})`
      });

      payoutLog.push(`Credited ₦${payoutAmount.toLocaleString()} to ${inv.userName} (Week ${nextWeeksPaid}/${inv.totalWeeks})`);

      // REFERRAL BONUS SYSTEM: "Users earn 7.5% of their referral's weekly payout."
      const investorUser = users.find(u => u.id === inv.userId);
      if (investorUser && investorUser.referredByCode) {
        const sponsorUser = updatedUsers.find(u => u.referralCode === investorUser.referredByCode);
        if (sponsorUser) {
          const bonusAmount = payoutAmount * 0.075;
          let newSponsorBal = 0;
          
          // Credit the sponsor
          updatedUsers = updatedUsers.map(u => {
            if (u.id === sponsorUser.id) {
              newSponsorBal = u.walletBalance + bonusAmount;
              return { ...u, walletBalance: newSponsorBal };
            }
            return u;
          });

          // If current logged-in user is the sponsor, trigger referral bonus slide-in toast
          if (currentUser && currentUser.id === sponsorUser.id) {
            pendingToasts.push({
              id: 'toast_ref_' + Date.now() + '_' + inv.id + '_' + Math.random().toString(36).substring(2, 6),
              planName: `7.5% Referral Commission (${investorUser.name})`,
              amount: bonusAmount,
              weeksPaid: nextWeeksPaid,
              totalWeeks: inv.totalWeeks,
              walletBalance: newSponsorBal,
              type: 'referral_bonus',
              sourceUserName: investorUser.name,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }

          // Create referral bonus transaction
          const bonusTxId = 'tx_ref_bonus_' + Date.now() + '_' + inv.id;
          newTransactions.push({
            id: bonusTxId,
            userId: sponsorUser.id,
            userName: sponsorUser.name,
            type: 'referral_bonus',
            amount: bonusAmount,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `7.5% Referral bonus from ${investorUser.name}'s ${inv.planName} weekly payout`
          });

          payoutLog.push(`Ref Bonus: Credited ₦${bonusAmount.toLocaleString()} to sponsor ${sponsorUser.name}`);
        }
      }

      const nextPayout = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      if (isCompleted && inv.autoReinvest) {
        payoutLog.push(`🔄 Auto-Compounding: ${inv.planName} for ${inv.userName} completed 4 weeks and auto-rolled over into a new cycle!`);
        return {
          ...inv,
          weeksPaid: 0,
          status: 'active',
          lastPayoutDate: new Date().toISOString(),
          nextPayoutDate: nextPayout
        };
      }

      return {
        ...inv,
        weeksPaid: nextWeeksPaid,
        status: isCompleted ? 'completed' : 'active',
        lastPayoutDate: new Date().toISOString(),
        nextPayoutDate: isCompleted ? undefined : nextPayout
      };
    });

    setUsers(updatedUsers);
    setInvestments(updatedInvestments);
    setTransactions(prev => [...newTransactions, ...prev]);
    setCurrentWeek(prev => prev + 1);

    // Sync current user context state
    if (currentUser) {
      const refreshedCur = updatedUsers.find(u => u.id === currentUser.id);
      if (refreshedCur) setCurrentUser(refreshedCur);
    }

    if (pendingToasts.length > 0) {
      setPayoutToasts(prev => [...pendingToasts, ...prev]);
      playPayoutChime();
    }

    if (payoutLog.length > 0) {
      setSuccessMsg(`Week ${currentWeek + 1} payout processed! Advanced payout cycle. ${payoutLog.length} active plans received yields.`);
    } else {
      setSuccessMsg(`Week ${currentWeek + 1} payout processed. No active investments received payouts this week.`);
    }
  };

  const resetAll = () => {
    localStorage.removeItem('pm_prod_users_v1');
    localStorage.removeItem('pm_prod_current_user_v1');
    localStorage.removeItem('pm_prod_investments_v1');
    localStorage.removeItem('pm_prod_transactions_v1');
    localStorage.removeItem('pm_prod_settings_v1');
    localStorage.removeItem('pm_prod_current_week_v1');
    localStorage.removeItem('pm_prod_task_submissions_v1');
    localStorage.removeItem('pm_prod_daily_progress_v1');
    localStorage.removeItem('pm_prod_virtual_day_v1');

    setUsers(getSeedUsers());
    setCurrentUser(null);
    setInvestments(SEED_INVESTMENTS);
    setTransactions(SEED_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setTaskSubmissions([]);
    setUserDailyProgress({});
    setVirtualDayOffset(0);
    setCurrentWeek(1);
    clearMessages();
    setSuccessMsg('Platform reset to original production database state.');
  };

  return (
    <StateContext.Provider value={{
      users,
      currentUser,
      investments,
      transactions,
      settings,
      currentWeek,
      errorMsg,
      successMsg,
      supabaseStatus,
      isDbLoaded,
      lastSyncedAt,
      getSupabaseConfig,
      saveSupabaseCredentials,
      refreshFromSupabase,
      dailyTasks,
      taskSubmissions,
      userDailyProgress,
      virtualDate,
      getUserActiveWeeklyPayout,
      getUserDailyPool,
      getUserDailyTaskReward,
      getUserProgress,
      register,
      login,
      requestPasswordReset,
      confirmPasswordReset,
      logout,
      switchUser,
      submitDeposit,
      processAutomatedDeposit,
      submitWithdrawal,
      purchaseInvestment,
      topUpAndPurchaseInvestment,
      toggleAutoReinvest,
      submitKyc,
      completeInstantTask,
      applyRewardedAdBoost,
      submitTaskProof,
      claimStreakBonus,
      claimGuestTrialEarnings,
      adminCreateUser,
      adminToggleUserStatus,
      adminUpdateUser,
      adminTopUpMarketingWallet,
      adminToggleMarketingStatus,
      approveDeposit,
      rejectDeposit,
      approveWithdrawal,
      rejectWithdrawal,
      reviewKyc,
      updateSettings,
      approveTaskSubmission,
      rejectTaskSubmission,
      recordAdImpression,
      payoutToasts,
      dismissPayoutToast,
      triggerPayoutToast,
      processSingleInvestmentPayout,
      liveLiquidityReserve,
      formatLiquidityReserve,
      activeLiveActivity,
      dismissLiveActivity,
      triggerLiveActivity,
      isPayoutDay,
      simulateWeek,
      simulateNextDay,
      resetAll,
      clearMessages
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
