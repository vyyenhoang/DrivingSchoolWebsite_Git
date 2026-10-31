# Daily SEO check and blog post

The scheduled task "Public Star daily SEO + blog" follows these steps every day.
You can also run it by hand: open Claude in this folder and say
"follow seo/DAILY.md".

## 1. Start clean

- `git pull` on `main`. If the working tree has changes you did not make, do not
  touch or commit them; only stage the files listed in step 5.

## 2. Health check

- Run `python tools/build_site.py`, then `python tools/seo_check.py --live --report seo/reports/<today>.md`.
- Fix every **error** it reports. Fix warnings when the fix is small and safe.
- Never change prices, phone numbers, addresses or reviews to make a check pass.
  Those come from the owner. Note them in the report instead.

## 3. Write one new guide

- Take the first unchecked topic in `seo/keywords.md`. If Search Console data is
  in `seo/search-console/`, prefer a query with impressions but a low click rate.
- Create `blog/posts/<slug>.md`. Copy the front matter of an existing post:
  `title`, `seo_title` (60 characters or fewer), `description` (120 to 160
  characters), `date` (today), `keywords` (main keyword first), `answer`.
- **Quick answer** (`answer`): two or three sentences that fully answer the title
  question with concrete numbers. AI assistants quote this part.
- Body: 900 to 1,400 words. Short paragraphs, `##` sections phrased the way people
  search, at least one list or table, and a `## Frequently asked questions`
  section with 3 to 5 `###` questions and short answers.
- Link to at least two other guides (`/blog/<slug>/`) and mention the cities we
  serve where it fits naturally. Then add a link back to the new guide from one
  older guide where it fits.
- Use prices only from `PRICING` in `script.js` (total = price x 1.13).
- **Facts:** only state Ontario rules and DriveTest fees you can confirm on
  ontario.ca or drivetest.ca today. If unsure, leave it out or tell readers to
  check drivetest.ca. Never invent pass rates, statistics, reviews or quotes.
- **Style:** Canadian spelling (licence, centre, practise as a verb). Plain,
  friendly, second person. **No em dashes or en dashes**; use a comma, colon,
  period or "to". The build stops if it finds one.
- Tick the topic off in `seo/keywords.md`.

## 4. Rebuild and recheck

- `python tools/build_site.py`, then `python tools/seo_check.py`. It must show 0 errors.

## 5. Publish

- Stage only: `blog/`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `index.html`,
  `seo/`, plus any file you fixed in step 2.
- Commit as "Add guide: <title>" (or "SEO fixes" if no post), push to `main`.
  GitHub Pages publishes within a minute.
- After a minute, open the new guide's live URL and confirm it loads.

## 6. Report

Finish with a short summary: the guide published (title and URL), errors fixed,
warnings left, and anything that needs the owner.
