import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

export default function MultiSelectDropdown({ options, selected, onChange, placeholder }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="aur-input flex items-center justify-between cursor-pointer min-h-[44px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate pr-4">
          {selected.length === 0 ? (
            <span className="text-[var(--aur-text-muted)]">{placeholder}</span>
          ) : (
            <span className="text-[var(--aur-text)]">
              {selected.length} selected
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--aur-text-muted)]" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[var(--aur-surface)] border border-[var(--aur-border)] rounded-2xl shadow-[var(--aur-shadow-lg)] max-h-64 overflow-y-auto overflow-x-hidden p-2"
          >
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-xl transition-colors ${
                    isSelected ? 'bg-[var(--aur-surface-2)] text-[var(--aur-accent)]' : 'hover:bg-[var(--aur-surface-hover)] text-[var(--aur-text)]'
                  }`}
                >
                  <div className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? 'bg-[var(--aur-accent)] border-[var(--aur-accent)]' : 'border-[var(--aur-border-strong)]'}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm truncate">{option}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
