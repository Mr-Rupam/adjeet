'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { leadSchema, type LeadInput, TIMELINE_OPTIONS, COVERAGE_CITIES } from '@/lib/lead-schema'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { services } from '@/content/services'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { business } from '@/lib/business'

export function LeadForm() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    || (process.env.NODE_ENV !== 'production' ? '1x00000000000000000000AA' : '')
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const successRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (submitted) successRef.current?.focus() }, [submitted])

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
      <div ref={successRef} tabIndex={-1} role="status" className="border border-rule bg-paper p-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-signal">
          <span className="text-2xl text-signal-ink">✓</span>
        </div>
        <h3 className="display mb-2 text-2xl text-ink">Message received.</h3>
        <p className="mx-auto max-w-sm text-sm text-ink-muted">
          Our team will review your request and contact you about the next steps.
        </p>
      </div>
    )
  }

  if (!siteKey) {
    return (
      <div className="form-unavailable" data-form-unavailable>
        <h3>Send your brief directly.</h3>
        <p>The online form is temporarily unavailable. Send your site photo, size, location and target date to the team on WhatsApp.</p>
        <QuoteCTA source="contact-form-fallback" label="WhatsApp your brief" />
        <a href={'tel:' + business.phone} className="field-link">Call {business.phoneDisplay}</a>
      </div>
    )
  }

  const fieldBase =
    'block min-h-[52px] w-full rounded-xl border bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-subtle/60 focus:outline-none transition-all duration-200'
  const fieldNormal = `${fieldBase} border-rule focus:border-signal focus:ring-2 focus:ring-signal/15`
  const fieldError = `${fieldBase} border-error focus:border-error focus:ring-2 focus:ring-error/15`
  const label = 'spec block text-ink-muted mb-2'
  const errMsg = 'mt-1.5 text-xs text-error flex items-center gap-1'

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    return handleSubmit(onSubmit)(e)
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
      <p className="text-sm text-ink-muted">Fields marked * are required.</p>
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
            aria-invalid={!!errors.name}
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
            aria-invalid={!!errors.phone}
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
          aria-invalid={!!errors.city}
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
        <fieldset aria-describedby={errors.serviceInterest ? 'lead-services-err' : undefined}>
          <legend className={label}>Services you need *</legend>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 mt-1">
            {services.map(s => (
              <label
                key={s.slug}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-rule px-3 py-2.5 text-sm text-ink transition-all hover:border-signal has-[:checked]:border-signal has-[:checked]:bg-signal/10"
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
          <p id="lead-services-err" className={errMsg}>
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
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => setValue('cfTurnstileResponse', token, { shouldValidate: true })}
              onError={() => setServerError('CAPTCHA failed. Please try again.')}
              onExpire={() => setValue('cfTurnstileResponse', '', { shouldValidate: true })}
              options={{ theme: widgetTheme, size: 'compact' }}
            />
        {errors.cfTurnstileResponse && (
          <p className={errMsg}>
            <span className="text-[10px]">⚠</span> {errors.cfTurnstileResponse.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div role="alert" className="flex items-start gap-2 border-2 border-error bg-error/5 px-4 py-3 text-sm text-error">
          <span className="mt-0.5">⚠</span>
          <p>{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-[54px] w-full button-shape border border-signal-hot bg-signal-hot px-6 py-3 text-sm font-medium text-signal-hot-ink transition-transform hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
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
        We use your details to respond to your enquiry.
      </p>
    </form>
  )
}
