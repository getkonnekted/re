import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  FileText, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Clock, 
  CreditCard,
  Building,
  UploadCloud,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Info,
  Sparkles,
  Flame,
  Award,
  ExternalLink,
  Zap,
  Menu,
  X,
  Loader2,
  RotateCw,
  PlusCircle,
  ArrowRight,
  Link2,
  Check
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { INVESTMENT_PLANS, InvestmentPlan } from '../types';
import { DailyTasksHub } from './DailyTasksHub';
import { NIGERIAN_BANKS, resolveNigerianAccount } from '../lib/paystack';
import { PmLogo } from './PmLogo';
import { PayoutCountdown } from './PayoutCountdown';
import { InvestmentPayoutButton } from './InvestmentPayoutButton';
import { CommunityBanner } from './CommunityBanner';

export const UserDashboard: React.FC = () => {
  const { 
    currentUser, 
    investments, 
    transactions, 
    users, 
    settings,
    dailyTasks,
    getUserProgress,
    getUserDailyPool,
    getUserActiveWeeklyPayout,
    submitDeposit, 
    processAutomatedDeposit,
    submitWithdrawal, 
    purchaseInvestment, 
    topUpAndPurchaseInvestment,
    toggleAutoReinvest,
    submitKyc,
    processSingleInvestmentPayout,
    successMsg,
    errorMsg,
    clearMessages,
    formatLiquidityReserve
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'invest' | 'tasks' | 'finance' | 'referrals' | 'kyc'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Dashboard Menu Items for Hamburger & Tab Navigation
  const menuItems: {
    id: 'overview' | 'invest' | 'tasks' | 'finance' | 'referrals' | 'kyc';
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Your wallet, weekly profits & active plans',
      icon: TrendingUp,
    },
    {
      id: 'invest',
      label: 'Buy Plans',
      description: 'Choose a property plan starting from ₦15,000',
      icon: Sparkles,
      badge: <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">From ₦15k</span>
    },
    {
      id: 'tasks',
      label: 'Daily Tasks',
      description: 'Check in daily, share on WhatsApp & earn bonuses',
      icon: Flame,
      badge: currentUser && (
        <span className="bg-amber-500/20 text-amber-900 border border-amber-400/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
          🔥 {getUserProgress(currentUser.id).streakCount}d
        </span>
      )
    },
    {
      id: 'finance',
      label: 'Deposit & Withdraw',
      description: 'Add money to wallet or send cash to your bank',
      icon: Wallet,
    },
    {
      id: 'referrals',
      label: 'Referral 7.5%',
      description: 'Invite friends and earn 7.5% every Friday',
      icon: Users,
      badge: <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">7.5%</span>
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      description: 'Verify your ID for fast bank withdrawals',
      icon: FileText,
      badge: currentUser?.kycStatus === 'verified' ? (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Verified</span>
      ) : currentUser?.kycStatus === 'pending' ? (
        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Pending</span>
      ) : (
        <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full">Unverified</span>
      )
    }
  ];
  
  // Manual Reserve Deposit state
  const [depAmount, setDepAmount] = useState<string>('');
  const [depMethod, setDepMethod] = useState<string>('Bank Transfer (Treasure Homes Reserve)');
  const [depDetails, setDepDetails] = useState<string>('');
  
  // Real Receipt Upload states
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Withdrawal state
  const [withAmount, setWithAmount] = useState<string>('');
  const [withDetails, setWithDetails] = useState<string>('');
  const [selectedBankCode, setSelectedBankCode] = useState<string>('999992'); // Default OPay
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [accountResolution, setAccountResolution] = useState<{ verified: boolean; name: string } | null>(null);

  // Auto-resolve Nigerian bank account whenever account number or bank changes
  useEffect(() => {
    const cleaned = bankAccountNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      const res = resolveNigerianAccount(cleaned, selectedBankCode, currentUser?.name);
      if (res.success && res.accountName) {
        setAccountResolution({ verified: true, name: res.accountName });
        const selectedBank = NIGERIAN_BANKS.find(b => b.code === selectedBankCode);
        setWithDetails(`${selectedBank?.name || 'Bank'} - ${cleaned} - ${res.accountName}`);
      } else {
        setAccountResolution(null);
      }
    } else {
      setAccountResolution(null);
    }
  }, [bankAccountNumber, selectedBankCode, currentUser?.name]);

  // KYC state
  const [kycName, setKycName] = useState<string>(currentUser?.name || '');
  const [kycType, setKycType] = useState<string>('National ID Card');
  const [kycNumber, setKycNumber] = useState<string>('');

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAccount2, setCopiedAccount2] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const faqItems = [
    {
      question: "How do I add money to my wallet?",
      answer: "Go to the 'Deposit & Withdraw' tab, copy our official bank account details, and make a transfer from your bank app. Then upload your transfer receipt. Your wallet will be credited within 10 to 30 minutes."
    },
    {
      question: "How do weekly Friday payouts work?",
      answer: "Every property plan runs for 4 weeks. Every Friday, your weekly cash profit is paid straight into your wallet. You can withdraw it to your bank account anytime."
    },
    {
      question: "How do I withdraw cash to my bank?",
      answer: "Go to 'Deposit & Withdraw', enter the amount you want to withdraw, and choose your bank account. Your money will arrive in your bank account within a few hours."
    },
    {
      question: "Is my money safe?",
      answer: `Yes. PM Invest is backed by real building projects and maintains a dedicated cash reserve of over ₦${formatLiquidityReserve(0)} in bank reserve to ensure every payout is made on time.`
    }
  ];

  if (!currentUser) return null;

  // Calculate stats
  const userInvestments = investments.filter(i => i.userId === currentUser.id);
  const activeInvestments = userInvestments.filter(i => i.status === 'active');
  const completedInvestments = userInvestments.filter(i => i.status === 'completed');
  
  const totalInvested = userInvestments.reduce((sum, i) => sum + i.cost, 0);
  const totalEarnedPayouts = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReferralBonus = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'referral_bonus' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'withdrawal' && t.status === 'pending');

  // Real Investor status: Paid to top up wallet (not marketing, deposit completed)
  const userPaidDeposits = transactions.filter(t => 
    t.userId === currentUser.id && 
    t.type === 'deposit' && 
    t.status === 'completed' && 
    !t.isMarketing
  );
  const totalPaidTopup = userPaidDeposits.reduce((sum, t) => sum + t.amount, 0);
  const isRealInvestor = totalPaidTopup > 0;

  const referredUsers = users.filter(u => u.referredByCode === currentUser.referralCode);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
    const link = `${origin}/?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 0) return;
    const proofToSubmit = receiptUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60';
    submitDeposit(amt, depMethod, depDetails, proofToSubmit);
    setDepAmount('');
    setDepDetails('');
    setReceiptFile(null);
    setReceiptUrl('');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withAmount);
    if (isNaN(amt) || amt <= 0) return;

    let targetDetails = withDetails;
    if (!targetDetails.trim() && bankAccountNumber.trim()) {
      const selectedBank = NIGERIAN_BANKS.find(b => b.code === selectedBankCode);
      targetDetails = `${selectedBank?.name || 'Bank'} - ${bankAccountNumber} - ${accountResolution?.name || currentUser?.name || 'Account Holder'}`;
    }

    const success = submitWithdrawal(amt, targetDetails);
    if (success) {
      setWithAmount('');
      setWithDetails('');
      setBankAccountNumber('');
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(kycName, kycType, kycNumber);
  };

  const [investingPlanId, setInvestingPlanId] = useState<string | null>(null);
  const [justActivatedPlanId, setJustActivatedPlanId] = useState<string | null>(null);
  const [activatedPlanModal, setActivatedPlanModal] = useState<{ plan: InvestmentPlan; nextPayoutDate: string } | null>(null);

  const handlePurchase = (plan: InvestmentPlan) => {
    if (investingPlanId) return; // Prevent double-triggering while animating
    setInvestingPlanId(plan.id);

    setTimeout(() => {
      const success = purchaseInvestment(plan.id);
      setInvestingPlanId(null);
      if (success) {
        setJustActivatedPlanId(plan.id);
        const nextDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        setActivatedPlanModal({ plan, nextPayoutDate: nextDate });
        setTimeout(() => {
          setJustActivatedPlanId(null);
        }, 3000);
      }
    }, 750);
  };

  return (
    <div className="w-full text-slate-800 p-1" id="user_dashboard_container">
      {/* Alert Banner for Global messages */}
      {successMsg && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-600 hover:text-emerald-800 text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-rose-600 hover:text-rose-800 text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {/* Deactivated Notice Banner */}
      {currentUser.isDeactivated && (
        <div className="mb-5 bg-rose-50 border-2 border-rose-300 text-rose-950 p-4 rounded-2xl flex items-start gap-3 text-xs shadow-sm animate-fadeIn">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-900">
              Account Deactivated by Administration
            </h4>
            <p className="text-rose-700 leading-relaxed font-medium">
              Your account has been placed on administrative hold. New plan purchases, deposit credits, and withdrawal requests are temporarily paused. Existing capital and recorded payouts remain intact. Please contact compliance or platform administration to resolve this hold.
            </p>
          </div>
        </div>
      )}

      {/* KYC Alert banner if unverified */}
      {currentUser.kycStatus === 'unverified' && (
        <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Please Verify Your ID</p>
              <p className="text-slate-600 mt-0.5">Verify your ID so you can withdraw money to your bank account anytime without delays.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('kyc')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-1.5 rounded-lg transition-colors self-start sm:self-auto shrink-0 text-xs shadow-sm"
            id="btn_kyc_alert_action"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Real Investor vs Unfunded Lead Status Callout */}
      {isRealInvestor ? (
        <div className="mb-5 bg-emerald-50/80 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase font-mono tracking-wider text-emerald-800">
                  VERIFIED REAL INVESTOR
                </span>
                <span className="bg-emerald-200/80 text-emerald-900 font-mono font-bold text-[10px] px-2 py-0.2 rounded-full">
                  ₦{totalPaidTopup.toLocaleString()} Paid Top-Up
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Your wallet is backed by completed real funds. Every Friday property yield will be credited to this balance.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg font-mono font-semibold self-start sm:self-auto shrink-0">
            TREASURE HOMES SECURED
          </span>
        </div>
      ) : (
        <div className="mb-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 font-bold font-mono">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wide text-amber-900">
                  UNFUNDED LEAD ACCOUNT
                </span>
                <span className="bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Awaiting First Deposit
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                Add money to your wallet to become a <strong className="text-emerald-700">Verified Real Investor</strong> and start receiving cash payouts in your bank every Friday.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setActiveTab('finance')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all self-start sm:self-auto shrink-0 shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
            id="btn_unfunded_lead_topup"
          >
            Top Up Wallet Now →
          </button>
        </div>
      )}

      {/* Official WhatsApp & Telegram Community Invitation Banner */}
      <CommunityBanner />

      {/* Responsive Hamburger Navigation Bar & Dropdown Drawer */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
            id="btn_dashboard_hamburger"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
            <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden xs:inline" />
          </button>

          {/* Current Active Section Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 text-xs font-bold truncate">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono hidden sm:inline">Active:</span>
            {(() => {
              const currentItem = menuItems.find(m => m.id === activeTab) || menuItems[0];
              const CurrentIcon = currentItem.icon;
              return (
                <div className="flex items-center gap-1.5 truncate">
                  <CurrentIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-900 font-extrabold truncate">{currentItem.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Desktop Navigation Tabs (visible on wide screens) */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 pl-3 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); clearMessages(); setIsMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-slate-100 text-slate-950 font-bold border border-slate-200 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id={`tab_desktop_${item.id}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile / Expanded Hamburger Drawer with clean quick-navigation cards */}
        {isMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
            <div className="px-1 mb-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <PmLogo className="w-5 h-5" />
                <span className="font-bold text-slate-700 uppercase tracking-wider">PM Invest Menus</span>
              </div>
              <span className="text-amber-600 font-semibold">{menuItems.length} Available</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                      clearMessages();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                      isActive 
                        ? 'bg-amber-50/70 border-amber-400 shadow-xs ring-1 ring-amber-400/30' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                    id={`menu_item_${item.id}`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-amber-500 text-slate-950 shadow-xs' 
                        : 'bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold ${isActive ? 'text-slate-950 font-extrabold' : 'text-slate-800'}`}>
                          {item.label}
                        </span>
                        {item.badge}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Wallet: <strong className="text-slate-900 font-mono font-bold">₦{currentUser?.walletBalance.toLocaleString()}</strong></span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] uppercase tracking-wider"
              >
                Close Menu ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Wallet Balance</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">₦{currentUser.walletBalance.toLocaleString()}</h3>
                <span className="text-[10px] text-amber-600 font-medium font-sans">Ready to withdraw to your bank</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Money in Properties</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  ₦{activeInvestments.reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-sans">{activeInvestments.length} Active Plans</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Total Profit Collected</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">₦{totalEarnedPayouts.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-400 font-sans">Paid into your wallet</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-amber-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Referral Bonus</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">₦{totalReferralBonus.toLocaleString()}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-sans">7.5% weekly bonus active</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Daily Task Quick Quest Snapshot */}
          {currentUser && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      🔥 {getUserProgress(currentUser.id).streakCount}-DAY CONSISTENCY STREAK
                    </span>
                    <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      {getUserProgress(currentUser.id).completedTaskIds.length}/{dailyTasks.length} Done Today
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Daily Cash Rewards &amp; Check-In
                  </h4>
                  <p className="text-xs text-slate-400">
                    Check in every day, share on WhatsApp, and collect extra cash in your wallet.
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setActiveTab('tasks'); clearMessages(); }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                id="btn_overview_jump_to_tasks"
              >
                <span>Go to Daily Tasks</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Investments section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div id="active_investments_section" className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                My Active Investments ({activeInvestments.length})
              </h3>
            </div>

            {activeInvestments.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No active investments found.</p>
                <p className="text-xs text-slate-500 mt-1">Go to the "Buy Plans" tab to purchase an investment plan starting at ₦15,000.</p>
                <button
                  onClick={() => setActiveTab('invest')}
                  className="mt-4 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Explore Plans
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInvestments.map((inv) => {
                  const percentComplete = (inv.weeksPaid / inv.totalWeeks) * 100;
                  return (
                    <div key={inv.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs">
                      {/* Brand background watermark */}
                      <div className="absolute right-2 top-2 opacity-10 pointer-events-none">
                        <Building className="w-20 h-20 text-slate-300" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">{inv.planName}</span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            ACTIVE
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-3 text-xs border-y border-slate-200 py-3">
                          <div>
                            <span className="text-slate-500 block font-light">Plan Cost</span>
                            <span className="text-sm font-bold text-slate-900">₦{inv.cost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block font-light">Total Returns</span>
                            <span className="text-sm font-bold text-amber-600">₦{inv.totalReturns.toLocaleString()}</span>
                          </div>
                          <div className="col-span-2 pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 block font-light">Paid Every Friday</span>
                            <span className="text-sm font-bold text-slate-900">₦{inv.weeklyPayout.toLocaleString()} / week</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="my-3">
                          <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-500">
                            <span>Plan Progress</span>
                            <span>Week {inv.weeksPaid} of {inv.totalWeeks} Paid</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentComplete}%` }}
                            />
                          </div>
                        </div>

                        {/* Live Payout Countdown Timer */}
                        <div className="my-2.5">
                          <PayoutCountdown targetDate={inv.nextPayoutDate} />
                        </div>

                        {/* Auto-Compounding Rollover Toggle */}
                        <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-xl p-2.5 my-2">
                          <div className="flex items-center gap-2">
                            <RotateCw className={`w-3.5 h-3.5 ${inv.autoReinvest ? 'text-amber-500 animate-spin-slow' : 'text-slate-400'}`} />
                            <div>
                              <span className="text-[11px] font-bold text-slate-800 block leading-tight">Auto-Renew</span>
                              <span className="text-[9px] text-slate-400 block">Restart plan automatically after 4 weeks</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleAutoReinvest(inv.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              inv.autoReinvest ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            id={`toggle_autoreinvest_${inv.id}`}
                            title="Toggle automatic reinvestment of principal at maturity"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                inv.autoReinvest ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] text-slate-400 font-mono">
                          <span>Invested: {new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>
                        <InvestmentPayoutButton
                          investment={inv}
                          onPayout={processSingleInvestmentPayout}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User History List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Recent Transactions
            </h3>

            {transactions.filter(t => t.userId === currentUser.id).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No transaction history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="pb-2 font-mono">Date</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions
                      .filter(t => t.userId === currentUser.id)
                      .slice(0, 8)
                      .map((tx) => {
                        let typeColor = 'text-amber-600';
                        if (tx.type === 'deposit') typeColor = 'text-emerald-600';
                        if (tx.type === 'referral_bonus') typeColor = 'text-amber-600';
                        if (tx.type === 'withdrawal' && tx.status === 'completed') typeColor = 'text-rose-600';

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-mono text-[11px] text-slate-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className={`py-2.5 font-semibold capitalize ${typeColor}`}>
                              {tx.type.replace('_', ' ')}
                            </td>
                            <td className="py-2.5 text-slate-600 text-[11px]">
                              {tx.description}
                            </td>
                            <td className="py-2.5 text-right font-bold font-mono text-slate-900">
                              ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {tx.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVEST / BUY PLANS TAB */}
      {activeTab === 'invest' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Choose a Property Plan</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
              Start with as little as <strong>₦15,000</strong>. All plans run for <strong>4 weeks</strong>. You get paid cash every Friday straight into your wallet, and you can withdraw to your bank anytime.
            </p>
            <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-slate-700 max-w-xl mx-auto text-left flex items-start gap-2.5 shadow-2xs">
              <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block uppercase tracking-wider text-[11px] text-amber-900 mb-0.5">Note on Plans</strong>
                <span>Your profit comes from physical property developments, trading and rental income. Once you pick a plan, your money works for the full 4 weeks, paying you cash every Friday.</span>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Backed by verified properties worldwide by <strong>Treasure Homes</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INVESTMENT_PLANS.map((plan) => {
              const isAffordable = currentUser.walletBalance >= plan.cost;
              return (
                <div 
                  key={plan.id} 
                  className={`bg-white border rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-300 relative overflow-hidden ${
                    justActivatedPlanId === plan.id
                      ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl scale-[1.01]'
                      : investingPlanId === plan.id
                        ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.005]'
                        : isAffordable ? 'border-amber-300 hover:border-amber-500 hover:shadow-lg' : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className={`absolute top-0 right-0 text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-widest font-mono transition-colors duration-300 ${
                    justActivatedPlanId === plan.id ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-900'
                  }`}>
                    {justActivatedPlanId === plan.id ? 'ACTIVATED' : 'REAL ESTATE TRUST'}
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider">{plan.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Backed by real properties</p>
                    
                    <div className="my-5 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500">Plan Cost:</span>
                        <span className="text-lg font-extrabold text-slate-900">₦{plan.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500">Total Returns (4w):</span>
                        <span className="text-base font-bold text-amber-600">₦{plan.totalReturns.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-slate-200 w-full" />
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-emerald-600 font-semibold">Weekly Cash Payout:</span>
                        <span className="text-base font-bold text-emerald-600">₦{plan.weeklyPayout.toLocaleString()}</span>
                      </div>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-2 mb-6">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Paid every Friday for 4 weeks</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>7.5% bonus for the friend who invited you</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Cash sent straight to your wallet</span>
                      </li>
                    </ul>
                  </div>

                  {isAffordable ? (
                    <button
                      onClick={() => handlePurchase(plan)}
                      disabled={investingPlanId === plan.id}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden active:scale-95 cursor-pointer ${
                        justActivatedPlanId === plan.id
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                          : investingPlanId === plan.id
                            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md animate-pulse cursor-wait'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm hover:shadow-md cursor-pointer'
                      }`}
                      id={`btn_purchase_${plan.id}`}
                    >
                      {justActivatedPlanId === plan.id ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                          <span>Plan Activated!</span>
                        </>
                      ) : investingPlanId === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span className="tracking-widest">Activating Plan...</span>
                        </>
                      ) : (
                        `Buy Plan (₦${plan.cost.toLocaleString()})`
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setDepAmount((plan.cost - currentUser.walletBalance).toString());
                          setActiveTab('finance');
                          setTimeout(() => {
                            document.getElementById('deposit_form_container')?.scrollIntoView({ behavior: 'smooth' });
                          }, 150);
                        }}
                        className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 font-sans"
                        id={`btn_fund_wallet_${plan.id}`}
                        title="Deposit funds via real bank transfer to activate this plan"
                      >
                        <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Fund ₦{(plan.cost - currentUser.walletBalance).toLocaleString()} to Invest</span>
                      </button>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans px-0.5">
                        <span>Shortfall: <strong className="text-rose-600 font-mono">₦{(plan.cost - currentUser.walletBalance).toLocaleString()}</strong></span>
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Building className="w-3 h-3 text-amber-600" />
                          Treasure Reserve Deposit
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FINANCE (DEPOSIT & WITHDRAWAL) TAB */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="deposit_form_container">
          {/* DEPOSIT MODULE (DIRECT BANK TRANSFER & RECEIPT PROOF) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  How to Add Money
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Transfer from your bank app to either of our official accounts below. Enter the amount you sent and upload your receipt screenshot. Your wallet will be funded within 10 to 30 minutes.
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-800">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>DIRECT BANK TRANSFER</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Treasure Homes Reserve Accounts */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Building className="w-4 h-4 text-amber-500" />
                    <span>OFFICIAL BANK ACCOUNTS FOR PAYMENT</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Account 1: PAGA */}
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs relative overflow-hidden shadow-xs">
                      <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-700 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-bl-lg">
                        Account 1
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <span className="font-semibold text-slate-900">PAGA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Name:</span>
                        <span className="font-semibold text-slate-900">EZE JUDE TREASURE</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Account No:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-600 font-mono text-sm">0001327256</span>
                          {copiedAccount ? (
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider font-mono">Copied!</span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('0001327256');
                                setCopiedAccount(true);
                                setTimeout(() => setCopiedAccount(false), 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Copy Account Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account 2: Moniepoint */}
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs relative overflow-hidden shadow-xs">
                      <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-700 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-bl-lg">
                        Account 2
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <span className="font-semibold text-slate-900">Moniepoint</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Name:</span>
                        <span className="font-semibold text-slate-900">EZE JUDE TREASURE</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Account No:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600 font-mono text-sm">6814600103</span>
                          {copiedAccount2 ? (
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider font-mono">Copied!</span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('6814600103');
                                setCopiedAccount2(true);
                                setTimeout(() => setCopiedAccount2(false), 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Copy Account Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">Transfer Amount (₦)</label>
                    <input 
                      type="number" 
                      value={depAmount}
                      onChange={(e) => setDepAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">Payment Method</label>
                    <select 
                      value={depMethod}
                      onChange={(e) => setDepMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option>Bank Transfer (Treasure Homes Reserve)</option>
                      <option>USDT-TRC20 Stablecoin Account</option>
                      <option>Naira Cards (Instant Gateway)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">Sender Bank & Name / Transaction Reference</label>
                    <input 
                      type="text" 
                      value={depDetails}
                      onChange={(e) => setDepDetails(e.target.value)}
                      placeholder="e.g. Access Bank - John Doe Transfer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  {/* Receipt Upload with Drag & Drop & Click */}
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-500 font-medium">Attach Receipt / Payment Proof</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-amber-500 bg-amber-50/50' 
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="receipt-upload-input" 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="receipt-upload-input" className="cursor-pointer block space-y-1.5">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto animate-bounce-slow" />
                        <div className="text-xs text-slate-600">
                          {receiptFile ? (
                            <span className="font-bold text-amber-600 font-mono text-[11px] break-all">
                              Selected: {receiptFile.name}
                            </span>
                          ) : (
                            <span>Drag and drop your receipt here, or <strong className="text-amber-600 hover:underline">browse files</strong></span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">Supports PNG, JPG, or PDF (Max 5MB)</p>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm shadow-emerald-600/10 cursor-pointer"
                    id="btn_submit_deposit"
                  >
                    I Have Sent The Money (Submit Receipt)
                  </button>
                </form>
              </div>

            {/* List of User Pending Deposits */}
            {pendingDeposits.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Deposit Approvals ({pendingDeposits.length})
                </h4>
                {pendingDeposits.map(t => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-bold text-slate-900">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{t.paymentMethod} - {new Date(t.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-200 rounded font-mono uppercase tracking-widest animate-pulse font-bold">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WITHDRAWAL MODULE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-rose-600" />
                  Send Money to Your Bank
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter how much you want to withdraw and choose your bank. Your money will arrive in your bank account within a few hours.
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>BANK WITHDRAWAL</span>
              </div>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">Withdrawal Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">₦</span>
                  <input 
                    type="number" 
                    value={withAmount}
                    onChange={(e) => setWithAmount(e.target.value)}
                    placeholder={`Min ₦${settings.minWithdrawal.toLocaleString()}`}
                    min={settings.minWithdrawal}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-8 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Destination Nigerian Bank Selector */}
              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">Select Destination Nigerian Bank</label>
                <select
                  value={selectedBankCode}
                  onChange={(e) => setSelectedBankCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500"
                >
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10-Digit NUBAN Account Number */}
              <div>
                <label className="block text-xs text-slate-600 font-semibold mb-1">10-Digit NUBAN Account Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 0123456789"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Live NIBSS Account Resolution Indicator */}
              {accountResolution && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Account Name Verified (NIBSS)</span>
                    <span className="font-bold text-slate-900">{accountResolution.name}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  settings.automatedPayouts 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                    : 'bg-[#0f172a] hover:bg-[#1e293b] text-white'
                }`}
                id="btn_submit_withdrawal"
              >
                {settings.automatedPayouts ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Withdraw Cash to My Bank (₦{Number(withAmount || 0).toLocaleString()})</span>
                  </>
                ) : (
                  <span>Withdraw Cash to My Bank</span>
                )}
              </button>
            </form>

            {/* List of User Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Disbursals ({pendingWithdrawals.length})
                </h4>
                {pendingWithdrawals.map(t => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-bold text-slate-900">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">To: {t.accountDetails}</p>
                      {t.gatewayReference && (
                        <p className="text-[9px] font-mono text-emerald-600 mt-0.5">Ref: {t.gatewayReference}</p>
                      )}
                    </div>
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-200 rounded font-mono uppercase tracking-widest animate-pulse font-bold">
                      Processing
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REFERRAL TAB */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center max-w-3xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Invite Friends, Earn Cash Every Friday
            </h3>
            <p className="text-xs text-slate-600 max-w-xl mx-auto">
              Share your invite link with friends. Whenever they get paid their weekly profit, you automatically receive 7.5% cash sent straight to your wallet!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <div className="bg-slate-50 inline-flex items-center gap-2 border border-slate-200 px-3.5 py-2 rounded-xl text-sm">
                <span className="text-slate-500 text-xs">My Code:</span>
                <strong className="text-slate-900 font-mono text-sm tracking-wider font-extrabold">{currentUser.referralCode}</strong>
                <button 
                  onClick={handleCopyCode}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Copy code only"
                >
                  {copiedCode ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
              </div>

              <button 
                onClick={handleCopyLink}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
                title="Copy direct invite link with referral code attached"
              >
                {copiedLink ? <><Check className="w-3.5 h-3.5" /> Link Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy Direct Invite Link</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Friends Joined</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{referredUsers.length}</h3>
              <p className="text-[10px] text-amber-600 font-medium mt-1">Signed up with your link</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Friends' Active Money</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                ₦{investments
                  .filter(inv => referredUsers.some(ru => ru.id === inv.userId) && inv.status === 'active')
                  .reduce((sum, inv) => sum + inv.cost, 0)
                  .toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Total working in property plans</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Total Referral Cash Earned</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">₦{totalReferralBonus.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">Paid directly to your wallet</p>
            </div>
          </div>

          {/* List of Referred Users */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              My Referral Downline ({referredUsers.length})
            </h3>
            {referredUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">You have not referred any users yet. Share your referral code to start earning!</p>
            ) : (
              <div className="space-y-3">
                {referredUsers.map(ru => {
                  const ruInvestments = investments.filter(inv => inv.userId === ru.id && inv.status === 'active');
                  return (
                    <div key={ru.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{ru.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Signed up on: {new Date(ru.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Active Investments</span>
                          <span className="font-bold text-amber-600">
                            {ruInvestments.length > 0 
                              ? `${ruInvestments.length} plan(s) (₦${ruInvestments.reduce((s, i) => s + i.cost, 0).toLocaleString()})`
                              : 'None'
                            }
                          </span>
                        </div>
                        {ruInvestments.length > 0 && (
                          <div className="bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-700 font-mono text-[9px] border border-emerald-200 font-bold">
                            +₦{(ruInvestments.reduce((s, i) => s + i.weeklyPayout, 0) * 0.5).toLocaleString()}/wk Bonus
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC TAB */}
      {activeTab === 'kyc' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Verify Your Identity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              We verify every investor to protect your money and make sure your bank withdrawals are sent to the right person.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block">Status</span>
              <span className={`text-xs font-bold uppercase tracking-wider mt-1 block font-mono ${
                currentUser.kycStatus === 'verified' ? 'text-emerald-600 font-bold' :
                currentUser.kycStatus === 'pending' ? 'text-amber-600 font-bold animate-pulse' :
                currentUser.kycStatus === 'rejected' ? 'text-rose-600 font-bold' :
                'text-slate-500 font-bold'
              }`}>
                {currentUser.kycStatus}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block">Daily Clearance Limit</span>
              <span className="text-xs font-bold text-slate-900 mt-1 block font-mono">
                {currentUser.kycStatus === 'verified' ? '₦1,000,000' : '₦100,000'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block">Verification Speed</span>
              <span className="text-xs font-bold text-amber-600 mt-1 block font-sans">
                {currentUser.kycStatus === 'verified' ? 'Priority 2 Hours' : 'Standard 24-48 Hours'}
              </span>
            </div>
          </div>

          {currentUser.kycStatus === 'unverified' || currentUser.kycStatus === 'rejected' ? (
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={kycName}
                    onChange={(e) => setKycName(e.target.value)}
                    placeholder="Same as document"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Identification Document Type</label>
                  <select 
                    value={kycType}
                    onChange={(e) => setKycType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option>National ID Card (NIN)</option>
                    <option>International Passport</option>
                    <option>Driver's License</option>
                    <option>Voters Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Document Number / Unique ID</label>
                <input 
                  type="text" 
                  value={kycNumber}
                  onChange={(e) => setKycNumber(e.target.value)}
                  placeholder="e.g. NIN-84739284729"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <UploadCloud className="w-7 h-7 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-800 font-semibold">Upload Photo of ID Document</p>
                <p className="text-[10px] text-slate-400">Please attach a clear photo or screenshot of your ID card.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                id="btn_submit_kyc"
              >
                Submit My ID for Verification
              </button>
            </form>
          ) : currentUser.kycStatus === 'pending' ? (
            <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-xl text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900">Under Verification Review</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you. Your details ({currentUser.kycDetails?.idType}: {currentUser.kycDetails?.idNumber}) are being audited by the Treasure Homes Compliance team.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Identity Verified</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Excellent. Your account is fully compliant under Treasure Homes regulatory mandates. Standard limit of ₦1,000,000/day is unlocked.
              </p>
              <div className="text-[11px] font-mono text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block text-left text-xs">
                <p>• Verified Legal Name: {currentUser.kycDetails?.fullName}</p>
                <p>• Verified ID: {currentUser.kycDetails?.idType} ({currentUser.kycDetails?.idNumber})</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DAILY TASKS TAB */}
      {activeTab === 'tasks' && (
        <DailyTasksHub onNavigateToInvest={() => setActiveTab('invest')} />
      )}

      {/* Investment FAQ Accordion Section */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Frequently Asked Questions</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Common questions about adding money, weekly Friday payouts, and bank withdrawals.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-800 hover:bg-slate-50/50 transition-colors focus:outline-none"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── POST-INVESTMENT CELEBRATION MODAL ─── */}
      {activatedPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-amber-300 shadow-2xl relative overflow-hidden animate-scaleUp">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500" />
            
            <button
              onClick={() => setActivatedPlanModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 text-slate-950 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-slate-950" />
              </div>

              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Contract Activated
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-3">
                {activatedPlanModal.plan.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your investment is secured and generating structured mortgage yield.
              </p>
            </div>

            {/* Contract Highlights */}
            <div className="my-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Invested Capital:</span>
                <span className="font-extrabold text-slate-900 text-sm">₦{activatedPlanModal.plan.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Weekly Direct Payout:</span>
                <span className="font-extrabold text-emerald-600 text-sm">₦{activatedPlanModal.plan.weeklyPayout.toLocaleString()} / wk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Returns (4 Weeks):</span>
                <span className="font-extrabold text-amber-600 text-sm">₦{activatedPlanModal.plan.totalReturns.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <PayoutCountdown targetDate={activatedPlanModal.nextPayoutDate} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setActivatedPlanModal(null);
                  setActiveTab('overview');
                  setTimeout(() => {
                    document.getElementById('active_investments_section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                id="btn_modal_go_portfolio"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>View in My Portfolio</span>
              </button>

              <button
                onClick={() => setActivatedPlanModal(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Done / Explore More Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
