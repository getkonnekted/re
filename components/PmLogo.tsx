import React from 'react';

interface PmLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
}

export const PmLogo: React.FC<PmLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false,
  textColor = "text-white",
  subtextColor = "text-slate-400"
}) => {
  return (
    <div className="inline-flex items-center gap-3">
      <svg 
        viewBox="0 0 512 512" 
        className={`shrink-0 ${className}`}
        style={size ? { width: size, height: size } : undefined}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer Ring Gold Gradient */}
          <linearGradient id="pmBadgeGoldGrad" x1="60" y1="50" x2="450" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Deep Navy/Black Circular Disc Gradient */}
          <radialGradient id="pmBadgeDarkBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#131F38" />
            <stop offset="60%" stopColor="#0B1327" />
            <stop offset="100%" stopColor="#050914" />
          </radialGradient>

          {/* Golden Letter Gradient */}
          <linearGradient id="pmBadgeLetterGold" x1="140" y1="145" x2="400" y2="365" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Dimensional Shadow & Overlap Tone */}
          <linearGradient id="pmBadgeOverlapShade" x1="220" y1="210" x2="290" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EAB308" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          <filter id="pmBadgeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Fine Edge Highlight */}
        <circle cx="256" cy="256" r="248" fill="none" stroke="#FEF3C7" strokeWidth="2.5" opacity="0.75" />

        {/* Broad Gold Perimeter Ring */}
        <circle cx="256" cy="256" r="232" fill="none" stroke="url(#pmBadgeGoldGrad)" strokeWidth="28" />

        {/* Inner Dark Rim Dividing Gold Ring and Core */}
        <circle cx="256" cy="256" r="216" fill="none" stroke="#040711" strokeWidth="5" />

        {/* Deep Slate/Navy Background Disc */}
        <circle cx="256" cy="256" r="213" fill="url(#pmBadgeDarkBg)" />

        {/* Monogram Symbol "PM" */}
        <g filter="url(#pmBadgeShadow)">
          {/* Main Stem of Letter P */}
          <rect x="140" y="145" width="48" height="220" rx="3" fill="url(#pmBadgeLetterGold)" />

          {/* Letter P Top Arch Loop */}
          <path
            d="M 188 145 
               L 272 145 
               C 318 145 348 168 348 206 
               C 348 244 318 267 272 267 
               L 188 267 Z"
            fill="url(#pmBadgeLetterGold)"
          />

          {/* Letter P Inner Counter (Cutout) */}
          <path
            d="M 188 185 
               L 265 185 
               C 288 185 304 194 304 206 
               C 304 218 288 227 265 227 
               L 188 227 Z"
            fill="url(#pmBadgeDarkBg)"
          />

          {/* 3D Overlap Fold between P and M */}
          <polygon
            points="218,228 274,228 296,268 252,268"
            fill="url(#pmBadgeOverlapShade)"
            opacity="0.95"
          />

          {/* Letter M: Left Diagonal flowing from P loop */}
          <path
            d="M 252 267 
               L 296 267 
               L 336 325 
               L 312 365 
               L 288 328 Z"
            fill="url(#pmBadgeLetterGold)"
          />

          {/* Letter M: Center V trough & Right Diagonal */}
          <path
            d="M 288 328 
               L 312 365 
               L 358 295 
               L 358 230 
               L 326 278 Z"
            fill="url(#pmBadgeLetterGold)"
          />

          {/* Letter M: Right Vertical Stem */}
          <rect x="350" y="220" width="48" height="145" rx="3" fill="url(#pmBadgeLetterGold)" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-xl sm:text-2xl font-black tracking-tight uppercase font-sans ${textColor}`}>
              PM <span className="text-amber-400">Invest</span>
            </span>
          </div>
          <span className={`text-[9px] uppercase tracking-widest font-mono font-bold mt-1 ${subtextColor}`}>
            By Treasure Homes
          </span>
        </div>
      )}
    </div>
  );
};
