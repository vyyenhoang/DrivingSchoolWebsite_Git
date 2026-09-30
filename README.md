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

Booking requests are emailed to `publicstardrivingschool@gmail.com`. The site has no
server, so a free form-to-email service does the sending.

### Recommended: Web3Forms (one-time, about 2 minutes)

1. Go to https://web3forms.com and enter `publicstardrivingschool@gmail.com` under
   "Create your Access Key". No account or password is needed.
2. Open the email Web3Forms sends to that inbox and copy the access key.
3. Paste it into `web3formsKey` in `CONFIG` at the top of `script.js`, then commit and push.

The free plan covers 250 bookings a month.

### Fallback: FormSubmit

While `web3formsKey` is empty, the form uses FormSubmit instead. FormSubmit sends an
activation email on the first submission, and that link must be clicked once. In testing on
2026-09-30 its submission endpoint was timing out and returning server errors, so
Web3Forms is the more dependable choice.

### How to test

Open the live site, fill in the form with test details, and press "Send Booking Request".

- A green "Thanks!" message means the service accepted it. The email should arrive within
  a minute. Check the spam folder the first time.
- A red "Sorry, something went wrong" message means the service rejected it or did not
  answer within 20 seconds. The message tells the student to call or email instead.

To change the destination address, edit `bookingEmail` in `CONFIG` in `script.js`
(and create a new Web3Forms key for the new address).

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
