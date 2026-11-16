// Unit tests for the card generator's pure logic. Run: node scripts/test-cards.mjs
import assert from "node:assert/strict";
import { esc, languageCounts, originalRepoCount, heatLevels, statsSvg, activitySvg, PALETTES } from "./generate-cards.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok  " + name); };

t("esc escapes XML-significant characters", () => {
  assert.equal(esc(`a&b<c>d"e'f`), "a&amp;b&lt;c&gt;d&quot;e&#39;f");
});

const repos = [
  { name: "a", language: "Python" }, { name: "b", language: "Python" }, { name: "c", language: "TypeScript" },
  { name: "d", language: "Python", fork: true },           // fork: excluded
  { name: "e", language: "Go", archived: true },           // archived: excluded
  { name: "f", language: null },                           // no language: excluded from languages
  { name: "g", language: "HTML" }, { name: "h", language: "HTML" },
];
t("languageCounts: one count per repo, excludes forks/archived/null, sorted", () => {
  assert.deepEqual(languageCounts(repos), [["HTML", 2], ["Python", 2], ["TypeScript", 1]]); // tie broken alphabetically
});
t("a huge vendored repo cannot skew the count (each repo counts once)", () => {
  const skew = [...repos, { name: "venv-heavy", language: "Python", size: 250_000_000 }];
  assert.deepEqual(languageCounts(skew).find((l) => l[0] === "Python"), ["Python", 3]);
});
t("originalRepoCount excludes forks and archived, includes language-less repos", () => {
  assert.equal(originalRepoCount(repos), 6);
});

t("heatLevels: quartiles of non-zero days (hand-computed)", () => {
  const lv = heatLevels([0, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].map(lv), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
});
t("heatLevels: all-zero and single-value inputs are safe", () => {
  assert.equal(heatLevels([0, 0, 0])(0), 0);
  assert.equal(heatLevels([0, 5, 0])(5), 1);
});
t("heatLevels: one huge day does not flatten the rest", () => {
  const lv = heatLevels([1, 1, 2, 2, 3, 3, 4, 4, 500]);
  assert.ok(lv(4) >= 3 && lv(500) === 4 && lv(1) === 1);
});

const data = { total: 1669, commits: 511, prs: 62, repos: 19, h: 270, languages: [["Python", 4], ["C&C", 2]],
  weeks: [[{ count: 0, date: "2026-01-04", weekday: 0 }, { count: 3, date: "2026-01-05", weekday: 1 }], [{ count: 9, date: "2026-02-01", weekday: 0 }]] };
t("statsSvg: formats numbers, escapes names, both palettes", () => {
  for (const P of Object.values(PALETTES)) {
    const svg = statsSvg(data, P);
    assert.match(svg, /^<svg /); assert.ok(svg.includes("1,669")); assert.ok(svg.includes("C&amp;C")); assert.ok(!svg.includes("C&C"));
    assert.ok(svg.includes("Forks and archived repos are excluded."));
  }
});
t("activitySvg: renders every day cell with its weekday row and a tooltip", () => {
  const svg = activitySvg(data, PALETTES.dark);
  assert.equal((svg.match(/<title>\d+ on /g) || []).length, 3);
  assert.ok(svg.includes("Public contributions only"));
});
t("activitySvg: empty calendar does not throw", () => {
  assert.match(activitySvg({ ...data, weeks: [] }, PALETTES.light), /^<svg /);
});
console.log(`\n${n} tests passed`);
