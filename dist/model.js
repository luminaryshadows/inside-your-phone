// Each component is drawn in its own plane. The projection is shared by hit testing and rendering.
const componentData = [
  {name:'Rear glass', title:'Behind the glass', text:'Lift the back cover to expose the antenna. Materials matter here. A continuous metal sheet near the loop would carry eddy currents that oppose the changing magnetic field.'},
  {name:'NFC antenna', title:'A loop that listens', text:'This copper loop picks up the reader’s changing magnetic field. The changing flux induces a voltage across the loop. Tilt the phone and less of the field passes through it.'},
  {name:'Logic board', title:'From waves to bits', text:'The NFC controller on this board turns changes in the antenna signal into bits. The secure element holds the payment credential and computes a fresh code for each transaction.'},
  {name:'Battery & frame', title:'Power on board', text:'The battery supplies energy to the phone’s electronics. A passive contactless card handles power differently: its own coil can harvest enough energy from the reader to run its chip.'}
];
function roundPath(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function plate(c,x,y,w,h,r,fill,stroke){
  roundPath(c,x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=.9;c.stroke()}
}
function grad(c,x,y,w,h,stops){const g=c.createLinearGradient(x,y,x+w,y+h);for(const [p,v] of stops)g.addColorStop(p,v);return g}
function disk(c,x,y,r,fill,edge){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=.9;c.stroke()}}
function screw(c,x,y){disk(c,x,y,2.4,'#9bada9','#485251');c.strokeStyle='#232b2d';c.lineWidth=1;c.beginPath();c.moveTo(x-1.2,y+.7);c.lineTo(x+1.2,y-.7);c.stroke()}
function camera(c,x,y){
  const rim=grad(c,x-12,y-12,24,24,[[0,'#e2dccc'],[.24,'#414752'],[.58,'#adafba'],[1,'#363943']]);
  disk(c,x,y,12,rim,'#222630');
  const lens=c.createRadialGradient(x,y,1,x,y,10.3);
  for(const [p,col] of [[0,'#030509'],[.2,'#080b10'],[.27,'#26343a'],[.39,'#070b11'],[.46,'#405052'],[.51,'#15202a'],[.78,'#243244'],[.85,'#10151e'],[1,'#04080a']])lens.addColorStop(p,col);
  disk(c,x,y,10.3,lens,'#20252a');
  c.save();c.translate(x,y);c.rotate(-.65);
  for(const [dx,dy,w,h,col] of [[-2,-4,3.6,.7,'#7d98b6'],[2,4,1.5,.5,'#669284']]){
    c.beginPath();c.ellipse(dx,dy,w,h,0,0,2*Math.PI);c.fillStyle=col;c.fill();
  }
  c.restore();
}
function paintLayer(c,i){
  const rim=grad(c,-60,-115,120,230,[[0,'#a4adac'],[.28,'#424c4c'],[.66,'#65706f'],[1,'#bcc2ba']]);
  if(i===0){
    plate(c,-61,-120,122,240,16,grad(c,-61,-120,122,240,[[0,'#414b5b'],[.36,'#65717b'],[.52,'#91989d'],[.67,'#65727e'],[1,'#343c47']]),'#b4c2bd');
    plate(c,-58,-117,116,234,14,null,'#83958f');
    plate(c,-51,-110,54,49,11,grad(c,-51,-110,54,49,[[0,'#bcc7bf'],[1,'#6a7a77']]),'#bcc8c2');
    camera(c,-36,-94);camera(c,-13,-78);disk(c,-14,-99,4.4,'#e1dacf','#627773');disk(c,-37,-75,2.1,'#2c3939');
  } else if(i===1){
    plate(c,-49,-89,98,176,13,'#262b29','#4e5651');
    const copper=grad(c,-49,-89,98,176,[[0,'#d48849'],[.2,'#fabf7f'],[.39,'#a95127'],[.65,'#f2a766'],[.85,'#c2733d'],[1,'#efb171']]);
    for(let j=0;j<8;j++){
      const n=j*2.8;roundPath(c,-45+n,-84+n,90-n*2,165-n*2,Math.max(5,14-j));c.strokeStyle=copper;c.lineWidth=1.8;c.stroke()
    }
    plate(c,-9,80,18,25,2,'#a96331','#d99453');for(let j=0;j<5;j++)plate(c,-6+j*3,94,1.8,8,0,'#f3c67f');
    plate(c,-17,-37,34,73,5,'#303633','#474b42');
  } else if(i===2){
    plate(c,-57,-109,114,211,12,'#355951','#8c9984');
    // Printed traces, via pads and passives sit below the controller packages.
    c.save();roundPath(c,-53,-104,106,201,10);c.clip();
    for(let j=0;j<70;j++){
      let x=((j*37)%100)-51,y=((j*61)%191)-96;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+9,y);c.lineTo(x+16,y+7);c.lineTo(x+16,y+18+(j%12));c.strokeStyle=j%3?'#628879':'#b09558';c.lineWidth=.65;c.stroke();
      disk(c,x,y,1.05,'#c5ab77')
    }
    for(let j=0;j<155;j++){
      let x=((j*47)%103)-51,y=((j*71)%198)-100;
      plate(c,x,y,2+j%3,1.8,0,j%4?'#b3afa0':'#d2ab60')
    }
    c.restore();
    for(const [x,y,w,h,col] of [[-43,-88,46,50,'#949e98'],[12,-75,31,36,'#1f2d2b'],[-42,-23,39,37,'#1d2828'],[7,-12,35,29,'#687675'],[-42,29,35,48,'#82938c'],[4,28,42,43,'#253430']]){
      plate(c,x-2,y-2,w+4,h+4,3,'#a8a38c');plate(c,x,y,w,h,2,col,'#d3d2c3');
      for(let j=3;j<w-3;j+=3){plate(c,x+j,y-3,1,3,0,'#d6c590');plate(c,x+j,y+h,1,3,0,'#d6c590')}
      for(let j=3;j<h-3;j+=3){plate(c,x-3,y+j,3,1,0,'#d6c590');plate(c,x+w,y+j,3,1,0,'#d6c590')}
    }
    c.fillStyle='#b9bab4';c.font='bold 5px sans-serif';c.fillText('NFC',-35,-6);c.fillText('SE',14,43);
    c.font='2.5px monospace';c.fillText('TRANSCEIVER',-36,-1);c.fillText('SECURE IC',12,48);
    for(const [x,y] of [[-36,3],[12,52],[16,-60]]){
      for(let j=0;j<3;j++)plate(c,x,y+j*2,8+(j*5)%11,.45,0,'#afb0a7');
    }
    for(const [x,y] of [[-41,-32],[7,80],[16,-28]]){
      plate(c,x,y,25,6.8,1,'#403d34','#a39261');
      for(let n=0;n<12;n++)plate(c,x+1.6+n*1.85,y+1,.86,4.6,.2,'#d7b781');
    }
    for(const x of [-48,48])for(const y of [-99,89])screw(c,x,y)
  } else {
    plate(c,-62,-121,124,242,17,rim,'#bdc6bf');plate(c,-58,-117,116,234,14,'#343d3c','#7e8c87');
    plate(c,-50,-98,100,178,9,'#232c2c','#99a39f');
    plate(c,-43,-75,86,147,5,grad(c,-43,-75,86,147,[[0,'#586260'],[.15,'#3c4545'],[.76,'#384140'],[1,'#495553']]),'#798680');
    // Foil crimp, insulating film, and a flexible tab at the end of the pouch.
    for(let j=0;j<80;j++)lineFoil(j);
    function lineFoil(j){
      c.beginPath();c.moveTo(-41,-72+j*1.78);c.lineTo(-39+(j%5)*.4,-71+j*1.78);
      c.strokeStyle=j%3?'#656b68':'#303737';c.lineWidth=.65;c.stroke();
    }
    plate(c,5,-101,16,11,1,'#af7544');plate(c,10,-106,18,6,1,'#845732');
    for(let j=0;j<6;j++)plate(c,11+j*2.7,-105,1.1,3.3,.2,'#d6b17d');
    c.fillStyle='#c2c4bd';c.font='bold 6px sans-serif';c.fillText('Li-ion',-34,7);
    c.font='2.6px sans-serif';c.fillText('RECHARGEABLE CELL',-34,14);
    c.fillText('LITHIUM ION POLYMER',-34,19);
    for(let j=0;j<4;j++)plate(c,-34,24+j*2.3,29-j*3,.6,0,'#989e99');
    for(let j=0;j<24;j++)plate(c,-34+j*1.5,51,.5+(j%3)*.22,6,0,'#acb1aa');
    plate(c,-49,84,98,19,4,'#172322','#68746f');
    for(const x of [-53,53])for(const y of [-103,106])screw(c,x,y);
  }
}
function fitCanvas(canvas){const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(window.devicePixelRatio||1,2);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);return {c,w,h}}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function initModel(onPick){
  const canvas=document.getElementById('phone');let selected=1,angle=-.96,target=1,hit=[],drag=null;
  const gaps = [65, 56, 48].map(open => ({ open, height: 5 }));
  // Prepaint the board traces and metalwork once, then transform the layers as a unit.
  const textures = componentData.map((_, i) => {
    const surface = document.createElement('canvas');
    surface.width = 384; surface.height = 744;
    const ctx = surface.getContext('2d');
    ctx.translate(192, 372); ctx.scale(3, 3);
    paintLayer(ctx, i);
    return surface;
  });
  function render(){

    const z = [0, 0, 0, 0];
    for (let i = 2; i >= 0; i--) z[i] = z[i + 1] + gaps[i].height;
    if (window.labScenes) {
      window.labScenes.teardown(z, selected);
      return;
    }
    const {c,w,h}=fitCanvas(canvas);if(!w||!h)return;
    const s=Math.min(w/390,h/337,1.9),co=Math.cos(angle),si=Math.sin(angle),pitch=.44;
    const spread = (z[0] - 15) / 154;
    const cx=w*.475,cy=h*.56 + s*(spread*82-36);
    const project=(x,y,height)=>[cx+s*(co*x-si*y),cy+s*(pitch*(si*x+co*y)-height)];
    c.fillStyle='#3e4746';for(let x=13;x<w;x+=20)for(let y=8;y<h;y+=20){c.beginPath();c.arc(x,y,.7,0,2*Math.PI);c.fill()}
    if(spread>.15){
      c.save();c.setLineDash([3,5]);c.strokeStyle='#606e6880';c.lineWidth=1;
      for(const [x,y] of [[-51,-105],[51,-105],[-51,105],[51,105]]){c.beginPath();c.moveTo(...project(x,y,z[0]));c.lineTo(...project(x,y,z[3]));c.stroke()}c.restore()
    }
    hit=[];
    for(let i=3;i>=0;i--){
      const thickness=[4,2,3,10][i],dims=[[61,120],[49,89],[57,109],[62,121]][i];
      c.save();c.translate(cx,cy-z[i]*s);c.transform(s*co,s*pitch*si,-s*si,s*pitch*co,0,0);
      for(let k=thickness;k>0;k--){c.save();c.translate(si*k/pitch,co*k/pitch);plate(c,-dims[0],-dims[1],dims[0]*2,dims[1]*2,i===1?13:16,k===thickness?'#131b1b':i===1?'#976339':k===2?'#949f9c':'#586461');c.restore()}
      c.drawImage(textures[i], -64, -124, 128, 248);c.restore();
      const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>project(x*dims[0],y*dims[1],z[i]));
      hit.push({i,corners})
    }
    if(spread>.65){
      const i=selected,dims=[[61,120],[49,89],[57,109],[62,121]][i];
      const [x,y]=project(co>0?dims[0]*.68:-dims[0]*.68,si<0?dims[1]*.58:-dims[1]*.58,z[i]);
      const title=['Rear glass','NFC antenna','Logic board','Battery & frame'][i],fs=w<420?11:13;
      c.font='550 '+fs+'px "DM Sans", sans-serif';const tw=c.measureText(title).width;
      const tx=Math.min(w-tw-10,Math.max(w*.73,x+19));const ty=Math.max(18,Math.min(h-10,y-20));
      c.strokeStyle='#f0b27f';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(tx-11,ty+4);c.lineTo(tx+tw,ty+4);c.stroke();disk(c,x,y,2.6,'#ffb276');c.fillStyle='#f4c39e';c.fillText(title,tx,ty)
    }
  }
  const teardown = gsap.timeline({
    paused: true, defaults: { duration: .55, ease: 'power2.inOut' }, onUpdate: render
  });
  gaps.forEach((gap, i) => teardown.to(gap, { height: gap.open }, i * .14));
  teardown.progress(1).pause();
  function explode(open) {
    target = Number(open);
    document.getElementById('assembled').setAttribute('aria-pressed', String(!open));
    document.getElementById('exploded').setAttribute('aria-pressed', String(open));
    if (reducedMotion.matches) teardown.progress(target).pause();
    else if (open) teardown.play();
    else teardown.reverse();
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) teardown.progress(target).pause();
  });
  canvas.addEventListener('pointerdown',e=>{if(window.labScenes)return;canvas.focus({preventScroll:true});drag={x:e.clientX,a:angle,id:e.pointerId,moved:false};canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>4)drag.moved=true;if(drag.moved){angle=drag.a+dx*.012;render()}});
  canvas.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.moved){const r=canvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;for(const {i,corners} of [...hit].reverse()){const cross=corners.map(([a,b],j)=>{const [u,v]=corners[(j+1)%4];return (u-a)*(y-b)-(v-b)*(x-a)});if(cross.every(v=>v>=0)||cross.every(v=>v<=0)){onPick(i);break}}}drag=null});
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('keydown',e=>{if(window.labScenes)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();angle+=e.key==='ArrowLeft'?-.15:.15;render()}});
  document.getElementById('assembled').onclick=()=>explode(false);document.getElementById('exploded').onclick=()=>explode(true);document.getElementById('resetView').onclick=()=>{angle=-.96;window.labScenes?.resetTeardown();explode(true);render()};
  new ResizeObserver(render).observe(canvas);document.fonts.ready.then(render);
  return i=>{selected=i;render()}
}
