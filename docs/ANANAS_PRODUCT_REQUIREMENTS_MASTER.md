# ANANAS product requirements (working baseline)

This file records the requirements that can be verified in the current Next.js app. It is not a claim that every item is built.

| ID | Priority | Requirement | Data dependency | Status |
|---|---|---|---|---|
| P0-SCROLL | P0 | A fresh visit to `/ar` stays at scroll 0. Nothing focuses the composer on load. | None | Fixed in the feed layout. Verified signed-out. |
| P0-HEADER | P0 | The fixed header must not cover the greeting. | None | The old `header + main` rule did not match the real DOM. Feed pages now reserve 80px / 76px. |
| HDR-COUNTRY | P0 | Country selector with a map pin, connected to the country switch. | Country API | Present. City is not. |
| HDR-CITY | P1 | City selector tied to the country hierarchy. | City API and listing filters | Missing. Not faked. |
| HDR-LANG | P1 | Arabic, English, Turkish, French, Spanish, Simplified Chinese. | Dictionaries | Arabic and English are routed. The other four are planned, not translated. |
| GREET | P0 | Time-of-day greeting, guest fallback, signed-in name, sun or moon, mascot. | Session name | Greeting stays on screen. It no longer rotates into invented brands. |
| CAMP | P1 | One campaign slot. Partner creative only when a campaign record exists. | Sliders API | Admin slider remains. Coffee, BYD, and Qatar are not shown as live partnerships. |
| SEARCH | P0 | One search field. Detective, microphone, camera, and chat sit inside it. | Sections, cities, device history | Tools are inside the field. Photo and chat are labeled not connected. |
| ACTIONS | P1 | Sell, wanted, map, matches. | Composer; map and match services | Sell and wanted open the existing composer. Map and matches say they are not connected. |
| STORIES | P1 | Stories above the Amman hero. Drafts are not public posts. | No story service | Demo stories, labeled by the component. Viewer works locally. |
| HERO | P0 | Amman identity hero stays. | Local artwork | Present. |
| PULSE | P1 | Compact live counts. Unavailable metrics are not presented as numbers. | Listings, sections, auctions | Three live counts. The rest is in Details. |
| EVENTS | P2 | Auction and demand events with a real source. | Event API | Not built. A trending title is not called an AI opportunity. |
| COMPOSER | P1 | Existing publish flow. No second publisher. No validation on an empty first paint. | Laravel post API | Existing wizard. Compact tools restored. |
| SOCIAL | P2 | Social listing cards with real seller, price, and actions. | Post API | Original cards remain. Not redesigned in this wave. |
