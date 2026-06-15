interface SectionHeaderProps {
  children: React.ReactNode
}

/** Wiki-style section header: amber bar marker + label + horizontal rule. */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2 className="text-primary mb-4 flex items-center gap-2.5 text-sm font-bold tracking-wider uppercase">
      <span className="bg-primary h-4 w-1 rounded-full" aria-hidden="true" />
      {children}
      <span className="bg-wiki-border ml-1 h-px flex-1" aria-hidden="true" />
    </h2>
  )
}
