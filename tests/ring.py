import asyncio,os,json
from playwright.async_api import async_playwright
import sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
SRC=sys.argv[1] if len(sys.argv)>1 else None
URL=wrap(SRC,'wrap_ring.html')
CHECK=r"""
(([c,r])=>{const G=window.__td;G.openRadial(c,r);const items=[...document.querySelectorAll('#radial .ri')].map(b=>b.getBoundingClientRect()),rc=document.querySelector('#radial .rc').getBoundingClientRect(),vw=innerWidth,vh=innerHeight;
 const ov=(a,b)=>!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
 const btns=[...document.querySelectorAll('#radial .ri')];let overRc=0,overEach=0,offs=0;btns.forEach((bb,i)=>{const a=items[i],cx=(a.left+a.right)/2,cy=(a.top+a.bottom)/2,top=document.elementFromPoint(cx,cy);if(!top||!(bb===top||bb.contains(top)))overRc++;if(a.left<0||a.top<0||a.right>vw||a.bottom>vh)offs++;items.forEach((b,j)=>{if(j>i&&ov(a,b))overEach++})});
 const st=document.querySelector('#stage').getBoundingClientRect();
 return{overRc,overEach,offs,n:items.length,rc:[Math.round(rc.width)],stage:[Math.round(st.width),Math.round(st.height)]}})
"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for (w,h,tag) in [(360,640,'s360'),(390,844,'i390'),(768,1024,'t768'),(1024,768,'t1024'),(1280,800,'d1280'),(1920,1080,'d1920')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce');pg=await ctx.new_page()
      await pg.goto(URL);await pg.wait_for_timeout(800)
      await pg.evaluate("window.__td.act('tut');window.__td.endGame&&0");await pg.wait_for_timeout(300)
      await pg.evaluate("(()=>{const G=window.__td;G.newGame(13,'campaign');document.querySelector('#lobby').hidden=true;G.S.paused=true})()");await pg.wait_for_timeout(300)
      tiles=await pg.evaluate("(()=>{const G=window.__td,o=[];for(let r=0;r<15;r++)for(let c=0;c<12;c++)if(G.canBuild(c,r))o.push([c,r]);return o})()")
      agg={'tiles':0,'overRc':0,'overEach':0,'offs':0}
      worst=None
      for t in tiles:
        r=await pg.evaluate(CHECK,t);agg['tiles']+=1
        for k in ('overRc','overEach','offs'):
          if r[k]:agg[k]+=1
        if r['overRc'] and not worst: worst=t
      if worst:
        await pg.evaluate(CHECK,worst);await pg.screenshot(path=f"{SHOTS}/ring-{tag}.png")
      agg2={'tiles':0,'overRc':0,'offs':0}
      for t in tiles[::3]:
        await pg.evaluate("(([c,r])=>{const G=window.__td;G.S.gold=1e5;G.build('laser',c,r)})",t)
        r=await pg.evaluate(CHECK,t);agg2['tiles']+=1
        for k in ('overRc','offs'):
          if r[k]:agg2[k]+=1
        await pg.evaluate("(([c,r])=>{const G=window.__td;G.closeRadial&&0;const t=G.S.towers.find(x=>x.c===c&&x.r===r);if(t)G.sell(t)})",t)
      print(tag,'tower-ring',agg2)
      print(tag,'tile',await pg.evaluate("Math.round(document.querySelector('#cv').getBoundingClientRect().width/12)"),agg,'example',worst)
      await ctx.close()
    await b.close()
asyncio.run(main())
