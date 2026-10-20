# ANANAS visual acceptance

## Review of `294e58d` (before later commits)

Visual recovery was not complete. Warm cream and gold were visible. The desktop sidebar did not flash on a phone. Search was compact and honest. Remaining defects: clipped story labels, a truncated updates line, a composer that was almost as tall collapsed as expanded, a gray first-paint skeleton, a price underline through the digits, English time inside Arabic cards, and a row of zero stats.

Later commits moved the shell to navy and cloud and opened a real pulse drawer. Those commits did not by themselves finish the list above.

## This batch — what must be true in the running preview

- At 390 and 430, no horizontal page overflow and no desktop sidebar.
- The updates sentence is fully readable, wrapped, not cut mid-word.
- Story labels are not parked half outside the screen.
- Collapsed composer shows the prompt and title field only.
- After أبيع, the title is focused and Photos / Price / Location / Sell / Wanted appear.
- A feed card with no reactions does not show “0 تفاعل”.
- Arabic time reads as Arabic (`قبل …` or `الآن`), not `minutes ago`.
- A bottom nav is visible on mobile home and hidden from 992px up.
- English `/en` keeps LTR and the same nav labels in English.

If a screenshot fails one of these, the batch is not accepted.
