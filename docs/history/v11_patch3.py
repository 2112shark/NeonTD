# Stage 3 fixes found by the audit: build ring near edges, results actions on short screens,
# small-screen truncations, cloak hint, version label.
import sys
src=sys.argv[1] if len(sys.argv)>1 else 'base.html'
h=open(src).read()
def rep(a,b,n=1):
  global h
  c=h.count(a)
  if c!=n: raise SystemExit(f'expected {n}x, found {c}x: {a[:90]}')
  h=h.replace(a,b)

# 1. build ring: grow with the tile size and leave a gap on the side of the tapped tile when the ring is pushed off an edge
rep("""  const st=$('#stage'),M=96;
  const cx=clamp(cv.offsetLeft+(S.rad.c+.5)*tile,M,st.clientWidth-M),cy=clamp(cv.offsetTop+(S.rad.r+.5)*tile,M,st.clientHeight-M);
  RAD.style.left=cx+'px';RAD.style.top=cy+'px';
  const R=S.sel?72:68,n=items.length;
  let h='<div class="ring"></div>';
  items.forEach((it,i)=>{const a=-Math.PI/2+i*Math.PI*2/n,x=Math.cos(a)*R,y=Math.sin(a)*R;""",
"""  const st=$('#stage'),n=items.length,fs=Math.max(30,tile+6),px=cv.offsetLeft+(S.rad.c+.5)*tile,py=cv.offsetTop+(S.rad.r+.5)*tile;
  const L=ringLayout(n,px,py,fs,st.clientWidth,st.clientHeight,!!S.sel),cx=L.cx,cy=L.cy,R=L.R;
  RAD.style.left=cx+'px';RAD.style.top=cy+'px';
  let h=`<div class="ring" style="left:${-R-26}px;top:${-R-26}px;width:${2*R+52}px;height:${2*R+52}px"></div>`;
  items.forEach((it,i)=>{const a=L.ang[i],x=Math.cos(a)*R,y=Math.sin(a)*R;""")
rep("""  const tx=cv.offsetLeft+(S.rad.c+.5)*tile-cx,ty=cv.offsetTop+(S.rad.r+.5)*tile-cy,fs=Math.max(30,tile+6);""",
"""  const tx=px-cx,ty=py-cy;""")
rep("""function renderRadial(){""","""// ring geometry: the radius grows with the tile so buttons clear the tile highlight; when the ring has to move away
// from a tile near an edge, the buttons are spread over the arc that stays clear of the tile
function ringLayout(n,px,py,fs,W,H,act){
  const iw=act?50:28,need=fs*.71+iw+10,gap=act?98:58;let R=Math.max(act?72:68,Math.round(need+2)),out=null;
  for(let k=0;k<10;k++){
    const M=R+iw+4,cx=clamp(px,M,W-M),cy=clamp(py,M,H-M),tx=px-cx,ty=py-cy,d=Math.hypot(tx,ty);
    let a0=-Math.PI/2,step=Math.PI*2/n;
    if(d>2&&n>1){const c=(R*R+d*d-need*need)/(2*R*d);if(c<1){const w=Math.acos(Math.max(-1,c)),at=Math.atan2(ty,tx);a0=at+w;step=(Math.PI*2-2*w)/(n-1)}}
    out={cx,cy,R,ang:Array.from({length:n},(_,i)=>a0+i*step)};
    if(2*R*Math.sin(Math.min(Math.PI/2,step/2))>=gap)break;
    R+=6}
  return out}
function renderRadial(){""")

# 2. results: on short screens the action buttons stay pinned to the bottom while the card scrolls
h=h.replace("</style>","""@media (max-height:760px){
 .res{gap:10px;padding-top:18px}
 .res h2{font-size:24px}
 .bigstars svg{width:40px;height:40px}
 .racts{position:sticky;bottom:-16px;z-index:1;width:calc(100% + 36px);margin:0 -18px -18px;padding:12px 18px 18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(10,15,31,0),rgba(10,15,31,.97) 24%)}
}
@media (max-width:400px){.lb-nav{grid-template-columns:1fr 1.1fr 1.35fr 1.1fr .8fr}}
.res .rew{order:1}.res .rstats{order:2}.res .racts{order:3}
</style>""",1)

# 3. wave status button: the wave number is already in the HUD, so the button shows how many enemies are left
rep("""else if(S.waveActive){nt=`Волна ${S.wave} · ${S.enemies.length+S.queue.length}`;dis=true}""",
"""else if(S.waveActive){nt=`Врагов: ${S.enemies.length+S.queue.length}`;dis=true}""")

# 4. operator hint the first time invisible enemies appear in a run
rep("""S.curMods=waveMods(S.wave);""","""S.curMods=waveMods(S.wave);if(S.curMods.includes('cloak')&&!S.said.cloak){S.said.cloak=1;setTimeout(()=>say('Невидимки! Их видят только Крио и Тесла, остальные башни стреляют лишь по врагам в зоне их действия. Поставьте Крио у пути.'),400)}""")

# 5. version label and its contrast
rep("""<p class="ver">Неоновый рубеж, версия 6</p>""","""<p class="ver">Неоновый рубеж, версия 7</p>""")
rep(""".ver{margin:0;text-align:center;font-size:12px;color:#4a5580}""",""".ver{margin:0;text-align:center;font-size:12px;color:#7a86b4}""")
open('out.html','w').write(h)
print('ok',len(h))
