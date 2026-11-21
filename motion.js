// Unit mass, stiffness 150, damping 20. Exact damped spring step in seconds.
function springStep(value, velocity, goal, seconds) {
  const offset = value - goal, frequency = Math.sqrt(50);
  const cosine = Math.cos(frequency * seconds), sine = Math.sin(frequency * seconds);
  const decay = Math.exp(-10 * seconds);
  return [goal + decay * (offset*cosine + (velocity+10*offset)*sine/frequency),
    decay * (velocity*cosine - (10*velocity+150*offset)*sine/frequency)];
}
const springEase = t => t === 1 ? 1 : springStep(0,0,1,t*.85)[0];
if(typeof module!=='undefined' && module.exports) module.exports={springStep};
if(typeof document!=='undefined') document.documentElement.style.setProperty('--spring-ease','linear('+
  Array.from({length:41},(_,i)=>springEase(i/40).toFixed(5)).join(',')+')');
