import asyncio,os,json,random,sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=sys.argv[1] if len(sys.argv)>1 and sys.argv[1]!='-' else None;SECS=int(sys.argv[2]) if len(sys.argv)>2 else 90
URL=wrap(SRC,'wrap_chaos2.html')
INV=open(HERE+'/chaos.py').read().split('INV=r"""')[1].split('"""')[0]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();res=[]
    for seed,(w,h),mi in [(11,(390,844),14),(12,(360,640),9),(13,(768,1024),6)]:
      rnd=random.Random(seed);ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=w<700)
      pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(URL);await pg.wait_for_timeout(700)
      await pg.evaluate(f"(()=>{{const G=window.__td;G.PROG.tut=1;G.act('mis','{mi}');G.act('mstart')}})()");await pg.wait_for_timeout(500)
      await pg.evaluate("(()=>{const G=window.__td,S=G.S;S.gold=3000;let n=0;for(let r=0;r<15&&n<10;r++)for(let c=0;c<12&&n<10;c++)if(G.canBuild(c,r)&&S.map.path.some(p=>Math.abs(p.x-c-.5)<1.6&&Math.abs(p.y-r-.5)<1.6)){if(G.build(S.allowed[n%S.allowed.length],c,r))n++}G.startWave();document.querySelector('#speed button[data-s=\"3\"]').click()})()")
      cv=await pg.evaluate("(()=>{const r=document.querySelector('#cv').getBoundingClientRect();return[r.left,r.top,r.width,r.height]})()")
      inv=set();acts=0;t_end=asyncio.get_event_loop().time()+SECS
      while asyncio.get_event_loop().time()<t_end:
        r=rnd.random();acts+=1
        try:
          if r<.55: await pg.mouse.click(cv[0]+rnd.random()*cv[2],cv[1]+rnd.random()*cv[3])
          elif r<.75:
            els=await pg.query_selector_all('#radial button:visible,#perkOv button:visible,.abil button:visible,#bNext')
            if els:
              try: await rnd.choice(els).click(timeout=300)
              except Exception: pass
          elif r<.9: await pg.keyboard.press(rnd.choice(list('1234567qweustn')+[' ']))
          else:
            await pg.evaluate("(()=>{const G=window.__td,S=G.S;if(S.over){document.querySelector('#end [data-act=retry]')&&document.querySelector('#end [data-act=retry]').click()}else if(!S.waveActive&&!S.perkPick)G.startWave();S.gold+=150})()")
          if acts%20==0:
            for x in await pg.evaluate(INV): inv.add(x)
        except Exception as ex: errs.append('driver:'+str(ex)[:100])
        await pg.wait_for_timeout(rnd.randint(40,140))
      st=await pg.evaluate("(()=>{const S=window.__td.S;return{mis:S.mis&&S.mis.id,wave:S.wave,over:S.over,won:S.won,towers:S.towers.length}})()")
      r={'seed':seed,'vp':[w,h],'acts':acts,'errors':errs[:10],'invariants':sorted(inv),'end':st};res.append(r);print(json.dumps(r,ensure_ascii=False),flush=True)
      await ctx.close()
    await b.close()
  json.dump(res,open(OUT+'/chaos2.json','w'),ensure_ascii=False)
asyncio.run(main())
