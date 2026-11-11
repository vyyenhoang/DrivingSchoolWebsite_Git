"""
SEO health check for the site. Run after tools/build_site.py.

    python tools/seo_check.py            # check the files in this folder
    python tools/seo_check.py --live     # also check every sitemap URL on the live site
    python tools/seo_check.py --report seo/reports/2026-10-30.md

Errors (exit code 1) are things that hurt search or break pages: em or en dashes,
missing titles or canonicals, broken internal links, invalid structured data,
pages missing from the sitemap or llms.txt. Warnings are worth fixing but not urgent.
"""

import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://publicstardrivingschool.com"
TEXT_TYPES = {".html", ".js", ".css", ".md", ".txt", ".xml", ".gs"}
SKIP_DIRS = {".git", ".claude", "node_modules", "tools"}
DASHES = {chr(0x2014): "em dash", chr(0x2013): "en dash"}

errors, warnings, notes = [], [], []


def rel(p):
    return p.relative_to(ROOT).as_posix()


def pages():
    yield ROOT / "index.html"
    yield from sorted((ROOT / "blog").glob("**/index.html"))


def page_url(p):
    path = rel(p).removesuffix("index.html")
    return f"{SITE}/{path}"


def check_dashes():
    for p in ROOT.rglob("*"):
        if p.is_file() and p.suffix in TEXT_TYPES and not SKIP_DIRS & set(p.relative_to(ROOT).parts):
            text = p.read_text(encoding="utf-8", errors="ignore")
            for ch, label in DASHES.items():
                if n := text.count(ch):
                    errors.append(f"{rel(p)}: {n} {label}(es). Use a comma, colon, period or 'to'.")


def check_page(p, sitemap, llms):
    src = p.read_text(encoding="utf-8")
    name = rel(p)
    url = page_url(p)

    title = re.search(r"<title>(.*?)</title>", src, re.S)
    if not title:
        errors.append(f"{name}: no <title>")
    elif len(title.group(1)) > 65:
        warnings.append(f"{name}: title is {len(title.group(1))} characters, Google shows about 60")

    desc = re.search(r'<meta name="description" content="(.*?)"', src, re.S)
    if not desc:
        errors.append(f"{name}: no meta description")
    elif not 70 <= len(desc.group(1)) <= 165:
        warnings.append(f"{name}: meta description is {len(desc.group(1))} characters, aim for 120 to 160")

    canonical = re.search(r'<link rel="canonical" href="(.*?)"', src)
    if not canonical:
        errors.append(f"{name}: no canonical link")
    elif canonical.group(1) != url:
        errors.append(f"{name}: canonical is {canonical.group(1)}, expected {url}")

    h1s = len(re.findall(r"<h1[\s>]", src))
    if h1s != 1:
        errors.append(f"{name}: has {h1s} <h1> headings, needs exactly 1")

    for img in re.findall(r"<img\b[^>]*>", src):
        if "alt=" not in img:
            errors.append(f"{name}: image without alt text: {img[:80]}")

    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
        try:
            json.loads(block)
        except json.JSONDecodeError as e:
            errors.append(f"{name}: structured data is not valid JSON ({e})")

    ids = set(re.findall(r'\sid="([^"]+)"', src))
    for href in re.findall(r'href="([^"]+)"', src):
        if href.startswith(("http", "mailto:", "tel:", "//")):
            continue
        path, _, anchor = href.partition("#")
        if not path:
            if anchor and anchor not in ids:
                errors.append(f"{name}: link to #{anchor} but no element has that id")
            continue
        target = ROOT / path.lstrip("/") if path.startswith("/") else p.parent / path
        if target.is_dir() or path.endswith("/"):
            target = target / "index.html"
        if not target.exists():
            errors.append(f"{name}: broken link {href}")
        elif anchor and target.suffix == ".html" and f'id="{anchor}"' not in target.read_text(encoding="utf-8"):
            errors.append(f"{name}: link {href} points to a missing #{anchor}")

    if url not in sitemap:
        errors.append(f"{name}: {url} is not in sitemap.xml")
    if "/blog/" in url and url != f"{SITE}/blog/":
        slug = url.rstrip("/").rsplit("/", 1)[1]
        if f"/blog/posts/{slug}.md" not in llms:
            errors.append(f"{name}: not listed in llms.txt")


def check_posts():
    posts = sorted((ROOT / "blog" / "posts").glob("*.md"))
    notes.append(f"{len(posts)} blog posts")
    newest = None
    for p in posts:
        raw = p.read_text(encoding="utf-8")
        front = dict(
            (k.strip(), v.strip()) for k, _, v in
            (line.partition(":") for line in raw.split("---")[1].strip().splitlines())
        )
        newest = max(newest or front.get("date", ""), front.get("date", ""))
        words = len(raw.split())
        if words < 700:
            warnings.append(f"{rel(p)}: only {words} words, aim for 900 or more")
        keywords = [k.strip().lower() for k in front.get("keywords", "").split(",") if k.strip()]
        if not keywords:
            warnings.append(f"{rel(p)}: no keywords in front matter")
        if "## frequently asked questions" not in raw.lower():
            warnings.append(f"{rel(p)}: no 'Frequently asked questions' section (used for FAQ rich results and AI answers)")
        links = re.findall(r"\]\((/[^)]*)\)", raw)
        if not any(l.startswith("/blog/") for l in links):
            warnings.append(f"{rel(p)}: no links to other guides")
    if newest:
        age = (date.today() - date.fromisoformat(newest)).days
        notes.append(f"newest post: {newest} ({age} days ago)")
        if age > 3:
            warnings.append(f"No new post for {age} days")


def check_site_files():
    for f in ("robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", "blog/feed.xml", ".nojekyll", "CNAME"):
        if not (ROOT / f).exists():
            errors.append(f"{f} is missing")
    robots = (ROOT / "robots.txt").read_text(encoding="utf-8") if (ROOT / "robots.txt").exists() else ""
    if "Sitemap:" not in robots:
        errors.append("robots.txt does not point to the sitemap")
    if re.search(r"Disallow:\s*/\s*$", robots, re.M):
        errors.append("robots.txt blocks a crawler from the whole site")


def check_live(sitemap):
    for url in re.findall(r"<loc>(.*?)</loc>", sitemap) + [f"{SITE}/llms.txt", f"{SITE}/robots.txt"]:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "PublicStarSEOCheck/1.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                if r.status != 200:
                    errors.append(f"live: {url} returned {r.status}")
        except Exception as e:
            errors.append(f"live: {url} failed ({e})")
    notes.append("live URLs checked")


def main():
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8") if (ROOT / "sitemap.xml").exists() else ""
    llms = (ROOT / "llms.txt").read_text(encoding="utf-8") if (ROOT / "llms.txt").exists() else ""
    check_dashes()
    check_site_files()
    for p in pages():
        check_page(p, sitemap, llms)
    check_posts()
    if "--live" in sys.argv:
        check_live(sitemap)

    lines = [f"# SEO check {date.today().isoformat()}", "",
             f"**{len(errors)} errors, {len(warnings)} warnings.** " + "; ".join(notes) + ".", ""]
    for heading, items in (("Errors", errors), ("Warnings", warnings)):
        lines += [f"## {heading}", ""] + ([f"- {i}" for i in items] or ["- None"]) + [""]
    report = "\n".join(lines)
    print(report)
    if "--report" in sys.argv:
        out = ROOT / sys.argv[sys.argv.index("--report") + 1]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(report, encoding="utf-8", newline="\n")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
