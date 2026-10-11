// Win/star rates per mission for an archetype at a fixed lab state: none, or the typical lab at that point of a career.
const {load,run,labFor}=require('./sim.js');const G=load();
const arch=process.argv[2]||'novice',labMode=process.argv[3]||'none',N=+(process.argv[4]||10),nm=process.argv[5]==='nm';
const PTS=[0,7,13,20,24,31,36,41,46,52,60,66,72,78,83]; // typical data cores at mission start (from careers)
const out=[];
for(let i=0;i<15;i++){const lab=labMode==='none'?{}:labMode==='full'?labFor(G,999):labFor(G,PTS[i]);
  const rs=[];for(let s=0;s<N;s++){const r=run(G,{mission:i,nm},{arch,seed:7000+s*31+i,lab});rs.push({won:r.won,mask:r.mask,wave:r.wave,lives:r.lives,max:r.maxLives,t:Math.round(r.time+r.waitT),leaks:r.leaks,bossLeak:r.bossLeak,bossT:r.bossT,share:r.share,inc:r.inc,perks:r.perks,timeout:r.timeout})}
  const w=rs.filter(r=>r.won).length;out.push({id:G.MISSIONS[i].id,rs});
  console.error(arch,labMode,nm?'NM':'',G.MISSIONS[i].id,'win',w+'/'+N,'s2',rs.filter(r=>r.mask&2).length,'s3',rs.filter(r=>r.mask&4).length,'t',Math.round(rs.reduce((a,r)=>a+r.t,0)/N/60*10)/10+'min');
}
require('fs').writeFileSync(require('./sim.js').out(`mx_${arch}_${labMode}${nm?'_nm':''}.json`),JSON.stringify(out));
