// Cosmetics shop.
import { PROG } from './progress.js';
import { saveProg } from './net.js';
import { ptsFree } from './lab.js';
import { seasonInfo } from './season.js';

/* ---------- shop: data cores for cosmetics ---------- */
export const SHOP=[['volt','skin',30],['ember','skin',30],['neon','skin',30],['frost','skin',30],['aurora','skin',30],['void','skin',30],['toxic','skin',30],['rose','skin',30],['eclipse','skin',30],['plasma','skin',60],['royal','skin',60],
 ['spark','fx',15],['pixel','fx',15],['nova','fx',15],['confetti','fx',15],['ice','fx',15],['glitch','fx',15]].map(([id,k,cost])=>({id:/** @type {string} */(id),k:/** @type {string} */(k),cost:/** @type {number} */(cost)}));
const shopKey=it=>it.k==='fx'?'fx:'+it.id:it.id;
export const shopOwned=it=>!!(PROG.own&&PROG.own[shopKey(it)]);
// rewards of the running season stay on its track; the shop sells them once the season is over
export function shopSeasonTier(it){const def=seasonInfo().def,i=(it.k==='skin'?def.skins:def.fx).indexOf(it.id);return i<0?0:it.k==='skin'?(i+1)*10:i*10+5}
export function shopBuy(id){const it=SHOP.find(x=>x.id===id);if(!it||shopOwned(it)||shopSeasonTier(it)||ptsFree()<it.cost)return false;
  PROG.buy=PROG.buy||{};PROG.buy[shopKey(it)]=it.cost;(PROG.own||(PROG.own={}))[shopKey(it)]=1;saveProg();return true}
