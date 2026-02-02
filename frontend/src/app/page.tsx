'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppInput from '@/components/AppInput';
import ERDiagram from '@/components/ERDiagram';
import SchemaCode from '@/components/SchemaCode';
import Footer from '@/components/Footer';
import { api, Schema } from '@/lib/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<'simple' | 'standard' | 'enterprise'>('standard');

  const handleGenerate = useCallback(async (description: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.generateSchema(description, complexity);

      if (result.status === 'success' && result.schema) {
        setSchema(result.schema);
      } else {
        setError(result.error || 'Failed to generate schema');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate schema. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [complexity]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* Nav — glass, SaaS-style */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-[0_0_20px_-4px_var(--accent-glow)]">
              <svg className="w-5 h-5 text-[var(--accent-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-[var(--foreground)] tracking-tight">SchemaCraft</span>
          </div>
        </div>
      </nav>

      {/* Hero — modern SaaS */}
      <section className="relative pt-16 pb-14 md:pt-20 md:pb-18">
        <div className="max-w-3xl mx-auto px-6 text-center">

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)] mb-5 leading-[1.1]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            From idea to
            <br />
            <span className="text-[var(--accent)]">production schema.</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Describe your app in plain English. Get tables, relationships, indexes and
            export to Postgres, MySQL, Prisma, or Drizzle in seconds.
          </motion.p>
        </div>
      </section>

      {/* Main content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 pb-16">
        <AppInput
          onSubmit={handleGenerate}
          isLoading={isLoading}
          complexity={complexity}
          onComplexityChange={setComplexity}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Schema Generation Failed</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {schema && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-16 space-y-14"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tables', value: schema.tables.length },
                  { label: 'Columns', value: schema.tables.reduce((acc, t) => acc + t.columns.length, 0) },
                  { label: 'Relationships', value: schema.relationships.length },
                  { label: 'Indexes', value: schema.tables.reduce((acc, t) => acc + t.indexes.length, 0) },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 px-5 py-4 text-center"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{stat.value}</p>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <ERDiagram schema={schema} />
              <SchemaCode schema={schema} />

              {schema.suggestions.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/60 p-6">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Recommendations</h3>
                  <ul className="space-y-3">
                    {schema.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                        <svg className="w-4 h-4 mt-0.5 text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!schema && !isLoading && (
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-medium text-[var(--foreground-muted)] mb-2">Try one of these examples</p>
            <p className="text-xs text-[var(--foreground-muted)] italic mb-6">We promise not to judge your stack.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { title: 'E-commerce', desc: 'Products, orders, customers, payments, shipping' },
                { title: 'SaaS Platform', desc: 'Users, workspaces, subscriptions, billing' },
                { title: 'Social Network', desc: 'Profiles, posts, comments, follows, messages' },
              ].map((example) => (
                <button
                  key={example.title}
                  onClick={() => handleGenerate(`${example.title} application with ${example.desc}`)}
                  className="text-left p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] transition-all"
                >
                  <p className="font-semibold text-[var(--foreground)]">{example.title}</p>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">{example.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
      </div>
    </div>
  );
}
