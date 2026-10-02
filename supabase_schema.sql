-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- COMPLETE PRODUCTION SUPABASE & POSTGRESQL SCHEMA WITH FULL STORED FUNCTIONS
-- INCLUDES: VISITOR, INVESTOR, MARKETER & ADMIN ROLES WITH FULL ADMIN ACCESS
-- AUTOMATED WALLET AUDIT, REALTIME SYNC, 4-WEEK CYCLES, 7.5% REFERRALS
-- =========================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. USERS TABLE (INVESTORS, MARKETERS & ADMINS)
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

-- Safe column additions if tables already exist
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
-- 3. INVESTMENTS TABLE (PROPERTY PLANS & 4-WEEK CYCLES)
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

CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments("userId");
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_marketing ON public.investments("isMarketing");

-- -------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE (DEPOSITS, WITHDRAWALS, PAYOUTS & OVERRIDES)
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

INSERT INTO public.settings (id) VALUES ('system_settings') ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------------
-- 6. TASK SUBMISSIONS TABLE (GROWTH ADVOCACY PROOF AUDIT)
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
-- 7. USER DAILY PROGRESS (ATTENDANCE, STREAKS & QUESTS)
-- NOTE: "current_date" is quoted to avoid PostgreSQL reserved keyword errors
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
-- 8. SYSTEM STATE (WEEK TRACKING & TIMELINE)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO public.system_state (key, value)
VALUES 
    ('current_week', '1'),
    ('virtual_day_offset', '0')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------------------------
-- 9. WALLETS & DOUBLE-ENTRY AUDIT LEDGER
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
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('initial_credit', 'credit', 'debit', 'marketing_allocation', 'deposit', 'withdrawal', 'payout', 'referral_bonus', 'task_reward')),
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

-- Ensure default admin user is seeded safely
INSERT INTO public.users (
    id, name, email, phone, password, "referralCode", "walletBalance", "kycStatus", role, "createdAt"
)
VALUES (
    'usr_admin',
    'Treasure Homes Admin',
    'admin@treasurehomes.com',
    '+2348000000000',
    'admin123',
    'TREASURE_ADMIN',
    0,
    'verified',
    'admin',
    NOW()::TEXT
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    "kycStatus" = 'verified';

INSERT INTO public.wallets (user_id, balance)
VALUES ('usr_admin', 0)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- =========================================================================
-- COMPLETE STORED FUNCTIONS FOR: VISITOR, INVESTOR, MARKETER & ADMIN
-- =========================================================================

-- -------------------------------------------------------------------------
-- PART A: VISITOR / PUBLIC FUNCTIONS (UNAUTHENTICATED & ONBOARDING)
-- -------------------------------------------------------------------------

-- 1. Get Live Public Platform Stats for Landing Page
CREATE OR REPLACE FUNCTION public.public_get_platform_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reserve DOUBLE PRECISION;
    v_active_capital DOUBLE PRECISION;
    v_investors_count INTEGER;
    v_plans_count INTEGER;
BEGIN
    SELECT "liquidityReserve" INTO v_reserve FROM public.settings WHERE id = 'system_settings';
    SELECT COALESCE(SUM(cost), 0) INTO v_active_capital FROM public.investments WHERE status = 'active' AND "isMarketing" = FALSE;
    SELECT COUNT(*) INTO v_investors_count FROM public.users WHERE role != 'admin' AND "isMarketingAccount" = FALSE;
    SELECT COUNT(*) INTO v_plans_count FROM public.investment_plans;

    RETURN jsonb_build_object(
        'liquidityReserve', COALESCE(v_reserve, 92000000),
        'activeInvestorCapital', v_active_capital,
        'registeredInvestors', v_investors_count,
        'availablePlans', v_plans_count,
        'payoutDay', 'Friday'
    );
END;
$$;

-- 2. Verify Referral / Sponsor Code
CREATE OR REPLACE FUNCTION public.public_verify_referral_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sponsor RECORD;
BEGIN
    SELECT id, name, "referralCode", "isMarketingAccount"
    INTO v_sponsor
    FROM public.users
    WHERE UPPER("referralCode") = UPPER(TRIM(p_code)) AND "isDeactivated" = FALSE
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'message', 'Invalid sponsor referral code.');
    END IF;

    RETURN jsonb_build_object(
        'valid', TRUE,
        'sponsorId', v_sponsor.id,
        'sponsorName', v_sponsor.name,
        'sponsorCode', v_sponsor."referralCode",
        'isMarketer', v_sponsor."isMarketingAccount"
    );
END;
$$;

-- 2b. Public Get Investment Plans
CREATE OR REPLACE FUNCTION public.public_get_investment_plans()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plans JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', name,
            'cost', cost,
            'weeklyPayout', "weeklyPayout",
            'totalReturns', "totalReturns",
            'weeksDuration', "weeksDuration"
        ) ORDER BY cost ASC
    ), '[]'::jsonb)
    INTO v_plans
    FROM public.investment_plans;

    RETURN v_plans;
END;
$$;

-- 3. Public User Registration with Mandatory Referral Code
CREATE OR REPLACE FUNCTION public.public_register_user(
    p_name TEXT,
    p_email TEXT,
    p_password TEXT,
    p_referred_by TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id TEXT;
    v_new_ref TEXT;
    v_sponsor_code TEXT := NULL;
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = v_clean_email) THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'An account with this email address already exists.');
    END IF;

    -- Validate Sponsor
    IF p_referred_by IS NOT NULL AND TRIM(p_referred_by) != '' THEN
        SELECT "referralCode" INTO v_sponsor_code
        FROM public.users
        WHERE UPPER("referralCode") = UPPER(TRIM(p_referred_by))
        LIMIT 1;

        IF v_sponsor_code IS NULL THEN
            RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid sponsor invite code. A valid code is required to register.');
        END IF;
    ELSE
        -- Fallback default sponsor if blank
        v_sponsor_code := 'INV1000';
    END IF;

    v_user_id := 'usr_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    v_new_ref := 'INV' || (FLOOR(RANDOM() * 9000) + 1000)::TEXT;

    INSERT INTO public.users (
        id, name, email, phone, password, "referralCode", "referredByCode", "walletBalance", "kycStatus", role, "createdAt"
    )
    VALUES (
        v_user_id,
        TRIM(p_name),
        v_clean_email,
        NULLIF(TRIM(p_phone), ''),
        COALESCE(NULLIF(TRIM(p_password), ''), 'password123'),
        v_new_ref,
        v_sponsor_code,
        0,
        'unverified',
        'user',
        NOW()::TEXT
    );

    -- Initialize audit ledger wallet
    INSERT INTO public.wallets (user_id, balance) VALUES (v_user_id, 0) ON CONFLICT (user_id) DO NOTHING;

    -- Initialize daily progress
    INSERT INTO public.user_daily_progress (user_id, "current_date", completed_task_ids, streak_count)
    VALUES (v_user_id, TO_CHAR(NOW(), 'YYYY-MM-DD'), '[]'::jsonb, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', TRUE,
        'userId', v_user_id,
        'referralCode', v_new_ref,
        'message', 'Registration successful. Welcome to PM Invest.'
    );
END;
$$;

-- -------------------------------------------------------------------------
-- PART B: INVESTOR FUNCTIONS (DEPOSITS, PLANS, WITHDRAWALS & TASKS)
-- -------------------------------------------------------------------------

-- 4. Submit Manual Bank Deposit (Pending Treasury Approval)
CREATE OR REPLACE FUNCTION public.investor_submit_deposit(
    p_user_id TEXT,
    p_amount DOUBLE PRECISION,
    p_payment_method TEXT DEFAULT 'Bank Transfer (Treasure Homes Reserve)',
    p_account_details TEXT DEFAULT NULL,
    p_proof_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_tx_id TEXT;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    IF v_user."isDeactivated" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is on administrative hold.');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Deposit amount must be positive.');
    END IF;

    v_tx_id := 'tx_dep_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "accountDetails", "proofUrl", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'deposit',
        p_amount,
        'pending',
        p_payment_method,
        p_account_details,
        p_proof_url,
        NOW()::TEXT,
        'Bank Transfer Deposit (Pending Verification)',
        v_user."isMarketingAccount"
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'transactionId', v_tx_id,
        'message', 'Deposit receipt submitted. Wallet will be credited once verified by treasury.'
    );
END;
$$;

-- 5. Process Automated Gateway Deposit (Paystack / Instant Clearance)
CREATE OR REPLACE FUNCTION public.investor_process_automated_deposit(
    p_user_id TEXT,
    p_amount DOUBLE PRECISION,
    p_reference TEXT,
    p_channel TEXT DEFAULT 'card'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_tx_id TEXT;
    v_wallet RECORD;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.');
    END IF;

    IF v_user."isDeactivated" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is currently on administrative hold.');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Amount must be greater than zero.');
    END IF;

    -- Avoid duplicate reference crediting
    IF EXISTS (SELECT 1 FROM public.transactions WHERE "gatewayReference" = p_reference AND status = 'completed') THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Transaction reference already processed.');
    END IF;

    v_new_bal := v_user."walletBalance" + p_amount;
    v_tx_id := 'tx_auto_dep_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    -- Credit user wallet
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    -- Record completed transaction
    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "gatewayReference", "gatewayChannel", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'deposit',
        p_amount,
        'completed',
        'Paystack Automated Gateway',
        p_reference,
        p_channel,
        NOW()::TEXT,
        'Instant Paystack Wallet Deposit - Ref: ' || p_reference,
        v_user."isMarketingAccount"
    );

    -- Double-entry audit ledger record
    INSERT INTO public.wallets (user_id, balance, updated_at)
    VALUES (p_user_id, v_new_bal, NOW())
    ON CONFLICT (user_id) DO UPDATE SET balance = v_new_bal, updated_at = NOW();

    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference
        )
        VALUES (
            v_wallet.id,
            p_user_id,
            'deposit',
            p_amount,
            v_user."walletBalance",
            v_new_bal,
            'Automated Gateway Deposit',
            p_reference
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'newBalance', v_new_bal,
        'transactionId', v_tx_id,
        'message', 'Wallet credited successfully.'
    );
END;
$$;

-- 6. Purchase Investment Plan (4-Week Cycle)
CREATE OR REPLACE FUNCTION public.investor_purchase_plan(
    p_user_id TEXT,
    p_plan_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_plan RECORD;
    v_inv_id TEXT;
    v_tx_id TEXT;
    v_new_bal DOUBLE PRECISION;
    v_next_payout TEXT;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    IF v_user."isDeactivated" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is deactivated. Plan purchases paused.');
    END IF;

    SELECT * INTO v_plan FROM public.investment_plans WHERE id = p_plan_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Investment plan not found.');
    END IF;

    IF v_user."walletBalance" < v_plan.cost THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Insufficient wallet balance. Please top up your wallet.'
        );
    END IF;

    v_new_bal := v_user."walletBalance" - v_plan.cost;
    v_inv_id := 'inv_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    v_tx_id := 'tx_plan_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    v_next_payout := (NOW() + INTERVAL '7 days')::TEXT;

    -- Deduct wallet
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    -- Create active investment
    INSERT INTO public.investments (
        id, "userId", "userName", "planId", "planName", cost, "weeklyPayout", "totalReturns",
        "weeksPaid", "totalWeeks", status, "createdAt", "lastPayoutDate", "nextPayoutDate",
        "autoReinvest", "isMarketing"
    )
    VALUES (
        v_inv_id,
        v_user.id,
        v_user.name,
        v_plan.id,
        v_plan.name,
        v_plan.cost,
        v_plan."weeklyPayout",
        v_plan."totalReturns",
        0,
        v_plan."weeksDuration",
        'active',
        NOW()::TEXT,
        NOW()::TEXT,
        v_next_payout,
        FALSE,
        v_user."isMarketingAccount"
    );

    -- Log transaction
    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'withdrawal',
        v_plan.cost,
        'completed',
        NOW()::TEXT,
        'Purchased ' || v_plan.name || ' (₦' || v_plan.cost || ')',
        v_user."isMarketingAccount"
    );

    -- Double-entry audit ledger
    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = v_new_bal, updated_at = NOW() WHERE id = v_wallet.id;
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference
        )
        VALUES (
            v_wallet.id,
            p_user_id,
            'debit',
            v_plan.cost,
            v_user."walletBalance",
            v_new_bal,
            'Plan Acquisition: ' || v_plan.name,
            v_inv_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'investmentId', v_inv_id,
        'newBalance', v_new_bal,
        'message', 'Plan successfully activated. Weekly returns will be credited every Friday.'
    );
END;
$$;

-- 6b. Claim Weekly Investment Payout (Triggered on Friday Payout Day)
CREATE OR REPLACE FUNCTION public.investor_claim_weekly_payout(
    p_user_id TEXT,
    p_investment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_inv RECORD;
    v_sponsor RECORD;
    v_next_week INTEGER;
    v_is_completed BOOLEAN;
    v_new_bal DOUBLE PRECISION;
    v_sponsor_bonus DOUBLE PRECISION;
    v_tx_id TEXT;
    v_ref_tx_id TEXT;
    v_next_payout TEXT;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    IF v_user."isDeactivated" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is deactivated.');
    END IF;

    SELECT * INTO v_inv FROM public.investments WHERE id = p_investment_id AND "userId" = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Investment plan not found.');
    END IF;

    IF v_inv.status = 'completed' OR v_inv."weeksPaid" >= v_inv."totalWeeks" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'All scheduled weekly payouts already claimed.');
    END IF;

    v_next_week := v_inv."weeksPaid" + 1;
    v_is_completed := (v_next_week >= v_inv."totalWeeks");
    v_new_bal := v_user."walletBalance" + v_inv."weeklyPayout";
    v_next_payout := (NOW() + INTERVAL '7 days')::TEXT;

    -- Credit user wallet
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    -- Update investment
    IF v_is_completed AND v_inv."autoReinvest" THEN
        UPDATE public.investments
        SET 
            "weeksPaid" = 0,
            status = 'active',
            "lastPayoutDate" = NOW()::TEXT,
            "nextPayoutDate" = v_next_payout
        WHERE id = p_investment_id;
    ELSE
        UPDATE public.investments
        SET 
            "weeksPaid" = v_next_week,
            status = CASE WHEN v_is_completed THEN 'completed' ELSE 'active' END,
            "lastPayoutDate" = NOW()::TEXT,
            "nextPayoutDate" = CASE WHEN v_is_completed THEN NULL ELSE v_next_payout END
        WHERE id = p_investment_id;
    END IF;

    -- Log transaction
    v_tx_id := 'tx_pay_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'payout',
        v_inv."weeklyPayout",
        'completed',
        NOW()::TEXT,
        'Weekly Friday Yield: ' || v_inv."planName" || ' (Week ' || v_next_week || '/' || v_inv."totalWeeks" || ')',
        v_inv."isMarketing"
    );

    -- 7.5% Sponsor referral bonus if organic
    IF v_user."referredByCode" IS NOT NULL AND v_inv."isMarketing" = FALSE THEN
        SELECT * INTO v_sponsor FROM public.users WHERE "referralCode" = v_user."referredByCode" LIMIT 1;
        IF FOUND THEN
            v_sponsor_bonus := v_inv."weeklyPayout" * 0.075;
            UPDATE public.users SET "walletBalance" = "walletBalance" + v_sponsor_bonus WHERE id = v_sponsor.id;

            v_ref_tx_id := 'tx_ref_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
            INSERT INTO public.transactions (
                id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
            )
            VALUES (
                v_ref_tx_id,
                v_sponsor.id,
                v_sponsor.name,
                'referral_bonus',
                v_sponsor_bonus,
                'completed',
                NOW()::TEXT,
                '7.5% Sponsor Weekly Commission from ' || v_user.name || '''s ' || v_inv."planName",
                v_sponsor."isMarketingAccount"
            );
        END IF;
    END IF;

    -- Audit ledger
    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = v_new_bal, updated_at = NOW() WHERE id = v_wallet.id;
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference
        )
        VALUES (
            v_wallet.id,
            p_user_id,
            'payout',
            v_inv."weeklyPayout",
            v_user."walletBalance",
            v_new_bal,
            'Weekly Yield Credited: ' || v_inv."planName",
            v_tx_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'creditedAmount', v_inv."weeklyPayout",
        'newBalance', v_new_bal,
        'weekPaid', v_next_week,
        'isCompleted', v_is_completed,
        'message', '₦' || v_inv."weeklyPayout" || ' Friday yield credited to wallet.'
    );
END;
$$;

-- 7. Submit Bank Withdrawal Request
CREATE OR REPLACE FUNCTION public.investor_submit_withdrawal(
    p_user_id TEXT,
    p_amount DOUBLE PRECISION,
    p_bank_details TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_settings RECORD;
    v_tx_id TEXT;
    v_new_bal DOUBLE PRECISION;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    IF v_user."isDeactivated" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is on hold. Withdrawals paused.');
    END IF;

    SELECT * INTO v_settings FROM public.settings WHERE id = 'system_settings';

    IF v_settings."pauseWithdrawals" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Platform withdrawals temporarily paused for scheduled maintenance.');
    END IF;

    IF p_amount < v_settings."minWithdrawal" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Minimum withdrawal amount is ₦' || v_settings."minWithdrawal");
    END IF;

    IF p_amount > v_settings."maxWithdrawal" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Maximum withdrawal per request is ₦' || v_settings."maxWithdrawal");
    END IF;

    IF v_user."walletBalance" < p_amount THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Insufficient wallet balance for this withdrawal request.');
    END IF;

    v_new_bal := v_user."walletBalance" - p_amount;
    v_tx_id := 'tx_with_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    -- Deduct from liquid wallet immediately upon request
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "accountDetails", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'withdrawal',
        p_amount,
        'pending',
        'Bank Transfer',
        p_bank_details,
        NOW()::TEXT,
        'Bank Cashout Request (Pending Settlement)',
        v_user."isMarketingAccount"
    );

    -- Double-entry audit ledger
    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = v_new_bal, updated_at = NOW() WHERE id = v_wallet.id;
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference
        )
        VALUES (
            v_wallet.id,
            p_user_id,
            'withdrawal',
            p_amount,
            v_user."walletBalance",
            v_new_bal,
            'Withdrawal Request Initiated',
            v_tx_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'transactionId', v_tx_id,
        'newBalance', v_new_bal,
        'message', 'Withdrawal request submitted. Funds will arrive in your bank account shortly.'
    );
END;
$$;

-- 8. Submit KYC Identity Details
CREATE OR REPLACE FUNCTION public.investor_submit_kyc(
    p_user_id TEXT,
    p_full_name TEXT,
    p_id_type TEXT,
    p_id_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET 
        "kycStatus" = 'pending',
        "kycDetails" = jsonb_build_object(
            'fullName', TRIM(p_full_name),
            'idType', TRIM(p_id_type),
            'idNumber', TRIM(p_id_number),
            'submittedAt', NOW()::TEXT
        )
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'message', 'KYC documents submitted. Treasury compliance will verify shortly.');
END;
$$;

-- -------------------------------------------------------------------------
-- PART C: MARKETER FUNCTIONS (DOWNLINE, CASHOUT & PRESENTATIONS)
-- -------------------------------------------------------------------------

-- 9. Get Marketer Downline Leads & Conversions
CREATE OR REPLACE FUNCTION public.marketer_get_downline(p_marketer_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_marketer RECORD;
    v_leads JSONB;
    v_total_paid_inflow DOUBLE PRECISION := 0;
    v_paid_count INTEGER := 0;
    v_unfunded_count INTEGER := 0;
BEGIN
    SELECT * INTO v_marketer FROM public.users WHERE id = p_marketer_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Marketer not found.');
    END IF;

    SELECT 
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'phone', u.phone,
                'createdAt', u."createdAt",
                'isRealInvestor', (COALESCE(dep.total_deposited, 0) > 0),
                'totalDeposited', COALESCE(dep.total_deposited, 0),
                'activePlansCount', COALESCE(inv.active_plans, 0)
            )
        ), '[]'::jsonb)
    INTO v_leads
    FROM public.users u
    LEFT JOIN (
        SELECT "userId", SUM(amount) as total_deposited
        FROM public.transactions
        WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE
        GROUP BY "userId"
    ) dep ON dep."userId" = u.id
    LEFT JOIN (
        SELECT "userId", COUNT(*) as active_plans
        FROM public.investments
        WHERE status = 'active'
        GROUP BY "userId"
    ) inv ON inv."userId" = u.id
    WHERE u."referredByCode" = v_marketer."referralCode";

    -- Aggregate totals
    SELECT 
        COALESCE(SUM(dep.total_deposited), 0),
        COUNT(CASE WHEN dep.total_deposited > 0 THEN 1 END),
        COUNT(CASE WHEN dep.total_deposited IS NULL OR dep.total_deposited = 0 THEN 1 END)
    INTO v_total_paid_inflow, v_paid_count, v_unfunded_count
    FROM public.users u
    LEFT JOIN (
        SELECT "userId", SUM(amount) as total_deposited
        FROM public.transactions
        WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE
        GROUP BY "userId"
    ) dep ON dep."userId" = u.id
    WHERE u."referredByCode" = v_marketer."referralCode";

    RETURN jsonb_build_object(
        'success', TRUE,
        'referralCode', v_marketer."referralCode",
        'totalLeadsCount', v_paid_count + v_unfunded_count,
        'realPaidInvestorsCount', v_paid_count,
        'unfundedLeadsCount', v_unfunded_count,
        'totalDownlinePaidInflow', v_total_paid_inflow,
        'leads', v_leads
    );
END;
$$;

-- 10. Marketer Commission Cashout Request
CREATE OR REPLACE FUNCTION public.marketer_request_commission_cashout(
    p_marketer_id TEXT,
    p_amount DOUBLE PRECISION,
    p_bank_details TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_tx_id TEXT;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_marketer_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Marketer not found.');
    END IF;

    IF v_user."isDeactivated" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is on administrative hold.');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Amount must be greater than zero.');
    END IF;

    IF v_user."walletBalance" < p_amount THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Insufficient earned commission balance.');
    END IF;

    v_new_bal := v_user."walletBalance" - p_amount;
    v_tx_id := 'tx_comm_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_marketer_id;

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "accountDetails", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'withdrawal',
        p_amount,
        'pending',
        'Bank Transfer',
        p_bank_details,
        NOW()::TEXT,
        'Marketer 7.5% Commission Cashout - ' || p_bank_details,
        TRUE
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'transactionId', v_tx_id,
        'newBalance', v_new_bal,
        'message', 'Commission cashout requested. Funds will be sent directly to your bank account.'
    );
END;
$$;

-- -------------------------------------------------------------------------
-- PART D: ADMIN FULL ACCESS FUNCTIONS (UNRESTRICTED CONTROLS & OVERRIDES)
-- -------------------------------------------------------------------------

-- 11. Admin Approve Deposit (With Optional Bank Reconciled Amount Adjustment)
CREATE OR REPLACE FUNCTION public.admin_approve_deposit(
    p_tx_id TEXT,
    p_admin_id TEXT DEFAULT 'usr_admin',
    p_adjusted_amount DOUBLE PRECISION DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_user RECORD;
    v_final_amount DOUBLE PRECISION;
    v_new_bal DOUBLE PRECISION;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_tx_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Deposit transaction not found.');
    END IF;

    IF v_tx.status = 'completed' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Transaction already approved and credited.');
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_tx."userId";
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Investor account not found.');
    END IF;

    -- Use adjusted amount if positive, otherwise original amount
    IF p_adjusted_amount IS NOT NULL AND p_adjusted_amount > 0 THEN
        v_final_amount := p_adjusted_amount;
    ELSE
        v_final_amount := v_tx.amount;
    END IF;

    v_new_bal := v_user."walletBalance" + v_final_amount;

    -- Update User Balance
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = v_user.id;

    -- Update Transaction Status
    UPDATE public.transactions 
    SET 
        status = 'completed',
        amount = v_final_amount,
        description = CASE 
            WHEN v_final_amount != v_tx.amount THEN 
                v_tx.description || ' (Reconciled from ₦' || v_tx.amount || ' to ₦' || v_final_amount || ')'
            ELSE v_tx.description 
        END
    WHERE id = p_tx_id;

    -- Audit Ledger update
    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = v_user.id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = v_new_bal, updated_at = NOW() WHERE id = v_wallet.id;
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference, performed_by
        )
        VALUES (
            v_wallet.id,
            v_user.id,
            'deposit',
            v_final_amount,
            v_user."walletBalance",
            v_new_bal,
            'Treasury Verified Bank Deposit',
            p_tx_id,
            p_admin_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'newBalance', v_new_bal,
        'creditedAmount', v_final_amount,
        'message', 'Deposit verified and credited to ' || v_user.name || '''s wallet.'
    );
END;
$$;

-- 12. Admin Reject Deposit
CREATE OR REPLACE FUNCTION public.admin_reject_deposit(
    p_tx_id TEXT,
    p_admin_id TEXT DEFAULT 'usr_admin',
    p_reason TEXT DEFAULT 'Invalid or unverified receipt'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.transactions
    SET 
        status = 'rejected',
        description = description || ' [Rejected by Admin: ' || p_reason || ']'
    WHERE id = p_tx_id AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Pending transaction not found.');
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Deposit rejected.');
END;
$$;

-- 13. Admin Approve Withdrawal
CREATE OR REPLACE FUNCTION public.admin_approve_withdrawal(
    p_tx_id TEXT,
    p_admin_id TEXT DEFAULT 'usr_admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.transactions
    SET 
        status = 'completed',
        description = description || ' [Disbursed by Treasury]'
    WHERE id = p_tx_id AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Pending withdrawal not found.');
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Withdrawal approved and marked disbursed.');
END;
$$;

-- 14. Admin Reject Withdrawal (Automatic Full Wallet Refund)
CREATE OR REPLACE FUNCTION public.admin_reject_withdrawal(
    p_tx_id TEXT,
    p_admin_id TEXT DEFAULT 'usr_admin',
    p_reason TEXT DEFAULT 'Beneficiary account error or compliance review'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_user RECORD;
    v_new_bal DOUBLE PRECISION;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_tx_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Transaction not found.');
    END IF;

    IF v_tx.status != 'pending' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Transaction is not in pending state.');
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_tx."userId";
    v_new_bal := v_user."walletBalance" + v_tx.amount;

    -- Refund user wallet
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = v_user.id;

    -- Mark transaction rejected
    UPDATE public.transactions 
    SET 
        status = 'rejected',
        description = v_tx.description || ' [Rejected & Refunded: ' || p_reason || ']'
    WHERE id = p_tx_id;

    -- Audit ledger refund record
    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = v_user.id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = v_new_bal, updated_at = NOW() WHERE id = v_wallet.id;
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference, performed_by
        )
        VALUES (
            v_wallet.id,
            v_user.id,
            'credit',
            v_tx.amount,
            v_user."walletBalance",
            v_new_bal,
            'Refunded Rejected Withdrawal',
            p_tx_id,
            p_admin_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'newBalance', v_new_bal,
        'refundedAmount', v_tx.amount,
        'message', 'Withdrawal rejected and ₦' || v_tx.amount || ' refunded to user wallet.'
    );
END;
$$;

-- 15. Admin Update Any User (Master Account & Wallet Editor)
CREATE OR REPLACE FUNCTION public.admin_update_user(
    p_user_id TEXT,
    p_name TEXT,
    p_wallet_balance DOUBLE PRECISION,
    p_role TEXT,
    p_kyc_status TEXT,
    p_phone TEXT DEFAULT NULL,
    p_is_deactivated BOOLEAN DEFAULT FALSE,
    p_is_marketing BOOLEAN DEFAULT FALSE,
    p_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    UPDATE public.users
    SET 
        name = TRIM(p_name),
        "walletBalance" = p_wallet_balance,
        role = p_role,
        "kycStatus" = p_kyc_status,
        phone = NULLIF(TRIM(p_phone), ''),
        "isDeactivated" = p_is_deactivated,
        "isMarketingAccount" = p_is_marketing,
        password = CASE WHEN p_password IS NOT NULL AND TRIM(p_password) != '' THEN TRIM(p_password) ELSE password END
    WHERE id = p_user_id;

    -- Audit ledger sync
    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = p_wallet_balance, updated_at = NOW() WHERE id = v_wallet.id;
        IF p_wallet_balance != v_user."walletBalance" THEN
            INSERT INTO public.wallet_transactions (
                wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference, performed_by
            )
            VALUES (
                v_wallet.id,
                p_user_id,
                'initial_credit',
                ABS(p_wallet_balance - v_user."walletBalance"),
                v_user."walletBalance",
                p_wallet_balance,
                'Admin Manual Balance Correction',
                'admin_adj_' || TO_CHAR(NOW(), 'YYYYMMDD'),
                'admin'
            );
        END IF;
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'message', 'User profile and permissions updated successfully.');
END;
$$;

-- 16. Admin Create Any User (Direct Master Account Provisioning)
CREATE OR REPLACE FUNCTION public.admin_create_user(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_password TEXT,
    p_wallet_balance DOUBLE PRECISION,
    p_role TEXT,
    p_kyc_status TEXT,
    p_is_marketing BOOLEAN,
    p_sponsor_code TEXT DEFAULT NULL,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id TEXT;
    v_ref_code TEXT;
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = v_clean_email) THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User with this email already exists.');
    END IF;

    v_user_id := 'usr_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    
    IF p_referral_code IS NOT NULL AND TRIM(p_referral_code) != '' THEN
        v_ref_code := UPPER(TRIM(p_referral_code));
    ELSE
        v_ref_code := 'INV' || (FLOOR(RANDOM() * 9000) + 1000)::TEXT;
    END IF;

    INSERT INTO public.users (
        id, name, email, phone, password, "referralCode", "referredByCode", "walletBalance",
        "kycStatus", role, "createdAt", "isDeactivated", "isMarketingAccount", "marketingAllocatedBalance"
    )
    VALUES (
        v_user_id,
        TRIM(p_name),
        v_clean_email,
        NULLIF(TRIM(p_phone), ''),
        COALESCE(NULLIF(TRIM(p_password), ''), 'password123'),
        v_ref_code,
        NULLIF(UPPER(TRIM(p_sponsor_code)), ''),
        COALESCE(p_wallet_balance, 0),
        COALESCE(p_kyc_status, 'verified'),
        COALESCE(p_role, 'user'),
        NOW()::TEXT,
        FALSE,
        COALESCE(p_is_marketing, FALSE),
        CASE WHEN p_is_marketing THEN COALESCE(p_wallet_balance, 0) ELSE 0 END
    );

    INSERT INTO public.wallets (user_id, balance) VALUES (v_user_id, COALESCE(p_wallet_balance, 0)) ON CONFLICT (user_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', TRUE,
        'userId', v_user_id,
        'referralCode', v_ref_code,
        'message', 'User account successfully created.'
    );
END;
$$;

-- 17. Admin Top Up Marketer Canvassing Demo Budget
CREATE OR REPLACE FUNCTION public.admin_topup_marketing_wallet(
    p_user_id TEXT,
    p_amount DOUBLE PRECISION,
    p_notes TEXT DEFAULT 'Marketing Canvassing Allocation'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_new_bal DOUBLE PRECISION;
    v_new_promo DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.');
    END IF;

    IF NOT v_user."isMarketingAccount" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account is not a registered marketing canvasser.');
    END IF;

    v_new_bal := v_user."walletBalance" + p_amount;
    v_new_promo := v_user."marketingAllocatedBalance" + p_amount;

    UPDATE public.users 
    SET 
        "walletBalance" = v_new_bal,
        "marketingAllocatedBalance" = v_new_promo
    WHERE id = p_user_id;

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "createdAt", description, "isMarketing"
    )
    VALUES (
        'tx_promo_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
        v_user.id,
        v_user.name,
        'deposit',
        p_amount,
        'completed',
        'Treasure Homes Canvassing Allocation',
        NOW()::TEXT,
        'Canvassing Demo Budget: ' || p_notes,
        TRUE
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'newWalletBalance', v_new_bal,
        'allocatedPromoBudget', v_new_promo,
        'message', 'Credited ₦' || p_amount || ' promotional demo budget to canvasser.'
    );
END;
$$;

-- 18. Admin Trigger Friday Weekly Payouts (Automated Batch Yield Processor)
CREATE OR REPLACE FUNCTION public.admin_trigger_weekly_payouts(p_admin_id TEXT DEFAULT 'usr_admin')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inv RECORD;
    v_sponsor RECORD;
    v_sponsor_bonus DOUBLE PRECISION;
    v_count_payouts INTEGER := 0;
    v_total_paid DOUBLE PRECISION := 0;
    v_next_week_paid INTEGER;
    v_is_completed BOOLEAN;
BEGIN
    FOR v_inv IN 
        SELECT i.*, u.name as investor_name, u."referredByCode"
        FROM public.investments i
        JOIN public.users u ON u.id = i."userId"
        WHERE i.status = 'active' AND i."weeksPaid" < i."totalWeeks"
    LOOP
        v_next_week_paid := v_inv."weeksPaid" + 1;
        v_is_completed := (v_next_week_paid >= v_inv."totalWeeks");

        -- 1. Credit weekly payout to investor
        UPDATE public.users 
        SET "walletBalance" = "walletBalance" + v_inv."weeklyPayout"
        WHERE id = v_inv."userId";

        -- 2. Log payout transaction
        INSERT INTO public.transactions (
            id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
        )
        VALUES (
            'tx_pay_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
            v_inv."userId",
            v_inv."userName",
            'payout',
            v_inv."weeklyPayout",
            'completed',
            NOW()::TEXT,
            'Weekly Friday Yield: ' || v_inv."planName" || ' (Week ' || v_next_week_paid || '/' || v_inv."totalWeeks" || ')',
            v_inv."isMarketing"
        );

        -- 3. 7.5% Referral Bonus to Sponsor (Non-marketing organic investments)
        IF v_inv."referredByCode" IS NOT NULL AND v_inv."isMarketing" = FALSE THEN
            SELECT * INTO v_sponsor FROM public.users WHERE "referralCode" = v_inv."referredByCode" LIMIT 1;
            IF FOUND THEN
                v_sponsor_bonus := v_inv."weeklyPayout" * 0.075;
                
                UPDATE public.users 
                SET "walletBalance" = "walletBalance" + v_sponsor_bonus
                WHERE id = v_sponsor.id;

                INSERT INTO public.transactions (
                    id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
                )
                VALUES (
                    'tx_ref_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
                    v_sponsor.id,
                    v_sponsor.name,
                    'referral_bonus',
                    v_sponsor_bonus,
                    'completed',
                    NOW()::TEXT,
                    '7.5% Sponsor Weekly Commission from ' || v_inv."userName" || '''s ' || v_inv."planName",
                    v_sponsor."isMarketingAccount"
                );
            END IF;
        END IF;

        -- 4. Advance investment cycle or rollover if auto-reinvest
        IF v_is_completed AND v_inv."autoReinvest" THEN
            UPDATE public.investments
            SET 
                "weeksPaid" = 0,
                status = 'active',
                "lastPayoutDate" = NOW()::TEXT,
                "nextPayoutDate" = (NOW() + INTERVAL '7 days')::TEXT
            WHERE id = v_inv.id;
        ELSE
            UPDATE public.investments
            SET 
                "weeksPaid" = v_next_week_paid,
                status = CASE WHEN v_is_completed THEN 'completed' ELSE 'active' END,
                "lastPayoutDate" = NOW()::TEXT,
                "nextPayoutDate" = (NOW() + INTERVAL '7 days')::TEXT
            WHERE id = v_inv.id;
        END IF;

        v_count_payouts := v_count_payouts + 1;
        v_total_paid := v_total_paid + v_inv."weeklyPayout";
    END LOOP;

    -- Advance timeline week
    UPDATE public.system_state 
    SET value = (COALESCE(NULLIF(value, '')::INTEGER, 1) + 1)::TEXT
    WHERE key = 'current_week';

    RETURN jsonb_build_object(
        'success', TRUE,
        'payoutsProcessed', v_count_payouts,
        'totalYieldDisbursed', v_total_paid,
        'message', 'Disbursed ' || v_count_payouts || ' Friday investment yields totaling ₦' || v_total_paid
    );
END;
$$;

-- 19. Admin Emergency Balance Override (Unrestricted Master Ledger Correction)
CREATE OR REPLACE FUNCTION public.admin_override_any_balance(
    p_user_id TEXT,
    p_new_balance DOUBLE PRECISION,
    p_reason TEXT DEFAULT 'Administrative Balance Adjustment',
    p_admin_id TEXT DEFAULT 'usr_admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    UPDATE public.users SET "walletBalance" = p_new_balance WHERE id = p_user_id;

    SELECT id INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet.id IS NOT NULL THEN
        UPDATE public.wallets SET balance = p_new_balance, updated_at = NOW() WHERE id = v_wallet.id;
        INSERT INTO public.wallet_transactions (
            wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference, performed_by
        )
        VALUES (
            v_wallet.id,
            p_user_id,
            'initial_credit',
            ABS(p_new_balance - v_user."walletBalance"),
            v_user."walletBalance",
            p_new_balance,
            'Admin Balance Override: ' || p_reason,
            'override_' || TO_CHAR(NOW(), 'YYYYMMDD'),
            p_admin_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'newBalance', p_new_balance,
        'message', 'Balance for ' || v_user.name || ' updated to ₦' || p_new_balance
    );
END;
$$;

-- 20. Admin Approve Task Proof Submission
CREATE OR REPLACE FUNCTION public.admin_approve_task_submission(
    p_submission_id TEXT,
    p_admin_id TEXT DEFAULT 'usr_admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sub RECORD;
    v_user RECORD;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_sub FROM public.task_submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Task submission not found.');
    END IF;

    IF v_sub.status = 'approved' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Submission already approved.');
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_sub."userId";
    v_new_bal := v_user."walletBalance" + v_sub."rewardAmount";

    -- Credit user wallet with bounty
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = v_user.id;

    -- Update submission status
    UPDATE public.task_submissions 
    SET status = 'approved', "reviewedAt" = NOW()::TEXT 
    WHERE id = p_submission_id;

    -- Log transaction
    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        'tx_task_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
        v_user.id,
        v_user.name,
        'task_reward',
        v_sub."rewardAmount",
        'completed',
        NOW()::TEXT,
        'Growth Quest Bounty Approved: ' || v_sub."taskTitle",
        v_user."isMarketingAccount"
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'creditedAmount', v_sub."rewardAmount",
        'newBalance', v_new_bal,
        'message', 'Quest approved. Credited ₦' || v_sub."rewardAmount" || ' to ' || v_user.name
    );
END;
$$;

-- 20b. Admin Get Master Users Summary (With Real Paid Top-Up Breakdown)
CREATE OR REPLACE FUNCTION public.admin_get_master_users_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_users JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'phone', u.phone,
            'role', u.role,
            'walletBalance', u."walletBalance",
            'kycStatus', u."kycStatus",
            'isDeactivated', u."isDeactivated",
            'isMarketingAccount', u."isMarketingAccount",
            'marketingAllocatedBalance', u."marketingAllocatedBalance",
            'referralCode', u."referralCode",
            'referredByCode', u."referredByCode",
            'createdAt', u."createdAt",
            'totalPaidTopup', COALESCE(dep.paid_total, 0),
            'activePlansCount', COALESCE(inv.active_plans, 0),
            'classification', CASE 
                WHEN u.role = 'admin' THEN 'admin'
                WHEN u."isMarketingAccount" THEN 'marketing_canvasser'
                WHEN COALESCE(dep.paid_total, 0) > 0 THEN 'real_paid_investor'
                ELSE 'unfunded_lead'
            END
        ) ORDER BY u."createdAt" DESC
    ), '[]'::jsonb)
    INTO v_users
    FROM public.users u
    LEFT JOIN (
        SELECT "userId", SUM(amount) as paid_total
        FROM public.transactions
        WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE
        GROUP BY "userId"
    ) dep ON dep."userId" = u.id
    LEFT JOIN (
        SELECT "userId", COUNT(*) as active_plans
        FROM public.investments
        WHERE status = 'active'
        GROUP BY "userId"
    ) inv ON inv."userId" = u.id;

    RETURN v_users;
END;
$$;

-- 20c. Admin Update or Create Investment Plan
CREATE OR REPLACE FUNCTION public.admin_upsert_investment_plan(
    p_plan_id TEXT,
    p_name TEXT,
    p_cost DOUBLE PRECISION,
    p_weekly_payout DOUBLE PRECISION,
    p_total_returns DOUBLE PRECISION,
    p_weeks_duration INTEGER DEFAULT 4
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.investment_plans (id, name, cost, "weeklyPayout", "totalReturns", "weeksDuration")
    VALUES (p_plan_id, TRIM(p_name), p_cost, p_weekly_payout, p_total_returns, COALESCE(p_weeks_duration, 4))
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        cost = EXCLUDED.cost,
        "weeklyPayout" = EXCLUDED."weeklyPayout",
        "totalReturns" = EXCLUDED."totalReturns",
        "weeksDuration" = EXCLUDED."weeksDuration";

    RETURN jsonb_build_object('success', TRUE, 'message', 'Investment plan updated successfully.');
END;
$$;

-- 21. Admin Reset Platform Database (Seed Restore)
CREATE OR REPLACE FUNCTION public.admin_reset_platform_database(p_admin_email TEXT DEFAULT 'admin@treasurehomes.com')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete dynamic records while preserving schema
    DELETE FROM public.investments;
    DELETE FROM public.transactions;
    DELETE FROM public.task_submissions;
    DELETE FROM public.user_daily_progress;
    DELETE FROM public.wallet_transactions;
    DELETE FROM public.wallets WHERE user_id != 'usr_admin';
    DELETE FROM public.users WHERE id != 'usr_admin' AND role != 'admin';

    -- Reset admin wallet
    UPDATE public.users 
    SET "walletBalance" = 0, "kycStatus" = 'verified', "isDeactivated" = FALSE 
    WHERE role = 'admin';

    UPDATE public.wallets SET balance = 0, updated_at = NOW() WHERE user_id = 'usr_admin';

    -- Reset timeline
    UPDATE public.system_state SET value = '1' WHERE key = 'current_week';
    UPDATE public.system_state SET value = '0' WHERE key = 'virtual_day_offset';

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Platform database reset to initial production baseline.'
    );
END;
$$;

-- =========================================================================
-- PERMISSIONS, ROW LEVEL SECURITY & REALTIME REPLICATION
-- =========================================================================

-- Grant full permissions to all roles (Postgres, Anon, Authenticated, Service Role)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- Attach tables to Supabase Realtime Publication for instant multi-user synchronization
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.investments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_state;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_submissions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_daily_progress;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
