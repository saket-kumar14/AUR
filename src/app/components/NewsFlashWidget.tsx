"use client";

import React from "react";
import Link from "next/link";
import { useNewsData } from "../hooks/useNewsData";
import { ArrowRight, Zap, Clock } from "lucide-react";

export default function NewsFlashWidget() {
  const { news, loading } = useNewsData();

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1A365D] border border-[#1A365D] rounded-2xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-20"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white text-[#1A365D] p-1 rounded-md">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
              Latest Updates
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">News Flash</h2>
        </div>
        <Link 
          href="/news"
          className="bg-white text-[#1A365D] rounded-lg px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          View All News
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {news.slice(0, 9).map((item) => (
          <article 
            key={item.id} 
            className="group flex flex-col justify-between bg-white border border-transparent rounded-xl p-6 hover:border-[#1A365D]/20 hover:shadow-lg transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-gray-500 tracking-wider mb-3">
                <Clock className="h-3 w-3" />
                {item.date}
              </div>
              <h4 className="font-bold text-slate-800 text-lg leading-snug mb-3 group-hover:text-[#1A365D] transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-3 mb-6">
                {item.summary}
              </p>
            </div>
            <Link 
              href="/news"
              className="text-sm font-bold text-slate-800 border-b-2 border-transparent hover:border-[#1A365D] w-max pb-0.5 transition-colors inline-flex items-center gap-1 group-hover:text-[#1A365D] group-hover:hover:border-[#1A365D]"
            >
              Read full story
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
