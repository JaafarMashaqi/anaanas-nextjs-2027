# ANANAS product restoration matrix

Sources actually opened: this conversation, the attached mobile references, and the current Next.js repository. Older Grok sessions and other branches were not available. Reference counts such as 12,850 online users are not live data.

| Requirement | Evidence | Current place | Missing | Priority | Backend | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Header, country, language | Spec 03 | MobileTopHeader | Unread counts for guests | High | Notifications and messaging routes | Bell and messages stay visible when signed out. Login remains an icon. |
| Greeting above the header fold | Experience timeline | HomeMomentSlot | Gulf clothing artwork | High | No store coordinates | Greeting, then a labeled coffee moment, then a market line. Pauses on hover. |
| One search, tools inside | Spec 5.3, screenshots | MobileHeaderSearchBar | Photo and chat search are not connected | High | Keyword search works | Verified on the page |
| Quick actions | Spec 5.4 | HomeUpperStage | Map and matches have no service | High | None for map/matches | Honest unavailable note |
| Stories | Spec 5.5 | MarketplaceStories | No stories API, no real follows, no live stream | High | Stories service | Category previews only |
| Market wire | Experience lab | demoMarketEvents | Confirmed events | High | No event stream | Demo events, labeled. A link remains to the real latest listings. |
| Amman hero, one campaign frame | Spec 5.7 and 06 | HomeBanner | Separate scheduling service | High | /api/home/sliders | One frame. Daily banner hidden on home |
| Market pulse | Experience lab | buildMarketPulse | Live presence and sales | High | Listings and auctions are live | Real published and auction counts, plus marked demo figures. |
| Discovery | Spec 09 | HomeDiscoveryRail | Video, live, nearby, follow, wanted services | High | Auctions, stores, and search are live routes | Live chips open those pages. Demo chips explain the missing service. |
| Golden moment | Spec 6 | HomeGoldenMoment | Real buyer matching | High | No demand match | One labeled sample, hidden for 24 hours after dismiss. |
| Studio media | Spec 10 | AdStudioDemo and WizardPostPhotosStep | Video and voice | High | The existing photo upload, max 5, JPEG/PNG/WebP, 5 MB | Studio thumbnails are the same File list the photo step uploads. They are not published until that step succeeds. |
| Studio journey | Spec 10 | StudioJourney | Video, voice, area, and condition are not sent | High | Existing publish form for section, category, city, price, photos, and option attributes | Six steps: story, place, photos, offer, labeled simulation, unpublished preview. Sale continues into the real photo step. Section changes keep city and price. Country changes clear the city. |
| Desktop columns | Spec 16 | feedHomeGrid.module.css | Pulse stays in the center so phones still see it | High | Existing side navigation and insight rail | From 1280px the home row is three tracks with the feed capped at 680px. Below that, the profile column sits beside the feed and the insight rail moves under it. |
| Historical phase-11 | docs/ANANAS_FEATURE_REGISTRY.md | Current Next.js app | Keep approved items, leave rejected HP-019 unmounted | Read | Branch integration/phase-11 was listed and its registry headings were read | The old app is a reference. It was not copied over this codebase. |
| Experience rooms | Spec 06 | /live /reels /matching /intelligence /seller /business /assistant | Deeper video and lead systems | High | Auctions, stores, and search stay real | Discover opens these rooms. Figures and sessions are labeled demos. |
| Header language | Spec 02 | LocaleDropdown | Turkish, Spanish, Chinese, and French dictionaries | High | Arabic and English routes | One header language control. The other four names are saved as a preference and do not open an untranslated page. Country is no longer in the header. |
| Intelligence | Spec 10 | AdStudioDemo | Demand, price advice, best hour | High | None | Reach is budget × days × 40, and the 40 is a fixed interface constant. No price is suggested. |
| Characters | Spec 04 | docs only | Greeting, coffee, auction, commerce art | Later | Original art | Do not reuse the sunglasses pineapple. Specs stay open until approved drawings exist. |
| Social cards | Spec 08 | PostCard listingCard | Follow, offer, wanted variant, opportunity score | High | Reactions and comments already on the post API | Feed image capped and cropped. Stock collage removed from the feed. |
| Arabic type | Spec 11 | app/layout.tsx | A custom Noon face is not licensed | High | None | IBM Plex Sans Arabic, SIL Open Font License, on the Arabic UI. |
| Stories characters | Spec 04 | MarketplaceStories | Greeting, coffee, and auction characters still need original art | High | Section icons from /api/sections | Stories use those category illustrations, not the sunglasses pineapple. |
