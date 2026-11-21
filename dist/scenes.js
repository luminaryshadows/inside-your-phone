import * as T from './vendor/three-0.187.0.js';

import { buildStudio,displayTexture } from './studio-model.js';

import { studioEnvironment,roundedPlate,cameraIsland,rearCover,titanium,satin,bezel } from './phone-materials.js';

const V = (x, y, z) => new T.Vector3(x, y, z);
const tau = Math.PI * 2;
const material = (color, metalness = .12, roughness = .47) =>
  new T.MeshStandardMaterial({ color, metalness, roughness });
const metal = material(0x9ba9a5, .52), charcoal = material(0x27332f),
  board = material(0x326b57), copper = material(0xe79a55, .48, .33),
  gold = material(0xf0c982, .4), glass = material(0x243838, .25, .22),
  ceramic = material(0xe1dfcb), dark = material(0x151f23);
function mesh(parent, geometry, surface, x=0, y=0, z=0) {
  const obj = new T.Mesh(geometry, surface);
  obj.position.set(x,y,z); parent.add(obj); return obj;
}
function box(parent, w,h,d, surface, x=0,y=0,z=0, radius=.06) {
  return mesh(parent, new T.RoundedBoxGeometry(w,h,d,2,Math.min(radius,h/2,w/2,d/2)),surface,x,y,z);
}
function puck(parent, radius, height, surface, x=0,y=0,z=0) {
  return mesh(parent,new T.CylinderGeometry(radius,radius,height,32),surface,x,y,z);
}
function tube(parent, points, radius, surface) {
  return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points),64,radius,6,false),surface);
}
function loop(parent, w,d, y, surface, thickness=.022) {
  const points=[],r=Math.min(.22,w/4,d/4);
  for(const [x,z,a] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,Math.PI/2],[-w/2+r,-d/2+r,Math.PI],[w/2-r,-d/2+r,3*Math.PI/2]]) {
    for(let j=0;j<=5;j++){
      const t=a+j*Math.PI/10;
      points.push(V(x+r*Math.cos(t),y,z+r*Math.sin(t)));
    }
  }
  const path=new T.CatmullRomCurve3(points,true,'centripetal');
  return mesh(parent,new T.TubeGeometry(path,96,thickness,6,true),surface);
}
function antenna(parent, w,d, y, surface=copper, turns=5) {
  for(let n=0;n<turns;n++) loop(parent,w-n*.094,d-n*.094,y,surface);
}
function badge(parent,text,x,y,z,width,light=false) {
  const image=document.createElement('canvas');
  const c=image.getContext('2d');c.font='600 44px sans-serif';
  image.width=Math.ceil(c.measureText(text).width)+40;image.height=68;
  c.fillStyle=light?'#313131':'#292929';c.roundRect(0,0,image.width,68,14);c.fill();
  c.font='600 44px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#eeeeee';
  c.fillText(text,image.width/2,35);
  const tex=new T.CanvasTexture(image);tex.colorSpace=T.SRGBColorSpace;
  const label=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,depthWrite:false,transparent:true}));
  label.renderOrder=4;label.userData.aspect=image.width/image.height;
  label.userData.height=Math.min(.27,width/label.userData.aspect);
  label.position.set(x,y,z);parent.add(label);return label;
}
function contactShadow(parent,w,d,y) {
  const tex=document.createElement('canvas');tex.width=128;tex.height=128;
  const c=tex.getContext('2d'),shade=c.createRadialGradient(64,64,5,64,64,64);
  shade.addColorStop(0,'rgba(44,54,44,.30)');shade.addColorStop(.6,'rgba(44,54,44,.13)');shade.addColorStop(1,'rgba(44,54,44,0)');
  c.fillStyle=shade;c.fillRect(0,0,128,128);
  const plane=mesh(parent,new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:new T.CanvasTexture(tex),transparent:true,depthWrite:false}),0,y,0);
  plane.rotation.x=-Math.PI/2;
}
function handset(back=true) {
  const phone=new T.Group();
  mesh(phone,roundedPlate(1.94,3.70,.19,.218),titanium);
  mesh(phone,roundedPlate(1.91,3.65,.027,.21),back?satin:bezel,0,.111,0);
  mesh(phone,roundedPlate(1.90,3.65,.024,.21),bezel,0,-.114,0);
  box(phone,.045,.07,.49,metal,-.981,.01,-.55,.02);
  box(phone,.045,.07,.30,metal,.981,.01,-.45,.02);
  if(back){
    cameraIsland(phone,.77).position.y=.117;
    box(phone,1.4,.045,2.04,charcoal,0,.148,.22);
    const winding=new T.Group(); winding.position.z=.22;phone.add(winding);antenna(winding,1.29,1.90,.186,copper,8);winding.name='receiving-coil';
    box(phone,.27,.045,.24,gold,.07,.15,1.34);
  } else {
    const display=mesh(phone,new T.PlaneGeometry(1.81,3.52),new T.MeshBasicMaterial({map:displayTexture(),alphaTest:.48}),0,.134,0);
    display.rotation.x=-Math.PI/2;

  }
  return phone;
}
function terminal() {
  const reader=new T.Group();
  box(reader,2.62,.45,4.03,charcoal,0,0,0,.18);
  box(reader,2.49,.13,3.89,metal,0,.25,0,.14);
  box(reader,2.24,.053,2.34,glass,0,.344,-.52,.12);
  const coil=new T.Group();coil.position.z=-.53;reader.add(coil);antenna(coil,1.64,1.78,.389);
  for(let row=0;row<3;row++)for(let col=0;col<4;col++) {
    box(reader,.43,.09,.24,col===3&&row===2?board:charcoal,(col-1.5)*.53,.365,.90+row*.33);
    box(reader,.12,.012,.025,ceramic,(col-1.5)*.53,.417,.90+row*.33);
  }
  return reader;
}
function fieldLoops(parent) {
  const lines=new T.Group(); parent.add(lines);
  const surface=new T.LineBasicMaterial({color:0xe89855,transparent:true,opacity:.64});
  for(let i=0;i<10;i++){
    const angle=tau*i/10,points=[];
    for(let j=0;j<80;j++){
      const t=tau*j/80,r=1.04+.73*Math.cos(t);
      points.push(V(r*Math.cos(angle),.22+1.05*Math.sin(t),r*Math.sin(angle)));
    }
    lines.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(points),surface));
  }
  return lines;
}

// A single GPU context draws only dirty, visible views. Each chapter retains its own camera.
function mount(renderer,studioRenderer) {
  const views=new Map(),dirty=new Set();
  const environment=studioEnvironment();
  window.addEventListener('phone-display-ready',()=>views.forEach(v=>{if(v.visible)v.refresh()}));
  let pending=0;
  const sizes=new Map();
  function frame(){
    pending=0;
    for(const view of dirty){
      if(!view.visible)continue;
      const {canvas, camera, scene, span, minWidth}=view;
      const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)continue;
      const aspect=w/h, height=Math.max(span,minWidth/aspect);
      camera.left=-height*aspect/2;camera.right=-camera.left;
      camera.top=height/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();
      for(const item of scene.children){
        if(!item.isSprite)continue;
        const labelHeight=Math.max(item.userData.height,19*height/h/camera.zoom);
        item.scale.set(labelHeight*item.userData.aspect,labelHeight,1);
      }
      const device=view.direct || renderer;
      const previous=sizes.get(device);
      if(!previous||w!==previous.w||h!==previous.h){
        device.setSize(w,h,false);sizes.set(device,{w,h});
      }
      device.render(scene,camera);
      if(!view.direct){
        const buffer=device.domElement;
        if(canvas.width!==buffer.width||canvas.height!==buffer.height){canvas.width=buffer.width;canvas.height=buffer.height}
        const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(buffer,0,0);
      }
    }
    dirty.clear();
  }
  function invalidate(view){dirty.add(view);if(!pending)pending=requestAnimationFrame(frame)}
  const visibility=new IntersectionObserver(entries=>{for(const e of entries){const view=views.get(e.target);view.visible=e.isIntersecting;if(view.visible)invalidate(view)}},{rootMargin:'80px'});
  const resize=new ResizeObserver(entries=>entries.forEach(e=>invalidate(views.get(e.target))));
  function view(id,name,{bg,span,minWidth,target,eye,guided=false,passive=false}){
    const canvas=document.getElementById(id);
    canvas.hidden=false;canvas.classList.add('orbitCanvas');canvas.tabIndex=0;
    canvas.setAttribute('aria-label',name+'. Drag to orbit, use arrow keys to rotate, plus and minus to zoom, Home to reset.');
    const scene=new T.Scene();scene.background=new T.Color(bg);scene.environment=environment;scene.environmentIntensity=.92;
    scene.add(new T.HemisphereLight(0xfff9e8,0x899f9b,2.2));
    const sun=new T.DirectionalLight(0xffe7c4,3.25);sun.position.set(-5,9,5);scene.add(sun);
    const rim=new T.DirectionalLight(0xb7d5ef,2.4);rim.position.set(4,4,-6);scene.add(rim);
    const camera=new T.OrthographicCamera(-1,1,1,-1,.02,100);
    camera.position.copy(target).add(eye);
    camera.lookAt(target);
    const direct=guided?studioRenderer:null;
    const v={canvas,camera,scene,span,minWidth,direct,visible:false,refresh:()=>invalidate(v)};
    views.set(canvas,v);visibility.observe(canvas);resize.observe(canvas);
    if(passive){
      canvas.removeAttribute('tabindex');canvas.removeAttribute('aria-label');canvas.classList.remove('orbitCanvas');
      return v;
    }
    if(guided){
      canvas.setAttribute('aria-label','Phone hardware tour. Drag sideways or use the arrow keys to turn the phone. Home resets your rotation.');
      return v;
    }
    const controls=new T.OrbitControls(camera,canvas);controls.target.copy(target);
    canvas.style.touchAction='pan-y';
    // Keep ordinary wheel scrolling native. Alt-wheel and trackpad pinches zoom the model.
    canvas.addEventListener('wheel',e=>{
      if(!e.altKey && !e.ctrlKey)e.stopImmediatePropagation();
    },{capture:true,passive:true});
    canvas.title='Drag sideways to rotate. Pinch or hold Alt and scroll to zoom.';
    controls.enablePan=id==='phone';controls.zoomToCursor=id==='phone';
    controls.minZoom=.72;controls.maxZoom=id==='phone'?12:2.8;
    controls.update();controls.saveState();v.controls=controls;
    controls.addEventListener('change',v.refresh);
    const zoom=ratio=>{camera.zoom=Math.max(controls.minZoom,Math.min(controls.maxZoom,camera.zoom*ratio));camera.updateProjectionMatrix();invalidate(v)};
    canvas.addEventListener('keydown',e=>{
      const actions={ArrowLeft:()=>controls.rotateLeft(.15),ArrowRight:()=>controls.rotateLeft(-.15),
        ArrowUp:()=>controls.rotateUp(.12),ArrowDown:()=>controls.rotateUp(-.12),
        '+':()=>zoom(1.2),'=':()=>zoom(1.2),'-':()=>zoom(1/1.2),Home:()=>controls.reset()};
      if(actions[e.key]){e.preventDefault();actions[e.key]()}
    });
    const bar=document.createElement('div');bar.className='orbitBar';bar.setAttribute('role','group');bar.setAttribute('aria-label',name+' camera');
    const hint=document.createElement('span');hint.textContent=({phone:'Drag to orbit · Tap a layer',payment3D:'Drag to orbit · Tap a stop',sharing3D:'Drag to orbit · Tap the receiver'})[id] || 'Drag to orbit';bar.append(hint);
    for(const [label,fn] of [['−',()=>zoom(1/1.2)],['+',()=>zoom(1.2)],['Reset view',()=>controls.reset()]]){
      const b=document.createElement('button');b.type='button';b.textContent=label;
      b.setAttribute('aria-label',(label==='−'?'Zoom out':label==='+'?'Zoom in':label)+' · '+name);
      b.onclick=fn;bar.append(b);
    }
    canvas.after(bar);return v;
  }
  const hero=view('tapFigure','Tap model',{bg:0x141414,span:5.3,minWidth:5.5,target:V(0,1.12,0),eye:V(5.4,4.7,6)});
  hero.scene.add(terminal());contactShadow(hero.scene,4.4,5.8,-.24);
  const heroPhone=handset();hero.scene.add(heroPhone);const heroCoil=heroPhone.getObjectByName('receiving-coil');
  badge(hero.scene,'Reader coil',-1.67,.35,.85,1.6,true);
  const phoneLabel=badge(hero.scene,'Phone antenna',0,0,0,2.1,true);
  const field=view('field3D','Magnetic field',{bg:0x141414,span:5.1,minWidth:5,target:V(0,.72,0),eye:V(5.1,3.4,6)});
  const tx=new T.Group();field.scene.add(tx);box(tx,2.54,.08,2.54,board);antenna(tx,2.17,2.17,.065);fieldLoops(tx);
  const rx=new T.Group();field.scene.add(rx);const rxCoil=new T.Group();rx.add(rxCoil);antenna(rxCoil,1.56,1.56,.06,gold,8);box(rx,.27,.09,.29,charcoal,.83,.06,.43);
  badge(field.scene,'Reader',-1.65,-.46,.93,1.17);const rxLabel=badge(field.scene,'Phone',0,0,0,1.16);
  function signal(gap,angle,peak,turns=5){
    for(const coil of [rxCoil,heroCoil])coil.children.forEach((loop,i)=>loop.visible=i<turns);
    const rad=angle*Math.PI/180, y=1.48+gap*.19;
    heroPhone.position.set(0,y,-.30);heroPhone.rotation.z=rad;
    phoneLabel.position.set(1.54,y+.55,.10);
    rx.position.y=.80+gap*.21;rx.rotation.z=rad;
    rxLabel.position.set(1.54,rx.position.y+.52,.48);

    hero.refresh();field.refresh();
  }

  const anatomy=view('phone','Phone teardown',{bg:0x141414,span:6.6,minWidth:5.9,target:V(0,1.52,0),eye:V(5.1,3.8,6.8)});
  const layers=componentData.map((part,i)=>{
    const g=new T.Group();g.userData.part=i;anatomy.scene.add(g);
    const w=[2.36,1.94,2.24,2.43][i],d=[4.63,3.53,4.20,4.68][i],h=[.09,.055,.09,.22][i];
    if(i===0){mesh(g,roundedPlate(w,d,.038,.258),satin);g.add(rearCover());cameraIsland(g);return g}
    if(i===3)mesh(g,roundedPlate(w,d,h,.276),titanium);
    else box(g,w,h,d,[metal,charcoal,board,metal][i]);
    const image=document.createElement('canvas');image.width=384;image.height=744;
    const ctx=image.getContext('2d');ctx.translate(192,372);ctx.scale(3,3);paintLayer(ctx,i);
    const map=new T.CanvasTexture(image);map.colorSpace=T.SRGBColorSpace;
    const top=mesh(g,new T.PlaneGeometry(2.46,4.77),new T.MeshStandardMaterial({map,transparent:true,alphaTest:.3,roughness:.55}),0,h/2+(i===3?.028:.004),0);top.rotation.x=-Math.PI/2;
    if(i===2){
      // Preserve the etched package markings when giving the chips physical height.
      for(const [x,y,w,d] of [[-43,-88,46,50],[12,-75,31,36],[-42,-23,39,37],[7,-12,35,29],[-42,29,35,48],[4,28,42,43]]){
        const px=(x+w/2)*2.46/128,pz=(y+d/2)*4.77/248;
        box(g,w*2.46/128,.056,d*4.77/248,charcoal,px,.078,pz,.018);
        const capMap=map.clone();
        capMap.repeat.set(w/128,d/248);capMap.offset.set((x+64)/128,1-(y+124+d)/248);
        const cap=mesh(g,new T.PlaneGeometry(w*2.46/128,d*4.77/248),
          new T.MeshStandardMaterial({map:capMap,metalness:.29,roughness:.51}),px,.107,pz);
        cap.rotation.x=-Math.PI/2;
      }
    }

    if(i===1){antenna(g,1.70,3.10,.067)}
    return g;
  });
  const demo=view('challengePhone','Phone coil and reader',{bg:0x080808,span:6.75,minWidth:6.3,target:V(-.26,1.93,0),eye:V(4.4,4.2,6),passive:true});
  const reader=terminal();reader.scale.setScalar(.98);demo.scene.add(reader);
  const cutaway=new T.Group();demo.scene.add(cutaway);
  const frameLayer=layers[3].clone(),boardLayer=layers[2].clone(),coilLayer=layers[1].clone();
  frameLayer.position.y=-.21;boardLayer.position.y=.04;coilLayer.position.y=.32;
  const cover=layers[0].clone();
  cover.rotation.z=-1.12;cover.position.set(-1.48,1.48,-.26);
  cutaway.add(cover,frameLayer,boardLayer,coilLayer);cutaway.scale.setScalar(.81);
  function challenge(angle){
    const t=angle*Math.PI/180;
    cutaway.rotation.z=-t;cutaway.position.set(0,1.86+.24*Math.sin(t),-.42);
    demo.refresh();
  }
  challenge(Number(document.getElementById('challengeAngle').value));
  const stage=view('studioPhone','Studio phone',{bg:0x080808,span:5.75,minWidth:3.94,target:V(0,0,0),eye:V(0,9,1.8),guided:true});
  const studio=buildStudio(stage,layers,box);
  studio(Number(stage.canvas.dataset.progress || 0));
  let selected=-1,partBadge;
  function teardown(heights,index){
    layers.forEach((layer,i)=>layer.position.y=heights[i]*.020+(3-i)*.035);
    if(index!==selected){
      if(partBadge){anatomy.scene.remove(partBadge);partBadge.material.map.dispose();partBadge.material.dispose()}
      partBadge=badge(anatomy.scene,componentData[index].name,0,0,0,2.35);selected=index;
    }
    partBadge.position.set(1.88,layers[index].position.y+.32,.65);anatomy.refresh();
  }
  function onPick(view, objects, callback){
  const raycaster=new T.Raycaster();let down=null;
  view.canvas.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY,e.pointerId]);
  view.canvas.addEventListener('pointercancel',()=>down=null);
  view.canvas.addEventListener('pointerup',e=>{
    const start=down;down=null;
    if(!start||start[2]!==e.pointerId||Math.hypot(e.clientX-start[0],e.clientY-start[1])>4)return;
    const r=view.canvas.getBoundingClientRect();
    raycaster.setFromCamera(new T.Vector2(2*(e.clientX-r.left)/r.width-1,1-2*(e.clientY-r.top)/r.height),view.camera);
    let obj=raycaster.intersectObjects(objects,true)[0]?.object;
    while(obj&&!objects.includes(obj))obj=obj.parent;
    if(obj)callback(objects.indexOf(obj));
  });

  }
  onPick(anatomy,layers,pick);
  const share=view('sharing3D','Nearby phones',{bg:0x141414,span:4.8,minWidth:7.1,target:V(0,.35,0),eye:V(2.1,4.9,6.9)});
  const sender=handset(false),recipient=handset(false);share.scene.add(sender,recipient);
  sender.scale.setScalar(.65);recipient.scale.setScalar(.65);
  contactShadow(sender,2.8,4.6,-.14);contactShadow(recipient,2.8,4.6,-.14);
  const senderTag=badge(share.scene,'Sender',0,0,0,1.3);
  const receiverTag=badge(share.scene,'Receiver',0,0,0,1.5);
  onPick(share,[recipient],()=>{const button=document.getElementById('shareContact');if(!button.disabled)button.click()});
  const radioLink=box(share.scene,1,.055,.055,copper);
  function sharing(distance,discovered,wifi,accepted){
    const gap=.97+distance*.053;
    sender.position.x=-gap;recipient.position.x=gap;
    senderTag.position.set(-gap,-.16,1.56);receiverTag.position.set(gap,-.16,1.56);
    radioLink.scale.x=gap*2-1.18;radioLink.visible=discovered;
    radioLink.material=accepted?gold:wifi?board:copper;share.refresh();
  }
  const pay=view('payment3D','Payment route',{bg:0x141414,span:5.4,minWidth:8.3,target:V(0,.27,0),eye:V(1.7,5.7,7.8)});
  const locations=[V(-2.55,0,.95),V(-1.05,0,-.92),V(1.05,0,.65),V(2.63,0,-.86)];
  const nodes=[handset(false),terminal(),new T.Group(),new T.Group()];
  nodes.forEach((node,i)=>{
    node.position.copy(locations[i]);pay.scene.add(node);
    if(i<2)node.scale.setScalar(.42);
    badge(pay.scene,['Phone','Reader','Network','Issuer'][i],node.position.x,-.29,node.position.z+.83,1.25);
    if(i)tube(pay.scene,[locations[i-1].clone(),locations[i].clone()],.027,metal);
  });
  for(let i=0;i<3;i++){
    const a=tau*i/3;const pos=V(.48*Math.cos(a),.22,.48*Math.sin(a));
    mesh(nodes[2],new T.SphereGeometry(.175,18,12),gold,pos.x,pos.y,pos.z);
    tube(nodes[2],[V(0,.52,0),pos],.045,copper);
  }
  mesh(nodes[2],new T.SphereGeometry(.22,20,14),copper,0,.52,0);
  box(nodes[3],1.23,.14,1.05,metal);
  for(const x of [-.42,0,.42])puck(nodes[3],.078,.58,ceramic,x,.33,.25);
  box(nodes[3],1.22,.13,1.02,ceramic,0,.69,0);box(nodes[3],.93,.11,.78,metal,0,.80,0);
  onPick(pay,nodes,i=>document.querySelectorAll('#route button')[i].click());
  const token=mesh(pay.scene,new T.SphereGeometry(.095,18,12),new T.MeshBasicMaterial({color:0xffba73}));
  const ring=mesh(pay.scene,new T.TorusGeometry(.74,.023,8,54),copper);ring.rotation.x=-Math.PI/2;
  function payment(progress,current){
    const t=Math.max(0,Math.min(3,Number(progress))),i=Math.floor(t);
    token.position.lerpVectors(locations[i],locations[Math.min(i+1,3)],t-i);token.position.y=.28;
    ring.position.copy(locations[current]);ring.position.y=-.095;pay.refresh();
  }
  for(const device of [renderer,studioRenderer].filter(Boolean))device.domElement.addEventListener('webglcontextrestored',()=>views.forEach(v=>v.refresh()));
  return {challenge,studio,signal,teardown,sharing,payment,resetTeardown:()=>anatomy.controls.reset()};
}

let renderer;
try {
  renderer=new T.WebGLRenderer({antialias:true,alpha:false});
} catch {
  // The existing canvas diagrams and HTML experiments also work on devices without WebGL 2.
}
if(renderer){
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));
  let studioRenderer;
  try {
    studioRenderer=new T.WebGLRenderer({canvas:document.getElementById('studioPhone'),antialias:true,alpha:false});
    studioRenderer.setPixelRatio(renderer.getPixelRatio());
  }catch{/* Keep the shared renderer available when a second context is unavailable. */}
  window.labScenes=mount(renderer,studioRenderer);
  document.documentElement.classList.add('has3D');
  drawSignal();drawSharing();drawPayment();
  selectModel([...parts.children].findIndex(button=>button.getAttribute('aria-pressed')==='true'));
}
