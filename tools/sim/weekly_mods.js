// Weekly challenge on the weeks (2026-W41 .. 2027-W13) whose modifiers include the given one, all archetypes.
// Usage: node weekly_mods.js [modifier=cloak]   Output: out/weekly_<modifier>.json
const {load,run,out}=require('./sim.js');const G=load();
const mod=process.argv[2]||'cloak',arches=['beginner','novice','average','expert'],pad=n=>String(n).padStart(2,'0'),res=[];
for(let w=41;w<=66;w++){const yr=w>53?2027:2026,wn=w>53?w-53:w,key=`${yr}-W${pad(wn)}`,cfg=G.weeklyCfg(key);if(!cfg.mods.includes(mod))continue;
  const row={key,mi:cfg.mi,mods:cfg.mods,res:{}};
  for(const a of arches){const r=run(G,{map:cfg.mi,mode:'weekly',cfg},{arch:a,lab:{},seed:w});row.res[a]={won:r.won,score:r.score,wave:r.wave,league:G.leagueOf(r.score)}}
  res.push(row);console.error(key,cfg.mods.join('+'),arches.map(a=>(row.res[a].won?'W':'L')+row.res[a].wave+':'+row.res[a].score).join(' '))}
require('fs').writeFileSync(out(`weekly_${mod}.json`),JSON.stringify(res));
