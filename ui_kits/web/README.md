# Tally · Web UI Kit

Tally's marketing site + a glimpse of the desktop dashboard inside the hero. One self-contained HTML file — no build step, no external scripts beyond the design tokens.

## File

| File | What's in it |
|---|---|
| `index.html` | Top bar with wordmark + nav · hero with headline and an inline desktop-dashboard mock · feature row · "Just ask" AI chat sample · footer. |

## Notes

- All visuals come from `../../colors_and_type.css`. No new colors, no new fonts.
- The dashboard preview inside the hero is a static mock, not a wired-up React app — its purpose is to anchor the marketing pitch with an honest screenshot of the product.
- Icons are inline SVG in Lucide style at 1.75 stroke. If a CDN link to Lucide is allowed in production, swap to `lucide.dev`.
- This is a single-page recreation. Sub-pages (Pricing, Security details, About) follow the same shell — duplicate this file and swap the `<section>` content.
