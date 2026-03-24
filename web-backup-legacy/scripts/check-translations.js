#!/usr/bin/env node
/**
 * Translation completeness checker.
 *
 * Compares every locale JSON against the English source and reports:
 *  - Missing keys   (in EN but not in locale)
 *  - Extra keys     (in locale but not in EN — dead translations)
 *  - Empty strings  (key exists but value is "")
 *
 * Usage:
 *   node scripts/check-translations.js           # check all locales
 *   node scripts/check-translations.js --strict  # exit 1 on any missing key
 *   node scripts/check-translations.js es uk     # check specific locales only
 *
 * Exit codes:
 *   0 — all locales complete (or --strict not set and only warnings)
 *   1 — missing keys found when --strict is set, or JSON parse error
 */

const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────

const MESSAGES_DIR = path.join(__dirname, "..", "messages");
const SOURCE_LOCALE = "en";

// Keys that are intentionally not translated (numbers, proper nouns, etc.)
// Add dot-notation paths here to suppress false positives.
const IGNORE_KEYS = new Set([
  // e.g. "footer.copyright"
]);

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const targetLocales = args.filter((a) => !a.startsWith("--"));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Load and parse a JSON messages file. Returns null on error. */
function loadMessages(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`❌ JSON parse error in ${locale}.json: ${err.message}`);
    return null;
  }
}

/**
 * Recursively flatten a nested object into dot-notation paths.
 * { a: { b: "v" } } → { "a.b": "v" }
 */
function flatten(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

/** ANSI colour helpers */
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Load source locale
  const sourceData = loadMessages(SOURCE_LOCALE);
  if (!sourceData) process.exit(1);

  const sourceFlat = flatten(sourceData);
  const sourceKeys = new Set(Object.keys(sourceFlat));

  // Determine which locales to check
  const allLocaleFiles = fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .filter((l) => l !== SOURCE_LOCALE);

  const locales =
    targetLocales.length > 0
      ? targetLocales.filter((l) => l !== SOURCE_LOCALE)
      : allLocaleFiles;

  if (locales.length === 0) {
    console.log(c.yellow("⚠ No locales to check."));
    process.exit(0);
  }

  console.log(
    c.bold(`\n🌍 Translation check — source: ${SOURCE_LOCALE}.json (${sourceKeys.size} keys)\n`)
  );

  let totalMissing = 0;
  let totalExtra = 0;
  let totalEmpty = 0;
  let parseErrors = 0;

  for (const locale of locales) {
    const data = loadMessages(locale);
    if (!data) {
      parseErrors++;
      continue;
    }

    const flat = flatten(data);
    const localeKeys = new Set(Object.keys(flat));

    const missing = [...sourceKeys].filter(
      (k) => !localeKeys.has(k) && !IGNORE_KEYS.has(k)
    );
    const extra = [...localeKeys].filter((k) => !sourceKeys.has(k));
    const empty = [...localeKeys].filter(
      (k) => sourceKeys.has(k) && flat[k] === ""
    );

    totalMissing += missing.length;
    totalExtra += extra.length;
    totalEmpty += empty.length;

    const statusIcon =
      missing.length === 0 && empty.length === 0
        ? c.green("✓")
        : c.red("✗");

    const pct = Math.round(
      ((sourceKeys.size - missing.length) / sourceKeys.size) * 100
    );

    console.log(
      `${statusIcon} ${c.bold(locale.toUpperCase())} — ${pct}% complete  ` +
        c.dim(`(${localeKeys.size} keys)`)
    );

    if (missing.length > 0) {
      console.log(c.red(`  Missing keys (${missing.length}):`));
      // Group by top-level namespace
      const grouped = {};
      for (const key of missing) {
        const ns = key.split(".")[0];
        if (!grouped[ns]) grouped[ns] = [];
        grouped[ns].push(key);
      }
      for (const [ns, keys] of Object.entries(grouped)) {
        if (keys.length <= 4) {
          for (const k of keys) {
            console.log(c.red(`    - ${k}`));
          }
        } else {
          // Show first 3, then summarise
          for (const k of keys.slice(0, 3)) {
            console.log(c.red(`    - ${k}`));
          }
          console.log(
            c.red(`    - ... and ${keys.length - 3} more in "${ns}"`)
          );
        }
      }
    }

    if (empty.length > 0) {
      console.log(c.yellow(`  Empty strings (${empty.length}):`));
      for (const k of empty.slice(0, 5)) {
        console.log(c.yellow(`    - ${k}`));
      }
      if (empty.length > 5) {
        console.log(c.yellow(`    - ... and ${empty.length - 5} more`));
      }
    }

    if (extra.length > 0) {
      console.log(
        c.dim(`  Extra keys not in EN (${extra.length}) — safe to remove:`)
      );
      for (const k of extra.slice(0, 3)) {
        console.log(c.dim(`    + ${k}`));
      }
      if (extra.length > 3) {
        console.log(c.dim(`    + ... and ${extra.length - 3} more`));
      }
    }

    if (missing.length === 0 && empty.length === 0) {
      console.log(c.green("  All keys present ✓"));
    }

    console.log();
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log(c.bold("─".repeat(50)));
  if (totalMissing === 0 && totalEmpty === 0 && parseErrors === 0) {
    console.log(c.green(c.bold("✅ All translations complete!\n")));
    process.exit(0);
  }

  if (parseErrors > 0) {
    console.log(c.red(`❌ ${parseErrors} JSON parse error(s) — fix before pushing.\n`));
    process.exit(1);
  }

  console.log(
    [
      totalMissing > 0 ? c.red(`  ${totalMissing} missing key(s)`) : null,
      totalEmpty > 0 ? c.yellow(`  ${totalEmpty} empty string(s)`) : null,
      totalExtra > 0 ? c.dim(`  ${totalExtra} extra key(s)`) : null,
    ]
      .filter(Boolean)
      .join("  |  ")
  );
  console.log();

  if (strict && totalMissing > 0) {
    console.log(
      c.red(
        "❌ Push blocked: missing translations found.\n" +
          "   Add the missing keys to all locale files, or run without --strict to warn only.\n"
      )
    );
    process.exit(1);
  }

  if (totalMissing > 0) {
    console.log(
      c.yellow(
        "⚠  Missing translations found. Add --strict to block push.\n"
      )
    );
  }

  process.exit(0);
}

main();
