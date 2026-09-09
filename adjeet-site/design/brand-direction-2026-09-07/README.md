# AD-JEET design pack

**Recommended direction: Made to be seen.** A mobile-first physical sign-making world, using the original logo. Global theme switching changes the homepage hero background between matching day and night scenes.

This is a proposed design and implementation handoff. It does not implement or publish the production website.

## Start

- Open the visual review: http://127.0.0.1:4317/
- Give the implementation model **IMPLEMENTATION-HANDOFF.md** first.
- Read **DESIGN-BRIEF.md** for the full visual and interaction specification.
- Review **AUDIT.md** for the rejected direction's problems.
- See **RESEARCH.md** for current primary sources and the taste decisions.

If the local preview is not running, run:

~~~powershell
node "C:/Users/KIIT0001/Downloads/AD_JEET/adjeet-site/design/brand-direction-2026-09-07/tools/serve.cjs"
~~~

The server only serves this design pack on the local computer.

## Included

| Item | Location |
|---|---|
| Three creative studies and overall visual review | index.html |
| Interactive visual reference | reference.html, reference.css, reference.js |
| Main phone day/night boards | boards/home-light-mobile.png, boards/home-dark-mobile.png |
| Complete phone homepages | boards/home-light-full.png, boards/home-dark-full.png |
| Desktop hero boards | boards/home-light-desktop.png, boards/home-dark-desktop.png |
| Services, detail, work, about, contact, local and privacy boards | boards/*-mobile.png and boards/*-full.png |
| Combined presentation images | boards/cover.png, boards/concepts.png, boards/page-family.png |
| Original unchanged logo | assets/adjeet-original.png |
| Four matched hero plates, material render, miniature study | assets/*.webp and *-source.png |
| Exact file provenance, hashes and bytes | asset-manifest.json |
| Semantic palette, OKLCH values, typography and motion | design-tokens.json |
| Local fonts with licences | fonts/ |
| Image generation prompt set | PROMPTS.md |
| Existing-page evidence | audit/ |
| Reference verification | verification.json, review-checks.json, VERIFICATION.md |

## Scope of the prototype

The theme control works. Navigation opens the corresponding visual specimens. Portfolio filters work. The contact form displays a labelled example confirmation and sends no data.

All service rows currently demonstrate one ACP detail specimen. B and C are night-only creative studies; only A has complete matching light/dark hero assets. Privacy text specifies the reading layout and does not replace the existing policy. Production integration, true service destinations, media-loading optimization, CAPTCHA and server-connected form states are the implementation model's work.

The workshop set, material render and miniature are generated concepts. Portfolio images are copies of the existing project assets. No new generated image is evidence of a completed client project.

## Original logo

Copied from C:/Users/KIIT0001/Downloads/ADJEET/adjeet/logo.png.png.

586 × 175px. SHA-256: 593171413b014c8d79501f1bf408c91354cfb31c70215b22b9c70cc45cc8bcea.

Do not regenerate or trace the mark. The blank scene plates intentionally let the interface place this exact image without changing its lettering.
