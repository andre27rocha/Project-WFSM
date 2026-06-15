import ReactMarkdown from 'react-markdown'

interface WikiMarkdownProps {
  content: string
}

const proseCls = [
  'text-sm',
  // headings with amber bottom border
  '[&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:pb-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:border-b [&_h1]:border-primary/50',
  '[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:pb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:border-b [&_h2]:border-primary/40',
  '[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:pb-0.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:border-b [&_h3]:border-primary/25',
  // paragraphs
  '[&_p]:mb-2 [&_p]:leading-snug [&_p]:text-foreground/85',
  // lists
  '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:mb-0.5 [&_li]:text-foreground/85',
  // inline code
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
  // text styles
  '[&_strong]:font-semibold [&_em]:italic',
  // links — amber, underline on hover only
  '[&_a]:text-primary [&_a]:no-underline [&_a]:transition-colors [&_a:hover]:underline [&_a:hover]:underline-offset-2',
  // blockquote
  '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
  // tables — full cell borders
  '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
  '[&_th]:border [&_th]:border-wiki-border [&_th]:bg-[#1a1a2e] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-primary',
  '[&_td]:border [&_td]:border-wiki-border [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-foreground/85',
  '[&_tr:nth-child(even)_td]:bg-[#1a1a2e]/40',
].join(' ')

export function WikiMarkdown({ content }: WikiMarkdownProps) {
  if (!content) return null
  return (
    <div className={proseCls}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
