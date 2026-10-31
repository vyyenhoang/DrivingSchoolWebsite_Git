# SEO and AI search setup: report

Public Star Driving School, publicstardrivingschool.com. October 30, 2026.

## Summary

The site now has a blog with three guides, files that AI assistants (ChatGPT, Claude,
Perplexity, Gemini) can read directly, FAQ structured data for Google, and a daily
task that checks the site's SEO and publishes one new guide each morning. Every em
dash and en dash has been removed from the site.

**Status: built and checked locally, not live yet.** Nothing has been committed or
pushed, because another Claude session is editing the same files (online payments).
Once that session commits, these changes get committed and pushed, and the live
site updates within a minute.

## What was done

### 1. AI search files (the main priority)

| File | What it does |
| --- | --- |
| `/llms.txt` | Short map of the business for AI assistants, following the llmstxt.org format: who we are, key facts, prices, service areas, and links to every guide. |
| `/llms-full.txt` | Everything in one plain text file: all prices with HST totals, all FAQs and the full text of every guide. AI tools can quote it without reading the page layout. |
| `/blog/posts/*.md` | Each guide is also served as plain Markdown, linked from llms.txt. |
| `/robots.txt` | Welcomes Google, Bing and AI crawlers by name (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended) and points to the sitemap. |
| Quick answer boxes | Every guide opens with a two or three sentence answer with real numbers. AI Overviews and assistants tend to quote this kind of block. |

### 2. Google SEO

- **Blog** at `/blog/` with three guides targeting high-intent questions:
  - How Much Do Driving Lessons Cost in Ontario? 2026 Price Guide
  - How to Pass Your G2 Road Test on the First Try in Ontario
  - Is the BDE Course Worth It in Ontario? Cost, Insurance and the 8-Month Rule
- **Structured data:** BlogPosting, breadcrumbs and FAQPage on every guide; FAQPage
  added to the homepage (kept in sync with the visible FAQ automatically);
  opening hours and a description added to the business listing.
- **Homepage:** new title "Driving Lessons Ajax & Scarborough | Public Star Driving
  School", shorter meta description, canonical link, a "Guides" menu link and a
  "Driving Guides" section showing the three newest posts.
- **sitemap.xml** and an **RSS feed** at `/blog/feed.xml`, regenerated on every build.
- **Facts checked:** DriveTest fees ($53.75 G2 test, $91.25 G test, $159.75 G1
  package) and the 12 month G1 wait (8 with BDE) were checked against current sources.
  Lesson prices are read straight from the site's price list, so they never drift.

### 3. Em dashes removed

All em dashes and en dashes were replaced across the homepage, booking form
time options, scripts, styles, README and the booking email script. The build stops
if a new post contains one, and the daily check reports any that appear.

### 4. Keyword plan

`seo/keywords.md` lists the money keywords (driving school Ajax, driving lessons
Scarborough, G2 lessons, BDE course), the questions people ask AI assistants, and a
queue of 27 more guide topics: G test highway tips, automatic fails, each DriveTest
centre, one page per city, licence conversion, road test anxiety and more.

No paid keyword tool is connected, so the list is built from common search
questions and local intent, not measured search volume. Search Console data will
replace guesswork with real queries.

### 5. Daily automation

- **Task:** "Public Star daily SEO + blog", every day at about 7:10 AM.
- **What it does:** pulls the latest code, runs the SEO check against the live site,
  fixes errors, writes one new guide from the queue, rebuilds, rechecks, then
  commits and pushes so it goes live.
- **Rules it follows** (`seo/DAILY.md`): no invented stats or reviews, Ontario
  facts only from ontario.ca or drivetest.ca, prices only from the site's price
  list, Canadian spelling, no dashes, never touches someone else's unsaved changes.
- **Logs:** each day's check is saved in `seo/reports/`.
- Runs while the Claude app is open. If the computer is off at 7 AM, it runs the
  next time the app opens.

## Current results

| Check | Result |
| --- | --- |
| Local SEO check | 0 errors, 0 warnings |
| Pages | Homepage, blog index, 3 guides |
| Em or en dashes in site files | 0 |
| Browser test | Desktop, tablet and phone layouts checked, no console errors, no sideways scrolling on phones |
| Live site | Not updated yet: blog, llms.txt and robots.txt return 404 until pushed |

Rankings and traffic cannot be measured yet. New pages usually take a few days to
a few weeks to be indexed.

## Waiting on you

1. **OK to commit and push** once the payments session finishes.
2. **Google Search Console:** add access for the site, then submit
   `https://publicstardrivingschool.com/sitemap.xml` under Sitemaps.
3. **Weekly report:** set up to email vy.yen.hoang@gmail.com every Monday morning
   (guides published, SEO check results, issues fixed). Search Console clicks,
   impressions and top queries are added once Search Console access is connected.
4. **Google Business Profile:** linking it from the site is the biggest single boost
   for "driving school near me" searches.

## How to run things by hand

```bash
python tools/build_site.py
python tools/seo_check.py --live
```
