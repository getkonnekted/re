import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Building, 
  Flame, 
  ExternalLink, 
  Zap, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Check, 
  MessageSquare, 
  PhoneCall, 
  Search, 
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { INVESTMENT_PLANS, InvestmentPlan } from '../types';
import { PmLogo } from './PmLogo';
import { CommunityBanner } from './CommunityBanner';

export const MarketerDashboard: React.FC = () => {
  const { 
    currentUser, 
    users, 
    transactions, 
    investments, 
    settings,
    dailyTasks,
    getUserProgress,
    successMsg, 
    errorMsg, 
    clearMessages,
    formatLiquidityReserve
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'downline' | 'presentation' | 'tools'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchDownline, setSearchDownline] = useState('');
  const [selectedPlanCalc, setSelectedPlanCalc] = useState<InvestmentPlan>(INVESTMENT_PLANS[0]);

  if (!currentUser) return null;

  // Calculate Marketer-Specific Performance & Commissions
  const myDownline = users.filter(u => u.referredByCode === currentUser.referralCode);

  // Determine Real Investors vs Unfunded Leads in Downline
  const downlineWithStats = myDownline.map(lead => {
    const leadDeposits = transactions.filter(t => 
      t.userId === lead.id && 
      t.type === 'deposit' && 
      t.status === 'completed' && 
      !t.isMarketing
    );
    const totalDeposited = leadDeposits.reduce((sum, t) => sum + t.amount, 0);
    const isRealPaidInvestor = totalDeposited > 0;
    const leadInvestments = investments.filter(inv => inv.userId === lead.id && inv.status === 'active');
    
    return {
      ...lead,
      totalDeposited,
      isRealPaidInvestor,
      activePlansCount: leadInvestments.length
    };
  });

  const realPaidDownline = downlineWithStats.filter(l => l.isRealPaidInvestor);
  const unfundedLeads = downlineWithStats.filter(l => !l.isRealPaidInvestor);

  const totalDownlineVolume = realPaidDownline.reduce((sum, l) => sum + l.totalDeposited, 0);

  // Marketer Real Earned Commissions (7.5% referral bonuses + task rewards)
  const earnedCommissions = transactions
    .filter(t => t.userId === currentUser.id && (t.type === 'referral_bonus' || t.type === 'task_reward') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Marketer Withdrawn Commissions
  const withdrawnCommissions = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Pending Commission Cashouts
  const pendingCashouts = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'withdrawal' && t.status === 'pending');

  // Marketer Available Commission Balance (Actual Real Cash)
  // For marketing accounts, their real commission cash is distinct from the demo canvassing budget
  const availableCommissionCash = Math.max(0, currentUser.walletBalance);

  // Allocated Promotional Demo Balance
  const promotionalDemoBudget = currentUser.marketingAllocatedBalance || 0;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
  const referralLink = `${originUrl}/?ref=${currentUser.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredDownline = downlineWithStats.filter(l => {
    const q = searchDownline.toLowerCase().trim();
    if (!q) return true;
    return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.phone && l.phone.includes(q));
  });

  // Pre-formatted WhatsApp share copy
  const sharePitchText = `Hello! Have you seen PM Invest by Treasure Homes? 🏢\n\nThey offer verified property-backed investments starting from just ₦15,000 with cash returns paid directly into your bank every Friday!\n\nUse my official invite code *${currentUser.referralCode}* to register here:\n${referralLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(sharePitchText)}`;

  return (
    <div className="w-full text-slate-800 p-1" id="marketer_dashboard_container">
      {/* Top Global Alerts */}
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
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-rose-600 hover:text-rose-800 text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {/* Official Marketer Portal Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 border border-purple-900/50 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Building2 className="w-48 h-48 text-purple-400" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                OFFICIAL MARKETING CANVASSER PORTAL
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                7.5% Weekly Override Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, <span className="text-amber-400">{currentUser.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              This is your dedicated sales partner & canvassing workspace. Pitch real clients, share your official invite link, track your pipeline conversions, and withdraw your earned 7.5% weekly commissions.
            </p>
          </div>

          {/* Quick Referral Invite Box */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shrink-0 w-full sm:w-auto shadow-inner space-y-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
              Your Marketer Invite Code
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-base tracking-widest text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                {currentUser.referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <Share2 className="w-3 h-3 text-purple-400" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
              <span className="text-slate-600">•</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp Pitch</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Community Banner */}
      <CommunityBanner />

      {/* Responsive Hamburger Navigation Bar & Dropdown Drawer */}
      {(() => {
        const menuItems: {
          id: 'overview' | 'downline' | 'presentation' | 'tools';
          label: string;
          description: string;
          icon: React.ComponentType<{ className?: string }>;
          badge?: React.ReactNode;
        }[] = [
          {
            id: 'overview',
            label: 'Overview',
            description: 'Your commission metrics, pipeline & quick tools',
            icon: TrendingUp
          },
          {
            id: 'downline',
            label: 'Downline Leads',
            description: 'Track real investors vs unfunded leads with WhatsApp follow-up',
            icon: Users,
            badge: realPaidDownline.length > 0 ? (
              <span className="bg-emerald-500 text-slate-950 font-mono text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                {realPaidDownline.length} Paid
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                {myDownline.length}
              </span>
            )
          },
          {
            id: 'presentation',
            label: 'Client Presentation',
            description: 'Interactive client returns calculator & property plans',
            icon: Sparkles
          },
          {
            id: 'tools',
            label: 'Pitch & Bounties',
            description: 'One-click WhatsApp broadcast & marketing invite link',
            icon: Share2
          }
        ];

        return (
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              {/* Hamburger Menu Toggle Button (Mobile & Tablet) */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0 lg:hidden"
                id="btn_marketer_hamburger"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
                <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              </button>

              {/* Current Active Section Badge (Mobile) */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 text-xs font-bold truncate lg:hidden">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Active:</span>
                {(() => {
                  const currentItem = menuItems.find(m => m.id === activeTab) || menuItems[0];
                  const CurrentIcon = currentItem.icon;
                  return (
                    <div className="flex items-center gap-1.5 truncate">
                      <CurrentIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="text-slate-900 font-extrabold truncate">{currentItem.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Desktop Navigation Tabs (Visible on lg screens) */}
              <div className="hidden lg:flex items-center gap-1.5 w-full overflow-x-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setActiveTab(item.id); clearMessages(); setIsMenuOpen(false); }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      id={`tab_marketer_desktop_${item.id}`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.badge}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Expanded Drawer with Quick-Navigation Cards */}
            {isMenuOpen && (
              <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn lg:hidden">
                <div className="px-1 mb-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <PmLogo className="w-5 h-5" />
                    <span className="font-bold text-slate-700 uppercase tracking-wider">Marketer Suite Menus</span>
                  </div>
                  <span className="text-purple-600 font-semibold">{menuItems.length} Menus</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMenuOpen(false);
                          clearMessages();
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                          isActive 
                            ? 'bg-purple-50/80 border-purple-400 shadow-xs ring-1 ring-purple-400/30' 
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                        id={`menu_marketer_item_${item.id}`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-purple-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 group-hover:bg-purple-100 group-hover:text-purple-900'
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
                  <span>Withdrawable Cash: <strong className="text-emerald-700 font-mono font-bold">₦{availableCommissionCash.toLocaleString()}</strong></span>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] uppercase tracking-wider"
                  >
                    Close Menu ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key 4-Grid Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Real Earned Commissions Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Earned Commissions</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
                ₦{earnedCommissions.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500">
                100% Real Earned Cash
              </p>
              <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1 font-semibold bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Direct Treasury Settlement</span>
              </div>
            </div>

            {/* Downline Paid Investor Volume Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Real Capital Inflow</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                ₦{totalDownlineVolume.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-500">
                Funded by your {realPaidDownline.length} real investor{realPaidDownline.length === 1 ? '' : 's'}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-2">
                Yields 7.5% commission every Friday
              </span>
            </div>

            {/* Total Pipeline Leads Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Leads Pipeline</span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {myDownline.length}
              </h3>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="text-emerald-700 font-bold font-mono">
                  {realPaidDownline.length} Real Paid
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-mono">
                  {unfundedLeads.length} Unfunded
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('downline')}
                className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Leads List</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Promotional Canvassing Demo Budget */}
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-900 font-bold uppercase tracking-wider">Canvassing Demo Budget</span>
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-purple-900 font-mono mt-1">
                ₦{promotionalDemoBudget.toLocaleString()}
              </h3>
              <p className="text-[11px] text-purple-800">
                Demo Allocation • Used for live pitches
              </p>
              <span className="text-[10px] text-purple-900 bg-purple-200/60 px-2 py-0.5 rounded font-mono font-bold inline-block mt-2">
                Not a platform financial liability
              </span>
            </div>
          </div>

          {/* Quick Action Banner: Client Pitch & WhatsApp Referral */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                  Ready to Pitch a New Investor?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Use our Interactive Client Presentation mode to walk potential investors through real Treasure Homes properties and calculated 4-week yields.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('presentation')}
                className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Presentation Mode</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share WhatsApp Pitch</span>
              </a>
            </div>
          </div>

          {/* Recent Downline Activity Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Your Latest Referral Conversions
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Investors who registered under code <strong className="font-mono text-slate-800">{currentUser.referralCode}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('downline')}
                className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                View All ({myDownline.length}) →
              </button>
            </div>

            {myDownline.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                <p className="font-bold text-slate-700">No leads registered yet.</p>
                <p>Share your invite link with your contacts to start building your sales pipeline!</p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Copy Your Referral Link
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-2.5">Investor Name</th>
                      <th className="pb-2.5">Registered</th>
                      <th className="pb-2.5 text-center">Investor Status</th>
                      <th className="pb-2.5 text-right">Paid Wallet Top-Up</th>
                      <th className="pb-2.5 text-right">Your 7.5% Yield Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {downlineWithStats.slice(0, 5).map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-semibold text-slate-900">
                          {lead.name}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">{lead.email}</span>
                        </td>
                        <td className="py-3 text-[11px] font-mono text-slate-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-center">
                          {lead.isRealPaidInvestor ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                              VERIFIED REAL INVESTOR
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">
                              UNFUNDED LEAD
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">
                          ₦{lead.totalDeposited.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600">
                          {lead.totalDeposited > 0 ? `+₦${Math.round(lead.totalDeposited * 0.075).toLocaleString()}/wk` : '₦0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY DOWNLINE TAB */}
      {activeTab === 'downline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Downline Investor Directory ({myDownline.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Segregated list of investors referred by your promotional code. Follow up with unfunded leads to convert them into real investors.
              </p>
            </div>

            <div className="relative w-full sm:w-64 text-xs">
              <input
                type="text"
                placeholder="Search leads by name, email, phone..."
                value={searchDownline}
                onChange={(e) => setSearchDownline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Verified Real Investors</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 block">{realPaidDownline.length}</span>
              <span className="text-[10px] text-emerald-600">Funded their wallets with real capital</span>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Unfunded Leads</span>
              <span className="text-xl font-extrabold text-amber-700 font-mono mt-0.5 block">{unfundedLeads.length}</span>
              <span className="text-[10px] text-amber-600">Registered • Awaiting first deposit</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase block">Total Downline Capital</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
                ₦{totalDownlineVolume.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">Cumulative paid deposit volume</span>
            </div>
          </div>

          {/* Table */}
          {filteredDownline.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-700">No matching leads found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching with a different name or email.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2.5">Lead / Investor</th>
                    <th className="pb-2.5">Phone Contact</th>
                    <th className="pb-2.5 text-center">Investor Classification</th>
                    <th className="pb-2.5 text-right">Lifetime Paid Top-Up</th>
                    <th className="pb-2.5 text-center">Active Plans</th>
                    <th className="pb-2.5 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDownline.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{lead.email}</div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-600">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="hover:text-amber-600 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-slate-400" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">Not provided</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {lead.isRealPaidInvestor ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            VERIFIED REAL INVESTOR
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            UNFUNDED LEAD
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">
                        ₦{lead.totalDeposited.toLocaleString()}
                      </td>
                      <td className="py-3 text-center font-mono">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                          {lead.activePlansCount}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {lead.phone ? (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}! This is ${currentUser.name} from PM Invest / Treasure Homes. How is your investment setup going? Let me know if you need assistance funding your wallet!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg text-[10px] inline-flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp Follow-up</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">No phone</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CLIENT PRESENTATION MODE TAB */}
      {activeTab === 'presentation' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <PmLogo className="w-12 h-12" />
                <div>
                  <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase font-bold block">
                    TREASURE HOMES ACCREDITED PRESENTATION SUITE
                  </span>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-white">
                    PM Invest Property Plans &amp; Returns Catalog
                  </h2>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
                <span>Presenter ID: </span>
                <strong className="text-amber-400">{currentUser.referralCode}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Use this screen when presenting to prospective investors in person or via video call. Explain the 4-week structured investment cycle and cash returns backed by verified property developments.
            </p>
          </div>

          {/* Interactive Calculator for Clients */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Interactive Returns Calculator (4-Week Cycles)
            </h3>

            {/* Plan Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {INVESTMENT_PLANS.map((plan) => {
                const isSelected = selectedPlanCalc.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanCalc(plan)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-400/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">{plan.name}</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono block mt-0.5">
                      ₦{plan.cost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                      +₦{plan.weeklyPayout.toLocaleString()}/wk
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Plan Calculation Breakdown Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Property Acquisition Cost</span>
                <h4 className="text-2xl font-extrabold text-white font-mono">
                  ₦{selectedPlanCalc.cost.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-400">100% principal allocated to Treasure Homes development</p>
              </div>

              <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-800 py-4 md:py-0 md:px-6">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">Weekly Friday Cash Payout</span>
                <h4 className="text-2xl font-extrabold text-emerald-400 font-mono">
                  ₦{selectedPlanCalc.weeklyPayout.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-400">Paid 4 consecutive Fridays into the investor's wallet</p>
              </div>

              <div className="space-y-1 md:pl-2">
                <span className="text-[10px] text-amber-400 font-mono uppercase block">Total 4-Week Net Return</span>
                <h4 className="text-2xl font-extrabold text-amber-400 font-mono">
                  ₦{selectedPlanCalc.totalReturns.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-400">Total cash collected across the 4-week property cycle</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PITCH ASSETS & BOUNTIES TAB */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Share2 className="w-5 h-5 text-purple-600" />
              Marketing Assets &amp; Quick Sharing Tools
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Tool */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">One-Click WhatsApp Broadcast</span>
                </div>
                <p className="text-xs text-slate-600">
                  Send a pre-formatted message explaining the Treasure Homes weekly Friday cash yield directly to your contacts and WhatsApp status.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 w-full"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </a>
              </div>

              {/* Direct Referral Link Copy */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">Direct Invite Link</span>
                </div>
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 w-full cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
