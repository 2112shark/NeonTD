// Perk choice overlay.
import { $ } from '../core/util.ts';
import { S } from '../core/state.ts';
import { PK_ID } from '../data/perks.ts';
import { initAudio } from '../audio/sfx.ts';
import { takePerk } from '../core/perks.ts';
import { PIC } from './lobby/shared.js';

export const PKO=$('#perkOv');
export function renderPerks(){if(!S||!S.perkPick){PKO.hidden=true;return}
  $('#pks').innerHTML=S.perkPick.map(id=>{const p=PK_ID[id];return`<button class="pkc" data-pk="${id}" style="--c:${p.col}">${PIC[p.ic]}<span><b>${p.name}</b><span>${p.desc}</span></span></button>`}).join('');PKO.hidden=false}
PKO.addEventListener('click',e=>{const b=e.target.closest('[data-pk]');if(b){initAudio();takePerk(b.dataset.pk)}});
