// Boss missions m5, m10, m15: N fights per archetype with the typical lab of a career at that point.
// Usage: node bossfocus.js [N=20] [archetypes=beginner,novice,average,expert]
// Output: out/bossfocus.json  {arch: {m5: [{won,mask,lives,max,laps,bossLeak,wave}], ...}}
const {load,run,labFor,out}=require('./sim.js');const G=load();
const PTS=[0,7,13,20,24,31,36,41,46,52,60,66,72,78,83]; // typical data cores at mission start (from careers)
const N=+(process.argv[2]||20),arches=(process.argv[3]||'beginner,novice,average,expert').split(','),res={};
for(const arch of arches){res[arch]={};
  for(const i of [4,9,14]){const lab=labFor(G,PTS[i]),rs=[];
    for(let s=0;s<N;s++){const r=run(G,{mission:i},{arch,seed:7000+s*31+i,lab});
      rs.push({won:r.won,mask:r.mask,lives:r.lives,max:r.maxLives,laps:r.bossLaps||0,bossLeak:r.bossLeak,wave:r.wave})}
    res[arch][G.MISSIONS[i].id]=rs;
    console.error(arch,G.MISSIONS[i].id,'win',rs.filter(r=>r.won).length+'/'+N,'laps',rs.filter(r=>r.laps).length,
      'won after lap',rs.filter(r=>r.laps&&r.won).length,'s2',rs.filter(r=>r.mask&2).length,'s3',rs.filter(r=>r.mask&4).length)}}
require('fs').writeFileSync(out('bossfocus.json'),JSON.stringify(res));
