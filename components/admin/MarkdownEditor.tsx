'use client'

import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const textareaCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none'

const previewCls =
  'min-h-[14rem] overflow-auto rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline'

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Write markdown here…'}
        rows={14}
        className={textareaCls}
      />
      <div className={previewCls}>
        {value ? (
          <ReactMarkdown>{value}</ReactMarkdown>
        ) : (
          <p className="italic text-muted-foreground">Preview will appear here.</p>
        )}
      </div>
    </div>
  )
}
