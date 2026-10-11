// Battlefield canvas, view size (tile, W, H, dpr) and shared drawing primitives.
import { $, COLS, ROWS, hexA } from '../core/util.ts';
import { S } from '../core/state.js';
import { radKey, renderRadial, setRadKey } from '../ui/radial.js';
import { buildBg } from './map.js';

export const cv=$('#cv'), ctx=cv.getContext('2d');
export let tile=32,W=384,H=480,dpr=1;
export const bgc=document.createElement('canvas'), bgx=bgc.getContext('2d');
const glowCache={};
function gs(col){if(glowCache[col])return glowCache[col];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,hexA(col,.85));gr.addColorStop(.28,hexA(col,.3));gr.addColorStop(1,hexA(col,0));
  g.fillStyle=gr;g.fillRect(0,0,64,64);return glowCache[col]=c}
export function glow(g,x,y,r,col,a){g.globalAlpha=a;g.drawImage(gs(col),x-r,y-r,r*2,r*2);g.globalAlpha=1}
export function poly(g,n,r,rot=0){g.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*Math.PI*2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath()}
export function rr(g,x,y,w,h,r){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)}

/* ---------- loop ---------- */
export function fit(){
  const st=$('#stage'),w=st.clientWidth,h=st.clientHeight;
  tile=Math.max(12,Math.floor(Math.min(w/COLS,h/ROWS)));W=tile*COLS;H=tile*ROWS;dpr=Math.min(2,devicePixelRatio||1);
  cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';buildBg();if(S&&S.rad){setRadKey('');renderRadial()}
}
