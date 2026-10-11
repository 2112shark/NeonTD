// Ability definitions and cooldowns.
import { S } from '../core/state.js';
import { lab } from '../meta/lab.js';

export const AB={orbital:{name:'Орбитальный удар',cd:40},emp:{name:'ЭМИ',cd:55},shield:{name:'Щит ядра',cd:80}};
export const abCd=k=>AB[k].cd*(1-.15*lab('cd'))*(S&&S.perks&&S.perks.includes('cd')?.7:1);
