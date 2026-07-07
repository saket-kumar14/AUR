"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Zap, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsData } from "../hooks/useNewsData";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } }
};

export default function NewsPage() {
  const { news, loading } = useNewsData();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--aur-text)] font-sans pb-24 relative overflow-hidden">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/70 backdrop-blur-xl border-b border-[var(--aur-border)] shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-sm font-semibold text-[var(--aur-text-muted)] hover:text-[var(--aur-text)] transition-colors"
          >
            <div className="p-1.5 rounded-full bg-[var(--aur-surface-2)] group-hover:bg-[var(--aur-text)] group-hover:text-[var(--background)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Dashboard
          </Link>
          <div className="font-extrabold tracking-widest uppercase text-[10px] text-[var(--aur-text-muted)]">
            AUR Intelligence
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 border-b border-[var(--aur-border)] pb-10 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--aur-surface-2)] text-[var(--aur-text-secondary)] rounded-full text-[11px] font-bold uppercase tracking-widest mb-6">
            <Zap className="h-3 w-3" /> Latest Updates
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            Global <span className="text-[var(--aur-text)]">Intelligence</span> <br className="hidden md:block"/> Desk
          </h1>
          <p className="text-[var(--aur-text-secondary)] text-lg md:text-xl max-w-2xl leading-relaxed">
            Uncover the latest trends, scholarship announcements, and pivotal policy shifts reshaping higher education across Asia.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-12 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pb-10">
                <div className="h-6 w-32 bg-[var(--aur-surface-2)] rounded-full mb-4"></div>
                <div className="h-10 w-3/4 bg-[var(--aur-surface-2)] rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-[var(--aur-surface)] rounded"></div>
                  <div className="h-4 w-full bg-[var(--aur-surface)] rounded"></div>
                  <div className="h-4 w-2/3 bg-[var(--aur-surface)] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {news.map((item, idx) => (
              <motion.article 
                key={item.id} 
                variants={itemVariants}
                className={`group relative overflow-hidden bg-[var(--aur-surface)] rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-lg border ${
                  item.featured 
                    ? "border-[var(--aur-border-strong)] shadow-sm" 
                    : "border-[var(--aur-border)] hover:border-[var(--aur-border-strong)]"
                }`}
              >
                {/* Decorative Accent for featured */}
                {item.featured && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--aur-text)]"></div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {item.category && (
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm ${
                          item.featured 
                            ? "bg-[var(--aur-text)] text-[var(--background)]" 
                            : "bg-[var(--aur-surface-2)] text-[var(--aur-text-secondary)]"
                        }`}>
                          {item.category}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-[var(--aur-text-muted)] font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <time>{item.date}</time>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-snug cursor-pointer transition-colors text-[#75160f] dark:text-[#ff4433] group-hover:text-[var(--aur-text)]">
                      {item.title}
                    </h2>
                    
                    <p className={`text-lg leading-relaxed mb-8 ${
                      item.featured ? "text-[var(--aur-text)] font-medium" : "text-[var(--aur-text-secondary)]"
                    }`}>
                      {item.summary}
                    </p>
                    
                    <AnimatePresence>
                      {expandedId === item.id && item.content && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-6"
                        >
                          <div className="pt-4 border-t border-[var(--aur-border)] mt-2">
                            <p className="text-lg leading-relaxed text-[var(--aur-text)] font-medium">
                              {item.content}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider pb-1 border-b-2 transition-all text-[var(--aur-text)] border-[var(--aur-text)] hover:gap-3"
                    >
                      {expandedId === item.id ? (
                        <>Close Analysis <X className="h-4 w-4" /></>
                      ) : (
                        <>Read Analysis <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="hidden md:flex w-48 h-48 rounded-2xl shrink-0 items-center justify-center overflow-hidden relative shadow-sm border border-[var(--aur-border)] bg-[var(--aur-surface-2)]">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-105 ${
                        item.featured ? "bg-gradient-to-br from-[var(--aur-border)] to-[var(--aur-border-strong)]" : "bg-[var(--aur-surface-2)]"
                      }`}>
                        {item.featured ? (
                          <Zap className="h-16 w-16 text-[var(--aur-text-muted)]" />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-4 border-[var(--aur-surface)] shadow-sm bg-[var(--aur-border)]"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
