// An orthographic cutaway, with vertical separation enlarged to make the two coils visible.
function drawTapFigure(distance, tilt, peak, turns=5) {
  const { c, w, h } = fitCanvas(document.getElementById('tapFigure'));
  if (!w || !h) return;
  const scale = Math.min(w / 530, h / 340);
  c.translate((w - 530 * scale) / 2, (h - 340 * scale) / 2);
  c.scale(scale, scale);
  const ink = '#3a3c36', paper = '#f7f4e8', copper = '#a54b2c';
  const pitch = tilt * Math.PI / 180, lift = 57 + 7.5 * distance;
  function point(x, y, z) {
    return [272 + 0.98 * x - 0.74 * y, 218 + 0.36 * x + 0.48 * y - z];
  }
  function surface(height, angle, paint, depth = 0) {
    c.save();
    c.translate(...point(-Math.sin(angle) * depth, 0, height - Math.cos(angle) * depth));
    c.transform(0.98 * Math.cos(angle), 0.36 * Math.cos(angle) - Math.sin(angle), -0.74, 0.48, 0, 0);
    paint(); c.restore();
  }
  function line(x1,y1,x2,y2,color,width=1) {
    c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.strokeStyle=color; c.lineWidth=width; c.stroke();
  }
  function copperLoop(x,y,width,height,count=5) {
    for (let j=0; j<count; j++) {
      const inset=j*2.5;
      roundPath(c,x+inset,y+inset,width-2*inset,height-2*inset,Math.max(3,12-j));
      c.lineWidth=1.45; c.strokeStyle=copper; c.stroke();
    }
  }
  function caption(name,x,y,anchor,side) {
    c.font='15px "DM Sans", sans-serif'; c.textAlign=side==='left'?'left':'right';
    c.fillStyle='#eeeeee'; c.fillText(name,x,y);
    const endX=side==='left'?x+c.measureText(name).width+6:x-c.measureText(name).width-6;
    c.beginPath(); c.moveTo(endX,y-4); c.lineTo((endX+anchor[0])/2,y-4); c.lineTo(...anchor);
    c.strokeStyle='#969696'; c.lineWidth=0.85; c.stroke();
    disk(c,...anchor,2.2,copper);
  }
  // Draw the terminal casing in stacked sections, then its keypad and etched reader loop.
  for (let z=-16;z<=0;z+=2) surface(z,0,()=>{
    plate(c,-69,-97,138,205,14,z===0?'#dbd9c7':'#b2b2a3',ink);
  });
  surface(0,0,()=>{
    plate(c,-61,-89,122,131,10,'#e5e4d6',ink);
    copperLoop(-45,-75,90,102);
    for(let row=0;row<3;row++) for(let col=0;col<4;col++) {
      const x=-51+col*26, y=50+row*14;
      plate(c,x,y,20,9,2,col===3&&row===2?'#a3b7a0':'#c5c6b7','#74776b');
      line(x+6,y+4,x+13,y+4,'#858777',1);
    }
    for(let j=0;j<9;j++)line(49,-62+j*6,55,-68+j*6,'#a9ac9c',0.8);
  });
  // Field lines are illustrative. Their shape is not a simulation of individual flux paths.
  for(let j=0;j<4;j++) {
    const spread=39+j*13, bottom=point(0,-25,2);
    c.beginPath(); c.ellipse(bottom[0],bottom[1]-37,spread,44+j*4,0.28,0,Math.PI*2);
    c.strokeStyle='rgba(156,103,69,'+(0.48-j*.06)+')'; c.setLineDash([3,4]); c.lineWidth=1; c.stroke();
  }
  c.setLineDash([]);
  for(let depth=5;depth>0;depth--)surface(lift,pitch,()=>plate(c,-49,-108,98,176,14,'#9a9e91',ink),depth);
  surface(lift,pitch,()=>{
    plate(c,-49,-108,98,176,14,paper,ink);
    plate(c,-45,-104,90,168,11,'#e5e4d6','#828578');
    c.save();roundPath(c,-42,-101,84,162,11);c.clip();
    for(let n=-190;n<160;n+=5)line(-58,n,58,n+75,'#cbcdbe',.6);
    c.restore();
    plate(c,-36,-93,36,24,5,'#bdc4b7',ink);
    for(const x of [-26,-10]){disk(c,x,-81,6,'#5c6965',ink);disk(c,x,-81,3.8,'#a9b6ac',ink)}
    plate(c,-35,-59,70,105,9,'#dbd5bb','#9e9e87');
    c.save();
    c.shadowColor = 'rgba(222,120,48,' + Math.min(1, peak / 1.5) + ')';
    c.shadowBlur = 6 * peak;
    copperLoop(-31,-55,62,95,turns);
    c.restore();
    plate(c,-7,39,13,14,2,'#caa173',copper);
    for(let j=0;j<4;j++)line(-5+j*3,49,-5+j*3,52,copper);
  });
  const antenna=point(Math.cos(pitch)*21,12,lift+Math.sin(pitch)*21);
  caption('Phone antenna',25,45,antenna,'left');
  caption('Reader coil',509,219,point(42,-40,0),'right');
  caption('Payment terminal',26,308,point(-53,82,-9),'left');
}
