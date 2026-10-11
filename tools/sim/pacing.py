# Usage: python3 pacing.py [dir with career_tab.json and chal_daily.json] -> <dir>/pacing.json
# CUR = season economy of version 11 (flat 250 XP tiers), NEW = economy since version 12 (see game constants S_TIER, S_EARLY...).
# Meta-progression pacing: day-by-day model of player personas built on simulated per-mission rates.
# XP is rebuilt from its components so that alternative economies can be compared.
import json,random,statistics as st,sys
import os
DIR=os.environ.get('PDIR') or (sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'out'));T=json.load(open(DIR+'/career_tab.json'));D=json.load(open(DIR+'/chal_daily.json'))
dwin={a:sum(r['res'][a]['won'] for r in D)/len(D) for a in ['beginner','novice','average','expert']}
WAVES=[8,10,12,12,12,14,14,15,15,16,16,18,18,18,20]
STARS={'beginner':2.2,'novice':2.4,'average':2.6,'expert':2.6}
# name, skill, days per week, minutes per session, average speed, quests per day, weekly quest prob, weekly runs, daily first
PERS=[('Казуальный','novice',3,20,1.5,2,.5,0,False),
      ('Регулярный','average',7,30,2.0,2.5,1,1,True),
      ('Увлечённый','expert',7,60,3.0,3,1,2,True),
      ('Слабый, но упорный','beginner',5,30,1.5,2,.5,0,False)]
CUR=dict(S_TIER=250,S_MAX=30,XPW=10,XPM=40,XPS=20,XPN=40,XPD=100,XPQ=80,XPWQ=250,XPWR=40)
def tier_start(t,E):
  k=E.get('EARLY',0);c=E.get('EARLY_COST',E['S_TIER'])
  return t*c if t<=k else k*c+(t-k)*E['S_TIER']
def tier_of(xp,E):
  t=0
  while t<E['S_MAX'] and xp>=tier_start(t+1,E): t+=1
  return t
def tier_cores(t): return sum(1 for k in range(1,t+1) if k%10 not in (0,5,7))
def sim(p,seed,E):
  name,sk,dpw,mins,spd,qd,wq,wr,dfirst=p;R=random.Random(seed);M=T[sk]['mis'];nmw=T[sk]['nmwin'];nmt=T[sk]['nmt']
  mi=nmi=0;cores=0.0;sxp=0;res={};tc=0;pt=0;tiers=[];curve=[]
  wave_min={'beginner':.85,'novice':.85,'average':.7,'expert':.55}[sk]   # minutes per wave at x1 incl. waiting
  for d in range(84):
    if d%28==0: sxp=0;pt=0
    if (d%7)>=dpw:
      tiers.append(tier_of(sxp,E))
      if d==27:res['cores_d28']=round(cores+tc,1)
      curve.append(cores+tc)
      continue
    left=mins;g=0;c=0
    def daily():
      nonlocal left,g,c
      won=R.random()<dwin[sk];w=20 if won else 6;t=w*wave_min/spd+1
      if t>left+3:return
      left-=t;g+=w*E['XPW']+(E['XPD'] if won else 0);c+=(1 if won else 0)+w/10
    if dfirst:daily()
    while left>2:
      if mi<15:
        m=M[mi];t=m['tmin']/spd+1
        if t>left*1.6:break
        left-=t
        if R.random()<1/m['att']:
          g+=WAVES[mi]*E['XPW']+E['XPM']+E['XPS']*STARS[sk];c+=STARS[sk]+1.5+WAVES[mi]/10;mi+=1
          if mi==15:res.setdefault('campaign_day',d+1)
        else:g+=int(WAVES[mi]*.7)*E['XPW'];c+=WAVES[mi]*.07
      elif nmi<15:
        t=nmt[nmi]/spd+1;left-=t
        if R.random()<max(.15,nmw[nmi]):g+=16*E['XPW']+E['XPM']+E['XPN']+E['XPS']*2;c+=2+1.6;nmi+=1
        else:g+=10*E['XPW']
      else:
        w=left*spd/wave_min;g+=int(w*E['XPW']);c+=w/10;left=0
    if not dfirst and left>=5:daily()
    g+=qd*E['XPQ'];c+=1 if qd>=3 else .5 if qd>=2.5 else 0
    if d%7==0:g+=E['XPWQ']*wq;c+=2*wq
    if wr and d%7==1:g+=wr*(E['XPWR']+40*E['XPW']*(.9 if sk!='beginner' else .2))
    sxp+=g;cores+=c
    tier=tier_of(sxp,E)
    if tier>pt:tc+=tier_cores(tier)-tier_cores(pt);pt=tier
    if tier>=E['S_MAX']and d<28:res.setdefault('season_done_day',d+1)
    if cores+tc>=49:res.setdefault('lab_full_day',d+1)
    tiers.append(tier)
    if d==27:res['cores_d28']=round(cores+tc,1)
    curve.append(cores+tc)
  res['curve']=curve
  res['tier_day28']=tiers[27];res['tier_day14']=tiers[13];res['tier_day56']=tiers[55];res['cores_d84']=round(cores+tc,1)
  return res
def run(E,label):
  out={}
  for p in PERS:
    rs=[sim(p,s,E) for s in range(60)];agg={}
    for k in ['campaign_day','lab_full_day','season_done_day','tier_day14','tier_day28','tier_day56','cores_d28','cores_d84']:
      v=[r[k] for r in rs if k in r];agg[k]=round(st.median(v),1) if v else None
    agg['campaign_share']=sum(1 for r in rs if 'campaign_day' in r)/len(rs);agg['season_done_share']=sum(1 for r in rs if 'season_done_day' in r)/len(rs)
    agg['curve']=[round(st.median(r['curve'][d] for r in rs),1) for d in range(84)]
    out[p[0]]=agg
  print('==',label);[print(' ',k.ljust(20),{x:y for x,y in v.items() if x!='curve'}) for k,v in out.items()]
  return out
if __name__=='__main__':
  NEW=dict(CUR,S_TIER=750,EARLY=5,EARLY_COST=350,XPW=4,XPD=150,XPQ=100,XPWQ=400)
  label=os.environ.get('PLABEL','run')
  res={'old_economy':run(CUR,label+': old economy'),'new_economy':run(NEW,label+': new economy')}
  json.dump(res,open(DIR+'/pacing.json','w'),ensure_ascii=False)
