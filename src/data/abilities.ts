// Ability definitions and cooldowns.
import { S } from '../core/state.ts';
import { lab } from '../meta/lab.ts';

export type AbilityId='orbital'|'emp'|'shield';
export const AB: Record<AbilityId, { name: string; cd: number }>={orbital:{name:'Орбитальный удар',cd:40},emp:{name:'ЭМИ',cd:55},shield:{name:'Щит ядра',cd:80}};
export const abCd=(k: AbilityId)=>AB[k].cd*(1-.15*lab('cd'))*(S&&S.perks&&S.perks.includes('cd')?.7:1);
