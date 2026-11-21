// On-axis field of a circular transmitter, projected onto a small receiving coil.
function transmitSignal(distance, tilt, interference, message, turns = 5) {
  const peak = 2 * (turns / 5) * Math.cos(tilt * Math.PI / 180) / (1 + (distance / 2) ** 2) ** 1.5;
  const noise = interference / 100 * 0.25;
  const symbols = '10' + message;
  function envelope(slot, time) {
    const level = symbols[slot] === '1' ? 1 : 0.55;
    const disturbance = 0.68 * Math.sin(9 * time + slot * 3) + 0.32 * Math.cos(17 * time + slot);
    return Math.max(0, peak * level + noise * disturbance);
  }
  const capture = Array.from(symbols, (_, slot) => envelope(slot, 0.52));
  return { peak, envelope, capture };
}
if (typeof module !== 'undefined') module.exports = { transmitSignal };
