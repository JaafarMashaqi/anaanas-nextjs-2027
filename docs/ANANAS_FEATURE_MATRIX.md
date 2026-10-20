# ANANAS feature matrix

Inspected in the original Next.js app. Status is what the code does today, not the vision.

| Feature | User value | Code | Status | Data | Priority | Acceptance | Verified |
|---|---|---|---|---|---|---|---|
| Country preview routing | Jordan stays on this origin | `lib/preview/countryMode.ts`, middleware | working | cookie `ananas_country_pref` | — | `?ananas_country=` does not send the browser to `jo.localhost` | prior runtime |
| Auth | Sign in and account | `auth.ts`, `app/api/auth` | working | Laravel login | — | Credentials hit `/api/auth/login` | code |
| Header, language, country | Switch locale and market | `TopHeader` | working | countries API | — | AR RTL and EN LTR | prior screenshots |
| Greeting | Time of day plus the real country | `HomeUpperStage.tsx` | working | local clock + country label | — | Restored Next Generation greeting. No invented visitor counts | this batch |
| Section stories | Jump to a real section, plus an honest add action | `HomeUpperStage` stories | partial | sections API | P1 | Add opens the composer and does not publish a public story | this batch |
| Market wire | Real trending titles in the restored rail | `fetchTrendingPosts` | working | trending endpoint | P3 | Titles from the server. No invented price-drop counts | this batch |
| Identity hero | Restored Amman platform still | `public/brand/hero.jpg` from previous Next Generation | working | previous project asset, not live partner data | — | CMS slider in `HomeBanner` remains below it | this batch |
| Market Pulse 4.0 | Compact colored rail | `buildMarketPulse.ts`, `MarketPulseCardClient.tsx` | LIVE counts for published listings, auctions, and section activity. DEMO panels for new listings, wanted, and opportunities, with no fabricated totals. PLANNED sold count until a confirmed sale event exists. | posts, auctions, section-momentum | P3 | Rail colors match the previous pulse. Tapping a demo card still opens the labeled studio | this batch |
| Smart search | Find real sections and routes | `SmartSearchPanel.tsx` | partial | sections, local recents | P1 | Escape, second tap, back close. No volume | prior runtime |
| Camera / voice search | Visual and spoken intent | — | missing | none | P6 | Hidden until an API exists | code |
| أبيع | Open the real composer | `HomeUpperStage.tsx`, `CreatePostCard.tsx` | working | `POST /api/post` | — | Focuses `#create-post-title` | prior runtime |
| مطلوب الآن | Prepare a wanted title | composer intent | UI-only | no wanted type | P6 | Disclaimer stays visible when expanded | code |
| الخريطة / المطابقات | Local map and matches | quick actions | blocked | none | P6 | Buttons explain that they are not connected | code |
| Smart composer 2.0 | Publish or rehearse | `CreatePostCard.tsx`, `AdStudioDemo.tsx` | LIVE sell path still uses `/api/post`. Wanted and auction are DEMO drafts in sessionStorage and never claim a publish. Advanced studio says no model calculates an outcome. | original wizard | P4 | أبيع still focuses the title. Wanted save says it was not published. | this batch |
| Listing card 2.0 | Readable social post | `PostCard.tsx`, `plainListingText.ts` | LIVE data. Long titles are shortened only on the card. Repeated captions are hidden. Currency and Arabic time stay. | post payload | P5 | A long Arabic title does not repeat in the caption. No invented stats. | this batch |
| Hero banner | Campaign creative from the CMS | `HomeBanner.tsx` | working | existing banners | — | Original slider remains under the identity hero | prior screenshots |
| AI ad studio | Pricing, demand, quality | `AdStudioDemo.tsx` | DEMO | none | P9 | Copy says no model calculates an outcome | this batch |
| AI ad studio | Pricing, demand, quality | cipher chips | UI-only | none | P9 | Copy says the tools are not connected | code |
| Discovery tabs | Latest, photos, price filter. Wanted, nearby, following do not. Auctions, trending, and deals jump to real places | `HomeFeedTabs.tsx`, `page.tsx` | working | posts filters, auction route, featured strip, wire | P1 | Non-live tabs explain that the list is still the latest listings | this batch |
| Featured strip | Promoted listings | `FeaturedPostsStrip.tsx` | working | featured posts | — | Not labeled as heat or demand | code |
| Reactions and comments | Respond to a listing | post API routes | LIVE | Laravel | — | Counts render only when greater than zero | code |
| Reactions and comments | Respond to a listing | post API routes | working | Laravel | — | Counts render only when greater than zero | code |
| Save listing | Come back later | — | missing | no saved-listings API found | P6 | Do not fake a bookmark | code |
| Phone / inquiry | Contact the seller | card actions | partial | phone on the post when present | — | Existing actions stay | code |
| Auctions | Bid on live auctions | `pages/auction` | working | auctions API | P7 | Reachable from search and the market tab | code |
| Stores | Seller storefronts | `stores` | working | stores API | P7 | Route remains | code |
| Messaging | Buyer and seller chat | `messaging` | working | `/api/chats` | — | Mobile frame clears the new nav | this batch |
| Notifications | Activity alerts | `notifications` | working | notifications API | — | Header bell remains | code |
| Bottom nav | Move through the product | `MobileProductNav.tsx` | partial | existing routes | P1 | Home, Explore, Market, Messages, Account. Hidden on auth and desktop | this batch |
| Memberships | Paid growth tools | promotion packages only | partial | promotion quote | P8 | No Gold/Pro/Elite claims | code |
| Opportunity engine | Visible-market prompt without a personal counter | `HomeUpperStage` opportunity link | partial | search route | P9 | Says there is no personal counter. Opens real search | this batch |
| ANANAS Brain | Founder intelligence | — | missing | none | P10 | Not public | code |

Screenshot evidence for this batch is under `/workspace/artifacts/phase1-product-nav/` when the preview capture succeeds.
