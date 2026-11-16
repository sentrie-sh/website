// SPDX-FileCopyrightText: © 2026 Binaek Sarkar <binaek89@gmail.com>
// SPDX-License-Identifier: Apache-2.0

// Checks every internal link in the built site: each <a href> must reach a
// page or file in the build output, and each #fragment must match an id on
// the target page. External links are not checked.
//
// Usage: node scripts/check-links.mjs [dist-dir]   (run after `npm run build`)

import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.argv[2] ?? "dist");
const ORIGIN = "https://site.invalid";

if (!fs.existsSync(dist)) {
  console.error(`No build output at ${dist}. Run \`npm run build\` first.`);
  process.exit(2);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

// The URL a built HTML file is served at, matching Astro's "directory" build format.
function urlFor(file) {
  const rel = path.relative(dist, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  return "/" + rel;
}

// Resolve a URL path to the build file that serves it, or null.
function fileFor(urlPath) {
  const p = path.join(dist, urlPath);
  const candidates = urlPath.endsWith("/")
    ? [path.join(p, "index.html")]
    : [p, path.join(p, "index.html"), p + ".html"];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

const htmlFiles = walk(dist).filter((f) => f.endsWith(".html"));
const idsByFile = new Map();
const idsOf = (file) => {
  if (!idsByFile.has(file)) {
    const html = fs.readFileSync(file, "utf8");
    const ids = new Set();
    for (const m of html.matchAll(/\s(?:id|name)="([^"]*)"/g)) ids.add(decodeEntities(m[1]));
    idsByFile.set(file, ids);
  }
  return idsByFile.get(file);
};

// problem key -> { href, reason, pages: Set }
const problems = new Map();
let checked = 0;

for (const file of htmlFiles) {
  const pageUrl = urlFor(file);
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)) {
    const href = decodeEntities(m[1]).trim();
    if (href === "" || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue; // external or scheme links
    checked++;
    const u = new URL(href, ORIGIN + pageUrl);
    const urlPath = decodeURIComponent(u.pathname);
    const fragment = decodeURIComponent(u.hash.slice(1));
    const target = fileFor(urlPath);
    let reason = null;
    if (!target) reason = `no page or file at ${urlPath}`;
    else if (fragment && target.endsWith(".html") && !idsOf(target).has(fragment))
      reason = `no #${fragment} on ${urlPath}`;
    if (!reason) continue;
    const key = `${href}\u0000${reason}`;
    if (!problems.has(key)) problems.set(key, { href, reason, pages: new Set() });
    problems.get(key).pages.add(pageUrl);
  }
}

if (problems.size === 0) {
  console.log(`Checked ${checked} internal links across ${htmlFiles.length} pages: all resolve.`);
  process.exit(0);
}

console.log(`Found ${problems.size} broken internal link(s) across ${htmlFiles.length} pages:\n`);
const sorted = [...problems.values()].sort((a, b) => [...a.pages][0].localeCompare([...b.pages][0]));
for (const { href, reason, pages } of sorted) {
  const list = [...pages].sort();
  const shown = list.slice(0, 3).join(", ") + (list.length > 3 ? `, and ${list.length - 3} more` : "");
  console.log(`- ${href}\n    ${reason}\n    on ${shown}`);
}
process.exit(1);
