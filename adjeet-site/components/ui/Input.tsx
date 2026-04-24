import type { ReactNode } from 'react'
import { type ComponentPropsWithoutRef } from 'react'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, name, className = '', ...props }: InputProps) {
  const fieldId = id ?? name
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className="rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent aria-[invalid=true]:border-error"
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-subtle">{hint}</p>}
      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
