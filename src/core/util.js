// Small shared helpers: DOM lookup, grid size, seeded RNG, math, escaping.
export const $=s=>document.querySelector(s);
export const COLS=12, ROWS=15, MAXW=30;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- utils ---------- */
export function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
export const d2=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
export const r1=v=>Math.round(v*10)/10;
export function hashS(s){let h=7;for(const ch of s)h=Math.imul(h,31)+ch.charCodeAt(0)|0;return h}
export const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
