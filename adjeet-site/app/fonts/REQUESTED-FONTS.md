# Requested typefaces

The current font roles are defined once in `design/tokens.css`.

- **Cesura:** requested display family, not supplied in this checkout. `--font-heading` tries Cesura, Caesura and Cæsura from installed fonts, then falls back to the existing bundled Barlow Condensed. This does not bundle or impersonate Cesura.
- **Pristina:** used for the hero script accent through the locally installed font. The Windows installation was verified at `C:/Windows/Fonts/PRISTINA.TTF`. It has not been copied into the website. Other devices use the declared script fallback.
- **Hind Siliguri:** retained for readable body copy, forms, labels and navigation.

To finish consistent web delivery, supply the intended Cesura and Pristina licensed WOFF2 files. Load them with `next/font/local` in `app/fonts.ts`, include their variables in `app/layout.tsx`, and connect those variables to `--font-heading` and `--font-script`. Recheck heading wraps and responsive screenshots after the actual fonts are available.

Possible Cesura source, pending name confirmation: https://black-foundry.com/fonts/caesura/

Pristina source: https://www.myfonts.com/collections/pristina-font-itc
