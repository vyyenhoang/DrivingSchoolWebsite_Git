# Public Star Driving School — Website

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

Prices are entered **before HST**; the "with HST" totals are calculated automatically.

## Booking form

The form posts to [FormSubmit](https://formsubmit.co), which forwards each request as an
email to `publicstardrivingschool@gmail.com`. No server or account is needed.

**One-time activation:** the first time the form is submitted, FormSubmit sends an
activation email to that Gmail inbox. Click the link once and all future submissions
are delivered automatically. Until that is done, submissions are held.

To change the destination address, edit `bookingEmail` in `CONFIG` in `script.js`.

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8765
```

Then visit http://localhost:8765.

## Deploying

The site is plain HTML/CSS/JS with no build step. Upload the three files to any static
host (GitHub Pages, Netlify, Vercel, cPanel, etc.).
