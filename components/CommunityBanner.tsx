import React from 'react';
import { ExternalLink, MessageCircle, Send } from 'lucide-react';

export const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/JFQaPQ9gur84iQZtDqvixk';
export const TELEGRAM_COMMUNITY_URL = 'https://t.me/+Hz6k32s6VmE4NTZk';

export const CommunityBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-400/30 rounded-2xl p-3 sm:p-3.5 shadow-md mb-4">
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-tight text-center sm:text-left">
          Join WhatsApp & Telegram For Live Updates
        </h3>

        {/* Side-by-side compact action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            id="btn_join_whatsapp_community"
          >
            <MessageCircle className="w-3.5 h-3.5 text-slate-950" />
            <span>Join WhatsApp</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <a
            href={TELEGRAM_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#229ED9] hover:bg-[#1d8cbf] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
            id="btn_join_telegram_community"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span>Join Telegram</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
