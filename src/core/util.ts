// Small shared helpers: DOM lookup, grid size, seeded RNG, math, escaping.
/** DOM lookup; untyped by default for the JS modules, pass T for a typed element */
export const $=<T = any>(s: string)=>document.querySelector(s) as T;
export const COLS=12, ROWS=15, MAXW=30;
export const clamp=(v: number,a: number,b: number)=>Math.max(a,Math.min(b,v));

/* ---------- utils ---------- */
/** mulberry32: deterministic PRNG returning numbers in [0, 1) */
export function rng(a: number){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/** '#rrggbb' + alpha -> 'rgba(...)' */
export function hexA(h: string,a: number){const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
/** squared distance */
export const d2=(a: Point,b: Point)=>(a.x-b.x)**2+(a.y-b.y)**2;
export const r1=(v: number)=>Math.round(v*10)/10;
export function hashS(s: string){let h=7;for(const ch of s)h=Math.imul(h,31)+ch.charCodeAt(0)|0;return h}
const ESC: Record<string, string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
export const esc=(s: unknown)=>String(s==null?'':s).replace(/[&<>"']/g,c=>ESC[c]);
