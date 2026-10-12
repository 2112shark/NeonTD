// End of a run: star conditions, rewards, records.
import type { StarCond } from '../data/campaign.ts';
import { PROG } from '../meta/progress.ts';
import { saveProg } from '../meta/net.ts';
import { S } from './state.ts';
import { unlock } from '../meta/achievements.ts';
import { TYPES } from '../data/towers.ts';
import { MISSIONS } from '../data/campaign.ts';
import { dailyScore, dayKey } from '../meta/daily.ts';
import { mastLv } from '../meta/mastery.ts';
import { XP_DAILY, XP_WAVE, addXP } from '../meta/season.ts';
import { weeklyEnd } from '../meta/weekly.ts';
import { snd } from '../audio/sfx.ts';
import { PKO } from '../ui/perkChoice.ts';
import { qev } from '../meta/quests.ts';
import { closeRadial } from '../ui/radial.ts';
import { updInfo } from '../ui/info.ts';
import { lobbyOn, vib } from '../ui/lobby/shared.ts';
import { showResults } from '../ui/results.ts';

/** number of stars in a 3-bit mask */
export const popc=(n: number)=>(n&1)+(n>>1&1)+(n>>2&1);
export function starOk(c: StarCond){switch(c.k){
  case'lives':return S.coreHp?S.coreHp.every(h=>h>=c.n):S.lives>=c.n;
  case'noabil':return !S.abilUsed;
  case'nosell':return !S.sold;
  case'flawless':return S.lost===0;
  case'types':return S.built.size<=c.n;
  case'towers':return S.peak<=c.n;
  case'boss':return S.bossT!=null&&S.bossT<=c.n;
  case'early':return S.early>=c.n;
}return false}
export function endGame(won: boolean){
  if(S.over)return;S.over=true;S.won=won;closeRadial();S.aim=null;S.perkPick=null;PKO.hidden=true;
  let stars=0,mask=0,newMask=0,first=false,score=0,best=0,newBest=false;const M=S.mis;
  if(S.flow){PROG.waves+=S.wave;qev('wave',S.wave);addXP(XP_WAVE*S.wave)}
  if(S.daily){score=dailyScore(won);
    if(S.mode==='daily'){const k=S.daily.key;if(!PROG.daily||PROG.daily.key!==k)PROG.daily={key:k,best:0,won:false};
      newBest=score>PROG.daily.best;PROG.daily.best=Math.max(PROG.daily.best,score);best=PROG.daily.best;
      if(won){qev('dwin',1);if(!PROG.daily.won){PROG.daily.won=true;PROG.dailyWins=(PROG.dailyWins||0)+1;unlock('daily');addXP(XP_DAILY);
        const y=dayKey(new Date(Date.now()-864e5)),st=PROG.streak||{last:'',n:0};st.n=st.last===y?st.n+1:st.last===k?st.n:1;st.last=k;PROG.streak=st;if(st.n>=3)unlock('streak3')}}}
    else if(typeof weeklyEnd==='function'){const r=weeklyEnd(score,won);best=r.best;newBest=r.newBest}}
  if(M&&won){
    mask=1;if(starOk(M.s2))mask|=2;if(starOk(M.s3))mask|=4;
    const key=(S.nm?'n':'')+M.id,old=PROG.ms[key]||0;newMask=mask&~old;first=!old;
    PROG.ms[key]=old|mask;PROG.stars[key]=popc(PROG.ms[key]);stars=popc(mask);
    PROG.st.mis=(PROG.st.mis||0)+1;if(S.nm)PROG.st.nm=(PROG.st.nm||0)+1;addXP(40+20*popc(newMask)+(S.nm?40:0));
    qev('mwin',1);
    unlock('win');if(S.lost===0)unlock('flawless');if(S.nm)unlock('hard');
    if(MISSIONS.filter(m=>PROG.ms['n'+m.id]).length>=5)unlock('nm5');
    if(!S.sold)unlock('nosell');if(S.built.has('laser')&&[...S.built].every(k=>k==='laser'||k==='cryo'))unlock('lasers');
    if(MISSIONS.filter(m=>m.ch===0).every(m=>PROG.ms[m.id]))unlock('ch1');
    if(MISSIONS.filter(m=>m.ch===1).every(m=>PROG.ms[m.id]))unlock('ch2');
    if(MISSIONS.every(m=>PROG.ms[m.id]))unlock('winall');
    if(MISSIONS.every(m=>PROG.ms[m.id]===7))unlock('allstars');
  }
  S.mastUp=TYPES.filter(k=>mastLv(k)>S.mast0[k]).map(k=>[k,mastLv(k)]);if(TYPES.some(k=>mastLv(k)>=5))unlock('mastery5');
  saveProg();snd(won?'win':'lose');
  if(!won)vib(140);
  setTimeout(()=>{if(!lobbyOn())showResults({won,stars,mask,newMask,first,score,best,newBest})},900);
  updInfo(true);
}
const starStr=(n: number)=>'★'.repeat(n)+'<i>'+'★'.repeat(3-n)+'</i>';
