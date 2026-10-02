-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- PART 2 OF 2: STORED PROCEDURES, AUDIT FUNCTIONS & REALTIME REPLICATION
-- (Paste this second in Supabase SQL Editor and click RUN)
-- =========================================================================

-- -------------------------------------------------------------------------
-- PART A: VISITOR FUNCTIONS
-- -------------------------------------------------------------------------

-- 1. Public Platform Stats
CREATE OR REPLACE FUNCTION public.public_get_platform_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_reserve DOUBLE PRECISION;
    v_active_capital DOUBLE PRECISION;
    v_investors_count INTEGER;
BEGIN
    SELECT "liquidityReserve" INTO v_reserve FROM public.settings WHERE id = 'system_settings';
    SELECT COALESCE(SUM(cost), 0) INTO v_active_capital FROM public.investments WHERE status = 'active' AND "isMarketing" = FALSE;
    SELECT COUNT(*) INTO v_investors_count FROM public.users WHERE role != 'admin' AND "isMarketingAccount" = FALSE;

    RETURN jsonb_build_object(
        'liquidityReserve', COALESCE(v_reserve, 92000000),
        'activeInvestorCapital', v_active_capital,
        'registeredInvestors', v_investors_count,
        'payoutDay', 'Friday'
    );
END;
$$;

-- 2. Verify Referral Code
CREATE OR REPLACE FUNCTION public.public_verify_referral_code(p_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- 3. Public Get Investment Plans
CREATE OR REPLACE FUNCTION public.public_get_investment_plans()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_plans JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id, 'name', name, 'cost', cost,
            'weeklyPayout', "weeklyPayout", 'totalReturns', "totalReturns", 'weeksDuration', "weeksDuration"
        ) ORDER BY cost ASC
    ), '[]'::jsonb)
    INTO v_plans
    FROM public.investment_plans;

    RETURN v_plans;
END;
$$;

-- 4. Public User Registration
CREATE OR REPLACE FUNCTION public.public_register_user(
    p_name TEXT, p_email TEXT, p_password TEXT, p_referred_by TEXT, p_phone TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id TEXT;
    v_new_ref TEXT;
    v_sponsor_code TEXT := NULL;
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(email) = v_clean_email) THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Account with this email already exists.');
    END IF;

    IF p_referred_by IS NOT NULL AND TRIM(p_referred_by) != '' THEN
        SELECT "referralCode" INTO v_sponsor_code FROM public.users WHERE UPPER("referralCode") = UPPER(TRIM(p_referred_by)) LIMIT 1;
        IF v_sponsor_code IS NULL THEN
            RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid sponsor invite code.');
        END IF;
    ELSE
        v_sponsor_code := 'INV1000';
    END IF;

    v_user_id := 'usr_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    v_new_ref := 'INV' || (FLOOR(RANDOM() * 9000) + 1000)::TEXT;

    INSERT INTO public.users (
        id, name, email, phone, password, "referralCode", "referredByCode", "walletBalance", "kycStatus", role, "createdAt"
    )
    VALUES (
        v_user_id, TRIM(p_name), v_clean_email, NULLIF(TRIM(p_phone), ''),
        COALESCE(NULLIF(TRIM(p_password), ''), 'password123'),
        v_new_ref, v_sponsor_code, 0, 'unverified', 'user', NOW()::TEXT
    );

    INSERT INTO public.wallets (user_id, balance) VALUES (v_user_id, 0) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_daily_progress (user_id, "current_date") VALUES (v_user_id, TO_CHAR(NOW(), 'YYYY-MM-DD')) ON CONFLICT (user_id) DO NOTHING;

    RETURN jsonb_build_object('success', TRUE, 'userId', v_user_id, 'referralCode', v_new_ref, 'message', 'Registration successful.');
END;
$$;

-- -------------------------------------------------------------------------
-- PART B: INVESTOR FUNCTIONS
-- -------------------------------------------------------------------------

-- 5. Submit Deposit (Pending Treasury Approval)
CREATE OR REPLACE FUNCTION public.investor_submit_deposit(
    p_user_id TEXT, p_amount DOUBLE PRECISION, p_payment_method TEXT DEFAULT 'Bank Transfer (Treasure Homes Reserve)',
    p_account_details TEXT DEFAULT NULL, p_proof_url TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user RECORD;
    v_tx_id TEXT;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.'); END IF;
    IF v_user."isDeactivated" THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Account is on administrative hold.'); END IF;
    IF p_amount <= 0 THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Amount must be positive.'); END IF;

    v_tx_id := 'tx_dep_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "accountDetails", "proofUrl", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id, v_user.id, v_user.name, 'deposit', p_amount, 'pending', p_payment_method, p_account_details, p_proof_url, NOW()::TEXT,
        'Bank Transfer Deposit (Pending Verification)', v_user."isMarketingAccount"
    );

    RETURN jsonb_build_object('success', TRUE, 'transactionId', v_tx_id, 'message', 'Deposit submitted for treasury verification.');
END;
$$;

-- 6. Purchase Investment Plan
CREATE OR REPLACE FUNCTION public.investor_purchase_plan(p_user_id TEXT, p_plan_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user RECORD;
    v_plan RECORD;
    v_inv_id TEXT;
    v_tx_id TEXT;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.'); END IF;
    IF v_user."isDeactivated" THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Account is deactivated.'); END IF;

    SELECT * INTO v_plan FROM public.investment_plans WHERE id = p_plan_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Plan not found.'); END IF;
    IF v_user."walletBalance" < v_plan.cost THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Insufficient wallet balance.'); END IF;

    v_new_bal := v_user."walletBalance" - v_plan.cost;
    v_inv_id := 'inv_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    v_tx_id := 'tx_plan_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    INSERT INTO public.investments (
        id, "userId", "userName", "planId", "planName", cost, "weeklyPayout", "totalReturns",
        "weeksPaid", "totalWeeks", status, "createdAt", "lastPayoutDate", "nextPayoutDate", "autoReinvest", "isMarketing"
    )
    VALUES (
        v_inv_id, v_user.id, v_user.name, v_plan.id, v_plan.name, v_plan.cost, v_plan."weeklyPayout", v_plan."totalReturns",
        0, v_plan."weeksDuration", 'active', NOW()::TEXT, NOW()::TEXT, (NOW() + INTERVAL '7 days')::TEXT, FALSE, v_user."isMarketingAccount"
    );

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id, v_user.id, v_user.name, 'withdrawal', v_plan.cost, 'completed', NOW()::TEXT,
        'Purchased ' || v_plan.name || ' (₦' || v_plan.cost || ')', v_user."isMarketingAccount"
    );

    RETURN jsonb_build_object('success', TRUE, 'investmentId', v_inv_id, 'newBalance', v_new_bal, 'message', 'Plan activated successfully.');
END;
$$;

-- 7. Claim Weekly Payout (Countdown Completion on Friday)
CREATE OR REPLACE FUNCTION public.investor_claim_weekly_payout(p_user_id TEXT, p_investment_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user RECORD;
    v_inv RECORD;
    v_sponsor RECORD;
    v_next_week INTEGER;
    v_is_completed BOOLEAN;
    v_new_bal DOUBLE PRECISION;
    v_sponsor_bonus DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    SELECT * INTO v_inv FROM public.investments WHERE id = p_investment_id AND "userId" = p_user_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Investment plan not found.'); END IF;
    IF v_inv.status = 'completed' OR v_inv."weeksPaid" >= v_inv."totalWeeks" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'All payouts already credited.');
    END IF;

    v_next_week := v_inv."weeksPaid" + 1;
    v_is_completed := (v_next_week >= v_inv."totalWeeks");
    v_new_bal := v_user."walletBalance" + v_inv."weeklyPayout";

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    UPDATE public.investments
    SET 
        "weeksPaid" = v_next_week,
        status = CASE WHEN v_is_completed THEN 'completed' ELSE 'active' END,
        "lastPayoutDate" = NOW()::TEXT,
        "nextPayoutDate" = CASE WHEN v_is_completed THEN NULL ELSE (NOW() + INTERVAL '7 days')::TEXT END
    WHERE id = p_investment_id;

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        'tx_pay_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
        v_user.id, v_user.name, 'payout', v_inv."weeklyPayout", 'completed', NOW()::TEXT,
        'Weekly Friday Yield: ' || v_inv."planName" || ' (Week ' || v_next_week || '/' || v_inv."totalWeeks" || ')',
        v_inv."isMarketing"
    );

    IF v_user."referredByCode" IS NOT NULL AND v_inv."isMarketing" = FALSE THEN
        SELECT * INTO v_sponsor FROM public.users WHERE "referralCode" = v_user."referredByCode" LIMIT 1;
        IF FOUND THEN
            v_sponsor_bonus := v_inv."weeklyPayout" * 0.075;
            UPDATE public.users SET "walletBalance" = "walletBalance" + v_sponsor_bonus WHERE id = v_sponsor.id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', TRUE, 'creditedAmount', v_inv."weeklyPayout", 'newBalance', v_new_bal, 'message', 'Yield credited.');
END;
$$;

-- 8. Submit Withdrawal Request
CREATE OR REPLACE FUNCTION public.investor_submit_withdrawal(p_user_id TEXT, p_amount DOUBLE PRECISION, p_bank_details TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user RECORD;
    v_tx_id TEXT;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.'); END IF;
    IF v_user."isDeactivated" THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Account is on hold.'); END IF;
    IF v_user."walletBalance" < p_amount THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Insufficient wallet balance.'); END IF;

    v_new_bal := v_user."walletBalance" - p_amount;
    v_tx_id := 'tx_with_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "accountDetails", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id, v_user.id, v_user.name, 'withdrawal', p_amount, 'pending', 'Bank Transfer', p_bank_details, NOW()::TEXT,
        'Bank Cashout Request (Pending Settlement)', v_user."isMarketingAccount"
    );

    RETURN jsonb_build_object('success', TRUE, 'transactionId', v_tx_id, 'newBalance', v_new_bal, 'message', 'Withdrawal request submitted.');
END;
$$;

-- -------------------------------------------------------------------------
-- PART C: MARKETER FUNCTIONS
-- -------------------------------------------------------------------------

-- 9. Get Marketer Downline & Real Paid Stats
CREATE OR REPLACE FUNCTION public.marketer_get_downline(p_marketer_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_marketer RECORD;
    v_leads JSONB;
    v_total_paid_inflow DOUBLE PRECISION := 0;
    v_paid_count INTEGER := 0;
    v_unfunded_count INTEGER := 0;
BEGIN
    SELECT * INTO v_marketer FROM public.users WHERE id = p_marketer_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Marketer not found.'); END IF;

    SELECT 
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone,
                'createdAt', u."createdAt",
                'isRealInvestor', (COALESCE(dep.total_deposited, 0) > 0),
                'totalDeposited', COALESCE(dep.total_deposited, 0),
                'activePlansCount', COALESCE(inv.active_plans, 0)
            )
        ), '[]'::jsonb)
    INTO v_leads
    FROM public.users u
    LEFT JOIN (
        SELECT "userId", SUM(amount) as total_deposited FROM public.transactions WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE GROUP BY "userId"
    ) dep ON dep."userId" = u.id
    LEFT JOIN (
        SELECT "userId", COUNT(*) as active_plans FROM public.investments WHERE status = 'active' GROUP BY "userId"
    ) inv ON inv."userId" = u.id
    WHERE u."referredByCode" = v_marketer."referralCode";

    SELECT 
        COALESCE(SUM(dep.total_deposited), 0),
        COUNT(CASE WHEN dep.total_deposited > 0 THEN 1 END),
        COUNT(CASE WHEN dep.total_deposited IS NULL OR dep.total_deposited = 0 THEN 1 END)
    INTO v_total_paid_inflow, v_paid_count, v_unfunded_count
    FROM public.users u
    LEFT JOIN (
        SELECT "userId", SUM(amount) as total_deposited FROM public.transactions WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE GROUP BY "userId"
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
    p_marketer_id TEXT, p_amount DOUBLE PRECISION, p_bank_details TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user RECORD;
    v_tx_id TEXT;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_marketer_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Marketer not found.'); END IF;
    IF v_user."walletBalance" < p_amount THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Insufficient commission balance.'); END IF;

    v_new_bal := v_user."walletBalance" - p_amount;
    v_tx_id := 'tx_comm_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_marketer_id;

    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "paymentMethod", "accountDetails", "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id, v_user.id, v_user.name, 'withdrawal', p_amount, 'pending', 'Bank Transfer', p_bank_details, NOW()::TEXT,
        'Marketer 7.5% Commission Cashout - ' || p_bank_details, TRUE
    );

    RETURN jsonb_build_object('success', TRUE, 'transactionId', v_tx_id, 'newBalance', v_new_bal, 'message', 'Cashout requested.');
END;
$$;

-- -------------------------------------------------------------------------
-- PART D: ADMIN FULL ACCESS FUNCTIONS
-- -------------------------------------------------------------------------

-- 11. Admin Approve Deposit
CREATE OR REPLACE FUNCTION public.admin_approve_deposit(
    p_tx_id TEXT, p_admin_id TEXT DEFAULT 'usr_admin', p_adjusted_amount DOUBLE PRECISION DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_tx RECORD;
    v_user RECORD;
    v_final_amount DOUBLE PRECISION;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_tx_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Transaction not found.'); END IF;
    IF v_tx.status = 'completed' THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Already approved.'); END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_tx."userId";
    v_final_amount := COALESCE(NULLIF(p_adjusted_amount, 0), v_tx.amount);
    v_new_bal := v_user."walletBalance" + v_final_amount;

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = v_user.id;
    UPDATE public.transactions SET status = 'completed', amount = v_final_amount WHERE id = p_tx_id;

    RETURN jsonb_build_object('success', TRUE, 'newBalance', v_new_bal, 'creditedAmount', v_final_amount, 'message', 'Deposit approved.');
END;
$$;

-- 12. Admin Reject Deposit
CREATE OR REPLACE FUNCTION public.admin_reject_deposit(p_tx_id TEXT, p_admin_id TEXT DEFAULT 'usr_admin', p_reason TEXT DEFAULT 'Unverified receipt')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.transactions SET status = 'rejected', description = description || ' [Rejected: ' || p_reason || ']' WHERE id = p_tx_id AND status = 'pending';
    RETURN jsonb_build_object('success', TRUE, 'message', 'Deposit rejected.');
END;
$$;

-- 13. Admin Approve Withdrawal
CREATE OR REPLACE FUNCTION public.admin_approve_withdrawal(p_tx_id TEXT, p_admin_id TEXT DEFAULT 'usr_admin')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.transactions SET status = 'completed', description = description || ' [Disbursed by Treasury]' WHERE id = p_tx_id AND status = 'pending';
    RETURN jsonb_build_object('success', TRUE, 'message', 'Withdrawal approved.');
END;
$$;

-- 14. Admin Reject Withdrawal (Automatic Full Wallet Refund)
CREATE OR REPLACE FUNCTION public.admin_reject_withdrawal(p_tx_id TEXT, p_admin_id TEXT DEFAULT 'usr_admin', p_reason TEXT DEFAULT 'Beneficiary account error')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_tx RECORD;
    v_user RECORD;
    v_new_bal DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_tx FROM public.transactions WHERE id = p_tx_id;
    IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Transaction not found.'); END IF;
    IF v_tx.status != 'pending' THEN RETURN jsonb_build_object('success', FALSE, 'message', 'Not pending.'); END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_tx."userId";
    v_new_bal := v_user."walletBalance" + v_tx.amount;

    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = v_user.id;
    UPDATE public.transactions SET status = 'rejected', description = v_tx.description || ' [Rejected & Refunded: ' || p_reason || ']' WHERE id = p_tx_id;

    RETURN jsonb_build_object('success', TRUE, 'newBalance', v_new_bal, 'message', 'Withdrawal rejected and refunded.');
END;
$$;

-- 15. Admin Master User Summary (Real Paid Top-Up Breakdown)
CREATE OR REPLACE FUNCTION public.admin_get_master_users_summary()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_users JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone, 'role', u.role,
            'walletBalance', u."walletBalance", 'kycStatus', u."kycStatus",
            'isDeactivated', u."isDeactivated", 'isMarketingAccount', u."isMarketingAccount",
            'marketingAllocatedBalance', u."marketingAllocatedBalance",
            'referralCode', u."referralCode", 'referredByCode', u."referredByCode",
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
        SELECT "userId", SUM(amount) as paid_total FROM public.transactions WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE GROUP BY "userId"
    ) dep ON dep."userId" = u.id
    LEFT JOIN (
        SELECT "userId", COUNT(*) as active_plans FROM public.investments WHERE status = 'active' GROUP BY "userId"
    ) inv ON inv."userId" = u.id;

    RETURN v_users;
END;
$$;

-- 16. Admin Emergency Balance Override
CREATE OR REPLACE FUNCTION public.admin_override_any_balance(p_user_id TEXT, p_new_balance DOUBLE PRECISION, p_reason TEXT DEFAULT 'Admin Override', p_admin_id TEXT DEFAULT 'usr_admin')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.users SET "walletBalance" = p_new_balance WHERE id = p_user_id;
    RETURN jsonb_build_object('success', TRUE, 'newBalance', p_new_balance, 'message', 'Balance updated.');
END;
$$;

-- 17. Admin Trigger Friday Weekly Batch Payouts
CREATE OR REPLACE FUNCTION public.admin_trigger_weekly_payouts(p_admin_id TEXT DEFAULT 'usr_admin')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_inv RECORD;
    v_sponsor RECORD;
    v_sponsor_bonus DOUBLE PRECISION;
    v_count INTEGER := 0;
    v_total_paid DOUBLE PRECISION := 0;
    v_next_week INTEGER;
    v_is_completed BOOLEAN;
BEGIN
    FOR v_inv IN 
        SELECT i.*, u.name as investor_name, u."referredByCode"
        FROM public.investments i
        JOIN public.users u ON u.id = i."userId"
        WHERE i.status = 'active' AND i."weeksPaid" < i."totalWeeks"
    LOOP
        v_next_week := v_inv."weeksPaid" + 1;
        v_is_completed := (v_next_week >= v_inv."totalWeeks");

        UPDATE public.users SET "walletBalance" = "walletBalance" + v_inv."weeklyPayout" WHERE id = v_inv."userId";

        INSERT INTO public.transactions (
            id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
        )
        VALUES (
            'tx_pay_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
            v_inv."userId", v_inv."userName", 'payout', v_inv."weeklyPayout", 'completed', NOW()::TEXT,
            'Weekly Friday Yield: ' || v_inv."planName" || ' (Week ' || v_next_week || '/' || v_inv."totalWeeks" || ')',
            v_inv."isMarketing"
        );

        IF v_inv."referredByCode" IS NOT NULL AND v_inv."isMarketing" = FALSE THEN
            SELECT * INTO v_sponsor FROM public.users WHERE "referralCode" = v_inv."referredByCode" LIMIT 1;
            IF FOUND THEN
                v_sponsor_bonus := v_inv."weeklyPayout" * 0.075;
                UPDATE public.users SET "walletBalance" = "walletBalance" + v_sponsor_bonus WHERE id = v_sponsor.id;
            END IF;
        END IF;

        UPDATE public.investments
        SET 
            "weeksPaid" = v_next_week,
            status = CASE WHEN v_is_completed THEN 'completed' ELSE 'active' END,
            "lastPayoutDate" = NOW()::TEXT,
            "nextPayoutDate" = (NOW() + INTERVAL '7 days')::TEXT
        WHERE id = v_inv.id;

        v_count := v_count + 1;
        v_total_paid := v_total_paid + v_inv."weeklyPayout";
    END LOOP;

    RETURN jsonb_build_object('success', TRUE, 'payoutsProcessed', v_count, 'totalYieldDisbursed', v_total_paid, 'message', 'Friday payouts processed.');
END;
$$;

-- -------------------------------------------------------------------------
-- 18. PERMISSIONS & REALTIME GRANTS
-- -------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.users; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.investments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.settings; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.user_daily_progress; EXCEPTION WHEN OTHERS THEN NULL; END $$;
