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
      <div className="rounded-2xl border border-blue/20 bg-blue/5 p-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue/10 mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="font-[var(--font-fraunces)] font-bold text-ink text-xl mb-2">
          Message received!
        </h3>
        <p className="text-sm text-ink-muted max-w-sm mx-auto">
          Our team will review your request and get back to you within 2 business hours.
        </p>
      </div>
    )
  }

  const fieldBase =
    'block w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-subtle/60 focus:outline-none transition-all duration-200'
  const fieldNormal = `${fieldBase} border-rule focus:border-blue focus:ring-2 focus:ring-blue/10`
  const fieldError = `${fieldBase} border-[var(--error)] focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/10`
  const label = 'block text-xs font-semibold text-ink-muted mb-2'
  const errMsg = 'mt-1.5 text-xs text-[var(--error)] flex items-center gap-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot */}
      <input {...register('_hp')} type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

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
                className="flex items-center gap-2.5 text-sm text-ink cursor-pointer rounded-lg border border-rule px-3 py-2.5 hover:border-blue/30 hover:bg-blue/5 transition-all has-[:checked]:border-blue/40 has-[:checked]:bg-blue/5"
              >
                <input
                  type="checkbox"
                  value={s.slug}
                  className="rounded border-rule text-blue focus:ring-blue accent-[var(--adjeet-blue)]"
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
          placeholder="Tell us about your project — dimensions, location, deadline..."
          className={`${fieldNormal} resize-none`}
          {...register('message')}
        />
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 text-sm text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-3">
          <span className="mt-0.5">⚠</span>
          <p>{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full rounded-xl bg-blue text-white font-bold py-4 text-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98] overflow-hidden"
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <span className="relative">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending…
            </span>
          ) : (
            'Send Message →'
          )}
        </span>
      </button>

      {/* Trust line */}
      <p className="text-center text-[10px] text-ink-subtle font-[var(--font-mono)] tracking-wide">
        🔒 Your data is stored securely. We never share it with third parties.
      </p>
    </form>
  )
}
