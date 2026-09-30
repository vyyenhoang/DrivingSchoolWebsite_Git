# Public Star Driving School — Website

**Live site:** https://vyyenhoang.github.io/DrivingSchoolWebsite_Git/

Static marketing site with an online booking form for Public Star Driving School,
serving Scarborough, North York, Pickering, Ajax, Whitby and Oshawa.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site (hero, packages, why us, service areas, booking form, FAQ, footer) |
| `styles.css` | All styling, mobile-responsive |
| `script.js` | Pricing data, package tables, tabs, mobile nav, booking form submission |

## Editing prices and packages

All pricing lives in the `PRICING` object at the top of `script.js`.
The package cards, the G2 / G tables, and the booking form's package dropdown are
all generated from it, so you only change numbers in one place.

- `bde` — the three full-course tiers (name, price, feature bullets, which one is featured)
- `g2` — G2 hourly lessons and hours + road test bundles
- `g` — G hourly lessons and hours + road test bundles

Prices are entered **before HST**. Every price on the site shows "+ HST" and the 13% HST total, calculated automatically.

## Reviews

The Reviews section is hidden until you add entries to the `REVIEWS` list near the top of
`script.js`. Each entry has a name, a 1 to 5 rating, the review text, where it was posted,
and an optional date. There is a commented example in the file.

Only add reviews written for Public Star, or ones the student has agreed to let you reuse.
Once Public Star has its own Google Business Profile, put its reviews link in
`REVIEWS_CONFIG.googleReviewsUrl` to show a "Read more reviews on Google" button.

## Booking form

The form posts to [FormSubmit](https://formsubmit.co), which forwards each request as an
email to `publicstardrivingschool@gmail.com`. No server or account is needed.

**One-time activation:** the first time the form is submitted, FormSubmit sends an
activation email to that Gmail inbox. Click the link once and all future submissions
are delivered automatically. Until that is done, submissions are held.

**How to test:** open the live site, fill in the form with test details, and submit.
Within a minute an email should arrive at the booking inbox. Check the spam folder the
first time. If the site moves to a new domain, FormSubmit may ask to activate once more.

To change the destination address, edit `bookingEmail` in `CONFIG` in `script.js`.

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8765
```

Then visit http://localhost:8765.

## Deploying

The site is deployed automatically to GitHub Pages from the `main` branch: every push
to `main` updates https://vyyenhoang.github.io/DrivingSchoolWebsite_Git/ within a minute.

It is plain HTML/CSS/JS with no build step, so it can also be uploaded to any static
host (GitHub Pages, Netlify, Vercel, cPanel, etc.).
