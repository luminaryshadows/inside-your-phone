import * as T from './vendor/three-0.187.0.js';

// Softbox reflections supply the bright and dark bands that describe a polished edge.
export function studioEnvironment() {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const c=canvas.getContext('2d');
  c.fillStyle='#24272d';c.fillRect(0,0,512,256);
  for(const [x,y,w,h,colour] of [[28,54,96,87,'#ffeddb'],[234,52,16,120,'#ffffff'],
    [361,70,65,74,'#dcecff'],[426,62,5,98,'#ffffff'],[124,106,90,105,'#08090b']]){
    c.fillStyle=colour;c.fillRect(x,y,w,h);
  }
  const tex=new T.CanvasTexture(canvas);tex.mapping=T.EquirectangularReflectionMapping;tex.colorSpace=T.SRGBColorSpace;
  return tex;
}

const finish=(color,metalness,roughness)=>new T.MeshStandardMaterial({color,metalness,roughness});
export const titanium=finish(0x898d93,.94,.27), satin=finish(0x434b55,.45,.38),
  bezel=finish(0x101217,.62,.19), gasket=finish(0x171a20,.12,.62);
const alloy=finish(0xb4b8bf,.98,.19), optic=finish(0x111827,.38,.1);

export function roundedPlate(width,length,thickness,radius) {
  const shape=new T.Shape(),x=width/2,y=length/2,r=radius;
  shape.moveTo(-x+r,-y);shape.lineTo(x-r,-y);shape.quadraticCurveTo(x,-y,x,-y+r);
  shape.lineTo(x,y-r);shape.quadraticCurveTo(x,y,x-r,y);
  shape.lineTo(-x+r,y);shape.quadraticCurveTo(-x,y,-x,y-r);
  shape.lineTo(-x,-y+r);shape.quadraticCurveTo(-x,-y,-x+r,-y);
  const bevel=Math.min(.021,thickness*.24);
  const geo=new T.ExtrudeGeometry(shape,{depth:thickness,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:10});
  geo.translate(0,0,-thickness/2);geo.rotateX(-Math.PI/2);return geo;
}

let lensCoating;
function lensSurface() {
  if(lensCoating)return lensCoating;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d'),g=c.createRadialGradient(128,128,7,128,128,126);
  for(const [p,col] of [[0,'#020409'],[.19,'#03060a'],[.23,'#23323c'],[.31,'#080d16'],[.42,'#162d38'],[.47,'#455959'],[.51,'#080e18'],[.74,'#142438'],[.79,'#273546'],[.94,'#08090b'],[1,'#59616a']])g.addColorStop(p,col);
  c.fillStyle=g;c.fillRect(0,0,256,256);
  c.translate(128,128);c.rotate(-.66);
  for(const [x,y,rx,ry,col] of [[-23,-51,48,10,'rgba(114,167,225,.28)'],[-33,-61,30,4,'rgba(209,226,255,.65)'],[31,47,21,6,'rgba(91,176,148,.52)']]){
    c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
  }
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  lensCoating=new T.MeshStandardMaterial({map:tex,roughness:.17,metalness:.14,envMapIntensity:.45});
  return lensCoating;
}
// A frosted back picks up a broad reflection across its plane; the rail remains polished.
export function rearCover() {
  const img=document.createElement('canvas');img.width=256;img.height=512;
  const c=img.getContext('2d'),g=c.createLinearGradient(0,512,250,20);
  for(const [p,col] of [[0,'#343b46'],[.29,'#5f6c7a'],[.48,'#90979b'],[.6,'#616b75'],[1,'#39414d']])g.addColorStop(p,col);
  c.fillStyle=g;c.fillRect(0,0,256,512);
  const pixels=c.getImageData(0,0,256,512);let seed=327;
  for(let j=0;j<pixels.data.length;j+=4){
    seed=(Math.imul(1664525,seed)+1013904223)>>>0;
    const grit=(seed/4294967296-.5)*7;
    for(let k=0;k<3;k++)pixels.data[j+k]+=grit;
  }
  c.putImageData(pixels,0,0);
  c.globalCompositeOperation='destination-in';c.beginPath();c.roundRect(0,0,256,512,29);c.fill();
  const tex=new T.CanvasTexture(img);tex.colorSpace=T.SRGBColorSpace;
  const m=new T.MeshStandardMaterial({map:tex,metalness:.38,roughness:.36,alphaTest:.45});
  const panel=new T.Mesh(new T.PlaneGeometry(2.36,4.63),m);panel.rotation.x=-Math.PI/2;panel.position.y=.031;return panel;
}

export function cameraIsland(parent,scale=1) {
  const cluster=new T.Group();cluster.scale.setScalar(scale);parent.add(cluster);
  const body=new T.Mesh(roundedPlate(1.02,.99,.078,.20),satin);
  body.position.set(-.46,.064,-1.62);cluster.add(body);
  const disc=(r,h,s,x,y,z)=>{
    const m=new T.Mesh(new T.CylinderGeometry(r,r,h,48),s);m.position.set(x,y,z);cluster.add(m);
  };
  for(const [x,z] of [[-.69,-1.80],[-.25,-1.49]]){
    disc(.229,.094,alloy,x,.147,z);disc(.214,.021,bezel,x,.201,z);
    disc(.186,.012,optic,x,.212,z);
    disc(.178,.003,lensSurface(),x,.221,z);
  }
  disc(.085,.017,alloy,-.267,.120,-1.91);disc(.068,.018,finish(0xe2d6ae,.14,.35),-.267,.133,-1.91);
  disc(.028,.015,gasket,-.72,.119,-1.43);
  return cluster;
}
