# Boss second lap: the boss also recovers 30% of its health before walking the route again (normal difficulty only).
import sys
src=sys.argv[1] if len(sys.argv)>1 else 'final.html'
dst=sys.argv[2] if len(sys.argv)>2 else 'final13.html'
h=open(src).read()
def rep(a,b,n=1):
  global h
  c=h.count(a)
  if c!=n: raise SystemExit(f'expected {n}x, found {c}x: {a[:100]}')
  h=h.replace(a,b)

rep("const BOSS_LAP=10; // core lost when a mission boss breaks through on normal difficulty; it then walks the route again",
    "const BOSS_LAP=10,BOSS_LAP_HEAL=.3; // a mission boss that breaks through on normal difficulty costs 10 core, recovers 30% health and walks the route again")
rep("e.dead=false;e.i=0;e.prog=0;e.x=e.path[0].x;e.y=e.path[0].y;return}}",
    "e.dead=false;e.i=0;e.prog=0;e.x=e.path[0].x;e.y=e.path[0].y;e.hp=Math.min(e.max,e.hp+e.max*BOSS_LAP_HEAL);\n        text(e.x,e.y-.6,'+'+Math.round(BOSS_LAP_HEAL*100)+'% здоровья','#ffb3c0',.32,1.4);return}}")
rep("lap:'Колосс прорвался к ядру и пошёл на второй круг! Второго прорыва ядро не выдержит.'",
    "lap:'Колосс прорвался к ядру, восстановил силы и пошёл на второй круг! Второго прорыва ядро не выдержит.'")
rep("lap:'Матка прорвалась и уходит на второй круг! Добейте её, второго прорыва ядро не выдержит.'",
    "lap:'Матка прорвалась, подлечилась и уходит на второй круг! Добейте её, второго прорыва ядро не выдержит.'")
rep("lap:'Разрушитель прорвался и идёт на второй круг! Второго удара ядро не переживёт.'",
    "lap:'Разрушитель прорвался, залатал броню и идёт на второй круг! Второго удара ядро не переживёт.'")
rep("Прорвавшись к ядру, он отнимет ${BOSS_LAP} прочности и пойдёт на второй круг; второй прорыв означает поражение.",
    "Прорвавшись к ядру, он отнимет ${BOSS_LAP} прочности, восстановит ${Math.round(BOSS_LAP_HEAL*100)}% здоровья и пойдёт на второй круг; второй прорыв означает поражение.")
rep("BOSS_LAP,CLOAK_NEAR,","BOSS_LAP,BOSS_LAP_HEAL,CLOAK_NEAR,")
rep('<p class="ver">Неоновый рубеж, версия 8</p>','<p class="ver">Неоновый рубеж, версия 9</p>')
open(dst,'w').write(h)
print('ok',len(h))
