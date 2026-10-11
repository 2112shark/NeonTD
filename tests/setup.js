// Unit tests import game modules directly. Many of them grab DOM nodes and a 2D context at import time,
// so the page markup and a few browser APIs jsdom lacks are put in place first.
import fs from 'node:fs';
import path from 'node:path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
document.body.innerHTML = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script type="module"'));

// A 2D context that accepts every call and property write and does nothing.
function fakeContext() {
  const ctx = new Proxy({}, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'measureText') return () => ({ width: 0 });
      if (p === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      return () => ctx;
    },
    set(t, p, v) { t[p] = v; return true; },
  });
  return ctx;
}
HTMLCanvasElement.prototype.getContext = function () { return this.__ctx || (this.__ctx = fakeContext()); };

globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
globalThis.requestAnimationFrame = () => 0;
