# Shared helpers for the browser tests: wrap the game fragment the way the artifact host does and keep outputs in tests/out.
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME=os.path.join(ROOT,'game','neon-td.html')
OUT=os.path.join(ROOT,'tests','out')
SHOTS=os.path.join(OUT,'shots')
os.makedirs(SHOTS,exist_ok=True)
HEAD=('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
      '<style>body{margin:0;font:14px system-ui;background:#f6f6f4}[hidden]{display:none!important}</style></head><body>')
def wrap(src=None,name='wrap.html'):
  """Write tests/out/<name> with the game inside a page skeleton and return its file:// URL."""
  body=open(src or GAME,encoding='utf-8').read()
  p=os.path.join(OUT,name)
  open(p,'w',encoding='utf-8').write(HEAD+body+'</body></html>')
  return 'file://'+p
