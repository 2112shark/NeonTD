// Map background: themes, paths, decorations.
import { COLS, ROWS, hexA, rng } from '../core/util.js';
import { bgc, bgx, cv, dpr, glow, poly, rr, tile } from './canvas.js';
import { S } from '../core/state.js';

/* ---------- drawing ---------- */
export function buildBg(){if(!S)return;bgc.width=cv.width;bgc.height=cv.height;paintMap(bgx,S.grid?Object.assign(Object.create(S.map),{grid:S.grid}):S.map,dpr*tile)}
export const THEMES={
 net:{bgA:'#0c1433',bgB:'#04060e',tile:'90,120,220',path:'#0a1128',edge:'61,240,255',hi:'160,250,255',trace:'90,140,255',deco:'crystal',dc:'#7a5cff',gate:'#3df0ff'},
 srv:{bgA:'#08231f',bgB:'#020907',tile:'60,190,150',path:'#05161a',edge:'77,255,190',hi:'200,255,235',trace:'60,220,170',deco:'server',dc:'#4dffb0',gate:'#4dffbe'},
 hot:{bgA:'#22160a',bgB:'#070402',tile:'230,150,70',path:'#160e06',edge:'255,176,64',hi:'255,232,180',trace:'255,160,70',deco:'vent',dc:'#ff9d3d',gate:'#ffb040'}
};
export function paintMap(g,m,sc){
  const th=THEMES[m.th||'net'],T=th.tile;
  g.setTransform(sc,0,0,sc,0,0);
  const gr=g.createRadialGradient(COLS/2,ROWS/2,1,COLS/2,ROWS/2,ROWS*.8);gr.addColorStop(0,th.bgA);gr.addColorStop(1,th.bgB);
  g.fillStyle=gr;g.fillRect(0,0,COLS,ROWS);
  // circuit traces between buildable cells
  const isB=(c,r)=>c>=0&&r>=0&&c<COLS&&r<ROWS&&m.grid[r][c]===0;
  const R0=rng(m.seed+7),vias=[];g.lineCap='round';g.lineJoin='round';g.strokeStyle=`rgba(${th.trace},.14)`;g.lineWidth=.035;g.beginPath();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(!isB(c,r)||R0()>.45)continue;const [dx,dy]=[[1,0],[0,1],[1,1],[-1,1]][R0()*4|0];if(!isB(c+dx,r+dy))continue;
    const x0=c+.5,y0=r+.5;g.moveTo(x0,y0);if(dx&&dy)g.lineTo(x0+dx*.5,y0);g.lineTo(x0+dx,y0+dy);vias.push([x0,y0],[x0+dx,y0+dy])}
  g.stroke();g.fillStyle=`rgba(${th.trace},.24)`;for(const [vx,vy] of vias){g.beginPath();g.arc(vx,vy,.045,0,7);g.fill()}
  g.lineCap='butt';
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const v=m.grid[r][c];
    if(v===0){g.fillStyle=`rgba(${T},.045)`;g.fillRect(c+.06,r+.06,.88,.88);g.strokeStyle=`rgba(${T},.1)`;g.lineWidth=.02;g.strokeRect(c+.06,r+.06,.88,.88);
      g.fillStyle=`rgba(${T},.24)`;g.fillRect(c+.06,r+.06,.06,.02);g.fillRect(c+.06,r+.06,.02,.06);g.fillRect(c+.88,r+.92,.06,.02);g.fillRect(c+.92,r+.88,.02,.06)}
    else if(v===1){g.fillStyle=th.path;g.fillRect(c,r,1,1)}
    else if(v===3){g.fillStyle=`rgba(${T},.045)`;g.fillRect(c+.06,r+.06,.88,.88);g.save();g.translate(c+.5,r+.5);
      poly(g,6,.4,0);g.fillStyle='rgba(255,225,77,.07)';g.fill();g.strokeStyle='rgba(255,225,77,.6)';g.lineWidth=.035;g.stroke();
      poly(g,6,.25,0);g.strokeStyle='rgba(255,225,77,.32)';g.lineWidth=.02;g.stroke();
      g.fillStyle='rgba(255,225,77,.5)';for(let k=0;k<6;k++){const a=k*Math.PI/3;g.fillRect(Math.cos(a)*.4-.02,Math.sin(a)*.4-.02,.04,.04)}g.restore()}
    else if(v===4)drawDebris(g,c,r,th,c*31+r*17)
  }
  // obstacles, static part
  const R=rng(m.seed+99);
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(m.grid[r][c]===2){
    const x=c+.5,y=r+.5;
    if(th.deco==='crystal'){const n=2+(R()*2|0);g.globalCompositeOperation='lighter';glow(g,x,y,.7,th.dc,.35);g.globalCompositeOperation='source-over';
      for(let k=0;k<n;k++){const ox=(R()-.5)*.4,h=.35+R()*.3,w=.12+R()*.08;g.beginPath();g.moveTo(x+ox,y+.3-h);g.lineTo(x+ox+w,y+.3-h*.35);g.lineTo(x+ox,y+.32);g.lineTo(x+ox-w,y+.3-h*.35);g.closePath();
        g.fillStyle='#1a1440';g.fill();g.strokeStyle='rgba(170,140,255,.75)';g.lineWidth=.025;g.stroke()}}
    else if(th.deco==='server'){g.globalCompositeOperation='lighter';glow(g,x,y,.62,th.dc,.16);g.globalCompositeOperation='source-over';
      rr(g,x-.3,y-.38,.6,.76,.06);g.fillStyle='#061512';g.fill();g.strokeStyle=hexA(th.dc,.6);g.lineWidth=.03;g.stroke();
      for(let k=0;k<3;k++){const yy=y-.3+k*.2;g.fillStyle=hexA(th.dc,.1);g.fillRect(x-.22,yy,.44,.13);g.strokeStyle=hexA(th.dc,.22);g.lineWidth=.015;g.strokeRect(x-.22,yy,.44,.13)}
      g.fillStyle=hexA(th.dc,.35);g.fillRect(x-.24,y+.33,.48,.02)}
    else{g.globalCompositeOperation='lighter';glow(g,x,y,.7,th.dc,.22);g.globalCompositeOperation='source-over';
      g.beginPath();g.arc(x,y,.36,0,7);g.fillStyle='#120b05';g.fill();g.strokeStyle=hexA(th.dc,.75);g.lineWidth=.04;g.stroke();
      g.beginPath();g.arc(x,y,.27,0,7);g.strokeStyle=hexA(th.dc,.3);g.lineWidth=.02;g.stroke();
      g.strokeStyle='rgba(255,210,61,.6)';g.lineWidth=.035;g.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;g.moveTo(x+Math.cos(a)*.39,y+Math.sin(a)*.39);g.lineTo(x+Math.cos(a)*.45,y+Math.sin(a)*.45)}g.stroke()}
  }
  // hazard striping on the path in the reactor zone
  if(th.deco==='vent'){g.save();g.beginPath();for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(m.grid[r][c]===1)g.rect(c,r,1,1);g.clip();
    g.strokeStyle='rgba(255,176,64,.06)';g.lineWidth=.14;g.beginPath();for(let k=-ROWS;k<COLS+ROWS;k+=.55){g.moveTo(k,0);g.lineTo(k+ROWS,ROWS)}g.stroke();g.restore()}
  // glowing conduit edges
  const isP=(c,r)=>c<0||r<0||c>=COLS||r>=ROWS?true:m.grid[r][c]===1;
  for(const pass of [[.16,`rgba(${th.edge},.07)`],[.05,`rgba(${th.edge},.2)`],[.022,`rgba(${th.hi},.8)`]]){
    g.lineWidth=pass[0];g.strokeStyle=pass[1];g.beginPath();
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(m.grid[r][c]===1){
      if(!isP(c,r-1)){g.moveTo(c,r+.04);g.lineTo(c+1,r+.04)}
      if(!isP(c,r+1)){g.moveTo(c,r+.96);g.lineTo(c+1,r+.96)}
      if(!isP(c-1,r)){g.moveTo(c+.04,r);g.lineTo(c+.04,r+1)}
      if(!isP(c+1,r)){g.moveTo(c+.96,r);g.lineTo(c+.96,r+1)}
    }
    g.stroke();
  }
  // edge studs every other cell
  g.fillStyle=`rgba(${th.hi},.35)`;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(m.grid[r][c]===1&&(r+c)%2===0){
    if(!isP(c,r-1))g.fillRect(c+.45,r+.02,.1,.04);if(!isP(c,r+1))g.fillRect(c+.45,r+.94,.1,.04);
    if(!isP(c-1,r))g.fillRect(c+.02,r+.45,.04,.1);if(!isP(c+1,r))g.fillRect(c+.94,r+.45,.04,.1)}
  g.fillStyle=`rgba(${th.edge},.09)`;const chev=new Set();
  for(const rt of m.routes)for(let i=0;i<rt.path.length-1;i++){const a=rt.path[i],b=rt.path[i+1],L=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x);
    for(let s=.5;s<L;s+=1){const x=a.x+(b.x-a.x)*s/L,y=a.y+(b.y-a.y)*s/L,key=Math.round(x*4)+':'+Math.round(y*4)+':'+Math.round(ang*10);if(x<0||y<0||x>COLS||y>ROWS||chev.has(key))continue;chev.add(key);g.save();g.translate(x,y);g.rotate(ang);g.beginPath();g.moveTo(.12,0);g.lineTo(-.08,-.16);g.lineTo(-.02,0);g.lineTo(-.08,.16);g.closePath();g.fill();g.restore()}}
}
export function drawDebris(g,c,r,th,seed){const R=rng(seed+5);g.save();g.translate(c+.5,r+.5);
  g.fillStyle='rgba(20,18,28,.55)';g.fillRect(-.44,-.44,.88,.88);
  for(let k=0;k<6;k++){const a=R()*6.28,d=R()*.2,s=.09+R()*.11;g.beginPath();for(let q=0;q<5;q++){const b=q/5*6.28+R()*.7,rr2=s*(.6+R()*.55);g.lineTo(Math.cos(a)*d+Math.cos(b)*rr2,Math.sin(a)*d+Math.sin(b)*rr2)}g.closePath();
    g.fillStyle=k%2?'#20202c':'#2a2633';g.fill();g.strokeStyle=`rgba(${th.edge},.5)`;g.lineWidth=.02;g.stroke()}
  g.strokeStyle='rgba(255,176,64,.6)';g.lineWidth=.035;g.setLineDash([.08,.06]);g.strokeRect(-.41,-.41,.82,.82);g.setLineDash([]);g.restore()}
/* animated parts of the obstacles: server LEDs and reactor fans */
export function drawDeco(g,m,time){
  const th=THEMES[m.th||'net'];
  if(m.nodes&&m.nodes.length){g.globalCompositeOperation='lighter';for(const [c,r] of m.nodes)glow(g,c+.5,r+.5,.6,'#ffe14d',.16+.12*Math.sin(time*2.4+c+r));g.globalCompositeOperation='source-over'}
  if(th.deco==='crystal')return;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(m.grid[r][c]===2){const x=c+.5,y=r+.5,ph=(c*7+r*13)%10;
    if(th.deco==='server'){for(let k=0;k<3;k++){const yy=y-.3+k*.2+.04,a=Math.sin(time*(1.7+k*.6)+ph+k*1.7)>0,b=Math.sin(time*(2.9+k*.4)+ph*2.3)>.25;
      g.fillStyle=a?th.dc:'#0c2a22';g.fillRect(x+.1,yy,.07,.05);g.fillStyle=b?'#ffffff':'#0c2a22';g.fillRect(x+.01,yy,.05,.05)}}
    else{g.save();g.translate(x,y);g.rotate(time*(1.2+ph*.12));g.fillStyle=hexA(th.dc,.62);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(.12,-.08,.23,0);g.lineTo(.06,.07);g.closePath();g.fill()}g.restore();
      g.globalCompositeOperation='lighter';glow(g,x,y,.3,th.dc,.32+.2*Math.sin(time*2+ph));g.globalCompositeOperation='source-over'}}
}
