import * as T from './vendor/three-0.187.0.js';

import { roundedPlate,titanium,bezel,gasket } from './phone-materials.js';

let screenMap;
export function displayTexture() {
  return screenMap ??= new T.CanvasTexture(makeScreen());
}
function makeScreen(){
  const image=document.createElement('canvas');image.width=640;image.height=1280;
  const c=image.getContext('2d');c.beginPath();c.roundRect(0,0,640,1280,72);c.clip();
  c.fillStyle='#21343c';c.fillRect(0,0,640,1280);
  const wallpaper=new Image();
  wallpaper.onload=()=>{
    c.drawImage(wallpaper,0,0,640,1280);
    // The display sits behind a cutout and thin cover glass.
    c.fillStyle='#101114';c.beginPath();c.roundRect(259,18,122,31,16);c.fill();
    c.fillStyle='#233244';c.beginPath();c.arc(356,33,6,0,Math.PI*2);c.fill();
    c.fillStyle='#71808a';c.fillRect(354,30,2,1);
    c.fillStyle='#eee9e0';c.textAlign='center';c.font='500 112px Helvetica Neue, Arial, sans-serif';
    c.fillText('09:41',320,253);
    c.beginPath();c.roundRect(250,1254,140,6,3);c.fill();
    screenMap.needsUpdate=true;window.dispatchEvent(new Event('phone-display-ready'));
  };
  wallpaper.src='mineral-wallpaper.webp';
  return image;
}

export function buildStudio(view, layers, box) {
  const turntable=new T.Group(),phone=new T.Group();view.scene.add(turntable);turntable.add(phone);
  const parts=layers.map(layer=>{const copy=layer.clone();phone.add(copy);return copy});
  const screen=new T.Group();phone.add(screen);
  screen.add(new T.Mesh(roundedPlate(2.40,4.68,.042,.272),bezel));
  const face=new T.Mesh(new T.PlaneGeometry(2.31,4.56),
    new T.MeshStandardMaterial({map:displayTexture(),emissiveMap:displayTexture(),emissive:0xffffff,
      emissiveIntensity:.75,color:0x484848,roughness:.14,envMapIntensity:.18,alphaTest:.48}));
  face.rotation.x=Math.PI/2;face.rotation.z=Math.PI;face.position.y=-.034;screen.add(face);
  const rail=parts[3];
  for(const [x,z,len] of [[1.224,-.53,.57],[-1.224,-.72,.35],[-1.224,-.26,.35]]){
    box(rail,.052,.087,len,gasket,x,0,z,.025);
    box(rail,.054,.066,len-.022,titanium,x*1.003,0,z,.022);
  }
  for(const z of [-1.58,1.56])for(const x of [-1.225,1.225])box(rail,.012,.21,.037,gasket,x,0,z,.004);
  box(rail,.39,.075,.018,gasket,0,0,2.355,.027);
  box(rail,.25,.021,.019,titanium,0,0,2.367,.008);
  for(const side of [-1,1])for(let i=0;i<4;i++)box(rail,.043,.047,.014,gasket,side*(.4+i*.086),0,2.355,.016);
  // A separate pivot lets a visitor rotate the model while the tour controls the assembly.
  let drag=null, settleFrame=0;
  const canvas=view.canvas;
  canvas.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0)return;
    cancelAnimationFrame(settleFrame);canvas.setPointerCapture(e.pointerId);
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,roll:turntable.rotation.z,time:e.timeStamp,velocity:0};
  });
  canvas.addEventListener('pointermove',e=>{
    if(drag?.id!==e.pointerId||Math.abs(e.clientX-drag.x)<Math.abs(e.clientY-drag.y))return;
    const next=drag.roll+(e.clientX-drag.x)*.009;
    drag.velocity=Math.max(-8,Math.min(8,(next-turntable.rotation.z)/Math.max(.008,(e.timeStamp-drag.time)/1000)));
    drag.time=e.timeStamp;turntable.rotation.z=next;view.refresh();
  });
  canvas.addEventListener('pointerup',e=>{
    if(drag?.id!==e.pointerId)return;
    const velocity=e.timeStamp-drag.time<90?drag.velocity:0;drag=null;
    if(reducedMotion.matches||!velocity)return;
    const start=turntable.rotation.z,goal=start+velocity*.075,time=performance.now();
    function settle(now){
      const [value,speed]=springStep(start,velocity,goal,(now-time)/1000);
      const moving=!reducedMotion.matches&&(Math.abs(value-goal)>.001||Math.abs(speed)>.01);
      turntable.rotation.z=moving?value:goal;view.refresh();
      if(moving)settleFrame=requestAnimationFrame(settle);
    }
    settleFrame=requestAnimationFrame(settle);
  });
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;
    cancelAnimationFrame(settleFrame);e.preventDefault();
    turntable.rotation.z=e.key==='Home'?0:turntable.rotation.z+(e.key==='ArrowLeft'?-.22:.22);view.refresh();
  });
  return function pose(progress) {
    const position = progress * 4;
    const fraction = start => {
      const t = Math.min(1, Math.max(0, position - start));
      return t*t*(3-2*t);
    };
    phone.rotation.set(.30 - fraction(0)*.69, -.30 + fraction(0)*.71 + fraction(2)*.13,
      Math.PI - .41 - fraction(0)*(Math.PI-.69), 'YXZ');
    screen.position.y = -.143;
    const closeup = fraction(0)-fraction(1);
    phone.scale.setScalar(1+.26*closeup);
    phone.position.z = .64*closeup;
    parts.forEach((part, i) => {
      const lift = fraction(i+1);
      part.visible = lift < .999 && (i!==1 && i!==2 || position>1.015);
      part.position.set(-lift*2.5, ([.163,.058,.004,0][i] + (3-i)*.125*fraction(1)) + lift*2.3, -lift*.66);
      part.rotation.z = lift*.35;
      part.scale.setScalar(1-lift*.99);
    });
    view.refresh();
  };
}
