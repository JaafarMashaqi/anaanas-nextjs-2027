# ANANAS product restoration matrix

Sources actually opened: this conversation, the attached mobile references, and the current Next.js repository. Older Grok sessions and other branches were not available. Reference counts such as 12,850 online users are not live data.

| Requirement | Evidence | Current place | Missing | Priority | Backend | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Header, country, language | Spec 5.1 | Top header | Signed-in badges are not live counts | High | Existing country routes | Kept |
| Greeting above the header fold | Spec 5.2 | HomeMomentSlot | Rotating coffee/BYD moments are inside the hero, labeled as previews | High | Session name only | Verified: starts at 76px, scroll 0 |
| One search, tools inside | Spec 5.3, screenshots | MobileHeaderSearchBar | Photo and chat search are not connected | High | Keyword search works | Verified on the page |
| Quick actions | Spec 5.4 | HomeUpperStage | Map and matches have no service | High | None for map/matches | Honest unavailable note |
| Stories | Spec 5.5 | MarketplaceStories | No stories API, no real follows, no live stream | High | Stories service | Category previews only |
| Market wire | Spec 5.6 | HomeUpperStage | Sold counts and buyer demand | High | /api/home/latest-listings | Verified: 8 real titles, labeled not sales |
| Amman hero, one campaign frame | Spec 5.7 and 06 | HomeBanner | Separate scheduling service | High | /api/home/sliders | One frame. Daily banner hidden on home |
| Market pulse | Spec 5.8 | MarketPulseCardClient | Online, searching, featured, sold | High | posts, auctions, sections | Rail is live figures only |
| Composer | Spec 07 | CreatePostCard | Full social studio and real AI pricing | Next | Existing publish flow | Not rebuilt this phase |
| Social cards, reels, live, following | Spec 08–10 | Feeds and later routes | Most of the reference feed | Next | Several missing endpoints | Not rebuilt this phase |
| Mascot family | Spec 11 | Existing pineapple assets | Distinct category characters | Later | Art, not an API | Not newly drawn |
