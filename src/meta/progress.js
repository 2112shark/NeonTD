// Persistent progress (PROG): load from localStorage and migrate old saves.
/* ---------- persistent progress ---------- */
const PK='neon-rubezh-v2';
export const freshProg=()=>({stars:{},ms:{},ach:{},lab:{},waves:0,kills:0,specs:[],mods:[],best:{},daily:null,dailyWins:0,tut:0,set:{sound:true,vib:true},streak:null,seenAch:0,legacy:0,bonus:0,q:null,st:{},seenE:{},own:{},skin:{},kfx:'none',title:'',show:[],season:null,weekly:null,buy:{},refund:{},ts:0});
export let PROG=freshProg();
try{Object.assign(PROG,JSON.parse(localStorage.getItem(PK)||'{}'))}catch(e){}
PROG.set=Object.assign({sound:true,vib:true},PROG.set||{});
for(const k of['ms','st','seenE','stars','ach','lab','best','own','skin','buy','refund'])if(!PROG[k]||typeof PROG[k]!=='object')PROG[k]={};
if(!Array.isArray(PROG.show))PROG.show=[];
// v3: the three 30-wave maps became a mission campaign; stars earned there stay as data cores
if((PROG.v||0)<3){
  try{const o=JSON.parse(localStorage.getItem('neon-rubezh-stars')||'{}');for(const k in o)PROG.stars[k]=Math.max(PROG.stars[k]||0,o[k])}catch(e){}
  for(const k of['0','1','2'])if(PROG.stars[k]!=null){PROG.legacy=(PROG.legacy||0)+PROG.stars[k];delete PROG.stars[k]}
  PROG.v=3}
export function saveLocal(){try{localStorage.setItem(PK,JSON.stringify(PROG))}catch(e){}}
export function setPROG(v){return PROG=v}
