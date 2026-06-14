import { siteConfig } from '@/config/site'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">
        <span className="text-primary">Vania</span>
        <span className="text-foreground">Codex</span>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">{siteConfig.description}</p>
    </div>
  )
}
