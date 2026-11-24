'use client';

import React from 'react';

interface SmooshPatternProps {
  className?: string;
}

export const SmooshCupGraphic: React.FC<{ color?: string; label?: string }> = ({
  color = '#FFCA28',
  label = '123',
}) => {
  return (
    <div className="relative inline-block select-none">
      {/* Copo Estilizado Pop Art / Cajuá */}
      <svg
        width="110"
        height="130"
        viewBox="0 0 110 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[4px_4px_0px_#212121]"
      >
        {/* Tampa/Borda Superior */}
        <ellipse cx="55" cy="18" rx="42" ry="10" fill={color} stroke="#212121" strokeWidth="3.5" />
        {/* Corpo do Copo Cônico */}
        <path
          d="M17 21 L32 115 C32 121 78 121 78 115 L93 21"
          fill="#FFFFFF"
          stroke="#212121"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Estampas Orgânicas (inspiração nos copos Smoosh) */}
        <path
          d="M25 45 C40 35, 45 60, 32 80 C24 92, 28 98, 33 100"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <circle cx="70" cy="50" r="12" fill="#E53935" opacity="0.8" />
        <path
          d="M60 85 C68 75, 82 82, 85 95"
          stroke="#1E88E5"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Borda Inferior */}
        <ellipse cx="55" cy="115" rx="23" ry="5" fill={color} stroke="#212121" strokeWidth="2.5" />
      </svg>
      {/* Tag do Copo */}
      <div className="absolute top-[52px] left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full border border-cajua-charcoal font-fredoka font-bold text-[11px] text-cajua-charcoal shadow-sm">
        {label}
      </div>
    </div>
  );
};

export const FruitBadge: React.FC<{ text: string; bg?: string }> = ({ text, bg = 'bg-cajua-yellow' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-cajua-charcoal shadow-pop text-xs font-fredoka font-bold text-cajua-charcoal ${bg}`}
    >
      <span>{text}</span>
    </div>
  );
};
