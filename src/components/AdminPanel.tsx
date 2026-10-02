import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  FileText, 
  Settings, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  Lock,
  Sparkles,
  Search,
  Settings2,
  Hourglass,
  Flame,
  Building2,
  CalendarCheck,
  BarChart3,
  Share2,
  Award,
  CheckCircle2,
  Zap,
  Edit3,
  UserPlus,
  UserCheck,
  UserX,
  ShieldBan,
  Database,
  Copy,
  Code2,
  CheckCheck,
  Clock
} from 'lucide-react';
import { User, INVESTMENT_PLANS } from '../types';
import { FULL_SUPABASE_SQL, SUPABASE_CORE_SQL } from '../data/supabaseSql';
import { PmLogo } from './PmLogo';
import { LiveReserveCounter } from './LiveReserveCounter';

export const AdminPanel: React.FC = () => {
  const { 
    currentUser,
    users, 
    investments, 
    transactions, 
    settings, 
    dailyTasks, 
    taskSubmissions,
    virtualDate,
    approveDeposit, 
    rejectDeposit, 
    approveWithdrawal, 
    rejectWithdrawal, 
    reviewKyc, 
    updateSettings, 
    approveTaskSubmission,
    rejectTaskSubmission,
    adminCreateUser,
    adminToggleUserStatus,
    adminUpdateUser,
    adminTopUpMarketingWallet,
    adminToggleMarketingStatus,
    switchUser,
    simulateWeek,
    simulateNextDay,
    resetAll,
    successMsg,
    errorMsg,
    clearMessages,
    supabaseStatus,
    lastSyncedAt,
    getSupabaseConfig,
    saveSupabaseCredentials,
    refreshFromSupabase
  } = useAppState();

  const [adminTab, setAdminTab] = useState<'analytics' | 'deposits' | 'withdrawals' | 'tasks' | 'users' | 'kyc' | 'settings'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutConfirmationInput, setPayoutConfirmationInput] = useState('');
  const [depositAdjustedAmounts, setDepositAdjustedAmounts] = useState<Record<string, string>>({});

  // Supabase Database Connection Modal State
  const [showDbConfigModal, setShowDbConfigModal] = useState(false);
  const [dbUrlInput, setDbUrlInput] = useState(() => getSupabaseConfig().url);
  const [dbKeyInput, setDbKeyInput] = useState(() => getSupabaseConfig().key);
  const [dbSaveNotice, setDbSaveNotice] = useState<string | null>(null);
  const [showSqlScriptModal, setShowSqlScriptModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [selectedSqlTab, setSelectedSqlTab] = useState<'core' | 'full'>('core');

  const handleCopySql = () => {
    const textToCopy = selectedSqlTab === 'core' ? SUPABASE_CORE_SQL : FULL_SUPABASE_SQL;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  // Admin User & Wallet Edit State
  const [selectedEditUser, setSelectedEditUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserBalance, setEditUserBalance] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin'>('user');
  const [editUserKyc, setEditUserKyc] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserIsDeactivated, setEditUserIsDeactivated] = useState(false);
  const [editUserIsMarketing, setEditUserIsMarketing] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [adminScreenshotPreview, setAdminScreenshotPreview] = useState<string | null>(null);

  // Admin Create New User State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserName, setCreateUserName] = useState('');
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserPhone, setCreateUserPhone] = useState('');
  const [createUserPassword, setCreateUserPassword] = useState('password123');
  const [createUserBalance, setCreateUserBalance] = useState('0');
  const [createUserRole, setCreateUserRole] = useState<'user' | 'admin'>('user');
  const [createUserKyc, setCreateUserKyc] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('verified');
  const [createUserIsDeactivated, setCreateUserIsDeactivated] = useState(false);
  const [createUserIsMarketing, setCreateUserIsMarketing] = useState(false);
  const [createUserSponsorCode, setCreateUserSponsorCode] = useState('');
  const [createUserRefCode, setCreateUserRefCode] = useState('');
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Marketing Canvassing Quick Top-Up Modal State
  const [showMarketingTopUpModal, setShowMarketingTopUpModal] = useState(false);
  const [marketingTopUpUser, setMarketingTopUpUser] = useState<User | null>(null);
  const [marketingTopUpAmount, setMarketingTopUpAmount] = useState('115000');
  const [marketingTopUpNotes, setMarketingTopUpNotes] = useState('Marketing Canvassing Allocation');

  // User Filter & In-App Deactivation Modal State
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'real_paid' | 'unfunded' | 'marketing' | 'active' | 'deactivated' | 'admin'>('all');
  const [deactivateModalTarget, setDeactivateModalTarget] = useState<{ user: User; willDeactivate: boolean } | null>(null);

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);
    const parsedBal = parseFloat(createUserBalance);
    const res = adminCreateUser({
      name: createUserName,
      email: createUserEmail,
      phone: createUserPhone.trim() ? createUserPhone.trim() : undefined,
      password: createUserPassword.trim() ? createUserPassword.trim() : 'password123',
      walletBalance: !isNaN(parsedBal) ? parsedBal : 0,
      role: createUserRole,
      kycStatus: createUserKyc,
      isDeactivated: createUserIsDeactivated,
      isMarketingAccount: createUserIsMarketing,
      referredByCode: createUserSponsorCode.trim() ? createUserSponsorCode.trim() : undefined,
      referralCode: createUserRefCode.trim() ? createUserRefCode.trim() : undefined
    });
    if (res.success) {
      setShowCreateUserModal(false);
      setCreateUserName('');
      setCreateUserEmail('');
      setCreateUserPhone('');
      setCreateUserPassword('password123');
      setCreateUserBalance('0');
      setCreateUserRole('user');
      setCreateUserKyc('verified');
      setCreateUserIsDeactivated(false);
      setCreateUserIsMarketing(false);
      setCreateUserSponsorCode('');
      setCreateUserRefCode('');
    } else {
      setCreateUserError(res.message);
    }
  };

  const handleOpenDeactivateModal = (targetUser: User) => {
    setDeactivateModalTarget({
      user: targetUser,
      willDeactivate: !targetUser.isDeactivated
    });
  };

  const handleConfirmToggleDeactivate = () => {
    if (!deactivateModalTarget) return;
    adminToggleUserStatus(deactivateModalTarget.user.id, deactivateModalTarget.willDeactivate);
    setDeactivateModalTarget(null);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditUser) return;
    const parsedBal = parseFloat(editUserBalance);
    const success = adminUpdateUser(selectedEditUser.id, {
      name: editUserName,
      walletBalance: !isNaN(parsedBal) ? parsedBal : selectedEditUser.walletBalance,
      role: editUserRole,
      kycStatus: editUserKyc,
      phone: editUserPhone.trim() ? editUserPhone.trim() : undefined,
      isDeactivated: editUserIsDeactivated,
      isMarketingAccount: editUserIsMarketing,
      password: editUserPassword.trim() ? editUserPassword.trim() : undefined
    });
    if (success) {
      setShowEditUserModal(false);
      setSelectedEditUser(null);
    }
  };

  // Stats
  const activeInvestments = investments.filter(i => i.status === 'active');
  const realActiveInvestments = activeInvestments.filter(i => !i.isMarketing);
  const marketingActiveInvestments = activeInvestments.filter(i => !!i.isMarketing);

  const realActiveCapital = realActiveInvestments.reduce((sum, i) => sum + i.cost, 0);
  const marketingActiveCapital = marketingActiveInvestments.reduce((sum, i) => sum + i.cost, 0);
  // Marketers amount does not count as capital: Total Capital Under Management is 100% Real Organic Investor Capital
  const totalActiveCapital = realActiveCapital;

  // Helper: calculate total paid completed top-up deposits for any user
  const getUserPaidTopup = (userId: string) => {
    return transactions
      .filter(t => t.userId === userId && t.type === 'deposit' && t.status === 'completed' && !t.isMarketing)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Real Inflow: Sums all real paid wallet top-ups across the platform
  const totalRealInflow = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed' && !t.isMarketing)
    .reduce((sum, t) => sum + t.amount, 0);

  // Marketing promotional allocations
  const totalMarketingAllocations = users
    .filter(u => !!u.isMarketingAccount)
    .reduce((sum, u) => sum + (u.marketingAllocatedBalance || 0), 0);

  const totalAccumulatedPayouts = transactions
    .filter(t => (t.type === 'payout' || t.type === 'referral_bonus') && t.status === 'completed' && !t.isMarketing)
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const pendingKycs = users.filter(u => u.kycStatus === 'pending');
  const pendingTaskSubmissions = taskSubmissions.filter(s => s.status === 'pending');

  const totalRegisteredUsers = users.length;
  const marketingUsersCount = users.filter(u => !!u.isMarketingAccount).length;
  
  // Real Investors (Paid): users who completed wallet top-ups (excluding marketers & admins)
  const realPaidInvestors = users.filter(u => !u.isMarketingAccount && u.role !== 'admin' && getUserPaidTopup(u.id) > 0);
  const realPaidInvestorsCount = realPaidInvestors.length;

  // Unfunded Leads: registered users who haven't made their first deposit yet
  const unfundedLeads = users.filter(u => !u.isMarketingAccount && u.role !== 'admin' && getUserPaidTopup(u.id) === 0);
  const unfundedLeadsCount = unfundedLeads.length;

  const realUsersCount = realPaidInvestorsCount; // Preserved for legacy display
  const activeUsersCount = users.filter(u => !u.isDeactivated && u.role !== 'admin').length;
  const deactivatedUsersCount = users.filter(u => !!u.isDeactivated).length;
  const adminUsersCount = users.filter(u => u.role === 'admin').length;
  const totalInvestorBalances = users.filter(u => u.role !== 'admin').reduce((sum, u) => sum + u.walletBalance, 0);
  const realInvestorBalances = users.filter(u => !u.isMarketingAccount && u.role !== 'admin').reduce((sum, u) => sum + u.walletBalance, 0);
  const marketingBalances = users.filter(u => !!u.isMarketingAccount).reduce((sum, u) => sum + u.walletBalance, 0);

  // Filter users by search and status filter
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase().trim();
    const matchesSearch = !q || (
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      u.referralCode.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );

    if (!matchesSearch) return false;
    if (userStatusFilter === 'real_paid') return !u.isMarketingAccount && u.role !== 'admin' && getUserPaidTopup(u.id) > 0;
    if (userStatusFilter === 'unfunded') return !u.isMarketingAccount && u.role !== 'admin' && getUserPaidTopup(u.id) === 0;
    if (userStatusFilter === 'marketing') return !!u.isMarketingAccount;
    if (userStatusFilter === 'active') return !u.isDeactivated;
    if (userStatusFilter === 'deactivated') return !!u.isDeactivated;
    if (userStatusFilter === 'admin') return u.role === 'admin';
    return true;
  });

  return (
    <div className="w-full text-slate-800 p-1" id="admin_panel_container">
      {/* Admin Action Bar */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <PmLogo className="w-10 h-10" />
          <div>
            <span className="text-[10px] text-amber-600 font-mono tracking-widest block uppercase font-extrabold">Treasure Homes Control Centre</span>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
              PM Invest Master Dashboard
            </h2>
          </div>
        </div>

        {/* Live Simulator Quick Trigger & Quick Account Creator */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCreateUserError(null);
              setShowCreateUserModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            id="btn_admin_header_create_user"
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-600 hover:text-emerald-800 font-medium text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {/* Admin sub-tabs */}
      <div className="flex flex-wrap overflow-x-auto pb-1 mb-6 border-b border-slate-200 gap-1">
        <button
          onClick={() => { setAdminTab('analytics'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'analytics'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_analytics"
        >
          Analytics
        </button>
        <button
          onClick={() => { setAdminTab('deposits'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'deposits'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_deposits"
        >
          Deposits {pendingDeposits.length > 0 && <span className="bg-amber-500 text-slate-950 font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0">{pendingDeposits.length}</span>}
        </button>
        <button
          onClick={() => { setAdminTab('withdrawals'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'withdrawals'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_withdrawals"
        >
          Withdrawals {pendingWithdrawals.length > 0 && <span className="bg-rose-600 text-white font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0">{pendingWithdrawals.length}</span>}
        </button>
        <button
          onClick={() => { setAdminTab('kyc'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'kyc'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_kyc"
        >
          KYC Audits {pendingKycs.length > 0 && <span className="bg-amber-500 text-slate-950 font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0">{pendingKycs.length}</span>}
        </button>
        <button
          onClick={() => { setAdminTab('tasks'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'tasks'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_tasks"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Daily Tasks</span>
          {pendingTaskSubmissions.length > 0 && (
            <span className="bg-purple-600 text-white font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0 animate-pulse">
              {pendingTaskSubmissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setAdminTab('users'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'users'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_users"
        >
          Users List ({users.length})
        </button>
        <button
          onClick={() => { setAdminTab('settings'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'settings'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_settings"
        >
          Controls
        </button>
      </div>

      {/* ANALYTICS SUB-TAB */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          {/* Liquidity Reserve Status Bar */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase font-medium">Security Compliance Level</span>
              <h3 className="text-xl font-extrabold text-slate-900">TREASURE HOMES LIQUIDITY RESERVE GUARANTEE</h3>
              <p className="text-xs text-slate-500 max-w-lg">
                Institutional cash reserve dedicated to underwriting weekly investor yields and immediate bank payout execution.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
              <span className="text-xs text-amber-600 font-bold block">ACTIVE LIQUIDITY RESERVE</span>
              <div className="mt-1 flex justify-center">
                <LiveReserveCounter precision={0} showRateBadge={false} showLivePulse={true} size="xl" className="text-slate-900 font-extrabold" />
              </div>
              <span className={`inline-block mt-2 px-3 py-0.5 rounded text-[10px] font-mono font-bold ${
                settings.riskAlertLevel === 'low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                settings.riskAlertLevel === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
              }`}>
                RISK ALERT LEVEL: {settings.riskAlertLevel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium block font-mono">Total Capital Under Mgmt</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded font-mono">Real Funded</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₦{totalActiveCapital.toLocaleString()}</h3>
              <div className="pt-1.5 border-t border-slate-100 text-[10px] space-y-0.5">
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Real Organic Capital:</span>
                  <span className="font-mono">₦{realActiveCapital.toLocaleString()}</span>
                </div>
                {marketingActiveCapital > 0 && (
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Marketer Demo Alloc (Excluded):</span>
                    <span className="font-mono text-slate-400 line-through">₦{marketingActiveCapital.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 font-medium block font-mono">Accumulated Payout Yields</span>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">₦{totalAccumulatedPayouts.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Real payouts & ref bonuses</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 font-medium block font-mono">Pending Authorizations</span>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingDeposits.length + pendingWithdrawals.length}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{pendingDeposits.length} deposits | {pendingWithdrawals.length} withdrawals</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium block font-mono">Platform Accounts ({totalRegisteredUsers})</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-emerald-700 font-mono">{realPaidInvestorsCount}</span>
                <span className="text-xs text-emerald-800 font-semibold font-mono">Real Paid</span>
              </div>
              <div className="pt-1.5 border-t border-slate-100 text-[10px] space-y-0.5">
                <div className="flex justify-between text-slate-600">
                  <span>Unfunded Leads:</span>
                  <span className="font-bold text-amber-700 font-mono">{unfundedLeadsCount}</span>
                </div>
                <div className="flex justify-between text-purple-700 font-semibold">
                  <span>Marketing Canvassers:</span>
                  <span className="font-bold font-mono">{marketingUsersCount}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold pt-0.5 border-t border-slate-100">
                  <span>Real Paid Inflow:</span>
                  <span className="font-mono">₦{totalRealInflow.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Capital Distribution across Plans */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Plan Distribution & Exposure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {INVESTMENT_PLANS.map(plan => {
                const realCount = investments.filter(i => i.planId === plan.id && i.status === 'active' && !i.isMarketing).length;
                const marketingCount = investments.filter(i => i.planId === plan.id && i.status === 'active' && !!i.isMarketing).length;
                return (
                  <div key={plan.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">{plan.name}</span>
                    <span className="text-slate-500 text-[10px] block">Cost: ₦{plan.cost.toLocaleString()}</span>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-emerald-600 font-medium">Real: {realCount}</span>
                      <span className="font-bold text-slate-900">₦{(realCount * plan.cost).toLocaleString()}</span>
                    </div>
                    {marketingCount > 0 && (
                      <span className="text-[9px] text-slate-400 font-mono block pt-0.5">
                        +{marketingCount} demo (excluded)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DEPOSITS LIST SUB-TAB */}
      {adminTab === 'deposits' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Pending Reserve Deposits ({pendingDeposits.length})</span>
            <span className="text-xs text-slate-500 font-mono">Require manual confirmation of reserve receipt</span>
          </h3>

          {pendingDeposits.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No pending deposits require verification.</p>
          ) : (
            <div className="space-y-4">
              {pendingDeposits.map((tx) => {
                const currentValStr = depositAdjustedAmounts[tx.id] !== undefined ? depositAdjustedAmounts[tx.id] : String(tx.amount);
                const currentNum = Number(currentValStr);
                const isAdjusted = !isNaN(currentNum) && currentNum > 0 && currentNum !== tx.amount;

                return (
                  <div key={tx.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">Claimed: ₦{tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">by {tx.userName}</span>
                        {isAdjusted && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded-full">
                            Adjusted to ₦{currentNum.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">Method: <strong className="text-slate-900 font-medium">{tx.paymentMethod}</strong> | Account details: <strong className="text-slate-900 font-medium">{tx.accountDetails}</strong></p>
                      <p className="text-slate-400 text-[10px] font-mono">ID: {tx.id} | Submitted: {new Date(tx.createdAt).toLocaleString()}</p>
                      
                      {/* Editable field for Admin to match true bank receipt */}
                      <div className="pt-2 flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <label className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                          Reconciled Bank Amount (₦):
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1000"
                          value={currentValStr}
                          onChange={(e) => setDepositAdjustedAmounts(prev => ({ ...prev, [tx.id]: e.target.value }))}
                          className="w-36 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          title="If the investor typed a wrong amount or bank fees apply, edit here to credit the exact receipt amount"
                        />
                        {isAdjusted && (
                          <button
                            type="button"
                            onClick={() => setDepositAdjustedAmounts(prev => {
                              const next = { ...prev };
                              delete next[tx.id];
                              return next;
                            })}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline font-mono"
                          >
                            Reset to Original
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Receipt display & actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      {tx.proofUrl && (
                        <a href={tx.proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-amber-600 hover:underline hover:text-amber-800 font-semibold">
                          <Eye className="w-3.5 h-3.5" /> View Receipt Proof
                        </a>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const finalToCredit = (!isNaN(currentNum) && currentNum > 0) ? currentNum : tx.amount;
                            approveDeposit(tx.id, finalToCredit);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          id={`btn_approve_dep_${tx.id}`}
                          title={isAdjusted ? `Approve adjusted amount ₦${currentNum.toLocaleString()}` : `Approve ₦${tx.amount.toLocaleString()}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAdjusted ? `Approve ₦${currentNum.toLocaleString()}` : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => rejectDeposit(tx.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer"
                          id={`btn_reject_dep_${tx.id}`}
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WITHDRAWALS LIST SUB-TAB */}
      {adminTab === 'withdrawals' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Pending Withdrawal Clearance ({pendingWithdrawals.length})</span>
            <span className="text-xs text-slate-500 font-mono">Verify liquidity limits & transfer payout manually</span>
          </h3>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No pending withdrawals requiring compliance review.</p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((tx) => {
                const user = users.find(u => u.id === tx.userId);
                const isKycVerified = user?.kycStatus === 'verified';
                return (
                  <div key={tx.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">₦{tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">by {tx.userName}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          isKycVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isKycVerified ? 'KYC VERIFIED' : 'KYC UNVERIFIED'}
                        </span>
                        {(user?.isMarketingAccount || tx.isMarketing) && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded font-mono bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
                            DEMO WITHDRAWAL — DO NOT WIRE REAL FUNDS
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">Receiving account: <strong className="text-slate-900 font-mono font-medium">{tx.accountDetails}</strong></p>
                      <p className="text-slate-400 text-[10px] font-mono">ID: {tx.id} | Requested: {new Date(tx.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveWithdrawal(tx.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3.5 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
                        id={`btn_approve_with_${tx.id}`}
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Mark Disbursed
                      </button>
                      <button
                        onClick={() => rejectWithdrawal(tx.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                        id={`btn_reject_with_${tx.id}`}
                      >
                        <X className="w-3.5 h-3.5" /> Reject & Refund
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* KYC AUDITS TAB */}
      {adminTab === 'kyc' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Identity Verification Compliance Reviews ({pendingKycs.length})
          </h3>

          {pendingKycs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No pending KYC files awaiting review.</p>
          ) : (
            <div className="space-y-4">
              {pendingKycs.map((u) => (
                <div key={u.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                    <p className="text-slate-600 font-mono">Email: {u.email} | Code: {u.referralCode}</p>
                    <div className="bg-white border border-slate-200 p-3 rounded-lg text-[11px] text-slate-700 mt-2 font-mono">
                      <p><strong>• Legal Name:</strong> {u.kycDetails?.fullName}</p>
                      <p><strong>• Document Type:</strong> {u.kycDetails?.idType}</p>
                      <p><strong>• Document ID:</strong> {u.kycDetails?.idNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => reviewKyc(u.id, true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3.5 py-1.5 transition-colors"
                      id={`btn_approve_kyc_${u.id}`}
                    >
                      <Check className="w-3.5 h-3.5" /> Accept KYC
                    </button>
                    <button
                      onClick={() => reviewKyc(u.id, false)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg px-3.5 py-1.5 transition-colors"
                      id={`btn_reject_kyc_${u.id}`}
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SYSTEM CONTROLS TAB */}
      {adminTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-amber-500" /> System Settings & Stability Controls
          </h3>

          <div className="space-y-5 text-xs">
            {/* Auto approve deposits toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Automated Deposit Approvals</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Skip manual reserve confirmation and credit payments instantly.</p>
              </div>
              <button
                onClick={() => updateSettings({ autoApproveDeposits: !settings.autoApproveDeposits })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                  settings.autoApproveDeposits ? 'bg-amber-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_auto_approve"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.autoApproveDeposits ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Pause New Investments toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Pause New Investments</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Prevent users from purchasing any new investment plans. Existing plans still earn weekly yields.</p>
              </div>
              <button
                onClick={() => updateSettings({ pauseInvestments: !settings.pauseInvestments })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                  settings.pauseInvestments ? 'bg-amber-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_pause_investments"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.pauseInvestments ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Pause Withdrawals toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Pause Withdrawals</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Temporarily freeze new withdrawal requests during system updates or balance audits.</p>
              </div>
              <button
                onClick={() => updateSettings({ pauseWithdrawals: !settings.pauseWithdrawals })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative cursor-pointer ${
                  settings.pauseWithdrawals ? 'bg-rose-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_pause_withdrawals"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.pauseWithdrawals ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Live Purchase & Activity Pop-ups Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Live Purchase & Activity Pop-ups</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Show real-time and subtle simulated investor purchase & payout pop-ups (social proof toasts) to boost conversion.</p>
              </div>
              <button
                onClick={() => updateSettings({ enableLiveActivityToasts: settings.enableLiveActivityToasts === false ? true : false })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative cursor-pointer ${
                  settings.enableLiveActivityToasts !== false ? 'bg-amber-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_live_activity"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.enableLiveActivityToasts !== false ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Minimum / Maximum Withdrawal sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-medium text-slate-700 block">Min Withdrawal (₦)</span>
                <input 
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => updateSettings({ minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-slate-900 font-semibold text-xs font-mono"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-medium text-slate-700 block">Max Withdrawal (₦)</span>
                <input 
                  type="number"
                  value={settings.maxWithdrawal}
                  onChange={(e) => updateSettings({ maxWithdrawal: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-slate-900 font-semibold text-xs font-mono"
                />
              </div>
            </div>

            {/* Daily Task Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Daily Task Economy Settings
              </h4>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Enable Daily Task System</p>
                  <p className="text-slate-500 text-[10px]">Allow users to access daily property inspection audits and check-ins for yield bonuses.</p>
                </div>
                <button
                  onClick={() => updateSettings({ dailyTaskEnabled: !settings.dailyTaskEnabled })}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                    settings.dailyTaskEnabled ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                  type="button"
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                    settings.dailyTaskEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Daily Bonus Rate</span>
                  <select
                    value={settings.dailyTaskBonusRate ?? 0.05}
                    onChange={(e) => updateSettings({ dailyTaskBonusRate: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  >
                    <option value={0.03}>3% of Weekly Payout</option>
                    <option value={0.05}>5% of Weekly Payout (Recommended)</option>
                    <option value={0.08}>8% of Weekly Payout</option>
                    <option value={0.10}>10% of Weekly Payout</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Base Pool (Non-Investors)</span>
                  <input
                    type="number"
                    value={settings.dailyTaskBaseReward ?? 200}
                    onChange={(e) => updateSettings({ dailyTaskBaseReward: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">7-Day Consistency Bonus</span>
                  <input
                    type="number"
                    value={settings.dailyTaskStreakBonus ?? 1500}
                    onChange={(e) => updateSettings({ dailyTaskStreakBonus: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Free Trial Limit & Monetization Engine Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-950 block">Free Starter Cashout Limit</span>
                    <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">₦3,000 Cap</span>
                  </div>
                  <input
                    type="number"
                    value={settings.freeStarterWithdrawalLimit ?? 3000}
                    onChange={(e) => updateSettings({ freeStarterWithdrawalLimit: Number(e.target.value) })}
                    className="w-full bg-white border border-amber-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                  <p className="text-[10px] text-amber-800">Max trial withdrawal before requiring investment upgrade.</p>
                </div>

                <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 block">Rewarded Ad Boost Multiplier</span>
                    <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-mono font-bold">2X Multiplier</span>
                  </div>
                  <select
                    value={settings.rewardedAdBonusMultiplier ?? 2}
                    onChange={(e) => updateSettings({ rewardedAdBonusMultiplier: Number(e.target.value) })}
                    className="w-full bg-white border border-purple-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  >
                    <option value={1.5}>1.5X Yield</option>
                    <option value={2}>2.0X Yield (Standard 100% Boost)</option>
                    <option value={2.5}>2.5X Yield</option>
                  </select>
                  <p className="text-[10px] text-purple-800">Bonus paid on 12-second sponsor video completion.</p>
                </div>

                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 block">Ad Revenue Pool</span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">Self-Funding</span>
                  </div>
                  <div className="text-base font-extrabold font-mono text-emerald-700">
                    ₦{(settings.estimatedAdRevenueTotal || 284500).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-emerald-800">100% sponsor-funded ad income covering free task yields.</p>
                </div>
              </div>
            </div>

            {/* Cloud Database & Live Realtime Sync Status Card */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" /> Database & Live Cloud Synchronization
              </h4>

              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Supabase Connection:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                      supabaseStatus === 'connected'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : supabaseStatus === 'loading'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                      {supabaseStatus === 'connected' ? 'LIVE REALTIME CONNECTED' : supabaseStatus === 'loading' ? 'CONNECTING...' : 'LOCAL STORAGE MODE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {supabaseStatus === 'connected'
                      ? `Multi-device live syncing active via WebSockets. All deposits, withdrawals, and registrations update across all screens in real time. Last sync: ${lastSyncedAt || 'Just now'}.`
                      : 'The app is currently running in local storage fallback mode. Connect your Supabase project below to sync all investors, plans, and payouts live across all devices.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {supabaseStatus === 'connected' && (
                    <button
                      type="button"
                      onClick={() => refreshFromSupabase()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Force a refresh from Supabase"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Sync Now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSqlScriptModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="View and copy the full Supabase SQL script that syncs all user and admin build functions"
                  >
                    <Code2 className="w-3.5 h-3.5 text-amber-400" /> Supabase SQL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cfg = getSupabaseConfig();
                      setDbUrlInput(cfg.url);
                      setDbKeyInput(cfg.key);
                      setDbSaveNotice(null);
                      setShowDbConfigModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {supabaseStatus === 'connected' ? 'Manage Connection' : 'Connect Supabase'}
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsed Developer Utilities & Maintenance Section */}
            <div className="pt-4 border-t border-slate-200">
              <details className="group border border-slate-200 rounded-2xl bg-slate-50/70 overflow-hidden shadow-xs">
                <summary className="p-4 cursor-pointer select-none flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-700 hover:text-slate-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Developer Utilities & Maintenance (Timeline Simulator & System Reset)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono font-normal lowercase group-open:hidden">click to expand</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal lowercase hidden group-open:inline">click to collapse</span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>

                <div className="p-4 pt-2 border-t border-slate-200/80 bg-white space-y-4">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    These utilities are reserved for administrative testing, staging simulations, and maintenance. Every operation is guarded behind a mandatory verification word prompt to prevent accidental execution.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* Weekly Payout Simulator */}
                    <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-amber-600" />
                          <h5 className="font-bold text-xs text-amber-950 uppercase tracking-wide">Weekly Payout Simulator</h5>
                        </div>
                        <p className="text-[11px] text-amber-900/80 mt-1 leading-normal">
                          Fast-forwards the platform timeline by 1 week to test Friday payouts, 4-week countdown rollovers, and 7.5% referral sponsor commissions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPayoutConfirmationInput('');
                          setShowPayoutModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        id="btn_simulate_week_admin"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Trigger Weekly Payout Cycle
                      </button>
                    </div>

                    {/* Reset Database */}
                    <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <h5 className="font-bold text-xs text-rose-950 uppercase tracking-wide">Reset Database</h5>
                        </div>
                        <p className="text-[11px] text-rose-900/80 mt-1 leading-normal">
                          Destructive action: erases all users, investments, transactions, and daily progress, returning database state to clean baseline.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setResetConfirmationInput('');
                          setShowResetModal(true);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        id="btn_reset_platform"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Reset Database
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}


      {/* DAILY TASKS MANAGEMENT SUB-TAB */}
      {adminTab === 'tasks' && (
        <div className="space-y-6">
          {/* Economy Overview & Controls Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] text-amber-600 font-mono font-bold uppercase tracking-wider block">Investor Engagement & Retention</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" /> Daily Task Economy & Balancing Controls
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={simulateNextDay}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors font-mono"
                  id="btn_admin_sim_next_day"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" /> Advance Virtual Day (Midnight Reset)
                </button>
              </div>
            </div>

            {/* Plan Tier Multiplier Matrix */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Live Tier Daily Pool Multipliers ({Math.round((settings.dailyTaskBonusRate ?? 0.05) * 100)}% of Weekly Yield)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {INVESTMENT_PLANS.map((plan) => {
                  const dailyRate = Math.round(plan.weeklyPayout * (settings.dailyTaskBonusRate ?? 0.05));
                  return (
                    <div key={plan.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                      <span className="font-bold text-slate-900 block truncate">{plan.name}</span>
                      <div className="text-slate-500 text-[11px]">
                        Weekly Payout: <strong className="text-slate-800">₦{plan.weeklyPayout.toLocaleString()}</strong>
                      </div>
                      <div className="text-amber-600 font-mono font-bold text-xs pt-1 border-t border-slate-200">
                        Daily Task Pool: ₦{dailyRate.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Toggle & Balancing Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Daily Task System</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {settings.dailyTaskEnabled ? '● Active & Live' : '○ Paused'}
                  </span>
                </div>
                <button
                  onClick={() => updateSettings({ dailyTaskEnabled: !settings.dailyTaskEnabled })}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                    settings.dailyTaskEnabled ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                  type="button"
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                    settings.dailyTaskEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Proportional Bonus Rate</label>
                <select
                  value={settings.dailyTaskBonusRate ?? 0.05}
                  onChange={(e) => updateSettings({ dailyTaskBonusRate: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-slate-900"
                >
                  <option value={0.03}>3% of Weekly Payout</option>
                  <option value={0.05}>5% of Weekly Payout (Standard Option 2)</option>
                  <option value={0.08}>8% of Weekly Payout</option>
                  <option value={0.10}>10% of Weekly Payout</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-bold text-slate-800 block">7-Day Consistency Bonus</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.dailyTaskStreakBonus ?? 1500}
                    onChange={(e) => updateSettings({ dailyTaskStreakBonus: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-mono">NGN</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Task Proof Submissions Audit Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  Social & Growth Proof Submissions ({taskSubmissions.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review proof submitted by investors for growth bounties and credit rewards upon compliance verification.
                </p>
              </div>

              {pendingTaskSubmissions.length > 0 && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono px-3 py-1 rounded-full">
                  {pendingTaskSubmissions.length} Pending Review
                </span>
              )}
            </div>

            {taskSubmissions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No user proof submissions recorded yet. Submissions made via the Growth Bounty will appear here for admin audit.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-2 font-mono">Submitted</th>
                      <th className="pb-2">User / Investor</th>
                      <th className="pb-2">Quest Title</th>
                      <th className="pb-2">Proof / Link Details</th>
                      <th className="pb-2 text-right">Bounty Reward</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-center">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taskSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-mono text-[11px] text-slate-400">
                          {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{sub.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{sub.userEmail}</div>
                        </td>
                        <td className="py-3 font-medium text-slate-800">
                          {sub.taskTitle}
                        </td>
                        <td className="py-3">
                          {(() => {
                            const imgMatch = sub.proof.match(/Image:\s*(data:image\/[^;]+;base64,[^ \]]+)/);
                            const cleanText = sub.proof.replace(/\|\s*Image:\s*data:image\/[^;]+;base64,[^ \]]+/, '').trim();
                            return (
                              <div className="space-y-1.5">
                                {imgMatch && (
                                  <div 
                                    onClick={() => setAdminScreenshotPreview(imgMatch[1])}
                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 cursor-pointer group bg-slate-100 shadow-2xs"
                                    title="Click to view full screenshot"
                                  >
                                    <img src={imgMatch[1]} alt="Proof Screenshot" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                                      View
                                    </div>
                                  </div>
                                )}
                                {cleanText && (
                                  <div className="max-w-xs font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 break-words select-all">
                                    {cleanText}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600">
                          +₦{sub.rewardAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            sub.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {sub.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => approveTaskSubmission(sub.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                                id={`btn_approve_sub_${sub.id}`}
                                title="Approve and credit bounty to user balance"
                              >
                                <Check className="w-3 h-3" /> Approve (+₦{sub.rewardAmount})
                              </button>
                              <button
                                onClick={() => rejectTaskSubmission(sub.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors"
                                id={`btn_reject_sub_${sub.id}`}
                                title="Reject submission"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {sub.status === 'approved' ? 'Audited & Credited' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Quests Catalog Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-amber-500" /> Active Daily Quests Blueprint ({dailyTasks.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dailyTasks.map((t) => (
                <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {t.category.toUpperCase()} • {t.rewardShare > 0 ? `${Math.round(t.rewardShare * 100)}% pool` : `₦${t.fixedReward} fixed`}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1.5">{t.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                    {t.verificationType === 'instant' ? '⚡ Instant' : '📋 Submission'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS LIST TAB */}
      {adminTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Investor & Account Backend Controls
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Register new accounts, adjust balances, modify roles, or deactivate & reactivate account access.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setCreateUserError(null);
                  setShowCreateUserModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                id="btn_admin_open_create_user_modal"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>

              {/* Search Input */}
              <div className="relative w-full sm:w-64 text-xs">
                <input
                  type="text"
                  placeholder="Search name, email, phone, code..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Quick Backend Summary Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Total Accounts</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">{users.length}</span>
              <span className="text-[10px] text-slate-400">All registered profiles</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Verified Real Investors</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5 block">{realPaidInvestorsCount}</span>
              <span className="text-[10px] text-emerald-700 font-semibold block truncate">₦{totalRealInflow.toLocaleString()} Total Paid Inflow</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Unfunded Leads</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xl font-extrabold text-amber-700 font-mono mt-0.5 block">{unfundedLeadsCount}</span>
              <span className="text-[10px] text-amber-600">Awaiting first wallet deposit</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Marketing Canvassers</span>
                <Zap className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-xl font-extrabold text-purple-800 font-mono mt-0.5 block">{marketingUsersCount}</span>
              <span className="text-[10px] text-purple-700 truncate block">₦{totalMarketingAllocations.toLocaleString()} Demo Allocations</span>
            </div>
          </div>

          {/* Filter Segment Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setUserStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                userStatusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Accounts ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setUserStatusFilter('real_paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                userStatusFilter === 'real_paid'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Real Investors (Paid) ({realPaidInvestorsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setUserStatusFilter('unfunded')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                userStatusFilter === 'unfunded'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-300" />
              <span>Unfunded Leads ({unfundedLeadsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setUserStatusFilter('marketing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                userStatusFilter === 'marketing'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Marketing Team ({marketingUsersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setUserStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                userStatusFilter === 'active'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Active ({activeUsersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setUserStatusFilter('deactivated')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                userStatusFilter === 'deactivated'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <ShieldBan className="w-3 h-3" />
              <span>Deactivated ({deactivatedUsersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setUserStatusFilter('admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                userStatusFilter === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <span>Admins ({adminUsersCount})</span>
            </button>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-700">No matching accounts found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching with a different keyword or change your filter.</p>
              <button
                type="button"
                onClick={() => {
                  setUserSearch('');
                  setUserStatusFilter('all');
                }}
                className="mt-3 text-xs text-amber-600 font-bold hover:underline cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2.5">Name & Contact</th>
                    <th className="pb-2.5">Ref Code / Sponsor</th>
                    <th className="pb-2.5 text-right">Wallet Balance</th>
                    <th className="pb-2.5 text-center">KYC Status</th>
                    <th className="pb-2.5 text-center">Account Status</th>
                    <th className="pb-2.5 text-center">Role</th>
                    <th className="pb-2.5 text-center">Backend Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const uInvestments = investments.filter(inv => inv.userId === u.id);
                    const activeCount = uInvestments.filter(i => i.status === 'active').length;
                    const referralsCount = users.filter(usr => usr.referredByCode === u.referralCode).length;

                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${u.isDeactivated ? 'bg-rose-50/30' : ''}`}>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-semibold ${u.isDeactivated ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{u.name}</span>
                            {u.id === currentUser?.id && (
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-mono font-bold">YOU</span>
                            )}
                            {u.isMarketingAccount && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 shadow-2xs">
                                <Zap className="w-2.5 h-2.5 text-purple-600" />
                                <span>MARKETER</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                          {u.phone && <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">📞 {u.phone}</div>}
                          {u.isMarketingAccount && (u.marketingAllocatedBalance || 0) > 0 && (
                            <div className="text-[9px] text-purple-700 font-mono mt-0.5">
                              Allocated Demo: ₦{(u.marketingAllocatedBalance || 0).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 font-mono text-[11px]">
                          <div className="text-amber-600 font-bold">{u.referralCode}</div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {u.referredByCode ? (
                              <span>Sponsor: <span className="font-mono text-slate-700 font-semibold">{u.referredByCode}</span></span>
                            ) : (
                              <span className="text-slate-400">Direct / Root</span>
                            )}
                          </div>
                          <div className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-emerald-200 font-sans font-semibold">
                            👥 {referralsCount} downline{referralsCount === 1 ? '' : 's'} • {activeCount} active plan{activeCount === 1 ? '' : 's'}
                          </div>
                        </td>
                        <td className="py-3 text-right font-bold font-mono text-slate-900">
                          ₦{u.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                          {u.isMarketingAccount && (
                            <span className="text-[9px] text-purple-600 block font-normal">Promo Funds</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            u.kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            u.kycStatus === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {u.kycStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {u.isDeactivated ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                              <ShieldBan className="w-3 h-3 text-rose-600" />
                              DEACTIVATED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {u.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                              <ShieldAlert className="w-3 h-3 text-amber-700" />
                              ADMIN
                            </span>
                          ) : u.isMarketingAccount ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-purple-100 text-purple-900 border border-purple-300 inline-flex items-center gap-1 shadow-2xs">
                                <Zap className="w-3 h-3 text-purple-600 fill-purple-600" />
                                MARKETING CANVASSER
                              </span>
                              {(u.marketingAllocatedBalance || 0) > 0 && (
                                <span className="text-[9px] text-purple-700 font-mono font-semibold">
                                  ₦{(u.marketingAllocatedBalance || 0).toLocaleString()} Demo
                                </span>
                              )}
                            </div>
                          ) : getUserPaidTopup(u.id) > 0 ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                VERIFIED REAL INVESTOR
                              </span>
                              <span className="text-[9px] text-emerald-700 font-mono font-bold">
                                ₦{getUserPaidTopup(u.id).toLocaleString()} Paid Top-Up
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                UNFUNDED LEAD
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                Awaiting First Deposit
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedEditUser(u);
                                setEditUserName(u.name);
                                setEditUserEmail(u.email);
                                setEditUserPhone(u.phone || '');
                                setEditUserBalance(String(u.walletBalance));
                                setEditUserRole(u.role);
                                setEditUserKyc(u.kycStatus);
                                setEditUserIsDeactivated(!!u.isDeactivated);
                                setEditUserIsMarketing(!!u.isMarketingAccount);
                                setEditUserPassword('');
                                setShowEditUserModal(true);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              id={`btn_edit_user_${u.id}`}
                              title={`Edit account and wallet balance for ${u.name}`}
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" /> Edit
                            </button>

                            {u.isMarketingAccount && (
                              <button
                                onClick={() => {
                                  setMarketingTopUpUser(u);
                                  setMarketingTopUpAmount('115000');
                                  setShowMarketingTopUpModal(true);
                                }}
                                className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Top up canvassing wallet with promotional funds"
                              >
                                <Zap className="w-3 h-3 text-purple-700" />
                                <span>Top Up Demo</span>
                              </button>
                            )}

                            {u.role !== 'admin' && (
                              <button
                                onClick={() => adminToggleMarketingStatus(u.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                  u.isMarketingAccount 
                                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300' 
                                    : 'bg-purple-50/60 hover:bg-purple-100 text-purple-700 border-purple-200'
                                }`}
                                title={u.isMarketingAccount ? 'Revert to regular investor account' : 'Designate as marketing sales canvasser'}
                              >
                                {u.isMarketingAccount ? 'Make Investor' : 'Set Marketer'}
                              </button>
                            )}

                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleOpenDeactivateModal(u)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer shadow-2xs ${
                                  u.isDeactivated
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                                }`}
                                id={`btn_toggle_deactivate_${u.id}`}
                                title={u.isDeactivated ? 'Reactivate this user account' : 'Deactivate this user account'}
                              >
                                {u.isDeactivated ? (
                                  <>
                                    <UserCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Activate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3 text-rose-600" />
                                    <span>Deactivate</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => switchUser(u.id)}
                              disabled={u.isDeactivated}
                              className={`border px-2 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 ${
                                u.isDeactivated
                                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                                  : 'bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 cursor-pointer'
                              }`}
                              id={`btn_switch_user_${u.id}`}
                              title={u.isDeactivated ? 'Cannot login as a deactivated account' : `Switch session to ${u.name}`}
                            >
                              <Eye className="w-3 h-3" /> Login As
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin User & Wallet Editor Modal */}
      {showEditUserModal && selectedEditUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Admin User & Wallet Editor</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedEditUser.id} • {selectedEditUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-slate-700 font-semibold">Wallet Balance (₦)</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Current: ₦{selectedEditUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400 text-sm">₦</span>
                  <input
                    type="number"
                    step="any"
                    value={editUserBalance}
                    onChange={(e) => setEditUserBalance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                {/* Quick adjustments */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Quick Adjust:</span>
                  {[10000, 50000, 100000, 500000].map((adj) => (
                    <button
                      key={adj}
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(editUserBalance) || 0;
                        setEditUserBalance(String(cur + adj));
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +₦{adj.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditUserBalance('0')}
                    className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer"
                  >
                    Set ₦0
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Status</label>
                  <select
                    value={editUserIsDeactivated ? 'deactivated' : 'active'}
                    onChange={(e) => setEditUserIsDeactivated(e.target.value === 'deactivated')}
                    disabled={selectedEditUser.role === 'admin'}
                    className={`w-full border rounded-lg py-2 px-3 font-semibold focus:outline-none ${
                      editUserIsDeactivated 
                        ? 'bg-rose-50 text-rose-800 border-rose-300' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <option value="active">Active (Access allowed)</option>
                    <option value="deactivated">Deactivated (Locked)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">KYC Status</label>
                  <select
                    value={editUserKyc}
                    onChange={(e) => setEditUserKyc(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="unverified">UNVERIFIED</option>
                    <option value="pending">PENDING</option>
                    <option value="verified">VERIFIED</option>
                    <option value="rejected">REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Role</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="text"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Enter new password to reset for this user"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Marketing Account Checkbox in Edit */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="chk_edit_marketing_account"
                  checked={editUserIsMarketing}
                  onChange={(e) => setEditUserIsMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="chk_edit_marketing_account" className="cursor-pointer">
                  <span className="font-bold text-purple-950 block">Designate as Marketing & Sales Canvasser</span>
                  <span className="text-[11px] text-purple-800">
                    Isolates this account's transactions and wallet from real organic investor liabilities.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  id="btn_save_user_edit"
                >
                  <Check className="w-4 h-4" /> Save User Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Create New Account (Admin)</h3>
                  <p className="text-[11px] text-slate-500">
                    Register a new member directly from the administration control desk.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createUserError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{createUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={createUserName}
                    onChange={(e) => setCreateUserName(e.target.value)}
                    placeholder="e.g. Chukwuma Obi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={createUserEmail}
                    onChange={(e) => setCreateUserEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={createUserPhone}
                    onChange={(e) => setCreateUserPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-semibold">Account Password *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'PM' + Math.floor(100000 + Math.random() * 900000);
                        setCreateUserPassword(randomPass);
                      }}
                      className="text-[10px] text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      Generate Random
                    </button>
                  </div>
                  <input
                    type="text"
                    value={createUserPassword}
                    onChange={(e) => setCreateUserPassword(e.target.value)}
                    placeholder="e.g. password123"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-slate-700 font-semibold">Initial Wallet Credit (₦)</label>
                  <span className="text-[10px] text-slate-400">Credited to wallet immediately upon creation</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400 text-sm">₦</span>
                  <input
                    type="number"
                    step="any"
                    value={createUserBalance}
                    onChange={(e) => setCreateUserBalance(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Quick adjustments */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Quick Credit:</span>
                  {[15000, 45000, 115000, 270000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreateUserBalance(String(amt))}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +₦{amt.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCreateUserBalance('0')}
                    className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer"
                  >
                    Set ₦0
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Role</label>
                  <select
                    value={createUserRole}
                    onChange={(e) => setCreateUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="user">USER (Standard Investor)</option>
                    <option value="admin">ADMIN (Administrative Access)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Status</label>
                  <select
                    value={createUserIsDeactivated ? 'deactivated' : 'active'}
                    onChange={(e) => setCreateUserIsDeactivated(e.target.value === 'deactivated')}
                    className={`w-full border rounded-lg py-2 px-3 font-semibold focus:outline-none ${
                      createUserIsDeactivated 
                        ? 'bg-rose-50 text-rose-800 border-rose-300' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <option value="active">Active (Access allowed)</option>
                    <option value="deactivated">Deactivated (Locked)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">KYC Status</label>
                  <select
                    value={createUserKyc}
                    onChange={(e) => setCreateUserKyc(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="verified">VERIFIED (Fast-track)</option>
                    <option value="unverified">UNVERIFIED</option>
                    <option value="pending">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sponsor Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={createUserSponsorCode}
                    onChange={(e) => setCreateUserSponsorCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TREASURE_ADMIN"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">User's Own Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={createUserRefCode}
                    onChange={(e) => setCreateUserRefCode(e.target.value.toUpperCase())}
                    placeholder="Auto-generated if blank"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Marketing Account Checkbox */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="chk_create_marketing_account"
                  checked={createUserIsMarketing}
                  onChange={(e) => setCreateUserIsMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="chk_create_marketing_account" className="cursor-pointer">
                  <span className="font-bold text-purple-950 block">Designate as Marketing & Sales Canvasser</span>
                  <span className="text-[11px] text-purple-800">
                    Isolates this account's funds from real organic investor liabilities. Initial credit will be tagged as promotional marketing allocation.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  id="btn_confirm_create_user"
                >
                  <UserPlus className="w-4 h-4" /> Create Account Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Marketing Canvassing Top-Up Modal */}
      {showMarketingTopUpModal && marketingTopUpUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Top Up Marketer Wallet</h3>
                  <p className="text-[11px] text-purple-700 font-medium">
                    Allocating canvassing funds for {marketingTopUpUser.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMarketingTopUpModal(false);
                  setMarketingTopUpUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span className="font-bold font-mono">₦{marketingTopUpUser.walletBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Type:</span>
                <span className="font-bold uppercase text-purple-800">Marketing Sales Canvasser</span>
              </div>
              <p className="text-[10px] text-purple-700 pt-1 border-t border-purple-200">
                This top-up is logged as a promotional canvassing allocation and will not dilute your real investor bank liabilities.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(marketingTopUpAmount);
                if (isNaN(amt) || amt <= 0) return;
                adminTopUpMarketingWallet(marketingTopUpUser.id, amt, marketingTopUpNotes);
                setShowMarketingTopUpModal(false);
                setMarketingTopUpUser(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Top-Up Amount (₦)</label>
                <input
                  type="number"
                  value={marketingTopUpAmount}
                  onChange={(e) => setMarketingTopUpAmount(e.target.value)}
                  placeholder="e.g. 115000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                  required
                />
                {/* Pre-fill Plan Costs */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[15000, 45000, 115000, 270000, 500000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMarketingTopUpAmount(String(amt))}
                      className="text-[10px] bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 px-2 py-0.5 rounded font-mono font-semibold cursor-pointer"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Canvassing Campaign Notes</label>
                <input
                  type="text"
                  value={marketingTopUpNotes}
                  onChange={(e) => setMarketingTopUpNotes(e.target.value)}
                  placeholder="e.g. Field Sales Canvassing - Lagos Island"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMarketingTopUpModal(false);
                    setMarketingTopUpUser(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Top-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate / Reactivate Account Confirmation Modal */}
      {deactivateModalTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl shrink-0 ${
                deactivateModalTarget.willDeactivate 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                {deactivateModalTarget.willDeactivate ? (
                  <ShieldBan className="w-6 h-6" />
                ) : (
                  <UserCheck className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-950">
                  {deactivateModalTarget.willDeactivate ? 'Deactivate User Account' : 'Reactivate User Account'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {deactivateModalTarget.willDeactivate
                    ? `Are you sure you want to deactivate the account for "${deactivateModalTarget.user.name}"?`
                    : `Restore active platform access for "${deactivateModalTarget.user.name}"?`}
                </p>
              </div>
            </div>

            {/* Target Account Info Card */}
            <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2 font-sans">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">User Name:</span>
                <span className="font-bold text-slate-900">{deactivateModalTarget.user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-mono text-slate-800">{deactivateModalTarget.user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Wallet Balance:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ₦{deactivateModalTarget.user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Referral Code:</span>
                <span className="font-mono font-bold text-amber-600">{deactivateModalTarget.user.referralCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Current Status:</span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  deactivateModalTarget.user.isDeactivated 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {deactivateModalTarget.user.isDeactivated ? 'DEACTIVATED' : 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl text-xs mb-5 ${
              deactivateModalTarget.willDeactivate
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              {deactivateModalTarget.willDeactivate ? (
                <span>
                  🔒 <strong>Effect:</strong> The investor will be locked out immediately and cannot sign in, make deposits, or request withdrawals. Their active plans and balance will remain safely recorded in the backend.
                </span>
              ) : (
                <span>
                  ✓ <strong>Effect:</strong> The investor will immediately regain full access to sign in, check their wallet, and continue earning weekly payouts.
                </span>
              )}
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeactivateModalTarget(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleDeactivate}
                className={`px-5 py-2 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  deactivateModalTarget.willDeactivate
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                id="btn_confirm_modal_toggle_status"
              >
                {deactivateModalTarget.willDeactivate ? (
                  <>
                    <ShieldBan className="w-3.5 h-3.5" />
                    <span>Confirm Deactivation</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Confirm Activation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleIn">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Confirm Database Reset</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This action is highly destructive and irreversible. It will erase all users, investments, transactions, and settings, rebuilding the default starting data state.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Type or paste <span className="font-mono text-rose-600 font-extrabold select-all">RESET DATABASE</span>:
                </label>
                <button
                  type="button"
                  onClick={() => setResetConfirmationInput('RESET DATABASE')}
                  className="text-[10px] text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200 px-2 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer"
                >
                  Fill Word
                </button>
              </div>
              <input
                type="text"
                value={resetConfirmationInput}
                onChange={(e) => setResetConfirmationInput(e.target.value)}
                placeholder="RESET DATABASE"
                className="w-full font-mono text-sm border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-center tracking-wider font-bold"
                autoFocus
                autoComplete="off"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Action is permanently verified upon exact match.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resetConfirmationInput.trim().toUpperCase() === 'RESET DATABASE') {
                    resetAll();
                    setShowResetModal(false);
                  }
                }}
                disabled={resetConfirmationInput.trim().toUpperCase() !== 'RESET DATABASE'}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-colors text-white ${
                  resetConfirmationInput.trim().toUpperCase() === 'RESET DATABASE'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 cursor-pointer'
                    : 'bg-slate-200 cursor-not-allowed text-slate-400'
                }`}
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Confirmation Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleIn">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                <RefreshCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Confirm Weekly Payout Cycle</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This will advance the system timeline by 1 week, trigger all weekly yield payouts on active user investment plans, and update user balances. This operation cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Type or paste <span className="font-mono text-amber-600 font-extrabold select-all">TRIGGER PAYOUT</span>:
                </label>
                <button
                  type="button"
                  onClick={() => setPayoutConfirmationInput('TRIGGER PAYOUT')}
                  className="text-[10px] text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer"
                >
                  Fill Word
                </button>
              </div>
              <input
                type="text"
                value={payoutConfirmationInput}
                onChange={(e) => setPayoutConfirmationInput(e.target.value)}
                placeholder="TRIGGER PAYOUT"
                className="w-full font-mono text-sm border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-center tracking-wider font-bold"
                autoFocus
                autoComplete="off"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Action is permanently verified upon exact match.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (payoutConfirmationInput.trim().toUpperCase() === 'TRIGGER PAYOUT') {
                    simulateWeek();
                    setShowPayoutModal(false);
                  }
                }}
                disabled={payoutConfirmationInput.trim().toUpperCase() !== 'TRIGGER PAYOUT'}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  payoutConfirmationInput.trim().toUpperCase() === 'TRIGGER PAYOUT'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'bg-slate-200 cursor-not-allowed text-slate-400'
                }`}
              >
                Trigger Payouts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX MODAL */}
      {adminScreenshotPreview && (
        <div 
          onClick={() => setAdminScreenshotPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAdminScreenshotPreview(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={adminScreenshotPreview} 
              alt="Proof Full Resolution" 
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain mx-auto" 
            />
          </div>
        </div>
      )}

      {/* Supabase Connection Configuration Modal */}
      {showDbConfigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">Supabase Cloud Database Connection</h3>
                  <p className="text-[11px] text-slate-500">Live multi-device database and realtime sync</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDbConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 mb-4 space-y-1">
              <p className="font-semibold text-slate-800">Where to find these in Supabase:</p>
              <p>Go to your <strong>Supabase Dashboard → Project Settings → API</strong>.</p>
              <p>Copy your <strong>Project URL</strong> and <strong>Project API Anon/Public Key</strong>.</p>
            </div>

            {dbSaveNotice && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dbSaveNotice}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSupabaseCredentials(dbUrlInput, dbKeyInput);
                setDbSaveNotice('Credentials saved! Testing live connection...');
                setTimeout(async () => {
                  await refreshFromSupabase();
                  setShowDbConfigModal(false);
                }, 1000);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project URL</label>
                <input
                  type="url"
                  value={dbUrlInput}
                  onChange={(e) => setDbUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Anon / Public API Key</label>
                <textarea
                  rows={3}
                  value={dbKeyInput}
                  onChange={(e) => setDbKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDbConfigModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Save & Connect Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase Production SQL Script & Stored Functions Modal */}
      {showSqlScriptModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl animate-scaleIn max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Supabase Production SQL Scripts
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      LIVE READY
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose Part 1 (320 lines, runs within Supabase limits) or Full Enterprise SQL.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlScriptModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Script Selection Tabs */}
            <div className="flex items-center gap-2 mb-3 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSqlTab('core')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedSqlTab === 'core'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Part 1: Core Database & Live Sync (320 Lines - RECOMMENDED)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSqlTab('full')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedSqlTab === 'full'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>Part 2: Full Enterprise SQL (With Stored Functions)</span>
              </button>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 mb-3 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">1</span>
                <span>Copy <strong>{selectedSqlTab === 'core' ? 'Part 1 (320 lines)' : 'Full SQL'}</strong> with button below.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">2</span>
                <span>Open your <strong>Supabase Dashboard → SQL Editor → New query</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">3</span>
                <span>Paste and click <strong>Run</strong>. Everything is set up and live instantly!</span>
              </div>
            </div>

            {/* Code container */}
            <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px]">
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                    sqlCopied
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  }`}
                  id="btn_copy_supabase_sql"
                >
                  {sqlCopied ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy {selectedSqlTab === 'core' ? 'Part 1 SQL (320 Lines)' : 'Full Script'}</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="h-full max-h-[46vh] overflow-y-auto p-4 text-slate-300 leading-relaxed select-all">
                <code>{selectedSqlTab === 'core' ? SUPABASE_CORE_SQL : FULL_SUPABASE_SQL}</code>
              </pre>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-3">
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedSqlTab === 'core' 
                  ? 'Part 1: 320 lines • All 10 tables, default plans, settings, admin seed, and realtime sync.' 
                  : 'Full Script: 1,878 lines • Includes 24 stored functions & triggers.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'Copied!' : selectedSqlTab === 'core' ? 'Copy Part 1 (320 Lines)' : 'Copy Full'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlScriptModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
