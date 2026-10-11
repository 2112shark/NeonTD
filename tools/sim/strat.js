// Strategy viability and empirical damage per credit: expert bot, no lab, endless on all three maps.
const {load,run,STRATS}=require('./sim.js');const G=load();
const names=(process.argv[2]||Object.keys(STRATS).join(',')).split(','),out={};
for(const s of names){out[s]=[];for(const mi of [0,1,2]){const r=run(G,{map:mi,mode:'endless'},{arch:'expert',strat:s,lab:{},maxWave:90,seed:3});
  const eff={};for(const k in r.eff)eff[k]=+(r.eff[k].d/r.eff[k].c).toFixed(1);
  out[s].push({map:G.MAPS[mi].name,wave:r.wave,share:r.share,eff,towers:r.towers.length,inc:r.inc});
  console.error(s.padEnd(11),G.MAPS[mi].name.padEnd(10),'w'+r.wave,JSON.stringify(r.share),'dmg/credit',JSON.stringify(eff))}}
require('fs').writeFileSync(require('./sim.js').out('strat.json'),JSON.stringify(out));
