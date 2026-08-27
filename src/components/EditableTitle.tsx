import { useCallback, useRef, useState } from 'react'

/**
 * Editable cell that looks like plain text but switches to an input on focus.
 * Submits on blur or Enter, cancels on Escape.
 */
interface EditableTitleProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
}

export function EditableTitle({ value, onChange, placeholder = 'Untitled', className = '' }: EditableTitleProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setDraft(value)
    setEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    onChange(trimmed || placeholder)
    setEditing(false)
  }, [draft, onChange, placeholder])

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`editable-input ${className}`}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') cancel()
        }}
      />
    )
  }

  return (
    <span
      className={`editable-label ${className}`}
      onClick={startEdit}
      title="Tap to rename"
    >
      {value || placeholder}
    </span>
  )
}
