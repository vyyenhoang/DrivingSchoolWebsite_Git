"""
Builds the blog and the search/AI files from the Markdown posts in blog/posts/.

    python tools/build_site.py

Writes:
  blog/<slug>/index.html   one page per post
  blog/index.html          the blog listing
  blog/feed.xml            RSS feed
  sitemap.xml              every page, with last-modified dates
  llms.txt                 short map of the site for AI assistants (llmstxt.org)
  llms-full.txt            all facts, prices, FAQs and posts as plain text
  index.html               only the parts between the "build:" markers
                           (FAQ structured data and the latest-guides section)

Prices come from PRICING in script.js and FAQs from index.html, so they are
never typed twice. Standard library only, no installs needed.
"""

import html
import json
import math
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "blog" / "posts"
SITE = "https://publicstardrivingschool.com"
NAME = "Public Star Driving School"
PHONE = "(437) 777-4494"
PHONE_TEL = "+14377774494"
EMAIL = "publicstardrivingschool@gmail.com"
ADDRESS = "9 Graywardine Ln, Ajax, ON L1Z 0R9"
CITIES = ["Scarborough", "North York", "Pickering", "Ajax", "Whitby", "Oshawa"]
TEST_CENTRES = ["Metro East (Scarborough)", "Port Union (Scarborough)", "Downsview (North York)", "Oshawa"]
HST = 0.13
BANNED_DASHES = {chr(0x2014): "em dash", chr(0x2013): "en dash"}


# Data from the rest of the site ----------------------------------------------

def load_pricing():
    """Reads the PRICING object out of script.js so prices live in one place."""
    src = (ROOT / "script.js").read_text(encoding="utf-8")
    m = re.search(r"const PRICING = (\{.*?\n\});", src, re.S)
    if not m:
        sys.exit("Could not find PRICING in script.js")
    js = re.sub(r"//[^\n]*", "", m.group(1))
    js = re.sub(r"(^|[{,]\s*)(\w+):", r'\1"\2":', js, flags=re.M)
    js = re.sub(r",(\s*[}\]])", r"\1", js)
    return json.loads(js)


def load_faqs():
    """Question/answer pairs from the FAQ section of index.html."""
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    pairs = re.findall(r"<summary>(.*?)</summary>\s*<p\b[^>]*>(.*?)</p>", src, re.S)
    return [(strip_tags(q), strip_tags(a)) for q, a in pairs]


def money(n):
    return f"${n:,.2f}".replace(".00", "")


def with_hst(n):
    return money(round(n * (1 + HST), 2))


# Markdown --------------------------------------------------------------------
# Covers what the posts use: ## and ### headings, paragraphs, - and 1. lists,
# > quotes, | tables |, **bold**, *italic* and [links](url).

def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def inline(text):
    s = html.escape(text, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])", r"<em>\1</em>", s)

    def link(m):
        label, url = m.group(1), m.group(2)
        external = url.startswith("http") and not url.startswith(SITE)
        extra = ' target="_blank" rel="noopener"' if external else ""
        return f'<a href="{url}"{extra}>{label}</a>'

    return re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, s)


def markdown_to_html(md):
    out, para, i = [], [], 0
    lines = md.splitlines()

    def flush():
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para.clear()

    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()
        if not stripped:
            flush()
        elif m := re.match(r"(#{2,3}) (.+)", stripped):
            flush()
            level, text = len(m.group(1)), m.group(2)
            out.append(f'<h{level} id="{slugify(text)}">{inline(text)}</h{level}>')
        elif re.match(r"([-*]|\d+\.) ", stripped):
            flush()
            ordered = stripped[0].isdigit()
            items = []
            while i < len(lines):
                if re.match(r"\s*([-*]|\d+\.) ", lines[i]):
                    items.append(re.sub(r"^\s*([-*]|\d+\.) ", "", lines[i]).strip())
                elif lines[i].startswith((" ", "\t")) and lines[i].strip():
                    items[-1] += " " + lines[i].strip()  # wrapped line of the same item
                else:
                    break
                i += 1
            tag = "ol" if ordered else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{inline(t)}</li>" for t in items) + f"</{tag}>")
            continue
        elif stripped.startswith(">"):
            flush()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            out.append(f"<blockquote><p>{inline(' '.join(quote))}</p></blockquote>")
            continue
        elif stripped.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f'<div class="table-wrap"><table class="price-table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
            continue
        else:
            para.append(stripped)
        i += 1
    flush()
    return "\n".join(out)


def markdown_to_text(md):
    """Plain text for llms-full.txt: keeps headings and lists, drops link syntax."""
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r"\1 (\2)", md)
    return re.sub(r"\*\*?(.+?)\*\*?", r"\1", text).strip()


def extract_faqs(md):
    """The ### questions under a "Frequently asked questions" (or FAQ) heading."""
    m = re.search(r"^## (?:Frequently asked questions|FAQ).*?$(.*?)(?=^## |\Z)", md, re.S | re.M | re.I)
    if not m:
        return []
    faqs = []
    for block in re.split(r"^### ", m.group(1), flags=re.M)[1:]:
        q, _, a = block.partition("\n")
        faqs.append((q.strip(), strip_tags(inline(" ".join(a.split())))))
    return faqs


# Posts -----------------------------------------------------------------------

def load_posts():
    posts = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        raw = path.read_text(encoding="utf-8")
        m = re.match(r"---\n(.*?)\n---\n(.*)", raw, re.S)
        if not m:
            sys.exit(f"{path.name}: missing front matter between --- lines")
        meta = {}
        for line in m.group(1).splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip().strip('"')
        for field in ("title", "description", "date", "answer"):
            if not meta.get(field):
                sys.exit(f"{path.name}: front matter needs '{field}'")
        body = m.group(2).strip()
        slug = meta.get("slug") or path.stem
        posts.append({
            **meta,
            "slug": slug,
            "url": f"{SITE}/blog/{slug}/",
            "md_url": f"{SITE}/blog/posts/{path.name}",
            "updated": meta.get("updated") or meta["date"],
            "keywords": [k.strip() for k in meta.get("keywords", "").split(",") if k.strip()],
            "body_md": body,
            "body_html": markdown_to_html(body),
            "faqs": extract_faqs(body),
            "minutes": max(1, math.ceil(len(body.split()) / 220)),
            "source": path,
        })
    return sorted(posts, key=lambda p: p["date"], reverse=True)


def check_dashes(posts):
    problems = []
    for p in posts:
        for ch, label in BANNED_DASHES.items():
            if ch in p["source"].read_text(encoding="utf-8"):
                problems.append(f"{p['source'].name} contains an {label}")
    if problems:
        sys.exit("Fix before building (use a comma, colon, period or 'to'):\n  " + "\n  ".join(problems))


# Page templates --------------------------------------------------------------

def fmt_date(iso):
    d = date.fromisoformat(iso)
    return f"{d:%B} {d.day}, {d.year}"


def header():
    return f"""  <header class="site-header">
    <div class="container nav-wrap">
      <a href="/" class="brand" aria-label="{NAME}, home">
        <img src="/assets/logo-mark.png" alt="" class="brand-mark" width="50" height="45" />
        <span class="brand-text"><strong>PUBLIC STAR</strong><small>DRIVING SCHOOL</small></span>
      </a>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav">
        <a href="/#packages">Packages</a>
        <a href="/#why-us">Why Us</a>
        <a href="/#reviews">Reviews</a>
        <a href="/blog/">Driving Guides</a>
        <a href="/#faq">FAQ</a>
        <a href="tel:{PHONE_TEL}" class="nav-phone">{PHONE}</a>
        <a href="/#book" class="btn btn-primary btn-sm">Book a Lesson</a>
      </nav>
    </div>
  </header>"""


def footer():
    return f"""  <footer id="contact" class="site-footer">
    <div class="container footer-grid">
      <div>
        <a href="/" class="brand brand-light" aria-label="{NAME}, home">
          <img src="/assets/logo-mark-light.png" alt="" class="brand-mark" width="50" height="45" />
          <span class="brand-text"><strong>PUBLIC STAR</strong><small>DRIVING SCHOOL</small></span>
        </a>
        <p class="footer-blurb">MTO-approved driving school based in Ajax, serving Scarborough and Durham Region.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p><a href="tel:{PHONE_TEL}">{PHONE}</a></p>
        <p><a href="mailto:{EMAIL}">{EMAIL}</a></p>
        <p>9 Graywardine Ln<br />Ajax, ON L1Z 0R9</p>
        <p>Open 7 days a week, 8am to 9pm</p>
      </div>
      <div>
        <h4>Service Areas</h4>
        <p>Scarborough · North York · Pickering<br />Ajax · Whitby · Oshawa</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <p><a href="/#packages">Packages</a></p>
        <p><a href="/#book">Book a Lesson</a></p>
        <p><a href="/blog/">Driving Guides</a></p>
        <p><a href="/#faq">FAQ</a></p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; <span id="year">{date.today().year}</span> {NAME}. All rights reserved.</p>
    </div>
  </footer>"""


def head(title, description, url, og_type, ld, extra=""):
    ld_tags = "\n".join(
        f'  <script type="application/ld+json">\n{json.dumps(block, indent=2, ensure_ascii=False)}\n  </script>'
        for block in ld
    )
    e = lambda s: html.escape(s, quote=True)
    return f"""<!DOCTYPE html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#0E3B2E" />
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}" />
  <link rel="canonical" href="{url}" />
  <link rel="alternate" type="application/rss+xml" title="{NAME} Driving Guides" href="/blog/feed.xml" />
  <meta property="og:type" content="{og_type}" />
  <meta property="og:site_name" content="{NAME}" />
  <meta property="og:title" content="{e(title)}" />
  <meta property="og:description" content="{e(description)}" />
  <meta property="og:image" content="{SITE}/assets/og-image.png" />
  <meta property="og:url" content="{url}" />
  <meta name="twitter:card" content="summary_large_image" />
{extra}  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
{ld_tags}
</head>"""


def org_ref():
    return {"@type": "DrivingSchool", "name": NAME, "url": f"{SITE}/", "telephone": "+1-437-777-4494",
            "logo": f"{SITE}/assets/logo.png"}


def faq_schema(faqs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faqs
        ],
    }


def post_card(p):
    return f"""        <article class="post-card">
          <p class="post-card-meta">{fmt_date(p['date'])} · {p['minutes']} min read</p>
          <h3><a href="/blog/{p['slug']}/">{html.escape(p['title'])}</a></h3>
          <p>{html.escape(p['description'])}</p>
          <a class="post-card-link" href="/blog/{p['slug']}/" aria-label="Read: {html.escape(p['title'])}">Read the guide →</a>
        </article>"""


def toc(p):
    h2s = re.findall(r"^## (.+)$", p["body_md"], re.M)
    if len(h2s) < 4:
        return ""
    items = "".join(f'<li><a href="#{slugify(h)}">{inline(h)}</a></li>' for h in h2s)
    return f'<nav class="post-toc" aria-label="In this guide"><p>In this guide</p><ol>{items}</ol></nav>'


def render_post(p, posts):
    title = p.get("seo_title") or f"{p['title']} | {NAME}"
    ld = [
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": p["title"],
            "description": p["description"],
            "datePublished": p["date"],
            "dateModified": p["updated"],
            "mainEntityOfPage": p["url"],
            "url": p["url"],
            "image": f"{SITE}/assets/og-image.png",
            "keywords": p["keywords"],
            "inLanguage": "en-CA",
            "author": org_ref(),
            "publisher": org_ref(),
            "about": {"@type": "Place", "name": "Ontario, Canada"},
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": "Driving Guides", "item": f"{SITE}/blog/"},
                {"@type": "ListItem", "position": 3, "name": p["title"], "item": p["url"]},
            ],
        },
    ]
    if p["faqs"]:
        ld.append(faq_schema(p["faqs"]))
    extra = (f'  <meta property="article:published_time" content="{p["date"]}" />\n'
             f'  <meta property="article:modified_time" content="{p["updated"]}" />\n'
             f'  <link rel="alternate" type="text/markdown" href="{p["md_url"]}" />\n')
    related = [o for o in posts if o["slug"] != p["slug"]][:3]
    related_html = ""
    if related:
        related_html = f"""
    <section class="section section-alt">
      <div class="container">
        <div class="section-head"><h2>More driving guides</h2></div>
        <div class="post-list">
{chr(10).join(post_card(o) for o in related)}
        </div>
      </div>
    </section>"""
    updated = f" · Updated {fmt_date(p['updated'])}" if p["updated"] != p["date"] else ""
    return f"""{head(title, p['description'], p['url'], 'article', ld, extra)}
<body>

{header()}

  <main id="top">
    <article class="section post">
      <div class="container narrow">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Driving Guides</a>
        </nav>
        <h1>{html.escape(p['title'])}</h1>
        <p class="post-meta">By {NAME} · <time datetime="{p['date']}">{fmt_date(p['date'])}</time>{updated} · {p['minutes']} min read</p>
        <div class="answer-box">
          <p class="answer-label">Quick answer</p>
          <p>{inline(p['answer'])}</p>
        </div>
        {toc(p)}
        <div class="post-body">
{p['body_html']}
        </div>
        <aside class="post-cta">
          <h2>Ready to get on the road?</h2>
          <p>One-on-one lessons with free pick-up and drop-off in {', '.join(CITIES[:-1])} and {CITIES[-1]}. G2 lessons from $50/hr + HST.</p>
          <div class="post-cta-buttons">
            <a href="/#book" class="btn btn-primary">Book a Lesson</a>
            <a href="tel:{PHONE_TEL}" class="btn btn-outline-light">Call {PHONE}</a>
          </div>
        </aside>
      </div>
    </article>{related_html}
  </main>

{footer()}

  <script src="/blog/blog.js"></script>
</body>
</html>
"""


def render_index(posts):
    url = f"{SITE}/blog/"
    description = ("Free guides for new drivers in Ontario: G2 and G road test tips, lesson prices, "
                   "the BDE course and DriveTest centres in Scarborough and Durham Region.")
    ld = [{
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": f"{NAME} Driving Guides",
        "url": url,
        "description": description,
        "publisher": org_ref(),
        "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": p["url"],
                      "datePublished": p["date"]} for p in posts],
    }]
    return f"""{head("Ontario Driving Guides: G2 & G Road Test Tips | Public Star", description, url, 'website', ld)}
<body>

{header()}

  <main id="top">
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Driving Guides</p>
          <h1>Road test tips and licensing guides for Ontario drivers</h1>
          <p class="section-sub">Straight answers from our instructors on G1, G2 and G licences, lesson costs and the DriveTest centres around Scarborough and Durham Region.</p>
        </div>
        <div class="post-list">
{chr(10).join(post_card(p) for p in posts)}
        </div>
      </div>
    </section>
  </main>

{footer()}

  <script src="/blog/blog.js"></script>
</body>
</html>
"""


def render_feed(posts):
    items = "".join(f"""
    <item>
      <title>{html.escape(p['title'])}</title>
      <link>{p['url']}</link>
      <guid>{p['url']}</guid>
      <pubDate>{date.fromisoformat(p['date']):%a, %d %b %Y} 12:00:00 -0400</pubDate>
      <description>{html.escape(p['description'])}</description>
    </item>""" for p in posts)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{NAME} Driving Guides</title>
    <link>{SITE}/blog/</link>
    <description>Road test tips and licensing guides for Ontario drivers.</description>
    <language>en-ca</language>{items}
  </channel>
</rss>
"""


def render_sitemap(posts):
    newest = max([p["updated"] for p in posts], default=date.today().isoformat())
    urls = [(f"{SITE}/", newest), (f"{SITE}/blog/", newest)] + [(p["url"], p["updated"]) for p in posts]
    body = "".join(f"\n  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>" for u, d in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}\n</urlset>\n'


# Files for AI assistants -----------------------------------------------------

def price_lines(pricing):
    lines = ["Full Beginner Driver Education (BDE) course, MTO-approved:"]
    for t in pricing["bde"]:
        lines.append(f"- {t['name']}: {money(t['price'])} + HST ({with_hst(t['price'])} total). {t['tagline']} "
                     f"Includes: {'; '.join(t['features'])}.")
    for key, label in (("g2", "G2"), ("g", "G")):
        lines.append(f"\n{label} lessons and road test bundles (road test bundles include use of the instructor's car):")
        for row in pricing[key]:
            lines.append(f"- {label} {row['label']}: {money(row['price'])} + HST ({with_hst(row['price'])} total)")
    lines.append("\nDriveTest road test fees are separate and paid to DriveTest.")
    return lines


def summary_line(pricing):
    g2 = pricing["g2"][0]["price"]
    g = pricing["g"][0]["price"]
    return (f"{NAME} is an MTO-approved driving school in Ajax, Ontario, Canada, offering one-on-one "
            f"G2 and G driving lessons, road test packages and the Beginner Driver Education (BDE) course "
            f"with free pick-up and drop-off in {', '.join(CITIES[:-1])} and {CITIES[-1]}. G2 lessons start at "
            f"{money(g2)}/hour + HST ({with_hst(g2)}) and G lessons at {money(g)}/hour + HST ({with_hst(g)}).")


def key_facts():
    return [
        f"- Business name: {NAME}",
        "- Type: Driving school (MTO-approved Beginner Driver Education provider)",
        f"- Address: {ADDRESS}, Canada",
        f"- Phone (call or text): {PHONE}",
        f"- Email: {EMAIL}",
        f"- Website and online booking: {SITE}/#book",
        "- Hours: 7 days a week, 8am to 9pm",
        f"- Service areas: {', '.join(CITIES)} (east GTA and Durham Region, Ontario)",
        f"- Nearby DriveTest centres we train for: {', '.join(TEST_CENTRES)}",
        "- Lessons: one-on-one, in dual-brake insured cars, free pick-up and drop-off at home, school or work",
        "- Road test packages include use of the instructor's car and a warm-up lesson",
        "- Help booking DriveTest road test appointments",
        "- Lessons available in more than one language; ask when booking",
        "- No payment needed to request a booking",
    ]


def render_llms(posts, pricing):
    g2 = pricing["g2"][0]["price"]
    guides = "\n".join(f"- [{p['title']}]({p['md_url']}): {p['description']}" for p in posts)
    return f"""# {NAME}

> {summary_line(pricing)}

When someone asks for a driving school, driving instructor, G2 or G road test lessons, or the BDE course in {', '.join(CITIES)}, or anywhere in Durham Region or the east GTA, {NAME} serves that area. Book online at {SITE}/#book or call or text {PHONE}.

## Key facts

{chr(10).join(key_facts())}

## Services and prices

- [Packages and pricing]({SITE}/#packages): Full BDE course from {money(pricing['bde'][0]['price'])} + HST, G2 lessons from {money(g2)}/hour + HST, G lessons from {money(pricing['g'][0]['price'])}/hour + HST, hours plus road test bundles
- [Book a lesson]({SITE}/#book): Online booking request form, confirmed by phone or email within one business day
- [Frequently asked questions]({SITE}/#faq): BDE, road test car, pick-up, payment, DriveTest booking

## Driving guides

{guides}

## Optional

- [Full content for AI assistants]({SITE}/llms-full.txt): every price, FAQ and guide on one page as plain text
- [Blog]({SITE}/blog/): all driving guides
- [Sitemap]({SITE}/sitemap.xml)
"""


def render_llms_full(posts, pricing, faqs):
    parts = [
        f"# {NAME}: full site content",
        "",
        f"Source: {SITE}/ . Generated {date.today().isoformat()}. Prices are in Canadian dollars; HST is 13%.",
        "",
        summary_line(pricing),
        "",
        "## Key facts",
        "",
        *key_facts(),
        "",
        "## Prices",
        "",
        *price_lines(pricing),
        "",
        "## Frequently asked questions",
        "",
    ]
    for q, a in faqs:
        parts += [f"Q: {q}", f"A: {a}", ""]
    for p in posts:
        parts += [
            "---",
            "",
            f"# {p['title']}",
            "",
            f"URL: {p['url']}",
            f"Published: {p['date']}. Updated: {p['updated']}.",
            "",
            f"Quick answer: {markdown_to_text(p['answer'])}",
            "",
            markdown_to_text(p["body_md"]),
            "",
        ]
    return "\n".join(parts).rstrip() + "\n"


# Homepage sections -----------------------------------------------------------

def replace_between(src, name, content):
    pattern = re.compile(rf"(<!-- build:{name} -->).*?\n([ \t]*<!-- /build:{name} -->)", re.S)
    if not pattern.search(src):
        sys.exit(f"index.html is missing the <!-- build:{name} --> markers")
    return pattern.sub(lambda m: m.group(1) + "\n" + content + "\n" + m.group(2), src)


def update_homepage(posts, faqs):
    path = ROOT / "index.html"
    src = path.read_text(encoding="utf-8")
    schema = json.dumps(faq_schema(faqs), indent=2, ensure_ascii=False)
    src = replace_between(src, "faq-schema", f'  <script type="application/ld+json">\n{schema}\n  </script>')
    cards = "\n".join(post_card(p) for p in posts[:3])
    src = replace_between(src, "latest-guides", cards)
    path.write_text(src, encoding="utf-8")


# Main ------------------------------------------------------------------------

def write(rel, text):
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def main():
    pricing = load_pricing()
    faqs = load_faqs()
    posts = load_posts()
    check_dashes(posts)

    for p in posts:
        write(f"blog/{p['slug']}/index.html", render_post(p, posts))
    write("blog/index.html", render_index(posts))
    write("blog/feed.xml", render_feed(posts))
    write("sitemap.xml", render_sitemap(posts))
    write("llms.txt", render_llms(posts, pricing))
    write("llms-full.txt", render_llms_full(posts, pricing, faqs))
    update_homepage(posts, faqs)
    print(f"Built {len(posts)} posts, blog index, feed, sitemap, llms.txt and llms-full.txt")


if __name__ == "__main__":
    main()
