/* ==========================================================================
   Public Star Driving School — site script
   Edit PRICING below to change packages. Everything else renders from it.
   ========================================================================== */

const CONFIG = {
  bookingEmail: "publicstardrivingschool@gmail.com",
  phoneDisplay: "(437) 777-4494",
  phoneTel: "+14377774494",
  // Where booking requests are sent, first one that is filled in wins (see README):
  // 1. Google Apps Script web app URL: emails from the business Gmail + logs to a Sheet
  appsScriptUrl: "",
  // 2. Web3Forms access key: emails go to the address the key was created with
  web3formsKey: "d1e0b834-c710-4da8-bdaa-271e9656a72f",
  // 3. Neither set: FormSubmit to bookingEmail
  hst: 0.13,
};

const PRICING = {
  bde: [
    {
      name: "Basic",
      price: 499,
      tagline: "Everything you need to earn your BDE certificate.",
      features: [
        "20 hrs online theory (self-paced)",
        "10 hrs one-on-one in-car lessons",
        "10 hrs homelink assignments",
        "Defensive driving & intersection techniques",
        "Road test preparation",
        "MTO certificate processing",
        "Free pick-up & drop-off",
      ],
    },
    {
      name: "Premium",
      price: 649,
      featured: true,
      badge: "Most Popular",
      tagline: "Extra practice plus our car for your road test.",
      features: [
        "Everything in Basic",
        "11 hrs one-on-one in-car lessons",
        "Use of instructor's car for G2 road test",
        "Road test booking assistance",
        "Free pick-up & drop-off",
      ],
    },
    {
      name: "Advanced",
      price: 799,
      tagline: "Maximum preparation for nervous or first-time drivers.",
      features: [
        "Everything in Premium",
        "15 hrs one-on-one in-car lessons",
        "Use of instructor's car for G2 road test",
        "Road test booking assistance",
        "Free pick-up & drop-off",
      ],
    },
  ],

  // Individual G2 lessons and hours + road test bundles (before HST)
  g2: [
    { label: "1 hour lesson", price: 50, roadTest: false },
    { label: "2 hours + road test", price: 200, roadTest: true },
    { label: "3 hours + road test", price: 250, roadTest: true },
    { label: "4 hours + road test", price: 300, roadTest: true },
    { label: "5 hours + road test", price: 330, roadTest: true, popular: true },
    { label: "10 hours + road test", price: 550, roadTest: true },
  ],

  // Individual G (full licence) lessons and bundles (before HST)
  g: [
    { label: "1 hour lesson", price: 60, roadTest: false },
    { label: "2 hours + road test", price: 250, roadTest: true },
    { label: "3 hours + road test", price: 300, roadTest: true, popular: true },
    { label: "4 hours + road test", price: 360, roadTest: true },
    { label: "5 hours + road test", price: 400, roadTest: true },
  ],
};

/* Reviews -----------------------------------------------------------------
   While this list is empty, the Reviews section shows a "Leave a review" message.
   Add entries and it switches to review cards automatically.
   Only add reviews written for Public Star, or ones the student has agreed
   to let you reuse. Set `source` to where the review was first posted.

   Example entry:
   {
     name: "Priya S.",
     rating: 5,
     text: "Omaid was patient and explained every manoeuvre clearly. Passed my G2 first try!",
     source: "Google",
     date: "2026-09",
   },
*/
const REVIEWS = [
  {
    name: "Nathan S.",
    rating: 5,
    text: "I had an excellent experience learning to drive with Omaid Faizi. He is a very patient, professional, and knowledgeable instructor who made every lesson comfortable and productive. He explains concepts clearly, gives helpful feedback, and focuses on building confidence rather than just teaching you how to pass the test.\n\nOmaid was always encouraging and took the time to correct my mistakes while helping me develop better driving habits and awareness on the road. Thanks to his guidance, I felt much more prepared and confident behind the wheel.\n\nI highly recommend Omaid Faizi to anyone looking for a driving instructor who genuinely cares about their students’ success.",
    source: "Google",
  },
  {
    name: "April R.",
    rating: 5,
    text: "I passed my G2 with confidence thanks to my instructor, Omaid Faizi. He is an excellent teacher who explains everything clearly while also giving you the confidence you need, especially when you’re feeling nervous. It was my first time driving with him, and I had no prior driving experience, but with his patience, knowledge, and guidance, I passed my test on the first attempt. He truly knows how to support and motivate his students. May Allah bless him. I would 10000% recommend him to anyone looking for a driving instructor.",
    source: "Google",
  },
  {
    name: "Chevron",
    rating: 5,
    text: "My Instructor Omaid Faizi was excellent! He was so helpful throughout my lessons and his teaching style allows for effective learning. I could tell that he really cares about his students' growth and success. Thanks to him, I was able to pass my G2 test on the first try!",
    source: "Google",
  },
  {
    name: "Yeasir C.",
    rating: 5,
    text: "Omaid Faizi is a very skilled and knowledgeable driving instructor. He shared many valuable defensive driving skills with me in a short period of time, and by the will of Almighty Allah, I passed my road test with ease. I am truly grateful to Almighty Allah for giving me the opportunity to practice driving according to Ontario’s road rules under the guidance of such a dedicated instructor. May Allah bless Omaid Faizi abundantly.",
    source: "Google",
  },
  {
    name: "Hryhorii O.",
    rating: 5,
    text: "I’ve had an absolutely amazing experience with this school and was able to pass my G2 test with a first attempt! Omaid Faizi was an amazing instructor who patiently taught me how to drive and corrected all my mistakes really fast - resulting in me getting a license. Highly recommend this instructor and a driving school!",
    source: "Google",
  },
  {
    name: "Rafiullah S.",
    rating: 5,
    text: "I highly recommend this driving school for anyone preparing for their G license. I had the pleasure of learning from Omaid Faizi, who is an outstanding instructor. His clear explanations, patience, and focus on safe driving techniques made a significant difference in my confidence and skills behind the wheel. Omaid Faizi ensured that I was well-prepared for every part of the test, and thanks to his thorough instruction, I successfully passed my G test on the first attempt. If you’re looking for a knowledgeable and supportive driving instructor, Omaid Faizi is an excellent choice.",
    source: "Google",
  },
  {
    name: "Tariq Z.",
    rating: 5,
    text: "I greatly recommend this driving school to anyone in the Greater Toronto Area who is looking to become a confident and skilled driver. I had the pleasure of being instructed by Omaid Faizi, who was not only knowledgeable and professional but also incredibly patient and supportive throughout the learning process. Thanks to his expert guidance and clear instruction, I was able to pass my G test on the first attempt. His teaching methods and focus on safety made a significant difference in my driving experience. I’m truly grateful for his help and would encourage anyone seeking a reliable driving instructor to reach out to him.",
    source: "Google",
  },
  {
    name: "Najeeb Y.",
    rating: 5,
    text: "⭐️⭐️⭐️⭐️⭐️I Passed My G Test – Thanks to Omaid Faizi!\n\nI had an amazing experience with All Star Driving School, and I can’t thank my instructor Omaid Faizi enough for his incredible guidance and support. He is extremely knowledgeable, patient, and calm — exactly what every student driver needs.\n\nOmaid made every lesson enjoyable and stress-free, always explaining things clearly and helping me feel confident behind the wheel. He pointed out the small details that make a big difference on the test and gave me helpful tips I never would have learned on my own.\n\nThanks to his excellent instruction and encouragement, I passed my G test on the first try! If you’re looking for a top-notch instructor who truly cares about your success, ask for Omaid Faizi. Highly recommend!",
    source: "Google",
  },
  {
    name: "Gabriel L.",
    rating: 5,
    text: "Review for a job well done with instructor Omaid Faizi for the G2, which I passed on the first try. When I started with him, I had never touched a steering wheel, but with calm and consistent guidance, as well as useful tips for parking, I was able to pass the test with high marks!",
    source: "Google",
  },
  {
    name: "Chiara C.",
    rating: 5,
    text: "Great driving school! 10/10 would recommend to any new drivers. Omaid Faizi is a great driving teacher, accommodating, professional and knowledgeable. With his teaching, I passed my G2 in one go with only a couple lessons!",
    source: "Google",
  },
  {
    name: "Leo W.",
    rating: 5,
    text: "My instructor Omaid Faizi was very helpful, informative and patient. He taught me everything I need to know when it comes to the rules of the road and driving. I was able to pass my test on the first try as a result of this.",
    source: "Google",
  },
  {
    name: "Niki V.",
    rating: 5,
    text: "I would like give this review to Omaid Faizi. Thank you for patiently teaching me in these last 8 classes for G2 test. Throughout the classes Omaid gave great tips and tricks. He was knowledgeable and kind. Thank you. My test is next month, wish me all the best.\n\nEdit: I also went and did my G test at Downsview this week and passed on first attempt. Thanks to Omaid again for helping and guiding me throughout. Highly recommend.",
    source: "Google",
  },
  {
    name: "Tamanna H.",
    rating: 5,
    text: "\"Omaid faizi is an exceptional driving instructor! They're knowledgeable, patient, and made learning to drive a positive experience. Their teaching style is clear and effective, pass my g2 on first attempt . I highly recommend Omaid to anyone looking to become a confident driver.",
    source: "Google",
  },
  {
    name: "William S.",
    rating: 5,
    text: "Omaid Faizi was a great instructor. He was very patient and taught me well.",
    source: "Google",
  },
  {
    name: "Ahmed K.",
    rating: 5,
    text: "Hey Omaid faizi, passed my G2 under your supervision and lessons you thought me was really helpful and meaningful . I admire your professionalism and patience.",
    source: "Google",
  },
];

const REVIEWS_CONFIG = {
  heading: "What students say about Omaid",
  // Keep this line: the reviews above were written while Omaid taught at another school
  subtitle:
    "Reviews from students taught by our instructor Omaid Faizi, posted on Google while he taught at his previous driving school.",
  // How many cards show before the "Show all reviews" button
  initialCount: 6,
  // Link to your Google Business Profile reviews, once it exists
  googleReviewsUrl: "",
};

/* Helpers ------------------------------------------------------------------ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const money = (n) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const withTax = (n) => Math.round(n * (1 + CONFIG.hst) * 100) / 100;
// One label used by the cards, tables and booking dropdown so they always match
const pkgLabel = (prefix, label, price) =>
  `${prefix} ${label} – $${price} + HST (${money(withTax(price))} total)`;

/* Render BDE cards --------------------------------------------------------- */
function renderBdeCards() {
  const wrap = $("#bde-cards");
  if (!wrap) return;
  wrap.innerHTML = PRICING.bde
    .map(
      (p) => `
      <article class="card${p.featured ? " is-featured" : ""}">
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ""}
        <h3>${p.name}</h3>
        <p class="card-tagline">${p.tagline}</p>
        <div class="card-price">
          <span class="amount">$${p.price}</span><span class="tax">+ HST</span>
          <span class="total">${money(withTax(p.price))} total incl. HST</span>
        </div>
        <ul class="checklist">${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <a href="#book" class="btn ${p.featured ? "btn-primary" : "btn-outline"} btn-block" data-select-package="${pkgLabel("BDE", p.name, p.price)}">Choose ${p.name}</a>
      </article>`
    )
    .join("");
}

/* Render hourly tables ----------------------------------------------------- */
function renderTable(id, rows, prefix) {
  const table = $(id);
  if (!table) return;
  table.innerHTML = `
    <thead>
      <tr><th>Option</th><th>Price</th><th>Total (incl. HST)</th><th></th></tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) => `
        <tr>
          <td class="label">${r.label}${r.popular ? '<span class="pill">Popular</span>' : ""}</td>
          <td class="price">${money(r.price)} <span class="hst">+ HST</span></td>
          <td class="total"><span class="total-label">Total </span>${money(withTax(r.price))}<span class="total-label"> incl. HST</span></td>
          <td class="action"><a href="#book" data-select-package="${pkgLabel(prefix, r.label, r.price)}">Book →</a></td>
        </tr>`
        )
        .join("")}
    </tbody>`;
}

/* Populate booking package dropdown ---------------------------------------- */
function populatePackageSelect() {
  const sel = $("#package");
  if (!sel) return;
  const group = (label, items) => {
    const og = document.createElement("optgroup");
    og.label = label;
    items.forEach((text) => {
      const o = document.createElement("option");
      o.textContent = text;
      og.appendChild(o);
    });
    sel.appendChild(og);
  };
  group("Full BDE Course", PRICING.bde.map((p) => pkgLabel("BDE", p.name, p.price)));
  group("G2 Lessons & Road Test", PRICING.g2.map((r) => pkgLabel("G2", r.label, r.price)));
  group("G Lessons & Road Test", PRICING.g.map((r) => pkgLabel("G", r.label, r.price)));
  const other = document.createElement("option");
  other.textContent = "Not sure yet – please advise";
  sel.appendChild(other);
}

/* Tabs --------------------------------------------------------------------- */
function initTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      $$(".tab-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      $(`.tab-panel[data-panel="${tab.dataset.tab}"]`).classList.add("is-active");
    });
  });
}

/* Package pre-select from "Book" links ------------------------------------- */
function initPackageLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-select-package]");
    if (!link) return;
    const sel = $("#package");
    const value = link.dataset.selectPackage;
    const opt = $$("option", sel).find((o) => o.textContent === value);
    if (opt) sel.value = opt.textContent;
  });
}

/* Mobile nav --------------------------------------------------------------- */
function initNav() {
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
}

/* Booking form ------------------------------------------------------------- */
function initForm() {
  const form = $("#booking-form");
  const status = $("#form-status");
  const btn = $("#submit-btn");
  if (!form) return;

  // Calendar picker (falls back to a plain text field if the library fails to load)
  const dateInput = $("#date");
  if (window.flatpickr) {
    flatpickr(dateInput, {
      minDate: "today",
      dateFormat: "Y-m-d",          // value submitted in the email
      altInput: true,               // what the student sees
      altFormat: "D, M j, Y",
      disableMobile: true,          // same calendar on phones as on desktop
      monthSelectorType: "static",
      onChange: () => setError(dateInput, ""),
    });
    // flatpickr swaps in a display input; copy our styling hooks onto it
    const alt = dateInput.nextElementSibling;
    if (alt) {
      alt.placeholder = "Select a date";
      alt.setAttribute("inputmode", "none");
    }
  } else {
    dateInput.placeholder = "YYYY-MM-DD";
    dateInput.removeAttribute("inputmode");
  }

  const setError = (field, msg) => {
    const wrap = field.closest(".field");
    let el = wrap.querySelector(".error-msg");
    if (!el) {
      el = document.createElement("div");
      el.className = "error-msg";
      wrap.appendChild(el);
    }
    el.textContent = msg;
    wrap.classList.toggle("has-error", Boolean(msg));
  };

  const validate = () => {
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const empty = !f.value || !f.value.trim();
      let msg = "";
      if (empty) msg = "This field is required.";
      else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) msg = "Enter a valid email.";
      else if (f.type === "tel" && f.value.replace(/\D/g, "").length < 10) msg = "Enter a valid phone number.";
      setError(f, msg);
      if (msg) ok = false;
    });
    return ok;
  };

  $$("[required]", form).forEach((f) => f.addEventListener("input", () => setError(f, "")));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";
    if (!validate()) {
      status.className = "form-status err";
      status.textContent = "Please fix the highlighted fields.";
      return;
    }

    const fields = Object.fromEntries(new FormData(form));
    const honey = fields._honey;
    delete fields._honey;
    const subject = `New booking request – ${fields["Full Name"]} (${fields["Package"]})`;

    // Bots fill the hidden field: pretend it worked and send nothing
    if (honey) {
      form.reset();
      status.className = "form-status ok";
      status.textContent = "Thanks! Your request has been sent.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending…";

    // Give up after 20 seconds so the button never hangs on "Sending…"
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      let url, payload, headers;
      if (CONFIG.appsScriptUrl) {
        // text/plain keeps this a "simple" request, which Apps Script accepts from any site
        url = CONFIG.appsScriptUrl;
        payload = { subject, ...fields };
        headers = { "Content-Type": "text/plain;charset=utf-8" };
      } else if (CONFIG.web3formsKey) {
        url = "https://api.web3forms.com/submit";
        payload = { access_key: CONFIG.web3formsKey, subject, from_name: "Public Star website", replyto: fields.Email, ...fields };
        headers = { "Content-Type": "application/json", Accept: "application/json" };
      } else {
        url = `https://formsubmit.co/ajax/${CONFIG.bookingEmail}`;
        payload = { ...fields, _subject: subject, _template: "table", _captcha: "false", _replyto: fields.Email };
        headers = { "Content-Type": "application/json", Accept: "application/json" };
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === "false" || json.success === false) {
        throw new Error(json.message || `Request failed (${res.status})`);
      }
      form.reset();
      if ($("#date")._flatpickr) $("#date")._flatpickr.clear();
      status.className = "form-status ok";
      status.textContent = "Thanks! Your request has been sent. We'll confirm your lesson shortly.";
    } catch (err) {
      console.warn("Booking form error:", err);
      status.className = "form-status err";
      status.innerHTML = `Sorry, something went wrong. Please call <a href="tel:${CONFIG.phoneTel}">${CONFIG.phoneDisplay}</a> or email <a href="mailto:${CONFIG.bookingEmail}">${CONFIG.bookingEmail}</a>.`;
    } finally {
      clearTimeout(timer);
      btn.disabled = false;
      btn.textContent = "Send Booking Request";
    }
  });
}

/* Render reviews ----------------------------------------------------------- */
function renderReviews() {
  const section = $("#reviews");
  if (!section) return;
  // With a Google profile, "Leave a review" goes there instead of email
  if (REVIEWS_CONFIG.googleReviewsUrl) {
    const leave = $("#reviews-leave");
    leave.href = REVIEWS_CONFIG.googleReviewsUrl;
    leave.target = "_blank";
    leave.rel = "noopener";
  }
  if (!REVIEWS.length) return; // keep the empty state
  $("#reviews-empty").hidden = true;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
  const LONG = 300; // characters before "Read more"
  const limit = REVIEWS_CONFIG.initialCount || REVIEWS.length;
  const list = $("#reviews-list");
  list.innerHTML = REVIEWS.map(
    (r, i) => `
      <figure class="review${i >= limit ? " is-extra" : ""}">
        <div class="review-stars" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</div>
        <blockquote class="${r.text.length > LONG ? "is-clamped" : ""}">
          ${r.text.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}
        </blockquote>
        ${r.text.length > LONG ? '<button type="button" class="review-more" aria-expanded="false">Read more</button>' : ""}
        <figcaption>
          <span class="review-avatar" aria-hidden="true">${esc(r.name.charAt(0))}</span>
          <span><strong>${esc(r.name)}</strong>${r.source ? `<small>via ${esc(r.source)}${r.date ? " · " + esc(r.date) : ""}</small>` : ""}</span>
        </figcaption>
      </figure>`
  ).join("");

  // "Read more" on long reviews
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".review-more");
    if (!btn) return;
    const quote = btn.previousElementSibling;
    const open = quote.classList.toggle("is-clamped") === false;
    btn.textContent = open ? "Show less" : "Read more";
    btn.setAttribute("aria-expanded", String(open));
  });

  // "Show all reviews" when there are more than the initial count
  if (REVIEWS.length > limit) {
    list.classList.add("is-collapsed");
    const more = document.createElement("p");
    more.className = "reviews-more-wrap";
    more.innerHTML = `<button type="button" class="btn btn-outline">Show all ${REVIEWS.length} reviews</button>`;
    list.after(more);
    more.querySelector("button").addEventListener("click", () => {
      list.classList.remove("is-collapsed");
      more.remove();
    });
  }

  if (REVIEWS_CONFIG.heading) $("#reviews h2").textContent = REVIEWS_CONFIG.heading;
  if (REVIEWS_CONFIG.subtitle) $("#reviews-sub").textContent = REVIEWS_CONFIG.subtitle;
  if (REVIEWS_CONFIG.googleReviewsUrl) {
    $("#reviews-link").href = REVIEWS_CONFIG.googleReviewsUrl;
    $("#reviews-cta").hidden = false;
  }
}

/* Mobile sticky CTA: hide while the booking form is on screen ------------- */
function initStickyCta() {
  const bar = $("#sticky-cta");
  const book = $("#book");
  if (!bar || !book || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(
    ([entry]) => bar.classList.toggle("is-hidden", entry.isIntersecting),
    { threshold: 0.15 }
  ).observe(book);
}

/* Init --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderReviews();
  initStickyCta();
  renderBdeCards();
  renderTable("#g2-table", PRICING.g2, "G2");
  renderTable("#g-table", PRICING.g, "G");
  populatePackageSelect();
  initTabs();
  initPackageLinks();
  initNav();
  initForm();
  $("#year").textContent = new Date().getFullYear();
});
