// Impact of each run perk under pressure: the perk is active from wave 1, novice bot without lab on missions 11 and 13
// (both are lost most of the time without help), so the perk's value shows up as waves survived and wins.
const {load,run}=require('./sim.js');const G=load();
const ids=['none',...G.PERKS.map(p=>p.id)],mis=[10,12],N=8,out={};
for(const id of ids){let prog=0,wins=0,n=0;
  for(const mi of mis)for(let s=0;s<N;s++){const M=G.MISSIONS[mi];
    const r=run(G,{mission:mi},{arch:'novice',lab:{},seed:900+s*13+mi,perksAtStart:id==='none'?[]:[id]});
    prog+=r.won?1+r.lives/r.maxLives:(r.wave-1)/M.waves;wins+=r.won?1:0;n++}
  out[id]={prog:+(prog/n).toFixed(3),win:wins/n};console.error(id.padEnd(7),'progress',(prog/n).toFixed(3),'wins',wins+'/'+n)}
require('fs').writeFileSync(require('./sim.js').out('perk.json'),JSON.stringify(out));
