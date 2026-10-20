# ANANAS design system

Current interface tokens in the homepage shell. Do not flood the page with gold.

| Role | Token | Use |
|---|---|---|
| Page | `#FFFEFB` | App background |
| Surface | `#FFFFFF` | Cards, composer shell |
| Ink | `#101828` | Headings, primary chips, bottom-nav active |
| Secondary | `#667085` | Hints, notes |
| Line | `#E7E9EE` / `#E6E8EF` | Quiet borders |
| Gold | `#FFC928` / `#F5C518` | Price underline, active nav wash, one accent rail |
| Intelligence | `#7C3AED` | Wanted chip, unconnected AI notes only |
| Growth | `#16A34A` | Real positive movement |
| Live | `#FF3347` | Live marker only |
| Discovery | `#1D4ED8` | Pulse “details” link |

## Rules

- One primary search on mobile. Detective mascot stays.
- Collapsed composer is a prompt plus the title field. Photos, price, location, and intent appear after expand.
- Category tiles use soft wells. No charcoal tile.
- Story and wire rails snap, so a label is not parked half off the screen.
- Empty engagement is omitted. Do not print a row of zeros.
- Price gold sits under the glyphs, not through them.
- Motion respects `prefers-reduced-motion`.
- The Next.js dev badge is not product UI.

## Desktop

Three columns already exist: category sidebar, feed, market cards. Do not rebalance them in this batch. Mobile must not render the desktop sidebar. That is enforced by `.ananas-desktop-only`.
