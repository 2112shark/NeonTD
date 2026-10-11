# Usage: python3 build_tab.py [dir with career_<arch>.json, default tools/sim/out] -> <dir>/career_tab.json
# Per-archetype career table for the pacing model. 'att' is attempts per win pooled over careers, so a mission that
# a career failed to beat in 6 tries counts as a wall instead of being capped at 6.
import json,sys,os
d=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'out');T={}
for a in ['beginner','novice','average','expert']:
  C=json.load(open(f'{d}/career_{a}.json'));K=len(C);mis=[]
  for i in range(15):
    A=sum(c['mis'][i]['att'] for c in C);Wn=sum(1 for c in C if c['mis'][i]['won'])
    mis.append({'id':C[0]['mis'][i]['id'],'att':round(A/Wn,2) if Wn else 99,'att_mean':round(A/K,2),'wins':Wn,'tries':A,
      'tmin':round(sum((c['mis'][i]['tGame']+c['mis'][i]['tWait'])/c['mis'][i]['att'] for c in C)/K/60,1)})
  T[a]={'mis':mis,'nmwin':[sum(c['nm'][i]['won'] for c in C)/K for i in range(15)],'nmt':[sum(c['nm'][i]['time'] for c in C)/K/60 for i in range(15)],
    'final_pts':sum(c['final']['pts'] for c in C)/K,'xp_campaign':sum(c['mis'][14]['xp'] for c in C)/K,'xp_final':sum(c['final']['xp'] for c in C)/K,
    'beaten':sum(1 for c in C for m in c['mis'] if m['won'])/K}
json.dump(T,open(f'{d}/career_tab.json','w'),ensure_ascii=False)
for a in T:print(a,'att',[m['att'] for m in T[a]['mis']],'beaten',T[a]['beaten'],'pts',T[a]['final_pts'])
