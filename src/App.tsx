/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StateProvider, useAppState, ADMIN_EMAIL } from './context/StateContext';
import { BrandingHeader, LegalDisclosures } from './components/BrandingHeader';
import { UserDashboard } from './components/UserDashboard';
import { MarketerDashboard } from './components/MarketerDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AujotenPage } from './components/AujotenPage';
import { PmLogo } from './components/PmLogo';
import { 
  Building, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  UserPlus, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  Key,
  Users,
  AlertTriangle,
  ShieldAlert,
  LayoutGrid,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  User as UserIcon,
  Phone,
  X,
  Globe,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { INVESTMENT_PLANS } from './types';
import { PayoutToastContainer } from './components/PayoutToast';
import { LiveActivityToast } from './components/LiveActivityToast';
import { LiveReserveCounter } from './components/LiveReserveCounter';

function MainAppContent() {
  const { 
    currentUser, 
    users, 
    settings,
    register, 
    login, 
    requestPasswordReset,
    confirmPasswordReset,
    successMsg, 
    errorMsg, 
    clearMessages,
    payoutToasts,
    dismissPayoutToast
  } = useAppState();
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminView, setAdminView] = useState<'admin' | 'investor' | 'marketer'>('admin');
  const [currentPage, setCurrentPage] = useState<'pminvest' | 'aujoten'>(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      if (path.includes('aujoten') || hash.includes('aujoten') || search.includes('aujoten')) {
        return 'aujoten';
      }
    }
    return 'pminvest';
  });
  
  // URL routing detection (e.g. pminvest.org.ng/aujoten or ?page=aujoten or #aujoten or pathname === '/aujoten')
  useEffect(() => {
    const checkRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      
      if (path.includes('aujoten') || hash.includes('aujoten') || search.includes('aujoten')) {
        setCurrentPage('aujoten');
      } else {
        setCurrentPage('pminvest');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const navigateTo = (page: 'pminvest' | 'aujoten') => {
    setCurrentPage(page);
    if (page === 'aujoten') {
      window.location.hash = 'aujoten';
    } else {
      window.location.hash = '';
      if (window.location.pathname.includes('aujoten')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  // If user navigated to /aujoten, render the Aujoten dedicated website
  if (currentPage === 'aujoten') {
    return <AujotenPage onBackToPmInvest={() => navigateTo('pminvest')} />;
  }
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRef, setRegRef] = useState('');

  // Check URL params for referral code if provided
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam) {
        setRegRef(refParam.toUpperCase().trim());
      }
    } catch {
      // Ignore if URLSearchParams is unavailable
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = register(regName, regEmail, regRef, regPassword, regPhone);
    if (success) {
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegRef('');
    }
  };

  // Password reset state & flow
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1 = Request, 2 = Verify Code & Confirm New Password, 3 = Reset Confirmed
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCodeBanner, setGeneratedCodeBanner] = useState<string | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetLocalError, setResetLocalError] = useState<string | null>(null);

  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLocalError(null);
    clearMessages();
    const emailToUse = resetEmail.trim().toLowerCase();
    if (!emailToUse) {
      setResetLocalError('Please enter your registered email address.');
      return;
    }
    const res = requestPasswordReset(emailToUse);
    if (res.success && res.code) {
      setGeneratedCodeBanner(res.code);
      setResetStep(2);
    }
  };

  const handleConfirmResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLocalError(null);
    clearMessages();

    const codeToUse = resetCode.trim();
    if (!codeToUse) {
      setResetLocalError('Please enter the 6-digit confirmation code.');
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 4) {
      setResetLocalError('New password must be at least 4 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetLocalError('Password confirmation does not match. Please ensure both passwords match.');
      return;
    }

    const success = confirmPasswordReset(resetEmail.trim().toLowerCase(), codeToUse, resetNewPassword);
    if (success) {
      setResetStep(3);
    }
  };

  const handleFinishResetToSignIn = () => {
    setLoginEmail(resetEmail.trim().toLowerCase());
    setLoginPassword(resetNewPassword);
    setIsResettingPassword(false);
    setResetStep(1);
    setResetCode('');
    setGeneratedCodeBanner(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetLocalError(null);
    clearMessages();
  };

  // Unauthenticated Landing Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
        <PayoutToastContainer
          toasts={payoutToasts}
          onDismiss={dismissPayoutToast}
        />
        <LiveActivityToast />

        {/* Affiliation & Live Accreting Reserve Header bar */}
        <div className="bg-[#0f172a] px-4 py-2.5 text-center text-xs text-slate-300 border-b border-slate-800 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>PM Invest is certified under <strong className="text-white">TREASURE HOMES LTD</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-amber-400 font-medium">Bank Reserve Backing:</span>
            <LiveReserveCounter precision={0} showLivePulse={true} showRateBadge={false} className="text-white font-bold" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
          {/* LEFT PANEL: Promotional, brand values, plans preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3.5">
              <PmLogo className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" />
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block font-mono">TREASURE HOMES GROUP</span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">PM <span className="text-amber-500">Invest</span> Platform</h1>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-base sm:text-lg text-slate-800 font-semibold leading-relaxed max-w-xl">
                Put your money into real properties. Get paid cash every Friday.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                Start with as little as ₦15,000. Backed by verified properties worldwide managed by <strong>TREASURE HOMES</strong>.
              </p>
            </div>

            {/* Quick Rates Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Popular Property Plans (4-Week Cycles)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {INVESTMENT_PLANS.slice(0, 3).map(plan => (
                  <div key={plan.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-xs uppercase">{plan.name}</span>
                      <span className="text-xs text-amber-600 font-mono font-bold">₦{plan.cost.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>Weekly Payout:</span>
                      <span className="text-emerald-600 font-bold">₦{plan.weeklyPayout.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                  <span className="text-[11px] text-slate-700 font-bold uppercase">Up to Plan 5</span>
                  <span className="text-[10px] text-slate-500">₦500k Plan → ₦1.16M Returns</span>
                </div>
              </div>

              {/* Note on Plans */}
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5 text-xs text-slate-300">
                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px] mb-1">Note on Plans</span>
                <span>Your profit comes from physical property developments, trading and rental income. Once you pick a plan, your money works for the full 4 weeks, paying you cash every Friday.</span>
              </div>
            </div>

            {/* Brand benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
              <div className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Weekly Cash Returns</h4>
                  <p className="text-slate-500 mt-0.5">Your profit is paid directly into your wallet every Friday.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Users className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">7.5% Referral Bonus</h4>
                  <p className="text-slate-500 mt-0.5">Share your invite link. Earn 7.5% cash every time your friend gets paid.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Clean Auth Forms */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden text-slate-800" id="card_auth_panel">
            {/* Ambient accent background blur */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Segmented Top Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setIsResettingPassword(false); clearMessages(); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isRegistering && !isResettingPassword
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab_auth_signin"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setIsResettingPassword(false); clearMessages(); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isRegistering && !isResettingPassword
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab_auth_signup"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Subtitle Header */}
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                {isResettingPassword
                  ? 'Reset Your Password'
                  : isRegistering
                    ? 'Create Your Account'
                    : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isResettingPassword
                  ? 'Enter your registered email to reset your password.'
                  : isRegistering 
                    ? 'Enter your details and your friend’s invite code to get started.'
                    : 'Sign in to check your wallet and weekly profits.'
                }
              </p>
            </div>

            {/* Invite-Only Gating Banner for Registration */}
            {isRegistering && !isResettingPassword && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Invite Code Required</span>
                  <span className="text-[11px] text-slate-600 mt-0.5 block leading-relaxed">
                    To join PM Invest, please enter the referral code given to you by your friend or sponsor.
                  </span>
                </div>
              </div>
            )}

            {/* General Feedback Notifications */}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-start justify-between gap-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium leading-relaxed">{successMsg}</span>
                </div>
                <button 
                  onClick={clearMessages} 
                  className="text-emerald-600 hover:text-emerald-800 p-0.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start justify-between gap-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
                <button 
                  onClick={clearMessages} 
                  className="text-rose-600 hover:text-rose-800 p-0.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isResettingPassword ? (
              /* PASSWORD RESET & CONFIRMATION WORKFLOW */
              <div className="space-y-4">
                {resetLocalError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{resetLocalError}</span>
                  </div>
                )}

                {resetStep === 1 && (
                  /* Step 1: Request Reset Confirmation Code */
                  <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Key className="w-4 h-4 text-amber-500" />
                        <span>Step 1 of 2: Request Confirmation Code</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Enter your registered account email. A secure 6-digit confirmation code will be issued to authorize resetting your password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="e.g. investor@gmail.com"
                          autoComplete="email"
                          className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                      id="btn_request_reset_code"
                    >
                      <span>Send Reset Confirmation Code</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>

                    <div className="text-center pt-2 text-xs text-slate-500">
                      <span>Remembered your password? </span>
                      <button 
                        type="button"
                        onClick={() => { setIsResettingPassword(false); setResetStep(1); clearMessages(); }}
                        className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </form>
                )}

                {resetStep === 2 && (
                  /* Step 2: Enter Code, New Password & Confirm Match */
                  <form onSubmit={handleConfirmResetSubmit} className="space-y-3.5">
                    {/* Security Code Banner with Quick Autofill */}
                    {generatedCodeBanner && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5 shadow-xs animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Security Confirmation Code</span>
                          </div>
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono px-2 py-0.5 rounded font-bold">15m Expiry</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Reset authorization for <strong className="text-slate-900">{resetEmail}</strong>:
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="font-mono font-extrabold text-sm tracking-widest text-slate-900 bg-white px-3 py-1 rounded border border-amber-300 shadow-2xs">
                            {generatedCodeBanner}
                          </span>
                          <button
                            type="button"
                            onClick={() => setResetCode(generatedCodeBanner)}
                            className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded transition-colors cursor-pointer"
                            id="btn_autofill_reset_code"
                          >
                            Autofill Code
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-700">6-Digit Confirmation Code</label>
                        <span className="text-[10px] text-slate-400 font-mono">Compulsory</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value.trim())}
                          placeholder="e.g. 583920"
                          maxLength={6}
                          className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-semibold"
                          required
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Create New Password</label>
                      <div className="relative">
                        <input 
                          type={showResetNewPassword ? 'text' : 'password'}
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="At least 4 characters"
                          className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono"
                          required
                          minLength={4}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                          title={showResetNewPassword ? "Hide password" : "Show password"}
                        >
                          {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
                        {resetNewPassword && resetConfirmPassword && (
                          resetNewPassword === resetConfirmPassword ? (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Passwords match
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Passwords do not match
                            </span>
                          )
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type={showResetConfirmPassword ? 'text' : 'password'}
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className={`w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-mono ${
                            resetNewPassword && resetConfirmPassword && resetNewPassword !== resetConfirmPassword
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10'
                          }`}
                          required
                          minLength={4}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                          title={showResetConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!resetCode.trim() || !resetNewPassword || resetNewPassword !== resetConfirmPassword}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                      id="btn_confirm_reset_password"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                      <span>Confirm & Reset Password</span>
                    </button>

                    <div className="flex justify-between items-center pt-2 text-xs">
                      <button 
                        type="button"
                        onClick={() => { setResetStep(1); setResetLocalError(null); }}
                        className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                      >
                        ← Change Email
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setIsResettingPassword(false); setResetStep(1); clearMessages(); }}
                        className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Cancel & Sign In
                      </button>
                    </div>
                  </form>
                )}

                {resetStep === 3 && (
                  /* Step 3: Password Reset Confirmed Success Card */
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center space-y-4 animate-scaleIn">
                    <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Password Reset Confirmed!</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Your account password for <strong className="text-slate-900">{resetEmail}</strong> has been successfully updated and verified.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFinishResetToSignIn}
                      className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      id="btn_proceed_to_signin"
                    >
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>
            ) : !isRegistering ? (
              /* CLEAN SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. investor@gmail.com"
                      autoComplete="email"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResettingPassword(true);
                        setResetEmail(loginEmail || '');
                        setResetStep(1);
                        setResetLocalError(null);
                        clearMessages();
                      }}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      autoComplete="current-password"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                  id="btn_landing_login"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  <span>Don't have an account? </span>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); clearMessages(); }}
                    className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </div>
              </form>
            ) : (
              /* CLEAN REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jude Okafor"
                      autoComplete="name"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. jude@gmail.com"
                      autoComplete="email"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 08012345678 or +234..."
                      autoComplete="tel"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                  <div className="relative">
                    <input 
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                      title={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Sponsor Referral Code <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                      Compulsory
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regRef}
                      onChange={(e) => setRegRef(e.target.value.toUpperCase())}
                      placeholder="e.g. INV1000 or friend's code"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono uppercase"
                      required
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    🔒 Registration requires an invite code from a friend or sponsor.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/15 cursor-pointer mt-2"
                  id="btn_landing_register"
                >
                  <span>Create Account</span>
                  <UserPlus className="w-4 h-4" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  <span>Already registered? </span>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); clearMessages(); }}
                    className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Brand visual cards section */}
        <div className="bg-[#0f172a] py-8 border-t border-slate-800 text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-amber-400 font-bold text-sm block">100% REGULATED</span>
              <p className="text-slate-300">Operating transparent cash reserves under supervision of the Treasure Homes asset board.</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-x border-slate-800 py-4 md:py-0">
              <span className="text-amber-400 font-bold text-sm block font-mono">₦{settings ? Math.floor(settings.liquidityReserve / 1000000) : '78'}M+ RESERVE BACKING</span>
              <p className="text-slate-300">Ensuring complete stability with physical properties and liquid collateral holding records.</p>
            </div>
            <div className="space-y-1">
              <span className="text-amber-400 font-bold text-sm block">KYC INTEGRITY GATE</span>
              <p className="text-slate-300">Anti-fraud protection including verified identification checks for seamless, quick clearances.</p>
            </div>
          </div>
        </div>

        <LegalDisclosures />
      </div>
    );
  }

  // Authenticated workspace
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans pb-10" id="app_workspace_root">
      <PayoutToastContainer
        toasts={payoutToasts}
        onDismiss={dismissPayoutToast}
        onNavigateToWallet={() => {
          if (currentUser?.role === 'admin') {
            setAdminView('investor');
          }
          const walletEl = document.getElementById('user_dashboard_container') || document.getElementById('marketer_dashboard_container');
          if (walletEl) {
            walletEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      <LiveActivityToast />
      <div>
        <BrandingHeader />
        
        {currentUser.role === 'admin' && (
          <div className="bg-[#1e293b] border-b border-slate-700 py-3 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Treasure Homes Authorized Admin session</span>
              </div>
              <div className="flex gap-2 bg-[#0f172a] p-1 rounded-xl border border-slate-700 flex-wrap justify-center">
                <button
                  onClick={() => setAdminView('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Control Panel
                </button>
                <button
                  onClick={() => setAdminView('investor')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'investor'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Real Investor View
                </button>
                <button
                  onClick={() => setAdminView('marketer')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'marketer'
                      ? 'bg-purple-500 text-white shadow-sm font-extrabold'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Marketer Portal View
                </button>
              </div>
            </div>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentUser.role === 'admin' ? (
            adminView === 'admin' ? (
              <AdminPanel />
            ) : adminView === 'marketer' ? (
              <MarketerDashboard />
            ) : (
              <UserDashboard />
            )
          ) : currentUser.isMarketingAccount ? (
            <MarketerDashboard />
          ) : (
            <UserDashboard />
          )}
        </main>
      </div>

      <LegalDisclosures />
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <MainAppContent />
    </StateProvider>
  );
}
