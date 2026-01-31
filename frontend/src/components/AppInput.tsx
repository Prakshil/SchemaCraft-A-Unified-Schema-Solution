'use client';

import { useState, useRef, useEffect, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export type Complexity = 'simple' | 'standard' | 'enterprise';

const COMPLEXITY_OPTIONS: { id: Complexity; label: string; hint: string }[] = [
  { id: 'simple', label: 'Simple', hint: '3–5 tables. Your MVP called.' },
  { id: 'standard', label: 'Standard', hint: '6–10 tables, relationships, the works.' },
  { id: 'enterprise', label: 'Enterprise', hint: 'Audit trails, soft deletes, the full parade.' },
];

const WITTY_LINES = [
  "Normalization is free. Chaos isn't.",
  "We've seen worse schemas. Yours will be fine.",
  "Describe it. We'll pretend we're a DBA.",
  "Your idea, our constraints. Fair trade.",
  "No “users” table? We'll add one anyway.",
];

interface AppInputProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
  complexity: Complexity;
  onComplexityChange: (c: Complexity) => void;
}

export default function AppInput({ onSubmit, isLoading, complexity, onComplexityChange }: AppInputProps) {
  const [description, setDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const wittySeed = useId();
  const wittyIndex = useMemo(() => {
    // Deterministic hash so SSR/CSR renders match (prevents hydration mismatch).
    let hash = 0;
    for (let i = 0; i < wittySeed.length; i++) {
      hash = (hash * 31 + wittySeed.charCodeAt(i)) >>> 0;
    }
    return hash % WITTY_LINES.length;
  }, [wittySeed]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = () => {
    if (triggerRef.current) {
      setDropdownRect(triggerRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (dropdownOpen && triggerRef.current) {
      setDropdownRect(triggerRef.current.getBoundingClientRect());
    } else {
      setDropdownRect(null);
    }
  }, [dropdownOpen]);

  // Keep dropdown anchored to trigger on scroll/resize
  useEffect(() => {
    if (!dropdownOpen) return;
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && !isLoading) {
      onSubmit(description);
    }
  };

  const current = COMPLEXITY_OPTIONS.find((o) => o.id === complexity)!;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-2"
    >
      {/* Chat-style bar: [Dropdown] | [Input] | [Send] */}
      <div className="flex flex-col sm:flex-row gap-0 sm:gap-0 items-stretch sm:items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-muted)] transition-all">
        {/* Complexity dropdown — left, inside the bar */}
        <div className="relative shrink-0 border-b sm:border-b-0 sm:border-r border-[var(--border)]">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-3.5 sm:py-4 w-full sm:w-auto min-w-0 hover:bg-[var(--card-hover)] transition-colors text-left"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className="text-sm font-medium text-[var(--foreground)] capitalize truncate">{current.label}</span>
            <svg
              className={`w-4 h-4 text-[var(--foreground-muted)] shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Dropdown menu — portaled so it isn't clipped */}
        {typeof document !== 'undefined' && dropdownOpen && dropdownRect && createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="fixed w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 shadow-xl z-[100]"
              style={{ left: dropdownRect.left, top: dropdownRect.bottom + 6 }}
            >
              {COMPLEXITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onComplexityChange(opt.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex flex-col gap-0.5 transition-colors first:rounded-t-[10px] last:rounded-b-[10px] ${complexity === opt.id ? 'bg-[var(--accent-muted)]' : 'hover:bg-[var(--card-hover)]'}`}
                >
                  <span className={`text-sm font-medium ${complexity === opt.id ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)]">{opt.hint}</span>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

        {/* Input — fills the middle */}
        <div className="flex-1 flex min-w-0 relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your app in plain English. We'll do the DBA part."
            className="w-full bg-transparent border-0 p-4 pr-14 sm:pr-14 py-4 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-0 resize-none min-h-[52px] max-h-[200px] text-base leading-relaxed"
            disabled={isLoading}
            rows={1}
          />

          {/* Send button — right, inside the bar */}
          <motion.button
            type="submit"
            disabled={!description.trim() || isLoading}
            className="absolute bottom-3 right-3 sm:relative sm:bottom-0 sm:right-0 sm:self-center sm:mr-3 sm:ml-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors shrink-0"
            whileTap={{ scale: 0.96 }}
            aria-label="Generate schema"
          >
            {isLoading ? (
              <motion.span
                className="w-4 h-4 border-2 border-[var(--accent-foreground)]/30 border-t-[var(--accent-foreground)] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5"/>
                <ellipse cx="12" cy="19" rx="9" ry="3"/>
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Helper row: character count + witty line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
        <span className="text-xs text-[var(--foreground-muted)] order-2 sm:order-1">
          {description.length} / 500 · Enter to send
        </span>
        <p className="text-xs text-[var(--foreground-muted)] italic order-1 sm:order-2">
          {WITTY_LINES[wittyIndex]}
        </p>
      </div>
    </motion.form>
  );
}
