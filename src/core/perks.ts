// In-run perk offers and picks.
import { rng } from './util.ts';
import { PROG } from '../meta/progress.ts';
import { S } from './state.ts';
import { lab } from '../meta/lab.ts';
import { unlock } from '../meta/achievements.ts';
import { PERKS, PK_ID } from '../data/perks.ts';
import { snd } from '../audio/sfx.js';
import { toast } from '../ui/comms.js';
import { PKO, renderPerks } from '../ui/perkChoice.js';
import { qev } from '../meta/quests.ts';
import { closeRadial } from '../ui/radial.js';
import { updInfo } from '../ui/info.js';
import { vib } from '../ui/lobby/shared.js';

export function offerPerks(){
  const pool=PERKS.filter(p=>!S.perks.includes(p.id)&&(!p.need||S.allowed.includes(p.need)));if(!pool.length)return;
  const R=rng(S.seed+S.wave*977+S.perks.length*31),n=Math.min(pool.length,3+lab('perk')),pick: string[]=[];
  while(pick.length<n){const p=pool[R()*pool.length|0];if(!pick.includes(p.id))pick.push(p.id)}
  S.perkPick=pick;closeRadial();S.place=null;S.aim=null;renderPerks();snd('perk');vib(20);
}
export function takePerk(id: string){
  if(!S||!S.perkPick||!S.perkPick.includes(id))return;S.perks.push(id);S.perkPick=null;PKO.hidden=true;
  if(id==='hp'){if(S.coreHp){S.coreHp=S.coreHp.map(h=>h+3);S.coreMax+=3;S.lives+=3*S.coreHp.length;S.maxLives+=3*S.coreHp.length}else{S.lives+=5;S.maxLives+=5}}
  PROG.st.perks=(PROG.st.perks||0)+1;qev('perk',1);if(S.perks.length>=5)unlock('perk5');
  snd('up');toast(`Перк: ${PK_ID[id].name}`);updInfo(true);
}
