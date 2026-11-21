(() => {
  function controls(ids, draw) {
    for (const id of ids) $(id).addEventListener('input',draw);
  }
  function plot(id) {
    const {c,w,h}=fitCanvas($(id));
    c.font='12px "DM Sans", sans-serif';
    c.lineWidth=1;
    return {c,w,h,left:32,right:w-18,top:13,bottom:h-24};
  }
  function line(c,x1,y1,x2,y2,color,width=1) {
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();
  }
  function axis(c,left,right,bottom,max,unit) {
    line(c,left,bottom,right,bottom,'#555');
    for (let i=0;i<=4;i++) {
      const x=left+(right-left)*i/4;
      line(c,x,bottom,x,bottom+4,'#777');
      c.fillStyle='#b9b9b9';c.textAlign=i===4?'right':'center';
      c.fillText(String(i*max/4)+(i===4?' '+unit:''),x,bottom+17);
    }
  }
  function camera() {
    const ms=+$('exposure').value, speed=+$('imageSpeed').value;
    const travel=speed*ms/1000;
    $('exposureOut').value=ms+' ms';$('speedOut').value=speed+' px/s';
    $('exposure').setAttribute('aria-valuetext',ms+' milliseconds');
    $('imageSpeed').setAttribute('aria-valuetext',speed+' pixels per second');
    $('trailOut').textContent=Number(travel.toFixed(2))+' px';
    $('cameraReason').textContent=speed===0
      ? 'The image stays on the same pixels. A longer exposure collects more light from a steady source while it stays still.'
      : 'At '+speed+' pixels per second, the image travels '+Number(travel.toFixed(2))+' pixels in '+ms+' milliseconds. This is the motion blur from a steady light moving at constant speed.';
    const {c,left,right,top,bottom}=plot('exposurePlot');
    axis(c,left,right,bottom,40,'px');
    const y=(top+bottom)/2, end=left+(right-left)*travel/40;
    for(let i=0;i<=40;i++){
      const x=left+(right-left)*i/40;line(c,x,top,x,bottom,i%10===0?'#383838':'#202020');
    }
    c.save();c.lineCap='round';c.shadowBlur=10;c.shadowColor='#efb18b';
    line(c,left,y,end,y,'#efb18b',5);
    c.fillStyle='#efb18b';c.beginPath();c.arc(left,y,2.5,0,2*Math.PI);c.fill();c.restore();
  }
  function battery() {
    const wh=+$('batteryEnergy').value, watts=+$('powerDraw').value, hours=wh/watts;
    $('energyOut').value=wh+' Wh';$('powerOut').value=watts+' W';
    $('batteryEnergy').setAttribute('aria-valuetext',wh+' watt-hours');
    $('powerDraw').setAttribute('aria-valuetext',watts+' watts');
    $('runtimeOut').textContent=Number(hours.toFixed(2))+' h';
    $('energyReason').textContent='At '+watts+' W the phone uses '+watts+' Wh each hour. Dividing '+wh+' Wh by '+watts+' W gives '+Number(hours.toFixed(2))+' hours. This estimate assumes a steady load and usable energy after losses.';
    const {c,left,right,top,bottom}=plot('energyPlot');
    axis(c,left,right,bottom,20,'h');
    c.textAlign='right';c.fillStyle='#b9b9b9';
    for(const value of [0,10,20]){
      const y=bottom-(bottom-top)*value/20;
      c.fillText(String(value),left-6,y+4);line(c,left,y,right,y,'#393939');
    }
    const x=left+(right-left)*hours/20, y=bottom-(bottom-top)*wh/20;
    c.beginPath();c.moveTo(left,y);c.lineTo(x,bottom);c.lineTo(left,bottom);c.closePath();c.fillStyle='#30241f';c.fill();
    line(c,left,y,x,bottom,'#efb18b',2.5);
  }
  controls(['exposure','imageSpeed'],camera);controls(['batteryEnergy','powerDraw'],battery);
  for(const [id,draw] of [['exposurePlot',camera],['energyPlot',battery]]){
    new ResizeObserver(draw).observe($(id));draw();document.fonts.ready.then(draw);
  }
})();
