import asyncio,os,sys,json
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
ARGS=[a for a in sys.argv[1:] if not a.startswith('--')]
SRC=next((a for a in ARGS if not a.isdigit()),None)
MOCK='--mock' in sys.argv
URL=wrap(SRC,'wrap2.html')
MOCKJS=r"""
(()=>{const store=new Map(),subs=[];window.__mockStore=store;
 const wk=(()=>{const d=new Date(),t=new Date(d.getFullYear(),d.getMonth(),d.getDate());t.setDate(t.getDate()-(t.getDay()+6)%7+3);const y=t.getFullYear(),j=new Date(y,0,4),mon1=new Date(y,0,4-(j.getDay()+6)%7);return`${y}-W${String(Math.floor(Math.round((t-mon1)/864e5)/7)+1).padStart(2,'0')}`})();
 store.set('scores/u_a1',{wk,score:21000,won:true,wave:25,title:'Повелитель тока'});store.set('scores/u_b2',{wk,score:13200,won:true,wave:25,title:''});store.set('scores/u_c3',{wk:'2020-W01',score:99999});
 store.set('data/users/u_me/save',{v:3,ts:1,data:JSON.stringify({ms:{m1:7,m2:3},ach:{first:1},waves:40,kills:300,st:{kl:{laser:180}},own:{volt:1,'t:Разрядник':1}})});
 function run(col,f,o,l){let docs=[...store.entries()].filter(([p])=>p.startsWith(col+'/')&&p.split('/').length===col.split('/').length+1).map(([p,d])=>({id:p.split('/').pop(),exists:true,data:()=>d,metadata:{}}));
   for(const [k,op,v] of f)docs=docs.filter(x=>op==='=='?x.data()[k]===v:true);
   if(o)docs.sort((a,b)=>(o[1]==='desc'?-1:1)*((a.data()[o[0]]||0)-(b.data()[o[0]]||0)));
   docs=docs.slice(0,l);return{docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{}}}
 function q(col,f=[],o=null,l=1000){return{where:(k,op,v)=>q(col,[...f,[k,op,v]],o,l),orderBy:(k,d)=>q(col,f,[k,d||'asc'],l),limit:n=>q(col,f,o,n),
   get:async()=>run(col,f,o,l),onSnapshot(next){const s=()=>next(run(col,f,o,l));subs.push(s);setTimeout(s,30);return()=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)}}}}
 const doc=p=>({id:p.split('/').pop(),path:p,get:async()=>{const d=store.get(p);return{id:p.split('/').pop(),exists:!!d,data:()=>d,metadata:{}}},
   set:async d=>{store.set(p,JSON.parse(JSON.stringify(d)));subs.forEach(s=>s())},update:async d=>{store.set(p,Object.assign({},store.get(p),d));subs.forEach(s=>s())},delete:async()=>{store.delete(p)}});
 const DB=Object.freeze({doc,collection:p=>Object.assign(q(p),{path:p,doc:id=>doc(p+'/'+id)})});
 const USER=Object.freeze({me:async()=>({id:'u_me',name:'Тест Командир',email:null,isOwner:true,canEdit:true}),id:async()=>'u_me',
   profiles:async ids=>Object.fromEntries([].concat(ids).map(i=>[i,{id:i,name:i==='u_me'?'Тест Командир':i==='u_a1'?'Аня':'Борис',avatarUrl:'',color:'#fff',email:null,isMe:i==='u_me',guest:false}]))});
 window.claude={use:async n=>n==='db'?DB:n==='user'?USER:null};
})();
"""
ok=[];bad=[]
def check(name,cond):
  (ok if cond else bad).append(name);print(('OK  ' if cond else 'BAD ')+name)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();errs=[]
    pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
    if MOCK: await pg.add_init_script(MOCKJS)
    await pg.goto(URL);await pg.wait_for_timeout(1800)
    J=pg.evaluate
    if MOCK:
      check('cloud save merged on load',await J("window.__td.PROG.ms.m1===7&&window.__td.PROG.ms.m2===3&&window.__td.PROG.own.volt===1"))
      check('player name from user capability',await J("window.__td.NET.name==='Тест Командир'"))
    await J("(()=>{const P=window.__td.PROG;P.tut=1;P.ms.m1=P.ms.m1||7;P.st.kl=Object.assign(P.st.kl||{},{laser:420,cannon:60,tesla:900});P.st.dmg={laser:52000,cannon:31000,cryo:9000,tesla:44000,sniper:12000,gravi:3000};P.st.spec={laserA:4,teslaA:2};P.st.boss={boss:2};P.ach.boss=1;P.ach.win=2;P.kills=1400;P.waves=120})()")
    await J("window.__td.go('home',true)");await pg.wait_for_timeout(300)
    check('season strip on home',await J("!!document.querySelector('.sstrip')"))
    check('weekly card on home',await J("!!document.querySelector('.wcard')"))
    await pg.screenshot(path=SHOTS+'/b-home.png',full_page=False)
    await J("document.querySelector('#lbView').scrollTop=9999");await pg.wait_for_timeout(150);await pg.screenshot(path=SHOTS+'/b-home2.png')
    # profile
    await pg.click('.rank');await pg.wait_for_timeout(300)
    check('profile screen',await J("document.querySelector('.lb-head h2').textContent==='Профиль'"))
    await pg.screenshot(path=SHOTS+'/b-profile.png')
    await J("document.querySelector('#lbView').scrollTop=9999");await pg.wait_for_timeout(150);await pg.screenshot(path=SHOTS+'/b-profile2.png')
    if MOCK:
      await pg.click('[data-act="title:Разрядник"]');await pg.wait_for_timeout(150)
      check('equip title',await J("window.__td.PROG.title==='Разрядник'"))
    # arsenal
    await J("window.__td.go('lab')");await pg.click('[data-act="labtab:1"]');await pg.wait_for_timeout(300)
    check('arsenal rows',await J("document.querySelectorAll('.ars li').length===7"))
    await pg.click('[data-act="skin:laser:chrome"]');await pg.wait_for_timeout(150)
    check('equip mastery skin',await J("window.__td.PROG.skin.laser==='chrome'"))
    check('locked skin disabled',await J("document.querySelector('[data-act=\"skin:cannon:chrome\"]').disabled"))
    await pg.screenshot(path=SHOTS+'/b-arsenal.png')
    # season
    await J("window.__td.addXP(1800)")
    await J("window.__td.act('season')");await pg.wait_for_timeout(300)
    check('season track 30 rows',await J("document.querySelectorAll('.track li').length===30"))
    check('tier 5 reached and effect owned',await J("window.__td.seasonTier()>=5&&!!window.__td.PROG.own['fx:'+window.__td.seasonInfo().def.fx[0]]"))
    await pg.screenshot(path=SHOTS+'/b-season.png')
    # weekly
    await J("window.__td.go('home',true)");await pg.click('.wcard');await pg.wait_for_timeout(600)
    check('weekly screen',await J("document.querySelector('.lb-head h2').textContent==='Вызов недели'&&document.querySelectorAll('.leagues li').length===5"))
    if MOCK:
      await pg.wait_for_timeout(400)
      check('board rows from shared table',await J("document.querySelectorAll('.board li').length===2"))
      check('board names resolved',await J("document.querySelector('.board li .nm b').textContent==='Аня'"))
    await pg.screenshot(path=SHOTS+'/b-weekly.png')
    await J("document.querySelector('#lbView').scrollTop=9999");await pg.wait_for_timeout(150);await pg.screenshot(path=SHOTS+'/b-weekly2.png')
    await pg.click('[data-act="weekly-start"]');await pg.wait_for_timeout(300)
    check('weekly launched',await J("window.__td.S.mode==='weekly'&&window.__td.S.daily.waves===40"))
    await J("(()=>{const G=window.__td,S=G.S;S.kills=900;S.wave=40;S.waveActive=false;G.endGame(true)})()");await pg.wait_for_timeout(1500)
    check('weekly results',(await pg.inner_text('#res h2'))=='Вызов недели пройден')
    await pg.screenshot(path=SHOTS+'/b-wres.png')
    if MOCK:
      await pg.wait_for_timeout(300)
      check('score submitted',await J("(()=>{const d=window.__mockStore.get('scores/u_me');return !!d&&d.score>13000})()"))
      await J("window.__td.openLobby('home')");await pg.click('.wcard');await pg.wait_for_timeout(500)
      check('own row highlighted',await J("!!document.querySelector('.board li.me')"))
      await pg.screenshot(path=SHOTS+'/b-weekly3.png')
      await pg.wait_for_timeout(4500)
      check('cloud save written',await J("(()=>{const d=window.__mockStore.get('data/users/u_me/save');return !!d&&JSON.parse(d.data).weekly!=null})()"))
    # in-game: new towers, debris, nodes
    await J("window.__td.openLobby('home')");await J("(()=>{const P=window.__td.PROG;for(const m of window.__td.MISSIONS)P.ms[m.id]=P.ms[m.id]||1})()")
    await J("window.__td.act('mis','12')");await pg.wait_for_timeout(300);await pg.click('[data-act="mstart"]');await pg.wait_for_timeout(400)
    check('ring has 7 towers in mission 13',await J("(()=>{const G=window.__td,S=G.S;const n=S.map.nodes[0];G.openRadial(n[0],n[1]);const k=document.querySelectorAll('#radial .ri.tw').length;return k})()")==7)
    await pg.screenshot(path=SHOTS+'/b-ring7.png')
    await J("document.querySelector('#radial [data-id=x]').click()")
    await J("""(()=>{const G=window.__td,S=G.S;S.gold=5000;const n=S.map.nodes;G.build('gravi',n[0][0],n[0][1]);G.build('laser',n[1][0],n[1][1]);G.build('cannon',n[2][0],n[2][1]);G.build('tesla',n[3][0],n[3][1]);
      for(const t of S.towers.slice()){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(G.canBuild(t.c+dx,t.r+dy)&&!S.towers.some(u=>u.type==='gen'&&Math.abs(u.c-t.c)<=1&&Math.abs(u.r-t.r)<=1)){G.build('gen',t.c+dx,t.r+dy)}}}
      for(const t of S.towers){G.upgrade(t);G.upgrade(t);G.upgrade(t,'A')}})()""")
    d=await J("(()=>{const S=window.__td.S;const d=S.map.debris.find(([c,r])=>window.__td.isDebris(c,r));if(!d)return null;const r=document.querySelector('#cv').getBoundingClientRect(),t=r.width/12;return[r.left+(d[0]+.5)*t,r.top+(d[1]+.5)*t,d[0],d[1]]})()")
    if d:
      await pg.mouse.click(d[0],d[1]);await pg.wait_for_timeout(200)
      check('debris opens clear ring',await J("!!document.querySelector('#radial [data-id=clear]')"))
      await pg.screenshot(path=SHOTS+'/b-debris.png')
      await pg.click('#radial [data-id=clear]',force=True);await pg.click('#radial [data-id=clear]',force=True);await pg.wait_for_timeout(200)
      check('debris cleared',await J(f"window.__td.canBuild({d[2]},{d[3]})"))
    await pg.click('#bNext');await J("(()=>{const G=window.__td;for(let i=0;i<30*14;i++)G.update(1/30)})()");await pg.wait_for_timeout(500)
    await J("(()=>{const G=window.__td,S=G.S,g=S.towers.find(t=>t.type==='gravi');g.cd=0;const e=G.spawn('wasp');e.x=g.x+.6;e.y=g.y+.6;e.i=1;for(let i=0;i<30;i++)G.update(1/30)})()")
    check('gravitron well grounds a flyer',await J("window.__td.S.wells.length>0&&window.__td.S.enemies.some(e=>e.air&&e.gnd>0)"))
    await pg.screenshot(path=SHOTS+'/b-well.png')
    await pg.screenshot(path=SHOTS+'/b-battle.png')
    await J("(()=>{const G=window.__td,S=G.S;S.wave=18;S.waveActive=false;S.queue=[];S.enemies=[];G.endGame(true)})()");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=SHOTS+'/b-res.png')
    check('results show season xp',await J("!!document.querySelector('#res .rew .xp')"))
    sw=await J("document.documentElement.scrollWidth");check('no horizontal scroll',sw<=390)
    print('ERRORS',[e for e in errs if 'ERR_TUNNEL' not in e][:10])
    await b.close()
  print(f'{len(ok)} ok, {len(bad)} bad',bad)
asyncio.run(main())
