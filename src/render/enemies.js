// Enemy sprites.
import { clamp, hexA } from '../core/util.js';
import { ctx, glow, poly, rr } from './canvas.js';
import { S } from '../core/state.js';

export function drawEnemy(e,g=ctx,time=S.time){
  const fly=e.air&&!(e.gnd>0),d=e.d,r=d.r,x=e.x,y=e.y-(fly?.12+Math.sin(time*4+e.wob)*.04:0);
  const ghost=e.cloak&&!e.vis;
  if(ghost)g.globalAlpha=.28;
  if(!e.icon){
    g.fillStyle='rgba(0,0,0,.4)';g.beginPath();
    if(e.air)g.ellipse(e.x+.08,e.y+.16,r*.8,r*.35,0,0,7);else g.ellipse(x+.05,y+.08,r*1.02,r*.6,0,0,7);
    g.fill();
    if(!ghost){g.globalCompositeOperation='lighter';glow(g,x,y,r*2.5,d.col,d.boss?.5:.34);g.globalCompositeOperation='source-over';if(ghost)g.globalAlpha=.28}
  }
  const col=e.hitT>0?'#ffffff':d.col,dark='#0a0f22';
  g.save();g.translate(x,y);g.rotate(e.ang);g.lineJoin='round';
  switch(e.t){
    case'drone':{ // quad-rotor
      g.strokeStyle=hexA(d.col,.75);g.lineWidth=.035;g.beginPath();for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;g.moveTo(0,0);g.lineTo(Math.cos(a)*r*1.05,Math.sin(a)*r*1.05)}g.stroke();
      for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2,px=Math.cos(a)*r*1.05,py=Math.sin(a)*r*1.05;
        g.beginPath();g.arc(px,py,r*.44,0,7);g.fillStyle=hexA(d.col,.12);g.fill();g.strokeStyle=hexA(d.col,.5);g.lineWidth=.018;g.stroke();
        const b=time*26+k*1.3;g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.022;g.beginPath();g.moveTo(px+Math.cos(b)*r*.4,py+Math.sin(b)*r*.4);g.lineTo(px-Math.cos(b)*r*.4,py-Math.sin(b)*r*.4);g.stroke()}
      poly(g,6,r*.62,0);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.04;g.stroke();
      g.beginPath();g.arc(r*.12,0,r*.25,0,7);g.fillStyle=col;g.fill();g.beginPath();g.arc(r*.2,0,r*.09,0,7);g.fillStyle='#fff';g.fill();break}
    case'scout':{ // dart with a flickering thruster
      const fl=.6+.4*Math.sin(time*40+e.wob);
      g.fillStyle='rgba(255,184,77,.85)';g.beginPath();g.moveTo(-r*.5,-r*.26);g.lineTo(-r*(1.1+fl*.55),0);g.lineTo(-r*.5,r*.26);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(-r*.5,-r*.1);g.lineTo(-r*(.8+fl*.25),0);g.lineTo(-r*.5,r*.1);g.closePath();g.fill();
      g.beginPath();g.moveTo(r*1.15,0);g.lineTo(-r*.6,r*.82);g.lineTo(-r*.35,0);g.lineTo(-r*.6,-r*.82);g.closePath();g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.04;g.stroke();
      g.strokeStyle=hexA(d.col,.5);g.lineWidth=.02;g.beginPath();g.moveTo(r*.5,0);g.lineTo(-r*.3,0);g.stroke();
      g.fillStyle=col;g.beginPath();g.ellipse(r*.38,0,r*.28,r*.13,0,0,7);g.fill();break}
    case'tank':{ // tracked hull, turret and plating
      const tr=((e.prog||0)*5)%1;
      for(const sy of[-1,1]){const ty=sy*r*.66;rr(g,-r*1.05,ty-r*.26,r*2.1,r*.52,r*.13);g.fillStyle='#121830';g.fill();g.strokeStyle=hexA(d.col,.55);g.lineWidth=.02;g.stroke();
        g.strokeStyle=hexA(d.col,.4);g.beginPath();for(let k=0;k<7;k++){const px=-r*1.05+((k+1-tr)/7)*r*2.1;g.moveTo(px,ty-r*.22);g.lineTo(px,ty+r*.22)}g.stroke()}
      rr(g,-r*.85,-r*.48,r*1.7,r*.96,r*.18);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.04;g.stroke();
      g.strokeStyle=hexA(d.col,.35);g.lineWidth=.02;g.beginPath();g.moveTo(-r*.6,-r*.48);g.lineTo(-r*.6,r*.48);g.moveTo(r*.55,-r*.48);g.lineTo(r*.55,r*.48);g.stroke();
      g.fillStyle=col;rr(g,r*.15,-r*.08,r*.9,r*.16,.02);g.fill();
      g.beginPath();g.arc(-r*.05,0,r*.34,0,7);g.fillStyle=col;g.fill();g.beginPath();g.arc(-r*.05,0,r*.16,0,7);g.fillStyle=dark;g.fill();break}
    case'wasp':{ // segmented insect drone with flapping wings
      const f=Math.sin(time*32+e.wob);g.fillStyle=hexA(d.col,.26);
      for(const sy of[-1,1]){g.save();g.rotate(sy*(.45+.35*f));g.beginPath();g.ellipse(-r*.1,sy*r*.72,r*.78,r*.27,0,0,7);g.fill();g.restore();
        g.save();g.rotate(sy*(.95+.3*f));g.beginPath();g.ellipse(-r*.35,sy*r*.55,r*.55,r*.2,0,0,7);g.fill();g.restore()}
      g.beginPath();g.ellipse(-r*.58,0,r*.56,r*.32,0,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.035;g.stroke();
      g.strokeStyle=hexA(d.col,.65);g.lineWidth=.03;g.beginPath();for(const sx of[-.8,-.55,-.3]){g.moveTo(r*sx,-r*.29);g.lineTo(r*sx,r*.29)}g.stroke();
      g.beginPath();g.arc(r*.12,0,r*.3,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.stroke();
      g.beginPath();g.arc(r*.55,0,r*.21,0,7);g.fillStyle=col;g.fill();
      g.fillStyle='#fff';g.beginPath();g.moveTo(-r*1.12,0);g.lineTo(-r*1.4,-r*.07);g.lineTo(-r*1.4,r*.07);g.closePath();g.fill();break}
    case'guard':{ // armoured sphere with a visor
      g.beginPath();g.arc(0,0,r,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.04;g.stroke();
      g.strokeStyle=hexA(d.col,.4);g.lineWidth=.02;g.beginPath();g.arc(0,0,r*.68,-1.2,1.2);g.stroke();
      g.fillStyle=col;g.beginPath();g.moveTo(r*.62,0);g.lineTo(-r*.3,r*.5);g.lineTo(-r*.3,-r*.5);g.closePath();g.fill();
      g.fillStyle='#fff';g.fillRect(r*.16,-r*.08,r*.32,r*.16);break}
    case'split':{ // dividing cell
      const w=1+.08*Math.sin(time*4+e.wob);
      g.save();g.scale(1,w);g.beginPath();g.ellipse(0,0,r*.92,r*1.15,0,0,7);g.restore();g.fillStyle=hexA(d.col,.14);g.fill();g.strokeStyle=col;g.lineWidth=.035;g.stroke();
      g.strokeStyle=hexA(d.col,.45);g.lineWidth=.02;g.beginPath();g.moveTo(-r*.92,0);g.quadraticCurveTo(0,r*.12*Math.sin(time*3),r*.92,0);g.stroke();
      for(const o of[-1,1]){g.beginPath();g.arc(0,o*r*.48,r*.32,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=hexA(d.col,.85);g.lineWidth=.025;g.stroke();g.beginPath();g.arc(0,o*r*.48,r*.13,0,7);g.fillStyle=col;g.fill()}
      break}
    case'shard':{
      g.rotate(time*8+e.wob);g.beginPath();g.moveTo(r*1.15,0);g.lineTo(-r*.6,r*.78);g.lineTo(-r*.3,0);g.lineTo(-r*.6,-r*.78);g.closePath();g.fillStyle=hexA(d.col,.35);g.fill();g.strokeStyle=col;g.lineWidth=.03;g.stroke();break}
    case'medic':{ // hex medkit with orbiting nanites
      poly(g,6,r*.95,Math.PI/6);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.035;g.stroke();
      const a=r*.5,b=r*.16;g.fillStyle=col;g.fillRect(-a,-b,a*2,b*2);g.fillRect(-b,-a,b*2,a*2);
      g.save();g.rotate(time*2.4);g.fillStyle=hexA(d.col,.85);for(let k=0;k<3;k++){const q=k*2.094;g.beginPath();g.arc(Math.cos(q)*r*1.28,Math.sin(q)*r*1.28,r*.13,0,7);g.fill()}g.restore();
      if(e.cd!=null&&e.cd<.6&&!e.icon){g.strokeStyle=hexA(d.col,.5*(1-e.cd/.6));g.lineWidth=.02;g.beginPath();g.arc(0,0,r*1.55,0,7);g.stroke()}
      break}
    case'jammer':{ // dish antenna spitting static
      g.beginPath();g.arc(0,0,r*.82,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.035;g.stroke();
      g.beginPath();g.arc(-r*.05,0,r*.6,-1.15,1.15);g.strokeStyle=col;g.lineWidth=.05;g.stroke();
      g.strokeStyle=hexA(d.col,.7);g.lineWidth=.02;g.beginPath();g.moveTo(-r*.05,0);g.lineTo(r*.48,0);g.stroke();
      g.fillStyle='#fff';g.beginPath();g.arc(r*.52,0,r*.12,0,7);g.fill();
      const ph=(time*9|0)%2;g.strokeStyle=hexA(d.col,.65);g.lineWidth=.022;
      for(let k=0;k<3;k++){const a=-.55+k*.55;g.beginPath();for(let s=0;s<4;s++){const rr2=r*(.95+s*.16),aa=a+((s+ph+k)%2?.11:-.11);s?g.lineTo(Math.cos(aa)*rr2,Math.sin(aa)*rr2):g.moveTo(Math.cos(aa)*rr2,Math.sin(aa)*rr2)}g.stroke()}
      break}
    case'blink':{ // phase crystal that charges before each jump
      const ch=d.blink&&e.cd!=null?clamp(1-e.cd/d.blink.cd,0,1):0;
      for(let k=2;k>=1;k--){g.fillStyle=hexA(d.col,.08*(3-k));g.beginPath();g.moveTo(r*1.1-k*r*.55,0);g.lineTo(-k*r*.55,r*.7);g.lineTo(-r*.8-k*r*.55,0);g.lineTo(-k*r*.55,-r*.7);g.closePath();g.fill()}
      g.beginPath();g.moveTo(r*1.1,0);g.lineTo(0,r*.72);g.lineTo(-r*.8,0);g.lineTo(0,-r*.72);g.closePath();g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.035;g.stroke();
      g.beginPath();g.moveTo(r*.55,0);g.lineTo(0,r*.32);g.lineTo(-r*.35,0);g.lineTo(0,-r*.32);g.closePath();g.fillStyle=hexA(d.col,.35+.65*ch);g.fill();
      if(ch>.75&&!e.icon){g.strokeStyle=hexA('#ffffff',.6*(ch-.75)*4);g.lineWidth=.02;g.beginPath();g.arc(0,0,r*1.25,0,7);g.stroke()}
      break}
    case'carrier':{ // armoured transport with three pods of mites
      for(const sy of[-1,1]){rr(g,-r*1.05,sy*r*.72-r*.16,r*2.1,r*.32,r*.1);g.fillStyle='#14120c';g.fill();g.strokeStyle=hexA(d.col,.5);g.lineWidth=.018;g.stroke()}
      rr(g,-r*1,-r*.6,r*2,r*1.2,r*.2);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.04;g.stroke();
      for(let k=0;k<3;k++){const px=-r*.6+k*r*.42;g.beginPath();g.arc(px,0,r*.19,0,7);g.fillStyle=hexA('#ffe7a8',.25+.18*Math.sin(time*5+k*2));g.fill();g.strokeStyle=hexA(d.col,.85);g.lineWidth=.02;g.stroke()}
      g.fillStyle=col;rr(g,r*.58,-r*.46,r*.36,r*.92,r*.1);g.fill();g.fillStyle=dark;g.fillRect(r*.74,-r*.3,r*.1,r*.6);
      break}
    case'mite':{ // tiny flyer
      const f=Math.sin(time*42+e.wob);g.fillStyle=hexA(d.col,.4);
      for(const sy of[-1,1]){g.beginPath();g.ellipse(-r*.2,sy*r*.8,r*.7,r*.28*(1+.5*f),sy*.5,0,7);g.fill()}
      g.beginPath();g.arc(0,0,r*.6,0,7);g.fillStyle=col;g.fill();g.beginPath();g.arc(r*.25,0,r*.22,0,7);g.fillStyle='#fff';g.fill();
      break}
    case'queen':{ // hive mother with glowing egg sacs
      const f=Math.sin(time*9+e.wob);g.fillStyle=hexA(d.col,.16);
      for(const sy of[-1,1]){g.save();g.rotate(sy*(.55+.18*f));g.beginPath();g.ellipse(-r*.15,sy*r*.85,r*1,r*.34,0,0,7);g.fill();g.restore();
        g.save();g.rotate(sy*(1.05+.12*f));g.beginPath();g.ellipse(-r*.45,sy*r*.65,r*.7,r*.24,0,0,7);g.fill();g.restore()}
      g.beginPath();g.ellipse(-r*.5,0,r*.72,r*.52,0,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.045;g.stroke();
      g.strokeStyle=hexA(d.col,.5);g.lineWidth=.02;g.beginPath();for(const sx of[-.85,-.6,-.35]){g.moveTo(r*sx,-r*.46);g.lineTo(r*sx,r*.46)}g.stroke();
      for(let k=0;k<4;k++){g.fillStyle=hexA(d.col,.35+.35*Math.sin(time*3+k*1.7));g.beginPath();g.arc(-r*.95+k*r*.25,(k%2?1:-1)*r*.2,r*.11,0,7);g.fill()}
      g.beginPath();g.arc(r*.2,0,r*.38,0,7);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.04;g.stroke();
      g.beginPath();g.arc(r*.66,0,r*.25,0,7);g.fillStyle=col;g.fill();
      g.fillStyle='#ffffff';for(const sy of[-1,1]){g.beginPath();g.moveTo(r*.72,sy*r*.12);g.lineTo(r*1.08,sy*r*.36);g.lineTo(r*.84,sy*r*.04);g.closePath();g.fill()}
      break}
    case'wrecker':{ // tracked siege bot with a turret that tracks its target tower
      for(const sy of[-1,1]){rr(g,-r*1,sy*r*.64-r*.2,r*2,r*.4,r*.1);g.fillStyle='#1a120c';g.fill();g.strokeStyle=hexA(d.col,.55);g.lineWidth=.02;g.stroke();
        g.strokeStyle=hexA(d.col,.3);g.beginPath();const tr=((e.prog||0)*4)%1;for(let k=0;k<8;k++){const px=-r+((k+1-tr)/8)*r*2;g.moveTo(px,sy*r*.64-r*.17);g.lineTo(px,sy*r*.64+r*.17)}g.stroke()}
      poly(g,6,r*.8,0);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.06;g.stroke();
      g.strokeStyle=hexA('#ffd23d',.55);g.lineWidth=.035;g.beginPath();for(let k=0;k<3;k++){const px=-r*.5+k*r*.28;g.moveTo(px,r*.5);g.lineTo(px+r*.16,r*.28)}g.stroke();
      g.save();g.rotate((e.gunA!=null?e.gunA:e.ang)-e.ang);
      rr(g,0,-r*.13,r*1.1,r*.26,.03);g.fillStyle=col;g.fill();
      g.beginPath();g.arc(0,0,r*.38,0,7);g.fillStyle='#2a140a';g.fill();g.strokeStyle=col;g.lineWidth=.045;g.stroke();
      const chg=d.gun&&e.cd!=null&&!e.icon?clamp(1-e.cd/1.2,0,1):0;
      if(chg>0){g.globalCompositeOperation='lighter';glow(g,r*1.12,0,.25+.2*chg,'#ffb36b',.8*chg);g.globalCompositeOperation='source-over';if(ghost)g.globalAlpha=.28}
      g.fillStyle='#ffd2b0';g.beginPath();g.arc(0,0,r*.13,0,7);g.fill();
      g.restore();
      break}
    case'boss':{ // armoured fortress with rotating plates and warning lights
      g.save();g.rotate(time*.3);for(let k=0;k<8;k++){g.save();g.rotate(k*Math.PI/4);rr(g,r*.74,-r*.22,r*.36,r*.44,.03);g.fillStyle=k%2?'#1a0a12':'#2c0f1a';g.fill();g.strokeStyle=hexA(d.col,.7);g.lineWidth=.025;g.stroke();g.restore()}g.restore();
      poly(g,8,r*.86,time*.3+Math.PI/8);g.fillStyle=dark;g.fill();g.strokeStyle=col;g.lineWidth=.06;g.stroke();
      g.save();g.rotate(-time*.9);g.strokeStyle=hexA(d.col,.85);g.lineWidth=.035;g.strokeRect(-r*.42,-r*.42,r*.84,r*.84);g.restore();
      for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2,on=Math.sin(time*6+k*1.6)>0;g.fillStyle=on?'#ff2e4d':'#3a0a14';g.beginPath();g.arc(Math.cos(a)*r*.62,Math.sin(a)*r*.62,r*.07,0,7);g.fill()}
      const pr=r*.26+Math.sin(time*5)*.025;g.beginPath();g.arc(0,0,pr,0,7);g.fillStyle=col;g.fill();g.beginPath();g.arc(0,0,pr*.45,0,7);g.fillStyle='#fff';g.fill();break}
  }
  g.restore();
  if(e.t==='guard'&&e.sh>0&&e.msh>0){const k=e.sh/e.msh;g.save();g.translate(x,y);g.rotate(time*.5);poly(g,6,r+.15,0);g.fillStyle=hexA('#5cc8ff',.05+.08*k);g.fill();g.strokeStyle=hexA('#5cc8ff',.35+.5*k);g.lineWidth=.03;g.stroke();
    g.strokeStyle=hexA('#5cc8ff',.2*k);g.lineWidth=.015;g.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;g.moveTo(Math.cos(a)*(r+.15)*.5,Math.sin(a)*(r+.15)*.5);g.lineTo(Math.cos(a)*(r+.15),Math.sin(a)*(r+.15))}g.stroke();g.restore()}
  if(e.air&&e.gnd>0&&!e.icon){g.strokeStyle=hexA('#8fa8ff',.85);g.lineWidth=.03;g.setLineDash([.05,.05]);g.beginPath();g.arc(x,y,r+.12,0,7);g.stroke();g.setLineDash([])}
  if(e.regen&&!ghost){g.fillStyle='#6dff9e';g.fillRect(x+r*.6,y-r-.02,.12,.035);g.fillRect(x+r*.6+.0425,y-r-.0625,.035,.12)}
  if(e.slowT>0){g.strokeStyle=e.brit>0?'rgba(255,255,255,.7)':'rgba(127,228,255,.7)';g.lineWidth=.025;g.setLineDash([.06,.06]);g.beginPath();g.arc(x,y,r+.08,0,7);g.stroke();g.setLineDash([])}
  if(e.frz>0){g.save();g.translate(x,y);poly(g,6,r+.1,0);g.fillStyle='rgba(200,245,255,.35)';g.fill();g.strokeStyle='#dff8ff';g.lineWidth=.03;g.stroke();g.restore()}
  if(e.stun>0&&!e.frz){g.strokeStyle='#e8e0ff';g.lineWidth=.02;g.beginPath();for(let k=0;k<3;k++){const a=time*9+k*2.1,px=x+Math.cos(a)*(r+.1),py=y-r-.05+Math.sin(a)*.05;g.moveTo(px+.03,py);g.arc(px,py,.03,0,7)}g.stroke()}
  if(e.t!=='guard'&&e.msh>0&&e.sh>0){g.strokeStyle=hexA('#5cc8ff',.4+.4*(e.sh/e.msh));g.lineWidth=.035;g.beginPath();g.arc(x,y,r+.12,-Math.PI/2,-Math.PI/2+Math.PI*2*e.sh/e.msh);g.stroke()}
  if(e.hp<e.max&&!ghost){const w=Math.max(.55,r*2),bx=x-w/2,by=y-r-.22,f=Math.max(0,e.hp/e.max);
    g.fillStyle='rgba(0,0,0,.7)';g.fillRect(bx-.02,by-.02,w+.04,.1);g.fillStyle=f>.6?'#6dff9e':f>.3?'#ffc94d':'#ff4d6d';g.fillRect(bx,by,w*f,.06)}
  g.globalAlpha=1;
}
