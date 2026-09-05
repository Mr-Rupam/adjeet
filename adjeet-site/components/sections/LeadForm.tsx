'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { leadSchema, type LeadInput, TIMELINE_OPTIONS, COVERAGE_CITIES } from '@/lib/lead-schema'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { services } from '@/content/services'

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
    defaultValues: { serviceInterest: [], timeline: 'immediate', cfTurnstileResponse: '' },
  })

  const turnstileRef = useRef<TurnstileInstance>(null)

  // The CAPTCHA was pinned to `theme: 'light'`, so it rendered as a white slab
  // inside the night-mode form. Track the site's own theme and hand it over.
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const read = () =>
      setWidgetTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  async function onSubmit(data: LeadInput) {
    setServerError(null)
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setServerError(body.error ?? 'Something went wrong. Please try WhatsApp instead.')
        turnstileRef.current?.reset()
        setValue('cfTurnstileResponse', '')
        return
      }
      setSubmitted(true)
      type GtagFn = (command: string, ...args: unknown[]) => void
      if (typeof window !== 'undefined' && (window as Window & { gtag?: GtagFn }).gtag) {
        (window as Window & { gtag?: GtagFn }).gtag!('event', 'lead_submit', {
          city: data.city,
          timeline: data.timeline,
        })
      }
    } catch {
      setServerError('Network error. Please try WhatsApp instead.')
    }
  }

  if (submitted) {
    return (
      <div className="border-2 border-ink bg-paper p-10 text-center shadow-[6px_6px_0_0_var(--signal)]">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center border-2 border-ink bg-signal">
          <span className="text-2xl text-signal-ink">✓</span>
        </div>
        <h3 className="display mb-2 text-2xl text-ink">Message received.</h3>
        <p className="mx-auto max-w-sm text-sm text-ink-muted">
          Our team will review your request and get back to you within 2 business hours.
        </p>
      </div>
    )
  }

  const fieldBase =
    'block w-full border-2 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-subtle/60 focus:outline-none transition-all duration-200'
  const fieldNormal = `${fieldBase} border-ink/40 focus:border-ink focus:shadow-[3px_3px_0_0_var(--signal)]`
  const fieldError = `${fieldBase} border-error focus:border-error`
  const label = 'spec block text-ink-muted mb-2'
  const errMsg = 'mt-1.5 text-xs text-error flex items-center gap-1'

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    return handleSubmit(onSubmit)(e)
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
      {/* Honeypot */}
      <input
        {...register('_hp')}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />

      {/* Name + Phone */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-name" className={label}>Name *</label>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className={errors.name ? fieldError : fieldNormal}
            aria-describedby={errors.name ? 'lead-name-err' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <p id="lead-name-err" className={errMsg}>
              <span className="text-[10px]">⚠</span> {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lead-phone" className={label}>Phone *</label>
          <input
            id="lead-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            className={errors.phone ? fieldError : fieldNormal}
            aria-describedby={errors.phone ? 'lead-phone-err' : undefined}
            {...register('phone')}
          />
          {errors.phone && (
            <p id="lead-phone-err" className={errMsg}>
              <span className="text-[10px]">⚠</span> {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* City */}
      <div>
        <label htmlFor="lead-city" className={label}>City *</label>
        <select
          id="lead-city"
          className={errors.city ? fieldError : fieldNormal}
          aria-describedby={errors.city ? 'lead-city-err' : undefined}
          {...register('city')}
        >
          <option value="">Select your city</option>
          {COVERAGE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.city && (
          <p id="lead-city-err" className={errMsg}>
            <span className="text-[10px]">⚠</span> {errors.city.message}
          </p>
        )}
      </div>

      {/* Service Interest */}
      <div>
        <fieldset>
          <legend className={label}>Services you need *</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
            {services.map(s => (
              <label
                key={s.slug}
                className="flex cursor-pointer items-center gap-2.5 border-2 border-ink/30 px-3 py-2.5 text-sm text-ink transition-all hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-signal/15 has-[:checked]:shadow-[2px_2px_0_0_var(--ink)]"
              >
                <input
                  type="checkbox"
                  value={s.slug}
                  className="accent-signal"
                  {...register('serviceInterest')}
                />
                <span className="text-xs">{s.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {errors.serviceInterest && (
          <p className={errMsg}>
            <span className="text-[10px]">⚠</span> {errors.serviceInterest.message}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div>
        <label htmlFor="lead-timeline" className={label}>Timeline</label>
        <select
          id="lead-timeline"
          className={fieldNormal}
          {...register('timeline')}
        >
          {TIMELINE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="lead-message" className={label}>
          Message <span className="text-ink-subtle font-normal">(optional)</span>
        </label>
        <textarea
          id="lead-message"
          rows={4}
          placeholder="Tell us about your project: dimensions, location, deadline..."
          className={`${fieldNormal} resize-none`}
          {...register('message')}
        />
      </div>

      {/* Turnstile: dev test key only outside production */}
      <div className="flex flex-col items-center">
        {(() => {
          const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
            || (process.env.NODE_ENV !== 'production' ? '1x00000000000000000000AA' : '')
          if (!siteKey) {
            return (
              <p className="text-xs text-error text-center max-w-sm">
                CAPTCHA is temporarily unavailable. Please reach us on WhatsApp at +91 98320 11524.
              </p>
            )
          }
          return (
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => setValue('cfTurnstileResponse', token, { shouldValidate: true })}
              onError={() => setServerError('CAPTCHA failed. Please try again.')}
              onExpire={() => setValue('cfTurnstileResponse', '', { shouldValidate: true })}
              options={{ theme: widgetTheme }}
            />
          )
        })()}
        {errors.cfTurnstileResponse && (
          <p className={errMsg}>
            <span className="text-[10px]">⚠</span> {errors.cfTurnstileResponse.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 border-2 border-error bg-error/5 px-4 py-3 text-sm text-error">
          <span className="mt-0.5">⚠</span>
          <p>{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border-2 border-ink bg-signal py-4 text-sm font-bold uppercase tracking-[0.08em] text-signal-ink shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--ink)] disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
            Sending…
          </span>
        ) : (
          'Send the brief →'
        )}
      </button>

      {/* Trust line */}
      <p className="spec text-center text-ink-subtle">
        Your data is stored securely. We never share it with third parties.
      </p>
    </form>
  )
}
