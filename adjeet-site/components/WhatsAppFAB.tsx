'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

export function WhatsAppFAB() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero-section')
    if (!hero) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="quote-fab"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          // Clears the consent banner, which pins itself to the bottom of the
          // viewport and publishes its height as --consent-h. Without this the
          // banner covered the site's primary conversion action on first visit.
          style={{ bottom: 'calc(1.5rem + var(--consent-h, 0px))' }}
          className="fixed right-6 z-50"
        >
          <QuoteCTA source="fab" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
