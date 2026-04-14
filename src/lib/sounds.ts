// ── Shared audio context ──
let audioCtx: AudioContext | null = null;

export function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// ── Guess sound: Balatro Chip Counter ──
// Rapid staccato ticks that accumulate. Low rank = 1 quiet tick.
// High rank = fast ticks building into a payoff chord with sparkle.
export function playGuessSound(rank: number, total: number) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  // 0 = #1 (single quiet tick), 1 = #total (full chip cascade + payoff)
  const intensity = (rank - 1) / Math.max(total - 1, 1);

  const master = ctx.createGain();
  master.gain.value = 0.4;
  master.connect(ctx.destination);

  // Number of ticks scales with intensity: 1 tick for low, up to 8 for high
  const numTicks = Math.max(1, Math.round(1 + intensity * 7));
  const tickSpeed = 0.04 + (1 - intensity) * 0.04; // faster at high intensity

  for (let i = 0; i < numTicks; i++) {
    const tickTime = t + i * tickSpeed;
    const progress = i / Math.max(numTicks - 1, 1);

    // Each tick is a short bright ping, ascending in pitch
    const baseFreq = 800 + progress * 400 + intensity * 300;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = baseFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15 + intensity * 0.1, tickTime);
    g.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.05);
    osc.connect(g).connect(master);
    osc.start(tickTime);
    osc.stop(tickTime + 0.06);

    // Click transient on each tick
    const clickLen = 0.008;
    const clickBuf = ctx.createBuffer(
      1,
      ctx.sampleRate * clickLen,
      ctx.sampleRate,
    );
    const clickData = clickBuf.getChannelData(0);
    for (let j = 0; j < clickData.length; j++) {
      clickData[j] =
        (Math.random() * 2 - 1) *
        Math.pow(1 - j / clickData.length, 4);
    }
    const click = ctx.createBufferSource();
    click.buffer = clickBuf;
    const clickGain = ctx.createGain();
    clickGain.gain.value = 0.15;
    const clickHP = ctx.createBiquadFilter();
    clickHP.type = "highpass";
    clickHP.frequency.value = 2000;
    click.connect(clickHP).connect(clickGain).connect(master);
    click.start(tickTime);
  }

  // Payoff chord at the end (scales with intensity)
  if (intensity > 0.2) {
    const payoffTime = t + numTicks * tickSpeed + 0.02;
    const payoffMix = (intensity - 0.2) / 0.8;
    const chord = [523, 659, 784]; // C5 E5 G5 major
    if (intensity > 0.6) chord.push(1047); // C6 octave

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const decay = 0.15 + payoffMix * 0.5;
      g.gain.setValueAtTime(0.1 * payoffMix, payoffTime);
      g.gain.exponentialRampToValueAtTime(0.001, payoffTime + decay);
      osc.connect(g).connect(master);
      osc.start(payoffTime);
      osc.stop(payoffTime + decay + 0.02);
    });

    // Sparkle on big payoff
    if (intensity > 0.5) {
      const sparkleLen = 0.05;
      const sparkleBuf = ctx.createBuffer(
        1,
        ctx.sampleRate * sparkleLen,
        ctx.sampleRate,
      );
      const sparkleData = sparkleBuf.getChannelData(0);
      for (let j = 0; j < sparkleData.length; j++) {
        sparkleData[j] =
          (Math.random() * 2 - 1) *
          Math.pow(1 - j / sparkleData.length, 2);
      }
      const sparkle = ctx.createBufferSource();
      sparkle.buffer = sparkleBuf;
      const sparkleHP = ctx.createBiquadFilter();
      sparkleHP.type = "highpass";
      sparkleHP.frequency.value = 5000;
      const sparkleGain = ctx.createGain();
      sparkleGain.gain.value = 0.06 * payoffMix;
      sparkle.connect(sparkleHP).connect(sparkleGain).connect(master);
      sparkle.start(payoffTime);
    }
  }
}

// ── Strike sound: Trombone Wah Wah ──
// Descending "wah wah wah wahhh" — four brassy notes stepping down,
// last one slides and fades. Classic failure sound.
export function playStrikeSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.3;
  master.connect(ctx.destination);

  // Four descending notes: Bb4 -> Ab4 -> G4 -> Gb4 (slides down on last)
  const notes = [
    { freq: 466, start: 0, dur: 0.25, slide: false, endFreq: 466 },
    { freq: 415, start: 0.28, dur: 0.25, slide: false, endFreq: 415 },
    { freq: 392, start: 0.56, dur: 0.25, slide: false, endFreq: 392 },
    { freq: 370, start: 0.84, dur: 0.6, slide: true, endFreq: 300 },
  ];

  notes.forEach((note) => {
    const noteStart = t + note.start;

    // Main tone — sawtooth filtered to sound brassy
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(note.freq, noteStart);
    if (note.slide) {
      osc.frequency.exponentialRampToValueAtTime(
        note.endFreq,
        noteStart + note.dur,
      );
    }

    // Wah filter — bandpass sweep gives the "wah" character
    const wah = ctx.createBiquadFilter();
    wah.type = "bandpass";
    wah.Q.value = 3;
    wah.frequency.setValueAtTime(note.freq * 3, noteStart);
    wah.frequency.exponentialRampToValueAtTime(
      note.freq * 0.8,
      noteStart + note.dur * 0.7,
    );

    // Lowpass to tame harshness
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1500;

    const g = ctx.createGain();
    const vol = note.slide ? 0.18 : 0.2;
    g.gain.setValueAtTime(vol, noteStart);
    if (note.slide) {
      // Last note fades out slowly
      g.gain.setValueAtTime(vol, noteStart + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, noteStart + note.dur);
    } else {
      g.gain.setValueAtTime(vol, noteStart + note.dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, noteStart + note.dur);
    }

    osc.connect(wah).connect(lp).connect(g).connect(master);
    osc.start(noteStart);
    osc.stop(noteStart + note.dur + 0.05);

    // Sub octave for body
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(note.freq / 2, noteStart);
    if (note.slide) {
      sub.frequency.exponentialRampToValueAtTime(
        note.endFreq / 2,
        noteStart + note.dur,
      );
    }
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.08, noteStart);
    subGain.gain.exponentialRampToValueAtTime(0.001, noteStart + note.dur);
    sub.connect(subGain).connect(master);
    sub.start(noteStart);
    sub.stop(noteStart + note.dur + 0.05);
  });
}
