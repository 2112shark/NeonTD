// Quick gate before any test run or publish: the game script compiles, and a headless bot can win mission 1.
// Usage: node tools/check.js [path/to/game.html]
const fs=require('fs'),path=require('path'),vm=require('vm');
const file=process.argv[2]||path.join(__dirname,'..','game','neon-td.html');
const html=fs.readFileSync(file,'utf8'),m=html.match(/<script>([\s\S]*?)<\/script>/);
if(!m){console.error('FAIL: no <script> block in',file);process.exit(1)}
try{new vm.Script(m[1],{filename:'neon-td.js'})}catch(e){console.error('FAIL: syntax error:',e.message);process.exit(1)}
const ver=(html.match(/<p class="ver">([^<]*)<\/p>/)||[])[1]||'?';
console.log(`syntax ok, ${Math.round(m[1].length/1024)} KB of script, label: ${ver}`);
// index.html (GitHub Pages) is generated from game/neon-td.html and must contain it unchanged
const index=path.join(__dirname,'..','index.html');
if(!process.argv[2]&&fs.existsSync(index)&&!fs.readFileSync(index,'utf8').includes(html)){
  console.error('FAIL: index.html is out of date, run: python3 tools/build_standalone.py');process.exit(3)}
const {load,run}=require('./sim/sim.js');const G=load(file);
const r=run(G,{mission:0},{arch:'expert',seed:1,lab:{}});
console.log(`smoke: mission 1, expert bot ${r.won?'won':'lost'} at wave ${r.wave}, core ${r.lives}/${r.maxLives}`);
if(!r.won){console.error('FAIL: expert bot lost mission 1');process.exit(2)}
