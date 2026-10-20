# ANANAS backend requirements

Market Pulse only renders numbers that already exist. These fields are missing from the Laravel responses checked on 2026-10-20 against `https://admin.anaanas.com`.

## Already used

| Endpoint | Fields used | Meaning in the UI |
|---|---|---|
| `GET /api/posts` | `total`, with `country_id`, optional `city_id`, `section_slug` | Published listings in that scope. Not "new today". |
| `GET /api/auctions?status=live` | `total`, optional `country_id`, `city_id` | Live auctions right now. |
| `GET /api/home/section-momentum` | `section_id`, `slug`, `name`, `current_count`, `previous_count`, `growth_percent` | Section movement. A percent is shown only when `previous_count > 0`. |
| `GET /api/countries` | `id`, `iso2` / `iso_code` | Listing currency. Matched by the listing's `country_id`, never by the viewer's selected country. |
| `GET /api/cities?country_id=` | `id`, `name` | City filter. |

`section-momentum` does not accept `city_id` or `section_slug`, and it does not return a window length. The UI must not label that window "30 days" or "today".

`GET /api/posts` ignores `created_from`, `since`, `period`, and `date_from`. The total does not change.

## Required before these Pulse cards can show a number

### New listings

```json
{
  "new_listings_count": 0,
  "window": { "key": "24h", "started_at": "ISO-8601", "ended_at": "ISO-8601" }
}
```

Do not derive this from `posts.total` or from the first page of results.

### Wanted requests

A real listing type, for example `post_type: "wanted"`, accepted by `POST /api/post` and filterable on `GET /api/posts`. Plus `wanted_count` for the same window object above.

### Nearby activity

A distance or coordinate filter on `GET /api/posts` (`lat`, `lng`, `radius_km`) and a count for that radius. City id is not nearby.

### Hot deals

An explicit, defined score. Featured posts (`GET /api/home/featured-posts`) are promotions and must not be labeled as heat, demand, or a price drop.

### Recently sold

A verified sale event, not a status guess:

```json
{
  "post_id": 0,
  "sold_at": "ISO-8601",
  "source": "seller_confirmed"
}
```

And `sold_count` for the active window.

### Personalized opportunities

A match endpoint tied to the signed-in user. No match list means the card stays hidden.

### Pulse alerts

A create/delete subscription endpoint. The UI must not pretend a bell saves an alert.

### Named time ranges

`window` or `period` on `section-momentum` and the count endpoints (`24h`, `7d`, `30d`), applied server-side. Disabled range options in the UI stay disabled until then.

## Currency

Listing payloads often send `country_id` and `country: null`. Currency must keep coming from that listing's country metadata. Do not add a shortcut that uses the portal country when the listing country is missing.
