const $=id=>document.getElementById(id);
const paths={
  brand:'<path d="m12 2 10 5-10 5L2 7z" fill="currentColor" stroke="none"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5" stroke-width="2.8"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  wave:'<path d="M2 12h4l3-8 5 16 3-8h5"/>',card:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 10h18M6 15h4"/>',
  book:'<path d="M3 4.8Q7 3 12 6q5-3 9-1.2v14Q16 17 12 20q-5-3-9-1.2zM12 6v14"/>',
  cube:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/>',
  reset:'<path d="M4 9a8 8 0 1 1-.5 5M4 3v6h6"/>',
  rotate:'<path d="M7 7c-3 1-5 3-5 5 0 3 4.5 6 10 6s10-3 10-6c0-2-2-4-5-5M7 14l5 4-5 3"/>',
  sliders:'<path d="M4 7h5m4 0h7M4 17h9m4 0h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  route:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  bank:'<path d="m2 8 10-6 10 6H2zm2 12h16M6 10v7m6-7v7m6-7v7"/>',
  network:'<circle cx="12" cy="5" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="m11 8-4.5 7.5M13 8l4.5 7.5M8 18h8"/>'
};
function icon(name){return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">'+paths[name]+'</svg>'}
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const parts=$('parts');
componentData.forEach((part,i)=>{
  const b=document.createElement('button');b.innerHTML='<span class="partMark"><canvas width="90" height="81" aria-hidden="true"></canvas></span><span>'+part.name+'</span><span class="radio"></span>';parts.append(b);b.onclick=()=>pick(i);
  const c=b.querySelector('canvas').getContext('2d');c.translate(44,40);c.transform(.21,-.14,.21,.14,0,0);paintLayer(c,i);
});
const selectModel=initModel(pick);
function pick(i){[...parts.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));$('partDetail').innerHTML='<h3>'+componentData[i].title+'</h3><p>'+componentData[i].text+'</p>';selectModel(i)}
pick(1);
$('notesOpen').onclick=()=>$('notesDialog').showModal();
$('notesDialog').addEventListener('click',e=>{if(e.target!==$('notesDialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()});
function drawTraces(message, current, reference) {
  const { c, w, h } = fitCanvas($('scope'));
  if (!w || !h) return;
  const left = 43, right = w - 19, row = h / 2;
  const traces = [
    { signal: reference, label: 'Reference · 5 turns, flat, 1 cm', color: '#a8c9bc' },
    { signal: current, label: 'Your tap', color: '#ffb67e' }
  ];
  c.font = '13px "DM Sans", sans-serif';
  traces.forEach(({ signal, label, color }, index) => {
    const top = index * row + 29;
    const bottom = (index + 1) * row - 23;
    const axis = (top + bottom) / 2, unit = (bottom - top) / 7.2;
    c.textAlign = 'left'; c.fillStyle = color; c.fillText(label, left, top - 10);
    for (const volts of [-2, 0, 2]) {
      const y = axis - volts * unit;
      c.strokeStyle = '#515851'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(left, y); c.lineTo(right, y); c.stroke();
      c.fillStyle = '#c3c9bc'; c.textAlign = 'right'; c.fillText(volts + ' V', left - 7, y + 4);
    }
    for (let j = 0; j < message.length; j++) {
      const x = left + (right - left) * j / message.length;
      c.strokeStyle = '#454d46'; c.beginPath(); c.moveTo(x, top); c.lineTo(x, bottom); c.stroke();
      c.fillStyle = '#d9ddcf'; c.textAlign = 'center';
      c.fillText(message[j], x + (right - left) / (2 * message.length), bottom + 16);
    }
    c.beginPath();
    for (let k = 0; k <= 800; k++) {
      const time = message.length * k / 800;
      const slot = Math.min(message.length - 1, Math.floor(time)), phase = time - slot;
      const voltage = signal.envelope(slot + 2, phase) * Math.sin(phase * Math.PI * 12);
      const x = left + (right - left) * k / 800, y = axis - voltage * unit;
      if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.lineWidth = 1.6; c.strokeStyle = color; c.stroke();
  });
}

let tiltTarget = null;
let tapTween;
let tapTouched = false;
const liveSignalRegions = [$('poseLabel').parentElement, $('tiltLesson'), $('linkState').parentElement];
function setTapBusy(busy) {
  for (const region of liveSignalRegions) region.setAttribute('aria-busy', String(busy));
}

function drawSignal() {
  const distance = Number($('gap').value), tilt = Number($('angle').value);
  const interference = Number($('noise').value), message = $('packet').value;
  const turns = Number($('turns').value);
  const signal = transmitSignal(distance, tilt, interference, message, turns);
  $('turnsOut').value = turns;
  const referencePeak=transmitSignal(distance,tilt,0,message).peak;
  if(tilt===90){
    $('turnsReason').textContent='The coil is edge-on to the field. Lay it flat to see how adding turns increases the voltage.';
  }else if(turns===5){
    $('turnsReason').textContent='The five-turn coil gives '+signal.peak.toFixed(2)+' V. Try four turns, then eight. Each turn adds its voltage to the next.';
  }else{
    $('turnsReason').textContent='At the same gap and tilt, '+turns+' turns give '+signal.peak.toFixed(2)+' V. The five-turn reference gives '+referencePeak.toFixed(2)+' V.';
  }

  const result = decodeCapture(signal.capture);
  const voltage = signal.peak.toFixed(2) + ' V';
  $('gapOut').value = distance.toFixed(1) + ' cm';
  $('angleOut').value = tilt + '°'; $('noiseOut').value = interference + '%';
  $('voltage').textContent = voltage; $('sent').textContent = message; $('bits').textContent = result.decoded;
  $('figurePeak').textContent = voltage + ' induced';
  $('localSignal').textContent='Received '+result.decoded+' · '+voltage+' peak';
  $('poseLabel').textContent = distance.toFixed(1) + ' cm apart · ' + tilt + '° tilt';
  $('tiltLesson').textContent = tilt === 90
    ? 'Edge-on, the field runs along the loop’s plane. Almost no flux passes through its opening.'
    : 'What happens if you turn that loop edge-on?';
  $('flipPhone').textContent = (tiltTarget ?? tilt) === 90 ? 'Lay the phone flat' : 'Turn the phone edge-on';
  $('gap').setAttribute('aria-valuetext', $('gapOut').value);
  $('angle').setAttribute('aria-valuetext', tilt + ' degrees');
  $('noise').setAttribute('aria-valuetext', interference + ' percent');
  if (!result.calibrated) {
    $('linkState').textContent = 'Reference levels lost';
    $('linkReason').textContent = 'The high and low references are too close to distinguish. Move the phone closer or turn its loop toward the reader.';
  } else if (result.decoded.includes('?')) {
    $('linkState').textContent = 'An uncertain bit';
    $('linkReason').textContent = 'A sample landed too close to the threshold. Inspect the readings below to find the uncertain bit.';
  } else if (result.decoded !== message) {
    $('linkState').textContent = 'A bit changed in transit';
    $('linkReason').textContent = 'Interference moved a sample to the other side of the threshold. Lower the interference and compare.';
  } else {
    $('linkState').textContent = 'All four bits recovered';
    $('linkReason').textContent = 'The receiver could tell the two levels apart. Increase the gap or tilt the phone to see when that changes.';
  }
  $('calibration').textContent = 'High ' + signal.capture[0].toFixed(3) + ' V · Low ' +
    signal.capture[1].toFixed(3) + ' V · ' + (result.calibrated ? 'Threshold ' + result.threshold.toFixed(3) + ' V' : 'Calibration failed');
  $('sampleRows').innerHTML = result.samples.map((sample, i) =>
    '<tr><th scope="row">' + (i + 1) + '</th><td>' + message[i] + '</td><td>' +
    sample.toFixed(3) + ' V</td><td>' + result.decoded[i] + '</td></tr>').join('');
  if (window.labScenes) window.labScenes.signal(distance, tilt, signal.peak, turns);
  else drawTapFigure(distance, tilt, signal.peak, turns);
  drawTraces(message, signal, transmitSignal(1, 0, 0, message));
}
function stopTap() {
  tapTween?.kill();
  tapTween = null;
  tiltTarget = null;
  setTapBusy(false);
}
function movePhone(distance, angle, duration) {
  stopTap();
  tiltTarget = angle;
  const pose = { distance: Number($('gap').value), angle: Number($('angle').value) };
  function paintPose() {
    const gap = pose.distance.toFixed(1), tilt = String(Math.round(pose.angle));
    if (Number($('gap').value) === Number(gap) && $('angle').value === tilt) return;
    $('gap').value = gap;
    $('angle').value = tilt;
    drawSignal();
  }
  function finish() {
    $('gap').value = distance;
    $('angle').value = angle;
    stopTap();
    drawSignal();
  }
  if (reducedMotion.matches) { finish(); return; }
  setTapBusy(true);
  drawSignal();
  tapTween = gsap.to(pose, {
    distance, angle, duration, ease: 'power2.inOut', onUpdate: paintPose, onComplete: finish
  });
}
$('flipPhone').onclick = () => {
  tapTouched = true;
  const target = (tiltTarget ?? Number($('angle').value)) === 90 ? 0 : 90;
  movePhone(Number($('gap').value), target, .95);
};
function approachReader() {
  tapTouched = true;
  stopTap();
  $('gap').value = 8;
  $('angle').value = 0;
  movePhone(1, 0, 1.65);
}
$('approach').onclick = approachReader;
function takeSignalControl() {
  tapTouched = true;
  if (tapTween) { stopTap(); drawSignal(); }
}
const signalControls = ['gap','angle','turns','noise','packet'];
$('resetSignal').onclick=()=>{
  takeSignalControl();
  for(const id of signalControls){
    const input=$(id);
    if(input.tagName==='SELECT')input.value=input.querySelector('option[selected]').value;
    else input.value=input.defaultValue;
  }
  drawSignal();
};
for (const id of signalControls) {
  const input = $(id);
  input.addEventListener('pointerdown', takeSignalControl);
  input.addEventListener('keydown', takeSignalControl);
  input.addEventListener('input', () => { takeSignalControl(); drawSignal(); });
}
function settleTap() { if (tapTween) tapTween.progress(1); }
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) settleTap(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) settleTap(); });
// Play the short approach once when the opening illustration is actually on screen.
const openingView = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  openingView.disconnect();
  if (!tapTouched && !location.hash && !document.hidden && !reducedMotion.matches) approachReader();
}, { threshold: .6 });
openingView.observe($('tapFigure'));
const figures = new ResizeObserver(drawSignal);
figures.observe($('scope')); figures.observe($('tapFigure'));
document.fonts.ready.then(drawSignal);
const journey=[
  ['Your phone','Authorize the tap','Start a fictional HK$50 purchase. Your confirmation stands in for the device authentication used for an ordinary in-store payment.','Authorize purchase',0],
  ['Secure element','Prepare a credential','The simulated secure element signs the amount, device token and a fresh counter. Inspect the receipt to see the first bytes of the transaction code.','Tap the reader',0],
  ['Merchant reader','Cross the air gap','The reader receives the device token and signed payment message over NFC. That short wireless hop ends here.','Forward request',1],
  ['Payment network','Route the request','The merchant’s processor sends the authorization request through the payment network to the card issuer.','Verify at issuer',2],
  ['Issuing bank','Verify the message','The simulated issuer checks the signature and whether the transaction counter was already used.','Return approval',3],
  ['Merchant reader','The result comes back','The issuer’s approval returns through the network to the merchant. Replay the same signed message to see what the issuer does with a used counter.','Start a new purchase',1]
];
let step=0,counter=0,credential=null,signingKey=null;const used=new Set();
async function issue(){
  const subtle=globalThis.crypto?.subtle;if(!subtle)throw Error('Open the hosted site or localhost to use the payment lab.');
  signingKey??=await subtle.generateKey({name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
  const sequence=++counter;const bytes=new TextEncoder().encode(JSON.stringify(['DEMO-0472','HKD',5000,sequence]));const signature=await subtle.sign('HMAC',signingKey,bytes);
  return {sequence,bytes,signature,short:[...new Uint8Array(signature).slice(0,4)].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase()}
}
async function verify(p){if(!await crypto.subtle.verify('HMAC',signingKey,p.signature,p.bytes))return 'Invalid signature';if(used.has(p.sequence))return 'Counter already used';used.add(p.sequence);return 'Approved'}
const routeStops = [['phone','Phone'],['card','Reader'],['network','Network'],['bank','Issuer']];
$('route').innerHTML = routeStops.map(([ico,name]) =>
  '<button type="button" aria-label="Inspect '+name+'"><i data-icon="'+ico+'">'+icon(ico)+'</i>'+name+'</button>').join('') +
  '<div class="routeTrack" aria-hidden="true"><div class="packetRunner"><b></b></div></div>';
const routeDetails = [
  'Phone · The secure element prepares the credential and a fresh transaction code.',
  'Reader · This endpoint receives the credential over NFC and forwards the request.',
  'Network · The payment network routes the authorization request to the issuer.',
  'Issuer · The issuing bank verifies the message and returns its decision.'
];
const routeButtons = [...$('route').querySelectorAll('button')];
routeButtons.forEach((button, index) => button.onclick = () => {
  $('routeInfo').textContent = routeDetails[index];
});
const runner = $('route').querySelector('.packetRunner');
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    gsap.killTweensOf(runner);
    gsap.set(runner, { xPercent: journey[step][4] * 100 });
    window.labScenes?.payment(journey[step][4], journey[step][4]);
  }
});
function drawPayment(){
  const [place,title,desc,action,current]=journey[step];$('payCount').textContent=(step+1)+' of '+journey.length+' · '+place;$('payTitle').textContent=title;$('payText').textContent=desc;$('payNext').textContent=action;$('replay').hidden=step!==5;
  const data=[['Device token',credential?'DEMO-0472':'Pending'],['Counter',credential?String(credential.sequence).padStart(4,'0'):'—'],['Code prefix',credential?credential.short:'—'],['Status',['Ready to tap','Signed','Read via NFC','Routed','Verified','Approved'][step]]];
  $('receipt').innerHTML=data.map(([a,b])=>'<div><dt>'+a+'</dt><dd>'+b+'</dd></div>').join('');
  routeButtons.forEach((node,i)=>{
    node.classList.toggle('current',i===current);
    if(i===current)node.setAttribute('aria-current','step');
    else node.removeAttribute('aria-current');
  });
  gsap.to(runner, {
    xPercent: current * 100, duration: reducedMotion.matches || step === 0 ? 0 : .68,
    ease: 'power2.inOut', overwrite: true,
    onUpdate: () => window.labScenes?.payment(gsap.getProperty(runner, 'xPercent') / 100, current)
  });
}
$('payNext').onclick=async()=>{const b=$('payNext');b.disabled=true;$('payStatus').textContent='';try{
  if(step===0)credential=await issue();
  if(step===3){const verdict=await verify(credential);if(verdict!=='Approved')throw Error(verdict)}
  if(step===5){step=0;credential=null}else step++;
  drawPayment()
}catch(e){$('payStatus').textContent=e.message}finally{b.disabled=false}};
$('replay').onclick=async()=>{
  const original=credential;
  let message;
  try{
    const verdict=await verify(original);
    message=verdict==='Counter already used'?'Replay declined. The signature is valid, but the issuer has already accepted this counter.':verdict;
  }catch{message='Verification could not finish. Try again.'}
  if(step===5 && credential===original)$('payStatus').textContent=message;
};
drawPayment();drawSignal();
let contactReceived=false;
function drawSharing(){
  const d=+$('shareDistance').value,power=-50-24*Math.log10(d),visible=$('bt').checked&&power>=-78;
  $('shareDistanceOut').value=d+' m';$('shareDistance').setAttribute('aria-valuetext',d+' metres');
  const state=contactReceived?'Contact received':!visible?'Searching for phones':!$('wifi').checked?'Sender discovered':'Contact offered';
  const info=contactReceived?'Mira Chan · Science Club. The contact arrived over the simulated peer-to-peer Wi-Fi link.':!$('bt').checked?'Turn on Bluetooth to hear the sender’s discovery packets.':!visible?'Estimated Bluetooth signal '+power.toFixed(0)+' dBm. Move closer to cross the model’s −78 dBm discovery threshold.':!$('wifi').checked?'Bluetooth can hear the sender at '+power.toFixed(0)+' dBm. Enable Wi-Fi to carry the contact.':'Bluetooth found the sender at '+power.toFixed(0)+' dBm. The receiver can now choose whether to accept Mira’s contact.';
  window.labScenes?.sharing(d, visible, $('wifi').checked, contactReceived);
  $('nearState').textContent=state;$('nearInfo').textContent=info;$('shareContact').disabled=!visible||!$('wifi').checked;$('shareContact').textContent=contactReceived?'Try again':'Accept contact';
}
['shareDistance','bt','wifi'].forEach(id=>$(id).addEventListener('input',()=>{contactReceived=false;drawSharing()}));
$('shareContact').onclick=()=>{contactReceived=!contactReceived;drawSharing()};drawSharing();
