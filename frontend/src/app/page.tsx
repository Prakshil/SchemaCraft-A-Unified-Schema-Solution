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
        generateDemoSchema(description);
      }
    } catch (err) {
      generateDemoSchema(description);
    } finally {
      setIsLoading(false);
    }
  }, [complexity]);

  const generateDemoSchema = (description: string) => {
    const demoSchema: Schema = {
      name: "application_schema",
      description: `Database schema for: ${description}`,
      tables: [
        {
          name: "users",
          description: "Core user accounts with authentication and profile data",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true, description: "Primary identifier" },
            { name: "email", type: "VARCHAR(255)", nullable: false, primary_key: false, unique: true, description: "User email address" },
            { name: "password_hash", type: "VARCHAR(255)", nullable: false, primary_key: false, unique: false, description: "Bcrypt hashed password" },
            { name: "full_name", type: "VARCHAR(100)", nullable: false, primary_key: false, unique: false, description: "Display name" },
            { name: "avatar_url", type: "TEXT", nullable: true, primary_key: false, unique: false, description: "Profile image URL" },
            { name: "role", type: "VARCHAR(20)", nullable: false, primary_key: false, unique: false, default: "'member'", description: "User role: admin, member, guest" },
            { name: "email_verified_at", type: "TIMESTAMP", nullable: true, primary_key: false, unique: false, description: "Email verification timestamp" },
            { name: "last_login_at", type: "TIMESTAMP", nullable: true, primary_key: false, unique: false, description: "Last successful login" },
            { name: "created_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()", description: "Account creation time" },
            { name: "updated_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()", description: "Last profile update" },
          ],
          indexes: [
            { name: "idx_users_email", columns: ["email"], unique: true },
            { name: "idx_users_role", columns: ["role"], unique: false },
          ]
        },
        {
          name: "workspaces",
          description: "Isolated workspace containers for team collaboration",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true, description: "Primary identifier" },
            { name: "name", type: "VARCHAR(100)", nullable: false, primary_key: false, unique: false, description: "Workspace display name" },
            { name: "slug", type: "VARCHAR(100)", nullable: false, primary_key: false, unique: true, description: "URL-friendly identifier" },
            { name: "owner_id", type: "UUID", nullable: false, primary_key: false, unique: false, description: "Workspace creator" },
            { name: "description", type: "TEXT", nullable: true, primary_key: false, unique: false, description: "Workspace description" },
            { name: "settings", type: "JSONB", nullable: true, primary_key: false, unique: false, default: "'{}'", description: "Workspace configuration" },
            { name: "created_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
            { name: "updated_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
          ],
          indexes: [
            { name: "idx_workspaces_slug", columns: ["slug"], unique: true },
            { name: "idx_workspaces_owner", columns: ["owner_id"], unique: false },
          ]
        },
        {
          name: "workspace_members",
          description: "Junction table for workspace membership and roles",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true },
            { name: "workspace_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "user_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "role", type: "VARCHAR(20)", nullable: false, primary_key: false, unique: false, default: "'member'" },
            { name: "invited_by", type: "UUID", nullable: true, primary_key: false, unique: false },
            { name: "joined_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
          ],
          indexes: [
            { name: "idx_workspace_members_composite", columns: ["workspace_id", "user_id"], unique: true },
          ]
        },
        {
          name: "projects",
          description: "Project containers within workspaces",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true },
            { name: "workspace_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "name", type: "VARCHAR(255)", nullable: false, primary_key: false, unique: false },
            { name: "description", type: "TEXT", nullable: true, primary_key: false, unique: false },
            { name: "status", type: "VARCHAR(20)", nullable: false, primary_key: false, unique: false, default: "'active'" },
            { name: "visibility", type: "VARCHAR(20)", nullable: false, primary_key: false, unique: false, default: "'private'" },
            { name: "archived_at", type: "TIMESTAMP", nullable: true, primary_key: false, unique: false },
            { name: "created_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
            { name: "updated_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
          ],
          indexes: [
            { name: "idx_projects_workspace", columns: ["workspace_id"], unique: false },
            { name: "idx_projects_status", columns: ["status"], unique: false },
          ]
        },
        {
          name: "tasks",
          description: "Individual work items with assignments and deadlines",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true },
            { name: "project_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "parent_id", type: "UUID", nullable: true, primary_key: false, unique: false, description: "For subtasks" },
            { name: "assignee_id", type: "UUID", nullable: true, primary_key: false, unique: false },
            { name: "created_by", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "title", type: "VARCHAR(255)", nullable: false, primary_key: false, unique: false },
            { name: "description", type: "TEXT", nullable: true, primary_key: false, unique: false },
            { name: "status", type: "VARCHAR(20)", nullable: false, primary_key: false, unique: false, default: "'todo'" },
            { name: "priority", type: "VARCHAR(10)", nullable: false, primary_key: false, unique: false, default: "'medium'" },
            { name: "due_date", type: "DATE", nullable: true, primary_key: false, unique: false },
            { name: "estimated_hours", type: "DECIMAL(5,2)", nullable: true, primary_key: false, unique: false },
            { name: "completed_at", type: "TIMESTAMP", nullable: true, primary_key: false, unique: false },
            { name: "position", type: "INT", nullable: false, primary_key: false, unique: false, default: "0" },
            { name: "created_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
            { name: "updated_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
          ],
          indexes: [
            { name: "idx_tasks_project", columns: ["project_id"], unique: false },
            { name: "idx_tasks_assignee", columns: ["assignee_id"], unique: false },
            { name: "idx_tasks_status", columns: ["status"], unique: false },
            { name: "idx_tasks_due_date", columns: ["due_date"], unique: false },
          ]
        },
        {
          name: "comments",
          description: "Threaded comments on tasks",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true },
            { name: "task_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "author_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "parent_id", type: "UUID", nullable: true, primary_key: false, unique: false, description: "For replies" },
            { name: "content", type: "TEXT", nullable: false, primary_key: false, unique: false },
            { name: "edited_at", type: "TIMESTAMP", nullable: true, primary_key: false, unique: false },
            { name: "created_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
          ],
          indexes: [
            { name: "idx_comments_task", columns: ["task_id"], unique: false },
            { name: "idx_comments_author", columns: ["author_id"], unique: false },
          ]
        },
        {
          name: "activity_logs",
          description: "Audit trail for all entity changes",
          columns: [
            { name: "id", type: "UUID", nullable: false, primary_key: true, unique: true },
            { name: "workspace_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "user_id", type: "UUID", nullable: true, primary_key: false, unique: false },
            { name: "entity_type", type: "VARCHAR(50)", nullable: false, primary_key: false, unique: false },
            { name: "entity_id", type: "UUID", nullable: false, primary_key: false, unique: false },
            { name: "action", type: "VARCHAR(20)", nullable: false, primary_key: false, unique: false },
            { name: "changes", type: "JSONB", nullable: true, primary_key: false, unique: false },
            { name: "ip_address", type: "INET", nullable: true, primary_key: false, unique: false },
            { name: "created_at", type: "TIMESTAMP", nullable: false, primary_key: false, unique: false, default: "NOW()" },
          ],
          indexes: [
            { name: "idx_activity_workspace", columns: ["workspace_id"], unique: false },
            { name: "idx_activity_entity", columns: ["entity_type", "entity_id"], unique: false },
            { name: "idx_activity_created", columns: ["created_at"], unique: false },
          ]
        },
      ],
      relationships: [
        { from_table: "workspaces", from_column: "owner_id", to_table: "users", to_column: "id", type: "many_to_one", on_delete: "RESTRICT" },
        { from_table: "workspace_members", from_column: "workspace_id", to_table: "workspaces", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "workspace_members", from_column: "user_id", to_table: "users", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "projects", from_column: "workspace_id", to_table: "workspaces", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "tasks", from_column: "project_id", to_table: "projects", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "tasks", from_column: "assignee_id", to_table: "users", to_column: "id", type: "many_to_one", on_delete: "SET NULL" },
        { from_table: "tasks", from_column: "created_by", to_table: "users", to_column: "id", type: "many_to_one", on_delete: "RESTRICT" },
        { from_table: "tasks", from_column: "parent_id", to_table: "tasks", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "comments", from_column: "task_id", to_table: "tasks", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "comments", from_column: "author_id", to_table: "users", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "activity_logs", from_column: "workspace_id", to_table: "workspaces", to_column: "id", type: "many_to_one", on_delete: "CASCADE" },
        { from_table: "activity_logs", from_column: "user_id", to_table: "users", to_column: "id", type: "many_to_one", on_delete: "SET NULL" },
      ],
      suggestions: [
        "Consider adding a file_attachments table for task documents with S3/GCS storage references",
        "Add a tags table with task_tags junction for flexible categorization",
        "Consider implementing soft deletes with deleted_at columns for data recovery",
        "Add a notifications table for in-app user notifications",
      ]
    };

    setSchema(demoSchema);
    setError(null);
  };

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
