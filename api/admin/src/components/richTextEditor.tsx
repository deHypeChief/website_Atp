import { useEffect, useRef } from 'react'
import { Bold, Heading2, Italic, Link, List, ListOrdered, Quote } from 'lucide-react'

type RichTextEditorProps = { value: string; onChange: (value: string) => void }

const tools = [
  { label: 'Bold', command: 'bold', icon: Bold },
  { label: 'Italic', command: 'italic', icon: Italic },
  { label: 'Heading', command: 'formatBlock', value: 'h2', icon: Heading2 },
  { label: 'Bulleted list', command: 'insertUnorderedList', icon: List },
  { label: 'Numbered list', command: 'insertOrderedList', icon: ListOrdered },
  { label: 'Quote', command: 'formatBlock', value: 'blockquote', icon: Quote },
]

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value
  }, [value])

  const run = (command: string, commandValue?: string) => {
    editor.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(editor.current?.innerHTML || '')
  }

  const addLink = () => {
    const url = window.prompt('Enter the link URL')
    if (url && /^https?:\/\//i.test(url)) run('createLink', url)
  }

  return <div className="overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
    <div className="flex flex-wrap gap-1 border-b border-input bg-muted/40 p-2" role="toolbar" aria-label="Article formatting">
      {tools.map(({ label, command, value: commandValue, icon: ToolIcon }) =>
        <button key={label} type="button" title={label} aria-label={label} className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent hover:text-accent-foreground" onMouseDown={event => { event.preventDefault(); run(command, commandValue) }}><ToolIcon className="h-4 w-4" /></button>
      )}
      <button type="button" title="Add link" aria-label="Add link" className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-accent hover:text-accent-foreground" onMouseDown={event => { event.preventDefault(); addLink() }}><Link className="h-4 w-4" /></button>
    </div>
    <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Article content" data-placeholder="Write the full article here…" className="rich-text-editor min-h-64 px-4 py-3 text-sm leading-7 outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6" onInput={event => onChange(event.currentTarget.innerHTML)} />
  </div>
}
