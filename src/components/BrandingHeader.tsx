import React from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Wallet,
  MessageCircle,
  Send,
  ExternalLink 
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { PmLogo } from './PmLogo';
import { WHATSAPP_COMMUNITY_URL, TELEGRAM_COMMUNITY_URL } from './CommunityBanner';
import { WhatsAppGoldIcon, TelegramGoldIcon } from './CommunityIcons';
import { LiveReserveCounter } from './LiveReserveCounter';

export const BrandingHeader: React.FC = () => {
  const { currentUser, logout } = useAppState();

  return (
    <header className="w-full bg-[#0f172a] border-b border-slate-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3">
          <PmLogo className="w-11 h-11" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight uppercase font-sans text-white">PM <span className="text-amber-400">Invest</span></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold leading-none">By Treasure Homes</span>
            </div>
            <p className="text-xs text-slate-300 font-normal mt-0.5">Earn steady cash returns backed by verified properties worldwide</p>
          </div>
        </div>

        {/* Current logged in user view / actions */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {currentUser && (
            <div className="flex items-center gap-4 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <div className="text-right">
                <p className="text-sm font-bold text-white flex items-center justify-end gap-1">
                  {currentUser.name}
                  {currentUser.role === 'admin' && (
                    <span className="text-[9px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Admin</span>
                  )}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              
              {/* Wallet display */}
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Wallet className="w-3 h-3 text-amber-400" /> Wallet</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <button 
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                title="Logout"
                id="btn_logout_header"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const LegalDisclosures: React.FC = () => {
  const { settings } = useAppState();
  return (
    <footer className="w-full bg-[#0f172a] border-t border-t-slate-800 text-slate-400 py-10 px-4 text-xs font-sans mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">TREASURE HOMES GROUP</h4>
          <p className="leading-relaxed mb-4 text-slate-300">
            PM Invest is backed by real estate developed and managed by Treasure Homes Ltd. We put money into real building projects and verified rental properties worldwide to pay steady weekly returns to our investors.
          </p>
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-[10px] tracking-wider font-semibold">100% ASSET-BACKED CASH RESERVE</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">OFFICIAL INVESTOR COMMUNITY</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            Join our verified groups for daily payout alerts, announcements, land allocations, and 24/7 friendly support.
          </p>
          <div className="space-y-2 mt-3">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <WhatsAppGoldIcon className="w-5 h-5" />
                <span className="font-semibold text-xs text-white">Join WhatsApp Group</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
            </a>
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <TelegramGoldIcon className="w-5 h-5" />
                <span className="font-semibold text-xs text-white">Join Telegram Channel</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">CASH RESERVE & SAFETY</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            To guarantee your weekly payouts, PM Invest keeps a dedicated <strong>cash reserve</strong> of over <LiveReserveCounter precision={0} showLivePulse={true} className="text-amber-400 font-bold" /> in bank reserve. This ensures every investor gets paid on time, every Friday.
          </p>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-300">
            <span className="font-semibold text-amber-400 block mb-1">Active Cash Reserve:</span>
            <span>Backed by physical properties and bank reserve accounts with current reserve balance of </span>
            <span className="text-white font-mono font-bold block mt-1">
              <LiveReserveCounter precision={0} showLivePulse={true} showRateBadge={false} size="md" />
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">NOTE ON PLANS</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            Your profit comes from physical property developments, trading and rental income. Once you pick a plan, your money works for the full 4 weeks, paying you cash every Friday.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            © {new Date().getFullYear()} PM Invest Platforms under License of Treasure Homes Ltd. All rights reserved. Corporate office: Treasure Homes Building, Lagos, Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
};

