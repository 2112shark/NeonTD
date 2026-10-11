// Saving: local + cloud save, weekly leaderboard (cloud parts only work inside Claude).
import { $ } from '../core/util.ts';
import { PROG, saveLocal, setPROG } from './progress.js';
import { weekKey } from './daily.ts';
import { seasonMigrate } from './season.js';
import { popc } from '../core/endgame.js';
import { LOBBY, rankInfo } from '../ui/lobby/shared.js';
import { LBY } from '../ui/lobby/state.js';
import { boardHtml } from '../ui/lobby/weekly.js';
import { go } from '../ui/lobby/nav.js';

export function saveProg(){PROG.ts=Date.now();saveLocal();cloudSave()}

/* ---------- shared table and cloud save (only when the page runs inside Claude) ---------- */
export const NET={db:null,user:null,me:null,name:'',rows:null,state:'off',unsub:null,wk:null,names:{},saveT:0,cloud:false};
export async function netInit(){
  try{const C=typeof window!=='undefined'&&window.claude;if(!C||typeof C.use!=='function')return;
    const [db,user]=await Promise.all([C.use('db'),C.use('user')]);
    NET.user=user||null;
    if(user){try{const me=await user.me();NET.me=me&&me.id||null;NET.name=me&&me.name||''}catch(e){}}
    if(!db)return;NET.db=db;NET.state='wait';lbSub();
    if(NET.me)cloudLoad();
    if(!LOBBY.hidden&&LBY.scr)go(LBY.scr,true);
  }catch(e){NET.state='off'}}
export function lbSub(){const wk=weekKey();if(!NET.db||(NET.unsub&&NET.wk===wk))return;if(NET.unsub){try{NET.unsub()}catch(e){}}NET.wk=wk;NET.rows=null;
  try{NET.unsub=NET.db.collection('scores').where('wk','==',wk).orderBy('score','desc').limit(50).onSnapshot(s=>{NET.rows=s.docs.map(d=>Object.assign({},d.data(),{id:d.id}));NET.state='ok';lbNames()},()=>{NET.state='err';NET.unsub=null;refreshBoard()})}
  catch(e){NET.state='err'}}
async function lbNames(){if(NET.user&&NET.rows&&NET.rows.length){try{const ps=await NET.user.profiles(NET.rows.map(r=>r.id));for(const id in ps)NET.names[id]=ps[id]&&ps[id].name||''}catch(e){}}refreshBoard()}
function refreshBoard(){if(!LOBBY.hidden&&LBY.scr==='weekly'){const el=$('#board');if(el)el.innerHTML=boardHtml()}}
export async function lbSubmit(score,won,wave){if(!NET.db||!NET.me)return;const wk=weekKey(),ref=NET.db.doc('scores/'+NET.me);
  try{const cur=await ref.get();const d=cur.exists?cur.data():null;if(d&&d.wk===wk&&d.score>=score)return;
    await ref.set({wk,score,won:!!won,wave,ts:Date.now(),title:PROG.title||'',rank:rankInfo().i})}catch(e){}}
export function mergeProg(L,C){
  if(!C||typeof C!=='object')return L;
  const mx=(a,b)=>Math.max(a||0,b||0),newer=(C.ts||0)>(L.ts||0)?C:L;
  const mapMax=(a,b)=>{const r=Object.assign({},a||{});for(const k in b||{})r[k]=typeof b[k]==='number'?Math.max(r[k]||0,b[k]):(r[k]!=null?r[k]:b[k]);return r};
  const o=Object.assign({},C,L);
  o.ms=Object.assign({},C.ms||{});for(const k in L.ms||{})o.ms[k]=(o.ms[k]||0)|L.ms[k];
  o.stars={};for(const k in o.ms)o.stars[k]=popc(o.ms[k]);
  o.ach=Object.assign({},C.ach||{},L.ach||{});o.own=Object.assign({},C.own||{},L.own||{});o.buy=Object.assign({},C.buy||{},L.buy||{});o.refund=Object.assign({},C.refund||{},L.refund||{});o.seenE=Object.assign({},C.seenE||{},L.seenE||{});
  for(const k of['waves','kills','dailyWins','legacy','bonus','tut','seenAch','v'])o[k]=mx(L[k],C[k]);
  o.best=mapMax(L.best,C.best);
  o.specs=[...new Set([...(L.specs||[]),...(C.specs||[])])];o.mods=[...new Set([...(L.mods||[]),...(C.mods||[])])];
  const st={},Ls=L.st||{},Cs=C.st||{};for(const k of new Set([...Object.keys(Ls),...Object.keys(Cs)])){const a=Ls[k],b=Cs[k];st[k]=(a&&typeof a==='object')||(b&&typeof b==='object')?mapMax(a,b):mx(a,b)}o.st=st;
  const pair=(a,b,same,join)=>a&&b?(same(a,b)?join(a,b):((a.key||a.id||a.day)>(b.key||b.id||b.day)?a:b)):(a||b||null);
  o.season=pair(L.season,C.season,(a,b)=>a.id===b.id,(a,b)=>{const A=seasonMigrate(Object.assign({},a)),B=seasonMigrate(Object.assign({},b));return{id:a.id,xp:mx(A.xp,B.xp),got:mx(A.got,B.got),e2:1}});
  o.daily=pair(L.daily,C.daily,(a,b)=>a.key===b.key,(a,b)=>({key:a.key,best:mx(a.best,b.best),won:!!(a.won||b.won)}));
  o.weekly=pair(L.weekly,C.weekly,(a,b)=>a.key===b.key,(a,b)=>({key:a.key,best:mx(a.best,b.best),plays:mx(a.plays,b.plays)}));
  o.q=pair(L.q,C.q,(a,b)=>a.day===b.day,(a,b)=>{const r=JSON.parse(JSON.stringify(a));r.list.forEach((q,i)=>{const z=b.list[i];if(z&&z.id===q.id){q.p=mx(q.p,z.p);q.c=q.c||z.c}});
    if(b.wk&&r.wk&&b.wkk===r.wkk&&b.wk.id===r.wk.id){r.wk.p=mx(r.wk.p,b.wk.p);r.wk.c=r.wk.c||b.wk.c}r.bonus=a.bonus||b.bonus;return r});
  for(const k of['lab','skin','kfx','title','show','streak','set'])if(newer[k]!=null)o[k]=newer[k];
  o.ts=mx(L.ts,C.ts);return o}
async function cloudLoad(){try{const snap=await NET.db.doc('data/users/'+NET.me+'/save').get();
    if(snap.exists){const d=snap.data();if(d&&typeof d.data==='string'){const C=JSON.parse(d.data);setPROG(mergeProg(PROG,C));saveLocal();if(!LOBBY.hidden&&LBY.scr)go(LBY.scr,true)}}
    NET.cloud=true;cloudSave()}catch(e){}}
function cloudSave(){if(!NET.db||!NET.me||!NET.cloud)return;clearTimeout(NET.saveT);
  NET.saveT=setTimeout(async()=>{try{await NET.db.doc('data/users/'+NET.me+'/save').set({v:3,ts:Date.now(),data:JSON.stringify(PROG)})}catch(e){}},4000)}
