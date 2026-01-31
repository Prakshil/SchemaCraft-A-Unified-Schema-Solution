'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/90 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <span className="font-semibold text-[var(--foreground)]">SchemaCraft</span>
          </div>

          <nav className="flex items-center gap-8 text-sm text-[var(--border-strong)]">
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Features</a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Export formats</a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">API</a>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--border-strong)]">
          <p>© {currentYear} SchemaCraft. All rights reserved.</p>
          <p className="font-medium text-[var(--foreground)]">
            Built by <span className="text-[var(--accent)]">Prakshil</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
