-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- PART 1 OF 2: CORE TABLES, MIGRATION COLUMNS, SEED DATA & LEDGER
-- (Self-healing: Handles pre-existing schemas and provides all non-null defaults)
-- =========================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. USERS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT DEFAULT 'password123',
    "referralCode" TEXT NOT NULL DEFAULT 'INV1000',
    "referredByCode" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kycStatus" TEXT NOT NULL DEFAULT 'unverified',
    "kycDetails" JSONB,
    role TEXT NOT NULL DEFAULT 'user',
    "createdAt" TEXT NOT NULL,
    "isDeactivated" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMarketingAccount" BOOLEAN NOT NULL DEFAULT FALSE,
    "marketingAllocatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isDeactivated" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isMarketingAccount" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "marketingAllocatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users("referralCode");
CREATE INDEX IF NOT EXISTS idx_users_sponsor ON public.users("referredByCode");
CREATE INDEX IF NOT EXISTS idx_users_marketing ON public.users("isMarketingAccount");
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users("isDeactivated");
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- -------------------------------------------------------------------------
-- 2. INVESTMENT PLANS REFERENCE TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investment_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost DOUBLE PRECISION NOT NULL,
    "weeklyPayout" DOUBLE PRECISION NOT NULL,
    "totalReturns" DOUBLE PRECISION NOT NULL,
    "weeksDuration" INTEGER NOT NULL DEFAULT 4
);

INSERT INTO public.investment_plans (id, name, cost, "weeklyPayout", "totalReturns", "weeksDuration")
VALUES
    ('plan_1', 'Plan 1', 15000, 16250, 65000, 4),
    ('plan_2', 'Plan 2', 45000, 43121, 172485, 4),
    ('plan_3', 'Plan 3', 115000, 95824, 383295, 4),
    ('plan_4', 'Plan 4', 270000, 191228, 764910, 4),
    ('plan_5', 'Plan 5', 500000, 291625, 1166500, 4)
ON CONFLICT (id) DO UPDATE SET
    cost = EXCLUDED.cost,
    "weeklyPayout" = EXCLUDED."weeklyPayout",
    "totalReturns" = EXCLUDED."totalReturns";

-- -------------------------------------------------------------------------
-- 3. INVESTMENTS TABLE (4-WEEK PROPERTY CYCLES)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    cost DOUBLE PRECISION NOT NULL,
    "weeklyPayout" DOUBLE PRECISION NOT NULL,
    "totalReturns" DOUBLE PRECISION NOT NULL,
    "weeksPaid" INTEGER NOT NULL DEFAULT 0,
    "totalWeeks" INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'active',
    "createdAt" TEXT NOT NULL,
    "lastPayoutDate" TEXT,
    "nextPayoutDate" TEXT,
    "autoReinvest" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "autoReinvest" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "lastPayoutDate" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "nextPayoutDate" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "weeksPaid" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "totalWeeks" INTEGER NOT NULL DEFAULT 4;

CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments("userId");
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_marketing ON public.investments("isMarketing");

-- -------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    "paymentMethod" TEXT,
    "accountDetails" TEXT,
    "proofUrl" TEXT,
    "gatewayReference" TEXT,
    "gatewayChannel" TEXT,
    "createdAt" TEXT NOT NULL,
    description TEXT NOT NULL,
    "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "accountDetails" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "proofUrl" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "gatewayReference" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "gatewayChannel" TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions("createdAt" DESC);

-- -------------------------------------------------------------------------
-- 5. SETTINGS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    "liquidityReserve" DOUBLE PRECISION NOT NULL DEFAULT 92066059.975,
    "dailyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 240000,
    "hourlyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "riskAlertLevel" TEXT NOT NULL DEFAULT 'low',
    "minWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "maxWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 1000000,
    "autoApproveDeposits" BOOLEAN NOT NULL DEFAULT FALSE,
    "automatedPayouts" BOOLEAN NOT NULL DEFAULT TRUE,
    "paystackTestMode" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE,
    "pauseInvestments" BOOLEAN NOT NULL DEFAULT FALSE,
    "pauseWithdrawals" BOOLEAN NOT NULL DEFAULT FALSE,
    "dailyTaskEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "dailyTaskBonusRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "dailyTaskBaseReward" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "dailyTaskStreakBonus" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "freeStarterWithdrawalLimit" DOUBLE PRECISION NOT NULL DEFAULT 3000,
    "rewardedAdBonusMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "estimatedAdRevenueTotal" DOUBLE PRECISION NOT NULL DEFAULT 284500,
    "enableLiveActivityToasts" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Ensure all columns and defaults are set if table already existed
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "liquidityReserve" DOUBLE PRECISION DEFAULT 92066059.975;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyLiquidityGrowth" DOUBLE PRECISION DEFAULT 240000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "hourlyLiquidityGrowth" DOUBLE PRECISION DEFAULT 10000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "riskAlertLevel" TEXT DEFAULT 'low';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "minWithdrawal" DOUBLE PRECISION DEFAULT 5000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "maxWithdrawal" DOUBLE PRECISION DEFAULT 1000000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "autoApproveDeposits" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "automatedPayouts" BOOLEAN DEFAULT TRUE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "paystackTestMode" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "isMaintenanceMode" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "pauseInvestments" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "pauseWithdrawals" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyTaskEnabled" BOOLEAN DEFAULT TRUE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyTaskBonusRate" DOUBLE PRECISION DEFAULT 0.05;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyTaskBaseReward" DOUBLE PRECISION DEFAULT 200;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyTaskStreakBonus" DOUBLE PRECISION DEFAULT 1500;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "freeStarterWithdrawalLimit" DOUBLE PRECISION DEFAULT 3000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "rewardedAdBonusMultiplier" DOUBLE PRECISION DEFAULT 2;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "estimatedAdRevenueTotal" DOUBLE PRECISION DEFAULT 284500;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "enableLiveActivityToasts" BOOLEAN DEFAULT TRUE;

-- Insert complete row with explicit values to satisfy NOT NULL constraints on legacy tables
INSERT INTO public.settings (
    id,
    "liquidityReserve",
    "dailyLiquidityGrowth",
    "hourlyLiquidityGrowth",
    "riskAlertLevel",
    "minWithdrawal",
    "maxWithdrawal",
    "autoApproveDeposits",
    "automatedPayouts",
    "paystackTestMode",
    "isMaintenanceMode",
    "pauseInvestments",
    "pauseWithdrawals",
    "dailyTaskEnabled",
    "dailyTaskBonusRate",
    "dailyTaskBaseReward",
    "dailyTaskStreakBonus",
    "freeStarterWithdrawalLimit",
    "rewardedAdBonusMultiplier",
    "estimatedAdRevenueTotal",
    "enableLiveActivityToasts"
)
VALUES (
    'system_settings',
    92066059.975,
    240000,
    10000,
    'low',
    5000,
    1000000,
    FALSE,
    TRUE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    TRUE,
    0.05,
    200,
    1500,
    3000,
    2,
    284500,
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    "liquidityReserve" = COALESCE(public.settings."liquidityReserve", EXCLUDED."liquidityReserve");

-- -------------------------------------------------------------------------
-- 6. TASK SUBMISSIONS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id TEXT PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    proof TEXT NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TEXT NOT NULL,
    "reviewedAt" TEXT
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user ON public.task_submissions("userId");

-- -------------------------------------------------------------------------
-- 7. USER DAILY PROGRESS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_daily_progress (
    user_id TEXT PRIMARY KEY,
    "current_date" TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    completed_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    pending_submission_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    streak_count INTEGER NOT NULL DEFAULT 0,
    last_completed_date TEXT,
    streak_bonus_claimed_date TEXT,
    poll_answers JSONB DEFAULT '{}'::jsonb,
    quiz_scores JSONB DEFAULT '{}'::jsonb,
    ad_boosted_task_ids JSONB DEFAULT '[]'::jsonb,
    total_free_earnings_withdrawn DOUBLE PRECISION DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_daily_progress ADD COLUMN IF NOT EXISTS "current_date" TEXT;
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON public.user_daily_progress("current_date");

-- -------------------------------------------------------------------------
-- 8. SYSTEM STATE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO public.system_state (key, value)
VALUES ('current_week', '1'), ('virtual_day_offset', '0')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------------------------
-- 9. AUDIT WALLET LEDGERS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    user_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    balance_before NUMERIC(18,2) NOT NULL,
    balance_after NUMERIC(18,2) NOT NULL,
    description TEXT NOT NULL,
    reference TEXT NOT NULL,
    performed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON public.wallet_transactions(wallet_id);

-- -------------------------------------------------------------------------
-- 10. SEED DEFAULT ADMIN
-- -------------------------------------------------------------------------
INSERT INTO public.users (
    id, name, email, phone, password, "referralCode", "walletBalance", "kycStatus", role, "createdAt"
)
VALUES (
    'usr_admin', 'Treasure Homes Admin', 'admin@treasurehomes.com', '+2348000000000', 'admin123', 'TREASURE_ADMIN', 0, 'verified', 'admin', NOW()::TEXT
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', "kycStatus" = 'verified';

INSERT INTO public.wallets (user_id, balance) VALUES ('usr_admin', 0) ON CONFLICT (user_id) DO NOTHING;

COMMIT;
