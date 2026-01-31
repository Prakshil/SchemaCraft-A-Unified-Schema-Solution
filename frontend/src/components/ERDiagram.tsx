'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Schema, Table } from '@/lib/api';

interface ERDiagramProps {
  schema: Schema;
}

interface TableCardProps {
  table: Table;
  schema: Schema;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

function TableCard({ table, schema, isExpanded, onToggle, index }: TableCardProps) {
  const tableName = table.name;

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:border-[var(--border-strong)] hover:shadow-md transition-all duration-200 flex flex-col min-h-0"
      data-table={tableName}
    >
      {/* Table Header — only this region toggles expand */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[var(--card-hover)]/50 active:bg-[var(--card-hover)] transition-colors text-left shrink-0 touch-manipulation"
        aria-expanded={isExpanded}
        aria-controls={`erd-table-${tableName}`}
        id={`erd-trigger-${tableName}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${isExpanded ? 'bg-[var(--accent)]' : 'bg-[var(--foreground-muted)]'}`}
            aria-hidden
          />
          <span className="font-mono text-sm font-medium text-[var(--foreground)] truncate">
            {tableName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
            {table.columns.length} cols
          </span>
          <svg
            className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content — separate layer, no toggle on inner clicks */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`erd-table-${tableName}`}
            role="region"
            aria-labelledby={`erd-trigger-${tableName}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-[var(--border)] bg-[var(--card)] overflow-hidden"
          >
            <div
              className="max-h-[280px] overflow-y-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  className="px-4 py-2.5 flex items-center justify-between gap-3 border-b border-[var(--border)]/60 last:border-0 hover:bg-[var(--card-hover)]/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {col.primary_key ? (
                      <span className="text-amber-400 shrink-0" title="Primary key" aria-hidden>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : schema.relationships.some((r) => r.from_table === tableName && r.from_column === col.name) ? (
                      <span className="text-[var(--accent)] shrink-0" title="Foreign key" aria-hidden>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    )}
                    <span className="font-mono text-xs text-[var(--foreground)] truncate">
                      {col.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--background-elevated)] font-mono text-[var(--foreground-muted)]">
                      {col.type.split('(')[0]}
                    </span>
                    {!col.nullable && !col.primary_key && (
                      <span className="text-[10px] text-[var(--foreground-muted)]">NOT NULL</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {table.indexes.length > 0 && (
              <div
                className="px-4 py-3 bg-[var(--background-elevated)]/60 border-t border-[var(--border)]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] mb-2 font-medium">
                  Indexes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {table.indexes.map((idx, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-md bg-[var(--card)] border border-[var(--border)]"
                    >
                      {idx.unique && (
                        <span className="text-amber-400 font-semibold">UNIQUE</span>
                      )}
                      <span className="text-[var(--foreground-muted)]">{idx.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ERDiagram({ schema }: ERDiagramProps) {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const handleToggle = useCallback((tableName: string) => {
    setExpandedTable((prev) => (prev === tableName ? null : tableName));
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
        <h2 className="font-semibold text-[var(--foreground)]">Schema Structure</h2>
        <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
          {schema.tables.length} tables, {schema.relationships.length} relationships
        </p>
      </div>

      {/* Tables Grid — each card is isolated */}
      <div className="p-6 bg-[var(--background)]/40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schema.tables.map((table, index) => (
            <TableCard
              key={table.name}
              table={table}
              schema={schema}
              isExpanded={expandedTable === table.name}
              onToggle={() => handleToggle(table.name)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Relationships */}
      <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card)]">
        <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] mb-3 font-medium">
          Relationships
        </p>
        <div className="flex flex-wrap gap-2">
          {schema.relationships.map((rel, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs bg-[var(--background-elevated)] px-2.5 py-1.5 rounded-lg border border-[var(--border)] font-mono"
            >
              <span className="text-[var(--foreground)]">{rel.from_table}</span>
              <svg className="w-3 h-3 text-[var(--foreground-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-[var(--foreground)]">{rel.to_table}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
