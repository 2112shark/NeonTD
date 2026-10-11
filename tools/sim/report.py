# Markdown tables comparing saved simulation results between versions (data/v11, data/v12, data/v13).
# Usage: python3 tools/sim/report.py [data dir, default data/]  -> prints markdown to stdout
import json,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D=sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'data')
A=['beginner','novice','average','expert'];RU={'beginner':'Начинающий','novice':'Новичок','average':'Средний','expert':'Опытный'}
def J(v,f):
  p=os.path.join(D,v,f);return json.load(open(p,encoding='utf-8')) if os.path.exists(p) else None
def pct(rs):return f"{round(100*sum(r['won'] for r in rs)/len(rs))}%"
out=[]
w=out.append
# boss missions
w('### Боссы: доля побед (20 боёв на миссию, типичная лаборатория)\n')
w('| Игрок | Миссия | v11 | v12 | v13 | Прорывов в v13 |');w('| --- | --- | --- | --- | --- | --- |')
for a in ('beginner','novice'):
  for m in ('m5','m10','m15'):
    c=[J(v,'bossfocus.json') for v in ('v11','v12','v13')]
    cell=[pct(x[a][m]) if x and a in x else '—' for x in c]
    laps=f"{sum(1 for r in c[2][a][m] if r['laps'])} из 20" if c[2] and a in c[2] else '—'
    w(f"| {RU[a]} | {m} | {' | '.join(cell)} | {laps} |")
w('\nСредний и опытный игроки выигрывают все бои с боссами во всех версиях и ни разу не пропускают босса к ядру.\n')
# careers
w('### Карьеры: кампания целиком (8 карьер на тип игрока)\n')
w('| Игрок | Версия | Попыток на кампанию | Пройдено миссий из 15 | Минут игры | Попыток на победу м5 / м10 / м15 | Побед в «Кошмаре» из 15 |');w('| --- | --- | --- | --- | --- | --- | --- |')
for a in A:
  for v in ('v11','v12','v13'):
    T=J(v,'career_tab.json')
    if not T or a not in T: continue
    m=T[a]['mis']
    if v=='v13' and a in ('average','expert'): continue
    w(f"| {RU[a]} | {v} | {round(sum(x['tries'] for x in m)/8,1)} | {T[a].get('beaten','—')} | {round(sum(x['tmin']*x['att_mean'] for x in m))} | {' / '.join(str(m[i]['att']) for i in (4,9,14))} | {round(sum(T[a]['nmwin']),1)} |")
w('')
# daily challenge
w('### Вызов дня: 28 дней, из них 11 с «Невидимками»\n')
w('| Игрок | Побед в дни с невидимками, v11 → v12 | Побед в остальные 17 дней, v11 → v12 | Средний счёт, v11 → v12 |');w('| --- | --- | --- | --- |')
o,n=J('v11','chal_daily.json'),J('v12','chal_daily.json')
if o and n:
  for a in A:
    f=lambda d,cl:sum(r['res'][a]['won'] for r in d if ('cloak' in r['mods'])==cl)
    sc=lambda d:round(sum(r['res'][a]['score'] for r in d)/len(d))
    w(f"| {RU[a]} | {f(o,True)} → {f(n,True)} | {f(o,False)} → {f(n,False)} | {sc(o)} → {sc(n)} |")
w('')
# weekly
w('### Вызов недели: 6 недель с «Невидимками» из 26\n')
w('| Игрок | Побед, v11 → v12 | Средняя волна, v11 → v12 |');w('| --- | --- | --- |')
o,n=J('v11','weekly_cloak.json'),J('v12','weekly_cloak.json')
if o and n:
  for a in A:
    w(f"| {RU[a]} | {sum(r['res'][a]['won'] for r in o)} → {sum(r['res'][a]['won'] for r in n)} | {round(sum(r['res'][a]['wave'] for r in o)/len(o),1)} → {round(sum(r['res'][a]['wave'] for r in n)/len(n),1)} |")
w('')
# pacing
w('### Темп сезона и ядер по модели игроков (медиана 60 симулированных игроков)\n')
w('| Игрок | Кампания пройдена, день | Ступень на 14-й день | Ступень на 28-й день | Трек пройден, день | Ядер сверх лаборатории на 28-й день | Ядер сверх лаборатории на 84-й день |');w('| --- | --- | --- | --- | --- | --- | --- |')
po,pn=J('v11','pacing.json'),J('v13','pacing.json')
if po and pn:
  for p in po['old_economy']:
    a,b=po['old_economy'][p],pn['new_economy'][p]
    sur=lambda x,d:max(0,round(x['curve'][d]-49)) if 'curve' in x else '—'
    f=lambda x,k:(int(x[k]) if float(x[k]).is_integer() else x[k]) if x.get(k) is not None else 'нет'
    w(f"| {p} | {f(a,'campaign_day')} → {f(b,'campaign_day')} | {f(a,'tier_day14')} → {f(b,'tier_day14')} | {f(a,'tier_day28')} → {f(b,'tier_day28')} | {f(a,'season_done_day')} → {f(b,'season_done_day')} | {sur(a,27)} → {sur(b,27)} | {sur(a,83)} → {sur(b,83)} |")
w('\nv11: экономика сезона версии 11 на данных карьер v11; v13: экономика версии 12+ на данных карьер v13.')
print('\n'.join(out))
