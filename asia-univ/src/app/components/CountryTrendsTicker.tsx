"use client";

import React from "react";

export interface CountryTrend {
  id: string;
  country: string;
  delta: number;
  flagCode?: string;
}

const mockData: CountryTrend[] = [
  { id: "1", country: "Uzbekistan", delta: 2 },
  { id: "2", country: "Japan", delta: 3 },
  { id: "3", country: "India", delta: -2 },
  { id: "4", country: "South Korea", delta: 0 },
  { id: "5", country: "Malaysia", delta: 2 },
  { id: "6", country: "Singapore", delta: 1 },
];

export default function CountryTrendsTicker() {
  return (
    <div className="w-full overflow-hidden bg-[#020617] border-y border-slate-800 py-3 flex items-center">
      <div className="flex w-max animate-marquee will-change-transform hover:[animation-play-state:paused]">
        {/* Render twice for seamless looping */}
        {[...mockData, ...mockData].map((item, index) => {
          const isPositive = item.delta > 0;
          const isNegative = item.delta < 0;
          const isNeutral = item.delta === 0;

          return (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center space-x-3 px-8 border-r border-slate-800/50 last:border-none"
            >
              <span className="font-sans font-semibold text-slate-200 whitespace-nowrap">
                {item.country}
              </span>
              <span
                className={`font-mono text-sm whitespace-nowrap flex items-center gap-1 ${
                  isPositive
                    ? "text-emerald-500"
                    : isNegative
                    ? "text-rose-500"
                    : "text-slate-400"
                }`}
              >
                {isPositive && "▲"}
                {isNegative && "▼"}
                {isNeutral && "•"}
                {!isNeutral && Math.abs(item.delta)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
