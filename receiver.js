// The first two slots carry known high and low reference levels. The remaining
// slots carry data. The receiver gets only voltage samples in capture order.
function decodeCapture(capture) {
  const [high, low, ...samples] = capture;
  const threshold = (high + low) / 2;
  const calibrated = high - low >= 0.055;
  const decoded = samples.map(sample => {
    if (!calibrated || Math.abs(sample - threshold) < 0.015) return '?';
    return sample > threshold ? '1' : '0';
  }).join('');
  return { decoded, samples, threshold, calibrated };
}
if (typeof module !== 'undefined') module.exports = { decodeCapture };
