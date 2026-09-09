# Research and taste decisions

Checked 7 September 2026. Research informed the direction; no new skill was installed and no untrusted repository script was executed.

## Design guidance

- [Impeccable, official repository](https://github.com/pbakaus/impeccable): used the installed skill's brand register, context gathering, shape, adaptive layout and restrained extraordinary-interaction guidance. Applied coherent brand roles, varied page rhythm and mobile rethinking.
- [Taste Skill, official repository](https://github.com/Leonxlnx/taste-skill): reviewed the current collection, including its experimental design-taste-frontend v2, GPT-oriented option and image-direction workflow.
- [Taste's website image-direction source](https://github.com/Leonxlnx/taste-skill/blob/main/skills/imagegen-frontend-web/SKILL.md): useful principles include image-as-canvas composition, section variety and one consistent palette. Its horizontal-section output defaults do not fit this user's mobile-first brief, so they were not adopted as a prescribed workflow.
- [Taste's mobile image-direction source](https://github.com/Leonxlnx/taste-skill/blob/main/skills/imagegen-frontend-mobile/SKILL.md): explicitly targets mobile applications. App tab bars and device-mockup conventions were not imported into this mobile website.

Taste Skill was located through Agent Reach's GitHub route using gh search and read-only GitHub API calls. Stars and update activity were discovery signals, not evidence of design quality. The named local Impeccable skill remained the controlling design workflow.

## Font decisions

- [Barlow Condensed, Google Fonts source](https://github.com/google/fonts/tree/main/ofl/barlowcondensed): the family's design draws from public signage and transportation lettering. Its condensed supporting voice works with a physical sign-making business while leaving the original serif logo intact.
- [Hind Siliguri, Google Fonts source](https://github.com/google/fonts/tree/main/ofl/hindsiliguri): includes Bengali and Latin and was designed for UI use. This supports the regional typography choice; it does not imply the site has been translated.

Local font files and the corresponding OFL licences are included. Production should subset to required scripts and serve WOFF2.

## Implementation references

- [Responsive images, MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images): art direction with picture/source supports distinct portrait and landscape compositions.
- [Core Web Vitals thresholds, web.dev](https://web.dev/articles/defining-core-web-vitals-thresholds): LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 are target thresholds, not measurements of this design.
- [Reduced motion, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): the theme visual can switch immediately for people requesting reduced motion.

## Judgement

The recommendation is a design inference, not something dictated by a trend list: **A's physical storefront explains the service, B's material render supports the craft, and existing project photographs establish credibility.** Keeping those roles distinct produces a clearer mobile journey than combining all three creative studies into one page.
