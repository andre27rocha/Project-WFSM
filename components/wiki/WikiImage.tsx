import Image from 'next/image'
import { cn } from '@/lib/utils'

interface WikiImageProps {
  /** Real image URL. When null/undefined, a branded placeholder is rendered instead. */
  src?: string | null
  alt: string
  /** Fill the (relatively positioned) parent. Mutually exclusive with width/height. */
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  /** Applied to the rendered <Image> and to the placeholder box (object-fit, rounding…). */
  className?: string
  /** Icon-only placeholder for small thumbnails (no label text). */
  compact?: boolean
}

/** Book-labyrinth glyph — a nod to the VaniaCodex logo, used on image placeholders. */
function PlaceholderGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Z" />
      <path d="M8 8h6M8 12h6M11 8v8" />
    </svg>
  )
}

/**
 * Image with a graceful, obviously-temporary placeholder.
 * Renders next/image when `src` is present; otherwise a dark amber-tinted
 * box labelled "Placeholder" so missing art is visible but intentional.
 */
export function WikiImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  compact,
}: WikiImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${alt} — placeholder image`}
      style={fill ? undefined : { width, height }}
      className={cn(
        'border-primary/20 bg-wiki-card flex flex-col items-center justify-center gap-1.5 overflow-hidden border border-dashed text-center',
        'bg-[repeating-linear-gradient(45deg,transparent,transparent_9px,rgba(239,159,39,0.045)_9px,rgba(239,159,39,0.045)_18px)]',
        fill && 'absolute inset-0',
        className
      )}
    >
      <PlaceholderGlyph className={cn('text-primary/30', compact ? 'h-4 w-4' : 'h-7 w-7')} />
      {!compact && (
        <>
          <span className="text-primary/40 text-[9px] font-bold tracking-[0.2em] uppercase">
            Placeholder
          </span>
          <span className="text-muted-foreground/70 max-w-[90%] truncate px-2 text-[11px] font-medium">
            {alt}
          </span>
        </>
      )}
    </div>
  )
}
