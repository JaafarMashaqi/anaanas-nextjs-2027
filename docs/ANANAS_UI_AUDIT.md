# ANANAS homepage ownership

Updated for the live Next.js app. This is a map, not a claim that every Next Generation screen is finished.

## Homepage order

| Order | What the visitor sees | Owner |
|---|---|---|
| 1 | Sticky header: menu, account, language, country | `components/layout/TopHeader/mobile/MobileTopHeader.tsx` |
| 2 | One greeting / product / concept slot | `home/components/HomeMomentSlot.tsx` |
| 3 | Search, detective mascot, voice / photo / chat notes | `TopHeader/mobile/MobileHeaderSearchBar.tsx` |
| 4 | Sell, wanted, map, matches | `home/components/HomeUpperStage.tsx` |
| 5 | Demo stories | `home/components/MarketplaceStories.tsx` |
| 6 | Amman hero | `HomeUpperStage.tsx` + `/brand/hero.jpg` |
| 7 | Market Pulse rail | `MarketPulseCardClient.tsx` |
| 8 | One trending opportunity | `home/components/HomeOpportunitySlot.tsx` |
| 9 | Category mascots | `MobileSectionsSwiper.tsx` |
| 10 | Composer | `CreatePostCard.tsx` |
| 11 | CMS sliders, if the API returns any | `HomeBanner.tsx` |
| 12 | Latest, featured, discovery tabs, feed | `page.tsx`, `Feeds.tsx`, `PostCard.tsx` |

The daily-updates banner is hidden on `/{ar|en}` so it does not repeat the product line. It still shows on other pages.

## Duplication that was removed from the home stack

- A second search field in the sticky header on the home route.
- The daily-updates pill beside the greeting.
- A stack of demo opportunity chips under a separate “الفرص تتحرك الآن” heading.
- A second Market Pulse card in the desktop sidebar.

`HomeConceptSequence.tsx` still exists and is not mounted. The moment slot owns those three concepts and labels them as concepts.

## Not the same thing

- Stories are a labeled demo. They are not the category circles.
- Category circles are real sections.
- Featured posts are promotions, not hot deals.
- Trending titles are server titles, not a personal match.

## Still missing as product surfaces

Video reels, a following feed, live selling sessions, a real story API, and routes for Turkish, French, and Spanish. The sixth language is not chosen.
