// Synthesized sound effects (WebAudio), mute state.
import { PROG } from '../meta/progress.ts';

/* ---------- audio ---------- */
export let AC=null,master=null,muted=!PROG.set.sound;const lastS={};
export function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.32;master.connect(AC.destination)}catch(e){AC=null}}
function tone(f,dur,type,vol,f2){const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02)}
let nbuf=null;
function noise(dur,vol,ftype,freq){if(!nbuf){nbuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;s.buffer=nbuf;f.type=ftype;f.frequency.value=freq;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur)}
export function snd(k){if(muted||!AC)return;const now=performance.now();if(now-(lastS[k]||0)<(k==='kill'?45:70))return;lastS[k]=now;
  try{switch(k){
    case'build':tone(420,.12,'square',.08,900);break;
    case'tap':tone(900,.04,'square',.04);break;
    case'up':tone(500,.08,'square',.07,750);setTimeout(()=>tone(750,.12,'square',.07,1200),70);break;
    case'sell':tone(700,.15,'triangle',.1,300);break;
    case'cannon':noise(.18,.35,'lowpass',700);tone(140,.15,'sine',.25,55);break;
    case'boom':noise(.3,.25,'lowpass',420);break;
    case'cryo':tone(1500,.18,'sine',.05,700);break;
    case'tesla':noise(.09,.18,'highpass',2500);tone(260,.09,'sawtooth',.05,520);break;
    case'sniper':tone(1100,.12,'square',.06,180);noise(.06,.15,'highpass',3000);break;
    case'kill':tone(320+Math.random()*80,.07,'triangle',.06,720);break;
    case'leak':tone(220,.35,'sawtooth',.14,70);break;
    case'block':tone(900,.2,'triangle',.1,1400);break;
    case'wave':[330,440,660].forEach((f,i)=>setTimeout(()=>tone(f,.14,'square',.06),i*90));break;
    case'boss':tone(90,.9,'sawtooth',.18,45);break;
    case'orbital':tone(1800,.6,'sine',.08,200);break;
    case'strike':noise(.7,.45,'lowpass',300);tone(80,.6,'sine',.35,30);break;
    case'emp':tone(200,.6,'square',.1,1600);noise(.4,.2,'bandpass',1200);break;
    case'shield':[520,780,1040].forEach((f,i)=>setTimeout(()=>tone(f,.2,'sine',.08),i*60));break;
    case'ach':[660,880,1320].forEach((f,i)=>setTimeout(()=>tone(f,.18,'triangle',.08),i*80));break;
    case'win':[440,550,660,880].forEach((f,i)=>setTimeout(()=>tone(f,.25,'triangle',.1),i*130));break;
    case'lose':[300,220,150].forEach((f,i)=>setTimeout(()=>tone(f,.4,'sawtooth',.1),i*200));break;
    case'heal':tone(660,.18,'sine',.035,990);break;
    case'jam':noise(.18,.12,'bandpass',900);tone(120,.18,'square',.04,90);break;
    case'blink':tone(1400,.12,'sine',.05,300);break;
    case'phase':tone(70,1,'sawtooth',.16,140);noise(.6,.2,'lowpass',500);break;
    case'perk':[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.16,'triangle',.07),i*70));break;
    case'focus':tone(1200,.06,'square',.05);setTimeout(()=>tone(1600,.08,'square',.05),60);break;
    case'quest':[784,988].forEach((f,i)=>setTimeout(()=>tone(f,.14,'triangle',.07),i*90));break;
    case'wshot':tone(300,.25,'sawtooth',.1,90);noise(.2,.2,'lowpass',900);break;
    case'grav':tone(160,.5,'sine',.12,60);tone(90,.5,'triangle',.06,180);break;
    case'coin':tone(1320,.08,'square',.04);setTimeout(()=>tone(1760,.12,'square',.04),60);break;
    case'vet':[784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.12,'triangle',.06),i*60));break;
  }}catch(e){}}
export function setMuted(v){return muted=v}
