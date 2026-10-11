// Daily (next 28 days) and weekly (next 26 weeks) challenges for each archetype: win rate, score, league.
const {load,run}=require('./sim.js');const G=load();
const kind=process.argv[2]||'daily',arches=['beginner','novice','average','expert'],out=[];
const pad=n=>String(n).padStart(2,'0');
if(kind==='daily'){const d0=new Date(2026,9,11);for(let k=0;k<28;k++){const d=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+k),key=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,cfg=G.dailyCfg(key);
  const row={key,mi:cfg.mi,mods:cfg.mods,ban:cfg.ban,res:{}};for(const a of arches){const r=run(G,{map:cfg.mi,mode:'daily',cfg},{arch:a,lab:{},seed:k+1});row.res[a]={won:r.won,score:r.score,wave:r.wave}}
  out.push(row);console.error(key,G.MAPS[cfg.mi].name.padEnd(9),cfg.mods.join('+').padEnd(13),(cfg.ban||'-').padEnd(7),arches.map(a=>(row.res[a].won?'W':'L')+row.res[a].wave+':'+row.res[a].score).join(' '))}}
else{for(let w=41;w<=66;w++){const yr=w>53?2027:2026,wn=w>53?w-53:w,key=`${yr}-W${pad(wn)}`,cfg=G.weeklyCfg(key);
  const row={key,mi:cfg.mi,mods:cfg.mods,res:{}};for(const a of arches){const r=run(G,{map:cfg.mi,mode:'weekly',cfg},{arch:a,lab:{},seed:w});row.res[a]={won:r.won,score:r.score,wave:r.wave,league:G.leagueOf(r.score)}}
  out.push(row);console.error(key,G.MAPS[cfg.mi].name.padEnd(9),cfg.mods.join('+').padEnd(13),arches.map(a=>(row.res[a].won?'W':'L')+row.res[a].wave+':'+row.res[a].score+'/'+G.LEAGUES[row.res[a].league][0]).join(' '))}}
require('fs').writeFileSync(require('./sim.js').out(`chal_${kind}.json`),JSON.stringify(out));
