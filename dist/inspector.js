(() => {
  const dialog = $('macro'), canvas = $('macroCanvas'), features = $('macroFeature');
  // Coordinates use the same units as paintLayer, so the artwork scales at any magnification.
  const partsDetail = [
    {slug:'rear-glass', features:[['Upper lens',-36,-94,7,'The curved elements behind this opening focus light onto the image sensor.'],['Lower lens',-13,-78,7,'This second opening belongs to a separate lens and sensor. Each camera collects its own image.'],['Flash',-14,-99,9,'The LED supplies light during a short exposure so the sensor can collect more charge.'],['Back cover',0,28,2,'The rear glass protects the assembly while allowing the reader’s magnetic field to reach the coil.']]},
    {slug:'nfc-antenna', features:[['Copper windings',-35,-47,5,'These turns are connected in series. The voltage induced around each turn adds to the voltage at the contacts.'],['Antenna contacts',0,95,8,'These contacts carry the voltage from the ends of the loop to the NFC electronics.'],['Loop centre',0,0,3,'Magnetic flux crosses the area inside the loop. Tilting that area changes the induced voltage.']]},
    {slug:'logic-board', features:[['NFC controller',-23,-5,5,'This chip detects changes in the received signal and recovers the transmitted data.'],['Secure element',25,48,5,'This chip protects the payment credential and generates transaction-specific data.'],['Copper traces',-23,20,8,'These narrow copper paths carry signals and power between board components.'],['Mounting screw',48,89,10,'The fastener holds the board against its support so the connectors stay aligned.']]},
    {slug:'battery-frame', features:[['Lithium-ion cell',0,-10,2,'The pouch encloses electrodes and electrolyte. During discharge, electrons travel through the external circuit.'],['Cell marking',-24,12,6,'The printed marking identifies the cell chemistry. The silver pouch seals the electrode stack.'],['Lower frame',0,93,5,'This part of the chassis supports the assembly and protects the battery pouch from movement.'],['Frame screw',53,106,10,'This fastener holds the assembly together and lets the frame carry mechanical loads.']]}
  ];
  const openButton = $('inspectOpen'), zoomLabel = $('macroLevel');
  const limit = (n,min,max) => Math.max(min,Math.min(max,n));
  let index=0, frame=0, lastTime=0, morph=null, ownsEntry=false, closing=false;
  let pose=[0,0,1], goal=[0,0,1], velocity=[0,0,0];
  const pointers=new Map();
  function baseScale(){return Math.min(canvas.clientWidth/150,canvas.clientHeight/270)}
  let cachedPart=-1, texture;
  function draw(moving=false){
    if(!dialog.open)return;
    const {c,w,h}=fitCanvas(canvas), scale=baseScale()*pose[2];
    c.translate(w/2,h/2);c.scale(scale,scale);c.translate(-pose[0],-pose[1]);
    if(moving===true||pointers.size){
      if(cachedPart!==index){
        texture=document.createElement('canvas');texture.width=768;texture.height=1488;
        const brush=texture.getContext('2d');brush.scale(6,6);brush.translate(64,124);paintLayer(brush,index);
        cachedPart=index;
      }
      c.drawImage(texture,-64,-124,128,248);
    }else paintLayer(c,index);
    zoomLabel.value=Number(pose[2].toFixed(1))+'×';
    $('macroMinus').disabled=goal[2]<=1; $('macroPlus').disabled=goal[2]>=12;
  }
  function tick(time){
    frame=0;
    const dt=Math.min(.08,Math.max(0,(time-lastTime)/1000));lastTime=time;
    let moving=false;
    for(let i=0;i<3;i++){
      [pose[i],velocity[i]]=springStep(pose[i],velocity[i],goal[i],dt);
      if(Math.abs(pose[i]-goal[i])>.002 || Math.abs(velocity[i])>.02)moving=true;
    }
    if(!moving||reducedMotion.matches){pose=[...goal];velocity=[0,0,0]}
    draw(moving&&!reducedMotion.matches);if(moving&&!reducedMotion.matches&&dialog.open)frame=requestAnimationFrame(tick);
  }
  function aim(x,y,z,immediate=false){
    goal=[limit(x,-62,62),limit(y,-121,121),limit(z,1,12)];
    if(immediate||reducedMotion.matches){cancelAnimationFrame(frame);frame=0;pose=[...goal];velocity=[0,0,0];draw()}
    else if(!frame){lastTime=performance.now();frame=requestAnimationFrame(tick)}
  }
  function freeView(){features.value='free';$('featureNote').textContent=''}
  function zoom(ratio,x=0,y=0){
    if(x||y||features.value==='')freeView();
    const z=limit(goal[2]*ratio,1,12), delta=(1/goal[2]-1/z)/baseScale();
    aim(goal[0]+x*delta,goal[1]+y*delta,z);
  }
  function point(e){
    const r=canvas.getBoundingClientRect();
    return {x:e.clientX-r.left-r.width/2,y:e.clientY-r.top-r.height/2};
  }
  // A single pointer pans. Two pointers keep the artwork beneath the pinch midpoint.
  function gesture(){
    const [a,b]=pointers.values();
    return b?{x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))}:{...a,d:1};
  }
  let lastMove=0, release=[0,0];
  canvas.onpointerdown=e=>{
    if(e.button!==0||pointers.size>=2)return;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId,point(e));aim(...pose,true);release=[0,0];lastMove=performance.now();
  };
  canvas.onpointermove=e=>{
    if(!pointers.has(e.pointerId))return;
    const a=gesture();pointers.set(e.pointerId,point(e));const b=gesture();
    const z=limit(pose[2]*b.d/a.d,1,12),base=baseScale(),now=performance.now(),dt=Math.max(.008,(now-lastMove)/1000);
    const x=(a.x/pose[2]-b.x/z)/base,y=(a.y/pose[2]-b.y/z)/base;
    if(x||y||z!==pose[2])freeView();
    aim(pose[0]+x,pose[1]+y,z,true);
    release=[limit(x/dt,-450,450),limit(y/dt,-450,450)];lastMove=now;
  };
  function end(e){
    if(!pointers.delete(e.pointerId))return;
    if(!pointers.size && e.type==='pointerup' && performance.now()-lastMove<90){
      velocity=[...release,0];aim(pose[0]+release[0]*.07,pose[1]+release[1]*.07,pose[2]);
    }
    if(!pointers.size&&!frame)draw();
    release=[0,0];
  }
  canvas.onpointerup=end;canvas.onpointercancel=end;canvas.onlostpointercapture=end;
  canvas.addEventListener('wheel',e=>{e.preventDefault();const p=point(e),units=e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1;zoom(Math.exp(-limit(e.deltaY*units,-240,240)*.003),p.x,p.y)},{passive:false});
  canvas.ondblclick=e=>{const p=point(e);zoom(goal[2]>=11?1/goal[2]:2,p.x,p.y)};
  $('macroPlus').onclick=()=>zoom(1.5);$('macroMinus').onclick=()=>zoom(1/1.5);
  function fit(){features.value='';$('featureNote').textContent='';aim(0,0,1)}
  $('macroFit').onclick=fit;
  canvas.onkeydown=e=>{
    const step=24/goal[2];
    const actions={ArrowLeft:()=>aim(goal[0]-step,goal[1],goal[2]),ArrowRight:()=>aim(goal[0]+step,goal[1],goal[2]),
      ArrowUp:()=>aim(goal[0],goal[1]-step,goal[2]),ArrowDown:()=>aim(goal[0],goal[1]+step,goal[2]),
      Home:fit,'+':()=>zoom(1.5),'=':()=>zoom(1.5),'-':()=>zoom(1/1.5)};
    if(actions[e.key]){e.preventDefault();if(e.key.startsWith('Arrow'))freeView();actions[e.key]()}
  };
  features.onchange=()=>{
    if(features.value===''){fit();return}
    const [,x,y,z,note]=partsDetail[index].features[Number(features.value)];$('featureNote').textContent=note;aim(x,y,z);
  };
  new ResizeObserver(draw).observe(canvas);
  function routeIndex(){return partsDetail.findIndex(p=>location.hash==='#inspect/'+p.slug)}
  function sync(animate=true){
    closing=false;
    const next=routeIndex(),opening=next>=0;
    if(!opening&&!dialog.open)return;
    const i=opening?next:index, thumb=parts.children[i].querySelector('canvas');
    const source=opening?thumb:canvas,destination=opening?canvas:thumb;
    const from=source.getBoundingClientRect();
    function update(){
      if(opening){
        index=next;pick(index);$('featureNote').textContent='';$('macroTitle').textContent=componentData[index].name;
        const free=new Option('Free view','free');free.hidden=true;free.disabled=true;
        features.replaceChildren(new Option('Whole component',''),free,...partsDetail[index].features.map(([name],i)=>new Option(name,String(i))));
        if(!dialog.open)dialog.showModal();aim(0,0,1,true);canvas.focus({preventScroll:true});
      }else{
        cancelAnimationFrame(frame);frame=0;pointers.clear();dialog.close();openButton.focus({preventScroll:true});
      }
    }
    if(morph){morph.skipTransition();update();return}
    if(!animate||reducedMotion.matches||!document.startViewTransition){update();return}
    const root=document.documentElement,name='component-closeup';root.classList.add('macroMorph');
    source.style.viewTransitionName=name;
    const transition=document.startViewTransition(()=>{source.style.viewTransitionName='';if(routeIndex()!==next)return;update();destination.style.viewTransitionName=name});
    morph=transition;
    transition.ready.then(()=>{
      const to=destination.getBoundingClientRect();
      if(!to.width||!from.width)return;
      const k=Math.min(from.width/to.width,from.height/to.height);
      const x=from.x+(from.width-to.width*k)/2,y=from.y+(from.height-to.height*k)/2;
      root.animate([{transform:'translate('+x+'px,'+y+'px) scale('+k+')'},
        {transform:'translate('+to.x+'px,'+to.y+'px) scale(1)'}],
        {pseudoElement:'::view-transition-group('+name+')',duration:650,easing:getComputedStyle(root).getPropertyValue('--spring-ease')});
    }).catch(()=>{});
    transition.finished.finally(()=>{source.style.viewTransitionName='';destination.style.viewTransitionName='';root.classList.remove('macroMorph');morph=null});
  }
  openButton.onclick=()=>{
    const i=[...parts.children].findIndex(b=>b.getAttribute('aria-pressed')==='true');
    const url=new URL(location.href);url.hash='inspect/'+partsDetail[i].slug;
    history.pushState({...history.state,inspector:true},'',url);ownsEntry=true;sync();
  };
  function close(){
    if(closing)return;closing=true;
    if(ownsEntry){history.back();return}
    const url=new URL(location.href);url.hash='';url.searchParams.set('chapter','anatomy');history.replaceState(history.state,'',url);sync();
  }
  $('macroClose').onclick=close;
  dialog.oncancel=e=>{e.preventDefault();close()};
  window.addEventListener('popstate',e=>{
    if(!dialog.open&&routeIndex()<0)return;
    e.stopImmediatePropagation();ownsEntry=!!history.state?.inspector;sync();
  },true);
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)morph?.skipTransition()});
  if(routeIndex()>=0)window.addEventListener('load',()=>{ownsEntry=!!history.state?.inspector;sync(false)},{once:true});
})();
