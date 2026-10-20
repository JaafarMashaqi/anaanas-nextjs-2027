# ANANAS implementation log

Local commits only. Nothing here was pushed.

## Already on this branch before this batch

- `d1fe5d1` preview country cookie, no `jo.localhost` redirect.
- `294e58d` warm mobile recovery, sidebar flash removed, honest search.
- `8448acc` listing currency from the listing country, locale passed into relative time.
- `635a6a5` Market Pulse from live counts only.
- `4ff961c` navy and cloud shell.
- `9f13d88` pulse card opens a real activity drawer.

## This batch

Phase 0 docs added. Phase 1 slice shipped in the same app:

- Arabic relative time is generated in Arabic, then isolated with `<bdi>`, so a missing ICU locale cannot print reversed English.
- Listing stats render only for counts the payload actually has. Comments are not labeled as inquiries. Unknown views are not shown as a dash.
- Price gold sits on the baseline instead of through the digits.
- Composer shortcuts and intent stay hidden until the shell is expanded. Expanded subtitle is one sentence.
- Composer loading state matches the white shell instead of a gray Bootstrap placeholder.
- Daily update line wraps to two lines instead of cutting mid-word.
- Section stories and the wire use scroll snap and wider cards.
- Category wells no longer include a charcoal tile.
- Discovery keeps Latest, Photos, and By price in the primary row. Wanted, Nearby, and Following move under More and still explain that they do not filter.
- Featured anchor is labeled Featured, not Deals.
- Mobile nav links to home, search, market pulse (also sections, stores, auctions), messaging, and account settings. Auth screens do not show it. Desktop does not show it.

Not started: listing-detail redesign, stories as accounts, AI studio, memberships, maps, matches, Brain.
