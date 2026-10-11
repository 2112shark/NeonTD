// Draws one frame of the battle.
import { COLS, ROWS, clamp, d2, hexA, rng } from '../core/util.js';
import { H, W, bgc, ctx, cv, dpr, glow, poly, rr, tile } from './canvas.js';
import { S } from '../core/state.js';
import { lab } from '../meta/lab.js';
import { SYN, TD } from '../data/towers.js';
import { ED } from '../data/enemies.js';
import { genWave } from '../core/waves.js';
import { stats, synFor, tcost } from '../core/stats.js';
import { canBuild } from '../core/actions.js';
import { tutTile } from '../ui/tutorial.js';
import { THEMES, drawDeco } from './map.js';
import { drawTowerShape } from './towers.js';
import { drawEnemy } from './enemies.js';

function lightning(g,pts,seed){
  const R=rng(seed|0);g.beginPath();g.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=5;for(let k=1;k<=n;k++){const q=k/n,j=k===n?0:(R()-.5)*.25;g.lineTo(a.x+(b.x-a.x)*q+j,a.y+(b.y-a.y)*q+j)}}
  g.stroke();
}
function showR(t,s,col,valid){ctx.beginPath();ctx.arc(t.x,t.y,s.range,0,7);ctx.fillStyle=hexA(valid?col:'#ff4d6d',.07);ctx.fill();ctx.setLineDash([.15,.1]);ctx.lineDashOffset=-S.time*.5;ctx.strokeStyle=hexA(valid?col:'#ff4d6d',.6);ctx.lineWidth=.03;ctx.stroke();ctx.setLineDash([])}
const coreRatio=i=>S.coreHp?S.coreHp[i]/Math.max(1,S.coreMax):S.lives/Math.max(1,S.maxLives);
function drawGate(g,x,y,col,time){g.save();g.translate(x,y);g.lineCap='round';g.strokeStyle=col;g.lineWidth=.06;
  for(let k=0;k<3;k++){const a=time*1.4+k*2.094;g.beginPath();g.arc(0,0,.37,a,a+1.25);g.stroke()}
  g.strokeStyle=hexA(col,.5);g.lineWidth=.03;for(let k=0;k<3;k++){const a=-time*2.2+k*2.094;g.beginPath();g.arc(0,0,.24,a,a+1);g.stroke()}g.restore()}
// core: hex reactor with pylons, flickers when integrity is low
function drawCore(g,x,y,lr,time,shieldT){
  const coreCol=lr<.3?(Math.sin(time*12)>0?'#ff2e4d':'#ff9aae'):'#ff4d8a';
  g.save();g.translate(x,y);g.fillStyle='#170a16';g.strokeStyle=hexA('#ff4d8a',.7);g.lineWidth=.025;
  for(let k=0;k<3;k++){g.save();g.rotate(time*.25+k*2.094);rr(g,.3,-.065,.17,.13,.03);g.fill();g.stroke();g.fillStyle=hexA('#ff4d8a',.8);g.fillRect(.41,-.025,.04,.05);g.fillStyle='#170a16';g.restore()}
  poly(g,6,.36,0);g.fillStyle='#12091a';g.fill();g.strokeStyle=coreCol;g.lineWidth=.05;g.stroke();
  poly(g,6,.22,-time*1.5);g.lineWidth=.035;g.stroke();
  g.beginPath();g.arc(0,0,.08+.03*Math.sin(time*4),0,7);g.fillStyle='#fff';g.fill();
  if(shieldT>0){g.strokeStyle=hexA('#6dff9e',shieldT<3?(Math.sin(time*14)>0?.9:.3):.9);g.lineWidth=.06;poly(g,6,.85,time*.5);g.stroke();g.fillStyle='rgba(109,255,158,.08)';g.fill()}
  g.restore()}
// fork switch: a round button on the junction with an arrow into the active branch
export function drawSwitch(g,m,sw,time){const ft=m.routes[0].pts[m.fork],x=ft[0]+.5,y=ft[1]+.5,rt=m.routes[sw],a=rt.path[m.fork],b=rt.path[m.fork+1],ang=Math.atan2(b.y-a.y,b.x-a.x),p=.5+.5*Math.sin(time*4);
  g.save();g.translate(x,y);g.beginPath();g.arc(0,0,.42,0,7);g.fillStyle='rgba(5,7,15,.88)';g.fill();g.strokeStyle=hexA('#ffe14d',.55+.35*p);g.lineWidth=.045;g.stroke();
  g.rotate(ang);g.fillStyle='#ffe14d';g.beginPath();g.moveTo(.28,0);g.lineTo(-.06,-.2);g.lineTo(.02,0);g.lineTo(-.06,.2);g.closePath();g.fill();
  g.beginPath();g.moveTo(.04,0);g.lineTo(-.28,-.2);g.lineTo(-.2,0);g.lineTo(-.28,.2);g.closePath();g.fillStyle=hexA('#ffe14d',.45);g.fill();g.restore()}
// a tower hit by a jammer or by the Wrecker: dark veil, sparks and a countdown ring
function drawDisabled(g,t,time){const off=t.off>0,col=off?'#ff6a2e':'#ff3dc8',x=t.x,y=t.y,R=rng((time*14|0)+t.c*7+t.r*13);
  g.save();g.fillStyle='rgba(5,7,15,.5)';rr(g,x-.42,y-.42,.84,.84,.14);g.fill();
  g.strokeStyle=hexA(col,.9);g.lineWidth=.03;g.beginPath();
  for(let k=0;k<2;k++){let px=x-.3+R()*.6,py=y-.3+R()*.6;g.moveTo(px,py);for(let s=0;s<3;s++){px+=(R()-.5)*.32;py+=(R()-.5)*.32;g.lineTo(px,py)}}g.stroke();
  const left=off?t.off/6:t.jam/2.2;g.strokeStyle=hexA(col,.95);g.lineWidth=.045;g.beginPath();g.arc(x,y,.47,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(left,0,1));g.stroke();g.restore()}
function showAura(t){ctx.save();ctx.setLineDash([.15,.1]);ctx.lineDashOffset=-S.time*.5;ctx.strokeStyle=hexA('#ffd84d',.7);ctx.lineWidth=.035;ctx.strokeRect(t.c-1+.04,t.r-1+.04,2.92,2.92);ctx.fillStyle='rgba(255,216,77,.05)';ctx.fillRect(t.c-1,t.r-1,3,3);ctx.restore()}
function link(a,b,col,alpha){ctx.strokeStyle=hexA(col,alpha);ctx.lineWidth=.05;ctx.setLineDash([.08,.1]);ctx.lineDashOffset=-S.time*.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([])}
export function draw(){
  const m=S.map;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
  let sx=0,sy=0;if(S.shake>0){sx=(Math.random()-.5)*S.shake*.25;sy=(Math.random()-.5)*S.shake*.25}
  ctx.drawImage(bgc,sx*tile*dpr,sy*tile*dpr);
  ctx.setTransform(dpr*tile,0,0,dpr*tile,sx*dpr*tile,sy*dpr*tile);
  const th=THEMES[m.th||'net'];drawDeco(ctx,m,S.time);
  m.routes.forEach((rt,i)=>{const act=m.fork==null||i===S.sw;ctx.save();ctx.beginPath();rt.path.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.setLineDash([.12,.6]);ctx.lineDashOffset=-S.time*1.4;ctx.strokeStyle=`rgba(${th.edge},${act?.35:.1})`;ctx.lineWidth=.05;ctx.lineCap='round';ctx.stroke();ctx.restore()});
  if(S.wave>=4||S.enemies.some(e=>e.air)){const warn=!S.waveActive&&!S.flow&&genWave(S.wave+1).some(o=>ED[o.t].air||o.t==='carrier'||o.t==='queen');
    m.routes.forEach((rt,i)=>{if(m.fork!=null&&i!==S.sw)return;const a=rt.air;ctx.save();ctx.beginPath();a.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.setLineDash([.06,.22]);ctx.lineDashOffset=-S.time*.9;
      ctx.strokeStyle=hexA('#4dffd2',warn?.35+.25*Math.sin(S.time*5):.16);ctx.lineWidth=warn?.06:.04;ctx.stroke();ctx.restore()})}
  ctx.globalCompositeOperation='lighter';
  m.cores.forEach((c,i)=>{const lr=coreRatio(i);glow(ctx,c.x,c.y,1+Math.sin(S.time*3)*.1,'#ff2e6a',.35+.3*lr+(S.flash>0?.4:0));if(S.shieldT>0)glow(ctx,c.x,c.y,1.6,'#6dff9e',.6)});
  for(const gt of m.gates)glow(ctx,gt.x,gt.y,1+.08*Math.sin(S.time*2),th.gate,.4);
  ctx.globalCompositeOperation='source-over';
  for(const gt of m.gates)drawGate(ctx,gt.x,gt.y,th.gate,S.time);
  m.cores.forEach((c,i)=>drawCore(ctx,c.x,c.y,coreRatio(i),S.time,S.shieldT));
  if(m.fork!=null)drawSwitch(ctx,m,S.sw,S.time);
  // radial tile highlight
  const tt=tutTile();if(tt&&!(S.rad&&S.rad.c===tt[0]&&S.rad.r===tt[1])){const [c,r]=tt,p=.5+.5*Math.sin(S.time*6);ctx.fillStyle=hexA('#3df0ff',.12+.18*p);ctx.fillRect(c+.06,r+.06,.88,.88);ctx.strokeStyle=hexA('#3df0ff',.6+.4*p);ctx.lineWidth=.06;ctx.strokeRect(c+.06,r+.06,.88,.88);
    ctx.fillStyle='#3df0ff';ctx.beginPath();const ay=r-.15-.15*p;ctx.moveTo(c+.5,ay);ctx.lineTo(c+.3,ay-.3);ctx.lineTo(c+.7,ay-.3);ctx.closePath();ctx.fill()}
  if(S.rad&&!S.sel){const {c,r}=S.rad;ctx.strokeStyle=hexA('#3df0ff',.6+.3*Math.sin(S.time*6));ctx.lineWidth=.05;ctx.strokeRect(c+.06,r+.06,.88,.88)}
  if(S.sel){const s=stats(S.sel);if(S.sel.type==='gen')showAura(S.sel);else showR(S.sel,s,TD[S.sel.type].col,true);
    if(S.rsel==='up'||S.rsel==='A'||S.rsel==='B'){const nx={...S.sel};if(S.rsel==='up')nx.lvl++;else nx.br=S.rsel;const ns=stats(nx);
      if(ns.range>s.range+.01){ctx.strokeStyle=hexA('#6dff9e',.8);ctx.lineWidth=.035;ctx.beginPath();ctx.arc(S.sel.x,S.sel.y,ns.range,0,7);ctx.stroke()}}}
  // synergy links
  for(const l of S.links)link(l.a,l.b,l.col,.35+.15*Math.sin(S.time*3));
  for(const t of S.towers)drawTowerShape(ctx,t,S.time);
  for(const t of S.towers)if(t.off>0||t.jam>0)drawDisabled(ctx,t,S.time);
  // preview ghost
  const ghostOf=(type,c,r)=>{const g={type,c,r,x:c+.5,y:r+.5,lvl:1,br:null,ang:-Math.PI/2,rc:0};g.syn=synFor(type,c,r,null);return g};
  const pv=S.preview||(S.place&&S.hover&&!S.rad?{type:S.place,c:S.hover[0],r:S.hover[1]}:null);
  if(pv&&pv.c>=0&&pv.r>=0&&pv.c<COLS&&pv.r<ROWS){
    if(canBuild(pv.c,pv.r)){const g=ghostOf(pv.type,pv.c,pv.r);g.node=S.grid[pv.r][pv.c]===3;if(pv.type==='gen')showAura(g);else showR(g,stats(g),TD[pv.type].col,S.gold>=tcost(pv.type));
      for(const u of S.towers)if(Math.max(Math.abs(u.c-pv.c),Math.abs(u.r-pv.r))<=1&&(SYN.some(s=>s.to===pv.type&&s.from===u.type)||SYN.some(s=>s.to===u.type&&s.from===pv.type)))link(u,g,'#6dff9e',.8);
      drawTowerShape(ctx,g,S.time,.65)}
    else if(!S.preview){ctx.strokeStyle='rgba(255,77,109,.8)';ctx.lineWidth=.04;ctx.strokeRect(pv.c+.08,pv.r+.08,.84,.84)}}
  // lasers
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const t of S.towers){if(t.type!=='laser'||!t.beams.length)continue;const c=TD[t.type].col;
    for(const e of t.beams){const ox=t.x+Math.cos(t.ang)*.35,oy=t.y+Math.sin(t.ang)*.35,ey2=e.y-(e.air?.12:0),w=.07*(t.fm||1)**.6+Math.random()*.02;
      ctx.strokeStyle=hexA(c,.45);ctx.lineWidth=w*2.2;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(e.x,ey2);ctx.stroke();
      ctx.strokeStyle='#fff';ctx.lineWidth=w*.5;ctx.stroke();glow(ctx,e.x,ey2,.35,c,.8);glow(ctx,ox,oy,.25,c,.8)}}
  ctx.globalCompositeOperation='source-over';
  for(const w of S.wells){const a=Math.min(1,w.t/.35,(w.max-w.t)/.25+.25),A=w.kind==='A',col=A?'#c9b8ff':w.kind==='B'?'#7dd8ff':'#6d8bff';ctx.save();ctx.translate(w.x,w.y);
    ctx.globalCompositeOperation='lighter';glow(ctx,0,0,w.r*1.25,col,.32*a);ctx.globalCompositeOperation='source-over';
    for(let k=0;k<3;k++){ctx.save();ctx.rotate(S.time*(2+k*.6)+k*2);ctx.strokeStyle=hexA(col,.55*a);ctx.lineWidth=.03;ctx.beginPath();ctx.arc(0,0,w.r*(.38+k*.24),0,3.6);ctx.stroke();ctx.restore()}
    ctx.fillStyle=`rgba(3,4,14,${(A?.8:.5)*a})`;ctx.beginPath();ctx.arc(0,0,w.r*(A?.24:.16),0,7);ctx.fill();ctx.restore()}
  for(const e of S.enemies)if(!e.air||e.gnd>0)drawEnemy(e);
  for(const e of S.enemies)if(e.air&&!(e.gnd>0))drawEnemy(e);
  if(S.focus){const e=S.focus.e,ey=e.y-(e.air?.12:0),r=e.d.r+.2;
    ctx.strokeStyle=hexA('#ff4d6d',.25);ctx.lineWidth=.02;ctx.setLineDash([.05,.08]);
    for(const t of S.towers){if(t.off>0||t.jam>0||(e.air&&!TD[t.type].air))continue;const s=stats(t);if(d2(t,e)<=s.range*s.range){ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.lineTo(e.x,ey);ctx.stroke()}}ctx.setLineDash([]);
    ctx.save();ctx.translate(e.x,ey);ctx.rotate(S.time*2);ctx.strokeStyle='#ff4d6d';ctx.lineWidth=.045;
    for(let k=0;k<4;k++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(r,-.11);ctx.lineTo(r,.11);ctx.moveTo(r-.03,0);ctx.lineTo(r+.13,0);ctx.stroke()}ctx.restore()}
  for(const p of S.proj){if(p.delay>0)continue;const q=Math.min(1,p.p),h=Math.sin(Math.PI*q)*p.h;
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(p.x,p.y+.05,.08,.04,0,0,7);ctx.fill();
    ctx.globalCompositeOperation='lighter';glow(ctx,p.x,p.y-h,.3,'#ffae3d',.9);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#fff3dc';ctx.beginPath();ctx.arc(p.x,p.y-h,.07,0,7);ctx.fill()}
  for(const b of S.bshots){const q=Math.min(1,b.p),h=Math.sin(Math.PI*q)*.8;
    ctx.strokeStyle=hexA('#ff6a2e',.8);ctx.lineWidth=.035;ctx.beginPath();ctx.arc(b.t.x,b.t.y,.48*(1-q*.4),0,7);ctx.stroke();
    ctx.globalCompositeOperation='lighter';glow(ctx,b.x,b.y-h,.4,'#ff6a2e',.95);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#ffd2b0';ctx.beginPath();ctx.arc(b.x,b.y-h,.08,0,7);ctx.fill()}
  // strikes warning
  for(const st of S.strikes){const q=1-st.t/.7;ctx.strokeStyle=hexA('#ff4fd8',.5+.5*Math.sin(S.time*30));ctx.lineWidth=.05;ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,7);ctx.stroke();
    ctx.fillStyle=hexA('#ff4fd8',.12+q*.2);ctx.fill();ctx.beginPath();ctx.arc(st.x,st.y,st.r*(1-q),0,7);ctx.stroke()}
  // aim ring
  if(S.aim==='orbital'&&S.hover){const [c,r]=S.hover,x=c+.5,y=r+.5,rad=1.5*(lab('orb')?1.2:1);ctx.strokeStyle=hexA('#ff4fd8',.9);ctx.setLineDash([.12,.08]);ctx.lineDashOffset=-S.time;ctx.lineWidth=.04;ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x-.25,y);ctx.lineTo(x+.25,y);ctx.moveTo(x,y-.25);ctx.lineTo(x,y+.25);ctx.stroke()}
  ctx.globalCompositeOperation='lighter';
  for(const f of S.fx){const a=f.life/f.max,q=1-a;
    if(f.k==='ring'){ctx.strokeStyle=hexA(f.col,a*.8);ctx.lineWidth=.06*a+.01;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.3+.7*q),0,7);ctx.stroke();ctx.fillStyle=hexA(f.col,a*.08);ctx.fill()}
    else if(f.k==='boom'){glow(ctx,f.x,f.y,f.r*1.6*(.5+q),f.col,a);ctx.strokeStyle=hexA('#ffdca0',a);ctx.lineWidth=.05*a;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.2+.9*q),0,7);ctx.stroke()}
    else if(f.k==='pop'){ctx.strokeStyle=hexA(f.col,a);ctx.lineWidth=.04*a;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.3+q),0,7);ctx.stroke();glow(ctx,f.x,f.y,f.r*1.2,f.col,a*.8)}
    else if(f.k==='arc'){ctx.strokeStyle=hexA(f.col,a*.6);ctx.lineWidth=.12;lightning(ctx,f.pts,f.seed+(f.life*30|0));ctx.strokeStyle=hexA('#ffffff',a);ctx.lineWidth=.03;lightning(ctx,f.pts,f.seed+(f.life*30|0))}
    else if(f.k==='trace'){ctx.strokeStyle=hexA(f.col,a*.5);ctx.lineWidth=.1*a;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke();ctx.strokeStyle=hexA('#ffffff',a);ctx.lineWidth=.025;ctx.stroke()}
    else if(f.k==='beam'){const w=f.r*.7*a;const g=ctx.createLinearGradient(f.x-w,0,f.x+w,0);g.addColorStop(0,hexA(f.col,0));g.addColorStop(.5,hexA('#ffffff',a));g.addColorStop(1,hexA(f.col,0));ctx.fillStyle=g;ctx.fillRect(f.x-w,-1,w*2,f.y+1)}
    else if(f.k==='heal'){ctx.strokeStyle=hexA(f.col,a*.7);ctx.lineWidth=.04*a+.01;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.2+.8*q),0,7);ctx.stroke();ctx.fillStyle=hexA(f.col,a*.06);ctx.fill()}
    else if(f.k==='jam'){const R=rng(f.seed|0),rr2=f.r*(.3+.7*q);ctx.strokeStyle=hexA(f.col,a*.85);ctx.lineWidth=.035;ctx.beginPath();for(let k=0;k<=24;k++){const an=k/24*Math.PI*2,j=rr2+(R()-.5)*.2;k?ctx.lineTo(f.x+Math.cos(an)*j,f.y+Math.sin(an)*j):ctx.moveTo(f.x+Math.cos(an)*j,f.y+Math.sin(an)*j)}ctx.stroke()}
    else if(f.k==='blink'){ctx.strokeStyle=hexA(f.col,a*.7);ctx.lineWidth=.09*a;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x2,f.y2);ctx.stroke();glow(ctx,f.x,f.y,.5,f.col,a*.6);glow(ctx,f.x2,f.y2,.6,f.col,a)}
    else if(f.k==='glitch'){const R=rng((f.seed|0)+(f.life*40|0));for(let k=0;k<5;k++){const yy=f.y-f.r+R()*f.r*2,w=f.r*(.6+R()*1.4);ctx.fillStyle=hexA(k%2?f.col:'#ffffff',a*.7);ctx.fillRect(f.x-w/2+(R()-.5)*.3,yy,w,.05+R()*.06)}}
    else if(f.k==='lock'){ctx.strokeStyle=hexA(f.col,a);ctx.lineWidth=.04;const s=f.r*(.4+.6*a);ctx.strokeRect(f.x-s,f.y-s,s*2,s*2)}
    else if(f.k==='emp'){ctx.strokeStyle=hexA(f.col,a);ctx.lineWidth=.15*a+.02;ctx.beginPath();ctx.arc(f.x,f.y,f.r*q,0,7);ctx.stroke();ctx.strokeStyle=hexA('#ffffff',a*.6);ctx.lineWidth=.03;ctx.beginPath();ctx.arc(f.x,f.y,f.r*q*.85,0,7);ctx.stroke()}
  }
  for(const p of S.parts){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.col;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.textAlign='center';ctx.textBaseline='middle';
  for(const t of S.texts){ctx.globalAlpha=Math.min(1,t.life/t.max*2);ctx.font=`700 ${Math.round(t.size*tile)}px "JetBrains Mono",monospace`;
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(t.s,t.x*tile+1,t.y*tile+1);ctx.fillStyle=t.col;ctx.fillText(t.s,t.x*tile,t.y*tile)}
  ctx.globalAlpha=1;
  // boss bar
  const boss=S.enemies.find(e=>e.d.boss);
  if(boss){const bw=W*.6,bx=(W-bw)/2,by=8,f=Math.max(0,boss.hp/boss.max);ctx.fillStyle='rgba(5,7,15,.8)';ctx.fillRect(bx-4,by-4,bw+8,24);
    ctx.fillStyle='#3a1020';ctx.fillRect(bx,by+10,bw,6);ctx.fillStyle=boss.d.col;ctx.fillRect(bx,by+10,bw*f,6);
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(bx+bw*.5-1,by+8,2,10);ctx.fillRect(bx+bw*.25-1,by+8,2,10);
    if(boss.msh){ctx.fillStyle='#5cc8ff';ctx.fillRect(bx,by+16,bw*(boss.sh/boss.msh),2)}
    ctx.font='700 10px "Chakra Petch",sans-serif';ctx.fillStyle='#ffb3c0';ctx.textAlign='left';ctx.fillText(boss.d.name.toUpperCase()+(boss.phase?` · фаза ${boss.phase+1}`:'')+(S.bossLaps&&S.mis&&S.mis.boss===boss.t?' · 2-й круг':''),bx,by+3);ctx.textAlign='right';ctx.fillText(Math.ceil(boss.hp),bx+bw,by+3)}
  if(S.flash>0){ctx.fillStyle=`rgba(255,40,80,${S.flash*.35})`;ctx.fillRect(0,0,W,H)}
}
