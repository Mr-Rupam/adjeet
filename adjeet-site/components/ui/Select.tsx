import { type ComponentPropsWithoutRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'children'> {
  label: string
  name: string  // required
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function Select({ label, options, placeholder, error, id, name, className = '', ...props }: SelectProps) {
  const fieldId = id ?? name
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={fieldId} className="spec text-ink-muted">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className="border-2 border-ink/40 bg-paper px-3 py-2.5 text-sm text-ink focus:border-ink focus:shadow-[3px_3px_0_0_var(--signal)] focus:outline-none aria-[invalid=true]:border-error"
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
