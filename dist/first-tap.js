(() => {
  const angleInput = $('challengeAngle');
  const toggle = $('challengeToggle');
  const trace = $('challengeTrace');
  const poster = $('challengePoster');
  let tween, target, previousPose = 0;

  function present(angle) {
    const signal = transmitSignal(1, angle, 0, '1010', 5);
    const { decoded, calibrated } = decodeCapture(signal.capture);
    angleInput.value = angle;
    $('challengeInspect').href = '?chapter=signal&tap=' + angle + '#samples';
    angleInput.setAttribute('aria-valuetext', angle + ' degrees');
    $('challengeDegrees').textContent = angle + '°';
    $('challengePeak').textContent = signal.peak.toFixed(2) + ' V';
    $('challengeBits').textContent = decoded;
    const status = calibrated ? 'Decoded bits' : 'Signal lost';
    if ($('challengeStatus').textContent !== status) $('challengeStatus').textContent = status;
    $('challengeReason').textContent = !calibrated
      ? 'The two reference voltages are too close to tell apart. Turn the coil back toward the reader to recover the message.'
      : angle === 0 ? 'With the coils face to face, the phone can distinguish the high and low signal levels.'
      : angle === 60 ? 'At 60°, the coil intercepts half the magnetic flux it did face to face. The peak voltage halves too.'
      : 'Tilting the coil reduces the magnetic flux through its loop. The signal shrinks, but the four bits still come through.';
    toggle.lastElementChild.textContent = (target ?? angle) >= 85 ? 'Restore the signal' : 'Break the signal';
    let path = '';
    for (let slot = 0; slot < 4; slot++) {
      const y = (34 - signal.envelope(slot + 2, .52) * 20).toFixed(2);
      path += (slot === 0 ? 'M0 ' + y : 'V' + y) + 'H' + (slot + 1) * 45;
    }
    trace.setAttribute('d', path);
    if (window.labScenes) window.labScenes.challenge(angle);
    else {
      const pose = Math.round(angle / 10) * 10;
      if (pose !== previousPose) {
        previousPose = pose;
        poster.src = 'tap-' + pose + '.webp';
      }
    }
  }

  function stop() {
    tween?.kill();
    tween = null;
    target = null;
  }
  angleInput.addEventListener('input', () => { stop(); present(Number(angleInput.value)); });
  toggle.addEventListener('click', () => {
    const next = (target ?? Number(angleInput.value)) >= 85 ? 0 : 90;
    stop();
    if (reducedMotion.matches) { present(next); return; }
    target = next;
    const pose = { angle: Number(angleInput.value) };
    tween = gsap.to(pose, { angle: next, duration: .85, ease: springEase,
      onUpdate: () => present(Math.min(90, Math.max(0, Math.round(pose.angle)))),
      onComplete: () => { target = null; present(next); }
    });
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) tween?.progress(1); });
  $('challengeInspect').addEventListener('click', () => { stop(); present(Number(angleInput.value)); });
  present(Number(angleInput.value));
})();
