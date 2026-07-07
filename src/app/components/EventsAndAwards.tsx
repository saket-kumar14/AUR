"use client";

import React from "react";
import { Calendar, Award, MapPin, Users, ArrowRight } from "lucide-react";

export default function EventsAndAwards() {
  const events = [
    {
      id: "ev-1",
      title: "Asia Higher Education Summit 2026",
      date: "August 12-14, 2026",
      location: "Singapore",
      type: "Conference",
      description: "Join leading academic minds and university chancellors to discuss the future of AI in higher education, institutional growth, and global partnerships.",
    },
    {
      id: "ev-2",
      title: "AUR Awards Gala",
      date: "November 5, 2026",
      location: "Tokyo, Japan",
      type: "Awards",
      description: "Celebrating the most innovative universities and outstanding contributors to research and employability in the Asian region.",
    },
    {
      id: "ev-3",
      title: "International Student Mobility Forum",
      date: "January 20, 2027",
      location: "Virtual",
      type: "Webinar",
      description: "A deep dive into cross-border education trends, scholarship opportunities, and the changing landscape of international student mobility.",
    }
  ];

  return (
    <div className="aur-rankings-shell mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8 py-6 sm:py-8 font-sans flex-grow">
      
      <div className="aur-rankings-hero mb-6 sm:mb-8 aur-hero-accent flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
        <div className="min-w-0">
          <span className="aur-caption">Community & Recognition</span>
          <h2 className="aur-section-title text-3xl md:text-4xl leading-tight mt-2">
            Events & Awards
          </h2>
          <p className="text-[11px] text-[var(--aur-text-muted)] font-mono mt-3 tracking-wide">
            Discover upcoming conferences, summits, and prestigious awards.
          </p>
        </div>
        
        <button
          type="button"
          className="aur-rankings-action mt-2 md:mt-0 inline-flex w-full sm:w-auto items-center justify-center px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all aur-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aur-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Submit an Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="aur-card p-6 flex flex-col h-full hover:border-[var(--aur-text)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="aur-chip bg-[var(--aur-surface-2)] text-[var(--aur-text-secondary)]">
                {event.type === "Awards" ? <Award className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                {event.type}
              </span>
              <span className="text-[10px] font-mono text-[var(--aur-text-muted)]">{event.date}</span>
            </div>
            
            <h3 className="text-xl font-bold text-[var(--aur-text)] mb-3">{event.title}</h3>
            <p className="text-sm text-[var(--aur-text-secondary)] mb-6 flex-grow leading-relaxed">
              {event.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--aur-border)]">
              <div className="flex items-center text-xs text-[var(--aur-text-muted)]">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                {event.location}
              </div>
              <button className="text-[var(--aur-text)] hover:text-amber-700 dark:hover:text-cyber-yellow transition-colors inline-flex items-center text-xs font-bold uppercase tracking-wider">
                Learn More <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
