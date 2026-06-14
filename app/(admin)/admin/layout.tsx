import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold">
            <span className="text-primary">Vania</span>
            <span className="text-foreground">Codex</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">admin</span>
          </Link>

          <nav aria-label="Admin navigation">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  href="/admin"
                  className="rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
