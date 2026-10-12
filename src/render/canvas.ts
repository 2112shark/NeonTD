// Battlefield canvas, view size (tile, W, H, dpr) and shared drawing primitives.
import { $, COLS, ROWS, hexA } from '../core/util.ts';
import { S } from '../core/state.ts';
import { radKey, renderRadial, setRadKey } from '../ui/radial.js';
import { buildBg } from './map.ts';

type Ctx = CanvasRenderingContext2D;

export const cv=$<HTMLCanvasElement>('#cv'), ctx=cv.getContext('2d')!;
export let tile=32,W=384,H=480,dpr=1;
// pre-rendered map background, redrawn by buildBg()
export const bgc=document.createElement('canvas'), bgx=bgc.getContext('2d')!;
const glowCache: Record<string, HTMLCanvasElement>={};
// cached radial glow sprite per color
function gs(col: string){if(glowCache[col])return glowCache[col];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,hexA(col,.85));gr.addColorStop(.28,hexA(col,.3));gr.addColorStop(1,hexA(col,0));
  g.fillStyle=gr;g.fillRect(0,0,64,64);return glowCache[col]=c}
/** soft glow of radius r */
export function glow(g: Ctx,x: number,y: number,r: number,col: string,a: number){g.globalAlpha=a;g.drawImage(gs(col),x-r,y-r,r*2,r*2);g.globalAlpha=1}
/** regular n-gon path around the origin */
export function poly(g: Ctx,n: number,r: number,rot=0){g.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*Math.PI*2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath()}
/** rounded rectangle path, plain rectangle on browsers without roundRect */
export function rr(g: Ctx,x: number,y: number,w: number,h: number,r: number){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)}

/* ---------- loop ---------- */
export function fit(){
  const st=$<HTMLElement>('#stage'),w=st.clientWidth,h=st.clientHeight;
  tile=Math.max(12,Math.floor(Math.min(w/COLS,h/ROWS)));W=tile*COLS;H=tile*ROWS;dpr=Math.min(2,devicePixelRatio||1);
  cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';buildBg();if(S&&S.rad){setRadKey('');renderRadial()}
}
