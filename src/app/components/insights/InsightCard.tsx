"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { INSIGHT_FALLBACK_IMAGE, type InsightArticle } from "../../data/insights";
import "../home/ref-home.css";

interface InsightCardProps {
  insight: InsightArticle;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const [imageSource, setImageSource] = useState(insight.coverImage || INSIGHT_FALLBACK_IMAGE);

  return (
    <article className="ref-card group flex h-full min-w-0 flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <Link
        href={`/insights/${insight.slug}`}
        aria-label={`Read ${insight.title}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-52">
          <Image
            src={imageSource}
            alt={insight.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageSource(INSIGHT_FALLBACK_IMAGE)}
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <span className="ref-label text-[9px]">{insight.category}</span>
          <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-800 transition-colors duration-300 group-hover:text-[#1A365D]">
            {insight.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--ref-muted)]">{insight.description}</p>
          <div className="mt-auto pt-4">
            <p className="text-[11px] font-semibold text-slate-700">By {insight.author}</p>
            <p className="mt-1 text-[10px] text-[var(--ref-muted)]">
              {insight.publishDate} <span aria-hidden="true">•</span> {insight.readTime}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1A365D]">
              Read More <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
