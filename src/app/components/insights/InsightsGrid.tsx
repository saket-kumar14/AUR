"use client";

import { useEffect, useState } from "react";
import { INSIGHTS, type InsightArticle } from "../../data/insights";
import { getPublishedStoredBlogs } from "../../lib/blog-storage";
import InsightCard from "./InsightCard";

function savedBlogToInsight(blog: ReturnType<typeof getPublishedStoredBlogs>[number]): InsightArticle {
  const parsedDate = new Date(`${blog.publishDate}T00:00:00`);
  const publishDate = Number.isNaN(parsedDate.getTime())
    ? blog.publishDate
    : new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(parsedDate);

  return {
    id: blog.id,
    slug: blog.id,
    title: blog.title,
    category: blog.category,
    description: blog.description,
    content: blog.content,
    coverImage: blog.coverImage,
    author: blog.author || "AUR Editorial",
    publishDate,
    readTime: blog.readTime || "5 min read",
  };
}

export default function InsightsGrid() {
  const [savedInsights, setSavedInsights] = useState<InsightArticle[]>([]);

  useEffect(() => {
    const loadSavedInsights = () => setSavedInsights(getPublishedStoredBlogs().map(savedBlogToInsight));
    loadSavedInsights();
    window.addEventListener("storage", loadSavedInsights);
    return () => window.removeEventListener("storage", loadSavedInsights);
  }, []);

  const insights = [...savedInsights, ...INSIGHTS.filter((item) => !savedInsights.some((saved) => saved.slug === item.slug))];

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
    </div>
  );
}
