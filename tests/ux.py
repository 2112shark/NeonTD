import asyncio,os,sys,json,datetime
from playwright.async_api import async_playwright
SRC=sys.argv[1] if len(sys.argv)>1 and sys.argv[1]!='-' else None
ONLY=sys.argv[2].split(',') if len(sys.argv)>2 else None
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
URL=wrap(SRC,'wrap_ux.html')
VPS=[(360,640,'s360'),(390,844,'i390'),(412,915,'a412'),(768,1024,'t768'),(1280,800,'d1280')]
if ONLY: VPS=[v for v in VPS if v[2] in ONLY]
today=datetime.date.today()
def wk():
  t=today;th=t+datetime.timedelta(days=3-t.weekday());y=th.isocalendar()[0];return f"{y}-W{th.isocalendar()[1]:02d}"
MID={"v":3,"tut":1,"ms":{"m1":7,"m2":7,"m3":3,"m4":3,"m5":7,"m6":3,"m7":1,"m8":3},"stars":{"m1":3,"m2":3,"m3":2,"m4":2,"m5":3,"m6":2,"m7":1,"m8":2},
 "ach":{k:1 for k in ["first","w10","win","ch1","boss","spec","syn3","nosell","flawless","kills","node","interest"]},"lab":{"dmg":2,"cap":1,"hp":1,"rng":1},
 "waves":140,"kills":3400,"specs":["laserA","cannonB"],"mods":["fast","armor"],"best":{"0":23},"dailyWins":2,"bonus":6,
 "st":{"kl":{"laser":900,"cannon":1100,"cryo":300,"tesla":250,"sniper":120},"dmg":{"laser":90000,"cannon":120000,"cryo":15000,"tesla":30000,"sniper":20000},"spec":{"laserA":3,"cannonB":2},"mis":9,"perks":14,"quests":5,"boss":{"boss":1}},
 "own":{"volt":1,"fx:spark":1,"t:Разрядник":1},"title":"Разрядник","kfx":"spark","show":["boss","win","first"],
 "season":{"id":1,"xp":2600,"got":10},"weekly":{"key":wk(),"best":12400,"plays":2},"set":{"sound":False,"vib":True},"seenAch":12,"ts":1}
AUDIT=r"""
(()=>{
 const vw=innerWidth,vh=innerHeight,out={vw,vh,overX:document.documentElement.scrollWidth>vw+1,scrollW:document.documentElement.scrollWidth,small:[],tiny:[],trunc:[],lowc:[],off:[]};
 const shown=el=>{if(!el.getClientRects().length)return false;for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||e.hidden)return false}return true};
 const name=el=>((el.getAttribute('aria-label')||el.innerText||el.className||el.tagName)+'').replace(/\s+/g,' ').trim().slice(0,38);
 const inScroller=el=>{for(let e=el.parentElement;e;e=e.parentElement){const cs=getComputedStyle(e);if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&e.scrollWidth>e.clientWidth+2)return true}return false};
 const layers=['#end','#sheet','#perkOv','#lobby'].map(q=>document.querySelector(q)).filter(e=>e&&!e.hidden&&e.getClientRects().length);
 const root=layers[0]||document.body,skip=layers.length?null:document.querySelector('#lobby');out.layer=layers[0]?('#'+layers[0].id):'game';
 const inRoot=el=>root.contains(el)&&!(skip&&skip.contains(el));
 const cta=root.querySelector('.cta');if(cta){const r=cta.getBoundingClientRect();out.ctaVisible=r.top>=0&&r.bottom<=vh;out.ctaTop=Math.round(r.top)}
 const sc=[root,...root.querySelectorAll('*')].find(e=>{const cs=getComputedStyle(e);return(cs.overflowY==='auto'||cs.overflowY==='scroll')&&e.scrollHeight>e.clientHeight+2});out.scrollable=!!sc;
 root.querySelectorAll('button,[data-act],a,[role=tab],[role=switch]').forEach(el=>{if(!inRoot(el))return;if(!shown(el)||el.disabled)return;const r=el.getBoundingClientRect();
   if(r.width<44||r.height<44)out.small.push([name(el),Math.round(r.width),Math.round(r.height)]);
   if((r.right>vw+1||r.left<-1)&&!inScroller(el))out.off.push([name(el),Math.round(r.left),Math.round(r.right)])});
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return{r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const bgOf=el=>{for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e),c=parse(cs.backgroundColor);if(c&&c.a>.85)return c;if(cs.backgroundImage&&cs.backgroundImage!=='none'&&e.id!=='lbBg')return{r:12,g:18,b:36,a:1}}return{r:7,g:11,b:26,a:1}};
 const seen=new Set();
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){const t=n.textContent.trim();if(!t)continue;const el=n.parentElement;if(!el||seen.has(el)||!inRoot(el)||!shown(el))continue;seen.add(el);
   const cs=getComputedStyle(el),fs=parseFloat(cs.fontSize),r=el.getBoundingClientRect();if(r.width<1)continue;
   if(fs<11)out.tiny.push([t.slice(0,30),fs]);
   if(cs.textOverflow==='ellipsis'&&el.scrollWidth>el.clientWidth+1)out.trunc.push([t.slice(0,40),el.clientWidth,el.scrollWidth]);
   const fg=parse(cs.color);if(fg){const bg=bgOf(el);const a=fg.a,mix={r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a)};const L1=lum(mix),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
     const big=fs>=18||(fs>=14&&+cs.fontWeight>=700);if(cr<(big?3:4.5))out.lowc.push([t.slice(0,30),+cr.toFixed(2),fs])}}
 const cv=document.querySelector('#cv');if(cv&&cv.getClientRects().length){const r=cv.getBoundingClientRect();out.tile=+(r.width/12).toFixed(1);out.board=[Math.round(r.width),Math.round(r.height)]}
 return out})()
"""
results={}
async def audit(pg,key,shot=True):
  await pg.wait_for_timeout(350)
  r=await pg.evaluate(AUDIT);results[key]=r
  if shot: await pg.screenshot(path=f"{SHOTS}/{key}.png")
  print(key,r.get('layer'),'ctaVisible' if r.get('ctaVisible') else ('CTA-BELOW:'+str(r.get('ctaTop')) if 'ctaVisible' in r else ''),'scroll' if r.get('scrollable') else '','overX' if r['overX'] else '','small',len(r['small']),'tiny',len(r['tiny']),'trunc',len(r['trunc']),'lowc',len(r['lowc']),'off',len(r['off']),'tile',r.get('tile'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for (w,h,tag) in VPS:
      ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,has_touch=w<700,is_mobile=w<700)
      await ctx.add_init_script("try{if(!localStorage.getItem('neon-rubezh-v2'))localStorage.setItem('neon-rubezh-v2',%s)}catch(e){}"%json.dumps(json.dumps(MID)))
      pg=await ctx.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(URL);await pg.wait_for_timeout(1200)
      J=pg.evaluate
      for scr,acts in [('home',[]),('camp',[]),('camp2',[('chap','2')]),('mission',[('mis','4')]),('missionNM',[('mis','4'),('nm','1')]),('endless',[]),('daily',[]),('weekly',[]),
                       ('lab',[('labtab','0')]),('lab1',[('labtab','1')]),('lab2',[('labtab','2')]),('arsenal',[('labtab','3')]),
                       ('awards',[('atab','quests')]),('season',[('atab','season')]),('ach',[('atab','ach')]),('profile',[]),('codex',[('codex','towers')]),('codex2',[('codex','enemies')]),('codex3',[('codex','waves')]),('more',[])]:
        base=scr.rstrip('0123456789').replace('NM','')
        base={'arsenal':'lab','season':'awards','ach':'awards','missionNM':'mission'}.get(scr,base)
        if base in ('mission',):
          await J("window.__td.go('camp')")
        else:
          await J(f"window.__td.go('{base}')")
        for a,v in acts: await J(f"window.__td.act('{a}','{v}')")
        await audit(pg,f"{tag}-{scr}",shot=tag in ('s360','i390','d1280'))
        # also scroll to bottom for long screens
        if tag=='s360' and scr in ('home','mission','weekly','season','profile'):
          await J("document.querySelector('#lbView').scrollTop=1e6");await audit(pg,f"{tag}-{scr}-bottom")
      # in game
      await J("window.__td.go('camp')");await J("window.__td.act('mis','5')");await J("window.__td.act('mstart')");await pg.wait_for_timeout(900)
      await audit(pg,f"{tag}-game-start")
      await J("(()=>{const G=window.__td,S=G.S;S.gold=2000;let n=0;for(let r=0;r<15&&n<6;r++)for(let c=0;c<12&&n<6;c++)if(G.canBuild(c,r)){const near=S.map.path.some(p=>Math.abs(p.x-c-.5)<1.6&&Math.abs(p.y-r-.5)<1.6);if(near&&G.build(['laser','cannon','cryo','tesla','laser','cannon'][n],c,r))n++}})()")
      await pg.click('#bNext');await pg.wait_for_timeout(2500)
      await audit(pg,f"{tag}-game-wave")
      # build ring with preview
      cr=await J("(()=>{const G=window.__td;for(let r=6;r<15;r++)for(let c=0;c<12;c++)if(G.canBuild(c,r))return[c,r];return[0,0]})()")
      await J(f"window.__td.openRadial({cr[0]},{cr[1]})");await pg.wait_for_timeout(200)
      await audit(pg,f"{tag}-ring")
      await pg.click('#radial .ri.tw');await pg.wait_for_timeout(200)
      await audit(pg,f"{tag}-ring-preview")
      await J("(()=>{const G=window.__td,t=G.S.towers[0];G.openRadial(t.c,t.r)})()");await pg.wait_for_timeout(150)
      await pg.click('#radial .ri.act');await pg.wait_for_timeout(200)
      await audit(pg,f"{tag}-tower-up")
      await J("(()=>{const G=window.__td;G.openRadial(0,0);})()");await J("window.__td.S.rad=null;document.querySelector('#radial').hidden=true;document.querySelector('#tcard').hidden=true")
      await J("window.__td.offerPerks()");await pg.wait_for_timeout(300)
      await audit(pg,f"{tag}-perks")
      await pg.click('.pkc');await pg.wait_for_timeout(200)
      await J("window.__td.say('Проверка связи: оператор говорит длинную фразу, чтобы проверить перенос строк на узком экране.')");await pg.wait_for_timeout(500)
      await audit(pg,f"{tag}-comms")
      await pg.click('#bMenu');await pg.wait_for_timeout(300)
      await audit(pg,f"{tag}-sheet")
      await pg.click('#shResume');await pg.wait_for_timeout(100)
      await J("window.__td.endGame(true)");await pg.wait_for_timeout(1600)
      await audit(pg,f"{tag}-results-win")
      await J("window.__td.newGame(10,'campaign');window.__td.endGame(false)");await pg.wait_for_timeout(1600)
      await audit(pg,f"{tag}-results-lose")
      print(tag,'ERRORS',errs)
      await ctx.close()
    await b.close()
  json.dump(results,open(OUT+'/ux_results.json','w'),ensure_ascii=False)
asyncio.run(main())
