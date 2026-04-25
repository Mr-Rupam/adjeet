'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { leadSchema, type LeadInput, TIMELINE_OPTIONS, COVERAGE_CITIES } from '@/lib/lead-schema'
import { services } from '@/content/services'

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
    defaultValues: { serviceInterest: [], timeline: 'immediate' },
  })

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
        return
      }
      setSubmitted(true)
      if (typeof window !== 'undefined' && (window as Window & { gtag?: Function }).gtag) {
        (window as Window & { gtag?: Function }).gtag!('event', 'lead_submit', {
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
      <div className="rounded-lg border border-rule bg-paper-elevated p-8 text-center">
        <p className="text-2xl mb-2">✓</p>
        <h3 className="font-bold text-ink mb-2">Message received!</h3>
        <p className="text-sm text-ink-muted">We&apos;ll call you back within 2 business hours.</p>
      </div>
    )
  }

  const field = 'block w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-blue transition-colors'
  const label = 'block text-xs font-semibold text-ink-subtle uppercase tracking-widest mb-1.5'
  const err = 'mt-1 text-xs text-[var(--error)]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot */}
      <input {...register('_hp')} type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="lead-name" className={label}>Name *</label>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={field}
            aria-describedby={errors.name ? 'lead-name-err' : undefined}
            {...register('name')}
          />
          {errors.name && <p id="lead-name-err" className={err}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-phone" className={label}>Phone *</label>
          <input
            id="lead-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            className={field}
            aria-describedby={errors.phone ? 'lead-phone-err' : undefined}
            {...register('phone')}
          />
          {errors.phone && <p id="lead-phone-err" className={err}>{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="lead-city" className={label}>City *</label>
        <select
          id="lead-city"
          className={field}
          aria-describedby={errors.city ? 'lead-city-err' : undefined}
          {...register('city')}
        >
          <option value="">Select your city</option>
          {COVERAGE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.city && <p id="lead-city-err" className={err}>{errors.city.message}</p>}
      </div>

      <div>
        <fieldset>
          <legend className={label}>Service Interest *</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {services.map(s => (
              <label key={s.slug} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  value={s.slug}
                  className="rounded border-rule text-blue focus:ring-blue"
                  {...register('serviceInterest')}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {errors.serviceInterest && <p className={err}>{errors.serviceInterest.message}</p>}
      </div>

      <div>
        <label htmlFor="lead-timeline" className={label}>Timeline *</label>
        <select
          id="lead-timeline"
          className={field}
          {...register('timeline')}
        >
          {TIMELINE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="lead-message" className={label}>Message (optional)</label>
        <textarea
          id="lead-message"
          rows={4}
          placeholder="Tell us more about your project..."
          className={`${field} resize-none`}
          {...register('message')}
        />
      </div>

      {serverError && (
        <p className="text-sm text-[var(--error)] bg-[var(--error)]/10 rounded px-3 py-2">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-blue text-white font-semibold py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]"
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
