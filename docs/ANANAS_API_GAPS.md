# ANANAS API gaps

Checked against the frontend and `docs/ANANAS_BACKEND_REQUIREMENTS.md`. Base URL in this preview is `https://admin.anaanas.com`. `api.anaanas.com` is not the working host.

## Connected

| Need | Endpoint | Notes |
|---|---|---|
| Listings | `GET /api/posts` | `country_id`, images, price sort |
| Create / update | `POST /api/post` and the posts update route | No wanted type |
| Latest rail | `GET /api/home/latest-listings` | Includes a display `currency` and `is_new` |
| Auctions count | `GET /api/auctions?status=live` | Pulse uses `total` |
| Section movement | `GET /api/home/section-momentum` | Percent only if `previous_count > 0` |
| Countries | `GET /api/countries` | Currency from the listing `country_id`, never the viewer’s country |
| Auth | `POST /api/auth/login` via next-auth | |
| Reactions, comments, report | `/api/posts/:id/...` | |
| Chats | `/api/chats` | |
| Notifications | `/api/notifications` | |
| Promotion | `/api/promotion/...` | Packages and PayPal return |
| Follows | sections and categories | Not people |

A sampled `GET /api/posts?country_id=111` row had `country_id: 111` and `price`, and no `currency` string. Currency is derived from country id `111` → JO → JOD.

## Not connected — do not fake

- Wanted listing type and wanted counts.
- Nearby radius (`lat`, `lng`, `radius_km`).
- New-listings count with a named window. `is_new` on a short list is not that count.
- Sold / “تم البيع عبر أناناس”.
- Opportunity scores, demand forecast, smart pricing, audience, best time, price history.
- Saved searches, saved listings, price-drop alerts.
- Camera search and voice search.
- Real account stories, expiration, and replies.
- Map.
- Buyer/seller matches.
- Memberships (Gold, Pro, Elite) and campaign outcomes.
- ANANAS Brain metrics.

`GET /api/posts` ignores `created_from`, `since`, `period`, and `date_from`.
