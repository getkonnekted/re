import React from 'react';

export const WhatsAppGoldIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-label="WhatsApp Gold Icon"
  >
    <defs>
      {/* Outer gold rim gradient */}
      <linearGradient id="waGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF3B0" />
        <stop offset="25%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#AA771C" />
        <stop offset="75%" stopColor="#F3E5AB" />
        <stop offset="100%" stopColor="#8A5A00" />
      </linearGradient>

      {/* WhatsApp lush green body gradient */}
      <linearGradient id="waGreenBody" x1="20%" y1="10%" x2="80%" y2="90%">
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="60%" stopColor="#128C7E" />
        <stop offset="100%" stopColor="#075E54" />
      </linearGradient>

      {/* Top highlight for glossy finish */}
      <linearGradient id="waGloss" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8A5A00" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Outer Speech Bubble with Gold Bezel */}
    <path 
      d="M50 8C27.9 8 10 25.4 10 46.8C10 54.1 12.1 61 15.8 66.8L11 88L33.2 82.5C38.3 85.1 44 86.6 50 86.6C72.1 86.6 90 68.2 90 46.8C90 25.4 72.1 8 50 8Z" 
      fill="url(#waGoldRim)" 
      filter="url(#goldShadow)"
    />

    {/* Inner green speech bubble */}
    <path 
      d="M50 14C31.2 14 16 28.7 16 46.8C16 53 17.8 58.8 21 63.8L17.5 79.5L34.2 75.1C38.9 77.9 44.2 79.6 50 79.6C68.8 79.6 84 64.9 84 46.8C84 28.7 68.8 14 50 14Z" 
      fill="url(#waGreenBody)" 
    />

    {/* Glossy top reflection */}
    <ellipse cx="50" cy="30" rx="26" ry="12" fill="url(#waGloss)" />

    {/* Golden phone icon */}
    <path 
      d="M62.5 56.2C61.3 55.6 55.6 52.8 54.6 52.4C53.6 52 52.8 51.8 52.1 52.9C51.4 54 49.3 56.6 48.6 57.3C48 58.1 47.3 58.2 46.1 57.6C44.9 57 41 55.7 36.4 51.6C32.8 48.4 30.4 44.4 29.7 43.2C29 42 29.6 41.3 30.2 40.7C30.8 40.2 31.4 39.3 32.1 38.6C32.7 37.8 32.9 37.3 33.3 36.4C33.7 35.6 33.5 34.8 33.2 34.2C32.9 33.6 30.8 28.4 29.9 26.3C29.1 24.2 28.2 24.5 27.5 24.5C26.9 24.5 26.2 24.5 25.5 24.5C24.8 24.5 23.6 24.8 22.6 25.9C21.6 27 18.7 29.7 18.7 35.2C18.7 40.7 22.7 45.9 23.3 46.7C23.9 47.5 31.2 58.8 42.4 63.6C45.1 64.8 47.1 65.5 48.8 66C51.5 66.9 54 66.8 55.9 66.5C58.1 66.2 62.6 63.8 63.5 61.2C64.5 58.6 64.5 56.4 64.2 56C63.9 55.4 63.1 55.1 62.5 56.2Z" 
      fill="#FFFFFF" 
      stroke="#FFF3B0"
      strokeWidth="1.5"
    />
  </svg>
);

export const TelegramGoldIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-label="Telegram Gold Icon"
  >
    <defs>
      {/* Outer gold rim gradient */}
      <linearGradient id="tgGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF3B0" />
        <stop offset="25%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#AA771C" />
        <stop offset="75%" stopColor="#F3E5AB" />
        <stop offset="100%" stopColor="#8A5A00" />
      </linearGradient>

      {/* Telegram sky to cobalt blue gradient */}
      <linearGradient id="tgBlueBody" x1="20%" y1="10%" x2="80%" y2="90%">
        <stop offset="0%" stopColor="#2AABEE" />
        <stop offset="60%" stopColor="#229ED9" />
        <stop offset="100%" stopColor="#1B7CA8" />
      </linearGradient>

      {/* Glossy top reflection */}
      <linearGradient id="tgGloss" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      <filter id="tgGoldShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8A5A00" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Outer Speech Bubble with Gold Bezel */}
    <path 
      d="M50 8C27.9 8 10 25.4 10 46.8C10 54.1 12.1 61 15.8 66.8L11 88L33.2 82.5C38.3 85.1 44 86.6 50 86.6C72.1 86.6 90 68.2 90 46.8C90 25.4 72.1 8 50 8Z" 
      fill="url(#tgGoldRim)" 
      filter="url(#tgGoldShadow)"
    />

    {/* Inner blue speech bubble */}
    <path 
      d="M50 14C31.2 14 16 28.7 16 46.8C16 53 17.8 58.8 21 63.8L17.5 79.5L34.2 75.1C38.9 77.9 44.2 79.6 50 79.6C68.8 79.6 84 64.9 84 46.8C84 28.7 68.8 14 50 14Z" 
      fill="url(#tgBlueBody)" 
    />

    {/* Glossy top reflection */}
    <ellipse cx="50" cy="30" rx="26" ry="12" fill="url(#tgGloss)" />

    {/* Paper airplane with gold accent */}
    <path 
      d="M28 47.5L66 31.5C67.8 30.7 69.4 31.8 68.8 34.3L62.3 64.8C61.8 67 60.5 67.5 58.6 66.4L48.8 59.2L44 63.8C43.5 64.4 43.1 64.8 42.1 64.8L42.8 54.8L61.2 38.2C62 37.5 61 37.1 60 37.7L37.2 52.1L27.5 49C25.4 48.4 25.3 46.9 28 47.5Z" 
      fill="#FFFFFF" 
      stroke="#FFF3B0"
      strokeWidth="1.2"
    />
  </svg>
);
