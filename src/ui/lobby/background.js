// Lobby background animation.
import { $, clamp, hexA } from '../../core/util.js';
import { dayKey } from '../../meta/daily.js';
import { LBV, LOBBY, RM, timeLeft } from './shared.js';
import { LBY } from './state.js';
import { go } from './nav.js';

/* lobby background: honeycomb with travelling data pulses */
const LBC=$('#lbBg'),lbx=LBC.getContext('2d'),HS=24,T1=[30,150,270],T2=[90,210,330];
let lbW=0,lbH=0,lbSt=null,PUL=[],lbT=0;
function newPulse(spread){const hw=Math.sqrt(3)*HS,row=Math.floor(Math.random()*(lbH/(1.5*HS)+1)),col=Math.floor(Math.random()*(lbW/hw+1));
  return{x:col*hw+(row&1?hw/2:0),y:row*1.5*HS-HS,ty:1,dir:T1[Math.random()*3|0],t:spread?Math.random():0,trail:[],age:spread?1:0,life:5+Math.random()*8,spd:1.4+Math.random()*1.6,col:Math.random()<.3?'#ff4fd8':'#3df0ff'}}
function lbResize(){
  const w=LOBBY.clientWidth,h=LOBBY.clientHeight;if(!w||!h)return;lbW=w;lbH=h;const d=Math.min(2,devicePixelRatio||1);
  LBC.width=Math.round(w*d);LBC.height=Math.round(h*d);
  lbSt=document.createElement('canvas');lbSt.width=LBC.width;lbSt.height=LBC.height;const g=lbSt.getContext('2d');g.setTransform(d,0,0,d,0,0);
  const gr=g.createRadialGradient(w/2,h*.2,0,w/2,h*.3,Math.max(w,h)*.9);gr.addColorStop(0,'#0e1838');gr.addColorStop(.55,'#070b1a');gr.addColorStop(1,'#04060d');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(61,240,255,.055)';g.lineWidth=1;g.beginPath();const hw=Math.sqrt(3)*HS;
  for(let row=-1;row*1.5*HS<h+HS*2;row++)for(let col=-1;col*hw<w+hw;col++){const cx=col*hw+(row&1?hw/2:0),cy=row*1.5*HS;
    for(let k=0;k<=6;k++){const a=(k*60-90)*Math.PI/180,x=cx+Math.cos(a)*HS,y=cy+Math.sin(a)*HS;if(k)g.lineTo(x,y);else g.moveTo(x,y)}}
  g.stroke();
  const vg=g.createLinearGradient(0,0,0,h);vg.addColorStop(0,'rgba(4,6,13,0)');vg.addColorStop(.6,'rgba(4,6,13,.3)');vg.addColorStop(1,'rgba(4,6,13,.85)');g.fillStyle=vg;g.fillRect(0,0,w,h);
  PUL=[];const n=clamp(Math.round(w*h/42000),5,12);for(let i=0;i<n;i++)PUL.push(newPulse(true));
  lbx.setTransform(d,0,0,d,0,0);lbDraw(0);
}
function stepPulse(p,dt){p.t+=dt*p.spd;p.age+=dt;p.life-=dt;
  while(p.t>=1){p.t-=1;const a=p.dir*Math.PI/180;p.trail.push([p.x,p.y]);if(p.trail.length>3)p.trail.shift();p.x+=Math.cos(a)*HS;p.y+=Math.sin(a)*HS;
    const set=p.ty?T2:T1;p.ty=p.ty?0:1;const rev=(p.dir+180)%360,opts=set.filter(d=>d!==rev);p.dir=opts[Math.random()*opts.length|0]}}
function lbDraw(dt){
  if(!lbSt)return;lbx.drawImage(lbSt,0,0,lbW,lbH);if(RM)return;
  lbx.globalCompositeOperation='lighter';lbx.lineCap='round';
  PUL.forEach((p,i)=>{stepPulse(p,dt);if(p.life<=0||p.x<-HS*2||p.x>lbW+HS*2||p.y<-HS*2||p.y>lbH+HS*2){PUL[i]=newPulse(false);return}
    const a=p.dir*Math.PI/180,hx=p.x+Math.cos(a)*HS*p.t,hy=p.y+Math.sin(a)*HS*p.t,pts=[...p.trail,[p.x,p.y],[hx,hy]],f=Math.min(1,p.age/.8,p.life/1.2);
    for(let k=1;k<pts.length;k++){const al=k/pts.length*.34*f;lbx.beginPath();lbx.moveTo(pts[k-1][0],pts[k-1][1]);lbx.lineTo(pts[k][0],pts[k][1]);
      lbx.strokeStyle=hexA(p.col,al*.22);lbx.lineWidth=5;lbx.stroke();lbx.strokeStyle=hexA(p.col,al);lbx.lineWidth=1.4;lbx.stroke()}
    lbx.fillStyle=hexA(p.col,.55*f);lbx.beginPath();lbx.arc(hx,hy,1.7,0,7);lbx.fill()});
  lbx.globalCompositeOperation='source-over';
}
export function lbFrame(dt){lbDraw(dt);lbT+=dt;if(lbT>=1){lbT=0;if(dayKey()!==LBY.day){LBY.day=dayKey();go(LBY.scr,true)}else LBV.querySelectorAll('[data-timer]').forEach(el=>el.textContent=timeLeft())}}
new ResizeObserver(lbResize).observe(LOBBY);
