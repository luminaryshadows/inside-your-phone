import {createElement as el, createRoot, useLayoutEffect, useState} from './vendor/react-dom-19.3.1.js';

const stops = [
  {name:'Display', title:'Light you can touch.', image:'display', alt:'Front glass and illuminated OLED display',
   text:'Look at the bright crest and the dark trough on the screen. Each OLED pixel produces its own light, so neighbouring pixels can differ sharply in brightness. A separate grid of transparent electrodes detects the change in capacitance under your fingertip.'},
  {name:'Camera', title:'A photograph starts as charge.', image:'camera', alt:'Rear camera lenses in the upper corner of the housing',
   text:'The glass circles on the back are the entrances to two cameras. Inside each module, a lens focuses light onto a CMOS sensor. Tiny photodiodes collect charge during the exposure. The phone reads those charges and processes the samples into a photograph.'},
  {name:'NFC coil', title:'A radio made from a loop.', image:'coil', alt:'Copper antenna windings beneath the rear shell',
   text:'Follow the copper track around the back of the phone. When a payment reader’s magnetic field changes, it induces a voltage between the ends of this loop. The NFC controller measures changes in the signal. Turning the loop edge-on weakens the link.'},
  {name:'Logic board', title:'Where a tap becomes data.', image:'board', alt:'Logic board with chips, copper traces and contacts',
   text:'Copper traces connect the chips on this board. The main processor runs apps, RAM holds their working data, and flash storage keeps photos after power is off. During a payment, a separate secure element protects the credential and generates transaction-specific data.'},
  {name:'Battery', title:'Energy beneath the frame.', image:'battery', alt:'Lithium-ion pouch cell mounted inside the phone frame',
   text:'The broad pouch inside the frame stores chemical energy. As it discharges, lithium ions move through the cell while electrons flow through the phone’s circuits. Power regulators supply the different voltages the screen, processor and radios need.'}
];
const track = document.getElementById('studio');
const pin = track.querySelector('.studioPin');
const canvas = document.getElementById('studioPhone');
const poster = document.getElementById('studioPoster');
const experimentLink = track.querySelector('.studioSkip');
const experiments = [
  ['tap-intro','Try the tap experiment'], ['camera','Test camera exposure'],
  ['signal','Test the coil signal'], ['anatomy','Explore the teardown'], ['battery','Estimate battery life']
];
const isPinned = () => getComputedStyle(pin).position === 'sticky';
const clamp = n => Math.max(0, Math.min(1, n));

const frames = document.getElementById('tourFrames');
const cache = new Map();
let desiredFrame=0, paintFrame=0, interactive=false;
let drawnIndex=-1, direction=1;
function paintSequence(){
  paintFrame=0;
  if(interactive||!isPinned())return;
  let nearest=-1, distance=Infinity;
  for(const [strip,image] of cache){
    if(!image.naturalWidth)continue;
    const index=Math.min(Math.max(desiredFrame,strip*6),Math.min(120,strip*6+5));
    if(Math.abs(desiredFrame-index)<distance){nearest=index;distance=Math.abs(desiredFrame-index)}
  }
  if(nearest<0)return;
  const image=cache.get(Math.floor(nearest/6));
  const rect=frames.parentElement.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(frames.width!==w||frames.height!==h){frames.width=w;frames.height=h}
  else if(nearest===drawnIndex&&!frames.hidden)return;
  drawnIndex=nearest;
  const c=frames.getContext('2d'),scale=Math.min(h/520,w/(520*3.94/5.75));
  c.fillStyle='#080808';c.fillRect(0,0,w,h);
  c.drawImage(image,(nearest%6)*658,0,658,728,(w-470*scale)/2,(h-520*scale)/2,470*scale,520*scale);
  frames.hidden=false;
}
function queuePaint(){if(!paintFrame)paintFrame=requestAnimationFrame(paintSequence)}
function loadStrip(i){
  if(i<0||i>20||cache.has(i))return;
  const image=new Image();cache.set(i,image);
  image.decoding='async';image.onload=queuePaint;
  image.onerror=()=>{cache.delete(i);if(i===Math.floor(desiredFrame/6)){frames.hidden=true;window.labScenes?.studio(desiredFrame/120)}};
  image.src='turntable/strip-'+String(i).padStart(2,'0')+'.webp';
}
function scrub(progress){
  if(interactive||!isPinned()){frames.hidden=true;window.labScenes?.studio(progress);return}
  const index=Math.round(progress*120);
  const strip=Math.floor(index/6);
  if(index===desiredFrame&&cache.has(strip)&&!frames.hidden)return;
  direction=index>=desiredFrame?1:-1;
  desiredFrame=index;
  for(const key of cache.keys())if(Math.abs(key-strip)>1)cache.delete(key);
  loadStrip(strip);loadStrip(strip+direction);queuePaint();
}
function engage(){
  if(!window.labScenes||interactive)return;
  interactive=true;frames.hidden=true;window.labScenes.studio(Number(canvas.dataset.progress||0));
}
let touchStart;
canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch')touchStart={x:e.clientX,y:e.clientY};else engage();
});
canvas.addEventListener('pointermove',e=>{
  if(!touchStart)return;
  const dx=Math.abs(e.clientX-touchStart.x),dy=Math.abs(e.clientY-touchStart.y);
  if(dx>5&&dx>dy){engage();touchStart=null}
});
for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>touchStart=null);
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key))engage()});
new ResizeObserver(queuePaint).observe(frames.parentElement);

function Tour() {
  const [active, setActive] = useState(0);
  const [controller] = useState(() => ({trigger:null, progress:-1}));
  function show(progress) {
    if (progress === controller.progress) return;
    controller.progress = progress;
    canvas.dataset.progress = String(progress);
    scrub(progress);
    const index = Math.round(progress*(stops.length-1));
    const stop = stops[index];
    if (poster.dataset.step !== stop.image) {
      poster.dataset.step = stop.image;
      if (!window.labScenes) poster.src = 'studio-'+stop.image+'.webp';
      poster.alt = stop.alt;
      const [chapter,label]=experiments[index];
      const url=new URL(location.href);url.hash='';url.searchParams.set('chapter',chapter);
      experimentLink.dataset.chapterLink=chapter;experimentLink.href=url.href;
      experimentLink.firstChild.textContent=label+' ';
      setActive(index);
    }
  }
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    function configure() {
      controller.trigger?.kill(); controller.trigger = null;
      const prior=clamp(controller.progress);
      controller.progress=-1;
      if (!isPinned()) { show(Math.round(prior*4)/4); return; }
      controller.trigger = ScrollTrigger.create({
        trigger:track, start:'top top',
        end:()=>'+='+Math.max(1,track.offsetHeight-pin.offsetHeight),
        onUpdate:t=>show(t.progress), onRefresh:t=>show(t.progress)
      });
      show(controller.trigger.progress);
    }
    configure();
    const layout = new ResizeObserver(() => { if (Boolean(controller.trigger) !== isPinned()) configure(); });
    layout.observe(track);
    return () => { layout.disconnect(); controller.trigger?.kill(); };
  }, []);
  function select(index) {
    const progress = index/(stops.length-1), trigger=controller.trigger;
    if (trigger) window.scrollTo({top:trigger.start + progress*(trigger.end-trigger.start),behavior:'instant'});
    show(progress);
  }
  return el('div',{className:'tourControls'},
    el('div',{key:stops[active].image,className:'tourCopy',id:'tourCaption'},
      el('h2',null,stops[active].title),el('p',null,stops[active].text)),
    el('div',{className:'tourStops',role:'group','aria-label':'Choose a phone component'},
      stops.map((s,i)=>el('button',{key:s.image,type:'button','aria-pressed':i===active,
        'aria-controls':'tourCaption',onClick:()=>select(i)},s.name))),
    el('p',{className:'tourHint'},'Choose a part or scroll to explore.')
  );
}
createRoot(document.getElementById('tourUI')).render(el(Tour));
