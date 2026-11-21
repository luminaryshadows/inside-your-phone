const assert = require('node:assert/strict');
const { transmitSignal } = require('./dist/physics.js');
const { decodeCapture } = require('./dist/receiver.js');

for (let n = 0; n < 16; n++) {
  const bits = n.toString(2).padStart(4, '0');
  for (const tilt of [0, 30, 60]) {
    const { capture } = transmitSignal(1, tilt, 15, bits);
    assert.equal(decodeCapture(capture).decoded, bits);
  }
  for (const [distance, tilt] of [[1, 90], [10, 0]]) {
    assert.equal(decodeCapture(transmitSignal(distance, tilt, 0, bits).capture).decoded, '????');
  }
}
// An independently constructed capture can drive the receiver on its own.
assert.equal(decodeCapture([1, 0.5, 0.51, 0.76, 0.98, 0.72]).decoded, '0?10');
assert.equal(decodeCapture([0.01, 0.01, 1, 0]).decoded, '??');
assert.equal(transmitSignal(0, 0, 0, '1010').peak, 2);
assert.ok(Math.abs(transmitSignal(0, 60, 0, '1010').peak - 1) < 1e-9);
console.log('Passed independent decoding, 16 payloads, calibration, tilt and distance checks.');
const { springStep } = require('./dist/motion.js');
// Subdividing a frame must preserve both the position and the release velocity.
const halfStep = springStep(2, -3, 1, 1/120);
const split = springStep(...halfStep, 1, 1/120);
const full = springStep(2, -3, 1, 1/60);
assert.ok(split.every((n,i)=>Math.abs(n-full[i])<1e-10));
assert.ok(Math.abs(springStep(2,-3,1,1)[0]-1)<.001);
for (const tilt of [0,45,90]) {
  const fourTurns=transmitSignal(1,tilt,0,'1101',4);
  const eightTurns=transmitSignal(1,tilt,0,'1101',8);
  assert.equal(eightTurns.peak,2*fourTurns.peak);
  assert.deepEqual(eightTurns.capture,fourTurns.capture.map(v=>2*v));
}
