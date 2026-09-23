/* ==========================================================================
   Public Star Driving School — site script
   Edit PRICING below to change packages. Everything else renders from it.
   ========================================================================== */

const CONFIG = {
  bookingEmail: "publicstardrivingschool@gmail.com",
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

/* Helpers ------------------------------------------------------------------ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const money = (n) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const withTax = (n) => Math.round(n * (1 + CONFIG.hst) * 100) / 100;

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
          <span class="total">${money(withTax(p.price))} total</span>
        </div>
        <ul class="checklist">${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <a href="#book" class="btn ${p.featured ? "btn-primary" : "btn-outline"} btn-block" data-select-package="BDE ${p.name} – $${p.price} + HST">Choose ${p.name}</a>
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
      <tr><th>Option</th><th>Price</th><th>With HST</th><th></th></tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) => `
        <tr>
          <td class="label">${r.label}${r.popular ? '<span class="pill">Popular</span>' : ""}</td>
          <td class="price">${money(r.price)}</td>
          <td class="total"><span class="total-label">With HST </span>${money(withTax(r.price))}</td>
          <td class="action"><a href="#book" data-select-package="${prefix} ${r.label} – $${r.price} + HST">Book →</a></td>
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
  group("Full BDE Course", PRICING.bde.map((p) => `BDE ${p.name} – $${p.price} + HST`));
  group("G2 Lessons & Road Test", PRICING.g2.map((r) => `G2 ${r.label} – $${r.price} + HST`));
  group("G Lessons & Road Test", PRICING.g.map((r) => `G ${r.label} – $${r.price} + HST`));
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

  // Don't allow past dates
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  $("#date").min = today.toISOString().slice(0, 10);

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

    const data = new FormData(form);
    data.append("_subject", `New booking request – ${data.get("Full Name")} (${data.get("Package")})`);
    data.append("_template", "table");
    data.append("_captcha", "false");
    data.append("_replyto", data.get("Email"));

    btn.disabled = true;
    btn.textContent = "Sending…";

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONFIG.bookingEmail}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === "false" || json.success === false) {
        throw new Error(json.message || "Request failed");
      }
      form.reset();
      status.className = "form-status ok";
      status.textContent = "Thanks! Your request has been sent. We'll confirm your lesson shortly.";
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = `Sorry, something went wrong. Please email us directly at <a href="mailto:${CONFIG.bookingEmail}">${CONFIG.bookingEmail}</a>.`;
    } finally {
      btn.disabled = false;
      btn.textContent = "Send Booking Request";
    }
  });
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
