"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { INSIGHT_FALLBACK_IMAGE, type InsightArticle } from "../../data/insights";
import { getStoredBlog } from "../../lib/blog-storage";

interface InsightDetailsProps {
  slug: string;
  initialInsight?: InsightArticle;
}

function storedInsight(slug: string): InsightArticle | undefined {
  const blog = getStoredBlog(slug);
  if (!blog || blog.status !== "Published") return undefined;
  const parsedDate = new Date(`${blog.publishDate}T00:00:00`);

  return {
    id: blog.id,
    slug: blog.id,
    title: blog.title,
    category: blog.category,
    description: blog.description,
    content: blog.content,
    coverImage: blog.coverImage,
    author: blog.author || "AUR Editorial",
    publishDate: Number.isNaN(parsedDate.getTime())
      ? blog.publishDate
      : new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(parsedDate),
    readTime: blog.readTime || "5 min read",
  };
}

export default function InsightDetails({ slug, initialInsight }: InsightDetailsProps) {
  const [insight, setInsight] = useState(initialInsight);
  const [imageSource, setImageSource] = useState(initialInsight?.coverImage || INSIGHT_FALLBACK_IMAGE);
  const [hydrated, setHydrated] = useState(Boolean(initialInsight));

  useEffect(() => {
    if (initialInsight) return;

    const timer = window.setTimeout(() => {
      const saved = storedInsight(slug);
      setInsight(saved);
      setImageSource(saved?.coverImage || INSIGHT_FALLBACK_IMAGE);
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialInsight, slug]);

  if (!hydrated) {
    return <div className="py-24 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Loading insight…</div>;
  }

  if (!insight) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Insight not found</h1>
        <p className="mt-3 text-sm text-slate-500">This article may be unavailable or still saved as a draft.</p>
        <Link href="/insights" className="mt-6 inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#1A365D]">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Back to Insights
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-3xl py-4 sm:py-8">
      <Link href="/insights" className="group mb-7 inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-[#1A365D]">
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        Back to Insights
      </Link>

      <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">{insight.category}</span>
      <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">{insight.title}</h1>
      <p className="mt-4 border-l-2 border-amber-500 pl-4 font-serif text-lg italic leading-relaxed text-slate-500">{insight.description}</p>

      <div className="my-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-200 py-4 text-xs text-slate-500">
        <span className="inline-flex items-center"><User className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{insight.author}</span>
        <span className="inline-flex items-center"><Calendar className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{insight.publishDate}</span>
        <span className="inline-flex items-center"><Clock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{insight.readTime}</span>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <Image src={imageSource} alt={insight.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" onError={() => setImageSource(INSIGHT_FALLBACK_IMAGE)} />
      </div>

      <div
        className="prose prose-slate mt-8 max-w-none text-[15px] leading-7 prose-headings:font-serif prose-headings:text-slate-900 prose-h2:mb-3 prose-h2:mt-9 prose-h2:text-2xl prose-p:mb-5"
        dangerouslySetInnerHTML={{ __html: insight.content }}
      />
    </article>
  );
}
