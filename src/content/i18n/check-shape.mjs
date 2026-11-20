#!/usr/bin/env node
// Verifies that a translation file has exactly the shape of en.json:
// same keys, same array lengths, strings where en has strings, nothing left empty.
//   node src/content/i18n/check-shape.mjs ru
import { readFileSync } from 'node:fs';
const lang = process.argv[2];
const en = JSON.parse(readFileSync(new URL('./en.json', import.meta.url)));
const tr = JSON.parse(readFileSync(new URL(`./${lang}.json`, import.meta.url)));
const errs = [];
let same = 0, total = 0;
function walk(a, b, path) {
  if (typeof a === 'string') {
    total++;
    if (typeof b !== 'string' || !b.trim()) errs.push(`${path}: missing or empty`);
    else if (b === a && /[a-z]{4,}\s+[a-z]{3,}/i.test(a)) same++;
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || b.length !== a.length) return errs.push(`${path}: array length ${b?.length} ≠ ${a.length}`);
    return a.forEach((x, i) => walk(x, b[i], `${path}[${i}]`));
  }
  for (const k of Object.keys(a)) if (!(k in (b ?? {}))) errs.push(`${path}.${k}: missing`); else walk(a[k], b[k], `${path}.${k}`);
  for (const k of Object.keys(b ?? {})) if (!(k in a)) errs.push(`${path}.${k}: extra key`);
}
walk(en, tr, lang);
console.log(`${total} strings, ${same} left identical to English (sentence-like)`);
if (errs.length) { console.log(errs.slice(0, 40).join('\n')); process.exit(1); }
console.log('shape OK');
