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
| Composer | Spec 07 | CreatePostCard and AdStudioDemo | Video upload, paid plans, real demand | High | Existing publish API. Photo step is real. | The studio writes the description into the real form. Continue opens the real photo step. Local image names are previews only. Plans other than free are not connected. |
| Social cards | Spec 08 | PostCard listingCard | Follow, offer, wanted variant, opportunity score | High | Reactions and comments already on the post API | Feed image capped and cropped. Stock collage removed from the feed. |
| Arabic type | Spec 11 | app/layout.tsx | A custom Noon face is not licensed | High | None | IBM Plex Sans Arabic, SIL Open Font License, on the Arabic UI. |
| Stories characters | Spec 04 | MarketplaceStories | Greeting, coffee, and auction characters still need original art | High | Section icons from /api/sections | Stories use those category illustrations, not the sunglasses pineapple. |
