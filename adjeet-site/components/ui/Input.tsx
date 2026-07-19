import { type ComponentPropsWithoutRef } from 'react'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string
  name: string  // required — used to derive fieldId for label association
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, name, className = '', ...props }: InputProps) {
  const fieldId = id ?? name
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={fieldId} className="spec text-ink-muted">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className="border-2 border-ink/40 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:shadow-[3px_3px_0_0_var(--signal)] focus:outline-none aria-[invalid=true]:border-error"
        {...props}
      />
      {hint && !error && <p id={hintId} className="text-xs text-ink-subtle">{hint}</p>}
      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
