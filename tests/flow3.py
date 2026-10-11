# Browser checks for the priority-1 package: boss second lap, cloak near towers, season economy and migration, data-core shop.
import asyncio,os,sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
ARGS=[a for a in sys.argv[1:] if not a.startswith('--')]
W=next((int(a) for a in ARGS if a.isdigit()),390)
SRC=next((a for a in ARGS if not a.isdigit()),None)
MOCK='--mock' in sys.argv
URL=wrap(SRC,'wrap3.html')
ok=[];bad=[]
def check(name,cond,extra=''):
  (ok if cond else bad).append(name);print(('OK  ' if cond else 'BAD ')+name+(('  '+str(extra)) if extra!='' else ''))
LEAK="""(()=>{const G=window.__td,S=G.S,b=S.enemies.find(e=>e.t===S.mis.boss);b.hp=b.max*.4;b.i=b.path.length-1;b.x=b.path[b.i].x;b.y=b.path[b.i].y;G.update(.016);
  return{lives:S.lives,laps:S.bossLaps||0,over:S.over,won:S.won,leak:!!S.bossLeak,alive:S.enemies.includes(b)&&!b.dead,i:b.i,guardW:S.guardW,lost:S.lost,hp:Math.round(b.hp/b.max*100)}})()"""
def boss_setup(mi,nm=False,lives=None,perk=None):
  return """(()=>{const G=window.__td;G.newGame(%d,'campaign',%s);document.querySelector('#lobby').hidden=true;const S=G.S;S.tut=null;S.started=true;S.wave=S.mis.waves;
  %s%s const b=G.spawn(S.mis.boss);return{lives:S.lives,boss:S.mis.boss,nm:S.nm}})()""" % (mi,'{nm:true}' if nm else 'null',
  ('S.lives=%d;'%lives) if lives is not None else '',("S.perks.push('%s');"%perk) if perk else '')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();errs=[]
    pg=await b.new_page(viewport={'width':W,'height':800},device_scale_factor=2)
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_timeout(1500)
    J=pg.evaluate
    await J("(()=>{const P=window.__td.PROG;P.tut=1})()")
    # ---------- 1. boss: first breakthrough costs 10 core and a second lap ----------
    for mi in (4,9,14):
      s0=await J(boss_setup(mi))
      r=await J(LEAK)
      check(f'm{mi+1} {s0["boss"]}: first leak costs 10 core',r['lives']==s0['lives']-10,r)
      check(f'm{mi+1}: boss goes round again, run continues',r['laps']==1 and r['alive'] and r['i']==0 and not r['over'],r)
      check(f'm{mi+1}: boss recovers 30% health on the lap (40% -> 70%)',r['hp']==70,r)
      if mi==4:
        txt=''
        for k in range(24):
          await pg.wait_for_timeout(500);txt=await J("document.querySelector('#commsT')?document.querySelector('#commsT').textContent:''")
          if 'второй круг' in txt: break
        await pg.screenshot(path=f'{SHOTS}/c-bosslap-{W}.png')
        check('VEGA explains the second lap',('второй круг' in txt),txt[:120])
      r2=await J(LEAK)
      check(f'm{mi+1}: second leak fails the mission',r2['over'] and r2['won']==False and r2['leak'],r2)
    s0=await J(boss_setup(4,nm=True));r=await J(LEAK)
    check('nightmare: first leak fails at once',s0['nm'] and r['over'] and r['won']==False and r['laps']==0,r)
    s0=await J(boss_setup(4,lives=10));r=await J(LEAK)
    check('10 core or less: first leak fails',r['over'] and r['won']==False,r)
    s0=await J(boss_setup(4,lives=11));r=await J(LEAK)
    check('11 core: lap leaves 1',r['lives']==1 and not r['over'],r)
    s0=await J(boss_setup(4,perk='guard'));r=await J(LEAK)
    check('emergency shield perk does not swallow the mission boss',r['laps']==1 and r['lives']==s0['lives']-10 and r['guardW']==-1,r)
    r=await J("""(()=>{const G=window.__td;G.newGame(1,'endless');document.querySelector('#lobby').hidden=true;const S=G.S;S.tut=null;S.started=true;S.wave=10;
      const e=G.spawn('boss');e.i=e.path.length-1;e.x=e.path[e.i].x;e.y=e.path[e.i].y;const l0=S.lives;G.update(.016);return{d:l0-S.lives,over:S.over,alive:S.enemies.includes(e)}})()""")
    check('endless boss leak still costs 5 and no lap',r['d']==5 and not r['alive'],r)
    await J("window.__td.openLobby('home')");await pg.wait_for_timeout(200);await J("window.__td.go('camp',true)");await J("window.__td.act('mis','4')");await pg.wait_for_timeout(300)
    g=await J("document.querySelector('.goal')?document.querySelector('.goal').textContent:''")
    check('mission brief explains the lap and the 30% heal',('восстановит 30% здоровья' in g) and ('второй круг' in g),g)
    await J("(()=>{const G=window.__td;G.PROG.ms[G.MISSIONS[4].id]=G.PROG.ms[G.MISSIONS[4].id]||1;G.act('nm','1')})()");await pg.wait_for_timeout(200)
    g=await J("document.querySelector('.goal')?document.querySelector('.goal').textContent:''")
    check('nightmare brief keeps instant fail',('миссия провалена' in g) and ('второй круг' not in g),g)
    # ---------- 2. cloak: any tower sees invisible enemies within 1.5 tiles ----------
    r=await J("""(()=>{const G=window.__td;G.newGame(1,'endless');document.querySelector('#lobby').hidden=true;const S=G.S;S.tut=null;S.started=true;S.gold=5000;S.wave=8;S.curMods=['cloak'];S.queue=[];
      let tw=null;for(let r=0;r<15&&!tw;r++)for(let c=0;c<12&&!tw;c++)if(G.canBuild(c,r)&&G.build('laser',c,r))tw=S.towers[S.towers.length-1];
      const e=G.spawn('drone');const res={};
      e.x=tw.x+1.2;e.y=tw.y;G.update(.0001);res.near=e.vis;
      e.x=tw.x+1.6;e.y=tw.y;G.update(.0001);res.far=e.vis;
      const t2=S.towers.length;let cr=null;for(let r=0;r<15&&!cr;r++)for(let c=0;c<12&&!cr;c++)if(G.canBuild(c,r)&&Math.hypot(c+.5-tw.x,r+.5-tw.y)>4&&G.build('cryo',c,r))cr=S.towers[S.towers.length-1];
      const R=G.stats(cr).range;e.x=cr.x+R-.1;e.y=cr.y;G.update(.0001);res.cryo=e.vis;res.cloak=e.cloak;return res})()""")
    check('cloaked enemy 1.2 tiles from a laser is visible',r['cloak'] and r['near'],r)
    check('cloaked enemy 1.6 tiles from a laser stays hidden',r['far']==False,r)
    check('cryo still sees in its whole range',r['cryo'],r)
    # ---------- 3. season economy ----------
    r=await J("""(()=>{const G=window.__td,P=G.PROG,num=G.seasonInfo().num;P.season={id:num,xp:1300,got:5};const s=G.seasonState();
      const out={xp:s.xp,e2:s.e2,tier:G.seasonTier()};const b0=P.bonus||0;G.addXP(600);out.tier2=G.seasonTier();out.dBonus=(P.bonus||0)-b0;out.got=P.season.got;
      G.seasonState();out.xpAgain=P.season.xp;return out})()""")
    check('old season XP migrates and keeps tier 5',r['xp']==1900 and r['e2']==1 and r['tier']==5,r)
    check('crossing tier 6 grants one core once',r['tier2']==6 and r['dBonus']==1 and r['got']==6 and r['xpAgain']==2500,r)
    r=await J("""(()=>{const G=window.__td,P=G.PROG,num=G.seasonInfo().num;P.season={id:num,xp:1750,got:8,e2:1};const b0=P.bonus||0,o0=JSON.stringify(P.own);
      G.addXP(2000);const a=(P.bonus||0)-b0,same=JSON.stringify(P.own)===o0;G.addXP(1100);return{t:G.seasonTier(),a,same,b:(P.bonus||0)-b0,got:P.season.got}})()""")
    check('tiers already granted are not granted again',r['a']==0 and r['same'],r)
    check('next new tier is granted',r['t']==9 and r['b']==1 and r['got']==9,r)
    r=await J("""(()=>{const G=window.__td,P=G.PROG,num=G.seasonInfo().num;P.season={id:num,xp:0,got:0,e2:1};G.newGame(0,'campaign');document.querySelector('#lobby').hidden=true;const S=G.S;S.tut=null;
      G.startWave();S.queue=[];S.enemies=[];G.update(.016);return{xp:P.season.xp,w:S.wave,act:S.waveActive}})()""")
    check('a cleared wave gives 4 XP',r['xp']==4 and not r['act'],r)
    r=await J("""(()=>{const G=window.__td,P=G.PROG,num=G.seasonInfo().num;P.season={id:num,xp:0,got:0,e2:1};P.daily=null;G.newGame(0,'daily');document.querySelector('#lobby').hidden=true;const S=G.S;S.tut=null;
      S.wave=20;G.endGame(true);return{xp:P.season.xp}})()""")
    check('first daily win gives 150 XP',r['xp']==150,r)
    await pg.wait_for_timeout(1600)
    await J("window.__td.openLobby('home')");await pg.wait_for_timeout(300)
    await J("(()=>{const G=window.__td,P=G.PROG,num=G.seasonInfo().num;P.season={id:num,xp:1900,got:5,e2:1}})()")
    await J("window.__td.act('season')");await pg.wait_for_timeout(300)
    t=await J("document.querySelector('.scard .tierl').innerText")
    check('season card shows 150 of 750 into tier 6',('150 из 750' in t) and ('5' in t),t)
    await pg.screenshot(path=f'{SHOTS}/c-season-{W}.png')
    await J("(()=>{const P=window.__td.PROG;P.season.xp=700})()");await J("window.__td.act('season')");await pg.wait_for_timeout(200)
    t=await J("document.querySelector('.scard .tierl').innerText")
    check('early tiers cost 350',('0 из 350' in t) and ('2' in t),t)
    await J("window.__td.go('home',true)");await pg.wait_for_timeout(200)
    t=await J("document.querySelector('.sstrip')?getComputedStyle(document.querySelector('.sstrip')).display:'none'")
    check('home season strip renders',t!='none',t)
    # ---------- 4. shop ----------
    await J("(()=>{const G=window.__td,P=G.PROG;P.lab={};P.buy={};for(const k of ['frost','plasma','fx:ice'])delete P.own[k];P.bonus=(P.bonus||0)+150;P.shopSeen=0;P.refund={}})()")
    free0=await J("window.__td.ptsFree()")
    await J("window.__td.go('lab')");await pg.wait_for_timeout(250)
    check('lab tabs: research, arsenal, shop',await J("[...document.querySelectorAll('.segs button')].map(b=>b.textContent).join('|')")=='Улучшения|Арсенал|Магазин')
    check('research shows all three branches',await J("document.querySelectorAll('.nodes').length===3&&document.querySelectorAll('.nodes li').length===13"))
    await pg.screenshot(path=f'{SHOTS}/c-lab-{W}.png')
    await J("document.querySelector('#lbView').scrollTop=9999");await pg.wait_for_timeout(150);await pg.screenshot(path=f'{SHOTS}/c-lab2-{W}.png')
    await pg.click('[data-act="labtab:2"]');await pg.wait_for_timeout(300)
    check('shop lists 11 skins and 6 effects',await J("document.querySelectorAll('.nodes.shop li').length===17"))
    check('current season rewards are not for sale',await J("(()=>{const d=window.__td.seasonInfo().def;return[...d.skins,...d.fx].every(id=>!document.querySelector(`[data-act=\"buy:${id}\"]`))})()"))
    check('skin previews drawn',await J("[...document.querySelectorAll('.shop canvas')].every(c=>{const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<x.length;i+=4)if(x[i])return true;return false})"))
    await pg.screenshot(path=f'{SHOTS}/c-shop-{W}.png')
    await J("document.querySelector('#lbView').scrollTop=9999");await pg.wait_for_timeout(150);await pg.screenshot(path=f'{SHOTS}/c-shop2-{W}.png')
    await pg.click('[data-act="buy:frost"]');await pg.wait_for_timeout(250)
    r=await J("(()=>{const G=window.__td,P=G.PROG;return{own:P.own.frost,buy:P.buy.frost,free:G.ptsFree(),row:!!document.querySelector('[data-act=\"buy:frost\"]')}})()")
    check('buying a skin spends 30 cores and owns it',r['own']==1 and r['buy']==30 and r['free']==free0-30 and not r['row'],r)
    await pg.click('[data-act="buy:plasma"]');await pg.wait_for_timeout(250)
    await pg.click('[data-act="buy:ice"]');await pg.wait_for_timeout(250)
    r=await J("(()=>{const G=window.__td,P=G.PROG;return{plasma:P.own.plasma,ice:P.own['fx:ice'],free:G.ptsFree(),spent:G.shopSpent()}})()")
    check('exclusive skin (60) and effect (15) bought',r['plasma']==1 and r['ice']==1 and r['spent']==105 and r['free']==free0-105,r)
    r=await J("(()=>{const G=window.__td;return[...document.querySelectorAll('.nodes.shop .buy')].filter(b=>!b.disabled).every(b=>+b.querySelector('em').textContent.replace(/\\D/g,'')<=G.ptsFree())})()")
    check('unaffordable items are disabled',r)
    r=await J("(()=>{const G=window.__td,P=G.PROG,f=G.ptsFree();P.bonus-=f;const ok=!G.shopBuy('toxic');P.bonus+=f;return ok})()")
    check('cannot buy without cores',r)
    await pg.click('[data-act="labtab:1"]');await pg.wait_for_timeout(250)
    check('bought skin appears in arsenal and can be worn',await J("(()=>{const b=document.querySelector('[data-act=\"skin:laser:frost\"]');return!!b&&!b.disabled})()"))
    await pg.click('[data-act="skin:laser:frost"]');await pg.wait_for_timeout(150)
    check('skin equipped',await J("window.__td.PROG.skin.laser==='frost'"))
    await pg.click('[data-act="labtab:0"]');await pg.wait_for_timeout(200)
    r=await J("(()=>{const G=window.__td,P=G.PROG;const n=G.LAB[0];P.lab[n.id]=1;const f=G.ptsFree();return f})()")
    await pg.click('[data-act="labreset"]');await pg.wait_for_timeout(150);await pg.click('[data-act="labreset"]');await pg.wait_for_timeout(200)
    r2=await J("(()=>{const G=window.__td,P=G.PROG;return{lab:Object.keys(P.lab).length,buy:G.shopSpent(),own:P.own.frost,free:G.ptsFree()}})()")
    check('lab reset keeps shop purchases',r2['lab']==0 and r2['buy']==105 and r2['own']==1,r2)
    r=await J("""(()=>{const G=window.__td,P=G.PROG,def={name:'x',skins:['frost','aurora','void'],fx:['ice','confetti','glitch'],titles:['a','b','c']};
      P.ach.season10=P.ach.season10||1;const f0=G.ptsFree(),b0=P.bonus;G.grantTier(def,10);const r1={refund:P.refund.frost,dFree:G.ptsFree()-f0,dBonus:P.bonus-b0};
      G.grantTier(def,10);r1.again=P.refund.frost;r1.dBonus2=P.bonus-b0;G.grantTier(def,5);r1.fx=P.refund['fx:ice'];r1.dFree2=G.ptsFree()-f0;return r1})()""")
    check('season duplicate of a bought skin refunds its price',r['refund']==30 and r['dFree']==30 and r['dBonus']==0,r)
    check('refund happens once, later duplicates give the usual 2 cores',r['again']==30 and r['dBonus2']==2,r)
    check('bought effect refunded too',r['fx']==15 and r['dFree2']==30+2+15,r)
    # profile: bought effect selectable
    await J("window.__td.go('profile')");await pg.wait_for_timeout(250)
    check('bought effect selectable in profile',await J("(()=>{const b=document.querySelector('[data-act=\"kfx:ice\"]');return!!b&&!b.disabled})()"))
    # badge: lab done + new cores -> dot; visiting the shop clears it
    await J("(()=>{const G=window.__td,P=G.PROG;for(const n of G.LAB)P.lab[n.id]=n.max;P.bonus+=80;P.shopSeen=0;G.go('home',true)})()");await pg.wait_for_timeout(200)
    check('lab dot when research is done and cores can buy something',await J("!!document.querySelector('[data-go=\"lab\"] .dot')"))
    await J("window.__td.go('lab')");await pg.click('[data-act="labtab:2"]');await pg.wait_for_timeout(200);await J("window.__td.go('home',true)");await pg.wait_for_timeout(200)
    check('dot clears after visiting the shop',await J("!document.querySelector('[data-go=\"lab\"] .dot')"))
    # ---------- 5. cloud merge ----------
    r=await J("""(()=>{const G=window.__td,num=G.seasonInfo().num;
      const L={ms:{},stars:{},ach:{},lab:{},own:{frost:1},buy:{frost:30},refund:{frost:30},season:{id:num,xp:1900,got:5,e2:1},ts:2};
      const C={ms:{},stars:{},ach:{},lab:{},own:{plasma:1},buy:{plasma:60},season:{id:num,xp:1300,got:5},ts:1};
      const m=G.mergeProg(L,C);
      const L2={ms:{},season:{id:num,xp:2600,got:10},ts:2},C2={ms:{},season:{id:num,xp:4000,got:6,e2:1},ts:1};const m2=G.mergeProg(L2,C2);
      return{buy:m.buy,refund:m.refund,own:m.own,s:m.season,s2:m2.season}})()""")
    check('merge unions purchases and refunds',r['buy']=={'frost':30,'plasma':60} and r['refund']=={'frost':30} and r['own'].get('plasma')==1 and r['own'].get('frost')==1,r)
    check('merge normalises old season XP before comparing',r['s']['xp']==1900 and r['s']['e2']==1 and r['s2']['xp']==5800 and r['s2']['got']==10,r)
    sw=await J("document.documentElement.scrollWidth");check('no horizontal scroll',sw<=W,sw)
    print('ERRORS',errs[:10])
    await b.close()
  print(f'{len(ok)} ok, {len(bad)} bad',bad)
asyncio.run(main())
