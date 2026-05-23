"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import RankingsEngine from "./components/RankingsEngine";
import ComparisonDock from "./components/ComparisonDock";
import UniversityProfile from "./components/UniversityProfile";
import { Article } from "./data";

export default function AppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniIds, setSelectedUniIds] = useState<string[]>([]);

  // Derived state from URL
  const view = searchParams.get("view") || "home";
  const id = searchParams.get("id");

  // Sync initial search query if present in URL
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleViewChange = (newView: string) => {
    router.push(`?view=${newView}`);
  };

  const handleToggleCompare = (uniId: string) => {
    setSelectedUniIds((prev) => {
      if (prev.includes(uniId)) return prev.filter((id) => id !== uniId);
      if (prev.length >= 4) {
        alert("You can compare a maximum of 4 universities at a time.");
        return prev;
      }
      return [...prev, uniId];
    });
  };

  const handleRemoveCompare = (uniId: string) => {
    setSelectedUniIds((prev) => prev.filter((id) => id !== uniId));
  };

  const handleClearCompare = () => {
    setSelectedUniIds([]);
  };

  const handleUniversitySelect = (uniId: string) => {
    // Keep existing search params but change view to profile
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("view", "profile");
    current.set("id", uniId);
    router.push(`?${current.toString()}`);
  };

  const handleBackToRankings = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("view", "rankings");
    current.delete("id");
    router.push(`?${current.toString()}`);
  };

  const handleArticleSelect = (article: Article) => {
    // For now, alert or console log. In a full app, this would open an article view modal.
    alert(`Opening article: ${article.title}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header currentView={view} onViewChange={handleViewChange} />

      <main className="flex-1 flex flex-col">
        {view === "home" && (
          <Homepage
            onSearchSubmit={(q) => setSearchQuery(q)}
            onUniversitySelect={handleUniversitySelect}
            onArticleSelect={handleArticleSelect}
            onViewChange={handleViewChange}
          />
        )}

        {view === "rankings" && (
          <RankingsEngine
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedUniIds={selectedUniIds}
            onToggleCompare={handleToggleCompare}
            onUniversitySelect={handleUniversitySelect}
          />
        )}

        {view === "profile" && id && (
          <UniversityProfile
            universityId={id}
            onBack={handleBackToRankings}
            onViewChange={handleViewChange}
          />
        )}
      </main>

      <ComparisonDock
        selectedIds={selectedUniIds}
        onRemove={handleRemoveCompare}
        onClearAll={handleClearCompare}
        onUniversitySelect={handleUniversitySelect}
      />

      <footer className="border-t border-slate-200 bg-slate-50 py-8 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
          © 2026 Asia University Rankings | Official Analytical Data Engine
        </div>
      </footer>
    </div>
  );
}
