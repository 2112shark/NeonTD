// Career simulation: a player of a given archetype plays the campaign in order with persistent progress,
// retrying on loss and spending data cores in the lab. Then tries every mission once in Nightmare.
const {load,run,labFor}=require('./sim.js');
const arch=process.argv[2]||'average',K=+(process.argv[3]||6),MAXA=+(process.env.MAXA||6),NOLAB=!!process.env.NOLAB;
const pts=G=>{const P=G.PROG;return Object.values(P.stars).reduce((a,b)=>a+b,0)+Object.keys(P.ach).length+Math.floor(P.waves/10)+(P.dailyWins||0)+(P.legacy||0)+(P.bonus||0)};
const labCost=(G,lab)=>{let s=0;for(const n of G.LAB)for(let i=0;i<(lab[n.id]||0);i++)s+=n.cost[i];return s};
const out=[];
for(let k=1;k<=K;k++){
  const G=load();const car={arch,seed:k,mis:[],nm:[]};
  for(let i=0;i<15;i++){
    let a=0,r=null,tGame=0,tWait=0;const p0=pts(G);
    while(a<MAXA){a++;const lab=NOLAB?{}:labFor(G,pts(G));r=run(G,{mission:i},{arch,seed:k*1000+i*17+a,lab});tGame+=r.time;tWait+=r.waitT;if(r.won)break}
    const lab=G.PROG.lab;
    car.mis.push({id:G.MISSIONS[i].id,att:a,won:r.won,mask:r.mask,pts:p0,labSpent:labCost(G,lab),tGame:Math.round(tGame),tWait:Math.round(tWait),
      xp:G.seasonState().xp,ach:Object.keys(G.PROG.ach).length,kills:G.PROG.kills,waves:G.PROG.waves,leaks:r.leaks,perks:r.perks,lives:r.lives,maxLives:r.maxLives});
  }
  for(let i=0;i<15;i++){const lab=NOLAB?{}:labFor(G,pts(G));const r=run(G,{mission:i,nm:true},{arch,seed:k*5000+i,lab});
    car.nm.push({id:G.MISSIONS[i].id,won:r.won,mask:r.mask,wave:r.wave,time:Math.round(r.time+r.waitT),leaks:r.leaks})}
  car.final={pts:pts(G),xp:G.seasonState().xp,ach:Object.keys(G.PROG.ach),kills:G.PROG.kills,waves:G.PROG.waves,mast:G.MISSIONS.length&&['laser','cannon','cryo','tesla','sniper','gravi','gen'].map(t=>[t,G.mastLv(t),G.mastXP(t)]),own:Object.keys(G.PROG.own||{}),st:G.PROG.st.ek};
  out.push(car);
  console.error(arch,k,car.mis.map(m=>m.id+':'+m.att+(m.won?'':'!')+'/'+m.mask).join(' '),'| nm',car.nm.filter(x=>x.won).length+'/15','| pts',car.final.pts,'xp',car.final.xp);
}
require('fs').writeFileSync(require('./sim.js').out(`career_${arch}${NOLAB?'_nolab':''}.json`),JSON.stringify(out));
