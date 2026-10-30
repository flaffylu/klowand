/* Klo-Wand: gemütliche Lo-Fi-Musik, live im Browser erzeugt (keine Audiodateien, keine Rechte Dritter).
   Startet nur nach einem Tipp, weil Browser Ton erst nach einer Berührung erlauben. */
const KloMusik = (() => {
  let ctx = null, master = null, noiseBuf = null, crackleGain = null, timer = null, on = false;
  let step = 0, nextT = 0, chordIdx = 0;
  const BPM = 74, EIGHTH = 60 / BPM / 2;
  // Fmaj7 – Em7 – Dm7 – Cmaj7, darunter weiche Septakkorde
  const CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 2200; warm.Q.value = 0.4;
    master.connect(warm).connect(ctx.destination);
    // Rauschen für Hi-Hat, Snare und Plattenknistern
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const crackle = ctx.createBufferSource(); crackle.buffer = makeCrackle(); crackle.loop = true;
    crackleGain = ctx.createGain(); crackleGain.gain.value = 0;
    crackle.connect(crackleGain).connect(master); crackle.start();
  }
  function makeCrackle() {
    const b = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.004;
    return b;
  }
  function env(g, t, peak, a, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function tone(t, freq, type, peak, a, dur, detune = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    env(g, t, peak, a, dur); o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, filterType, freq, peak, dur) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = filterType; f.frequency.value = freq;
    env(g, t, peak, 0.002, dur); s.connect(f).connect(g).connect(master);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    env(g, t, 0.42, 0.004, 0.32); o.connect(g).connect(master); o.start(t); o.stop(t + 0.4);
  }
  function schedule() {
    while (nextT < ctx.currentTime + 0.25) {
      const s = step % 8, chord = CHORDS[chordIdx];
      if (s === 0) {
        chord.forEach((n, i) => tone(nextT + i * 0.012, mtof(n), "triangle", 0.035, 0.35, EIGHTH * 8.4, (Math.random() - 0.5) * 10));
        tone(nextT, mtof(chord[0] - 12), "sine", 0.16, 0.03, EIGHTH * 3.5);
      }
      if (s === 3) tone(nextT, mtof(chord[0] - 12), "sine", 0.1, 0.03, EIGHTH * 1.5);
      if (s === 4) tone(nextT, mtof(chord[2] - 12), "sine", 0.13, 0.03, EIGHTH * 3);
      if (s === 0 || s === 5) kick(nextT);
      if (s === 2 || s === 6) noise(nextT, "bandpass", 1800, 0.07, 0.16);
      noise(nextT, "highpass", 7500, s % 2 ? 0.012 : 0.022, 0.05);
      if (Math.random() < 0.3) {
        const n = chord[Math.floor(Math.random() * chord.length)] + 12;
        tone(nextT, mtof(n), "sine", 0.03, 0.01, 1.2);
      }
      nextT += EIGHTH * (s % 2 ? 0.84 : 1.16);  // leichter Swing
      step++;
      if (step % 8 === 0) chordIdx = (chordIdx + 1) % CHORDS.length;
    }
  }
  async function start() {
    if (!ctx) init();
    await ctx.resume();
    if (on) return;
    on = true; nextT = ctx.currentTime + 0.1;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 2.5);
    crackleGain.gain.setValueAtTime(0.05, ctx.currentTime);
    timer = setInterval(schedule, 60); schedule();
  }
  function stop() {
    if (!ctx || !on) return;
    on = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    crackleGain.gain.setValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => { if (!on) { clearInterval(timer); ctx.suspend(); } }, 900);
  }
  // Effekt-Töne für die Spiele, laufen auch ohne Musik
  async function blip(kind) {
    try {
      if (!ctx) init();
      if (ctx.state !== "running") await ctx.resume();
      const t = ctx.currentTime;
      if (!on) master.gain.setValueAtTime(0.7, t);
      if (kind === "good") { tone(t, 880, "triangle", 0.12, 0.005, 0.12); tone(t + 0.07, 1320, "triangle", 0.1, 0.005, 0.15); }
      else if (kind === "gold") [880, 1108, 1320, 1760].forEach((f, i) => tone(t + i * 0.06, f, "triangle", 0.1, 0.005, 0.18));
      else if (kind === "bad") { tone(t, 180, "sawtooth", 0.08, 0.005, 0.25); }
      else if (kind === "flush") noise(t, "lowpass", 900, 0.25, 1.1);
    } catch (e) {}
  }
  return { start, stop, toggle: () => (on ? stop() : start()), isOn: () => on, blip };
})();
