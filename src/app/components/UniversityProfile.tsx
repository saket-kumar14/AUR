"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowLeft, MapPin, Globe, BookOpen, GraduationCap, Building2, ChevronRight, Award, LineChart } from "lucide-react";
import { MOCK_UNIVERSITIES } from "../data";

// Lazy load the heavy charting component
const TrendChart = dynamic(() => import("./TrendChart"), {
  loading: () => (
    <div className="w-full h-[300px] flex items-center justify-center border border-slate-200 bg-slate-50 text-slate-400 font-mono text-xs uppercase tracking-widest">
      Loading Analytics Engine...
    </div>
  ),
  ssr: false, // SVG charts often rely on client-side measurements or don't need SSR
});

interface UniversityProfileProps {
  universityId: string;
  onBack: () => void;
  onViewChange: (view: string) => void;
}

export default function UniversityProfile({ universityId, onBack, onViewChange }: UniversityProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "admissions">("overview");

  const uni = MOCK_UNIVERSITIES.find((u) => u.id === universityId);

  if (!uni) {
    return (
      <div className="mx-auto max-w-full px-4 py-16 text-center font-sans">
        <h2 className="text-2xl font-bold text-slate-900">University Record Not Found</h2>
        <button onClick={onBack} className="mt-4 text-amber-700 hover:underline">Return to Rankings</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-8 font-sans flex-grow">
      {/* Top Navigation */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Results
        </button>
      </div>

      {/* Hero Section */}
      <div className="border border-slate-200 bg-white shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Image Container (Strict Aspect Ratio for Zero CLS) */}
          <div className="md:col-span-1 relative aspect-video md:aspect-auto border-b md:border-b-0 md:border-r border-slate-200 bg-slate-100">
            <Image
              src={uni.campusPhoto}
              alt={`${uni.name} Campus`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200 px-2 py-0.5 bg-slate-50">
                  <MapPin className="h-3 w-3 mr-1" />
                  {uni.location}
                </span>
                {uni.hasMedicine && (
                  <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-amber-700 border border-amber-200 px-2 py-0.5 bg-amber-50">
                    <Award className="h-3 w-3 mr-1" />
                    Medical Faculty Certified
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-2">
                {uni.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 space-x-0 text-sm text-slate-600 font-mono mt-4">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  <span>{uni.languages.join(", ")}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  <span>{uni.subjects.length} Major Faculties</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 items-stretch">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-serif font-bold text-slate-900">#{uni.history[0]}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Overall Asia Rank</span>
              </div>
              <button 
                onClick={() => onViewChange("rankings")}
                className="bg-slate-900 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors text-center"
              >
                Compare Institution
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Tab Navigation */}
      <div className="border-b border-slate-200 mb-8 flex overflow-x-auto hide-scrollbar">
        {[
          { id: "overview", label: "Overview & Context", icon: Building2 },
          { id: "metrics", label: "Academic Metrics", icon: LineChart },
          { id: "admissions", label: "Admissions & Programs", icon: GraduationCap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`inline-flex items-center whitespace-nowrap border-b-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors -mb-[1px] ${
              activeTab === tab.id
                ? "border-amber-700 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? "text-amber-700" : "text-slate-400"}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">Institutional Profile</h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                {uni.description}
              </p>
              
              <h4 className="font-serif text-lg font-bold text-slate-900 mb-4">Regional Context</h4>
              <p className="text-slate-600 leading-relaxed">
                Located in {uni.location}, this institution benefits from robust regional infrastructure and academic networks. 
                International students frequently choose this destination for its unique blend of cultural heritage and advanced research facilities. 
                {uni.hasMedicine && " Its medical faculties are internationally recognized, providing English-medium instruction tailored for global clinical practice."}
              </p>
            </div>

            <div className="md:col-span-1 border border-slate-200 bg-slate-50 p-6 self-start">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">
                Fast Facts
              </h4>
              <ul className="space-y-4">
                <li>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Location</span>
                  <span className="text-sm font-bold text-slate-900">{uni.location}</span>
                </li>
                <li>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Primary Language</span>
                  <span className="text-sm font-bold text-slate-900">{uni.languages[0]}</span>
                </li>
                <li>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Est. Tuition</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{uni.tuition}</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Academic Metrics Tab (Includes Lazy Chart) */}
        {activeTab === "metrics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Overall Score", value: uni.overall },
                { label: "Citations", value: uni.citations },
                { label: "Research", value: uni.research },
                { label: "Employability", value: uni.employability },
                { label: "Intl Diversity", value: uni.intlStudents },
              ].map((metric, idx) => (
                <div key={idx} className="border border-slate-200 bg-white p-4">
                  <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                    {metric.label}
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {metric.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Lazy Loaded Chart */}
            <TrendChart history={uni.history} />
            
          </div>
        )}

        {/* Admissions & Programs Tab */}
        {activeTab === "admissions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">Core Faculties</h3>
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {uni.subjects.map((sub, idx) => (
                  <li key={idx} className="py-3 flex items-center text-sm text-slate-700">
                    <ChevronRight className="h-4 w-4 mr-2 text-amber-700" />
                    {sub}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">Featured Degree Programs</h3>
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {uni.programs.map((prog, idx) => (
                  <li key={idx} className="py-3 flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-slate-700 font-semibold group-hover:text-amber-700 transition-colors">
                      {prog}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono group-hover:text-amber-700">
                      View
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
