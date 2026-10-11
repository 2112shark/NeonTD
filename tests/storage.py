import asyncio,os,sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
URL=wrap(None,'wrap_storage.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for mode in ['throw','null-storage','quota']:
      ctx=await b.new_context(viewport={'width':390,'height':844})
      if mode=='throw':
        await ctx.add_init_script("(()=>{const f=()=>{throw new DOMException('SecurityError','SecurityError')};Object.defineProperty(window,'localStorage',{get:f,configurable:true})})()")
      elif mode=='null-storage':
        await ctx.add_init_script("Object.defineProperty(window,'localStorage',{value:null,configurable:true})")
      else:
        await ctx.add_init_script("Storage.prototype.setItem=function(){throw new DOMException('QuotaExceededError','QuotaExceededError')}")
      pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(URL);await pg.wait_for_timeout(1200)
      ok1=await pg.evaluate("!document.querySelector('#lobby').hidden&&!!document.querySelector('[data-act=play]')")
      await pg.click('[data-act=play]');await pg.wait_for_timeout(500)
      ok2=await pg.evaluate("window.__td.S&&window.__td.S.mis&&window.__td.S.mis.id==='m1'")
      await pg.evaluate("(()=>{const G=window.__td;G.S.gold=500;G.build('laser',2,3);G.build('cannon',5,3);G.startWave()})()")
      await pg.wait_for_timeout(1500)
      await pg.evaluate("window.__td.endGame(true)");await pg.wait_for_timeout(1300)
      ok3=await pg.evaluate("!document.querySelector('#end').hidden&&window.__td.PROG.ms.m1>=1")
      print(mode,'lobby',ok1,'mission',ok2,'results+progress in memory',ok3,'errors',errs)
      await ctx.close()
    await b.close()
asyncio.run(main())
