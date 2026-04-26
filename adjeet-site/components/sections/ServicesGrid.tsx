'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { services } from '@/content/services'
import { ServiceIcon } from '@/components/icons/ServiceIcon'
import { StaggerChildren, staggerItem } from '@/components/motion/StaggerChildren'
import { FadeIn } from '@/components/motion/FadeIn'

interface ServiceTileProps {
  slug: string
  name: string
  tagline: string
  icon: string
  expanded: boolean
}

export function ServiceTile({ slug, name, tagline, icon, expanded }: ServiceTileProps) {
  return (
    <motion.div variants={staggerItem}>
      <Link
        href={`/services/${slug}`}
        className="group flex flex-col items-center gap-3 rounded-lg p-5 border border-rule hover:border-blue hover:bg-paper-elevated transition-all text-center"
      >
        <ServiceIcon icon={icon} size={48} className="text-blue" />
        <span className="text-sm font-medium text-ink group-hover:text-blue transition-colors leading-snug">
          {name}
        </span>
        {expanded && (
          <span className="text-xs text-ink-muted leading-snug">{tagline}</span>
        )}
        <span aria-hidden="true" className="text-xs text-ink-subtle group-hover:text-blue transition-colors">
          →
        </span>
      </Link>
    </motion.div>
  )
}

interface ServicesGridProps {
  expanded?: boolean
  className?: string
}

export function ServicesGrid({ expanded = false, className = '' }: ServicesGridProps) {
  return (
    <section className={`py-16 md:py-32 ${className}`}>
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <h2 className="text-center font-bold text-4xl md:text-5xl font-[var(--font-fraunces)] text-ink mb-12">
            {expanded ? 'Our Services' : 'What We Do'}
          </h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map(service => (
            <ServiceTile
              key={service.slug}
              slug={service.slug}
              name={service.name}
              tagline={service.tagline}
              icon={service.icon}
              expanded={expanded}
            />
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
