import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-brand-ink font-sans antialiased selection:bg-brand-ink selection:text-brand-cream">
      {/* Slim official civic bar */}
      <div className="bg-brand-surface-alt border-b border-brand-hairline px-6 py-2 flex justify-between items-center text-xs text-brand-muted">
        <span>A civic emergency reporting service · Pilot deployment, Ogun State</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
          <span className="font-medium text-brand-ink">All Systems Operational</span>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 flex flex-col justify-center">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-white border border-brand-hairline flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-status-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wider text-brand-muted uppercase">IRMS Project Console</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Incident Response Management System
          </h1>
          <p className="text-lg text-brand-muted leading-relaxed">
            Welcome to the Next.js production codebase. The repository has been cleaned, custom Tailwind v4 brand theme tokens are registered, and the implementation resources are compiled inside the public documents directory.
          </p>
        </div>

        {/* Developer Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/docs/prd.md"
            className="group block p-6 bg-brand-white border border-brand-hairline rounded-2xl shadow-sm hover:shadow-md hover:border-brand-divider transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-brand-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              Product Requirements (PRD)
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Read the full platform vision, tech stack specifications, schemas, and AI integrations.
            </p>
          </Link>

          <Link
            href="/docs/tasks.md"
            className="group block p-6 bg-brand-white border border-brand-hairline rounded-2xl shadow-sm hover:shadow-md hover:border-brand-divider transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-brand-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              Developer Tasks (Tasks List)
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Agile checklist dividing work cleanly between Developer 1 (SAMKIEL) and Developer 2.
            </p>
          </Link>

          <Link
            href="/docs/IRMS Prototype _Standalone_.html"
            className="group block p-6 bg-brand-white border border-brand-hairline rounded-2xl shadow-sm hover:shadow-md hover:border-brand-divider transition-all duration-200"
            target="_blank"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-brand-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              HTML Standalone Prototype
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Explore the exact client-side React UI behavior, dynamic Leaflet maps, and sample incidents.
            </p>
          </Link>
        </div>

        {/* Tech Stack quick references */}
        <div className="p-6 bg-brand-surface-alt border border-brand-hairline rounded-2xl">
          <div className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Target Stack Reference</div>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-brand-muted">
            <span className="px-3 py-1.5 bg-brand-white border border-brand-hairline rounded-md">Next.js 15 App Router</span>
            <span className="px-3 py-1.5 bg-brand-white border border-brand-hairline rounded-md">TailwindCSS v4 Theme</span>
            <span className="px-3 py-1.5 bg-brand-white border border-brand-hairline rounded-md">shadcn/ui + Radix Primitives</span>
            <span className="px-3 py-1.5 bg-brand-white border border-brand-hairline rounded-md">Prisma + Postgres / Mongo</span>
            <span className="px-3 py-1.5 bg-brand-white border border-brand-hairline rounded-md">WebSockets / real-time updates</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-surface-alt border-t border-brand-hairline py-6 text-center text-xs text-brand-muted">
        <span>© 2026 IRMS · Operated in coordination with Ogun State & Redemption Camp emergency services</span>
      </footer>
    </div>
  );
}
