# Public Star Driving School — Website

**Live site:** https://publicstardrivingschool.com/

Static marketing site with an online booking form for Public Star Driving School,
serving Scarborough, North York, Pickering, Ajax, Whitby and Oshawa.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site (hero, packages, why us, service areas, booking form, FAQ, footer) |
| `styles.css` | All styling, mobile-responsive |
| `script.js` | Pricing data, package tables, tabs, mobile nav, booking form submission |
| `google-apps-script/` | Script that emails bookings from the business Gmail and logs them to a Google Sheet |
| `assets/` | Logo files: full logo, star emblem (green and light versions), browser icons, link-preview image |

## Editing prices and packages

All pricing lives in the `PRICING` object at the top of `script.js`.
The package cards, the G2 / G tables, and the booking form's package dropdown are
all generated from it, so you only change numbers in one place.

- `bde` — the three full-course tiers (name, price, feature bullets, which one is featured)
- `g2` — G2 hourly lessons and hours + road test bundles
- `g` — G hourly lessons and hours + road test bundles

Prices are entered **before HST**. Every price on the site shows "+ HST" and the 13% HST total, calculated automatically.

## Reviews

The Reviews section always shows. While the `REVIEWS` list near the top of `script.js` is
empty, it shows a "Leave a review" message. Add entries to the list near the top of
`script.js`. Each entry has a name, a 1 to 5 rating, the review text, where it was posted,
and an optional date. There is a commented example in the file.

Only add reviews written for Public Star, or ones the student has agreed to let you reuse.
Once Public Star has its own Google Business Profile, put its reviews link in
`REVIEWS_CONFIG.googleReviewsUrl` to show a "Read more reviews on Google" button.

## Booking form

The site has no server, so booking requests are handed to a service that emails them.
`CONFIG` at the top of `script.js` picks the service. The first one that is filled in wins:

1. `appsScriptUrl`: a Google Apps Script running in the business Gmail account (recommended)
2. `web3formsKey`: Web3Forms, which emails whatever address the key was created with
3. Neither: FormSubmit to `bookingEmail`, which was unreliable in testing

Web3Forms recorded bookings in its dashboard, but its emails did not reach Gmail. The Apps
Script sends each booking from publicstardrivingschool@gmail.com to itself, which Gmail
trusts, and also adds it as a row in a Google Sheet.

### Setting up the Google Apps Script (one time, about 5 minutes)

1. Sign in to Google as **publicstardrivingschool@gmail.com**. The script sends email as
   whichever account creates it.
2. Open https://sheets.new to create a Google Sheet. Name it "Public Star Bookings".
3. In the Sheet, choose **Extensions > Apps Script**. Delete the sample code, paste in all of
   `google-apps-script/booking-email.gs`, and press the save icon.
4. In the toolbar's function dropdown pick **sendTestEmail**, then press **Run**. Google asks
   for permission. Choose your account, then **Advanced > Go to project (unsafe) > Allow**.
   The warning appears because the script is your own and not published, which is normal.
   A test email should arrive in the inbox.
5. Choose **Deploy > New deployment**. Click the gear icon, pick **Web app**, set
   **Execute as: Me** and **Who has access: Anyone**, then press **Deploy**.
6. Copy the **Web app URL**, which ends in `/exec`, and paste it into `appsScriptUrl` in
   `script.js`. Commit and push.

Each booking then arrives by email and appears in the Sheet's "Bookings" tab. Gmail's free
limit is 100 script emails a day.

To change the script later, edit it, then use **Deploy > Manage deployments**, press the
pencil icon, choose **Version: New version**, and deploy. The URL stays the same.

### How to test

Open the live site, fill in the form with test details, and press "Send Booking Request".

- A green "Thanks!" message means the service accepted it. The email should arrive within
  a minute. The first time, check the spam folder.
- A red "Sorry, something went wrong" message means the service rejected it or did not
  answer within 20 seconds. The message tells the student to call or email instead.

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8765
```

Then visit http://localhost:8765.

## Deploying

The site is deployed automatically to GitHub Pages from the `main` branch: every push
to `main` updates https://publicstardrivingschool.com/ within a minute.

### Custom domain

The domain `publicstardrivingschool.com` is registered at Namecheap and points to GitHub
Pages. The `CNAME` file in this repo tells GitHub which domain to serve. The old address
https://vyyenhoang.github.io/DrivingSchoolWebsite_Git/ redirects to the domain.

DNS records in Namecheap (Domain List > Manage > Advanced DNS):

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | vyyenhoang.github.io. |

HTTPS is issued by GitHub automatically once DNS points here.

It is plain HTML/CSS/JS with no build step, so it can also be uploaded to any static
host (GitHub Pages, Netlify, Vercel, cPanel, etc.).
