// The Claude artifact host adds the page skeleton (doctype, <html>, <head>, <body>) itself,
// so the published file is a fragment: <title>, font links, styles, markup and the script.
// Usage: node tools/artifact-fragment.mjs dist-artifact/index.html dist-artifact/neon-td.html
import fs from 'node:fs';

const [src, out] = process.argv.slice(2);
const html = fs.readFileSync(src, 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
const keep = head
  .replace(/<meta[^>]*>\s*/gi, '') // charset and viewport come from the host skeleton
  .trim();
fs.writeFileSync(out, keep + '\n' + body.trim() + '\n');
console.log(`${out}: ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
