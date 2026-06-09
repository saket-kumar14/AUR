"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Shuffle, Trash } from "lucide-react";
import { MOCK_UNIVERSITIES } from "../data";

interface ComparisonDockProps {
  selectedIds: string[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onUniversitySelect: (id: string) => void;
}

export default function ComparisonDock({
  selectedIds,
  onRemove,
  onClearAll,
  onUniversitySelect,
}: ComparisonDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch full details of selected universities
  const selectedUnis = MOCK_UNIVERSITIES.filter((uni) => selectedIds.includes(uni.id));

  // Visual Horizontal Fill Meter Component
  const MetricMeter = ({ value, label }: { value: number; label: string }) => {
    return (
      <div className="space-y-1.5 font-sans">
        <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-300">
          <span>{label}</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{value.toFixed(0)}/100</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-amber-700"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 330, damping: 30 }}
            className="fixed bottom-6 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4 font-sans select-none"
          >
            <div className="border border-slate-900 dark:border-slate-700 bg-white dark:bg-cyber-dark p-4 shadow-xl flex items-center justify-between text-slate-900 dark:text-slate-100">
              <div className="flex items-center space-x-4 truncate">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <Shuffle className="h-4.5 w-4.5" />
                </div>

                <div className="truncate">
                  <span className="inline-block text-[9px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xs">
                    Comparison Suite
                  </span>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    Comparing {selectedUnis.length} of 4 Universities
                  </div>
                </div>

                <div className="hidden sm:flex items-center space-x-2 shrink-0">
                  <AnimatePresence initial={false}>
                    {selectedUnis.map((uni) => (
                      <motion.span
                        key={uni.id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="inline-flex items-center text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1"
                      >
                        <span className="truncate max-w-[80px]">{uni.name.split(" ")[0]}</span>
                        <button
                          onClick={() => onRemove(uni.id)}
                          className="ml-1.5 hover:text-red-600 text-slate-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 ml-4">
                <button
                  onClick={onClearAll}
                  className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Clear
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex items-center justify-center border border-slate-900 dark:border-slate-500 bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  Compare
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsExpanded(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            <motion.div
              className="fixed inset-y-10 inset-x-4 md:inset-x-12 lg:inset-x-24 bg-white dark:bg-slate-950 border border-slate-950 dark:border-slate-700 flex flex-col justify-between shadow-2xl z-50 text-slate-900 dark:text-slate-100"
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">
                      Analytical Comparison Model
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      Side-by-Side Matrix
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">
                <div className={`grid gap-6 grid-cols-1 md:grid-cols-${selectedUnis.length + 1}`}>
                  <div className="hidden md:flex flex-col justify-between border-r border-slate-200 pr-6 pt-16 space-y-8 select-none">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Overall Standing</h4>
                      <p className="text-xs text-slate-500">Summary academic percentile score</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Citations Score</h4>
                      <p className="text-xs text-slate-500">Research citations count index</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Research Value</h4>
                      <p className="text-xs text-slate-500">Peer research output audit</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Employability</h4>
                      <p className="text-xs text-slate-500">Corporate placement placement</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">International Student Ratio</h4>
                      <p className="text-xs text-slate-500">Global diversity intake scale</p>
                    </div>
                  </div>

                  {selectedUnis.map((uni) => (
                    <motion.div
                      key={uni.id}
                      layout
                      initial={{ opacity: 0, rotateX: -10, y: 12 }}
                      animate={{ opacity: 1, rotateX: 0, y: 0 }}
                      exit={{ opacity: 0, rotateX: 10, y: 12 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="border-b border-slate-100 pb-4 mb-6">
                          <div className="flex justify-between items-start">
                            <h4
                              onClick={() => {
                                onUniversitySelect(uni.id);
                                setIsExpanded(false);
                              }}
                              className="font-sans text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-amber-700 cursor-pointer transition-colors leading-tight truncate"
                            >
                              {uni.name}
                            </h4>
                            <button
                              onClick={() => onRemove(uni.id)}
                              className="text-slate-400 hover:text-red-600 ml-2"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-300 font-mono block mt-1 font-semibold uppercase">
                            {uni.location}
                          </span>
                        </div>

                        <div className="mb-6 flex items-baseline space-x-2">
                          <span className="text-2xl font-serif font-bold text-slate-900">#{uni.history[0]}</span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Asia Standing</span>
                        </div>

                        <div className="space-y-6">
                          <MetricMeter value={uni.overall} label="Overall Percentile" />
                          <MetricMeter value={uni.citations} label="Citations Index" />
                          <MetricMeter value={uni.research} label="Research Output" />
                          <MetricMeter value={uni.employability} label="Employability Rate" />
                          <MetricMeter value={uni.intlStudents} label="International Diversity" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Programs:</span>
                            <span className="text-slate-900 dark:text-slate-100 text-right truncate max-w-[150px]">
                              {uni.subjects.join(", ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Languages:</span>
                            <span className="text-slate-900 dark:text-slate-100 text-right truncate max-w-[150px]">
                              {uni.languages.join(", ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuition Est:</span>
                            <span className="font-mono text-slate-900 font-semibold">{uni.tuition}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={() => {
                            onUniversitySelect(uni.id);
                            setIsExpanded(false);
                          }}
                          className="w-full text-center border border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Deep-Dive Profile
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between">
                <button
                  onClick={onClearAll}
                  className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Clear All Matches
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 hover:bg-slate-800 transition-colors border border-slate-900"
                >
                  Return to Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
