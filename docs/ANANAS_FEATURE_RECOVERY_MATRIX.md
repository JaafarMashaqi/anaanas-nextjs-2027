# Feature recovery matrix

Evidence is from the running app on 21 Oct 2026, signed out, `/ar`, viewports 1440×900 and 390×844.

| ID | Component | Status | Desktop | Mobile | Acceptance check | Evidence |
|---|---|---|---|---|---|---|
| P0-SCROLL | `ScrollToTopOnRoute`, composer focus | Implemented and verified | scrollY stays 0, focus stays on body | same | Fresh load does not move | Measured after load and again 1.8s later |
| P0-HEADER | `FeedLayoutClient` | Implemented and verified | Greeting starts at 80px, header ends at 56px | Greeting at 76px, header ends at 63px | Greeting is not covered | `getBoundingClientRect` |
| SEARCH | `MobileHeaderSearchBar` | Implemented, partial intelligence | One 42px field, 3 tools inside | same, no sideways overflow | Tools are not a second button row | `iconsInSearch: 4` including the hidden submit |
| GREET | `HomeMomentSlot` | Implemented and verified | Visible, does not rotate away | same | Hello stays put | Text: مساء الخير / الأردن |
| STORIES | `MarketplaceStories` | Partial | Above the hero | Above the hero | Not a public story API | Earlier order check still held |
| HERO | `HomeUpperStage` | Implemented | Amman image kept | kept | Not replaced by the admin slider | Separate nodes |
| PULSE | `MarketPulseCardClient` | Partial | Live counts only | same | No invented online or hot-deal numbers | 66645 listings, 6 sections, 0 auctions |
| CAMP | `HomeBanner` | Partial | Admin images from the API, own aspect ratio | same | Not a second full-height hero | Prior measurement 875×291 |
| CITY | none | Missing | — | — | Do not invent a city | Country dropdown only |
| I18N | `localization.ts` | Partial | ar, en | ar, en | Do not route unfinished locales | Planned list is not exposed as routes |
| EVENTS | none | Backend dependency | — | — | No fake demand alerts | Not rendered |
| COMPOSER | `CreatePostCard` | Partial | Existing wizard, no mount error | same | Focus does not scroll the page | `preventScroll: true` |
