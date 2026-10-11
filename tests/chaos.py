import asyncio,os,json,random,sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
HERE=os.path.dirname(os.path.abspath(__file__));URL=wrap(None,'wrap_chaos.html')
SECS=int(sys.argv[1]) if len(sys.argv)>1 else 120
INV=r"""(()=>{const G=window.__td,S=G.S,P=G.PROG,bad=[];if(!S)return bad;
 const num=v=>typeof v==='number'&&isFinite(v);
 if(!num(S.gold)||S.gold<0)bad.push('gold '+S.gold);if(!num(S.lives)||S.lives<0)bad.push('lives '+S.lives);
 if(S.coreHp&&S.coreHp.some(h=>!num(h)||h<0))bad.push('coreHp');
 for(const e of S.enemies){if(!num(e.x)||!num(e.y)||!num(e.hp)){bad.push('enemy NaN '+e.t);break}}
 const seen=new Set();for(const t of S.towers){const k=t.c+','+t.r;if(seen.has(k))bad.push('two towers on '+k);seen.add(k);if(S.grid[t.r][t.c]!==0&&S.grid[t.r][t.c]!==3)bad.push('tower on blocked tile '+k)}
 if(S.enemies.length>600)bad.push('enemies '+S.enemies.length);if(S.parts.length>1500)bad.push('parts '+S.parts.length);
 try{JSON.stringify(P)}catch(e){bad.push('PROG not serializable')}
 if(S.wave>0&&S.perkPick&&document.querySelector('#perkOv').hidden&&document.querySelector('#lobby').hidden&&document.querySelector('#end').hidden)bad.push('perk pick without overlay');
 return bad})()"""
async def session(b,seed,w,h,fresh):
  rnd=random.Random(seed)
  ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=w<700)
  if not fresh:
    await ctx.add_init_script("try{if(!localStorage.getItem('neon-rubezh-v2'))localStorage.setItem('neon-rubezh-v2',JSON.stringify({v:3,tut:1,ms:{m1:7,m2:3,m3:3,m4:1,m5:3,m6:1,m7:1,m8:1,m9:1,m10:1,m11:1,m12:1,m13:1,m14:1},stars:{m1:3,m2:2,m3:2,m4:1,m5:2,m6:1,m7:1,m8:1,m9:1,m10:1,m11:1,m12:1,m13:1,m14:1},waves:300,kills:9000}))}catch(e){}")
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' and 'ERR_' not in m.text else None)
  await pg.goto(URL);await pg.wait_for_timeout(800)
  keys=list('1234567qweustn')+[' ','Escape']
  inv=set();acts=0
  t_end=asyncio.get_event_loop().time()+SECS
  while asyncio.get_event_loop().time()<t_end:
    r=rnd.random();acts+=1
    try:
      if r<.5:
        await pg.mouse.click(rnd.randint(0,w-1),rnd.randint(0,h-1))
      elif r<.62:
        await pg.keyboard.press(rnd.choice(keys))
      else:
        els=await pg.query_selector_all('button:visible,[data-act]:visible')
        els=[e for e in els]
        if els:
          e=rnd.choice(els)
          try: await e.click(timeout=300)
          except Exception: pass
      if acts%25==0:
        for x in await pg.evaluate(INV): inv.add(x)
        if rnd.random()<.3: await pg.evaluate("(()=>{const b=document.querySelector('#speed button[data-s=\"7\"]');if(b&&b.offsetParent)b.click()})()")
    except Exception as ex:
      errs.append('driver:'+str(ex)[:120])
    await pg.wait_for_timeout(rnd.randint(30,160))
  st=await pg.evaluate("(()=>{const S=window.__td.S;return{mode:S.mode,mis:S.mis&&S.mis.id,wave:S.wave,over:S.over,towers:S.towers.length,lobby:!document.querySelector('#lobby').hidden}})()")
  await ctx.close()
  return {'seed':seed,'vp':[w,h],'fresh':fresh,'acts':acts,'errors':errs[:20],'nerr':len(errs),'invariants':sorted(inv),'end':st}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();res=[]
    for seed,(w,h),fresh in [(1,(390,844),True),(2,(360,640),False),(3,(1280,800),False),(4,(412,915),True)]:
      r=await session(b,seed,w,h,fresh);res.append(r);print(json.dumps(r,ensure_ascii=False),flush=True)
    await b.close()
  json.dump(res,open(OUT+'/chaos.json','w'),ensure_ascii=False)
asyncio.run(main())
