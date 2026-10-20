# Backend requirements that the UI must not invent

| Need | Why | Until it exists |
|---|---|---|
| Online users | Pulse must not show a fake online count | Hidden from the rail. Details says unavailable. |
| Active searches | Same | Same |
| New listings today | The listings endpoint does not return a fresh count | Not shown as a number |
| Wanted requests | No wanted-post type in the publish API | The wanted button opens the composer and says it does not create a server type |
| Hot deals, sold, live broadcasts | No verified feed | Not shown as numbers |
| City list under a country | The header can switch country, not city | No city control |
| Partner campaigns | Sliders API is the only campaign source | Coffee, BYD, and Qatar stay out of the rotation |
| Photo search and chat search | No recognition service | Buttons explain that they are not connected |
| Story publish | No story endpoint | Local demo stories only |
| Map and matches | No geo or match service | Buttons explain that |
| Auction ending-soon events | Auction count exists. Per-auction deadlines are not wired to the home event slot | No urgent alert on open |
| Six languages | Dictionaries for tr, fr, es, zh-CN do not exist | Routes stay ar and en |
