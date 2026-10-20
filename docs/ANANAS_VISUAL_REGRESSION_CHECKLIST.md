# Visual regression checklist

Run these on the live preview. Do not mark a row from memory.

| Check | 1440 | 390 | Notes |
|---|---|---|---|
| scrollY is 0 on fresh `/ar` | Pass | Pass | Signed out. Signed-in not retested this wave. |
| Focus is not the composer | Pass | Pass | `document.activeElement` is body |
| Greeting is below the header | Pass | Pass | 80px and 76px padding |
| One search, tools inside | Pass | Pass | Field height 42px |
| No horizontal overflow | Pass | Pass | |
| Stories above hero | Pass on the previous build | Pass on the previous build | Not re-measured after the padding change |
| No application error | Pass | Pass | |
| 360, 430, 768, 1024, 1600 | Not run | Not run | |
| Signed-in composer | Not run | Not run | |
| Locale switch ar to en | Not run this wave | Not run this wave | |
| Back navigation | Not run | Not run | |
