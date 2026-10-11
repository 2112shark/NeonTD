// Toasts and operator transmissions.
import { $ } from '../core/util.js';
import { S } from '../core/state.js';

let toastH;
export function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastH);toastH=setTimeout(()=>t.classList.remove('show'),2400)}

/* operator transmissions */
const COM=$('#comms'),COMT=$('#commsT'),STG=$('#stage');const comQ=[];let comBusy=false,comH=0;
export function say(t){if(!t||!S)return;if(comQ.includes(t)||(comBusy&&COMT.textContent===t))return;comQ.push(t);if(comQ.length>3)comQ.shift();if(!comBusy)nextComm()}
function nextComm(){const t=comQ.shift();clearTimeout(comH);
  if(!t){comBusy=false;COM.hidden=true;STG.classList.remove('comm');return}
  comBusy=true;COMT.textContent=t;COM.hidden=false;STG.classList.add('comm');COM.classList.remove('in');void COM.offsetWidth;COM.classList.add('in');
  comH=setTimeout(nextComm,Math.max(3400,t.length*58))}
export function hideComms(){comQ.length=0;clearTimeout(comH);comBusy=false;COM.hidden=true;STG.classList.remove('comm')}
