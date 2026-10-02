import { DailyTask } from '../types';

export const DEFAULT_DAILY_TASKS: DailyTask[] = [
  {
    id: 'task_daily_attendance',
    title: 'Daily Investor Attendance & Check-In',
    subtitle: 'Build your consecutive 7-day consistency streak to unlock the ₦1,500 milestone cash reward.',
    category: 'attendance',
    rewardShare: 0,
    fixedReward: 100, // ₦100 daily attendance credit
    verificationType: 'instant',
    actionLabel: 'Check In & Earn ₦100',
    sponsorName: 'PM Invest Consistency Protocol',
    sponsorBadge: 'DAILY STREAK',
    detailsContent: {
      headline: 'Daily Investor Attendance & Security Check-In',
      paragraphs: [
        'Checking in daily confirms your active participant status and advances your consecutive attendance streak.',
        'If you miss a calendar day (WAT / West Africa Time), your streak genuinely resets back to Day 1.',
        'Completing 7 consecutive days unlocks the ₦1,500 Unbroken Streak Milestone Bonus credited directly to your wallet balance!'
      ],
      keyTakeaway: 'Consistent engagement reinforces verified investor standing and unlocks cash milestone bonuses.'
    }
  },
  {
    id: 'task_active_portfolio',
    title: 'Active Investor Reward',
    subtitle: 'One-time reward. Investors with active property capital claim an instant ₦300 bonus.',
    category: 'portfolio',
    rewardShare: 0,
    fixedReward: 300, // ₦300 one-time reward
    verificationType: 'instant',
    actionLabel: 'Claim Active Investor Reward',
    sponsorName: 'Treasure Crest Asset Reserves',
    sponsorBadge: 'ACTIVE CAPITAL',
    detailsContent: {
      headline: 'Live Portfolio Verification & One-Time Dividend Allocation',
      paragraphs: [
        'This quest connects directly to the portfolio database to verify active capital deployment.',
        'Only investors holding at least one active real estate investment plan can claim this one-time capital reward.',
        'Uninvested accounts must activate a starter plan before unlocking this reward.'
      ],
      keyTakeaway: 'Capital-backed rewards celebrate committed investors on PM Invest.'
    }
  },
  {
    id: 'task_auto_reinvest',
    title: 'Auto-Renew Bonus',
    subtitle: 'One-time reward for compounding wealth. Enable Auto-Reinvestment on any of your active plans to claim.',
    category: 'reinvest',
    rewardShare: 0,
    fixedReward: 250, // ₦250 one-time bonus
    verificationType: 'instant',
    actionLabel: 'Claim Auto-Renew Bonus',
    sponsorName: 'Treasure Homes Growth Engine',
    sponsorBadge: 'AUTO COMPOUND',
    detailsContent: {
      headline: 'Automated Compounding & Yield Acceleration',
      paragraphs: [
        'Enabling Auto-Compounding ensures your principal automatically rolls over into a new 4-week growth cycle at maturity.',
        'This quest dynamically checks that you have toggled Auto-Compounding ON for at least one active plan.',
        'Compounding investors earn an instant ₦250 one-time cash bonus upon enabling Auto-Renew.'
      ],
      keyTakeaway: 'Long-term compounders generate exponential wealth growth and receive instant bonus allocations.'
    }
  },
  {
    id: 'task_kyc_bounty',
    title: 'KYC Identity Verification Bounty',
    subtitle: 'One-time compliance bonus. Awarded upon verified government ID approval by the compliance team.',
    category: 'kyc',
    rewardShare: 0,
    fixedReward: 1000, // ₦1,000 one-time cash reward
    verificationType: 'instant',
    actionLabel: 'Claim KYC Bounty',
    sponsorName: 'Treasure Homes Compliance Reserve',
    sponsorBadge: 'COMPLIANCE',
    detailsContent: {
      headline: 'Tier-1 KYC Identity Verification & Anti-Fraud Compliance',
      paragraphs: [
        'Submit your National Identification Number (NIN), Voter ID, or International Passport.',
        'Upon approval by the compliance team, you will receive an instant ₦1,000 cash bounty credited to your available balance.',
        'Verified investors enjoy priority withdrawal clearances with zero manual holding delays.'
      ],
      keyTakeaway: 'Verified investor identities safeguard the platform against fraud and unlock instant cash rewards.'
    }
  },
  {
    id: 'task_social_advocacy',
    title: 'Social Advocacy & Proof-of-Work Bounty',
    subtitle: 'Share your personal invite link on WhatsApp Status, Telegram, or X and submit proof for admin audit.',
    category: 'social_share',
    rewardShare: 0,
    fixedReward: 200, // ₦200 bounty upon admin approval
    verificationType: 'submission',
    actionLabel: 'Share & Submit Proof',
    sponsorName: 'Treasure Homes Community Growth',
    sponsorBadge: 'PROOF OF WORK',
    detailsContent: {
      headline: 'Expand the Investor Network & Earn ₦200 per Verified Post',
      shareTemplate: 'I am earning steady weekly yields backed by verified Nigerian real estate with PM Invest & Treasure Homes! Join using my referral code: ',
      paragraphs: [
        'Share your personalized invite link or referral code across your WhatsApp status, Telegram investment groups, or Twitter/X.',
        'Capture a screenshot of your post or copy the direct link, then submit below.',
        'Our compliance desk reviews and approves verified submissions within hours, crediting ₦200 to your wallet.'
      ],
      keyTakeaway: 'Authentic advocacy creates network value and directly earns cash bounty rewards.'
    }
  }
];
