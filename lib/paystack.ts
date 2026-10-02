// Paystack Payment Gateway configuration and utilities
// Supports test mode with standard Paystack test cards, automated bank transfer, and NIP payouts

export const PAYSTACK_PUBLIC_KEY: string = 
  (import.meta as unknown as { env?: { VITE_PAYSTACK_PUBLIC_KEY?: string } }).env?.VITE_PAYSTACK_PUBLIC_KEY || '';
export const IS_PAYSTACK_CONFIGURED = Boolean(
  PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY.trim().startsWith('pk_')
);

export interface NigerianBank {
  name: string;
  code: string;
  slug: string;
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  { name: 'OPay Digital Services', code: '999992', slug: 'opay' },
  { name: 'Moniepoint Microfinance Bank', code: '50515', slug: 'moniepoint' },
  { name: 'Kuda Microfinance Bank', code: '50211', slug: 'kuda-bank' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'guaranty-trust-bank' },
  { name: 'Access Bank', code: '044', slug: 'access-bank' },
  { name: 'Zenith Bank', code: '057', slug: 'zenith-bank' },
  { name: 'United Bank for Africa (UBA)', code: '033', slug: 'united-bank-for-africa' },
  { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank-of-nigeria' },
  { name: 'PalmPay', code: '999991', slug: 'palmpay' },
  { name: 'Sterling Bank', code: '232', slug: 'sterling-bank' },
  { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank' },
  { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank-of-nigeria' },
  { name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic-ibtc-bank' },
  { name: 'First City Monument Bank (FCMB)', code: '214', slug: 'first-city-monument-bank' },
  { name: 'Wema Bank (ALAT)', code: '035', slug: 'wema-bank' },
  { name: 'Paga', code: '327', slug: 'paga' }
];

export const PAYSTACK_TEST_DETAILS = {
  testMode: true,
  defaultTestKey: 'pk_test_paystack_sandbox_demo',
  successCard: {
    number: '4084 0840 0840 0840',
    expiry: '12/30',
    cvv: '408',
    pin: '1234',
    otp: '123456'
  },
  mockVirtualAccount: {
    bank: 'Wema Bank (Paystack Reserved)',
    accountNumber: '7829103482',
    accountName: 'PM INVEST / TREASURE RESERVE'
  }
};

export function generatePaystackRef(type: 'dep' | 'trf' = 'dep'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 900000 + 100000);
  return type === 'dep' ? `PSTK_DEP_${timestamp}_${random}` : `TRF_${timestamp}_${random}`;
}

/**
 * Simulates resolving a Nigerian bank account number
 */
export function resolveNigerianAccount(
  accountNumber: string,
  bankCode: string,
  userName?: string
): { success: boolean; accountName?: string; error?: string } {
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { success: false, error: 'Account number must be exactly 10 digits.' };
  }
  const bank = NIGERIAN_BANKS.find(b => b.code === bankCode);
  if (!bank) {
    return { success: false, error: 'Selected bank is not recognized.' };
  }

  // Generate resolved official name based on user name or standard verification format
  const resolvedName = (userName ? userName.trim().toUpperCase() : 'VERIFIED ACCOUNT HOLDER');
  return {
    success: true,
    accountName: `${resolvedName} (${bank.name})`
  };
}
