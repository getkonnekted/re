import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Send, 
  Check, 
  Lock, 
  Wallet, 
  RotateCw, 
  TrendingUp, 
  Share2, 
  Globe, 
  Trophy, 
  HelpCircle,
  FileCheck,
  Building,
  UserCheck,
  Upload,
  ImageIcon,
  Trash2,
  ZoomIn,
  X,
  LogIn
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { DailyTask } from '../types';
import { getWatMillisecondsUntilMidnight, formatWatCountdown, getWatDate } from '../lib/watTime';

export const DailyTasksHub: React.FC<{ onNavigateToInvest?: () => void; onOpenRegisterModal?: () => void }> = ({ 
  onNavigateToInvest,
  onOpenRegisterModal
}) => {
  const { 
    currentUser, 
    dailyTasks, 
    taskSubmissions,
    investments,
    transactions,
    getUserProgress,
    completeInstantTask,
    submitTaskProof,
    claimStreakBonus,
    toggleAutoReinvest,
    submitKyc
  } = useAppState();

  // West Africa Time (WAT) Midnight Countdown
  const [msUntilMidnight, setMsUntilMidnight] = useState<number>(() => getWatMillisecondsUntilMidnight());
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  // Social Proof Submission Modal State
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [proofPlatform, setProofPlatform] = useState<string>('WhatsApp Status');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofNotes, setProofNotes] = useState<string>('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Lightbox Preview Modal State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // KYC Quick Submit Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [kycFullName, setKycFullName] = useState<string>(currentUser?.name || '');
  const [kycIdType, setKycIdType] = useState<string>('National ID (NIN)');
  const [kycIdNumber, setKycIdNumber] = useState<string>('');

  // 1-second live countdown to midnight WAT
  useEffect(() => {
    const updateCountdown = () => {
      setMsUntilMidnight(getWatMillisecondsUntilMidnight());
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const watTimer = formatWatCountdown(msUntilMidnight);
  const nowWat = getWatDate();
  const watTimeDisplay = nowWat.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const progress = currentUser ? getUserProgress(currentUser.id) : {
    userId: 'guest',
    currentDate: '2026-09-30',
    completedTaskIds: [],
    pendingSubmissionTaskIds: [],
    streakCount: 0,
    adBoostedTaskIds: []
  };

  // Real In-App Account Verification Checks against Live Database
  const activeInvestments = currentUser 
    ? investments.filter(i => i.userId === currentUser.id && i.status === 'active')
    : [];
  const hasActivePlan = activeInvestments.length > 0;
  const hasAutoCompounding = activeInvestments.some(i => i.autoReinvest === true);
  const isKycVerified = currentUser?.kycStatus === 'verified';
  const isKycPending = currentUser?.kycStatus === 'pending';

  // Check if KYC bounty has ever been claimed
  const hasClaimedKycBounty = transactions.some(
    t => t.userId === currentUser?.id && t.description?.includes('KYC Identity Verification Bounty')
  ) || progress.completedTaskIds.includes('task_kyc_bounty');

  // Attendance & Consecutive Streak
  const hasCheckedInToday = progress.completedTaskIds.includes('task_daily_attendance');
  const currentStreak = progress.streakCount || 0;
  const isMilestoneClaimable = currentStreak >= 7 && progress.streakBonusClaimedDate !== progress.currentDate;

  // Social Advocacy URL & Pitch
  const referralCode = currentUser?.referralCode || 'PM-INVEST';
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
  const sharePitch = `I am earning steady weekly yields backed by physical real estate with PM Invest & Treasure Homes! Join with my referral code: ${referralCode} at ${originUrl}`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(sharePitch)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(originUrl)}&text=${encodeURIComponent(sharePitch)}`;
    window.open(url, '_blank');
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(sharePitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  // Handle local screenshot image selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Image is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProofImage = () => {
    setProofImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit proof handler with thorough validation and modal feedback
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!currentUser) {
      setModalError('You must be signed in to submit proof. Please log in or create an account first.');
      return;
    }

    const hasLink = proofUrl.trim().length > 0;
    const hasImage = Boolean(proofImage);
    const hasNotes = proofNotes.trim().length > 0;

    if (!hasLink && !hasImage && !hasNotes) {
      setModalError('Please upload a screenshot image, or provide a link / post details.');
      return;
    }

    setIsSubmitting(true);

    try {
      let compositeProof = `[${proofPlatform}]`;
      if (hasLink) compositeProof += ` Link: ${proofUrl.trim()}`;
      if (hasNotes) compositeProof += ` | Notes: ${proofNotes.trim()}`;
      if (hasImage && proofImage) compositeProof += ` | Image: ${proofImage}`;

      const success = submitTaskProof('task_social_advocacy', compositeProof);
      if (success) {
        setModalSuccess('🎉 Proof submitted successfully! The Admin Control Centre has received your submission and will review it for wallet credit.');
        setTimeout(() => {
          setIsProofModalOpen(false);
          setProofUrl('');
          setProofNotes('');
          setProofImage(null);
          setModalSuccess(null);
          setIsSubmitting(false);
        }, 2200);
      } else {
        setModalError('Failed to submit proof. Please check your account session and try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setModalError(err?.message || 'An unexpected error occurred while submitting.');
      setIsSubmitting(false);
    }
  };

  const handleSubmitKycForm = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(kycFullName, kycIdType, kycIdNumber);
    setIsKycModalOpen(false);
  };

  // Helper to extract image from proof string
  const extractImageFromProof = (proofStr: string): string | null => {
    if (!proofStr) return null;
    const match = proofStr.match(/Image:\s*(data:image\/[^;]+;base64,[^ \]]+)/);
    return match ? match[1] : null;
  };

  const getCleanProofSummary = (proofStr: string): string => {
    if (!proofStr) return '';
    return proofStr.replace(/\|\s*Image:\s*data:image\/[^;]+;base64,[^ \]]+/, '').trim();
  };

  const hasClaimedActiveReward = transactions.some(
    t => t.userId === currentUser?.id && (t.description?.includes('Active Investor') || t.description?.includes('Active Portfolio'))
  );
  const hasClaimedAutoRenew = transactions.some(
    t => t.userId === currentUser?.id && (t.description?.includes('Auto-Renew') || t.description?.includes('Auto-Compounding'))
  );

  return (
    <div className="space-y-6" id="daily_tasks_hub_container">
      {/* HEADER SECTION WITH REAL WAT RESET CLOCK */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-2xl p-6 text-white border border-amber-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-slate-950" />
                Daily Rewards & Tasks
              </span>
              <span className="bg-slate-800/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                WAT (UTC+1)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Daily Cash Rewards
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Complete simple daily actions, share on WhatsApp, and check in 7 days in a row to win bonus cash.
            </p>
          </div>

          {/* REAL MIDNIGHT WAT RESET CLOCK */}
          <div className="bg-slate-900/90 border border-amber-400/30 rounded-xl p-4 shrink-0 shadow-md backdrop-blur-xs w-full lg:w-auto">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>WAT Midnight Reset</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Lagos {watTimeDisplay}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono">
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center">
                <span className="text-lg font-black text-amber-400">{String(watTimer.hours).padStart(2, '0')}</span>
                <span className="block text-[8px] text-slate-400 uppercase">Hours</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center">
                <span className="text-lg font-black text-amber-400">{String(watTimer.minutes).padStart(2, '0')}</span>
                <span className="block text-[8px] text-slate-400 uppercase">Mins</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center animate-pulse">
                <span className="text-lg font-black text-amber-300">{String(watTimer.seconds).padStart(2, '0')}</span>
                <span className="block text-[8px] text-slate-400 uppercase">Secs</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-2 font-sans">
              Daily quests refresh automatically at 00:00 WAT
            </p>
          </div>
        </div>
      </div>

      {/* CONSECUTIVE DAILY ATTENDANCE & 7-DAY ₦1,500 MILESTONE TRACKER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Daily Check-In Tracker
              </h3>
              <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
                {currentStreak} / 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Check in daily to collect your cash. Reach 7 days in a row without missing a day to win the <strong>₦1,500 Jackpot</strong>!
            </p>
          </div>

          {/* Quick Check-in action */}
          <div>
            {!currentUser ? (
              <button
                onClick={onOpenRegisterModal}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Sign In to Track Streak
              </button>
            ) : hasCheckedInToday ? (
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Checked In for Today (+₦100)</span>
              </div>
            ) : (
              <button
                onClick={() => completeInstantTask('task_daily_attendance')}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                id="btn_checkin_attendance"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Check In for Day {Math.min(7, currentStreak + 1)} (+₦100)</span>
              </button>
            )}
          </div>
        </div>

        {/* 7-DAY PROGRESS VISUALIZER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 my-4">
          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
            const isCompleted = currentStreak >= dayNum;
            const isCurrent = currentStreak + 1 === dayNum && !hasCheckedInToday;
            const isMilestone = dayNum === 7;

            return (
              <div
                key={dayNum}
                className={`relative rounded-xl p-3 border transition-all flex flex-col items-center justify-between text-center ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/40'
                    : isMilestone
                    ? 'bg-amber-500/10 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
                }`}
              >
                <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                  <span>DAY {dayNum}</span>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isMilestone ? (
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                </div>

                <div className="my-1.5">
                  {isMilestone ? (
                    <span className="font-mono font-black text-amber-600 text-xs sm:text-sm block">
                      ₦1,500
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-xs block">
                      +₦100
                    </span>
                  )}
                </div>

                <span className="text-[9px] uppercase tracking-wider font-semibold">
                  {isCompleted ? 'Completed' : isCurrent ? 'Next Up' : isMilestone ? 'Jackpot' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* DAY 7 MILESTONE UNLOCK BANNER */}
        {isMilestoneClaimable && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md mt-4 animate-bounce">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-white shrink-0" />
              <div>
                <h4 className="font-black text-sm">7-Day Consistency Milestone Reached!</h4>
                <p className="text-xs text-slate-900">
                  You have completed 7 consecutive calendar days. Claim your ₦1,500 cash reward now!
                </p>
              </div>
            </div>
            <button
              onClick={() => claimStreakBonus()}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs uppercase px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
              id="btn_claim_streak_milestone"
            >
              Claim ₦1,500 Cash Bonus
            </button>
          </div>
        )}
      </div>

      {/* REAL IN-APP ACCOUNT VERIFICATION TASKS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Daily Account Rewards
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant cash rewards for active investors and verified accounts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* QUEST 1: ACTIVE INVESTOR QUEST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                  ACTIVE INVESTOR
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  +₦300 One-Time
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">Active Investor Reward</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                If you have an active property plan, click here to collect your one-time ₦300 cash bonus.
              </p>

              {/* Status display */}
              <div className="my-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your Plans</span>
                {hasActivePlan ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {activeInvestments.length} Active Plan{activeInvestments.length > 1 ? 's' : ''} Running
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    No Active Plans (Buy a plan to unlock)
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {hasClaimedActiveReward || progress.completedTaskIds.includes('task_active_portfolio') ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Claimed (₦300 Credited)</span>
                </div>
              ) : hasActivePlan ? (
                <button
                  onClick={() => completeInstantTask('task_active_portfolio')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  id="btn_claim_active_portfolio"
                >
                  Claim One-Time Bonus (+₦300)
                </button>
              ) : (
                <button
                  onClick={onNavigateToInvest}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Choose a Plan (From ₦15k)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* QUEST 2: AUTO-RENEW BONUS QUEST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-amber-50 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-200">
                  AUTO RENEW
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  +₦250 One-Time
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">Auto-Renew Bonus</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Turn on auto-renew on any of your active plans to collect an instant one-time ₦250 cash bonus.
              </p>

              {/* Status display */}
              <div className="my-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Auto-Renew Status</span>
                {hasAutoCompounding ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Auto-Renew is Turned ON
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                    <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                    Auto-Renew is OFF
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {hasClaimedAutoRenew || progress.completedTaskIds.includes('task_auto_reinvest') ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Claimed (₦250 Credited)</span>
                </div>
              ) : hasAutoCompounding ? (
                <button
                  onClick={() => completeInstantTask('task_auto_reinvest')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  id="btn_claim_auto_reinvest"
                >
                  Claim One-Time Bonus (+₦250)
                </button>
              ) : hasActivePlan ? (
                <button
                  onClick={() => {
                    const firstPlan = activeInvestments[0];
                    if (firstPlan) toggleAutoReinvest(firstPlan.id);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Turn On Auto-Renew
                </button>
              ) : (
                <button
                  onClick={onNavigateToInvest}
                  className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed"
                  disabled
                >
                  Requires Active Plan
                </button>
              )}
            </div>
          </div>

          {/* QUEST 3: KYC COMPLETION BOUNTY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-purple-50 text-purple-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-purple-200">
                  ID GIFT
                </span>
                <span className="text-xs font-mono font-bold text-purple-700">
                  ₦1,000 One-Time
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">ID Verification Gift</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Get a free ₦1,000 cash bonus added to your wallet as soon as your ID is verified.
              </p>

              {/* Status display */}
              <div className="my-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verification Status</span>
                {isKycVerified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ID Verified ✓
                  </span>
                ) : isKycPending ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                    Under Review (~10 mins)
                  </span>
                ) : (
                  <span className="text-slate-600 font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Not Yet Verified
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {hasClaimedKycBounty ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified & Claimed (₦1,000)</span>
                </div>
              ) : isKycVerified ? (
                <button
                  onClick={() => completeInstantTask('task_kyc_bounty')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  id="btn_claim_kyc_bounty"
                >
                  Claim ₦1,000 Cash Gift
                </button>
              ) : isKycPending ? (
                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed"
                >
                  Review in Progress
                </button>
              ) : (
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Verify ID for ₦1,000</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REAL SOCIAL ADVOCACY & PROOF-OF-WORK BOUNTIES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Post on WhatsApp &amp; Earn
              </h3>
              <span className="bg-amber-100 text-amber-900 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200">
                ₦200 Per Post
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Share our flyer on your WhatsApp status or Telegram. Upload your screenshot proof to receive ₦200 cash.
            </p>
          </div>

          <button
            onClick={() => {
              setModalError(null);
              setModalSuccess(null);
              setIsProofModalOpen(true);
            }}
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            id="btn_open_submit_proof_modal"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Upload Screenshot Proof</span>
          </button>
        </div>

        {/* NATIVE ONE-TAP SHARING TOOLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left shadow-2xs"
            id="btn_share_whatsapp"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                WA
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">
                  Share to WhatsApp
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Broadcast to status or investor groups
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Telegram Share */}
          <button
            onClick={handleShareTelegram}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-950 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left shadow-2xs"
            id="btn_share_telegram"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                TG
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block group-hover:text-sky-800">
                  Share to Telegram
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Post to real estate & finance channels
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Copy Pitch & Link */}
          <button
            onClick={handleCopyPitch}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left shadow-2xs"
            id="btn_copy_pitch_link"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-base shadow-xs">
                {copiedPitch ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {copiedPitch ? 'Copied to Clipboard!' : 'Copy Invite Pitch'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Code: <strong className="text-slate-800 font-mono">{referralCode}</strong>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-amber-600 font-bold uppercase">
              {copiedPitch ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>

        {/* User's recent submissions log */}
        {taskSubmissions.filter(s => s.userId === currentUser?.id).length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Your Advocacy Submissions Audit Status
            </h5>
            <div className="space-y-2">
              {taskSubmissions
                .filter(s => s.userId === currentUser?.id)
                .slice(0, 5)
                .map((sub) => {
                  const subImage = extractImageFromProof(sub.proof);
                  const cleanText = getCleanProofSummary(sub.proof);

                  return (
                    <div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        {subImage && (
                          <div 
                            onClick={() => setLightboxImage(subImage)}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0 cursor-pointer group bg-slate-100"
                            title="Click to view screenshot"
                          >
                            <img src={subImage} alt="Proof Screenshot" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ZoomIn className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              {sub.taskTitle}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-slate-700 truncate max-w-md mt-0.5">
                            {cleanText || 'Screenshot proof submitted'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="font-mono font-bold text-emerald-600">+₦{sub.rewardAmount.toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          sub.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {sub.status === 'pending' ? 'UNDER AUDIT' : sub.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT ADVOCACY PROOF MODAL */}
      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest block">Treasure Homes Audit Desk</span>
                <h3 className="text-base font-bold text-slate-900">Submit Advocacy Proof (₦200 Bounty)</h3>
              </div>
              <button 
                onClick={() => {
                  setIsProofModalOpen(false);
                  setModalError(null);
                  setModalSuccess(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Check if user is signed in */}
            {!currentUser ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sign In Required</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    You must be signed in to submit proof of work and have the ₦200 bounty credited to your investment wallet.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsProofModalOpen(false);
                    onOpenRegisterModal?.();
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Sign In or Create Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
                {/* Modal Error Banner */}
                {modalError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Modal Success Banner */}
                {modalSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-start gap-2 text-xs animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{modalSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Social Media Channel / Broadcast Type</label>
                  <select
                    value={proofPlatform}
                    onChange={(e) => setProofPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                  >
                    <option value="WhatsApp Status">WhatsApp Status (Screenshot Proof)</option>
                    <option value="WhatsApp Group">WhatsApp Investment Group</option>
                    <option value="Telegram Channel">Telegram Group / Channel</option>
                    <option value="Twitter/X">Twitter / X Post</option>
                    <option value="Facebook">Facebook Post or Story</option>
                    <option value="Instagram">Instagram Story or Post</option>
                    <option value="LinkedIn">LinkedIn Post</option>
                  </select>
                </div>

                {/* REAL SCREENSHOT IMAGE UPLOAD AREA */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Upload Screenshot Proof (Recommended)
                  </label>
                  
                  {proofImage ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={proofImage} 
                          alt="Screenshot Preview" 
                          className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0" 
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Screenshot Attached</span>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ready for upload
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveProofImage}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Remove attached screenshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="proof_image_file_input"
                      />
                      <label
                        htmlFor="proof_image_file_input"
                        className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-amber-50/20 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-500 group-hover:text-amber-600 transition-colors mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xs text-slate-800 block">Click to upload screenshot</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">PNG, JPG, or WEBP up to 5MB</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* POST LINK OR URL (OPTIONAL IF IMAGE PROVIDED) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Post Link or Web URL {proofImage ? '(Optional)' : '(Required if no screenshot)'}
                  </label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="e.g. https://x.com/username/status/123... or link to WhatsApp post"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* ADDITIONAL NOTES */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Additional Verification Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="e.g. Shared with 450 contacts on WhatsApp status with high engagement"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
                  Submissions are sent directly to the <strong>Admin Control Centre</strong> for manual compliance audit. Approved submissions credit <strong>₦200</strong> directly to your available balance.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProofModalOpen(false);
                      setModalError(null);
                      setModalSuccess(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    id="btn_submit_advocacy_proof"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Compliance Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Proof Inspection" 
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain mx-auto" 
            />
          </div>
        </div>
      )}

      {/* QUICK KYC SUBMIT MODAL */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest block">Identity Compliance</span>
                <h3 className="text-base font-bold text-slate-900">Submit KYC Verification (₦1,000 Bounty)</h3>
              </div>
              <button 
                onClick={() => setIsKycModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitKycForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name (as shown on ID)</label>
                <input
                  type="text"
                  required
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  placeholder="e.g. Babatunde Olumide Adeleke"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Government ID Type</label>
                <select
                  value={kycIdType}
                  onChange={(e) => setKycIdType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="National ID (NIN)">National Identity Number (NIN)</option>
                  <option value="Voter ID">Permanent Voter's Card (PVC)</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Driver License">FRSC Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Identification Number</label>
                <input
                  type="text"
                  required
                  value={kycIdNumber}
                  onChange={(e) => setKycIdNumber(e.target.value)}
                  placeholder="e.g. 58392019482"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-[11px] text-purple-900">
                Your ID verification ensures anti-fraud compliance and priority withdrawal clearance. Once approved by the compliance team in the Admin Panel, you can claim the <strong>₦1,000 cash bounty</strong> directly into your wallet.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Identification Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
