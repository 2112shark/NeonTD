// Headless simulator v3 for the audit: player archetypes, realistic waiting between waves,
// income/leak instrumentation, persistent careers. Runs the real game code in a vm with a stub DOM.
const fs=require('fs'),vm=require('vm'),path=require('path');
const HTML=process.env.TD_HTML||path.join(__dirname,'..','..','game','neon-td.html');
// results go to tools/sim/out (or SIM_OUT); scripts call out('name.json')
const out=name=>{const d=process.env.SIM_OUT||path.join(__dirname,'out');fs.mkdirSync(d,{recursive:true});return path.join(d,name)};
function mk(){const store={};return new Proxy(function(){},{
  get(_,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k in store)return store[k];return store[k]=mk()},
  set(_,k,v){store[k]=v;return true},apply(){return mk()},construct(){return mk()}})}
function inject(js){
  const R=(a,b)=>{const n=js.split(a).length-1;if(n!==1)throw new Error('hook '+n+'x: '+a.slice(0,60));js=js.replace(a,b)};
  R("const ci=e.rt.core||0;","if(window.__onLeak)window.__onLeak(e,dmg);const ci=e.rt.core||0;");
  js=js.replace(/const rw=e\.rw\+\(hasP\('bounty'\)\?(\d):0\);S\.gold\+=rw;/,(m,k)=>`const rw=e.rw+(hasP('bounty')?${k}:0);S.gold+=rw;S.incK=(S.incK||0)+rw;`);
  R("if(it>0){S.gold+=it;","if(it>0){S.gold+=it;S.incI=(S.incI||0)+it;");
  R("if(eb>0){S.gold+=eb;","if(eb>0){S.gold+=eb;S.incE=(S.incE||0)+eb;");
  return js;
}
function load(file){
  const js=inject(fs.readFileSync(file||HTML,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]);
  const ls=new Map();
  const ctx={document:mk(),performance:{now:()=>0},requestAnimationFrame:()=>0,ResizeObserver:class{observe(){}},
    devicePixelRatio:1,addEventListener(){},setTimeout:()=>0,clearTimeout(){},console,Date,
    localStorage:{getItem:k=>ls.has(k)?ls.get(k):null,setItem:(k,v)=>ls.set(k,String(v)),removeItem:k=>ls.delete(k)}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const G=ctx.__td;G.ctx=ctx;return G;
}
const STRATS={
  balanced:{order:['laser','cannon','cryo','tesla','sniper','gravi','laser','gen','tesla','cannon'],br:{laser:'A',cannon:'B',cryo:'B',tesla:'A',sniper:'A',gravi:'A',gen:'B'}},
  balancedB:{order:['laser','cannon','cryo','tesla','sniper','gravi','laser','gen','tesla','cannon'],br:{laser:'B',cannon:'A',cryo:'A',tesla:'B',sniper:'B',gravi:'B',gen:'A'}},
  balanced5:{order:['laser','cannon','cryo','tesla','sniper','laser','tesla','cannon'],br:{laser:'A',cannon:'B',cryo:'B',tesla:'A',sniper:'A'}},
  gravCannon:{order:['cannon','gravi','cryo','cannon','gen','laser'],br:{cannon:'A',gravi:'B',cryo:'B',gen:'A',laser:'A'}},
  genEco:{order:['laser','gen','tesla','gen','cryo','sniper'],br:{laser:'A',gen:'A',tesla:'A',cryo:'B',sniper:'A'}},
  lasers:{order:['laser','laser','cryo'],br:{laser:'A',cryo:'B'}},
  cannonCryo:{order:['cannon','cryo','laser','tesla'],br:{cannon:'B',cryo:'B',tesla:'A',laser:'A'}},
  teslaCryo:{order:['tesla','cryo','tesla','laser'],br:{tesla:'A',cryo:'B',laser:'B'}},
  snipers:{order:['sniper','cryo','sniper','laser'],br:{sniper:'B',cryo:'B',laser:'A'}},
};
// player archetypes
const ARCH={
  beginner:{topK:15,perk:'random',abil:false,focus:false,density:.7,wait:1,react:450,fork:false,debris:false,noise:true,noBranch:true},
  novice: {topK:8,perk:'random',abil:false,focus:false,density:.85,wait:1,react:240,fork:false,debris:false,noise:true},
  average:{topK:3,perk:'mixed',abil:'casual',focus:'boss',density:1,wait:.5,react:90,fork:true,debris:false,noise:true},
  expert: {topK:1,perk:'pref',abil:'smart',focus:'smart',density:1,wait:0,react:8,fork:true,debris:true,noise:false},
};
const PERK_PREF=['dmg','rate','boss','air','armor','lens','chain','blast','frost','crit','chainx','rng','cheap','bank','bounty','hp','guard','cd','heavy','divid'];
const FALLBACK=['laser','cannon','cryo','tesla','sniper'];
function samples(G,S){
  const out={g:[],a:[]},m=S.map;
  const seg=(P,arr,w)=>{for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b.x-a.x,b.y-a.y);
    for(let s=0;s<L;s+=.1){const x=a.x+(b.x-a.x)*s/L,y=a.y+(b.y-a.y)*s/L;if(x<0||y<0||x>G.COLS||y>G.ROWS)continue;arr.push({x,y,w})}}};
  const w=m.fork!=null?.5:1;
  m.routes.forEach((rt,i)=>{const a=out.g.length,b=out.a.length;seg(rt.path,out.g,w);seg(rt.air,out.a,w);for(let k=a;k<out.g.length;k++)out.g[k].l=i;for(let k=b;k<out.a.length;k++)out.a[k].l=i});
  return out;
}
function laneW(G,S,P){const n=S.map.cores.length>1?S.map.routes.length:1,cov=Array(n).fill(0);if(n<2)return cov.map(()=>1);
  for(const t of S.towers){const st=G.stats(t),r2=st.range*st.range,pw=(st.dps||st.dmg/(st.rate||1)||10)*(st.chains||1);for(const p of P.g)if((p.x-t.x)**2+(p.y-t.y)**2<=r2)cov[p.l]+=pw*.01}
  return cov.map(c=>1/(1+c/40))}
function tileScore(G,S,P,type,c,r,LW){
  if(type==='gen'){let s=.1;for(const u of S.towers)if(u.type!=='gen'&&Math.max(Math.abs(u.c-c),Math.abs(u.r-r))<=1)s+=3+(u.lvl||1);return s}
  const range=G.TD[type].lv[0].range+.2,x=c+.5,y=r+.5,r2=range*range;let s=0;LW=LW||[1,1];
  for(const p of P.g)if((p.x-x)**2+(p.y-y)**2<=r2)s+=.1*p.w*(LW[p.l]||1);
  if(G.TD[type].air)for(const p of P.a)if((p.x-x)**2+(p.y-y)**2<=r2)s+=.05*p.w*(LW[p.l]||1);
  for(const u of S.towers){if(Math.max(Math.abs(u.c-c),Math.abs(u.r-r))>1)continue;
    for(const rule of G.SYN){if((rule.to===type&&rule.from===u.type)||(rule.to===u.type&&rule.from===type))s+=2}}
  if(S.grid&&S.grid[r][c]===3)s*=1.3;
  return s;
}
function bestTile(G,S,P,type,B){
  let best=null,bs=-1;const LW=laneW(G,S,P),all=[];
  for(let r=0;r<G.ROWS;r++)for(let c=0;c<G.COLS;c++){if(!G.canBuild(c,r))continue;const s=tileScore(G,S,P,type,c,r,LW);all.push([s,c,r]);if(s>bs){bs=s;best=[c,r]}}
  if(B.topK>1&&all.length){all.sort((a,b)=>b[0]-a[0]);const k=all[Math.floor(B.rnd()*Math.min(B.topK,all.length))];return[k[1],k[2]]}
  return best;
}
function upCost(G,t,st,B){if(t.lvl<3)return G.ucost(t);if(!t.br&&!(B&&B.noBranch))return G.ucost(t,st.br[t.type]||'A');return Infinity}
function pickType(S,st,B){
  let type=st.order[B.built%st.order.length];
  if(!S.allowed.includes(type))type=FALLBACK.find(k=>S.allowed.includes(k)&&st.order.includes(k))||FALLBACK.find(k=>S.allowed.includes(k));
  return type;
}
function clearDebris(G,S,P){
  if(!S.grid||S.wave<2||!S.map.debris)return;const cost=G.debCost();if(S.gold<cost+220)return;
  let bestFree=0;for(let r=0;r<G.ROWS;r++)for(let c=0;c<G.COLS;c++)if(G.canBuild(c,r))bestFree=Math.max(bestFree,tileScore(G,S,P,'laser',c,r));
  for(const [c,r] of S.map.debris){if(!G.isDebris(c,r))continue;if(tileScore(G,S,P,'laser',c,r)>bestFree*1.15){G.doClear(c,r);return}}
}
function spend(G,S,P,st,B){
  if(B.debris)clearDebris(G,S,P);
  for(let guard=0;guard<40;guard++){
    let target=Math.floor(2+S.wave*.45*B.density);if(S.flow)target=Math.floor(2+S.wave*.3*B.density);
    if(S.limit)target=Math.min(target,S.limit);
    const type=pickType(S,st,B);
    const ups=S.towers.map(t=>[t,upCost(G,t,st,B)]).filter(x=>x[1]<Infinity).sort((a,b)=>a[1]-b[1]);
    const wantBuild=(S.towers.length<target||!ups.length)&&!(S.limit&&S.towers.length>=S.limit);
    if(wantBuild){
      if(S.gold<G.tcost(type))return;
      const tl=bestTile(G,S,P,type,B);if(!tl)return;
      if(G.build(type,tl[0],tl[1]))B.built++;else return;
    }else{
      if(!ups.length)return;
      const [t,c]=ups[0];if(S.gold<c)return;
      if(t.lvl<3)G.upgrade(t);else G.upgrade(t,st.br[t.type]||'A');
    }
  }
}
function forkChoice(G,S){
  const m=S.map;if(m.fork==null)return;
  const cov=m.routes.map(rt=>{let s=0;for(let i=m.fork;i<rt.path.length-1;i++){const a=rt.path[i],b=rt.path[i+1],L=Math.hypot(b.x-a.x,b.y-a.y);
    for(let k=0;k<L;k+=.25){const x=a.x+(b.x-a.x)*k/L,y=a.y+(b.y-a.y)*k/L;for(const t of S.towers){const st=G.stats(t);if((t.x-x)**2+(t.y-y)**2<=st.range*st.range)s+=(st.dps||st.dmg/(st.rate||1))}}}return s});
  const want=cov[1]>cov[0]*1.05?1:0;if(S.sw!==want)G.toggleFork();
}
function abilities(G,S,B){
  const E=S.enemies;if(!E.length||!B.abil)return;
  if(S.ab.orbital<=0){let best=null,bn=0;for(const e of E){let n=0;for(const f of E)if((f.x-e.x)**2+(f.y-e.y)**2<=2.25)n+=f.d.boss?6:1;if(n>bn){bn=n;best=e}}
    if(bn>=4){G.castOrbital(best.x,best.y)}}
  if(S.ab.emp<=0){const n=E.filter(e=>e.prog/e.len>.7).length,boss=E.some(e=>e.d.boss&&e.prog/e.len>.55);if(n>=4||boss)G.useAbility('emp')}
  if(S.ab.shield<=0){const n=E.filter(e=>e.prog/e.len>.88).length,boss=E.some(e=>e.d.boss&&e.prog/e.len>.85);if(n>=2||boss)G.useAbility('shield')}
}
function focus(G,S,B){
  if(S.focus||!B.focus)return;
  const b=S.enemies.find(e=>e.d.boss&&!e.dead)||(B.focus==='smart'?S.enemies.find(e=>e.t==='medic'&&!e.dead&&e.x>0&&e.y>0&&e.x<G.COLS&&e.y<G.ROWS):null);if(b)G.setFocus(b);
}
function choosePerk(G,S,B){const pk=S.perkPick;if(!pk)return;let id;
  if(B.forcePerk&&pk.includes(B.forcePerk))id=B.forcePerk;
  else if(B.perk==='random'||(B.perk==='mixed'&&B.rnd()<.5))id=pk[Math.floor(B.rnd()*pk.length)];
  else id=PERK_PREF.find(p=>pk.includes(p))||pk[0];
  G.takePerk(id);(B.perksTaken=B.perksTaken||[]).push(id)}
function mkRnd(seed){let a=seed||12345;return()=>{a=(a*1103515245+12345)&0x7fffffff;return a/0x7fffffff}}
// target: {mission:i, nm} | {map:i, mode:'endless'|'daily'|'weekly', cfg}
function run(G,target,opt={}){
  const B=Object.assign({},ARCH[opt.arch||'expert'],opt.over||{});B.rnd=mkRnd(opt.seed||1);B.built=0;
  const st=STRATS[opt.strat||'balanced'];
  if(opt.lab!==undefined)G.PROG.lab=opt.lab;
  G.PROG.tut=1;
  if(target.mission!=null)G.newGame(target.mission,'campaign',{nm:!!target.nm});
  else G.newGame(target.map,target.mode||'endless',target.cfg);
  const S=G.S;if(opt.diff)S.diffMul=opt.diff;
  if(opt.perksAtStart)for(const p of opt.perksAtStart){S.perkPick=[p];G.takePerk(p)}
  const leaks={};G.ctx.__onLeak=(e,d)=>{leaks[e.t]=(leaks[e.t]||0)+d};
  const P=samples(G,S);
  const dt=1/30;let tick=0,waitT=0;const waves=[];
  const MAXW=S.mode==='endless'?(opt.maxWave||60):(S.flow?999:G.maxW());
  const tickFn=()=>{
    G.update(dt);tick++;
    if(S.perkPick)choosePerk(G,S,B);
    if(tick%B.react===0){spend(G,S,P,st,B);if(B.fork)forkChoice(G,S)}
    if(B.abil&&tick%(B.abil==='smart'?8:90)===0)abilities(G,S,B);
    if(B.focus&&tick%(B.focus==='smart'?8:60)===0)focus(G,S,B);
  };
  if(S.flow){spend(G,S,P,st,B);if(B.fork)forkChoice(G,S);G.startWave();while(!S.over&&tick<30*400)tickFn()}
  else{
    spend(G,S,P,st,B);if(B.fork)forkChoice(G,S);G.startWave();
    while(!S.over&&S.wave<=MAXW){
      const lives0=S.lives,t0=S.time,w=S.wave;
      while(S.waveActive&&!S.over){tickFn();if(S.time-t0>600){S.over=true;S.timeout=true;break}}
      waves.push({w,leak:lives0-S.lives,lives:S.lives,gold:Math.floor(S.gold),towers:S.towers.length,dur:+(S.time-t0).toFixed(1)});
      if(S.over||S.wave>=MAXW)break;
      // between waves: perk choice, spending, then either call the wave early or wait part of the countdown
      if(S.perkPick)choosePerk(G,S,B);
      spend(G,S,P,st,B);if(B.fork)forkChoice(G,S);
      const waitFor=15*B.wait;let wt=0;
      while(!S.over&&!S.waveActive&&wt<waitFor-1e-9){G.update(dt);tick++;wt+=dt;if(S.perkPick)choosePerk(G,S,B);if(tick%B.react===0)spend(G,S,P,st,B)}
      waitT+=wt;
      if(!S.waveActive&&!S.over)G.startWave();
    }
  }
  const dmg={},eff={};for(const t of S.towers){dmg[t.type]=(dmg[t.type]||0)+(t.dmg||0);eff[t.type]=eff[t.type]||{d:0,c:0,n:0};eff[t.type].d+=t.dmg||0;eff[t.type].c+=t.spent;eff[t.type].n++}
  const tot=Object.values(dmg).reduce((a,b)=>a+b,0)||1;const share={};for(const k in dmg)share[k]=Math.round(dmg[k]/tot*100);
  let mask=0;if(S.won&&S.mis){mask=1;if(G.starOk(S.mis.s2))mask|=2;if(G.starOk(S.mis.s3))mask|=4}
  return {won:S.won===true,wave:S.wave,lives:S.lives,maxLives:S.maxLives,cores:S.coreHp&&S.coreHp.slice(),kills:S.kills,time:S.time,waitT,
    perks:S.perks.slice(),bossT:S.bossT,bossLeak:!!S.bossLeak,bossLaps:S.bossLaps||0,mask,share,eff,waves,leaks,timeout:!!S.timeout,
    inc:{kill:S.incK||0,int:S.incI||0,early:S.incE||0,gen:S.gens||0},abil:S.abilUsed,towers:S.towers.map(t=>t.type+t.lvl+(t.br||'')),
    score:S.daily?G.dailyScore(S.won===true):0};
}
// lab bought in a typical priority order with a given budget of data cores
const LAB_ORDER=['dmg','cap','hp','dmg','rng','cap','thr','dmg','hp','cd','int','foc','rec','perk','orb','emp','vet','thr','cap','cd'];
function labFor(G,budget){const lab={};let left=budget;
  for(const id of LAB_ORDER){const n=G.LAB.find(x=>x.id===id),lv=lab[id]||0;if(lv>=n.max)continue;const c=n.cost[lv];if(c>left)break;lab[id]=lv+1;left-=c}
  return lab}
module.exports={load,run,STRATS,ARCH,labFor,LAB_ORDER,mkRnd,out};
