# AD-JEET Site — Design TODOs

Tracked from /plan-design-review session (2026-05-01). See DESIGN.md for the design system rules.

---

## Critical (blocks shipping)

### [ ] Write CSS for Hero.sandbox.tsx
**Why:** The component renders as unstyled HTML. All class names are undefined — `.sandbox-hero`, `.theme-glowsign`, `.theme-acpled`, `.theme-wallpaint`, `.sandbox-bg`, `.sandbox-content`, `.sandbox-topbar`, `.sandbox-manifesto`, `.sandbox-stage`, `.signage-container`, `.mounting-surface`, `.rivet`, `.hidden-input`, `.signage-text`, `.signage-placeholder`, `.signage-cursor`, `.signage-char`, `.signage-floor`, `.spec-card` and children, `.material-picker`, `.material-btn`, `.sandbox-ctas`, `.btn-primary-signage`, `.btn-secondary-outline`, `.pulse-dot`.

**Context:** Use CSS modules (matching Hero.module.css pattern). Three material themes: `glowsign` (blue glow + amber), `acpled` (silver + white face-lit), `wallpaint` (muted earth tones). Follows editorial dark-night aesthetic from Hero.module.css. Tokens from `design/tokens.css`.

**Depends on:** Design decisions from 2026-05-01 plan-design-review. DESIGN.md (below).

---

## High priority

### [ ] Create DESIGN.md
**Why:** Font split is ambiguous without documentation. The next component built will use wrong fonts or wrong CSS approach.

**Content to document:**
- Hero fonts: Khand (display) + Anek Latin (body) — hero-only, not used elsewhere
- Site fonts: Fraunces (serif headings) + Inter (body/UI)
- CSS approach: CSS modules for hero/dark editorial sections; Tailwind utilities for light content sections
- Token system: reference `design/tokens.css`
- Color semantics: paper = warm white, ink = near-black, ochre = accent-warm, clay = accent-earth, sage = accent-cool, slate = neutral-dark, blue = adjeet-blue (brand)

### [ ] Redesign ClientShowcase to match editorial system
**Why:** Rounded pill badges, star emoji trust badge, centered layout, and generic copy ("India's biggest brands") break the editorial design language established by the Hero.

**Changes:**
- Remove `rounded-full` from brand pills → use `rounded` or square corners + `border-rule`
- Remove `★ Trusted by 200+ brands` emoji badge
- Change header alignment from centered to left-aligned
- Update heading: **"Airtel. Jio. Havells. They chose AD-JEET for North Bengal."**
- Move `<style jsx global>` animations to a CSS module
- Apply `design/tokens.css` color vocabulary directly

### [ ] Integrate HeroSandbox into page.tsx as second section
**Why:** Decided in D2 — sandbox goes below Hero, above ClientShowcase.

**Change to `app/(marketing)/page.tsx`:**
```tsx
import { HeroSandbox } from '@/components/sections/Hero.sandbox'
// ...
<Hero />
<HeroSandbox />
<ClientShowcase />
```

---

## From 2026-05-02 plan-design-review

### [ ] Fix Hero CTA visual hierarchy
**Why:** "Our Services" has the filled paper treatment (visually dominant) and "Get Quote on WhatsApp" has the dark semi-transparent treatment. This is backwards — WhatsApp is the primary conversion action for B2B signage buyers who call/message to quote.

**Implementation:** In Hero.module.css, swap the `background` and `border` values between `.primaryAction` and `.whatsappAction`. WhatsApp button gets `background: var(--hero-paper); color: var(--hero-ink); border: 1px solid var(--hero-paper)`. Our Services button gets the dark semi-transparent treatment currently on `.whatsappAction`.

**Depends on:** None.

### [ ] SelectedWork: empty state (0 photos)
**Why:** `getFeaturedPhotos().slice(0, 4)` can return an empty array. Currently `const [hero, ...supporting] = featured` would destructure to `hero = undefined`, causing a broken `<Image>` render.

**Implementation:** In SelectedWork.tsx, add a guard: `if (featured.length === 0) { return <section>...</section> }` with the warm placeholder copy: "Photographing recent projects — see our work in person." and a WhatsApp link (same pattern as CommissionSign).

**Depends on:** None.

### [ ] SelectedWork: partial state (1–3 photos)
**Why:** The grid assumes 4 photos (1 hero + 3 supporting). With 1-3 photos, the CSS grid layout may have visible empty cells.

**Implementation:** Make the photo grid CSS handle fewer items gracefully (`grid-template-columns: repeat(auto-fit, minmax(..., 1fr))` or explicit conditional layout based on `supporting.length`).

**Depends on:** SelectedWork empty state fix.

### [ ] Extract SectionLabel component
**Why:** The section label bar (mono font 11px, 0.14em tracking, ink-subtle, border-rule) is duplicated via inline styles in ServicesIndex, TheStandard, SelectedWork, ByTheNumbers. Inline styles are not the intended pattern for light sections (DESIGN.md: use Tailwind utilities).

**Implementation:** Create `adjeet-site/components/ui/SectionLabel.tsx` with props: `number: string`, `label: string`, `href?: string`, `linkText?: string`. Create `SectionLabel.module.css` with the mono font styles. Replace inline style objects in all 4 section components.

**Depends on:** None.

### [ ] Fix Lightbox counter text contrast
**Why:** The counter element `{idx + 1} / {total}` uses `text-ink-muted` (#4A4741, near-black) on the dark lightbox overlay background. Near-black on dark = fails WCAG 1.4.3 contrast ratio.

**Implementation:** In Lightbox.tsx change `className="... text-ink-muted"` on the counter `<p>` to `className="... text-white/60"` or similar light-on-dark color that maintains readable contrast on the dark overlay.

**Depends on:** None.

---

## Standard

### [ ] Add blurDataURL to Hero Image
**Why:** On slow connections (3G in Siliguri), the full-viewport photo pops in after the layout renders. A blur placeholder prevents this.

**Implementation:** Generate a 16×9 base64 blur from `public/og-image.jpg` and add `placeholder="blur" blurDataURL="..."` to the `<Image>` in Hero.tsx.

### [ ] Add character counter to HeroSandbox input
**Why:** Typing past 12 characters silently drops input. Users think the UI is broken.

**Implementation:** In HeroSandbox component, show `{text.length} / 12` in the spec card footer or below the sign. Change the counter color to amber/warning when near limit (≥10 chars).

### [ ] Add prefers-reduced-motion to ClientShowcase animations
**Why:** Two infinite scrolling carousels without motion safeguards are an accessibility issue (WCAG 2.2, criterion 2.3.3). Hero.module.css already sets the precedent.

**Implementation:** Add to the `<style jsx global>` block in ClientShowcase.tsx:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-scroll-left,
  .animate-scroll-right {
    animation: none;
  }
}
```

### [ ] Write mobile responsive CSS for HeroSandbox
**Why:** The sandbox uses a desktop 2-column layout (sign preview + spec card sidebar) with no mobile breakpoints. On 375px, layout will collapse incorrectly.

**Spec (≤640px):**
- Stage: `flex-direction: column`
- Sign preview: `width: 100%`, full-viewport width
- Spec card: below the sign, full-width, collapsible or scrollable
- Material picker: stays below the stage as a horizontal scroll row

### [ ] Audit hidden-input accessibility in HeroSandbox
**Why:** The `<input>` is `className="hidden-input"` — if this resolves to `display: none`, screen readers cannot interact with the sandbox at all.

**Implementation:** Use the visually-hidden pattern:
```css
.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Before shipping HeroSandbox

HeroSandbox is built but not on the homepage (removed 2026-05-02 per /plan-eng-review). These issues must be resolved before it ships anywhere.

### [ ] Fix AnimatePresence key scheme — mid-string edit re-animation bug
**Why:** `key={`${i}-${char}`}` is position-based. Inserting or deleting a character in the middle causes all characters after that position to get new keys and re-animate with the stagger effect. On "AD-JEET" → delete "D" → "AEET" re-animates twice at positions 1 and 2 even though those characters didn't change. Noticeable during fast editing.

**Context:** Fixing requires stable character IDs — generate a UUID per newly-added character and store `{ id, char }[]` in state instead of a plain string. This is a significant state refactor but is the only correct fix.

**Depends on:** None.

### [ ] Fix mobile spec card height on HeroSandbox at 375px
**Why:** The spec card has 6 rows of data. On mobile (375px), the stage collapses to single-column layout (sign above, spec card below) with no max-height on the spec card. The card pushes the material picker and CTAs below the fold, making the primary interaction unavailable without scrolling.

**Implementation:** Add `max-height` + `overflow-y: auto` to `.specCard` at ≤640px, or make it collapsible with a toggle. Or truncate the spec card to 3 rows on mobile.

**Depends on:** None.

### [ ] Verify next/font/google in 'use client' component on Next.js 16
**Why:** `Khand` and `Anek_Latin` are instantiated at module scope inside `Hero.sandbox.tsx` which has `'use client'`. AGENTS.md warns that Next.js 16 has breaking API changes. Confirm in production build that font preloading, self-hosting, and CSS variable injection work correctly for fonts declared in client components. Hero.tsx (server component) loads the same fonts correctly — this is the reference.

**Context:** Development mode likely works. Verify with `next build` output and check for preload `<link>` tags in the document for these fonts.

**Depends on:** TypeScript build passing (verify Hero.tsx blurDataURL + sandbox font loading together).
