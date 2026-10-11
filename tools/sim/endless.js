const {load,run,labFor}=require('./sim.js');const G=load();const out=[];
for(const a of ['beginner','novice','average','expert'])for(const lab of ['none','full'])for(const mi of [0,1,2]){
  const r=run(G,{map:mi,mode:'endless'},{arch:a,lab:lab==='none'?{}:labFor(G,999),maxWave:90,seed:5});out.push({a,lab,map:mi,wave:r.wave,t:Math.round(r.time+r.waitT)});
  console.error(a.padEnd(8),lab.padEnd(4),G.MAPS[mi].name.padEnd(10),'wave',r.wave,'time',Math.round((r.time+r.waitT)/60)+'min')}
require('fs').writeFileSync(require('./sim.js').out('endless.json'),JSON.stringify(out));
