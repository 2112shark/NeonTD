import asyncio,os,json,sys
from playwright.async_api import async_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import wrap,GAME,OUT,SHOTS
URL=wrap(None,'wrap_perf.html')
FRAMES=r"""(ms)=>new Promise(res=>{const d=[];let last=performance.now();const t0=last;function f(now){d.push(now-last);last=now;if(now-t0<ms)requestAnimationFrame(f);else res(d)}requestAnimationFrame(f)})"""
def stats(d):
  d=sorted(d[2:]);n=len(d);
  return {'frames':n,'avg':round(sum(d)/n,1),'p95':round(d[int(n*.95)],1),'max':round(d[-1],1),'over33':sum(1 for x in d if x>33.4),'fps':round(1000/(sum(d)/n),1)}
async def metrics(cdp):
  m=await cdp.send('Performance.getMetrics');return {x['name']:x['value'] for x in m['metrics']}
async def main():
  out={}
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--disable-gpu-vsync','--disable-frame-rate-limit'] if '--unlimited' in sys.argv else [])
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,is_mobile=True,has_touch=True)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cdp=await ctx.new_cdp_session(pg);await cdp.send('Performance.enable')
    await pg.goto(URL);await pg.wait_for_timeout(1500)
    async def measure(name,ms=8000,setup=None):
      if setup: await pg.evaluate(setup)
      await pg.wait_for_timeout(500)
      m0=await metrics(cdp);d=await pg.evaluate(FRAMES,ms);m1=await metrics(cdp)
      wall=ms/1000;busy={k:round((m1[k]-m0[k])/wall*100,1) for k in ('TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration')}
      st=stats(d);st.update({'busy%':busy,'heapMB':round(m1['JSHeapUsedSize']/1048576,1)})
      st['enemies']=await pg.evaluate("window.__td.S?window.__td.S.enemies.length:0");st['parts']=await pg.evaluate("window.__td.S?window.__td.S.parts.length:0")
      out[name]=st;print(name,st,flush=True)
    await measure('lobby-home',5000)
    def scene(mi,mode,wave,ntow):
      return """(()=>{const G=window.__td;G.newGame(%d,'%s');document.querySelector('#lobby').hidden=true;const S=G.S;S.gold=1e6;S.lives=S.maxLives=999;if(S.coreHp){S.coreHp=S.coreHp.map(()=>999);S.coreMax=999}
      const T=['laser','cannon','cryo','tesla','sniper','gravi','laser','cannon'];let n=0;const cand=[];
      for(let r=0;r<15;r++)for(let c=0;c<12;c++)if(G.canBuild(c,r)){let s=0;for(const p of S.map.path){const d=(p.x-c-.5)**2+(p.y-r-.5)**2;if(d<4)s+=1/(1+d)}cand.push([s,c,r])}
      cand.sort((a,b)=>b[0]-a[0]);for(const [s,c,r] of cand){if(n>=%d)break;const t=T[n%%T.length];if(G.allowedFor?true:true){if(G.build(t,c,r)){n++;const tw=S.towers[S.towers.length-1];G.upgrade(tw);G.upgrade(tw);if(n%%2)G.upgrade(tw,n%%4?'A':'B')}}}
      S.gold=500;S.wave=%d;G.startWave();return n})()""" % (mi,mode,ntow,wave-1)
    print('towers',await pg.evaluate(scene(14,'campaign',18,26)))
    await measure('m15-w18-26towers-x1',8000)
    await pg.evaluate("document.querySelector('#speed button[data-s=\"3\"]').click()")
    await measure('m15-w18-26towers-x3',8000)
    await pg.evaluate("document.querySelector('#speed button[data-s=\"1\"]').click()")
    print('towers',await pg.evaluate(scene(1,'endless',45,45)))
    await measure('endless-w45-45towers-x1',8000)
    await pg.evaluate("document.querySelector('#speed button[data-s=\"7\"]').click()")
    # heap: play the m15 scene at x7 for 40 s
    print('towers',await pg.evaluate(scene(14,'campaign',1,26)))
    h0=(await metrics(cdp))['JSHeapUsedSize'];samples=[]
    for i in range(4):
      await pg.wait_for_timeout(10000)
      st=await pg.evaluate("(()=>{const S=window.__td.S;if(!S.waveActive&&!S.over&&!S.perkPick)window.__td.startWave();if(S.perkPick)window.__td.takePerk(S.perkPick[0]);return{w:S.wave,en:S.enemies.length,parts:S.parts.length,fx:S.fx.length,texts:S.texts.length}})()")
      samples.append([round((await metrics(cdp))['JSHeapUsedSize']/1048576,1),st])
    out['heap']={'startMB':round(h0/1048576,1),'samples':samples}
    print('heap',out['heap'],'errors',errs,flush=True)
    await b.close()
  json.dump(out,open(OUT+'/perf.json','w'))
asyncio.run(main())
