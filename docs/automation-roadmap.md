# ExamPath automation roadmap

## Purpose

ExamPath helps parents and students find entrance exams, admissions, and official application links in one place.

## Current implementation

- `data/exams.json` contains the initial exam catalog.
- `data/sources.json` contains the first priority official sources.
- `scripts/check-admissions.js` fetches enabled source pages and stores SHA-256 hashes.
- `data/source-state.json` stores the latest check result for each source.
- `.github/workflows/check-admissions.yml` runs the checker daily at 06:00 UTC and commits state changes.

## How the monitoring works

```text
Official source page
        ↓
Scheduled GitHub Action
        ↓
Fetch page and calculate hash
        ↓
Compare with previous hash
        ↓
Record changed / unchanged / error
        ↓
Manual review before publishing admission data
```

The checker detects that a page changed. It does not claim that a deadline or admission date changed. A human must review the official page before editing `data/opportunities.json`.

## Local test

Use Node.js 20 or newer:

```bash
node scripts/check-admissions.js
```

Then inspect:

```text
data/source-state.json
```

The first successful run will normally mark sources as `changed` because no earlier hash exists. Later runs should mark unchanged pages as `unchanged`.

## Adding a new source

1. Confirm that the URL is an official organization or exam website.
2. Add an entry to `data/sources.json`.
3. Add the related exam IDs in `exam_ids`.
4. Set `enabled` to `true` only after checking the URL manually.
5. Run the checker locally.
6. Review the state output and workflow logs.

Example:

```json
{
  "id": "src-example-exam",
  "exam_ids": ["example-exam"],
  "name": "Example Exam Official Website",
  "source_type": "OFFICIAL_WEBSITE",
  "organization": "Example Authority",
  "url": "https://example.gov.in/",
  "enabled": true,
  "last_verified": null
}
```

## Review rules

- Do not automatically publish scraped dates.
- Verify deadline, exam date, eligibility, and application links on the official page.
- Record the date of manual verification in the relevant opportunity record.
- Keep the official source link visible to users.
- Treat a source error as a maintenance task, not as proof that an exam is closed.

## GitHub Actions requirements

The workflow uses `contents: write` so it can commit `data/source-state.json`. If pushes fail, check repository Actions settings and ensure the workflow has permission to write repository contents.

## Next phases

1. Add parent-friendly filters for category, level, type, state, and status.
2. Add a pending-review file or issue workflow for changed sources.
3. Add source-specific parsers one website at a time.
4. Add deadline reminders only after the data review process is reliable.
