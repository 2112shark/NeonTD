// Tower sprites.
import { hexA } from '../core/util.ts';
import { glow, poly, rr } from './canvas.js';
import { TD } from '../data/towers.ts';
import { skinCols } from '../meta/mastery.ts';

/* towers: platform grows with level, specialization changes the silhouette and accent colour */
/** @type {Record<string,string>} */
export const SPEC_COL={graviA:'#c9b8ff',graviB:'#7dd8ff',genA:'#ffe9a8',genB:'#ff9a3d',laserA:'#ffd2f6',laserB:'#b48cff',cannonA:'#ff6a3d',cannonB:'#ffd23d',cryoA:'#ffffff',cryoB:'#c9a8ff',teslaA:'#8cc8ff',teslaB:'#ffe14d',sniperA:'#ffc94d',sniperB:'#c2ff5c'};
const TURRET={
 laser(g,t,c,sc,lv,br,time,rc,alpha){
  g.rotate(t.ang||0);
  if(br==='B'){ // Призма: rotating prism with three coloured emitters
   g.save();g.rotate(time*.8);
   g.beginPath();for(let k=0;k<3;k++){const a=k*2*Math.PI/3;g.lineTo(Math.cos(a)*.29,Math.sin(a)*.29)}g.closePath();
   g.fillStyle='#1a1440';g.fill();g.lineWidth=.035;g.strokeStyle=sc;g.stroke();
   g.beginPath();for(let k=0;k<3;k++){const a=k*2*Math.PI/3+Math.PI/3;g.lineTo(Math.cos(a)*.13,Math.sin(a)*.13)}g.closePath();g.strokeStyle=hexA(sc,.5);g.lineWidth=.02;g.stroke();
   const tips=['#ff4fd8','#3df0ff','#ffe14d'];for(let k=0;k<3;k++){const a=k*2*Math.PI/3;g.fillStyle=tips[k];g.beginPath();g.arc(Math.cos(a)*.29,Math.sin(a)*.29,.06,0,7);g.fill()}
   g.restore();g.beginPath();g.arc(0,0,.08,0,7);g.fillStyle='#fff';g.fill();return}
  g.fillStyle='#1c2450';poly(g,6,.24,Math.PI/6);g.fill();g.strokeStyle=c;g.lineWidth=.03;g.stroke();
  if(lv>=3||br){poly(g,6,.16,Math.PI/6);g.strokeStyle=hexA(c,.5);g.lineWidth=.02;g.stroke()}
  if(br==='A'){ // Фокус: long lens barrel with focusing rings, brighter while the beam holds a target
   const f=t.fm||1,ph=time*(2+f*3);
   g.fillStyle=c;g.beginPath();g.moveTo(.04,-.07);g.lineTo(.44,-.045);g.lineTo(.44,.045);g.lineTo(.04,.07);g.closePath();g.fill();
   for(const px of[.2,.33]){g.strokeStyle=sc;g.lineWidth=.028;g.beginPath();g.ellipse(px,0,.035,.12+.018*Math.sin(ph+px*9),0,0,7);g.stroke()}
   g.globalCompositeOperation='lighter';glow(g,.47,0,.18+.06*f,sc,.8*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
   g.fillStyle='#fff';g.beginPath();g.arc(.47,0,.045+.012*f,0,7);g.fill();
  }else{
   const L=lv>=3?.37:lv>=2?.33:.3;g.fillStyle=c;rr(g,.05,-.055,L,.11,.03);g.fill();
   if(lv>=2){g.strokeStyle=hexA('#ffffff',.75);g.lineWidth=.022;g.beginPath();g.moveTo(.21,-.06);g.lineTo(.21,.06);if(lv>=3){g.moveTo(.3,-.06);g.lineTo(.3,.06)}g.stroke()}
   if(lv>=3){g.fillStyle=hexA(c,.85);g.beginPath();g.moveTo(-.1,-.24);g.lineTo(.02,-.17);g.lineTo(-.1,-.12);g.closePath();g.moveTo(-.1,.24);g.lineTo(.02,.17);g.lineTo(-.1,.12);g.closePath();g.fill()}
  }
  g.beginPath();g.arc(0,0,br==='A'?.1+.03*Math.sin(time*8):.1,0,7);g.fillStyle='#fff';g.fill();
 },
 cannon(g,t,c,sc,lv,br,time,rc,alpha){
  if(br==='A'){ // Мортира: squat top-down mortar on struts
   g.strokeStyle=hexA(c,.85);g.lineWidth=.045;g.lineCap='round';g.beginPath();for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;g.moveTo(Math.cos(a)*.16,Math.sin(a)*.16);g.lineTo(Math.cos(a)*.36,Math.sin(a)*.36)}g.stroke();
   const pr=.28-rc*.5;g.beginPath();g.arc(0,0,pr,0,7);g.fillStyle='#2a1610';g.fill();g.lineWidth=.06;g.strokeStyle=sc;g.stroke();
   g.beginPath();g.arc(0,0,pr*.6,0,7);g.fillStyle='#070302';g.fill();g.strokeStyle=hexA(c,.6);g.lineWidth=.02;g.stroke();
   g.rotate(t.ang||0);g.fillStyle=sc;g.beginPath();g.arc(pr+.03,0,.04,0,7);g.fill();return}
  g.rotate(t.ang||0);
  g.fillStyle='#1f2447';poly(g,8,.26,Math.PI/8);g.fill();g.strokeStyle=c;g.lineWidth=.03;g.stroke();
  if(lv>=2||br){g.fillStyle=hexA(c,.85);for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;g.beginPath();g.arc(Math.cos(a)*.19,Math.sin(a)*.19,.024,0,7);g.fill()}}
  if(br==='B'){ // Залп: rotary triple barrel
   const ph=time*(t.rc>0?24:2.5);
   const bs=[0,1,2].map(k=>({o:Math.sin(ph+k*2.094)*.11,z:Math.cos(ph+k*2.094)})).sort((a,b)=>a.z-b.z);
   for(const b of bs){g.fillStyle=b.z>0?sc:hexA(sc,.5);rr(g,.02-rc,b.o-.042,.38,.084,.02);g.fill()}
   g.beginPath();g.arc(0,0,.13,0,7);g.fillStyle='#2b2140';g.fill();g.strokeStyle=sc;g.lineWidth=.025;g.stroke();
  }else{
   const w=lv>=3?.17:.15,L=lv>=3?.42:.38;g.fillStyle=c;rr(g,.02-rc,-w/2,L,w,.03);g.fill();
   if(lv>=2){g.fillStyle='#0b1230';g.fillRect(.17-rc,-w/2,.03,w)}
   if(lv>=3){g.fillStyle=c;rr(g,L-.05-rc,-w/2-.035,.075,w+.07,.02);g.fill()}
   g.fillStyle='#0b1230';g.fillRect(L-.07-rc,-w/2+.03,.04,w-.06);
  }
  g.beginPath();g.arc(0,0,.1,0,7);g.fillStyle='#ffe2b3';g.fill();
 },
 cryo(g,t,c,sc,lv,br,time,rc,alpha){
  g.rotate(t.ang||0);g.lineCap='round';
  if(br==='A'){ // Абсолютный ноль: crystal star with a frost ring
   for(let k=0;k<6;k++){g.save();g.rotate(k*Math.PI/3);g.beginPath();g.moveTo(.06,-.06);g.lineTo(.42,0);g.lineTo(.06,.06);g.closePath();g.fillStyle=hexA('#e8fbff',.92);g.fill();g.strokeStyle=c;g.lineWidth=.015;g.stroke();g.restore()}
   g.save();g.rotate(-time*1.2);g.fillStyle=hexA(sc,.85);for(let k=0;k<12;k++){const a=k*Math.PI/6;g.save();g.translate(Math.cos(a)*.45,Math.sin(a)*.45);g.rotate(a);g.fillRect(-.022,-.022,.044,.044);g.restore()}g.restore();
   poly(g,6,.11,0);g.fillStyle='#fff';g.fill();return}
  if(br==='B'){ // Хрупкость: jagged cracked shards
   const SH=[[0,.38,.08],[1.25,.3,.065],[2.45,.4,.08],[3.7,.29,.065],[4.95,.35,.075]];
   for(const [a,L,w] of SH){g.save();g.rotate(a);g.beginPath();g.moveTo(.04,-w);g.lineTo(L*.6,-w*1.3);g.lineTo(L,0);g.lineTo(L*.55,w*1.15);g.lineTo(.04,w);g.closePath();g.fillStyle=hexA(sc,.78);g.fill();g.strokeStyle='#ffffff';g.lineWidth=.012;g.stroke();
    g.strokeStyle='rgba(42,26,80,.85)';g.lineWidth=.014;g.beginPath();g.moveTo(L*.28,-w*.4);g.lineTo(L*.5,w*.3);g.lineTo(L*.72,-w*.2);g.stroke();g.restore()}
   poly(g,6,.1,0);g.fillStyle='#f1e8ff';g.fill();return}
  const L=lv>=3?.38:lv>=2?.34:.3;g.strokeStyle=c;g.lineWidth=.045;
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);g.beginPath();g.moveTo(ca*.08,sa*.08);g.lineTo(ca*L,sa*L);g.stroke();
   for(const b of(lv>=2?[L*.55,L*.82]:[L*.66])){g.beginPath();g.moveTo(ca*b,sa*b);g.lineTo(ca*b+Math.cos(a+.8)*.075,sa*b+Math.sin(a+.8)*.075);g.moveTo(ca*b,sa*b);g.lineTo(ca*b+Math.cos(a-.8)*.075,sa*b+Math.sin(a-.8)*.075);g.stroke()}}
  if(lv>=3){g.fillStyle=hexA(c,.85);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;g.beginPath();g.arc(Math.cos(a)*.36,Math.sin(a)*.36,.026,0,7);g.fill()}}
  poly(g,6,.11,0);g.fillStyle='#dff8ff';g.fill();
 },
 tesla(g,t,c,sc,lv,br,time,rc,alpha){
  const live=alpha===1&&time>0;
  if(br==='B'){ // Перегрузка: twin pylons with a standing arc
   for(const sx of[-1,1]){rr(g,sx*.2-.05,-.2,.1,.36,.03);g.fillStyle='#2a2350';g.fill();g.strokeStyle=c;g.lineWidth=.025;g.stroke();
    g.globalCompositeOperation='lighter';glow(g,sx*.2,-.24,.16,sc,.7*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
    g.beginPath();g.arc(sx*.2,-.24,.06,0,7);g.fillStyle=sc;g.fill()}
   rr(g,-.11,-.02,.22,.2,.03);g.fillStyle='#1b1640';g.fill();g.strokeStyle=sc;g.lineWidth=.022;g.stroke();
   g.fillStyle=sc;g.fillRect(-.06,.04,.12,.03);g.fillRect(-.06,.1,.12,.03);
   g.strokeStyle=hexA('#fff6c8',.95);g.lineWidth=.022;g.beginPath();g.moveTo(-.2,-.24);for(let k=1;k<6;k++)g.lineTo(-.2+k*.067,-.24+(live?(Math.random()-.5)*.09:(k%2?.03:-.03)));g.lineTo(.2,-.24);g.stroke();
   return}
  const n=br==='A'?4:lv>=3?5:lv>=2?4:3;g.strokeStyle=hexA(c,.9);g.lineWidth=.035;
  for(let i=0;i<n;i++){g.beginPath();g.ellipse(0,.16-i*.075,.2-i*.02,.055,0,0,7);g.stroke()}
  const top=.16-(n-1)*.075-.11,cc=br==='A'?sc:c,pr=(br==='A'?.15:.12+.01*lv)+Math.sin(time*6+(t.x||0))*.015;
  g.globalCompositeOperation='lighter';glow(g,0,top,.42,cc,.7*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
  g.beginPath();g.arc(0,top,pr,0,7);g.fillStyle=br==='A'?'#eaf4ff':'#efe8ff';g.fill();
  if(br==='A'){for(let k=0;k<3;k++){const a=time*3+k*2.094;g.fillStyle=sc;g.beginPath();g.arc(Math.cos(a)*.26,top+Math.sin(a)*.11,.032,0,7);g.fill()}}
  if(lv>=3&&!br){for(const sx of[-1,1]){g.strokeStyle=c;g.lineWidth=.025;g.beginPath();g.moveTo(sx*.25,.13);g.lineTo(sx*.25,-.05);g.stroke();g.beginPath();g.arc(sx*.25,-.07,.03,0,7);g.fillStyle=c;g.fill()}}
  if(live&&Math.random()<.35){g.strokeStyle='#e8e0ff';g.lineWidth=.02;g.beginPath();let a=Math.random()*7,px=0,py=top;g.moveTo(px,py);for(let k=0;k<3;k++){px+=Math.cos(a)*.1;py+=Math.sin(a)*.1;a+=(Math.random()-.5)*2;g.lineTo(px,py)}g.stroke()}
 },
 gravi(g,t,c,sc,lv,br,time,rc,alpha){
  if(br==='A'){ // Сингулярность: black core with a bright accretion disk
   g.save();g.rotate(time*2.2);g.scale(1,.55);
   g.beginPath();g.arc(0,0,.31,0,7);g.strokeStyle=hexA(sc,.9);g.lineWidth=.06;g.stroke();
   g.beginPath();g.arc(0,0,.24,0,7);g.strokeStyle=hexA('#ffffff',.8);g.lineWidth=.025;g.stroke();g.restore();
   g.globalCompositeOperation='lighter';glow(g,0,0,.42,sc,.6*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
   g.beginPath();g.arc(0,0,.15,0,7);g.fillStyle='#02020a';g.fill();g.strokeStyle=sc;g.lineWidth=.02;g.stroke();return}
  if(br==='B'){ // Горизонт событий: three tilted rings around a lens
   for(let k=0;k<3;k++){g.save();g.rotate(time*(.6+k*.4)+k*1.05);g.scale(1,.38);g.beginPath();g.arc(0,0,.34,0,7);g.strokeStyle=hexA(sc,.8);g.lineWidth=.035;g.stroke();g.restore()}
   g.beginPath();g.arc(0,0,.14,0,7);g.fillStyle='#0b0f2a';g.fill();g.strokeStyle=c;g.lineWidth=.03;g.stroke();
   g.beginPath();g.arc(0,0,.06,0,7);g.fillStyle='#ffffff';g.fill();return}
  // emitter sphere with one orbiting mass per level
  g.fillStyle='#141c52';poly(g,8,.24,Math.PI/8);g.fill();g.strokeStyle=c;g.lineWidth=.03;g.stroke();
  for(let k=0;k<lv;k++){g.save();g.rotate(time*(1.6+k*.5)+k*2.1);g.strokeStyle=hexA(c,.45);g.lineWidth=.018;g.beginPath();g.arc(0,0,.17+k*.065,0,7);g.stroke();
   g.fillStyle=c;g.beginPath();g.arc(.17+k*.065,0,.035,0,7);g.fill();g.restore()}
  const p=.085+.015*Math.sin(time*5);g.beginPath();g.arc(0,0,p,0,7);g.fillStyle='#e2e8ff';g.fill();
 },
 gen(g,t,c,sc,lv,br,time,rc,alpha){
  if(br==='A'){ // Биржа: stack of hex coins, the top one spinning
   for(let k=2;k>=1;k--){g.save();g.translate(0,k*.055);poly(g,6,.25,Math.PI/6);g.fillStyle=hexA(c,.55);g.fill();g.strokeStyle='#5c4708';g.lineWidth=.02;g.stroke();g.restore()}
   g.save();g.scale(Math.max(.15,Math.abs(Math.cos(time*2.2))),1);poly(g,6,.25,Math.PI/6);g.fillStyle=sc;g.fill();g.strokeStyle='#a67c00';g.lineWidth=.025;g.stroke();
   g.fillStyle='#8a6400';g.beginPath();g.moveTo(.035,-.16);g.lineTo(-.075,.025);g.lineTo(-.005,.025);g.lineTo(-.035,.16);g.lineTo(.075,-.025);g.lineTo(.005,-.025);g.closePath();g.fill();g.restore();return}
  if(br==='B'){ // Усилитель: core with four fins aimed at the neighbours
   g.save();g.rotate(Math.PI/4+time*.4);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.fillStyle=hexA(sc,.9);g.beginPath();g.moveTo(.13,-.07);g.lineTo(.4,0);g.lineTo(.13,.07);g.closePath();g.fill()}g.restore();
   g.beginPath();g.arc(0,0,.16,0,7);g.fillStyle='#2a1a06';g.fill();g.strokeStyle=sc;g.lineWidth=.03;g.stroke();
   g.globalCompositeOperation='lighter';glow(g,0,0,.3,sc,(.5+.3*Math.sin(time*4))*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
   g.beginPath();g.arc(0,0,.07,0,7);g.fillStyle='#fff6d6';g.fill();return}
  // capacitor core; rods appear with levels
  g.fillStyle='#2a2208';poly(g,6,.25,0);g.fill();g.strokeStyle=c;g.lineWidth=.03;g.stroke();
  for(let k=0;k<lv+1;k++){const a=k*2*Math.PI/(lv+1)+time*.5;g.strokeStyle=hexA(c,.8);g.lineWidth=.03;g.beginPath();g.moveTo(Math.cos(a)*.12,Math.sin(a)*.12);g.lineTo(Math.cos(a)*.22,Math.sin(a)*.22);g.stroke()}
  const p=.5+.5*Math.sin(time*3+(t.x||0));g.beginPath();g.arc(0,0,.1,0,7);g.fillStyle=hexA('#fff6c8',.55+.45*p);g.fill();
 },
 sniper(g,t,c,sc,lv,br,time,rc,alpha){
  g.rotate(t.ang||0);
  g.fillStyle='#16223f';g.beginPath();g.moveTo(.21,0);g.lineTo(0,.21);g.lineTo(-.21,0);g.lineTo(0,-.21);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=.03;g.stroke();
  if(br==='A'){ // Бронебой: twin rails with a charged slug
   g.fillStyle=c;rr(g,-.02-rc,-.095,.66,.045,.015);g.fill();rr(g,-.02-rc,.05,.66,.045,.015);g.fill();
   const p=.5+.5*Math.sin(time*5);g.fillStyle=hexA(sc,.45+.5*p);g.fillRect(.1-rc,-.022,.48,.044);
   g.globalCompositeOperation='lighter';glow(g,.62-rc,0,.14,sc,.8*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
   g.fillStyle=sc;g.beginPath();g.arc(.62-rc,0,.04,0,7);g.fill();
  }else if(br==='B'){ // Скорострел: twin barrels and an ammo drum
   g.fillStyle=c;rr(g,-rc,-.09,.46,.065,.02);g.fill();rr(g,-rc,.025,.46,.065,.02);g.fill();
   g.fillStyle=sc;g.fillRect(.42-rc,-.1,.04,.2);
   g.beginPath();g.arc(-.1,.17,.09,0,7);g.fillStyle='#1e2c14';g.fill();g.strokeStyle=sc;g.lineWidth=.025;g.stroke();
   g.save();g.translate(-.1,.17);g.rotate(time*(t.rc>0?12:1));g.strokeStyle=hexA(sc,.7);g.lineWidth=.015;g.beginPath();for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.moveTo(0,0);g.lineTo(.07,0)}g.stroke();g.restore();
  }else{
   const L=lv>=3?.58:lv>=2?.54:.5;g.fillStyle=c;rr(g,-rc,-.035,L,.07,.02);g.fill();
   g.fillStyle='#0b1230';g.fillRect(.08-rc,-.015,L-.2,.03);
   if(lv>=2){g.fillStyle=c;rr(g,L-.07-rc,-.055,.06,.11,.015);g.fill();g.fillStyle=hexA(c,.9);rr(g,.02,-.13,.17,.05,.015);g.fill()}
   if(lv>=3){g.strokeStyle=hexA(c,.75);g.lineWidth=.022;g.lineCap='round';g.beginPath();g.moveTo(.3,.035);g.lineTo(.37,.15);g.moveTo(.3,-.035);g.lineTo(.37,-.15);g.stroke()}
  }
  g.beginPath();g.arc(-.02,0,.06,0,7);g.fillStyle='#e6fff0';g.fill();
 }
};
export function drawTowerShape(g,t,time,alpha=1){
  const d=TD[t.type],skc=skinCols(t,time),c=skc?skc[0]:d.col,x=t.x,y=t.y,lv=t.lvl||1,br=t.br||null,sp=br?t.type+br:null,sc=sp?(skc?skc[1]:SPEC_COL[sp]):c;
  g.save();g.globalAlpha=alpha;
  // platform: square with brackets on level 2, octagonal plate with corner lights on level 3 and specializations
  if(lv>=3||sp){
    g.save();g.translate(x,y);poly(g,8,.46,Math.PI/8);g.fillStyle='#0b1230';g.fill();g.lineWidth=.035;g.strokeStyle=hexA(c,.72);g.stroke();
    poly(g,8,.36,Math.PI/8);g.strokeStyle=hexA(sc,.28);g.lineWidth=.02;g.stroke();
    for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;g.fillStyle=hexA(sc,.55+.45*Math.sin(time*3+k*1.7));g.beginPath();g.arc(Math.cos(a)*.385,Math.sin(a)*.385,.032,0,7);g.fill()}
    g.restore();
  }else{
    rr(g,x-.4,y-.4,.8,.8,.14);g.fillStyle='#0b1230';g.fill();g.lineWidth=.035;g.strokeStyle=hexA(c,.55);g.stroke();
    rr(g,x-.3,y-.3,.6,.6,.1);g.strokeStyle=hexA(c,.18);g.lineWidth=.02;g.stroke();
    if(lv>=2){g.strokeStyle=c;g.lineWidth=.045;g.lineCap='round';g.beginPath();for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const px=x+sx*.41,py=y+sy*.41;g.moveTo(px,py-sy*.17);g.lineTo(px,py);g.lineTo(px-sx*.17,py)}g.stroke();g.lineCap='butt'}
  }
  g.globalCompositeOperation='lighter';glow(g,x,y,t.icon?.56:.72+.1*lv+(sp?.1:0),sc,(.24+.06*lv+(sp?.08:0))*alpha);g.globalCompositeOperation='source-over';g.globalAlpha=alpha;
  if(sp){g.save();g.translate(x,y);g.rotate(time*.6);g.strokeStyle=hexA(sc,.5);g.lineWidth=.022;g.setLineDash([.09,.07]);g.beginPath();g.arc(0,0,.5,0,7);g.stroke();g.setLineDash([]);g.restore()}
  // turret, slightly larger on each level
  g.save();g.translate(x,y);const ts=1+.07*(lv-1)+(sp?.05:0);g.scale(ts,ts);
  TURRET[t.type](g,t,c,sc,lv,br,time,(t.rc||0)*.08,alpha);
  g.restore();g.globalAlpha=alpha;
  // rank marks: pips for levels, a diamond in the specialization colour
  if(sp){g.save();g.translate(x,y+.34);g.rotate(Math.PI/4);g.fillStyle=sc;g.fillRect(-.055,-.055,.11,.11);g.restore()}
  else for(let i=0;i<lv;i++){g.fillStyle=c;g.fillRect(x-.2+i*.15,y+.3,.1,.05)}
  if(t.syn&&t.syn.length&&alpha===1){g.fillStyle='#6dff9e';for(let i=0;i<t.syn.length;i++){g.beginPath();g.arc(x-.3+i*.12,y-.34,.045,0,7);g.fill()}}
  if(t.vet){g.strokeStyle='#ffc94d';g.lineWidth=.035;g.lineCap='round';g.beginPath();for(let i=0;i<t.vet;i++){const yy=y-.2-i*.085;g.moveTo(x+.25,yy+.04);g.lineTo(x+.31,yy);g.lineTo(x+.37,yy+.04)}g.stroke();g.lineCap='butt'}
  if(t.node&&alpha===1){g.strokeStyle=hexA('#ffe14d',.45+.25*Math.sin(time*3));g.lineWidth=.025;poly(g,6,.52,0);g.save();g.translate(x,y);poly(g,6,.52,0);g.stroke();g.restore()}
  g.restore();
}
