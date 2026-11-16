#!/usr/bin/env node
/**
 * Generates the self-hosted profile cards from GitHub's API. No third-party services, no dependencies.
 *
 *   assets/stats-{dark,light}.svg      "At a glance": public activity and primary languages
 *   assets/activity-{dark,light}.svg   Contribution heatmap for the last year
 *
 * Auth: GITHUB_TOKEN (set automatically in Actions) or, locally, `gh auth token`.
 * Usage: node scripts/generate-cards.mjs [outputDir]      (default: assets)
 *
 * Honesty rules baked in:
 *  - Languages are counted once per repository by its PRIMARY language, forks and archived repos excluded,
 *    so a single large or vendored repository cannot skew the picture (byte counts would).
 *  - Only public activity is shown, and the card says so.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const USER = process.env.PROFILE_USER || "Bipin-24";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const SERIF = "Georgia,'Times New Roman',serif";

export const PALETTES = {
  dark: { bg1: "#05080F", bg2: "#0B1226", ink: "#EAF0FA", ink2: "#A3AFC4", ink3: "#7F8CA3", a1: "#7C93FF", a2: "#2EE6C8", a3: "#F6B65B", line: "rgba(255,255,255,.14)", card: "rgba(255,255,255,.05)", cell0: "rgba(255,255,255,.07)", heat: ["rgba(255,255,255,.07)", "#0E4D48", "#14877C", "#22C2AE", "#5FF0D8"] },
  light: { bg1: "#F7F9FD", bg2: "#E9EEF8", ink: "#0B1220", ink2: "#44516A", ink3: "#5B6880", a1: "#4558D6", a2: "#0B8F7B", a3: "#B86E0C", line: "rgba(11,18,32,.16)", card: "rgba(11,18,32,.04)", cell0: "rgba(11,18,32,.07)", heat: ["rgba(11,18,32,.07)", "#B6E8DF", "#6CCDBD", "#2AA38F", "#0B6F5F"] },
};

const LANG_COLORS = { Python: "#3572A5", TypeScript: "#3178C6", JavaScript: "#E5C21B", HTML: "#E34C26", CSS: "#563D7C", Shell: "#4EAA25", Go: "#00ADD8", Jupyter: "#DA5B0B" };
const FALLBACK = "#7F8CA3";

/* ------------------------------ pure logic (unit-tested) ------------------------------ */

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Count each repository once by its primary language. Excludes forks, archived repos, and repos with no language. */
export function languageCounts(repos) {
  const m = new Map();
  for (const r of repos) {
    if (r.fork || r.archived || !r.language) continue;
    m.set(r.language, (m.get(r.language) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

export const originalRepoCount = (repos) => repos.filter((r) => !r.fork && !r.archived).length;

/** GitHub-style 0..4 intensity: quartiles of the NON-ZERO days, so a few huge days do not wash out the rest. */
export function heatLevels(counts) {
  const nz = counts.filter((c) => c > 0).sort((a, b) => a - b);
  const at = (p) => nz[Math.min(nz.length - 1, Math.max(0, Math.ceil(nz.length * p) - 1))];
  const q1 = nz.length ? at(0.25) : 0, q2 = nz.length ? at(0.5) : 0, q3 = nz.length ? at(0.75) : 0;
  return (c) => (c <= 0 ? 0 : c <= q1 ? 1 : c <= q2 ? 2 : c <= q3 ? 3 : 4);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (n) => Number(n).toLocaleString("en-US");

/* ------------------------------ SVG builders ------------------------------ */

const shell = (w, h, P, title, desc, body, extraCss = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.bg1}"/><stop offset="1" stop-color="${P.bg2}"/></linearGradient>
<linearGradient id="gr" x1="0" x2="1"><stop offset="0" stop-color="${P.a1}"/><stop offset="1" stop-color="${P.a2}"/></linearGradient></defs>
<style>.rise{animation:rise .8s cubic-bezier(.2,.7,.3,1) both}@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}${extraCss}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
<rect width="${w}" height="${h}" rx="20" fill="url(#bg)"/><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="19.5" fill="none" stroke="${P.line}"/>
${body}
</svg>
`;

export function statsSvg(d, P) {
  const nums = [
    [fmt(d.total), "contributions", "last 12 months", "a2"],
    [fmt(d.commits), "commits", "public", "a1"],
    [fmt(d.prs), "pull requests", "opened", "a3"],
    [fmt(d.repos), "original repos", "forks excluded", "a2"],
  ];
  const langs = d.languages.slice(0, 5);
  const max = Math.max(1, ...langs.map((l) => l[1]));
  let body = `<text x="40" y="46" font-family="${MONO}" font-size="11.5" font-weight="700" letter-spacing="2.4" fill="${P.ink3}">AT A GLANCE</text>
<text x="40" y="68" font-family="${MONO}" font-size="11.5" fill="${P.ink3}">public activity on GitHub · refreshed daily</text>`;
  nums.forEach(([v, k, sub, c], i) => {
    const x = 40 + (i % 2) * 210, y = 120 + Math.floor(i / 2) * 78;
    body += `<g class="rise" style="animation-delay:${i * 90}ms"><text x="${x}" y="${y}" font-family="${SERIF}" font-size="44" font-weight="500" letter-spacing="-1" fill="${P[c]}">${esc(v)}</text>
<text x="${x}" y="${y + 20}" font-family="${MONO}" font-size="12" font-weight="700" fill="${P.ink}">${esc(k)}</text><text x="${x}" y="${y + 36}" font-family="${MONO}" font-size="10.5" fill="${P.ink3}">${esc(sub)}</text></g>`;
  });
  body += `<line x1="470" y1="40" x2="470" y2="${d.h - 40}" stroke="${P.line}" stroke-dasharray="3 5"/>
<text x="500" y="46" font-family="${MONO}" font-size="11.5" font-weight="700" letter-spacing="2.4" fill="${P.ink3}">PRIMARY LANGUAGE, BY REPO</text>`;
  langs.forEach(([name, n], i) => {
    const y = 78 + i * 34, w = Math.max(10, Math.round((n / max) * 215));
    body += `<g class="rise" style="animation-delay:${200 + i * 80}ms"><text x="500" y="${y + 13}" font-family="${MONO}" font-size="12.5" font-weight="700" fill="${P.ink}">${esc(name)}</text>
<rect x="615" y="${y}" width="215" height="16" rx="8" fill="${P.card}"/><rect x="615" y="${y}" width="${w}" height="16" rx="8" fill="${LANG_COLORS[name] ?? FALLBACK}"/>
<text x="${615 + w + 8}" y="${y + 13}" font-family="${MONO}" font-size="12" fill="${P.ink2}">${n}</text></g>`;
  });
  body += `<text x="500" y="${d.h - 38}" font-family="${MONO}" font-size="10" fill="${P.ink3}">One count per repo, by its primary language.</text><text x="500" y="${d.h - 23}" font-family="${MONO}" font-size="10" fill="${P.ink3}">Forks and archived repos are excluded.</text>`;
  const desc = `${d.total} public contributions in the last 12 months: ${d.commits} commits and ${d.prs} pull requests. ${d.repos} original repositories. Primary languages by repository: ${langs.map((l) => `${l[0]} ${l[1]}`).join(", ")}.`;
  return shell(880, d.h, P, "GitHub activity at a glance", desc, body);
}

export function activitySvg(d, P) {
  const cell = 12, gap = 3, step = cell + gap, left = 40, top = 96;
  const weeks = d.weeks, w = 880, h = top + 7 * step + 62;
  const level = heatLevels(weeks.flatMap((wk) => wk.map((x) => x.count)));
  let body = `<text x="40" y="40" font-family="${MONO}" font-size="11.5" font-weight="700" letter-spacing="2.4" fill="${P.ink3}">CONTRIBUTIONS</text>
<text x="40" y="60" font-family="${MONO}" font-size="12.5" fill="${P.ink}"><tspan font-weight="700" fill="${P.a2}">${fmt(d.total)}</tspan> public contributions in the last year</text>`;
  let lastMonth = -1;
  weeks.forEach((wk, i) => {
    if (!wk.length) return;
    const m = Number(wk[0].date.slice(5, 7)) - 1;
    if (m !== lastMonth && i <= weeks.length - 3) body += `<text x="${left + i * step}" y="${top - 10}" font-family="${MONO}" font-size="10" fill="${P.ink3}">${MONTHS[m]}</text>`;
    lastMonth = m;
  });
  ["Mon", "Wed", "Fri"].forEach((n, i) => { body += `<text x="${left - 8}" y="${top + (1 + i * 2) * step + 10}" text-anchor="end" font-family="${MONO}" font-size="9.5" fill="${P.ink3}">${n}</text>`; });
  weeks.forEach((wk, i) => wk.forEach((day) => {
    const lv = level(day.count);
    body += `<rect x="${left + i * step}" y="${top + day.weekday * step}" width="${cell}" height="${cell}" rx="2.5" fill="${P.heat[lv]}"><title>${day.count} on ${day.date}</title></rect>`;
  }));
  const ly = top + 7 * step + 22;
  body += `<text x="${left}" y="${ly + 10}" font-family="${MONO}" font-size="10" fill="${P.ink3}">Less</text>`;
  P.heat.forEach((c, i) => { body += `<rect x="${left + 34 + i * 17}" y="${ly}" width="12" height="12" rx="2.5" fill="${c}"/>`; });
  body += `<text x="${left + 34 + 5 * 17 + 4}" y="${ly + 10}" font-family="${MONO}" font-size="10" fill="${P.ink3}">More</text>
<text x="${w - 40}" y="${ly + 10}" text-anchor="end" font-family="${MONO}" font-size="10" fill="${P.ink3}">Public contributions only. Private work is not shown.</text>`;
  return shell(w, h, P, "Contribution heatmap", `${d.total} public GitHub contributions in the last year, shown as a heatmap by day.`, body);
}

/* ------------------------------ data fetching ------------------------------ */

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try { return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim(); } catch { throw new Error("No GITHUB_TOKEN set and `gh auth token` failed."); }
}

async function gh(path, tok, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "profile-cards", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export async function fetchData(user, tok) {
  const repos = [];
  for (let page = 1; page < 10; page++) {
    const batch = await gh(`/users/${user}/repos?per_page=100&type=owner&page=${page}`, tok);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const q = `query($login:String!){ user(login:$login){ contributionsCollection { totalCommitContributions totalPullRequestContributions
    contributionCalendar { totalContributions weeks { contributionDays { contributionCount date weekday } } } } } }`;
  const g = await gh("/graphql", tok, { query: q, variables: { login: user } });
  if (g.errors) throw new Error("GraphQL: " + JSON.stringify(g.errors).slice(0, 300));
  const c = g.data.user.contributionsCollection;
  return {
    languages: languageCounts(repos),
    repos: originalRepoCount(repos),
    total: c.contributionCalendar.totalContributions,
    commits: c.totalCommitContributions,
    prs: c.totalPullRequestContributions,
    weeks: c.contributionCalendar.weeks.map((w) => w.contributionDays.map((d) => ({ count: d.contributionCount, date: d.date, weekday: d.weekday }))),
  };
}

async function main() {
  const out = process.argv[2] || "assets";
  mkdirSync(out, { recursive: true });
  const data = await fetchData(USER, token());
  data.h = 270; // fixed card height so the README layout never jumps
  for (const [theme, P] of Object.entries(PALETTES)) {
    writeFileSync(join(out, `stats-${theme}.svg`), statsSvg(data, P));
    writeFileSync(join(out, `activity-${theme}.svg`), activitySvg(data, P));
  }
  console.log(`wrote cards for ${USER}: ${data.total} contributions, ${data.repos} original repos, languages ${data.languages.map((l) => l.join(":")).join(" ")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main().catch((e) => { console.error(e.message); process.exit(1); });
