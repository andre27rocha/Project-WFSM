import ReactMarkdown from 'react-markdown'

interface WikiMarkdownProps {
  content: string
}

const proseCls =
  '[&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-foreground [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_li]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground'

export function WikiMarkdown({ content }: WikiMarkdownProps) {
  if (!content) return null
  return (
    <div className={proseCls}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
