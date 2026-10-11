// The current run (S), game mode and speed; newGame resets everything for a new run.
import { hashS } from './util.js';
import { PROG } from '../meta/progress.js';
import { lab, ptsTotal } from '../meta/lab.js';
import { MAPS } from '../data/maps.js';
import { TYPES } from '../data/towers.js';
import { MISSIONS, NM } from '../data/campaign.js';
import { allowedFor, mFlag } from './map.js';
import { dailyCfg } from '../meta/daily.js';
import { mastLv } from '../meta/mastery.js';
import { weeklyCfg } from '../meta/weekly.js';
import { hideComms } from '../ui/comms.js';
import { PKO } from '../ui/perkChoice.js';
import { renderCoach } from '../ui/tutorial.js';
import { closeRadial } from '../ui/radial.js';
import { buildBg } from '../render/map.js';
import { updInfo } from '../ui/info.js';
import { hudLabels } from '../ui/hud.js';

export let MODE='campaign';

/* ---------- state ---------- */
export let S=null;
function chalCfg(mode,cfg){return mode==='daily'?(cfg&&cfg.key?cfg:dailyCfg()):mode==='weekly'?(cfg&&cfg.key?cfg:weeklyCfg()):null}
export function newGame(mi,mode,cfg){
  mode=mode||'campaign';MODE=mode;
  const ch=chalCfg(mode,cfg);if(ch)mi=ch.mi;
  const M=mode==='campaign'?MISSIONS[mi]:null,nm=!!(M&&cfg&&cfg.nm),map=M?M.map:MAPS[mi],nc=map.cores.length;
  const per=Math.round((20+5*lab('hp'))/(nc>1?2:1));
  const allowed=M?allowedFor(M):TYPES.filter(k=>!(ch&&ch.ban===k));
  S={mi,mode,daily:ch,mis:M,nm,map,flow:!!(M&&mFlag(M)),lives:per*nc,maxLives:per*nc,coreHp:nc>1?Array(nc).fill(per):null,coreMax:per,
     gold:ch?ch.gold:Math.round(((M?M.gold:260)+40*lab('cap'))*(nm?NM.gold:1)),wave:0,towers:[],enemies:[],proj:[],fx:[],parts:[],texts:[],queue:[],spawnT:0,
     waveActive:false,countdown:0,sel:null,place:null,hover:null,paused:false,over:false,time:0,kills:0,started:false,
     rad:null,preview:null,rsel:null,aim:null,ab:{orbital:0,emp:0,shield:0},shieldT:0,shieldBlocks:0,strikes:[],links:[],
     curMods:[],built:new Set(),sold:false,early:0,newAch:[],lost:0,tut:null,pts0:ptsTotal(),
     allowed,limit:M&&M.limit||0,peak:0,abilUsed:0,specd:false,perks:[],perkPick:null,focus:null,sw:0,bshots:[],said:{},
     flowLeft:M&&mFlag(M)?M.flowT:0,flowNext:0,flowPerk:0,bossT:null,guardW:-1,leakAir:0,leakGround:0,
     grid:map.grid.map(r=>r.slice()),wells:[],cleared:0,xpGain:0,newTiers:[],mast0:Object.fromEntries(TYPES.map(k=>[k,mastLv(k)])),gens:0,
     seed:ch?hashS(ch.key):M?M.i*101+(nm?55:7):mi*13+5};
  if(mode==='campaign'&&mi===0&&!PROG.tut)S.tut={step:0};
  closeRadial();buildBg();updInfo(true);renderCoach();hideComms();PKO.hidden=true;hudLabels();
}
export let speed=1;
export function setSpeed(v){return speed=v}
