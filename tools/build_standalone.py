# game/neon-td.html is an HTML fragment: the Claude artifact host adds the page skeleton when it serves the game.
# This wraps it into the same skeleton and writes index.html at the repository root, the page for GitHub Pages
# and for opening the game outside Claude. Run it after every change to game/neon-td.html and commit both files.
# Usage: python3 tools/build_standalone.py
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREFIX=('<!doctype html><html lang="ru"><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  'html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
  'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')
SUFFIX='\n</body></html>'
def build():
  body=open(os.path.join(ROOT,'game','neon-td.html'),encoding='utf-8').read()
  return PREFIX+body+SUFFIX
if __name__=='__main__':
  out=os.path.join(ROOT,'index.html')
  open(out,'w',encoding='utf-8',newline='').write(build())
  print('written',out)
