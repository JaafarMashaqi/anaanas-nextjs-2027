/**
 * Week-1 homepage performance tunables (LCP / CLS).
 * Roll back by reverting this file + docs/12-week1-perf-quick-wins.md
 */

/** Wait after window "load" before auto-opening the announcement modal. */
export const ANNOUNCEMENT_SHOW_DELAY_MS = 8_000

/** Delay before enabling the splash overlay (lets real content paint first). */
export const SPLASH_ENABLE_DELAY_MS = 400

/** Force-hide splash even if hydration is slow (prevents splash becoming LCP). */
export const SPLASH_MAX_VISIBLE_MS = 700
